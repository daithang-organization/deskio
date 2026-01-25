# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm i -g pnpm@9.15.0

# Copy workspace manifests
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy shared config package
COPY packages/config/package.json ./packages/config/package.json
COPY packages/config ./packages/config

# Copy service files (replace SERVICE_NAME with actual service name)
COPY services/SERVICE_NAME/package.json ./services/SERVICE_NAME/package.json

# Install dependencies from workspace root
RUN pnpm install --frozen-lockfile --filter=SERVICE_NAME...

# Copy service source and build
COPY services/SERVICE_NAME/tsconfig.json services/SERVICE_NAME/nest-cli.json ./services/SERVICE_NAME/
COPY services/SERVICE_NAME/src ./services/SERVICE_NAME/src
RUN pnpm --filter=SERVICE_NAME run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install pnpm
RUN npm i -g pnpm@9.15.0

# Copy package files and install production dependencies only
COPY --from=builder /app/services/SERVICE_NAME/package.json ./package.json
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy built application from builder
COPY --from=builder /app/services/SERVICE_NAME/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3001
CMD ["node", "dist/main.js"]
