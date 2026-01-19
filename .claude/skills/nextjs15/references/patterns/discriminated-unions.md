---
id: pt-discriminated-unions
name: Discriminated Unions
version: 2.0.0
layer: L5
category: typescript
description: Use TypeScript discriminated unions for type-safe state handling in Next.js 15
tags: [typescript, types, discriminated-unions, type-guards, exhaustive-checking]
composes: []
dependencies: []
formula: "type Union = { type: 'A'; dataA } | { type: 'B'; dataB } (discriminant enables exhaustive switch)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Discriminated Unions Pattern

## Overview

Discriminated unions (also known as tagged unions) use a common property to distinguish between different variants of a type. This pattern enables exhaustive type checking and type-safe state handling in Next.js 15.

## When to Use

Use discriminated unions when:
- Modeling state machines with distinct states (loading, success, error)
- Creating type-safe action/event systems for reducers
- Building component props with mutually exclusive variants
- Handling API responses with different success/error shapes
- Implementing form fields with type-specific configurations

## Composition Diagram

```
+------------------+
|   Base Interface |
|   (shared props) |
+--------+---------+
         |
         v
+--------+---------+
|   Discriminant   |
|   type: string   |
+--------+---------+
         |
    +----+----+----+
    |         |    |
    v         v    v
+---+---+ +---+---+ +-------+
|type:A | |type:B | |type:C |
|propsA | |propsB | |propsC |
+---+---+ +---+---+ +-------+
    |         |         |
    +----+----+----+----+
         |
         v
+--------+---------+
|   Union Type     |
|   A | B | C      |
+--------+---------+
         |
         v
+--------+---------+
| switch(x.type)   |
| case 'A': ...    |
| case 'B': ...    |
| default: never   |
+------------------+
```

## Implementation

### Basic Discriminated Union

```typescript
// lib/types/api-response.ts

// Discriminated union for API responses
type ApiResponse<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string; code?: number };

// Type guard functions
function isSuccess<T>(response: ApiResponse<T>): response is { status: 'success'; data: T } {
  return response.status === 'success';
}

function isError<T>(response: ApiResponse<T>): response is { status: 'error'; error: string; code?: number } {
  return response.status === 'error';
}

// Usage in component
function UserProfile({ response }: { response: ApiResponse<User> }) {
  switch (response.status) {
    case 'idle':
      return <div>Ready to load</div>;
    case 'loading':
      return <div>Loading...</div>;
    case 'success':
      // TypeScript knows response.data exists here
      return <div>{response.data.name}</div>;
    case 'error':
      // TypeScript knows response.error exists here
      return <div>Error: {response.error}</div>;
    default:
      // Exhaustive check - this should never happen
      const _exhaustive: never = response;
      return null;
  }
}
```

### Action Types for Reducers

```typescript
// lib/types/actions.ts

// User actions discriminated union
type UserAction =
  | { type: 'USER_FETCH_START' }
  | { type: 'USER_FETCH_SUCCESS'; payload: User }
  | { type: 'USER_FETCH_ERROR'; error: string }
  | { type: 'USER_UPDATE'; payload: Partial<User> }
  | { type: 'USER_DELETE' }
  | { type: 'USER_LOGOUT' };

// State type
interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Reducer with exhaustive handling
function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'USER_FETCH_START':
      return { ...state, isLoading: true, error: null };
    
    case 'USER_FETCH_SUCCESS':
      return { ...state, isLoading: false, user: action.payload };
    
    case 'USER_FETCH_ERROR':
      return { ...state, isLoading: false, error: action.error };
    
    case 'USER_UPDATE':
      return state.user
        ? { ...state, user: { ...state.user, ...action.payload } }
        : state;
    
    case 'USER_DELETE':
    case 'USER_LOGOUT':
      return { user: null, isLoading: false, error: null };
    
    default:
      // Exhaustive check
      const _exhaustive: never = action;
      return state;
  }
}
```

### Server Action Results

```typescript
// lib/types/server-actions.ts

// Generic server action result
type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; field?: string };

// Specific action results
type CreateUserResult = ActionResult<{ id: string; email: string }>;
type DeleteUserResult = ActionResult<{ deleted: boolean }>;
type ValidationResult = ActionResult<void>;

// Helper to create results
function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

function failure(error: string, field?: string): ActionResult<never> {
  return { success: false, error, field };
}

// Usage in server action
async function createUser(formData: FormData): Promise<CreateUserResult> {
  const email = formData.get('email') as string;
  
  if (!email) {
    return failure('Email is required', 'email');
  }
  
  try {
    const user = await prisma.user.create({
      data: { email },
      select: { id: true, email: true },
    });
    return success(user);
  } catch (error) {
    return failure('Failed to create user');
  }
}

// Type-safe handling in component
function handleResult(result: CreateUserResult) {
  if (result.success) {
    console.log('Created user:', result.data.id);
  } else {
    console.error('Error:', result.error);
    if (result.field) {
      // Set field-specific error
    }
  }
}
```

### Event Types

```typescript
// lib/types/events.ts

// Application events discriminated union
type AppEvent =
  | { type: 'USER_SIGNED_IN'; userId: string; method: 'password' | 'oauth' | 'magic-link' }
  | { type: 'USER_SIGNED_OUT'; userId: string }
  | { type: 'PAGE_VIEW'; path: string; referrer?: string }
  | { type: 'BUTTON_CLICK'; buttonId: string; label: string }
  | { type: 'FORM_SUBMIT'; formId: string; fields: string[] }
  | { type: 'ERROR'; message: string; stack?: string; context?: Record<string, unknown> };

// Event handler with exhaustive type checking
function trackEvent(event: AppEvent): void {
  const timestamp = new Date().toISOString();
  
  switch (event.type) {
    case 'USER_SIGNED_IN':
      analytics.track('user_signed_in', {
        userId: event.userId,
        method: event.method,
        timestamp,
      });
      break;
    
    case 'USER_SIGNED_OUT':
      analytics.track('user_signed_out', {
        userId: event.userId,
        timestamp,
      });
      break;
    
    case 'PAGE_VIEW':
      analytics.track('page_view', {
        path: event.path,
        referrer: event.referrer,
        timestamp,
      });
      break;
    
    case 'BUTTON_CLICK':
      analytics.track('button_click', {
        buttonId: event.buttonId,
        label: event.label,
        timestamp,
      });
      break;
    
    case 'FORM_SUBMIT':
      analytics.track('form_submit', {
        formId: event.formId,
        fieldCount: event.fields.length,
        timestamp,
      });
      break;
    
    case 'ERROR':
      analytics.track('error', {
        message: event.message,
        stack: event.stack,
        context: event.context,
        timestamp,
      });
      break;
    
    default:
      const _exhaustive: never = event;
  }
}
```

### Component Props Variants

```typescript
// components/button.tsx

// Button variants using discriminated union
type ButtonProps =
  | {
      variant: 'link';
      href: string;
      external?: boolean;
      children: React.ReactNode;
    }
  | {
      variant: 'button';
      type?: 'button' | 'submit' | 'reset';
      onClick?: () => void;
      disabled?: boolean;
      children: React.ReactNode;
    }
  | {
      variant: 'icon';
      icon: React.ReactNode;
      ariaLabel: string;
      onClick?: () => void;
    };

function Button(props: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded';
  
  switch (props.variant) {
    case 'link':
      return (
        <a
          href={props.href}
          className={baseClasses}
          target={props.external ? '_blank' : undefined}
          rel={props.external ? 'noopener noreferrer' : undefined}
        >
          {props.children}
        </a>
      );
    
    case 'button':
      return (
        <button
          type={props.type || 'button'}
          onClick={props.onClick}
          disabled={props.disabled}
          className={baseClasses}
        >
          {props.children}
        </button>
      );
    
    case 'icon':
      return (
        <button
          type="button"
          onClick={props.onClick}
          aria-label={props.ariaLabel}
          className={`${baseClasses} p-2`}
        >
          {props.icon}
        </button>
      );
    
    default:
      const _exhaustive: never = props;
      return null;
  }
}

// Usage
<Button variant="link" href="/about">About</Button>
<Button variant="button" onClick={handleClick}>Click me</Button>
<Button variant="icon" icon={<MenuIcon />} ariaLabel="Open menu" />
```

### Form Field Types

```typescript
// lib/types/form-fields.ts

type FormField =
  | {
      type: 'text' | 'email' | 'password' | 'tel' | 'url';
      name: string;
      label: string;
      placeholder?: string;
      required?: boolean;
    }
  | {
      type: 'textarea';
      name: string;
      label: string;
      rows?: number;
      maxLength?: number;
    }
  | {
      type: 'select';
      name: string;
      label: string;
      options: { value: string; label: string }[];
      multiple?: boolean;
    }
  | {
      type: 'checkbox';
      name: string;
      label: string;
      defaultChecked?: boolean;
    }
  | {
      type: 'radio';
      name: string;
      label: string;
      options: { value: string; label: string }[];
    }
  | {
      type: 'file';
      name: string;
      label: string;
      accept?: string;
      multiple?: boolean;
    };

// Dynamic form renderer
function renderField(field: FormField): JSX.Element {
  switch (field.type) {
    case 'text':
    case 'email':
    case 'password':
    case 'tel':
    case 'url':
      return (
        <input
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          required={field.required}
        />
      );
    
    case 'textarea':
      return (
        <textarea
          name={field.name}
          rows={field.rows}
          maxLength={field.maxLength}
        />
      );
    
    case 'select':
      return (
        <select name={field.name} multiple={field.multiple}>
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    
    case 'checkbox':
      return (
        <input
          type="checkbox"
          name={field.name}
          defaultChecked={field.defaultChecked}
        />
      );
    
    case 'radio':
      return (
        <>
          {field.options.map((opt) => (
            <label key={opt.value}>
              <input type="radio" name={field.name} value={opt.value} />
              {opt.label}
            </label>
          ))}
        </>
      );
    
    case 'file':
      return (
        <input
          type="file"
          name={field.name}
          accept={field.accept}
          multiple={field.multiple}
        />
      );
    
    default:
      const _exhaustive: never = field;
      return <></>;
  }
}
```

### Exhaustive Switch Helper

```typescript
// lib/utils/exhaustive.ts

// Helper function for exhaustive checks
export function assertNever(value: never): never {
  throw new Error(`Unhandled discriminated union member: ${JSON.stringify(value)}`);
}

// Usage
function handleStatus(status: 'pending' | 'approved' | 'rejected') {
  switch (status) {
    case 'pending':
      return 'Waiting for review';
    case 'approved':
      return 'Approved';
    case 'rejected':
      return 'Rejected';
    default:
      return assertNever(status);
  }
}
```

## Variants

### Nested Discriminated Unions

```typescript
type PaymentMethod =
  | { type: 'card'; card: { brand: string; last4: string } }
  | { type: 'bank'; bank: { name: string; accountLast4: string } }
  | { type: 'crypto'; crypto: { network: 'ethereum' | 'bitcoin'; address: string } };

type PaymentStatus =
  | { status: 'pending'; method: PaymentMethod }
  | { status: 'processing'; method: PaymentMethod; processorId: string }
  | { status: 'completed'; method: PaymentMethod; transactionId: string }
  | { status: 'failed'; method: PaymentMethod; error: string };
```

## Anti-Patterns

```typescript
// Bad: Optional properties instead of discriminated union
interface ApiResponse {
  loading?: boolean;
  data?: User;
  error?: string;
}
// Can be loading AND have error AND have data simultaneously!

// Good: Discriminated union
type ApiResponse =
  | { status: 'loading' }
  | { status: 'success'; data: User }
  | { status: 'error'; error: string };
// States are mutually exclusive

// Bad: Using string literals without discriminant
type Action = { type: string; payload: unknown };
// No type safety on payload!

// Good: Specific action types
type Action =
  | { type: 'ADD'; payload: Item }
  | { type: 'REMOVE'; payload: { id: string } };
// Payload is type-safe per action
```

## Related Skills

- `type-guards` - Type guard functions
- `type-safety` - Type-safe patterns
- `utility-types` - TypeScript utilities
- `generics` - Generic types

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial discriminated unions pattern
