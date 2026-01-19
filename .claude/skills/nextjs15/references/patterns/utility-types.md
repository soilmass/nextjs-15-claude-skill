---
id: pt-utility-types
name: Utility Type Patterns
version: 2.0.0
layer: L5
category: typescript
description: Built-in and custom TypeScript utility types for type transformations and manipulation
tags: [typescript, utility-types, mapped-types, conditional-types, transformations]
composes: []
dependencies: []
formula: "UtilityType<T> = MappedType<T, Transformation> | ConditionalType<T, Check, Result>"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Utility Type Patterns

## Overview

Utility types transform existing types into new ones without duplication. TypeScript provides many built-in utilities, and you can create custom ones for domain-specific needs.

## When to Use

Use utility types when:
- Deriving new types from existing ones without duplication
- Making properties optional, required, or readonly
- Extracting or excluding specific properties from object types
- Transforming function parameter or return types
- Creating type-safe partial updates or patches

## Composition Diagram

```
                    +------------------+
                    |   Base Type T    |
                    +--------+---------+
                             |
        +--------------------+--------------------+
        |                    |                    |
        v                    v                    v
+-------+-------+    +-------+-------+    +-------+-------+
| Mapped Types  |    | Conditional   |    | Inference     |
| Partial<T>    |    | Types         |    | ReturnType<T> |
| Required<T>   |    | Extract<T,U>  |    | Parameters<T> |
| Readonly<T>   |    | Exclude<T,U>  |    | Awaited<T>    |
+---------------+    +---------------+    +---------------+
        |                    |                    |
        +--------------------+--------------------+
                             |
                             v
                    +--------+---------+
                    | Custom Utilities |
                    | DeepPartial<T>   |
                    | PickByValue<T,V> |
                    +------------------+
```

## Implementation

### Built-in Utility Types

```typescript
// types/examples.ts

interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Partial - Make all properties optional
type UserUpdate = Partial<User>;
// { id?: string; email?: string; name?: string; ... }

// Required - Make all properties required
type RequiredUser = Required<User>;
// All properties become required, including avatar

// Readonly - Make all properties readonly
type ReadonlyUser = Readonly<User>;
// { readonly id: string; readonly email: string; ... }

// Pick - Select specific properties
type UserPreview = Pick<User, "id" | "name" | "avatar">;
// { id: string; name: string; avatar: string | null }

// Omit - Remove specific properties
type UserWithoutTimestamps = Omit<User, "createdAt" | "updatedAt">;
// { id: string; email: string; name: string; role: ...; avatar: ... }

// Record - Create object type with specific keys and value type
type UserRoles = Record<string, "user" | "admin">;
// { [key: string]: "user" | "admin" }

type RolePermissions = Record<User["role"], string[]>;
// { user: string[]; admin: string[] }

// Extract - Extract types from union
type Roles = "user" | "admin" | "moderator" | "guest";
type AdminRoles = Extract<Roles, "admin" | "moderator">;
// "admin" | "moderator"

// Exclude - Remove types from union
type NonAdminRoles = Exclude<Roles, "admin">;
// "user" | "moderator" | "guest"

// NonNullable - Remove null and undefined
type Avatar = User["avatar"]; // string | null
type RequiredAvatar = NonNullable<Avatar>; // string

// ReturnType - Get function return type
function getUser() {
  return { id: "1", name: "John" };
}
type GetUserReturn = ReturnType<typeof getUser>;
// { id: string; name: string }

// Parameters - Get function parameter types
function createUser(name: string, email: string, role: "user" | "admin") {
  return { name, email, role };
}
type CreateUserParams = Parameters<typeof createUser>;
// [name: string, email: string, role: "user" | "admin"]

// Awaited - Unwrap Promise type
async function fetchUser() {
  return { id: "1", name: "John" };
}
type FetchedUser = Awaited<ReturnType<typeof fetchUser>>;
// { id: string; name: string }
```

### Custom Utility Types

```typescript
// types/custom-utilities.ts

// Deep Partial - Make all nested properties optional
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

interface Settings {
  user: {
    name: string;
    preferences: {
      theme: "light" | "dark";
      notifications: boolean;
    };
  };
}

type PartialSettings = DeepPartial<Settings>;
// All nested properties are optional

// Deep Required - Make all nested properties required
type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T;

// Deep Readonly - Make all nested properties readonly
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

// Nullable - Make type nullable
type Nullable<T> = T | null;

// NonNullableDeep - Remove null/undefined from all nested properties
type NonNullableDeep<T> = T extends object
  ? { [P in keyof T]: NonNullableDeep<NonNullable<T[P]>> }
  : NonNullable<T>;

// PartialBy - Make specific properties optional
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

type UserWithOptionalAvatar = PartialBy<User, "avatar">;

// RequiredBy - Make specific properties required
type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

type UserWithRequiredAvatar = RequiredBy<User, "avatar">;

// Mutable - Remove readonly from all properties
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// PickByValue - Pick properties by value type
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type StringProperties = PickByValue<User, string>;
// { id: string; email: string; name: string }

// OmitByValue - Omit properties by value type
type OmitByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K];
};

type NonStringProperties = OmitByValue<User, string>;
// { role: "user" | "admin"; avatar: string | null; createdAt: Date; updatedAt: Date }
```

### Function Utility Types

```typescript
// types/function-utilities.ts

// AsyncReturnType - Get return type of async function
type AsyncReturnType<T extends (...args: unknown[]) => Promise<unknown>> =
  T extends (...args: unknown[]) => Promise<infer R> ? R : never;

async function fetchUsers() {
  return [{ id: "1", name: "John" }];
}

type Users = AsyncReturnType<typeof fetchUsers>;
// { id: string; name: string }[]

// FirstParameter - Get first parameter type
type FirstParameter<T extends (...args: unknown[]) => unknown> =
  T extends (first: infer F, ...rest: unknown[]) => unknown ? F : never;

function greet(name: string, age: number) {}
type NameParam = FirstParameter<typeof greet>; // string

// LastParameter - Get last parameter type
type LastParameter<T extends (...args: unknown[]) => unknown> =
  T extends (...args: [...infer _, infer L]) => unknown ? L : never;

type AgeParam = LastParameter<typeof greet>; // number

// PromiseType - Extract type from Promise
type PromiseType<T> = T extends Promise<infer U> ? U : T;

type ResolvedType = PromiseType<Promise<string>>; // string

// Promisify - Wrap return type in Promise
type Promisify<T extends (...args: unknown[]) => unknown> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;
```

### Object Utility Types

```typescript
// types/object-utilities.ts

// KeysOfType - Get keys that have a specific value type
type KeysOfType<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];

type StringKeys = KeysOfType<User, string>;
// "id" | "email" | "name"

// ValuesOf - Get union of all value types
type ValuesOf<T> = T[keyof T];

const STATUS = {
  PENDING: "pending",
  ACTIVE: "active",
  DELETED: "deleted",
} as const;

type StatusValue = ValuesOf<typeof STATUS>;
// "pending" | "active" | "deleted"

// Merge - Merge two object types (second overwrites first)
type Merge<T, U> = Omit<T, keyof U> & U;

type Base = { id: string; name: string; version: number };
type Override = { name: string; description: string };
type Merged = Merge<Base, Override>;
// { id: string; name: string; version: number; description: string }

// OptionalKeys - Get keys of optional properties
type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

interface Config {
  required: string;
  optional?: number;
}

type OptKeys = OptionalKeys<Config>; // "optional"

// RequiredKeys - Get keys of required properties
type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

type ReqKeys = RequiredKeys<Config>; // "required"

// FlattenObject - Flatten nested object type
type FlattenObject<T extends object, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends object
    ? FlattenObject<T[K], `${Prefix}${K}.`>
    : { [P in `${Prefix}${K}`]: T[K] };
}[keyof T & string];

// UnionToIntersection - Convert union to intersection
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

type Union = { a: string } | { b: number };
type Intersection = UnionToIntersection<Union>;
// { a: string } & { b: number }
```

### Array Utility Types

```typescript
// types/array-utilities.ts

// ArrayElement - Get element type from array
type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

const users = [{ id: "1" }, { id: "2" }] as const;
type UserElement = ArrayElement<typeof users>;
// { readonly id: "1" } | { readonly id: "2" }

// Head - Get first element type
type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]]
  ? H
  : never;

type First = Head<[string, number, boolean]>; // string

// Tail - Get all but first element
type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer R]
  ? R
  : never;

type Rest = Tail<[string, number, boolean]>; // [number, boolean]

// Last - Get last element type
type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L]
  ? L
  : never;

type LastElement = Last<[string, number, boolean]>; // boolean

// Length - Get tuple length as literal type
type Length<T extends readonly unknown[]> = T["length"];

type Len = Length<[1, 2, 3]>; // 3

// Concat - Concatenate two tuples
type Concat<T extends readonly unknown[], U extends readonly unknown[]> = [...T, ...U];

type Combined = Concat<[1, 2], [3, 4]>; // [1, 2, 3, 4]

// Push - Add element to end of tuple
type Push<T extends readonly unknown[], V> = [...T, V];

type Pushed = Push<[1, 2], 3>; // [1, 2, 3]

// Unshift - Add element to start of tuple
type Unshift<T extends readonly unknown[], V> = [V, ...T];

type Unshifted = Unshift<[1, 2], 0>; // [0, 1, 2]
```

### React-Specific Utility Types

```typescript
// types/react-utilities.ts
import type { ComponentProps, ComponentType, ReactNode } from "react";

// PropsOf - Get props type from component
type PropsOf<T extends ComponentType<unknown>> = ComponentProps<T>;

import { Button } from "@/components/ui/button";
type ButtonProps = PropsOf<typeof Button>;

// PropsWithChildren - Add children prop
type PropsWithChildren<P = unknown> = P & { children?: ReactNode };

// PropsWithClassName - Add className prop
type PropsWithClassName<P = unknown> = P & { className?: string };

// PropsWithAs - Add polymorphic 'as' prop
type PropsWithAs<P, T extends React.ElementType> = P & {
  as?: T;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof P | "as">;

// ExtractRef - Get ref type from component
type ExtractRef<T> = T extends React.ForwardRefExoticComponent<
  React.RefAttributes<infer R>
>
  ? R
  : never;

// InferEventHandler - Get event handler parameter type
type InferEventHandler<T> = T extends (event: infer E) => void ? E : never;

type ClickEvent = InferEventHandler<React.MouseEventHandler<HTMLButtonElement>>;
// React.MouseEvent<HTMLButtonElement>
```

## Variants

### Conditional Utility Types

```typescript
// Conditional type based on property existence
type HasProperty<T, K extends string> = K extends keyof T ? true : false;

type HasId = HasProperty<User, "id">; // true
type HasFoo = HasProperty<User, "foo">; // false

// If-Then-Else type
type If<C extends boolean, T, F> = C extends true ? T : F;

type Result = If<true, string, number>; // string
```

## Anti-patterns

1. **Over-engineering**: Creating complex utility types for simple cases
2. **Poor naming**: Unclear utility type names
3. **No JSDoc**: Missing documentation for custom utilities
4. **Circular dependencies**: Utility types referencing each other cyclically
5. **Performance issues**: Deeply nested conditional types causing slow compilation

## Related Skills

- `L5/patterns/type-safety` - Type safety fundamentals
- `L5/patterns/generics` - Generic type patterns
- `L5/patterns/inference` - Type inference patterns
- `L5/patterns/component-props` - Component prop types

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with React-specific utilities
