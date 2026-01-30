# Local Development

## Prerequisites

- **Node.js 20+** (with Corepack enabled)
- **pnpm** (via Corepack: `corepack enable`)
- **Docker Desktop** (Windows/macOS) or **Docker Engine** (Linux)

## Quickstart

### 1) Install dependencies

```bash
pnpm install
```

### 2) Start infrastructure (Postgres/Redis/MinIO/Mailpit)

```bash
pnpm infra:up
```

### 3) Run a backend service

```bash
# Identity Service
pnpm dev:identity
# → http://localhost:3002/healthz

# Ticket Service
pnpm dev:ticket
# → http://localhost:3003/healthz

# KB Service
pnpm dev:kb
# → http://localhost:3004/healthz
```

### 4) Run a frontend app

```bash
# Customer Portal
pnpm dev:customer
# → http://localhost:3000

# Agent Console
pnpm dev:agent
# → http://localhost:3001

# Admin Console
pnpm dev:admin
# → http://localhost:3005
```

## Port Map (Standardized)

### Infrastructure

- **Postgres**: `5432`
- **Redis**: `6379`
- **MinIO API**: `9000`
- **MinIO Console**: `9001`
- **Mailpit UI**: `8025`
- **Mailpit SMTP**: `1025`

### Backend Services

- **identity-service**: `3002`
- **ticket-service**: `3003`
- **kb-service**: `3004`
- **notification-worker**: (no port, background worker)

### Frontend Apps

- **customer-portal**: `3000`
- **agent-console**: `3001`
- **admin-console**: `3005`

## Infrastructure Endpoints

### Postgres

- **Host**: `localhost:5432`
- **User**: `deskio`
- **Password**: `deskio`
- **Database**: `deskio`

### Redis

- **URL**: `redis://localhost:6379`

### MinIO (S3-compatible storage)

- **Console**: http://localhost:9001
- **API**: http://localhost:9000
- **User**: `minioadmin`
- **Password**: `minioadmin`

### Mailpit (Email testing)

- **Web UI**: http://localhost:8025
- **SMTP**: `localhost:1025`

## Useful Commands

### Infrastructure Management

```bash
# Start all infrastructure services
pnpm infra:up

# Stop all infrastructure services
pnpm infra:down

# View infrastructure logs (tail 200 lines)
pnpm infra:logs

# Reset infrastructure (delete volumes)
pnpm infra:reset
```

### Development

```bash
# Run all services/apps in parallel (via Turbo)
pnpm dev

# Run specific frontend app
pnpm dev:customer   # Customer Portal
pnpm dev:agent      # Agent Console
pnpm dev:admin      # Admin Console

# Run specific backend service
pnpm dev:identity   # Identity Service
pnpm dev:ticket     # Ticket Service
pnpm dev:kb         # KB Service
```

### Code Quality

```bash
# Format code
pnpm format

# Check formatting
pnpm format:check

# Lint all packages
pnpm lint

# Type check all packages
pnpm typecheck

# Run tests
pnpm test
```

## Environment Variables

Each service and app has an `.env.example` file. Copy it to `.env` when needed:

```bash
# For a service
cp services/identity-service/.env.example services/identity-service/.env

# For an app
cp apps/customer-portal/.env.example apps/customer-portal/.env
```

Most services will work with the defaults in `.env.example` when running locally with the provided Docker Compose infrastructure.

## Troubleshooting

### Infrastructure not starting

```bash
# Check if ports are already in use
netstat -ano | findstr :5432
netstat -ano | findstr :6379
netstat -ano | findstr :9000

# Reset infrastructure completely
pnpm infra:reset
pnpm infra:up
```

### Service fails to connect to database

1. Ensure infrastructure is running: `pnpm infra:up`
2. Check logs: `pnpm infra:logs`
3. Verify DATABASE_URL in service's `.env` file

### Port conflicts

If you have other services running on these ports, you can either:
1. Stop those services
2. Modify the ports in `infra/docker-compose.yml` and update `.env.example` files accordingly

## CI/CD Notes

- CI uses **Node 20** and **pnpm** with frozen lockfile
- All checks (lint, typecheck, test) must pass before merge
- Monorepo managed via **Turbo** for efficient caching and parallel execution

## Next Steps

- Read [Architecture Documentation](./architecture.md)
- Review [API Conventions](./api-conventions.md)
- Check [Contributing Guidelines](./CONTRIBUTING.md)
