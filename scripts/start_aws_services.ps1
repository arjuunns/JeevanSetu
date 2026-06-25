# PowerShell Script to Start JeevanSetu AWS Services
Write-Host "Starting JeevanSetu AWS services for the demo..." -ForegroundColor Yellow

# 1. Start RDS Postgres
Write-Host "Starting RDS Postgres Database (jeevansetu-postgres)..." -ForegroundColor Cyan
aws rds start-db-instance --db-instance-identifier jeevansetu-postgres

# 2. Start Neo4j EC2 Host
Write-Host "Finding Neo4j EC2 host instance ID..." -ForegroundColor Cyan
$instanceId = aws ec2 describe-instances `
    --filters "Name=tag:Name,Values=JeevanSetu-Neo4j" "Name=instance-state-name,Values=stopped" `
    --query "Reservations[*].Instances[*].InstanceId" --output text

if ($instanceId) {
    Write-Host "Starting Neo4j EC2 instance ($instanceId)..." -ForegroundColor Cyan
    aws ec2 start-instances --instance-ids $instanceId
} else {
    Write-Host "Neo4j EC2 instance is already running or not found." -ForegroundColor Yellow
}

# 3. Wait for database and EC2 to become available
Write-Host "Waiting for database and compute instances to start up before scaling ECS..." -ForegroundColor Cyan

# Poll RDS status until it's available (timeout after 5 minutes)
$timeout = 300
$interval = 15
$elapsed = 0
$dbReady = $false

while ($elapsed -lt $timeout) {
    $dbStatus = aws rds describe-db-instances --db-instance-identifier jeevansetu-postgres --query "DBInstances[0].DBInstanceStatus" --output text
    Write-Host "RDS Postgres status: $dbStatus" -ForegroundColor Yellow
    if ($dbStatus -eq "available") {
        $dbReady = $true
        break
    }
    Start-Sleep -Seconds $interval
    $elapsed += $interval
}

if (-not $dbReady) {
    Write-Warning "RDS Postgres is not available yet, scaling ECS anyway. Note: services might fail to start if DB is not available."
}

# 4. Scale up ECS Fargate services to 1 task
Write-Host "Scaling up ECS services to 1 task..." -ForegroundColor Cyan
aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-server-service --desired-count 1
aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-web-service --desired-count 1

Write-Host "All services started. Wait a minute for the ECS Fargate tasks to register with the Application Load Balancer." -ForegroundColor Green
