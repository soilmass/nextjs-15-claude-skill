---
id: pt-branded-types
name: Branded Type Patterns
version: 2.0.0
layer: L5
category: typescript
description: Nominal typing patterns using branded types for compile-time safety of IDs, validated strings, and domain primitives
tags: [typescript, branded-types, nominal-typing, domain-driven, type-safety]
composes: []
dependencies: []
formula: "Brand<T, B> = T & { [brand]: B } where brand = unique symbol"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Branded Type Patterns

## Overview

Branded types (also called nominal or tagged types) add compile-time safety by creating distinct types that are structurally identical but semantically different. This prevents mixing up user IDs with post IDs, validated emails with raw strings, etc.

## When to Use

Use branded types when:
- Distinguishing between structurally identical types (UserId vs PostId)
- Ensuring validated data cannot be confused with raw data (Email vs string)
- Implementing domain primitives in domain-driven design
- Creating type-safe identifiers for database entities
- Representing monetary values, percentages, or other domain concepts

## Composition Diagram

```
+------------------+
|   Base Type      |
|   string/number  |
+--------+---------+
         |
         v
+--------+---------+
|   Brand Symbol   |
|   unique symbol  |
+--------+---------+
         |
         v
+--------+---------+
|   Branded Type   |
|   T & { [b]: B } |
+--------+---------+
         |
    +----+----+----+
    |         |    |
    v         v    v
+---+---+ +---+---+ +------+
|UserId | |PostId | |Email |
|Brand  | |Brand  | |Brand |
|string | |string | |string|
+-------+ +-------+ +------+
    |         |         |
    v         v         v
+---+---+---+---+---+---+---+
|    Constructor Function   |
|    createUserId(s) => UserId |
|    (validates + brands)      |
+-----------------------------+

Runtime Validation:
+----------+     +-----------+     +----------+
|Raw Input |---->|Validator  |---->|Branded   |
|string    |     |Zod/Custom |     |Type      |
+----------+     +-----------+     +----------+
```

## Implementation

### Basic Branded Types

```typescript
// types/branded.ts

// Brand symbol for nominal typing
declare const brand: unique symbol;

// Generic branded type
export type Brand<T, B extends string> = T & { [brand]: B };

// Common branded types
export type UserId = Brand<string, "UserId">;
export type PostId = Brand<string, "PostId">;
export type CommentId = Brand<string, "CommentId">;
export type OrderId = Brand<string, "OrderId">;

// Numeric IDs
export type Timestamp = Brand<number, "Timestamp">;
export type Cents = Brand<number, "Cents">;
export type Percentage = Brand<number, "Percentage">;

// Validated strings
export type Email = Brand<string, "Email">;
export type Url = Brand<string, "Url">;
export type Slug = Brand<string, "Slug">;
export type PhoneNumber = Brand<string, "PhoneNumber">;

// Type constructors with validation
export function createUserId(id: string): UserId {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid user ID");
  }
  return id as UserId;
}

export function createPostId(id: string): PostId {
  if (!id || typeof id !== "string") {
    throw new Error("Invalid post ID");
  }
  return id as PostId;
}

// Validated constructors
export function createEmail(value: string): Email {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    throw new Error(`Invalid email: ${value}`);
  }
  return value as Email;
}

export function createUrl(value: string): Url {
  try {
    new URL(value);
    return value as Url;
  } catch {
    throw new Error(`Invalid URL: ${value}`);
  }
}

export function createSlug(value: string): Slug {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slugRegex.test(value)) {
    throw new Error(`Invalid slug: ${value}`);
  }
  return value as Slug;
}

export function createCents(value: number): Cents {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`Invalid cents value: ${value}`);
  }
  return value as Cents;
}

export function createPercentage(value: number): Percentage {
  if (value < 0 || value > 100) {
    throw new Error(`Percentage must be between 0 and 100: ${value}`);
  }
  return value as Percentage;
}
```

### Branded Types with Zod

```typescript
// schemas/branded.ts
import { z } from "zod";
import type { Brand } from "@/types/branded";

// Create branded Zod schemas
export const userIdSchema = z.string().uuid().brand<"UserId">();
export const postIdSchema = z.string().uuid().brand<"PostId">();
export const emailSchema = z.string().email().brand<"Email">();
export const urlSchema = z.string().url().brand<"Url">();
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).brand<"Slug">();

// Infer branded types from Zod schemas
export type UserId = z.infer<typeof userIdSchema>;
export type PostId = z.infer<typeof postIdSchema>;
export type Email = z.infer<typeof emailSchema>;
export type Url = z.infer<typeof urlSchema>;
export type Slug = z.infer<typeof slugSchema>;

// Schema for models
export const userSchema = z.object({
  id: userIdSchema,
  email: emailSchema,
  name: z.string().min(2),
  avatar: urlSchema.nullable(),
});

export const postSchema = z.object({
  id: postIdSchema,
  authorId: userIdSchema,
  title: z.string().min(1),
  slug: slugSchema,
  content: z.string(),
});

export type User = z.infer<typeof userSchema>;
export type Post = z.infer<typeof postSchema>;
```

### Domain Models with Branded Types

```typescript
// domain/user.ts
import type { UserId, Email } from "@/types/branded";
import { createUserId, createEmail } from "@/types/branded";

interface UserProps {
  id: UserId;
  email: Email;
  name: string;
  createdAt: Date;
}

export class User {
  readonly id: UserId;
  readonly email: Email;
  private _name: string;
  readonly createdAt: Date;

  private constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this._name = props.name;
    this.createdAt = props.createdAt;
  }

  get name(): string {
    return this._name;
  }

  // Factory method with validation
  static create(props: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  }): User {
    return new User({
      id: createUserId(props.id),
      email: createEmail(props.email),
      name: props.name,
      createdAt: props.createdAt,
    });
  }

  // Reconstitute from database
  static fromPersistence(data: {
    id: string;
    email: string;
    name: string;
    created_at: Date;
  }): User {
    return new User({
      id: createUserId(data.id),
      email: createEmail(data.email),
      name: data.name,
      createdAt: data.created_at,
    });
  }
}

// domain/post.ts
import type { PostId, UserId, Slug } from "@/types/branded";

interface PostProps {
  id: PostId;
  authorId: UserId;
  title: string;
  slug: Slug;
  content: string;
}

export class Post {
  constructor(private props: PostProps) {}

  get id(): PostId {
    return this.props.id;
  }

  get authorId(): UserId {
    return this.props.authorId;
  }

  // Type-safe: can only be called with a UserId
  isAuthoredBy(userId: UserId): boolean {
    return this.props.authorId === userId;
  }
}
```

### Type-Safe Repository Pattern

```typescript
// repositories/base.ts
import type { Brand } from "@/types/branded";

export interface Repository<T, TId extends Brand<string, string>> {
  findById(id: TId): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(entity: Omit<T, "id">): Promise<T>;
  update(id: TId, data: Partial<T>): Promise<T>;
  delete(id: TId): Promise<void>;
}

// repositories/user.ts
import type { UserId } from "@/types/branded";
import type { User } from "@/domain/user";
import type { Repository } from "./base";
import { prisma } from "@/lib/db";
import { User as UserEntity } from "@/domain/user";

export class UserRepository implements Repository<User, UserId> {
  async findById(id: UserId): Promise<User | null> {
    const data = await prisma.user.findUnique({
      where: { id }, // id is guaranteed to be a valid UserId
    });
    return data ? UserEntity.fromPersistence(data) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const data = await prisma.user.findUnique({
      where: { email },
    });
    return data ? UserEntity.fromPersistence(data) : null;
  }

  async findAll(): Promise<User[]> {
    const data = await prisma.user.findMany();
    return data.map((d) => UserEntity.fromPersistence(d));
  }

  async create(entity: Omit<User, "id">): Promise<User> {
    const data = await prisma.user.create({
      data: {
        email: entity.email,
        name: entity.name,
      },
    });
    return UserEntity.fromPersistence(data);
  }

  async update(id: UserId, data: Partial<User>): Promise<User> {
    const updated = await prisma.user.update({
      where: { id },
      data,
    });
    return UserEntity.fromPersistence(updated);
  }

  async delete(id: UserId): Promise<void> {
    await prisma.user.delete({ where: { id } });
  }
}
```

### API Route with Branded Types

```typescript
// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { userIdSchema } from "@/schemas/branded";
import { UserRepository } from "@/repositories/user";
import type { UserId } from "@/types/branded";

const userRepo = new UserRepository();

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { id } = await context.params;

  // Validate and brand the ID
  const parseResult = userIdSchema.safeParse(id);
  if (!parseResult.success) {
    return NextResponse.json(
      { error: "Invalid user ID format" },
      { status: 400 }
    );
  }

  const userId: UserId = parseResult.data;
  const user = await userRepo.findById(userId);

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: user });
}
```

### Money Type Pattern

```typescript
// domain/money.ts
import type { Cents } from "@/types/branded";
import { createCents } from "@/types/branded";

export class Money {
  private constructor(private readonly cents: Cents) {}

  static fromCents(cents: number): Money {
    return new Money(createCents(cents));
  }

  static fromDollars(dollars: number): Money {
    return new Money(createCents(Math.round(dollars * 100)));
  }

  toCents(): Cents {
    return this.cents;
  }

  toDollars(): number {
    return this.cents / 100;
  }

  add(other: Money): Money {
    return Money.fromCents(this.cents + other.cents);
  }

  subtract(other: Money): Money {
    return Money.fromCents(this.cents - other.cents);
  }

  multiply(factor: number): Money {
    return Money.fromCents(Math.round(this.cents * factor));
  }

  format(currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(this.toDollars());
  }

  isGreaterThan(other: Money): boolean {
    return this.cents > other.cents;
  }

  equals(other: Money): boolean {
    return this.cents === other.cents;
  }
}

// Usage
const price = Money.fromDollars(29.99);
const tax = price.multiply(0.08);
const total = price.add(tax);

console.log(total.format()); // "$32.39"
```

## Variants

### Opaque Types

```typescript
// Alternative approach using opaque types
type Opaque<T, K extends string> = T & { __opaque__: K };

type UserId = Opaque<string, "UserId">;
type PostId = Opaque<string, "PostId">;

// Type guards
function isUserId(value: string): value is UserId {
  // Add any validation logic
  return typeof value === "string" && value.length > 0;
}
```

### Newtype Pattern

```typescript
// Inspired by Haskell's newtype
interface Newtype<URI, A> {
  readonly _URI: URI;
  readonly _A: A;
}

interface UserId extends Newtype<"UserId", string> {}
interface PostId extends Newtype<"PostId", string> {}

// Type-safe operations
function getUserById(id: UserId): Promise<User> {
  // ...
}

function getPostById(id: PostId): Promise<Post> {
  // ...
}
```

## Anti-patterns

1. **Casting without validation**: Using `as` without runtime checks
2. **Exposing raw constructors**: Allow creating invalid branded values
3. **Mixing branded and unbranded**: Inconsistent usage across codebase
4. **Over-branding**: Creating branded types for everything
5. **Ignoring at boundaries**: Not validating at API/database boundaries

## Related Skills

- `L5/patterns/type-safety` - Type safety fundamentals
- `L5/patterns/zod-schemas` - Zod validation integration
- `L5/patterns/domain-modeling` - Domain-driven design
- `L5/patterns/type-guards` - Runtime type narrowing

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Zod integration and domain patterns
