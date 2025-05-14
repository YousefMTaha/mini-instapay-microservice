# Nginx Ingress Controller Setup for Instapay Project

This document outlines the steps to set up and configure the Nginx Ingress Controller for accessing microservices in the Instapay project.

## Prerequisites

- Kubernetes cluster (e.g., Docker Desktop, Minikube, or cloud provider)
- kubectl CLI tool installed
- PowerShell or Command Prompt

## Installation Steps

### 1. Install Nginx Ingress Controller

```powershell
# Install Nginx Ingress Controller
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml

# Wait for the Ingress Controller to be ready
kubectl wait --namespace ingress-nginx --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=120s
```

### 2. Deploy Services to the Instapay Namespace

```powershell
# Create the instapay namespace if it doesn't exist
kubectl create namespace instapay

# Run the deployment script to deploy all services to the instapay namespace
./k8s/deploy-services.ps1
```

### 3. Configure Ingress for Routing

```powershell
# Apply the Nginx Ingress configuration
kubectl apply -f k8s/nginx-ingress.yaml
```

### 4. Change Nginx Ingress Controller Port (Optional)

If you want to use port 3000 instead of the default port 80:

```powershell
# Change the port from 80 to 3000
kubectl patch service ingress-nginx-controller -n ingress-nginx --type='json' -p='[{"op": "replace", "path": "/spec/ports/0/port", "value":3000}]'

# Verify the port change
kubectl get service ingress-nginx-controller -n ingress-nginx
```

## Accessing Your Services

### Default Configuration (Port 80)

- User Service: `http://localhost/user/`
- Auth Service: `http://localhost/auth/`
- Notification Service: `http://localhost/notification/`
- Account Service: `http://localhost/account/`
- Bank Service: `http://localhost/bank/`
- Transaction Service: `http://localhost/transaction/`

### With Custom Port (e.g., Port 3000)

- User Service: `http://localhost:3000/user/`
- Auth Service: `http://localhost:3000/auth/`
- Notification Service: `http://localhost:3000/notification/`
- Account Service: `http://localhost:3000/account/`
- Bank Service: `http://localhost:3000/bank/`
- Transaction Service: `http://localhost:3000/transaction/`

## Troubleshooting

### Check if Ingress Controller is Running

```powershell
kubectl get pods -n ingress-nginx
```

### Check Ingress Configuration

```powershell
kubectl describe ingress instapay-ingress -n instapay
```

### Check Service Endpoints

```powershell
kubectl get endpoints -n instapay
```

### View Ingress Controller Logs

```powershell
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller | Select-Object -Last 20
```

### Common Issues

1. **Services unavailable**: Make sure all pods are running in the instapay namespace.
2. **404 errors**: Verify that the paths in the ingress configuration match your service endpoints.
3. **Connection refused**: Ensure the Nginx Ingress Controller is running and the port is correctly configured.

## Clean-up

To remove all resources:

```powershell
# Delete the ingress
kubectl delete -f k8s/nginx-ingress.yaml

# Delete all services and deployments in the instapay namespace
kubectl delete namespace instapay

# Delete the Nginx Ingress Controller
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```
