---
id: pt-stripe-billing-portal
name: Stripe Billing Portal
version: 2.0.0
layer: L5
category: payments
description: Customer self-service billing portal for managing subscriptions, payment methods, and invoices
tags: [stripe, billing, portal, self-service, subscriptions, payments]
composes:
  - ../atoms/input-button.md
dependencies:
  stripe: "^17.0.0"
formula: Portal Configuration + Session Creation + Return URL = Self-Service Billing
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Allowing customers to manage their subscriptions
- Payment method updates without support tickets
- Invoice history and download access
- Cancellation and plan change flows
- Tax information updates

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Stripe Billing Portal Flow                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Dashboard: Configure Portal                         │   │
│  │ - Allowed features (cancel, update, etc.)          │   │
│  │ - Business information                              │   │
│  │ - Custom links and branding                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  User clicks "Manage Billing"                              │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Create Portal Session                               │   │
│  │                                                     │   │
│  │ stripe.billingPortal.sessions.create({             │   │
│  │   customer: stripeCustomerId,                      │   │
│  │   return_url: '/account'                           │   │
│  │ })                                                  │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Redirect to Stripe-Hosted Portal                    │   │
│  │ - Update payment method                             │   │
│  │ - View invoices                                     │   │
│  │ - Cancel/change subscription                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Stripe Billing Portal

Enable customer self-service for subscription and payment management.

## Overview

This pattern covers:
- Billing portal configuration
- Portal session creation
- Custom portal flows
- Payment method management
- Invoice history
- Deep linking to specific sections

## Implementation

### Billing Portal Configuration (Stripe Dashboard)

```typescript
// lib/stripe/portal-config.ts
import { stripe } from './plans';

/**
 * Create or update billing portal configuration
 * Run this once to set up your portal in Stripe
 */
export async function configurePortal() {
  const configuration = await stripe.billingPortal.configurations.create({
    business_profile: {
      headline: 'Manage your subscription',
      privacy_policy_url: `${process.env.NEXT_PUBLIC_APP_URL}/privacy`,
      terms_of_service_url: `${process.env.NEXT_PUBLIC_APP_URL}/terms`,
    },
    features: {
      // Subscription management
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end', // or 'immediately'
        proration_behavior: 'create_prorations',
        cancellation_reason: {
          enabled: true,
          options: [
            'too_expensive',
            'missing_features',
            'switched_service',
            'unused',
            'customer_service',
            'too_complex',
            'low_quality',
            'other',
          ],
        },
      },
      subscription_pause: {
        enabled: false, // Enable if you support pausing
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price', 'quantity', 'promotion_code'],
        proration_behavior: 'create_prorations',
        products: [
          {
            product: process.env.STRIPE_PRODUCT_ID!,
            prices: [
              process.env.STRIPE_STARTER_PRICE_ID!,
              process.env.STRIPE_PRO_PRICE_ID!,
              process.env.STRIPE_ENTERPRISE_PRICE_ID!,
            ],
          },
        ],
      },
      // Payment method management
      payment_method_update: {
        enabled: true,
      },
      // Invoice history
      invoice_history: {
        enabled: true,
      },
      // Coupon redemption
      customer_update: {
        enabled: true,
        allowed_updates: ['email', 'tax_id'],
      },
    },
    default_return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  console.log('Portal configuration created:', configuration.id);
  return configuration;
}
```

### Portal Session Creation

```typescript
// lib/stripe/portal-session.ts
import { stripe } from './plans';
import { prisma } from '@/lib/prisma';

export type PortalFlowType = 
  | 'payment_method_update'
  | 'subscription_cancel'
  | 'subscription_update'
  | 'subscription_update_confirm';

interface CreatePortalSessionParams {
  userId: string;
  returnUrl?: string;
  flowType?: PortalFlowType;
  flowData?: {
    subscriptionId?: string;
    priceId?: string;
  };
}

export async function createPortalSession({
  userId,
  returnUrl,
  flowType,
  flowData,
}: CreatePortalSessionParams) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    throw new Error('No Stripe customer found');
  }

  const sessionParams: Parameters<typeof stripe.billingPortal.sessions.create>[0] = {
    customer: subscription.stripeCustomerId,
    return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  };

  // Add flow for deep linking
  if (flowType) {
    switch (flowType) {
      case 'payment_method_update':
        sessionParams.flow_data = {
          type: 'payment_method_update',
        };
        break;
      
      case 'subscription_cancel':
        if (!subscription.stripeSubscriptionId) {
          throw new Error('No active subscription to cancel');
        }
        sessionParams.flow_data = {
          type: 'subscription_cancel',
          subscription_cancel: {
            subscription: subscription.stripeSubscriptionId,
          },
        };
        break;
      
      case 'subscription_update':
        if (!subscription.stripeSubscriptionId) {
          throw new Error('No active subscription to update');
        }
        sessionParams.flow_data = {
          type: 'subscription_update',
          subscription_update: {
            subscription: subscription.stripeSubscriptionId,
          },
        };
        break;
      
      case 'subscription_update_confirm':
        if (!subscription.stripeSubscriptionId || !flowData?.priceId) {
          throw new Error('Subscription and price required');
        }
        sessionParams.flow_data = {
          type: 'subscription_update_confirm',
          subscription_update_confirm: {
            subscription: subscription.stripeSubscriptionId,
            items: [
              {
                id: await getSubscriptionItemId(subscription.stripeSubscriptionId),
                price: flowData.priceId,
              },
            ],
          },
        };
        break;
    }
  }

  return stripe.billingPortal.sessions.create(sessionParams);
}

async function getSubscriptionItemId(subscriptionId: string): Promise<string> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  return subscription.items.data[0].id;
}
```

### Server Actions for Portal

```typescript
// app/actions/billing-portal.ts
'use server';

import { auth } from '@/lib/auth';
import { createPortalSession, type PortalFlowType } from '@/lib/stripe/portal-session';
import { redirect } from 'next/navigation';

export async function redirectToPortal(flowType?: PortalFlowType, priceId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const portalSession = await createPortalSession({
    userId: session.user.id,
    flowType,
    flowData: priceId ? { priceId } : undefined,
  });

  redirect(portalSession.url);
}

export async function redirectToUpdatePayment() {
  return redirectToPortal('payment_method_update');
}

export async function redirectToCancelSubscription() {
  return redirectToPortal('subscription_cancel');
}

export async function redirectToUpgrade(priceId: string) {
  return redirectToPortal('subscription_update_confirm', priceId);
}
```

### Billing Dashboard Component

```typescript
// components/billing/billing-dashboard.tsx
'use client';

import { useState, useTransition } from 'react';
import { 
  redirectToPortal, 
  redirectToUpdatePayment,
  redirectToCancelSubscription 
} from '@/app/actions/billing-portal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Receipt, 
  Settings, 
  XCircle, 
  Loader2,
  ExternalLink 
} from 'lucide-react';

interface BillingDashboardProps {
  subscription: {
    planName: string;
    status: string;
    currentPeriodEnd: Date | null;
    cancelAtPeriodEnd: boolean;
  };
  paymentMethod: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  } | null;
  invoices: Array<{
    id: string;
    date: Date;
    amount: number;
    status: string;
    pdfUrl: string | null;
  }>;
}

export function BillingDashboard({
  subscription,
  paymentMethod,
  invoices,
}: BillingDashboardProps) {
  const [isPending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handlePortalAction = (action: string, fn: () => Promise<void>) => {
    setLoadingAction(action);
    startTransition(async () => {
      await fn();
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Current Plan
            <Badge variant={subscription.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {subscription.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-2xl font-bold">{subscription.planName}</p>
            {subscription.cancelAtPeriodEnd ? (
              <p className="text-sm text-destructive">
                Cancels on {subscription.currentPeriodEnd?.toLocaleDateString()}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Renews on {subscription.currentPeriodEnd?.toLocaleDateString()}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handlePortalAction('manage', () => redirectToPortal())}
            disabled={isPending}
          >
            {loadingAction === 'manage' && isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Settings className="mr-2 h-4 w-4" />
            )}
            Manage Subscription
          </Button>
          {!subscription.cancelAtPeriodEnd && subscription.planName !== 'Free' && (
            <Button
              variant="ghost"
              className="text-destructive"
              onClick={() => handlePortalAction('cancel', redirectToCancelSubscription)}
              disabled={isPending}
            >
              {loadingAction === 'cancel' && isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              Cancel
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Payment Method
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethod ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded border p-2">
                  <CardBrandIcon brand={paymentMethod.brand} />
                </div>
                <div>
                  <p className="font-medium capitalize">
                    {paymentMethod.brand} •••• {paymentMethod.last4}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Expires {paymentMethod.expiryMonth}/{paymentMethod.expiryYear}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePortalAction('payment', redirectToUpdatePayment)}
                disabled={isPending}
              >
                {loadingAction === 'payment' && isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Update'
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-3">No payment method on file</p>
              <Button
                onClick={() => handlePortalAction('payment', redirectToUpdatePayment)}
                disabled={isPending}
              >
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-5 w-5" />
            Invoice History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      ${invoice.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                      {invoice.status}
                    </Badge>
                    {invoice.pdfUrl && (
                      <Button variant="ghost" size="sm" asChild>
                        <a href={invoice.pdfUrl} target="_blank" rel="noopener">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              No invoices yet
            </p>
          )}
        </CardContent>
        {invoices.length > 0 && (
          <CardFooter>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => handlePortalAction('invoices', () => redirectToPortal())}
              disabled={isPending}
            >
              View All Invoices
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}

function CardBrandIcon({ brand }: { brand: string }) {
  // Simplified - in production use actual card brand logos
  return (
    <span className="text-xs font-bold uppercase">
      {brand}
    </span>
  );
}
```

### Fetching Billing Data

```typescript
// lib/stripe/billing-data.ts
import { stripe } from './plans';
import { prisma } from '@/lib/prisma';

export async function getBillingData(userId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeCustomerId) {
    return {
      subscription: {
        planName: 'Free',
        status: 'ACTIVE',
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
      paymentMethod: null,
      invoices: [],
    };
  }

  // Fetch from Stripe in parallel
  const [customer, invoicesResponse, paymentMethods] = await Promise.all([
    stripe.customers.retrieve(subscription.stripeCustomerId),
    stripe.invoices.list({
      customer: subscription.stripeCustomerId,
      limit: 10,
    }),
    stripe.paymentMethods.list({
      customer: subscription.stripeCustomerId,
      type: 'card',
    }),
  ]);

  // Get default payment method
  const defaultPaymentMethodId = 
    typeof customer !== 'string' && !customer.deleted
      ? customer.invoice_settings.default_payment_method
      : null;

  const defaultPaymentMethod = paymentMethods.data.find(
    (pm) => pm.id === defaultPaymentMethodId
  ) || paymentMethods.data[0];

  return {
    subscription: {
      planName: subscription.planId.charAt(0).toUpperCase() + subscription.planId.slice(1),
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    },
    paymentMethod: defaultPaymentMethod?.card
      ? {
          brand: defaultPaymentMethod.card.brand,
          last4: defaultPaymentMethod.card.last4,
          expiryMonth: defaultPaymentMethod.card.exp_month,
          expiryYear: defaultPaymentMethod.card.exp_year,
        }
      : null,
    invoices: invoicesResponse.data.map((invoice) => ({
      id: invoice.id,
      date: new Date(invoice.created * 1000),
      amount: invoice.amount_paid / 100,
      status: invoice.status || 'unknown',
      pdfUrl: invoice.invoice_pdf,
    })),
  };
}
```

### Billing Page

```typescript
// app/dashboard/billing/page.tsx
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBillingData } from '@/lib/stripe/billing-data';
import { BillingDashboard } from '@/components/billing/billing-dashboard';

export default async function BillingPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/login');
  }

  const billingData = await getBillingData(session.user.id);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription, payment methods, and billing history
        </p>
      </div>

      <BillingDashboard {...billingData} />
    </div>
  );
}
```

## Variants

### Custom Portal UI (No Stripe Redirect)

```typescript
// components/billing/custom-payment-form.tsx
'use client';

import { useState } from 'react';
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || 'An error occurred');
      setLoading(false);
      return;
    }

    const { error: confirmError } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/billing/update-success`,
      },
    });

    if (confirmError) {
      setError(confirmError.message || 'An error occurred');
    } else {
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? 'Saving...' : 'Save Payment Method'}
      </Button>
    </form>
  );
}

export function CustomPaymentForm({ 
  clientSecret, 
  onSuccess 
}: { 
  clientSecret: string;
  onSuccess: () => void;
}) {
  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <PaymentForm onSuccess={onSuccess} />
    </Elements>
  );
}
```

### Embedded Portal

```typescript
// Use Stripe's embedded customer portal (requires additional setup)
// See: https://stripe.com/docs/customer-management/integrate-customer-portal
```

## Anti-patterns

1. **Not configuring portal** - Configure portal in Stripe Dashboard or via API
2. **Hardcoded return URLs** - Use environment variables for URLs
3. **Missing webhook handlers** - Portal actions trigger webhooks; handle them
4. **No error handling** - Handle cases where customer doesn't exist
5. **Exposing Stripe IDs** - Don't expose internal Stripe IDs to frontend

## Related Skills

- [[stripe-subscriptions]] - Subscription management
- [[stripe-webhooks]] - Handle portal-triggered events
- [[stripe-checkout]] - New subscription checkout

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial billing portal pattern with deep linking and custom UI options
