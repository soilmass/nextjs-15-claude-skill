# L5: Patterns

> Architectural patterns and cross-cutting concerns.

## Overview

Patterns provide architectural guidance and reusable solutions for common implementation challenges. Unlike other layers that focus on UI components, patterns focus on **how things work** rather than how they look.

**Key principle**: Patterns can reference any lower layer for examples but are primarily about architecture, data flow, and system design.

## Composition Rules

```
L5 Patterns
├── composes: L0, L1, L2, L3, L4 (for examples)
└── composed by: L6 (recipes)
```

## Categories (25)

| Category | Description | Count |
|----------|-------------|-------|
| `routing` | Next.js routing patterns | ~15 |
| `data` | Data fetching and mutations | ~20 |
| `state` | State management | ~12 |
| `auth` | Authentication and authorization | ~18 |
| `cache` | Caching strategies | ~15 |
| `testing` | Testing patterns | ~12 |
| `performance` | Performance optimization | ~15 |
| `forms` | Form handling | ~10 |
| `errors` | Error handling | ~8 |
| `i18n` | Internationalization | ~5 |
| `realtime` | Real-time features | ~8 |
| `payments` | Payment processing | ~4 |
| `seo` | Search engine optimization | ~5 |
| `edge` | Edge computing | ~6 |
| `security` | Security patterns | ~8 |
| `typescript` | TypeScript patterns | ~10 |
| `devops` | Deployment and operations | ~10 |
| `observability` | Monitoring and logging | ~8 |
| `database` | Database patterns | ~5 |
| `files` | File handling | ~8 |
| `browser` | Browser APIs | ~12 |
| `background` | Background processing | ~4 |
| `email` | Email patterns | ~4 |
| `cms` | Content management | ~3 |
| `animation` | Animation patterns | ~6 |

## Files (244 total)

### Routing
| ID | Description |
|----|-------------|
| `pt-app-router` | App Router fundamentals |
| `pt-parallel-routes` | Parallel route slots |
| `pt-intercepting-routes` | Route interception |
| `pt-dynamic-routes` | Dynamic segments |
| `pt-catch-all` | Catch-all routes |
| `pt-route-groups` | Route grouping |
| `pt-route-handlers` | API route handlers |

### Data
| ID | Description |
|----|-------------|
| `pt-server-actions` | Server Actions |
| `pt-streaming` | Streaming SSR |
| `pt-mutations` | Data mutations |
| `pt-graphql` | GraphQL integration |
| `pt-trpc` | tRPC setup |
| `pt-react-query` | TanStack Query |
| `pt-swr` | SWR patterns |

### State
| ID | Description |
|----|-------------|
| `pt-zustand` | Zustand state management |
| `pt-jotai` | Jotai atomic state |
| `pt-redux-toolkit` | Redux Toolkit |
| `pt-url-state` | URL-based state |
| `pt-form-state` | Form state management |

### Auth
| ID | Description |
|----|-------------|
| `pt-next-auth` | NextAuth.js setup |
| `pt-rbac` | Role-based access control |
| `pt-session-management` | Session handling |
| `pt-magic-links` | Passwordless auth |
| `pt-two-factor` | 2FA implementation |
| `pt-social-auth` | OAuth providers |

### Cache
| ID | Description |
|----|-------------|
| `pt-redis-cache` | Redis caching |
| `pt-data-cache` | Next.js data cache |
| `pt-cache-invalidation` | Cache invalidation |
| `pt-on-demand-revalidation` | On-demand ISR |

### Testing
| ID | Description |
|----|-------------|
| `pt-testing-e2e` | Playwright E2E tests |
| `pt-testing-unit` | Unit testing |
| `pt-testing-integration` | Integration tests |
| `pt-testing-components` | Component testing |
| `pt-mocking` | Mock strategies |

### Performance
| ID | Description |
|----|-------------|
| `pt-streaming` | Streaming responses |
| `pt-preloading` | Resource preloading |
| `pt-lazy-loading` | Lazy loading |
| `pt-bundle-optimization` | Bundle size optimization |
| `pt-image-optimization` | Image optimization |

### Payments
| ID | Description |
|----|-------------|
| `pt-stripe-checkout` | Stripe Checkout |
| `pt-stripe-webhooks` | Webhook handling |
| `pt-stripe-subscriptions` | Subscription billing |

### And 200+ more patterns...

## Pattern Structure

Each pattern follows this structure:

```markdown
---
id: pt-{name}
name: {Name}
version: 2.0.0
layer: L5
category: {category}
description: {description}
tags: [relevant, tags]
composes: []
---

# {Name}

## Overview
What this pattern solves.

## When to Use
Trigger conditions and use cases.

## Implementation
Complete, production-ready code.

## Examples
Real-world usage scenarios.

## Anti-patterns
What NOT to do.

## Related Skills
Links to related patterns and components.
```

## Usage Example

```tsx
// Patterns provide architectural guidance
// This example uses pt-server-actions

// app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1),
  content: z.string().min(10),
});

export async function createPost(formData: FormData) {
  const validated = schema.parse({
    title: formData.get("title"),
    content: formData.get("content"),
  });
  
  await db.posts.create({ data: validated });
  revalidatePath("/posts");
}
```

## ID Convention

All patterns use the `pt-` prefix: `pt-{name}`
