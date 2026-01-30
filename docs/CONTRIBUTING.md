# Contributing

Cảm ơn bạn đã quan tâm đến Deskio. Tài liệu này mô tả cách đóng góp code, tài liệu,
và quy trình làm việc tiêu chuẩn cho repo.

## Nguyên tắc chung

- PR nhỏ, tập trung một mục tiêu rõ ràng.
- Không commit secrets hoặc thông tin nhạy cảm.
- Cập nhật docs khi thay đổi behavior/API.
- Mọi thay đổi đều thông qua PR, không push trực tiếp vào `main`.

## Yêu cầu môi trường

- Node.js LTS (>=18) + pnpm (repo dùng pnpm).
- Docker (để chạy infra local).
- Git.

## Thiết lập nhanh

```bash
git clone <repo-url>
cd deskio
pnpm install
pnpm dev:infra
```

Xem `docs/development.md` để biết hướng dẫn chi tiết theo từng workspace.

## Workflow đề xuất

### 1) Đồng bộ nhánh chính

```bash
git checkout main
git pull
```

### 2) Tạo nhánh làm việc

```bash
git checkout -b feature/<ten-ngan>
```

Quy ước nhánh: xem mục "Quy ước branch".

### 3) Làm việc và commit

- Commit nhỏ, dễ review.
- Dùng Conventional Commits (xem "Quy ước commit").

Ví dụ:

```bash
git add .
git commit -m "feat(ticket): add assignment endpoint"
```

### 4) Đồng bộ nhánh trước khi PR

```bash
git fetch origin
git rebase origin/main
```

Nếu không dùng rebase, có thể `git merge origin/main`.

### 5) Push và tạo PR

```bash
git push -u origin feature/<ten-ngan>
```

Tạo PR theo template `.github/PULL_REQUEST_TEMPLATE.md`.

## Quy ước branch

| Loại     | Mẫu                   | Ví dụ                   |
| -------- | --------------------- | ----------------------- |
| Feature  | `feature/<ten-ngan>`  | `feature/ticket-status` |
| Fix      | `fix/<ten-ngan>`      | `fix/login-timeout`     |
| Docs     | `docs/<ten-ngan>`     | `docs/api-conventions`  |
| Refactor | `refactor/<ten-ngan>` | `refactor/ticket-flow`  |
| Chore    | `chore/<ten-ngan>`    | `chore/update-deps`     |
| Hotfix   | `hotfix/<ten-ngan>`   | `hotfix/urgent-login`   |

## Quy ước commit (Conventional Commits)

Format chuẩn:

```
<type>(<scope>)!: <mo-ta-ngan>

[body]

[footer]
```

- `type`: loại thay đổi.
- `scope`: phạm vi thay đổi (tùy chọn).
- `!`: đánh dấu breaking change.
- `body`: mô tả chi tiết (tùy chọn).
- `footer`: ví dụ `BREAKING CHANGE: ...` hoặc liên kết issue (tùy chọn).

Khuyến nghị:

- Mô tả ngắn gọn, dùng động từ hiện tại (imperative).
- Không dùng dấu chấm kết câu ở cuối subject.

### Type khuyến nghị

| Type       | Ý nghĩa                         |
| ---------- | ------------------------------- |
| `feat`     | Thêm tính năng                  |
| `fix`      | Sửa lỗi                         |
| `docs`     | Tài liệu                        |
| `refactor` | Tái cấu trúc không đổi behavior |
| `perf`     | Cải thiện hiệu năng             |
| `test`     | Bổ sung/sửa test                |
| `build`    | Build system/deps               |
| `ci`       | CI/CD                           |
| `chore`    | Công việc lặt vặt               |
| `revert`   | Hoàn tác commit                 |

### Scope gợi ý

`auth`, `ticket`, `kb`, `notification`, `frontend`, `backend`, `infra`, `docs`, `contracts`.

### Ví dụ chi tiết

```bash
git commit -m "feat(ticket): add assignment endpoint"
git commit -m "fix(auth): handle refresh token expiry"
git commit -m "docs(api): add pagination and error envelope"
git commit -m "ci: add lint job"
git commit -m "refactor(ticket)!: rename priority enum"
```

Ví dụ có breaking change:

```
refactor(ticket)!: rename priority enum

BREAKING CHANGE: priority values changed from LOW/MEDIUM/HIGH to P1/P2/P3.
```

## Pull Request (PR)

- PR nhỏ, tập trung vào một mục tiêu rõ ràng.
- Mô tả đầy đủ: mục tiêu, phạm vi, và cách kiểm thử.
- Đảm bảo không đưa thông tin nhạy cảm vào repo.
- Cập nhật OpenAPI specs khi có thay đổi API.
- Gắn link issue hoặc ticket liên quan (nếu có).

## Checklist review theo scope (bắt buộc)

Chỉ tick các mục áp dụng cho scope của PR.

### Backend

- [ ] API contract/OpenAPI đã cập nhật (nếu có thay đổi).
- [ ] Thay đổi DB có migration + hướng dẫn rollback.
- [ ] Auth/RBAC kiểm tra quyền đầy đủ.
- [ ] Error handling rõ ràng (status code/message).
- [ ] Test đã cập nhật hoặc có lý do chưa có.

### Frontend

- [ ] UI không bị regress, có kiểm tra responsive.
- [ ] UX cho trạng thái lỗi/loading/empty.
- [ ] Kiểm tra quyền hiển thị theo role (nếu có).
- [ ] Không có hard-coded text nhạy cảm.
- [ ] Test/Story cập nhật hoặc có lý do chưa có.

### Infra/DevOps

- [ ] Secrets/config không hard-code, có hướng dẫn cấu hình.
- [ ] Docker/K8s manifests chạy được và có rollback.
- [ ] CI/CD pipeline không bị ảnh hưởng.
- [ ] Logging/monitoring còn hoạt động.
- [ ] Chi phí/tài nguyên không tăng đột ngột (nếu áp dụng).

## Docs và ADR

- Tài liệu kiến trúc: `docs/architecture.md`.
- Quy ước API: `docs/api-conventions.md`.
- Nếu có quyết định kiến trúc hoặc trade-off lớn, tạo ADR tại `docs/adr/`
  theo template `docs/adr/0000-template.md`.

## Báo lỗi và yêu cầu tính năng

Sử dụng issue templates tại `.github/ISSUE_TEMPLATE/`.

## Liên hệ

- Bảo mật: xem `../.github/SECURITY.md`.
- Hành vi: xem `CODE_OF_CONDUCT.md`.
