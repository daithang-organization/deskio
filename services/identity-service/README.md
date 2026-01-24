# Identity Service

Backend service quản lý authentication, authorization và user management cho Deskio platform.

## Mục đích

Identity Service là core service chịu trách nhiệm:
- User authentication (login/logout/register)
- JWT token generation và validation
- RBAC implementation (Admin/Agent/Customer roles)
- User CRUD operations
- Workspace management (multi-tenant)
- Password reset và email verification
- Session management

## Tech Stack

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL với Prisma ORM
- **Authentication:** JWT (passport-jwt)
- **Password Hashing:** bcrypt
- **Validation:** class-validator, class-transformer
- **API Documentation:** Swagger/OpenAPI
- **Testing:** Jest

## Features

### 1. Authentication
- User login với email/password
- JWT token generation (access + refresh tokens)
- Token validation và refresh
- Logout (token invalidation)
- Password hashing với bcrypt
- Account lockout sau multiple failed attempts (optional)

### 2. User Registration
- Self-registration cho customers
- Email verification
- Welcome email notification
- Default role assignment (CUSTOMER)

### 3. User Management
- CRUD operations cho users
- Role assignment (Admin only)
- User activation/deactivation
- Profile updates
- Password change
- Password reset flow

### 4. Workspace Management
- Multi-tenant workspace isolation
- Workspace CRUD
- Workspace membership
- Workspace settings

### 5. RBAC (Role-Based Access Control)
- Three roles: ADMIN, AGENT, CUSTOMER
- Permission checking middleware
- Role-based route guards

## Project Structure

```
identity-service/
├── src/
│   ├── main.ts                     # Application entry point
│   ├── app.module.ts               # Root module
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts      # /auth endpoints
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts
│   │   │   └── roles.decorator.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       └── token.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts     # /users endpoints
│   │   ├── users.service.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   ├── workspaces/
│   │   ├── workspaces.module.ts
│   │   ├── workspaces.controller.ts # /workspaces endpoints
│   │   ├── workspaces.service.ts
│   │   ├── entities/
│   │   │   └── workspace.entity.ts
│   │   └── dto/
│   │       ├── create-workspace.dto.ts
│   │       └── update-workspace.dto.ts
│   ├── database/
│   │   ├── database.module.ts
│   │   └── prisma.service.ts
│   ├── common/
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts
│   │   ├── interceptors/
│   │   │   └── logging.interceptor.ts
│   │   └── pipes/
│   │       └── validation.pipe.ts
│   └── config/
│       └── configuration.ts
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Seed data
├── test/
│   ├── unit/
│   └── e2e/
├── .env.example
├── nest-cli.json
├── tsconfig.json
└── package.json
```

## Database Schema

```prisma
// prisma/schema.prisma
model Workspace {
  id        String   @id @default(uuid())
  name      String
  slug      String   @unique
  settings  Json?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  users     User[]
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique
  password     String
  name         String
  role         UserRole  @default(CUSTOMER)
  status       UserStatus @default(ACTIVE)
  workspaceId  String
  workspace    Workspace @relation(fields: [workspaceId], references: [id])
  emailVerified Boolean  @default(false)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  lastLoginAt  DateTime?
  
  @@index([workspaceId])
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

## API Endpoints

### Authentication

#### POST `/auth/register`
Register new customer account
```typescript
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "workspaceSlug": "acme"
}

// Response
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### POST `/auth/login`
User login
```typescript
// Request
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

// Response
{
  "user": { ... },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

#### POST `/auth/refresh`
Refresh access token
```typescript
// Request
{
  "refreshToken": "refresh-token"
}

// Response
{
  "accessToken": "new-jwt-token"
}
```

#### POST `/auth/logout`
Logout user (invalidate tokens)
```typescript
// Headers
Authorization: Bearer {token}

// Response
{
  "message": "Logged out successfully"
}
```

#### POST `/auth/forgot-password`
Request password reset
```typescript
// Request
{
  "email": "user@example.com"
}

// Response
{
  "message": "Password reset email sent"
}
```

#### POST `/auth/reset-password`
Reset password with token
```typescript
// Request
{
  "token": "reset-token",
  "newPassword": "NewSecurePass123!"
}

// Response
{
  "message": "Password reset successfully"
}
```

### User Management

#### GET `/users`
Get all users (Admin only, paginated)
```typescript
// Query params: ?page=1&limit=20&role=AGENT
// Headers: Authorization: Bearer {token}

// Response
{
  "data": [
    {
      "id": "uuid",
      "email": "agent@example.com",
      "name": "Jane Agent",
      "role": "AGENT",
      "status": "ACTIVE",
      "createdAt": "2026-01-24T10:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 20
  }
}
```

#### GET `/users/:id`
Get user by ID
```typescript
// Response
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "CUSTOMER",
  "workspace": {
    "id": "workspace-uuid",
    "name": "ACME Corp"
  }
}
```

#### POST `/users`
Create user (Admin only)
```typescript
// Request
{
  "email": "newagent@example.com",
  "password": "TempPass123!",
  "name": "New Agent",
  "role": "AGENT",
  "workspaceId": "workspace-uuid"
}

// Response
{
  "id": "uuid",
  "email": "newagent@example.com",
  "name": "New Agent",
  "role": "AGENT"
}
```

#### PATCH `/users/:id`
Update user
```typescript
// Request
{
  "name": "Updated Name",
  "role": "AGENT" // Admin only
}

// Response
{
  "id": "uuid",
  "name": "Updated Name",
  "role": "AGENT"
}
```

#### DELETE `/users/:id`
Delete/deactivate user (Admin only)
```typescript
// Response
{
  "message": "User deactivated successfully"
}
```

### Workspace Management

#### GET `/workspaces`
Get all workspaces
```typescript
// Response
{
  "data": [
    {
      "id": "uuid",
      "name": "ACME Corp",
      "slug": "acme",
      "createdAt": "2026-01-01T00:00:00Z"
    }
  ]
}
```

#### POST `/workspaces`
Create workspace (Admin only)
```typescript
// Request
{
  "name": "New Company",
  "slug": "new-company"
}

// Response
{
  "id": "uuid",
  "name": "New Company",
  "slug": "new-company"
}
```

## Environment Variables

```env
# Server
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL=postgresql://deskio:deskio@localhost:5432/deskio_identity

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# CORS
CORS_ORIGIN=http://localhost:3100,http://localhost:3200,http://localhost:3300

# Redis (for token blacklist - optional)
REDIS_HOST=localhost
REDIS_PORT=6379

# Email (for notifications)
SMTP_HOST=localhost
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@deskio.com
```

## Development

### Setup

```bash
# Install dependencies
pnpm install

# Setup database
npx prisma generate
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### Run

```bash
# Development with watch mode
pnpm dev

# Production mode
pnpm build
pnpm start:prod
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name add_email_verification

# Apply migrations
npx prisma migrate deploy

# Reset database (dev only)
npx prisma migrate reset
```

### Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Test coverage
pnpm test:cov
```

## Implementation Examples

### JWT Strategy

```typescript
// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findById(payload.sub);
    
    if (!user || user.status !== 'ACTIVE') {
      throw new UnauthorizedException();
    }
    
    return user;
  }
}
```

### Roles Guard

```typescript
// src/auth/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) {
      return true;
    }
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

### Controller với Guards

```typescript
// src/users/users.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles('ADMIN')
  async findAll() {
    return this.usersService.findAll();
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}
```

## Security Best Practices

- ✅ Hash passwords với bcrypt (salt rounds >= 10)
- ✅ Validate all inputs với DTOs và class-validator
- ✅ Use HTTPS in production
- ✅ Implement rate limiting
- ✅ Token blacklisting cho logout
- ✅ Secure JWT secret (use environment variables)
- ✅ Short-lived access tokens (15 minutes)
- ✅ Longer refresh tokens (7 days)
- ✅ Email verification cho new accounts
- ✅ Account lockout sau failed login attempts

## Performance Optimization

- Index database columns (email, workspaceId)
- Cache user data with Redis
- Use connection pooling
- Optimize database queries
- Implement pagination

## Monitoring & Logging

```typescript
// src/common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const delay = Date.now() - now;
        this.logger.log(`${method} ${url} ${response.statusCode} - ${delay}ms`);
      }),
    );
  }
}
```

## Troubleshooting

### Issue: JWT token invalid
- Verify JWT_SECRET matches
- Check token expiration
- Ensure Bearer token format

### Issue: Database connection failed
- Check DATABASE_URL
- Verify PostgreSQL is running
- Run migrations: `npx prisma migrate deploy`

### Issue: Password hashing slow
- Adjust bcrypt salt rounds (default: 10)
- Consider async hashing

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN npx prisma generate
RUN pnpm build

EXPOSE 3001

CMD ["pnpm", "start:prod"]
```

### Health Check

```typescript
// src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
```

## Notes

- Keep JWT secrets secure và unique per environment
- Implement proper error handling
- Use environment variables for all configs
- Regular security audits
- Monitor failed login attempts
- Backup database regularly
