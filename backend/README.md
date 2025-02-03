# posthearts-server

## Overview
Posthearts is a server-side application built with Node.js and TypeScript that allows users to create, manage, and share letters. It utilizes MongoDB for data storage and implements Google OAuth for user authentication.

## Features
- User authentication via Google OAuth
- Create, update, delete, and fetch letters
- Generate shareable links for letters
- JWT-based authentication for secure API access


## Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```
   cd posthearts-server
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Configuration
- Create a `.env` file in the root directory and add the following environment variables:
  ```
  MONGO_URI=<your_mongodb_connection_string>
  GOOGLE_CLIENT_ID=<your_google_client_id>
  GOOGLE_CLIENT_SECRET=<your_google_client_secret>
  JWT_SECRET=<your_jwt_secret>
  ```

## Running the Application
To start the development server, run:
```
npm run dev
```

The server will be running on `http://localhost:5000`.

## API Endpoints
- **Authentication**
  - `GET /api/auth/google` - Initiates Google OAuth
  - `GET /api/auth/google/callback` - Google OAuth callback

- **Letters**
  - `POST /api/letters` - Create a new letter
  - `PUT /api/letters/:letter_id` - Update a letter
  - `GET /api/letters/:letter_id` - Fetch a specific letter
  - `GET /api/letters` - Fetch all letters for the authenticated user
  - `DELETE /api/letters/:letter_id` - Delete a letter
  - `GET /api/letters/share/:shareable_link` - Fetch a letter by its shareable link

## License
This project is licensed under the MIT License.