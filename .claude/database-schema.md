# Database Schema

## Overview

Deskio sử dụng PostgreSQL với Prisma ORM. Mỗi service có thể có database riêng hoặc shared database với schema isolation.

## Multi-tenancy Strategy

**Logical Isolation**: Tất cả tables có `workspaceId` column
- ✅ Simple implementation
- ✅ Easy backup/restore
- ✅ Cost effective
- ⚠️ Phải enforce trong application code
- ⚠️ Index cần include workspaceId

## Core Entities

### Workspace (identity-service)

```prisma
model Workspace {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  domain      String?   @unique
  settings    Json?
  plan        Plan      @default(FREE)
  status      WorkspaceStatus @default(ACTIVE)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  users       User[]
  tickets     Ticket[]
  articles    Article[]

  @@index([slug])
}

enum Plan {
  FREE
  STARTER
  BUSINESS
  ENTERPRISE
}

enum WorkspaceStatus {
  ACTIVE
  SUSPENDED
  DELETED
}
```

### User (identity-service)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String    // bcrypt hashed
  name          String
  avatar        String?
  role          UserRole  @default(CUSTOMER)
  status        UserStatus @default(ACTIVE)
  workspaceId   String
  workspace     Workspace @relation(fields: [workspaceId], references: [id])
  emailVerified Boolean   @default(false)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  createdTickets Ticket[] @relation("TicketCreator")
  assignedTickets Ticket[] @relation("TicketAssignee")
  replies       Reply[]
  activities    Activity[]

  @@index([workspaceId, email])
  @@index([workspaceId, role])
  @@index([email])
}

enum UserRole {
  ADMIN
  AGENT
  CUSTOMER
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}
```

### Ticket (ticket-service)

```prisma
model Ticket {
  id          String   @id @default(uuid())
  title       String
  description String   @db.Text
  status      TicketStatus
  priority    Priority
  workspaceId String
  customerId  String
  assigneeId  String?
  categoryId  String?
  tags        String[]
  metadata    Json?    // Custom fields
  closedAt    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  replies     Reply[]
  attachments Attachment[]
  activities  Activity[]
  category    Category? @relation(fields: [categoryId], references: [id])

  @@index([workspaceId, status])
  @@index([workspaceId, customerId])
  @@index([workspaceId, assigneeId])
  @@index([createdAt])
  @@map("tickets")
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
  SPAM
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

### Reply (ticket-service)

```prisma
model Reply {
  id          String   @id @default(uuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id])
  authorId    String
  content     String   @db.Text
  contentHtml String?  @db.Text // Rendered HTML
  isInternal  Boolean  @default(false) // Internal note vs public reply
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  attachments Attachment[]

  @@index([ticketId, createdAt])
  @@map("replies")
}
```

### Attachment (ticket-service)

```prisma
model Attachment {
  id          String   @id @default(uuid())
  filename    String
  fileSize    Int      // bytes
  mimeType    String
  storageKey  String   // S3/MinIO key
  url         String?  // Presigned URL (temporary)
  ticketId    String?
  ticket      Ticket?  @relation(fields: [ticketId], references: [id])
  replyId     String?
  reply       Reply?   @relation(fields: [replyId], references: [id])
  uploadedBy  String
  createdAt   DateTime @default(now())

  @@index([ticketId])
  @@index([replyId])
  @@map("attachments")
}
```

### Category (ticket-service)

```prisma
model Category {
  id          String   @id @default(uuid())
  name        String
  slug        String
  description String?
  icon        String?
  color       String?
  workspaceId String
  parentId    String?  // For nested categories
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tickets     Ticket[]

  @@unique([workspaceId, slug])
  @@index([workspaceId, sortOrder])
  @@map("categories")
}
```

### Activity (ticket-service)

```prisma
model Activity {
  id          String   @id @default(uuid())
  ticketId    String
  ticket      Ticket   @relation(fields: [ticketId], references: [id])
  type        ActivityType
  actorId     String
  metadata    Json?    // Activity-specific data
  createdAt   DateTime @default(now())

  @@index([ticketId, createdAt])
  @@map("activities")
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
  TAGGED
}
```

### Article (kb-service)

```prisma
model Article {
  id          String   @id @default(uuid())
  title       String
  slug        String
  content     String   @db.Text
  contentHtml String   @db.Text
  excerpt     String?
  status      ArticleStatus
  workspaceId String
  authorId    String
  categoryId  String?
  tags        String[]
  viewCount   Int      @default(0)
  helpfulCount Int     @default(0)
  isFeatured  Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  category    ArticleCategory? @relation(fields: [categoryId], references: [id])

  @@unique([workspaceId, slug])
  @@index([workspaceId, status])
  @@index([workspaceId, publishedAt])
  @@map("articles")
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

### ArticleCategory (kb-service)

```prisma
model ArticleCategory {
  id          String   @id @default(uuid())
  name        String
  slug        String
  description String?
  icon        String?
  workspaceId String
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  articles    Article[]

  @@unique([workspaceId, slug])
  @@index([workspaceId, sortOrder])
  @@map("article_categories")
}
```

## Relationships

### One-to-Many
- Workspace → Users (1:N)
- Workspace → Tickets (1:N)
- Ticket → Replies (1:N)
- Ticket → Attachments (1:N)
- Ticket → Activities (1:N)

### Many-to-One
- User → Workspace (N:1)
- Ticket → Customer (N:1)
- Ticket → Assignee (N:1)
- Reply → Ticket (N:1)

### Optional Relations
- Ticket → Assignee (có thể null - unassigned)
- Ticket → Category (có thể null - uncategorized)

## Indexes Strategy

### Always Index
1. **Primary Keys**: Auto-indexed
2. **Foreign Keys**: `workspaceId`, `customerId`, `assigneeId`, etc.
3. **Query Filters**: `status`, `priority`, `role`, etc.
4. **Temporal**: `createdAt`, `updatedAt`, `publishedAt`
5. **Unique Constraints**: `email`, `slug`, etc.

### Composite Indexes
```prisma
@@index([workspaceId, status])        // List tickets by status
@@index([workspaceId, customerId])    // Customer's tickets
@@index([workspaceId, assigneeId])    // Agent's tickets
@@index([workspaceId, createdAt])     // Recent tickets
```

### When NOT to Index
- Rarely queried columns
- High-cardinality unique columns (already have unique index)
- Columns that change frequently (overhead)

## Data Types

### String Fields
- `@db.Text` - Large text (descriptions, content)
- `@db.VarChar(255)` - Limited text (default)
- `String[]` - Array of strings (tags)

### Numbers
- `Int` - Integers (counts, IDs if not UUID)
- `Float` - Decimals (ratings, prices)
- `Decimal` - Precise decimals (money)

### Dates
- `DateTime` - Timestamps
- `@default(now())` - Auto-set on create
- `@updatedAt` - Auto-update on change

### JSON
- `Json` - Flexible metadata/settings
- `Json?` - Optional JSON
- Use for: custom fields, settings, metadata

## Migrations

### Creating Migration
```bash
cd services/[service-name]
npx prisma migrate dev --name add_priority_to_tickets
```

### Applying Migration
```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### Migration Best Practices
1. **Small, focused changes**: One concept per migration
2. **Reversible**: Consider rollback strategy
3. **Data migration**: Use Prisma Client in migration script if needed
4. **Test**: Test migration on staging first
5. **Backup**: Always backup before production migration

## Seeding

### Seed Script
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create default workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Demo Workspace',
      slug: 'demo',
    },
  });

  // Create admin user
  await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: 'hashed_password',
      name: 'Admin User',
      role: 'ADMIN',
      workspaceId: workspace.id,
    },
  });
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
```

### Run Seed
```bash
npx prisma db seed
```

## Query Patterns

### Always Filter by Workspace
```typescript
// ✅ Good
await prisma.ticket.findMany({
  where: { workspaceId },
});

// ❌ Bad - Missing workspace filter
await prisma.ticket.findMany();
```

### Use Transactions
```typescript
await prisma.$transaction([
  prisma.ticket.update({ where: { id }, data: { status: 'CLOSED' } }),
  prisma.activity.create({
    data: { ticketId: id, type: 'CLOSED', actorId },
  }),
]);
```

### Pagination
```typescript
const [tickets, total] = await prisma.$transaction([
  prisma.ticket.findMany({
    where: { workspaceId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' },
  }),
  prisma.ticket.count({ where: { workspaceId } }),
]);
```

### Include Relations Selectively
```typescript
// ✅ Good - Only include what's needed
await prisma.ticket.findUnique({
  where: { id },
  include: {
    customer: { select: { id: true, name: true, email: true } },
    assignee: { select: { id: true, name: true } },
  },
});

// ❌ Bad - Over-fetching
await prisma.ticket.findUnique({
  where: { id },
  include: {
    customer: true,
    assignee: true,
    replies: true,
    activities: true,
    attachments: true,
  },
});
```

## Performance Tips

1. **Use indexes**: Add indexes for frequently queried columns
2. **Limit results**: Always paginate large result sets
3. **Select fields**: Don't fetch entire models if not needed
4. **Avoid N+1**: Use `include` or separate query with `in`
5. **Connection pooling**: Configure Prisma connection pool
6. **Database caching**: Use Redis for frequently accessed data

## Backup Strategy

### Development
- Use `pg_dump` for local backups
- Commit schema.prisma to git

### Production
- Automated daily backups
- Point-in-time recovery enabled
- Test restore procedures regularly
- Store backups in separate region
