---
id: pt-mapped-types
name: Mapped Types
version: 2.0.0
layer: L5
category: typescript
description: TypeScript mapped types for transforming object types programmatically
tags: [typescript, types, mapped, transformation, utility-types, generics]
composes: []
dependencies: []
formula: "{ [P in keyof T as Filter<P>]: Transform<T[P]> }"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Mapped Types

## Overview

Mapped types allow you to create new types by transforming properties of existing types. They iterate over keys and transform each property, enabling powerful type transformations like making all properties optional, readonly, or changing their types.

## When to Use

Use this skill when:
- Creating variations of existing types (optional, readonly, nullable)
- Building form state types from data models
- Transforming API response types
- Creating getter/setter interfaces from data types
- Building type-safe configuration objects

## Composition Diagram

```
+------------------+
|   Source Type T  |
|   { a: X, b: Y } |
+--------+---------+
         |
         v
+--------+---------+
|   keyof T        |
|   'a' | 'b'      |
+--------+---------+
         |
         v
+--------+---------+
|   Mapping        |
|   [P in keyof T] |
+--------+---------+
         |
    +----+----+
    |         |
    v         v
+---+---+ +---+---+
| Key   | | Value |
| Remap | | Trans |
| as X  | | T[P]  |
+---+---+ +---+---+
    |         |
    +----+----+
         |
         v
+--------+---------+
|   Result Type    |
|   { x: X', y: Y'}|
+------------------+

Modifiers:
+--------+  +--------+  +--------+
|   ?    |  |   -?   |  | readonly|
|optional|  |required|  |  -readonly|
+--------+  +--------+  +--------+
```

## Implementation

```typescript
// lib/types/mapped.ts

// ============================================
// Basic Mapped Type Syntax
// ============================================

/**
 * Basic mapped type structure:
 * { [P in K]: T }
 * 
 * Where:
 * - P is the property name variable
 * - K is the union of keys to iterate
 * - T is the type for each property
 */

// Make all properties optional (built-in as Partial<T>)
type MyPartial<T> = {
  [P in keyof T]?: T[P];
};

// Make all properties required (built-in as Required<T>)
type MyRequired<T> = {
  [P in keyof T]-?: T[P];
};

// Make all properties readonly (built-in as Readonly<T>)
type MyReadonly<T> = {
  readonly [P in keyof T]: T[P];
};

// Remove readonly modifier
type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

// ============================================
// Property Filtering with Key Remapping
// ============================================

/**
 * Pick specific properties (built-in as Pick<T, K>)
 */
type MyPick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Omit specific properties (built-in as Omit<T, K>)
 */
type MyOmit<T, K extends keyof T> = {
  [P in keyof T as P extends K ? never : P]: T[P];
};

/**
 * Pick properties by value type
 */
type PickByType<T, ValueType> = {
  [P in keyof T as T[P] extends ValueType ? P : never]: T[P];
};

// Usage
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  isActive: boolean;
}

type StringProperties = PickByType<User, string>; 
// { name: string; email: string }

type NumberProperties = PickByType<User, number>;
// { id: number; age: number }

/**
 * Omit properties by value type
 */
type OmitByType<T, ValueType> = {
  [P in keyof T as T[P] extends ValueType ? never : P]: T[P];
};

type NonStringProperties = OmitByType<User, string>;
// { id: number; age: number; isActive: boolean }

// ============================================
// Key Transformation
// ============================================

/**
 * Prefix all keys
 */
type Prefixed<T, Prefix extends string> = {
  [P in keyof T as `${Prefix}${Capitalize<string & P>}`]: T[P];
};

// Usage
type PrefixedUser = Prefixed<User, 'user'>;
// { userId: number; userName: string; userEmail: string; ... }

/**
 * Suffix all keys
 */
type Suffixed<T, Suffix extends string> = {
  [P in keyof T as `${string & P}${Suffix}`]: T[P];
};

/**
 * Convert keys to getters
 */
type Getters<T> = {
  [P in keyof T as `get${Capitalize<string & P>}`]: () => T[P];
};

// Usage
type UserGetters = Getters<Pick<User, 'name' | 'email'>>;
// { getName: () => string; getEmail: () => string }

/**
 * Convert keys to setters
 */
type Setters<T> = {
  [P in keyof T as `set${Capitalize<string & P>}`]: (value: T[P]) => void;
};

/**
 * Create getter and setter interface
 */
type GettersAndSetters<T> = Getters<T> & Setters<T>;

// ============================================
// Value Transformation
// ============================================

/**
 * Make all properties nullable
 */
type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Make specific properties nullable
 */
type NullableKeys<T, K extends keyof T> = {
  [P in keyof T]: P extends K ? T[P] | null : T[P];
};

/**
 * Wrap all properties in Promise
 */
type Promised<T> = {
  [P in keyof T]: Promise<T[P]>;
};

/**
 * Wrap all properties in Array
 */
type Arrayed<T> = {
  [P in keyof T]: T[P][];
};

/**
 * Make all function properties async
 */
type Asyncify<T> = {
  [P in keyof T]: T[P] extends (...args: infer A) => infer R
    ? (...args: A) => Promise<R>
    : T[P];
};

// Usage
interface SyncService {
  getUser(id: string): User;
  saveUser(user: User): void;
  name: string;
}

type AsyncService = Asyncify<SyncService>;
// {
//   getUser(id: string): Promise<User>;
//   saveUser(user: User): Promise<void>;
//   name: string;  // Non-functions unchanged
// }

// ============================================
// Form State Types
// ============================================

/**
 * Create form field state from data model
 */
type FormField<T> = {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
};

type FormState<T> = {
  [P in keyof T]: FormField<T[P]>;
};

// Usage
type UserFormState = FormState<Pick<User, 'name' | 'email'>>;
// {
//   name: FormField<string>;
//   email: FormField<string>;
// }

/**
 * Extract values from form state
 */
type FormValues<T extends FormState<any>> = {
  [P in keyof T]: T[P]['value'];
};

/**
 * Extract errors from form state
 */
type FormErrors<T extends FormState<any>> = {
  [P in keyof T]?: string;
};

// ============================================
// API Types
// ============================================

/**
 * Create update DTO from entity (all optional except id)
 */
type UpdateDTO<T extends { id: unknown }> = {
  id: T['id'];
} & Partial<Omit<T, 'id'>>;

// Usage
type UpdateUserDTO = UpdateDTO<User>;
// { id: number } & { name?: string; email?: string; ... }

/**
 * Create create DTO from entity (omit id and timestamps)
 */
type CreateDTO<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * Make specific fields required for create
 */
type CreateDTOWithRequired<T, K extends keyof T> = 
  Required<Pick<CreateDTO<T>, K>> & Partial<Omit<CreateDTO<T>, K>>;

// ============================================
// Deep Mapped Types
// ============================================

/**
 * Deep partial - recursively make all properties optional
 */
type DeepPartial<T> = T extends object
  ? { [P in keyof T]?: DeepPartial<T[P]> }
  : T;

/**
 * Deep required - recursively make all properties required
 */
type DeepRequired<T> = T extends object
  ? { [P in keyof T]-?: DeepRequired<T[P]> }
  : T;

/**
 * Deep readonly - recursively make all properties readonly
 */
type DeepReadonly<T> = T extends object
  ? { readonly [P in keyof T]: DeepReadonly<T[P]> }
  : T;

/**
 * Deep mutable - recursively remove readonly
 */
type DeepMutable<T> = T extends object
  ? { -readonly [P in keyof T]: DeepMutable<T[P]> }
  : T;

/**
 * Deep nullable - recursively make all properties nullable
 */
type DeepNullable<T> = T extends object
  ? { [P in keyof T]: DeepNullable<T[P]> | null }
  : T | null;

// ============================================
// Utility Combinations
// ============================================

/**
 * Make certain keys optional, others required
 */
type PartialBy<T, K extends keyof T> = 
  Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make certain keys required, others optional
 */
type RequiredBy<T, K extends keyof T> = 
  Partial<Omit<T, K>> & Required<Pick<T, K>>;

/**
 * Make certain keys readonly
 */
type ReadonlyBy<T, K extends keyof T> = 
  Omit<T, K> & Readonly<Pick<T, K>>;

// Usage
type UserWithOptionalAge = PartialBy<User, 'age'>;
// { id: number; name: string; email: string; isActive: boolean; age?: number }

type UserWithRequiredName = RequiredBy<Partial<User>, 'name'>;
// { id?: number; name: string; email?: string; age?: number; isActive?: boolean }
```

### Key Implementation Notes

1. **Key Remapping**: Use `as` clause to transform or filter keys during mapping
2. **Modifiers**: Use `-?` and `-readonly` to remove optional and readonly modifiers

## Variants

### React Component Props Mapping

```tsx
// lib/types/component-props.ts

/**
 * Extract state props for controlled components
 */
type ControlledProps<T> = {
  [P in keyof T as `${string & P}`]: T[P];
} & {
  [P in keyof T as `on${Capitalize<string & P>}Change`]: (value: T[P]) => void;
};

// Usage
interface SliderState {
  value: number;
  min: number;
  max: number;
}

type ControlledSliderProps = ControlledProps<Pick<SliderState, 'value'>>;
// {
//   value: number;
//   onValueChange: (value: number) => void;
// }

/**
 * Create defaultProps type from props
 */
type DefaultProps<T> = {
  [P in keyof T as `default${Capitalize<string & P>}`]?: T[P];
};

// Usage
type SliderDefaultProps = DefaultProps<SliderState>;
// {
//   defaultValue?: number;
//   defaultMin?: number;
//   defaultMax?: number;
// }

/**
 * Props with both controlled and uncontrolled variants
 */
type FlexibleProps<T extends Record<string, any>, K extends keyof T> = 
  | (ControlledProps<Pick<T, K>> & DefaultProps<Omit<T, K>>)
  | (DefaultProps<Pick<T, K>> & { [P in keyof Pick<T, K>]?: never });
```

### Form Validation Schema Types

```typescript
// lib/types/validation.ts

type ValidationRule<T> = {
  required?: boolean;
  min?: T extends number ? number : never;
  max?: T extends number ? number : never;
  minLength?: T extends string ? number : never;
  maxLength?: T extends string ? number : never;
  pattern?: T extends string ? RegExp : never;
  custom?: (value: T) => string | undefined;
};

/**
 * Create validation schema type from form values
 */
type ValidationSchema<T> = {
  [P in keyof T]?: ValidationRule<T[P]>;
};

// Usage
interface SignupForm {
  email: string;
  password: string;
  age: number;
  terms: boolean;
}

const signupValidation: ValidationSchema<SignupForm> = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 8,
    maxLength: 100,
  },
  age: {
    required: true,
    min: 18,
    max: 120,
  },
  terms: {
    required: true,
  },
};

/**
 * Extract validated type (removes optionality from required fields)
 */
type ValidatedForm<T, S extends ValidationSchema<T>> = {
  [P in keyof T as S[P] extends { required: true } ? P : never]: T[P];
} & {
  [P in keyof T as S[P] extends { required: true } ? never : P]?: T[P];
};
```

### State Management Types

```typescript
// lib/types/store.ts

/**
 * Create action types from state shape
 */
type ActionTypes<T> = {
  [P in keyof T as `SET_${Uppercase<string & P>}`]: T[P];
};

// Usage
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  notifications: Notification[];
}

type AppActions = ActionTypes<AppState>;
// {
//   SET_USER: User | null;
//   SET_THEME: 'light' | 'dark';
//   SET_NOTIFICATIONS: Notification[];
// }

/**
 * Create reducer action union from action types
 */
type Action<T> = {
  [P in keyof ActionTypes<T>]: {
    type: P;
    payload: ActionTypes<T>[P];
  };
}[keyof ActionTypes<T>];

// Creates union:
// | { type: 'SET_USER'; payload: User | null }
// | { type: 'SET_THEME'; payload: 'light' | 'dark' }
// | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }

/**
 * Create selectors from state shape
 */
type Selectors<T> = {
  [P in keyof T as `select${Capitalize<string & P>}`]: (state: T) => T[P];
};

// Usage
type AppSelectors = Selectors<AppState>;
// {
//   selectUser: (state: AppState) => User | null;
//   selectTheme: (state: AppState) => 'light' | 'dark';
//   selectNotifications: (state: AppState) => Notification[];
// }

/**
 * Create action creators from action types
 */
type ActionCreators<T> = {
  [P in keyof T as `set${Capitalize<string & P>}`]: (value: T[P]) => Action<T>;
};
```

### API Response Transformations

```typescript
// lib/types/api-transforms.ts

/**
 * Convert snake_case keys to camelCase
 */
type SnakeToCamel<S extends string> = S extends `${infer T}_${infer U}`
  ? `${Lowercase<T>}${Capitalize<SnakeToCamel<U>>}`
  : Lowercase<S>;

type CamelCaseKeys<T> = {
  [P in keyof T as SnakeToCamel<string & P>]: T[P] extends object
    ? CamelCaseKeys<T[P]>
    : T[P];
};

// Usage
interface ApiResponse {
  user_id: number;
  first_name: string;
  last_name: string;
  created_at: string;
}

type TransformedResponse = CamelCaseKeys<ApiResponse>;
// {
//   userId: number;
//   firstName: string;
//   lastName: string;
//   createdAt: string;
// }

/**
 * Convert string dates to Date objects
 */
type DateKeys = 'createdAt' | 'updatedAt' | 'deletedAt' | 'date' | 'timestamp';

type ParseDates<T> = {
  [P in keyof T]: P extends DateKeys
    ? Date
    : T[P] extends object
    ? ParseDates<T[P]>
    : T[P];
};

/**
 * Convert nullable to optional
 */
type NullToOptional<T> = {
  [P in keyof T as null extends T[P] ? never : P]: T[P];
} & {
  [P in keyof T as null extends T[P] ? P : never]?: Exclude<T[P], null>;
};
```

## Anti-patterns

### Over-Engineering Simple Types

```typescript
// Bad - Complex mapped type for simple transformation
type MakeOptionalName<T extends { name: string }> = {
  [P in keyof T]: P extends 'name' ? T[P] | undefined : T[P];
};

// Good - Use Pick and Partial
type WithOptionalName<T extends { name: string }> = 
  Omit<T, 'name'> & { name?: string };

// Or even simpler with PartialBy utility
type WithOptionalName<T extends { name: string }> = PartialBy<T, 'name'>;
```

### Not Preserving Modifiers

```typescript
// Bad - Loses readonly modifier
type Transform<T> = {
  [P in keyof T]: T[P] | null;
};

interface ReadonlyUser {
  readonly id: number;
  readonly name: string;
}

type NullableUser = Transform<ReadonlyUser>;
// { id: number | null; name: string | null } - Lost readonly!

// Good - Preserve modifiers with utility
type TransformPreserve<T> = {
  [P in keyof T]: T[P] | null;
} & (T extends Readonly<T> ? Readonly<{}> : {});

// Or use intersection
type NullableReadonlyUser = Readonly<Transform<ReadonlyUser>>;
```

## Related Skills

### Composes From
- [generics](./generics.md) - Generic type parameters
- [keyof-typeof](./keyof-typeof.md) - Key extraction

### Composes Into
- [conditional-types](./conditional-types.md) - Conditional transformations
- [template-literals](./template-literals.md) - String key transformations

### Alternatives
- Record utility type - For simple key-value mappings
- Interface extension - For simple property additions

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with common patterns
- Form state types
- API transformation utilities
