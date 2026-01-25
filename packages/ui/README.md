# UI Package

Shared React component library cho các frontend apps của Deskio platform.

## Mục đích

UI package cung cấp:

- Reusable React components với consistent design
- Shared layouts và patterns
- Design system components
- Custom hooks
- Theme configuration

Giúp maintain consistent UI/UX across Customer Portal, Agent Console và Admin Console.

## Structure

```
ui/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.stories.tsx        # Storybook story (optional)
│   │   └── index.ts
│   ├── Input/
│   ├── Select/
│   ├── Checkbox/
│   ├── Radio/
│   ├── Textarea/
│   ├── Modal/
│   ├── Alert/
│   ├── Toast/
│   ├── Card/
│   ├── Badge/
│   ├── Table/
│   ├── Pagination/
│   ├── Dropdown/
│   ├── Avatar/
│   ├── Spinner/
│   └── ... (more components)
├── layouts/
│   ├── DashboardLayout/
│   ├── AuthLayout/
│   └── EmptyLayout/
├── hooks/
│   ├── useToast.ts
│   ├── useModal.ts
│   ├── useDebounce.ts
│   └── useLocalStorage.ts
├── theme/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   └── breakpoints.ts
├── utils/
│   └── cn.ts                         # className utility
├── index.ts
├── package.json
└── README.md
```

## Installation

```bash
# Từ root project
pnpm add -D @deskio/ui --filter=customer-portal
```

```json
// package.json (in app)
{
  "dependencies": {
    "@deskio/ui": "workspace:*"
  }
}
```

## Usage

### Basic Components

```typescript
import { Button, Input, Card, Badge } from '@deskio/ui';

function MyComponent() {
  return (
    <Card>
      <h2>Login Form</h2>
      <Input
        type="email"
        placeholder="Enter email"
        label="Email Address"
      />
      <Input
        type="password"
        placeholder="Enter password"
        label="Password"
      />
      <Button variant="primary" size="lg">
        Sign In
      </Button>
      <Badge variant="success">New</Badge>
    </Card>
  );
}
```

### Using Layouts

```typescript
import { DashboardLayout } from '@deskio/ui/layouts';

export default function TicketsPage() {
  return (
    <DashboardLayout
      title="Tickets"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Tickets', href: '/tickets' },
      ]}
    >
      <div>
        {/* Page content */}
      </div>
    </DashboardLayout>
  );
}
```

### Using Hooks

```typescript
import { useToast, useModal } from '@deskio/ui';

function MyComponent() {
  const toast = useToast();
  const modal = useModal();

  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };

  const handleConfirm = () => {
    modal.confirm({
      title: 'Delete Item',
      message: 'Are you sure you want to delete this item?',
      onConfirm: () => {
        // Delete logic
      },
    });
  };

  return (
    <>
      <Button onClick={handleSuccess}>Show Toast</Button>
      <Button onClick={handleConfirm}>Show Modal</Button>
    </>
  );
}
```

## Component API

### Button

```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

// Usage
<Button variant="primary" size="lg" loading={isLoading}>
  Submit
</Button>
```

### Input

```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number';
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

// Usage
<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  required
/>
```

### Select

```typescript
interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

// Usage
<Select
  label="Priority"
  options={[
    { value: 'low', label: 'Low' },
    { value: 'high', label: 'High' },
  ]}
  value={priority}
  onChange={setPriority}
/>
```

### Modal

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

// Usage
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  size="md"
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Save
      </Button>
    </>
  }
>
  <div>{/* Modal content */}</div>
</Modal>
```

### Card

```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// Usage
<Card
  title="Ticket Details"
  subtitle="Created 2 hours ago"
  footer={<Button>View More</Button>}
>
  <p>Ticket content here...</p>
</Card>
```

### Badge

```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Usage
<Badge variant="success">Active</Badge>
<Badge variant="danger">Failed</Badge>
<Badge variant="warning">Pending</Badge>
```

### Table

```typescript
interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  loading?: boolean;
  emptyMessage?: string;
}

// Usage
<Table
  columns={[
    { key: 'email', header: 'Email', sortable: true },
    { key: 'role', header: 'Role', render: (row) => <Badge>{row.role}</Badge> },
    { key: 'actions', header: 'Actions', render: (row) => <Button size="sm">Edit</Button> },
  ]}
  data={users}
  onRowClick={(user) => router.push(`/users/${user.id}`)}
  loading={isLoading}
/>
```

## Layouts

### DashboardLayout

```typescript
interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  breadcrumbs?: Breadcrumb[];
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
}

// Usage
<DashboardLayout
  title="Tickets"
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Tickets' },
  ]}
  actions={<Button>Create Ticket</Button>}
>
  {/* Page content */}
</DashboardLayout>
```

### AuthLayout

```typescript
interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

// Usage
<AuthLayout
  title="Welcome Back"
  subtitle="Sign in to your account"
>
  <LoginForm />
</AuthLayout>
```

## Custom Hooks

### useToast

```typescript
const toast = useToast();

// Show toast notifications
toast.success('Operation successful!');
toast.error('Something went wrong');
toast.warning('Warning message');
toast.info('Information message');

// Custom toast
toast.show({
  message: 'Custom message',
  duration: 5000,
  type: 'success',
});
```

### useModal

```typescript
const modal = useModal();

// Confirm dialog
modal.confirm({
  title: 'Delete Item',
  message: 'Are you sure?',
  confirmText: 'Delete',
  cancelText: 'Cancel',
  onConfirm: () => handleDelete(),
});

// Alert dialog
modal.alert({
  title: 'Error',
  message: 'Operation failed',
});
```

### useDebounce

```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

### useLocalStorage

```typescript
const [theme, setTheme] = useLocalStorage('theme', 'light');

// Value is automatically persisted to localStorage
setTheme('dark');
```

## Theming

### Colors

```typescript
// theme/colors.ts
export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    // ... more shades
    900: '#1e3a8a',
  },
  gray: {
    // ... gray shades
  },
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
};
```

### Typography

```typescript
// theme/typography.ts
export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    // ... more sizes
  },
};
```

## Development

### Build

```bash
# Build package
cd packages/ui
pnpm build

# Watch mode
pnpm dev
```

### Storybook (Optional)

```bash
# Start Storybook
pnpm storybook

# Build Storybook
pnpm build-storybook
```

### Testing

```bash
# Run tests
pnpm test

# Test with coverage
pnpm test:coverage
```

## Adding New Components

1. Create component folder trong `components/`
2. Implement component với TypeScript
3. Export trong `index.ts`
4. Add Storybook story (optional)
5. Write tests
6. Document API trong README

Example:

```bash
# Create new component
mkdir components/NewComponent
touch components/NewComponent/NewComponent.tsx
touch components/NewComponent/index.ts
```

## Best Practices

### Component Design

- ✅ Keep components small và focused
- ✅ Use TypeScript for props
- ✅ Export type definitions
- ✅ Add prop documentation
- ✅ Handle edge cases

### Styling

- ✅ Use TailwindCSS classes
- ✅ Support className prop for extensibility
- ✅ Use theme values
- ✅ Responsive by default

### Accessibility

- ✅ Semantic HTML
- ✅ ARIA labels
- ✅ Keyboard navigation
- ✅ Focus management
- ✅ Screen reader support

### Performance

- ✅ Lazy load heavy components
- ✅ Memoize expensive renders
- ✅ Optimize re-renders
- ✅ Code splitting

## Package Configuration

```json
// package.json
{
  "name": "@deskio/ui",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsup src/index.ts --dts",
    "dev": "tsup src/index.ts --watch --dts",
    "lint": "eslint src --ext .ts,.tsx",
    "test": "jest",
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "tsup": "^7.0.0",
    "@types/react": "^18.0.0",
    "@storybook/react": "^7.0.0"
  },
  "dependencies": {
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  }
}
```

## Utilities

### cn (className merger)

```typescript
// utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Usage
<div className={cn('base-class', condition && 'conditional-class', className)} />
```

## Notes

- Components should be framework-agnostic where possible
- Prefer composition over configuration
- Keep bundle size small
- Document all public APIs
- Version carefully (breaking changes = major bump)
- Test across all consuming apps
- Consider dark mode support
- Maintain backward compatibility
