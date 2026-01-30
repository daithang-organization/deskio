# Common Workflows

## Development Workflows

### 1. Starting a New Feature

```bash
# 1. Create feature branch
git checkout -b feature/ticket-123-add-priority-filter

# 2. Start infrastructure
pnpm infra:up

# 3. Start relevant services
pnpm dev:ticket    # If working on ticket-service
pnpm dev:identity  # If auth needed

# 4. Start relevant app
pnpm dev:agent     # If working on agent-console

# 5. Make changes...

# 6. Test locally
pnpm test

# 7. Commit with conventional commits
git add .
git commit -m "feat(ticket): add priority filter to ticket list"

# 8. Push and create PR
git push origin feature/ticket-123-add-priority-filter
```

### 2. Adding a New API Endpoint

**Backend (NestJS Service):**

```bash
# 1. Create DTO
# services/ticket-service/src/ticket/dto/find-tickets.dto.ts
```

```typescript
export class FindTicketsDto {
  @IsEnum(TicketStatus)
  @IsOptional()
  status?: TicketStatus;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}
```

```typescript
// 2. Add controller method
@Get()
async findAll(
  @Query() query: FindTicketsDto,
  @Req() req: Request,
) {
  const workspaceId = req.user.workspaceId;
  return this.ticketService.findAll(workspaceId, query);
}

// 3. Implement service method
async findAll(workspaceId: string, query: FindTicketsDto) {
  const { status, priority, page = 1, limit = 20 } = query;
  
  const where = {
    workspaceId,
    ...(status && { status }),
    ...(priority && { priority }),
  };

  const [tickets, total] = await this.prisma.$transaction([
    this.prisma.ticket.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: { select: { id: true, name: true, email: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.ticket.count({ where }),
  ]);

  return {
    data: tickets,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// 4. Test the endpoint
curl http://localhost:3003/tickets?status=OPEN&priority=HIGH&page=1&limit=20
```

**Frontend (Next.js App):**

```typescript
// 5. Create API client function
// apps/agent-console/src/lib/api/tickets.ts
export async function getTickets(params: FindTicketsParams) {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(
    `${API_BASE_URL}/tickets?${searchParams}`,
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
  return response.json();
}

// 6. Use in Server Component
export default async function TicketsPage({ searchParams }) {
  const tickets = await getTickets(searchParams);
  return <TicketList tickets={tickets} />;
}

// Or in Client Component with state
'use client';
export function TicketList() {
  const [tickets, setTickets] = useState([]);
  
  useEffect(() => {
    getTickets({ status: 'OPEN' }).then(setTickets);
  }, []);
  
  return <div>{/* render */}</div>;
}
```

### 3. Adding a New Database Table

```bash
# 1. Update Prisma schema
# services/ticket-service/prisma/schema.prisma
```

```prisma
model Label {
  id          String   @id @default(uuid())
  name        String
  color       String
  workspaceId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([workspaceId, name])
  @@index([workspaceId])
  @@map("labels")
}
```

```bash
# 2. Create migration
cd services/ticket-service
npx prisma migrate dev --name add_labels_table

# 3. Generate Prisma Client
npx prisma generate

# 4. Create module/service/controller
nest g module label
nest g service label
nest g controller label

# 5. Implement CRUD operations in service
# 6. Add endpoints in controller
# 7. Test locally
```

### 4. Updating an Existing Table

```bash
# 1. Modify schema
# Add new field: metadata Json?

# 2. Create migration
npx prisma migrate dev --name add_metadata_to_tickets

# 3. Update TypeScript types if needed

# 4. Update queries to include new field

# 5. Deploy migration to staging/production
npx prisma migrate deploy
```

### 5. Adding Environment Variable

```bash
# 1. Add to .env.example
NEW_API_KEY=your-api-key-here

# 2. Add to local .env
NEW_API_KEY=actual-key-value

# 3. Add to config module (NestJS)
```

```typescript
// src/config/configuration.ts
export default () => ({
  newApiKey: process.env.NEW_API_KEY,
});

// 4. Use in service
constructor(private configService: ConfigService) {}

const apiKey = this.configService.get<string>('newApiKey');
```

```bash
# 5. Add to CI/CD secrets
# GitHub: Settings > Secrets > Actions
# Add NEW_API_KEY

# 6. Update deployment configs
# k8s/secrets.yaml or similar
```

### 6. Creating a New React Component

```bash
# 1. Create component file
# apps/agent-console/src/components/TicketCard.tsx
```

```typescript
interface TicketCardProps {
  ticket: Ticket;
  onSelect?: (ticket: Ticket) => void;
}

export function TicketCard({ ticket, onSelect }: TicketCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{ticket.title}</h3>
      <p className="text-sm text-gray-600">{ticket.description}</p>
      {onSelect && (
        <button onClick={() => onSelect(ticket)}>
          View Details
        </button>
      )}
    </div>
  );
}
```

```bash
# 2. Use component in page
```

```typescript
import { TicketCard } from '@/components/TicketCard';

export default function TicketsPage() {
  return (
    <div>
      {tickets.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
```

### 7. Debugging Backend Service

```bash
# 1. Add logging
this.logger.debug('Fetching tickets', { workspaceId, filters });

# 2. Check service logs
docker compose -f infra/docker-compose.yml logs -f

# 3. Use NestJS dev mode (watch mode)
pnpm dev:ticket  # Auto-restarts on changes

# 4. Add breakpoint (VS Code)
# Set breakpoint in .ts file
# Run debugger (F5)

# 5. Check database directly
docker exec -it deskio-postgres psql -U postgres -d deskio
SELECT * FROM tickets WHERE workspace_id = '...';
```

### 8. Debugging Frontend App

```bash
# 1. Use console.log / debugger
console.log('Tickets:', tickets);
debugger; // Pauses execution

# 2. React DevTools
# Install browser extension
# Inspect component props/state

# 3. Network tab
# Check API calls in browser DevTools
# Verify request/response

# 4. Next.js Dev Tools
# See server/client components
# Check rendering info
```

## Deployment Workflows

### 1. Local to Staging

```bash
# 1. Merge to develop branch
git checkout develop
git merge feature/ticket-123-add-priority-filter

# 2. Push to trigger CI
git push origin develop

# 3. CI runs:
# - Linting
# - Type checking
# - Tests
# - Build

# 4. If pass, auto-deploy to staging

# 5. Verify on staging
# Test manually or run E2E tests
```

### 2. Staging to Production

```bash
# 1. Create release PR
git checkout main
git merge develop

# 2. Update docs/CHANGELOG.md
# Add release notes

# 3. Create git tag
git tag -a v1.2.0 -m "Release v1.2.0"
git push origin v1.2.0

# 4. CI deploys to production

# 5. Monitor logs and metrics
```

### 3. Database Migration in Production

```bash
# 1. Backup database
pg_dump -h prod-db -U user -d deskio > backup-$(date +%Y%m%d).sql

# 2. Test migration on staging first

# 3. Run migration during maintenance window
npx prisma migrate deploy

# 4. Verify migration
psql -h prod-db -U user -d deskio
\dt  # List tables
\d tickets  # Describe table

# 5. Rollback if issues
# Restore from backup
psql -h prod-db -U user -d deskio < backup-20260126.sql
```

## Testing Workflows

### 1. Unit Testing

```bash
# Run all tests
pnpm test

# Run specific service tests
cd services/ticket-service
pnpm test

# Run with coverage
pnpm test:cov

# Watch mode
pnpm test:watch
```

### 2. Integration Testing

```typescript
// ticket.service.spec.ts
describe('TicketService Integration', () => {
  let service: TicketService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TicketService, PrismaService],
    }).compile();

    service = module.get(TicketService);
    prisma = module.get(PrismaService);
  });

  it('should create and retrieve ticket', async () => {
    const dto = { title: 'Test', description: 'Test' };
    const created = await service.create(dto);
    const retrieved = await service.findOne(created.id);
    expect(retrieved).toEqual(created);
  });
});
```

### 3. E2E Testing (Future)

```typescript
// ticket.e2e-spec.ts
describe('Ticket API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  it('/tickets (POST)', () => {
    return request(app.getHttpServer())
      .post('/tickets')
      .send({ title: 'Test', description: 'Test' })
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toBeDefined();
      });
  });
});
```

## Troubleshooting Workflows

### 1. Service Won't Start

```bash
# Check port availability
netstat -ano | findstr :3003

# Check dependencies
pnpm install

# Check environment variables
cat .env

# Check database connection
npx prisma db pull

# Check logs
pnpm dev:ticket  # See error output
```

### 2. Database Connection Issues

```bash
# Check PostgreSQL is running
docker ps | grep postgres

# Check connection string
echo $DATABASE_URL

# Test connection
npx prisma db pull

# Restart database
docker restart deskio-postgres
```

### 3. API Returns 500 Error

```bash
# 1. Check service logs
# Look for stack traces

# 2. Check database
# Verify data exists

# 3. Add more logging
this.logger.error('Error details', error);

# 4. Use debugger
# Set breakpoint at error source

# 5. Check authentication
# Verify token is valid
```

### 4. Frontend Can't Connect to Backend

```bash
# 1. Check CORS settings
# Verify origin is allowed

# 2. Check URL
console.log(API_BASE_URL);

# 3. Check network tab
# See actual request/response

# 4. Check authentication
# Verify token in headers

# 5. Try curl
curl -H "Authorization: Bearer TOKEN" http://localhost:3003/tickets
```

## Git Workflows

### Feature Development

```bash
# 1. Pull latest
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/description

# 3. Make changes + commits
git add .
git commit -m "feat: description"

# 4. Push and create PR
git push origin feature/description

# 5. Request review
# Wait for approval

# 6. Merge to develop
# Delete feature branch
```

### Hotfix

```bash
# 1. Branch from main
git checkout main
git checkout -b hotfix/critical-bug

# 2. Fix issue
git add .
git commit -m "fix: critical bug"

# 3. Merge to main AND develop
git checkout main
git merge hotfix/critical-bug
git checkout develop
git merge hotfix/critical-bug

# 4. Deploy immediately
git tag -a v1.2.1 -m "Hotfix v1.2.1"
git push --tags
```
