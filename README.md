# Find Your Love - Frontend

## Description
Find Your Love is a matchmaking web application built with React and Material UI (MUI) for the front-end. It allows users to sign up, log in, and interact with potential matches through messages, profiles, and compatibility features.

## Technologies Used
- React 19
- React Router DOM 7
- Material UI (MUI)
- Axios
- SweetAlert2
- Date-fns

## Prerequisites
Before running this project, ensure you have the following installed:
- Node.js (>= 16.x)
- npm (>= 8.x)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/revenger101/FindYourLove.git
   ```
2. Navigate to the project directory:
   ```sh
   cd find_your_love
   ```
3. Install dependencies:
   ```sh
   npm install
   ```

## Running the Application
To start the development server, run:
```sh
npm start
```
The app will be available at `http://localhost:3000/`.

## Project Structure
```
find_your_love/
│── src/
│   ├── Components/       # Reusable UI components (Sidebar, etc.)
│   ├── pages/            # Application pages (Profile, Messages, Matches, etc.)
│   ├── App.js            # Main application component with routing
│   ├── index.js          # Entry point of the React app
│── public/
│── package.json         # Project dependencies and scripts
│── README.md            # Project documentation
```

## Available Routes
| Route          | Component        | Description          |
|---------------|-----------------|----------------------|
| `/`           | FindYourLove     | Homepage            |
| `/profile`    | Profile          | User profile page   |
| `/messages`   | Messages         | Messages section    |
| `/matches`    | Matches          | View matches        |
| `/login`      | Login            | User login page     |
| `/signup`     | Signup           | User signup page    |

## API Integration
This front-end communicates with the Django backend via Axios. Ensure the backend is running before testing API calls.

## Deployment
To build the project for production, run:
```sh
npm run build
```
The optimized files will be available in the `build/` directory.

## License
This project is open-source under the MIT License.

