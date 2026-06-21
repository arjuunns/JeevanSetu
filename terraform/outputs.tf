output "alb_dns_name" {
  value       = aws_lb.main.dns_name
  description = "The public DNS name of the Load Balancer"
}

output "postgres_endpoint" {
  value       = aws_db_instance.postgres.endpoint
  description = "The endpoint of the RDS PostgreSQL instance"
}

output "redis_endpoint" {
  value       = aws_elasticache_cluster.redis.cache_nodes[0].address
  description = "The hostname of the ElastiCache Redis cluster"
}

output "neo4j_public_ip" {
  value       = aws_instance.neo4j.public_ip
  description = "The public IP address of the Neo4j host"
}

output "server_ecr_url" {
  value       = aws_ecr_repository.server.repository_url
  description = "The URL of the ECR repository for the backend server"
}

output "web_ecr_url" {
  value       = aws_ecr_repository.web.repository_url
  description = "The URL of the ECR repository for the Next.js web app"
}
