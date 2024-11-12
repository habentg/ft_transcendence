#!/bin/sh

python manage.py shell <<EOF
from account.models import Player
from friendship.models import FriendList
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