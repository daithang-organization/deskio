# Packages

Thư mục này chứa các shared packages và libraries được sử dụng bởi apps và services trong Deskio monorepo.

## Cấu trúc

### 1. Config (`config/`)

**Mục đích:** Shared configuration files cho linting, formatting và TypeScript

**Nội dung:**

- `tsconfig.base.json` - Base TypeScript configuration cho tất cả workspaces
- ESLint configs (nếu có) - Shared ESLint rules
- Prettier configs (nếu có) - Code formatting rules
- Jest configs (nếu có) - Test configuration base

**Sử dụng:**

```json
// Trong tsconfig.json của app/service
{
  "extends": "../../packages/config/tsconfig.base.json",
  "compilerOptions": {
    // Override hoặc thêm configs riêng
  }
}
```

**Lợi ích:**

- Consistency across toàn bộ codebase
- Single source of truth cho configs
- Dễ update configs cho tất cả workspaces

---

### 2. Contracts (`contracts/`)

**Mục đích:** Shared API contracts, types và OpenAPI specifications

**Nội dung:**

- OpenAPI/Swagger specs cho các services
- Shared TypeScript types và interfaces
- API request/response DTOs
- Enums và constants
- Validation schemas

**Cấu trúc:**

```
contracts/
├── identity/
│   ├── types.ts          # User, Workspace, Role types
│   ├── dtos.ts           # LoginDTO, RegisterDTO, etc.
│   └── openapi.yaml      # OpenAPI spec cho identity-service
├── ticket/
│   ├── types.ts          # Ticket, Reply, Status types
│   ├── dtos.ts           # CreateTicketDTO, UpdateTicketDTO, etc.
│   └── openapi.yaml      # OpenAPI spec cho ticket-service
├── kb/
│   ├── types.ts          # Article, Category types
│   ├── dtos.ts           # CreateArticleDTO, etc.
│   └── openapi.yaml      # OpenAPI spec cho kb-service
└── shared/
    ├── enums.ts          # Shared enums (UserRole, TicketStatus, etc.)
    └── common.ts         # Common types (ApiResponse, PaginatedResult, etc.)
```

**Sử dụng:**

```typescript
// Trong frontend app
import { User, LoginDTO } from '@deskio/contracts/identity';
import { Ticket, CreateTicketDTO } from '@deskio/contracts/ticket';

// Trong backend service
import { UserRole } from '@deskio/contracts/shared/enums';
```

**Lợi ích:**

- Type safety giữa frontend và backend
- Single source of truth cho API contracts
- Auto-completion trong IDE
- Dễ dàng generate API clients

---

### 3. UI (`ui/`)

**Mục đích:** Shared UI component library cho các frontend apps

**Nội dung:**

- Reusable React components
- Styled components với consistent design system
- Layout components (Header, Sidebar, Footer)
- Form components (Input, Select, Checkbox, etc.)
- Feedback components (Alert, Toast, Modal, etc.)
- Data display components (Table, Card, Badge, etc.)
- Loading states và skeletons

**Cấu trúc:**

```
ui/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.module.css
│   │   └── index.ts
│   ├── Input/
│   ├── Modal/
│   ├── Table/
│   └── ...
├── layouts/
│   ├── DashboardLayout/
│   └── AuthLayout/
├── hooks/
│   └── useToast.ts
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   └── spacing.ts
└── index.ts
```

**Sử dụng:**

```typescript
// Trong apps
import { Button, Input, Modal } from '@deskio/ui';
import { DashboardLayout } from '@deskio/ui/layouts';

function MyPage() {
  return (
    <DashboardLayout>
      <Button variant="primary">Click me</Button>
      <Input placeholder="Enter text" />
    </DashboardLayout>
  );
}
```

**Tech Stack:**

- React + TypeScript
- TailwindCSS hoặc CSS Modules
- Storybook (optional, for component documentation)

**Lợi ích:**

- Consistent UI/UX across apps
- Faster development (không duplicate components)
- Easier maintenance và updates
- Design system enforcement

---

### 4. Utils (`utils/`)

**Mục đích:** Shared utility functions và helpers

**Nội dung:**

- String manipulation helpers
- Date/time formatters
- Validation helpers
- Error handling utilities
- API client helpers
- Logging utilities
- Common algorithms

**Cấu trúc:**

```
utils/
├── string/
│   ├── slugify.ts
│   ├── truncate.ts
│   └── capitalize.ts
├── date/
│   ├── formatDate.ts
│   └── relativeTime.ts
├── validation/
│   ├── email.ts
│   ├── phone.ts
│   └── password.ts
├── api/
│   ├── httpClient.ts
│   └── errorHandler.ts
├── logger/
│   └── logger.ts
└── index.ts
```

**Sử dụng:**

```typescript
// Import từ apps hoặc services
import { slugify, truncate } from '@deskio/utils/string';
import { formatDate, relativeTime } from '@deskio/utils/date';
import { isValidEmail } from '@deskio/utils/validation';

const slug = slugify('My Article Title'); // "my-article-title"
const short = truncate('Long text...', 50);
const formatted = formatDate(new Date()); // "Jan 24, 2026"
```

**Lợi ích:**

- Code reuse
- Consistent behavior across codebase
- Easier testing (test once, use everywhere)
- Better maintainability

---

## Package Management

### Installation

```bash
# Cài tất cả dependencies (root và workspaces)
pnpm install
```

### Adding Dependencies

#### To a specific package:

```bash
# Add to utils package
pnpm --filter @deskio/utils add lodash

# Add dev dependency to config package
pnpm --filter @deskio/config add -D eslint
```

#### To use package trong workspace:

```json
// Trong package.json của app/service
{
  "dependencies": {
    "@deskio/contracts": "workspace:*",
    "@deskio/ui": "workspace:*",
    "@deskio/utils": "workspace:*"
  }
}
```

### Development

#### Building packages

```bash
# Build tất cả packages
pnpm build

# Build specific package
cd packages/ui && pnpm build
```

#### Testing

```bash
# Test tất cả packages
pnpm test

# Test specific package
cd packages/utils && pnpm test
```

#### Linting

```bash
pnpm lint
```

## Best Practices

### 1. Package Naming

- Use scoped names: `@deskio/package-name`
- Use kebab-case cho package names
- Keep names short và descriptive

### 2. Exports

- Always có clear `index.ts` export file
- Export only public API
- Use named exports (avoid default exports)

```typescript
// ✅ Good
export { Button, ButtonProps } from './components/Button';
export { Input } from './components/Input';

// ❌ Bad
export default Button;
```

### 3. Versioning

- Use `workspace:*` protocol trong dependencies
- Let pnpm handle workspace version resolution

### 4. Documentation

- Add JSDoc comments cho public APIs
- Maintain README trong mỗi package
- Include usage examples

### 5. Testing

- Unit test cho utilities và components
- Maintain high code coverage
- Test edge cases

### 6. Type Safety

- Export types cùng với implementation
- Use strict TypeScript configs
- Avoid `any` types

## Dependencies

### Shared Dependencies

Các dependencies chung nên được installed ở root level:

- TypeScript
- ESLint
- Prettier
- Jest

### Package-specific Dependencies

Mỗi package chỉ nên include dependencies thực sự cần:

- `ui`: react, react-dom
- `utils`: minimal dependencies (lodash, date-fns nếu cần)
- `contracts`: không có runtime dependencies (chỉ types)
- `config`: dev dependencies only

## Publishing (Future)

Nếu muốn publish packages lên npm registry:

```bash
# Build packages
pnpm build

# Publish (từ package directory)
cd packages/ui && pnpm publish
```

**Note:** Hiện tại packages chỉ dùng internal trong monorepo (workspace protocol).

## Troubleshooting

### Issue: Type imports không work

```bash
# Rebuild packages
pnpm build

# Clear cache
pnpm clean
pnpm install
```

### Issue: Changes trong package không reflect

```bash
# Restart dev server sau khi change shared packages
# Hoặc run package in watch mode
cd packages/ui && pnpm dev
```

## Notes

- Packages là foundation của monorepo
- Keep packages focused và single-purpose
- Avoid circular dependencies giữa packages
- Document breaking changes carefully
- Consider backward compatibility khi update packages
