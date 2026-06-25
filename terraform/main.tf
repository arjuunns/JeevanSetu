terraform {
  required_version = ">= 1.0.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ==========================================
# ECR REPOSITORIES
# ==========================================

resource "aws_ecr_repository" "server" {
  name                 = "jeevansetu-server"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

resource "aws_ecr_repository" "web" {
  name                 = "jeevansetu-web"
  image_tag_mutability = "MUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
}

# ==========================================
# ECS CLUSTER
# ==========================================

resource "aws_ecs_cluster" "main" {
  name = "jeevansetu-cluster"
}

# ==========================================
# RDS POSTGRESQL DATABASE
# ==========================================

resource "aws_db_subnet_group" "db" {
  name       = "jeevansetu-db-subnet-group-v2"
  subnet_ids = var.subnet_ids
  tags = {
    Name = "JeevanSetu DB Subnet Group"
  }
}

resource "aws_db_instance" "postgres" {
  identifier             = "jeevansetu-postgres"
  allocated_storage      = 20
  max_allocated_storage  = 100
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t4g.micro"
  db_name                = "jeevansetu"
  username               = "jeevansetu"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.db.name
  vpc_security_group_ids = [var.rds_sg_id]
  skip_final_snapshot    = true
  publicly_accessible    = true # Allow easy connections for seeding
}

# ==========================================
# ELASTICACHE REDIS
# ==========================================

resource "aws_elasticache_subnet_group" "redis" {
  name       = "jeevansetu-redis-subnet-group"
  subnet_ids = var.subnet_ids
}

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "jeevansetu-redis"
  engine               = "redis"
  node_type            = "cache.t4g.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  security_group_ids   = [var.redis_sg_id]
  subnet_group_name    = aws_elasticache_subnet_group.redis.name
}

# ==========================================
# EC2 NEO4J CONTAINER HOST
# ==========================================

data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-202*-x86_64"]
  }
}

resource "aws_instance" "neo4j" {
  ami                         = data.aws_ami.al2023.id
  instance_type               = "t3.micro"
  subnet_id                   = var.subnet_ids[0]
  vpc_security_group_ids      = [var.neo4j_sg_id]
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              yum install -y docker
              systemctl start docker
              systemctl enable docker
              docker run -d \
                --name neo4j \
                --restart always \
                -p 7474:7474 -p 7687:7687 \
                -e NEO4J_AUTH=neo4j/jeevansetu \
                neo4j:5-community
              EOF

  tags = {
    Name = "JeevanSetu-Neo4j"
  }
}

resource "aws_eip" "neo4j" {
  instance = aws_instance.neo4j.id
  domain   = "vpc"
  tags = {
    Name = "jeevansetu-neo4j-eip"
  }
}

# ==========================================
# APPLICATION LOAD BALANCER (ALB)
# ==========================================

resource "aws_lb" "main" {
  name               = "jeevansetu-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.alb_sg_id]
  subnets            = var.subnet_ids
}

# Web (Frontend) Target Group
resource "aws_lb_target_group" "web" {
  name        = "jeevansetu-web-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }
}

# Server (Backend) Target Group
resource "aws_lb_target_group" "server" {
  name        = "jeevansetu-server-tg"
  port        = 4000
  protocol    = "HTTP"
  vpc_id      = var.vpc_id
  target_type = "ip"

  health_check {
    path                = "/api/v1/health"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
    matcher             = "200-399"
  }
}

# HTTP Web Listener (Port 80) -> Redirect to HTTPS (Port 443)
resource "aws_lb_listener" "web" {
  load_balancer_arn = aws_lb.main.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# HTTP Server Listener (Port 4000) -> Target Server (4000)
resource "aws_lb_listener" "server" {
  load_balancer_arn = aws_lb.main.arn
  port              = "4000"
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.server.arn
  }
}

# SSL Certificate via AWS ACM
resource "aws_acm_certificate" "cert" {
  domain_name       = "jeevansetu.arjuns.xyz"
  validation_method = "DNS"

  tags = {
    Name = "jeevansetu-cert"
  }

  lifecycle {
    create_before_destroy = true
  }
}

# HTTPS listener on Port 443
resource "aws_lb_listener" "web_https" {
  load_balancer_arn = aws_lb.main.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate.cert.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web.arn
  }
}




# ==========================================
# IAM ROLES FOR ECS
# ==========================================

resource "aws_iam_role" "ecs_execution" {
  name = "jeevansetu-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# ==========================================
# ECS TASK DEFINITIONS & SERVICES
# ==========================================

resource "aws_ecs_task_definition" "server" {
  family                   = "jeevansetu-server"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name      = "jeevansetu-server"
      image     = "${aws_ecr_repository.server.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 4000
          hostPort      = 4000
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "4000" },
        { name = "DATABASE_URL", value = "postgresql://jeevansetu:${var.db_password}@${aws_db_instance.postgres.endpoint}/jeevansetu?schema=public" },
        { name = "REDIS_URL", value = "redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:6379" },
        { name = "NEO4J_URI", value = "bolt://${aws_eip.neo4j.public_ip}:7687" },
        { name = "NEO4J_USER", value = "neo4j" },
        { name = "NEO4J_PASSWORD", value = "jeevansetu" },
        { name = "CLERK_PUBLISHABLE_KEY", value = var.clerk_publishable_key },
        { name = "CLERK_SECRET_KEY", value = var.clerk_secret_key },
        { name = "AUTH_DISABLED", value = "true" },
        { name = "GEMINI_API_KEY", value = var.gemini_api_key },
        { name = "GEMINI_TRIAGE_MODEL", value = "gemini-2.5-flash" },
        { name = "PINECONE_API_KEY", value = var.pinecone_api_key },
        { name = "PINECONE_INDEX", value = var.pinecone_index },
        { name = "AWS_ACCESS_KEY_ID", value = var.aws_access_key_id },
        { name = "AWS_SECRET_ACCESS_KEY", value = var.aws_secret_access_key },
        { name = "AWS_REGION", value = var.aws_region },
        { name = "AWS_S3_BUCKET", value = var.aws_s3_bucket }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/jeevansetu"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "server"
        }
      }
    }
  ])
}

resource "aws_ecs_task_definition" "web" {
  family                   = "jeevansetu-web"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "256"
  memory                   = "512"
  execution_role_arn       = aws_iam_role.ecs_execution.arn

  container_definitions = jsonencode([
    {
      name      = "jeevansetu-web"
      image     = "${aws_ecr_repository.web.repository_url}:latest"
      essential = true
      portMappings = [
        {
          containerPort = 3000
          hostPort      = 3000
        }
      ]
      environment = [
        { name = "NODE_ENV", value = "production" },
        { name = "PORT", value = "3000" },
        { name = "NEXT_PUBLIC_API_URL", value = "http://${aws_lb.main.dns_name}:4000" },
        { name = "API_URL", value = "http://${aws_lb.main.dns_name}:4000" },
        { name = "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", value = var.next_public_clerk_publishable_key },
        { name = "CLERK_SECRET_KEY", value = var.clerk_secret_key }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = "/ecs/jeevansetu"
          "awslogs-region"        = var.aws_region
          "awslogs-stream-prefix" = "web"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "server" {
  name            = "jeevansetu-server-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.server.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.server.arn
    container_name   = "jeevansetu-server"
    container_port   = 4000
  }

  depends_on = [aws_lb_listener.server]
}

resource "aws_ecs_service" "web" {
  name            = "jeevansetu-web-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.web.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = [var.ecs_sg_id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.web.arn
    container_name   = "jeevansetu-web"
    container_port   = 3000
  }

  depends_on = [aws_lb_listener.web]
}
