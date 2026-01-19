---
id: pt-openapi-specification
name: OpenAPI Specification
version: 1.0.0
layer: L5
category: api
description: Generate and serve OpenAPI specifications for API documentation
tags: [openapi, swagger, api, documentation, spec, next15, react19]
composes: []
dependencies: []
formula: "OpenAPI = SchemaDefinition + RouteExtraction + DocGeneration + SwaggerUI"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# OpenAPI Specification

## When to Use

- When documenting REST APIs
- For generating API client libraries
- When implementing API-first design
- For providing interactive API documentation
- When building developer portals

## Overview

This pattern implements OpenAPI specification generation for Next.js API routes, providing automatic documentation, validation, and interactive API exploration.

## OpenAPI Schema Definition

```typescript
// lib/openapi/schema.ts
import { OpenAPIV3_1 } from "openapi-types";

export const openAPIDocument: OpenAPIV3_1.Document = {
  openapi: "3.1.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "API documentation for My Application",
    contact: {
      name: "API Support",
      email: "support@example.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      description: "API Server",
    },
  ],
  tags: [
    { name: "Users", description: "User management endpoints" },
    { name: "Posts", description: "Post management endpoints" },
    { name: "Auth", description: "Authentication endpoints" },
  ],
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
      apiKey: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
      },
    },
    schemas: {},
  },
};
```

## Zod to OpenAPI Schema Converter

```typescript
// lib/openapi/zod-to-openapi.ts
import { z } from "zod";
import { OpenAPIV3_1 } from "openapi-types";

export function zodToOpenAPI(
  schema: z.ZodType<any>,
  name?: string
): OpenAPIV3_1.SchemaObject {
  if (schema instanceof z.ZodString) {
    return { type: "string" };
  }

  if (schema instanceof z.ZodNumber) {
    return { type: "number" };
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: "boolean" };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: "array",
      items: zodToOpenAPI(schema.element),
    };
  }

  if (schema instanceof z.ZodObject) {
    const shape = schema.shape;
    const properties: Record<string, OpenAPIV3_1.SchemaObject> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToOpenAPI(value as z.ZodType<any>);

      if (!(value as any).isOptional()) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: "string",
      enum: schema.options,
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToOpenAPI(schema.unwrap());
  }

  if (schema instanceof z.ZodNullable) {
    const inner = zodToOpenAPI(schema.unwrap());
    return { ...inner, nullable: true };
  }

  return { type: "object" };
}

// Generate schema with description from Zod
export function zodToOpenAPIWithDescription(
  schema: z.ZodType<any>
): OpenAPIV3_1.SchemaObject {
  const base = zodToOpenAPI(schema);

  if ((schema as any)._def?.description) {
    base.description = (schema as any)._def.description;
  }

  return base;
}
```

## Route Documentation Decorator

```typescript
// lib/openapi/decorators.ts
import { OpenAPIV3_1 } from "openapi-types";
import { z } from "zod";
import { zodToOpenAPI } from "./zod-to-openapi";
import { openAPIDocument } from "./schema";

interface RouteDocumentation {
  summary: string;
  description?: string;
  tags?: string[];
  security?: boolean | string[];
  requestBody?: {
    schema: z.ZodType<any>;
    description?: string;
  };
  queryParams?: z.ZodType<any>;
  pathParams?: z.ZodType<any>;
  responses: {
    [statusCode: number]: {
      description: string;
      schema?: z.ZodType<any>;
    };
  };
}

export function documentRoute(
  method: "get" | "post" | "put" | "patch" | "delete",
  path: string,
  doc: RouteDocumentation
): void {
  const pathItem: OpenAPIV3_1.PathItemObject =
    openAPIDocument.paths[path] || {};

  const operation: OpenAPIV3_1.OperationObject = {
    summary: doc.summary,
    description: doc.description,
    tags: doc.tags,
    parameters: [],
    responses: {},
  };

  // Add security
  if (doc.security) {
    operation.security = Array.isArray(doc.security)
      ? doc.security.map((s) => ({ [s]: [] }))
      : [{ bearerAuth: [] }];
  }

  // Add query parameters
  if (doc.queryParams && doc.queryParams instanceof z.ZodObject) {
    const shape = doc.queryParams.shape;
    for (const [name, schema] of Object.entries(shape)) {
      operation.parameters!.push({
        name,
        in: "query",
        required: !(schema as any).isOptional(),
        schema: zodToOpenAPI(schema as z.ZodType<any>),
      });
    }
  }

  // Add path parameters
  if (doc.pathParams && doc.pathParams instanceof z.ZodObject) {
    const shape = doc.pathParams.shape;
    for (const [name, schema] of Object.entries(shape)) {
      operation.parameters!.push({
        name,
        in: "path",
        required: true,
        schema: zodToOpenAPI(schema as z.ZodType<any>),
      });
    }
  }

  // Add request body
  if (doc.requestBody) {
    operation.requestBody = {
      description: doc.requestBody.description,
      required: true,
      content: {
        "application/json": {
          schema: zodToOpenAPI(doc.requestBody.schema),
        },
      },
    };
  }

  // Add responses
  for (const [statusCode, response] of Object.entries(doc.responses)) {
    operation.responses[statusCode] = {
      description: response.description,
      content: response.schema
        ? {
            "application/json": {
              schema: zodToOpenAPI(response.schema),
            },
          }
        : undefined,
    };
  }

  pathItem[method] = operation;
  openAPIDocument.paths[path] = pathItem;
}
```

## API Route with Documentation

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { documentRoute } from "@/lib/openapi/decorators";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

// Schema definitions
const UserSchema = z.object({
  id: z.string().describe("User ID"),
  email: z.string().email().describe("User email"),
  name: z.string().optional().describe("User display name"),
  createdAt: z.string().datetime().describe("Creation timestamp"),
});

const CreateUserSchema = z.object({
  email: z.string().email().describe("User email"),
  name: z.string().optional().describe("User display name"),
  password: z.string().min(8).describe("User password"),
});

const UsersListSchema = z.object({
  users: z.array(UserSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

const QueryParamsSchema = z.object({
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(10),
  search: z.string().optional(),
});

// Document the routes
documentRoute("get", "/api/users", {
  summary: "List users",
  description: "Get a paginated list of users",
  tags: ["Users"],
  security: true,
  queryParams: QueryParamsSchema,
  responses: {
    200: {
      description: "List of users",
      schema: UsersListSchema,
    },
    401: { description: "Unauthorized" },
  },
});

documentRoute("post", "/api/users", {
  summary: "Create user",
  description: "Create a new user account",
  tags: ["Users"],
  security: true,
  requestBody: {
    schema: CreateUserSchema,
    description: "User data",
  },
  responses: {
    201: {
      description: "User created",
      schema: UserSchema,
    },
    400: { description: "Invalid request" },
    409: { description: "Email already exists" },
  },
});

// GET /api/users
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const params = QueryParamsSchema.parse({
    page: searchParams.get("page"),
    pageSize: searchParams.get("pageSize"),
    search: searchParams.get("search"),
  });

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: "insensitive" } },
              { email: { contains: params.search, mode: "insensitive" } },
            ],
          }
        : undefined,
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
      select: { id: true, email: true, name: true, createdAt: true },
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    users,
    total,
    page: params.page,
    pageSize: params.pageSize,
  });
}

// POST /api/users
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const data = CreateUserSchema.parse(body);

  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 409 }
    );
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: await hashPassword(data.password),
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  return NextResponse.json(user, { status: 201 });
}
```

## OpenAPI Spec Endpoint

```typescript
// app/api/openapi/route.ts
import { NextResponse } from "next/server";
import { openAPIDocument } from "@/lib/openapi/schema";

// Import all route files to register their documentation
import "@/app/api/users/route";
import "@/app/api/posts/route";
import "@/app/api/auth/route";

export async function GET() {
  return NextResponse.json(openAPIDocument, {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
```

## Swagger UI Page

```typescript
// app/api-docs/page.tsx
"use client";

import { useEffect, useRef } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export default function APIDocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SwaggerUI
        url="/api/openapi"
        docExpansion="list"
        defaultModelsExpandDepth={3}
        tryItOutEnabled={true}
        persistAuthorization={true}
      />
    </div>
  );
}
```

## API Documentation Component

```typescript
// components/api-docs/endpoint-card.tsx
"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Copy, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface EndpointCardProps {
  method: string;
  path: string;
  summary: string;
  description?: string;
  parameters?: any[];
  requestBody?: any;
  responses?: Record<string, any>;
}

const methodColors: Record<string, string> = {
  get: "bg-blue-500",
  post: "bg-green-500",
  put: "bg-yellow-500",
  patch: "bg-orange-500",
  delete: "bg-red-500",
};

export function EndpointCard({
  method,
  path,
  summary,
  description,
  parameters,
  requestBody,
  responses,
}: EndpointCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 p-4 hover:bg-muted/50"
      >
        <Badge className={cn("uppercase font-mono", methodColors[method])}>
          {method}
        </Badge>
        <code className="text-sm font-mono">{path}</code>
        <span className="text-sm text-muted-foreground flex-1 text-left">
          {summary}
        </span>
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      {expanded && (
        <div className="border-t p-4 space-y-4">
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}

          {parameters && parameters.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Parameters</h4>
              <div className="space-y-2">
                {parameters.map((param) => (
                  <div
                    key={param.name}
                    className="flex items-start gap-2 text-sm"
                  >
                    <code className="bg-muted px-1 rounded">{param.name}</code>
                    <Badge variant="outline" className="text-xs">
                      {param.in}
                    </Badge>
                    {param.required && (
                      <Badge variant="destructive" className="text-xs">
                        required
                      </Badge>
                    )}
                    {param.schema?.type && (
                      <span className="text-muted-foreground">
                        {param.schema.type}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {requestBody && (
            <div>
              <h4 className="font-medium mb-2">Request Body</h4>
              <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                {JSON.stringify(
                  requestBody.content?.["application/json"]?.schema,
                  null,
                  2
                )}
              </pre>
            </div>
          )}

          {responses && (
            <div>
              <h4 className="font-medium mb-2">Responses</h4>
              <div className="space-y-2">
                {Object.entries(responses).map(([code, response]) => (
                  <div key={code} className="text-sm">
                    <Badge
                      variant={code.startsWith("2") ? "default" : "destructive"}
                    >
                      {code}
                    </Badge>
                    <span className="ml-2 text-muted-foreground">
                      {response.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Copy cURL
            </Button>
            <Button size="sm">
              <Play className="h-4 w-4 mr-2" />
              Try it
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
```

## Generate Client SDK

```typescript
// scripts/generate-client.ts
import { openAPIDocument } from "@/lib/openapi/schema";
import { generateApi } from "swagger-typescript-api";
import path from "path";
import fs from "fs";

async function generate() {
  // Write spec to file
  fs.writeFileSync(
    path.resolve("./openapi.json"),
    JSON.stringify(openAPIDocument, null, 2)
  );

  // Generate TypeScript client
  await generateApi({
    name: "api-client.ts",
    output: path.resolve("./lib/api"),
    input: path.resolve("./openapi.json"),
    httpClientType: "fetch",
    generateResponses: true,
    generateRouteTypes: true,
    extractRequestParams: true,
  });

  console.log("API client generated successfully!");
}

generate();
```

## Anti-patterns

### Don't Hardcode Schema Separately

```typescript
// BAD - Schema not in sync with validation
const openApiSchema = { type: "object", properties: { name: { type: "string" } } };
const zodSchema = z.object({ name: z.string(), email: z.string() }); // Different!

// GOOD - Generate from single source
const zodSchema = z.object({ name: z.string(), email: z.string() });
const openApiSchema = zodToOpenAPI(zodSchema);
```

## Related Patterns

- [api-types](./api-types.md)
- [form-validation](./form-validation.md)
- [trpc](./trpc.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Zod to OpenAPI conversion
- Route documentation decorators
- Swagger UI integration
- Client SDK generation
