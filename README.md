# Yalies.io Mobile App

## Project Overview

This is a React Native mobile application that interfaces with the Yalies.io backend service. The app implements token-based authentication and secure API communication.

## Technical Stack

- React Native
- AsyncStorage for token storage
- Axios for API requests
- EAS (Expo Application Services) for builds

## API Configuration

The app communicates with `https://yalies.io/` as the base API endpoint. All API requests are authenticated using Bearer tokens when available.

### Authentication Flow

1. User logs in and receives a token
2. Token is stored securely in AsyncStorage
3. All subsequent API requests include the token in Authorization header
4. Logout removes the token from storage

## Environment Setup

### Required Environment Variables

Create a `.env` file in your project root with the following variables:

API_HOST=https://yalies.io

### EAS Configuration

Create an `eas.json` file in your project root:

json
{
"cli": {
"version": ">= 0.52.0"
},
"build": {
"development": {
"developmentClient": true,
"distribution": "internal",
"env": {
"API_HOST": "https://yalies.io"
}
},
"preview": {
"distribution": "internal",
"env": {
"API_HOST": "https://yalies.io"
}
},
"production": {
"env": {
"API_HOST": "https://yalies.io"
}
}
}
}

## API Methods

### Authentication

- `login(token)`: Stores the authentication token
- `logout()`: Removes the stored token
- `getToken()`: Retrieves the stored token
- `authorize(ticket)`: Authenticates using a ticket parameter

### API Requests

- `post(endpoint, data, options)`: Makes authenticated POST requests to the API

## Setup Instructions

1. Clone the repository
2. Install dependencies: `npm install` or `yarn install`
3. Create `.env` file with required variables
4. Create `eas.json` with build configurations
5. Run the development server: `expo start`

## Building with EAS

- Development build: `eas build --profile development`
- Preview build: `eas build --profile preview`
- Production build: `eas build --profile production`

## Security Notes

- Tokens are stored securely using AsyncStorage
- All API requests are authenticated when a token is available
- HTTPS is enforced for all API communications

## Contributing

[Add your contribution guidelines here]

## License

[Add your license information here]
