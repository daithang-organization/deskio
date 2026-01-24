# Services

Thư mục này chứa các backend microservices của Deskio platform, được xây dựng với Node.js, TypeScript và NestJS framework.

## Cấu trúc

### 1. Identity Service (`identity-service/`)

**Mục đích:** Quản lý authentication, authorization và user management

**Chức năng chính:**

- User authentication (login/logout/register)
- JWT token generation và validation
- RBAC implementation (Admin/Agent/Customer roles)
- User CRUD operations
- Workspace management (multi-tenant)
- Password reset và email verification
- Session management

**API Endpoints:**

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `GET /users` - List users (admin)
- `POST /users` - Create user (admin)
- `GET /users/:id` - Get user details
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user (admin)
- `GET /workspaces` - List workspaces
- `POST /workspaces` - Create workspace

**Dependencies:**

- PostgreSQL (user/workspace data)
- bcrypt (password hashing)
- JWT (authentication tokens)

---

### 2. Ticket Service (`ticket-service/`)

**Mục đích:** Core business logic cho hệ thống ticketing

**Chức năng chính:**

- Tạo và quản lý tickets
- Ticket assignment cho agents
- Status transitions (Open → In Progress → Resolved → Closed)
- Ticket replies và comments
- File attachments
- Ticket search và filtering
- Priority management
- SLA tracking (optional MVP)

**API Endpoints:**

- `POST /tickets` - Create ticket
- `GET /tickets` - List tickets (with filters)
- `GET /tickets/:id` - Get ticket details
- `PATCH /tickets/:id` - Update ticket (status, priority, etc.)
- `POST /tickets/:id/replies` - Add reply to ticket
- `POST /tickets/:id/assign` - Assign ticket to agent
- `GET /tickets/:id/history` - Get ticket history
- `POST /tickets/:id/attachments` - Upload attachment

**Dependencies:**

- PostgreSQL (ticket data)
- Object Storage (MinIO/S3 for attachments)
- Redis (caching)
- Message Queue (publish events for notifications)

---

### 3. KB Service (`kb-service/`)

**Mục đích:** Quản lý Knowledge Base articles

**Chức năng chính:**

- CRUD operations cho KB articles
- Rich text content management
- Article categorization và tagging
- Publish/unpublish articles
- Search trong KB
- Article versioning (optional)
- View count tracking
- Featured articles

**API Endpoints:**

- `GET /kb/articles` - List published articles (public)
- `GET /kb/articles/:id` - Get article details
- `POST /kb/articles` - Create article (admin/agent)
- `PATCH /kb/articles/:id` - Update article (admin/agent)
- `DELETE /kb/articles/:id` - Delete article (admin)
- `POST /kb/articles/:id/publish` - Publish article
- `POST /kb/articles/:id/unpublish` - Unpublish article
- `GET /kb/search` - Search articles
- `GET /kb/categories` - List categories

**Dependencies:**

- PostgreSQL (article data)
- Full-text search (PostgreSQL or Elasticsearch)
- Object Storage (images in articles)

---

### 4. Notification Worker (`notification-worker/`)

**Mục đích:** Background worker xử lý email notifications

**Chức năng chính:**

- Listen to notification events từ message queue
- Gửi email notifications:
  - Ticket created (to customer)
  - Ticket reply (to customer/agent)
  - Ticket assigned (to agent)
  - Ticket status changed
  - Welcome email
  - Password reset email
- Email template rendering
- Retry logic cho failed emails
- Email delivery tracking

**Event Types:**

- `ticket.created`
- `ticket.replied`
- `ticket.assigned`
- `ticket.status_changed`
- `user.registered`
- `user.password_reset`

**Dependencies:**

- Redis (BullMQ queue)
- SMTP server (SendGrid, AWS SES, Mailgun, hoặc local SMTP)
- Email templates (Handlebars hoặc similar)

**Note:** Đây là worker service, không expose REST API.

---

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL với TypeORM hoặc Prisma
- **Queue:** BullMQ + Redis
- **Object Storage:** MinIO (dev) / AWS S3 (prod)
- **Authentication:** JWT (passport-jwt)
- **Validation:** class-validator
- **API Documentation:** Swagger/OpenAPI
- **Logging:** Winston hoặc Pino
- **Testing:** Jest

## Development

### Prerequisites

```bash
# Chạy infrastructure services (PostgreSQL, Redis, MinIO)
pnpm dev:infra
```

### Cài đặt dependencies

```bash
pnpm install
```

### Environment Variables

Mỗi service cần file `.env` (xem `.env.example`):

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# Object Storage (MinIO/S3)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=deskio

# SMTP (for notification-worker)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@deskio.com
```

### Chạy services

```bash
# Chạy tất cả services
pnpm dev

# Hoặc chạy từng service riêng
cd services/identity-service && pnpm dev
cd services/ticket-service && pnpm dev
cd services/kb-service && pnpm dev
cd services/notification-worker && pnpm dev
```

### Database migrations

```bash
# Chạy migrations
cd services/identity-service && pnpm migration:run
cd services/ticket-service && pnpm migration:run
cd services/kb-service && pnpm migration:run

# Tạo migration mới
pnpm migration:create <name>
```

### Build production

```bash
pnpm build
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test:cov
```

## Architecture Patterns

### API Design

- Follow RESTful conventions (xem `docs/api-conventions.md`)
- Use DTOs (Data Transfer Objects) cho validation
- Swagger documentation cho mọi endpoints
- Consistent error responses

### Database

- Mỗi service có database schema riêng (hoặc separate databases)
- Use migrations cho schema changes
- Soft delete cho critical data

### Authentication & Authorization

- JWT tokens issued bởi identity-service
- Guards cho role-based access control
- Verify tokens trong mỗi protected endpoint

### Event-Driven Communication

- Services publish events to message queue
- notification-worker subscribe các events
- Loose coupling giữa services

### Error Handling

- Global exception filters
- Structured error responses
- Proper HTTP status codes
- Logging errors với context

### Logging & Monitoring

- Structured logging (JSON format)
- Request/response logging
- Error tracking
- Performance metrics

## Service Communication

```
┌──────────────┐
│   Frontend   │
│   (Apps)     │
└──────┬───────┘
       │ HTTP/REST
       ▼
┌──────────────────────────────────┐
│  API Gateway / Load Balancer     │
│  (future: Kong, Nginx, etc.)     │
└──────┬───────────────────────────┘
       │
       ├──────────────┬──────────────┬────────────┐
       ▼              ▼              ▼            ▼
┌──────────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
│  Identity    │ │  Ticket  │ │   KB   │ │  (Other) │
│  Service     │ │  Service │ │ Service│ │ Services │
└──────┬───────┘ └────┬─────┘ └────────┘ └──────────┘
       │              │
       │    Events    │
       └──────┬───────┘
              ▼
      ┌───────────────┐
      │ Message Queue │
      │   (Redis)     │
      └───────┬───────┘
              │ Subscribe
              ▼
      ┌──────────────────┐
      │  Notification    │
      │     Worker       │
      └──────────────────┘
```

## Shared Resources

- **Contracts:** Export OpenAPI specs to `packages/contracts`
- **Utils:** Import shared utilities từ `packages/utils`
- **Config:** Kế thừa base configs từ `packages/config`

## Security Considerations

- ✅ Input validation với class-validator
- ✅ SQL injection prevention (use ORM)
- ✅ XSS prevention (sanitize inputs)
- ✅ Rate limiting (future enhancement)
- ✅ CORS configuration
- ✅ Helmet for security headers
- ✅ Environment variables for secrets (never commit)

## Deployment

- Docker containers cho mỗi service
- Kubernetes manifests trong `infra/k8s/`
- Health check endpoints: `GET /health`
- Graceful shutdown support

## Notes

- Mỗi service là một NestJS application độc lập
- Services không nên call trực tiếp nhau (use events hoặc API gateway)
- Follow single responsibility principle
- Xem `docs/architecture.md` cho chi tiết kiến trúc
