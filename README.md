# Deskio

Deskio là nền tảng helpdesk/ticketing theo mô hình **multi-tenant (workspace)**, cung cấp **RBAC (Admin/Agent/Customer)**, luồng **ticket end-to-end**, Knowledge Base cơ bản và notification email tối thiểu. Repo này được tổ chức theo **monorepo** để thống nhất tiêu chuẩn code, CI, và vận hành.

---

## Mục tiêu (MVP)
- Workspace + multi-tenant baseline
- Auth + RBAC: Admin / Agent / Customer
- Ticket core: tạo / danh sách / chi tiết / reply / status / assign
- Knowledge Base: CRUD + publish cơ bản
- Notification: email tối thiểu (worker)
- DevOps baseline: docker-compose dev, CI, staging deploy skeleton, logging/observability baseline

---

## Kiến trúc (MVP - high level)
- **Apps (Frontend)**
  - Customer Portal (Next.js)
  - Agent Console (Next.js)
  - Admin Console (Next.js)
- **Services (Backend)**
  - identity-service (Auth/RBAC/Workspace)
  - ticket-service (Ticket core)
  - kb-service (Knowledge Base)
  - notification-worker (email jobs/queue)

**Infra tối thiểu (dev):**
- Postgres
- Redis (queue/cache)
- Object storage (MinIO/S3-compatible)

---

## Tech Stack (định hướng)
- Frontend: Next.js (App Router) + TypeScript
- Backend: Node.js + TypeScript + NestJS
- DB: PostgreSQL
- Queue: BullMQ + Redis
- Object storage: MinIO (dev) / S3 (staging/prod)
- CI: GitHub Actions

---

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
