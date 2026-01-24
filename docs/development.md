# Development Guide

Hướng dẫn này mô tả cách thiết lập và phát triển Deskio trên môi trường local.

## Quickstart

```bash
pnpm install
pnpm dev:infra
```

## Yêu cầu môi trường

- Node.js LTS (>=18) + pnpm.
- Docker (để chạy infra local).
- Git.

## Cài đặt

1. Cài dependencies: `pnpm install`.
2. Bật infra local: `pnpm dev:infra`.
3. Vào workspace cần làm việc trong `apps/*` hoặc `services/*`:
   - Chạy scripts theo README của workspace (nếu có).
   - Nếu chưa có, tạo README nhỏ mô tả cách chạy.

## Cấu trúc repo

- `apps/`: frontend apps (customer/agent/admin).
- `services/`: backend services (identity/ticket/kb/notification).
- `packages/`: shared packages (contracts/config/utils/ui).
- `infra/`: docker-compose và công cụ devops cơ bản.
- `docs/`: tài liệu hệ thống.

## Scripts (root)

| Script            | Mô tả                                     |
| ----------------- | ----------------------------------------- |
| `pnpm dev:infra`  | Bật hạ tầng local (Postgres/Redis/MinIO). |
| `pnpm down:infra` | Tắt hạ tầng local.                        |
| `pnpm lint`       | Placeholder, sẽ bổ sung sau.              |
| `pnpm test`       | Placeholder, sẽ bổ sung sau.              |
| `pnpm build`      | Placeholder, sẽ bổ sung sau.              |

## Quy ước môi trường

Biến môi trường và secrets không lưu trong repo. Nếu cần, tạo file `.env`
theo hướng dẫn của từng workspace.

## Troubleshooting

- Docker chưa chạy: kiểm tra Docker Desktop hoặc quyền truy cập daemon.
- Port bị chiếm: chỉnh lại port trong `infra/docker-compose.yml`.
