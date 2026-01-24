# Agent Console

Ứng dụng frontend cho agents/support staff của Deskio platform.

## Mục đích

Agent Console là công cụ làm việc chính cho nhân viên support, cung cấp:
- Dashboard để theo dõi workload và metrics
- Quản lý và xử lý tickets được assigned
- Reply và update tickets
- Search Knowledge Base để hỗ trợ customers
- Collaboration tools giữa agents

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Shared components từ `@deskio/ui`
- **State Management:** React Server Components + Client hooks
- **Real-time Updates:** WebSocket hoặc polling (optional MVP)
- **API Communication:** REST API với backend services
- **Authentication:** JWT tokens từ identity-service

## Features

### 1. Dashboard
- Assigned tickets count
- Open tickets metrics
- Recent activity feed
- Performance metrics (resolved/day, avg response time)
- Workload distribution chart

### 2. Ticket Management
- View all tickets (with filters)
- Filter by:
  - Status (Open, In Progress, Resolved, Closed)
  - Priority (Low, Medium, High, Urgent)
  - Assigned agent
  - Date range
  - Category
- Search tickets (by ID, customer, content)
- Sort by date, priority, status
- Bulk actions (assign, status change)
- Quick actions (claim, close, escalate)

### 3. Ticket Detail & Processing
- View full ticket history
- Reply to customers
- Internal notes (visible only to agents)
- Change status
- Update priority
- Assign/reassign to other agents
- Add tags
- Attach files
- Link related tickets
- Merge duplicate tickets

### 4. Knowledge Base
- Search KB articles
- Quick access to common solutions
- Copy KB links to share with customers
- Flag articles for update
- View KB metrics (helpful/not helpful)

### 5. Collaboration
- See who's viewing/working on a ticket
- Leave internal comments
- @mention other agents
- Transfer tickets with notes

## Project Structure

```
agent-console/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── page.tsx
│   ├── (console)/              # Protected console routes
│   │   ├── layout.tsx          # Console layout with sidebar
│   │   ├── page.tsx            # Dashboard
│   │   ├── tickets/
│   │   │   ├── page.tsx        # Tickets list (with filters)
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx    # Ticket detail
│   │   │   └── components/
│   │   │       ├── TicketFilters.tsx
│   │   │       ├── TicketTable.tsx
│   │   │       └── QuickActions.tsx
│   │   ├── kb/
│   │   │   ├── page.tsx        # KB search
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Article view
│   │   ├── reports/            # (Future)
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   └── api/
│       └── webhooks/           # For real-time updates (optional)
├── components/
│   ├── dashboard/
│   │   ├── MetricsCard.tsx
│   │   ├── RecentActivity.tsx
│   │   └── WorkloadChart.tsx
│   ├── tickets/
│   │   ├── TicketList.tsx
│   │   ├── TicketDetail.tsx
│   │   ├── ReplyForm.tsx
│   │   ├── AssignmentModal.tsx
│   │   └── StatusBadge.tsx
│   ├── kb/
│   │   ├── ArticleSearch.tsx
│   │   └── ArticlePreview.tsx
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       └── Navbar.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── tickets.ts
│   │   ├── agents.ts
│   │   ├── kb.ts
│   │   └── metrics.ts
│   ├── hooks/
│   │   ├── useTickets.ts
│   │   ├── useTicketFilters.ts
│   │   ├── useMetrics.ts
│   │   └── useRealtime.ts
│   └── utils/
│       ├── ticket-helpers.ts
│       └── date-formatters.ts
├── types/
│   └── index.ts
├── .env.example
├── next.config.js
├── tailwind.config.js
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
NEXT_PUBLIC_APP_NAME=Deskio Agent Console
NEXT_PUBLIC_APP_URL=http://localhost:3200

# WebSocket (optional)
NEXT_PUBLIC_WS_URL=ws://localhost:3002

# Feature Flags
NEXT_PUBLIC_ENABLE_REALTIME=false
NEXT_PUBLIC_ENABLE_BULK_ACTIONS=true
NEXT_PUBLIC_ENABLE_TICKET_MERGE=false
```

## Development

### Run Development Server
```bash
# Từ root
pnpm dev

# Hoặc từ agent-console folder
cd apps/agent-console
pnpm dev
```

Server sẽ chạy tại: http://localhost:3200

### Build
```bash
pnpm build
```

### Lint & Type Check
```bash
pnpm lint
pnpm typecheck
```

## Key Features Implementation

### 1. Ticket Filters

```typescript
// components/tickets/TicketFilters.tsx
import { useState } from 'react';
import { Select, Input, DatePicker } from '@deskio/ui';

export function TicketFilters({ onFilter }) {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignedTo: 'all',
    dateRange: null,
  });

  const handleApply = () => {
    onFilter(filters);
  };

  return (
    <div className="flex gap-4">
      <Select
        value={filters.status}
        onChange={(v) => setFilters({ ...filters, status: v })}
        options={[
          { value: 'all', label: 'All Status' },
          { value: 'open', label: 'Open' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'resolved', label: 'Resolved' },
        ]}
      />
      {/* More filters... */}
      <Button onClick={handleApply}>Apply</Button>
    </div>
  );
}
```

### 2. Ticket Reply

```typescript
// components/tickets/ReplyForm.tsx
import { useState } from 'react';
import { Button, Textarea, FileUpload } from '@deskio/ui';
import { CreateReplyDTO } from '@deskio/contracts/ticket';

export function ReplyForm({ ticketId, onReply }) {
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const handleSubmit = async () => {
    const reply: CreateReplyDTO = {
      ticketId,
      content,
      isInternal,
      attachments,
    };
    
    await onReply(reply);
    setContent('');
    setAttachments([]);
  };

  return (
    <div className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your reply..."
        rows={5}
      />
      
      <div className="flex items-center gap-4">
        <Checkbox
          checked={isInternal}
          onChange={(e) => setIsInternal(e.target.checked)}
          label="Internal note (not visible to customer)"
        />
        
        <FileUpload
          onUpload={setAttachments}
          maxFiles={5}
        />
      </div>
      
      <Button onClick={handleSubmit} disabled={!content}>
        Send Reply
      </Button>
    </div>
  );
}
```

### 3. Dashboard Metrics

```typescript
// components/dashboard/MetricsCard.tsx
export function MetricsCard({ title, value, change, trend }) {
  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <Badge variant={trend === 'up' ? 'success' : 'danger'}>
          {change}
        </Badge>
      </div>
    </Card>
  );
}

// app/(console)/page.tsx
export default async function Dashboard() {
  const metrics = await getAgentMetrics();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <MetricsCard
        title="Assigned Tickets"
        value={metrics.assignedTickets}
        change="+3"
        trend="up"
      />
      <MetricsCard
        title="Resolved Today"
        value={metrics.resolvedToday}
        change="+5"
        trend="up"
      />
      <MetricsCard
        title="Avg Response Time"
        value={metrics.avgResponseTime}
        change="-10m"
        trend="down"
      />
      <MetricsCard
        title="Customer Satisfaction"
        value={`${metrics.satisfaction}%`}
        change="+2%"
        trend="up"
      />
    </div>
  );
}
```

## API Integration

### Tickets API

```typescript
// lib/api/tickets.ts
import { Ticket, UpdateTicketDTO } from '@deskio/contracts/ticket';

export async function getTickets(filters: any, token: string) {
  const params = new URLSearchParams(filters);
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_TICKET_SERVICE_URL}/tickets?${params}`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
  return response.json();
}

export async function assignTicket(ticketId: string, agentId: string, token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_TICKET_SERVICE_URL}/tickets/${ticketId}/assign`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ agentId }),
    }
  );
  return response.json();
}

export async function updateTicketStatus(
  ticketId: string,
  status: string,
  token: string
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_TICKET_SERVICE_URL}/tickets/${ticketId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    }
  );
  return response.json();
}
```

## Routing

### Protected Routes (Agent role required)
- `/` - Dashboard
- `/tickets` - Tickets list with filters
- `/tickets/[id]` - Ticket detail and processing
- `/kb` - Knowledge Base search
- `/kb/[slug]` - KB article view
- `/reports` - Reports and analytics (future)
- `/profile` - Agent profile

## RBAC Implementation

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    const user = await verifyToken(token);
    
    // Check if user has AGENT or ADMIN role
    if (!['AGENT', 'ADMIN'].includes(user.role)) {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!login|api|_next|static).*)'],
};
```

## Performance Optimization

### 1. Efficient Ticket List
- Virtual scrolling cho large lists
- Pagination hoặc infinite scroll
- Optimize re-renders với React.memo

### 2. Real-time Updates (Optional)
```typescript
// lib/hooks/useRealtime.ts
import { useEffect } from 'react';
import { io } from 'socket.io-client';

export function useRealtimeTickets(onUpdate) {
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL);
    
    socket.on('ticket:updated', (ticket) => {
      onUpdate(ticket);
    });
    
    return () => socket.disconnect();
  }, [onUpdate]);
}
```

## Keyboard Shortcuts

Implement keyboard shortcuts cho power users:
- `j/k` - Navigate tickets up/down
- `c` - Claim ticket
- `r` - Reply
- `s` - Change status
- `a` - Assign
- `/` - Focus search
- `Esc` - Close modals

## Accessibility

- ✅ Keyboard navigation throughout
- ✅ Screen reader support
- ✅ Focus management
- ✅ ARIA labels
- ✅ Keyboard shortcuts

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

## Deployment

Similar to Customer Portal, deploy to:
- Vercel (recommended)
- Docker container
- Traditional hosting

## Troubleshooting

### Issue: Filters not working
- Check API query parameters
- Verify filter state management
- Check network tab for API calls

### Issue: Real-time updates not working
- Verify WebSocket connection
- Check CORS settings
- Verify token authentication for WS

## Notes

- Optimize for agent productivity
- Implement keyboard shortcuts
- Show loading states clearly
- Handle bulk actions efficiently
- Provide clear error messages
- Track agent performance metrics
