---
id: pt-xstate-react
name: Xstate React
version: 2.0.0
layer: L5
category: state
description: Implement XState state machines for complex UI logic in Next.js 15
tags: [state, xstate, react]
composes:
  - ../atoms/input-text.md
  - ../atoms/input-button.md
dependencies:
  xstate: "^5.18.0"
  @xstate/react: "^4.1.0"
formula: XState Machine + useMachine + Actors + Guards = Complex UI Workflow
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# XState React Pattern

## When to Use

- **Multi-step checkout/wizards**: Complex flows with validation between steps
- **Authentication state**: Login, MFA, session management with clear transitions
- **Form validation flows**: Field-level and form-level validation state
- **Media player controls**: Play, pause, buffering, error states
- **Parallel states**: Multiple independent state regions (volume + playback)

**Avoid when**: State is simple (single boolean), no complex transitions needed, or team lacks state machine experience.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ XState React Integration                                    │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ checkoutMachine = createMachine({...})                │  │
│  │  ├─ context: { items, shipping, payment, orderId }    │  │
│  │  ├─ states: cart → shipping → payment → review        │  │
│  │  ├─ actors: validateShipping, processPayment          │  │
│  │  └─ guards: isShippingValid, isPaymentValid           │  │
│  └───────────────────────────────────────────────────────┘  │
│                            │                                │
│                            ▼                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ useMachine(checkoutMachine)                           │  │
│  │  ├─ state: current snapshot                           │  │
│  │  ├─ send: dispatch events                             │  │
│  │  └─ state.matches('shipping') for rendering           │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ CartStep   │     │ ShippingStep │     │ ReviewStep  │   │
│  │ [Input]    │     │ [Input]      │     │ [Button]    │   │
│  │ [Button]   │     │ [Button x2]  │     │ context     │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
│                                                             │
│  Progress: [Progress bar] based on step index               │
│  Navigation: canGoBack, canGoNext from state.can()          │
└─────────────────────────────────────────────────────────────┘
```

## Overview

XState provides robust state machine and statechart implementation for managing complex UI logic, multi-step workflows, and application states. This pattern covers XState v5 integration with Next.js 15 and React 19.

## Implementation

### Basic Machine Setup

```typescript
// lib/machines/auth-machine.ts
import { createMachine, assign } from 'xstate';

interface AuthContext {
  user: {
    id: string;
    email: string;
    name: string;
  } | null;
  error: string | null;
  attempts: number;
}

type AuthEvent =
  | { type: 'LOGIN'; email: string; password: string }
  | { type: 'LOGOUT' }
  | { type: 'RETRY' }
  | { type: 'REFRESH_TOKEN' };

export const authMachine = createMachine({
  id: 'auth',
  initial: 'idle',
  context: {
    user: null,
    error: null,
    attempts: 0,
  } as AuthContext,
  states: {
    idle: {
      on: {
        LOGIN: 'authenticating',
      },
    },
    authenticating: {
      entry: assign({ error: null }),
      invoke: {
        id: 'authenticate',
        src: 'authenticateUser',
        input: ({ event }) => ({
          email: event.type === 'LOGIN' ? event.email : '',
          password: event.type === 'LOGIN' ? event.password : '',
        }),
        onDone: {
          target: 'authenticated',
          actions: assign({
            user: ({ event }) => event.output,
            attempts: 0,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error as string,
            attempts: ({ context }) => context.attempts + 1,
          }),
        },
      },
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: 'loggingOut',
        },
        REFRESH_TOKEN: {
          target: 'refreshing',
        },
      },
    },
    refreshing: {
      invoke: {
        id: 'refreshToken',
        src: 'refreshToken',
        onDone: {
          target: 'authenticated',
          actions: assign({
            user: ({ event }) => event.output,
          }),
        },
        onError: {
          target: 'idle',
          actions: assign({
            user: null,
            error: 'Session expired',
          }),
        },
      },
    },
    loggingOut: {
      invoke: {
        id: 'logout',
        src: 'logoutUser',
        onDone: {
          target: 'idle',
          actions: assign({
            user: null,
            error: null,
          }),
        },
        onError: {
          target: 'authenticated',
          actions: assign({
            error: 'Logout failed',
          }),
        },
      },
    },
    error: {
      on: {
        RETRY: {
          target: 'idle',
          guard: ({ context }) => context.attempts < 3,
        },
        LOGIN: 'authenticating',
      },
      after: {
        5000: {
          target: 'idle',
          guard: ({ context }) => context.attempts < 3,
        },
      },
    },
  },
});
```

### Machine with Actors

```typescript
// lib/machines/checkout-machine.ts
import { createMachine, assign, fromPromise, sendTo } from 'xstate';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutContext {
  items: CartItem[];
  shipping: {
    address: string;
    city: string;
    zip: string;
    country: string;
  } | null;
  payment: {
    method: 'card' | 'paypal' | 'bank';
    details: Record<string, string>;
  } | null;
  orderId: string | null;
  error: string | null;
}

type CheckoutEvent =
  | { type: 'SET_ITEMS'; items: CartItem[] }
  | { type: 'SET_SHIPPING'; shipping: CheckoutContext['shipping'] }
  | { type: 'SET_PAYMENT'; payment: CheckoutContext['payment'] }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

// Actor for validating shipping
const validateShippingActor = fromPromise(
  async ({ input }: { input: { shipping: CheckoutContext['shipping'] } }) => {
    const response = await fetch('/api/shipping/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input.shipping),
    });
    
    if (!response.ok) {
      throw new Error('Invalid shipping address');
    }
    
    return response.json();
  }
);

// Actor for processing payment
const processPaymentActor = fromPromise(
  async ({ input }: { input: { context: CheckoutContext } }) => {
    const response = await fetch('/api/checkout/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: input.context.items,
        shipping: input.context.shipping,
        payment: input.context.payment,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Payment failed');
    }
    
    return response.json();
  }
);

export const checkoutMachine = createMachine({
  id: 'checkout',
  initial: 'cart',
  context: {
    items: [],
    shipping: null,
    payment: null,
    orderId: null,
    error: null,
  } as CheckoutContext,
  states: {
    cart: {
      on: {
        SET_ITEMS: {
          actions: assign({
            items: ({ event }) => event.items,
          }),
        },
        NEXT: {
          target: 'shipping',
          guard: ({ context }) => context.items.length > 0,
        },
      },
    },
    shipping: {
      initial: 'form',
      states: {
        form: {
          on: {
            SET_SHIPPING: {
              actions: assign({
                shipping: ({ event }) => event.shipping,
              }),
            },
            NEXT: 'validating',
            BACK: '#checkout.cart',
          },
        },
        validating: {
          invoke: {
            id: 'validateShipping',
            src: validateShippingActor,
            input: ({ context }) => ({ shipping: context.shipping }),
            onDone: '#checkout.payment',
            onError: {
              target: 'form',
              actions: assign({
                error: ({ event }) => event.error as string,
              }),
            },
          },
        },
      },
    },
    payment: {
      on: {
        SET_PAYMENT: {
          actions: assign({
            payment: ({ event }) => event.payment,
          }),
        },
        NEXT: {
          target: 'review',
          guard: ({ context }) => context.payment !== null,
        },
        BACK: 'shipping',
      },
    },
    review: {
      on: {
        SUBMIT: 'processing',
        BACK: 'payment',
      },
    },
    processing: {
      invoke: {
        id: 'processPayment',
        src: processPaymentActor,
        input: ({ context }) => ({ context }),
        onDone: {
          target: 'success',
          actions: assign({
            orderId: ({ event }) => event.output.orderId,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => event.error as string,
          }),
        },
      },
    },
    success: {
      type: 'final',
    },
    error: {
      on: {
        BACK: 'payment',
        SUBMIT: 'processing',
      },
    },
  },
  on: {
    RESET: {
      target: '.cart',
      actions: assign({
        items: [],
        shipping: null,
        payment: null,
        orderId: null,
        error: null,
      }),
    },
  },
});
```

### React Integration

```tsx
// components/checkout/checkout-wizard.tsx
'use client';

import { useMachine } from '@xstate/react';
import { checkoutMachine } from '@/lib/machines/checkout-machine';
import { CartStep } from './steps/cart-step';
import { ShippingStep } from './steps/shipping-step';
import { PaymentStep } from './steps/payment-step';
import { ReviewStep } from './steps/review-step';
import { SuccessStep } from './steps/success-step';
import { ErrorStep } from './steps/error-step';

const steps = ['cart', 'shipping', 'payment', 'review'];

export function CheckoutWizard({ initialItems }: { initialItems: CartItem[] }) {
  const [state, send] = useMachine(checkoutMachine, {
    context: {
      items: initialItems,
      shipping: null,
      payment: null,
      orderId: null,
      error: null,
    },
  });
  
  const currentStep = state.value as string;
  const stepIndex = steps.indexOf(
    typeof currentStep === 'string' ? currentStep : Object.keys(currentStep)[0]
  );
  
  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress indicator */}
      <div className="flex justify-between mb-8">
        {steps.map((step, index) => (
          <div
            key={step}
            className={`flex items-center ${
              index <= stepIndex ? 'text-blue-500' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index <= stepIndex ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {index + 1}
            </div>
            <span className="ml-2 capitalize hidden sm:inline">{step}</span>
            {index < steps.length - 1 && (
              <div
                className={`h-0.5 w-12 mx-2 ${
                  index < stepIndex ? 'bg-blue-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      
      {/* Step content */}
      <div className="bg-white rounded-lg shadow p-6">
        {state.matches('cart') && (
          <CartStep
            items={state.context.items}
            onUpdateItems={(items) => send({ type: 'SET_ITEMS', items })}
            onNext={() => send({ type: 'NEXT' })}
          />
        )}
        
        {state.matches('shipping') && (
          <ShippingStep
            shipping={state.context.shipping}
            error={state.context.error}
            isValidating={state.matches({ shipping: 'validating' })}
            onUpdateShipping={(shipping) => send({ type: 'SET_SHIPPING', shipping })}
            onNext={() => send({ type: 'NEXT' })}
            onBack={() => send({ type: 'BACK' })}
          />
        )}
        
        {state.matches('payment') && (
          <PaymentStep
            payment={state.context.payment}
            onUpdatePayment={(payment) => send({ type: 'SET_PAYMENT', payment })}
            onNext={() => send({ type: 'NEXT' })}
            onBack={() => send({ type: 'BACK' })}
          />
        )}
        
        {state.matches('review') && (
          <ReviewStep
            context={state.context}
            onSubmit={() => send({ type: 'SUBMIT' })}
            onBack={() => send({ type: 'BACK' })}
          />
        )}
        
        {state.matches('processing') && (
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Processing your order...</p>
          </div>
        )}
        
        {state.matches('success') && (
          <SuccessStep
            orderId={state.context.orderId!}
            onReset={() => send({ type: 'RESET' })}
          />
        )}
        
        {state.matches('error') && (
          <ErrorStep
            error={state.context.error!}
            onRetry={() => send({ type: 'SUBMIT' })}
            onBack={() => send({ type: 'BACK' })}
          />
        )}
      </div>
    </div>
  );
}
```

### Form Machine with Validation

```typescript
// lib/machines/form-machine.ts
import { createMachine, assign } from 'xstate';

interface FormField {
  value: string;
  error: string | null;
  touched: boolean;
}

interface FormContext {
  fields: Record<string, FormField>;
  isValid: boolean;
  isSubmitting: boolean;
  submitError: string | null;
}

type FormEvent =
  | { type: 'CHANGE'; field: string; value: string }
  | { type: 'BLUR'; field: string }
  | { type: 'SUBMIT' }
  | { type: 'RESET' };

interface FormMachineOptions {
  fields: string[];
  validate: (fields: Record<string, FormField>) => Record<string, string | null>;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

export function createFormMachine(options: FormMachineOptions) {
  const { fields, validate, onSubmit } = options;
  
  const initialFields: Record<string, FormField> = {};
  fields.forEach((field) => {
    initialFields[field] = { value: '', error: null, touched: false };
  });
  
  return createMachine({
    id: 'form',
    initial: 'editing',
    context: {
      fields: initialFields,
      isValid: false,
      isSubmitting: false,
      submitError: null,
    } as FormContext,
    states: {
      editing: {
        on: {
          CHANGE: {
            actions: [
              assign({
                fields: ({ context, event }) => ({
                  ...context.fields,
                  [event.field]: {
                    ...context.fields[event.field],
                    value: event.value,
                  },
                }),
              }),
              assign({
                fields: ({ context }) => {
                  const errors = validate(context.fields);
                  const updated = { ...context.fields };
                  Object.keys(updated).forEach((key) => {
                    updated[key] = { ...updated[key], error: errors[key] };
                  });
                  return updated;
                },
                isValid: ({ context }) => {
                  const errors = validate(context.fields);
                  return Object.values(errors).every((e) => e === null);
                },
              }),
            ],
          },
          BLUR: {
            actions: assign({
              fields: ({ context, event }) => ({
                ...context.fields,
                [event.field]: {
                  ...context.fields[event.field],
                  touched: true,
                },
              }),
            }),
          },
          SUBMIT: {
            target: 'validating',
            guard: ({ context }) => context.isValid,
          },
        },
      },
      validating: {
        always: [
          {
            target: 'submitting',
            guard: ({ context }) => context.isValid,
          },
          {
            target: 'editing',
            actions: assign({
              fields: ({ context }) => {
                const updated = { ...context.fields };
                Object.keys(updated).forEach((key) => {
                  updated[key] = { ...updated[key], touched: true };
                });
                return updated;
              },
            }),
          },
        ],
      },
      submitting: {
        entry: assign({ isSubmitting: true, submitError: null }),
        invoke: {
          src: 'submitForm',
          input: ({ context }) => {
            const values: Record<string, string> = {};
            Object.entries(context.fields).forEach(([key, field]) => {
              values[key] = field.value;
            });
            return values;
          },
          onDone: 'success',
          onError: {
            target: 'editing',
            actions: assign({
              isSubmitting: false,
              submitError: ({ event }) => event.error as string,
            }),
          },
        },
        exit: assign({ isSubmitting: false }),
      },
      success: {
        type: 'final',
      },
    },
    on: {
      RESET: {
        target: '.editing',
        actions: assign({
          fields: initialFields,
          isValid: false,
          isSubmitting: false,
          submitError: null,
        }),
      },
    },
  });
}
```

### Custom Hook for Form Machine

```tsx
// hooks/use-form-machine.ts
'use client';

import { useMachine } from '@xstate/react';
import { createFormMachine } from '@/lib/machines/form-machine';
import { useMemo } from 'react';

interface UseFormMachineOptions {
  fields: string[];
  validate: (fields: Record<string, { value: string }>) => Record<string, string | null>;
  onSubmit: (values: Record<string, string>) => Promise<void>;
}

export function useFormMachine(options: UseFormMachineOptions) {
  const machine = useMemo(
    () => createFormMachine(options),
    [options.fields.join(',')]
  );
  
  const [state, send] = useMachine(machine, {
    actors: {
      submitForm: async ({ input }) => {
        await options.onSubmit(input);
      },
    },
  });
  
  return {
    fields: state.context.fields,
    isValid: state.context.isValid,
    isSubmitting: state.context.isSubmitting,
    submitError: state.context.submitError,
    isSuccess: state.matches('success'),
    
    // Field helpers
    getFieldProps: (name: string) => ({
      value: state.context.fields[name]?.value || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        send({ type: 'CHANGE', field: name, value: e.target.value });
      },
      onBlur: () => {
        send({ type: 'BLUR', field: name });
      },
    }),
    
    getFieldError: (name: string) => {
      const field = state.context.fields[name];
      return field?.touched ? field.error : null;
    },
    
    // Actions
    submit: () => send({ type: 'SUBMIT' }),
    reset: () => send({ type: 'RESET' }),
  };
}

// Usage
function ContactForm() {
  const form = useFormMachine({
    fields: ['name', 'email', 'message'],
    validate: (fields) => ({
      name: fields.name.value.length < 2 ? 'Name too short' : null,
      email: !fields.email.value.includes('@') ? 'Invalid email' : null,
      message: fields.message.value.length < 10 ? 'Message too short' : null,
    }),
    onSubmit: async (values) => {
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
  });
  
  if (form.isSuccess) {
    return <div>Thank you!</div>;
  }
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); form.submit(); }}>
      <input {...form.getFieldProps('name')} placeholder="Name" />
      {form.getFieldError('name') && <p>{form.getFieldError('name')}</p>}
      
      <input {...form.getFieldProps('email')} placeholder="Email" />
      {form.getFieldError('email') && <p>{form.getFieldError('email')}</p>}
      
      <textarea {...form.getFieldProps('message')} placeholder="Message" />
      {form.getFieldError('message') && <p>{form.getFieldError('message')}</p>}
      
      <button disabled={!form.isValid || form.isSubmitting}>
        {form.isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
```

### Parallel States

```typescript
// lib/machines/media-player-machine.ts
import { createMachine, assign } from 'xstate';

interface MediaContext {
  src: string;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
}

export const mediaPlayerMachine = createMachine({
  id: 'mediaPlayer',
  type: 'parallel',
  context: {
    src: '',
    currentTime: 0,
    duration: 0,
    volume: 1,
    playbackRate: 1,
  } as MediaContext,
  states: {
    playback: {
      initial: 'paused',
      states: {
        paused: {
          on: {
            PLAY: 'playing',
          },
        },
        playing: {
          on: {
            PAUSE: 'paused',
            END: 'ended',
          },
        },
        ended: {
          on: {
            PLAY: 'playing',
            SEEK: {
              target: 'paused',
              actions: assign({
                currentTime: ({ event }) => event.time,
              }),
            },
          },
        },
      },
    },
    volume: {
      initial: 'unmuted',
      states: {
        unmuted: {
          on: {
            MUTE: 'muted',
            SET_VOLUME: {
              actions: assign({
                volume: ({ event }) => event.volume,
              }),
            },
          },
        },
        muted: {
          on: {
            UNMUTE: 'unmuted',
          },
        },
      },
    },
    fullscreen: {
      initial: 'windowed',
      states: {
        windowed: {
          on: {
            ENTER_FULLSCREEN: 'fullscreen',
          },
        },
        fullscreen: {
          on: {
            EXIT_FULLSCREEN: 'windowed',
          },
        },
      },
    },
  },
});
```

## Variants

### XState with React Context

```tsx
// components/providers/machine-provider.tsx
'use client';

import { createContext, useContext } from 'react';
import { useInterpret, useSelector } from '@xstate/react';
import { authMachine } from '@/lib/machines/auth-machine';
import type { ActorRefFrom } from 'xstate';

type AuthActor = ActorRefFrom<typeof authMachine>;

const AuthContext = createContext<AuthActor | null>(null);

export function AuthMachineProvider({ children }: { children: React.ReactNode }) {
  const actor = useInterpret(authMachine);
  
  return (
    <AuthContext.Provider value={actor}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthActor() {
  const actor = useContext(AuthContext);
  if (!actor) throw new Error('useAuthActor must be used within AuthMachineProvider');
  return actor;
}

export function useAuthState() {
  const actor = useAuthActor();
  return useSelector(actor, (state) => state);
}

export function useAuthUser() {
  const actor = useAuthActor();
  return useSelector(actor, (state) => state.context.user);
}
```

## Anti-Patterns

```typescript
// Bad: Business logic in components
function BadCheckout() {
  const [step, setStep] = useState('cart');
  const [isValid, setIsValid] = useState(false);
  // Complex if/else logic for transitions...
}

// Good: State machine handles all logic
function GoodCheckout() {
  const [state, send] = useMachine(checkoutMachine);
  // Clean component, machine handles transitions
}

// Bad: Ignoring impossible states
if (isLoading && hasError && isSuccess) {
  // This state shouldn't be possible!
}

// Good: State machine prevents impossible states
state.matches('loading') // Mutually exclusive with 'error' and 'success'
```

## Related Skills

- `state-machines` - State machine concepts
- `form-state` - Form management
- `zustand` - Simpler state alternative
- `context` - React Context integration

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial XState v5 pattern for Next.js 15
