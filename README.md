# InstaPayApp

<div align="center">
  <h3>A Microservices-Based Payment Platform</h3>
</div>

## Overview

InstaPayApp is a modern payment platform built using a microservices architecture, containerized with Docker, and orchestrated with Kubernetes. The platform enables secure financial transactions between users with features like account management, transaction processing, and notifications.

## Key Features

- 👤 **User Management**: Registration, authentication, and profile management
- 💳 **Account Services**: Create and manage bank accounts and cards
- 💸 **Transaction Processing**: Send and receive money securely
- 📧 **Notifications**: Real-time alerts for account activities
- 🔄 **Error Propagation**: Consistent error handling across microservices

## Tech Stack

- **Backend**: NestJS (TypeScript)
- **Database**: MongoDB
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes
- **API Gateway**: NGINX

## Project Structure

The application is composed of several microservices:

- **User Service**: Handles user registration, authentication, and management
- **Account Service**: Manages bank accounts, cards, and balances
- **Transaction Service**: Processes financial transactions between accounts
- **Notification Service**: Manages user notifications
- **Mail Service**: Handles email delivery
- **API Gateway (NGINX)**: Routes requests to appropriate services
- **MongoDB**: Document database for persistent storage

## Error Handling

The platform implements a consistent error handling mechanism across microservices:

- Each service properly extracts and propagates error messages from other services
- Original error messages are preserved throughout the microservice chain
- HTTP status codes are maintained along with descriptive error messages
- BadRequestExceptions, NotFoundExceptions, and other NestJS exceptions are properly handled between services

### Implementation Details

Our error handling implementation uses a unified approach across all services:

```typescript
// Consistent error handling pattern in all service-to-service calls
catchError((error) => {
  const errorMessage = error.response?.data?.message || error.message;
  throw new BadRequestException(errorMessage);
})
```

This ensures that when services communicate, errors like "invalid PIN" from the account service are passed directly to the client instead of generic error messages like "Request failed with status code 400."

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Git

### Installation & Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/instapay.git
   cd instapay
   ```

2. Start the development environment:

   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

3. Access the application:
   - API Gateway: http://localhost:3000

## Kubernetes Deployment

For Kubernetes deployment:

1. Check out the Kubernetes configurations:

   ```bash
   cd k8s
   ```

2. Follow the instructions in [Kubernetes Guide](k8s/K8S_README.md)

## Detailed Documentation

For comprehensive documentation on setting up, developing, and deploying the application, please refer to:

- [Containerization & Orchestration Guide](DOCKER_KUBERNETES_README.md)
- [API Documentation](https://documenter.getpostman.com/view/25674968/2sB2qUnQcK)
- [Development Guide](docs/DEVELOPMENT.md)
