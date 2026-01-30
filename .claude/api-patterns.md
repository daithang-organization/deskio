# API Patterns và Best Practices

## REST API Design

### Resource Naming

```
✅ Good - Plural nouns
/tickets
/users
/articles
/workspaces

❌ Bad - Verbs or singular
/getTickets
/ticket
/createUser
```

### HTTP Methods

```
GET     - Retrieve resource(s)         Idempotent, Safe
POST    - Create resource               Not idempotent
PUT     - Replace entire resource       Idempotent
PATCH   - Update partial resource       Not idempotent (depends)
DELETE  - Delete resource                Idempotent
```

### Examples

```typescript
// List resources (paginated)
GET /tickets?page=1&limit=20&status=OPEN

// Get single resource
GET /tickets/:id

// Create resource
POST /tickets
Body: { title: "Bug report", description: "..." }

// Update partial
PATCH /tickets/:id
Body: { status: "CLOSED" }

// Replace entire (rarely used)
PUT /tickets/:id
Body: { title: "...", description: "...", ... }

// Delete
DELETE /tickets/:id

// Nested resources
GET /tickets/:id/replies
POST /tickets/:id/replies
GET /tickets/:id/attachments

// Actions (non-CRUD)
POST /tickets/:id/assign
POST /tickets/:id/close
POST /articles/:id/publish
```

## Request/Response Patterns

### Request Headers

```typescript
// Authentication
Authorization: Bearer <jwt-token>

// Content type
Content-Type: application/json

// Workspace context (optional)
X-Workspace-Id: workspace-uuid

// Request ID (tracking)
X-Request-Id: request-uuid
```

### Request Body Validation

```typescript
// NestJS DTO with class-validator
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority = Priority.MEDIUM;

  @IsUUID()
  workspaceId: string;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[] = [];
}
```

### Success Responses

```typescript
// Single resource (200 OK)
{
  "id": "uuid",
  "title": "Bug report",
  "status": "OPEN",
  "createdAt": "2026-01-26T10:00:00Z",
  "updatedAt": "2026-01-26T10:00:00Z"
}

// Created resource (201 Created)
{
  "id": "uuid",
  "title": "New ticket",
  "createdAt": "2026-01-26T10:00:00Z"
}

// List with pagination (200 OK)
{
  "data": [
    { "id": "1", "title": "Ticket 1" },
    { "id": "2", "title": "Ticket 2" }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}

// No content (204 No Content)
// Empty response body for DELETE

// Accepted (202 Accepted)
// For async operations
{
  "jobId": "job-uuid",
  "status": "pending",
  "message": "Processing started"
}
```

### Error Responses

```typescript
// 400 Bad Request - Validation error
{
  "statusCode": 400,
  "message": [
    "title must be at least 5 characters",
    "description should not be empty"
  ],
  "error": "Bad Request"
}

// 401 Unauthorized - Not authenticated
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}

// 403 Forbidden - Authenticated but no permission
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}

// 404 Not Found
{
  "statusCode": 404,
  "message": "Ticket not found",
  "error": "Not Found"
}

// 409 Conflict - Resource conflict
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}

// 422 Unprocessable Entity - Business logic error
{
  "statusCode": 422,
  "message": "Cannot close ticket with open replies",
  "error": "Unprocessable Entity"
}

// 429 Too Many Requests - Rate limit
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests",
  "retryAfter": 60
}

// 500 Internal Server Error
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

## Pagination Patterns

### Offset-based Pagination

```typescript
// Request
GET /tickets?page=1&limit=20

// Response
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}

// Implementation
async findAll(query: PaginationDto) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;

  const [data, total] = await this.prisma.$transaction([
    this.prisma.ticket.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.ticket.count(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPreviousPage: page > 1,
    },
  };
}
```

### Cursor-based Pagination (Better for real-time data)

```typescript
// Request
GET /tickets?cursor=ticket-uuid&limit=20

// Response
{
  "data": [...],
  "meta": {
    "nextCursor": "next-ticket-uuid",
    "hasMore": true
  }
}

// Implementation
async findAll(query: CursorPaginationDto) {
  const { cursor, limit = 20 } = query;

  const tickets = await this.prisma.ticket.findMany({
    take: limit + 1, // Fetch one extra to check if more exist
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // Skip the cursor itself
    }),
    orderBy: { createdAt: 'desc' },
  });

  const hasMore = tickets.length > limit;
  const data = hasMore ? tickets.slice(0, -1) : tickets;

  return {
    data,
    meta: {
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    },
  };
}
```

## Filtering Patterns

### Query Parameters

```typescript
// Multiple filters
GET /tickets?status=OPEN&priority=HIGH&assigneeId=agent-uuid

// Date ranges
GET /tickets?createdAfter=2026-01-01&createdBefore=2026-01-31

// Search
GET /tickets?search=bug&searchFields=title,description

// Implementation
export class FilterTicketsDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsUUID()
  @IsOptional()
  assigneeId?: string;

  @IsISO8601()
  @IsOptional()
  createdAfter?: string;

  @IsISO8601()
  @IsOptional()
  createdBefore?: string;

  @IsString()
  @IsOptional()
  search?: string;
}

// Service
async findAll(workspaceId: string, filters: FilterTicketsDto) {
  const where = {
    workspaceId,
    ...(filters.status && { status: filters.status }),
    ...(filters.priority && { priority: filters.priority }),
    ...(filters.assigneeId && { assigneeId: filters.assigneeId }),
    ...(filters.createdAfter || filters.createdBefore
      ? {
          createdAt: {
            ...(filters.createdAfter && { gte: new Date(filters.createdAfter) }),
            ...(filters.createdBefore && { lte: new Date(filters.createdBefore) }),
          },
        }
      : {}),
    ...(filters.search
      ? {
          OR: [
            { title: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  return this.prisma.ticket.findMany({ where });
}
```

## Sorting Patterns

```typescript
// Request
GET /tickets?sort=createdAt&order=desc
GET /tickets?sort=priority,createdAt&order=desc,asc

// DTO
export class SortDto {
  @IsString()
  @IsOptional()
  sort?: string = 'createdAt';

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  order?: 'asc' | 'desc' = 'desc';
}

// Implementation
const orderBy = sort.split(',').map((field, index) => ({
  [field]: order.split(',')[index] || 'asc',
}));

const tickets = await this.prisma.ticket.findMany({
  orderBy,
});
```

## Authentication Patterns

### JWT Token Flow

```typescript
// 1. Login
POST /auth/login
Body: { email: "user@example.com", password: "password" }

Response:
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "expiresIn": 3600,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "AGENT"
  }
}

// 2. Use token in subsequent requests
GET /tickets
Headers: { Authorization: "Bearer jwt-token" }

// 3. Refresh token when expired
POST /auth/refresh
Body: { refreshToken: "refresh-token" }

Response:
{
  "accessToken": "new-jwt-token",
  "expiresIn": 3600
}
```

### Guard Implementation

```typescript
// jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw new UnauthorizedException('Invalid token');
    }
    return user;
  }
}

// Controller
@Controller('tickets')
export class TicketController {
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(@Req() req: Request) {
    const user = req.user; // From JWT payload
    const workspaceId = user.workspaceId;
    return this.ticketService.findAll(workspaceId);
  }
}
```

## Authorization Patterns

### Role-based Access Control (RBAC)

```typescript
// roles.decorator.ts
export const Roles = (...roles: UserRole[]) => 
  SetMetadata('roles', roles);

// roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      'roles',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}

// Controller
@Controller('tickets')
export class TicketController {
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.ticketService.remove(id);
  }
}
```

## File Upload Patterns

### Single File Upload

```typescript
// Controller
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async uploadFile(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: UploadDto,
) {
  return this.storageService.upload(file);
}

// Service
async upload(file: Express.Multer.File) {
  // Upload to MinIO/S3
  const key = `uploads/${Date.now()}-${file.originalname}`;
  
  await this.minioClient.putObject(
    'deskio-uploads',
    key,
    file.buffer,
    file.size,
  );

  return {
    id: uuid(),
    filename: file.originalname,
    fileSize: file.size,
    mimeType: file.mimetype,
    storageKey: key,
    url: await this.getPresignedUrl(key),
  };
}
```

### Multiple Files Upload

```typescript
@Post('upload-multiple')
@UseInterceptors(FilesInterceptor('files', 10)) // Max 10 files
async uploadFiles(
  @UploadedFiles() files: Express.Multer.File[],
) {
  const uploaded = await Promise.all(
    files.map((file) => this.storageService.upload(file)),
  );
  return uploaded;
}
```

## Webhooks Pattern

```typescript
// Webhook endpoint
@Post('webhooks/stripe')
async handleStripeWebhook(
  @Body() payload: any,
  @Headers('stripe-signature') signature: string,
) {
  // Verify signature
  const event = this.stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET,
  );

  // Handle event
  switch (event.type) {
    case 'payment_intent.succeeded':
      await this.handlePaymentSuccess(event.data);
      break;
    case 'payment_intent.failed':
      await this.handlePaymentFailed(event.data);
      break;
  }

  return { received: true };
}
```

## Async Operations Pattern

```typescript
// Start async job
@Post('tickets/:id/export')
async exportTicket(@Param('id') id: string) {
  const jobId = await this.exportQueue.add('export-ticket', { 
    ticketId: id 
  });

  return {
    jobId,
    status: 'pending',
    statusUrl: `/jobs/${jobId}`,
  };
}

// Check job status
@Get('jobs/:id')
async getJobStatus(@Param('id') id: string) {
  const job = await this.exportQueue.getJob(id);
  
  return {
    jobId: id,
    status: await job.getState(),
    progress: job.progress(),
    result: job.returnvalue,
  };
}
```

## Versioning Pattern

```typescript
// URL versioning (recommended for Deskio)
@Controller('v1/tickets')
export class TicketsV1Controller {}

@Controller('v2/tickets')
export class TicketsV2Controller {}

// Header versioning (alternative)
@Controller('tickets')
@Version('1')
export class TicketsController {}

// Request
GET /v1/tickets
// or
GET /tickets
Headers: { 'API-Version': '1' }
```

## Rate Limiting Pattern

```typescript
// Install: @nestjs/throttler
import { ThrottlerGuard } from '@nestjs/throttler';

// Global rate limiting
@UseGuards(ThrottlerGuard)
@Controller('tickets')
export class TicketController {}

// Custom rate limit
@Throttle(10, 60) // 10 requests per 60 seconds
@Post()
async create() {}
```

## Caching Pattern

```typescript
// Cache response
@UseInterceptors(CacheInterceptor)
@Get()
async findAll() {
  // Cached for default TTL
}

// Custom TTL
@CacheTTL(60) // 60 seconds
@Get(':id')
async findOne(@Param('id') id: string) {}

// Manual caching
async findOne(id: string) {
  const cacheKey = `ticket:${id}`;
  
  // Try cache first
  const cached = await this.cacheManager.get(cacheKey);
  if (cached) return cached;

  // Fetch from DB
  const ticket = await this.prisma.ticket.findUnique({ where: { id } });

  // Cache for 5 minutes
  await this.cacheManager.set(cacheKey, ticket, 300);

  return ticket;
}
```

## Best Practices Summary

1. **✅ Use plural nouns** for resources
2. **✅ Return appropriate status codes** (200, 201, 204, 400, 404, 500)
3. **✅ Use DTOs** for validation
4. **✅ Paginate** large result sets
5. **✅ Filter by workspaceId** (multi-tenancy)
6. **✅ Authenticate & authorize** all protected endpoints
7. **✅ Handle errors** consistently
8. **✅ Version APIs** when making breaking changes
9. **✅ Document APIs** with OpenAPI/Swagger
10. **✅ Rate limit** public endpoints
