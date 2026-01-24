# Customer Portal

Ứng dụng frontend cho khách hàng (end-users) của Deskio platform.

## Mục đích

Customer Portal cung cấp giao diện thân thiện để khách hàng có thể:
- Tạo và quản lý support tickets
- Theo dõi trạng thái tickets của mình
- Reply và cập nhật tickets
- Tìm kiếm và đọc Knowledge Base articles
- Quản lý thông tin cá nhân

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Shared components từ `@deskio/ui`
- **State Management:** React Server Components + Client hooks
- **API Communication:** REST API với backend services
- **Authentication:** JWT tokens từ identity-service

## Features

### 1. Authentication
- Login/Logout
- Registration
- Password reset
- Email verification

### 2. Ticket Management
- Tạo ticket mới với:
  - Title & description
  - Priority selection
  - File attachments
  - Category selection
- Xem danh sách tickets của mình
- Filter theo status (Open, In Progress, Resolved, Closed)
- Search tickets
- View ticket details và history
- Reply to tickets
- Upload attachments
- Close tickets

### 3. Knowledge Base
- Browse KB articles
- Search articles
- View article details
- Helpful/not helpful feedback
- Related articles suggestions

### 4. Profile Management
- View và update profile information
- Change password
- Notification preferences
- View activity history

## Project Structure

```
customer-portal/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes group
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   ├── (dashboard)/         # Protected routes
│   │   ├── layout.tsx       # Dashboard layout
│   │   ├── page.tsx         # Home/Dashboard
│   │   ├── tickets/
│   │   │   ├── page.tsx     # Tickets list
│   │   │   ├── new/
│   │   │   │   └── page.tsx # Create ticket
│   │   │   └── [id]/
│   │   │       └── page.tsx # Ticket detail
│   │   ├── kb/
│   │   │   ├── page.tsx     # KB home
│   │   │   └── [slug]/
│   │   │       └── page.tsx # Article detail
│   │   └── profile/
│   │       └── page.tsx     # User profile
│   ├── api/                 # API routes (if needed)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # React components
│   ├── tickets/
│   │   ├── TicketList.tsx
│   │   ├── TicketCard.tsx
│   │   ├── TicketForm.tsx
│   │   └── TicketDetail.tsx
│   ├── kb/
│   │   ├── ArticleList.tsx
│   │   ├── ArticleCard.tsx
│   │   └── ArticleSearch.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── Footer.tsx
│       └── Sidebar.tsx
├── lib/                     # Utilities
│   ├── api/                 # API client
│   │   ├── client.ts
│   │   ├── tickets.ts
│   │   ├── kb.ts
│   │   └── auth.ts
│   ├── auth/                # Auth utilities
│   │   └── session.ts
│   └── utils/
│       ├── formatters.ts
│       └── validators.ts
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts
│   ├── useTickets.ts
│   └── useKB.ts
├── types/                   # TypeScript types
│   └── index.ts
├── public/                  # Static assets
│   ├── images/
│   └── icons/
├── .env.example             # Environment variables template
├── .env.local               # Local environment (gitignored)
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Environment Variables

Tạo file `.env.local`:

```env
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_IDENTITY_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_TICKET_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_KB_SERVICE_URL=http://localhost:3003

# App Configuration
NEXT_PUBLIC_APP_NAME=Deskio Customer Portal
NEXT_PUBLIC_APP_URL=http://localhost:3100

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_KB=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
```

## Development

### Prerequisites
```bash
# Install dependencies từ root
cd ../..
pnpm install
```

### Run Development Server
```bash
# Từ root
pnpm dev

# Hoặc từ customer-portal folder
cd apps/customer-portal
pnpm dev
```

Server sẽ chạy tại: http://localhost:3100

### Build
```bash
pnpm build
```

### Start Production Server
```bash
pnpm start
```

### Lint
```bash
pnpm lint
```

### Type Check
```bash
pnpm typecheck
```

## API Integration

### Authentication Flow

```typescript
// lib/api/auth.ts
import { LoginDTO, User } from '@deskio/contracts/identity';

export async function login(credentials: LoginDTO) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!response.ok) throw new Error('Login failed');
  
  const data = await response.json();
  return data; // { token, user }
}
```

### Tickets API

```typescript
// lib/api/tickets.ts
import { CreateTicketDTO, Ticket } from '@deskio/contracts/ticket';

export async function createTicket(data: CreateTicketDTO, token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_TICKET_SERVICE_URL}/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) throw new Error('Failed to create ticket');
  
  return response.json();
}

export async function getMyTickets(token: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_TICKET_SERVICE_URL}/tickets`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return response.json();
}
```

## Routing

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page
- `/reset-password` - Password reset

### Protected Routes (require authentication)
- `/tickets` - My tickets list
- `/tickets/new` - Create new ticket
- `/tickets/[id]` - Ticket detail & replies
- `/kb` - Knowledge Base home
- `/kb/[slug]` - KB article detail
- `/profile` - User profile

## Authentication Guard

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  
  if (!token && request.nextUrl.pathname.startsWith('/tickets')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/tickets/:path*', '/profile/:path*'],
};
```

## UI Components

### Using Shared UI Library

```typescript
import { Button, Input, Card, Badge } from '@deskio/ui';

export function TicketCard({ ticket }) {
  return (
    <Card>
      <h3>{ticket.title}</h3>
      <Badge variant={ticket.status}>{ticket.status}</Badge>
      <Button onClick={() => viewTicket(ticket.id)}>
        View Details
      </Button>
    </Card>
  );
}
```

## Testing

```bash
# Unit tests
pnpm test

# E2E tests (if configured)
pnpm test:e2e
```

## Deployment

### Build for Production
```bash
pnpm build
```

### Deploy to Vercel (recommended for Next.js)
```bash
vercel deploy
```

### Deploy with Docker
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build app
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm && pnpm build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3100
CMD ["node", "server.js"]
```

## Performance Optimization

### 1. Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/images/logo.png"
  alt="Deskio Logo"
  width={200}
  height={50}
  priority
/>
```

### 2. Code Splitting
- Use dynamic imports cho heavy components
- Lazy load routes

### 3. Caching
- Use SWR hoặc React Query cho data fetching
- Cache API responses
- Use Next.js built-in caching

## Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Color contrast compliance (WCAG AA)

## Security

- ✅ XSS prevention (Next.js built-in)
- ✅ CSRF protection
- ✅ Secure cookie storage
- ✅ Input validation
- ✅ Rate limiting (API level)

## Troubleshooting

### Issue: API connection failed
```bash
# Check if backend services are running
curl http://localhost:3001/health
curl http://localhost:3002/health

# Check environment variables
cat .env.local
```

### Issue: Authentication not working
- Verify token is stored correctly in cookies
- Check token expiration
- Verify API URL is correct

### Issue: Build errors
```bash
# Clean cache and rebuild
rm -rf .next
pnpm build
```

## Contributing

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR với clear description

## Notes

- Follow Next.js best practices
- Use Server Components where possible
- Implement proper error boundaries
- Add loading states
- Handle edge cases
- Write meaningful commit messages
