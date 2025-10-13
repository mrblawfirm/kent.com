# Legal Management System - Authentication

A robust authentication and authorization system for a legal management application built with Node.js, Express, and MongoDB.

## Features

- **User Registration & Login**: Secure user authentication with JWT tokens
- **Role-Based Access Control**: Support for three user types (attorney, staff, client)
- **Password Security**: Bcrypt hashing with salt rounds
- **Input Validation**: Express-validator for request validation
- **Middleware Protection**: Authentication and authorization middleware
- **User Management**: Active/inactive user status, last login tracking

## Project Structure

```
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables
├── config/
│   └── database.js        # MongoDB connection configuration
├── models/
│   └── user.js           # User model with Mongoose schema
├── routes/
│   └── auth.js           # Authentication routes
└── middleware/
    └── auth.js           # Authentication & authorization middleware
```

## API Endpoints

### Authentication Routes (`/api/auth`)

- `POST /register` - Register a new user
- `POST /login` - User login
- `GET /me` - Get current user profile (requires authentication)

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update the environment variables:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A secure random string for JWT signing
     - `PORT`: Server port (default: 3000)

3. **Start MongoDB**
   Make sure MongoDB is running on your system or use a cloud service like MongoDB Atlas.

4. **Run the Application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## Usage Examples

### Register a New User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "userType": "attorney"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Current User (with JWT token)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## User Types & Permissions

- **Attorney**: Full access to legal cases and client management
- **Staff**: Administrative access with limited case management
- **Client**: Access to own cases and documents only

## Security Features

- Password hashing with bcryptjs (12 salt rounds)
- JWT token-based authentication
- Input validation and sanitization
- Role-based authorization
- Account activation/deactivation
- Secure HTTP headers
- CORS protection

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description",
  "errors": ["Detailed validation errors if applicable"]
}
```

## Development

- The server includes hot-reloading with nodemon in development mode
- MongoDB connection includes proper error handling and graceful shutdown
- Comprehensive logging for debugging

## Production Considerations

- Change `JWT_SECRET` to a cryptographically secure random string
- Use environment-specific MongoDB URI
- Enable HTTPS in production
- Set up proper logging (Winston, Morgan)
- Implement rate limiting
- Add API documentation (Swagger/OpenAPI)
- Set up monitoring and health checks