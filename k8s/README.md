# Kubernetes Deployment Guide

## Overview

This guide provides step-by-step instructions to deploy InstaPayApp microservices on Kubernetes with proper networking and ingress configuration.

## Prerequisites

- **Kubernetes Cluster**: Minikube, Docker Desktop, or cloud provider (GKE, EKS, AKS)
- **kubectl**: Configured to connect to your cluster
- **Docker**: For image building (if needed)
- **PowerShell**: For Windows users (deployment script)

## Quick Deployment

### 1. Create Namespace
```bash
kubectl create namespace instapay
```

### 2. Deploy All Services
```bash
# Navigate to k8s directory
cd k8s

# Run deployment script (Windows)
./deploy-services.ps1

# OR Manual deployment (Linux/Mac)
kubectl apply -f *-configmap.yaml -n instapay
kubectl apply -f *-deployment.yaml -n instapay
```

### 3. Setup Ingress Controller
```bash
# Install NGINX Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Apply application ingress rules
kubectl apply -f nginx-ingress.yaml
```

### 4. Verify Deployment
```bash
# Check pod status
kubectl get pods -n instapay

# Check services
kubectl get services -n instapay

# Check ingress
kubectl get ingress -n instapay
```

## Accessing Services

Once deployed, services are accessible through:

| Service | URL |
|---------|-----|
| User Service | `http://localhost/user/` |
| Auth Service | `http://localhost/auth/` |
| Account Service | `http://localhost/account/` |
| Bank Service | `http://localhost/bank/` |
| Transaction Service | `http://localhost/transaction/` |
| Notification Service | `http://localhost/notification/` |

## Configuration Files

### Service Deployments
- `user-service-deployment.yaml` - User authentication service
- `account-service-deployment.yaml` - Account management service  
- `transaction-service-deployment.yaml` - Payment processing service
- `notification-service-deployment.yaml` - Real-time notifications
- `mail-service-deployment.yaml` - Email delivery service

### Configuration Maps
- `*-configmap.yaml` - Environment variables for each service

### Networking
- `nginx-ingress.yaml` - Ingress rules for request routing

## Troubleshooting

### Pods Not Starting
```bash
# Check pod details
kubectl describe pod <pod-name> -n instapay

# View logs
kubectl logs <pod-name> -n instapay

# Check resource usage
kubectl top pods -n instapay
```

### Service Connection Issues
```bash
# Test service connectivity
kubectl port-forward service/<service-name> 8080:3000 -n instapay

# Check service endpoints
kubectl get endpoints -n instapay
```

### Ingress Not Working
```bash
# Check ingress controller status
kubectl get pods -n ingress-nginx

# View ingress controller logs
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller

# Verify ingress configuration
kubectl describe ingress instapay-ingress -n instapay
```

### Database Connection
If services can't connect to MongoDB:
```bash
# Check if MongoDB is accessible from pods
kubectl exec -it <pod-name> -n instapay -- nslookup mongodb-service

# Verify environment variables
kubectl exec -it <pod-name> -n instapay -- env | grep DB
```

## Scaling Services

Scale individual services based on load:
```bash
# Scale user service to 3 replicas
kubectl scale deployment user-service --replicas=3 -n instapay

# Auto-scale based on CPU usage
kubectl autoscale deployment user-service --cpu-percent=70 --min=1 --max=5 -n instapay
```

## Cleanup

Remove all deployed resources:
```bash
# Delete namespace (removes all resources)
kubectl delete namespace instapay

# Remove ingress controller
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```

## Production Considerations

For production deployments:

1. **Resource Limits**: Set appropriate CPU/memory limits in deployment files
2. **Persistent Storage**: Configure MongoDB with persistent volumes
3. **Secrets Management**: Use Kubernetes secrets for sensitive data
4. **Health Checks**: Configure readiness and liveness probes
5. **Monitoring**: Implement logging and monitoring solutions
6. **TLS**: Configure HTTPS with proper certificates

---

**🔙 [Back to Main Documentation](../README.md)** 