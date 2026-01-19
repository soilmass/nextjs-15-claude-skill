---
id: pt-zod-schemas
name: Zod Schema Patterns
version: 2.0.0
layer: L5
category: typescript
description: Runtime validation with Zod for type-safe schemas, form validation, and API contracts
tags: [zod, validation, schemas, runtime-types, forms, api]
composes: []
dependencies:
  zod: "^3.23.0"
formula: "const schema = z.object({...}); type T = z.infer<typeof schema>"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Zod Schema Patterns

## Overview

Zod provides runtime validation with TypeScript type inference. Define schemas once and get both runtime validation and static types, ensuring data integrity at application boundaries.

## When to Use

Use Zod schemas when:
- Validating user input from forms or API requests
- Defining type-safe API request/response contracts
- Creating reusable validation rules across the application
- Building server actions with automatic type inference
- Validating environment variables at startup

## Composition Diagram

```
+------------------+
|   Zod Schema     |
|   z.object({})   |
+--------+---------+
         |
    +----+----+----+----+
    |         |    |    |
    v         v    v    v
+---+---+ +---+---+ +--+--+ +------+
|parse  | |safeParse| |infer| |input |
|throws | |Result   | |type | |type  |
+---+---+ +---+---+ +--+--+ +------+
    |         |         |
    v         v         v
+---+---+ +---+---+ +---+---+
|Validated| |{success| |TypeScript|
|Data     | | data}  | |Type T   |
+---------+ +--------+ +---------+

Schema Composition:
+----------+     +----------+     +----------+
|  Base    |---->|  Extend  |---->|  Pick/   |
|  Schema  |     |  .extend |     |  Omit    |
+----------+     +----------+     +----------+

Response Pattern:
+----------+     +----------+     +----------+
|  Success |     |   OR     |     |  Error   |
|  Schema  |---->| Union    |<----|  Schema  |
| {data:T} |     |          |     | {error}  |
+----------+     +----------+     +----------+
```

## Implementation

### Basic Schema Definitions

```typescript
// schemas/base.ts
import { z } from "zod";

// Primitive schemas with custom messages
export const emailSchema = z
  .string({ required_error: "Email is required" })
  .email("Please enter a valid email address")
  .min(1, "Email cannot be empty");

export const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const slugSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Invalid slug format");

export const uuidSchema = z.string().uuid("Invalid UUID format");

export const urlSchema = z.string().url("Invalid URL format");

export const dateSchema = z.coerce.date();

export const positiveNumberSchema = z.number().positive("Must be a positive number");

export const percentageSchema = z
  .number()
  .min(0, "Percentage cannot be negative")
  .max(100, "Percentage cannot exceed 100");
```

### Complex Object Schemas

```typescript
// schemas/user.ts
import { z } from "zod";
import { emailSchema, passwordSchema, uuidSchema, urlSchema } from "./base";

// Enum schemas
export const roleSchema = z.enum(["user", "admin", "moderator"], {
  errorMap: () => ({ message: "Invalid role" }),
});

export const statusSchema = z.enum(["active", "inactive", "pending", "suspended"]);

// User schema with all validations
export const userSchema = z.object({
  id: uuidSchema,
  email: emailSchema,
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  role: roleSchema,
  status: statusSchema.default("pending"),
  avatar: urlSchema.nullable().optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),
  settings: z.object({
    theme: z.enum(["light", "dark", "system"]).default("system"),
    notifications: z.boolean().default(true),
    language: z.string().default("en"),
  }).default({}),
  metadata: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

// Infer types
export type User = z.infer<typeof userSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Status = z.infer<typeof statusSchema>;

// Create schema (without generated fields)
export const userCreateSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserCreate = z.infer<typeof userCreateSchema>;

// Update schema (all fields optional except nothing required)
export const userUpdateSchema = userCreateSchema.partial();

export type UserUpdate = z.infer<typeof userUpdateSchema>;

// Registration schema with password confirmation
export const userRegisterSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    name: z.string().min(2).max(100),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type UserRegister = z.infer<typeof userRegisterSchema>;
```

### Form Validation with Zod

```typescript
// schemas/forms.ts
import { z } from "zod";

// Contact form
export const contactFormSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters").max(1000),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

export type ContactForm = z.infer<typeof contactFormSchema>;

// Address schema (reusable)
export const addressSchema = z.object({
  street: z.string().min(1, "Street is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Invalid postal code"),
  country: z.string().length(2, "Country must be ISO code"),
});

export type Address = z.infer<typeof addressSchema>;

// Checkout form with nested schemas
export const checkoutFormSchema = z.object({
  customer: z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    phone: z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number").optional(),
  }),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  useSameAddress: z.boolean().default(true),
  paymentMethod: z.enum(["card", "paypal", "bank"]),
  cardDetails: z
    .object({
      number: z.string().regex(/^\d{16}$/, "Invalid card number"),
      expiry: z.string().regex(/^\d{2}\/\d{2}$/, "Invalid expiry (MM/YY)"),
      cvv: z.string().regex(/^\d{3,4}$/, "Invalid CVV"),
      name: z.string().min(1, "Cardholder name is required"),
    })
    .optional(),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => {
    // Card details required if payment method is card
    if (data.paymentMethod === "card" && !data.cardDetails) {
      return false;
    }
    return true;
  },
  {
    message: "Card details are required for card payments",
    path: ["cardDetails"],
  }
);

export type CheckoutForm = z.infer<typeof checkoutFormSchema>;
```

### API Request/Response Schemas

```typescript
// schemas/api.ts
import { z } from "zod";
import { userSchema } from "./user";

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export type Pagination = z.infer<typeof paginationSchema>;

// Search params schema
export const searchParamsSchema = paginationSchema.extend({
  q: z.string().optional(),
  filter: z.record(z.string()).optional(),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

// Success response schema
export const successResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    meta: z
      .object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        totalPages: z.number(),
      })
      .optional(),
  });

// Error response schema
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.record(z.array(z.string())).optional(),
  }),
});

// Combined response schema
export const apiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.discriminatedUnion("success", [
    successResponseSchema(dataSchema),
    errorResponseSchema,
  ]);

// Users list response
export const usersResponseSchema = apiResponseSchema(z.array(userSchema));
export type UsersResponse = z.infer<typeof usersResponseSchema>;

// Single user response
export const userResponseSchema = apiResponseSchema(userSchema);
export type UserResponse = z.infer<typeof userResponseSchema>;
```

### Server Action with Zod

```typescript
// app/actions/user.ts
"use server";

import { z } from "zod";
import { userCreateSchema, userUpdateSchema } from "@/schemas/user";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Type-safe action wrapper
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function createUser(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const rawData = Object.fromEntries(formData);

  // Parse with safeParse to handle errors gracefully
  const result = userCreateSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const user = await prisma.user.create({
      data: result.data,
    });

    revalidatePath("/users");
    return { success: true, data: { id: user.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create user",
    };
  }
}

export async function updateUser(
  id: string,
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  const rawData = Object.fromEntries(formData);
  const result = userUpdateSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      error: "Validation failed",
      fieldErrors: result.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: result.data,
    });

    revalidatePath("/users");
    revalidatePath(`/users/${id}`);
    return { success: true, data: { id: user.id } };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}
```

### Route Handler with Zod

```typescript
// app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { userCreateSchema } from "@/schemas/user";
import { paginationSchema } from "@/schemas/api";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  // Parse query params
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const paramsResult = paginationSchema.safeParse(searchParams);

  if (!paramsResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_PARAMS",
          message: "Invalid query parameters",
          details: paramsResult.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const { page, limit, sort, order } = paramsResult.data;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: sort ? { [sort]: order } : { createdAt: "desc" },
    }),
    prisma.user.count(),
  ]);

  return NextResponse.json({
    success: true,
    data: users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const result = userCreateSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request body",
          details: result.error.flatten().fieldErrors,
        },
      },
      { status: 400 }
    );
  }

  const user = await prisma.user.create({
    data: result.data,
  });

  return NextResponse.json(
    { success: true, data: user },
    { status: 201 }
  );
}
```

## Variants

### Discriminated Unions

```typescript
// schemas/events.ts
import { z } from "zod";

const baseEventSchema = z.object({
  id: z.string().uuid(),
  timestamp: z.coerce.date(),
});

const userCreatedSchema = baseEventSchema.extend({
  type: z.literal("user.created"),
  data: z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
  }),
});

const userUpdatedSchema = baseEventSchema.extend({
  type: z.literal("user.updated"),
  data: z.object({
    userId: z.string().uuid(),
    changes: z.record(z.unknown()),
  }),
});

const userDeletedSchema = baseEventSchema.extend({
  type: z.literal("user.deleted"),
  data: z.object({
    userId: z.string().uuid(),
  }),
});

export const eventSchema = z.discriminatedUnion("type", [
  userCreatedSchema,
  userUpdatedSchema,
  userDeletedSchema,
]);

export type Event = z.infer<typeof eventSchema>;
```

### Transform and Preprocess

```typescript
// schemas/transforms.ts
import { z } from "zod";

// Preprocess: transform before validation
const stringToNumber = z.preprocess(
  (val) => (typeof val === "string" ? parseInt(val, 10) : val),
  z.number()
);

// Transform: transform after validation
const currencySchema = z
  .string()
  .transform((val) => parseFloat(val.replace(/[$,]/g, "")));

// Coerce: built-in type coercion
const dateSchema = z.coerce.date(); // Converts strings to Date

// Complex transform
const userInputSchema = z
  .object({
    name: z.string(),
    email: z.string().email(),
  })
  .transform((data) => ({
    ...data,
    name: data.name.trim(),
    email: data.email.toLowerCase(),
    slug: data.name.toLowerCase().replace(/\s+/g, "-"),
  }));
```

## Anti-patterns

1. **Not using safeParse**: Using `parse` without try-catch
2. **Ignoring error details**: Not showing field-level errors to users
3. **Schema duplication**: Not reusing base schemas
4. **Missing default values**: Not providing sensible defaults
5. **Over-validation**: Validating unnecessarily on trusted data

## Related Skills

- `L5/patterns/type-safety` - Type safety fundamentals
- `L5/patterns/form-validation` - Form validation patterns
- `L5/patterns/api-types` - API type contracts
- `L5/patterns/server-actions` - Server action patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with forms and API patterns
