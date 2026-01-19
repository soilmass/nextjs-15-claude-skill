---
id: pt-conditional-types
name: Conditional Types
version: 2.0.0
layer: L5
category: typescript
description: TypeScript conditional types for building flexible type-safe APIs
tags: [typescript, types, conditional, generics, inference, utility-types]
composes: []
dependencies: []
formula: "T extends U ? X : Y (distributes over unions when T is naked type parameter)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Conditional Types

## Overview

Conditional types enable types that depend on other types, similar to ternary expressions in JavaScript. They are fundamental for building flexible, type-safe APIs that adapt their types based on input. Essential for library authors and complex application architectures.

## When to Use

Use this skill when:
- Building generic utilities that change return types based on input
- Creating type-safe API wrappers with varying responses
- Implementing polymorphic components
- Filtering or transforming union types
- Building conditional props in React components

## Composition Diagram

```
+------------------+
|   Input Type T   |
+--------+---------+
         |
         v
+--------+---------+
|   Condition      |
|   T extends U ?  |
+--------+---------+
         |
    +----+----+
    |         |
    v         v
+---+---+ +---+---+
| True  | | False |
| X     | | Y     |
+---+---+ +---+---+
    |         |
    +----+----+
         |
         v
+--------+---------+
|   Result Type    |
+------------------+

Inference Pattern:
+-------------+     +-------------+     +-------------+
| T extends   |---->| infer R     |---->| Use R in    |
| Promise<?>  |     | (capture)   |     | result type |
+-------------+     +-------------+     +-------------+

Distribution:
+-------------+
| A | B | C   |  (Union input)
+------+------+
       |
       v (distributes)
+------+------+------+
| F<A> | F<B> | F<C> |  (Union output)
+------+------+------+
```

## Implementation

```typescript
// lib/types/conditional.ts

// Basic conditional type syntax
// T extends U ? X : Y
// If T is assignable to U, result is X, otherwise Y

// ============================================
// Extracting Types
// ============================================

/**
 * Extract array element type
 */
type ArrayElement<T> = T extends (infer E)[] ? E : never;

// Usage
type StringArray = string[];
type Element = ArrayElement<StringArray>; // string

/**
 * Extract promise resolved type
 */
type Awaited<T> = T extends Promise<infer R> ? Awaited<R> : T;

// Usage
type NestedPromise = Promise<Promise<string>>;
type Resolved = Awaited<NestedPromise>; // string

/**
 * Extract function return type (built-in as ReturnType)
 */
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

/**
 * Extract function parameters (built-in as Parameters)
 */
type MyParameters<T> = T extends (...args: infer P) => any ? P : never;

/**
 * Extract first argument type
 */
type FirstArgument<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;

// ============================================
// Filtering Union Types
// ============================================

/**
 * Extract types from union that are assignable to U
 */
type ExtractByType<T, U> = T extends U ? T : never;

// Usage
type Mixed = string | number | boolean | null;
type OnlyStrings = ExtractByType<Mixed, string>; // string
type Primitives = ExtractByType<Mixed, string | number>; // string | number

/**
 * Exclude types from union that are assignable to U
 */
type ExcludeByType<T, U> = T extends U ? never : T;

// Usage
type NonNullable = ExcludeByType<Mixed, null>; // string | number | boolean

/**
 * Extract object types with specific property
 */
type HasProperty<T, K extends string> = T extends { [P in K]: any } ? T : never;

// Usage
type Objects = { id: number } | { name: string } | { id: number; name: string };
type WithId = HasProperty<Objects, 'id'>; // { id: number } | { id: number; name: string }

// ============================================
// Conditional Props Patterns
// ============================================

/**
 * Props that change based on a discriminant
 */
type ButtonProps = 
  | { variant: 'link'; href: string; onClick?: never }
  | { variant: 'button'; href?: never; onClick: () => void }
  | { variant: 'submit'; href?: never; onClick?: never };

/**
 * Conditional required props
 */
type ConditionalRequired<T, K extends keyof T, Condition extends boolean> = 
  Condition extends true
    ? T & Required<Pick<T, K>>
    : T;

// ============================================
// API Response Types
// ============================================

/**
 * API response that varies based on success
 */
type ApiResponse<T, E = Error> = 
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

/**
 * Paginated response wrapper
 */
type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
};

/**
 * Conditional pagination based on flag
 */
type MaybePageinated<T, Paginate extends boolean> = 
  Paginate extends true ? PaginatedResponse<T> : T[];

// Usage
async function fetchUsers<P extends boolean>(
  paginate: P
): Promise<MaybePageinated<User, P>> {
  // Implementation
  return {} as any;
}

const users = await fetchUsers(false); // User[]
const paginatedUsers = await fetchUsers(true); // PaginatedResponse<User>

// ============================================
// Recursive Conditional Types
// ============================================

/**
 * Deep partial - make all nested properties optional
 */
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Deep required - make all nested properties required
 */
type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T;

/**
 * Deep readonly
 */
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

/**
 * Flatten nested object paths
 */
type FlattenObject<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T as T[K] extends object
        ? never
        : Prefix extends ''
        ? K & string
        : `${Prefix}.${K & string}`]: T[K];
    } & UnionToIntersection<
      {
        [K in keyof T]: T[K] extends object
          ? FlattenObject<T[K], Prefix extends '' ? K & string : `${Prefix}.${K & string}`>
          : never;
      }[keyof T]
    >
  : never;

// Helper for union to intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

// ============================================
// Type Guards and Narrowing
// ============================================

/**
 * Type predicate helper
 */
type TypeGuard<T> = (value: unknown) => value is T;

/**
 * Create type guard for discriminated unions
 */
function createTypeGuard<T, K extends keyof T>(
  key: K,
  value: T[K]
): TypeGuard<T> {
  return (obj: unknown): obj is T => {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      key in obj &&
      (obj as T)[key] === value
    );
  };
}

// Usage
interface Dog { type: 'dog'; bark: () => void }
interface Cat { type: 'cat'; meow: () => void }
type Animal = Dog | Cat;

const isDog = createTypeGuard<Dog, 'type'>('type', 'dog');

function handleAnimal(animal: Animal) {
  if (isDog(animal)) {
    animal.bark(); // TypeScript knows this is Dog
  }
}
```

### Key Implementation Notes

1. **Distributive Conditionals**: Conditional types distribute over unions automatically when the checked type is a naked type parameter
2. **Inference with `infer`**: The `infer` keyword allows extracting types from within other types during conditional checks

## Variants

### Component Props Patterns

```tsx
// components/polymorphic-button.tsx
'use client';

import * as React from 'react';

/**
 * Polymorphic component that can render as different elements
 */
type AsProp<C extends React.ElementType> = {
  as?: C;
};

type PropsToOmit<C extends React.ElementType, P> = keyof (AsProp<C> & P);

type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<Props & AsProp<C>> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>;

type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>['ref'];

type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProps<C, Props> & { ref?: PolymorphicRef<C> };

// Button component implementation
interface ButtonOwnProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

type ButtonProps<C extends React.ElementType = 'button'> =
  PolymorphicComponentPropsWithRef<C, ButtonOwnProps>;

type ButtonComponent = <C extends React.ElementType = 'button'>(
  props: ButtonProps<C>
) => React.ReactElement | null;

export const Button: ButtonComponent = React.forwardRef(
  <C extends React.ElementType = 'button'>(
    { as, variant = 'primary', size = 'md', children, ...props }: ButtonProps<C>,
    ref?: PolymorphicRef<C>
  ) => {
    const Component = as || 'button';
    
    return (
      <Component
        ref={ref}
        className={`btn btn-${variant} btn-${size}`}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

// Usage - TypeScript knows correct props for each element
<Button>Click me</Button>                    // renders <button>
<Button as="a" href="/about">Link</Button>   // renders <a>
<Button as={Link} to="/home">Nav</Button>    // renders custom component
```

### Form Field Conditional Types

```typescript
// lib/types/form-fields.ts

/**
 * Field config that changes based on field type
 */
type FieldType = 'text' | 'number' | 'select' | 'checkbox' | 'date';

type BaseFieldConfig = {
  name: string;
  label: string;
  required?: boolean;
};

type TextFieldConfig = BaseFieldConfig & {
  type: 'text';
  minLength?: number;
  maxLength?: number;
  pattern?: string;
};

type NumberFieldConfig = BaseFieldConfig & {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
};

type SelectFieldConfig = BaseFieldConfig & {
  type: 'select';
  options: { label: string; value: string }[];
  multiple?: boolean;
};

type CheckboxFieldConfig = BaseFieldConfig & {
  type: 'checkbox';
  defaultChecked?: boolean;
};

type DateFieldConfig = BaseFieldConfig & {
  type: 'date';
  minDate?: Date;
  maxDate?: Date;
};

/**
 * Union of all field configs
 */
type FieldConfig = 
  | TextFieldConfig 
  | NumberFieldConfig 
  | SelectFieldConfig 
  | CheckboxFieldConfig 
  | DateFieldConfig;

/**
 * Extract config type by field type
 */
type FieldConfigByType<T extends FieldType> = Extract<FieldConfig, { type: T }>;

/**
 * Get value type based on field type
 */
type FieldValue<T extends FieldType> = 
  T extends 'text' ? string :
  T extends 'number' ? number :
  T extends 'select' ? string | string[] :
  T extends 'checkbox' ? boolean :
  T extends 'date' ? Date :
  never;

/**
 * Type-safe field creator
 */
function createField<T extends FieldType>(
  type: T,
  config: Omit<FieldConfigByType<T>, 'type'>
): FieldConfigByType<T> {
  return { type, ...config } as FieldConfigByType<T>;
}

// Usage - TypeScript enforces correct config shape
const textField = createField('text', {
  name: 'username',
  label: 'Username',
  minLength: 3,
  maxLength: 20,
});

const selectField = createField('select', {
  name: 'country',
  label: 'Country',
  options: [
    { label: 'USA', value: 'us' },
    { label: 'Canada', value: 'ca' },
  ],
});
```

### API Client with Conditional Response Types

```typescript
// lib/api/client.ts

interface Endpoints {
  '/users': {
    GET: { response: User[]; params: { limit?: number } };
    POST: { response: User; body: CreateUserInput };
  };
  '/users/:id': {
    GET: { response: User; params: { id: string } };
    PUT: { response: User; params: { id: string }; body: UpdateUserInput };
    DELETE: { response: void; params: { id: string } };
  };
  '/posts': {
    GET: { response: Post[]; params: { userId?: string } };
    POST: { response: Post; body: CreatePostInput };
  };
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Extract response type for endpoint and method
 */
type ResponseType<
  Path extends keyof Endpoints,
  Method extends keyof Endpoints[Path]
> = Endpoints[Path][Method] extends { response: infer R } ? R : never;

/**
 * Extract body type if exists
 */
type BodyType<
  Path extends keyof Endpoints,
  Method extends keyof Endpoints[Path]
> = Endpoints[Path][Method] extends { body: infer B } ? B : never;

/**
 * Extract params type
 */
type ParamsType<
  Path extends keyof Endpoints,
  Method extends keyof Endpoints[Path]
> = Endpoints[Path][Method] extends { params: infer P } ? P : never;

/**
 * Build request options conditionally
 */
type RequestOptions<
  Path extends keyof Endpoints,
  Method extends keyof Endpoints[Path]
> = {
  params?: ParamsType<Path, Method>;
} & (BodyType<Path, Method> extends never
  ? {}
  : { body: BodyType<Path, Method> });

/**
 * Type-safe API client
 */
class ApiClient {
  async request<
    Path extends keyof Endpoints,
    Method extends keyof Endpoints[Path] & HttpMethod
  >(
    path: Path,
    method: Method,
    options?: RequestOptions<Path, Method>
  ): Promise<ResponseType<Path, Method>> {
    // Implementation
    const response = await fetch(path, {
      method,
      body: (options as any)?.body ? JSON.stringify((options as any).body) : undefined,
    });
    return response.json();
  }
}

// Usage - fully typed
const client = new ApiClient();

// GET /users - returns User[]
const users = await client.request('/users', 'GET');

// POST /users - requires body, returns User
const newUser = await client.request('/users', 'POST', {
  body: { name: 'John', email: 'john@example.com' },
});

// DELETE /users/:id - returns void
await client.request('/users/:id', 'DELETE', {
  params: { id: '123' },
});
```

## Anti-patterns

### Overly Complex Conditional Types

```typescript
// Bad - Too complex, hard to debug
type ComplexType<T, U, V, W> = 
  T extends U 
    ? V extends W 
      ? T extends V 
        ? U extends W 
          ? SomeType<T, U, V, W>
          : OtherType<T, U>
        : AnotherType<V, W>
      : DefaultType<T>
    : never;

// Good - Break into smaller, named types
type IsAssignable<T, U> = T extends U ? true : false;
type FirstCondition<T, U> = IsAssignable<T, U>;
type SecondCondition<V, W> = IsAssignable<V, W>;

type SimplerType<T, U, V, W> = 
  FirstCondition<T, U> extends true
    ? SecondCondition<V, W> extends true
      ? ResultType<T, V>
      : FallbackType<T>
    : never;
```

### Not Using Built-in Utility Types

```typescript
// Bad - Reimplementing built-in types
type MyPick<T, K> = {
  [P in keyof T as P extends K ? P : never]: T[P];
};

// Good - Use built-in utility types
type UserName = Pick<User, 'firstName' | 'lastName'>;
type OptionalUser = Partial<User>;
type RequiredUser = Required<User>;
type ReadonlyUser = Readonly<User>;
```

## Related Skills

### Composes From
- [generics](./generics.md) - Generic type parameters
- [mapped-types](./mapped-types.md) - Mapped type transformations

### Composes Into
- [discriminated-unions](./discriminated-unions.md) - Type-safe unions
- [template-literals](./template-literals.md) - String type manipulation

### Alternatives
- Function overloads - For simpler cases with few variations
- Type assertions - When types can't be inferred (use sparingly)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with common patterns
- API client examples
- Component polymorphism patterns
