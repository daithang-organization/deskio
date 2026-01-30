# Coding Conventions

## TypeScript

### General Rules
- **Strict mode**: Always use strict TypeScript (`strict: true`)
- **No any**: Avoid `any` type, use `unknown` hoặc proper types
- **Explicit types**: Ưu tiên explicit types cho function parameters và return values
- **Type imports**: Use `import type` cho type-only imports

```typescript
// ✅ Good
import type { User } from './types';
export function getUser(id: string): Promise<User> {
  // ...
}

// ❌ Bad
import { User } from './types';
export function getUser(id: any) {
  // ...
}
```

### Interfaces vs Types
- **Interfaces**: Cho object shapes, có thể extend
- **Types**: Cho unions, intersections, complex types

```typescript
// ✅ Interfaces cho objects
interface User {
  id: string;
  email: string;
  role: UserRole;
}

// ✅ Types cho unions/complex
type UserRole = 'ADMIN' | 'AGENT' | 'CUSTOMER';
type ApiResponse<T> = { data: T } | { error: string };
```

### Null vs Undefined
- Use `null` cho intentional absence
- Use `undefined` cho optional/uninitialized
- Prefer `??` (nullish coalescing) over `||`

```typescript
// ✅ Good
function getUser(id: string): User | null {
  return user ?? null;
}

// ✅ Good
interface Config {
  timeout?: number; // optional = undefined
}
```

## Next.js (Frontend)

### File Conventions
- `page.tsx` - Route page
- `layout.tsx` - Layout wrapper
- `loading.tsx` - Loading state
- `error.tsx` - Error boundary
- `not-found.tsx` - 404 page

### Server vs Client Components
- **Default**: Server Components
- **Use 'use client'** only when:
  - Need React hooks (useState, useEffect, etc.)
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (localStorage, etc.)
  - Third-party libraries that need client

```typescript
// ✅ Server Component (default)
export default async function TicketsPage() {
  const tickets = await fetchTickets();
  return <TicketList tickets={tickets} />;
}

// ✅ Client Component (when needed)
'use client';
import { useState } from 'react';

export function TicketFilter() {
  const [status, setStatus] = useState('open');
  // ...
}
```

### Data Fetching
- Server Components: Direct fetch/DB calls
- Client Components: Use SWR or React Query (future)

```typescript
// ✅ Server Component
async function getTickets() {
  const res = await fetch(`${API_URL}/tickets`, {
    cache: 'no-store', // or 'force-cache'
  });
  return res.json();
}

// ✅ Client Component (future)
'use client';
import useSWR from 'swr';

export function useTickets() {
  return useSWR('/api/tickets', fetcher);
}
```

### Routing
- Use App Router (không phải Pages Router)
- Use `Link` component cho navigation
- Use `useRouter` hook cho programmatic navigation

```typescript
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ✅ Declarative
<Link href="/tickets/123">View Ticket</Link>

// ✅ Programmatic
const router = useRouter();
router.push('/tickets/123');
```

## NestJS (Backend)

### Module Structure
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([Ticket])],
  controllers: [TicketController],
  providers: [TicketService],
  exports: [TicketService], // Nếu cần share
})
export class TicketModule {}
```

### Controller Conventions
- RESTful endpoints
- Use decorators: `@Get()`, `@Post()`, `@Patch()`, `@Delete()`
- Use DTOs for validation
- Return appropriate HTTP status codes

```typescript
@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get()
  async findAll(@Query() query: FindTicketsDto) {
    return this.ticketService.findAll(query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateTicketDto) {
    return this.ticketService.create(dto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTicketDto) {
    return this.ticketService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }
}
```

### Service Conventions
- Business logic trong service
- Use dependency injection
- Throw appropriate exceptions

```typescript
@Injectable()
export class TicketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findOne(id: string): Promise<Ticket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException(`Ticket ${id} not found`);
    }

    return ticket;
  }
}
```

### DTOs và Validation
- Use class-validator decorators
- Use class-transformer for transformation
- Separate Create/Update DTOs

```typescript
import { IsString, IsEnum, IsOptional, IsUUID } from 'class-validator';

export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  description: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsUUID()
  workspaceId: string;
}

export class UpdateTicketDto extends PartialType(CreateTicketDto) {}
```

### Exception Handling
- Use built-in exceptions: `NotFoundException`, `BadRequestException`, etc.
- Use global exception filter
- Return consistent error format

```typescript
// ✅ Good
throw new NotFoundException(`Ticket ${id} not found`);
throw new BadRequestException('Invalid ticket status');
throw new ForbiddenException('Insufficient permissions');

// ❌ Bad
throw new Error('Not found');
```

## Database (Prisma)

### Schema Conventions
- Use camelCase for field names
- Use PascalCase for model names
- Always include: `id`, `createdAt`, `updatedAt`
- Use `workspaceId` for multi-tenancy
- Add indexes for frequently queried fields

```prisma
model Ticket {
  id          String   @id @default(uuid())
  title       String
  description String
  status      TicketStatus
  priority    Priority
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id])
  customerId  String
  customer    User      @relation(fields: [customerId], references: [id])
  assigneeId  String?
  assignee    User?     @relation(fields: [assigneeId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([workspaceId, status])
  @@index([customerId])
  @@index([assigneeId])
}
```

### Query Best Practices
- Always filter by `workspaceId`
- Use transactions for multiple operations
- Use `select` để chỉ lấy fields cần thiết
- Use `include` cho relations

```typescript
// ✅ Always scope by workspace
await prisma.ticket.findMany({
  where: {
    workspaceId,
    status: 'OPEN',
  },
  include: {
    customer: true,
    assignee: true,
  },
  orderBy: {
    createdAt: 'desc',
  },
});

// ✅ Use transactions
await prisma.$transaction([
  prisma.ticket.update({ where: { id }, data: { status: 'CLOSED' } }),
  prisma.activity.create({ data: { ticketId: id, type: 'CLOSED' } }),
]);
```

## API Design

### RESTful Conventions
```
GET    /tickets          # List all
GET    /tickets/:id      # Get one
POST   /tickets          # Create
PATCH  /tickets/:id      # Update (partial)
PUT    /tickets/:id      # Replace (full) - rarely used
DELETE /tickets/:id      # Delete
```

### Nested Resources
```
GET    /tickets/:id/replies      # Get ticket replies
POST   /tickets/:id/replies      # Add reply
GET    /tickets/:id/attachments  # Get attachments
```

### Query Parameters
- Filtering: `?status=open&priority=high`
- Pagination: `?page=1&limit=20`
- Sorting: `?sort=createdAt&order=desc`
- Search: `?search=keyword`

### Response Format
```typescript
// ✅ Success (200)
{
  "id": "uuid",
  "title": "Bug report",
  "status": "OPEN",
  "createdAt": "2026-01-26T10:00:00Z"
}

// ✅ List with pagination
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}

// ✅ Error (400, 404, etc.)
{
  "statusCode": 404,
  "message": "Ticket not found",
  "error": "Not Found"
}
```

## Error Handling

### Frontend
```typescript
try {
  const response = await fetch('/api/tickets');
  if (!response.ok) {
    throw new Error('Failed to fetch tickets');
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('Error fetching tickets:', error);
  // Show user-friendly message
  toast.error('Failed to load tickets');
}
```

### Backend
```typescript
try {
  const ticket = await this.ticketService.findOne(id);
  return ticket;
} catch (error) {
  this.logger.error(`Error fetching ticket ${id}`, error);
  if (error instanceof NotFoundException) {
    throw error;
  }
  throw new InternalServerErrorException('Failed to fetch ticket');
}
```

## Testing

### Naming
```typescript
describe('TicketService', () => {
  describe('findOne', () => {
    it('should return a ticket by id', async () => {
      // ...
    });

    it('should throw NotFoundException if ticket not found', async () => {
      // ...
    });
  });
});
```

### AAA Pattern
```typescript
it('should create a ticket', async () => {
  // Arrange
  const dto = { title: 'Test', description: 'Test desc' };

  // Act
  const result = await service.create(dto);

  // Assert
  expect(result).toBeDefined();
  expect(result.title).toBe('Test');
});
```

## Git Conventions

### Commit Messages
Format: `type(scope): subject`

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

Examples:
```
feat(ticket): add priority filter
fix(auth): resolve token expiration issue
docs(api): update ticket endpoints
refactor(ticket-service): extract validation logic
test(ticket): add unit tests for findAll
chore(deps): update dependencies
```

### Branch Naming
- `main` - Production
- `develop` - Development
- `feature/ticket-123-add-filters` - Features
- `fix/ticket-456-fix-auth` - Bug fixes
- `chore/update-deps` - Maintenance

## Code Review Checklist

- [ ] Code follows TypeScript strict mode
- [ ] No `any` types
- [ ] Proper error handling
- [ ] Multi-tenant scope (workspaceId)
- [ ] DTOs validated with class-validator
- [ ] Database queries indexed properly
- [ ] Tests added/updated
- [ ] No console.logs (use logger)
- [ ] Secrets not committed
- [ ] Documentation updated
