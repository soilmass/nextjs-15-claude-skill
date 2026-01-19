---
id: pt-dev-tools
name: Developer Tools Patterns
version: 2.0.0
layer: L5
category: observability
description: Essential developer tools and utilities for Next.js 15 development productivity
tags: [devtools, productivity, development, utilities, scripts]
composes: []
dependencies: []
formula: scripts + automation + validation + analysis = efficient development workflow
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Developer Tools Patterns

## When to Use

- Setting up new Next.js projects with consistent tooling
- Standardizing development workflows across teams
- Automating repetitive development tasks
- Database development and testing utilities
- Bundle analysis and performance profiling

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|   Package.json    |---->|   pt-dev-tools    |---->|   Development     |
|     Scripts       |     |    (Tooling)      |     |    Workflow       |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|   Build Tools     |     |   Database        |     |   Bundle          |
| (Turbo/Webpack)   |     |   Utilities       |     |   Analyzer        |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|  pt-debugging     |     |  Storybook        |     |   pt-metrics      |
| (VS Code/DevTools)|     |  (Components)     |     |  (Performance)    |
+-------------------+     +-------------------+     +-------------------+
        |
        v
+-------------------+
|   pt-logging      |
| (Dev Logging)     |
+-------------------+
```

## Overview

Developer tools enhance productivity through automation, inspection, and debugging capabilities. This pattern covers essential tooling for Next.js development workflows.

## Implementation

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev --turbo",
    "dev:debug": "NODE_OPTIONS='--inspect' next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "e2e": "playwright test",
    "e2e:ui": "playwright test --ui",
    "analyze": "ANALYZE=true next build",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx prisma/seed.ts",
    "clean": "rm -rf .next node_modules/.cache",
    "clean:all": "rm -rf .next node_modules out coverage .turbo",
    "prepare": "husky install"
  }
}
```

### Bundle Analyzer

```typescript
// next.config.ts
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig = {
  // ... config
};

export default withBundleAnalyzer(nextConfig);
```

### Component Development with Storybook

```typescript
// .storybook/main.ts
import type { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-onboarding",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/nextjs",
    options: {},
  },
  staticDirs: ["../public"],
};

export default config;

// .storybook/preview.ts
import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    nextjs: {
      appDirectory: true,
    },
  },
};

export default preview;

// Example story
// components/ui/button.stories.tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg", "icon"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete",
  },
};
```

### Database Tools

```typescript
// scripts/db-health.ts
import { prisma } from "@/lib/db";

async function checkDatabaseHealth() {
  console.log("🔍 Checking database health...\n");

  try {
    // Test connection
    const start = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = performance.now() - start;
    console.log(`✅ Database connected (${latency.toFixed(2)}ms)`);

    // Check table counts
    const tables = ["User", "Post", "Comment"] as const;
    
    for (const table of tables) {
      const count = await (prisma[table.toLowerCase() as keyof typeof prisma] as any).count();
      console.log(`📊 ${table}: ${count} records`);
    }

    // Check for pending migrations
    const migrations = await prisma.$queryRaw<{ migration_name: string }[]>`
      SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NULL
    `;
    
    if (migrations.length > 0) {
      console.warn(`⚠️  Pending migrations:`, migrations);
    } else {
      console.log(`✅ All migrations applied`);
    }

  } catch (error) {
    console.error("❌ Database health check failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseHealth();

// scripts/db-seed.ts
import { prisma } from "@/lib/db";
import { faker } from "@faker-js/faker";

async function seed() {
  console.log("🌱 Seeding database...\n");

  // Clear existing data
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          email: faker.internet.email(),
          name: faker.person.fullName(),
          avatar: faker.image.avatar(),
        },
      })
    )
  );

  console.log(`✅ Created ${users.length} users`);

  // Create posts
  const posts = await Promise.all(
    users.flatMap((user) =>
      Array.from({ length: faker.number.int({ min: 1, max: 5 }) }).map(() =>
        prisma.post.create({
          data: {
            title: faker.lorem.sentence(),
            content: faker.lorem.paragraphs(3),
            authorId: user.id,
            published: faker.datatype.boolean(),
          },
        })
      )
    )
  );

  console.log(`✅ Created ${posts.length} posts`);
  console.log("\n🎉 Seeding complete!");
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### API Testing Tool

```typescript
// scripts/api-test.ts
import { z } from "zod";

const BASE_URL = process.env.API_URL || "http://localhost:3000";

interface TestResult {
  name: string;
  status: "pass" | "fail";
  duration: number;
  error?: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<void>) {
  const start = performance.now();
  try {
    await fn();
    results.push({
      name,
      status: "pass",
      duration: performance.now() - start,
    });
    console.log(`✅ ${name}`);
  } catch (error) {
    results.push({
      name,
      status: "fail",
      duration: performance.now() - start,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log(`❌ ${name}: ${error}`);
  }
}

async function runTests() {
  console.log(`🧪 Testing API at ${BASE_URL}\n`);

  // Health check
  await test("GET /api/health", async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
  });

  // Users endpoint
  await test("GET /api/users", async () => {
    const res = await fetch(`${BASE_URL}/api/users`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    
    const data = await res.json();
    const schema = z.object({
      success: z.literal(true),
      data: z.array(z.object({
        id: z.string(),
        email: z.string(),
        name: z.string(),
      })),
    });
    schema.parse(data);
  });

  // Create user
  await test("POST /api/users", async () => {
    const res = await fetch(`${BASE_URL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: `test-${Date.now()}@example.com`,
        name: "Test User",
      }),
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
  });

  // Summary
  console.log("\n📊 Summary:");
  const passed = results.filter((r) => r.status === "pass").length;
  const failed = results.filter((r) => r.status === "fail").length;
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Total:  ${results.length}`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
```

### Development Utilities

```typescript
// lib/dev-utils.ts

// Environment info
export function getEnvironmentInfo() {
  return {
    nodeVersion: process.version,
    nextVersion: require("next/package.json").version,
    reactVersion: require("react/package.json").version,
    env: process.env.NODE_ENV,
    vercel: !!process.env.VERCEL,
    debug: process.env.DEBUG === "true",
  };
}

// Timing utility
export function timing<T>(label: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  console.log(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
  return result;
}

export async function timingAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;
  console.log(`⏱️  ${label}: ${duration.toFixed(2)}ms`);
  return result;
}

// Memory usage
export function logMemoryUsage() {
  const used = process.memoryUsage();
  console.log("📊 Memory usage:");
  for (const [key, value] of Object.entries(used)) {
    console.log(`   ${key}: ${(value / 1024 / 1024).toFixed(2)} MB`);
  }
}

// Request logger middleware
import { NextRequest, NextResponse } from "next/server";

export function withRequestLog(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    const start = performance.now();
    const response = await handler(req);
    const duration = performance.now() - start;
    
    console.log(
      `${req.method} ${req.nextUrl.pathname} - ${response.status} (${duration.toFixed(0)}ms)`
    );
    
    return response;
  };
}
```

### VS Code Tasks

```json
// .vscode/tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "dev",
      "type": "npm",
      "script": "dev",
      "group": "build",
      "isBackground": true,
      "problemMatcher": {
        "pattern": {
          "regexp": "^(.*)$",
          "file": 1,
          "line": 2,
          "column": 3,
          "message": 4
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "^\\s*ready\\s*-\\s*started",
          "endsPattern": "^\\s*event\\s*-\\s*compiled"
        }
      }
    },
    {
      "label": "build",
      "type": "npm",
      "script": "build",
      "group": {
        "kind": "build",
        "isDefault": true
      }
    },
    {
      "label": "lint",
      "type": "npm",
      "script": "lint",
      "problemMatcher": ["$eslint-stylish"]
    },
    {
      "label": "type-check",
      "type": "npm",
      "script": "type-check",
      "problemMatcher": ["$tsc"]
    },
    {
      "label": "test",
      "type": "npm",
      "script": "test",
      "group": {
        "kind": "test",
        "isDefault": true
      }
    }
  ]
}
```

### Environment Validation

```typescript
// lib/env.ts
import { z } from "zod";

const envSchema = z.object({
  // Server
  DATABASE_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  
  // Client (prefixed with NEXT_PUBLIC_)
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Optional with defaults
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

// Validate on import
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  
  if (process.env.NODE_ENV === "production") {
    throw new Error("Invalid environment variables");
  }
}

export const env = parsed.success ? parsed.data : ({} as z.infer<typeof envSchema>);
```

## Variants

### Git Hooks with Husky

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npm run lint-staged

# .husky/commit-msg
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yml}": ["prettier --write"]
  }
}
```

## Anti-patterns

1. **No scripts standardization**: Inconsistent npm scripts across projects
2. **Missing type checking**: Not running tsc in CI
3. **No bundle analysis**: Unknown bundle size impact
4. **Manual environment validation**: Runtime errors from missing env vars
5. **No pre-commit hooks**: Linting issues discovered late

## Related Skills

- `L5/patterns/eslint-config` - ESLint configuration
- `L5/patterns/prettier-config` - Prettier configuration
- `L5/patterns/ci-cd` - CI/CD pipelines
- `L5/patterns/debugging` - Debugging techniques

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with essential dev tools
