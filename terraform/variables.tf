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
  default     = "jeevansetu_secure_db_pass"
  description = "Database master password"
}

# Clerk credentials
variable "clerk_publishable_key" {
  type    = string
  default = "pk_test_ZW5hYmxlZC1tYXJ0aW4tMjAuY2xlcmsuYWNjb3VudHMuZGV2JA"
}

variable "clerk_secret_key" {
  type    = string
  default = "sk_test_J3WvsMwAIxinP3IPmc5UTdMtfflMREqdt9xE68VOlG"
}

variable "next_public_clerk_publishable_key" {
  type    = string
  default = "pk_test_ZW5hYmxlZC1tYXJ0aW4tMjAuY2xlcmsuYWNjb3VudHMuZGV2JA"
}

variable "acm_certificate_arn" {
  type        = string
  description = "The ARN of the ACM certificate created manually in the AWS Console"
  default     = ""
}

variable "gemini_api_key" {
  type    = string
  default = "AQ.Ab8RN6JZgwav71ETUXL5wS08gd8bwaIj-olmk9YD5lAUqT6v2w"
}

variable "pinecone_api_key" {
  type    = string
  default = "pcsk_5UV7Jv_KJAVWGteifTp3wjzUsXbWKLuteF57ErjKFvLoH7SHqb2ZYA3BqpTPJQvFGnszb1"
}

variable "pinecone_index" {
  type    = string
  default = "jeevansetu-guidelines"
}

variable "aws_access_key_id" {
  type    = string
  default = "AKIA4QZTLH7XP25SKBMK"
}

variable "aws_secret_access_key" {
  type    = string
  default = "+CD4KlIGcDsk5QZbKtnvVwBROgca2VZsh1xvIu0z"
}

variable "aws_s3_bucket" {
  type    = string
  default = "jeevansetu-documents"
}



