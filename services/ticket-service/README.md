# Ticket Service

Backend service quản lý toàn bộ ticketing system của Deskio platform.

## Mục đích

Ticket Service là core business service chịu trách nhiệm:
- Ticket CRUD operations
- Ticket workflow và status transitions
- Reply và comment system
- Ticket assignment cho agents
- File attachments management
- Ticket search và filtering
- Priority management
- Activity history tracking

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL với Prisma ORM
- **Object Storage:** MinIO/S3 (cho attachments)
- **Message Queue:** BullMQ + Redis
- **Cache:** Redis
- **Validation:** class-validator
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Jest

## Features

### 1. Ticket Management
- Create tickets
- View ticket details
- Update ticket information
- Delete tickets (soft delete)
- Ticket history tracking
- Duplicate detection

### 2. Ticket Workflow
- Status transitions: Open → In Progress → Resolved → Closed
- Priority levels: Low, Medium, High, Urgent
- Automatic status updates
- SLA tracking (optional MVP)

### 3. Assignment System
- Assign tickets to agents
- Reassign tickets
- Auto-assignment rules (future)
- Workload balancing (future)

### 4. Reply & Comments
- Customer replies
- Agent replies
- Internal notes (agent-only)
- Rich text content
- Notification triggers

### 5. Attachments
- Upload files to tickets/replies
- Multiple file support
- File validation (type, size)
- Secure file storage (S3/MinIO)
- File download links

### 6. Search & Filtering
- Full-text search
- Filter by status, priority, assignee
- Date range filtering
- Customer filtering
- Category/tag filtering

## Project Structure

```
ticket-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── tickets/
│   │   ├── tickets.module.ts
│   │   ├── tickets.controller.ts   # /tickets endpoints
│   │   ├── tickets.service.ts
│   │   ├── entities/
│   │   │   └── ticket.entity.ts
│   │   └── dto/
│   │       ├── create-ticket.dto.ts
│   │       ├── update-ticket.dto.ts
│   │       └── filter-ticket.dto.ts
│   ├── replies/
│   │   ├── replies.module.ts
│   │   ├── replies.service.ts
│   │   ├── entities/
│   │   │   └── reply.entity.ts
│   │   └── dto/
│   │       └── create-reply.dto.ts
│   ├── attachments/
│   │   ├── attachments.module.ts
│   │   ├── attachments.controller.ts
│   │   ├── attachments.service.ts
│   │   └── entities/
│   │       └── attachment.entity.ts
│   ├── notifications/
│   │   ├── notifications.module.ts
│   │   └── notifications.service.ts   # Publish events to queue
│   ├── storage/
│   │   ├── storage.module.ts
│   │   └── s3.service.ts              # S3/MinIO integration
│   ├── database/
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   └── common/
│       ├── guards/
│       │   └── workspace.guard.ts
│       └── interceptors/
│           └── transform.interceptor.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── test/
├── .env.example
└── package.json
```

## Database Schema

```prisma
// prisma/schema.prisma
model Ticket {
  id          String       @id @default(uuid())
  title       String
  description String       @db.Text
  status      TicketStatus @default(OPEN)
  priority    Priority     @default(MEDIUM)
  
  customerId  String
  assignedTo  String?
  workspaceId String
  
  categoryId  String?
  tags        String[]
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
  closedAt    DateTime?
  
  replies     Reply[]
  attachments Attachment[]
  activities  Activity[]
  
  @@index([workspaceId])
  @@index([customerId])
  @@index([assignedTo])
  @@index([status])
  @@index([createdAt])
}

model Reply {
  id         String   @id @default(uuid())
  ticketId   String
  ticket     Ticket   @relation(fields: [ticketId], references: [id])
  
  authorId   String
  content    String   @db.Text
  isInternal Boolean  @default(false)
  
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  
  attachments Attachment[]
  
  @@index([ticketId])
  @@index([authorId])
}

model Attachment {
  id        String   @id @default(uuid())
  filename  String
  fileSize  Int
  mimeType  String
  storageKey String  @unique
  url       String
  
  ticketId  String?
  ticket    Ticket?  @relation(fields: [ticketId], references: [id])
  
  replyId   String?
  reply     Reply?   @relation(fields: [replyId], references: [id])
  
  uploadedBy String
  createdAt  DateTime @default(now())
  
  @@index([ticketId])
  @@index([replyId])
}

model Activity {
  id        String   @id @default(uuid())
  ticketId  String
  ticket    Ticket   @relation(fields: [ticketId], references: [id])
  
  type      ActivityType
  actorId   String
  metadata  Json?
  
  createdAt DateTime @default(now())
  
  @@index([ticketId])
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum ActivityType {
  CREATED
  REPLIED
  ASSIGNED
  REASSIGNED
  STATUS_CHANGED
  PRIORITY_CHANGED
  CLOSED
  REOPENED
}
```

## API Endpoints

### Ticket Operations

#### POST `/tickets`
Create new ticket
```typescript
// Request
{
  "title": "Cannot login to account",
  "description": "I'm getting an error when trying to log in",
  "priority": "HIGH",
  "categoryId": "uuid",
  "attachments": ["file1.jpg", "file2.png"]
}

// Response
{
  "id": "uuid",
  "title": "Cannot login to account",
  "status": "OPEN",
  "priority": "HIGH",
  "customerId": "uuid",
  "createdAt": "2026-01-24T10:00:00Z"
}
```

#### GET `/tickets`
List tickets with filters
```typescript
// Query: ?status=OPEN&priority=HIGH&assignedTo=agent-id&page=1&limit=20
// Response
{
  "data": [
    {
      "id": "uuid",
      "title": "Cannot login",
      "status": "OPEN",
      "priority": "HIGH",
      "customer": {
        "id": "uuid",
        "name": "John Doe"
      },
      "assignedAgent": {
        "id": "uuid",
        "name": "Jane Agent"
      },
      "createdAt": "2026-01-24T10:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20
  }
}
```

#### GET `/tickets/:id`
Get ticket details
```typescript
// Response
{
  "id": "uuid",
  "title": "Cannot login",
  "description": "Full description...",
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "customer": { "id": "uuid", "name": "John Doe", "email": "john@example.com" },
  "assignedAgent": { "id": "uuid", "name": "Jane Agent" },
  "replies": [
    {
      "id": "uuid",
      "content": "Thank you for contacting us...",
      "author": { "name": "Jane Agent" },
      "isInternal": false,
      "createdAt": "2026-01-24T10:05:00Z"
    }
  ],
  "attachments": [
    {
      "id": "uuid",
      "filename": "screenshot.png",
      "url": "https://storage.deskio.com/..."
    }
  ],
  "activities": [
    {
      "type": "CREATED",
      "actor": { "name": "John Doe" },
      "createdAt": "2026-01-24T10:00:00Z"
    },
    {
      "type": "ASSIGNED",
      "actor": { "name": "System" },
      "metadata": { "assignedTo": "Jane Agent" },
      "createdAt": "2026-01-24T10:02:00Z"
    }
  ]
}
```

#### PATCH `/tickets/:id`
Update ticket
```typescript
// Request
{
  "status": "RESOLVED",
  "priority": "MEDIUM"
}

// Response
{
  "id": "uuid",
  "status": "RESOLVED",
  "priority": "MEDIUM",
  "updatedAt": "2026-01-24T11:00:00Z"
}
```

#### POST `/tickets/:id/assign`
Assign ticket to agent
```typescript
// Request
{
  "agentId": "agent-uuid"
}

// Response
{
  "id": "uuid",
  "assignedTo": "agent-uuid",
  "assignedAgent": {
    "id": "agent-uuid",
    "name": "Jane Agent"
  }
}
```

### Reply Operations

#### POST `/tickets/:id/replies`
Add reply to ticket
```typescript
// Request
{
  "content": "Thank you for your patience. The issue is resolved.",
  "isInternal": false,
  "attachments": ["file1.pdf"]
}

// Response
{
  "id": "uuid",
  "content": "Thank you for your patience...",
  "author": {
    "id": "uuid",
    "name": "Jane Agent"
  },
  "isInternal": false,
  "createdAt": "2026-01-24T11:00:00Z"
}
```

#### GET `/tickets/:id/replies`
Get all replies for ticket
```typescript
// Response
{
  "data": [
    {
      "id": "uuid",
      "content": "Reply content...",
      "author": { "name": "Jane Agent" },
      "isInternal": false,
      "attachments": [],
      "createdAt": "2026-01-24T10:05:00Z"
    }
  ]
}
```

### Attachment Operations

#### POST `/attachments/upload`
Upload file
```typescript
// Multipart form data
// file: binary

// Response
{
  "id": "uuid",
  "filename": "screenshot.png",
  "fileSize": 102400,
  "mimeType": "image/png",
  "url": "https://storage.deskio.com/...",
  "storageKey": "tickets/uuid/screenshot.png"
}
```

#### GET `/attachments/:id/download`
Download attachment
```typescript
// Response: File stream
```

## Environment Variables

```env
# Server
PORT=3002
NODE_ENV=development

# Database
DATABASE_URL=postgresql://deskio:deskio@localhost:5432/deskio_tickets

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# S3/MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=deskio
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true

# File Upload
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain

# Identity Service (for auth)
IDENTITY_SERVICE_URL=http://localhost:3001

# CORS
CORS_ORIGIN=http://localhost:3100,http://localhost:3200,http://localhost:3300
```

## Development

### Setup & Run

```bash
# Install dependencies
pnpm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Start development
pnpm dev
```

### Testing

```bash
pnpm test
pnpm test:e2e
pnpm test:cov
```

## Implementation Examples

### Ticket Service

```typescript
// src/tickets/tickets.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateTicketDto } from './dto/create-ticket.dto';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async create(createTicketDto: CreateTicketDto, customerId: string) {
    const ticket = await this.prisma.ticket.create({
      data: {
        ...createTicketDto,
        customerId,
        status: 'OPEN',
      },
      include: {
        customer: true,
      },
    });

    // Publish notification event
    await this.notifications.publishTicketCreated(ticket);

    return ticket;
  }

  async findAll(filters: any, workspaceId: string) {
    const { status, priority, assignedTo, page = 1, limit = 20 } = filters;

    const where: any = { workspaceId };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedTo = assignedTo;

    const [data, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        include: {
          customer: { select: { id: true, name: true, email: true } },
          assignedAgent: { select: { id: true, name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    return {
      data,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, workspaceId: string) {
    const ticket = await this.prisma.ticket.findFirst({
      where: { id, workspaceId },
      include: {
        customer: true,
        assignedAgent: true,
        replies: {
          include: {
            author: true,
            attachments: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        attachments: true,
        activities: {
          include: { actor: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async assign(id: string, agentId: string, workspaceId: string) {
    const ticket = await this.prisma.ticket.update({
      where: { id, workspaceId },
      data: { assignedTo: agentId },
      include: { assignedAgent: true },
    });

    // Log activity
    await this.prisma.activity.create({
      data: {
        ticketId: id,
        type: 'ASSIGNED',
        actorId: agentId,
        metadata: { assignedTo: agentId },
      },
    });

    // Publish notification
    await this.notifications.publishTicketAssigned(ticket);

    return ticket;
  }
}
```

### Notification Service (Event Publisher)

```typescript
// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { InjectQueue } from '@nestjs/bullmq';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectQueue('notifications') private notificationQueue: Queue,
  ) {}

  async publishTicketCreated(ticket: any) {
    await this.notificationQueue.add('ticket.created', {
      ticketId: ticket.id,
      customerId: ticket.customerId,
      title: ticket.title,
    });
  }

  async publishTicketReplied(ticket: any, reply: any) {
    await this.notificationQueue.add('ticket.replied', {
      ticketId: ticket.id,
      replyId: reply.id,
      authorId: reply.authorId,
      isInternal: reply.isInternal,
    });
  }

  async publishTicketAssigned(ticket: any) {
    await this.notificationQueue.add('ticket.assigned', {
      ticketId: ticket.id,
      agentId: ticket.assignedTo,
    });
  }
}
```

### File Upload

```typescript
// src/attachments/attachments.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AttachmentsService } from './attachments.service';

@Controller('attachments')
export class AttachmentsController {
  constructor(private attachmentsService: AttachmentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return this.attachmentsService.upload(file);
  }
}

// src/storage/s3.service.ts
import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class S3Service {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    });
  }

  async uploadFile(key: string, buffer: Buffer, mimeType: string) {
    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    });

    await this.s3Client.send(command);

    return this.getFileUrl(key);
  }

  async getFileUrl(key: string) {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    // Generate presigned URL (valid for 1 hour)
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 });
  }
}
```

## Event-Driven Architecture

Ticket Service publishes events to Redis queue:
- `ticket.created` - When new ticket created
- `ticket.replied` - When reply added
- `ticket.assigned` - When ticket assigned
- `ticket.status_changed` - When status updated

notification-worker subscribes to these events và gửi emails.

## Performance Optimization

- Database indexing (workspaceId, customerId, status)
- Cache frequently accessed data với Redis
- Pagination cho large datasets
- Optimize queries với proper includes
- File upload size limits

## Security

- ✅ Workspace isolation (always filter by workspaceId)
- ✅ File type validation
- ✅ File size limits
- ✅ Secure file storage
- ✅ Presigned URLs cho file access
- ✅ Input validation
- ✅ Authorization checks

## Troubleshooting

### Issue: File upload failed
- Check S3/MinIO configuration
- Verify bucket exists và accessible
- Check file size limits
- Verify file type allowed

### Issue: Notifications not sent
- Check Redis connection
- Verify queue is running
- Check notification-worker logs

## Deployment

Similar to identity-service với Docker container và health checks.

## Notes

- Always include workspaceId in queries (multi-tenant)
- Log all ticket activities
- Implement soft delete cho tickets
- Cache ticket counts và metrics
- Monitor queue performance
- Regular database backups
