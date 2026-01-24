
---

## `docs/architecture.md`

```md
# Architecture (MVP)

Tài liệu này mô tả kiến trúc tổng quan cho Deskio MVP: boundary theo services, data stores, luồng chính, và nguyên tắc triển khai.

## 1. Mục tiêu kiến trúc
- Đáp ứng MVP nhanh, dễ mở rộng.
- Multi-tenant theo workspace (data isolation ở layer ứng dụng).
- RBAC rõ ràng theo role (Admin/Agent/Customer).
- Tách service theo domain để dễ scale và phân công ownership.
- DevOps baseline: chạy local bằng docker-compose, có CI.

## 2. High-level components

### 2.1. Frontend Apps
- **Customer Portal**: tạo ticket, theo dõi trạng thái, reply, xem KB.
- **Agent Console**: xử lý ticket (triage, assign, reply, status).
- **Admin Console**: quản lý workspace, người dùng, role, cấu hình.

Tech: Next.js (App Router) + TypeScript.

### 2.2. Backend Services (MVP)
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

## 3. Data stores & infra
- **PostgreSQL**: primary datastore (MVP có thể 1 instance, tách schema theo service hoặc tách DB sau).
- **Redis**: queue + cache (BullMQ).
- **Object storage (MinIO/S3)**: attachments và (tuỳ) KB assets.
- **Docker Compose (local dev)**: dựng Postgres/Redis/MinIO.

## 4. Communication & Integration
- Synchronous: HTTP/REST giữa frontend và services.
- Async: worker nhận job từ queue (Redis/BullMQ).
- Notification:
  - ticket-service phát event nội bộ (tạo job) → notification-worker gửi email.

## 5. Multi-tenancy (workspace)
MVP áp dụng “logical isolation”:
- Mọi bảng dữ liệu domain có `workspaceId`.
- Tất cả query phải scope theo `workspaceId`.
- Token chứa `workspaceId` (hoặc được resolve từ session).

Quy tắc:
- Không cho phép truy xuất cross-workspace.
- Index nên bao gồm `workspaceId` + field query phổ biến (ví dụ ticket status).

## 6. RBAC model (MVP)
- Roles: `ADMIN`, `AGENT`, `CUSTOMER`
- Permissions (gợi ý):
  - ADMIN: quản trị workspace, quản lý user/role, cấu hình.
  - AGENT: xử lý ticket, cập nhật status/assign, reply.
  - CUSTOMER: tạo ticket, xem ticket của mình, reply.

Enforcement:
- Backend enforce quyền (bắt buộc).
- Frontend chỉ hỗ trợ UX (ẩn/hiện), không phải security boundary.

## 7. Ticket domain (MVP)
### 7.1. Ticket states (gợi ý)
- `OPEN` → `PENDING` → `RESOLVED` → `CLOSED`
- Optional: `SPAM`, `ARCHIVED`

### 7.2. Core entities (gợi ý)
- Ticket: id, workspaceId, requesterId, assigneeId, status, priority, subject, createdAt, updatedAt
- Reply: id, ticketId, authorId, body, createdAt
- Attachment: id, objectKey, fileName, mimeType, size

## 8. Knowledge Base domain (MVP)
- Article: id, workspaceId, title, slug, content, status(DRAFT/PUBLISHED), createdAt, updatedAt
- Public read scope (tuỳ): có thể public theo workspace hoặc chỉ authenticated.

## 9. Observability & Logging (baseline)
- Mỗi service log structured JSON.
- Log fields tối thiểu: requestId, workspaceId, userId, route, status, durationMs.
- Health endpoints: `/healthz`, `/readyz`.

## 10. CI/CD (baseline)
- CI chạy: install, lint, test, build.
- (Tuỳ) build docker image khi merge main.
- Staging deploy skeleton: chuẩn bị k8s manifests hoặc compose-based staging.

## 11. Repo boundaries & ownership
- Ownership theo module:
  - platform-devops: infra, workflows, CICD
  - identity: identity-service
  - ticket: ticket-service
  - kb-backend: kb-service
  - frontend: apps/*

CODEOWNERS enforce review theo folder.

## 12. ADR (Architecture Decision Records)
Lưu quyết định kiến trúc tại `docs/adr/` theo format:
- Context
- Decision
- Consequences
- Alternatives considered

---
