# Architecture (MVP)

Tài liệu này mô tả kiến trúc tổng quan cho Deskio MVP: boundaries theo services,
data stores, luồng chính, và các nguyên tắc triển khai.

## Mục tiêu kiến trúc
- Đáp ứng MVP nhanh, dễ mở rộng.
- Multi-tenant theo workspace (data isolation ở layer ứng dụng).
- RBAC rõ ràng theo role (Admin/Agent/Customer).
- Tách service theo domain để dễ scale và phân công ownership.
- DevOps baseline: chạy local bằng docker-compose, có CI.

## Thành phần chính
### Frontend Apps
- **Customer Portal**: tạo ticket, theo dõi trạng thái, reply, xem KB.
- **Agent Console**: xử lý ticket (triage, assign, reply, status).
- **Admin Console**: quản lý workspace, người dùng, role, cấu hình.

Tech: Next.js (App Router) + TypeScript.

### Backend Services (MVP)
- **identity-service**
  - Auth (login, token)
  - Workspace
  - RBAC / user management (MVP)
- **ticket-service**
  - Ticket CRUD + workflow trạng thái
  - Reply/Comment
  - Assignment
  - Attachment references
- **kb-service**
  - Knowledge base: article CRUD + publish state
  - Search basic (optional MVP)
- **notification-worker**
  - Background jobs (email notifications)
  - Consume queue (Redis/BullMQ)

Tech: Node.js + TypeScript + NestJS (định hướng).

### Data stores & Infra
- **PostgreSQL**: primary datastore (MVP có thể 1 instance, tách schema theo service hoặc tách DB sau).
- **Redis**: queue + cache (BullMQ).
- **Object storage (MinIO/S3)**: attachments và (tuỳ) KB assets.
- **Docker Compose (local dev)**: dựng Postgres/Redis/MinIO.

## Communication & Integration
- Synchronous: HTTP/REST giữa frontend và services.
- Async: worker nhận job từ queue (Redis/BullMQ).
- Notification flow:
  - ticket-service tạo job -> notification-worker gửi email.

## Multi-tenancy (workspace)
MVP áp dụng "logical isolation":
- Mọi bảng dữ liệu domain có `workspaceId`.
- Tất cả query phải scope theo `workspaceId`.
- Token chứa `workspaceId` (hoặc được resolve từ session).

Quy tắc:
- Không cho phép truy xuất cross-workspace.
- Index nên bao gồm `workspaceId` + field query phổ biến (ví dụ ticket status).

## RBAC model (MVP)
- Roles: `ADMIN`, `AGENT`, `CUSTOMER`
- Permissions (gợi ý):
  - ADMIN: quản trị workspace, quản lý user/role, cấu hình.
  - AGENT: xử lý ticket, cập nhật status/assign, reply.
  - CUSTOMER: tạo ticket, xem ticket của mình, reply.

Enforcement:
- Backend enforce quyền (bắt buộc).
- Frontend chỉ hỗ trợ UX (ẩn/hiện), không phải security boundary.

## Ticket domain (MVP)
### Ticket states (gợi ý)
- `OPEN` -> `PENDING` -> `RESOLVED` -> `CLOSED`
- Optional: `SPAM`, `ARCHIVED`

### Core entities (gợi ý)
- Ticket: id, workspaceId, requesterId, assigneeId, status, priority, subject, createdAt, updatedAt
- Reply: id, ticketId, authorId, body, createdAt
- Attachment: id, objectKey, fileName, mimeType, size

## Knowledge Base domain (MVP)
- Article: id, workspaceId, title, slug, content, status(DRAFT/PUBLISHED), createdAt, updatedAt
- Public read scope (tuỳ): có thể public theo workspace hoặc chỉ authenticated.

## Observability & Logging (baseline)
- Mỗi service log structured JSON.
- Log fields tối thiểu: requestId, workspaceId, userId, route, status, durationMs.
- Health endpoints: `/healthz`, `/readyz`.

## CI/CD (baseline)
- CI chạy: install, lint, test, build.
- (Tuỳ) build docker image khi merge main.
- Staging deploy skeleton: chuẩn bị k8s manifests hoặc compose-based staging.

## Repo boundaries & ownership
- Ownership theo module:
  - platform-devops: infra, workflows, CICD
  - identity: identity-service
  - ticket: ticket-service
  - kb-backend: kb-service
  - frontend: apps/*

CODEOWNERS enforce review theo folder.

## ADR (Architecture Decision Records)
Lưu quyết định kiến trúc tại `docs/adr/` theo format:
- Context
- Decision
- Consequences
- Alternatives considered
