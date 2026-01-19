---
id: pt-payment-request-api
name: Payment Request API
version: 2.0.0
layer: L5
category: payments
description: Native browser payment UI for streamlined checkout experiences
tags: [payment, checkout, payment-request, apple-pay, google-pay, browser]
composes:
  - ../atoms/input-button.md
dependencies: []
formula: Payment Request + Stripe/Backend + Token Processing = Native Checkout
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Streamlined checkout with saved cards
- Apple Pay / Google Pay integration
- Mobile-optimized payment flows
- One-click checkout experiences
- Reducing checkout friction

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Payment Request API Flow                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Check Support                                       │   │
│  │ if (window.PaymentRequest) { ... }                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  User clicks "Pay"                                          │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ new PaymentRequest(methods, details, options)       │   │
│  │                                                     │   │
│  │ methods: ['basic-card', 'apple-pay', 'google-pay'] │   │
│  │ details: { total, displayItems }                   │   │
│  │ options: { requestShipping, requestEmail }          │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Native Payment Sheet                                │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ [Apple Pay] [Google Pay] [Card]                 │ │   │
│  │ │                                                 │ │   │
│  │ │ Total: $99.00                                   │ │   │
│  │ │         [Face ID / Touch ID]                    │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Process token on server → Stripe/Payment Gateway          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Payment Request API

## Overview

Use the Payment Request API to provide a native browser payment experience with support for credit cards, Apple Pay, Google Pay, and other payment methods.

## Implementation

### Payment Types

```tsx
// lib/payment/types.ts
export interface PaymentItem {
  label: string;
  amount: {
    currency: string;
    value: string;
  };
  pending?: boolean;
}

export interface PaymentOptions {
  items: PaymentItem[];
  total: PaymentItem;
  shippingOptions?: ShippingOption[];
  requestShipping?: boolean;
  requestPayerName?: boolean;
  requestPayerEmail?: boolean;
  requestPayerPhone?: boolean;
}

export interface ShippingOption {
  id: string;
  label: string;
  amount: {
    currency: string;
    value: string;
  };
  selected?: boolean;
}

export interface PaymentResult {
  methodName: string;
  details: PaymentMethodDetails;
  shippingAddress?: PaymentAddress;
  shippingOption?: string;
  payerName?: string;
  payerEmail?: string;
  payerPhone?: string;
}

export interface PaymentMethodDetails {
  cardNumber?: string;
  cardholderName?: string;
  expiryMonth?: string;
  expiryYear?: string;
  cardSecurityCode?: string;
  billingAddress?: PaymentAddress;
  // Apple Pay / Google Pay token
  token?: string;
}

export interface PaymentAddress {
  country: string;
  addressLine: string[];
  region: string;
  city: string;
  postalCode: string;
  recipient?: string;
  phone?: string;
}
```

### Payment Request Hook

```tsx
// hooks/use-payment-request.ts
'use client';

import { useState, useCallback, useRef } from 'react';
import { PaymentOptions, PaymentResult, ShippingOption } from '@/lib/payment/types';

interface UsePaymentRequestOptions {
  supportedMethods?: PaymentMethodData[];
  onShippingAddressChange?: (address: PaymentAddress) => Promise<{
    shippingOptions?: ShippingOption[];
    total?: PaymentItem;
  }>;
  onShippingOptionChange?: (optionId: string) => Promise<{
    total?: PaymentItem;
    displayItems?: PaymentItem[];
  }>;
}

interface PaymentMethodData {
  supportedMethods: string;
  data?: Record<string, unknown>;
}

const DEFAULT_METHODS: PaymentMethodData[] = [
  {
    supportedMethods: 'basic-card',
    data: {
      supportedNetworks: ['visa', 'mastercard', 'amex', 'discover'],
      supportedTypes: ['credit', 'debit'],
    },
  },
];

export function usePaymentRequest(options: UsePaymentRequestOptions = {}) {
  const [isSupported, setIsSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return 'PaymentRequest' in window;
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentRequestRef = useRef<PaymentRequest | null>(null);

  const canMakePayment = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;

    try {
      const request = new PaymentRequest(
        options.supportedMethods || DEFAULT_METHODS,
        {
          total: {
            label: 'Total',
            amount: { currency: 'USD', value: '0.00' },
          },
        }
      );

      const result = await request.canMakePayment();
      return result;
    } catch {
      return false;
    }
  }, [isSupported, options.supportedMethods]);

  const requestPayment = useCallback(
    async (paymentOptions: PaymentOptions): Promise<PaymentResult | null> => {
      if (!isSupported) {
        setError('Payment Request API not supported');
        return null;
      }

      setIsProcessing(true);
      setError(null);

      try {
        const details: PaymentDetailsInit = {
          displayItems: paymentOptions.items.map((item) => ({
            label: item.label,
            amount: item.amount,
            pending: item.pending,
          })),
          total: {
            label: paymentOptions.total.label,
            amount: paymentOptions.total.amount,
          },
        };

        if (paymentOptions.shippingOptions) {
          details.shippingOptions = paymentOptions.shippingOptions.map((opt) => ({
            id: opt.id,
            label: opt.label,
            amount: opt.amount,
            selected: opt.selected,
          }));
        }

        const requestOptions: PaymentOptions = {};

        if (paymentOptions.requestShipping) {
          requestOptions.requestShipping = true;
        }
        if (paymentOptions.requestPayerName) {
          requestOptions.requestPayerName = true;
        }
        if (paymentOptions.requestPayerEmail) {
          requestOptions.requestPayerEmail = true;
        }
        if (paymentOptions.requestPayerPhone) {
          requestOptions.requestPayerPhone = true;
        }

        const request = new PaymentRequest(
          options.supportedMethods || DEFAULT_METHODS,
          details,
          requestOptions
        );

        paymentRequestRef.current = request;

        // Handle shipping address change
        if (options.onShippingAddressChange) {
          request.addEventListener('shippingaddresschange', async (event) => {
            const evt = event as PaymentRequestUpdateEvent;
            const address = request.shippingAddress;

            if (address) {
              const updates = await options.onShippingAddressChange!(address as PaymentAddress);
              
              evt.updateWith({
                shippingOptions: updates.shippingOptions?.map((opt) => ({
                  id: opt.id,
                  label: opt.label,
                  amount: opt.amount,
                  selected: opt.selected,
                })),
                total: updates.total ? {
                  label: updates.total.label,
                  amount: updates.total.amount,
                } : details.total,
              });
            }
          });
        }

        // Handle shipping option change
        if (options.onShippingOptionChange) {
          request.addEventListener('shippingoptionchange', async (event) => {
            const evt = event as PaymentRequestUpdateEvent;
            const optionId = request.shippingOption;

            if (optionId) {
              const updates = await options.onShippingOptionChange!(optionId);
              
              evt.updateWith({
                displayItems: updates.displayItems?.map((item) => ({
                  label: item.label,
                  amount: item.amount,
                  pending: item.pending,
                })),
                total: updates.total ? {
                  label: updates.total.label,
                  amount: updates.total.amount,
                } : details.total,
              });
            }
          });
        }

        const response = await request.show();

        // Create result object
        const result: PaymentResult = {
          methodName: response.methodName,
          details: response.details as PaymentMethodDetails,
          shippingAddress: response.shippingAddress as PaymentAddress | undefined,
          shippingOption: response.shippingOption || undefined,
          payerName: response.payerName || undefined,
          payerEmail: response.payerEmail || undefined,
          payerPhone: response.payerPhone || undefined,
        };

        // Complete the payment
        await response.complete('success');

        setIsProcessing(false);
        return result;
      } catch (err) {
        setIsProcessing(false);
        
        if ((err as Error).name === 'AbortError') {
          setError('Payment cancelled');
          return null;
        }

        setError((err as Error).message);
        return null;
      }
    },
    [isSupported, options]
  );

  const abort = useCallback(() => {
    if (paymentRequestRef.current) {
      paymentRequestRef.current.abort();
    }
  }, []);

  return {
    isSupported,
    isProcessing,
    error,
    canMakePayment,
    requestPayment,
    abort,
  };
}
```

### Payment Button Component

```tsx
// components/payment-button.tsx
'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Loader2, AlertCircle } from 'lucide-react';
import { usePaymentRequest } from '@/hooks/use-payment-request';
import { PaymentOptions, PaymentResult, PaymentItem, ShippingOption } from '@/lib/payment/types';

interface PaymentButtonProps {
  items: PaymentItem[];
  total: PaymentItem;
  shippingOptions?: ShippingOption[];
  requestShipping?: boolean;
  requestPayerName?: boolean;
  requestPayerEmail?: boolean;
  onPaymentComplete: (result: PaymentResult) => Promise<void>;
  onPaymentError?: (error: string) => void;
  className?: string;
  children?: React.ReactNode;
}

export function PaymentButton({
  items,
  total,
  shippingOptions,
  requestShipping = false,
  requestPayerName = true,
  requestPayerEmail = true,
  onPaymentComplete,
  onPaymentError,
  className = '',
  children,
}: PaymentButtonProps) {
  const [canPay, setCanPay] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const {
    isSupported,
    isProcessing,
    error,
    canMakePayment,
    requestPayment,
  } = usePaymentRequest({
    onShippingAddressChange: async (address) => {
      // Calculate shipping based on address
      console.log('Shipping to:', address.country, address.postalCode);
      return {
        shippingOptions,
      };
    },
    onShippingOptionChange: async (optionId) => {
      const option = shippingOptions?.find((o) => o.id === optionId);
      if (option) {
        const newTotal = {
          ...total,
          amount: {
            ...total.amount,
            value: (
              parseFloat(total.amount.value) +
              parseFloat(option.amount.value)
            ).toFixed(2),
          },
        };
        return { total: newTotal };
      }
      return {};
    },
  });

  useEffect(() => {
    canMakePayment().then(setCanPay);
  }, [canMakePayment]);

  const handleClick = async () => {
    const paymentOptions: PaymentOptions = {
      items,
      total,
      shippingOptions,
      requestShipping,
      requestPayerName,
      requestPayerEmail,
    };

    const result = await requestPayment(paymentOptions);

    if (result) {
      setIsCompleting(true);
      try {
        await onPaymentComplete(result);
      } catch (err) {
        onPaymentError?.((err as Error).message);
      } finally {
        setIsCompleting(false);
      }
    } else if (error) {
      onPaymentError?.(error);
    }
  };

  if (!isSupported) {
    return (
      <div className={`text-center ${className}`}>
        <button
          disabled
          className="w-full py-3 px-4 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
        >
          Browser payments not supported
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Please use the standard checkout form
        </p>
      </div>
    );
  }

  const isLoading = isProcessing || isCompleting;

  return (
    <div className={className}>
      <button
        onClick={handleClick}
        disabled={!canPay || isLoading}
        className={`
          w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2
          transition-colors
          ${canPay && !isLoading
            ? 'bg-black text-white hover:bg-gray-800'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {children || `Pay ${total.amount.currency} ${total.amount.value}`}
          </>
        )}
      </button>

      {error && error !== 'Payment cancelled' && (
        <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
}
```

### Checkout Component

```tsx
// components/checkout.tsx
'use client';

import { useState } from 'react';
import { PaymentButton } from './payment-button';
import { PaymentItem, PaymentResult, ShippingOption } from '@/lib/payment/types';
import { CheckCircle, Package, Truck } from 'lucide-react';

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CheckoutProps {
  items: CheckoutItem[];
  currency?: string;
  onComplete?: (result: PaymentResult) => void;
}

export function Checkout({
  items,
  currency = 'USD',
  onComplete,
}: CheckoutProps) {
  const [isComplete, setIsComplete] = useState(false);
  const [orderDetails, setOrderDetails] = useState<PaymentResult | null>(null);
  const [selectedShipping, setSelectedShipping] = useState('standard');

  const shippingOptions: ShippingOption[] = [
    {
      id: 'standard',
      label: 'Standard Shipping (5-7 days)',
      amount: { currency, value: '5.99' },
      selected: selectedShipping === 'standard',
    },
    {
      id: 'express',
      label: 'Express Shipping (2-3 days)',
      amount: { currency, value: '12.99' },
      selected: selectedShipping === 'express',
    },
    {
      id: 'overnight',
      label: 'Overnight Shipping',
      amount: { currency, value: '24.99' },
      selected: selectedShipping === 'overnight',
    },
  ];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = parseFloat(
    shippingOptions.find((o) => o.id === selectedShipping)?.amount.value || '0'
  );
  const tax = subtotal * 0.08; // 8% tax
  const total = subtotal + shipping + tax;

  const paymentItems: PaymentItem[] = [
    ...items.map((item) => ({
      label: `${item.name} x ${item.quantity}`,
      amount: {
        currency,
        value: (item.price * item.quantity).toFixed(2),
      },
    })),
    {
      label: 'Shipping',
      amount: { currency, value: shipping.toFixed(2) },
    },
    {
      label: 'Tax',
      amount: { currency, value: tax.toFixed(2) },
    },
  ];

  const paymentTotal: PaymentItem = {
    label: 'Total',
    amount: { currency, value: total.toFixed(2) },
  };

  const handlePaymentComplete = async (result: PaymentResult) => {
    // Process payment on server
    const response = await fetch('/api/payments/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paymentResult: result,
        items,
        total,
      }),
    });

    if (!response.ok) {
      throw new Error('Payment processing failed');
    }

    setOrderDetails(result);
    setIsComplete(true);
    onComplete?.(result);
  };

  if (isComplete && orderDetails) {
    return (
      <div className="max-w-md mx-auto p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
        <p className="text-gray-600 mb-6">
          Thank you for your order, {orderDetails.payerName || 'Customer'}!
        </p>

        {orderDetails.shippingAddress && (
          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
            <h3 className="font-medium flex items-center gap-2 mb-2">
              <Truck className="w-4 h-4" />
              Shipping to:
            </h3>
            <p className="text-sm text-gray-600">
              {orderDetails.shippingAddress.recipient}<br />
              {orderDetails.shippingAddress.addressLine.join(', ')}<br />
              {orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.region} {orderDetails.shippingAddress.postalCode}<br />
              {orderDetails.shippingAddress.country}
            </p>
          </div>
        )}

        <button
          onClick={() => {
            setIsComplete(false);
            setOrderDetails(null);
          }}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Checkout</h2>

      {/* Order Summary */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Order Summary
        </h3>

        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <hr />

          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>

          <hr />

          <div className="flex justify-between text-lg font-bold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Options */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Shipping Method
        </h3>

        <div className="space-y-2">
          {shippingOptions.map((option) => (
            <label
              key={option.id}
              className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                selectedShipping === option.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="shipping"
                  value={option.id}
                  checked={selectedShipping === option.id}
                  onChange={(e) => setSelectedShipping(e.target.value)}
                  className="text-blue-600"
                />
                <span>{option.label}</span>
              </div>
              <span className="font-medium">${option.amount.value}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Payment Button */}
      <PaymentButton
        items={paymentItems}
        total={paymentTotal}
        shippingOptions={shippingOptions}
        requestShipping
        requestPayerName
        requestPayerEmail
        onPaymentComplete={handlePaymentComplete}
        onPaymentError={(error) => console.error('Payment error:', error)}
      />

      <p className="text-center text-sm text-gray-500 mt-4">
        Or use the standard checkout form below
      </p>
    </div>
  );
}
```

### Payment Processing API

```tsx
// app/api/payments/process/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { paymentResult, items, total } = await request.json();

  try {
    // Validate payment details
    if (!paymentResult || !paymentResult.details) {
      return NextResponse.json(
        { error: 'Invalid payment details' },
        { status: 400 }
      );
    }

    // Process payment with your payment processor
    // This would typically integrate with Stripe, PayPal, etc.
    console.log('Processing payment:', {
      method: paymentResult.methodName,
      amount: total,
      items: items.length,
    });

    // For demo purposes, simulate processing
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Create order in database
    const orderId = `order-${Date.now()}`;

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Payment processed successfully',
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed' },
      { status: 500 }
    );
  }
}
```

## Usage

```tsx
// app/checkout/page.tsx
import { Checkout } from '@/components/checkout';

const cartItems = [
  { id: '1', name: 'Premium Headphones', price: 199.99, quantity: 1 },
  { id: '2', name: 'USB-C Cable', price: 19.99, quantity: 2 },
];

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Checkout
          items={cartItems}
          currency="USD"
          onComplete={(result) => {
            console.log('Order completed:', result);
          }}
        />
      </div>
    </div>
  );
}
```

## Related Skills

- [[stripe-webhooks]] - Stripe integration
- [[stripe-billing-portal]] - Subscription billing
- [[form-validation]] - Form handling
- [[checkout]] - Checkout flow

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Payment Request API hook
- Payment button component
- Full checkout component
- Shipping options support
- Payment processing API
