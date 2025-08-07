# User Service

## Brief Description

The User Service handles user authentication, registration, and profile management for the InstaPayApp platform. Built with NestJS and MongoDB, it provides secure JWT-based authentication and user data management capabilities.

## Functionality

### Authentication
- **User Registration**: Create new user accounts with email verification
- **User Login**: Secure authentication with password hashing (bcrypt)  
- **JWT Token Management**: Generate and validate access tokens
- **Password Reset**: Secure password recovery via email
- **Email Verification**: Confirm user email addresses during registration

### User Management
- **Profile Management**: Update user information and preferences
- **Account Status**: Manage user account activation/deactivation
- **User Lookup**: Retrieve user information for other services
- **Security**: Password validation and secure authentication flows

### Service Integration
- **Mail Service**: Send verification and notification emails
- **Account Service**: Provide user validation for account creation
- **Transaction Service**: Authenticate users for financial operations
- **Notification Service**: User data for targeted notifications

### API Endpoints
- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication  
- `POST /auth/verify-email` - Email verification
- `POST /auth/forgot-password` - Password reset request
- `GET /user/profile` - Get user profile
- `PUT /user/profile` - Update user profile
- `GET /user/validate` - Validate user for other services

### Technical Features
- **Security**: bcrypt password hashing, JWT tokens
- **Validation**: Input validation with class-validator
- **Database**: MongoDB with Mongoose ODM
- **Error Handling**: Consistent error responses
- **Logging**: Request/response logging middleware

---

**🔙 [Back to Main Documentation](../README.md)** 