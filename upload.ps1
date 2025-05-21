$services = @("user-service", "notification-service", "account-service", "transaction-service", "mail-service")

$username = "youseftaha11"


foreach ($service in $services) {
    Write-Host "Processing $service..."

    Set-Location $service

    docker build -t "$username/mini-instapay:$service" .

    docker push "$username/mini-instapay:$service"

    Set-Location ..
}

Write-Host "`n✅ All images have been uploaded successfully!"
