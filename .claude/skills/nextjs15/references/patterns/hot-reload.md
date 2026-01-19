---
id: pt-hot-reload
name: Hot Reload Configuration
version: 2.0.0
layer: L5
category: devops
description: Next.js 15 Fast Refresh and hot reload configuration for optimal development experience
tags: [dx, hot-reload, fast-refresh, hmr, development, webpack, turbopack]
composes: []
dependencies:
  - next
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
formula: "Fast Refresh + State Preservation + Named Exports = Instant Development Feedback"
---

# Hot Reload Configuration

## Overview

Configure Next.js 15 Fast Refresh for instant feedback during development. Fast Refresh preserves React component state during edits, making development faster and more intuitive. Includes configuration for both Webpack and Turbopack bundlers.

## When to Use

Use this skill when:
- Setting up a new Next.js project
- Fast Refresh is not working as expected
- Need to configure HMR for custom file types
- Optimizing development experience
- Debugging hot reload issues

## Composition Diagram

```
                    ┌─────────────────────────────────────────────────┐
                    │             HOT RELOAD SYSTEM                    │
                    └─────────────────────────────────────────────────┘
                                          │
                    ┌─────────────────────┴─────────────────────┐
                    │                BUNDLER                    │
                    │         (Turbopack / Webpack)             │
                    └─────────────────────┬─────────────────────┘
                                          │
            ┌─────────────────────────────┼─────────────────────────────┐
            │                             │                             │
            ▼                             ▼                             ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │  FILE WATCHER │           │  FAST REFRESH │           │    ERROR      │
    │               │           │    ENGINE     │           │   BOUNDARY    │
    └───────┬───────┘           └───────┬───────┘           └───────┬───────┘
            │                           │                           │
            ▼                           ▼                           ▼
    ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
    │• File Change  │           │• Named Export │           │• Catch Errors │
    │• Polling Mode │──────────▶│  Detection    │──────────▶│• Retry Button │
    │  (Docker/WSL) │           │• State Preserve│          │• Dev Overlay  │
    │• aggregateTime│           │• Hook Order   │           │• Recovery     │
    └───────────────┘           └───────────────┘           └───────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │  State Preserved When: Same signature + Same hooks + Named export   │
    └─────────────────────────────────────────────────────────────────────┘
```

## Implementation

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable Turbopack for faster refresh (recommended for Next.js 15)
  // Use: next dev --turbo
  
  // Webpack configuration (used when not using Turbopack)
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable more detailed HMR logging
      config.infrastructureLogging = {
        level: 'error', // 'none' | 'error' | 'warn' | 'info' | 'log' | 'verbose'
      };
      
      // Optimize file watching
      config.watchOptions = {
        // Poll for changes every second (useful for Docker/WSL)
        poll: process.env.WEBPACK_POLL ? 1000 : false,
        // Aggregate changes before rebuilding
        aggregateTimeout: 300,
        // Ignore node_modules for performance
        ignored: ['**/node_modules/**', '**/.git/**'],
      };
    }
    
    return config;
  },
  
  // Experimental features for better DX
  experimental: {
    // Enable Turbopack in next dev (Next.js 15+)
    // turbo: {}, // Uncomment to enable Turbopack configuration
    
    // Typed routes for better TypeScript support
    typedRoutes: true,
  },
  
  // Development indicators
  devIndicators: {
    // Show build activity indicator
    appIsrStatus: true,
    // Position of the indicator
    buildActivityPosition: 'bottom-right',
  },
  
  // Logging configuration
  logging: {
    fetches: {
      fullUrl: true, // Show full URLs in fetch logs
    },
  },
};

export default nextConfig;
```

```typescript
// lib/dev/fast-refresh.ts
/**
 * Fast Refresh compatibility utilities
 * 
 * Fast Refresh has specific requirements for component files:
 * 1. Only export React components
 * 2. Components must have UpperCase names
 * 3. No anonymous default exports
 */

// ============================================
// Fast Refresh Best Practices
// ============================================

// GOOD: Named function component
export function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}

// GOOD: Arrow function with name
export const UserAvatar = ({ src }: { src: string }) => {
  return <img src={src} alt="avatar" />;
};

// BAD: Anonymous default export (breaks Fast Refresh)
// export default function({ user }) { return <div>{user.name}</div>; }

// BAD: Lowercase component name (not recognized as component)
// export const userProfile = () => <div>User</div>;

// ============================================
// State Preservation Tips
// ============================================

/**
 * State is preserved during Fast Refresh when:
 * - Component function signature stays the same
 * - Hooks order remains unchanged
 * - No syntax errors in the file
 */

// GOOD: State preserved across edits
function Counter() {
  const [count, setCount] = React.useState(0);
  // Edit the JSX below - count state is preserved
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}

// BAD: Adding/removing hooks resets state
function Counter() {
  const [count, setCount] = React.useState(0);
  // Adding this hook will reset count to 0
  // const [name, setName] = React.useState('');
  return <button>{count}</button>;
}
```

```tsx
// components/dev/refresh-boundary.tsx
'use client';

import * as React from 'react';

interface RefreshBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface RefreshBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that recovers on Fast Refresh
 * Useful during development to prevent full page reloads on errors
 */
export class RefreshBoundary extends React.Component<
  RefreshBoundaryProps,
  RefreshBoundaryState
> {
  constructor(props: RefreshBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): RefreshBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RefreshBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Reset error state on Fast Refresh
      if (process.env.NODE_ENV === 'development') {
        // This will be called on Fast Refresh, resetting the boundary
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-red-800 font-semibold">Development Error</h2>
            <pre className="text-sm text-red-600 mt-2 overflow-auto">
              {this.state.error?.message}
            </pre>
            <p className="text-sm text-red-500 mt-2">
              Save the file to trigger Fast Refresh and retry.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm"
            >
              Retry
            </button>
          </div>
        );
      }
      
      return this.props.fallback ?? <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}

// Enable Fast Refresh recovery
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // @ts-ignore - Next.js internal
  if (module.hot) {
    // @ts-ignore
    module.hot.addStatusHandler((status: string) => {
      if (status === 'apply') {
        // Fast Refresh applied, could trigger state reset if needed
      }
    });
  }
}
```

### Key Implementation Notes

1. **Turbopack**: Next.js 15 recommends Turbopack for development (`next dev --turbo`) for significantly faster refresh times
2. **Component Requirements**: Fast Refresh requires named exports with PascalCase names for reliable state preservation

## Variants

### Docker/WSL File Watching

```typescript
// next.config.ts for Docker or WSL environments
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Enable polling for Docker/WSL where inotify doesn't work
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      };
    }
    return config;
  },
};

export default nextConfig;
```

```yaml
# docker-compose.yml for development
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - WATCHPACK_POLLING=true
      - CHOKIDAR_USEPOLLING=true
    ports:
      - "3000:3000"
```

### Custom File Type Hot Reload

```typescript
// next.config.ts with custom loader
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    // Add support for .graphql files with HMR
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'graphql-tag/loader',
        },
      ],
    });
    
    // Add MDX support
    config.module.rules.push({
      test: /\.mdx?$/,
      use: [
        {
          loader: '@mdx-js/loader',
          options: {
            providerImportSource: '@mdx-js/react',
          },
        },
      ],
    });
    
    return config;
  },
  
  // Enable MDX pages
  pageExtensions: ['ts', 'tsx', 'md', 'mdx'],
};

export default nextConfig;
```

### Turbopack Configuration

```typescript
// next.config.ts with Turbopack
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // Turbopack-specific configuration
    turbo: {
      // Custom resolution aliases
      resolveAlias: {
        '@components': './components',
        '@lib': './lib',
        '@styles': './styles',
      },
      
      // Custom loaders for Turbopack
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
};

export default nextConfig;
```

### Development-Only Components

```tsx
// components/dev/dev-tools.tsx
'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

// Only load in development
const ReactQueryDevtools = dynamic(
  () =>
    import('@tanstack/react-query-devtools').then(
      (mod) => mod.ReactQueryDevtools
    ),
  { ssr: false }
);

interface DevToolsProps {
  children: React.ReactNode;
}

export function DevTools({ children }: DevToolsProps) {
  const [showDevTools, setShowDevTools] = React.useState(false);

  // Toggle with keyboard shortcut
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + D
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setShowDevTools((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      
      {/* React Query DevTools */}
      <ReactQueryDevtools initialIsOpen={false} />
      
      {/* Custom DevTools Panel */}
      {showDevTools && (
        <div className="fixed bottom-4 right-4 z-50 bg-gray-900 text-white p-4 rounded-lg shadow-xl max-w-md">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Dev Tools</h3>
            <button
              onClick={() => setShowDevTools(false)}
              className="text-gray-400 hover:text-white"
            >
              Close
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-400">Node Env:</span>{' '}
              {process.env.NODE_ENV}
            </div>
            <div>
              <span className="text-gray-400">Next.js:</span>{' '}
              {process.env.NEXT_RUNTIME}
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-700">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-3 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700"
            >
              Force Reload
            </button>
          </div>
        </div>
      )}
    </>
  );
}
```

## Troubleshooting

```typescript
// lib/dev/debug-refresh.ts
/**
 * Debug Fast Refresh issues
 */

// Check if Fast Refresh is working
export function checkFastRefresh() {
  if (process.env.NODE_ENV !== 'development') return;
  
  console.log('[Fast Refresh] Checking status...');
  
  // @ts-ignore - Next.js internal
  if (typeof __NEXT_DATA__ !== 'undefined') {
    console.log('[Fast Refresh] Next.js data available');
  }
  
  // @ts-ignore - Webpack HMR
  if (module.hot) {
    console.log('[Fast Refresh] HMR enabled');
    // @ts-ignore
    module.hot.addStatusHandler((status: string) => {
      console.log('[Fast Refresh] Status:', status);
    });
  }
}

/**
 * Common Fast Refresh issues and fixes:
 * 
 * 1. Full page reload instead of Fast Refresh:
 *    - Check for anonymous exports
 *    - Ensure component names are PascalCase
 *    - Look for non-component exports in the file
 * 
 * 2. State resetting unexpectedly:
 *    - Check for hook order changes
 *    - Verify no conditional hooks
 *    - Check for key prop changes
 * 
 * 3. Changes not reflecting:
 *    - Clear .next folder: rm -rf .next
 *    - Check for caching issues
 *    - Verify file is being watched
 * 
 * 4. Slow refresh in Docker/WSL:
 *    - Enable polling in watchOptions
 *    - Set WATCHPACK_POLLING=true
 */
```

## Anti-patterns

### Exporting Non-Components from Component Files

```tsx
// Bad - Mixing exports breaks Fast Refresh
// components/user-card.tsx
export const formatDate = (date: Date) => date.toLocaleDateString();
export const USER_TYPES = ['admin', 'user', 'guest'];

export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}

// Good - Separate utilities into different files
// lib/utils/date.ts
export const formatDate = (date: Date) => date.toLocaleDateString();

// lib/constants/user.ts
export const USER_TYPES = ['admin', 'user', 'guest'];

// components/user-card.tsx
import { formatDate } from '@/lib/utils/date';
export function UserCard({ user }: UserCardProps) {
  return <div>{user.name}</div>;
}
```

### Anonymous Default Exports

```tsx
// Bad - Anonymous export
export default function({ user }) {
  return <div>{user.name}</div>;
}

// Bad - Arrow function default export
export default ({ user }) => {
  return <div>{user.name}</div>;
};

// Good - Named function
export default function UserCard({ user }) {
  return <div>{user.name}</div>;
}

// Good - Named const with explicit export
function UserCard({ user }) {
  return <div>{user.name}</div>;
}
export default UserCard;
```

## Related Skills

### Composes From
- [next-config](./next-config.md) - Next.js configuration
- [typescript-config](./typescript-config.md) - TypeScript setup

### Composes Into
- [development-workflow](./development-workflow.md) - Full dev setup
- [debugging](./debugging.md) - Debug configuration

### Alternatives
- Full page reload - When Fast Refresh isn't suitable
- Manual refresh - For testing production behavior

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation for Next.js 15
- Turbopack configuration
- Docker/WSL polling setup
