# Troubleshooting Guide

## Common Issues và Solutions

### Infrastructure Issues

#### 1. Docker Compose Won't Start

**Triệu chứng:**
```
Error: Cannot connect to Docker daemon
```

**Solutions:**
```bash
# Windows: Kiểm tra Docker Desktop đang chạy
# Check services
Get-Service *docker*

# Restart Docker Desktop
# Hoặc start service
Start-Service com.docker.service

# Verify
docker ps
```

#### 2. PostgreSQL Connection Failed

**Triệu chứng:**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
```bash
# 1. Check container running
docker ps | grep postgres

# 2. Check logs
docker logs deskio-postgres

# 3. Restart container
docker restart deskio-postgres

# 4. Verify connection string
echo $DATABASE_URL

# 5. Test connection
npx prisma db pull

# 6. If still fail, recreate container
docker compose -f infra/docker-compose.yml down
docker compose -f infra/docker-compose.yml up -d postgres
```

#### 3. Redis Connection Issues

**Triệu chứng:**
```
Error: Redis connection to localhost:6379 failed
```

**Solutions:**
```bash
# Check Redis container
docker ps | grep redis

# Check logs
docker logs deskio-redis

# Test connection
docker exec -it deskio-redis redis-cli ping
# Should return: PONG

# Restart Redis
docker restart deskio-redis
```

#### 4. MinIO Upload Fails

**Triệu chứng:**
```
Error: Access Denied
```

**Solutions:**
```bash
# 1. Check MinIO running
docker ps | grep minio

# 2. Check credentials
# Default: minioadmin / minioadmin

# 3. Access console
# http://localhost:9001

# 4. Create bucket if not exists
# Bucket name: deskio-uploads

# 5. Set public policy if needed
```

### Backend Service Issues

#### 5. Service Won't Start - Port in Use

**Triệu chứng:**
```
Error: listen EADDRINUSE: address already in use :::3003
```

**Solutions:**
```bash
# Find process using port
netstat -ano | findstr :3003

# Kill process
taskkill /PID <PID> /F

# Or use different port
# Update PORT in .env
```

#### 6. Prisma Migration Failed

**Triệu chứng:**
```
Error: Migration failed: relation "tickets" already exists
```

**Solutions:**
```bash
# 1. Check migration history
npx prisma migrate status

# 2. Mark as applied (if already applied manually)
npx prisma migrate resolve --applied <migration-name>

# 3. Or reset database (dev only!)
npx prisma migrate reset

# 4. For production: Manual intervention
# - Backup database
# - Apply migration manually
# - Mark as resolved
```

#### 7. Module Not Found

**Triệu chứng:**
```
Error: Cannot find module '@deskio/contracts'
```

**Solutions:**
```bash
# 1. Install dependencies
pnpm install

# 2. Build workspace packages
pnpm build

# 3. If still issue, clear cache
rm -rf node_modules
rm -rf .turbo
pnpm install

# 4. Check workspace config
# Verify pnpm-workspace.yaml includes packages
```

#### 8. Validation Failed

**Triệu chứng:**
```
400 Bad Request: validation failed
```

**Solutions:**
```typescript
// 1. Check DTO definitions
export class CreateTicketDto {
  @IsString()
  @IsNotEmpty()  // ← Make sure decorators are applied
  title: string;
}

// 2. Enable ValidationPipe in main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
}));

// 3. Check request body format
// Frontend: Send correct JSON
fetch('/tickets', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Test' }),
});
```

#### 9. Authentication Failed

**Triệu chứng:**
```
401 Unauthorized
```

**Solutions:**
```bash
# 1. Verify token exists
# Check localStorage/cookies

# 2. Verify token format
# Should be: Bearer <token>

# 3. Check token expiration
# Decode JWT and check exp claim

# 4. Verify JWT secret matches
# Same JWT_SECRET in all services

# 5. Check AuthGuard is applied
@UseGuards(JwtAuthGuard)
@Get()
async findAll() { ... }
```

#### 10. CORS Error

**Triệu chứng:**
```
Access to fetch at 'http://localhost:3003/tickets' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Solutions:**
```typescript
// main.ts
app.enableCors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3010',
  ],
  credentials: true,
});

// Or allow all (dev only!)
app.enableCors();
```

### Frontend Issues

#### 11. Next.js Build Failed

**Triệu chứng:**
```
Error: TypeScript errors found
```

**Solutions:**
```bash
# 1. Check TypeScript errors
pnpm typecheck

# 2. Fix errors or use skipLibCheck (temporary)
# tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true
  }
}

# 3. Clear Next.js cache
rm -rf .next
pnpm dev
```

#### 12. Hydration Error

**Triệu chứng:**
```
Error: Hydration failed because the initial UI does not match
```

**Solutions:**
```typescript
// Common causes:

// 1. Different server/client rendering
// ❌ Bad
<div>{new Date().toISOString()}</div>

// ✅ Good
'use client';
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return null;

// 2. Invalid HTML nesting
// ❌ Bad: <p> inside <p>
// ✅ Good: Use <div> or appropriate elements

// 3. Using browser-only APIs in Server Component
// Move to Client Component with 'use client'
```

#### 13. API Call Failed from Frontend

**Triệu chứng:**
```
TypeError: Failed to fetch
```

**Solutions:**
```typescript
// 1. Check API URL
console.log(process.env.NEXT_PUBLIC_API_URL);

// 2. Check service is running
// curl http://localhost:3003/tickets

// 3. Handle errors properly
try {
  const response = await fetch('/api/tickets');
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('Fetch error:', error);
  // Show user-friendly message
}

// 4. Check CORS (see #10)

// 5. Check authentication headers
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json',
}
```

#### 14. Environment Variables Not Working

**Triệu chứng:**
```
undefined value for process.env.NEXT_PUBLIC_API_URL
```

**Solutions:**
```bash
# 1. Check .env.local exists
ls -la .env*

# 2. Check prefix for client-side
# Must start with NEXT_PUBLIC_
NEXT_PUBLIC_API_URL=http://localhost:3003

# 3. Restart dev server
# Changes to .env require restart

# 4. Verify in browser
console.log(process.env.NEXT_PUBLIC_API_URL);
```

#### 15. Image Not Loading

**Triệu chứng:**
```
Error: Invalid src prop
```

**Solutions:**
```typescript
// 1. Add domain to next.config.ts
const nextConfig = {
  images: {
    domains: ['localhost', 'example.com'],
  },
};

// 2. Use next/image properly
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={100}
  height={100}
/>

// 3. For external images, add domain
```

### Database Issues

#### 16. Database Query Slow

**Triệu chứng:**
- API responses > 1 second
- High database CPU usage

**Solutions:**
```typescript
// 1. Add indexes
@@index([workspaceId, status])
@@index([createdAt])

// 2. Limit results
.findMany({
  take: 20,  // Pagination
})

// 3. Select only needed fields
.findMany({
  select: {
    id: true,
    title: true,
    // Don't fetch large fields if not needed
  },
})

// 4. Avoid N+1 queries
// ❌ Bad
for (const ticket of tickets) {
  const customer = await getCustomer(ticket.customerId);
}

// ✅ Good
const tickets = await prisma.ticket.findMany({
  include: { customer: true },
});

// 5. Use Prisma query analyzer
// Enable logging in schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}
```

#### 17. Data Not Saved

**Triệu chứng:**
- Create/update returns success but data not in DB

**Solutions:**
```typescript
// 1. Check transaction
await prisma.$transaction([
  prisma.ticket.create({ data }),
  // If this fails, first one rolls back
]);

// 2. Check validation
// Make sure DTO validation passes

// 3. Check constraints
// Unique constraints, foreign keys

// 4. Check commit
await prisma.ticket.create({ data });
// No need to commit - Prisma auto-commits

// 5. Check database
// Query directly to verify
SELECT * FROM tickets WHERE id = '...';
```

#### 18. Foreign Key Constraint Failed

**Triệu chứng:**
```
Foreign key constraint failed on the field: customerId
```

**Solutions:**
```typescript
// 1. Verify referenced record exists
const customer = await prisma.user.findUnique({
  where: { id: customerId },
});

if (!customer) {
  throw new NotFoundException('Customer not found');
}

// 2. Create in correct order
// First create user, then ticket

// 3. Use transactions
await prisma.$transaction([
  prisma.user.create({ data: userData }),
  prisma.ticket.create({ data: ticketData }),
]);
```

### Performance Issues

#### 19. High Memory Usage

**Solutions:**
```typescript
// 1. Limit query results
const tickets = await prisma.ticket.findMany({
  take: 100,
  skip: 0,
});

// 2. Stream large results
for await (const ticket of largeQuery) {
  // Process one at a time
}

// 3. Clear unused variables
let largeData = await fetchLargeData();
processData(largeData);
largeData = null; // Allow garbage collection

// 4. Use pagination
// Don't load all records at once
```

#### 20. Slow Build Times

**Solutions:**
```bash
# 1. Use Turbo cache
pnpm build

# 2. Build only changed packages
pnpm build --filter=...changed

# 3. Clear cache if issues
rm -rf .turbo
rm -rf node_modules/.cache

# 4. Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" pnpm build
```

## Debugging Tools

### Backend
```bash
# NestJS Logger
this.logger.debug('Debug message', context);
this.logger.log('Info message');
this.logger.warn('Warning');
this.logger.error('Error', trace);

# Prisma Logging
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

# VS Code Debugger
# Add to .vscode/launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Service",
  "program": "${workspaceFolder}/services/ticket-service/src/main.ts",
  "preLaunchTask": "tsc: build - tsconfig.json",
}
```

### Frontend
```typescript
// Console logging
console.log('Data:', data);
console.table(array);
console.group('Group name');
console.groupEnd();

// React DevTools
// Install browser extension

// Network inspection
// Chrome DevTools > Network tab

// Performance profiling
// Chrome DevTools > Performance tab
```

### Database
```bash
# Connect to PostgreSQL
docker exec -it deskio-postgres psql -U postgres -d deskio

# Common queries
\dt              # List tables
\d tickets       # Describe table
\x               # Expanded display toggle

SELECT * FROM tickets WHERE workspace_id = '...' LIMIT 10;
EXPLAIN ANALYZE SELECT ...;  # Query plan

# Check indexes
SELECT indexname, indexdef FROM pg_indexes 
WHERE tablename = 'tickets';
```

## Getting Help

1. **Check logs first**: Service logs, database logs, browser console
2. **Search error message**: Google/StackOverflow often has solutions
3. **Check documentation**: NestJS docs, Next.js docs, Prisma docs
4. **Ask team**: Someone may have seen the issue before
5. **Create minimal reproduction**: Isolate the problem
6. **Check GitHub issues**: Known bugs/issues in dependencies

## Prevention

1. **Write tests**: Catch issues early
2. **Use TypeScript strict mode**: Catch type errors
3. **Validate inputs**: Use DTOs and class-validator
4. **Handle errors**: Try-catch and proper error responses
5. **Log appropriately**: Debug/info/warn/error at right levels
6. **Monitor**: Set up logging and monitoring in production
7. **Code review**: Catch issues before merge
8. **Documentation**: Keep docs updated
