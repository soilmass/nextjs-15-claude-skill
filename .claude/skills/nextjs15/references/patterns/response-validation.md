---
id: pt-response-validation
name: Response Validation
version: 1.0.0
layer: L5
category: data
description: Validate API responses with Zod for type-safe data handling
tags: [data, validation, zod, api, next15, react19]
composes: []
dependencies: []
formula: "ResponseValidation = ZodSchema + safeParse + ErrorBoundary + TypeGuards"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Response Validation

## Overview

Response validation ensures API responses match expected schemas, providing type safety and runtime validation. This pattern covers Zod-based validation with proper error handling.

## When to Use

- External API integrations
- Type-safe data fetching
- Validating webhook payloads
- Runtime type checking
- Data transformation pipelines

## Basic Schema Validation

```typescript
// lib/validation/schemas.ts
import { z } from 'zod';

// User schema
export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().nullable(),
  avatar: z.string().url().nullable(),
  createdAt: z.string().datetime().transform((s) => new Date(s)),
  role: z.enum(['USER', 'ADMIN', 'MODERATOR']),
});

export type User = z.infer<typeof userSchema>;

// Paginated response schema
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    meta: z.object({
      total: z.number(),
      page: z.number(),
      limit: z.number(),
      totalPages: z.number(),
    }),
  });

export const usersResponseSchema = paginatedResponseSchema(userSchema);
export type UsersResponse = z.infer<typeof usersResponseSchema>;

// API error schema
export const apiErrorSchema = z.object({
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.record(z.unknown()).optional(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;
```

## Validated Fetch Utility

```typescript
// lib/api/validated-fetch.ts
import { z } from 'zod';

export class ValidationError extends Error {
  constructor(
    message: string,
    public issues: z.ZodIssue[],
    public rawData: unknown
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ApiResponseError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown
  ) {
    super(message);
    this.name = 'ApiResponseError';
  }
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export async function validatedFetch<T>(
  url: string,
  schema: z.ZodType<T>,
  options: FetchOptions = {}
): Promise<T> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new ApiResponseError(
        `API request failed: ${response.status}`,
        response.status,
        body
      );
    }

    const data = await response.json();
    const result = schema.safeParse(data);

    if (!result.success) {
      throw new ValidationError(
        'Response validation failed',
        result.error.issues,
        data
      );
    }

    return result.data;
  } finally {
    clearTimeout(timeoutId);
  }
}

// Usage
const users = await validatedFetch('/api/users', usersResponseSchema);
```

## API Client with Validation

```typescript
// lib/api/client.ts
import { z } from 'zod';
import { validatedFetch, ValidationError, ApiResponseError } from './validated-fetch';

export class ApiClient {
  constructor(
    private baseUrl: string,
    private defaultHeaders: Record<string, string> = {}
  ) {}

  private getUrl(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  async get<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    return validatedFetch(this.getUrl(path), schema, {
      headers: this.defaultHeaders,
    });
  }

  async post<T, B>(
    path: string,
    body: B,
    schema: z.ZodType<T>
  ): Promise<T> {
    return validatedFetch(this.getUrl(path), schema, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  async put<T, B>(
    path: string,
    body: B,
    schema: z.ZodType<T>
  ): Promise<T> {
    return validatedFetch(this.getUrl(path), schema, {
      method: 'PUT',
      headers: {
        ...this.defaultHeaders,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  async delete<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    return validatedFetch(this.getUrl(path), schema, {
      method: 'DELETE',
      headers: this.defaultHeaders,
    });
  }
}

// Usage
export const api = new ApiClient('/api', {
  Authorization: `Bearer ${process.env.API_KEY}`,
});
```

## Response Validation Hook

```typescript
// hooks/use-validated-query.ts
'use client';

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { z } from 'zod';
import { validatedFetch } from '@/lib/api/validated-fetch';

interface UseValidatedQueryOptions<T>
  extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: unknown[];
  url: string;
  schema: z.ZodType<T>;
}

export function useValidatedQuery<T>({
  queryKey,
  url,
  schema,
  ...options
}: UseValidatedQueryOptions<T>) {
  return useQuery({
    queryKey,
    queryFn: () => validatedFetch(url, schema),
    ...options,
  });
}

// Usage
function UsersList() {
  const { data, error, isLoading } = useValidatedQuery({
    queryKey: ['users'],
    url: '/api/users',
    schema: usersResponseSchema,
  });

  if (error) {
    if (error instanceof ValidationError) {
      console.error('Validation issues:', error.issues);
    }
    return <div>Error loading users</div>;
  }

  return <ul>{data?.data.map((user) => <li key={user.id}>{user.name}</li>)}</ul>;
}
```

## Webhook Payload Validation

```typescript
// app/api/webhooks/[provider]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const stripeWebhookSchema = z.object({
  id: z.string(),
  type: z.string(),
  data: z.object({
    object: z.record(z.unknown()),
  }),
  created: z.number(),
});

const githubWebhookSchema = z.object({
  action: z.string(),
  repository: z.object({
    id: z.number(),
    name: z.string(),
    full_name: z.string(),
  }),
  sender: z.object({
    login: z.string(),
    id: z.number(),
  }),
});

const webhookSchemas = {
  stripe: stripeWebhookSchema,
  github: githubWebhookSchema,
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const schema = webhookSchemas[provider as keyof typeof webhookSchemas];

  if (!schema) {
    return NextResponse.json(
      { error: 'Unknown webhook provider' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      console.error('Webhook validation failed:', result.error.issues);
      return NextResponse.json(
        { error: 'Invalid webhook payload', issues: result.error.issues },
        { status: 400 }
      );
    }

    // Process validated webhook
    await processWebhook(provider, result.data);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function processWebhook(provider: string, data: unknown) {
  // Handle webhook...
}
```

## Transform and Coerce

```typescript
// lib/validation/transforms.ts
import { z } from 'zod';

// Date string to Date object
export const dateSchema = z
  .string()
  .datetime()
  .transform((s) => new Date(s));

// Number from string
export const numericStringSchema = z
  .string()
  .regex(/^\d+$/)
  .transform(Number);

// Boolean from various formats
export const booleanSchema = z
  .union([z.boolean(), z.literal('true'), z.literal('false'), z.literal(1), z.literal(0)])
  .transform((val) => val === true || val === 'true' || val === 1);

// Nullable with default
export const nullableWithDefault = <T>(schema: z.ZodType<T>, defaultValue: T) =>
  schema.nullable().transform((val) => val ?? defaultValue);

// Example: API response with transforms
export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: numericStringSchema, // "1999" -> 1999
  inStock: booleanSchema, // "true" -> true
  createdAt: dateSchema, // "2024-01-01T00:00:00Z" -> Date
  description: nullableWithDefault(z.string(), ''),
});
```

## Anti-patterns

### Don't Trust External Data

```typescript
// BAD - No validation
const data = await response.json();
return data.users; // Might not exist or have wrong shape

// GOOD - Validate everything
const result = usersResponseSchema.safeParse(await response.json());
if (!result.success) throw new ValidationError(...);
return result.data;
```

## Related Skills

- [form-validation](./form-validation.md)
- [api-types](./api-types.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Validated fetch utility
- API client
- Webhook validation
