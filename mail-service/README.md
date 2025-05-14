# Mail Service

## Overview

The Mail Service is a dedicated microservice in the InstaPayApp platform responsible for sending email communications to users. It provides a standardized interface for all other services to send emails without implementing email sending logic themselves.

## Features

- Email delivery for user communications
- Template-based email composition
- Secure email sending
- Queue-based processing
- Support for transactional emails

## Tech Stack

- NestJS (TypeScript)
- Nodemailer for email delivery
- RxJS for reactive programming
- Queue management (optional)

## API Endpoints

### Mail Sending

- `POST /mail-service` - Send an email with the provided content

## Service Interface

The Mail Service exposes a simple interface for other microservices:

```typescript
interface EmailRequest {
  to: string; // Recipient email address
  subject: string; // Email subject
  html: string; // Email body as HTML
}
```

Example usage from other services:

```typescript
const { data } = await firstValueFrom(
  this.httpService.post('http://mail-service:3002/mail-service', {
    to: 'user@example.com',
    subject: 'Account Verification',
    html: '<h1>Verify your account</h1><p>Click the link below to verify...</p>',
  }),
);
```

## Error Handling

This service implements a robust error handling architecture to ensure meaningful error messages are propagated throughout the microservices ecosystem.

### Error Response Format

When email sending fails, the service returns a standardized error response:

```json
{
  "statusCode": 400,
  "message": "Failed to send email: Invalid recipient address",
  "status": false
}
```

### Global Exception Filter

The service uses a global exception filter to standardize error responses:

```typescript
app.useGlobalFilters(new UnHandledExceptions());
```

This ensures that all errors, whether thrown manually or from system exceptions, are formatted consistently.

### Error Handling in Calling Services

Services that call the Mail Service should implement proper error handling:

```typescript
catchError((error) => {
  const errorMessage = error.response?.data?.message || error.message;
  throw new BadRequestException(errorMessage);
});
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
