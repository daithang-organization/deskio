# Utils Package

Shared utility functions và helpers cho Deskio platform.

## Mục đích

Utils package cung cấp common utilities được sử dụng bởi cả frontend và backend:
- String manipulation helpers
- Date/time formatters
- Validation utilities
- API client helpers  
- Error handling utilities
- Common algorithms
- Type guards và assertions

## Structure

```
utils/
├── string/
│   ├── slugify.ts
│   ├── truncate.ts
│   ├── capitalize.ts
│   ├── sanitize.ts
│   └── index.ts
├── date/
│   ├── formatDate.ts
│   ├── relativeTime.ts
│   ├── parseDate.ts
│   └── index.ts
├── validation/
│   ├── email.ts
│   ├── password.ts
│   ├── phone.ts
│   ├── url.ts
│   └── index.ts
├── api/
│   ├── httpClient.ts
│   ├── errorHandler.ts
│   └── index.ts
├── array/
│   ├── groupBy.ts
│   ├── unique.ts
│   ├── chunk.ts
│   └── index.ts
├── object/
│   ├── pick.ts
│   ├── omit.ts
│   ├── deepMerge.ts
│   └── index.ts
├── number/
│   ├── formatNumber.ts
│   ├── formatCurrency.ts
│   └── index.ts
├── logger/
│   └── logger.ts
├── constants.ts
├── types.ts
├── index.ts
└── README.md
```

## Installation

```bash
# In workspace
pnpm add @deskio/utils
```

```json
// package.json
{
  "dependencies": {
    "@deskio/utils": "workspace:*"
  }
}
```

## Usage Examples

### String Utilities

```typescript
import { slugify, truncate, capitalize, sanitizeHtml } from '@deskio/utils/string';

// Slugify
const slug = slugify('My Article Title!'); // "my-article-title"
const slug2 = slugify('Tiếng Việt Unicode'); // "tieng-viet-unicode"

// Truncate
const short = truncate('This is a very long text...', 20); 
// "This is a very lo..."

const shortWords = truncate('This is a very long text...', 20, { useWordBoundary: true });
// "This is a very..."

// Capitalize
const title = capitalize('hello world'); // "Hello World"
const sentence = capitalize('hello world', { onlyFirst: true }); // "Hello world"

// Sanitize HTML (prevent XSS)
const clean = sanitizeHtml('<script>alert("xss")</script><p>Safe content</p>');
// "<p>Safe content</p>"
```

### Date Utilities

```typescript
import { formatDate, relativeTime, parseDate, addDays, diffDays } from '@deskio/utils/date';

// Format date
const formatted = formatDate(new Date(), 'MMM dd, yyyy'); // "Jan 24, 2026"
const time = formatDate(new Date(), 'HH:mm:ss'); // "14:30:45"

// Relative time
const relative = relativeTime(new Date(Date.now() - 3600000)); // "1 hour ago"
const relative2 = relativeTime(new Date(Date.now() + 86400000)); // "in 1 day"

// Parse date
const date = parseDate('2026-01-24'); // Date object
const dateTime = parseDate('2026-01-24T10:30:00Z'); // Date object with time

// Date math
const tomorrow = addDays(new Date(), 1);
const daysDiff = diffDays(new Date('2026-01-24'), new Date('2026-01-20')); // 4
```

### Validation Utilities

```typescript
import { isValidEmail, isValidPassword, isValidPhone, isValidUrl } from '@deskio/utils/validation';

// Email validation
isValidEmail('user@example.com'); // true
isValidEmail('invalid-email'); // false

// Password validation
isValidPassword('weakpass'); // false
isValidPassword('StrongP@ss123'); // true

// With custom rules
isValidPassword('MyPass123', {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
}); // true

// Phone validation (international)
isValidPhone('+84912345678'); // true
isValidPhone('0912345678', { country: 'VN' }); // true

// URL validation
isValidUrl('https://example.com'); // true
isValidUrl('not-a-url'); // false
```

### API Utilities

```typescript
import { createApiClient, handleApiError } from '@deskio/utils/api';

// Create API client với base configuration
const apiClient = createApiClient({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Set authentication token
apiClient.setToken('jwt-token');

// Make requests
const users = await apiClient.get('/users');
const user = await apiClient.post('/users', { name: 'John', email: 'john@example.com' });

// Error handling
try {
  await apiClient.get('/protected-route');
} catch (error) {
  const handled = handleApiError(error);
  console.error(handled.message);
  
  if (handled.code === 'UNAUTHORIZED') {
    // Redirect to login
  }
}
```

### Array Utilities

```typescript
import { groupBy, unique, chunk, sortBy } from '@deskio/utils/array';

// Group by property
const users = [
  { name: 'John', role: 'ADMIN' },
  { name: 'Jane', role: 'AGENT' },
  { name: 'Bob', role: 'AGENT' },
];
const grouped = groupBy(users, 'role');
// { ADMIN: [{ name: 'John', ... }], AGENT: [{ name: 'Jane', ... }, { name: 'Bob', ... }] }

// Unique values
const numbers = [1, 2, 2, 3, 3, 3];
const uniqueNumbers = unique(numbers); // [1, 2, 3]

// Unique by property
const uniqueUsers = unique(users, 'role'); // [{ name: 'John', role: 'ADMIN' }, { name: 'Jane', role: 'AGENT' }]

// Chunk array
const items = [1, 2, 3, 4, 5, 6, 7];
const chunks = chunk(items, 3); // [[1, 2, 3], [4, 5, 6], [7]]

// Sort by property
const sorted = sortBy(users, 'name'); // Sorted by name alphabetically
const sortedDesc = sortBy(users, 'name', 'desc'); // Descending
```

### Object Utilities

```typescript
import { pick, omit, deepMerge, deepClone } from '@deskio/utils/object';

const user = {
  id: '123',
  name: 'John',
  email: 'john@example.com',
  password: 'secret',
  role: 'ADMIN',
};

// Pick properties
const publicUser = pick(user, ['id', 'name', 'email']);
// { id: '123', name: 'John', email: 'john@example.com' }

// Omit properties
const safeUser = omit(user, ['password']);
// { id: '123', name: 'John', email: 'john@example.com', role: 'ADMIN' }

// Deep merge objects
const defaults = { theme: 'light', notifications: { email: true, push: false } };
const userPrefs = { notifications: { email: false } };
const merged = deepMerge(defaults, userPrefs);
// { theme: 'light', notifications: { email: false, push: false } }

// Deep clone
const cloned = deepClone(user); // New object with same values
```

### Number Utilities

```typescript
import { formatNumber, formatCurrency, formatBytes, clamp } from '@deskio/utils/number';

// Format number
formatNumber(1234567); // "1,234,567"
formatNumber(1234.56, { decimals: 2 }); // "1,234.56"

// Format currency
formatCurrency(1234.56); // "$1,234.56"
formatCurrency(1234.56, { currency: 'VND' }); // "₫1,235"

// Format bytes
formatBytes(1024); // "1 KB"
formatBytes(1048576); // "1 MB"
formatBytes(1073741824); // "1 GB"

// Clamp number
clamp(150, 0, 100); // 100
clamp(-10, 0, 100); // 0
clamp(50, 0, 100); // 50
```

### Logger

```typescript
import { logger } from '@deskio/utils/logger';

// Log levels
logger.info('Information message');
logger.warn('Warning message');
logger.error('Error message', new Error('Details'));
logger.debug('Debug message', { context: 'data' });

// Structured logging
logger.info('User logged in', {
  userId: '123',
  timestamp: new Date(),
  ip: '192.168.1.1',
});

// In production, logger can be configured to:
// - Send logs to external service
// - Format as JSON
// - Filter by log level
// - Add correlation IDs
```

## Implementation Examples

### slugify.ts

```typescript
export function slugify(text: string, options?: { separator?: string }): string {
  const separator = options?.separator || '-';
  
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // Unicode normalization
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/[\s_]+/g, separator) // Replace spaces with separator
    .replace(new RegExp(`${separator}+`, 'g'), separator) // Remove duplicate separators
    .replace(new RegExp(`^${separator}|${separator}$`, 'g'), ''); // Trim separators
}
```

### formatDate.ts

```typescript
export function formatDate(date: Date | string, format: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const tokens: Record<string, () => string> = {
    'yyyy': () => d.getFullYear().toString(),
    'MM': () => String(d.getMonth() + 1).padStart(2, '0'),
    'dd': () => String(d.getDate()).padStart(2, '0'),
    'HH': () => String(d.getHours()).padStart(2, '0'),
    'mm': () => String(d.getMinutes()).padStart(2, '0'),
    'ss': () => String(d.getSeconds()).padStart(2, '0'),
    'MMM': () => d.toLocaleString('en', { month: 'short' }),
    'MMMM': () => d.toLocaleString('en', { month: 'long' }),
  };

  return Object.entries(tokens).reduce(
    (result, [token, getValue]) => result.replace(token, getValue()),
    format
  );
}

export function relativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(Math.abs(diffMs) / 1000);
  
  const isFuture = diffMs < 0;
  
  if (diffSec < 60) return isFuture ? 'in a few seconds' : 'a few seconds ago';
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return isFuture ? `in ${mins} minute${mins > 1 ? 's' : ''}` : `${mins} minute${mins > 1 ? 's' : ''} ago`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return isFuture ? `in ${hours} hour${hours > 1 ? 's' : ''}` : `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  const days = Math.floor(diffSec / 86400);
  return isFuture ? `in ${days} day${days > 1 ? 's' : ''}` : `${days} day${days > 1 ? 's' : ''} ago`;
}
```

### isValidEmail.ts

```typescript
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(
  password: string,
  options?: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  }
): boolean {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options || {};

  if (password.length < minLength) return false;
  if (requireUppercase && !/[A-Z]/.test(password)) return false;
  if (requireLowercase && !/[a-z]/.test(password)) return false;
  if (requireNumbers && !/\d/.test(password)) return false;
  if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;

  return true;
}
```

## Constants

```typescript
// constants.ts
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  AGENT: 'AGENT',
  CUSTOMER: 'CUSTOMER',
} as const;

export const TICKET_STATUS = {
  OPEN: 'OPEN',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;
```

## Package Configuration

```json
// package.json
{
  "name": "@deskio/utils",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0"
  }
}
```

## Testing

```bash
# Run tests
pnpm test

# Test specific utility
pnpm test string

# Coverage
pnpm test:coverage
```

## Best Practices

- ✅ Keep functions pure (no side effects)
- ✅ Write comprehensive tests
- ✅ Add TypeScript types
- ✅ Document with JSDoc
- ✅ Handle edge cases
- ✅ Optimize performance
- ✅ Export only necessary functions

## Notes

- Utilities should be framework-agnostic
- Keep dependencies minimal
- Prefer native JavaScript where possible
- Consider tree-shaking (export individual files)
- Version carefully
- Test across Node.js and browser environments
