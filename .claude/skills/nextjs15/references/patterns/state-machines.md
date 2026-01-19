---
id: pt-state-machines
name: State Machines
version: 2.0.0
layer: L5
category: state
description: XState state machines for complex UI flows, multi-step processes, and predictable state management
tags: [xstate, state-machine, fsm, statecharts, workflows, ui-state]
composes:
  - ../atoms/input-button.md
  - ../molecules/progress-bar.md
  - ../atoms/input-text.md
dependencies:
  xstate: "^5.18.0"
formula: XState Machine + Guards + Actions + Actors = Predictable Complex State
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# State Machines

Manage complex UI state with finite state machines using XState v5.

## When to Use

- **Multi-step wizards**: Checkout flows, onboarding, form wizards with validation
- **Authentication flows**: Login, MFA, password reset with clear state transitions
- **File upload**: Selection, validation, uploading, progress, success/error states
- **Complex UI interactions**: Media players, drag-and-drop, complex modals
- **Any flow with "impossible states"**: When boolean flags create invalid combinations

**Avoid when**: State is simple (use useState), flow is linear with no branching, or team is unfamiliar with state machine concepts.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Checkout State Machine Flow                                 │
│                                                             │
│  ┌──────┐    ┌──────────┐    ┌─────────┐    ┌─────────┐    │
│  │ cart │───►│ shipping │───►│ billing │───►│ payment │    │
│  │      │    │          │    │         │    │         │    │
│  │ NEXT │    │ NEXT     │    │ NEXT    │    │ NEXT    │    │
│  └──────┘    │ BACK     │    │ BACK    │    │ BACK    │    │
│    │         └──────────┘    └─────────┘    └─────────┘    │
│    │                                              │         │
│    │ guard: hasItems                              ▼         │
│    │                                        ┌─────────┐    │
│    └────────────────────────────────────────│ review  │    │
│                                             │ SUBMIT  │    │
│                                             └────┬────┘    │
│                                                  │         │
│                         ┌────────────────────────┼─────┐   │
│                         ▼                        ▼     │   │
│                   ┌───────────┐           ┌─────────┐  │   │
│                   │submitting │──────────►│ success │  │   │
│                   │  invoke   │  onDone   │ (final) │  │   │
│                   └─────┬─────┘           └─────────┘  │   │
│                         │ onError                      │   │
│                         ▼                              │   │
│                   ┌─────────┐                          │   │
│                   │  error  │──────── RETRY ───────────┘   │
│                   │         │                              │
│                   └─────────┘                              │
│                                                             │
│  Components: [Progress] [Button] [Input] [Form steps]      │
└─────────────────────────────────────────────────────────────┘
```

## Overview

This pattern covers:
- XState v5 machine definitions
- React integration with useMachine
- Multi-step form wizards
- Async operations and services
- Hierarchical states
- Guards and actions
- TypeScript integration

## Implementation

### Installation

```bash
npm install xstate @xstate/react
```

### Basic State Machine

```typescript
// lib/machines/toggle-machine.ts
import { setup, assign } from 'xstate';

export const toggleMachine = setup({
  types: {
    context: {} as { count: number },
    events: {} as { type: 'TOGGLE' } | { type: 'RESET' },
  },
  actions: {
    incrementCount: assign({
      count: ({ context }) => context.count + 1,
    }),
    resetCount: assign({
      count: 0,
    }),
  },
}).createMachine({
  id: 'toggle',
  initial: 'inactive',
  context: {
    count: 0,
  },
  states: {
    inactive: {
      on: {
        TOGGLE: {
          target: 'active',
          actions: 'incrementCount',
        },
      },
    },
    active: {
      on: {
        TOGGLE: {
          target: 'inactive',
          actions: 'incrementCount',
        },
        RESET: {
          target: 'inactive',
          actions: 'resetCount',
        },
      },
    },
  },
});
```

### Multi-Step Form Machine

```typescript
// lib/machines/checkout-machine.ts
import { setup, assign, fromPromise } from 'xstate';
import { z } from 'zod';

// Schema definitions
const addressSchema = z.object({
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(2),
  zip: z.string().min(5),
  country: z.string().min(2),
});

const paymentSchema = z.object({
  cardNumber: z.string().min(16),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cvc: z.string().min(3),
  name: z.string().min(1),
});

const cartItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number(),
});

// Types
type Address = z.infer<typeof addressSchema>;
type Payment = z.infer<typeof paymentSchema>;
type CartItem = z.infer<typeof cartItemSchema>;

interface CheckoutContext {
  cart: CartItem[];
  shippingAddress: Partial<Address>;
  billingAddress: Partial<Address>;
  sameAsShipping: boolean;
  payment: Partial<Payment>;
  orderId: string | null;
  error: string | null;
}

type CheckoutEvent =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'UPDATE_SHIPPING'; data: Partial<Address> }
  | { type: 'UPDATE_BILLING'; data: Partial<Address> }
  | { type: 'TOGGLE_SAME_AS_SHIPPING' }
  | { type: 'UPDATE_PAYMENT'; data: Partial<Payment> }
  | { type: 'SUBMIT' }
  | { type: 'RETRY' }
  | { type: 'EDIT_STEP'; step: 'cart' | 'shipping' | 'billing' | 'payment' };

// Async actors
const submitOrder = fromPromise(async ({ input }: { input: CheckoutContext }) => {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cart: input.cart,
      shippingAddress: input.shippingAddress,
      billingAddress: input.sameAsShipping 
        ? input.shippingAddress 
        : input.billingAddress,
      payment: input.payment,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to submit order');
  }

  return response.json() as Promise<{ orderId: string }>;
});

export const checkoutMachine = setup({
  types: {
    context: {} as CheckoutContext,
    events: {} as CheckoutEvent,
  },
  guards: {
    isShippingValid: ({ context }) => {
      return addressSchema.safeParse(context.shippingAddress).success;
    },
    isBillingValid: ({ context }) => {
      if (context.sameAsShipping) return true;
      return addressSchema.safeParse(context.billingAddress).success;
    },
    isPaymentValid: ({ context }) => {
      return paymentSchema.safeParse(context.payment).success;
    },
    hasItems: ({ context }) => context.cart.length > 0,
  },
  actions: {
    updateShipping: assign({
      shippingAddress: ({ context, event }) => {
        if (event.type !== 'UPDATE_SHIPPING') return context.shippingAddress;
        return { ...context.shippingAddress, ...event.data };
      },
    }),
    updateBilling: assign({
      billingAddress: ({ context, event }) => {
        if (event.type !== 'UPDATE_BILLING') return context.billingAddress;
        return { ...context.billingAddress, ...event.data };
      },
    }),
    toggleSameAsShipping: assign({
      sameAsShipping: ({ context }) => !context.sameAsShipping,
    }),
    updatePayment: assign({
      payment: ({ context, event }) => {
        if (event.type !== 'UPDATE_PAYMENT') return context.payment;
        return { ...context.payment, ...event.data };
      },
    }),
    setOrderId: assign({
      orderId: (_, params: { orderId: string }) => params.orderId,
    }),
    setError: assign({
      error: (_, params: { error: string }) => params.error,
    }),
    clearError: assign({
      error: null,
    }),
  },
  actors: {
    submitOrder,
  },
}).createMachine({
  id: 'checkout',
  initial: 'cart',
  context: {
    cart: [],
    shippingAddress: {},
    billingAddress: {},
    sameAsShipping: true,
    payment: {},
    orderId: null,
    error: null,
  },
  states: {
    cart: {
      on: {
        NEXT: {
          target: 'shipping',
          guard: 'hasItems',
        },
      },
    },
    shipping: {
      on: {
        UPDATE_SHIPPING: {
          actions: 'updateShipping',
        },
        NEXT: {
          target: 'billing',
          guard: 'isShippingValid',
        },
        BACK: 'cart',
      },
    },
    billing: {
      on: {
        UPDATE_BILLING: {
          actions: 'updateBilling',
        },
        TOGGLE_SAME_AS_SHIPPING: {
          actions: 'toggleSameAsShipping',
        },
        NEXT: {
          target: 'payment',
          guard: 'isBillingValid',
        },
        BACK: 'shipping',
      },
    },
    payment: {
      on: {
        UPDATE_PAYMENT: {
          actions: 'updatePayment',
        },
        NEXT: {
          target: 'review',
          guard: 'isPaymentValid',
        },
        BACK: 'billing',
      },
    },
    review: {
      on: {
        SUBMIT: 'submitting',
        BACK: 'payment',
        EDIT_STEP: [
          { target: 'cart', guard: (_, event) => event.step === 'cart' },
          { target: 'shipping', guard: (_, event) => event.step === 'shipping' },
          { target: 'billing', guard: (_, event) => event.step === 'billing' },
          { target: 'payment', guard: (_, event) => event.step === 'payment' },
        ],
      },
    },
    submitting: {
      invoke: {
        src: 'submitOrder',
        input: ({ context }) => context,
        onDone: {
          target: 'success',
          actions: assign({
            orderId: ({ event }) => event.output.orderId,
          }),
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) => 
              event.error instanceof Error 
                ? event.error.message 
                : 'Unknown error',
          }),
        },
      },
    },
    success: {
      type: 'final',
    },
    error: {
      on: {
        RETRY: {
          target: 'submitting',
          actions: 'clearError',
        },
        BACK: 'review',
      },
    },
  },
});
```

### React Integration

```typescript
// components/checkout/checkout-wizard.tsx
'use client';

import { useMachine } from '@xstate/react';
import { checkoutMachine } from '@/lib/machines/checkout-machine';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CartStep } from './steps/cart-step';
import { ShippingStep } from './steps/shipping-step';
import { BillingStep } from './steps/billing-step';
import { PaymentStep } from './steps/payment-step';
import { ReviewStep } from './steps/review-step';
import { SuccessStep } from './steps/success-step';
import { ErrorStep } from './steps/error-step';

const steps = ['cart', 'shipping', 'billing', 'payment', 'review'];

interface CheckoutWizardProps {
  initialCart: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export function CheckoutWizard({ initialCart }: CheckoutWizardProps) {
  const [state, send] = useMachine(checkoutMachine, {
    input: {
      cart: initialCart,
    },
  });

  const currentStep = state.value as string;
  const stepIndex = steps.indexOf(currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  const renderStep = () => {
    switch (currentStep) {
      case 'cart':
        return <CartStep cart={state.context.cart} />;
      case 'shipping':
        return (
          <ShippingStep
            address={state.context.shippingAddress}
            onUpdate={(data) => send({ type: 'UPDATE_SHIPPING', data })}
          />
        );
      case 'billing':
        return (
          <BillingStep
            address={state.context.billingAddress}
            sameAsShipping={state.context.sameAsShipping}
            onUpdate={(data) => send({ type: 'UPDATE_BILLING', data })}
            onToggleSameAsShipping={() => send({ type: 'TOGGLE_SAME_AS_SHIPPING' })}
          />
        );
      case 'payment':
        return (
          <PaymentStep
            payment={state.context.payment}
            onUpdate={(data) => send({ type: 'UPDATE_PAYMENT', data })}
          />
        );
      case 'review':
        return (
          <ReviewStep
            context={state.context}
            onEdit={(step) => send({ type: 'EDIT_STEP', step })}
          />
        );
      case 'submitting':
        return <SubmittingState />;
      case 'success':
        return <SuccessStep orderId={state.context.orderId!} />;
      case 'error':
        return (
          <ErrorStep 
            error={state.context.error!} 
            onRetry={() => send({ type: 'RETRY' })}
          />
        );
      default:
        return null;
    }
  };

  const canGoBack = state.can({ type: 'BACK' });
  const canGoNext = state.can({ type: 'NEXT' });
  const canSubmit = state.can({ type: 'SUBMIT' });

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress indicator */}
      {stepIndex >= 0 && stepIndex < steps.length && (
        <div className="mb-8">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            {steps.map((step, i) => (
              <span
                key={step}
                className={i <= stepIndex ? 'text-primary font-medium' : ''}
              >
                {step.charAt(0).toUpperCase() + step.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="mb-8">{renderStep()}</div>

      {/* Navigation */}
      {!['submitting', 'success'].includes(currentStep) && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => send({ type: 'BACK' })}
            disabled={!canGoBack}
          >
            Back
          </Button>
          
          {currentStep === 'review' ? (
            <Button onClick={() => send({ type: 'SUBMIT' })} disabled={!canSubmit}>
              Place Order
            </Button>
          ) : (
            <Button onClick={() => send({ type: 'NEXT' })} disabled={!canGoNext}>
              Continue
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function SubmittingState() {
  return (
    <div className="text-center py-12">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-lg">Processing your order...</p>
    </div>
  );
}
```

### Authentication Flow Machine

```typescript
// lib/machines/auth-machine.ts
import { setup, assign, fromPromise } from 'xstate';

interface AuthContext {
  user: { id: string; email: string; name: string } | null;
  error: string | null;
  email: string;
  requiresMFA: boolean;
  mfaCode: string;
}

type AuthEvent =
  | { type: 'LOGIN'; email: string; password: string }
  | { type: 'SUBMIT_MFA'; code: string }
  | { type: 'LOGOUT' }
  | { type: 'SIGNUP'; email: string; password: string; name: string }
  | { type: 'FORGOT_PASSWORD'; email: string }
  | { type: 'RESET_PASSWORD'; token: string; password: string }
  | { type: 'CANCEL' }
  | { type: 'RETRY' };

// Async actors
const loginUser = fromPromise(async ({ 
  input 
}: { 
  input: { email: string; password: string } 
}) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  return response.json();
});

const verifyMFA = fromPromise(async ({ 
  input 
}: { 
  input: { code: string } 
}) => {
  const response = await fetch('/api/auth/mfa/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error('Invalid MFA code');
  }

  return response.json();
});

export const authMachine = setup({
  types: {
    context: {} as AuthContext,
    events: {} as AuthEvent,
  },
  actors: {
    loginUser,
    verifyMFA,
  },
  actions: {
    setUser: assign({
      user: (_, params: { user: AuthContext['user'] }) => params.user,
    }),
    setError: assign({
      error: (_, params: { error: string }) => params.error,
    }),
    clearError: assign({ error: null }),
    setRequiresMFA: assign({ requiresMFA: true }),
    setEmail: assign({
      email: (_, params: { email: string }) => params.email,
    }),
    clearUser: assign({ user: null }),
  },
}).createMachine({
  id: 'auth',
  initial: 'idle',
  context: {
    user: null,
    error: null,
    email: '',
    requiresMFA: false,
    mfaCode: '',
  },
  states: {
    idle: {
      on: {
        LOGIN: 'authenticating',
        SIGNUP: 'signingUp',
        FORGOT_PASSWORD: 'sendingReset',
      },
    },
    authenticating: {
      invoke: {
        src: 'loginUser',
        input: ({ event }) => {
          if (event.type !== 'LOGIN') throw new Error('Invalid event');
          return { email: event.email, password: event.password };
        },
        onDone: [
          {
            target: 'mfaRequired',
            guard: ({ event }) => event.output.requiresMFA,
            actions: [
              assign({ requiresMFA: true }),
              assign({ email: ({ event }) => event.output.email }),
            ],
          },
          {
            target: 'authenticated',
            actions: assign({ user: ({ event }) => event.output.user }),
          },
        ],
        onError: {
          target: 'idle',
          actions: assign({
            error: ({ event }) =>
              event.error instanceof Error ? event.error.message : 'Login failed',
          }),
        },
      },
    },
    mfaRequired: {
      on: {
        SUBMIT_MFA: 'verifyingMFA',
        CANCEL: 'idle',
      },
    },
    verifyingMFA: {
      invoke: {
        src: 'verifyMFA',
        input: ({ event }) => {
          if (event.type !== 'SUBMIT_MFA') throw new Error('Invalid event');
          return { code: event.code };
        },
        onDone: {
          target: 'authenticated',
          actions: assign({ user: ({ event }) => event.output.user }),
        },
        onError: {
          target: 'mfaRequired',
          actions: assign({ error: 'Invalid verification code' }),
        },
      },
    },
    signingUp: {
      invoke: {
        src: fromPromise(async ({ input }) => {
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          });
          if (!response.ok) throw new Error('Signup failed');
          return response.json();
        }),
        input: ({ event }) => {
          if (event.type !== 'SIGNUP') throw new Error('Invalid event');
          return event;
        },
        onDone: {
          target: 'authenticated',
          actions: assign({ user: ({ event }) => event.output.user }),
        },
        onError: {
          target: 'idle',
          actions: assign({
            error: ({ event }) =>
              event.error instanceof Error ? event.error.message : 'Signup failed',
          }),
        },
      },
    },
    sendingReset: {
      invoke: {
        src: fromPromise(async ({ input }) => {
          const response = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
          });
          if (!response.ok) throw new Error('Failed to send reset email');
          return response.json();
        }),
        input: ({ event }) => {
          if (event.type !== 'FORGOT_PASSWORD') throw new Error('Invalid event');
          return { email: event.email };
        },
        onDone: 'resetEmailSent',
        onError: {
          target: 'idle',
          actions: assign({ error: 'Failed to send reset email' }),
        },
      },
    },
    resetEmailSent: {
      on: {
        CANCEL: 'idle',
      },
    },
    authenticated: {
      on: {
        LOGOUT: {
          target: 'idle',
          actions: 'clearUser',
        },
      },
    },
  },
});
```

### File Upload Machine

```typescript
// lib/machines/upload-machine.ts
import { setup, assign, fromPromise } from 'xstate';

interface UploadContext {
  file: File | null;
  progress: number;
  url: string | null;
  error: string | null;
}

type UploadEvent =
  | { type: 'SELECT_FILE'; file: File }
  | { type: 'UPLOAD' }
  | { type: 'PROGRESS'; progress: number }
  | { type: 'CANCEL' }
  | { type: 'RETRY' }
  | { type: 'REMOVE' };

const uploadFile = fromPromise(async ({ 
  input, 
  emit 
}: { 
  input: { file: File };
  emit: (event: UploadEvent) => void;
}) => {
  const formData = new FormData();
  formData.append('file', input.file);

  return new Promise<{ url: string }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        emit({ type: 'PROGRESS', progress: (e.loaded / e.total) * 100 });
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => reject(new Error('Upload failed')));
    xhr.addEventListener('abort', () => reject(new Error('Upload cancelled')));

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
});

export const uploadMachine = setup({
  types: {
    context: {} as UploadContext,
    events: {} as UploadEvent,
  },
  guards: {
    hasFile: ({ context }) => context.file !== null,
    isValidFile: ({ context }) => {
      if (!context.file) return false;
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      return context.file.size <= maxSize && allowedTypes.includes(context.file.type);
    },
  },
  actors: {
    uploadFile,
  },
}).createMachine({
  id: 'upload',
  initial: 'idle',
  context: {
    file: null,
    progress: 0,
    url: null,
    error: null,
  },
  states: {
    idle: {
      on: {
        SELECT_FILE: {
          target: 'selected',
          actions: assign({
            file: ({ event }) => event.file,
            error: null,
          }),
        },
      },
    },
    selected: {
      always: [
        {
          target: 'invalid',
          guard: ({ context }) => !context.file || context.file.size > 10 * 1024 * 1024,
        },
      ],
      on: {
        SELECT_FILE: {
          actions: assign({ file: ({ event }) => event.file }),
        },
        UPLOAD: {
          target: 'uploading',
          guard: 'isValidFile',
        },
        REMOVE: {
          target: 'idle',
          actions: assign({ file: null }),
        },
      },
    },
    invalid: {
      on: {
        SELECT_FILE: {
          target: 'selected',
          actions: assign({
            file: ({ event }) => event.file,
            error: null,
          }),
        },
        REMOVE: {
          target: 'idle',
          actions: assign({ file: null, error: null }),
        },
      },
      entry: assign({
        error: 'File is too large or invalid type',
      }),
    },
    uploading: {
      invoke: {
        src: 'uploadFile',
        input: ({ context }) => ({ file: context.file! }),
        onDone: {
          target: 'complete',
          actions: assign({ url: ({ event }) => event.output.url }),
        },
        onError: {
          target: 'error',
          actions: assign({
            error: ({ event }) =>
              event.error instanceof Error ? event.error.message : 'Upload failed',
          }),
        },
      },
      on: {
        PROGRESS: {
          actions: assign({ progress: ({ event }) => event.progress }),
        },
        CANCEL: {
          target: 'selected',
          actions: assign({ progress: 0 }),
        },
      },
    },
    complete: {
      on: {
        REMOVE: {
          target: 'idle',
          actions: assign({
            file: null,
            url: null,
            progress: 0,
          }),
        },
      },
    },
    error: {
      on: {
        RETRY: 'uploading',
        REMOVE: {
          target: 'idle',
          actions: assign({
            file: null,
            error: null,
            progress: 0,
          }),
        },
      },
    },
  },
});
```

## Variants

### Persisted State Machine

```typescript
// lib/machines/persisted-machine.ts
import { useMachine } from '@xstate/react';
import { checkoutMachine } from './checkout-machine';
import { useEffect } from 'react';

export function usePersistedMachine() {
  const [state, send, actor] = useMachine(checkoutMachine);

  // Persist state on change
  useEffect(() => {
    const subscription = actor.subscribe((snapshot) => {
      localStorage.setItem(
        'checkout-state',
        JSON.stringify(snapshot.context)
      );
    });

    return () => subscription.unsubscribe();
  }, [actor]);

  // Restore state on mount
  useEffect(() => {
    const saved = localStorage.getItem('checkout-state');
    if (saved) {
      try {
        const context = JSON.parse(saved);
        // Restore context through an event if needed
      } catch {
        // Invalid saved state
      }
    }
  }, []);

  return [state, send, actor] as const;
}
```

### Server-Side State Machine

```typescript
// Server action with state machine validation
'use server';

import { createActor } from 'xstate';
import { checkoutMachine } from '@/lib/machines/checkout-machine';

export async function processCheckoutStep(
  currentState: string,
  event: { type: string; data?: unknown }
) {
  const actor = createActor(checkoutMachine, {
    snapshot: checkoutMachine.resolveState({ value: currentState }),
  });

  actor.start();
  
  const canTransition = actor.getSnapshot().can(event);
  
  if (!canTransition) {
    throw new Error(`Invalid transition: ${event.type} from ${currentState}`);
  }

  actor.send(event);
  
  return {
    newState: actor.getSnapshot().value,
    context: actor.getSnapshot().context,
  };
}
```

## Anti-patterns

1. **Overly complex machines** - Split into smaller, composable machines
2. **Business logic in components** - Keep logic in machine actions/guards
3. **Not using TypeScript** - Always type context and events
4. **Ignoring guards** - Use guards for validation, not just in components
5. **Mixing machine and component state** - Keep machine as single source of truth

## Related Skills

- [[zustand]] - Simpler state for non-FSM needs
- [[multi-step-forms]] - Form wizard without state machine
- [[form-validation]] - Validation strategies

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial XState v5 patterns for checkout, auth, and file upload flows
