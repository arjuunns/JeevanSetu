variable "aws_region" {
  type        = string
  default     = "ap-south-1"
  description = "AWS region to deploy resources"
}

variable "vpc_id" {
  type        = string
  default     = "vpc-0c0b2fbde699e6d61"
  description = "ID of the existing JeevanSetu-VPC"
}

variable "subnet_ids" {
  type        = list(string)
  default     = ["subnet-0f2a4f9f5c0ba957c", "subnet-022fafd85675255c1"]
  description = "IDs of the existing public subnets"
}

variable "ecs_sg_id" {
  type        = string
  default     = "sg-06af3877d3f771398"
  description = "Security Group ID for ECS tasks"
}

variable "alb_sg_id" {
  type        = string
  default     = "sg-07b800120349ac0b3"
  description = "Security Group ID for the Application Load Balancer"
}

variable "rds_sg_id" {
  type        = string
  default     = "sg-06eb163ea351ce82d"
  description = "Security Group ID for RDS Postgres database"
}

variable "redis_sg_id" {
  type        = string
  default     = "sg-0443289d920aa2e35"
  description = "Security Group ID for ElastiCache Redis"
}

variable "neo4j_sg_id" {
  type        = string
  default     = "sg-0d6e3f22eee650ad1"
  description = "Security Group ID for Neo4j EC2 instance"
}

variable "db_password" {
  type        = string
  sensitive   = true
  description = "Database master password"
}

# Clerk credentials
variable "clerk_publishable_key" {
  type        = string
  description = "Clerk publishable key"
}

variable "clerk_secret_key" {
  type        = string
  sensitive   = true
  description = "Clerk secret key"
}

variable "next_public_clerk_publishable_key" {
  type        = string
  description = "Next.js Clerk publishable key"
}

variable "acm_certificate_arn" {
  type        = string
  description = "The ARN of the ACM certificate created manually in the AWS Console"
  default     = ""
}

variable "gemini_api_key" {
  type        = string
  sensitive   = true
  description = "Gemini API key"
}

variable "pinecone_api_key" {
  type        = string
  sensitive   = true
  description = "Pinecone API key"
}

variable "pinecone_index" {
  type        = string
  default     = "jeevansetu-guidelines"
  description = "Pinecone index name"
}

variable "aws_access_key_id" {
  type        = string
  sensitive   = true
  description = "AWS Access Key ID"
}

variable "aws_secret_access_key" {
  type        = string
  sensitive   = true
  description = "AWS Secret Access Key"
}

variable "aws_s3_bucket" {
  type        = string
  default     = "jeevansetu-documents"
  description = "AWS S3 bucket name"
}
