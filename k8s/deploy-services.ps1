# Set the target namespace
$namespace = "instapay"

# ConfigMap files
$configMapFiles = @(
    "k8s/user-service-configmap.yaml",
    "k8s/account-service-configmap.yaml",
    "k8s/notification-service-configmap.yaml",
    "k8s/mail-service-configmap.yaml",
    "k8s/transaction-service-configmap.yaml"
)

# Deployment files
$deploymentFiles = @(
    "k8s/user-service-deployment.yaml",
    "k8s/account-service-deployment.yaml",
    "k8s/notification-service-deployment.yaml",
    "k8s/mail-service-deployment.yaml",
    "k8s/transaction-service-deployment.yaml"
)

# Apply ConfigMaps first
foreach ($file in $configMapFiles) {
    Write-Host "Applying $file to namespace $namespace..."
    kubectl apply -f $file --namespace $namespace
}

# Then apply Deployments
foreach ($file in $deploymentFiles) {
    Write-Host "Applying $file to namespace $namespace..."
    kubectl apply -f $file --namespace $namespace
}
