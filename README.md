# InstaPayApp Backend

## Brief Description

InstaPayApp is a microservices-based payment platform backend built with NestJS and TypeScript. The system provides secure financial transaction capabilities, user management, and real-time notifications through a distributed architecture using MongoDB for data persistence.

## Backend Functionality

- **User Authentication & Management**: User registration, login, and profile management
- **Account Services**: Bank account and card management with balance tracking
- **Transaction Processing**: Secure money transfers between accounts with validation
- **Notification System**: Real-time notifications for account activities and transactions
- **Mail Services**: Email delivery system for user communications
- **Error Handling**: Consistent error propagation across all microservices


## Architecture

### System Architecture Diagram

```
┌─────────────┐     ┌─────────────┐      ┌─────────────┐
│   Client    │────▶│ NGINX Proxy │────▶│   Internet  │
│Application  │     │(Port 3000)  │      │             │
└─────────────┘     └─────────────┘      └─────────────┘
                           │
                           ▼
       ┌─────────────────────────────────────────────────────┐
       │                API Gateway                          │
       └─────────────────────────────────────────────────────┘
                           │
       ┌───────────────────┼───────────────────────────────┐
       │                   │                               │
       ▼                   ▼                               ▼
┌─────────────┐     ┌─────────────┐              ┌─────────────┐
│User Service │◀───▶│Account Svc │◀───────────▶│Transaction  │
│(Port 3001)  │     │(Port 3004)  │              │Service      │
└─────────────┘     └─────────────┘              │(Port 3005)  │
       │                   │                     └─────────────┘
       │                   │                           │
       ▼                   ▼                           ▼
┌─────────────┐      ┌─────────────┐              ┌─────────────┐
│Notification │◀───▶│ Mail Service│◀───────────▶│   MongoDB   │
│Service      │      │(Port 3002)  │              │  Database   │
│(Port 3003)  │      └─────────────┘              └─────────────┘
└─────────────┘
```

### Service Communication

- **Synchronous**: HTTP/REST APIs between services
- **Authentication**: JWT tokens for service-to-service communication
- **Error Handling**: Consistent error propagation across all services
- **Load Balancing**: NGINX reverse proxy with round-robin distribution

---


## Project Structure

The backend consists of the following microservices:

```
├── user-service/          # User authentication and management
├── account-service/       # Bank accounts and cards management
├── transaction-service/   # Financial transaction processing
├── notification-service/  # Real-time notifications
├── mail-service/         # Email delivery system
├── nginx/                # API Gateway for request routing
└── k8s/                  # Kubernetes deployment configurations
```

Each service is independently deployable and communicates through HTTP APIs, ensuring scalability and maintainability.

## How to Use with Docker Compose

### Prerequisites
- Docker and Docker Compose installed

### Development Environment
```bash
# Start all services in development mode
docker-compose -f docker-compose.dev.yml up

# Start services in detached mode
docker-compose -f docker-compose.dev.yml up -d

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

### Production Environment
```bash
# Start all services in production mode
docker-compose -f docker-compose.prod.yml up -d
```

The API Gateway will be available at `http://localhost:3000`

## How to Use with Kubernetes

### Prerequisites
- Kubernetes cluster running
- kubectl configured

### Deployment Steps
```bash
# Navigate to Kubernetes configurations
cd k8s

# Apply all Kubernetes manifests
kubectl apply -f .

# Check deployment status
kubectl get pods
kubectl get services

# Access the application through the configured ingress or service
```

For detailed Kubernetes setup instructions, refer to the configurations in the `k8s/` directory.

## API Reference

Complete API documentation with request/response examples and authentication details:

**[Postman API Documentation](https://documenter.getpostman.com/view/25674968/2sB2qUnQcK)**
