# MRB Law Firm Management System

A comprehensive law firm management system with separate dashboards for attorneys, staff, and clients. Built with Node.js, Express, MongoDB, and modern web technologies.

## Features

### Multi-User System
- **Attorney Dashboard**: Complete case management, client oversight, billing, and document management
- **Staff Dashboard**: Administrative tools, client support, document management, and case assistance
- **Client Dashboard**: View case status, upcoming hearings, billing information, and documents

### Core Functionality
- **User Management**: Role-based authentication and authorization
- **Case Management**: Complete case lifecycle management with notes, documents, and timeline
- **Event Scheduling**: Court hearings, consultations, meetings with calendar integration
- **Document Management**: Secure file upload, categorization, and access control
- **Billing System**: Invoice generation, payment tracking, and financial reporting
- **Dashboard Analytics**: Real-time statistics and activity monitoring

## Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing
- **express-validator** for input validation

### Frontend
- **HTML5, CSS3, JavaScript** (Vanilla)
- **Bootstrap 5** for responsive design
- **Tailwind CSS** for attorney dashboard
- **Font Awesome** for icons

### Security Features
- Helmet.js for security headers
- Rate limiting
- CORS configuration
- Input validation and sanitization
- Role-based access control

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mrb-law-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mrb-law
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb/brew/mongodb-community
   
   # On Ubuntu/Debian
   sudo systemctl start mongod
   
   # On Windows
   net start MongoDB
   ```

5. **Seed the database**
   ```bash
   npm run seed
   ```

6. **Start the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Default Login Credentials

After running the seed script, you can use these credentials:

### Attorney Login
- **Email**: attorney@mrblaw.com
- **Password**: password123
- **User Type**: Attorney

### Staff Login
- **Email**: staff@mrblaw.com
- **Password**: password123
- **User Type**: Staff

### Client Login
- **Email**: client@mrblaw.com
- **Password**: password123
- **User Type**: Client

## Registration System

New users can register through the signup page at `/signup`:
- **Self-registration** for clients with complete address information
- **Professional registration** for attorneys with bar number and specializations
- **Staff registration** with position and department details
- **Form validation** and comprehensive error handling
- **Automatic user type detection** with dynamic field customization
- **Secure password confirmation** and validation

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Case Management
- `GET /api/cases` - Get all cases (filtered by user type)
- `POST /api/cases` - Create new case (attorney/staff only)
- `GET /api/cases/:caseId` - Get single case
- `PUT /api/cases/:caseId` - Update case
- `POST /api/cases/:caseId/notes` - Add note to case
- `GET /api/cases/client/active` - Get client's active case

### Event Management
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/court-hearings` - Get upcoming hearings
- `GET /api/events/consultations` - Get upcoming consultations
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Document Management
- `GET /api/documents` - Get all documents (with access control)
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Get single document
- `GET /api/documents/:id/download` - Download document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Billing Management
- `GET /api/billing` - Get billing records
- `POST /api/billing` - Create new bill
- `GET /api/billing/:billingId` - Get single bill
- `PUT /api/billing/:billingId` - Update bill
- `POST /api/billing/:billingId/payments` - Record payment
- `GET /api/billing/client/unpaid` - Get client's unpaid bills

### User Management
- `GET /api/users` - Get all users (attorney/staff only)
- `POST /api/users` - Create new user
- `GET /api/users/:userId` - Get single user
- `PUT /api/users/:userId` - Update user
- `GET /api/users/attorneys/list` - Get all attorneys
- `GET /api/users/attorney/clients` - Get attorney's clients

### Client-Specific Endpoints
- `GET /api/clients/dashboard` - Get client dashboard data
- `GET /api/clients/profile` - Get client profile
- `GET /api/clients/cases` - Get client's cases
- `GET /api/clients/events` - Get client's events
- `GET /api/clients/documents` - Get client's documents
- `GET /api/clients/billing` - Get client's bills

## File Structure

```
mrb-law-backend/
├── models/
│   ├── User.js          # User model (attorneys, staff, clients)
│   ├── Case.js          # Case model
│   ├── Event.js         # Event model
│   ├── Document.js      # Document model
│   └── Billing.js       # Billing model
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── cases.js         # Case management routes
│   ├── events.js        # Event management routes
│   ├── documents.js     # Document management routes
│   ├── billing.js       # Billing routes
│   ├── users.js         # User management routes
│   └── clients.js       # Client-specific routes
├── middleware/
│   └── auth.js          # Authentication middleware
├── public/
│   ├── login.html       # Login page
│   ├── client-dashboard.html    # Client dashboard
│   ├── attorney-dashboard.html  # Attorney dashboard
│   └── staff-dashboard.html     # Staff dashboard
├── scripts/
│   └── seedData.js      # Database seeding script
├── uploads/             # File upload directory
├── server.js            # Main server file
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables
└── README.md           # This file
```

## Database Schema

### User Model
- Supports three user types: attorney, staff, client
- Role-based field inclusion (e.g., barNumber for attorneys, clientId for clients)
- Address information for clients
- Professional details for attorneys and staff

### Case Model
- Complete case lifecycle management
- Court information and timeline tracking
- Financial tracking (estimated vs actual costs)
- Public and private notes system
- Document and hearing associations

### Event Model
- Multiple event types (consultation, court-hearing, meeting, etc.)
- Court-specific fields (judge, courtroom)
- Participant management with attendance tracking
- Reminder system

### Document Model
- Secure file storage with access control
- Category-based organization
- Version control support
- Review and approval workflow

### Billing Model
- Line-item billing with tax calculation
- Payment tracking and history
- Multiple payment methods support
- Overdue detection and reporting

## Security Features

- **Authentication**: JWT-based with secure token handling
- **Authorization**: Role-based access control with granular permissions
- **Data Validation**: Comprehensive input validation and sanitization
- **File Security**: Secure file upload with type checking and access control
- **Rate Limiting**: Protection against abuse and DoS attacks
- **CORS**: Configured for secure cross-origin requests
- **Password Security**: Bcrypt hashing with salt rounds

## Development

### Adding New Features
1. Create/update models in `models/` directory
2. Add routes in `routes/` directory
3. Update middleware if needed
4. Add frontend functionality
5. Update API documentation

### Testing
```bash
# Run the application in development mode
npm run dev

# Access different dashboards
# - Login: http://localhost:5000/login
# - Registration: http://localhost:5000/signup
# - Attorney: http://localhost:5000/attorney-dashboard
# - Staff: http://localhost:5000/staff-dashboard  
# - Client: http://localhost:5000/client-dashboard
```

## Production Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure secure MongoDB connection
4. Set up proper CORS origins
5. Enable HTTPS
6. Configure file upload limits
7. Set up proper logging

### Recommended Production Stack
- **Server**: Ubuntu/CentOS with Node.js
- **Database**: MongoDB Atlas or self-hosted MongoDB
- **Web Server**: Nginx as reverse proxy
- **Process Manager**: PM2 for Node.js process management
- **SSL**: Let's Encrypt or commercial SSL certificate

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or create an issue in the repository.

---

**MRB Law Firm Management System** - Streamlining legal practice management with modern technology.