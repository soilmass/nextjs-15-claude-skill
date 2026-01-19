---
id: pt-embed-widget
name: Embeddable Widget
version: 1.0.0
layer: L5
category: integration
description: Create embeddable widgets and iframes that can be added to external websites
tags: [embed, widget, iframe, postmessage, integration, next15, react19]
composes: []
dependencies: []
formula: "EmbedWidget = IframeHost + PostMessage + ScriptLoader + CrossOrigin"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Embeddable Widget

## When to Use

- When building chat widgets for customer support
- For embedding forms or surveys on external sites
- When creating booking widgets
- For social sharing embeds
- When building analytics or dashboard widgets

## Overview

This pattern implements embeddable widgets using iframes with secure postMessage communication. It covers the embed script, iframe container, and cross-origin messaging.

## Embed Script Generator

```typescript
// public/embed.js
(function() {
  'use strict';

  const WIDGET_URL = 'https://your-app.com/widget';

  window.MyWidget = {
    init: function(config) {
      if (document.getElementById('my-widget-container')) return;

      const container = document.createElement('div');
      container.id = 'my-widget-container';
      container.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
      `;

      const iframe = document.createElement('iframe');
      iframe.id = 'my-widget-iframe';
      iframe.src = WIDGET_URL + '?' + new URLSearchParams({
        apiKey: config.apiKey || '',
        theme: config.theme || 'light',
        position: config.position || 'bottom-right',
      }).toString();
      iframe.style.cssText = `
        border: none;
        width: 380px;
        height: 600px;
        max-height: 80vh;
        border-radius: 12px;
        box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
      `;
      iframe.allow = 'clipboard-write';

      container.appendChild(iframe);
      document.body.appendChild(container);

      // Handle messages from widget
      window.addEventListener('message', function(event) {
        if (event.origin !== 'https://your-app.com') return;

        const { type, data } = event.data;

        switch (type) {
          case 'resize':
            iframe.style.width = data.width + 'px';
            iframe.style.height = data.height + 'px';
            break;
          case 'close':
            container.style.display = 'none';
            break;
          case 'event':
            if (config.onEvent) config.onEvent(data);
            break;
        }
      });

      return {
        show: function() { container.style.display = 'block'; },
        hide: function() { container.style.display = 'none'; },
        destroy: function() { container.remove(); },
        send: function(message) {
          iframe.contentWindow.postMessage(message, WIDGET_URL);
        },
      };
    }
  };
})();
```

## Widget Page

```typescript
// app/widget/page.tsx
import { Suspense } from "react";
import { WidgetContainer } from "@/components/widget/container";
import { validateApiKey } from "@/lib/widget/auth";

interface WidgetPageProps {
  searchParams: Promise<{
    apiKey?: string;
    theme?: "light" | "dark";
    position?: string;
  }>;
}

export default async function WidgetPage({ searchParams }: WidgetPageProps) {
  const params = await searchParams;

  // Validate API key
  const config = await validateApiKey(params.apiKey);

  if (!config) {
    return (
      <div className="p-4 text-center text-red-500">
        Invalid API key
      </div>
    );
  }

  return (
    <Suspense fallback={<WidgetSkeleton />}>
      <WidgetContainer
        config={config}
        theme={params.theme}
      />
    </Suspense>
  );
}

function WidgetSkeleton() {
  return (
    <div className="animate-pulse p-4">
      <div className="h-8 bg-muted rounded mb-4" />
      <div className="h-64 bg-muted rounded" />
    </div>
  );
}
```

## Widget Container Component

```typescript
// components/widget/container.tsx
"use client";

import { useEffect, useState } from "react";
import { usePostMessage } from "@/hooks/use-post-message";
import { cn } from "@/lib/utils";

interface WidgetConfig {
  id: string;
  name: string;
  primaryColor: string;
  features: string[];
}

interface WidgetContainerProps {
  config: WidgetConfig;
  theme?: "light" | "dark";
}

export function WidgetContainer({ config, theme = "light" }: WidgetContainerProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const { sendMessage } = usePostMessage();

  useEffect(() => {
    // Notify parent of size changes
    sendMessage({
      type: "resize",
      data: {
        width: isMinimized ? 60 : 380,
        height: isMinimized ? 60 : 600,
      },
    });
  }, [isMinimized, sendMessage]);

  const handleClose = () => {
    sendMessage({ type: "close" });
  };

  const handleEvent = (eventName: string, data: unknown) => {
    sendMessage({ type: "event", data: { event: eventName, ...data } });
  };

  return (
    <div
      className={cn(
        "flex flex-col h-full",
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      )}
    >
      <header
        className="flex items-center justify-between p-4 border-b"
        style={{ backgroundColor: config.primaryColor }}
      >
        <h2 className="font-semibold text-white">{config.name}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-white/80 hover:text-white"
          >
            {isMinimized ? "Expand" : "Minimize"}
          </button>
          <button
            onClick={handleClose}
            className="text-white/80 hover:text-white"
          >
            Close
          </button>
        </div>
      </header>

      {!isMinimized && (
        <main className="flex-1 overflow-auto p-4">
          {/* Widget content */}
          <WidgetContent
            config={config}
            onEvent={handleEvent}
          />
        </main>
      )}
    </div>
  );
}
```

## PostMessage Hook

```typescript
// hooks/use-post-message.ts
"use client";

import { useEffect, useCallback } from "react";

type MessageHandler = (data: unknown) => void;

export function usePostMessage(handlers?: Record<string, MessageHandler>) {
  useEffect(() => {
    if (!handlers) return;

    const handleMessage = (event: MessageEvent) => {
      // Validate origin in production
      const { type, data } = event.data;

      if (handlers[type]) {
        handlers[type](data);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handlers]);

  const sendMessage = useCallback((message: unknown) => {
    if (window.parent !== window) {
      window.parent.postMessage(message, "*");
    }
  }, []);

  return { sendMessage };
}
```

## API Key Validation

```typescript
// lib/widget/auth.ts
import { prisma } from "@/lib/db";

interface WidgetConfig {
  id: string;
  name: string;
  primaryColor: string;
  features: string[];
  allowedOrigins: string[];
}

export async function validateApiKey(
  apiKey?: string
): Promise<WidgetConfig | null> {
  if (!apiKey) return null;

  const widget = await prisma.widget.findUnique({
    where: { apiKey },
    select: {
      id: true,
      name: true,
      primaryColor: true,
      features: true,
      allowedOrigins: true,
      active: true,
    },
  });

  if (!widget || !widget.active) return null;

  return widget;
}

export function validateOrigin(
  origin: string,
  allowedOrigins: string[]
): boolean {
  if (allowedOrigins.includes("*")) return true;
  return allowedOrigins.some((allowed) => {
    if (allowed.startsWith("*.")) {
      const domain = allowed.slice(2);
      return origin.endsWith(domain);
    }
    return origin === allowed;
  });
}
```

## Embed Code Generator UI

```typescript
// components/widget/embed-code.tsx
"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmbedCodeProps {
  apiKey: string;
}

export function EmbedCode({ apiKey }: EmbedCodeProps) {
  const [copied, setCopied] = useState(false);

  const embedCode = `<script src="https://your-app.com/embed.js"></script>
<script>
  MyWidget.init({
    apiKey: "${apiKey}",
    theme: "light",
    position: "bottom-right",
    onEvent: function(event) {
      console.log("Widget event:", event);
    }
  });
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">Embed Code</h3>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
        <code>{embedCode}</code>
      </pre>
    </Card>
  );
}
```

## Security Headers for Widget

```typescript
// app/widget/layout.tsx
export default function WidgetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          httpEquiv="Content-Security-Policy"
          content="frame-ancestors 'self' https://*.customer-domain.com"
        />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

// next.config.js - Allow embedding
module.exports = {
  async headers() {
    return [
      {
        source: "/widget/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
    ];
  },
};
```

## Anti-patterns

### Don't Trust All PostMessage Origins

```typescript
// BAD - No origin check
window.addEventListener("message", (event) => {
  handleMessage(event.data);
});

// GOOD - Validate origin
window.addEventListener("message", (event) => {
  if (!allowedOrigins.includes(event.origin)) return;
  handleMessage(event.data);
});
```

## Related Patterns

- [api-keys](./api-keys.md)
- [streaming](./streaming.md)
- [cors](./cors.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Embed script
- PostMessage communication
- API key validation
