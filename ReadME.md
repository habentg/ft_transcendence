# ft_transcendence

ft_transcendence is a full-stack web application designed for real-time chat, multiplayer ping-pong gaming, and secure user interactions. The project leverages modern technologies to ensure scalability, maintainability, and a seamless user experience. It features a responsive frontend, a robust backend, and is fully containerized for deployment flexibility.

---

## Features

- **Real-Time Multiplayer Gaming:** Engage in live games with other users.
- **Chat System:** Real-time communication with features like blocking/unblocking and conversation clearing.
- **User Authentication:**
  - Secure registratio system
  - OAuth 2.0 login integration with the 42 intranet.
  - Two-Factor Authentication (2FA) for enhanced security.
- **Secure Connections:** TLS/SSL protocol for HTTPS and WSS.
- **Notifications:** Real-time notifications for friend requests.
- **Containerization:** Fully Dockerized application for easy setup and deployment.
- **Throttling & Rate Limiting:** Safeguard APIs against abuse with effective throttling mechanisms.

---

## Tech Stack

### Frontend:
- HTML5, CSS3, and Vanilla JavaScript
- Responsive design with Bootstrap

### Backend:
- Django (Python)
- Django REST Framework (DRF) for APIs
- Django Channels for WebSocket functionality

### Database:
- PostgreSQL for storing persistent user and game data
- Redis for reduce database load and improve response times.

### Other Tools & Services:
- Nginx for static file serving and reverse proxy
- Redis for caching and JWT token invalidation
- Docker for containerization
- Self-signed certificates for HTTPS and WSS

---

## Installation

### Prerequisites
- Docker & Docker Compose installed on your machine
- Access to the 42 OAuth API credentials (optional)

### Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/habentg/ft_transcendence.git
   cd ft_transcendence
   ```

2. **Set up environment variables:**
   Create a `.env` file in the root directory with the following:
   ```env
   DOMAIN_NAME=
   SECRET_KEY =
   CLIENT_ID=
   CLIENT_SECRET=
   POSTGRES_DB=
   POSTGRES_USER=
   POSTGRES_PASSWORD=
   DJANGO_SUPERUSER_USERNAME=
   DJANGO_SUPERUSER_FULLNAME=
   DJANGO_SUPERUSER_EMAIL=
   DJANGO_SUPERUSER_PASSWORD=
   DEFAULT_FROM_EMAIL=
   EMAIL_HOST_USER=
   EMAIL_HOST_PASSWORD=
   EMAIL_PORT=
   ```

3. **Build and run the containers:**
   ```bash
   docker-compose up --build
   ```

4. **Access the application:**
   - Visit `https://localhost` in your browser.

---

## Usage

### Authentication
- Register or Log in using your 42 credentials.
- Set up Two-Factor Authentication for added security.

### Features
- Play varaity of pong games.
- Manage friend requests and notifications in real time.
- Chat with other users and manage your conversations.
- Update your profile
- See you game history and stats

---

## Project Structure

```
.
├── Makefile
├── docker-compose.yaml
├── source
│   ├── nginx
│   │   ├── Dockerfile
│   │   ├── conf
│   │   └── tools
│   └── transcendence
│       ├── account
│       ├── chat
│       ├── friendship
│       ├── game
│       ├── others
│       ├── transcendence
│       ├── Dockerfile
│       ├── requirements.txt
│       ├── entry_point.sh
│       └── manage.py
└── ReadME.md
```

---

## Security Features
- **OAuth 2.0:** Secure login via 42 intranet.
- **Two-Factor Authentication:** Protect user accounts with OTP.
- **JWT Blacklisting:** Logout invalidates tokens via Redis.
- **Throttling:** Protected endpoints from abuse.
- **XSS and CSRF attack** Secure and HTTP-only JWT tokens

---

## Future Improvements

- **Enhanced UI/UX:** Use modern frameworks like React or Tailwind CSS.
- **CI/CD Pipeline:** Automate testing and deployment workflows.
- **Cloud Deployment:** Deploy to AWS/GCP for scalability.

---

## Contact

For questions or feedback, please reach out to the project maintainer:
- **Name:** Haben Tesfamariam Gaim
- **Email:** [habentg022@gmail.com]
- **GitHub:** [habentg](https://github.com/habentg)

- **Name:** -
- **Email:** [- @gmail.com]
- **GitHub:** [-](https://github.com/-)

- **Name:** -
- **Email:** [- @gmail.com]
- **GitHub:** [-](https://github.com/-)

- **Name:** -
- **Email:** [- @gmail.com]
- **GitHub:** [-](https://github.com/-)
