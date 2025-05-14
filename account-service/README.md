# Account Service

## Overview

The Account Service is a core microservice in the InstaPayApp platform that manages bank accounts, cards, balances, and PIN verification. It handles account creation, account management, limit checking, and related financial operations.

## Features

- Account creation and management
- PIN verification and management
- Card association with accounts
- Balance tracking
- Spending limit management
- Secure PIN reset flow with OTP

## Tech Stack

- NestJS (TypeScript)
- MongoDB (via Mongoose)
- JWT for secure tokens
- bcryptjs for password hashing
- RxJS for reactive programming

## API Endpoints

### Account Management

- `GET /account` - Get all accounts for the current user
- `GET /account/defaultAcc` - Get the default account for the current user
- `POST /account` - Create a new account
- `PATCH /account/PIN/:id` - Update account PIN
- `DELETE /account/:id` - Delete an account

### Balance & Limits

- `POST /account/balance/:id` - Get account balance
- `PATCH /account/limit/:id` - Update account limit

### PIN Management

- `POST /account/sendForgetPINOTP/:id` - Send OTP for PIN reset
- `POST /account/confirmOTPforgetPIN` - Validate OTP for PIN reset
- `PATCH /account/forgetPIN` - Set a new PIN after validation

## Error Handling

This service implements a robust error handling architecture to ensure meaningful error messages are propagated throughout the microservices ecosystem.

### Error Propagation

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
  "message": "invalid PIN",
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
