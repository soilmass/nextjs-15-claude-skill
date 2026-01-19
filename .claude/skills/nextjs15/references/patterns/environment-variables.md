---
id: pt-environment-variables
name: Environment Variables
version: 2.0.0
layer: L5
category: devops
description: Manage environment variables securely in Next.js applications
tags: [deployment, env, configuration, security, next15]
composes: []
dependencies: []
formula: "Config Validation + Type Safety + Environment Separation = Secure Environment Management"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Environment Variables

## Overview

Environment variables store configuration that varies between environments (development, staging, production). Next.js has built-in support with different loading priorities and client/server separation. This pattern covers type-safe configuration, validation, and security best practices.

## When to Use

- Setting up a new Next.js project with multiple environments
- Configuring different API keys for development/staging/production
- Managing secrets securely across deployments
- Implementing type-safe configuration with runtime validation
- Separating client-exposed variables from server-only secrets

## Basic Setup

```bash
# .env (shared defaults, committed to git)
NEXT_PUBLIC_APP_NAME="My App"
NEXT_PUBLIC_API_URL="https://api.example.com"

# .env.local (local overrides, gitignored)
DATABASE_URL="postgresql://localhost:5432/myapp"
AUTH_SECRET="dev-secret-change-in-production"

# .env.development (development-specific)
NEXT_PUBLIC_DEBUG="true"

# .env.production (production-specific)
NEXT_PUBLIC_DEBUG="false"
```

## Type-Safe Environment Variables

```typescript
// lib/env.ts
import { z } from 'zod';

// Server-side environment schema
const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  RESEND_API_KEY: z.string(),
  
  // Optional with defaults
  PORT: z.coerce.number().default(3000),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

// Client-side environment schema (NEXT_PUBLIC_ prefix)
const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
});

// Validate and export server env
const serverEnvParsed = serverEnvSchema.safeParse(process.env);

if (!serverEnvParsed.success) {
  console.error('❌ Invalid server environment variables:');
  console.error(serverEnvParsed.error.flatten().fieldErrors);
  throw new Error('Invalid server environment variables');
}

export const serverEnv = serverEnvParsed.data;

// Validate and export client env
const clientEnvParsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
});

if (!clientEnvParsed.success) {
  console.error('❌ Invalid client environment variables:');
  console.error(clientEnvParsed.error.flatten().fieldErrors);
  throw new Error('Invalid client environment variables');
}

export const clientEnv = clientEnvParsed.data;

// Combined env for convenience
export const env = {
  ...serverEnv,
  ...clientEnv,
};
```

## Using @t3-oss/env-nextjs

```typescript
// lib/env.ts
import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  // Server-side variables
  server: {
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
    RESEND_API_KEY: z.string(),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  },

  // Client-side variables (must start with NEXT_PUBLIC_)
  client: {
    NEXT_PUBLIC_APP_NAME: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  },

  // Runtime values
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  // Skip validation in certain conditions
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,

  // Empty string handling
  emptyStringAsUndefined: true,
});

// Usage
import { env } from '@/lib/env';

// Server-side
const db = new PrismaClient({
  datasources: { db: { url: env.DATABASE_URL } },
});

// Client-side
export function Analytics() {
  return (
    <script
      data-app={env.NEXT_PUBLIC_APP_NAME}
      data-url={env.NEXT_PUBLIC_APP_URL}
    />
  );
}
```

## Environment-Specific Configuration

```typescript
// config/index.ts
import { env } from '@/lib/env';

interface Config {
  app: {
    name: string;
    url: string;
    debug: boolean;
  };
  api: {
    url: string;
    timeout: number;
  };
  features: {
    analytics: boolean;
    maintenance: boolean;
  };
}

const development: Config = {
  app: {
    name: 'My App (Dev)',
    url: 'http://localhost:3000',
    debug: true,
  },
  api: {
    url: 'http://localhost:3001',
    timeout: 30000,
  },
  features: {
    analytics: false,
    maintenance: false,
  },
};

const production: Config = {
  app: {
    name: env.NEXT_PUBLIC_APP_NAME,
    url: env.NEXT_PUBLIC_APP_URL,
    debug: false,
  },
  api: {
    url: env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
  },
  features: {
    analytics: true,
    maintenance: false,
  },
};

const configs: Record<string, Config> = {
  development,
  production,
  test: development,
};

export const config = configs[env.NODE_ENV] || development;
```

## Feature Flags via Environment

```typescript
// lib/features.ts
import { env } from '@/lib/env';

export const features = {
  // Boolean flags
  newDashboard: process.env.NEXT_PUBLIC_FEATURE_NEW_DASHBOARD === 'true',
  betaFeatures: process.env.NEXT_PUBLIC_FEATURE_BETA === 'true',
  
  // Percentage rollout
  aiAssistant: (() => {
    const percentage = parseInt(process.env.NEXT_PUBLIC_AI_ROLLOUT || '0');
    return Math.random() * 100 < percentage;
  })(),
  
  // User-based flags (checked at runtime)
  isEnabled: (flag: string, userId?: string) => {
    const enabledUsers = process.env[`FEATURE_${flag.toUpperCase()}_USERS`];
    if (!enabledUsers) return false;
    if (!userId) return false;
    return enabledUsers.split(',').includes(userId);
  },
};

// Usage in components
'use client';

import { features } from '@/lib/features';

export function Dashboard() {
  if (features.newDashboard) {
    return <NewDashboard />;
  }
  return <LegacyDashboard />;
}
```

## Secure Secrets Handling

```typescript
// lib/secrets.ts
import { headers } from 'next/headers';

// Only access secrets on the server
export async function getSecret(name: string): Promise<string> {
  // Ensure this only runs on server
  if (typeof window !== 'undefined') {
    throw new Error('Secrets can only be accessed on the server');
  }

  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required secret: ${name}`);
  }

  return value;
}

// Mask secrets in logs
export function maskSecret(secret: string): string {
  if (secret.length <= 8) return '****';
  return secret.slice(0, 4) + '****' + secret.slice(-4);
}

// Verify API keys
export async function verifyApiKey(request: Request): Promise<boolean> {
  const headersList = await headers();
  const apiKey = headersList.get('x-api-key');
  const validKey = process.env.API_KEY;

  if (!apiKey || !validKey) return false;

  // Timing-safe comparison
  const crypto = await import('crypto');
  return crypto.timingSafeEqual(
    Buffer.from(apiKey),
    Buffer.from(validKey)
  );
}
```

## Environment for Different Stages

```bash
# .env.staging
NEXT_PUBLIC_APP_URL="https://staging.example.com"
DATABASE_URL="postgresql://staging-db/myapp"

# .env.production
NEXT_PUBLIC_APP_URL="https://example.com"
DATABASE_URL="postgresql://production-db/myapp"
```

```typescript
// Load stage-specific config
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build:staging": "NEXT_PUBLIC_STAGE=staging next build",
    "build:production": "NEXT_PUBLIC_STAGE=production next build"
  }
}

// lib/stage.ts
export const stage = process.env.NEXT_PUBLIC_STAGE || 'development';
export const isStaging = stage === 'staging';
export const isProduction = stage === 'production';
export const isDevelopment = stage === 'development';
```

## Validation at Build Time

```typescript
// scripts/validate-env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  // ... other required vars
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ Missing or invalid environment variables:');
  console.error(JSON.stringify(result.error.format(), null, 2));
  process.exit(1);
}

console.log('✅ Environment variables validated');
```

```json
// package.json
{
  "scripts": {
    "prebuild": "npx tsx scripts/validate-env.ts"
  }
}
```

## Anti-patterns

### Don't Expose Server Secrets

```typescript
// BAD - Exposing server secret to client
export function Component() {
  const apiKey = process.env.STRIPE_SECRET_KEY; // Undefined on client!
  return <div>{apiKey}</div>;
}

// GOOD - Use NEXT_PUBLIC_ for client values
export function Component() {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  return <div>{publishableKey}</div>;
}
```

### Don't Hardcode Environment Values

```typescript
// BAD - Hardcoded values
const apiUrl = 'https://api.example.com';

// GOOD - Use environment variables
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

### Don't Commit .env.local

```gitignore
# .gitignore
.env.local
.env.*.local
```

## Related Skills

- [vercel-deployment](./vercel-deployment.md)
- [docker](./docker.md)
- [security](./security.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Type-safe env with Zod
- @t3-oss/env-nextjs integration
- Feature flags
- Secrets handling
- Build-time validation
