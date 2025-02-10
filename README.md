# Dream Partner Backend

This is the backend for the **Dream Partner** project, built using Django. It provides APIs for user authentication, matchmaking, and notifications.

## Installation and Setup

### Prerequisites
Ensure you have the following installed:
- Python (>=3.8)
- Django (>=5.1.5)
- SQLite (default database, or configure your own)

### Clone the Repository
```sh
git clone https://github.com/revenger101/Dream_Partner.git
cd Dream_Partner
```

### Create a Virtual Environment (Optional but Recommended)
```sh
python -m venv venv
source venv/bin/activate  # On macOS/Linux
venv\Scripts\activate  # On Windows
```

### Install Dependencies
```sh
pip install -r requirements.txt
```

### Run Database Migrations
```sh
python manage.py migrate
```

### Create a Superuser (Optional for Admin Access)
```sh
python manage.py createsuperuser
```

### Start the Development Server
```sh
python manage.py runserver
```
Access the API at: `http://127.0.0.1:8000/`

---

## API Endpoints

### Authentication
- `POST /signup/` - Register a new user
- `POST /login/` - Log in a user

### Matchmaking
- `GET /zodiac-compatibility/` - Get zodiac compatibility
- `POST /select-compatible/` - Select a compatible user
- `POST /accept-match/` - Accept a match
- `POST /reject-match/<int:user_id>/<int:match_id>/` - Reject a match
- `GET /possible-matches/<int:user_id>/` - Retrieve possible matches
- `GET /get-matches/` - Retrieve all matches
- `GET /accepted-matches/<int:user_id>/` - Retrieve accepted matches

### Notifications
- `GET /get-notifications/<int:user_id>/` - Retrieve user notifications
- `POST /mark-notification-as-read/<int:notification_id>/` - Mark a notification as read

### Pending Requests
- `GET /pending-requests/<int:user_id>/` - Retrieve pending match requests

---

## Configuration (Django Settings)
The project uses `settings.py` to configure:
- **Database:** SQLite (default) or custom database configuration.
- **CORS Handling:** Allows requests from `http://localhost:3000` (React frontend).
- **Authentication and Security:** Uses Django authentication and password validation.

To customize, update the `dreampartner/settings.py` file accordingly.

---

## Deployment
To deploy the project, use services like:
- **Heroku** (for quick deployment)
- **DigitalOcean / AWS / GCP** (for production-ready deployment)

Make sure to configure environment variables (`.env` file) for production security.

---

## License
This project is licensed under the MIT License.

