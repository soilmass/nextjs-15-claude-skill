---
id: o-api-documentation
name: API Documentation
version: 1.0.0
layer: L3
category: developer
description: Complete API documentation display with methods, parameters, responses, and code examples
tags: [api, documentation, developer, reference, endpoints]
formula: "APIDocumentation = Tabs(m-tabs) + CodeBlock(o-code-block) + Badge(a-badge) + Table + Accordion(m-accordion-item)"
composes:
  - ../molecules/tabs.md
  - ../molecules/accordion-item.md
  - ../atoms/display-badge.md
  - ../atoms/display-code.md
dependencies:
  - react
  - lucide-react
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# API Documentation

## Overview

A comprehensive API documentation organism for displaying endpoint details including parameters, request/response schemas, authentication requirements, and code examples in multiple languages.

## When to Use

Use this skill when:
- Building developer documentation portals
- Creating API reference pages
- Documenting REST/GraphQL endpoints
- Generating interactive API explorers

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                      APIDocumentation (L3)                           │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Endpoint Header                                              │  │
│  │  Badge(a-badge)[method] + /api/v1/users/{id} + [Deprecated]  │  │
│  │  "Retrieve a single user by their unique identifier"         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Authentication Info                                          │  │
│  │  [Lock Icon] "Requires Bearer Token"                         │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Tabs(m-tabs): [Parameters] [Request] [Response] [Examples]  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Parameters Table                                       │  │  │
│  │  │  ┌──────────┬────────┬──────────┬────────────────────┐  │  │  │
│  │  │  │ Name     │ Type   │ Required │ Description        │  │  │  │
│  │  │  ├──────────┼────────┼──────────┼────────────────────┤  │  │  │
│  │  │  │ id       │ string │ Yes      │ User ID            │  │  │  │
│  │  │  │ include  │ string │ No       │ Related resources  │  │  │  │
│  │  │  └──────────┴────────┴──────────┴────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Code Examples - Tabs(m-tabs)                                 │  │
│  │  [cURL] [JavaScript] [Python] [Go]                           │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  CodeBlock with syntax highlighting                     │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/api-documentation.tsx
'use client';

import * as React from 'react';
import { Copy, Check, Lock, ChevronDown, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ParamLocation = 'path' | 'query' | 'header' | 'body';

interface Parameter {
  name: string;
  type: string;
  required: boolean;
  description: string;
  location: ParamLocation;
  default?: string;
  example?: string;
}

interface ResponseSchema {
  status: number;
  description: string;
  schema?: Record<string, unknown>;
  example?: string;
}

interface CodeExample {
  language: string;
  label: string;
  code: string;
}

interface APIDocumentationProps {
  method: HttpMethod;
  path: string;
  title: string;
  description?: string;
  parameters?: Parameter[];
  requestBody?: { schema: Record<string, unknown>; example?: string };
  responses?: ResponseSchema[];
  examples?: CodeExample[];
  authentication?: { type: string; description: string };
  deprecated?: boolean;
  className?: string;
}

const methodColors: Record<HttpMethod, string> = {
  GET: 'bg-green-100 text-green-700',
  POST: 'bg-blue-100 text-blue-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  PATCH: 'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
};

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="p-1.5 rounded hover:bg-accent" aria-label="Copy">
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative rounded-lg bg-zinc-950 text-zinc-50">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-400">{language}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function ParametersTable({ parameters }: { parameters: Parameter[] }) {
  const grouped = parameters.reduce((acc, param) => {
    if (!acc[param.location]) acc[param.location] = [];
    acc[param.location].push(param);
    return acc;
  }, {} as Record<ParamLocation, Parameter[]>);

  const locationLabels: Record<ParamLocation, string> = {
    path: 'Path Parameters',
    query: 'Query Parameters',
    header: 'Header Parameters',
    body: 'Body Parameters',
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([location, params]) => (
        <div key={location}>
          <h4 className="mb-3 text-sm font-medium">{locationLabels[location as ParamLocation]}</h4>
          <div className="rounded-lg border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-left font-medium">Required</th>
                  <th className="px-4 py-2 text-left font-medium">Description</th>
                </tr>
              </thead>
              <tbody>
                {params.map((param) => (
                  <tr key={param.name} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      <code className="rounded bg-muted px-1 py-0.5 text-xs">{param.name}</code>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{param.type}</td>
                    <td className="px-4 py-3">
                      {param.required ? (
                        <span className="text-red-500">Required</span>
                      ) : (
                        <span className="text-muted-foreground">Optional</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function ResponsesSection({ responses }: { responses: ResponseSchema[] }) {
  const [expanded, setExpanded] = React.useState<number | null>(responses[0]?.status || null);

  return (
    <div className="space-y-2">
      {responses.map((response) => (
        <div key={response.status} className="rounded-lg border">
          <button
            onClick={() => setExpanded(expanded === response.status ? null : response.status)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <div className="flex items-center gap-3">
              <span className={cn(
                'rounded px-2 py-0.5 text-xs font-bold',
                response.status < 300 ? 'bg-green-100 text-green-700' :
                response.status < 400 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              )}>
                {response.status}
              </span>
              <span className="text-sm">{response.description}</span>
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform', expanded === response.status && 'rotate-180')} />
          </button>
          {expanded === response.status && response.example && (
            <div className="border-t px-4 py-3">
              <CodeBlock code={response.example} language="json" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function APIDocumentation({
  method,
  path,
  title,
  description,
  parameters = [],
  requestBody,
  responses = [],
  examples = [],
  authentication,
  deprecated = false,
  className,
}: APIDocumentationProps) {
  const [activeTab, setActiveTab] = React.useState('parameters');
  const [activeExample, setActiveExample] = React.useState(examples[0]?.language || '');

  const tabs = [
    { id: 'parameters', label: 'Parameters', show: parameters.length > 0 },
    { id: 'request', label: 'Request Body', show: !!requestBody },
    { id: 'responses', label: 'Responses', show: responses.length > 0 },
  ].filter(t => t.show);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={cn('rounded px-2 py-1 text-xs font-bold', methodColors[method])}>
            {method}
          </span>
          <code className="text-lg font-mono">{path}</code>
          {deprecated && (
            <span className="inline-flex items-center gap-1 rounded bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
              <AlertTriangle className="h-3 w-3" />
              Deprecated
            </span>
          )}
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>

      {/* Authentication */}
      {authentication && (
        <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{authentication.type}</span>
          <span className="text-sm text-muted-foreground">- {authentication.description}</span>
        </div>
      )}

      {/* Tabs */}
      {tabs.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-1 border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="pt-2">
            {activeTab === 'parameters' && <ParametersTable parameters={parameters} />}
            {activeTab === 'request' && requestBody?.example && (
              <CodeBlock code={requestBody.example} language="json" />
            )}
            {activeTab === 'responses' && <ResponsesSection responses={responses} />}
          </div>
        </div>
      )}

      {/* Code Examples */}
      {examples.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Code Examples</h3>
          <div className="flex gap-1 border-b">
            {examples.map((ex) => (
              <button
                key={ex.language}
                onClick={() => setActiveExample(ex.language)}
                className={cn(
                  'px-3 py-2 text-sm border-b-2 -mb-px',
                  activeExample === ex.language
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {ex.label}
              </button>
            ))}
          </div>
          {examples.find(e => e.language === activeExample) && (
            <CodeBlock
              code={examples.find(e => e.language === activeExample)!.code}
              language={activeExample}
            />
          )}
        </div>
      )}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { APIDocumentation } from '@/components/organisms/api-documentation';

<APIDocumentation
  method="GET"
  path="/api/v1/users/{id}"
  title="Get User"
  description="Retrieve a user by their unique identifier"
  authentication={{ type: 'Bearer Token', description: 'Required' }}
  parameters={[
    { name: 'id', type: 'string', required: true, location: 'path', description: 'User ID' },
  ]}
  responses={[
    { status: 200, description: 'Success', example: '{"id": "1", "name": "John"}' },
    { status: 404, description: 'User not found' },
  ]}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Documentation displays with all sections visible | Method badge, path, parameters table, and code examples shown |
| Deprecated | Endpoint marked as deprecated | Yellow warning badge with AlertTriangle icon appears next to path |
| Tab Active | User has selected a specific tab | Active tab highlighted with primary border, content switches |
| Response Expanded | Response accordion opened | Chevron rotates, response example code block revealed |
| Response Collapsed | Response accordion closed | Chevron points down, only status code and description visible |
| Code Copied | User copied code example | Copy icon changes to checkmark for 2 seconds |
| No Parameters | Endpoint has no parameters | Parameters tab hidden from tab list |
| No Examples | No code examples provided | Code Examples section not rendered |

## Anti-patterns

### Bad: Hardcoding endpoint paths instead of using props

```tsx
// Bad - hardcoded path makes component not reusable
function UserEndpointDocs() {
  return (
    <div>
      <span>GET</span>
      <code>/api/v1/users</code> {/* Hardcoded */}
    </div>
  );
}

// Good - use configurable props
<APIDocumentation
  method="GET"
  path="/api/v1/users"
  title="List Users"
/>
```

### Bad: Missing required parameters in documentation

```tsx
// Bad - parameters missing required field causes confusion
<APIDocumentation
  parameters={[
    { name: 'id', type: 'string', location: 'path', description: 'User ID' },
    // Missing required: true - is this mandatory?
  ]}
/>

// Good - explicitly mark required status
<APIDocumentation
  parameters={[
    { name: 'id', type: 'string', required: true, location: 'path', description: 'User ID' },
    { name: 'include', type: 'string', required: false, location: 'query', description: 'Related resources' },
  ]}
/>
```

### Bad: Providing response examples without status codes

```tsx
// Bad - response without status code context
<APIDocumentation
  responses={[
    { description: 'Success', example: '{"data": {...}}' },
    // Missing status - is this 200? 201?
  ]}
/>

// Good - include status codes for each response
<APIDocumentation
  responses={[
    { status: 200, description: 'Success', example: '{"data": {...}}' },
    { status: 404, description: 'User not found', example: '{"error": "Not found"}' },
    { status: 422, description: 'Validation error', example: '{"errors": [...]}' },
  ]}
/>
```

### Bad: Not indicating authentication requirements

```tsx
// Bad - no auth info leaves developers guessing
<APIDocumentation
  method="DELETE"
  path="/api/v1/users/{id}"
  title="Delete User"
  // No authentication prop - is this public?
/>

// Good - always specify authentication
<APIDocumentation
  method="DELETE"
  path="/api/v1/users/{id}"
  title="Delete User"
  authentication={{ type: 'Bearer Token', description: 'Requires admin scope' }}
/>
```

## Related Skills

- `organisms/api-card` - API endpoint card
- `organisms/code-block` - Code display
- `molecules/tabs` - Tab navigation

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- Parameters table with grouping
- Response schema display
- Multi-language code examples
