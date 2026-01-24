# Admin Console

Ứng dụng frontend cho administrators của Deskio platform.

## Mục đích

Admin Console cung cấp công cụ quản trị toàn diện để administrators có thể:
- Quản lý workspace settings
- Quản lý users và roles (RBAC)
- Quản lý Knowledge Base (CRUD, publish/unpublish)
- Xem reports và analytics
- Cấu hình system settings
- Monitor system health

## Tech Stack

- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **UI Components:** Shared components từ `@deskio/ui`
- **Charts:** Recharts hoặc Chart.js
- **Tables:** TanStack Table (React Table)
- **Forms:** React Hook Form + Zod validation
- **State Management:** React Server Components + Client hooks
- **API Communication:** REST API với backend services
- **Authentication:** JWT tokens từ identity-service

## Features

### 1. Dashboard
- System overview metrics
- Active users count
- Total tickets stats
- KB articles count
- Recent activities
- System health indicators

### 2. User Management
- View all users (paginated table)
- Filter by role (Admin/Agent/Customer)
- Search users
- Create new users
- Edit user details
- Change user roles
- Deactivate/activate users
- Reset user passwords
- Bulk actions (role assignment, deactivation)

### 3. Workspace Management
- Workspace settings
- Branding configuration (logo, colors)
- Email templates customization
- Notification settings
- Integrations setup (future)
- API keys management (future)

### 4. Knowledge Base Management
- View all KB articles (including drafts)
- Create new articles
- Edit articles (WYSIWYG editor)
- Publish/unpublish articles
- Delete articles
- Organize categories
- Manage tags
- View article metrics (views, helpful votes)

### 5. Reports & Analytics
- Ticket volume trends
- Agent performance reports
- Customer satisfaction metrics
- Response time analytics
- KB article popularity
- Export reports (CSV, PDF)

### 6. System Configuration
- General settings
- Security settings
- Email/SMTP configuration
- Storage settings
- Feature flags
- Audit logs

## Project Structure

```
admin-console/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (admin)/                    # Protected admin routes
│   │   ├── layout.tsx              # Admin layout
│   │   ├── page.tsx                # Dashboard
│   │   ├── users/
│   │   │   ├── page.tsx            # Users list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create user
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # User detail
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit user
│   │   ├── workspace/
│   │   │   ├── page.tsx            # Workspace settings
│   │   │   ├── branding/
│   │   │   ├── notifications/
│   │   │   └── integrations/
│   │   ├── kb/
│   │   │   ├── page.tsx            # KB articles list
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Create article
│   │   │   ├── categories/
│   │   │   │   └── page.tsx        # Manage categories
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Article preview
│   │   │       └── edit/
│   │   │           └── page.tsx    # Edit article
│   │   ├── reports/
│   │   │   ├── page.tsx            # Reports dashboard
│   │   │   ├── tickets/
│   │   │   ├── agents/
│   │   │   └── kb/
│   │   └── settings/
│   │       ├── page.tsx            # System settings
│   │       ├── security/
│   │       ├── email/
│   │       └── audit-logs/
│   └── api/
├── components/
│   ├── dashboard/
│   │   ├── MetricsGrid.tsx
│   │   ├── RecentActivity.tsx
│   │   └── SystemHealth.tsx
│   ├── users/
│   │   ├── UserTable.tsx
│   │   ├── UserForm.tsx
│   │   ├── RoleSelector.tsx
│   │   └── BulkActions.tsx
│   ├── kb/
│   │   ├── ArticleEditor.tsx       # Rich text editor
│   │   ├── ArticleList.tsx
│   │   ├── CategoryManager.tsx
│   │   └── ArticlePreview.tsx
│   ├── reports/
│   │   ├── TicketChart.tsx
│   │   ├── AgentPerformance.tsx
│   │   └── ExportButton.tsx
│   ├── settings/
│   │   ├── SettingsForm.tsx
│   │   └── AuditLogTable.tsx
│   └── layout/
│       ├── AdminSidebar.tsx
│       ├── AdminHeader.tsx
│       └── Breadcrumbs.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts
│   │   ├── users.ts
│   │   ├── workspace.ts
│   │   ├── kb.ts
│   │   ├── reports.ts
│   │   └── settings.ts
│   ├── hooks/
│   │   ├── useUsers.ts
│   │   ├── useKBArticles.ts
│   │   ├── useReports.ts
│   │   └── useSettings.ts
│   └── utils/
│       ├── export.ts               # Export reports
│       └── validation.ts
├── types/
│   └── index.ts
├── .env.example
├── next.config.js
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
NEXT_PUBLIC_APP_NAME=Deskio Admin Console
NEXT_PUBLIC_APP_URL=http://localhost:3300

# Feature Flags
NEXT_PUBLIC_ENABLE_BULK_ACTIONS=true
NEXT_PUBLIC_ENABLE_AUDIT_LOGS=true
```

## Development

### Run Development Server
```bash
# Từ root
pnpm dev

# Hoặc từ admin-console folder
cd apps/admin-console
pnpm dev
```

Server sẽ chạy tại: http://localhost:3300

### Build & Test
```bash
pnpm build
pnpm lint
pnpm typecheck
```

## Key Features Implementation

### 1. User Management Table

```typescript
// components/users/UserTable.tsx
import { useTable, usePagination, useFilters } from '@tanstack/react-table';
import { User } from '@deskio/contracts/identity';
import { Badge, Button, Table } from '@deskio/ui';

export function UserTable({ users, onEdit, onDelete }) {
  const columns = [
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ getValue }) => (
        <Badge variant={getRoleColor(getValue())}>
          {getValue()}
        </Badge>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => (
        <Badge variant={getValue() === 'active' ? 'success' : 'gray'}>
          {getValue()}
        </Badge>
      ),
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onEdit(row.original)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDelete(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={users} />;
}
```

### 2. KB Article Editor

```typescript
// components/kb/ArticleEditor.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select } from '@deskio/ui';
import dynamic from 'next/dynamic';

// Lazy load rich text editor
const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
});

const articleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  categoryId: z.string().min(1, 'Category is required'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['draft', 'published']),
});

export function ArticleEditor({ article, onSave }) {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = 
    useForm({
      resolver: zodResolver(articleSchema),
      defaultValues: article || {},
    });

  const onSubmit = async (data) => {
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Title"
        {...register('title')}
        error={errors.title?.message}
      />
      
      <Input
        label="Slug"
        {...register('slug')}
        error={errors.slug?.message}
        placeholder="article-url-slug"
      />
      
      <Select
        label="Category"
        {...register('categoryId')}
        error={errors.categoryId?.message}
        options={categories}
      />
      
      <div>
        <label className="block text-sm font-medium mb-2">Content</label>
        <RichTextEditor
          value={watch('content')}
          onChange={(value) => setValue('content', value)}
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>
      
      <div className="flex gap-4">
        <Button type="submit" name="status" value="draft">
          Save as Draft
        </Button>
        <Button type="submit" name="status" value="published" variant="primary">
          Publish
        </Button>
      </div>
    </form>
  );
}
```

### 3. Reports Dashboard

```typescript
// components/reports/TicketChart.tsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function TicketChart({ data }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Ticket Volume (Last 30 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="created" stroke="#3b82f6" name="Created" />
          <Line type="monotone" dataKey="resolved" stroke="#10b981" name="Resolved" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// app/(admin)/reports/page.tsx
export default async function ReportsPage() {
  const ticketData = await getTicketVolumeData();
  const agentPerformance = await getAgentPerformance();
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TicketChart data={ticketData} />
        <AgentPerformanceChart data={agentPerformance} />
      </div>
      
      <ExportButton />
    </div>
  );
}
```

## API Integration

### User Management API

```typescript
// lib/api/users.ts
import { User, CreateUserDTO, UpdateUserDTO } from '@deskio/contracts/identity';

export async function getUsers(token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL}/users`,
    {
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
  return response.json();
}

export async function createUser(data: CreateUserDTO, token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL}/users`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}

export async function updateUserRole(
  userId: string,
  role: string,
  token: string
) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_IDENTITY_SERVICE_URL}/users/${userId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role }),
    }
  );
  return response.json();
}
```

### KB Management API

```typescript
// lib/api/kb.ts
import { Article, CreateArticleDTO } from '@deskio/contracts/kb';

export async function createArticle(data: CreateArticleDTO, token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_KB_SERVICE_URL}/kb/articles`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }
  );
  return response.json();
}

export async function publishArticle(articleId: string, token: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_KB_SERVICE_URL}/kb/articles/${articleId}/publish`,
    {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    }
  );
  return response.json();
}
```

## Routing

### Protected Routes (Admin role required)
- `/` - Admin dashboard
- `/users` - User management
- `/users/new` - Create user
- `/users/[id]` - User detail
- `/users/[id]/edit` - Edit user
- `/workspace` - Workspace settings
- `/kb` - KB articles management
- `/kb/new` - Create KB article
- `/kb/[id]/edit` - Edit KB article
- `/kb/categories` - Manage categories
- `/reports` - Reports and analytics
- `/settings` - System settings
- `/settings/audit-logs` - Audit logs

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
    
    // Only ADMIN role can access admin console
    if (user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!login|unauthorized|api|_next|static).*)'],
};
```

## Security Considerations

- ✅ Admin-only access enforcement
- ✅ Audit logging for all actions
- ✅ Confirmation dialogs for destructive actions
- ✅ Input validation and sanitization
- ✅ CSRF protection
- ✅ Rate limiting on API calls

## Performance

- Use server-side pagination cho large tables
- Implement search debouncing
- Lazy load charts và heavy components
- Cache static data (categories, roles)
- Optimize bundle size

## Testing

```bash
pnpm test
pnpm test:e2e
```

## Deployment

Deploy như Customer Portal và Agent Console. Ensure proper environment variables cho production.

## Troubleshooting

### Issue: Cannot create users
- Verify ADMIN role
- Check API permissions
- Verify token validity

### Issue: KB editor not loading
- Check dynamic import
- Verify client-side only component
- Check console for errors

## Notes

- Admin console has most privileges - implement carefully
- Add audit logging for all admin actions
- Implement confirmation for destructive operations
- Provide clear feedback for all actions
- Keep UI responsive even with large datasets
- Document all admin procedures
