# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy only necessary root-level manifests if you use workspace builds later.
# For now, keep it service-local to be simple.
COPY package.json ./
RUN npm i -g pnpm@9.15.0 && pnpm install --frozen-lockfile || pnpm install

COPY tsconfig.json nest-cli.json ./
COPY src ./src
RUN pnpm run build

# Runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["node", "dist/main.js"]
