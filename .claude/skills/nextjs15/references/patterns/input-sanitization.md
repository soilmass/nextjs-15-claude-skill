---
id: pt-input-sanitization
name: Input Sanitization
version: 2.0.0
layer: L5
category: security
description: Validate and sanitize user input to prevent injection attacks
tags: [security, validation, sanitization, input, zod]
composes: []
dependencies: []
formula: Zod Schema + Transform + Server Validation = Safe Input Handling
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Validating form submissions with Zod schemas
- Sanitizing user input to prevent SQL injection
- Validating file uploads (type, size, extension)
- Preventing path traversal attacks
- Normalizing and transforming input data

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Input Sanitization Pipeline                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Raw User Input                                            │
│       │                                                     │
│       ▼                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Step 1: Parse & Coerce                              │   │
│  │ z.coerce.number(), z.string().trim()               │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Step 2: Validate                                    │   │
│  │ .min(), .max(), .email(), .regex()                 │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Step 3: Transform & Sanitize                        │   │
│  │ .transform(stripHtml), .transform(normalize)        │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Step 4: Type-Safe Output                            │   │
│  │ Fully validated and sanitized data                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Validation Layers:                                        │
│  - String: stripHtml, trim, maxLength                      │
│  - Files: size, type, extension validation                 │
│  - Paths: prevent traversal, validate base directory       │
│  - SQL: parameterized queries (Prisma handles this)        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Input Sanitization

Validate, sanitize, and normalize user input to prevent injection attacks and ensure data integrity.

## Overview

Input sanitization involves:
- Schema validation with Zod
- Type coercion and normalization
- HTML/script stripping
- SQL injection prevention
- Path traversal prevention

## Implementation

### Zod Schema Validation

```typescript
// lib/validation/schemas.ts
import { z } from "zod";

// Basic sanitization transforms
const sanitizeString = z.string().transform((val) =>
  val.trim().replace(/\s+/g, " ")
);

const stripHtml = z.string().transform((val) =>
  val.replace(/<[^>]*>/g, "")
);

// User input schemas
export const userInputSchema = z.object({
  // Name: trimmed, no HTML, length limits
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name is too long")
    .transform((val) => val.trim())
    .pipe(stripHtml),
  
  // Email: lowercase, trimmed
  email: z
    .string()
    .email("Invalid email address")
    .transform((val) => val.toLowerCase().trim()),
  
  // Username: alphanumeric only
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username is too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscore, and dash allowed")
    .transform((val) => val.toLowerCase()),
  
  // Bio: strip HTML, limit length
  bio: z
    .string()
    .max(500, "Bio is too long")
    .transform((val) => val.trim())
    .pipe(stripHtml)
    .optional(),
  
  // Age: coerce to number
  age: z.coerce
    .number()
    .int()
    .min(13, "Must be at least 13 years old")
    .max(120, "Invalid age")
    .optional(),
});

// Comment schema with strict sanitization
export const commentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment is too long")
    .transform((val) => {
      // Remove potential XSS vectors
      return val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .trim();
    }),
  
  postId: z.string().uuid("Invalid post ID"),
});

// Search query sanitization
export const searchSchema = z.object({
  query: z
    .string()
    .max(200, "Search query too long")
    .transform((val) => {
      // Remove special characters that could be used in injection
      return val
        .replace(/[<>'"`;]/g, "")
        .trim();
    }),
  
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
```

### Server Action with Validation

```typescript
// app/actions/users.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { userInputSchema } from "@/lib/validation/schemas";

// Action state type
type ActionState = {
  success: boolean;
  errors?: Record<string, string[]>;
  message?: string;
};

export async function updateProfile(
  prevState: ActionState | null,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  if (!session) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }
  
  // Extract and validate input
  const rawInput = {
    name: formData.get("name"),
    email: formData.get("email"),
    username: formData.get("username"),
    bio: formData.get("bio"),
    age: formData.get("age"),
  };
  
  const result = userInputSchema.safeParse(rawInput);
  
  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }
  
  // Validated and sanitized data
  const { name, email, username, bio, age } = result.data;
  
  try {
    // Check for unique constraints
    const existing = await prisma.user.findFirst({
      where: {
        OR: [
          { email, NOT: { id: session.userId } },
          { username, NOT: { id: session.userId } },
        ],
      },
    });
    
    if (existing) {
      return {
        success: false,
        errors: {
          email: existing.email === email ? ["Email already taken"] : [],
          username: existing.username === username ? ["Username already taken"] : [],
        },
      };
    }
    
    await prisma.user.update({
      where: { id: session.userId },
      data: { name, email, username, bio, age },
    });
    
    revalidatePath("/profile");
    
    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return {
      success: false,
      message: "Failed to update profile",
    };
  }
}
```

### File Upload Validation

```typescript
// lib/validation/file.ts
import { z } from "zod";
import path from "path";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_DOCUMENT_TYPES = ["application/pdf", "text/plain"];

// Validate file extension matches content type
function validateFileExtension(file: File): boolean {
  const extension = path.extname(file.name).toLowerCase();
  const typeExtensions: Record<string, string[]> = {
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/gif": [".gif"],
    "image/webp": [".webp"],
    "application/pdf": [".pdf"],
    "text/plain": [".txt"],
  };
  
  const allowedExtensions = typeExtensions[file.type] || [];
  return allowedExtensions.includes(extension);
}

// Sanitize filename
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const basename = path.basename(filename);
  
  // Remove special characters
  const sanitized = basename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.{2,}/g, ".") // No double dots
    .replace(/^[.-]/, "_"); // No leading dots or dashes
  
  // Limit length
  const ext = path.extname(sanitized);
  const name = path.basename(sanitized, ext);
  
  return `${name.slice(0, 100)}${ext}`;
}

export const imageFileSchema = z.instanceof(File).refine(
  (file) => file.size <= MAX_FILE_SIZE,
  "File size must be less than 5MB"
).refine(
  (file) => ALLOWED_IMAGE_TYPES.includes(file.type),
  "File must be an image (JPEG, PNG, GIF, or WebP)"
).refine(
  (file) => validateFileExtension(file),
  "File extension does not match content type"
);

export const uploadSchema = z.object({
  file: imageFileSchema,
  alt: z.string().max(200).optional(),
});

// API route for file upload
// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { uploadSchema, sanitizeFilename } from "@/lib/validation/file";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const alt = formData.get("alt") as string | null;
  
  const result = uploadSchema.safeParse({ file, alt });
  
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.flatten() },
      { status: 400 }
    );
  }
  
  const { file: validatedFile, alt: validatedAlt } = result.data;
  const safeFilename = sanitizeFilename(validatedFile.name);
  
  // Process upload with sanitized filename
  const buffer = await validatedFile.arrayBuffer();
  // ... save to storage
  
  return NextResponse.json({ success: true, filename: safeFilename });
}
```

### SQL Injection Prevention

```typescript
// lib/db/safe-queries.ts
import { prisma } from "@/lib/db";
import { z } from "zod";

// Always use parameterized queries with Prisma
// Prisma automatically escapes values

// Safe search with validated input
const searchParamsSchema = z.object({
  query: z.string().max(200),
  category: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
});

export async function searchProducts(params: unknown) {
  const result = searchParamsSchema.safeParse(params);
  
  if (!result.success) {
    throw new Error("Invalid search parameters");
  }
  
  const { query, category, minPrice, maxPrice } = result.data;
  
  // Prisma handles escaping automatically
  return prisma.product.findMany({
    where: {
      AND: [
        // Full-text search (Prisma handles escaping)
        query ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        } : {},
        // Category filter
        category ? { category: { slug: category } } : {},
        // Price range
        minPrice !== undefined ? { price: { gte: minPrice } } : {},
        maxPrice !== undefined ? { price: { lte: maxPrice } } : {},
      ],
    },
    take: 50,
  });
}

// If you must use raw queries, always use $queryRaw with template literals
export async function customSearch(query: string) {
  const sanitizedQuery = query.replace(/[%_]/g, "\\$&"); // Escape LIKE wildcards
  
  // Prisma's tagged template escapes values automatically
  return prisma.$queryRaw`
    SELECT * FROM products
    WHERE name ILIKE ${"%" + sanitizedQuery + "%"}
    LIMIT 50
  `;
}
```

### Path Traversal Prevention

```typescript
// lib/validation/path.ts
import path from "path";

const SAFE_BASE_DIR = process.cwd() + "/public/uploads";

export function sanitizePath(userPath: string): string | null {
  // Remove null bytes
  const cleanPath = userPath.replace(/\0/g, "");
  
  // Resolve the full path
  const resolvedPath = path.resolve(SAFE_BASE_DIR, cleanPath);
  
  // Ensure it's within the safe directory
  if (!resolvedPath.startsWith(SAFE_BASE_DIR)) {
    return null; // Path traversal attempt
  }
  
  return resolvedPath;
}

// API route for serving files
// app/api/files/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { sanitizePath } from "@/lib/validation/path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const requestedPath = pathSegments.join("/");
  
  const safePath = sanitizePath(requestedPath);
  
  if (!safePath) {
    return NextResponse.json(
      { error: "Invalid path" },
      { status: 400 }
    );
  }
  
  try {
    const content = await readFile(safePath);
    return new Response(content);
  } catch {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404 }
    );
  }
}
```

### Request Body Validation Middleware

```typescript
// lib/middleware/validate.ts
import { NextRequest, NextResponse } from "next/server";
import { ZodSchema } from "zod";

export function withValidation<T>(
  schema: ZodSchema<T>,
  handler: (request: NextRequest, data: T) => Promise<Response>
) {
  return async (request: NextRequest) => {
    let body: unknown;
    
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }
    
    const result = schema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten(),
        },
        { status: 400 }
      );
    }
    
    return handler(request, result.data);
  };
}

// Usage
// app/api/posts/route.ts
import { withValidation } from "@/lib/middleware/validate";

const createPostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(10000),
  published: z.boolean().default(false),
});

export const POST = withValidation(
  createPostSchema,
  async (request, data) => {
    // data is fully validated and typed
    const post = await prisma.post.create({ data });
    return NextResponse.json(post);
  }
);
```

## Variants

### Custom Sanitization Functions

```typescript
// lib/sanitize/custom.ts

// Phone number sanitization
export function sanitizePhone(phone: string): string {
  // Remove everything except digits
  return phone.replace(/\D/g, "").slice(0, 15);
}

// Credit card sanitization (for display only)
export function maskCreditCard(card: string): string {
  const digits = card.replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `****${digits.slice(-4)}`;
}

// URL slug sanitization
export function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

// JSON sanitization (remove potential prototype pollution)
export function sanitizeJson(input: unknown): unknown {
  if (input === null || typeof input !== "object") {
    return input;
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeJson);
  }
  
  const sanitized: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(input)) {
    // Skip prototype pollution vectors
    if (key === "__proto__" || key === "constructor" || key === "prototype") {
      continue;
    }
    sanitized[key] = sanitizeJson(value);
  }
  
  return sanitized;
}
```

## Anti-patterns

### Trusting Client-Side Validation Only

```typescript
// BAD: Only validating on client
"use client";
function Form() {
  const handleSubmit = (e) => {
    if (formData.name.length < 3) {
      alert("Name too short");
      return;
    }
    // Send to server without server validation
  };
}

// GOOD: Always validate on server
"use server";
export async function submitForm(formData: FormData) {
  const result = schema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    return { errors: result.error.flatten() };
  }
  // Process validated data
}
```

### Sanitizing After Use

```typescript
// BAD: Using input before sanitization
async function search(query: string) {
  const results = await db.query(`SELECT * FROM items WHERE name = '${query}'`);
  const sanitized = query.replace(/'/g, ""); // Too late!
  return results;
}

// GOOD: Sanitize before use
async function search(query: string) {
  const result = searchSchema.safeParse({ query });
  if (!result.success) throw new Error("Invalid query");
  
  // Use parameterized query with validated input
  const results = await prisma.item.findMany({
    where: { name: { contains: result.data.query } },
  });
  return results;
}
```

## Related Skills

- `form-validation` - Form validation patterns
- `server-actions` - Server action implementation
- `xss-prevention` - XSS protection
- `error-handling` - Error handling patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Zod validation patterns
