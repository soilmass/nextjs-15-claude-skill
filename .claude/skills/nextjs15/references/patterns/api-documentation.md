---
id: pt-api-documentation
name: API Documentation
version: 2.0.0
layer: L5
category: data
description: Generate and serve API documentation with OpenAPI/Swagger in Next.js 15
tags: [api, documentation, openapi, swagger, specs]
composes: []
dependencies: []
formula: "APIDocs = OpenAPISchema + SwaggerUI + ZodToOpenAPI + AutoGeneration"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# API Documentation Pattern

## Overview

API documentation is essential for developer experience. This pattern covers generating OpenAPI specifications, serving interactive documentation with Swagger UI, and keeping docs in sync with code.

## When to Use

- Building APIs that will be consumed by external developers
- Need for interactive API exploration and testing
- Generating client SDKs from API specifications
- Documenting internal APIs for team members
- Validating API responses against schema definitions

## Composition Diagram

```
[OpenAPI Schema] --> [/api/docs/openapi.json]
                              |
            +-----------------+-----------------+
            |                 |                 |
      [Swagger UI]      [Redoc]          [SDK Generator]
            |                 |                 |
      [Interactive]    [Static Docs]    [TypeScript Client]
            |                 |                 |
            +-----------------+-----------------+
                              |
                    [Developer Experience]

[Zod Schemas] --> [zodToOpenAPI] --> [Schema Components]
                                            |
                                    [Auto-generated Types]
```

## Implementation

### OpenAPI Schema Definition

```typescript
// lib/api/docs/openapi.ts
import { OpenAPIV3_1 } from 'openapi-types';

export const openApiDocument: OpenAPIV3_1.Document = {
  openapi: '3.1.0',
  info: {
    title: 'My API',
    version: '2.0.0',
    description: 'A comprehensive API for managing users and posts',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
      url: 'https://example.com/support',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
    {
      url: 'https://staging-api.example.com',
      description: 'Staging server',
    },
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
  ],
  tags: [
    { name: 'Users', description: 'User management operations' },
    { name: 'Posts', description: 'Blog post operations' },
    { name: 'Auth', description: 'Authentication operations' },
  ],
  paths: {
    '/api/v2/users': {
      get: {
        tags: ['Users'],
        summary: 'List all users',
        description: 'Retrieve a paginated list of users with optional filtering',
        operationId: 'listUsers',
        parameters: [
          {
            name: 'page',
            in: 'query',
            description: 'Page number',
            schema: { type: 'integer', default: 1, minimum: 1 },
          },
          {
            name: 'pageSize',
            in: 'query',
            description: 'Number of items per page',
            schema: { type: 'integer', default: 10, minimum: 1, maximum: 100 },
          },
          {
            name: 'search',
            in: 'query',
            description: 'Search by name or email',
            schema: { type: 'string' },
          },
          {
            name: 'role',
            in: 'query',
            description: 'Filter by role',
            schema: { type: 'string', enum: ['user', 'admin'] },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/PaginatedUsers',
                },
                example: {
                  success: true,
                  data: [
                    {
                      id: '123',
                      email: 'user@example.com',
                      profile: { name: 'John Doe', avatar: null },
                      metadata: {
                        createdAt: '2024-01-15T10:00:00Z',
                        updatedAt: '2024-01-15T10:00:00Z',
                      },
                    },
                  ],
                  meta: { page: 1, pageSize: 10, total: 100, totalPages: 10 },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '500': { $ref: '#/components/responses/InternalError' },
        },
        security: [{ bearerAuth: [] }],
      },
      post: {
        tags: ['Users'],
        summary: 'Create a new user',
        description: 'Create a new user account (admin only)',
        operationId: 'createUser',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserInput' },
              example: {
                email: 'newuser@example.com',
                name: 'New User',
                password: 'securePassword123',
                role: 'user',
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '401': { $ref: '#/components/responses/Unauthorized' },
          '403': { $ref: '#/components/responses/Forbidden' },
          '409': { $ref: '#/components/responses/Conflict' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/v2/users/{id}': {
      get: {
        tags: ['Users'],
        summary: 'Get user by ID',
        operationId: 'getUser',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'User ID',
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'Successful response',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        security: [{ bearerAuth: [] }],
      },
      patch: {
        tags: ['Users'],
        summary: 'Update user',
        operationId: 'updateUser',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          '200': {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
          '422': { $ref: '#/components/responses/ValidationError' },
        },
        security: [{ bearerAuth: [] }],
      },
      delete: {
        tags: ['Users'],
        summary: 'Delete user',
        operationId: 'deleteUser',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          '200': {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: { deleted: { type: 'boolean' } },
                    },
                  },
                },
              },
            },
          },
          '404': { $ref: '#/components/responses/NotFound' },
        },
        security: [{ bearerAuth: [] }],
      },
    },
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          profile: {
            type: 'object',
            properties: {
              name: { type: 'string', nullable: true },
              avatar: { type: 'string', format: 'uri', nullable: true },
            },
          },
          metadata: {
            type: 'object',
            properties: {
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
        required: ['id', 'email', 'profile', 'metadata'],
      },
      CreateUserInput: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          password: { type: 'string', minLength: 8 },
          role: { type: 'string', enum: ['user', 'admin'], default: 'user' },
        },
        required: ['email', 'name', 'password'],
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['user', 'admin'] },
        },
      },
      PaginatedUsers: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', enum: [false] },
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'object' },
            },
            required: ['code', 'message'],
          },
        },
      },
    },
    responses: {
      BadRequest: {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: { code: 'BAD_REQUEST', message: 'Invalid request body' },
            },
          },
        },
      },
      Unauthorized: {
        description: 'Unauthorized',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
            },
          },
        },
      },
      Forbidden: {
        description: 'Forbidden',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: { code: 'FORBIDDEN', message: 'Insufficient permissions' },
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: { code: 'NOT_FOUND', message: 'Resource not found' },
            },
          },
        },
      },
      Conflict: {
        description: 'Conflict',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: { code: 'CONFLICT', message: 'Resource already exists' },
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: {
                code: 'VALIDATION_ERROR',
                message: 'Validation failed',
                details: { fieldErrors: { email: ['Invalid email format'] } },
              },
            },
          },
        },
      },
      InternalError: {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' },
            example: {
              success: false,
              error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
            },
          },
        },
      },
    },
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token authentication',
      },
      apiKey: {
        type: 'apiKey',
        in: 'header',
        name: 'X-API-Key',
        description: 'API key authentication',
      },
    },
  },
};
```

### OpenAPI Spec Endpoint

```typescript
// app/api/docs/openapi.json/route.ts
import { NextResponse } from 'next/server';
import { openApiDocument } from '@/lib/api/docs/openapi';

export async function GET() {
  return NextResponse.json(openApiDocument, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

### Swagger UI Page

```tsx
// app/api/docs/page.tsx
import dynamic from 'next/dynamic';

const SwaggerUI = dynamic(() => import('@/components/swagger-ui'), {
  ssr: false,
  loading: () => <div className="p-8">Loading API documentation...</div>,
});

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen">
      <SwaggerUI url="/api/docs/openapi.json" />
    </div>
  );
}

// components/swagger-ui.tsx
'use client';

import SwaggerUIReact from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

interface SwaggerUIProps {
  url: string;
}

export default function SwaggerUI({ url }: SwaggerUIProps) {
  return (
    <SwaggerUIReact
      url={url}
      docExpansion="list"
      defaultModelsExpandDepth={3}
      displayRequestDuration
      filter
      showExtensions
      showCommonExtensions
      tryItOutEnabled
    />
  );
}
```

### Zod to OpenAPI Schema

```typescript
// lib/api/docs/zod-to-openapi.ts
import { z, ZodType, ZodObject, ZodArray, ZodString, ZodNumber, ZodBoolean, ZodEnum, ZodOptional, ZodNullable } from 'zod';
import { OpenAPIV3_1 } from 'openapi-types';

export function zodToOpenAPI(schema: ZodType): OpenAPIV3_1.SchemaObject {
  if (schema instanceof ZodString) {
    const checks = (schema as any)._def.checks || [];
    const result: OpenAPIV3_1.SchemaObject = { type: 'string' };
    
    for (const check of checks) {
      switch (check.kind) {
        case 'email':
          result.format = 'email';
          break;
        case 'url':
          result.format = 'uri';
          break;
        case 'uuid':
          result.format = 'uuid';
          break;
        case 'min':
          result.minLength = check.value;
          break;
        case 'max':
          result.maxLength = check.value;
          break;
      }
    }
    
    return result;
  }
  
  if (schema instanceof ZodNumber) {
    const checks = (schema as any)._def.checks || [];
    const result: OpenAPIV3_1.SchemaObject = { type: 'number' };
    
    for (const check of checks) {
      switch (check.kind) {
        case 'int':
          result.type = 'integer';
          break;
        case 'min':
          result.minimum = check.value;
          break;
        case 'max':
          result.maximum = check.value;
          break;
      }
    }
    
    return result;
  }
  
  if (schema instanceof ZodBoolean) {
    return { type: 'boolean' };
  }
  
  if (schema instanceof ZodEnum) {
    return {
      type: 'string',
      enum: (schema as any)._def.values,
    };
  }
  
  if (schema instanceof ZodArray) {
    return {
      type: 'array',
      items: zodToOpenAPI((schema as any)._def.type),
    };
  }
  
  if (schema instanceof ZodObject) {
    const shape = (schema as any)._def.shape();
    const properties: Record<string, OpenAPIV3_1.SchemaObject> = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(shape)) {
      if (value instanceof ZodOptional) {
        properties[key] = zodToOpenAPI((value as any)._def.innerType);
      } else {
        properties[key] = zodToOpenAPI(value as ZodType);
        required.push(key);
      }
    }
    
    return {
      type: 'object',
      properties,
      ...(required.length > 0 && { required }),
    };
  }
  
  if (schema instanceof ZodOptional) {
    return zodToOpenAPI((schema as any)._def.innerType);
  }
  
  if (schema instanceof ZodNullable) {
    const inner = zodToOpenAPI((schema as any)._def.innerType);
    return { ...inner, nullable: true };
  }
  
  return {};
}

// Usage
const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).optional(),
});

const openAPISchema = zodToOpenAPI(userSchema);
// {
//   type: 'object',
//   properties: {
//     email: { type: 'string', format: 'email' },
//     name: { type: 'string', minLength: 1, maxLength: 100 },
//     age: { type: 'integer', minimum: 0 },
//   },
//   required: ['email', 'name'],
// }
```

### Auto-Generated Docs from Route Handlers

```typescript
// lib/api/docs/generate.ts
import { glob } from 'glob';
import { readFile } from 'fs/promises';
import * as ts from 'typescript';

interface EndpointDoc {
  path: string;
  method: string;
  summary?: string;
  description?: string;
  tags?: string[];
}

export async function generateDocsFromRoutes(): Promise<EndpointDoc[]> {
  const routeFiles = await glob('app/api/**/route.ts');
  const endpoints: EndpointDoc[] = [];

  for (const file of routeFiles) {
    const content = await readFile(file, 'utf-8');
    const sourceFile = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true
    );

    // Extract path from file location
    const pathMatch = file.match(/app\/api(.*)\/route\.ts/);
    if (!pathMatch) continue;

    let path = pathMatch[1].replace(/\[([^\]]+)\]/g, '{$1}');
    if (!path) path = '/';

    // Find exported functions (GET, POST, etc.)
    ts.forEachChild(sourceFile, (node) => {
      if (
        ts.isFunctionDeclaration(node) ||
        ts.isVariableStatement(node)
      ) {
        const text = node.getText(sourceFile);
        const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
        
        for (const method of methods) {
          if (text.includes(`export async function ${method}`) ||
              text.includes(`export const ${method}`)) {
            // Extract JSDoc comments
            const jsDoc = ts.getJSDocTags(node);
            
            endpoints.push({
              path: `/api${path}`,
              method,
              summary: jsDoc.find(t => t.tagName.text === 'summary')?.comment?.toString(),
              description: jsDoc.find(t => t.tagName.text === 'description')?.comment?.toString(),
              tags: jsDoc.filter(t => t.tagName.text === 'tag').map(t => t.comment?.toString() || ''),
            });
          }
        }
      }
    });
  }

  return endpoints;
}
```

## Variants

### Redoc Alternative

```tsx
// app/api/docs/redoc/page.tsx
'use client';

import { RedocStandalone } from 'redoc';

export default function RedocPage() {
  return (
    <RedocStandalone
      specUrl="/api/docs/openapi.json"
      options={{
        theme: {
          colors: {
            primary: { main: '#3b82f6' },
          },
        },
        hideDownloadButton: false,
        expandResponses: '200,201',
      }}
    />
  );
}
```

## Anti-Patterns

```typescript
// Bad: Documentation out of sync with code
// openapi.ts says: { type: 'string' }
// route.ts returns: { type: 'number' }

// Good: Generate docs from code or validate

// Bad: No examples
responses: {
  '200': {
    schema: { $ref: '#/components/schemas/User' }
    // No example!
  }
}

// Good: Include realistic examples
responses: {
  '200': {
    schema: { $ref: '#/components/schemas/User' },
    example: { id: '123', email: 'user@example.com' }
  }
}
```

## Related Skills

- `rest-api-design` - API design patterns
- `api-versioning` - Version documentation
- `api-testing` - Test from spec
- `zod-schemas` - Schema definitions

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial API documentation pattern
