# API Conventions

Tài liệu này định nghĩa các quy ước chung cho API trong Deskio để đảm bảo tính nhất quán giữa các service
(identity/ticket/kb/notification) và giảm chi phí tích hợp giữa backend - frontend.

---

## 1. Principles
- Consistent, predictable, backward-compatible
- Explicit versioning strategy
- Machine-readable contract (OpenAPI) là nguồn sự thật
- Errors/pagination/filtering tuân thủ chuẩn thống nhất trong toàn hệ thống

---

## 2. API Versioning
### 2.1. Base path
- Khuyến nghị: `/api/v1/...`

### 2.2. Compatibility rules
- Thay đổi **breaking** phải tăng version (v1 → v2)
- Thay đổi **non-breaking**:
  - thêm field (optional) vào response
  - thêm endpoint mới
  - thêm query params optional

---

## 3. Naming & Resources
### 3.1. Resource naming
- Dùng danh từ số nhiều: `/tickets`, `/users`, `/workspaces`
- Child resources: `/tickets/{ticketId}/replies`
- Actions đặc biệt (hạn chế): `/tickets/{ticketId}:close` (chỉ khi không model được bằng resource)

### 3.2. ID conventions
- ID là string (UUID/ULID tuỳ chọn, thống nhất toàn hệ thống)
- Không expose numeric auto-increment IDs (tránh enumeration)

---

## 4. Authentication & Authorization (RBAC)
- Auth header: `Authorization: Bearer <token>`
- Mọi request phải xác định `workspaceId` theo một trong các cách:
  - Path: `/workspaces/{workspaceId}/tickets`
  - Hoặc token claims + header `X-Workspace-Id` (chọn 1 cách và áp dụng nhất quán)

**RBAC**:
- Roles: `ADMIN`, `AGENT`, `CUSTOMER`
- Quy ước trả lỗi:
  - 401: chưa đăng nhập/invalid token
  - 403: đã đăng nhập nhưng không có quyền

---

## 5. Standard Response Shape (khuyến nghị)
### 5.1. Success envelope
Khuyến nghị dùng envelope để thống nhất metadata:
```json
{
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
