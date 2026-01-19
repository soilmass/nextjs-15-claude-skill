---
id: pt-checkout
name: Checkout Flow
version: 1.0.0
layer: L5
category: ecommerce
description: Multi-step checkout flow orchestration with cart, shipping, and payment
tags: [checkout, ecommerce, cart, payment, forms, next15]
composes:
  - ../organisms/checkout-form.md
dependencies:
  stripe: "^17.0.0"
formula: "Checkout = Cart + ShippingForm + PaymentProcessor + OrderConfirmation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Checkout Flow

## When to Use

- E-commerce checkout processes
- Subscription sign-up flows
- Multi-step purchase workflows
- Payment collection with shipping
- Order management systems

## Composition Diagram

```
Checkout Flow
=============

+------------------------------------------+
|  Step 1: Cart Review                     |
|  - Item list                             |
|  - Quantity adjustments                  |
|  - Promo code                            |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Step 2: Shipping Information            |
|  - Address form                          |
|  - Delivery options                      |
|  - Shipping cost calculation             |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Step 3: Payment                         |
|  - Payment method selection              |
|  - Card details (Stripe Elements)        |
|  - Billing address                       |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Step 4: Confirmation                    |
|  - Order summary                         |
|  - Order number                          |
|  - Email confirmation                    |
+------------------------------------------+
```

## Checkout Context

```typescript
// providers/checkout-provider.tsx
'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ShippingInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
}

interface CheckoutState {
  step: number;
  cart: CartItem[];
  shipping: ShippingInfo | null;
  shippingMethod: string | null;
  shippingCost: number;
  promoCode: string | null;
  discount: number;
}

type CheckoutAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'SET_SHIPPING'; payload: ShippingInfo }
  | { type: 'SET_SHIPPING_METHOD'; payload: { method: string; cost: number } }
  | { type: 'APPLY_PROMO'; payload: { code: string; discount: number } }
  | { type: 'CLEAR_CART' };

const initialState: CheckoutState = {
  step: 1,
  cart: [],
  shipping: null,
  shippingMethod: null,
  shippingCost: 0,
  promoCode: null,
  discount: 0,
};

function checkoutReducer(state: CheckoutState, action: CheckoutAction): CheckoutState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'ADD_ITEM':
      const existing = state.cart.find((item) => item.id === action.payload.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, cart: state.cart.filter((item) => item.id !== action.payload) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        ),
      };
    case 'SET_SHIPPING':
      return { ...state, shipping: action.payload };
    case 'SET_SHIPPING_METHOD':
      return { ...state, shippingMethod: action.payload.method, shippingCost: action.payload.cost };
    case 'APPLY_PROMO':
      return { ...state, promoCode: action.payload.code, discount: action.payload.discount };
    case 'CLEAR_CART':
      return initialState;
    default:
      return state;
  }
}

const CheckoutContext = createContext<{
  state: CheckoutState;
  dispatch: React.Dispatch<CheckoutAction>;
  subtotal: number;
  total: number;
} | null>(null);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal + state.shippingCost - state.discount;

  return (
    <CheckoutContext.Provider value={{ state, dispatch, subtotal, total }}>
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within CheckoutProvider');
  return context;
}
```

## Checkout Page

```typescript
// app/checkout/page.tsx
'use client';

import { useCheckout } from '@/providers/checkout-provider';
import { CartReview } from '@/components/checkout/cart-review';
import { ShippingForm } from '@/components/checkout/shipping-form';
import { PaymentForm } from '@/components/checkout/payment-form';
import { OrderConfirmation } from '@/components/checkout/order-confirmation';
import { Progress } from '@/components/ui/progress';

const steps = ['Cart', 'Shipping', 'Payment', 'Confirmation'];

export default function CheckoutPage() {
  const { state } = useCheckout();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress indicator */}
      <div className="mb-8">
        <Progress value={(state.step / steps.length) * 100} className="mb-2" />
        <div className="flex justify-between text-sm">
          {steps.map((step, index) => (
            <span
              key={step}
              className={index + 1 <= state.step ? 'text-primary font-medium' : 'text-muted-foreground'}
            >
              {step}
            </span>
          ))}
        </div>
      </div>

      {/* Step content */}
      {state.step === 1 && <CartReview />}
      {state.step === 2 && <ShippingForm />}
      {state.step === 3 && <PaymentForm />}
      {state.step === 4 && <OrderConfirmation />}
    </div>
  );
}
```

## Cart Review Component

```typescript
// components/checkout/cart-review.tsx
'use client';

import { useCheckout } from '@/providers/checkout-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

export function CartReview() {
  const { state, dispatch, subtotal } = useCheckout();
  const [promoCode, setPromoCode] = useState('');

  const promoMutation = useMutation({
    mutationFn: (code: string) =>
      fetch('/api/promo/validate', {
        method: 'POST',
        body: JSON.stringify({ code }),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      if (data.valid) {
        dispatch({ type: 'APPLY_PROMO', payload: { code: promoCode, discount: data.discount } });
      }
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Cart</h2>

      {state.cart.length === 0 ? (
        <p className="text-muted-foreground">Your cart is empty</p>
      ) : (
        <>
          <div className="space-y-4">
            {state.cart.map((item) => (
              <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                {item.image && (
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded" />
                )}
                <div className="flex-1">
                  <h3 className="font-medium">{item.name}</h3>
                  <p className="text-muted-foreground">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_QUANTITY',
                        payload: { id: item.id, quantity: Math.max(1, item.quantity - 1) },
                      })
                    }
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      dispatch({
                        type: 'UPDATE_QUANTITY',
                        payload: { id: item.id, quantity: item.quantity + 1 },
                      })
                    }
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Promo code */}
          <div className="flex gap-2">
            <Input
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
            />
            <Button variant="outline" onClick={() => promoMutation.mutate(promoCode)}>
              Apply
            </Button>
          </div>

          {/* Summary */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {state.discount > 0 && (
              <div className="flex justify-between text-green-600 mb-2">
                <span>Discount</span>
                <span>-${state.discount.toFixed(2)}</span>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}
          >
            Continue to Shipping
          </Button>
        </>
      )}
    </div>
  );
}
```

## Payment Form with Stripe

```typescript
// components/checkout/payment-form.tsx
'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCheckout } from '@/providers/checkout-provider';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentFormContent() {
  const stripe = useStripe();
  const elements = useElements();
  const { state, dispatch, total } = useCheckout();
  const [error, setError] = useState<string | null>(null);

  const paymentMutation = useMutation({
    mutationFn: async () => {
      // Create payment intent
      const intentRes = await fetch('/api/checkout/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          shipping: state.shipping,
          items: state.cart,
        }),
      });
      const { clientSecret } = await intentRes.json();

      // Confirm payment
      const { error, paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements!.getElement(CardElement)!,
          billing_details: {
            name: `${state.shipping?.firstName} ${state.shipping?.lastName}`,
          },
        },
      });

      if (error) throw new Error(error.message);
      return paymentIntent;
    },
    onSuccess: () => {
      dispatch({ type: 'SET_STEP', payload: 4 });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Payment</h2>

      <div className="p-4 border rounded-lg">
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' },
              },
            },
          }}
        />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="p-4 bg-muted rounded-lg">
        <div className="flex justify-between font-medium">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => dispatch({ type: 'SET_STEP', payload: 2 })}>
          Back
        </Button>
        <Button
          className="flex-1"
          onClick={() => paymentMutation.mutate()}
          disabled={!stripe || paymentMutation.isPending}
        >
          {paymentMutation.isPending ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}

export function PaymentForm() {
  return (
    <Elements stripe={stripePromise}>
      <PaymentFormContent />
    </Elements>
  );
}
```

## Order Confirmation

```typescript
// components/checkout/order-confirmation.tsx
'use client';

import { useCheckout } from '@/providers/checkout-provider';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect } from 'react';

export function OrderConfirmation() {
  const { state, dispatch } = useCheckout();

  useEffect(() => {
    // Clear cart after successful order
    return () => dispatch({ type: 'CLEAR_CART' });
  }, []);

  return (
    <div className="text-center space-y-6">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <h2 className="text-2xl font-bold">Order Confirmed!</h2>
      <p className="text-muted-foreground">
        Thank you for your purchase. You will receive a confirmation email shortly.
      </p>

      <div className="p-4 bg-muted rounded-lg text-left">
        <p className="font-medium mb-2">Shipping to:</p>
        <p>{state.shipping?.firstName} {state.shipping?.lastName}</p>
        <p>{state.shipping?.address}</p>
        <p>{state.shipping?.city}, {state.shipping?.state} {state.shipping?.zip}</p>
      </div>

      <Button asChild>
        <Link href="/">Continue Shopping</Link>
      </Button>
    </div>
  );
}
```

## Anti-patterns

### Don't Store Sensitive Data in State

```typescript
// BAD - Card details in React state
const [cardNumber, setCardNumber] = useState('');

// GOOD - Use Stripe Elements
<CardElement /> // Stripe handles sensitive data
```

## Related Skills

- [form-validation](./form-validation.md)
- [multi-step-forms](./multi-step-forms.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multi-step checkout
- Stripe integration
- Cart management
