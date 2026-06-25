#!/bin/bash
# Bash Script to Start JeevanSetu AWS Services
echo "Starting JeevanSetu AWS services for the demo..."

# 1. Start RDS Postgres
echo "Starting RDS Postgres Database (jeevansetu-postgres)..."
aws rds start-db-instance --db-instance-identifier jeevansetu-postgres

# 2. Start Neo4j EC2 Host
echo "Finding Neo4j EC2 host instance ID..."
instanceId=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=JeevanSetu-Neo4j" "Name=instance-state-name,Values=stopped" \
    --query "Reservations[*].Instances[*].InstanceId" --output text)

if [ -n "$instanceId" ]; then
    echo "Starting Neo4j EC2 instance ($instanceId)..."
    aws ec2 start-instances --instance-ids "$instanceId"
else
    echo "Neo4j EC2 instance is already running or not found."
fi

# 3. Wait for database and EC2 to become available
echo "Waiting for database to start up before scaling ECS..."
timeout=300
interval=15
elapsed=0
dbReady=false

while [ $elapsed -lt $timeout ]; do
    dbStatus=$(aws rds describe-db-instances --db-instance-identifier jeevansetu-postgres --query "DBInstances[0].DBInstanceStatus" --output text)
    echo "RDS Postgres status: $dbStatus"
    if [ "$dbStatus" = "available" ]; then
        dbReady=true
        break
    fi
    sleep $interval
    elapsed=$((elapsed + interval))
done

if [ "$dbReady" = false ]; then
    echo "Warning: RDS Postgres is not available yet, scaling ECS anyway. Services might fail to start if DB is not ready."
fi

# 4. Scale up ECS Fargate services to 1 task
echo "Scaling up ECS services to 1 task..."
aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-server-service --desired-count 1
aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-web-service --desired-count 1

echo "All services started. Wait a minute for the ECS Fargate tasks to register with the Application Load Balancer."
