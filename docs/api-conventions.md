# API Conventions

Tài liệu này định nghĩa các quy ước chung cho API trong Deskio để đảm bảo tính nhất quán
giữa các service (identity/ticket/kb/notification) và giảm chi phí tích hợp.

## 1. Principles

- Consistent, predictable, backward-compatible.
- Explicit versioning strategy.
- OpenAPI là nguồn sự thật cho contract.
- Errors, pagination, filtering, sorting tuân thủ chuẩn thống nhất.

## 2. API Versioning

### 2.1. Base path

- Khuyến nghị: `/api/v1/...`

### 2.2. Compatibility rules

- Thay đổi **breaking** phải tăng version (v1 -> v2).
- Thay đổi **non-breaking**:
  - Thêm field (optional) vào response.
  - Thêm endpoint mới.
  - Thêm query params optional.

## 3. Naming & Resources

### 3.1. Resource naming

- Dùng danh từ số nhiều: `/tickets`, `/users`, `/workspaces`.
- Child resources: `/tickets/{ticketId}/replies`.
- Actions đặc biệt (hạn chế): `/tickets/{ticketId}:close` (chỉ khi không model được bằng resource).

### 3.2. ID conventions

- ID là string (UUID/ULID tuỳ chọn, thống nhất toàn hệ thống).
- Không expose numeric auto-increment IDs (tránh enumeration).

### 3.3. Field naming

- Response và request dùng `camelCase`.
- Thời gian dùng ISO 8601 (UTC), ví dụ: `2026-01-24T12:34:56Z`.

## 4. Authentication & Authorization (RBAC)

- Auth header: `Authorization: Bearer <token>`.
- Mọi request phải xác định `workspaceId` theo một trong các cách:
  - Path: `/workspaces/{workspaceId}/tickets`.
  - Hoặc token claims + header `X-Workspace-Id`.

**RBAC**:

- Roles: `ADMIN`, `AGENT`, `CUSTOMER`.
- Quy ước trả lỗi:
  - 401: chưa đăng nhập/invalid token.
  - 403: đã đăng nhập nhưng không có quyền.

## 5. Standard Response Shape

### 5.1. Success envelope

Khuyến nghị dùng envelope để thống nhất metadata:

```json
{
  "data": {},
  "meta": {
    "requestId": "..."
  }
}
```

### 5.2. Error envelope

```json
{
  "error": {
    "code": "TICKET_NOT_FOUND",
    "message": "Ticket not found",
    "details": {},
    "requestId": "..."
  }
}
```

## 6. Pagination, Filtering, Sorting

### 6.1. Pagination (cursor)

Query params:

- `limit`: số lượng item.
- `cursor`: token trang hiện tại.

Ví dụ response:

```json
{
  "data": [],
  "meta": {
    "requestId": "...",
    "pagination": {
      "limit": 20,
      "nextCursor": "..."
    }
  }
}
```

### 6.2. Filtering

- Dùng query params rõ ràng: `status=OPEN&priority=HIGH`.
- Chỉ expose các filter cần thiết, có index phù hợp.

### 6.3. Sorting

- `sortBy`: field hợp lệ.
- `sortOrder`: `asc` | `desc`.

## 7. HTTP Status Codes (gợi ý)

- 200: OK
- 201: Created
- 204: No Content
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 409: Conflict
- 422: Unprocessable Entity
- 429: Too Many Requests
- 500: Internal Server Error

## 8. Idempotency (khuyến nghị)

- Với các thao tác tạo tài nguyên quan trọng, có thể hỗ trợ header `Idempotency-Key`.
- Lưu key trong thời gian phù hợp để tránh tạo trùng.

## 9. Error Codes

- Dùng mã lỗi dạng `SCREAMING_SNAKE_CASE`.
- Mã lỗi phải ổn định theo version.

## 10. Deprecation

- Đánh dấu field/endpoints deprecated trong OpenAPI.
- Thông báo lịch loại bỏ trước khi xoá.
