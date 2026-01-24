# Contributing

Cảm ơn bạn đã quan tâm đến Deskio. Tài liệu này mô tả cách đóng góp code, tài liệu,
và quy trình làm việc cơ bản cho repo.

## Yêu cầu môi trường
- Node.js LTS (>=18) + npm 10 (repo dùng npm@10).
- Docker (để chạy infra local).
- Git.

## Thiết lập local
1. Clone repo.
2. Cài dependencies: `npm install`.
3. Bật infra local: `npm run dev:infra` (Postgres/Redis/MinIO).
4. Mở workspace cần làm việc trong `apps/*` hoặc `services/*`.
   - Chạy scripts theo hướng dẫn trong workspace (nếu đã có).
   - Nếu chưa có, thêm README nhỏ mô tả cách chạy.

## Quy trình làm việc
1. Tạo branch từ `main`.
2. Thay đổi nhỏ, rõ phạm vi và có lý do.
3. Cập nhật docs liên quan nếu đổi behavior/API.
4. Chạy lint/test/build (hiện là placeholder).
5. Tạo PR theo template `.github/PULL_REQUEST_TEMPLATE.md`.

## Quy ước branch
| Loại | Mẫu | Ví dụ |
| --- | --- | --- |
| Feature | `feature/<ten-ngan>` | `feature/ticket-status` |
| Fix | `fix/<ten-ngan>` | `fix/login-timeout` |
| Chore | `chore/<ten-ngan>` | `chore/update-deps` |

## Pull Request (PR)
- PR nhỏ, tập trung vào một mục tiêu rõ ràng.
- Mô tả đầy đủ: mục tiêu, phạm vi, và cách kiểm thử.
- Đảm bảo không đưa thông tin nhạy cảm vào repo.
- Cập nhật OpenAPI specs khi có thay đổi API.

## Docs và ADR
- Tài liệu kiến trúc: `docs/architecture.md`.
- Quy ước API: `docs/api-conventions.md`.
- Nếu có quyết định kiến trúc hoặc trade-off lớn, tạo ADR tại `docs/adr/`
  theo template `docs/adr/0000-template.md`.

## Báo lỗi và yêu cầu tính năng
Sử dụng issue templates tại `.github/ISSUE_TEMPLATE/`.

## Liên hệ
- Bảo mật: xem `SECURITY.md`.
- Hành vi: xem `CODE_OF_CONDUCT.md`.
