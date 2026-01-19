---
id: o-api-card
name: API Card
version: 1.0.0
layer: L3
category: developer
description: Card component displaying API endpoint information with method, path, and description
tags: [api, endpoint, card, developer, documentation]
formula: "APICard = Card(m-card) + Badge(a-badge) + CopyButton(m-copy-button) + Code(a-code)"
composes:
  - ../molecules/card.md
  - ../atoms/display-badge.md
  - ../molecules/copy-button.md
  - ../atoms/display-code.md
dependencies:
  - react
  - lucide-react
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# API Card

## Overview

A card component for displaying API endpoint information including HTTP method, path, description, and quick copy functionality. Ideal for API documentation pages and developer portals.

## When to Use

Use this skill when:
- Building API documentation pages
- Creating developer portal dashboards
- Showing available endpoints in admin panels
- Displaying webhook configurations

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        APICard (L3)                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Card Header                                              │  │
│  │  ┌─────────┐ ┌──────────────────────────────────────────┐│  │
│  │  │ Badge   │ │ /api/v1/users                           ││  │
│  │  │ (GET)   │ │ Code(a-code) + CopyButton(m-copy-btn)   ││  │
│  │  │(a-badge)│ └──────────────────────────────────────────┘│  │
│  │  └─────────┘                                              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Card Body                                                │  │
│  │  Title: "List Users"                                      │  │
│  │  Description: "Retrieve a paginated list of users..."    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Card Footer (optional)                                   │  │
│  │  [Auth Required] [Rate Limited]  [Try it →]              │  │
│  │  Badge(a-badge)[] + Button                                │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/api-card.tsx
'use client';

import * as React from 'react';
import { Copy, Check, ExternalLink, Lock, Zap, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface APICardProps {
  method: HttpMethod;
  path: string;
  title: string;
  description?: string;
  baseUrl?: string;
  requiresAuth?: boolean;
  isRateLimited?: boolean;
  deprecated?: boolean;
  tags?: string[];
  onTryIt?: () => void;
  onClick?: () => void;
  className?: string;
}

// Method color configurations
const methodColors: Record<HttpMethod, string> = {
  GET: 'bg-green-100 text-green-700 border-green-200',
  POST: 'bg-blue-100 text-blue-700 border-blue-200',
  PUT: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  PATCH: 'bg-orange-100 text-orange-700 border-orange-200',
  DELETE: 'bg-red-100 text-red-700 border-red-200',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 rounded hover:bg-accent transition-colors"
      aria-label="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

function MethodBadge({ method }: { method: HttpMethod }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border',
        methodColors[method]
      )}
    >
      {method}
    </span>
  );
}

export function APICard({
  method,
  path,
  title,
  description,
  baseUrl,
  requiresAuth = false,
  isRateLimited = false,
  deprecated = false,
  tags = [],
  onTryIt,
  onClick,
  className,
}: APICardProps) {
  const fullPath = baseUrl ? `${baseUrl}${path}` : path;

  return (
    <div
      className={cn(
        'group rounded-lg border bg-card p-4 transition-colors',
        onClick && 'cursor-pointer hover:border-primary/50 hover:shadow-sm',
        deprecated && 'opacity-60',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <MethodBadge method={method} />
        <div className="flex-1 flex items-center gap-2 min-w-0">
          <code className="text-sm font-mono truncate">{path}</code>
          <CopyButton text={fullPath} />
        </div>
      </div>

      {/* Body */}
      <div className="mt-3">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">{title}</h3>
          {deprecated && (
            <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-medium text-yellow-700">
              Deprecated
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {requiresAuth && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              Auth
            </span>
          )}
          {isRateLimited && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              Rate Limited
            </span>
          )}
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {onTryIt && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTryIt();
            }}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Try it
            <ExternalLink className="h-3 w-3" />
          </button>
        )}

        {onClick && !onTryIt && (
          <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </div>
  );
}

// Card list wrapper
export function APICardList({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {children}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { APICard, APICardList } from '@/components/organisms/api-card';

<APICardList>
  <APICard
    method="GET"
    path="/api/v1/users"
    title="List Users"
    description="Retrieve a paginated list of all users"
    requiresAuth
  />
  <APICard
    method="POST"
    path="/api/v1/users"
    title="Create User"
    description="Create a new user account"
    requiresAuth
  />
</APICardList>
```

### With Try It Button

```tsx
<APICard
  method="GET"
  path="/api/v1/products"
  title="List Products"
  baseUrl="https://api.example.com"
  onTryIt={() => openApiPlayground('/api/v1/products')}
/>
```

### Deprecated Endpoint

```tsx
<APICard
  method="GET"
  path="/api/v1/legacy/users"
  title="List Users (Legacy)"
  deprecated
  description="Use /api/v2/users instead"
/>
```

## Props API

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `method` | `'GET' \| 'POST' \| 'PUT' \| 'PATCH' \| 'DELETE'` | Required | HTTP method for the endpoint |
| `path` | `string` | Required | API endpoint path |
| `title` | `string` | Required | Display title for the endpoint |
| `description` | `string` | `undefined` | Optional description of what the endpoint does |
| `baseUrl` | `string` | `undefined` | Base URL to prepend for copy functionality |
| `requiresAuth` | `boolean` | `false` | Whether authentication is required |
| `isRateLimited` | `boolean` | `false` | Whether rate limiting applies |
| `deprecated` | `boolean` | `false` | Whether the endpoint is deprecated |
| `tags` | `string[]` | `[]` | Optional tags for categorization |
| `onTryIt` | `() => void` | `undefined` | Handler for "Try it" button click |
| `onClick` | `() => void` | `undefined` | Handler for card click (makes card interactive) |
| `className` | `string` | `undefined` | Additional CSS classes |

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Normal resting state | Standard card with border |
| Hover | Mouse over card (when onClick provided) | Border highlight, subtle shadow |
| Focus | Keyboard focus on interactive card | Focus ring visible |
| Deprecated | Endpoint marked as deprecated | Reduced opacity (60%), deprecated badge |
| Copied | After copying path | Check icon replaces copy icon for 2s |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus to card (if interactive), copy button, try it button |
| `Enter` | Activate focused element (card click, copy, try it) |
| `Space` | Activate focused element |

## Screen Reader Announcements

- Card announced as "button" role when onClick is provided
- Method badge announces HTTP method (e.g., "GET")
- Copy button announces "Copy to clipboard"
- After copy: announces "Copied to clipboard" via aria-live region
- Deprecated state announced with badge text
- Auth and rate limit indicators have descriptive text

## Anti-patterns

### 1. Missing Method Information
```tsx
// Bad - no method specified
<APICard
  path="/api/users"
  title="Users"
/>

// Good - method clearly specified
<APICard
  method="GET"
  path="/api/users"
  title="List Users"
/>
```

### 2. Unclear Endpoint Purpose
```tsx
// Bad - generic title, no description
<APICard
  method="POST"
  path="/api/v1/process"
  title="Process"
/>

// Good - descriptive title and description
<APICard
  method="POST"
  path="/api/v1/process"
  title="Process Payment"
  description="Process a payment transaction with the specified amount and currency"
/>
```

### 3. Missing Authentication Indicators
```tsx
// Bad - endpoint requires auth but not indicated
<APICard
  method="DELETE"
  path="/api/users/:id"
  title="Delete User"
/>

// Good - authentication requirement clearly shown
<APICard
  method="DELETE"
  path="/api/users/:id"
  title="Delete User"
  requiresAuth
  description="Permanently delete a user account. Requires admin privileges."
/>
```

### 4. Not Using Deprecated Flag for Old Endpoints
```tsx
// Bad - old endpoint without deprecation warning
<APICard
  method="GET"
  path="/api/v1/users"
  title="List Users (Old)"
/>

// Good - clearly marked as deprecated with migration path
<APICard
  method="GET"
  path="/api/v1/users"
  title="List Users (Legacy)"
  deprecated
  description="Deprecated: Use /api/v2/users instead"
/>
```

## Related Skills

- `organisms/api-documentation` - Full API docs display
- `molecules/copy-button` - Copy to clipboard
- `organisms/api-key-list` - API key management

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- HTTP method badges with colors
- Copy path functionality
- Auth and rate limit indicators
