---
id: pt-api-versioning
name: API Versioning
version: 2.0.0
layer: L5
category: data
description: Implement API versioning strategies in Next.js 15
tags: [api, versioning, backward-compatibility, deprecation, migration]
composes: []
dependencies: []
formula: "APIVersioning = VersionDetection + VersionRouting + DeprecationHeaders + MigrationHelpers"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# API Versioning Pattern

## Overview

API versioning enables introducing breaking changes while maintaining backward compatibility for existing clients. This pattern covers URL-based, header-based, and query parameter versioning strategies in Next.js 15.

## When to Use

- Introducing breaking changes to API response structure
- Supporting multiple API consumers with different integration timelines
- Deprecating old endpoints while maintaining backward compatibility
- Managing long-term API evolution with clear migration paths
- Need for beta/preview API features alongside stable versions

## Composition Diagram

```
[Client Request] --> [Version Detection]
                            |
            +---------------+---------------+
            |               |               |
      [URL Path]     [Header]      [Query Param]
      /api/v2/        X-API-Version    ?version=v2
            |               |               |
            +---------------+---------------+
                            |
                    [Version Validation]
                            |
            +---------------+---------------+
            |               |               |
      [Valid Version]  [Invalid]   [No Version]
            |               |               |
      [Route to Handler] [400 Error] [Use Default]
                            |
                    [Add Version Headers]
                            |
                    [Deprecation Notice if needed]
```

## Implementation

### URL Path Versioning

```typescript
// File structure for URL-based versioning
app/
├── api/
│   ├── v1/
│   │   ├── users/
│   │   │   └── route.ts
│   │   └── posts/
│   │       └── route.ts
│   └── v2/
│       ├── users/
│       │   └── route.ts
│       └── posts/
│           └── route.ts
```

### Version Configuration

```typescript
// lib/api/versioning/config.ts
export const API_VERSIONS = {
  v1: {
    version: '1.0.0',
    deprecated: true,
    sunsetDate: new Date('2025-06-01'),
    description: 'Legacy API version',
  },
  v2: {
    version: '2.0.0',
    deprecated: false,
    sunsetDate: null,
    description: 'Current stable API version',
  },
  v3: {
    version: '3.0.0-beta',
    deprecated: false,
    sunsetDate: null,
    description: 'Beta API version',
    beta: true,
  },
} as const;

export type ApiVersion = keyof typeof API_VERSIONS;

export const CURRENT_VERSION: ApiVersion = 'v2';
export const SUPPORTED_VERSIONS: ApiVersion[] = ['v1', 'v2', 'v3'];
```

### Version Detection Middleware

```typescript
// lib/api/versioning/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { API_VERSIONS, ApiVersion, CURRENT_VERSION, SUPPORTED_VERSIONS } from './config';

export interface VersionContext {
  version: ApiVersion;
  isDeprecated: boolean;
  isBeta: boolean;
  sunsetDate: Date | null;
}

// Extract version from various sources
export function extractVersion(request: NextRequest): ApiVersion | null {
  // 1. URL path: /api/v2/users
  const pathMatch = request.nextUrl.pathname.match(/\/api\/(v\d+)\//);
  if (pathMatch && SUPPORTED_VERSIONS.includes(pathMatch[1] as ApiVersion)) {
    return pathMatch[1] as ApiVersion;
  }

  // 2. Header: X-API-Version: v2
  const headerVersion = request.headers.get('X-API-Version');
  if (headerVersion && SUPPORTED_VERSIONS.includes(headerVersion as ApiVersion)) {
    return headerVersion as ApiVersion;
  }

  // 3. Query param: ?version=v2
  const queryVersion = request.nextUrl.searchParams.get('version');
  if (queryVersion && SUPPORTED_VERSIONS.includes(queryVersion as ApiVersion)) {
    return queryVersion as ApiVersion;
  }

  // 4. Accept header: Accept: application/vnd.api+json; version=2
  const acceptHeader = request.headers.get('Accept');
  if (acceptHeader) {
    const versionMatch = acceptHeader.match(/version=(\d+)/);
    if (versionMatch) {
      const version = `v${versionMatch[1]}` as ApiVersion;
      if (SUPPORTED_VERSIONS.includes(version)) {
        return version;
      }
    }
  }

  return null;
}

export function getVersionContext(version: ApiVersion): VersionContext {
  const config = API_VERSIONS[version];
  return {
    version,
    isDeprecated: config.deprecated,
    isBeta: 'beta' in config && config.beta === true,
    sunsetDate: config.sunsetDate,
  };
}

// Add version headers to response
export function addVersionHeaders(
  response: NextResponse,
  context: VersionContext
): NextResponse {
  response.headers.set('X-API-Version', context.version);
  
  if (context.isDeprecated) {
    response.headers.set('Deprecation', 'true');
    response.headers.set(
      'X-Deprecation-Notice',
      `This API version is deprecated. Please migrate to ${CURRENT_VERSION}.`
    );
    
    if (context.sunsetDate) {
      response.headers.set('Sunset', context.sunsetDate.toUTCString());
    }
  }
  
  if (context.isBeta) {
    response.headers.set('X-Beta-Warning', 'This API version is in beta and may change.');
  }

  return response;
}

// Middleware wrapper for versioned handlers
export function withVersioning<T>(
  handler: (
    request: NextRequest,
    context: { version: VersionContext } & T
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, routeContext: T): Promise<NextResponse> => {
    const version = extractVersion(request) || CURRENT_VERSION;
    const versionContext = getVersionContext(version);

    const response = await handler(request, {
      ...routeContext,
      version: versionContext,
    });

    return addVersionHeaders(response, versionContext);
  };
}
```

### Version-Aware Route Handler

```typescript
// app/api/v1/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/utils';

// V1 response format (legacy)
interface V1User {
  id: string;
  email: string;
  name: string;
  created: string; // ISO string
}

export async function GET(request: NextRequest) {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
    take: 50,
  });

  // V1 format: flat structure, different field names
  const v1Users: V1User[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    name: user.name || '',
    created: user.createdAt.toISOString(),
  }));

  const response = apiSuccess(v1Users);
  
  // Add deprecation headers
  response.headers.set('Deprecation', 'true');
  response.headers.set('Sunset', 'Sat, 01 Jun 2025 00:00:00 GMT');
  response.headers.set('Link', '</api/v2/users>; rel="successor-version"');
  
  return response;
}
```

```typescript
// app/api/v2/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, getPagination, paginatedResponse } from '@/lib/api/utils';

// V2 response format (current)
interface V2User {
  id: string;
  email: string;
  profile: {
    name: string | null;
    avatar: string | null;
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
  };
}

export async function GET(request: NextRequest) {
  const pagination = getPagination(request);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: pagination.skip,
      take: pagination.take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  // V2 format: nested structure, standardized field names
  const v2Users: V2User[] = users.map((user) => ({
    id: user.id,
    email: user.email,
    profile: {
      name: user.name,
      avatar: user.avatar,
    },
    metadata: {
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
  }));

  return paginatedResponse(v2Users, total, pagination);
}
```

### Unified Handler with Version Switching

```typescript
// lib/api/versioning/handlers.ts
import { NextRequest, NextResponse } from 'next/server';
import { extractVersion, CURRENT_VERSION, addVersionHeaders, getVersionContext } from './middleware';

type VersionedHandlers = {
  [key: string]: (request: NextRequest, context: any) => Promise<NextResponse>;
};

export function createVersionedHandler(handlers: VersionedHandlers) {
  return async (request: NextRequest, context: any): Promise<NextResponse> => {
    const version = extractVersion(request) || CURRENT_VERSION;
    
    const handler = handlers[version];
    if (!handler) {
      return NextResponse.json(
        { error: `API version ${version} not supported for this endpoint` },
        { status: 400 }
      );
    }

    const response = await handler(request, context);
    const versionContext = getVersionContext(version);
    
    return addVersionHeaders(response, versionContext);
  };
}

// Usage in route.ts
// app/api/users/route.ts
import { createVersionedHandler } from '@/lib/api/versioning/handlers';
import { v1GetUsers } from './v1';
import { v2GetUsers } from './v2';

export const GET = createVersionedHandler({
  v1: v1GetUsers,
  v2: v2GetUsers,
});
```

### Header-Based Versioning Middleware

```typescript
// middleware.ts (root level)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractVersion, CURRENT_VERSION, SUPPORTED_VERSIONS } from '@/lib/api/versioning/config';

export function middleware(request: NextRequest) {
  // Only apply to API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const version = extractVersion(request);
  
  // If no version specified, default to current
  if (!version) {
    const response = NextResponse.next();
    response.headers.set('X-API-Version', CURRENT_VERSION);
    return response;
  }

  // Validate version
  if (!SUPPORTED_VERSIONS.includes(version)) {
    return NextResponse.json(
      {
        error: `Unsupported API version: ${version}`,
        supportedVersions: SUPPORTED_VERSIONS,
        currentVersion: CURRENT_VERSION,
      },
      { status: 400 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

### Version Migration Helper

```typescript
// lib/api/versioning/migration.ts
interface MigrationMap<TOld, TNew> {
  upgrade: (old: TOld) => TNew;
  downgrade: (new_: TNew) => TOld;
}

// User migration v1 -> v2
export const userMigrationV1toV2: MigrationMap<V1User, V2User> = {
  upgrade: (v1User) => ({
    id: v1User.id,
    email: v1User.email,
    profile: {
      name: v1User.name || null,
      avatar: null,
    },
    metadata: {
      createdAt: v1User.created,
      updatedAt: v1User.created, // V1 didn't have updatedAt
    },
  }),
  downgrade: (v2User) => ({
    id: v2User.id,
    email: v2User.email,
    name: v2User.profile.name || '',
    created: v2User.metadata.createdAt,
  }),
};

// Generic version adapter
export function createVersionAdapter<T extends Record<string, any>>(
  migrations: {
    from: string;
    to: string;
    transform: (data: any) => any;
  }[]
) {
  return (data: T, fromVersion: string, toVersion: string): T => {
    if (fromVersion === toVersion) return data;

    // Build migration path
    const path = findMigrationPath(migrations, fromVersion, toVersion);
    
    return path.reduce((current, migration) => migration.transform(current), data);
  };
}
```

### API Changelog Endpoint

```typescript
// app/api/changelog/route.ts
import { NextResponse } from 'next/server';
import { API_VERSIONS, CURRENT_VERSION } from '@/lib/api/versioning/config';

const changelog = {
  v2: {
    releaseDate: '2024-01-15',
    changes: [
      {
        type: 'breaking',
        description: 'User response now uses nested profile object',
        migration: 'user.name -> user.profile.name',
      },
      {
        type: 'added',
        description: 'Added pagination support to all list endpoints',
      },
      {
        type: 'added',
        description: 'Added updatedAt field to all resources',
      },
    ],
  },
  v1: {
    releaseDate: '2023-01-01',
    deprecationDate: '2024-01-15',
    sunsetDate: '2025-06-01',
    changes: [
      {
        type: 'initial',
        description: 'Initial API release',
      },
    ],
  },
};

export async function GET() {
  return NextResponse.json({
    currentVersion: CURRENT_VERSION,
    versions: Object.entries(API_VERSIONS).map(([key, value]) => ({
      version: key,
      ...value,
      changelog: changelog[key as keyof typeof changelog],
    })),
  });
}
```

### Client SDK with Version Support

```typescript
// lib/api/client.ts
import { ApiVersion, CURRENT_VERSION, SUPPORTED_VERSIONS } from './versioning/config';

interface ApiClientOptions {
  baseUrl: string;
  version?: ApiVersion;
  defaultHeaders?: Record<string, string>;
}

export class ApiClient {
  private baseUrl: string;
  private version: ApiVersion;
  private defaultHeaders: Record<string, string>;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl;
    this.version = options.version || CURRENT_VERSION;
    this.defaultHeaders = options.defaultHeaders || {};

    if (!SUPPORTED_VERSIONS.includes(this.version)) {
      throw new Error(`Unsupported API version: ${this.version}`);
    }
  }

  private async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      headers?: Record<string, string>;
      version?: ApiVersion;
    }
  ): Promise<T> {
    const version = options?.version || this.version;
    const url = `${this.baseUrl}/api/${version}${path}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': version,
        ...this.defaultHeaders,
        ...options?.headers,
      },
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    // Check for deprecation warnings
    const deprecation = response.headers.get('Deprecation');
    const sunset = response.headers.get('Sunset');
    
    if (deprecation === 'true') {
      console.warn(`API version ${version} is deprecated.`);
      if (sunset) {
        console.warn(`Sunset date: ${sunset}`);
      }
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return response.json();
  }

  get<T>(path: string, options?: { headers?: Record<string, string> }) {
    return this.request<T>('GET', path, options);
  }

  post<T>(path: string, body: unknown, options?: { headers?: Record<string, string> }) {
    return this.request<T>('POST', path, { ...options, body });
  }

  patch<T>(path: string, body: unknown, options?: { headers?: Record<string, string> }) {
    return this.request<T>('PATCH', path, { ...options, body });
  }

  delete<T>(path: string, options?: { headers?: Record<string, string> }) {
    return this.request<T>('DELETE', path, options);
  }
}

// Usage
const api = new ApiClient({
  baseUrl: 'https://api.example.com',
  version: 'v2',
});

const users = await api.get<User[]>('/users');
```

## Variants

### Query Parameter Versioning

```typescript
// Simpler approach for internal APIs
export async function GET(request: NextRequest) {
  const version = request.nextUrl.searchParams.get('v') || '2';
  
  if (version === '1') {
    return handleV1(request);
  }
  
  return handleV2(request);
}
```

## Anti-Patterns

```typescript
// Bad: Breaking changes without versioning
// Old: { name: "John" }
// New: { profile: { name: "John" } }
// Breaks all existing clients!

// Good: Version the breaking change
// v1: { name: "John" }
// v2: { profile: { name: "John" } }

// Bad: Too many versions
// /api/v1, /api/v2, /api/v3, /api/v4, /api/v5...
// Hard to maintain!

// Good: Deprecate and sunset old versions
// Support max 2-3 versions at a time
```

## Related Skills

- `rest-api-design` - RESTful patterns
- `api-documentation` - Document versions
- `api-testing` - Test all versions
- `feature-flags` - Gradual rollout

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial API versioning pattern
