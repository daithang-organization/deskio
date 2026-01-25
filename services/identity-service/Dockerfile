# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./

# Copy shared config package
COPY packages/config/package.json ./packages/config/package.json
COPY packages/config ./packages/config

# Copy service files
COPY services/identity-service/package.json ./services/identity-service/package.json

# Install dependencies from workspace root
RUN npm i -g pnpm@9.15.0 && pnpm install --frozen-lockfile --filter=identity-service...

# Copy service source and build
COPY services/identity-service/tsconfig.json services/identity-service/nest-cli.json ./services/identity-service/
COPY services/identity-service/src ./services/identity-service/src
RUN pnpm --filter=identity-service run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/services/identity-service/package.json ./package.json
COPY --from=builder /app/services/identity-service/node_modules ./node_modules
COPY --from=builder /app/services/identity-service/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
