---
id: pt-docker
name: Docker Deployment
version: 2.0.0
layer: L5
category: devops
description: Containerize Next.js applications with Docker for flexible deployment
tags: [deployment, docker, containers, devops, next15]
composes: []
dependencies: []
formula: "Multi-Stage Build + Output Tracing + Non-Root User = Optimized Container"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Docker Deployment

## Overview

Docker containers provide consistent, reproducible deployments across any infrastructure. This pattern covers optimized Dockerfiles for Next.js, multi-stage builds, and docker-compose configurations for local development and production.

## When to Use

- Deploying to Kubernetes, AWS ECS, or self-hosted infrastructure
- Requiring consistent environments across development and production
- Running Next.js alongside other services (databases, Redis)
- Building CI/CD pipelines with containerized testing
- Implementing blue-green or rolling deployments

## Composition Diagram

```
                    ┌─────────────────────────────────────────────────┐
                    │            DOCKER DEPLOYMENT                     │
                    └─────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │              MULTI-STAGE BUILD            │
                    └─────────────────────┬─────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
            ▼                             ▼                             ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │  Stage 1:     │           │  Stage 2:     │           │  Stage 3:     │
    │  Dependencies │──────────▶│    Builder    │──────────▶│    Runner     │
    │  (node:alpine)│           │  (next build) │           │  (standalone) │
    └───────────────┘           └───────────────┘           └───────────────┘
                                                                    │
                                          ┌─────────────────────────┼─────────────────────────┐
                                          │                         │                         │
                                          ▼                         ▼                         ▼
                                  ┌───────────────┐         ┌───────────────┐         ┌───────────────┐
                                  │   Health      │         │  Environment  │         │   Docker      │
                                  │   Check API   │         │   Variables   │         │   Compose     │
                                  └───────────────┘         └───────────────┘         └───────────────┘

    ┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
    │  docker-compose: app (Next.js) + db (PostgreSQL) + redis (Cache) + nginx (Reverse Proxy)        │
    └─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

## Optimized Production Dockerfile

```dockerfile
# Dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on lockfile
COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build arguments for environment variables
ARG DATABASE_URL
ARG NEXT_PUBLIC_APP_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

RUN corepack enable pnpm && pnpm build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Leverage Next.js output file tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

## Next.js Configuration for Docker

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Docker
  
  // Reduce image size by excluding unnecessary files
  experimental: {
    outputFileTracingExcludes: {
      '*': [
        'node_modules/@swc/core-linux-x64-gnu',
        'node_modules/@swc/core-linux-x64-musl',
        'node_modules/@esbuild/linux-x64',
      ],
    },
  },
};

export default nextConfig;
```

## Multi-Stage with Prisma

```dockerfile
# Dockerfile.prisma
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
COPY prisma ./prisma/

RUN corepack enable pnpm && pnpm install --frozen-lockfile
RUN pnpm prisma generate

FROM node:20-alpine AS builder
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable pnpm && pnpm build

FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=deps /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

## Docker Compose for Development

```yaml
# docker-compose.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/myapp
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    command: pnpm dev

  db:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: myapp
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # Optional: Database admin
  adminer:
    image: adminer
    ports:
      - "8080:8080"
    depends_on:
      - db

volumes:
  postgres_data:
  redis_data:
```

## Development Dockerfile

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

RUN corepack enable pnpm

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source
COPY . .

# Generate Prisma client
RUN pnpm prisma generate

EXPOSE 3000

CMD ["pnpm", "dev"]
```

## Docker Compose for Production

```yaml
# docker-compose.prod.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - DATABASE_URL=${DATABASE_URL}
        - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - AUTH_SECRET=${AUTH_SECRET}
      - REDIS_URL=redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_started
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data
    restart: unless-stopped

  # Reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./certs:/etc/nginx/certs:ro
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

## Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {} as Record<string, 'up' | 'down'>,
  };

  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'up';
  } catch {
    health.services.database = 'down';
    health.status = 'unhealthy';
  }

  // Check Redis (if used)
  try {
    const redis = await import('@/lib/redis');
    await redis.default.ping();
    health.services.redis = 'up';
  } catch {
    health.services.redis = 'down';
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
```

## Build Script

```bash
#!/bin/bash
# scripts/docker-build.sh

set -e

# Load environment variables
source .env.production

# Build image
docker build \
  --build-arg DATABASE_URL="$DATABASE_URL" \
  --build-arg NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
  -t myapp:latest \
  -f Dockerfile \
  .

# Tag for registry
docker tag myapp:latest registry.example.com/myapp:latest
docker tag myapp:latest registry.example.com/myapp:$(git rev-parse --short HEAD)

# Push to registry
docker push registry.example.com/myapp:latest
docker push registry.example.com/myapp:$(git rev-parse --short HEAD)

echo "Build and push complete!"
```

## .dockerignore

```dockerignore
# .dockerignore
node_modules
.next
.git
.gitignore
*.md
.env*.local
.vscode
.idea
coverage
.turbo
out
dist
```

## Multi-Platform Build

```bash
# Build for multiple architectures
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --push \
  -t registry.example.com/myapp:latest \
  .
```

## Anti-patterns

### Don't Include Secrets in Image

```dockerfile
# BAD - Secrets in build args persist in layers
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# GOOD - Pass secrets at runtime
# In Dockerfile: nothing
# At runtime: docker run -e DATABASE_URL=... myapp
```

### Don't Run as Root

```dockerfile
# BAD - Running as root
CMD ["node", "server.js"]

# GOOD - Create and use non-root user
RUN adduser --system --uid 1001 nextjs
USER nextjs
CMD ["node", "server.js"]
```

### Don't Copy Entire Context

```dockerfile
# BAD - Copies everything including node_modules
COPY . .

# GOOD - Selective copying with .dockerignore
COPY package.json pnpm-lock.yaml ./
RUN pnpm install
COPY . .
```

## Related Skills

- [vercel-deployment](./vercel-deployment.md)
- [environment-variables](./environment-variables.md)
- [ci-cd](./ci-cd.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Optimized production Dockerfile
- Multi-stage builds
- Docker Compose configurations
- Health check endpoint
- Multi-platform builds
