# Kubernetes Deployment Guide

This guide explains how to deploy the Instapay microservices application using Kubernetes configurations.

## What is Kubernetes?

Kubernetes is a container orchestration system that automates deployment, scaling, and management of containerized applications.

## Files Explanation

1. **Service Deployment Files**

   - **user-service-deployment.yaml** - Deploys the user service
   - **account-service-deployment.yaml** - Deploys the account service
   - **notification-service-deployment.yaml** - Deploys the notification service
   - **mail-service-deployment.yaml** - Deploys the mail service
   - **transaction-service-deployment.yaml** - Deploys the transaction service

2. **Service ConfigMap Files**

   - **user-service-configmap.yaml** - Configuration for the user service
   - **account-service-configmap.yaml** - Configuration for the account service
   - **notification-service-configmap.yaml** - Configuration for the notification service
   - **mail-service-configmap.yaml** - Configuration for the mail service
   - **transaction-service-configmap.yaml** - Configuration for the transaction service

3. **Ingress and Deployment Scripts**
   - **nginx-ingress.yaml** - Sets up routing rules for the Nginx Ingress Controller
   - **deploy-services.ps1** - PowerShell script to deploy all services to the instapay namespace
   - **NGINX_INGRESS_SETUP.md** - Documentation for setting up the Nginx Ingress Controller

## How to Deploy

### Prerequisites

- Kubernetes cluster (Minikube, Docker Desktop, or cloud-based solution like GKE, EKS, AKS)
- kubectl command-line tool
- Docker installed and running
- PowerShell (for Windows users)

### Option 1: Comprehensive Deployment with Nginx Ingress

Follow the step-by-step instructions in **NGINX_INGRESS_SETUP.md** for a complete deployment including:

- Installing the Nginx Ingress Controller
- Creating the instapay namespace
- Deploying all microservices
- Setting up routing rules
- Customizing the Nginx port (optional)

### Option 2: Using the Deployment Script

1. Create the instapay namespace:

   ```bash
   kubectl create namespace instapay
   ```

2. Run the deployment script:

   ```powershell
   ./k8s/deploy-services.ps1
   ```

3. Apply the Nginx Ingress configuration:

   ```bash
   kubectl apply -f k8s/nginx-ingress.yaml
   ```

### Option 3: Manual Deployment

1. Create namespace:

   ```bash
   kubectl create namespace instapay
   ```

2. Apply ConfigMaps:

   ```bash
   kubectl apply -f k8s/user-service-configmap.yaml -n instapay
   kubectl apply -f k8s/account-service-configmap.yaml -n instapay
   kubectl apply -f k8s/notification-service-configmap.yaml -n instapay
   kubectl apply -f k8s/mail-service-configmap.yaml -n instapay
   kubectl apply -f k8s/transaction-service-configmap.yaml -n instapay
   ```

3. Apply Deployments and Services:

   ```bash
   kubectl apply -f k8s/user-service-deployment.yaml -n instapay
   kubectl apply -f k8s/account-service-deployment.yaml -n instapay
   kubectl apply -f k8s/notification-service-deployment.yaml -n instapay
   kubectl apply -f k8s/mail-service-deployment.yaml -n instapay
   kubectl apply -f k8s/transaction-service-deployment.yaml -n instapay
   ```

4. Apply Nginx Ingress:

   ```bash
   kubectl apply -f k8s/nginx-ingress.yaml
   ```

## Accessing the Services

By default, all services are accessible through the Nginx Ingress Controller at:

- User Service: `http://localhost/user/`
- Auth Service: `http://localhost/auth/`
- Notification Service: `http://localhost/notification/`
- Account Service: `http://localhost/account/`
- Bank Service: `http://localhost/bank/`
- Transaction Service: `http://localhost/transaction/`

If you've changed the Nginx port to 3000, use:

- User Service: `http://localhost:3000/user/`
- Auth Service: `http://localhost:3000/auth/`
- Notification Service: `http://localhost:3000/notification/`
- Account Service: `http://localhost:3000/account/`
- Bank Service: `http://localhost:3000/bank/`
- Transaction Service: `http://localhost:3000/transaction/`

## Verifying Deployments

Check the status of your deployments:

```bash
kubectl get pods -n instapay
kubectl get services -n instapay
kubectl get ingress -n instapay
```

## Troubleshooting

If pods don't start:

```bash
kubectl describe pod [pod-name] -n instapay
kubectl logs [pod-name] -n instapay
```

If Ingress is not routing properly:

```bash
kubectl logs -n ingress-nginx deploy/ingress-nginx-controller
kubectl describe ingress instapay-ingress -n instapay
```

For more detailed troubleshooting, refer to the **NGINX_INGRESS_SETUP.md** document.

## Cleaning Up

To remove all resources:

```bash
kubectl delete -f k8s/nginx-ingress.yaml
kubectl delete namespace instapay
kubectl delete -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/cloud/deploy.yaml
```
