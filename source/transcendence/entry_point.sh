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
    --first_name="$DJANGO_SUPERUSER_FIRSTNAME" \
    --last_name="$DJANGO_SUPERUSER_LASTNAME" \
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

from django.db import IntegrityError
import json
import os

try:
    # open the file containing the dummy users data
    with open('dummy_users.json') as f:
        users_data = json.load(f)

    # Create users from the loaded data
    for user_data in users_data:
        username = user_data['username']
        full_name = user_data['full_name']
        email = user_data['email']
        password = user_data['password']
        
        # Split full_name into first_name and last_name
        first_name, last_name = full_name.split(' ', 1)
        
        try:
            # Create the player and friend list
            player = Player.objects.create_user(
                username=username,
                password=password,
                email=email,
                full_name=full_name,
                first_name=first_name,
                last_name=last_name
            )
            FriendList.objects.create(player=player)
            print(f"Created user: {username}")
        except IntegrityError as e:
            print(f"Failed to create user {username}: {str(e)}")
        except Exception as e:
            print(f"Unexpected error creating user {username}: {str(e)}")
except FileNotFoundError:
    print("Could not find dummy_users.json file!")
except json.JSONDecodeError:
    print("Error parsing dummy_users.json file!")
except Exception as e:
    print(f"Unexpected error: {str(e)}")

print("User creation process completed")
EOF

# Run server
echo "RUNNING SERVER"
# this will start the Django development server (built-in WSGI server)
# This WSGI server is responsible for receiving requests from Nginx and passing them to the Django application.
python manage.py runserver 0.0.0.0:8000 --verbosity 2
