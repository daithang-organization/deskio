# Apps

Thư mục này chứa các ứng dụng frontend của Deskio platform, được xây dựng với Next.js (App Router) và TypeScript.

## Cấu trúc

### 1. Customer Portal (`customer-portal/`)

**Mục đích:** Giao diện cho khách hàng (end-users)

**Chức năng chính:**

- Tạo và theo dõi tickets
- Xem lịch sử tickets của mình
- Tìm kiếm và đọc Knowledge Base articles
- Quản lý profile cá nhân
- Nhận thông báo về ticket updates

**Người dùng:** Customers (vai trò Customer trong RBAC)

---

### 2. Agent Console (`agent-console/`)

**Mục đích:** Công cụ làm việc cho nhân viên support/agent

**Chức năng chính:**

- Xem danh sách và quản lý tickets được assigned
- Reply và cập nhật trạng thái tickets
- Assign/reassign tickets
- Tìm kiếm trong Knowledge Base để hỗ trợ customers
- Dashboard hiển thị metrics và workload

**Người dùng:** Agents (vai trò Agent trong RBAC)

---

### 3. Admin Console (`admin-console/`)

**Mục đích:** Quản trị hệ thống và workspace

**Chức năng chính:**

- Quản lý users và roles (RBAC)
- Quản lý workspace settings
- Quản lý Knowledge Base (CRUD, publish/unpublish)
- Xem reports và analytics
- Cấu hình notifications và integrations

**Người dùng:** Admins (vai trò Admin trong RBAC)

---

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **UI Components:** Shared UI kit từ `packages/ui`
- **API Communication:** REST API với services backend
- **State Management:** React hooks + server components
- **Styling:** TailwindCSS hoặc CSS modules
- **Authentication:** Token-based auth với identity-service

## Development

### Cài đặt dependencies

```bash
pnpm install
```

### Chạy development server

```bash
# Chạy tất cả apps
pnpm dev

# Hoặc chạy từng app riêng
cd apps/customer-portal && pnpm dev
cd apps/agent-console && pnpm dev
cd apps/admin-console && pnpm dev
```

### Build production

```bash
pnpm build
```

### Lint và type-check

```bash
pnpm lint
pnpm typecheck
```

## Environment Variables

Mỗi app cần các environment variables riêng (xem `.env.example` trong từng folder):

- `NEXT_PUBLIC_API_URL`: URL của backend services
- `NEXT_PUBLIC_IDENTITY_SERVICE_URL`: URL của identity-service
- Các biến khác tùy theo app

## Routing Structure

### Customer Portal

```
/                     - Trang chủ
/tickets              - Danh sách tickets
/tickets/new          - Tạo ticket mới
/tickets/[id]         - Chi tiết ticket
/kb                   - Knowledge Base
/kb/[slug]            - KB article
/profile              - User profile
```

### Agent Console

```
/                     - Dashboard
/tickets              - Danh sách tickets (with filters)
/tickets/[id]         - Chi tiết và reply ticket
/kb                   - Knowledge Base search
/profile              - Agent profile
```

### Admin Console

```
/                     - Admin dashboard
/users                - User management
/workspace            - Workspace settings
/kb                   - KB management (CRUD)
/kb/new               - Tạo KB article
/kb/[id]/edit         - Edit KB article
/reports              - Reports & analytics
```

## Shared Resources

- **Contracts:** Import API types từ `packages/contracts`
- **UI Components:** Import từ `packages/ui`
- **Utils:** Import utilities từ `packages/utils`
- **Config:** Kế thừa từ `packages/config`

## Notes

- Mỗi app là một Next.js workspace độc lập
- Shared code nên đặt trong `packages/` thay vì duplicate
- Follow API conventions trong `docs/api-conventions.md`
- Xem `docs/development.md` cho chi tiết development workflow
