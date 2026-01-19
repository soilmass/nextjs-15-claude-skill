---
id: pt-debugging
name: Debugging Patterns
version: 2.0.0
layer: L5
category: observability
description: Debugging techniques for Next.js 15 applications including server components, client components, and API routes
tags: [debugging, devtools, logging, vscode, breakpoints, error-tracking]
composes: []
dependencies: []
formula: breakpoints + structured logging + DevTools integration = efficient issue resolution
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Debugging Patterns

## When to Use

- Local development requiring step-through debugging
- Server Component issues needing terminal-based investigation
- Client-side React issues requiring DevTools integration
- Server Actions and API routes needing request inspection
- Performance profiling and render optimization

## Composition Diagram

```
+-------------------+     +-------------------+     +-------------------+
|   VS Code         |---->|   pt-debugging    |---->|   Issue           |
|   Debugger        |     |   (Techniques)    |     |   Resolution      |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|  Server Debug     |     |  Client Debug     |     |   Network Debug   |
| (Node Inspector)  |     | (React DevTools)  |     |   (Fetch Debug)   |
+-------------------+     +-------------------+     +-------------------+
        |                         |                        |
        v                         v                        v
+-------------------+     +-------------------+     +-------------------+
|   pt-logging      |     |  Debug Hooks      |     |   pt-tracing      |
| (Structured Log)  |     | (Render Count)    |     | (Request Flow)    |
+-------------------+     +-------------------+     +-------------------+
        |
        v
+-------------------+
| pt-error-tracking |
| (Error Context)   |
+-------------------+
```

## Overview

Effective debugging in Next.js 15 requires understanding the split between server and client environments. This pattern covers debugging techniques for Server Components, Client Components, API routes, and middleware.

## Implementation

### VS Code Debugging Configuration

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000",
      "webRoot": "${workspaceFolder}",
      "sourceMapPathOverrides": {
        "webpack://_N_E/*": "${webRoot}/*"
      }
    },
    {
      "name": "Next.js: debug full stack",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev",
      "serverReadyAction": {
        "pattern": "- Local:.+(https?://.+)",
        "uriFormat": "%s",
        "action": "debugWithChrome"
      }
    },
    {
      "name": "Next.js: debug production build",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run build && npm run start"
    }
  ]
}
```

### Debugging Server Components

```typescript
// Server Component debugging techniques

// 1. Console logging (appears in terminal, not browser)
// app/page.tsx
export default async function Page() {
  console.log("🔵 Server Component rendering");
  
  const data = await fetchData();
  console.log("📦 Fetched data:", JSON.stringify(data, null, 2));
  
  return <div>{/* ... */}</div>;
}

// 2. Using the 'debugger' statement
// Works when running with VS Code debugger attached
export default async function Page() {
  debugger; // Execution will pause here
  
  const data = await fetchData();
  return <div>{/* ... */}</div>;
}

// 3. Structured logging utility
// lib/debug.ts
const isDebug = process.env.NODE_ENV === "development";

export function debug(label: string, data?: unknown) {
  if (!isDebug) return;
  
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] 🔍 ${label}`;
  
  if (data !== undefined) {
    console.log(prefix, JSON.stringify(data, null, 2));
  } else {
    console.log(prefix);
  }
}

export function debugError(label: string, error: unknown) {
  if (!isDebug) return;
  
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ❌ ${label}`, error);
  
  if (error instanceof Error) {
    console.error("Stack:", error.stack);
  }
}

// Usage
import { debug, debugError } from "@/lib/debug";

export default async function Page() {
  debug("Page render started");
  
  try {
    const data = await fetchData();
    debug("Data fetched", data);
    return <div>{/* ... */}</div>;
  } catch (error) {
    debugError("Failed to fetch data", error);
    throw error;
  }
}
```

### Debugging Client Components

```typescript
// components/debug-panel.tsx
"use client";

import { useState, useEffect } from "react";

// Development-only debug panel
export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    // Intercept console.log
    const originalLog = console.log;
    console.log = (...args) => {
      setLogs((prev) => [...prev.slice(-99), args.join(" ")]);
      originalLog.apply(console, args);
    };

    // Keyboard shortcut to toggle (Ctrl+Shift+D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        setIsOpen((prev) => !prev);
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      console.log = originalLog;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (process.env.NODE_ENV !== "development" || !isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-0 right-0 w-96 h-64 bg-black/90 text-green-400 font-mono text-xs p-2 overflow-auto z-50">
      <div className="flex justify-between mb-2">
        <span>Debug Panel (Ctrl+Shift+D)</span>
        <button onClick={() => setLogs([])}>Clear</button>
      </div>
      {logs.map((log, i) => (
        <div key={i} className="border-b border-gray-700 py-1">
          {log}
        </div>
      ))}
    </div>
  );
}

// hooks/use-debug.ts
"use client";

import { useEffect, useRef } from "react";

export function useDebugRender(componentName: string) {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    console.log(`🔄 ${componentName} rendered (${renderCount.current})`);
  });
}

export function useDebugProps<T extends object>(componentName: string, props: T) {
  const prevProps = useRef<T>(props);

  useEffect(() => {
    const changedProps: string[] = [];
    
    Object.keys(props).forEach((key) => {
      if (prevProps.current[key as keyof T] !== props[key as keyof T]) {
        changedProps.push(key);
      }
    });

    if (changedProps.length > 0) {
      console.log(`📝 ${componentName} props changed:`, changedProps);
    }
    
    prevProps.current = props;
  });
}

// Usage
function MyComponent(props: MyProps) {
  useDebugRender("MyComponent");
  useDebugProps("MyComponent", props);
  
  return <div>...</div>;
}
```

### Debugging Server Actions

```typescript
// app/actions/debug.ts
"use server";

import { headers } from "next/headers";

// Wrapper for debugging server actions
export function withDebug<T extends unknown[], R>(
  actionName: string,
  action: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();
    const headersList = await headers();
    
    console.log(`\n🚀 Action: ${actionName}`);
    console.log(`📥 Input:`, JSON.stringify(args, null, 2));
    console.log(`🌐 User-Agent:`, headersList.get("user-agent"));
    
    try {
      const result = await action(...args);
      const duration = performance.now() - startTime;
      
      console.log(`✅ Success (${duration.toFixed(2)}ms)`);
      console.log(`📤 Output:`, JSON.stringify(result, null, 2));
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      console.error(`❌ Error (${duration.toFixed(2)}ms)`);
      console.error(error);
      
      throw error;
    }
  };
}

// Usage
const createUserDebug = withDebug("createUser", async (data: UserData) => {
  // Action implementation
  return prisma.user.create({ data });
});

export { createUserDebug as createUser };
```

### Debugging API Routes

```typescript
// middleware/debug.ts
import { NextRequest, NextResponse } from "next/server";

export function withApiDebug(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = performance.now();
    const requestId = crypto.randomUUID().slice(0, 8);
    
    console.log(`\n📨 [${requestId}] ${req.method} ${req.url}`);
    console.log(`Headers:`, Object.fromEntries(req.headers));
    
    if (req.method !== "GET") {
      try {
        const body = await req.clone().json();
        console.log(`Body:`, JSON.stringify(body, null, 2));
      } catch {
        // No JSON body
      }
    }
    
    try {
      const response = await handler(req);
      const duration = performance.now() - startTime;
      
      console.log(`✅ [${requestId}] ${response.status} (${duration.toFixed(2)}ms)`);
      
      // Clone response to log body
      const clonedResponse = response.clone();
      try {
        const body = await clonedResponse.json();
        console.log(`Response:`, JSON.stringify(body, null, 2));
      } catch {
        // Non-JSON response
      }
      
      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      console.error(`❌ [${requestId}] Error (${duration.toFixed(2)}ms)`);
      console.error(error);
      
      throw error;
    }
  };
}

// Usage in route handler
// app/api/users/route.ts
import { withApiDebug } from "@/middleware/debug";

export const GET = withApiDebug(async (req) => {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
});
```

### React DevTools Integration

```typescript
// lib/devtools.ts
"use client";

// Add display names to components for better DevTools experience
export function withDisplayName<T extends React.ComponentType<unknown>>(
  Component: T,
  displayName: string
): T {
  Component.displayName = displayName;
  return Component;
}

// Debug context for React DevTools
import { createContext, useContext, useEffect, useState } from "react";

interface DebugContextValue {
  renderCount: number;
  lastAction: string | null;
  logAction: (action: string) => void;
}

const DebugContext = createContext<DebugContextValue | null>(null);

export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [renderCount, setRenderCount] = useState(0);
  const [lastAction, setLastAction] = useState<string | null>(null);

  useEffect(() => {
    setRenderCount((c) => c + 1);
  }, []);

  const logAction = (action: string) => {
    setLastAction(action);
    console.log(`🎯 Action: ${action}`);
  };

  return (
    <DebugContext.Provider value={{ renderCount, lastAction, logAction }}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebugContext() {
  const context = useContext(DebugContext);
  if (!context) {
    throw new Error("useDebugContext must be used within DebugProvider");
  }
  return context;
}
```

### Network Request Debugging

```typescript
// lib/fetch-debug.ts
const originalFetch = globalThis.fetch;

export function enableFetchDebug() {
  if (process.env.NODE_ENV !== "development") return;

  globalThis.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input.url;
    const method = init?.method || "GET";
    const startTime = performance.now();

    console.log(`🌐 ${method} ${url}`);

    try {
      const response = await originalFetch(input, init);
      const duration = performance.now() - startTime;

      console.log(
        `${response.ok ? "✅" : "❌"} ${method} ${url} - ${response.status} (${duration.toFixed(2)}ms)`
      );

      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      console.error(`❌ ${method} ${url} - Error (${duration.toFixed(2)}ms)`, error);
      throw error;
    }
  };
}

// Enable in development
// app/layout.tsx
if (process.env.NODE_ENV === "development") {
  enableFetchDebug();
}
```

## Variants

### Source Map Configuration

```javascript
// next.config.js
module.exports = {
  // Enable source maps in production for error tracking
  productionBrowserSourceMaps: true,
  
  // Webpack source map configuration
  webpack: (config, { dev }) => {
    if (dev) {
      config.devtool = "eval-source-map";
    }
    return config;
  },
};
```

### Error Boundary with Debug Info

```typescript
// components/error-boundary.tsx
"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught:", error);
      console.error("Component stack:", errorInfo.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (process.env.NODE_ENV === "development") {
        return (
          <div className="p-4 bg-red-50 border border-red-200 rounded">
            <h2 className="text-red-800 font-bold">Error</h2>
            <pre className="text-sm text-red-600 overflow-auto">
              {this.state.error?.message}
            </pre>
            <pre className="text-xs text-red-400 mt-2 overflow-auto">
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
        );
      }
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

## Anti-patterns

1. **Leaving console.logs**: Debug statements in production code
2. **No structured logging**: Unorganized console output
3. **Ignoring server logs**: Not checking terminal output
4. **No source maps**: Unable to trace errors to source
5. **Missing error boundaries**: Unhandled errors crash the app

## Related Skills

- `L5/patterns/error-tracking` - Error monitoring
- `L5/patterns/logging` - Structured logging
- `L5/patterns/observability` - Application observability
- `L5/patterns/testing-unit` - Unit testing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with VS Code and React DevTools
