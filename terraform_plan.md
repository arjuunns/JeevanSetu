# Implementation Plan - AWS Infrastructure Provisioning via Terraform

Provision the AWS infrastructure required for the JeevanSetu platform using Terraform. To prevent duplicate networking layers and maintain compatibility, the plan will reuse the existing VPC (`JeevanSetu-VPC`), public subnets, and security groups that are already present in the AWS account.

## User Review Required

> [!IMPORTANT]
> **Reused Resources**: We will reuse the existing VPC `vpc-0c0b2fbde699e6d61`, subnets (`subnet-0f2a4f9f5c0ba957c`, `subnet-022fafd85675255c1`), and security groups (`JeevanSetu-ECS-SG`, `JeevanSetu-RDS-SG`, `JeevanSetu-Redis-SG`, `JeevanSetu-Neo4j-SG`).
>
> **Missing Inputs**: The database password, Clerk keys, and domain/DNS configuration should be provided.

## Proposed Changes

We will create a new directory `terraform/` containing the Terraform configuration files.

### Lifecycle Management (Spin Up / Stop Services)

Terraform allows you to manage the entire lifecycle of your infrastructure with single commands:
- **To Deploy / Restart All Services**:
  ```bash
  terraform apply -auto-approve
  ```
  This will provision or restart all the AWS resources (ECR, RDS database, ElastiCache cluster, EC2 instance, ECS tasks/services, and Load Balancer) in a single run.
- **To Completely Tear Down (Destroy) Everything**:
  ```bash
  terraform destroy -auto-approve
  ```
  This will completely delete all provisioned resources to stop all AWS billing (Warning: this deletes database data).
- **To Temporarily Pause/Stop Services (Preserving Database Data)**:
  To stop active running resources and save on compute costs without deleting database or graph data, you can run these AWS CLI commands:
  1. Scale down ECS Fargate tasks to 0:
     ```bash
     aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-server-service --desired-count 0
     aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-web-service --desired-count 0
     ```
  2. Stop the Neo4j EC2 instance:
     ```bash
     # (Look up the Instance ID from output or AWS Console)
     aws ec2 stop-instances --instance-ids <NEO4J_INSTANCE_ID>
     ```
  3. Stop the RDS Postgres instance:
     ```bash
     aws rds stop-db-instance --db-instance-identifier jeevansetu-postgres
     ```
  
  *To resume paused services:*
  1. Start RDS database:
     ```bash
     aws rds start-db-instance --db-instance-identifier jeevansetu-postgres
     ```
  2. Start Neo4j EC2 instance:
     ```bash
     aws ec2 start-instances --instance-ids <NEO4J_INSTANCE_ID>
     ```
  3. Scale ECS Fargate tasks back to 1:
     ```bash
     aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-server-service --desired-count 1
     aws ecs update-service --cluster jeevansetu-cluster --service jeevansetu-web-service --desired-count 1
     ```

### Infrastructure

#### [NEW] [main.tf](file:///c:/Users/singh/OneDrive/Desktop/JeevanSetu/terraform/main.tf)
Defines the Terraform providers, resources (ECR, RDS PostgreSQL, ElastiCache Redis, EC2 for Neo4j, ECS Cluster, ALB, Target Groups, ECS Task Definitions, and Services).

#### [NEW] [variables.tf](file:///c:/Users/singh/OneDrive/Desktop/JeevanSetu/terraform/variables.tf)
Declares variables for region, existing resource IDs, database credentials, domain name, and API keys.

#### [NEW] [outputs.tf](file:///c:/Users/singh/OneDrive/Desktop/JeevanSetu/terraform/outputs.tf)
Defines outputs for database host, Redis endpoint, Neo4j IP, and ALB DNS name.

## Verification Plan

### Automated Steps
- Run `terraform init` to initialize the directory and download providers.
- Run `terraform plan` to verify resource creation.
- Run `terraform apply` to provision the resources.

### Manual Verification
- Verify ECR repositories are present.
- Verify RDS PostgreSQL and ElastiCache Redis instances are running.
- Verify EC2 instance is created for Neo4j.
- Verify ECS services are active.
