# Development Guide

This document provides guidelines and information for developers working on the InstaPayApp project.

## Table of Contents

1. [Development Environment Setup](#development-environment-setup)
2. [Project Structure](#project-structure)
3. [Coding Conventions](#coding-conventions)
4. [Error Handling Between Microservices](#error-handling-between-microservices)
5. [API Development](#api-development)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Contributing](#contributing)

## Development Environment Setup

### Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)
- Docker and Docker Compose
- Git
- MongoDB (for local development without Docker)

### Local Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/instapay.git
   cd instapay
   ```

2. **Install dependencies for each service:**

   ```bash
   # Example for transaction service
   cd transaction-service
   npm install

   # Repeat for other services
   ```

3. **Set up environment variables:**
   Create a `.env.dev` file in each service directory based on the provided example files.

4. **Start development environment using Docker Compose:**

   ```bash
   # From the root directory
   docker-compose -f docker-compose.dev.yml up
   ```

   The Docker Compose setup includes volume mounts for hot-reloading, so changes to your code will be reflected immediately.

5. **Alternatively, run services individually:**

   ```bash
   # In transaction-service directory
   npm run start:dev

   # Similarly for other services
   ```

## Project Structure

Each microservice follows a similar structure based on NestJS conventions:

```
service-name/
├── src/
│   ├── controllers/    # API endpoints
│   ├── services/       # Business logic
│   ├── dto/            # Data Transfer Objects
│   ├── entities/       # Data models
│   ├── interfaces/     # TypeScript interfaces
│   ├── middleware/     # Custom middleware
│   ├── config/         # Configuration
│   ├── utils/          # Utility functions
│   ├── app.module.ts   # Main module
│   └── main.ts         # Entry point
├── test/               # Tests
├── Dockerfile          # Docker configuration
├── .env.example        # Example environment variables
└── package.json        # Dependencies and scripts
```

## Coding Conventions

We follow these coding standards:

1. **TypeScript**: Use strict typing wherever possible
2. **Naming Conventions**:

   - **Classes/Interfaces**: PascalCase (e.g., `UserService`)
   - **Functions/Variables**: camelCase (e.g., `getUserById`)
   - **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ATTEMPTS`)
   - **Files**: kebab-case (e.g., `user-service.ts`)

3. **Code Documentation**:

   - Add JSDoc comments for classes, methods, and complex logic
   - Keep comments up-to-date with code changes

4. **Error Handling**:
   - Use NestJS exception filters for HTTP errors
   - Provide meaningful error messages

## Error Handling Between Microservices

When developing services that communicate with other microservices, follow these guidelines for error handling:

### Standard Error Handling Pattern

Always use this pattern when catching errors from HTTP calls to other services:

```typescript
import { catchError, firstValueFrom } from "rxjs";
import { BadRequestException } from "@nestjs/common";

// Making an HTTP call to another service
const { data } = await firstValueFrom(
  this.httpService.post("http://other-service:3000/endpoint", payload).pipe(
    catchError((error) => {
      const errorMessage = error.response?.data?.message || error.message;
      throw new BadRequestException(errorMessage);
    })
  )
);
```

### Error Extraction Details

1. First, try to extract the error message from the response data structure: `error.response?.data?.message`
2. If that's not available, fall back to the standard error message: `error.message`
3. Throw a new exception with the extracted message to propagate it

### Global Exception Filters

Each service must implement the global exception filter in its `main.ts`:

```typescript
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { UnHandledExceptions } from "./filters/unhandledErrors.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new UnHandledExceptions());
  // Other configurations...
  await app.listen(3000);
}
bootstrap();
```

### Benefits of Consistent Error Handling

- **Improved Debugging**: Errors maintain their context as they travel between services
- **Better User Experience**: End users receive meaningful error messages
- **Consistent Responses**: All error responses follow the same structure
- **Simplified Troubleshooting**: Error sources are more easily identified

## API Development

### RESTful Guidelines

1. **Use appropriate HTTP methods**:

   - GET: Retrieve resources
   - POST: Create resources
   - PUT: Update resources (full update)
   - PATCH: Update resources (partial update)
   - DELETE: Remove resources

2. **Resource naming**:

   - Use plural nouns for resources (e.g., `/users`, not `/user`)
   - Use sub-resources for relationships (e.g., `/users/{id}/accounts`)

3. **Response formats**:
   - Use consistent JSON structures
   - Include status codes, messages, and data

### Creating New Endpoints

1. Create DTO (Data Transfer Object) classes for request/response validation
2. Add controller method with proper decorators
3. Implement service method with business logic
4. Add unit and integration tests
5. Document the API endpoint

## Testing

### Unit Testing

```bash
# Run unit tests for a specific service
cd transaction-service
npm run test
```

### Integration Testing

```bash
# Run integration tests
cd transaction-service
npm run test:e2e
```

### Test Coverage

```bash
# Generate test coverage report
npm run test:cov
```

## Debugging

### Docker Environment

1. **View logs**:

   ```bash
   # All services
   docker-compose -f docker-compose.dev.yml logs -f

   # Specific service
   docker-compose -f docker-compose.dev.yml logs -f transaction-service
   ```

2. **Access container shell**:

   ```bash
   docker-compose -f docker-compose.dev.yml exec transaction-service sh
   ```

3. **Inspect MongoDB**:

   ```bash
   docker-compose -f docker-compose.dev.yml exec mongodb mongo
   ```

### Node.js Debugging

1. Use the `--inspect` flag when starting a service
2. Connect with Chrome DevTools or VS Code debugger

## Contributing

1. **Create a feature branch**:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes following the coding conventions**

3. **Write tests for your changes**

4. **Run linting**:

   ```bash
   npm run lint
   ```

5. **Submit a pull request**:

   - Provide a clear description of changes
   - Reference any related issues
   - Ensure CI checks pass

6. **Code review process**:
   - Address feedback from reviewers
   - Make requested changes
   - Once approved, your PR will be merged

## Continuous Integration

We use GitHub Actions for CI/CD. The workflow includes:

1. Building the services
2. Running tests
3. Linting code
4. Building Docker images
5. Deploying to staging/production environments

Check the `.github/workflows` directory for CI configuration.
