---
id: pt-template-literals
name: Template Literals
version: 2.0.0
layer: L5
category: typescript
description: Use TypeScript template literal types for type-safe strings
tags: [typescript, template, literals]
composes: []
dependencies: []
formula: "type Route = `/${Segment}/${Param}` | `${Prefix}${Capitalize<Key>}`"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Template Literal Types Pattern

## Overview

Template literal types allow creating new string types by combining literal types with template strings. This pattern covers using them for route types, CSS utilities, and API endpoints in Next.js 15.

## When to Use

Use template literal types when:
- Creating type-safe route paths and API endpoints
- Building CSS utility class types (Tailwind-style)
- Defining event handler prop names (onClick, onSubmit)
- Implementing translation key types for i18n
- Creating database column naming conventions

## Composition Diagram

```
+------------------+     +------------------+
|   Literal Types  |     |   String Manip   |
|   'a' | 'b'      |     |   Uppercase      |
+--------+---------+     |   Capitalize     |
         |               +--------+---------+
         |                        |
         +------------+-----------+
                      |
                      v
             +--------+---------+
             | Template Literal |
             | `${A}-${B}`      |
             +--------+---------+
                      |
         +------------+------------+
         |            |            |
         v            v            v
    +----+----+  +----+----+  +----+----+
    |'a-x'    |  |'a-y'    |  |'b-x'    |
    |(union)  |  |(union)  |  |(union)  |
    +---------+  +---------+  +---------+

Inference Pattern:
+------------------+     +------------------+
| `/users/:id`     |---->| Extract ':id'    |
| (template)       |     | infer Param      |
+------------------+     +------------------+
```

## Implementation

### Route Path Types

```typescript
// lib/types/routes.ts

// Base route segments
type RouteSegment = 'dashboard' | 'users' | 'settings' | 'posts' | 'api';
type DynamicSegment = `[${string}]`;

// Route paths
type Route = 
  | '/'
  | `/${RouteSegment}`
  | `/${RouteSegment}/${string}`;

// API routes with methods
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
type ApiRoute = `/api/${string}`;
type ApiEndpoint = `${HttpMethod} ${ApiRoute}`;

// Usage
const endpoint: ApiEndpoint = 'GET /api/users';
const route: Route = '/dashboard';

// Type-safe route builder
function buildRoute<T extends string>(
  base: T,
  ...segments: string[]
): `/${T}${string}` {
  return `/${base}/${segments.join('/')}` as `/${T}${string}`;
}

const userRoute = buildRoute('users', '123'); // '/users/123'
```

### CSS Utility Types

```typescript
// lib/types/css.ts

// Spacing scale
type SpacingScale = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24;
type SpacingDirection = 't' | 'b' | 'l' | 'r' | 'x' | 'y' | '';

// Padding/Margin utilities
type PaddingClass = `p${SpacingDirection}-${SpacingScale}`;
type MarginClass = `m${SpacingDirection}-${SpacingScale}`;

// Color utilities
type ColorName = 'red' | 'blue' | 'green' | 'gray' | 'yellow' | 'purple';
type ColorShade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
type ColorClass = `${ColorName}-${ColorShade}`;

type TextColorClass = `text-${ColorClass}`;
type BgColorClass = `bg-${ColorClass}`;
type BorderColorClass = `border-${ColorClass}`;

// Flex utilities
type FlexDirection = 'row' | 'col' | 'row-reverse' | 'col-reverse';
type FlexClass = `flex-${FlexDirection}`;

type JustifyContent = 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
type JustifyClass = `justify-${JustifyContent}`;

type AlignItems = 'start' | 'end' | 'center' | 'baseline' | 'stretch';
type AlignClass = `items-${AlignItems}`;

// Responsive prefix
type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type ResponsiveClass<T extends string> = T | `${Breakpoint}:${T}`;

// Combined utility type
type UtilityClass = 
  | PaddingClass 
  | MarginClass 
  | TextColorClass 
  | BgColorClass
  | FlexClass
  | JustifyClass
  | AlignClass;

// Usage with type checking
function cn(...classes: (UtilityClass | ResponsiveClass<UtilityClass>)[]): string {
  return classes.filter(Boolean).join(' ');
}

const className = cn('p-4', 'bg-blue-500', 'text-white', 'md:p-8');
```

### Event Handler Types

```typescript
// lib/types/events.ts

// DOM event types
type DOMEventType = 
  | 'click' 
  | 'submit' 
  | 'change' 
  | 'input' 
  | 'focus' 
  | 'blur'
  | 'keydown'
  | 'keyup'
  | 'mouseenter'
  | 'mouseleave';

// Event handler prop names
type EventHandlerProp = `on${Capitalize<DOMEventType>}`;

// Create handler type
type EventHandler<E extends DOMEventType> = (
  event: E extends 'click' ? React.MouseEvent
       : E extends 'submit' ? React.FormEvent
       : E extends 'change' | 'input' ? React.ChangeEvent
       : E extends 'focus' | 'blur' ? React.FocusEvent
       : E extends 'keydown' | 'keyup' ? React.KeyboardEvent
       : E extends 'mouseenter' | 'mouseleave' ? React.MouseEvent
       : never
) => void;

// Props type with event handlers
type WithEventHandlers<E extends DOMEventType> = {
  [K in E as `on${Capitalize<K>}`]?: EventHandler<K>;
};

// Usage
type ButtonEvents = WithEventHandlers<'click' | 'focus' | 'blur'>;
// { onClick?: EventHandler<'click'>; onFocus?: EventHandler<'focus'>; onBlur?: EventHandler<'blur'> }
```

### API Endpoint Types

```typescript
// lib/types/api-endpoints.ts

// Resource names
type Resource = 'users' | 'posts' | 'comments' | 'products' | 'orders';

// API versions
type ApiVersion = 'v1' | 'v2';

// Endpoint patterns
type ListEndpoint<R extends Resource> = `/api/${ApiVersion}/${R}`;
type DetailEndpoint<R extends Resource> = `/api/${ApiVersion}/${R}/${string}`;
type NestedEndpoint<R extends Resource, S extends Resource> = 
  `/api/${ApiVersion}/${R}/${string}/${S}`;

// All endpoints
type ApiEndpoint = 
  | ListEndpoint<Resource>
  | DetailEndpoint<Resource>
  | NestedEndpoint<Resource, Resource>;

// Endpoint builder with type inference
function endpoint<R extends Resource>(resource: R): ListEndpoint<R>;
function endpoint<R extends Resource>(resource: R, id: string): DetailEndpoint<R>;
function endpoint<R extends Resource, S extends Resource>(
  resource: R, 
  id: string, 
  nested: S
): NestedEndpoint<R, S>;
function endpoint(resource: string, id?: string, nested?: string): string {
  const base = `/api/v1/${resource}`;
  if (!id) return base;
  if (!nested) return `${base}/${id}`;
  return `${base}/${id}/${nested}`;
}

// Usage
const users = endpoint('users');              // '/api/v1/users'
const user = endpoint('users', '123');        // '/api/v1/users/123'
const userPosts = endpoint('users', '123', 'posts'); // '/api/v1/users/123/posts'
```

### Translation Key Types

```typescript
// lib/types/i18n.ts

// Namespace
type I18nNamespace = 'common' | 'auth' | 'dashboard' | 'errors';

// Key paths for each namespace
interface I18nKeys {
  common: 'title' | 'description' | 'submit' | 'cancel' | 'save' | 'delete';
  auth: 'login' | 'logout' | 'register' | 'forgotPassword' | 'resetPassword';
  dashboard: 'welcome' | 'stats.users' | 'stats.revenue' | 'stats.orders';
  errors: 'notFound' | 'unauthorized' | 'serverError' | 'validation';
}

// Full translation key type
type TranslationKey = {
  [N in I18nNamespace]: `${N}:${I18nKeys[N]}`;
}[I18nNamespace];

// Type-safe translation function
function t(key: TranslationKey): string {
  // Implementation
  return key;
}

// Usage
t('common:submit');      // Valid
t('auth:login');         // Valid
t('dashboard:stats.users'); // Valid
// t('invalid:key');     // Error!
```

### Database Column Types

```typescript
// lib/types/database.ts

// Table names
type TableName = 'users' | 'posts' | 'comments' | 'categories';

// Column naming conventions
type ColumnSuffix = 'Id' | 'At' | 'By' | 'Count' | 'Status';
type TimestampColumn = `created${'' | 'At'}` | `updated${'' | 'At'}` | `deleted${'' | 'At'}`;
type ForeignKeyColumn = `${Lowercase<TableName>}Id`;
type CountColumn = `${string}Count`;

// Standard columns for all tables
type StandardColumns = 'id' | TimestampColumn;

// Build column types for a table
type UserColumns = StandardColumns | 'email' | 'name' | 'password' | 'role';
type PostColumns = StandardColumns | 'title' | 'content' | 'published' | ForeignKeyColumn;

// Query builder types
type OrderDirection = 'asc' | 'desc';
type OrderBy<T extends string> = `${T}:${OrderDirection}`;

function orderBy<T extends string>(column: T, direction: OrderDirection): OrderBy<T> {
  return `${column}:${direction}`;
}

const order = orderBy('createdAt', 'desc'); // 'createdAt:desc'
```

### Type Manipulation with Template Literals

```typescript
// lib/types/string-utils.ts

// Capitalize first letter
type Capitalize<S extends string> = S extends `${infer F}${infer R}` 
  ? `${Uppercase<F>}${R}` 
  : S;

// Uncapitalize first letter
type Uncapitalize<S extends string> = S extends `${infer F}${infer R}` 
  ? `${Lowercase<F>}${R}` 
  : S;

// CamelCase to kebab-case
type CamelToKebab<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? '-' : ''}${Lowercase<T>}${CamelToKebab<U>}`
  : S;

// kebab-case to CamelCase
type KebabToCamel<S extends string> = S extends `${infer T}-${infer U}`
  ? `${T}${Capitalize<KebabToCamel<U>>}`
  : S;

// Snake_case to CamelCase
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Lowercase<T>}${Capitalize<SnakeToCamel<U>>}`
  : Lowercase<S>;

// Extract path parameters
type ExtractParams<T extends string> = 
  T extends `${string}[${infer Param}]${infer Rest}`
    ? Param | ExtractParams<Rest>
    : never;

// Usage
type Params = ExtractParams<'/users/[id]/posts/[postId]'>; // 'id' | 'postId'

// Build params object type
type ParamsObject<T extends string> = {
  [K in ExtractParams<T>]: string;
};

type UserPostParams = ParamsObject<'/users/[id]/posts/[postId]'>;
// { id: string; postId: string }
```

## Variants

### Branded String Types

```typescript
// Create branded types with template literals
type Brand<T, B extends string> = T & { __brand: B };

type UUID = Brand<string, 'UUID'>;
type Email = Brand<string, 'Email'>;
type Slug = Brand<`${Lowercase<string>}`

, 'Slug'>;

function createUUID(value: string): UUID {
  // Validate UUID format
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
    throw new Error('Invalid UUID');
  }
  return value as UUID;
}
```

## Anti-Patterns

```typescript
// Bad: Using plain strings for constrained values
function setColor(color: string) {} // Accepts any string

// Good: Use template literal types
type Color = `#${string}` | `rgb(${number},${number},${number})`;
function setColor(color: Color) {} // Type-safe

// Bad: Manual string concatenation without type safety
const path = '/api/' + version + '/' + resource; // string

// Good: Template literal with types
const path: `/api/${ApiVersion}/${Resource}` = `/api/v1/users`;
```

## Related Skills

- `type-safety` - Type-safe patterns
- `utility-types` - TypeScript utilities
- `generics` - Generic types
- `discriminated-unions` - Union types

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial template literal types pattern
