# Transaction Service

## Overview

The Transaction Service is a core microservice in the InstaPayApp platform that manages financial transactions between accounts. It processes money transfers, payment requests, refunds, and maintains transaction history.

## Features

- Money transfers between accounts
- Transaction history tracking
- Payment request management
- Refund processing
- Transaction validation and verification

## Tech Stack

- NestJS (TypeScript)
- MongoDB (via Mongoose)
- JWT for secure authentication
- RxJS for reactive programming
- Inter-service communication via HTTP

## API Endpoints

### Transactions
- `POST /transaction/send` - Send money to another account
- `POST /transaction/request` - Request money from another account
- `GET /transaction/history` - Get transaction history
- `GET /transaction/:id` - Get transaction details

### Payment Requests
- `POST /transaction/accept/:id` - Accept payment request
- `POST /transaction/reject/:id` - Reject payment request

### Refunds
- `POST /transaction/refund/:id` - Request refund for a transaction
- `POST /transaction/approveRefund/:id` - Approve refund request (admin)
- `POST /transaction/rejectRefund/:id` - Reject refund request (admin)

## Error Handling

This service implements a robust error handling architecture to ensure meaningful error messages are propagated throughout the microservices ecosystem.

### Inter-Service Communication

When calling other services like Account Service, errors are handled using a consistent pattern:

```typescript
catchError((error) => {
  const errorMessage = error.response?.data?.message || error.message;
  throw new BadRequestException(errorMessage);
});
```

This ensures that when errors like "invalid PIN" occur in the Account Service, they are properly propagated to the client instead of generic error messages like "Request failed with status code 400."

### Error Responses

Error responses maintain a consistent format:

```json
{
  "statusCode": 400,
  "message": "Invalid transaction amount",
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
