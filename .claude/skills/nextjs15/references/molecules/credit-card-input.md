---
id: m-credit-card-input
name: Credit Card Input
version: 2.0.0
layer: L2
category: forms
description: Credit card input with formatting, validation, and card type detection
tags: [credit-card, payment, form, validation, stripe, card]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "CreditCardInput = Input(a-input-text) + Icon(a-display-icon)"
composes:
  - ../atoms/input-text.md
  - ../atoms/display-icon.md
dependencies:
  react: "^19.0.0"
  "@stripe/stripe-js": "^4.0.0"
  "@stripe/react-stripe-js": "^2.8.0"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Credit Card Input

## Overview

A credit card input component with automatic formatting, card type detection, and validation. Can be used standalone or integrated with Stripe Elements for secure payment processing.

## Composition Diagram

```
+----------------------------------------------------------+
|                    CreditCardInput                        |
|  +----------------------------------------------------+  |
|  |  Card Number                                       |  |
|  |  +------------------------------------------+----+ |  |
|  |  |  Input                                   |Icon| |  |
|  |  | [1234 5678 9012 3456                   ] |Visa| |  |
|  |  +------------------------------------------+----+ |  |
|  +----------------------------------------------------+  |
|                                                          |
|  +------------------------+  +------------------------+  |
|  |  Expiry                |  |  CVC                   |  |
|  |  +-----------------+   |  |  +-----------------+   |  |
|  |  |  Input          |   |  |  |  Input          |   |  |
|  |  | [MM/YY        ] |   |  |  | [123          ] |   |  |
|  |  +-----------------+   |  |  +-----------------+   |  |
|  +------------------------+  +------------------------+  |
+----------------------------------------------------------+
```

## Implementation - Standalone

```tsx
// components/ui/credit-card-input.tsx
'use client';

import * as React from 'react';
import { CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// Card type detection patterns
const CARD_TYPES = {
  visa: /^4/,
  mastercard: /^5[1-5]|^2[2-7]/,
  amex: /^3[47]/,
  discover: /^6(?:011|5)/,
  diners: /^3(?:0[0-5]|[68])/,
  jcb: /^(?:2131|1800|35)/,
} as const;

type CardType = keyof typeof CARD_TYPES | null;

export interface CreditCardData {
  number: string;
  expiry: string;
  cvc: string;
  cardType: CardType;
  isValid: boolean;
}

export interface CreditCardInputProps {
  value?: CreditCardData;
  onChange?: (data: CreditCardData) => void;
  onComplete?: (data: CreditCardData) => void;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

function detectCardType(number: string): CardType {
  const cleaned = number.replace(/\D/g, '');
  for (const [type, pattern] of Object.entries(CARD_TYPES)) {
    if (pattern.test(cleaned)) {
      return type as CardType;
    }
  }
  return null;
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ').substring(0, 19); // Max 16 digits + 3 spaces
}

function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
  }
  return cleaned;
}

function validateCard(data: Omit<CreditCardData, 'isValid'>): boolean {
  const { number, expiry, cvc } = data;
  const cleanNumber = number.replace(/\D/g, '');
  
  // Check number length
  if (cleanNumber.length < 13 || cleanNumber.length > 19) return false;
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  if (sum % 10 !== 0) return false;
  
  // Check expiry
  const [month, year] = expiry.split('/').map(s => parseInt(s, 10));
  if (!month || !year || month < 1 || month > 12) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }
  
  // Check CVC
  const cvcLength = data.cardType === 'amex' ? 4 : 3;
  if (cvc.length !== cvcLength) return false;
  
  return true;
}

export function CreditCardInput({
  value,
  onChange,
  onComplete,
  disabled = false,
  error = false,
  className,
}: CreditCardInputProps) {
  const [number, setNumber] = React.useState(value?.number || '');
  const [expiry, setExpiry] = React.useState(value?.expiry || '');
  const [cvc, setCvc] = React.useState(value?.cvc || '');
  const [cardType, setCardType] = React.useState<CardType>(value?.cardType || null);
  
  const expiryRef = React.useRef<HTMLInputElement>(null);
  const cvcRef = React.useRef<HTMLInputElement>(null);

  const updateValue = React.useCallback((
    newNumber: string,
    newExpiry: string,
    newCvc: string,
    newCardType: CardType
  ) => {
    const data: CreditCardData = {
      number: newNumber,
      expiry: newExpiry,
      cvc: newCvc,
      cardType: newCardType,
      isValid: validateCard({ number: newNumber, expiry: newExpiry, cvc: newCvc, cardType: newCardType }),
    };
    
    onChange?.(data);
    
    if (data.isValid) {
      onComplete?.(data);
    }
  }, [onChange, onComplete]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    const type = detectCardType(formatted);
    setNumber(formatted);
    setCardType(type);
    updateValue(formatted, expiry, cvc, type);
    
    // Auto-focus expiry when number is complete
    if (formatted.replace(/\D/g, '').length === 16) {
      expiryRef.current?.focus();
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
    updateValue(number, formatted, cvc, cardType);
    
    // Auto-focus CVC when expiry is complete
    if (formatted.length === 5) {
      cvcRef.current?.focus();
    }
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, cardType === 'amex' ? 4 : 3);
    setCvc(value);
    updateValue(number, expiry, value, cardType);
  };

  const CardIcon = () => {
    if (!cardType) {
      return <CreditCard className="h-5 w-5 text-muted-foreground" />;
    }
    
    // You could use actual card brand icons here
    const icons: Record<string, string> = {
      visa: '💳 Visa',
      mastercard: '💳 MC',
      amex: '💳 Amex',
      discover: '💳 Disc',
      diners: '💳 Diners',
      jcb: '💳 JCB',
    };
    
    return <span className="text-xs font-medium">{icons[cardType]}</span>;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Card Number */}
      <div className="relative">
        <Input
          type="text"
          inputMode="numeric"
          placeholder="1234 5678 9012 3456"
          value={number}
          onChange={handleNumberChange}
          disabled={disabled}
          className={cn(
            'pr-14',
            error && 'border-destructive'
          )}
          maxLength={19}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <CardIcon />
        </div>
      </div>

      {/* Expiry and CVC */}
      <div className="flex gap-3">
        <div className="flex-1">
          <Input
            ref={expiryRef}
            type="text"
            inputMode="numeric"
            placeholder="MM/YY"
            value={expiry}
            onChange={handleExpiryChange}
            disabled={disabled}
            className={cn(error && 'border-destructive')}
            maxLength={5}
          />
        </div>
        <div className="flex-1">
          <Input
            ref={cvcRef}
            type="text"
            inputMode="numeric"
            placeholder="CVC"
            value={cvc}
            onChange={handleCvcChange}
            disabled={disabled}
            className={cn(error && 'border-destructive')}
            maxLength={cardType === 'amex' ? 4 : 3}
          />
        </div>
      </div>
    </div>
  );
}
```

## Stripe Elements Integration

```tsx
// components/ui/stripe-card-input.tsx
'use client';

import * as React from 'react';
import {
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { cn } from '@/lib/utils';

interface StripeCardInputProps {
  onReady?: () => void;
  onChange?: (event: any) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
}

export function StripeCardInput({
  onReady,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  className,
}: StripeCardInputProps) {
  const options = {
    style: {
      base: {
        fontSize: '16px',
        color: 'hsl(var(--foreground))',
        '::placeholder': {
          color: 'hsl(var(--muted-foreground))',
        },
        fontFamily: 'inherit',
      },
      invalid: {
        color: 'hsl(var(--destructive))',
        iconColor: 'hsl(var(--destructive))',
      },
    },
    hidePostalCode: true,
    disabled,
  };

  return (
    <div
      className={cn(
        'rounded-md border border-input bg-background px-3 py-2 ring-offset-background',
        'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <CardElement
        options={options}
        onReady={onReady}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
}

// Usage wrapper with Elements provider
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export function StripeCardProvider({ children }: { children: React.ReactNode }) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
```

## Usage - Standalone

```tsx
import { CreditCardInput, CreditCardData } from '@/components/ui/credit-card-input';

function PaymentForm() {
  const [cardData, setCardData] = React.useState<CreditCardData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardData?.isValid) return;
    
    // Process payment...
    console.log('Processing:', cardData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CreditCardInput
        onChange={setCardData}
        onComplete={(data) => console.log('Card complete:', data)}
      />
      
      <Button 
        type="submit" 
        disabled={!cardData?.isValid}
        className="w-full"
      >
        Pay Now
      </Button>
    </form>
  );
}
```

## Usage - Stripe Elements

```tsx
import {
  StripeCardProvider,
  StripeCardInput,
} from '@/components/ui/stripe-card-input';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = React.useState<string | null>(null);
  const [processing, setProcessing] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setError(null);

    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: elements.getElement(CardElement)!,
    });

    if (error) {
      setError(error.message || 'An error occurred');
      setProcessing(false);
      return;
    }

    // Send paymentMethod.id to your server
    console.log('PaymentMethod:', paymentMethod);
    setProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <StripeCardInput
        onChange={(e) => {
          if (e.error) setError(e.error.message);
          else setError(null);
        }}
      />
      
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
      
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="w-full"
      >
        {processing ? 'Processing...' : 'Pay Now'}
      </Button>
    </form>
  );
}

// Wrap with provider
function PaymentPage() {
  return (
    <StripeCardProvider>
      <CheckoutForm />
    </StripeCardProvider>
  );
}
```

## Dependencies

```bash
# For Stripe integration
npm install @stripe/stripe-js @stripe/react-stripe-js
```

## Related Skills

- [checkout-form](../organisms/checkout-form.md) - Complete checkout
- [stripe-checkout](../patterns/stripe-checkout.md) - Stripe patterns
- [form-field](./form-field.md) - Form field wrapper

---

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation
- Standalone with Luhn validation
- Stripe Elements integration
- Card type detection
