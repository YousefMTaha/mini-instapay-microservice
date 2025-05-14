# Notification Service

## Overview

The Notification Service is a critical microservice in the InstaPayApp platform responsible for delivering real-time and email notifications to users about account activities, transactions, and system events. It handles both push notifications and event broadcasting.

## Features

- Real-time notifications via WebSockets
- Transaction event notifications
- Account activity alerts
- System notifications
- Low balance alerts
- Refund request notifications

## Tech Stack

- NestJS (TypeScript)
- MongoDB (via Mongoose)
- Socket.io for real-time communication
- RxJS for reactive programming
- Inter-service communication via HTTP

## API Endpoints

### Notifications

- `POST /notification/low-balance` - Send low balance notification
- `POST /notification/exceedLimit` - Send limit exceeded notification
- `POST /notification/wrongPIN` - Send wrong PIN notification
- `POST /notification/sendOrReceive` - Send transaction notification
- `POST /notification/receiveRequest` - Send payment request notification
- `POST /notification/approveRefund` - Send refund approval notification
- `POST /notification/rejectRefund` - Send refund rejection notification
- `POST /notification/requestRefund` - Send refund request notification

## Error Handling

This service implements a robust error handling architecture to ensure meaningful error messages are propagated throughout the microservices ecosystem.

### Error Handling Pattern

When calling other services (e.g., User Service), errors are handled using a consistent pattern:

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
  "message": "User not found",
  "status": false
}
```

### Global Exception Filter

The service uses a global exception filter to standardize error responses:

```typescript
app.useGlobalFilters(new UnHandledExceptions());
```

This ensures that all errors, whether thrown manually or from system exceptions, are formatted consistently.

## WebSocket Implementation

The service implements WebSockets for real-time notifications:

```typescript
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  // Implementation details
}
```

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
