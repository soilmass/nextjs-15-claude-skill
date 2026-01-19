---
id: pt-stripe-subscriptions
name: Stripe Subscriptions
version: 2.0.0
layer: L5
category: payments
description: Subscription billing with Stripe, including plan management, trials, upgrades, downgrades, and proration
tags: [stripe, subscriptions, billing, saas, recurring-payments, plans]
composes: []
dependencies:
  stripe: "^17.0.0"
formula: Plans + Checkout + Webhooks + Database Sync = SaaS Billing
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

- Building SaaS with recurring billing
- Offering multiple pricing tiers
- Implementing free trials
- Handling plan upgrades/downgrades
- Usage-based billing add-ons

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Stripe Subscriptions Architecture                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pricing Tiers                                       │   │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐              │   │
│  │ │  Free   │ │   Pro   │ │Enterprise│              │   │
│  │ │  $0/mo  │ │ $19/mo  │ │ $99/mo  │              │   │
│  │ └─────────┘ └─────────┘ └─────────┘              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Subscription Lifecycle:                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 1. Create Checkout Session                          │   │
│  │ 2. Customer completes payment                       │   │
│  │ 3. Webhook: customer.subscription.created           │   │
│  │ 4. Update user.subscriptionTier in database         │   │
│  │ 5. Recurring: invoice.paid / invoice.payment_failed│   │
│  │ 6. Lifecycle: updated, canceled, trial_will_end    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Proration:                                                 │
│  - Upgrade: charge difference immediately                  │
│  - Downgrade: credit applied to next invoice              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Stripe Subscriptions

Comprehensive subscription management with Stripe for SaaS applications.

## Overview

This pattern covers:
- Subscription creation and management
- Plan/pricing tier configuration
- Trials, upgrades, and downgrades
- Proration handling
- Subscription lifecycle events
- Usage-based billing

## Implementation

### Subscription Plans Configuration

```typescript
// lib/stripe/plans.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export type PlanId = 'free' | 'starter' | 'pro' | 'enterprise';

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  features: string[];
  limits: {
    projects: number;
    storage: number; // in GB
    apiCalls: number; // per month
    teamMembers: number;
  };
  stripePriceId: string | null;
  price: {
    monthly: number;
    yearly: number;
  };
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    description: 'For individuals getting started',
    features: [
      '1 project',
      '1GB storage',
      '1,000 API calls/month',
      'Community support',
    ],
    limits: {
      projects: 1,
      storage: 1,
      apiCalls: 1000,
      teamMembers: 1,
    },
    stripePriceId: null,
    price: { monthly: 0, yearly: 0 },
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    description: 'For small teams',
    features: [
      '5 projects',
      '10GB storage',
      '10,000 API calls/month',
      'Email support',
      'Basic analytics',
    ],
    limits: {
      projects: 5,
      storage: 10,
      apiCalls: 10000,
      teamMembers: 5,
    },
    stripePriceId: process.env.STRIPE_STARTER_PRICE_ID!,
    price: { monthly: 19, yearly: 190 },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    description: 'For growing businesses',
    features: [
      'Unlimited projects',
      '100GB storage',
      '100,000 API calls/month',
      'Priority support',
      'Advanced analytics',
      'Custom domains',
    ],
    limits: {
      projects: -1, // unlimited
      storage: 100,
      apiCalls: 100000,
      teamMembers: 20,
    },
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: { monthly: 49, yearly: 490 },
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'Unlimited API calls',
      'Dedicated support',
      'SLA guarantee',
      'SSO/SAML',
      'Custom integrations',
    ],
    limits: {
      projects: -1,
      storage: -1,
      apiCalls: -1,
      teamMembers: -1,
    },
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    price: { monthly: 199, yearly: 1990 },
  },
};

export function getPlanByPriceId(priceId: string): Plan | undefined {
  return Object.values(PLANS).find((plan) => plan.stripePriceId === priceId);
}

export function getPlanLimits(planId: PlanId) {
  return PLANS[planId].limits;
}
```

### Database Schema for Subscriptions

```typescript
// prisma/schema.prisma additions
/*
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  subscription  Subscription?
  usage         Usage[]
}

model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  stripeCustomerId     String   @unique
  stripeSubscriptionId String?  @unique
  stripePriceId        String?
  
  planId               String   @default("free")
  status               SubscriptionStatus @default(ACTIVE)
  
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean  @default(false)
  canceledAt           DateTime?
  
  trialStart           DateTime?
  trialEnd             DateTime?
  
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  @@index([stripeCustomerId])
  @@index([status])
}

model Usage {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  metric    String   // 'api_calls', 'storage', etc.
  value     Int
  period    DateTime // Start of billing period
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, metric, period])
  @@index([userId, period])
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  INCOMPLETE
  INCOMPLETE_EXPIRED
  PAST_DUE
  PAUSED
  TRIALING
  UNPAID
}
*/
```

### Subscription Service

```typescript
// lib/stripe/subscription-service.ts
import { stripe, PLANS, type PlanId } from './plans';
import { prisma } from '@/lib/prisma';
import type Stripe from 'stripe';

export class SubscriptionService {
  /**
   * Get or create Stripe customer for user
   */
  async getOrCreateCustomer(userId: string, email: string): Promise<string> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (subscription?.stripeCustomerId) {
      return subscription.stripeCustomerId;
    }

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      metadata: { userId },
    });

    // Create or update subscription record
    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        stripeCustomerId: customer.id,
        planId: 'free',
      },
      update: {
        stripeCustomerId: customer.id,
      },
    });

    return customer.id;
  }

  /**
   * Create checkout session for new subscription
   */
  async createCheckoutSession(params: {
    userId: string;
    email: string;
    planId: PlanId;
    billingPeriod: 'monthly' | 'yearly';
    successUrl: string;
    cancelUrl: string;
  }): Promise<Stripe.Checkout.Session> {
    const { userId, email, planId, billingPeriod, successUrl, cancelUrl } = params;
    
    const plan = PLANS[planId];
    if (!plan.stripePriceId) {
      throw new Error('Cannot checkout free plan');
    }

    const customerId = await this.getOrCreateCustomer(userId, email);

    // Check for existing subscription
    const existingSub = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSub?.stripeSubscriptionId) {
      throw new Error('User already has an active subscription. Use upgrade instead.');
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14, // 14-day trial
        metadata: {
          userId,
          planId,
        },
      },
      success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        planId,
      },
    });

    return session;
  }

  /**
   * Upgrade or downgrade subscription
   */
  async changePlan(params: {
    userId: string;
    newPlanId: PlanId;
    prorate?: boolean;
  }): Promise<Stripe.Subscription> {
    const { userId, newPlanId, prorate = true } = params;

    const newPlan = PLANS[newPlanId];
    if (!newPlan.stripePriceId) {
      throw new Error('Cannot change to free plan. Use cancel instead.');
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    // Get current subscription from Stripe
    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Update subscription with new price
    const updatedSub = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      {
        items: [
          {
            id: stripeSub.items.data[0].id,
            price: newPlan.stripePriceId,
          },
        ],
        proration_behavior: prorate ? 'create_prorations' : 'none',
        metadata: {
          ...stripeSub.metadata,
          planId: newPlanId,
        },
      }
    );

    // Update local database
    await prisma.subscription.update({
      where: { userId },
      data: {
        planId: newPlanId,
        stripePriceId: newPlan.stripePriceId,
      },
    });

    return updatedSub;
  }

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(userId: string): Promise<Stripe.Subscription> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No active subscription found');
    }

    const canceledSub = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
    });

    return canceledSub;
  }

  /**
   * Resume a canceled subscription
   */
  async resumeSubscription(userId: string): Promise<Stripe.Subscription> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeSubscriptionId) {
      throw new Error('No subscription found');
    }

    const resumedSub = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    await prisma.subscription.update({
      where: { userId },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
    });

    return resumedSub;
  }

  /**
   * Get subscription status
   */
  async getSubscriptionStatus(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: {
          select: { email: true },
        },
      },
    });

    if (!subscription) {
      return {
        plan: PLANS.free,
        status: 'ACTIVE' as const,
        isTrialing: false,
        cancelAtPeriodEnd: false,
        currentPeriodEnd: null,
      };
    }

    return {
      plan: PLANS[subscription.planId as PlanId] || PLANS.free,
      status: subscription.status,
      isTrialing: subscription.status === 'TRIALING',
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
      trialEnd: subscription.trialEnd,
    };
  }

  /**
   * Preview proration for plan change
   */
  async previewPlanChange(userId: string, newPlanId: PlanId) {
    const newPlan = PLANS[newPlanId];
    if (!newPlan.stripePriceId) {
      throw new Error('Cannot preview change to free plan');
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.stripeSubscriptionId) {
      return {
        immediate: 0,
        nextBilling: newPlan.price.monthly,
        prorationDate: new Date(),
      };
    }

    const stripeSub = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Get upcoming invoice preview
    const invoice = await stripe.invoices.retrieveUpcoming({
      customer: subscription.stripeCustomerId,
      subscription: subscription.stripeSubscriptionId,
      subscription_items: [
        {
          id: stripeSub.items.data[0].id,
          price: newPlan.stripePriceId,
        },
      ],
      subscription_proration_behavior: 'create_prorations',
    });

    return {
      immediate: invoice.amount_due / 100,
      nextBilling: invoice.lines.data.find(
        (line) => line.price?.id === newPlan.stripePriceId
      )?.amount ?? 0 / 100,
      prorationDate: new Date(invoice.period_start * 1000),
      lines: invoice.lines.data.map((line) => ({
        description: line.description,
        amount: line.amount / 100,
      })),
    };
  }
}

export const subscriptionService = new SubscriptionService();
```

### Server Actions for Subscriptions

```typescript
// app/actions/subscription.ts
'use server';

import { auth } from '@/lib/auth';
import { subscriptionService } from '@/lib/stripe/subscription-service';
import { PLANS, type PlanId } from '@/lib/stripe/plans';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function createSubscription(planId: PlanId) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const checkoutSession = await subscriptionService.createCheckoutSession({
    userId: session.user.id,
    email: session.user.email!,
    planId,
    billingPeriod: 'monthly',
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing?success=true`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });

  if (!checkoutSession.url) {
    throw new Error('Failed to create checkout session');
  }

  redirect(checkoutSession.url);
}

export async function changePlan(newPlanId: PlanId) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await subscriptionService.changePlan({
    userId: session.user.id,
    newPlanId,
    prorate: true,
  });

  revalidatePath('/dashboard/billing');
  return { success: true };
}

export async function cancelSubscription() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await subscriptionService.cancelSubscription(session.user.id);
  
  revalidatePath('/dashboard/billing');
  return { success: true };
}

export async function resumeSubscription() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  await subscriptionService.resumeSubscription(session.user.id);
  
  revalidatePath('/dashboard/billing');
  return { success: true };
}

export async function previewPlanChange(newPlanId: PlanId) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return subscriptionService.previewPlanChange(session.user.id, newPlanId);
}

export async function getSubscriptionStatus() {
  const session = await auth();
  if (!session?.user?.id) {
    return { plan: PLANS.free, status: 'ACTIVE' as const };
  }

  return subscriptionService.getSubscriptionStatus(session.user.id);
}
```

### Subscription Management UI

```typescript
// components/billing/subscription-manager.tsx
'use client';

import { useState, useTransition } from 'react';
import { PLANS, type PlanId } from '@/lib/stripe/plans';
import { 
  changePlan, 
  cancelSubscription, 
  resumeSubscription,
  previewPlanChange 
} from '@/app/actions/subscription';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import { Check, Loader2 } from 'lucide-react';

interface SubscriptionManagerProps {
  currentPlanId: PlanId;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
}

export function SubscriptionManager({
  currentPlanId,
  status,
  cancelAtPeriodEnd,
  currentPeriodEnd,
}: SubscriptionManagerProps) {
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [preview, setPreview] = useState<{
    immediate: number;
    lines: { description: string; amount: number }[];
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handlePlanSelect = async (planId: PlanId) => {
    if (planId === currentPlanId) return;
    
    setSelectedPlan(planId);
    
    if (currentPlanId !== 'free') {
      const previewData = await previewPlanChange(planId);
      setPreview(previewData);
    }
  };

  const handleConfirmChange = () => {
    if (!selectedPlan) return;
    
    startTransition(async () => {
      await changePlan(selectedPlan);
      setSelectedPlan(null);
      setPreview(null);
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      await cancelSubscription();
    });
  };

  const handleResume = () => {
    startTransition(async () => {
      await resumeSubscription();
    });
  };

  return (
    <div className="space-y-8">
      {/* Current Plan Status */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Current Plan</h3>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold">{PLANS[currentPlanId].name}</p>
            <p className="text-muted-foreground">
              {cancelAtPeriodEnd ? (
                <span className="text-destructive">
                  Cancels on {currentPeriodEnd?.toLocaleDateString()}
                </span>
              ) : status === 'TRIALING' ? (
                <span className="text-blue-600">
                  Trial ends {currentPeriodEnd?.toLocaleDateString()}
                </span>
              ) : (
                `Renews on ${currentPeriodEnd?.toLocaleDateString()}`
              )}
            </p>
          </div>
          {cancelAtPeriodEnd ? (
            <Button onClick={handleResume} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Resume Subscription
            </Button>
          ) : currentPlanId !== 'free' ? (
            <Button variant="outline" onClick={handleCancel} disabled={isPending}>
              Cancel Subscription
            </Button>
          ) : null}
        </div>
      </div>

      {/* Plan Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Object.values(PLANS).map((plan) => (
          <div
            key={plan.id}
            className={`relative rounded-lg border p-6 ${
              plan.id === currentPlanId
                ? 'border-primary ring-2 ring-primary'
                : 'hover:border-primary/50'
            }`}
          >
            {plan.id === currentPlanId && (
              <span className="absolute -top-3 left-4 bg-primary px-2 py-1 text-xs text-primary-foreground rounded">
                Current Plan
              </span>
            )}
            
            <h4 className="text-lg font-semibold">{plan.name}</h4>
            <p className="text-3xl font-bold mt-2">
              ${plan.price.monthly}
              <span className="text-sm font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {plan.description}
            </p>

            <ul className="mt-4 space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center text-sm">
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="mt-6 w-full"
              variant={plan.id === currentPlanId ? 'outline' : 'default'}
              disabled={plan.id === currentPlanId || isPending}
              onClick={() => handlePlanSelect(plan.id)}
            >
              {plan.id === currentPlanId
                ? 'Current Plan'
                : plan.id === 'free'
                ? 'Downgrade'
                : currentPlanId === 'free'
                ? 'Upgrade'
                : PLANS[plan.id].price.monthly > PLANS[currentPlanId].price.monthly
                ? 'Upgrade'
                : 'Downgrade'}
            </Button>
          </div>
        ))}
      </div>

      {/* Proration Preview Dialog */}
      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm Plan Change to {selectedPlan && PLANS[selectedPlan].name}
            </DialogTitle>
          </DialogHeader>
          
          {preview && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium">Proration Details</h4>
                <ul className="mt-2 space-y-1 text-sm">
                  {preview.lines.map((line, i) => (
                    <li key={i} className="flex justify-between">
                      <span>{line.description}</span>
                      <span>${line.amount.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between font-semibold border-t pt-2">
                  <span>Due Today</span>
                  <span>${preview.immediate.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPlan(null)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmChange} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### Usage-Based Billing

```typescript
// lib/stripe/usage-tracking.ts
import { stripe } from './plans';
import { prisma } from '@/lib/prisma';

export class UsageTracker {
  /**
   * Record usage for metered billing
   */
  async recordUsage(params: {
    userId: string;
    metric: 'api_calls' | 'storage' | 'bandwidth';
    quantity: number;
  }) {
    const { userId, metric, quantity } = params;

    // Get current billing period start
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.currentPeriodStart) {
      return;
    }

    // Upsert usage record
    await prisma.usage.upsert({
      where: {
        userId_metric_period: {
          userId,
          metric,
          period: subscription.currentPeriodStart,
        },
      },
      create: {
        userId,
        metric,
        value: quantity,
        period: subscription.currentPeriodStart,
      },
      update: {
        value: { increment: quantity },
      },
    });

    // If using Stripe metered billing, report to Stripe
    if (subscription.stripeSubscriptionId) {
      const stripeSub = await stripe.subscriptions.retrieve(
        subscription.stripeSubscriptionId
      );
      
      const meteredItem = stripeSub.items.data.find(
        (item) => item.price.recurring?.usage_type === 'metered'
      );

      if (meteredItem) {
        await stripe.subscriptionItems.createUsageRecord(meteredItem.id, {
          quantity,
          timestamp: Math.floor(Date.now() / 1000),
          action: 'increment',
        });
      }
    }
  }

  /**
   * Get current usage for a user
   */
  async getCurrentUsage(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription?.currentPeriodStart) {
      return {};
    }

    const usage = await prisma.usage.findMany({
      where: {
        userId,
        period: subscription.currentPeriodStart,
      },
    });

    return usage.reduce(
      (acc, u) => ({ ...acc, [u.metric]: u.value }),
      {} as Record<string, number>
    );
  }

  /**
   * Check if user is within plan limits
   */
  async checkLimit(
    userId: string,
    metric: 'projects' | 'storage' | 'apiCalls' | 'teamMembers',
    requestedAmount: number = 1
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    const planId = (subscription?.planId || 'free') as PlanId;
    const plan = PLANS[planId];
    const limit = plan.limits[metric];

    // -1 means unlimited
    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1 };
    }

    const current = await this.getMetricCount(userId, metric);

    return {
      allowed: current + requestedAmount <= limit,
      current,
      limit,
    };
  }

  private async getMetricCount(
    userId: string,
    metric: 'projects' | 'storage' | 'apiCalls' | 'teamMembers'
  ): Promise<number> {
    switch (metric) {
      case 'projects':
        return prisma.project.count({ where: { userId } });
      case 'teamMembers':
        return prisma.teamMember.count({ 
          where: { team: { ownerId: userId } } 
        });
      case 'apiCalls':
      case 'storage':
        const usage = await this.getCurrentUsage(userId);
        return usage[metric] || 0;
      default:
        return 0;
    }
  }
}

export const usageTracker = new UsageTracker();

// Import PLANS
import { PLANS, type PlanId } from './plans';
```

## Variants

### Annual Billing with Discount

```typescript
// lib/stripe/annual-billing.ts
export async function createAnnualCheckout(
  userId: string,
  email: string,
  planId: PlanId
) {
  const plan = PLANS[planId];
  
  // Use annual price ID (configured in Stripe)
  const annualPriceId = process.env[`STRIPE_${planId.toUpperCase()}_ANNUAL_PRICE_ID`];
  
  if (!annualPriceId) {
    throw new Error('Annual pricing not configured');
  }

  return stripe.checkout.sessions.create({
    customer: await subscriptionService.getOrCreateCustomer(userId, email),
    mode: 'subscription',
    line_items: [{ price: annualPriceId, quantity: 1 }],
    // Apply coupon for annual discount
    discounts: [{ coupon: 'ANNUAL_20OFF' }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
  });
}
```

### Seat-Based Pricing

```typescript
// lib/stripe/seat-pricing.ts
export async function updateSeatCount(userId: string, seats: number) {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription?.stripeSubscriptionId) {
    throw new Error('No subscription found');
  }

  const stripeSub = await stripe.subscriptions.retrieve(
    subscription.stripeSubscriptionId
  );

  await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
    items: [
      {
        id: stripeSub.items.data[0].id,
        quantity: seats,
      },
    ],
    proration_behavior: 'create_prorations',
  });
}
```

## Anti-patterns

1. **Not handling webhooks** - Always sync state via webhooks, not checkout success
2. **Caching plan data** - Always check current subscription status server-side
3. **Not handling failed payments** - Implement dunning management
4. **Ignoring proration** - Always show proration preview for plan changes
5. **Hardcoding prices** - Use Stripe price IDs from environment variables

## Related Skills

- [[stripe-webhooks]] - Handle subscription lifecycle events
- [[stripe-billing-portal]] - Customer self-service portal
- [[stripe-checkout]] - One-time payment checkout
- [[rbac]] - Role-based access tied to subscription tier

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial subscription management pattern with plan tiers, usage tracking, and proration
