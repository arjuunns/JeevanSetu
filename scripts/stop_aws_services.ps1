# PowerShell Script to Stop JeevanSetu AWS Services
Write-Host "Stopping JeevanSetu AWS services to minimize billing..." -ForegroundColor Yellow

# 1. Scale down ECS Fargate services to 0
Write-Host "Scaling down ECS services to 0 tasks..." -ForegroundColor Cyan
aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-server-service --desired-count 0
aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-web-service --desired-count 0

# 2. Stop Neo4j EC2 Host
Write-Host "Finding Neo4j EC2 host instance ID..." -ForegroundColor Cyan
$instanceId = aws ec2 describe-instances `
    --filters "Name=tag:Name,Values=JeevanSetu-Neo4j" "Name=instance-state-name,Values=running" `
    --query "Reservations[*].Instances[*].InstanceId" --output text

if ($instanceId) {
    Write-Host "Stopping Neo4j EC2 instance ($instanceId)..." -ForegroundColor Cyan
    aws ec2 stop-instances --instance-ids $instanceId
} else {
    Write-Host "No active Neo4j EC2 host found." -ForegroundColor Yellow
}

# 3. Stop RDS Postgres
Write-Host "Stopping RDS Postgres Database (jeevansetu-postgres)..." -ForegroundColor Cyan
aws rds stop-db-instance --db-instance-identifier jeevansetu-postgres

Write-Host "All compute services have been stopped. Database files are preserved." -ForegroundColor Green
