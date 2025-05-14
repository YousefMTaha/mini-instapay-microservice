# User Service

## Overview

The User Service is a core microservice in the InstaPayApp platform responsible for user authentication, registration, profile management, and authorization. It serves as the central identity management system for the platform.

## Features

- User registration and authentication
- JWT-based authentication
- User profile management
- Role-based access control
- OTP verification for account operations
- Password management (reset, change)

## Tech Stack

- NestJS (TypeScript)
- MongoDB (via Mongoose)
- JWT for token-based authentication
- bcryptjs for password hashing
- nodemailer for email communication
- RxJS for reactive programming

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Verify user email
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### User Management
- `GET /user/profile` - Get user profile
- `PATCH /user/profile` - Update user profile
- `PATCH /user/change-password` - Change user password
- `GET /user/getAllAdmins` - Get all admin users (admin only)

## Error Handling

This service implements a robust error handling architecture to ensure meaningful error messages are propagated throughout the microservices ecosystem.

### Error Handling Pattern

When calling other services, errors are handled using a consistent pattern:

```typescript
catchError((error) => {
  const errorMessage = error.response?.data?.message || error.message;
  throw new BadRequestException(errorMessage);
});
```

### Error Responses

Error responses maintain a consistent format:

```json
{
  "statusCode": 400,
  "message": "Email already exists",
  "status": false
}
```

### Global Exception Filter

The service uses a global exception filter to standardize error responses:

```typescript
app.useGlobalFilters(new UnHandledExceptions());
```

This ensures that all errors, whether thrown manually or from system exceptions, are formatted consistently.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Testing

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Docker Support

The service includes a Dockerfile for containerization and can be run as part of the InstaPayApp platform using docker-compose.

## License

This project is [MIT licensed](LICENSE).
