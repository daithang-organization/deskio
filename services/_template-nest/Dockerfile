# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm i -g pnpm@9.15.0

# Copy package files
COPY package.json ./
RUN pnpm install --frozen-lockfile || pnpm install

# Copy source and config
COPY tsconfig.json nest-cli.json ./
COPY src ./src

# Build application
RUN pnpm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Install pnpm
RUN npm i -g pnpm@9.15.0

# Copy package files and install production dependencies only
COPY package.json ./
RUN pnpm install --prod --frozen-lockfile || pnpm install --prod

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001
USER nestjs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/api/v1/healthz', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

EXPOSE 3001
CMD ["node", "dist/main.js"]
