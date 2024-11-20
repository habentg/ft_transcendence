import json
import random
import string

# Lists of realistic first and last names
first_names = [
    "James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda",
    "William", "Elizabeth", "David", "Barbara", "Richard", "Susan", "Joseph", "Jessica",
    "Thomas", "Sarah", "Charles", "Karen", "Christopher", "Emma", "Daniel", "Lisa",
    "Matthew", "Nancy", "Anthony", "Margaret", "Donald", "Sandra", "Mark", "Ashley",
    "Paul", "Kimberly", "Steven", "Emily", "Andrew", "Donna", "Kenneth", "Michelle",
    "George", "Carol", "Joshua", "Amanda", "Kevin", "Dorothy", "Brian", "Melissa",
    "Edward", "Deborah", "Ronald", "Sophia", "Timothy", "Rachel", "Jason", "Laura",
    "Jeffrey", "Charlotte", "Ryan", "Olivia", "Jacob", "Isabella", "Gary", "Ava",
    "Nicholas", "Emma", "Eric", "Mia", "Stephen", "Abigail", "Jonathan", "Madison",
    "Larry", "Chloe", "Justin", "Harper", "Scott", "Scarlett", "Brandon", "Grace",
    "Benjamin", "Lily", "Samuel", "Eleanor", "Frank", "Hannah", "Gregory", "Aria"
]

last_names = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
    "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
    "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
    "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
    "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell",
    "Carter", "Roberts", "Phillips", "Evans", "Turner", "Parker", "Edwards", "Collins",
    "Stewart", "Morris", "Murphy", "Cook", "Rogers", "Morgan", "Peterson", "Cooper",
    "Reed", "Bailey", "Bell", "Gomez", "Kelly", "Howard", "Ward", "Cox", "Diaz",
    "Richardson", "Wood", "Watson", "Brooks", "Bennett", "Gray", "James", "Reyes"
]

def generate_username(full_name, used_usernames):
    # Create base username from full name
    base = full_name.lower().replace(" ", "")[:10]
    username = base
    
    # Add numbers if username is taken
    counter = 1
    while username in used_usernames:
        username = f"{base}{counter}"
        counter += 1
    
    return username

def generate_email(username, used_emails):
    domains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "example.com"]
    email = f"{username}@{random.choice(domains)}"
    
    # Ensure email is unique
    counter = 1
    while email in used_emails:
        email = f"{username}{counter}@{random.choice(domains)}"
        counter += 1
    
    return email

def generate_password():
    length = random.randint(6, 12)  # Random length between 6 and 12
    characters = string.ascii_letters + string.digits + "!@#$%^&*"
    return ''.join(random.choice(characters) for _ in range(length))

def generate_users(count=100):
    users = []
    used_usernames = set()
    used_emails = set()
    
    for _ in range(count):
        # Generate full name
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        full_name = f"{first_name} {last_name}"
        
        # Generate unique username
        username = generate_username(full_name, used_usernames)
        used_usernames.add(username)
        
        # Generate unique email
        email = generate_email(username, used_emails)
        used_emails.add(email)
        
        # Create user object
        user = {
            "username": username,
            "full_name": full_name,
            "email": email,
            "password": generate_password()
        }
        users.append(user)
    
    return users

# Generate 100 users and convert to JSON
users = generate_users(100)
print(json.dumps(users, indent=4))