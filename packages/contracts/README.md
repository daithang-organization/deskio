# Contracts Package

Shared API contracts, TypeScript types và OpenAPI specifications cho Deskio platform.

## Mục đích

Contracts package là **single source of truth** cho:
- API request/response types
- Shared data models
- OpenAPI/Swagger specifications
- DTOs (Data Transfer Objects)
- Enums và constants

Được sử dụng bởi cả frontend apps và backend services để ensure type safety và consistency.

## Structure

```
contracts/
├── identity/
│   ├── types.ts              # User, Workspace, Session types
│   ├── dtos.ts               # LoginDTO, RegisterDTO, etc.
│   └── openapi.yaml          # OpenAPI spec for identity-service
├── ticket/
│   ├── types.ts              # Ticket, Reply, Attachment types
│   ├── dtos.ts               # CreateTicketDTO, UpdateTicketDTO, etc.
│   └── openapi.yaml          # OpenAPI spec for ticket-service
├── kb/
│   ├── types.ts              # Article, Category types
│   ├── dtos.ts               # CreateArticleDTO, etc.
│   └── openapi.yaml          # OpenAPI spec for kb-service
├── shared/
│   ├── enums.ts              # Shared enums
│   ├── common.ts             # Common types
│   └── api-response.ts       # Standard API response types
├── index.ts                  # Main export file
└── README.md
```

## Usage

### In Frontend Apps

```typescript
// Import types
import { User, Ticket, Article } from '@deskio/contracts';
import { LoginDTO, CreateTicketDTO } from '@deskio/contracts';
import { UserRole, TicketStatus } from '@deskio/contracts/shared/enums';

// Use in components
function LoginForm() {
  const [credentials, setCredentials] = useState<LoginDTO>({
    email: '',
    password: '',
  });

  const handleLogin = async () => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    const user: User = await response.json();
  };
}
```

### In Backend Services

```typescript
// Import DTOs for validation
import { CreateTicketDto } from '@deskio/contracts/ticket';
import { UserRole } from '@deskio/contracts/shared/enums';

// Use in controllers
@Post()
async createTicket(@Body() createTicketDto: CreateTicketDto) {
  return this.ticketsService.create(createTicketDto);
}

// Use in guards
@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: UserRole[] = this.reflector.get('roles', context.getHandler());
    // ...
  }
}
```

## Type Definitions

### Identity Types

```typescript
// identity/types.ts
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  workspaceId: string;
  workspace?: Workspace;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}
```

### Identity DTOs

```typescript
// identity/dtos.ts
export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
  workspaceSlug: string;
}

export interface CreateUserDTO {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  workspaceId: string;
}

export interface UpdateUserDTO {
  name?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}
```

### Ticket Types

```typescript
// ticket/types.ts
export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  customerId: string;
  customer?: User;
  assignedTo?: string;
  assignedAgent?: User;
  workspaceId: string;
  categoryId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
  replies?: Reply[];
  attachments?: Attachment[];
  activities?: Activity[];
}

export interface Reply {
  id: string;
  ticketId: string;
  authorId: string;
  author?: User;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  url: string;
  storageKey: string;
  uploadedBy: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  ticketId: string;
  type: ActivityType;
  actorId: string;
  actor?: User;
  metadata?: Record<string, any>;
  createdAt: string;
}
```

### Ticket DTOs

```typescript
// ticket/dtos.ts
export interface CreateTicketDTO {
  title: string;
  description: string;
  priority?: Priority;
  categoryId?: string;
  tags?: string[];
  attachments?: string[];
}

export interface UpdateTicketDTO {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: Priority;
  categoryId?: string;
  tags?: string[];
}

export interface CreateReplyDTO {
  ticketId: string;
  content: string;
  isInternal?: boolean;
  attachments?: string[];
}

export interface AssignTicketDTO {
  agentId: string;
}

export interface FilterTicketDTO {
  status?: TicketStatus;
  priority?: Priority;
  assignedTo?: string;
  customerId?: string;
  categoryId?: string;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}
```

### KB Types

```typescript
// kb/types.ts
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: ArticleStatus;
  categoryId?: string;
  category?: Category;
  tags: string[];
  isFeatured: boolean;
  authorId: string;
  author?: User;
  workspaceId: string;
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}
```

### KB DTOs

```typescript
// kb/dtos.ts
export interface CreateArticleDTO {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  status?: ArticleStatus;
  isFeatured?: boolean;
}

export interface UpdateArticleDTO {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  categoryId?: string;
  tags?: string[];
  isFeatured?: boolean;
}

export interface SearchArticlesDTO {
  query: string;
  category?: string;
  tags?: string[];
  page?: number;
  limit?: number;
}

export interface VoteArticleDTO {
  isHelpful: boolean;
  feedback?: string;
}

export interface CreateCategoryDTO {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: string;
}
```

### Shared Enums

```typescript
// shared/enums.ts
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  CUSTOMER = 'CUSTOMER',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ActivityType {
  CREATED = 'CREATED',
  REPLIED = 'REPLIED',
  ASSIGNED = 'ASSIGNED',
  REASSIGNED = 'REASSIGNED',
  STATUS_CHANGED = 'STATUS_CHANGED',
  PRIORITY_CHANGED = 'PRIORITY_CHANGED',
  CLOSED = 'CLOSED',
  REOPENED = 'REOPENED',
}

export enum ArticleStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}
```

### Common Types

```typescript
// shared/common.ts
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;
```

## OpenAPI Specifications

### Example: Identity Service

```yaml
# identity/openapi.yaml
openapi: 3.0.0
info:
  title: Identity Service API
  version: 1.0.0
  description: Authentication and user management

paths:
  /auth/login:
    post:
      summary: User login
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LoginDTO'
      responses:
        '200':
          description: Login successful
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/LoginResponse'

components:
  schemas:
    LoginDTO:
      type: object
      required:
        - email
        - password
      properties:
        email:
          type: string
          format: email
        password:
          type: string
          format: password

    User:
      type: object
      properties:
        id:
          type: string
          format: uuid
        email:
          type: string
        name:
          type: string
        role:
          $ref: '#/components/schemas/UserRole'

    UserRole:
      type: string
      enum: [ADMIN, AGENT, CUSTOMER]
```

## Package Configuration

```json
// package.json
{
  "name": "@deskio/contracts",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "watch": "tsc --watch",
    "lint": "eslint src --ext .ts",
    "validate": "openapi-generator validate -i **/openapi.yaml"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@openapitools/openapi-generator-cli": "^2.7.0"
  }
}
```

## Development Workflow

### Adding New Types

1. Define types trong appropriate folder
2. Export trong `index.ts`
3. Update OpenAPI spec if needed
4. Build package: `pnpm build`
5. Test trong consuming workspace

### Updating Existing Types

1. Make changes to type definitions
2. Update version if breaking change
3. Update consuming code
4. Test thoroughly

### Validation

```bash
# Validate OpenAPI specs
pnpm validate

# Type check
pnpm build

# Lint
pnpm lint
```

## Best Practices

### Type Definitions
- ✅ Use interfaces over types for objects
- ✅ Export all public types
- ✅ Use enums for fixed values
- ✅ Add JSDoc comments
- ✅ Keep types minimal và focused

### DTOs
- ✅ Separate create/update DTOs
- ✅ Use optional properties appropriately
- ✅ Document validation rules
- ✅ Match backend validation

### Enums
- ✅ Use string enums (not numeric)
- ✅ Use UPPER_SNAKE_CASE
- ✅ Document enum values

### Versioning
- ✅ Semantic versioning
- ✅ Breaking changes = major version bump
- ✅ New types = minor version bump
- ✅ Bug fixes = patch version bump

## Notes

- Always build before committing
- Keep types in sync with backend schemas
- Update OpenAPI specs when API changes
- Use strict TypeScript
- Avoid `any` types
- Document complex types
- Test type changes thoroughly
