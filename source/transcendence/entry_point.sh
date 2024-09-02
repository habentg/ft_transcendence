#!/bin/sh

# Run migrations
echo "RUNNING MIGRATIONS"
python manage.py makemigrations
python manage.py migrate
# updating requirements.txt
echo "UPDATING REQUIREMENTS.TXT"
pip freeze > requirements.txt

# Create superuser
echo "CREATING SUPER-USER"
python manage.py createsuperuser --noinput \
    --first_name="$DJANGO_SUPERUSER_FIRSTNAME" \
    --last_name="$DJANGO_SUPERUSER_LASTNAME" \
    --username="$DJANGO_SUPERUSER_USERNAME" \
    --username="$DJANGO_SUPERUSER_USERNAME" \
    --email="$DJANGO_SUPERUSER_EMAIL" \
    --password="$DJANGO_SUPERUSER_PASSWORD" \
# gonna say 'CommandError: Error: That username is already taken.' if it already exists!

# Run server
echo "RUNNING SERVER"
python manage.py runserver 0.0.0.0:8000 --verbosity 2