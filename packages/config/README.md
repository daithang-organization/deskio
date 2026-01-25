# Config Package

Shared configuration files cho tất cả workspaces trong Deskio monorepo.

## Mục đích

Config package cung cấp:

- Base TypeScript configuration
- Shared ESLint rules
- Prettier configuration
- Jest configuration
- Build configs

Giúp maintain consistency across toàn bộ codebase và simplify configuration trong từng workspace.

## Contents

```
config/
├── tsconfig.base.json      # Base TypeScript config
├── eslint.config.js        # ESLint rules (future)
├── prettier.config.js      # Prettier formatting (future)
├── jest.config.js          # Jest testing config (future)
└── README.md
```

## TypeScript Configuration

### tsconfig.base.json

Base configuration được extend bởi tất cả apps và services:

```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "moduleResolution": "node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "incremental": true,
    "removeComments": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "exclude": ["node_modules", "dist", "build", ".next"]
}
```

## Usage

### In Backend Services (NestJS)

```json
// services/identity-service/tsconfig.json
{
  "extends": "../../packages/config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    },
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "test"]
}
```

### In Frontend Apps (Next.js)

```json
// apps/customer-portal/tsconfig.json
{
  "extends": "../../packages/config/tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./*"]
    },
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## ESLint Configuration (Future)

```javascript
// eslint.config.js
module.exports = {
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  },
};
```

### Usage:

```json
// apps/customer-portal/.eslintrc.js
module.exports = {
  extends: ['../../packages/config/eslint.config.js'],
  rules: {
    // Add app-specific rules
  },
};
```

## Prettier Configuration (Future)

```javascript
// prettier.config.js
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  endOfLine: 'lf',
};
```

### Usage:

```json
// package.json (root or workspace)
{
  "prettier": "@deskio/config/prettier.config.js"
}
```

## Jest Configuration (Future)

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  testMatch: ['**/*.spec.ts', '**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts', '!src/**/*.interface.ts'],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
};
```

## Path Aliases

Recommended path aliases trong tsconfig:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@lib/*": ["src/lib/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"]
    }
  }
}
```

## Strict Mode

Base config enables TypeScript strict mode:

- `strict: true`
- `noImplicitAny: true`
- `strictNullChecks: true`
- `strictFunctionTypes: true`
- `strictBindCallApply: true`
- `strictPropertyInitialization: true`
- `noImplicitThis: true`
- `alwaysStrict: true`

## Additional Checks

Enabled checks for better code quality:

- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused parameters
- `noImplicitReturns: true` - Error when function doesn't return
- `noFallthroughCasesInSwitch: true` - Error on switch fallthrough

## Benefits

### Consistency

- All workspaces follow same rules
- Single source of truth
- Easier code reviews

### Maintainability

- Update configs in one place
- Changes propagate to all workspaces
- Easier onboarding

### Type Safety

- Strict TypeScript checks
- Catch errors early
- Better IDE support

## Development

### Adding New Configs

1. Create config file trong `packages/config/`
2. Export module appropriately
3. Update README với usage examples
4. Update workspaces to extend new config

### Testing Configs

Test config changes bằng cách:

```bash
# Từ workspace that extends config
pnpm typecheck

# Check all workspaces
pnpm -r typecheck
```

## Notes

- Keep configs minimal và focused
- Document breaking changes
- Test configs trước khi commit
- Consider backward compatibility
- Follow community best practices
- Update configs when upgrading TypeScript/tools
