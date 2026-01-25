# Deskio

> Deskio là nền tảng helpdesk/ticketing theo mô hình multi-tenant (workspace),
> cung cấp RBAC (Admin/Agent/Customer), luồng ticket end-to-end, Knowledge Base
> cơ bản và notification email tối thiểu.

## Mục tiêu (MVP)

- Workspace + multi-tenant baseline
- Auth + RBAC: Admin / Agent / Customer
- Ticket core: tạo / danh sách / chi tiết / reply / status / assign
- Knowledge Base: CRUD + publish cơ bản
- Notification: email tối thiểu (worker)
- DevOps baseline: docker-compose dev, CI, staging deploy skeleton, logging/observability baseline

## Kiến trúc (tóm tắt)

| Nhóm     | Thành phần                                                        | Vai trò                              |
| -------- | ----------------------------------------------------------------- | ------------------------------------ |
| Apps     | Customer Portal, Agent Console, Admin Console                     | Trải nghiệm cho customer/agent/admin |
| Services | identity-service, ticket-service, kb-service, notification-worker | Core domain services và email worker |

**Infra tối thiểu (dev):**

- Postgres
- Redis (queue/cache)
- Object storage (MinIO/S3-compatible)

## Tech Stack (định hướng)

- Frontend: Next.js (App Router) + TypeScript
- Backend: Node.js + TypeScript + NestJS
- DB: PostgreSQL
- Queue: BullMQ + Redis
- Object storage: MinIO (dev) / S3 (staging/prod)
- CI: GitHub Actions

## Bắt đầu nhanh

```bash
pnpm install
pnpm dev:infra
```

Xem `docs/development.md` để biết hướng dẫn chi tiết và scripts theo từng workspace.

## Chạy Docker (infra local)

Deskio dùng Docker Compose để bật Postgres/Redis/MinIO cho local development.

```bash
# Bật hạ tầng local (wrapper script)
pnpm dev:infra

# Hoặc chạy trực tiếp Docker Compose
docker compose -f infra/docker-compose.yml up -d
```

```bash
# Tắt hạ tầng local
pnpm down:infra

# Hoặc
docker compose -f infra/docker-compose.yml down
```

Xem thêm chi tiết tại `infra/README.md`.

## Tài liệu

- `docs/architecture.md`
- `docs/api-conventions.md`
- `docs/development.md`
- `docs/adr/0000-template.md`
- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`
- `CHANGELOG.md`

## Repo Structure

```text
apps/
  customer-portal/
  agent-console/
  admin-console/
services/
  identity-service/
  ticket-service/
  kb-service/
  notification-worker/
packages/
  contracts/     # OpenAPI specs, shared types
  config/        # eslint/prettier/tsconfig base
  ui/            # shared UI kit (optional)
  utils/         # shared utilities
infra/
  docker-compose.yml
docs/
  api-conventions.md
  architecture.md
.github/
  workflows/
  ISSUE_TEMPLATE/
CODEOWNERS
```

## Thành viên

1. Huỳnh Lê Đại Thắng (Leader)
2. Nguyễn Khánh Vy
3. Bùi Ngọc Thái

## Đóng góp và pháp lý

- Đóng góp: `CONTRIBUTING.md`
- Bảo mật: `SECURITY.md`
- Hành vi: `CODE_OF_CONDUCT.md`
- Thay đổi: `CHANGELOG.md`
- License: `LICENSE`
