#!/bin/bash
# Bash Script to Stop JeevanSetu AWS Services
echo "Stopping JeevanSetu AWS services to minimize billing..."

# 1. Scale down ECS Fargate services to 0
echo "Scaling down ECS services to 0 tasks..."
aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-server-service --desired-count 0
aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-web-service --desired-count 0

# 2. Stop Neo4j EC2 Host
echo "Finding Neo4j EC2 host instance ID..."
instanceId=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=JeevanSetu-Neo4j" "Name=instance-state-name,Values=running" \
    --query "Reservations[*].Instances[*].InstanceId" --output text)

if [ -n "$instanceId" ]; then
    echo "Stopping Neo4j EC2 instance ($instanceId)..."
    aws ec2 stop-instances --instance-ids "$instanceId"
else
    echo "No active Neo4j EC2 host found."
fi

# 3. Stop RDS Postgres
echo "Stopping RDS Postgres Database (jeevansetu-postgres)..."
aws rds stop-db-instance --db-instance-identifier jeevansetu-postgres

echo "All compute services have been stopped. Database files are preserved."
