---
id: r-subscription-billing
name: Subscription Billing
version: 3.0.0
layer: L6
category: recipes
description: Enterprise subscription billing platform with Stripe integration, usage-based pricing, dunning management, and customer portal
tags: [subscriptions, billing, stripe, saas, enterprise, usage-based, dunning]
formula: "SubscriptionBilling = CheckoutPage(t-checkout-page) + DashboardLayout(t-dashboard-layout) + SettingsPage(t-settings-page) + InvoicePage(t-invoice-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + Pricing(o-pricing) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + CheckoutForm(o-checkout-form) + SettingsForm(o-settings-form) + Header(o-header) + Footer(o-footer) + Sidebar(o-sidebar) + NotificationCenter(o-notification-center) + FormField(m-form-field) + StatCard(m-stat-card) + Pagination(m-pagination) + Breadcrumb(m-breadcrumb) + EmptyState(m-empty-state) + ActionMenu(m-action-menu) + CreditCardInput(m-credit-card-input) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + ApiKeys(pt-api-keys) + MultiTenancy(pt-multi-tenancy) + StripeSubscriptions(pt-stripe-subscriptions) + StripeCheckout(pt-stripe-checkout) + StripeBillingPortal(pt-stripe-billing-portal) + StripeWebhooks(pt-stripe-webhooks) + UsageMetering(pt-usage-metering) + TaxCalculation(pt-tax-calculation) + Webhooks(pt-webhooks) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + CronJobs(pt-cron-jobs) + ScheduledTasks(pt-scheduled-tasks) + BackgroundJobs(pt-background-jobs) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Pagination(pt-pagination) + Filtering(pt-filtering) + Sorting(pt-sorting) + DateFormatting(pt-date-formatting) + ExportData(pt-export-data) + Transactions(pt-transactions) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + TestingE2e(pt-testing-e2e) + TestingIntegration(pt-testing-integration)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/form-field.md
  - ../molecules/stat-card.md
  - ../molecules/pagination.md
  - ../molecules/breadcrumb.md
  - ../molecules/empty-state.md
  - ../molecules/action-menu.md
  - ../molecules/credit-card-input.md
  # L3 Organisms - Complex Components
  - ../organisms/pricing.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/checkout-form.md
  - ../organisms/settings-form.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/sidebar.md
  - ../organisms/notification-center.md
  # L4 Templates - Page Layouts
  - ../templates/checkout-page.md
  - ../templates/dashboard-layout.md
  - ../templates/settings-page.md
  - ../templates/invoice-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L5 Patterns - Authentication & Security
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  - ../patterns/api-keys.md
  # L5 Patterns - Multi-tenancy
  - ../patterns/multi-tenancy.md
  # L5 Patterns - Stripe & Billing
  - ../patterns/stripe-subscriptions.md
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-billing-portal.md
  - ../patterns/stripe-webhooks.md
  - ../patterns/usage-metering.md
  - ../patterns/tax-calculation.md
  # L5 Patterns - Webhooks
  - ../patterns/webhooks.md
  # L5 Patterns - Forms & Server Actions
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - Email & Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  # L5 Patterns - Background Jobs
  - ../patterns/cron-jobs.md
  - ../patterns/scheduled-tasks.md
  - ../patterns/background-jobs.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics & Logging
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/pagination.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  - ../patterns/date-formatting.md
  - ../patterns/export-data.md
  - ../patterns/transactions.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-integration.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - stripe@14.0.0
  - resend@3.0.0
skills:
  - stripe-subscriptions
  - webhooks
  - usage-metering
  - multi-tenancy
  - rbac
  - audit-logging
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## Overview

An enterprise-grade subscription billing platform featuring Stripe integration for subscription management, support for multiple pricing models (flat-rate, tiered, usage-based), automated dunning for failed payments, customer self-service portal, and comprehensive billing analytics. Designed for SaaS applications with multi-tenancy and RBAC.

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx                    # Billing overview
│   ├── subscriptions/
│   │   ├── page.tsx                # Subscription list
│   │   └── [id]/page.tsx           # Subscription detail
│   ├── customers/
│   │   ├── page.tsx                # Customer list
│   │   └── [id]/
│   │       ├── page.tsx            # Customer detail
│   │       ├── invoices/page.tsx
│   │       └── usage/page.tsx
│   ├── products/
│   │   ├── page.tsx                # Products & pricing
│   │   └── [id]/page.tsx           # Product detail
│   ├── invoices/
│   │   ├── page.tsx                # Invoice list
│   │   └── [id]/page.tsx           # Invoice detail
│   ├── usage/
│   │   ├── page.tsx                # Usage dashboard
│   │   └── meters/page.tsx         # Usage meters
│   ├── dunning/
│   │   ├── page.tsx                # Dunning overview
│   │   └── campaigns/page.tsx      # Dunning campaigns
│   ├── analytics/page.tsx          # Revenue analytics
│   └── settings/
│       ├── page.tsx
│       ├── team/page.tsx
│       ├── stripe/page.tsx         # Stripe settings
│       ├── webhooks/page.tsx
│       └── api-keys/page.tsx
├── portal/                         # Customer portal
│   ├── layout.tsx
│   ├── page.tsx                    # Portal dashboard
│   ├── subscription/page.tsx       # Manage subscription
│   ├── invoices/page.tsx           # Invoice history
│   ├── payment-methods/page.tsx    # Payment methods
│   └── usage/page.tsx              # Usage history
├── api/
│   ├── subscriptions/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   ├── [id]/cancel/route.ts
│   │   └── [id]/resume/route.ts
│   ├── customers/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── products/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── prices/route.ts
│   ├── invoices/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── usage/
│   │   ├── route.ts                # Report usage
│   │   └── summary/route.ts
│   ├── checkout/route.ts           # Create checkout session
│   ├── portal/route.ts             # Customer portal session
│   ├── webhooks/
│   │   └── stripe/route.ts
│   └── v1/                         # Public API
│       ├── usage/route.ts
│       └── subscriptions/route.ts
└── components/
    ├── subscriptions/
    │   ├── subscription-table.tsx
    │   ├── subscription-card.tsx
    │   └── plan-selector.tsx
    ├── customers/
    │   ├── customer-table.tsx
    │   └── customer-form.tsx
    ├── products/
    │   ├── product-form.tsx
    │   ├── pricing-table.tsx
    │   └── price-form.tsx
    ├── usage/
    │   ├── usage-chart.tsx
    │   └── meter-config.tsx
    ├── dunning/
    │   ├── dunning-pipeline.tsx
    │   └── retry-schedule.tsx
    └── analytics/
        ├── mrr-chart.tsx
        ├── churn-chart.tsx
        └── revenue-metrics.tsx
lib/
├── stripe.ts
├── usage.ts
├── dunning.ts
└── metrics.ts
```

## Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Organization {
  id                  String    @id @default(cuid())
  name                String
  stripeAccountId     String?   @unique
  stripePublishableKey String?
  webhookSecret       String?
  
  // Billing settings
  defaultCurrency     String    @default("usd")
  taxBehavior         TaxBehavior @default(EXCLUSIVE)
  invoicePrefix       String    @default("INV")
  
  members             OrganizationMember[]
  products            Product[]
  customers           Customer[]
  subscriptions       Subscription[]
  invoices            Invoice[]
  usageMeters         UsageMeter[]
  dunningCampaigns    DunningCampaign[]
  apiKeys             ApiKey[]
  webhookEndpoints    WebhookEndpoint[]
  auditLogs           AuditLog[]
  
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}

enum TaxBehavior {
  INCLUSIVE
  EXCLUSIVE
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  avatarUrl     String?
  
  memberships   OrganizationMember[]
  auditLogs     AuditLog[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model OrganizationMember {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           Role         @default(MEMBER)
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime     @default(now())
  
  @@unique([organizationId, userId])
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Product {
  id              String       @id @default(cuid())
  organizationId  String
  stripeProductId String       @unique
  name            String
  description     String?
  isActive        Boolean      @default(true)
  metadata        Json?
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  prices          Price[]
  subscriptions   Subscription[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([organizationId])
}

model Price {
  id              String       @id @default(cuid())
  productId       String
  stripePriceId   String       @unique
  nickname        String?
  type            PriceType    @default(RECURRING)
  currency        String       @default("usd")
  unitAmount      Int?         // In cents
  
  // Recurring settings
  interval        BillingInterval?
  intervalCount   Int?         @default(1)
  trialPeriodDays Int?
  
  // Usage-based settings
  billingScheme   BillingScheme @default(PER_UNIT)
  usageType       UsageType?
  tiersMode       TiersMode?
  tiers           Json?        // Tier configuration
  
  // Metered billing
  meterId         String?
  aggregateUsage  AggregateUsage?
  
  isActive        Boolean      @default(true)
  metadata        Json?
  
  product         Product      @relation(fields: [productId], references: [id], onDelete: Cascade)
  meter           UsageMeter?  @relation(fields: [meterId], references: [id])
  subscriptionItems SubscriptionItem[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([productId])
}

enum PriceType {
  ONE_TIME
  RECURRING
}

enum BillingInterval {
  DAY
  WEEK
  MONTH
  YEAR
}

enum BillingScheme {
  PER_UNIT
  TIERED
}

enum UsageType {
  METERED
  LICENSED
}

enum TiersMode {
  GRADUATED
  VOLUME
}

enum AggregateUsage {
  SUM
  LAST_DURING_PERIOD
  LAST_EVER
  MAX
}

model Customer {
  id                  String       @id @default(cuid())
  organizationId      String
  stripeCustomerId    String       @unique
  email               String
  name                String?
  phone               String?
  
  // Billing address
  addressLine1        String?
  addressLine2        String?
  city                String?
  state               String?
  postalCode          String?
  country             String?
  
  // Tax info
  taxExempt           TaxExempt    @default(NONE)
  taxIds              Json?
  
  // Default payment method
  defaultPaymentMethodId String?
  
  // Portal access
  portalToken         String       @unique @default(cuid())
  
  metadata            Json?
  
  organization        Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  subscriptions       Subscription[]
  invoices            Invoice[]
  usageRecords        UsageRecord[]
  dunningAttempts     DunningAttempt[]
  
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt
  
  @@index([organizationId])
  @@index([email])
}

enum TaxExempt {
  NONE
  EXEMPT
  REVERSE
}

model Subscription {
  id                      String       @id @default(cuid())
  organizationId          String
  customerId              String
  productId               String
  stripeSubscriptionId    String       @unique
  status                  SubscriptionStatus
  
  // Billing cycle
  currentPeriodStart      DateTime
  currentPeriodEnd        DateTime
  billingCycleAnchor      DateTime
  
  // Trial
  trialStart              DateTime?
  trialEnd                DateTime?
  
  // Cancellation
  cancelAtPeriodEnd       Boolean      @default(false)
  canceledAt              DateTime?
  cancellationReason      String?
  
  // Dunning
  dunningStatus           DunningStatus?
  lastDunningAttemptAt    DateTime?
  
  metadata                Json?
  
  organization            Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customer                Customer     @relation(fields: [customerId], references: [id])
  product                 Product      @relation(fields: [productId], references: [id])
  items                   SubscriptionItem[]
  invoices                Invoice[]
  
  createdAt               DateTime     @default(now())
  updatedAt               DateTime     @updatedAt
  
  @@index([organizationId])
  @@index([customerId])
  @@index([status])
}

enum SubscriptionStatus {
  INCOMPLETE
  INCOMPLETE_EXPIRED
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  UNPAID
  PAUSED
}

enum DunningStatus {
  ACTIVE
  EXHAUSTED
  RECOVERED
}

model SubscriptionItem {
  id                        String       @id @default(cuid())
  subscriptionId            String
  priceId                   String
  stripeSubscriptionItemId  String       @unique
  quantity                  Int          @default(1)
  
  subscription              Subscription @relation(fields: [subscriptionId], references: [id], onDelete: Cascade)
  price                     Price        @relation(fields: [priceId], references: [id])
  usageRecords              UsageRecord[]
  
  @@index([subscriptionId])
}

model Invoice {
  id                  String        @id @default(cuid())
  organizationId      String
  customerId          String
  subscriptionId      String?
  stripeInvoiceId     String        @unique
  number              String?
  status              InvoiceStatus
  
  // Amounts
  subtotal            Int           // In cents
  tax                 Int?
  total               Int
  amountDue           Int
  amountPaid          Int
  amountRemaining     Int
  
  currency            String        @default("usd")
  
  // Dates
  periodStart         DateTime?
  periodEnd           DateTime?
  dueDate             DateTime?
  paidAt              DateTime?
  
  // PDF
  invoicePdf          String?
  hostedInvoiceUrl    String?
  
  // Payment
  paymentIntentId     String?
  paymentIntentStatus String?
  
  metadata            Json?
  
  organization        Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  customer            Customer      @relation(fields: [customerId], references: [id])
  subscription        Subscription? @relation(fields: [subscriptionId], references: [id])
  lineItems           InvoiceLineItem[]
  
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt
  
  @@index([organizationId])
  @@index([customerId])
  @@index([status])
}

enum InvoiceStatus {
  DRAFT
  OPEN
  PAID
  VOID
  UNCOLLECTIBLE
}

model InvoiceLineItem {
  id                String   @id @default(cuid())
  invoiceId         String
  stripeLineItemId  String
  description       String?
  quantity          Int?
  unitAmount        Int?
  amount            Int
  currency          String
  periodStart       DateTime?
  periodEnd         DateTime?
  
  invoice           Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  @@index([invoiceId])
}

model UsageMeter {
  id             String       @id @default(cuid())
  organizationId String
  name           String
  eventName      String       // API event name
  displayName    String
  aggregationType AggregateUsage @default(SUM)
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  prices         Price[]
  records        UsageRecord[]
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  @@unique([organizationId, eventName])
}

model UsageRecord {
  id                   String           @id @default(cuid())
  meterId              String
  customerId           String
  subscriptionItemId   String?
  quantity             Int
  timestamp            DateTime         @default(now())
  action               UsageAction      @default(INCREMENT)
  idempotencyKey       String?
  
  meter                UsageMeter       @relation(fields: [meterId], references: [id], onDelete: Cascade)
  customer             Customer         @relation(fields: [customerId], references: [id])
  subscriptionItem     SubscriptionItem? @relation(fields: [subscriptionItemId], references: [id])
  
  createdAt            DateTime         @default(now())
  
  @@unique([meterId, idempotencyKey])
  @@index([meterId, customerId, timestamp])
}

enum UsageAction {
  INCREMENT
  SET
}

model DunningCampaign {
  id             String       @id @default(cuid())
  organizationId String
  name           String
  isDefault      Boolean      @default(false)
  isActive       Boolean      @default(true)
  
  // Retry schedule (JSON array of days after failure)
  retrySchedule  Json         // e.g., [1, 3, 5, 7, 14]
  maxAttempts    Int          @default(4)
  
  // Actions
  sendEmails     Boolean      @default(true)
  pauseSubscription Boolean   @default(false)
  cancelAfterExhaust Boolean  @default(true)
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  attempts       DunningAttempt[]
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  @@index([organizationId])
}

model DunningAttempt {
  id             String          @id @default(cuid())
  campaignId     String
  customerId     String
  invoiceId      String
  attemptNumber  Int
  status         DunningAttemptStatus
  scheduledAt    DateTime
  executedAt     DateTime?
  result         String?
  
  campaign       DunningCampaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  customer       Customer        @relation(fields: [customerId], references: [id])
  
  createdAt      DateTime        @default(now())
  
  @@index([campaignId])
  @@index([customerId])
  @@index([scheduledAt])
}

enum DunningAttemptStatus {
  SCHEDULED
  EXECUTED
  SUCCEEDED
  FAILED
  SKIPPED
}

model ApiKey {
  id             String       @id @default(cuid())
  organizationId String
  name           String
  keyPrefix      String       // First 8 chars for identification
  hashedKey      String       @unique
  scopes         String[]     // e.g., ["usage:write", "subscriptions:read"]
  lastUsedAt     DateTime?
  expiresAt      DateTime?
  rateLimit      Int          @default(1000) // Requests per hour
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime     @default(now())
  
  @@index([organizationId])
}

model WebhookEndpoint {
  id             String       @id @default(cuid())
  organizationId String
  url            String
  secret         String
  events         String[]     // e.g., ["subscription.created", "invoice.paid"]
  isActive       Boolean      @default(true)
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  deliveries     WebhookDelivery[]
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  @@index([organizationId])
}

model WebhookDelivery {
  id             String          @id @default(cuid())
  endpointId     String
  event          String
  payload        Json
  status         WebhookStatus
  statusCode     Int?
  responseBody   String?
  attemptCount   Int             @default(1)
  nextRetryAt    DateTime?
  
  endpoint       WebhookEndpoint @relation(fields: [endpointId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime        @default(now())
  
  @@index([endpointId])
  @@index([status, nextRetryAt])
}

enum WebhookStatus {
  PENDING
  DELIVERED
  FAILED
}

model AuditLog {
  id             String       @id @default(cuid())
  organizationId String
  userId         String?
  action         String
  entityType     String
  entityId       String?
  changes        Json?
  ipAddress      String?
  userAgent      String?
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User?        @relation(fields: [userId], references: [id])
  
  createdAt      DateTime     @default(now())
  
  @@index([organizationId])
  @@index([entityType, entityId])
}
```

## Implementation

### Stripe Webhook Handler

```tsx
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { handleDunning } from '@/lib/dunning';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const sig = headersList.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.created':
      case 'invoice.updated':
        await handleInvoiceChange(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'customer.created':
      case 'customer.updated':
        await handleCustomerChange(event.data.object as Stripe.Customer);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customer = await prisma.customer.findUnique({
    where: { stripeCustomerId: subscription.customer as string },
    include: { organization: true },
  });
  
  if (!customer) return;
  
  const product = await prisma.product.findFirst({
    where: {
      organizationId: customer.organizationId,
      prices: {
        some: {
          stripePriceId: subscription.items.data[0]?.price.id,
        },
      },
    },
  });
  
  if (!product) return;
  
  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: subscription.id },
    update: {
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      canceledAt: subscription.canceled_at 
        ? new Date(subscription.canceled_at * 1000) 
        : null,
      trialStart: subscription.trial_start 
        ? new Date(subscription.trial_start * 1000) 
        : null,
      trialEnd: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000) 
        : null,
    },
    create: {
      organizationId: customer.organizationId,
      customerId: customer.id,
      productId: product.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status.toUpperCase() as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      billingCycleAnchor: new Date(subscription.billing_cycle_anchor * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialStart: subscription.trial_start 
        ? new Date(subscription.trial_start * 1000) 
        : null,
      trialEnd: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000) 
        : null,
    },
  });
  
  // Sync subscription items
  for (const item of subscription.items.data) {
    const price = await prisma.price.findUnique({
      where: { stripePriceId: item.price.id },
    });
    
    if (price) {
      await prisma.subscriptionItem.upsert({
        where: { stripeSubscriptionItemId: item.id },
        update: { quantity: item.quantity || 1 },
        create: {
          subscriptionId: (await prisma.subscription.findUnique({
            where: { stripeSubscriptionId: subscription.id },
          }))!.id,
          priceId: price.id,
          stripeSubscriptionItemId: item.id,
          quantity: item.quantity || 1,
        },
      });
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      canceledAt: new Date(),
    },
  });
}

async function handleInvoiceChange(invoice: Stripe.Invoice) {
  const customer = await prisma.customer.findUnique({
    where: { stripeCustomerId: invoice.customer as string },
  });
  
  if (!customer) return;
  
  const subscription = invoice.subscription 
    ? await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: invoice.subscription as string },
      })
    : null;
  
  await prisma.invoice.upsert({
    where: { stripeInvoiceId: invoice.id },
    update: {
      status: invoice.status?.toUpperCase() as any || 'DRAFT',
      subtotal: invoice.subtotal,
      tax: invoice.tax || 0,
      total: invoice.total,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      amountRemaining: invoice.amount_remaining,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      paidAt: invoice.status_transitions?.paid_at 
        ? new Date(invoice.status_transitions.paid_at * 1000) 
        : null,
      invoicePdf: invoice.invoice_pdf || null,
      hostedInvoiceUrl: invoice.hosted_invoice_url || null,
    },
    create: {
      organizationId: customer.organizationId,
      customerId: customer.id,
      subscriptionId: subscription?.id,
      stripeInvoiceId: invoice.id,
      number: invoice.number || null,
      status: invoice.status?.toUpperCase() as any || 'DRAFT',
      subtotal: invoice.subtotal,
      tax: invoice.tax || 0,
      total: invoice.total,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      amountRemaining: invoice.amount_remaining,
      currency: invoice.currency,
      periodStart: invoice.period_start 
        ? new Date(invoice.period_start * 1000) 
        : null,
      periodEnd: invoice.period_end 
        ? new Date(invoice.period_end * 1000) 
        : null,
      dueDate: invoice.due_date ? new Date(invoice.due_date * 1000) : null,
      invoicePdf: invoice.invoice_pdf || null,
      hostedInvoiceUrl: invoice.hosted_invoice_url || null,
    },
  });
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  await handleInvoiceChange(invoice);
  
  // Clear dunning status if subscription was past due
  if (invoice.subscription) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: invoice.subscription as string },
      data: {
        dunningStatus: 'RECOVERED',
        lastDunningAttemptAt: null,
      },
    });
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  await handleInvoiceChange(invoice);
  
  // Initiate dunning
  if (invoice.subscription) {
    await handleDunning(invoice.id, invoice.subscription as string);
  }
}

async function handleCustomerChange(customer: Stripe.Customer) {
  await prisma.customer.updateMany({
    where: { stripeCustomerId: customer.id },
    data: {
      email: customer.email || undefined,
      name: customer.name || undefined,
      phone: customer.phone || undefined,
      addressLine1: customer.address?.line1 || undefined,
      addressLine2: customer.address?.line2 || undefined,
      city: customer.address?.city || undefined,
      state: customer.address?.state || undefined,
      postalCode: customer.address?.postal_code || undefined,
      country: customer.address?.country || undefined,
    },
  });
}
```

### Usage Metering API

```tsx
// app/api/v1/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyApiKey } from '@/lib/api-keys';
import { z } from 'zod';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const usageSchema = z.object({
  customer_id: z.string(),
  event_name: z.string(),
  quantity: z.number().int().positive().default(1),
  timestamp: z.string().datetime().optional(),
  idempotency_key: z.string().optional(),
  properties: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  // Verify API key
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }
  
  const apiKey = authHeader.slice(7);
  const keyData = await verifyApiKey(apiKey);
  
  if (!keyData) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  
  if (!keyData.scopes.includes('usage:write')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }
  
  // Parse and validate body
  const body = await request.json();
  const data = usageSchema.parse(body);
  
  // Find customer
  const customer = await prisma.customer.findFirst({
    where: {
      organizationId: keyData.organizationId,
      OR: [
        { id: data.customer_id },
        { stripeCustomerId: data.customer_id },
      ],
    },
  });
  
  if (!customer) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }
  
  // Find meter
  const meter = await prisma.usageMeter.findFirst({
    where: {
      organizationId: keyData.organizationId,
      eventName: data.event_name,
    },
  });
  
  if (!meter) {
    return NextResponse.json({ error: 'Unknown event name' }, { status: 400 });
  }
  
  // Find active subscription with metered price
  const subscription = await prisma.subscription.findFirst({
    where: {
      customerId: customer.id,
      status: 'ACTIVE',
      items: {
        some: {
          price: {
            meterId: meter.id,
          },
        },
      },
    },
    include: {
      items: {
        where: {
          price: {
            meterId: meter.id,
          },
        },
      },
    },
  });
  
  if (!subscription || !subscription.items[0]) {
    return NextResponse.json(
      { error: 'No active subscription with metered billing' },
      { status: 400 }
    );
  }
  
  // Report usage to Stripe
  const subscriptionItem = subscription.items[0];
  
  try {
    await stripe.subscriptionItems.createUsageRecord(
      subscriptionItem.stripeSubscriptionItemId,
      {
        quantity: data.quantity,
        timestamp: data.timestamp 
          ? Math.floor(new Date(data.timestamp).getTime() / 1000)
          : 'now',
        action: 'increment',
      },
      {
        idempotencyKey: data.idempotency_key,
      }
    );
  } catch (err: any) {
    if (err.code === 'idempotency_key_in_use') {
      // Already recorded, return success
    } else {
      throw err;
    }
  }
  
  // Store locally for analytics
  const record = await prisma.usageRecord.create({
    data: {
      meterId: meter.id,
      customerId: customer.id,
      subscriptionItemId: subscriptionItem.id,
      quantity: data.quantity,
      timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
      idempotencyKey: data.idempotency_key,
    },
  });
  
  // Update API key last used
  await prisma.apiKey.update({
    where: { id: keyData.id },
    data: { lastUsedAt: new Date() },
  });
  
  return NextResponse.json({
    id: record.id,
    customer_id: customer.id,
    event_name: data.event_name,
    quantity: data.quantity,
    timestamp: record.timestamp.toISOString(),
  }, { status: 201 });
}

// Get usage summary
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Missing API key' }, { status: 401 });
  }
  
  const apiKey = authHeader.slice(7);
  const keyData = await verifyApiKey(apiKey);
  
  if (!keyData || !keyData.scopes.includes('usage:read')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const { searchParams } = new URL(request.url);
  const customerId = searchParams.get('customer_id');
  const eventName = searchParams.get('event_name');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');
  
  const where: any = {
    meter: { organizationId: keyData.organizationId },
  };
  
  if (customerId) {
    where.customer = {
      OR: [{ id: customerId }, { stripeCustomerId: customerId }],
    };
  }
  
  if (eventName) {
    where.meter = { ...where.meter, eventName };
  }
  
  if (startDate || endDate) {
    where.timestamp = {};
    if (startDate) where.timestamp.gte = new Date(startDate);
    if (endDate) where.timestamp.lte = new Date(endDate);
  }
  
  const records = await prisma.usageRecord.groupBy({
    by: ['meterId', 'customerId'],
    where,
    _sum: { quantity: true },
    _count: true,
  });
  
  return NextResponse.json({ data: records });
}
```

### Dunning Management

```tsx
// lib/dunning.ts
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/email';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function handleDunning(invoiceId: string, subscriptionId: string) {
  const subscription = await prisma.subscription.findUnique({
    where: { stripeSubscriptionId: subscriptionId },
    include: {
      customer: true,
      organization: {
        include: {
          dunningCampaigns: {
            where: { isActive: true, isDefault: true },
          },
        },
      },
    },
  });
  
  if (!subscription) return;
  
  const campaign = subscription.organization.dunningCampaigns[0];
  if (!campaign) return;
  
  // Check existing attempts
  const existingAttempts = await prisma.dunningAttempt.count({
    where: {
      campaignId: campaign.id,
      customerId: subscription.customerId,
      invoiceId,
    },
  });
  
  if (existingAttempts >= campaign.maxAttempts) {
    // Exhausted - take final action
    await handleDunningExhausted(subscription, campaign);
    return;
  }
  
  // Schedule next attempt
  const retrySchedule = campaign.retrySchedule as number[];
  const daysUntilRetry = retrySchedule[existingAttempts] || retrySchedule[retrySchedule.length - 1];
  
  const scheduledAt = new Date();
  scheduledAt.setDate(scheduledAt.getDate() + daysUntilRetry);
  
  await prisma.dunningAttempt.create({
    data: {
      campaignId: campaign.id,
      customerId: subscription.customerId,
      invoiceId,
      attemptNumber: existingAttempts + 1,
      status: 'SCHEDULED',
      scheduledAt,
    },
  });
  
  // Update subscription dunning status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      dunningStatus: 'ACTIVE',
      lastDunningAttemptAt: new Date(),
    },
  });
  
  // Send dunning email
  if (campaign.sendEmails) {
    await sendDunningEmail(subscription.customer, existingAttempts + 1, campaign.maxAttempts);
  }
}

export async function processDunningAttempts() {
  const pendingAttempts = await prisma.dunningAttempt.findMany({
    where: {
      status: 'SCHEDULED',
      scheduledAt: { lte: new Date() },
    },
    include: {
      campaign: true,
      customer: true,
    },
  });
  
  for (const attempt of pendingAttempts) {
    try {
      // Retry payment via Stripe
      const invoice = await stripe.invoices.pay(attempt.invoiceId);
      
      if (invoice.paid) {
        await prisma.dunningAttempt.update({
          where: { id: attempt.id },
          data: {
            status: 'SUCCEEDED',
            executedAt: new Date(),
            result: 'Payment successful',
          },
        });
      } else {
        await prisma.dunningAttempt.update({
          where: { id: attempt.id },
          data: {
            status: 'FAILED',
            executedAt: new Date(),
            result: 'Payment still pending',
          },
        });
        
        // Schedule next attempt
        await handleDunning(attempt.invoiceId, attempt.customer.stripeCustomerId);
      }
    } catch (err: any) {
      await prisma.dunningAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'FAILED',
          executedAt: new Date(),
          result: err.message,
        },
      });
      
      // Schedule next attempt
      await handleDunning(attempt.invoiceId, attempt.customer.stripeCustomerId);
    }
  }
}

async function handleDunningExhausted(subscription: any, campaign: any) {
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { dunningStatus: 'EXHAUSTED' },
  });
  
  if (campaign.cancelAfterExhaust) {
    await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
  } else if (campaign.pauseSubscription) {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      pause_collection: { behavior: 'void' },
    });
  }
  
  // Send final email
  await resend.emails.send({
    from: `${subscription.organization.name} <billing@${process.env.EMAIL_DOMAIN}>`,
    to: subscription.customer.email,
    subject: 'Action Required: Subscription Cancelled Due to Payment Failure',
    html: `
      <p>Dear ${subscription.customer.name || 'Customer'},</p>
      <p>Despite multiple attempts, we were unable to process your payment.</p>
      <p>Your subscription has been ${campaign.cancelAfterExhaust ? 'cancelled' : 'paused'}.</p>
      <p>To reactivate your subscription, please update your payment method.</p>
    `,
  });
}

async function sendDunningEmail(customer: any, attemptNumber: number, maxAttempts: number) {
  const remainingAttempts = maxAttempts - attemptNumber;
  
  await resend.emails.send({
    from: `Billing <billing@${process.env.EMAIL_DOMAIN}>`,
    to: customer.email,
    subject: 'Payment Failed - Action Required',
    html: `
      <p>Dear ${customer.name || 'Customer'},</p>
      <p>We were unable to process your subscription payment.</p>
      <p>We will retry your payment ${remainingAttempts} more time${remainingAttempts !== 1 ? 's' : ''}.</p>
      <p>To avoid service interruption, please update your payment method.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/portal/${customer.portalToken}/payment-methods">Update Payment Method</a></p>
    `,
  });
}
```

### MRR Analytics

```tsx
// components/analytics/mrr-chart.tsx
'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format, startOfMonth, subMonths, eachMonthOfInterval } from 'date-fns';

interface MRRData {
  month: string;
  newMRR: number;
  expansionMRR: number;
  contractionMRR: number;
  churnMRR: number;
  netMRR: number;
  totalMRR: number;
}

interface MRRChartProps {
  data: MRRData[];
}

export function MRRChart({ data }: MRRChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value / 100);
  };
  
  const latestMRR = data[data.length - 1]?.totalMRR || 0;
  const previousMRR = data[data.length - 2]?.totalMRR || 0;
  const mrrGrowth = previousMRR > 0 
    ? ((latestMRR - previousMRR) / previousMRR) * 100 
    : 0;
  
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Monthly Recurring Revenue</h3>
          <p className="text-3xl font-bold mt-1">{formatCurrency(latestMRR)}</p>
        </div>
        <div className={`px-2 py-1 rounded text-sm font-medium ${
          mrrGrowth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {mrrGrowth >= 0 ? '+' : ''}{mrrGrowth.toFixed(1)}% MoM
        </div>
      </div>
      
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMRR" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 100000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              contentStyle={{
                borderRadius: 8,
                border: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalMRR"
              name="Total MRR"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMRR)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* MRR Breakdown */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t">
        <div>
          <p className="text-xs text-gray-500">New</p>
          <p className="text-sm font-semibold text-green-600">
            +{formatCurrency(data[data.length - 1]?.newMRR || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Expansion</p>
          <p className="text-sm font-semibold text-green-600">
            +{formatCurrency(data[data.length - 1]?.expansionMRR || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Contraction</p>
          <p className="text-sm font-semibold text-yellow-600">
            -{formatCurrency(data[data.length - 1]?.contractionMRR || 0)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Churn</p>
          <p className="text-sm font-semibold text-red-600">
            -{formatCurrency(data[data.length - 1]?.churnMRR || 0)}
          </p>
        </div>
      </div>
    </div>
  );
}
```

### Customer Portal

```tsx
// app/portal/subscription/page.tsx
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { PlanSelector } from '@/components/portal/plan-selector';
import { SubscriptionDetails } from '@/components/portal/subscription-details';

export default async function PortalSubscriptionPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('portal_token')?.value;
  
  if (!token) {
    redirect('/portal/login');
  }
  
  const customer = await prisma.customer.findUnique({
    where: { portalToken: token },
    include: {
      organization: {
        include: {
          products: {
            where: { isActive: true },
            include: {
              prices: {
                where: { isActive: true },
                orderBy: { unitAmount: 'asc' },
              },
            },
          },
        },
      },
      subscriptions: {
        where: {
          status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] },
        },
        include: {
          product: true,
          items: {
            include: { price: true },
          },
        },
      },
    },
  });
  
  if (!customer) {
    redirect('/portal/login');
  }
  
  const activeSubscription = customer.subscriptions[0];
  const availableProducts = customer.organization.products;
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Manage Subscription</h1>
      
      {activeSubscription ? (
        <div className="space-y-8">
          <SubscriptionDetails
            subscription={activeSubscription}
            customerId={customer.id}
          />
          
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-4">Change Plan</h2>
            <PlanSelector
              products={availableProducts}
              currentPriceId={activeSubscription.items[0]?.priceId}
              subscriptionId={activeSubscription.id}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold mb-4">Choose a Plan</h2>
          <PlanSelector
            products={availableProducts}
            customerId={customer.id}
          />
        </div>
      )}
    </div>
  );
}
```

## Skills Used

| Skill | Purpose |
|-------|---------|
| [stripe-subscriptions](../patterns/stripe-subscriptions.md) | Stripe subscription lifecycle management |
| [webhooks](../patterns/webhooks.md) | Stripe webhook handling and processing |
| [usage-metering](../patterns/usage-metering.md) | Usage-based billing and metering |
| [multi-tenancy](../patterns/multi-tenancy.md) | Organization-level data isolation |
| [rbac](../patterns/rbac.md) | Role-based access control |
| [audit-logging](../patterns/audit-logging.md) | Billing activity tracking |

## Testing

### Unit Tests

```tsx
// __tests__/lib/stripe.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { calculateMRR, processSubscriptionChange } from '@/lib/stripe';

describe('calculateMRR', () => {
  it('calculates MRR for monthly subscriptions', () => {
    const subscriptions = [
      { interval: 'month', unitAmount: 2999, quantity: 1 },
      { interval: 'month', unitAmount: 4999, quantity: 2 },
    ];

    // 29.99 + (49.99 * 2) = 129.97
    expect(calculateMRR(subscriptions)).toBe(12997);
  });

  it('normalizes yearly subscriptions to monthly', () => {
    const subscriptions = [
      { interval: 'year', unitAmount: 11988, quantity: 1 }, // $119.88/year
    ];

    // 119.88 / 12 = 9.99/month
    expect(calculateMRR(subscriptions)).toBe(999);
  });

  it('returns 0 for empty subscriptions', () => {
    expect(calculateMRR([])).toBe(0);
  });
});

describe('processSubscriptionChange', () => {
  it('identifies new subscription as expansion', () => {
    const result = processSubscriptionChange(null, {
      status: 'active',
      currentPeriodEnd: new Date(),
    });

    expect(result.type).toBe('new');
  });

  it('identifies downgrade as contraction', () => {
    const result = processSubscriptionChange(
      { mrr: 4999, plan: 'pro' },
      { mrr: 2999, plan: 'basic', status: 'active' }
    );

    expect(result.type).toBe('contraction');
    expect(result.mrrChange).toBe(-2000);
  });

  it('identifies cancellation as churn', () => {
    const result = processSubscriptionChange(
      { mrr: 2999, status: 'active' },
      { mrr: 2999, status: 'canceled' }
    );

    expect(result.type).toBe('churn');
  });
});
```

```tsx
// __tests__/lib/dunning.test.ts
import { describe, it, expect, vi } from 'vitest';
import { calculateNextRetry, shouldCancelSubscription } from '@/lib/dunning';

describe('calculateNextRetry', () => {
  it('schedules retry based on campaign schedule', () => {
    const campaign = { retrySchedule: [1, 3, 5, 7] };

    expect(calculateNextRetry(campaign, 0)).toBe(1); // First retry in 1 day
    expect(calculateNextRetry(campaign, 1)).toBe(3); // Second retry in 3 days
    expect(calculateNextRetry(campaign, 3)).toBe(7); // Fourth retry in 7 days
  });

  it('uses last value for attempts beyond schedule', () => {
    const campaign = { retrySchedule: [1, 3, 5] };

    expect(calculateNextRetry(campaign, 10)).toBe(5);
  });
});

describe('shouldCancelSubscription', () => {
  it('returns true when attempts exhausted and cancelAfterExhaust is true', () => {
    const campaign = { maxAttempts: 4, cancelAfterExhaust: true };

    expect(shouldCancelSubscription(campaign, 4)).toBe(true);
  });

  it('returns false when attempts not exhausted', () => {
    const campaign = { maxAttempts: 4, cancelAfterExhaust: true };

    expect(shouldCancelSubscription(campaign, 2)).toBe(false);
  });
});
```

### Integration Tests

```tsx
// __tests__/api/webhooks/stripe.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/webhooks/stripe/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma');

describe('Stripe Webhook Handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles customer.subscription.created event', async () => {
    const mockEvent = {
      type: 'customer.subscription.created',
      data: {
        object: {
          id: 'sub_123',
          customer: 'cus_123',
          status: 'active',
          current_period_start: Math.floor(Date.now() / 1000),
          current_period_end: Math.floor(Date.now() / 1000) + 86400 * 30,
          items: { data: [{ price: { id: 'price_123' }, quantity: 1 }] },
        },
      },
    };

    const request = new Request('http://localhost/api/webhooks/stripe', {
      method: 'POST',
      body: JSON.stringify(mockEvent),
      headers: { 'stripe-signature': 'valid_signature' },
    });

    // Mock signature verification
    vi.mock('stripe', () => ({
      default: vi.fn().mockImplementation(() => ({
        webhooks: {
          constructEvent: vi.fn().mockReturnValue(mockEvent),
        },
      })),
    }));

    const response = await POST(request);
    expect(response.status).toBe(200);
  });

  it('handles invoice.payment_failed event and triggers dunning', async () => {
    const mockEvent = {
      type: 'invoice.payment_failed',
      data: {
        object: {
          id: 'in_123',
          customer: 'cus_123',
          subscription: 'sub_123',
          amount_due: 2999,
        },
      },
    };

    prisma.subscription.findUnique.mockResolvedValue({
      id: 'sub_db_123',
      customerId: 'cus_db_123',
    });

    const response = await POST(createMockRequest(mockEvent));
    expect(response.status).toBe(200);
  });
});
```

### E2E Tests

```tsx
// e2e/billing.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Subscription Billing', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('displays subscription list', async ({ page }) => {
    await page.goto('/subscriptions');

    await expect(page.locator('[data-testid="subscription-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="mrr-display"]')).toBeVisible();
  });

  test('creates new product with pricing', async ({ page }) => {
    await page.goto('/products/new');

    await page.fill('[data-testid="product-name"]', 'Test Product');
    await page.fill('[data-testid="product-description"]', 'Test description');
    await page.click('[data-testid="add-price"]');
    await page.fill('[data-testid="price-amount"]', '29.99');
    await page.selectOption('[data-testid="billing-interval"]', 'month');

    await page.click('[data-testid="save-product"]');

    await expect(page).toHaveURL(/\/products\/.+/);
  });

  test('customer portal allows plan change', async ({ page }) => {
    await page.goto('/portal/subscription');

    await expect(page.locator('[data-testid="current-plan"]')).toBeVisible();
    await page.click('[data-testid="change-plan-button"]');

    await expect(page.locator('[data-testid="plan-selector"]')).toBeVisible();
  });

  test('usage reporting API works', async ({ request }) => {
    const response = await request.post('/api/v1/usage', {
      headers: {
        Authorization: 'Bearer test_api_key',
        'Content-Type': 'application/json',
      },
      data: {
        customer_id: 'cus_123',
        event_name: 'api_calls',
        quantity: 100,
      },
    });

    expect(response.ok()).toBe(true);
    const data = await response.json();
    expect(data).toHaveProperty('id');
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/billing-error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

export default function BillingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { component: 'billing' },
    });
  }, [error]);

  const isStripeError = error.message.includes('Stripe');
  const isPaymentError = error.message.includes('payment');

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md">
        {isPaymentError ? (
          <CreditCard className="h-12 w-12 text-red-500 mx-auto mb-4" />
        ) : (
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        )}

        <h2 className="text-xl font-semibold mb-2">
          {isPaymentError ? 'Payment Error' : 'Billing Error'}
        </h2>

        <p className="text-muted-foreground mb-4">
          {isStripeError
            ? 'There was an issue connecting to our payment provider. Please try again.'
            : 'We encountered an error loading your billing information.'}
        </p>

        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <a href="/support">Contact Support</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Stripe Error Handler

```tsx
// lib/stripe-errors.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export function handleStripeError(error: unknown) {
  console.error('Stripe error:', error);

  if (error instanceof Stripe.errors.StripeError) {
    switch (error.type) {
      case 'StripeCardError':
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: 400 }
        );

      case 'StripeRateLimitError':
        return NextResponse.json(
          { error: 'Too many requests to payment provider' },
          { status: 429 }
        );

      case 'StripeInvalidRequestError':
        return NextResponse.json(
          { error: 'Invalid payment request', code: error.code },
          { status: 400 }
        );

      case 'StripeAPIError':
        return NextResponse.json(
          { error: 'Payment provider temporarily unavailable' },
          { status: 503 }
        );

      case 'StripeAuthenticationError':
        console.error('CRITICAL: Stripe authentication failed');
        return NextResponse.json(
          { error: 'Payment configuration error' },
          { status: 500 }
        );

      default:
        return NextResponse.json(
          { error: 'Payment processing error' },
          { status: 500 }
        );
    }
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

## Accessibility

### WCAG 2.1 AA Compliance

```tsx
// components/pricing/pricing-table.tsx
export function PricingTable({ products }: PricingTableProps) {
  return (
    <div
      role="region"
      aria-labelledby="pricing-heading"
      className="grid md:grid-cols-3 gap-6"
    >
      <h2 id="pricing-heading" className="sr-only">
        Pricing Plans
      </h2>

      {products.map((product, index) => (
        <article
          key={product.id}
          className="border rounded-lg p-6"
          aria-labelledby={`plan-${product.id}-name`}
        >
          <h3 id={`plan-${product.id}-name`} className="text-lg font-semibold">
            {product.name}
          </h3>

          <p className="text-3xl font-bold mt-2" aria-label={`${formatPrice(product.price)} per month`}>
            {formatPrice(product.price)}
            <span className="text-sm font-normal text-muted-foreground">/month</span>
          </p>

          <ul
            aria-label={`Features included in ${product.name}`}
            className="mt-4 space-y-2"
          >
            {product.features.map((feature, i) => (
              <li key={i} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" aria-hidden="true" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Button
            className="w-full mt-6"
            aria-describedby={`plan-${product.id}-name`}
          >
            Subscribe to {product.name}
          </Button>
        </article>
      ))}
    </div>
  );
}
```

### Form Accessibility

```tsx
// components/checkout/payment-form.tsx
export function PaymentForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby="payment-form-heading"
      noValidate
    >
      <h2 id="payment-form-heading" className="text-lg font-semibold mb-4">
        Payment Details
      </h2>

      {/* Live region for form errors */}
      <div
        role="alert"
        aria-live="polite"
        className={errors.form ? 'text-red-600 mb-4' : 'sr-only'}
      >
        {errors.form}
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="card-number"
            className="block text-sm font-medium mb-1"
          >
            Card Number <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </label>
          <input
            id="card-number"
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            aria-required="true"
            aria-invalid={!!errors.cardNumber}
            aria-describedby={errors.cardNumber ? 'card-number-error' : undefined}
            className="w-full border rounded-md p-2"
          />
          {errors.cardNumber && (
            <p id="card-number-error" className="text-sm text-red-600 mt-1">
              {errors.cardNumber}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
```

## Security

### Input Validation

```tsx
// lib/validations/billing.ts
import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  customerId: z.string().cuid(),
  priceId: z.string().regex(/^price_[a-zA-Z0-9]+$/),
  quantity: z.number().int().positive().max(1000).default(1),
  trialDays: z.number().int().min(0).max(90).optional(),
  metadata: z.record(z.string()).optional(),
});

export const updateSubscriptionSchema = z.object({
  priceId: z.string().regex(/^price_[a-zA-Z0-9]+$/).optional(),
  quantity: z.number().int().positive().max(1000).optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
});

export const usageReportSchema = z.object({
  customer_id: z.string().min(1),
  event_name: z.string().min(1).max(100).regex(/^[a-z_]+$/),
  quantity: z.number().int().positive().max(1000000),
  timestamp: z.string().datetime().optional(),
  idempotency_key: z.string().max(255).optional(),
  properties: z.record(z.any()).optional(),
});

// Validate Stripe price IDs
export const stripePriceIdSchema = z.string().regex(
  /^price_[a-zA-Z0-9]{14,}$/,
  'Invalid Stripe price ID'
);
```

### API Key Security

```tsx
// lib/api-keys.ts
import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function generateApiKey(): Promise<{ key: string; hashedKey: string; prefix: string }> {
  const key = `sk_live_${randomBytes(32).toString('base64url')}`;
  const hashedKey = hashApiKey(key);
  const prefix = key.substring(0, 12);

  return { key, hashedKey, prefix };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function verifyApiKey(key: string): Promise<ApiKeyData | null> {
  const hashedKey = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { hashedKey },
    include: { organization: true },
  });

  if (!apiKey) return null;

  // Check expiration
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return null;
  }

  return apiKey;
}

// Rate limiting per API key
export async function checkApiKeyRateLimit(keyId: string): Promise<boolean> {
  const apiKey = await prisma.apiKey.findUnique({
    where: { id: keyId },
  });

  if (!apiKey) return false;

  // Check rate limit (requests per hour)
  const hourAgo = new Date(Date.now() - 3600000);
  const requestCount = await prisma.apiRequest.count({
    where: {
      apiKeyId: keyId,
      createdAt: { gte: hourAgo },
    },
  });

  return requestCount < apiKey.rateLimit;
}
```

### Webhook Signature Verification

```tsx
// lib/webhook-security.ts
import Stripe from 'stripe';
import { createHmac, timingSafeEqual } from 'crypto';

export function verifyStripeWebhook(
  payload: string,
  signature: string,
  secret: string
): Stripe.Event {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  try {
    return stripe.webhooks.constructEvent(payload, signature, secret);
  } catch (err) {
    throw new Error('Invalid webhook signature');
  }
}

// For custom webhooks to partners
export function signWebhookPayload(payload: string, secret: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  const signedPayload = `${timestamp}.${payload}`;
  const signature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return `t=${timestamp},v1=${signature}`;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  toleranceSeconds: number = 300
): boolean {
  const parts = signature.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    acc[key] = value;
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parseInt(parts.t);
  const expectedSignature = parts.v1;

  // Check timestamp tolerance
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const computedSignature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(computedSignature)
  );
}
```

## Performance

### Caching Strategies

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

// Cache product catalog (changes infrequently)
export const getCachedProducts = unstable_cache(
  async (organizationId: string) => {
    return prisma.product.findMany({
      where: { organizationId, isActive: true },
      include: {
        prices: {
          where: { isActive: true },
          orderBy: { unitAmount: 'asc' },
        },
      },
    });
  },
  ['products'],
  { revalidate: 300, tags: ['products'] } // 5 minute cache
);

// Cache customer data (moderate frequency)
export const getCachedCustomer = unstable_cache(
  async (customerId: string) => {
    return prisma.customer.findUnique({
      where: { id: customerId },
      include: {
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
          include: { items: { include: { price: true } } },
        },
      },
    });
  },
  ['customer'],
  { revalidate: 60, tags: ['customer'] } // 1 minute cache
);

// MRR calculation cache
export const getCachedMRR = unstable_cache(
  async (organizationId: string) => {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        organizationId,
        status: 'ACTIVE',
      },
      include: { items: { include: { price: true } } },
    });

    return subscriptions.reduce((total, sub) => {
      return total + sub.items.reduce((subTotal, item) => {
        const price = item.price;
        if (price.interval === 'YEAR') {
          return subTotal + Math.round((price.unitAmount || 0) / 12) * item.quantity;
        }
        return subTotal + (price.unitAmount || 0) * item.quantity;
      }, 0);
    }, 0);
  },
  ['mrr'],
  { revalidate: 120, tags: ['mrr'] } // 2 minute cache
);
```

### Database Optimization

```tsx
// lib/queries.ts
import { prisma } from '@/lib/prisma';

// Optimized subscription query with selective fields
export async function getSubscriptionSummary(organizationId: string) {
  return prisma.subscription.findMany({
    where: { organizationId },
    select: {
      id: true,
      status: true,
      currentPeriodEnd: true,
      cancelAtPeriodEnd: true,
      customer: {
        select: { id: true, email: true, name: true },
      },
      items: {
        select: {
          quantity: true,
          price: {
            select: { unitAmount: true, interval: true, nickname: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
}

// Batch usage aggregation
export async function aggregateUsage(
  organizationId: string,
  startDate: Date,
  endDate: Date
) {
  return prisma.usageRecord.groupBy({
    by: ['meterId', 'customerId'],
    where: {
      meter: { organizationId },
      timestamp: { gte: startDate, lte: endDate },
    },
    _sum: { quantity: true },
    _count: true,
  });
}
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/billing_test
  STRIPE_SECRET_KEY: sk_test_xxx

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: billing_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - name: Install Stripe CLI
        run: |
          curl -s https://packages.stripe.dev/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
          echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.dev/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
          sudo apt update && sudo apt install stripe
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma generate
      - run: pnpm prisma db push
      - run: pnpm test:unit
      - run: pnpm test:integration
        env:
          STRIPE_WEBHOOK_SECRET: whsec_test

  e2e:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm build
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    runs-on: ubuntu-latest
    needs: [e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Sentry Integration

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Redact sensitive billing information
    if (event.request?.data) {
      const data = JSON.parse(event.request.data);
      if (data.card_number) data.card_number = '[REDACTED]';
      if (data.cvv) data.cvv = '[REDACTED]';
      event.request.data = JSON.stringify(data);
    }
    return event;
  },
});
```

### Health Check Endpoint

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>,
  };

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = { status: 'healthy', latency: Date.now() - dbStart };
  } catch (error) {
    checks.checks.database = { status: 'unhealthy', error: 'Connection failed' };
    checks.status = 'unhealthy';
  }

  // Stripe API check
  const stripeStart = Date.now();
  try {
    await stripe.balance.retrieve();
    checks.checks.stripe = { status: 'healthy', latency: Date.now() - stripeStart };
  } catch (error) {
    checks.checks.stripe = { status: 'unhealthy', error: 'API unavailable' };
    checks.status = 'degraded';
  }

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  });
}
```

### Billing Metrics

```tsx
// lib/metrics.ts
import { Counter, Histogram, Gauge, Registry } from 'prom-client';

export const registry = new Registry();

// Revenue metrics
export const mrrGauge = new Gauge({
  name: 'billing_mrr_cents',
  help: 'Current Monthly Recurring Revenue in cents',
  labelNames: ['organization'],
  registers: [registry],
});

// Subscription metrics
export const subscriptionChanges = new Counter({
  name: 'billing_subscription_changes_total',
  help: 'Total subscription changes',
  labelNames: ['type', 'plan'],
  registers: [registry],
});

// Payment metrics
export const paymentAttempts = new Counter({
  name: 'billing_payment_attempts_total',
  help: 'Total payment attempts',
  labelNames: ['status', 'provider'],
  registers: [registry],
});

// Webhook processing
export const webhookDuration = new Histogram({
  name: 'billing_webhook_duration_seconds',
  help: 'Webhook processing duration',
  labelNames: ['event_type'],
  buckets: [0.1, 0.5, 1, 2, 5],
  registers: [registry],
});
```

## Environment Variables

```bash
# .env.example

# ===================
# Database
# ===================
DATABASE_URL="postgresql://user:password@localhost:5432/billing"

# ===================
# Authentication
# ===================
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# ===================
# Stripe
# ===================
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# ===================
# Email (Resend)
# ===================
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="billing@yourdomain.com"
EMAIL_DOMAIN="yourdomain.com"

# ===================
# Redis (for rate limiting)
# ===================
UPSTASH_REDIS_URL="https://xxx.upstash.io"
UPSTASH_REDIS_TOKEN="your-token"

# ===================
# Monitoring
# ===================
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# ===================
# Application
# ===================
NEXT_PUBLIC_APP_URL="https://billing.yourdomain.com"
```

## Deployment Checklist

### Pre-Deployment

- [ ] Stripe account in live mode
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhook endpoint configured and verified
- [ ] SSL certificate configured for custom domain

### Security

- [ ] STRIPE_SECRET_KEY is the live key (not test)
- [ ] STRIPE_WEBHOOK_SECRET is configured correctly
- [ ] API key hashing implemented
- [ ] Rate limiting enabled
- [ ] PCI compliance verified for payment handling

### Stripe Configuration

- [ ] Products and prices synced with database
- [ ] Webhook events configured:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.updated`
- [ ] Customer portal configured in Stripe Dashboard
- [ ] Dunning settings configured in Stripe Dashboard

### Monitoring

- [ ] Sentry configured with billing context
- [ ] Health check endpoint accessible
- [ ] MRR tracking dashboard set up
- [ ] Failed payment alerts configured
- [ ] Churn alerts configured

### Post-Deployment

- [ ] Verify webhook delivery in Stripe Dashboard
- [ ] Test subscription creation end-to-end
- [ ] Test payment failure and dunning flow
- [ ] Verify customer portal access
- [ ] Test usage metering API
- [ ] Monitor failed payment rates for first week

## Related Skills

- [[stripe-subscriptions]] - Stripe subscription management
- [[webhooks]] - Webhook handling patterns
- [[usage-metering]] - Usage-based billing
- [[multi-tenancy]] - Multi-tenant architecture
- [[rbac]] - Role-based access control
- [[api-keys]] - API key management
- [[audit-logging]] - Activity tracking

## Changelog

- 1.0.0: Initial subscription billing recipe with usage-based pricing and dunning
