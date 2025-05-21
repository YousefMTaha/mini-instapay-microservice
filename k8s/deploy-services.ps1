# Set the target namespace
$namespace = "instapay"

# ConfigMap files
$configMapFiles = @(
    "user-service-configmap.yaml",
    "account-service-configmap.yaml",
    "notification-service-configmap.yaml",
    "mail-service-configmap.yaml",
    "transaction-service-configmap.yaml"
)

# Deployment files
$deploymentFiles = @(
    "user-service-deployment.yaml",
    "account-service-deployment.yaml",
    "notification-service-deployment.yaml",
    "mail-service-deployment.yaml",
    "transaction-service-deployment.yaml"
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
