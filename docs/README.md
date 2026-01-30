# Documentation

Thư mục này chứa toàn bộ tài liệu kỹ thuật cho Deskio platform.

## Tài liệu chính

### 1. [architecture.md](architecture.md)

**Mục đích:** Mô tả kiến trúc tổng quan của hệ thống

**Nội dung:**

- Mục tiêu kiến trúc MVP
- Các thành phần chính (Frontend Apps, Backend Services, Data Stores)
- Communication patterns (synchronous/asynchronous)
- Multi-tenant strategy (workspace isolation)
- RBAC implementation (Admin/Agent/Customer)
- Data flow diagrams
- Scalability considerations
- DevOps baseline

**Đối tượng:** Developers, Architects, Technical Leads

**Khi nào đọc:**

- Onboarding team members mới
- Planning new features hoặc services
- Architecture review sessions
- Trước khi refactor major components

---

### 2. [api-conventions.md](api-conventions.md)

**Mục đích:** Định nghĩa standards và best practices cho API design

**Nội dung:**

- API versioning strategy (`/api/v1/...`)
- Resource naming conventions (plural nouns, camelCase)
- Authentication & Authorization (JWT, RBAC)
- Standard response shapes (success & error)
- Pagination patterns
- Filtering & sorting conventions
- HTTP status codes usage
- Error handling standards
- OpenAPI/Swagger requirements

**Đối tượng:** Backend Developers

**Khi nào đọc:**

- Khi thiết kế API endpoints mới
- Code review cho API changes
- Troubleshooting integration issues
- Writing API documentation

---

### 3. [development.md](development.md)

**Mục đích:** Hướng dẫn setup và phát triển local environment

**Nội dung:**

- Quickstart guide
- Prerequisites (Node.js, pnpm, Docker, Git)
- Installation steps
- Repository structure overview
- Available npm scripts
- Environment variables setup
- Local infrastructure (Docker Compose)
- Common development workflows
- Troubleshooting tips

**Đối tượng:** All Developers

**Khi nào đọc:**

- First time setting up project
- Onboarding new team members
- Troubleshooting local environment issues
- Setting up CI/CD

---

### 4. [adr/](adr/)

**Mục đích:** Architecture Decision Records - document các quyết định kiến trúc quan trọng

**Cấu trúc:**

```
adr/
├── 0000-template.md          # Template cho ADR mới
├── 0001-use-nestjs.md        # (Example) Quyết định dùng NestJS
├── 0002-multi-tenant-approach.md
├── 0003-message-queue-choice.md
└── ...
```

**Format ADR:**

```markdown
# [Number]. [Title]

Date: YYYY-MM-DD

## Status

[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## Context

[Mô tả vấn đề và constraints]

## Decision

[Quyết định đã chọn]

## Consequences

[Positive và negative consequences]

## Alternatives Considered

[Các options khác đã xem xét]
```

**Đối tượng:** Architects, Technical Leads, Senior Developers

**Khi nào tạo ADR mới:**

- Quyết định tech stack major
- Thay đổi architectural patterns
- Chọn third-party services/libraries
- Database schema design decisions
- Security/compliance decisions

---

## Cách sử dụng Documentation

### Đọc tài liệu theo role

#### New Developer

1. Đọc [development.md](development.md) - Setup environment
2. Đọc [architecture.md](architecture.md) - Hiểu big picture
3. Đọc [api-conventions.md](api-conventions.md) - Coding standards
4. Browse [adr/](adr/) - Context về major decisions

#### Frontend Developer

1. [development.md](development.md) - Setup
2. [api-conventions.md](api-conventions.md) - API integration
3. `apps/README.md` - Frontend architecture
4. `packages/README.md` - Shared UI components

#### Backend Developer

1. [development.md](development.md) - Setup
2. [architecture.md](architecture.md) - System design
3. [api-conventions.md](api-conventions.md) - API standards
4. `services/README.md` - Service architecture
5. [adr/](adr/) - Decision context

#### DevOps/Infrastructure

1. [development.md](development.md) - Local setup
2. [architecture.md](architecture.md) - Infrastructure needs
3. `infra/README.md` - Infrastructure details
4. [adr/](adr/) - Infra decisions

---

## Contributing to Documentation

### Khi nào update docs?

#### MUST update:

- ✅ Thêm service hoặc app mới
- ✅ Thay đổi API contract
- ✅ Major architectural changes
- ✅ Breaking changes
- ✅ New dependencies hoặc tools
- ✅ Environment variables changes

#### SHOULD update:

- ⚠️ New features với impact to multiple services
- ⚠️ Performance improvements
- ⚠️ Security enhancements
- ⚠️ Deployment procedure changes

#### NICE TO HAVE:

- 💡 Code examples và tutorials
- 💡 Troubleshooting guides
- 💡 Best practices

### Documentation Standards

#### Writing Style

- Dùng tiếng Việt cho internal docs (như hiện tại)
- Clear và concise
- Include code examples
- Use diagrams khi có thể (Mermaid, PlantUML)

#### Markdown Conventions

- Use headings hierarchy properly (h1 → h2 → h3)
- Link to related documents
- Include table of contents cho docs dài
- Use code blocks with language tags
- Add comments trong code examples

#### File Naming

- Use lowercase với hyphens: `my-document.md`
- Prefix numbers cho sequential docs: `01-setup.md`, `02-deploy.md`
- ADRs: `0001-decision-title.md`

---

## Documentation Structure

```
docs/
├── README.md                 # This file - Documentation index
├── architecture.md           # System architecture
├── api-conventions.md        # API design standards
├── development.md            # Development guide
├── adr/                      # Architecture Decision Records
│   ├── 0000-template.md
│   ├── 0001-*.md
│   └── ...
├── guides/                   # (Future) Detailed guides
│   ├── authentication.md
│   ├── testing.md
│   └── deployment.md
├── tutorials/                # (Future) Step-by-step tutorials
│   └── creating-new-service.md
└── diagrams/                 # (Future) Architecture diagrams
    ├── system-overview.png
    └── data-flow.png
```

---

## Useful Links

### External Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Redis Docs](https://redis.io/docs/)
- [Docker Docs](https://docs.docker.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Project Documentation

- Root README: `../README.md`
- Apps: `../apps/README.md`
- Services: `../services/README.md`
- Packages: `../packages/README.md`
- Infrastructure: `../infra/README.md`

### Contributing

- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` - Code of conduct
- `../.github/SECURITY.md` - Security policy
- `CHANGELOG.md` - Project changelog

---

## Creating New Documentation

### Template cho document mới:

```markdown
# [Document Title]

> Brief description của document

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)

## Overview

[High-level overview]

## [Section 1]

[Detailed content]

## [Section 2]

[Detailed content]

## Examples

[Code examples or diagrams]

## References

- [Link 1](url)
- [Link 2](url)
```

### Creating ADR:

```bash
# Copy template
cp docs/adr/0000-template.md docs/adr/0005-your-decision.md

# Edit và fill in:
# - Status: Proposed
# - Context
# - Decision
# - Consequences
# - Alternatives

# Submit for review
git add docs/adr/0005-your-decision.md
git commit -m "docs: add ADR for [decision]"
```

---

## Maintaining Documentation

### Documentation Review Checklist

Khi review PRs, check:

- [ ] Docs updated nếu có changes to APIs
- [ ] New services/apps có README
- [ ] Breaking changes documented
- [ ] Examples still work
- [ ] Links không broken
- [ ] Code snippets có syntax highlighting

### Regular Maintenance

**Monthly:**

- Review và update outdated content
- Check broken links
- Update screenshots/diagrams
- Review ADR statuses

**Per Release:**

- Update CHANGELOG.md
- Update version numbers trong examples
- Review deployment docs
- Update migration guides

---

## Getting Help

### Questions about Documentation?

- Ask in team chat/Slack
- Create GitHub issue với label `documentation`
- Reach out to tech leads

### Improving Documentation

- Submit PR với improvements
- Suggest new topics
- Report unclear sections
- Add examples

---

## Notes

- Documentation is code - keep it in version control
- Update docs BEFORE or TOGETHER WITH code changes, not after
- Good documentation saves time and reduces bugs
- When in doubt, over-document rather than under-document
- Keep docs close to code (README in each folder)
- Link liberally between documents
