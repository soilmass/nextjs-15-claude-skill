---
id: pt-preview-deployments
name: Preview Deployments
version: 2.0.0
layer: L5
category: devops
description: Implement preview deployments for pull requests and branches
tags: [devops, preview, deployments]
composes: []
dependencies: []
formula: "Branch Detection + Isolated Environment + PR Integration = Preview Deployment System"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Preview Deployments Pattern

## Overview

Preview deployments create unique URLs for every branch or pull request, enabling teams to test changes in isolation before merging. This pattern covers Vercel preview deployments, custom preview environments, and integration with CI/CD workflows.

## When to Use

- Testing pull requests before merging to main branch
- Sharing work-in-progress features with stakeholders
- Running QA checks in production-like environments
- Enabling designers to review UI changes
- Testing integration with staging APIs and services

## Implementation

### Vercel Preview Configuration

```typescript
// vercel.json
{
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "git": {
    "deploymentEnabled": {
      "main": true,
      "preview": true
    }
  },
  "env": {
    "NEXT_PUBLIC_VERCEL_ENV": "@vercel_env"
  },
  "build": {
    "env": {
      "NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA": "@vercel_git_commit_sha",
      "NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF": "@vercel_git_commit_ref"
    }
  }
}
```

### Environment Detection

```typescript
// lib/environment.ts
export type Environment = 'production' | 'preview' | 'development';

export function getEnvironment(): Environment {
  // Vercel environment detection
  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }
  
  if (process.env.VERCEL_ENV === 'preview') {
    return 'preview';
  }
  
  if (process.env.NODE_ENV === 'development') {
    return 'development';
  }
  
  // Custom environment variable
  const env = process.env.NEXT_PUBLIC_APP_ENV;
  if (env === 'production' || env === 'preview' || env === 'development') {
    return env;
  }
  
  return 'development';
}

export function isPreview(): boolean {
  return getEnvironment() === 'preview';
}

export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

export function getDeploymentUrl(): string {
  // Vercel provides these automatically
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
  }
  
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

export function getGitInfo() {
  return {
    commitSha: process.env.VERCEL_GIT_COMMIT_SHA || 
               process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA || 
               'unknown',
    commitRef: process.env.VERCEL_GIT_COMMIT_REF || 
               process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF || 
               'unknown',
    commitMessage: process.env.VERCEL_GIT_COMMIT_MESSAGE || '',
    commitAuthor: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME || '',
  };
}
```

### Preview Banner Component

```tsx
// components/preview-banner.tsx
'use client';

import { useState, useEffect } from 'react';
import { getEnvironment, getGitInfo, getDeploymentUrl } from '@/lib/environment';

export function PreviewBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const environment = getEnvironment();
  const gitInfo = getGitInfo();
  
  useEffect(() => {
    // Only show in preview/development
    setIsVisible(environment !== 'production');
  }, [environment]);
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-yellow-500 text-black px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="font-bold uppercase text-sm">
              {environment === 'preview' ? 'Preview' : 'Development'}
            </span>
            {gitInfo.commitRef !== 'unknown' && (
              <p className="text-xs mt-1">
                Branch: <code className="bg-yellow-400 px-1 rounded">{gitInfo.commitRef}</code>
              </p>
            )}
            {gitInfo.commitSha !== 'unknown' && (
              <p className="text-xs">
                Commit: <code className="bg-yellow-400 px-1 rounded">
                  {gitInfo.commitSha.slice(0, 7)}
                </code>
              </p>
            )}
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-black hover:text-gray-700 font-bold"
            aria-label="Close preview banner"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Preview-Specific Configuration

```typescript
// lib/config/preview.ts
import { getEnvironment } from '@/lib/environment';

interface PreviewConfig {
  // Use separate database for previews
  databaseUrl: string;
  // Use test API keys
  stripeKey: string;
  // Enable debug features
  debugMode: boolean;
  // Use staging services
  apiBaseUrl: string;
  // Allow test users
  allowTestUsers: boolean;
}

interface ProductionConfig {
  databaseUrl: string;
  stripeKey: string;
  debugMode: boolean;
  apiBaseUrl: string;
  allowTestUsers: boolean;
}

type AppConfig = PreviewConfig | ProductionConfig;

export function getConfig(): AppConfig {
  const environment = getEnvironment();
  
  if (environment === 'production') {
    return {
      databaseUrl: process.env.DATABASE_URL!,
      stripeKey: process.env.STRIPE_SECRET_KEY!,
      debugMode: false,
      apiBaseUrl: 'https://api.example.com',
      allowTestUsers: false,
    };
  }
  
  // Preview and development config
  return {
    databaseUrl: process.env.PREVIEW_DATABASE_URL || process.env.DATABASE_URL!,
    stripeKey: process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY!,
    debugMode: true,
    apiBaseUrl: process.env.PREVIEW_API_URL || 'https://staging-api.example.com',
    allowTestUsers: true,
  };
}

// Branch-specific database
export function getBranchDatabaseUrl(): string {
  const branch = process.env.VERCEL_GIT_COMMIT_REF;
  
  if (!branch || getEnvironment() === 'production') {
    return process.env.DATABASE_URL!;
  }
  
  // Use Neon or PlanetScale branching
  const baseName = process.env.DATABASE_NAME || 'app';
  const safeBranch = branch.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20);
  
  // For Neon branching
  if (process.env.NEON_API_KEY) {
    return `${process.env.NEON_DATABASE_URL?.replace(baseName, `${baseName}_${safeBranch}`)}`;
  }
  
  return process.env.DATABASE_URL!;
}
```

### GitHub Actions Preview Workflow

```yaml
# .github/workflows/preview.yml
name: Preview Deployment

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  deploy-preview:
    runs-on: ubuntu-latest
    environment:
      name: preview
      url: ${{ steps.deploy.outputs.preview-url }}
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_APP_ENV: preview
      
      - name: Deploy to Vercel
        id: deploy
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          alias-domains: |
            pr-${{ github.event.pull_request.number }}.preview.example.com
      
      - name: Comment PR
        uses: actions/github-script@v7
        with:
          script: |
            const url = '${{ steps.deploy.outputs.preview-url }}';
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `## Preview Deployment Ready
              
              | Environment | URL |
              |-------------|-----|
              | Preview | [${url}](${url}) |
              
              **Commit:** \`${{ github.sha }}\`
              **Branch:** \`${{ github.head_ref }}\``
            });
```

### Preview Database Seeding

```typescript
// scripts/seed-preview.ts
import { PrismaClient } from '@prisma/client';
import { getEnvironment } from '@/lib/environment';

const prisma = new PrismaClient();

async function seedPreviewData() {
  const environment = getEnvironment();
  
  if (environment === 'production') {
    console.error('Cannot seed production database!');
    process.exit(1);
  }
  
  console.log('Seeding preview database...');
  
  // Create test users
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_password_here',
    },
  });
  
  // Create sample data
  await prisma.post.createMany({
    data: [
      { title: 'Preview Post 1', content: 'Content', authorId: testUser.id },
      { title: 'Preview Post 2', content: 'Content', authorId: testUser.id },
    ],
    skipDuplicates: true,
  });
  
  console.log('Preview database seeded successfully');
}

seedPreviewData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### API Route with Preview Handling

```typescript
// app/api/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getEnvironment, getGitInfo } from '@/lib/environment';

export async function GET(request: NextRequest) {
  const environment = getEnvironment();
  const gitInfo = getGitInfo();
  
  // Only expose in non-production
  if (environment === 'production') {
    return NextResponse.json({ error: 'Not available' }, { status: 404 });
  }
  
  return NextResponse.json({
    environment,
    git: gitInfo,
    timestamp: new Date().toISOString(),
    features: {
      debugMode: true,
      testUsers: true,
      mockPayments: true,
    },
  });
}
```

## Variants

### Self-Hosted Preview with Docker

```yaml
# docker-compose.preview.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_APP_ENV=preview
    ports:
      - "${PORT:-3000}:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_ENV=preview
      - DATABASE_URL=${PREVIEW_DATABASE_URL}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.preview-${BRANCH_NAME}.rule=Host(`${BRANCH_NAME}.preview.example.com`)"

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=preview_${BRANCH_NAME}
      - POSTGRES_USER=preview
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - preview_data:/var/lib/postgresql/data

volumes:
  preview_data:
```

### Feature Branch Routing

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  
  // Extract branch from subdomain (e.g., feature-123.preview.example.com)
  const branchMatch = hostname.match(/^([^.]+)\.preview\./);
  
  if (branchMatch) {
    const branch = branchMatch[1];
    
    // Add branch header for logging/debugging
    const response = NextResponse.next();
    response.headers.set('x-preview-branch', branch);
    
    return response;
  }
  
  return NextResponse.next();
}
```

## Anti-Patterns

```typescript
// Bad: Hardcoding environment checks
if (process.env.VERCEL_URL?.includes('preview')) {
  // Fragile check
}

// Good: Use proper environment detection
if (isPreview()) {
  // Clear and maintainable
}

// Bad: Using production data in preview
const dbUrl = process.env.DATABASE_URL; // Same for all environments!

// Good: Environment-specific databases
const dbUrl = getConfig().databaseUrl; // Different per environment

// Bad: No visual indication of preview
// Users might think they're on production

// Good: Clear preview banner
<PreviewBanner /> // Always visible in non-production
```

## Related Skills

- `vercel-deployment` - Production deployment setup
- `feature-flags` - Toggle features per environment
- `environment-variables` - Managing env vars
- `docker` - Container-based previews

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial preview deployments pattern
