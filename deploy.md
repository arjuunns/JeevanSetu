# AWS Deployment Plan - JeevanSetu

This document outlines the architecture and step-by-step AWS CLI commands to deploy the entire JeevanSetu platform onto AWS.

## Architecture

We will deploy the platform using the following AWS services:
1. **Amazon ECS (Fargate)**:
   - Run the Backend API Server (`@jeevansetu/server`).
   - Run the Frontend Next.js Web App (`@jeevansetu/web`) in SSR mode.
2. **Amazon RDS (PostgreSQL)**:
   - Managed PostgreSQL database for primary application data.
3. **Amazon ElastiCache (Redis)**:
   - Managed Redis for caching and socket connection tracking.
4. **Amazon EC2**:
   - Run Neo4j Community Edition (with APOC plugin) in a self-hosted Docker container (to avoid Neo4j Enterprise license costs on AWS).
5. **Amazon S3**:
   - Document storage (PDFs, referrals, QR codes).
6. **Amazon CloudFront / ALB**:
   - Application Load Balancer (ALB) to route traffic to the ECS services.
   - CloudFront CDN optional but ALB is required for HTTP/HTTPS routing.

---

## Required Credentials & Keys

Before starting, please provide or confirm the following credentials. Some are already populated in your `.env`, while others are missing:

### 1. Clerk Authentication (Required - Missing)
We need the production Clerk keys:
- `CLERK_PUBLISHABLE_KEY`: ____________________
- `CLERK_SECRET_KEY`: ____________________
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: ____________________

### 2. AWS Profile/Credentials (Required - Present)
We will use the credentials present in your `.env` (or configure them via `aws configure`):
- `AWS_ACCESS_KEY_ID` (present in `.env`)
- `AWS_SECRET_ACCESS_KEY` (present in `.env`)
- `AWS_REGION` (default is `ap-south-1`)

### 3. External API Keys (Optional - Present in `.env`)
We will use the following keys unless you want to update them:
- **Gemini API Key**: `AQ.Ab8RN6JC1...`
- **Pinecone API Key**: `pcsk_5UV7Jv_...`
- **Resend API Key**: `re_ccC9hXX4...`
- **Twilio Credentials**: `US3d4868936...`

---

## Deployment Steps (AWS CLI)

Below is the step-by-step blueprint of commands that will be executed.

### Phase 1: ECR Repositories & Docker Image Builds
1. Create ECR repositories for the server and web applications.
2. Build, tag, and push the Docker images.

```bash
# 1. Login to AWS ECR
aws ecr get-login-password --region <REGION> | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com

# 2. Create Repositories
aws ecr create-repository --repository-name jeevansetu-server
aws ecr create-repository --repository-name jeevansetu-web

# 3. Build and Push Server
docker build -t jeevansetu-server -f docker/Dockerfile.server .
docker tag jeevansetu-server:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/jeevansetu-server:latest
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/jeevansetu-server:latest

# 4. Build and Push Web
docker build -t jeevansetu-web -f docker/Dockerfile.web .
docker tag jeevansetu-web:latest <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/jeevansetu-web:latest
docker push <ACCOUNT_ID>.dkr.ecr.<REGION>.amazonaws.com/jeevansetu-web:latest
```

### Phase 2: VPC & Networking Setup
1. Create a VPC with public and private subnets.
2. Create Security Groups for ALB, ECS tasks, RDS, Redis, and EC2 (Neo4j).

### Phase 3: Provision Database Services
1. **Amazon RDS (PostgreSQL)**:
   ```bash
   aws rds create-db-instance \
       --db-instance-identifier jeevansetu-postgres \
       --db-instance-class db.t4g.micro \
       --engine postgres \
       --master-username jeevansetu \
       --master-user-password <CHOOSE_DB_PASSWORD> \
       --allocated-storage 20 \
       --vpc-security-group-ids <RDS_SG_ID> \
       --db-subnet-group-name <SUBNET_GROUP>
   ```
2. **Amazon ElastiCache (Redis)**:
   ```bash
   aws elasticache create-cache-cluster \
       --cache-cluster-id jeevansetu-redis \
       --engine redis \
       --cache-node-type cache.t4g.micro \
       --num-cache-nodes 1 \
       --security-group-ids <REDIS_SG_ID>
   ```
3. **EC2 Instance (Neo4j)**:
   Launch a t4g.micro instance, install Docker, and start Neo4j with APOC plugins:
   ```bash
   aws ec2 run-instances ...
   ```

### Phase 4: ECS Cluster & Service Configurations
1. Create ECS Cluster:
   ```bash
   aws ecs create-cluster --cluster-name jeevansetu-cluster
   ```
2. Define and register task definitions for `jeevansetu-server` and `jeevansetu-web` (passing environment variables).
3. Create the Application Load Balancer (ALB) and target groups.
4. Launch ECS Fargate services for backend and frontend.

---

Please review this plan and provide the **Clerk keys** or any preferences before we begin execution.
