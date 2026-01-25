# NestJS Service Template

Base template for Deskio microservices using NestJS.

## Features

- ✅ Request ID correlation for distributed tracing
- ✅ Global validation with class-validator
- ✅ Standardized error handling and logging
- ✅ Environment variable validation with Joi
- ✅ Health check endpoint `/healthz`
- ✅ Docker multi-stage build
- ✅ TypeScript strict mode

## Getting Started

### 1. Copy the template

```bash
cp -r services/_template-nest services/your-service-name
cd services/your-service-name
```

### 2. Setup environment

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Install dependencies

```bash
pnpm install
```

### 4. Development

```bash
pnpm dev        # Start with watch mode
pnpm build      # Build for production
pnpm start      # Start production build
pnpm typecheck  # Type checking
pnpm lint       # Lint code
```

## Project Structure

```
src/
├── common/                    # Shared utilities
│   ├── http-exception.filter.ts  # Global error handler
│   └── request-id.middleware.ts  # Request correlation
├── config/                    # Configuration
│   └── env.validation.ts      # Environment schema
├── health/                    # Health check
│   ├── health.controller.ts
│   └── health.module.ts
├── app.module.ts              # Root module
└── main.ts                    # Bootstrap
```

## Environment Variables

See [.env.example](.env.example) for all available variables.

Required:

- `NODE_ENV` - Environment (development/test/production)
- `PORT` - Service port (default: 3001)

## Docker

Build and run:

```bash
docker build -t your-service .
docker run -p 3001:3001 your-service
```

## API Standards

### Success Response

```json
{
  "data": { ... }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": { ... }
  },
  "meta": {
    "requestId": "uuid"
  }
}
```

## Health Check

```bash
curl http://localhost:3001/healthz
# Response: {"status":"ok"}
```
