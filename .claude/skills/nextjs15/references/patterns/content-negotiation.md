---
id: pt-content-negotiation
name: Content Negotiation
version: 2.0.0
layer: L5
category: data
description: Handle Accept headers for multiple response formats (JSON, XML, CSV, HTML)
tags: [api, content-type, accept, negotiation, format, response]
composes: []
dependencies: []
formula: "ContentNegotiation = AcceptHeaderParser + FormatDetection + ResponseFormatter + ContentTypeHeader"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Content Negotiation

## Overview

Implement HTTP content negotiation to serve different response formats based on the Accept header. Support JSON, XML, CSV, HTML, and custom formats.

## When to Use

- Building APIs that need to serve multiple response formats
- Supporting legacy systems that require XML responses
- Providing CSV export from API endpoints
- Creating APIs consumed by diverse clients (web, mobile, CLI)
- Need for format flexibility without separate endpoints

## Composition Diagram

```
[Client Request] --> [Accept Header Parse]
                            |
                    [Content Type Negotiation]
                            |
            +---------------+---------------+
            |       |       |       |       |
         [JSON]  [XML]   [CSV]   [HTML]  [Default]
            |       |       |       |       |
            +-------+-------+-------+-------+
                            |
                    [Format Response]
                            |
                    [Set Content-Type Header]
                            |
                    [Return Response]
```

## Implementation

### Content Types

```tsx
// lib/content-negotiation/types.ts
export type ContentType = 
  | 'application/json'
  | 'application/xml'
  | 'text/xml'
  | 'text/csv'
  | 'text/html'
  | 'text/plain'
  | 'application/pdf';

export interface ContentNegotiationOptions {
  default: ContentType;
  supported: ContentType[];
}

export interface NegotiatedContent {
  contentType: ContentType;
  body: string | Buffer;
}

export interface AcceptHeader {
  type: string;
  subtype: string;
  quality: number;
  parameters: Record<string, string>;
}
```

### Accept Header Parser

```tsx
// lib/content-negotiation/parser.ts
import { AcceptHeader, ContentType } from './types';

export function parseAcceptHeader(accept: string | null): AcceptHeader[] {
  if (!accept) {
    return [{ type: '*', subtype: '*', quality: 1, parameters: {} }];
  }

  return accept
    .split(',')
    .map((part) => {
      const [mediaType, ...params] = part.trim().split(';');
      const [type, subtype] = mediaType.trim().split('/');
      
      const parameters: Record<string, string> = {};
      let quality = 1;

      params.forEach((param) => {
        const [key, value] = param.trim().split('=');
        if (key === 'q') {
          quality = parseFloat(value) || 1;
        } else {
          parameters[key] = value;
        }
      });

      return {
        type: type || '*',
        subtype: subtype || '*',
        quality,
        parameters,
      };
    })
    .sort((a, b) => b.quality - a.quality);
}

export function negotiateContentType(
  accept: string | null,
  supported: ContentType[],
  defaultType: ContentType
): ContentType {
  const acceptHeaders = parseAcceptHeader(accept);

  for (const header of acceptHeaders) {
    const fullType = `${header.type}/${header.subtype}`;

    // Exact match
    if (supported.includes(fullType as ContentType)) {
      return fullType as ContentType;
    }

    // Wildcard subtype match (e.g., application/*)
    if (header.subtype === '*') {
      const match = supported.find((s) => s.startsWith(`${header.type}/`));
      if (match) return match;
    }

    // Full wildcard (*/*)
    if (header.type === '*' && header.subtype === '*') {
      return supported[0] || defaultType;
    }
  }

  return defaultType;
}
```

### Response Formatters

```tsx
// lib/content-negotiation/formatters.ts
import { ContentType } from './types';

export interface FormatOptions {
  pretty?: boolean;
  rootElement?: string;
}

export function formatResponse(
  data: unknown,
  contentType: ContentType,
  options: FormatOptions = {}
): string | Buffer {
  switch (contentType) {
    case 'application/json':
      return formatJSON(data, options);
    case 'application/xml':
    case 'text/xml':
      return formatXML(data, options);
    case 'text/csv':
      return formatCSV(data);
    case 'text/html':
      return formatHTML(data, options);
    case 'text/plain':
      return formatPlainText(data);
    default:
      return formatJSON(data, options);
  }
}

function formatJSON(data: unknown, options: FormatOptions): string {
  return options.pretty 
    ? JSON.stringify(data, null, 2) 
    : JSON.stringify(data);
}

function formatXML(data: unknown, options: FormatOptions): string {
  const rootElement = options.rootElement || 'root';
  const xmlContent = jsonToXml(data, options.pretty ? 1 : 0);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>${xmlContent}</${rootElement}>`;
}

function jsonToXml(obj: unknown, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  
  if (obj === null || obj === undefined) {
    return '';
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item, i) => {
        const content = jsonToXml(item, indent + 1);
        return indent > 0 
          ? `\n${spaces}<item>${content}</item>` 
          : `<item>${content}</item>`;
      })
      .join('');
  }

  if (typeof obj === 'object') {
    return Object.entries(obj)
      .map(([key, value]) => {
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
        const content = jsonToXml(value, indent + 1);
        return indent > 0
          ? `\n${spaces}<${safeKey}>${content}</${safeKey}>`
          : `<${safeKey}>${content}</${safeKey}>`;
      })
      .join('');
  }

  return escapeXml(String(obj));
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function formatCSV(data: unknown): string {
  if (!Array.isArray(data)) {
    data = [data];
  }

  if ((data as unknown[]).length === 0) {
    return '';
  }

  const items = data as Record<string, unknown>[];
  const headers = Object.keys(items[0]);
  const rows = items.map((item) =>
    headers.map((h) => escapeCSV(String(item[h] ?? ''))).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatHTML(data: unknown, options: FormatOptions): string {
  const title = options.rootElement || 'Data';
  const content = Array.isArray(data)
    ? formatArrayAsHTML(data)
    : formatObjectAsHTML(data as Record<string, unknown>);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    tr:nth-child(even) { background-color: #fafafa; }
    .key { font-weight: bold; color: #333; }
    .value { color: #666; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${content}
</body>
</html>`;
}

function formatArrayAsHTML(data: Record<string, unknown>[]): string {
  if (data.length === 0) return '<p>No data</p>';
  
  const headers = Object.keys(data[0]);
  const headerRow = headers.map((h) => `<th>${h}</th>`).join('');
  const bodyRows = data
    .map(
      (item) =>
        `<tr>${headers.map((h) => `<td>${item[h] ?? ''}</td>`).join('')}</tr>`
    )
    .join('');

  return `<table><thead><tr>${headerRow}</tr></thead><tbody>${bodyRows}</tbody></table>`;
}

function formatObjectAsHTML(data: Record<string, unknown>): string {
  const rows = Object.entries(data)
    .map(([key, value]) => `<tr><td class="key">${key}</td><td class="value">${value}</td></tr>`)
    .join('');

  return `<table><tbody>${rows}</tbody></table>`;
}

function formatPlainText(data: unknown): string {
  if (typeof data === 'string') return data;
  return JSON.stringify(data, null, 2);
}
```

### Content Negotiation Middleware

```tsx
// lib/content-negotiation/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { negotiateContentType, parseAcceptHeader } from './parser';
import { formatResponse } from './formatters';
import { ContentType, ContentNegotiationOptions } from './types';

export function withContentNegotiation(
  handler: (request: NextRequest) => Promise<{ data: unknown; status?: number }>,
  options: ContentNegotiationOptions = {
    default: 'application/json',
    supported: ['application/json', 'application/xml', 'text/csv', 'text/html'],
  }
) {
  return async (request: NextRequest) => {
    const accept = request.headers.get('accept');
    const contentType = negotiateContentType(accept, options.supported, options.default);

    try {
      const { data, status = 200 } = await handler(request);
      const body = formatResponse(data, contentType, { pretty: true });

      return new NextResponse(body, {
        status,
        headers: {
          'Content-Type': `${contentType}; charset=utf-8`,
          'Vary': 'Accept',
        },
      });
    } catch (error) {
      const errorData = {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      };
      const body = formatResponse(errorData, contentType);

      return new NextResponse(body, {
        status: 500,
        headers: {
          'Content-Type': `${contentType}; charset=utf-8`,
        },
      });
    }
  };
}

// Helper for checking requested content type
export function getRequestedContentType(request: NextRequest): ContentType {
  // Check query parameter first (for browser testing)
  const format = new URL(request.url).searchParams.get('format');
  
  if (format) {
    const formatMap: Record<string, ContentType> = {
      json: 'application/json',
      xml: 'application/xml',
      csv: 'text/csv',
      html: 'text/html',
    };
    if (format in formatMap) {
      return formatMap[format];
    }
  }

  // Fall back to Accept header
  return negotiateContentType(
    request.headers.get('accept'),
    ['application/json', 'application/xml', 'text/csv', 'text/html'],
    'application/json'
  );
}
```

### API Route with Content Negotiation

```tsx
// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withContentNegotiation, getRequestedContentType } from '@/lib/content-negotiation/middleware';
import { formatResponse } from '@/lib/content-negotiation/formatters';

// Sample data
const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
];

// Using middleware wrapper
export const GET = withContentNegotiation(async (request) => {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');

  let filteredUsers = users;
  if (role) {
    filteredUsers = users.filter((u) => u.role === role);
  }

  return { data: filteredUsers };
});

// Alternative: Manual implementation
export async function POST(request: NextRequest) {
  const contentType = getRequestedContentType(request);
  
  try {
    const body = await request.json();
    
    // Create user logic here
    const newUser = {
      id: users.length + 1,
      ...body,
    };
    users.push(newUser);

    const responseBody = formatResponse(newUser, contentType, {
      pretty: true,
      rootElement: 'user',
    });

    return new NextResponse(responseBody, {
      status: 201,
      headers: {
        'Content-Type': `${contentType}; charset=utf-8`,
        'Vary': 'Accept',
      },
    });
  } catch (error) {
    const errorData = { error: 'Invalid request body' };
    const responseBody = formatResponse(errorData, contentType);

    return new NextResponse(responseBody, {
      status: 400,
      headers: {
        'Content-Type': `${contentType}; charset=utf-8`,
      },
    });
  }
}
```

### Single Resource Route

```tsx
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRequestedContentType } from '@/lib/content-negotiation/middleware';
import { formatResponse } from '@/lib/content-negotiation/formatters';

const users = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contentType = getRequestedContentType(request);

  const user = users.find((u) => u.id === parseInt(id));

  if (!user) {
    const errorData = { error: 'User not found' };
    const body = formatResponse(errorData, contentType);
    
    return new NextResponse(body, {
      status: 404,
      headers: {
        'Content-Type': `${contentType}; charset=utf-8`,
      },
    });
  }

  const body = formatResponse(user, contentType, {
    pretty: true,
    rootElement: 'user',
  });

  return new NextResponse(body, {
    headers: {
      'Content-Type': `${contentType}; charset=utf-8`,
      'Vary': 'Accept',
    },
  });
}
```

### Client-Side Format Selector

```tsx
// components/format-selector.tsx
'use client';

import { useState } from 'react';

type Format = 'json' | 'xml' | 'csv' | 'html';

interface FormatSelectorProps {
  endpoint: string;
  onDataFetch?: (data: string, format: Format) => void;
}

export function FormatSelector({ endpoint, onDataFetch }: FormatSelectorProps) {
  const [format, setFormat] = useState<Format>('json');
  const [data, setData] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const contentTypes: Record<Format, string> = {
    json: 'application/json',
    xml: 'application/xml',
    csv: 'text/csv',
    html: 'text/html',
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: contentTypes[format],
        },
      });
      const text = await response.text();
      setData(text);
      onDataFetch?.(text, format);
    } catch (error) {
      setData('Error fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <label className="font-medium">Format:</label>
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as Format)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="json">JSON</option>
          <option value="xml">XML</option>
          <option value="csv">CSV</option>
          <option value="html">HTML</option>
        </select>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Fetch'}
        </button>
      </div>

      {data && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 text-sm font-medium border-b">
            Response ({contentTypes[format]})
          </div>
          <pre className="p-4 overflow-auto max-h-96 text-sm">
            {format === 'html' ? (
              <iframe
                srcDoc={data}
                className="w-full h-64 border-0"
                title="HTML Response"
              />
            ) : (
              data
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
```

## Usage

```tsx
// app/api-demo/page.tsx
import { FormatSelector } from '@/components/format-selector';

export default function APIDemoPage() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Content Negotiation Demo</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">Users API</h2>
        <FormatSelector endpoint="/api/users" />
      </section>

      <section className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Example curl commands:</h3>
        <div className="space-y-2 text-sm font-mono">
          <p># JSON (default)</p>
          <code className="block bg-gray-800 text-green-400 p-2 rounded">
            curl -H "Accept: application/json" /api/users
          </code>
          <p className="mt-4"># XML</p>
          <code className="block bg-gray-800 text-green-400 p-2 rounded">
            curl -H "Accept: application/xml" /api/users
          </code>
          <p className="mt-4"># CSV</p>
          <code className="block bg-gray-800 text-green-400 p-2 rounded">
            curl -H "Accept: text/csv" /api/users
          </code>
          <p className="mt-4"># Using query parameter</p>
          <code className="block bg-gray-800 text-green-400 p-2 rounded">
            curl /api/users?format=xml
          </code>
        </div>
      </section>
    </div>
  );
}
```

## Related Skills

- [[route-handlers]] - API route handlers
- [[rest-api-design]] - REST API patterns
- [[api-versioning]] - API versioning
- [[export-data]] - Data export formats

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Accept header parsing
- JSON, XML, CSV, HTML formatters
- Content negotiation middleware
- Format selector component
