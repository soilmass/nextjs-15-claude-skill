---
id: pt-type-guards
name: Type Guard Patterns
version: 2.0.0
layer: L5
category: typescript
description: Runtime type narrowing with custom type guards, assertion functions, and discriminated unions
tags: [typescript, type-guards, narrowing, assertions, runtime-checks]
composes: []
dependencies: []
formula: "function isType(value: unknown): value is T { return runtimeCheck(value) }"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Type Guard Patterns

## Overview

Type guards enable TypeScript to narrow types at runtime, providing type safety for dynamic data. This covers built-in narrowing, custom type guards, and assertion functions.

## When to Use

Use type guards when:
- Validating unknown data from APIs or external sources
- Narrowing union types to specific members
- Implementing runtime type checking for dynamic data
- Creating assertion functions that throw on invalid data
- Building type-safe error handling with discriminated unions

## Composition Diagram

```
+------------------+
|   Unknown Input  |
|   (API, User)    |
+--------+---------+
         |
         v
+--------+---------+
|   Type Guard     |
|   isType(value)  |
|   value is T     |
+--------+---------+
         |
    +----+----+
    |         |
    v         v
+---+---+ +---+---+
| true  | | false |
| T     | | other |
+-------+ +-------+
    |
    v
+---+---+---+---+
|   Narrowed    |
|   Type T      |
|   (safe use)  |
+---------------+

Types of Guards:
+-------------+  +-------------+  +-------------+
| typeof      |  | instanceof  |  | in operator |
| primitives  |  | classes     |  | properties  |
+-------------+  +-------------+  +-------------+
       |                |                |
       +----------------+----------------+
                        |
                        v
              +---------+---------+
              | Custom Type Guard |
              | (x): x is T       |
              +-------------------+
```

## Implementation

### Basic Type Guards

```typescript
// lib/type-guards.ts

// typeof guards (built-in)
function processValue(value: string | number | boolean) {
  if (typeof value === "string") {
    // TypeScript knows value is string here
    return value.toUpperCase();
  }
  if (typeof value === "number") {
    // TypeScript knows value is number here
    return value.toFixed(2);
  }
  // TypeScript knows value is boolean here
  return value ? "yes" : "no";
}

// instanceof guards (built-in)
function handleError(error: unknown) {
  if (error instanceof Error) {
    // TypeScript knows error is Error here
    return { message: error.message, stack: error.stack };
  }
  if (error instanceof TypeError) {
    // More specific error type
    return { message: error.message, type: "TypeError" };
  }
  return { message: String(error) };
}

// in operator guards
interface Bird {
  fly(): void;
  layEggs(): void;
}

interface Fish {
  swim(): void;
  layEggs(): void;
}

function move(animal: Bird | Fish) {
  if ("fly" in animal) {
    // TypeScript knows animal is Bird
    animal.fly();
  } else {
    // TypeScript knows animal is Fish
    animal.swim();
  }
}

// Array.isArray guard
function processItems(value: string | string[]) {
  if (Array.isArray(value)) {
    // TypeScript knows value is string[]
    return value.join(", ");
  }
  // TypeScript knows value is string
  return value;
}
```

### Custom Type Guard Functions

```typescript
// lib/guards.ts

// Custom type guard with `is` keyword
function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && !isNaN(value);
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNull(value: unknown): value is null {
  return value === null;
}

function isUndefined(value: unknown): value is undefined {
  return value === undefined;
}

function isNullOrUndefined(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isArray<T>(value: unknown): value is T[] {
  return Array.isArray(value);
}

function isFunction(value: unknown): value is Function {
  return typeof value === "function";
}

// Usage
function processInput(input: unknown) {
  if (isString(input)) {
    return input.trim(); // TypeScript knows input is string
  }
  if (isNumber(input)) {
    return input.toFixed(2); // TypeScript knows input is number
  }
  if (isArray<string>(input)) {
    return input.join(", "); // TypeScript knows input is string[]
  }
  return String(input);
}
```

### Object Shape Guards

```typescript
// lib/object-guards.ts

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
}

interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
}

// Type guard for User
function isUser(value: unknown): value is User {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.name === "string" &&
    (value.role === "user" || value.role === "admin")
  );
}

// Type guard for Post
function isPost(value: unknown): value is Post {
  return (
    isObject(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.content === "string" &&
    typeof value.authorId === "string"
  );
}

// Generic property check guard
function hasProperty<K extends string>(
  obj: unknown,
  key: K
): obj is { [P in K]: unknown } {
  return isObject(obj) && key in obj;
}

// Usage
function processData(data: unknown) {
  if (hasProperty(data, "id") && hasProperty(data, "email")) {
    // TypeScript knows data has id and email properties
    console.log(data.id, data.email);
  }
}

// Guard with specific property type
function hasStringProperty<K extends string>(
  obj: unknown,
  key: K
): obj is { [P in K]: string } {
  return isObject(obj) && key in obj && typeof obj[key] === "string";
}
```

### Discriminated Union Guards

```typescript
// types/events.ts

// Discriminated union with type property
type AppEvent =
  | { type: "user.created"; userId: string; email: string }
  | { type: "user.updated"; userId: string; changes: Record<string, unknown> }
  | { type: "user.deleted"; userId: string }
  | { type: "post.created"; postId: string; authorId: string }
  | { type: "post.published"; postId: string };

// Type guard for specific event type
function isUserCreatedEvent(
  event: AppEvent
): event is Extract<AppEvent, { type: "user.created" }> {
  return event.type === "user.created";
}

function isUserEvent(
  event: AppEvent
): event is Extract<AppEvent, { type: `user.${string}` }> {
  return event.type.startsWith("user.");
}

function isPostEvent(
  event: AppEvent
): event is Extract<AppEvent, { type: `post.${string}` }> {
  return event.type.startsWith("post.");
}

// Event handler with narrowing
function handleEvent(event: AppEvent) {
  switch (event.type) {
    case "user.created":
      // TypeScript knows event has userId and email
      console.log(`User ${event.userId} created with email ${event.email}`);
      break;
    case "user.updated":
      // TypeScript knows event has userId and changes
      console.log(`User ${event.userId} updated:`, event.changes);
      break;
    case "user.deleted":
      // TypeScript knows event has userId
      console.log(`User ${event.userId} deleted`);
      break;
    case "post.created":
      // TypeScript knows event has postId and authorId
      console.log(`Post ${event.postId} created by ${event.authorId}`);
      break;
    case "post.published":
      // TypeScript knows event has postId
      console.log(`Post ${event.postId} published`);
      break;
    default:
      // Exhaustive check - TypeScript errors if a case is missed
      const _exhaustive: never = event;
      throw new Error(`Unknown event type: ${_exhaustive}`);
  }
}
```

### Assertion Functions

```typescript
// lib/assertions.ts

// Assertion function - throws if condition is false
function assert(condition: unknown, message?: string): asserts condition {
  if (!condition) {
    throw new Error(message ?? "Assertion failed");
  }
}

// Assert defined - throws if null or undefined
function assertDefined<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message ?? "Value is not defined");
  }
}

// Assert string
function assertString(value: unknown, message?: string): asserts value is string {
  if (typeof value !== "string") {
    throw new Error(message ?? `Expected string, got ${typeof value}`);
  }
}

// Assert number
function assertNumber(value: unknown, message?: string): asserts value is number {
  if (typeof value !== "number" || isNaN(value)) {
    throw new Error(message ?? `Expected number, got ${typeof value}`);
  }
}

// Assert object shape
function assertUser(value: unknown): asserts value is User {
  if (!isUser(value)) {
    throw new Error("Value is not a valid User object");
  }
}

// Assert never (exhaustive checks)
function assertNever(value: never, message?: string): never {
  throw new Error(message ?? `Unexpected value: ${JSON.stringify(value)}`);
}

// Usage in async function
async function getUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  
  assertUser(data); // Throws if data is not a valid User
  
  return data; // TypeScript knows data is User
}

// Usage with null checks
async function getUserName(id: string): Promise<string> {
  const user = await prisma.user.findUnique({ where: { id } });
  
  assertDefined(user, `User ${id} not found`);
  
  return user.name; // TypeScript knows user is not null
}
```

### API Response Guards

```typescript
// lib/api-guards.ts
import { z } from "zod";

// Define response shapes
interface SuccessResponse<T> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Type guard for success response
function isSuccessResponse<T>(
  response: ApiResponse<T>
): response is SuccessResponse<T> {
  return response.success === true;
}

// Type guard for error response
function isErrorResponse<T>(
  response: ApiResponse<T>
): response is ErrorResponse {
  return response.success === false;
}

// Usage
async function fetchUser(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const result: ApiResponse<User> = await response.json();

  if (isErrorResponse(result)) {
    throw new Error(result.error.message);
  }

  // TypeScript knows result is SuccessResponse<User>
  return result.data;
}

// Guard with Zod validation
function createSchemaGuard<T>(schema: z.Schema<T>) {
  return (value: unknown): value is T => {
    return schema.safeParse(value).success;
  };
}

const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
});

const isValidUser = createSchemaGuard(userSchema);

// Usage
function processApiData(data: unknown) {
  if (isValidUser(data)) {
    // TypeScript knows data matches userSchema
    console.log(data.email);
  }
}
```

### React Component Guards

```typescript
// components/conditional-render.tsx
import { ReactNode, isValidElement, Children } from "react";

// Check if children contain specific element type
function hasChildOfType(
  children: ReactNode,
  type: React.ElementType
): boolean {
  let found = false;
  Children.forEach(children, (child) => {
    if (isValidElement(child) && child.type === type) {
      found = true;
    }
  });
  return found;
}

// Type guard for checking if value is a valid React element
function isReactElement(value: unknown): value is React.ReactElement {
  return isValidElement(value);
}

// Guard for checking component props
interface WithLoadingProps {
  isLoading: boolean;
}

function hasLoadingProp(
  props: Record<string, unknown>
): props is WithLoadingProps & Record<string, unknown> {
  return "isLoading" in props && typeof props.isLoading === "boolean";
}
```

## Variants

### Narrowing with Filter

```typescript
// Filter with type guard narrows array type
const mixedArray: (string | number | null)[] = ["a", 1, null, "b", 2];

// Filter nulls
const nonNull = mixedArray.filter((item): item is string | number => item !== null);
// Type: (string | number)[]

// Filter to specific type
const strings = mixedArray.filter((item): item is string => typeof item === "string");
// Type: string[]

const numbers = mixedArray.filter((item): item is number => typeof item === "number");
// Type: number[]
```

### Generic Type Guards

```typescript
// Generic guard factory
function createTypeGuard<T>(
  check: (value: unknown) => boolean
): (value: unknown) => value is T {
  return (value: unknown): value is T => check(value);
}

const isPositiveNumber = createTypeGuard<number>(
  (v) => typeof v === "number" && v > 0
);
```

## Anti-patterns

1. **Type assertions over guards**: Using `as` instead of proper narrowing
2. **Incomplete checks**: Not validating all properties in object guards
3. **Missing assertion messages**: Not providing helpful error messages
4. **Over-relying on runtime checks**: Excessive guards hurt performance
5. **Not using discriminated unions**: Manual checks instead of type property

## Related Skills

- `L5/patterns/type-safety` - Type safety fundamentals
- `L5/patterns/zod-schemas` - Runtime validation with Zod
- `L5/patterns/error-handling` - Error handling patterns
- `L5/patterns/api-types` - API type contracts

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with assertion functions and API guards
