# LinkedIn Chat Application Backend

A real-time chat application backend that allows users to authenticate with LinkedIn and exchange messages with other users.

## Features

- LinkedIn OAuth 2.0 authentication
- Real-time messaging using WebSocket (Socket.IO)
- Chat history retrieval
- MongoDB database integration
- JWT-based authentication
- RESTful API endpoints

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- LinkedIn Developer Account

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd linkedin-chat-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/linkedin-chat
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_CALLBACK_URL=http://localhost:5001/auth/linkedin/callback
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
SESSION_SECRET=your_session_secret
```

4. Set up LinkedIn OAuth:
   - Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
   - Create a new application
   - Add the following OAuth 2.0 scopes:
     - `openid`
     - `email`
     - `profile`
   - Set the callback URL to match your `LINKEDIN_CALLBACK_URL`
   - Copy the Client ID and Client Secret to your `.env` file

5. Start the server:
```bash
npm start
```

## API Endpoints

### Authentication

#### GET /auth/linkedin
Initiates LinkedIn OAuth login flow.

#### GET /auth/linkedin/callback
LinkedIn OAuth callback URL. Returns a JWT token on successful authentication.

#### GET /auth/profile
Get the current user's profile.
- Headers: `Authorization: Bearer <token>`

#### POST /auth/logout
Log out the current user.
- Headers: `Authorization: Bearer <token>`

### Messages

#### GET /messages/:userId
Get chat history with a specific user.
- Headers: `Authorization: Bearer <token>`
- Parameters:
  - `userId`: ID of the other user

#### POST /messages
Send a message to another user.
- Headers: `Authorization: Bearer <token>`
- Body:
  ```json
  {
    "receiverId": "user_id",
    "content": "message content"
  }
  ```

#### PUT /messages/read/:userId
Mark all messages from a specific user as read.
- Headers: `Authorization: Bearer <token>`
- Parameters:
  - `userId`: ID of the other user

## WebSocket Events

### Client Events

#### authenticate
Authenticate WebSocket connection with JWT token.
```javascript
socket.emit('authenticate', token);
```

#### send_message
Send a new message.
```javascript
socket.emit('send_message', {
  receiverId: 'user_id',
  content: 'message content'
});
```

### Server Events

#### new_message
Receive a new message.
```javascript
socket.on('new_message', (message) => {
  // Handle new message
});
```

#### error
Receive error notifications.
```javascript
socket.on('error', (error) => {
  // Handle error
});
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error responses follow this format:
```json
{
  "error": "Error message"
}
```

## Security

- All routes except `/auth/linkedin` and `/auth/linkedin/callback` require JWT authentication
- WebSocket connections must be authenticated
- LinkedIn OAuth state parameter is used to prevent CSRF attacks
- Passwords are not stored (using LinkedIn authentication)
- JWT tokens expire after 24 hours

## Development

To run the server in development mode with hot reloading:
```bash
npm run dev
```

## Testing

To run tests:
```bash
npm test
```

## License

MIT 
