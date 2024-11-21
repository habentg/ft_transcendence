#!/bin/sh

# Run migrations
echo "RUNNING MIGRATIONS"
# python manage.py flush --no-input # this mf will delete all data from the database (everything!)
python manage.py makemigrations
python manage.py migrate

# collecting all the static files from the apps and copying them to the STATIC_ROOT directory - (centralized location for nginx to 'em) 
# python manage.py collectstatic --no-input
# updating requirements.txt
echo "UPDATING REQUIREMENTS.TXT"
pip freeze > requirements.txt

# Create superuser
echo "CREATING SUPER-USER"
python manage.py createsuperuser --noinput \
    --username="$DJANGO_SUPERUSER_USERNAME" \
    --email="$DJANGO_SUPERUSER_EMAIL"

# Set password coz there is no --password option
python manage.py shell <<EOF
from account.models import Player
from friendship.models import FriendList

player = Player.objects.get(username='$DJANGO_SUPERUSER_USERNAME')
player.full_name = '$DJANGO_SUPERUSER_FULLNAME'
player.set_password('$DJANGO_SUPERUSER_PASSWORD')
FriendList.objects.create(player=player)
player.save()
EOF

# Run server
echo "RUNNING SERVER"
# this will start the Django development server (built-in WSGI server)
# This WSGI server is responsible for receiving requests from Nginx and passing them to the Django application.
python manage.py runserver 0.0.0.0:8000 --verbosity 2
