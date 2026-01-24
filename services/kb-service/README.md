# KB Service

Backend service quản lý Knowledge Base (KB) của Deskio platform.

## Mục đích

KB Service chịu trách nhiệm:
- CRUD operations cho Knowledge Base articles
- Article categorization và tagging
- Publish/unpublish workflow
- Search functionality
- Article versioning (optional)
- View tracking và metrics
- Featured articles management

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL với Prisma ORM
- **Search:** PostgreSQL Full-Text Search (hoặc Elasticsearch future)
- **Object Storage:** MinIO/S3 (cho images trong articles)
- **Cache:** Redis
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Jest

## Features

### 1. Article Management
- Create articles (draft mode)
- Edit articles
- Delete articles (soft delete)
- Publish/unpublish articles
- Article versioning (future)
- Rich text content support

### 2. Organization
- Categories management
- Tags/labels
- Featured articles
- Article ordering
- Related articles linking

### 3. Search
- Full-text search trong articles
- Search by category
- Search by tags
- Search results relevance scoring

### 4. Metrics & Analytics
- View count tracking
- Helpful/not helpful votes
- Popular articles
- Search analytics

### 5. Public Access
- Public API cho published articles
- Customer-facing article viewing
- Agent access to all articles (including drafts)

## Project Structure

```
kb-service/
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── articles/
│   │   ├── articles.module.ts
│   │   ├── articles.controller.ts     # /kb/articles endpoints
│   │   ├── articles.service.ts
│   │   ├── entities/
│   │   │   └── article.entity.ts
│   │   └── dto/
│   │       ├── create-article.dto.ts
│   │       ├── update-article.dto.ts
│   │       └── search-article.dto.ts
│   ├── categories/
│   │   ├── categories.module.ts
│   │   ├── categories.controller.ts   # /kb/categories endpoints
│   │   ├── categories.service.ts
│   │   └── entities/
│   │       └── category.entity.ts
│   ├── search/
│   │   ├── search.module.ts
│   │   └── search.service.ts          # Full-text search
│   ├── metrics/
│   │   ├── metrics.module.ts
│   │   └── metrics.service.ts         # Analytics
│   ├── storage/
│   │   ├── storage.module.ts
│   │   └── s3.service.ts              # Image uploads
│   ├── database/
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   └── common/
│       └── guards/
│           ├── public.guard.ts
│           └── admin.guard.ts
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
model Article {
  id          String        @id @default(uuid())
  title       String
  slug        String        @unique
  content     String        @db.Text
  excerpt     String?       @db.Text
  status      ArticleStatus @default(DRAFT)
  
  categoryId  String?
  category    Category?     @relation(fields: [categoryId], references: [id])
  
  tags        String[]
  isFeatured  Boolean       @default(false)
  
  authorId    String
  workspaceId String
  
  viewCount   Int           @default(0)
  helpfulCount Int          @default(0)
  notHelpfulCount Int       @default(0)
  
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  
  images      ArticleImage[]
  votes       ArticleVote[]
  
  @@index([workspaceId])
  @@index([categoryId])
  @@index([status])
  @@index([slug])
  @@fulltext([title, content])
}

model Category {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String?
  icon        String?
  order       Int       @default(0)
  workspaceId String
  
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  
  articles    Article[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  @@index([workspaceId])
  @@index([parentId])
}

model ArticleImage {
  id         String   @id @default(uuid())
  articleId  String
  article    Article  @relation(fields: [articleId], references: [id])
  
  filename   String
  storageKey String   @unique
  url        String
  
  createdAt  DateTime @default(now())
  
  @@index([articleId])
}

model ArticleVote {
  id        String   @id @default(uuid())
  articleId String
  article   Article  @relation(fields: [articleId], references: [id])
  
  userId    String?
  isHelpful Boolean
  feedback  String?  @db.Text
  
  createdAt DateTime @default(now())
  
  @@index([articleId])
  @@unique([articleId, userId])
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

## API Endpoints

### Public Endpoints (No Auth Required)

#### GET `/kb/articles`
List published articles
```typescript
// Query: ?category=slug&tag=security&featured=true&page=1&limit=20
// Response
{
  "data": [
    {
      "id": "uuid",
      "title": "How to Reset Your Password",
      "slug": "how-to-reset-password",
      "excerpt": "Step-by-step guide...",
      "category": {
        "name": "Account Management",
        "slug": "account-management"
      },
      "tags": ["password", "security"],
      "viewCount": 1250,
      "helpfulCount": 45,
      "publishedAt": "2026-01-20T00:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

#### GET `/kb/articles/:slug`
Get article by slug
```typescript
// Response
{
  "id": "uuid",
  "title": "How to Reset Your Password",
  "slug": "how-to-reset-password",
  "content": "<h2>Step 1</h2><p>Go to login page...</p>",
  "excerpt": "Step-by-step guide...",
  "category": {
    "id": "uuid",
    "name": "Account Management"
  },
  "tags": ["password", "security"],
  "author": {
    "name": "Jane Agent"
  },
  "viewCount": 1250,
  "helpfulCount": 45,
  "notHelpfulCount": 3,
  "publishedAt": "2026-01-20T00:00:00Z",
  "relatedArticles": [
    {
      "id": "uuid",
      "title": "Two-Factor Authentication Setup",
      "slug": "2fa-setup"
    }
  ]
}
```

#### GET `/kb/categories`
List all categories
```typescript
// Response
{
  "data": [
    {
      "id": "uuid",
      "name": "Getting Started",
      "slug": "getting-started",
      "icon": "🚀",
      "articleCount": 12,
      "children": [
        {
          "id": "uuid",
          "name": "First Steps",
          "slug": "first-steps",
          "articleCount": 5
        }
      ]
    }
  ]
}
```

#### GET `/kb/search`
Search articles
```typescript
// Query: ?q=password+reset&category=account-management
// Response
{
  "data": [
    {
      "id": "uuid",
      "title": "How to Reset Your Password",
      "slug": "how-to-reset-password",
      "excerpt": "Step-by-step guide...",
      "relevance": 0.95,
      "highlights": [
        "...to <mark>reset</mark> your <mark>password</mark>..."
      ]
    }
  ],
  "meta": {
    "total": 3,
    "query": "password reset"
  }
}
```

#### POST `/kb/articles/:id/vote`
Vote on article helpfulness
```typescript
// Request
{
  "isHelpful": true,
  "feedback": "Very clear and helpful!"
}

// Response
{
  "success": true,
  "helpfulCount": 46,
  "notHelpfulCount": 3
}
```

### Protected Endpoints (Admin/Agent Only)

#### POST `/kb/articles`
Create article (Admin/Agent)
```typescript
// Request
{
  "title": "Troubleshooting Login Issues",
  "slug": "troubleshooting-login",
  "content": "<h2>Common Issues</h2><p>...</p>",
  "excerpt": "Quick fixes for login problems",
  "categoryId": "uuid",
  "tags": ["login", "troubleshooting"],
  "status": "DRAFT",
  "isFeatured": false
}

// Response
{
  "id": "uuid",
  "title": "Troubleshooting Login Issues",
  "slug": "troubleshooting-login",
  "status": "DRAFT",
  "createdAt": "2026-01-24T10:00:00Z"
}
```

#### PATCH `/kb/articles/:id`
Update article (Admin/Agent)
```typescript
// Request
{
  "title": "Updated Title",
  "content": "Updated content...",
  "tags": ["updated", "tags"]
}

// Response
{
  "id": "uuid",
  "title": "Updated Title",
  "updatedAt": "2026-01-24T11:00:00Z"
}
```

#### POST `/kb/articles/:id/publish`
Publish article (Admin)
```typescript
// Response
{
  "id": "uuid",
  "status": "PUBLISHED",
  "publishedAt": "2026-01-24T11:00:00Z"
}
```

#### POST `/kb/articles/:id/unpublish`
Unpublish article (Admin)
```typescript
// Response
{
  "id": "uuid",
  "status": "DRAFT",
  "publishedAt": null
}
```

#### DELETE `/kb/articles/:id`
Delete article (Admin)
```typescript
// Response
{
  "message": "Article archived successfully"
}
```

#### GET `/kb/articles/admin`
Get all articles including drafts (Admin/Agent)
```typescript
// Query: ?status=DRAFT&author=uuid
// Response
{
  "data": [
    {
      "id": "uuid",
      "title": "Draft Article",
      "status": "DRAFT",
      "author": { "name": "Jane Agent" },
      "createdAt": "2026-01-24T10:00:00Z"
    }
  ]
}
```

#### POST `/kb/categories`
Create category (Admin)
```typescript
// Request
{
  "name": "Billing",
  "slug": "billing",
  "description": "Billing and payment articles",
  "icon": "💳",
  "parentId": null
}

// Response
{
  "id": "uuid",
  "name": "Billing",
  "slug": "billing"
}
```

#### POST `/kb/articles/:id/images/upload`
Upload image for article
```typescript
// Multipart form data
// Response
{
  "id": "uuid",
  "url": "https://storage.deskio.com/kb/articles/uuid/image.png",
  "filename": "image.png"
}
```

## Environment Variables

```env
# Server
PORT=3003
NODE_ENV=development

# Database
DATABASE_URL=postgresql://deskio:deskio@localhost:5432/deskio_kb

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# S3/MinIO (for article images)
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=deskio-kb
S3_REGION=us-east-1
S3_FORCE_PATH_STYLE=true

# Identity Service
IDENTITY_SERVICE_URL=http://localhost:3001

# Search
ENABLE_FULLTEXT_SEARCH=true

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

# Seed sample data
npx prisma db seed

# Start development
pnpm dev
```

## Implementation Examples

### Article Service

```typescript
// src/articles/articles.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  async findPublished(filters: any) {
    const { category, tag, featured, page = 1, limit = 20 } = filters;

    const where: any = {
      status: 'PUBLISHED',
      workspaceId: filters.workspaceId,
    };

    if (category) where.category = { slug: category };
    if (tag) where.tags = { has: tag };
    if (featured) where.isFeatured = true;

    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: {
          category: { select: { name: true, slug: true } },
          author: { select: { name: true } },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { publishedAt: 'desc' },
      }),
      this.prisma.article.count({ where }),
    ]);

    return { data, meta: { total, page, limit } };
  }

  async findBySlug(slug: string, workspaceId: string) {
    const article = await this.prisma.article.findFirst({
      where: {
        slug,
        workspaceId,
        status: 'PUBLISHED',
      },
      include: {
        category: true,
        author: { select: { name: true } },
      },
    });

    if (!article) {
      throw new NotFoundException('Article not found');
    }

    // Increment view count
    await this.prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });

    // Get related articles
    const relatedArticles = await this.findRelated(article);

    return { ...article, relatedArticles };
  }

  async create(createArticleDto: CreateArticleDto, authorId: string, workspaceId: string) {
    return this.prisma.article.create({
      data: {
        ...createArticleDto,
        authorId,
        workspaceId,
        slug: this.generateSlug(createArticleDto.title),
      },
    });
  }

  async publish(id: string, workspaceId: string) {
    return this.prisma.article.update({
      where: { id, workspaceId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async findRelated(article: any) {
    // Find articles with similar tags or in same category
    return this.prisma.article.findMany({
      where: {
        id: { not: article.id },
        workspaceId: article.workspaceId,
        status: 'PUBLISHED',
        OR: [
          { categoryId: article.categoryId },
          { tags: { hasSome: article.tags } },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
      },
      take: 3,
    });
  }
}
```

### Search Service

```typescript
// src/search/search.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchArticles(query: string, filters: any) {
    const { category, workspaceId } = filters;

    // PostgreSQL full-text search
    const results = await this.prisma.$queryRaw`
      SELECT 
        id, 
        title, 
        slug, 
        excerpt,
        ts_rank(to_tsvector('english', title || ' ' || content), plainto_tsquery('english', ${query})) as relevance
      FROM "Article"
      WHERE 
        to_tsvector('english', title || ' ' || content) @@ plainto_tsquery('english', ${query})
        AND status = 'PUBLISHED'
        AND "workspaceId" = ${workspaceId}
        ${category ? `AND "categoryId" = ${category}` : ''}
      ORDER BY relevance DESC
      LIMIT 20
    `;

    return {
      data: results,
      meta: {
        total: results.length,
        query,
      },
    };
  }
}
```

### Article Vote

```typescript
// src/articles/articles.controller.ts
@Post(':id/vote')
async voteArticle(
  @Param('id') id: string,
  @Body() voteDto: VoteArticleDto,
  @CurrentUser() user: any,
) {
  await this.prisma.articleVote.upsert({
    where: {
      articleId_userId: {
        articleId: id,
        userId: user?.id || null,
      },
    },
    create: {
      articleId: id,
      userId: user?.id,
      isHelpful: voteDto.isHelpful,
      feedback: voteDto.feedback,
    },
    update: {
      isHelpful: voteDto.isHelpful,
      feedback: voteDto.feedback,
    },
  });

  // Update counts
  const counts = await this.prisma.articleVote.groupBy({
    by: ['isHelpful'],
    where: { articleId: id },
    _count: true,
  });

  const helpfulCount = counts.find(c => c.isHelpful)?._count || 0;
  const notHelpfulCount = counts.find(c => !c.isHelpful)?._count || 0;

  await this.prisma.article.update({
    where: { id },
    data: { helpfulCount, notHelpfulCount },
  });

  return { success: true, helpfulCount, notHelpfulCount };
}
```

## Performance Optimization

- Full-text search indexing
- Cache popular articles với Redis
- CDN cho article images
- Pagination
- Database indexes

## Security

- ✅ Public access cho published articles only
- ✅ Admin/Agent access cho drafts
- ✅ Workspace isolation
- ✅ Input sanitization (prevent XSS in content)
- ✅ Image upload validation

## Troubleshooting

### Issue: Search not working
- Check full-text indexes
- Verify PostgreSQL configuration
- Test queries directly in DB

### Issue: Images not loading
- Check S3/MinIO configuration
- Verify bucket CORS settings
- Check presigned URL generation

## Notes

- Sanitize HTML content to prevent XSS
- Implement article versioning for audit trail
- Cache frequently accessed articles
- Consider Elasticsearch for advanced search
- Regular content reviews and updates
- Monitor article performance metrics
