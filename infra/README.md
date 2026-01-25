# Infrastructure

Thư mục này chứa các configuration files và scripts cho infrastructure của Deskio platform.

## Cấu trúc

```
infra/
├── docker-compose.yml    # Development infrastructure setup
├── k8s/                  # Kubernetes manifests cho staging/production
└── local/                # Local development scripts và configs (nếu có)
```

---

## Docker Compose (Development)

File `docker-compose.yml` setup toàn bộ infrastructure dependencies cần thiết cho local development.

### Services

#### 1. PostgreSQL

**Image:** `postgres:16`  
**Container:** `deskio-postgres`  
**Port:** `5432`

**Mục đích:**

- Primary database cho tất cả services
- Lưu trữ users, workspaces, tickets, KB articles, etc.

**Credentials:**

- User: `deskio`
- Password: `deskio`
- Database: `deskio`

**Volume:** `deskio_pg_data` (persistent data storage)

**Connection String:**

```
postgresql://deskio:deskio@localhost:5432/deskio
```

---

#### 2. Redis

**Image:** `redis:7`  
**Container:** `deskio-redis`  
**Port:** `6379`

**Mục đích:**

- Message queue (BullMQ) cho notification worker
- Caching layer cho services
- Session storage (optional)
- Rate limiting (future)

**Configuration:**

- AOF (Append Only File) enabled cho persistence
- Volume: `deskio_redis_data`

**Connection:**

```
redis://localhost:6379
```

---

#### 3. MinIO

**Image:** `minio/minio:latest`  
**Container:** `deskio-minio`  
**Ports:**

- `9000`: S3-compatible API
- `9001`: Web Console

**Mục đích:**

- Object storage cho file attachments
- S3-compatible API (easy migration to AWS S3)
- Local development replacement cho cloud storage

**Credentials:**

- Access Key: `minioadmin`
- Secret Key: `minioadmin`

**Console:** http://localhost:9001  
**API Endpoint:** http://localhost:9000

**Volume:** `deskio_minio_data`

**Setup sau khi start:**

```bash
# Create bucket cho Deskio
# Có thể làm qua Console UI hoặc CLI:
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/deskio
mc policy set public local/deskio
```

---

## Usage

### Start Infrastructure

```bash
# Từ root của project
pnpm dev:infra

# Hoặc trực tiếp
docker compose -f infra/docker-compose.yml up -d
```

**Flags:**

- `-d`: Detached mode (chạy background)
- `--build`: Force rebuild images
- `--force-recreate`: Recreate containers

### Stop Infrastructure

```bash
pnpm down:infra

# Hoặc
docker compose -f infra/docker-compose.yml down
```

### View Logs

```bash
# Tất cả services
docker compose -f infra/docker-compose.yml logs -f

# Specific service
docker compose -f infra/docker-compose.yml logs -f postgres
docker compose -f infra/docker-compose.yml logs -f redis
docker compose -f infra/docker-compose.yml logs -f minio
```

### Check Status

```bash
docker compose -f infra/docker-compose.yml ps
```

### Clean Up (Remove volumes)

```bash
# Stop và xóa containers + volumes
docker compose -f infra/docker-compose.yml down -v

# ⚠️ Warning: Sẽ xóa toàn bộ data trong database, redis, và minio
```

---

## Tham khao (external)

De dev moi doc them ve Docker va Docker Compose:

- Docker Desktop install: https://docs.docker.com/desktop/
- Docker Compose overview: https://docs.docker.com/compose/
- docker compose up: https://docs.docker.com/engine/reference/commandline/compose_up/
- docker compose down: https://docs.docker.com/engine/reference/commandline/compose_down/

---

## Health Checks

Tất cả services đều có health checks để đảm bảo ready trước khi services connect:

### PostgreSQL

```bash
docker exec deskio-postgres pg_isready -U deskio -d deskio
```

### Redis

```bash
docker exec deskio-redis redis-cli ping
# Expected output: PONG
```

### MinIO

```bash
curl http://localhost:9000/minio/health/live
```

---

## Kubernetes (k8s/)

Thư mục `k8s/` chứa Kubernetes manifests cho staging và production deployment.

**Cấu trúc:**

```
k8s/
├── base/                    # Base manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   └── secrets.yaml
├── services/                # Service deployments
│   ├── identity-service/
│   ├── ticket-service/
│   ├── kb-service/
│   └── notification-worker/
├── apps/                    # Frontend apps
│   ├── customer-portal/
│   ├── agent-console/
│   └── admin-console/
├── infra/                   # Infrastructure components
│   ├── postgres/
│   ├── redis/
│   └── ingress/
└── overlays/                # Environment-specific
    ├── staging/
    └── production/
```

**Tools:**

- Kubectl
- Kustomize (for overlays)
- Helm (optional)

**Deployment:**

```bash
# Apply base configuration
kubectl apply -k k8s/base

# Apply staging environment
kubectl apply -k k8s/overlays/staging

# Apply production environment
kubectl apply -k k8s/overlays/production
```

---

## Local Development Scripts (local/)

Thư mục `local/` chứa helper scripts cho local development (nếu cần).

**Potential scripts:**

- `setup-db.sh` - Initialize database schemas
- `seed-data.sh` - Seed test data
- `create-minio-bucket.sh` - Setup MinIO buckets
- `reset-env.sh` - Reset toàn bộ local environment
- `backup-db.sh` - Backup local database

---

## Environment Variables

Services cần các environment variables để connect với infrastructure:

### PostgreSQL

```env
DATABASE_URL=postgresql://deskio:deskio@localhost:5432/deskio
# Hoặc separate vars:
DB_HOST=localhost
DB_PORT=5432
DB_USER=deskio
DB_PASSWORD=deskio
DB_NAME=deskio
```

### Redis

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379
```

### MinIO/S3

```env
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=deskio
S3_REGION=us-east-1  # MinIO doesn't care, but libs might require it
S3_FORCE_PATH_STYLE=true  # Required for MinIO
```

---

## Troubleshooting

### PostgreSQL không start

```bash
# Check logs
docker compose -f infra/docker-compose.yml logs postgres

# Common issues:
# 1. Port 5432 already in use
#    - Stop local PostgreSQL: sudo service postgresql stop
# 2. Volume corruption
#    - Remove volume: docker compose down -v
```

### Redis connection issues

```bash
# Test connection
docker exec -it deskio-redis redis-cli ping

# Check if port is accessible
telnet localhost 6379
```

### MinIO bucket không tồn tại

```bash
# Login to console: http://localhost:9001
# Create bucket manually: deskio
# Set policy: public or custom

# Hoặc dùng mc CLI:
mc alias set local http://localhost:9000 minioadmin minioadmin
mc mb local/deskio
```

### Disk space issues

```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune -a

# Remove specific volumes
docker volume ls
docker volume rm deskio_pg_data
```

---

## Production Considerations

### PostgreSQL

- ✅ Use managed service (AWS RDS, Google Cloud SQL, Azure Database)
- ✅ Enable automated backups
- ✅ Use stronger passwords
- ✅ Enable SSL connections
- ✅ Configure connection pooling (PgBouncer)
- ✅ Setup read replicas for scaling

### Redis

- ✅ Use managed service (AWS ElastiCache, Redis Cloud)
- ✅ Enable persistence (AOF + RDB)
- ✅ Setup cluster mode cho high availability
- ✅ Configure maxmemory policies
- ✅ Monitor memory usage

### Object Storage

- ✅ Use AWS S3, Google Cloud Storage, hoặc Azure Blob
- ✅ Configure bucket policies và CORS
- ✅ Enable versioning
- ✅ Setup lifecycle policies (archive old files)
- ✅ Enable CDN (CloudFront, CloudFlare)

### Monitoring & Logging

- ✅ Setup monitoring (Prometheus, Grafana, DataDog)
- ✅ Configure alerts
- ✅ Centralized logging (ELK, CloudWatch)
- ✅ Application performance monitoring (APM)

### Security

- ✅ Network isolation (VPC, security groups)
- ✅ Encryption at rest và in transit
- ✅ Secrets management (AWS Secrets Manager, HashiCorp Vault)
- ✅ Regular security patches
- ✅ DDoS protection

---

## Notes

- Docker Compose chỉ dùng cho local development
- Production nên dùng managed services
- Backup data thường xuyên
- Monitor resource usage
- Keep images updated
- Document infrastructure changes
