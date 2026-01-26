# Project Structure

## Tổng quan kiến trúc

Deskio sử dụng monorepo structure với pnpm workspaces:

```
deskio/
├── apps/              # Frontend applications
│   ├── customer-portal/    # Customer-facing app (Next.js)
│   ├── agent-console/      # Agent workspace (Next.js)
│   └── admin-console/      # Admin panel (Next.js)
├── services/          # Backend microservices
│   ├── identity-service/   # Auth & user management (NestJS)
│   ├── ticket-service/     # Ticket management (NestJS)
│   ├── kb-service/         # Knowledge base (NestJS)
│   └── notification-worker/ # Email notifications (NestJS)
├── packages/          # Shared packages
│   ├── contracts/          # OpenAPI specs & shared types
│   ├── config/            # Shared configs (eslint, prettier, tsconfig)
│   ├── ui/                # Shared UI components
│   └── utils/             # Shared utilities
├── infra/            # Infrastructure
│   ├── docker-compose.yml  # Local dev environment
│   ├── k8s/               # Kubernetes manifests
│   └── local/             # Local development scripts
└── docs/             # Documentation
    ├── architecture.md
    ├── api-conventions.md
    ├── development.md
    └── adr/              # Architecture Decision Records
```

## Apps (Frontend)

### Công nghệ
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React hooks + Server Components

### Cấu trúc app
```
app/
├── (app)/           # Protected routes (require auth)
│   ├── dashboard/
│   ├── tickets/
│   └── layout.tsx   # App shell layout
├── (auth)/          # Public auth routes
│   ├── login/
│   └── register/
├── layout.tsx       # Root layout
└── page.tsx         # Home page
```

## Services (Backend)

### Công nghệ
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL với Prisma ORM
- **Cache/Queue**: Redis + BullMQ
- **Storage**: MinIO/S3
- **Validation**: class-validator
- **API Docs**: Swagger/OpenAPI

### Cấu trúc service
```
service/
├── src/
│   ├── app.module.ts        # Root module
│   ├── main.ts              # Entry point
│   ├── common/              # Shared utilities
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Auth guards
│   │   ├── interceptors/    # Interceptors
│   │   └── pipes/           # Validation pipes
│   ├── config/              # Configuration
│   │   └── config.module.ts
│   ├── health/              # Health check endpoint
│   └── [domain]/            # Domain modules
│       ├── [domain].module.ts
│       ├── [domain].controller.ts
│       ├── [domain].service.ts
│       ├── dto/             # Data Transfer Objects
│       └── entities/        # Database entities
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
├── Dockerfile
└── package.json
```

## Packages

### contracts
- **Mục đích**: Shared types, interfaces, và OpenAPI specs
- **Nội dung**: DTOs, enums, API contracts
- **Sử dụng**: Import từ `@deskio/contracts`

### config
- **Mục đích**: Shared configs cho eslint, prettier, tsconfig
- **Nội dung**: Base configs được extend bởi apps/services
- **Sử dụng**: Extend trong `.eslintrc.cjs`, `tsconfig.json`

### ui
- **Mục đích**: Shared UI components
- **Nội dung**: Reusable React components
- **Sử dụng**: Import từ `@deskio/ui`

### utils
- **Mục đích**: Shared utilities và helpers
- **Nội dung**: Common functions, validators, formatters
- **Sử dụng**: Import từ `@deskio/utils`

## Naming Conventions

### Files
- **Components**: PascalCase (`Button.tsx`, `TicketCard.tsx`)
- **Utilities**: camelCase (`formatDate.ts`, `validateEmail.ts`)
- **Configs**: kebab-case (`eslint.config.mjs`, `next.config.ts`)
- **Tests**: `*.test.ts` hoặc `*.spec.ts`

### Folders
- **kebab-case**: `ticket-service`, `agent-console`
- **Modules**: Singular noun (`ticket`, `user`, không phải `tickets`)

### Code
- **Variables/Functions**: camelCase (`getUserById`, `ticketCount`)
- **Classes**: PascalCase (`TicketService`, `UserController`)
- **Interfaces**: PascalCase với `I` prefix optional (`User` hoặc `IUser`)
- **Enums**: PascalCase (`UserRole`, `TicketStatus`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_FILE_SIZE`)

## Multi-tenancy

Tất cả data được scope theo `workspaceId`:
- Mọi bảng database có column `workspaceId`
- Mọi query phải filter theo `workspaceId`
- Token JWT chứa `workspaceId`
- Không cho phép cross-workspace access

## RBAC (Role-Based Access Control)

3 roles chính:
- **ADMIN**: Quản trị workspace, users, settings
- **AGENT**: Xử lý tickets, quản lý KB
- **CUSTOMER**: Tạo và theo dõi tickets của mình

Backend enforce permissions, frontend chỉ hỗ trợ UX.

## Port Allocation

### Services
- `3002` - identity-service
- `3003` - ticket-service
- `3004` - kb-service
- `3005` - notification-worker

### Apps
- `3000` - customer-portal
- `3001` - agent-console
- `3010` - admin-console

### Infrastructure
- `5432` - PostgreSQL
- `6379` - Redis
- `9000` - MinIO API
- `9001` - MinIO Console
- `1025` - Mailpit SMTP
- `8025` - Mailpit Web UI

## Key Dependencies

### Frontend
- `next` - Framework
- `react` - UI library
- `typescript` - Type safety
- `tailwindcss` - Styling
- `@tanstack/react-query` - Data fetching (future)

### Backend
- `@nestjs/core` - Framework
- `@nestjs/common` - Common utilities
- `@prisma/client` - Database ORM
- `class-validator` - Validation
- `class-transformer` - Transformation
- `bullmq` - Queue
- `ioredis` - Redis client

## Scripts

### Root level
- `pnpm dev` - Run all in dev mode (via Turbo)
- `pnpm build` - Build all
- `pnpm lint` - Lint all
- `pnpm infra:up` - Start infrastructure
- `pnpm infra:down` - Stop infrastructure

### Individual apps/services
- `pnpm dev:customer` - Run customer-portal
- `pnpm dev:agent` - Run agent-console
- `pnpm dev:identity` - Run identity-service
- `pnpm dev:ticket` - Run ticket-service

## Development Flow

1. Start infrastructure: `pnpm infra:up`
2. Run service(s): `pnpm dev:identity`, `pnpm dev:ticket`, etc.
3. Run app(s): `pnpm dev:customer`, `pnpm dev:agent`, etc.
4. Access apps via localhost:PORT
5. Stop infrastructure: `pnpm infra:down`

## Environment Variables

Mỗi app/service có file `.env` riêng:
- `.env.example` - Template với placeholders
- `.env` - Local values (git ignored)
- Production values được inject qua CI/CD

Pattern:
```
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Services
IDENTITY_SERVICE_URL=http://localhost:3002
TICKET_SERVICE_URL=http://localhost:3003
```
