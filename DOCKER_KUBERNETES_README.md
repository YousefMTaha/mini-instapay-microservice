# InstaPayApp - Containerization & Orchestration Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Containerization with Docker](#containerization-with-docker)
5. [Environment Setup](#environment-setup)
6. [Kubernetes Orchestration](#kubernetes-orchestration)
7. [Error Handling Architecture](#error-handling-architecture)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)

## Project Overview

InstaPayApp is a microservices-based payment platform built using NestJS for the backend services, MongoDB for data storage, and containerized using Docker. The platform enables users to perform financial transactions securely with features like account management, transaction processing, and notifications.

### Key Features

- User authentication and management
- Account creation and management
- Secure transaction processing
- Email notifications
- Consistent error handling across services

## Architecture

The application follows a microservices architecture pattern with the following components:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    NGINX    │────▶│  API Gateway│────▶│  Web Client │
└─────────────┘     └─────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ User Service│◀───▶│Account Service◀───▶│  Transaction│
└─────────────┘     └─────────────┘     │   Service   │
       │                   │            └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│Notification │◀───▶│ Mail Service│◀───▶│   MongoDB   │
│   Service   │     └─────────────┘     └─────────────┘
└─────────────┘
```

- **NGINX**: Acts as the API gateway and load balancer
- **User Service**: Handles user registration, authentication, and management
- **Account Service**: Manages bank accounts, cards, and balances
- **Transaction Service**: Processes financial transactions between accounts
- **Notification Service**: Manages user notifications
- **Mail Service**: Handles email delivery
- **MongoDB**: Document database for persistent storage

## Project Structure

The codebase is organized as follows:

```
instapay/
├── account-service/       # Account management service
│   ├── src/                 # Source code
│   ├── Dockerfile           # Docker configuration
│   └── .env.{env}           # Environment-specific configurations
├── user-service/          # User authentication and management
│   ├── src/                 # Source code
│   ├── Dockerfile           # Docker configuration
│   └── .env.{env}           # Environment-specific configurations
├── transaction-service/   # Transaction processing service
│   ├── src/                 # Source code
│   ├── Dockerfile           # Docker configuration
│   └── .env.{env}           # Environment-specific configurations
├── notification-service/  # Notification handling service
│   ├── src/                 # Source code
│   ├── Dockerfile           # Docker configuration
│   └── .env.{env}           # Environment-specific configurations
├── mail-service/          # Email delivery service
│   ├── src/                 # Source code
│   ├── Dockerfile           # Docker configuration
│   └── .env.{env}           # Environment-specific configurations
├── nginx/                 # NGINX configuration for API gateway
│   ├── default.conf         # Development configuration
│   ├── staging.conf         # Staging configuration
│   └── production.conf      # Production configuration
├── k8s/                   # Kubernetes manifests
│   └── various .yaml files  # Service, deployment, configmap definitions
├── docker-compose.dev.yml   # Development environment configuration
├── docker-compose.staging.yml # Staging environment configuration
└── docker-compose.prod.yml  # Production environment configuration
```

## Containerization with Docker

### Docker Image Structure

Each microservice has a dedicated Dockerfile that:

1. Uses a Node.js base image
2. Sets up the working directory
3. Installs dependencies
4. Copies the application code
5. Exposes the necessary ports
6. Defines the command to start the service

Example Dockerfile:

```dockerfile
FROM node:22-alpine

WORKDIR /app

RUN npm i yarn

COPY package.json .

RUN yarn

COPY . .

EXPOSE 3000

CMD [ "npm","start" ]
```

### Building Docker Images

To build a service image manually:

```bash
# Example for transaction-service
cd transaction-service
docker build -t instapay/transaction-service:latest .
```

## Environment Setup

### Prerequisites

- Docker and Docker Compose installed
- Kubernetes cluster for production (optional)
- Git for version control

### Development Environment

For local development with hot reloading:

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/instapay.git
   cd instapay
   ```

2. Set up environment variables:

   ```bash
   # Create .env.dev files in each service directory
   # Example for transaction-service
   cp transaction-service/.env.example transaction-service/.env.dev
   # Edit the file with appropriate values
   ```

3. Start the development environment:

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

4. Access the services:
   - API Gateway: http://localhost:3000
   - User Service: http://localhost:3001
   - Mail Service: http://localhost:3002
   - Notification Service: http://localhost:3003
   - Account Service: http://localhost:3004
   - Transaction Service: http://localhost:3005

### Staging Environment

For testing in a production-like environment:

1. Set up environment variables:

   ```bash
   # Create .env.staging files in each service directory
   # Set appropriate values for the staging environment
   ```

2. Start the staging environment:
   ```bash
   docker-compose -f docker-compose.staging.yml up
   ```

### Production Environment

For deploying to production:

1. Set required environment variables:

   ```bash
   export REGISTRY_URL=your-registry.com
   export TAG=latest
   export MONGO_USERNAME=secure-production-username
   export MONGO_PASSWORD=secure-production-password
   ```

2. Start the production environment:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

## Kubernetes Orchestration

For details on our Kubernetes setup, see [Kubernetes Guide](k8s/K8S_README.md).

### Cluster Setup

1. Ensure you have a Kubernetes cluster and `kubectl` configured to access it.

2. Create the namespace:

   ```bash
   kubectl create namespace instapay
   ```

3. Apply Kubernetes manifests:
   ```bash
   kubectl apply -k k8s/
   ```

### Deployment Configuration

The Kubernetes manifests include:

1. **Deployments** for both MongoDB and microservices:

   ```bash
   kubectl get deployments -n instapay
   ```

2. **Services** for internal communication:

   ```bash
   kubectl get services -n instapay
   ```

3. **Ingress** rules for external access:
   ```bash
   kubectl get ingress -n instapay
   ```

### Scaling Services

To horizontally scale a service:

```bash
kubectl scale deployment instapay-transaction-service --replicas=3 -n instapay
```

### Updating Services

To update a service with a new image version:

```bash
kubectl set image deployment/instapay-transaction-service transaction-service=instapay/transaction-service:latest -n instapay
```

## Error Handling Architecture

InstaPayApp implements a consistent approach to error handling across all microservices that ensures clear and accurate error messages are propagated throughout the system.

### Key Components

1. **Error Extraction and Propagation**

   Each service extracts error messages from HTTP responses when calling other services:

   ```typescript
   catchError((error) => {
     const errorMessage = error.response?.data?.message || error.message;
     throw new BadRequestException(errorMessage);
   });
   ```

   This pattern is consistently applied across:

   - Account Service
   - Transaction Service
   - User Service
   - Notification Service
   - Mail Service

2. **Global Exception Filters**

   Each service uses NestJS exception filters to standardize error responses:

   ```typescript
   @Catch()
   export class UnHandledExceptions implements ExceptionFilter {
     catch(exception: unknown, host: ArgumentsHost): void {
       const httpStatus =
         exception instanceof HttpException
           ? exception.getStatus()
           : HttpStatus.INTERNAL_SERVER_ERROR;

       let message = 'Internal server error';
       if (exception instanceof HttpException) {
         const responseMessage = exception.getResponse();

         if (typeof responseMessage === 'string') {
           message = responseMessage;
         } else if (
           typeof responseMessage === 'object' &&
           responseMessage !== null
         ) {
           message = (responseMessage as any).message || message;
         }
       } else if (exception instanceof Error) {
         message = exception.message;
       }

       host.switchToHttp().getResponse().status(httpStatus).json({
         statusCode: httpStatus,
         message,
         status: false,
       });
     }
   }
   ```

3. **Error Message Flow**

   When errors occur in inter-service communication:

   1. Original service throws an exception (e.g., `BadRequestException('invalid PIN')`)
   2. Exception is caught by the global filter and formatted into JSON response
   3. Calling service extracts the meaningful error message
   4. Error is propagated to the client without generic wrapper messages

### Implementation Examples

#### Before Enhancement:

Previously, error handling was implemented like this:

```typescript
catchError((err) => {
  throw new BadRequestException(
    'ERROR FROM ACCOUNT SERVICE:' + err.message,
  );
});
```

This would result in error messages like: "ERROR FROM ACCOUNT SERVICE:Request failed with status code 400" instead of the actual error message.

#### After Enhancement:

Now, the implementation extracts the actual error message from the response:

```typescript
catchError((error) => {
  const errorMessage = error.response?.data?.message || error.message;
  throw new BadRequestException(errorMessage);
});
```

This ensures errors like "invalid PIN" are properly propagated to the client.

### Benefits

- **Transparent Debugging**: Original error messages are preserved
- **Better User Experience**: End users receive meaningful error messages
- **Simplified Troubleshooting**: Error location can be quickly identified
- **Consistent Response Format**: All errors follow the same structure

### Cross-Service Flow Example

When a user enters an invalid PIN:

1. Account Service: `throw new BadRequestException('invalid PIN');`
2. The exception filter formats and returns:
   ```json
   {
     "statusCode": 400,
     "message": "invalid PIN",
     "status": false
   }
   ```
3. Transaction Service extracts `message` from the response and propagates:
   ```typescript
   throw new BadRequestException("invalid PIN");
   ```
4. The error reaches the client with the original, meaningful message

## Troubleshooting

### Common Docker Issues

1. **Container won't start**:

   ```bash
   # Check container logs
   docker logs <container_id>
   ```

2. **Network connectivity issues**:

   ```bash
   # Inspect the network
   docker network inspect instapay_default
   ```

3. **Volume mounting problems**:
   ```bash
   # Verify volumes
   docker volume ls
   ```

### Common Kubernetes Issues

1. **Pod in CrashLoopBackOff state**:

   ```bash
   # Get pod details
   kubectl describe pod <pod_name> -n instapay
   # Check pod logs
   kubectl logs <pod_name> -n instapay
   ```

2. **Service not accessible**:

   ```bash
   # Check service details
   kubectl describe service <service_name> -n instapay
   # Check endpoints
   kubectl get endpoints <service_name> -n instapay
   ```

3. **ConfigMap or Secret issues**:
   ```bash
   # Verify ConfigMap data
   kubectl get configmap <configmap_name> -n instapay -o yaml
   ```

## Best Practices

The InstaPayApp implements the following best practices:

1. **Environment Variables**: Different .env files for different environments
2. **Health Checks**: Liveness and readiness probes for reliable operation
3. **Resource Constraints**: CPU and memory limits to prevent resource exhaustion
4. **Persistent Storage**: For stateful components like MongoDB
5. **Security**: Secrets management for sensitive information
6. **Service Discovery**: Automatic discovery and communication between services
7. **Horizontal Scaling**: Ability to scale services based on load
8. **Graceful Shutdown**: Proper handling of termination signals
