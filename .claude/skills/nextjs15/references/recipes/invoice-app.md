---
id: r-invoice-app
name: Invoice App
version: 3.0.0
layer: L6
category: recipes
description: Professional invoicing application with PDF generation, payment links, recurring invoices, and client portal
tags: [invoicing, pdf, payments, billing, clients, enterprise]
formula: "InvoiceApp = DashboardLayout(t-dashboard-layout) + InvoicePage(t-invoice-page) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + CheckoutPage(t-checkout-page) + InvoiceTable(o-invoice-table) + DataTable(o-data-table) + CheckoutForm(o-checkout-form) + SettingsForm(o-settings-form) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Header(o-header) + Footer(o-footer) + Sidebar(o-sidebar) + NotificationCenter(o-notification-center) + FileUploader(o-file-uploader) + FormField(m-form-field) + StatCard(m-stat-card) + Pagination(m-pagination) + Breadcrumb(m-breadcrumb) + EmptyState(m-empty-state) + ActionMenu(m-action-menu) + DatePicker(m-date-picker) + CreditCardInput(m-credit-card-input) + AddressInput(m-address-input) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + ServerActions(pt-server-actions) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + Mutations(pt-mutations) + StripeCheckout(pt-stripe-checkout) + StripeWebhooks(pt-stripe-webhooks) + TaxCalculation(pt-tax-calculation) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + FileUpload(pt-file-upload) + FileStorage(pt-file-storage) + CronJobs(pt-cron-jobs) + ScheduledTasks(pt-scheduled-tasks) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + ExportData(pt-export-data) + Pagination(pt-pagination) + Filtering(pt-filtering) + Sorting(pt-sorting) + DateFormatting(pt-date-formatting) + Transactions(pt-transactions) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + TestingE2e(pt-testing-e2e) + TestingIntegration(pt-testing-integration)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/form-field.md
  - ../molecules/stat-card.md
  - ../molecules/pagination.md
  - ../molecules/breadcrumb.md
  - ../molecules/empty-state.md
  - ../molecules/action-menu.md
  - ../molecules/date-picker.md
  - ../molecules/credit-card-input.md
  - ../molecules/address-input.md
  # L3 Organisms - Complex Components
  - ../organisms/invoice-table.md
  - ../organisms/data-table.md
  - ../organisms/checkout-form.md
  - ../organisms/settings-form.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/sidebar.md
  - ../organisms/notification-center.md
  - ../organisms/file-uploader.md
  # L4 Templates - Page Layouts
  - ../templates/dashboard-layout.md
  - ../templates/invoice-page.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/checkout-page.md
  # L5 Patterns - Authentication & Security
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Server Actions
  - ../patterns/server-actions.md
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/mutations.md
  # L5 Patterns - Payments
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-webhooks.md
  - ../patterns/tax-calculation.md
  # L5 Patterns - Email & Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  # L5 Patterns - File Handling
  - ../patterns/file-upload.md
  - ../patterns/file-storage.md
  # L5 Patterns - Background Jobs
  - ../patterns/cron-jobs.md
  - ../patterns/scheduled-tasks.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics & Logging
  - ../patterns/analytics-events.md
  # L5 Patterns - Data Management
  - ../patterns/export-data.md
  - ../patterns/pagination.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  - ../patterns/date-formatting.md
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
  - @react-pdf/renderer@4.0.0
  - stripe@14.0.0
  - resend@3.0.0
skills:
  - server-actions
  - api-routes
  - file-upload
  - email-integration
  - pdf-generation
  - stripe-integration
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

A comprehensive invoicing solution for freelancers, agencies, and businesses. Features PDF invoice generation, Stripe payment links, recurring invoice automation, client portal access, and multi-currency support with enterprise-grade RBAC.

## Project Structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard overview
│   ├── invoices/
│   │   ├── page.tsx                # Invoice list
│   │   ├── new/page.tsx            # Create invoice
│   │   └── [id]/
│   │       ├── page.tsx            # Invoice detail
│   │       ├── edit/page.tsx       # Edit invoice
│   │       └── pdf/route.ts        # PDF download
│   ├── clients/
│   │   ├── page.tsx                # Client list
│   │   └── [id]/page.tsx           # Client detail
│   ├── recurring/
│   │   ├── page.tsx                # Recurring invoices
│   │   └── new/page.tsx            # Create recurring
│   └── settings/
│       ├── page.tsx                # Business settings
│       ├── team/page.tsx           # Team management
│       └── integrations/page.tsx   # Stripe, email setup
├── portal/
│   └── [token]/
│       ├── page.tsx                # Client portal view
│       └── pay/page.tsx            # Payment page
├── api/
│   ├── invoices/
│   │   ├── route.ts
│   │   └── [id]/
│   │       ├── route.ts
│   │       ├── send/route.ts
│   │       └── duplicate/route.ts
│   ├── clients/route.ts
│   ├── recurring/
│   │   ├── route.ts
│   │   └── process/route.ts        # Cron endpoint
│   ├── webhooks/
│   │   └── stripe/route.ts
│   └── pdf/[id]/route.ts
└── components/
    ├── invoices/
    │   ├── invoice-form.tsx
    │   ├── invoice-table.tsx
    │   ├── invoice-preview.tsx
    │   ├── line-item-editor.tsx
    │   └── invoice-pdf.tsx
    ├── clients/
    │   ├── client-form.tsx
    │   └── client-selector.tsx
    └── dashboard/
        ├── stats-cards.tsx
        ├── revenue-chart.tsx
        └── recent-activity.tsx
lib/
├── pdf.ts                          # PDF generation
├── stripe.ts                       # Stripe utilities
├── email.ts                        # Email templates
└── invoice-number.ts               # Number generation
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
  id              String    @id @default(cuid())
  name            String
  email           String
  phone           String?
  website         String?
  address         String?
  city            String?
  state           String?
  postalCode      String?
  country         String    @default("US")
  logo            String?
  taxId           String?
  defaultCurrency String    @default("USD")
  invoicePrefix   String    @default("INV")
  invoiceCounter  Int       @default(1)
  paymentTerms    Int       @default(30)
  notes           String?
  stripeAccountId String?
  
  members         OrganizationMember[]
  clients         Client[]
  invoices        Invoice[]
  recurringInvoices RecurringInvoice[]
  auditLogs       AuditLog[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
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

model Client {
  id             String       @id @default(cuid())
  organizationId String
  name           String
  email          String
  phone          String?
  company        String?
  address        String?
  city           String?
  state          String?
  postalCode     String?
  country        String       @default("US")
  taxId          String?
  notes          String?
  portalToken    String       @unique @default(cuid())
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  invoices       Invoice[]
  recurringInvoices RecurringInvoice[]
  
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  
  @@index([organizationId])
}

model Invoice {
  id             String        @id @default(cuid())
  organizationId String
  clientId       String
  number         String
  status         InvoiceStatus @default(DRAFT)
  issueDate      DateTime      @default(now())
  dueDate        DateTime
  currency       String        @default("USD")
  subtotal       Decimal       @db.Decimal(10, 2)
  taxRate        Decimal?      @db.Decimal(5, 2)
  taxAmount      Decimal?      @db.Decimal(10, 2)
  discount       Decimal?      @db.Decimal(10, 2)
  total          Decimal       @db.Decimal(10, 2)
  amountPaid     Decimal       @default(0) @db.Decimal(10, 2)
  notes          String?
  terms          String?
  
  stripePaymentIntentId String?
  stripePaymentLinkId   String?
  paymentLinkUrl        String?
  
  recurringInvoiceId String?
  recurringInvoice   RecurringInvoice? @relation(fields: [recurringInvoiceId], references: [id])
  
  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client         Client        @relation(fields: [clientId], references: [id])
  lineItems      LineItem[]
  payments       Payment[]
  
  sentAt         DateTime?
  paidAt         DateTime?
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
  
  @@unique([organizationId, number])
  @@index([organizationId])
  @@index([clientId])
  @@index([status])
}

enum InvoiceStatus {
  DRAFT
  SENT
  VIEWED
  PARTIAL
  PAID
  OVERDUE
  CANCELLED
}

model LineItem {
  id          String   @id @default(cuid())
  invoiceId   String
  description String
  quantity    Decimal  @db.Decimal(10, 2)
  unitPrice   Decimal  @db.Decimal(10, 2)
  amount      Decimal  @db.Decimal(10, 2)
  order       Int      @default(0)
  
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  @@index([invoiceId])
}

model Payment {
  id             String        @id @default(cuid())
  invoiceId      String
  amount         Decimal       @db.Decimal(10, 2)
  method         PaymentMethod
  reference      String?
  stripePaymentId String?
  notes          String?
  
  invoice        Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  
  paidAt         DateTime      @default(now())
  createdAt      DateTime      @default(now())
  
  @@index([invoiceId])
}

enum PaymentMethod {
  STRIPE
  BANK_TRANSFER
  CHECK
  CASH
  OTHER
}

model RecurringInvoice {
  id             String            @id @default(cuid())
  organizationId String
  clientId       String
  frequency      RecurringFrequency
  dayOfMonth     Int?
  dayOfWeek      Int?
  nextRunAt      DateTime
  isActive       Boolean           @default(true)
  
  // Template fields
  currency       String            @default("USD")
  lineItems      Json              // Stored as JSON template
  taxRate        Decimal?          @db.Decimal(5, 2)
  discount       Decimal?          @db.Decimal(10, 2)
  notes          String?
  terms          String?
  paymentTerms   Int               @default(30)
  
  organization   Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client         Client            @relation(fields: [clientId], references: [id])
  invoices       Invoice[]
  
  lastRunAt      DateTime?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt
  
  @@index([organizationId])
  @@index([nextRunAt])
}

enum RecurringFrequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
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

### Invoice Form Component

```tsx
// components/invoices/invoice-form.tsx
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Calculator } from 'lucide-react';
import { ClientSelector } from '@/components/clients/client-selector';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description required'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive'),
  unitPrice: z.coerce.number().min(0, 'Price must be positive'),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client required'),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string().default('USD'),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item required'),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: any;
  organizationId: string;
}

export function InvoiceForm({ invoice, organizationId }: InvoiceFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const defaultDueDate = new Date();
  defaultDueDate.setDate(defaultDueDate.getDate() + 30);
  
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: invoice ? {
      clientId: invoice.clientId,
      issueDate: invoice.issueDate.split('T')[0],
      dueDate: invoice.dueDate.split('T')[0],
      currency: invoice.currency,
      lineItems: invoice.lineItems.map((item: any) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      taxRate: invoice.taxRate ? Number(invoice.taxRate) : undefined,
      discount: invoice.discount ? Number(invoice.discount) : undefined,
      notes: invoice.notes || '',
      terms: invoice.terms || '',
    } : {
      clientId: '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: defaultDueDate.toISOString().split('T')[0],
      currency: 'USD',
      lineItems: [{ description: '', quantity: 1, unitPrice: 0 }],
      taxRate: undefined,
      discount: undefined,
      notes: '',
      terms: '',
    },
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });
  
  const watchLineItems = form.watch('lineItems');
  const watchTaxRate = form.watch('taxRate');
  const watchDiscount = form.watch('discount');
  
  const subtotal = watchLineItems.reduce((sum, item) => {
    return sum + (item.quantity || 0) * (item.unitPrice || 0);
  }, 0);
  
  const taxAmount = watchTaxRate ? subtotal * (watchTaxRate / 100) : 0;
  const discountAmount = watchDiscount || 0;
  const total = subtotal + taxAmount - discountAmount;
  
  const mutation = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const url = invoice 
        ? `/api/invoices/${invoice.id}` 
        : '/api/invoices';
      
      const response = await fetch(url, {
        method: invoice ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          subtotal,
          taxAmount,
          total,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save invoice');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      router.push(`/invoices/${data.id}`);
    },
  });
  
  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
      {/* Client Selection */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Client</h3>
        <ClientSelector
          value={form.watch('clientId')}
          onChange={(clientId) => form.setValue('clientId', clientId)}
          organizationId={organizationId}
        />
        {form.formState.errors.clientId && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.clientId.message}
          </p>
        )}
      </div>
      
      {/* Invoice Details */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Invoice Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Issue Date</label>
            <input
              type="date"
              {...form.register('issueDate')}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              {...form.register('dueDate')}
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              {...form.register('currency')}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="CAD">CAD - Canadian Dollar</option>
              <option value="AUD">AUD - Australian Dollar</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Line Items */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-4">Line Items</h3>
        <div className="space-y-3">
          {/* Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 text-sm font-medium text-gray-500">
            <div className="col-span-6">Description</div>
            <div className="col-span-2">Quantity</div>
            <div className="col-span-2">Unit Price</div>
            <div className="col-span-1 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>
          
          {fields.map((field, index) => {
            const quantity = watchLineItems[index]?.quantity || 0;
            const unitPrice = watchLineItems[index]?.unitPrice || 0;
            const amount = quantity * unitPrice;
            
            return (
              <div key={field.id} className="grid grid-cols-12 gap-3 items-start">
                <div className="col-span-12 md:col-span-6">
                  <input
                    {...form.register(`lineItems.${index}.description`)}
                    placeholder="Item description"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    {...form.register(`lineItems.${index}.quantity`)}
                    placeholder="Qty"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <input
                    type="number"
                    step="0.01"
                    {...form.register(`lineItems.${index}.unitPrice`)}
                    placeholder="Price"
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
                <div className="col-span-3 md:col-span-1 flex items-center justify-end h-[42px] text-sm font-medium">
                  ${amount.toFixed(2)}
                </div>
                <div className="col-span-1 flex items-center justify-center h-[42px]">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          <button
            type="button"
            onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Line Item
          </button>
        </div>
      </div>
      
      {/* Totals */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Notes & Terms */}
          <div className="flex-1 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                {...form.register('notes')}
                rows={3}
                placeholder="Notes visible to client..."
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Terms</label>
              <textarea
                {...form.register('terms')}
                rows={3}
                placeholder="Payment terms and conditions..."
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
          </div>
          
          {/* Calculations */}
          <div className="w-full md:w-72 space-y-3">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm">Tax Rate (%)</label>
              <input
                type="number"
                step="0.01"
                {...form.register('taxRate')}
                className="w-20 border rounded px-2 py-1 text-sm text-right"
              />
              <span className="text-sm">${taxAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm">Discount</label>
              <input
                type="number"
                step="0.01"
                {...form.register('discount')}
                className="w-20 border rounded px-2 py-1 text-sm text-right"
              />
            </div>
            
            <div className="border-t pt-3">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {mutation.isPending ? 'Saving...' : invoice ? 'Update Invoice' : 'Create Invoice'}
        </button>
      </div>
    </form>
  );
}
```

### PDF Generation

```tsx
// lib/pdf.ts
import { Document, Page, Text, View, StyleSheet, renderToStream } from '@react-pdf/renderer';
import { Invoice, Client, Organization, LineItem } from '@prisma/client';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logo: {
    width: 120,
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  invoiceNumber: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  addressSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  addressBlock: {
    width: '45%',
  },
  addressLabel: {
    fontSize: 8,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 10,
    lineHeight: 1.4,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  detailLabel: {
    width: 80,
    color: '#6b7280',
  },
  detailValue: {
    width: 100,
    textAlign: 'right',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  colDescription: { flex: 3 },
  colQuantity: { width: 60, textAlign: 'center' },
  colPrice: { width: 80, textAlign: 'right' },
  colAmount: { width: 80, textAlign: 'right' },
  headerText: {
    fontWeight: 'bold',
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#374151',
  },
  totalsSection: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    paddingRight: 10,
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
  },
  grandTotal: {
    fontWeight: 'bold',
    fontSize: 14,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#1f2937',
  },
  notes: {
    marginTop: 40,
    padding: 15,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  notesLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: '#4b5563',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 8,
  },
});

interface InvoicePDFProps {
  invoice: Invoice & { 
    lineItems: LineItem[];
    client: Client;
    organization: Organization;
  };
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const { client, organization, lineItems } = invoice;
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: 'bold', fontSize: 14 }}>{organization.name}</Text>
            {organization.address && <Text>{organization.address}</Text>}
            <Text>{organization.city}, {organization.state} {organization.postalCode}</Text>
            <Text>{organization.email}</Text>
          </View>
        </View>
        
        {/* Addresses */}
        <View style={styles.addressSection}>
          <View style={styles.addressBlock}>
            <Text style={styles.addressLabel}>Bill To</Text>
            <Text style={[styles.addressText, { fontWeight: 'bold' }]}>{client.name}</Text>
            {client.company && <Text style={styles.addressText}>{client.company}</Text>}
            {client.address && <Text style={styles.addressText}>{client.address}</Text>}
            <Text style={styles.addressText}>
              {client.city}, {client.state} {client.postalCode}
            </Text>
            <Text style={styles.addressText}>{client.email}</Text>
          </View>
          <View style={{ width: '40%' }}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Invoice Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(invoice.issueDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Due Date:</Text>
              <Text style={styles.detailValue}>
                {new Date(invoice.dueDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailLabel}>Amount Due:</Text>
              <Text style={[styles.detailValue, { fontWeight: 'bold' }]}>
                {invoice.currency} {Number(invoice.total).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colDescription, styles.headerText]}>Description</Text>
            <Text style={[styles.colQuantity, styles.headerText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.headerText]}>Unit Price</Text>
            <Text style={[styles.colAmount, styles.headerText]}>Amount</Text>
          </View>
          {lineItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.colDescription}>{item.description}</Text>
              <Text style={styles.colQuantity}>{Number(item.quantity)}</Text>
              <Text style={styles.colPrice}>{Number(item.unitPrice).toFixed(2)}</Text>
              <Text style={styles.colAmount}>{Number(item.amount).toFixed(2)}</Text>
            </View>
          ))}
        </View>
        
        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>
              {invoice.currency} {Number(invoice.subtotal).toFixed(2)}
            </Text>
          </View>
          {invoice.taxAmount && Number(invoice.taxAmount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax ({Number(invoice.taxRate)}%):</Text>
              <Text style={styles.totalValue}>
                {invoice.currency} {Number(invoice.taxAmount).toFixed(2)}
              </Text>
            </View>
          )}
          {invoice.discount && Number(invoice.discount) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Discount:</Text>
              <Text style={styles.totalValue}>
                -{invoice.currency} {Number(invoice.discount).toFixed(2)}
              </Text>
            </View>
          )}
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>
              {invoice.currency} {Number(invoice.total).toFixed(2)}
            </Text>
          </View>
        </View>
        
        {/* Notes */}
        {invoice.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesLabel}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </View>
        )}
        
        {invoice.terms && (
          <View style={[styles.notes, { marginTop: 10 }]}>
            <Text style={styles.notesLabel}>Terms & Conditions</Text>
            <Text style={styles.notesText}>{invoice.terms}</Text>
          </View>
        )}
        
        {/* Footer */}
        <Text style={styles.footer}>
          {organization.name} • {organization.email}
          {organization.website && ` • ${organization.website}`}
        </Text>
      </Page>
    </Document>
  );
}

export async function generateInvoicePDF(invoice: InvoicePDFProps['invoice']): Promise<NodeJS.ReadableStream> {
  return renderToStream(<InvoicePDF invoice={invoice} />);
}
```

### Invoice API Routes

```tsx
// app/api/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth';
import { z } from 'zod';

const createInvoiceSchema = z.object({
  clientId: z.string(),
  issueDate: z.string(),
  dueDate: z.string(),
  currency: z.string().default('USD'),
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unitPrice: z.number(),
  })),
  subtotal: z.number(),
  taxRate: z.number().optional(),
  taxAmount: z.number().optional(),
  discount: z.number().optional(),
  total: z.number(),
  notes: z.string().optional(),
  terms: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const org = await getCurrentOrganization(user.id);
  if (!org) {
    return NextResponse.json({ error: 'No organization' }, { status: 400 });
  }
  
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const clientId = searchParams.get('clientId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  const where = {
    organizationId: org.id,
    ...(status && { status: status as any }),
    ...(clientId && { clientId }),
  };
  
  const [invoices, total] = await Promise.all([
    prisma.invoice.findMany({
      where,
      include: {
        client: true,
        lineItems: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.invoice.count({ where }),
  ]);
  
  return NextResponse.json({
    invoices,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const org = await getCurrentOrganization(user.id);
  if (!org) {
    return NextResponse.json({ error: 'No organization' }, { status: 400 });
  }
  
  const body = await request.json();
  const data = createInvoiceSchema.parse(body);
  
  // Generate invoice number
  const invoiceNumber = `${org.invoicePrefix}-${String(org.invoiceCounter).padStart(5, '0')}`;
  
  const invoice = await prisma.$transaction(async (tx) => {
    // Update counter
    await tx.organization.update({
      where: { id: org.id },
      data: { invoiceCounter: { increment: 1 } },
    });
    
    // Create invoice with line items
    return tx.invoice.create({
      data: {
        organizationId: org.id,
        clientId: data.clientId,
        number: invoiceNumber,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        currency: data.currency,
        subtotal: data.subtotal,
        taxRate: data.taxRate,
        taxAmount: data.taxAmount,
        discount: data.discount,
        total: data.total,
        notes: data.notes,
        terms: data.terms,
        lineItems: {
          create: data.lineItems.map((item, index) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            order: index,
          })),
        },
      },
      include: {
        client: true,
        lineItems: true,
      },
    });
  });
  
  // Audit log
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      action: 'CREATE',
      entityType: 'Invoice',
      entityId: invoice.id,
      changes: { number: invoiceNumber, total: data.total },
    },
  });
  
  return NextResponse.json(invoice, { status: 201 });
}
```

### Send Invoice with Payment Link

```tsx
// app/api/invoices/[id]/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { resend } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const org = await getCurrentOrganization(user.id);
  if (!org) {
    return NextResponse.json({ error: 'No organization' }, { status: 400 });
  }
  
  const invoice = await prisma.invoice.findFirst({
    where: { id, organizationId: org.id },
    include: { client: true, organization: true },
  });
  
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }
  
  // Create Stripe Payment Link if organization has Stripe connected
  let paymentLinkUrl = null;
  if (org.stripeAccountId) {
    const paymentLink = await stripe.paymentLinks.create({
      line_items: [{
        price_data: {
          currency: invoice.currency.toLowerCase(),
          product_data: {
            name: `Invoice ${invoice.number}`,
            description: `Payment for invoice ${invoice.number}`,
          },
          unit_amount: Math.round(Number(invoice.total) * 100),
        },
        quantity: 1,
      }],
      metadata: {
        invoiceId: invoice.id,
        organizationId: org.id,
      },
      after_completion: {
        type: 'redirect',
        redirect: {
          url: `${process.env.NEXT_PUBLIC_APP_URL}/portal/${invoice.client.portalToken}?paid=true`,
        },
      },
    }, {
      stripeAccount: org.stripeAccountId,
    });
    
    paymentLinkUrl = paymentLink.url;
  }
  
  // Generate portal link
  const portalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${invoice.client.portalToken}`;
  
  // Send email
  await resend.emails.send({
    from: `${org.name} <invoices@${process.env.EMAIL_DOMAIN}>`,
    to: invoice.client.email,
    subject: `Invoice ${invoice.number} from ${org.name}`,
    html: `
      <h2>Invoice ${invoice.number}</h2>
      <p>Dear ${invoice.client.name},</p>
      <p>Please find your invoice from ${org.name}.</p>
      <table style="margin: 20px 0;">
        <tr><td>Invoice Number:</td><td><strong>${invoice.number}</strong></td></tr>
        <tr><td>Amount Due:</td><td><strong>${invoice.currency} ${Number(invoice.total).toFixed(2)}</strong></td></tr>
        <tr><td>Due Date:</td><td>${new Date(invoice.dueDate).toLocaleDateString()}</td></tr>
      </table>
      ${paymentLinkUrl ? `
        <p><a href="${paymentLinkUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Pay Now</a></p>
      ` : ''}
      <p><a href="${portalUrl}">View Invoice in Portal</a></p>
      <p>Thank you for your business!</p>
      <p>${org.name}</p>
    `,
  });
  
  // Update invoice status
  await prisma.invoice.update({
    where: { id },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      paymentLinkUrl,
    },
  });
  
  // Audit log
  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      action: 'SEND',
      entityType: 'Invoice',
      entityId: invoice.id,
    },
  });
  
  return NextResponse.json({ success: true, paymentLinkUrl });
}
```

### Client Portal Page

```tsx
// app/portal/[token]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { Download, CreditCard, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Props {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ paid?: string }>;
}

export default async function ClientPortalPage({ params, searchParams }: Props) {
  const { token } = await params;
  const { paid } = await searchParams;
  
  const client = await prisma.client.findUnique({
    where: { portalToken: token },
    include: {
      organization: true,
      invoices: {
        where: {
          status: { not: 'DRAFT' },
        },
        orderBy: { createdAt: 'desc' },
        include: { lineItems: true },
      },
    },
  });
  
  if (!client) {
    notFound();
  }
  
  // Mark invoices as viewed
  const unviewedInvoices = client.invoices.filter(
    (inv) => inv.status === 'SENT'
  );
  if (unviewedInvoices.length > 0) {
    await prisma.invoice.updateMany({
      where: { id: { in: unviewedInvoices.map((i) => i.id) } },
      data: { status: 'VIEWED' },
    });
  }
  
  const totalOutstanding = client.invoices
    .filter((inv) => !['PAID', 'CANCELLED'].includes(inv.status))
    .reduce((sum, inv) => sum + Number(inv.total) - Number(inv.amountPaid), 0);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{client.organization.name}</h1>
              <p className="text-gray-600">Client Portal</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{client.name}</p>
              <p className="text-sm text-gray-500">{client.email}</p>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Payment Success Message */}
        {paid && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-green-800">Thank you! Your payment has been received.</p>
          </div>
        )}
        
        {/* Outstanding Balance */}
        {totalOutstanding > 0 && (
          <div className="mb-8 bg-white rounded-lg border p-6">
            <h2 className="text-lg font-semibold mb-2">Outstanding Balance</h2>
            <p className="text-3xl font-bold text-blue-600">
              ${totalOutstanding.toFixed(2)}
            </p>
          </div>
        )}
        
        {/* Invoices */}
        <div className="bg-white rounded-lg border">
          <div className="px-6 py-4 border-b">
            <h2 className="font-semibold">Your Invoices</h2>
          </div>
          <div className="divide-y">
            {client.invoices.map((invoice) => {
              const isPaid = invoice.status === 'PAID';
              const balance = Number(invoice.total) - Number(invoice.amountPaid);
              
              return (
                <div key={invoice.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Invoice #{invoice.number}</p>
                      <p className="text-sm text-gray-600">
                        Issued: {new Date(invoice.issueDate).toLocaleDateString()}
                        {' • '}
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {invoice.currency} {Number(invoice.total).toFixed(2)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isPaid 
                            ? 'bg-green-100 text-green-700'
                            : invoice.status === 'OVERDUE'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {invoice.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={`/api/pdf/${invoice.id}?token=${token}`}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        {!isPaid && invoice.paymentLinkUrl && (
                          <a
                            href={invoice.paymentLinkUrl}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                          >
                            <CreditCard className="h-4 w-4" />
                            Pay Now
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {client.invoices.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                No invoices yet
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
```

### Recurring Invoice Processor

```tsx
// app/api/recurring/process/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Called by cron job (e.g., Vercel Cron)
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const now = new Date();
  
  // Find recurring invoices due to run
  const dueRecurring = await prisma.recurringInvoice.findMany({
    where: {
      isActive: true,
      nextRunAt: { lte: now },
    },
    include: {
      organization: true,
      client: true,
    },
  });
  
  const results = [];
  
  for (const recurring of dueRecurring) {
    try {
      const lineItems = recurring.lineItems as any[];
      
      // Calculate totals
      const subtotal = lineItems.reduce(
        (sum: number, item: any) => sum + item.quantity * item.unitPrice,
        0
      );
      const taxAmount = recurring.taxRate 
        ? subtotal * (Number(recurring.taxRate) / 100)
        : 0;
      const discount = recurring.discount ? Number(recurring.discount) : 0;
      const total = subtotal + taxAmount - discount;
      
      // Generate invoice number
      const invoiceNumber = `${recurring.organization.invoicePrefix}-${
        String(recurring.organization.invoiceCounter).padStart(5, '0')
      }`;
      
      // Create invoice
      const invoice = await prisma.$transaction(async (tx) => {
        await tx.organization.update({
          where: { id: recurring.organizationId },
          data: { invoiceCounter: { increment: 1 } },
        });
        
        return tx.invoice.create({
          data: {
            organizationId: recurring.organizationId,
            clientId: recurring.clientId,
            recurringInvoiceId: recurring.id,
            number: invoiceNumber,
            issueDate: now,
            dueDate: new Date(now.getTime() + recurring.paymentTerms * 24 * 60 * 60 * 1000),
            currency: recurring.currency,
            subtotal,
            taxRate: recurring.taxRate,
            taxAmount,
            discount: recurring.discount,
            total,
            notes: recurring.notes,
            terms: recurring.terms,
            lineItems: {
              create: lineItems.map((item: any, index: number) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                amount: item.quantity * item.unitPrice,
                order: index,
              })),
            },
          },
        });
      });
      
      // Calculate next run date
      let nextRunAt = new Date(recurring.nextRunAt);
      switch (recurring.frequency) {
        case 'WEEKLY':
          nextRunAt.setDate(nextRunAt.getDate() + 7);
          break;
        case 'BIWEEKLY':
          nextRunAt.setDate(nextRunAt.getDate() + 14);
          break;
        case 'MONTHLY':
          nextRunAt.setMonth(nextRunAt.getMonth() + 1);
          break;
        case 'QUARTERLY':
          nextRunAt.setMonth(nextRunAt.getMonth() + 3);
          break;
        case 'YEARLY':
          nextRunAt.setFullYear(nextRunAt.getFullYear() + 1);
          break;
      }
      
      await prisma.recurringInvoice.update({
        where: { id: recurring.id },
        data: {
          lastRunAt: now,
          nextRunAt,
        },
      });
      
      results.push({ 
        recurringId: recurring.id, 
        invoiceId: invoice.id, 
        status: 'success' 
      });
    } catch (error) {
      console.error(`Failed to process recurring ${recurring.id}:`, error);
      results.push({ 
        recurringId: recurring.id, 
        status: 'error', 
        error: String(error) 
      });
    }
  }
  
  return NextResponse.json({ processed: results.length, results });
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| dashboard-layout | L5 | Main app shell with sidebar navigation |
| invoice-page | L5 | Invoice creation and management views |
| settings-page | L5 | Organization and integration settings |
| invoice-table | L3 | Sortable, filterable invoice listing |
| data-table | L3 | Generic table with pagination |
| checkout-form | L3 | Stripe checkout integration |
| settings-form | L3 | Multi-tab settings management |
| server-actions | L4 | Form mutations and invoice operations |
| rbac | L4 | Role-based access control for teams |
| form-validation | L4 | Zod schemas for invoice data |
| mutations | L4 | Optimistic updates for invoice status |
| form-field | L2 | Input fields with validation |
| stat-card | L2 | Revenue and invoice statistics |
| pagination | L2 | Invoice list pagination |

## Testing

### Test Setup

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/setup.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```ts
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Stripe
vi.mock('stripe', () => ({
  default: vi.fn(() => ({
    paymentLinks: { create: vi.fn() },
    webhooks: { constructEvent: vi.fn() },
  })),
}));

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({
    emails: { send: vi.fn() },
  })),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/invoices',
  useSearchParams: () => new URLSearchParams(),
}));
```

### Unit Tests

```tsx
// components/invoices/__tests__/invoice-form.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { InvoiceForm } from '../invoice-form';
import { describe, it, expect, vi } from 'vitest';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('InvoiceForm', () => {
  it('renders client selector and line items', () => {
    render(
      <InvoiceForm organizationId="org-1" />,
      { wrapper }
    );

    expect(screen.getByText('Client')).toBeInTheDocument();
    expect(screen.getByText('Line Items')).toBeInTheDocument();
  });

  it('adds line items dynamically', async () => {
    render(
      <InvoiceForm organizationId="org-1" />,
      { wrapper }
    );

    const addButton = screen.getByText(/add line item/i);
    await userEvent.click(addButton);

    const inputs = screen.getAllByPlaceholderText('Item description');
    expect(inputs).toHaveLength(2);
  });

  it('calculates totals correctly', async () => {
    render(
      <InvoiceForm organizationId="org-1" />,
      { wrapper }
    );

    // Fill in quantity and price
    const qtyInput = screen.getAllByPlaceholderText('Qty')[0];
    const priceInput = screen.getAllByPlaceholderText('Price')[0];

    await userEvent.clear(qtyInput);
    await userEvent.type(qtyInput, '2');
    await userEvent.clear(priceInput);
    await userEvent.type(priceInput, '100');

    // Check calculated amount
    await waitFor(() => {
      expect(screen.getByText('$200.00')).toBeInTheDocument();
    });
  });

  it('validates required client before submission', async () => {
    render(
      <InvoiceForm organizationId="org-1" />,
      { wrapper }
    );

    const submitButton = screen.getByText(/create invoice/i);
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/client required/i)).toBeInTheDocument();
    });
  });
});
```

```tsx
// components/invoices/__tests__/line-item-editor.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LineItemEditor } from '../line-item-editor';
import { describe, it, expect, vi } from 'vitest';

describe('LineItemEditor', () => {
  const mockOnChange = vi.fn();
  const mockOnRemove = vi.fn();

  const defaultProps = {
    item: { description: 'Service', quantity: 1, unitPrice: 100 },
    index: 0,
    onChange: mockOnChange,
    onRemove: mockOnRemove,
    canRemove: true,
  };

  it('displays item values', () => {
    render(<LineItemEditor {...defaultProps} />);

    expect(screen.getByDisplayValue('Service')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('100')).toBeInTheDocument();
  });

  it('calls onRemove when delete clicked', async () => {
    render(<LineItemEditor {...defaultProps} />);

    const deleteButton = screen.getByRole('button');
    await userEvent.click(deleteButton);

    expect(mockOnRemove).toHaveBeenCalledWith(0);
  });

  it('hides remove button when canRemove is false', () => {
    render(<LineItemEditor {...defaultProps} canRemove={false} />);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
// tests/integration/invoice-api.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Invoice API Integration', () => {
  let testOrgId: string;
  let testUserId: string;
  let testClientId: string;

  beforeAll(async () => {
    // Create test organization
    const org = await prisma.organization.create({
      data: {
        name: 'Test Company',
        email: 'test@company.com',
        invoicePrefix: 'TEST',
        invoiceCounter: 1,
      },
    });
    testOrgId = org.id;

    // Create test user
    const user = await prisma.user.create({
      data: {
        email: 'user@test.com',
        name: 'Test User',
        passwordHash: 'hashed',
      },
    });
    testUserId = user.id;

    // Add user to org
    await prisma.organizationMember.create({
      data: {
        organizationId: testOrgId,
        userId: testUserId,
        role: 'OWNER',
      },
    });

    // Create test client
    const client = await prisma.client.create({
      data: {
        organizationId: testOrgId,
        name: 'Test Client',
        email: 'client@test.com',
      },
    });
    testClientId = client.id;
  });

  afterAll(async () => {
    await prisma.lineItem.deleteMany({});
    await prisma.invoice.deleteMany({ where: { organizationId: testOrgId } });
    await prisma.client.deleteMany({ where: { organizationId: testOrgId } });
    await prisma.organizationMember.deleteMany({ where: { organizationId: testOrgId } });
    await prisma.user.delete({ where: { id: testUserId } });
    await prisma.organization.delete({ where: { id: testOrgId } });
  });

  it('creates invoice with line items', async () => {
    const invoice = await prisma.invoice.create({
      data: {
        organizationId: testOrgId,
        clientId: testClientId,
        number: 'TEST-00001',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        currency: 'USD',
        subtotal: 1000,
        total: 1000,
        lineItems: {
          create: [
            { description: 'Consulting', quantity: 10, unitPrice: 100, amount: 1000, order: 0 },
          ],
        },
      },
      include: { lineItems: true },
    });

    expect(invoice.id).toBeDefined();
    expect(invoice.number).toBe('TEST-00001');
    expect(invoice.lineItems).toHaveLength(1);
  });

  it('increments invoice counter', async () => {
    const org = await prisma.organization.update({
      where: { id: testOrgId },
      data: { invoiceCounter: { increment: 1 } },
    });

    expect(org.invoiceCounter).toBe(2);
  });

  it('calculates outstanding balance', async () => {
    const result = await prisma.invoice.aggregate({
      where: {
        organizationId: testOrgId,
        status: { in: ['SENT', 'VIEWED', 'PARTIAL', 'OVERDUE'] },
      },
      _sum: { total: true, amountPaid: true },
    });

    const outstanding =
      Number(result._sum.total || 0) - Number(result._sum.amountPaid || 0);
    expect(outstanding).toBeGreaterThanOrEqual(0);
  });
});
```

### E2E Tests

```ts
// tests/e2e/invoice-flow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Invoice Management Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('creates and sends invoice', async ({ page }) => {
    // Navigate to new invoice
    await page.click('a[href="/invoices/new"]');
    await page.waitForURL('/invoices/new');

    // Select client
    await page.click('[data-testid="client-selector"]');
    await page.click('text=Acme Corp');

    // Add line item
    await page.fill('input[placeholder="Item description"]', 'Web Development');
    await page.fill('input[placeholder="Qty"]', '40');
    await page.fill('input[placeholder="Price"]', '150');

    // Verify total
    await expect(page.locator('text=$6,000.00')).toBeVisible();

    // Create invoice
    await page.click('text=Create Invoice');
    await page.waitForURL(/\/invoices\/.+/);

    // Send invoice
    await page.click('text=Send Invoice');
    await expect(page.locator('text=Invoice sent')).toBeVisible();

    // Verify status changed
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText('SENT');
  });

  test('downloads invoice PDF', async ({ page }) => {
    await page.goto('/invoices');
    await page.click('[data-testid="invoice-row"]');

    const downloadPromise = page.waitForEvent('download');
    await page.click('text=Download PDF');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/INV-\d+\.pdf/);
  });

  test('records payment on invoice', async ({ page }) => {
    await page.goto('/invoices');
    await page.click('[data-testid="invoice-row"]');

    await page.click('text=Record Payment');
    await page.fill('[name="amount"]', '1000');
    await page.selectOption('[name="method"]', 'BANK_TRANSFER');
    await page.fill('[name="reference"]', 'CHK-123');
    await page.click('text=Save Payment');

    await expect(page.locator('text=Payment recorded')).toBeVisible();
  });

  test('client views invoice in portal', async ({ page }) => {
    // Get portal token from test setup
    const portalUrl = '/portal/test-client-token';
    await page.goto(portalUrl);

    await expect(page.locator('text=Client Portal')).toBeVisible();
    await expect(page.locator('[data-testid="invoice-list"]')).toBeVisible();

    // Download PDF
    await page.click('[data-testid="download-pdf"]');
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, FileText } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Invoice App Error:', error, errorInfo);

    if (typeof window !== 'undefined' && window.Sentry) {
      window.Sentry.captureException(error, { extra: errorInfo });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Unable to load invoice data</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'An error occurred'}
            </p>
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg mx-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```tsx
// lib/api-error.ts
import { z } from 'zod';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class InvoiceNotFoundError extends APIError {
  constructor(invoiceId: string) {
    super(`Invoice not found: ${invoiceId}`, 404, 'INVOICE_NOT_FOUND');
  }
}

export class ClientNotFoundError extends APIError {
  constructor(clientId: string) {
    super(`Client not found: ${clientId}`, 404, 'CLIENT_NOT_FOUND');
  }
}

export class PaymentExceedsBalanceError extends APIError {
  constructor(amount: number, balance: number) {
    super(
      `Payment amount ($${amount.toFixed(2)}) exceeds invoice balance ($${balance.toFixed(2)})`,
      400,
      'PAYMENT_EXCEEDS_BALANCE'
    );
  }
}

export class StripeNotConnectedError extends APIError {
  constructor() {
    super('Stripe account not connected', 400, 'STRIPE_NOT_CONNECTED');
  }
}

export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return Response.json(
      { error: 'Validation failed', details: error.errors },
      { status: 400 }
    );
  }

  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Form Validation Errors

```tsx
// components/ui/invoice-error.tsx
import { AlertCircle } from 'lucide-react';

interface InvoiceErrorProps {
  field: string;
  message: string;
}

export function InvoiceError({ field, message }: InvoiceErrorProps) {
  return (
    <div className="flex items-center gap-2 mt-1 text-sm text-red-600" role="alert">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// Invoice-specific validation messages
export const invoiceErrors = {
  client: {
    required: 'Please select a client',
  },
  issueDate: {
    required: 'Issue date is required',
  },
  dueDate: {
    required: 'Due date is required',
    beforeIssue: 'Due date must be after issue date',
  },
  lineItems: {
    required: 'At least one line item is required',
    description: 'Description is required',
    quantity: 'Quantity must be positive',
    price: 'Price must be positive',
  },
  payment: {
    amount: 'Amount must be positive',
    exceeds: 'Amount exceeds remaining balance',
    method: 'Payment method is required',
  },
};
```

## Accessibility

| WCAG Criterion | Level | Implementation |
|----------------|-------|----------------|
| 1.1.1 Non-text Content | A | Status icons have aria-labels |
| 1.3.1 Info and Relationships | A | Invoice tables have proper headers |
| 1.3.2 Meaningful Sequence | A | Line items flow logically |
| 1.4.3 Contrast | AA | 4.5:1 for invoice text and amounts |
| 2.1.1 Keyboard | A | All invoice actions keyboard accessible |
| 2.4.3 Focus Order | A | Logical tab order in invoice form |
| 2.4.4 Link Purpose | A | Invoice links describe destination |
| 2.4.7 Focus Visible | AA | Clear focus indicators on form fields |
| 3.3.1 Error Identification | A | Form errors clearly identified |
| 3.3.3 Error Suggestion | AA | Helpful error messages for corrections |
| 4.1.2 Name, Role, Value | A | ARIA for status badges and actions |

### Focus Management for Mobile

```tsx
// hooks/use-invoice-form-focus.ts
import { useRef, useCallback } from 'react';

export function useLineItemFocus() {
  const containerRef = useRef<HTMLDivElement>(null);

  const focusLastItem = useCallback(() => {
    if (containerRef.current) {
      const inputs = containerRef.current.querySelectorAll(
        'input[placeholder="Item description"]'
      );
      const lastInput = inputs[inputs.length - 1] as HTMLInputElement;
      lastInput?.focus();
    }
  }, []);

  return { containerRef, focusLastItem };
}
```

### Accessible Forms

```tsx
// components/invoices/accessible-invoice-form.tsx
<form onSubmit={handleSubmit} aria-label="Create invoice">
  <fieldset>
    <legend className="sr-only">Invoice Details</legend>

    {/* Client selector */}
    <div role="group" aria-labelledby="client-label">
      <label id="client-label" htmlFor="client-select">
        Client <span aria-hidden="true">*</span>
        <span className="sr-only">(required)</span>
      </label>
      <select
        id="client-select"
        aria-required="true"
        aria-invalid={!!errors.clientId}
        aria-describedby={errors.clientId ? 'client-error' : undefined}
      >
        <option value="">Select a client</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      {errors.clientId && (
        <span id="client-error" role="alert">
          {errors.clientId.message}
        </span>
      )}
    </div>

    {/* Line items table */}
    <table role="grid" aria-label="Invoice line items">
      <thead>
        <tr>
          <th scope="col">Description</th>
          <th scope="col">Quantity</th>
          <th scope="col">Unit Price</th>
          <th scope="col">Amount</th>
          <th scope="col"><span className="sr-only">Actions</span></th>
        </tr>
      </thead>
      <tbody>
        {/* Line item rows */}
      </tbody>
    </table>
  </fieldset>

  {/* Totals with live region for updates */}
  <div aria-live="polite" aria-atomic="true">
    <dl>
      <dt>Subtotal</dt>
      <dd>${subtotal.toFixed(2)}</dd>
      <dt>Total</dt>
      <dd>${total.toFixed(2)}</dd>
    </dl>
  </div>
</form>
```

## Security

### Input Validation with Zod

```tsx
// lib/validations/invoice.ts
import { z } from 'zod';

export const lineItemSchema = z.object({
  description: z.string().min(1, 'Description required').max(500),
  quantity: z.coerce.number().positive('Must be positive').max(999999),
  unitPrice: z.coerce.number().min(0).max(999999999),
});

export const invoiceSchema = z.object({
  clientId: z.string().cuid('Invalid client'),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
  lineItems: z.array(lineItemSchema).min(1, 'At least one item required'),
  taxRate: z.coerce.number().min(0).max(100).optional(),
  discount: z.coerce.number().min(0).max(999999999).optional(),
  notes: z.string().max(2000).optional(),
  terms: z.string().max(5000).optional(),
}).refine(
  (data) => new Date(data.dueDate) >= new Date(data.issueDate),
  { message: 'Due date must be after issue date', path: ['dueDate'] }
);

export const paymentSchema = z.object({
  amount: z.coerce.number().positive('Amount must be positive'),
  method: z.enum(['STRIPE', 'BANK_TRANSFER', 'CHECK', 'CASH', 'OTHER']),
  reference: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});
```

### Rate Limiting Configuration

```tsx
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimits = {
  // Invoice operations
  invoices: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:invoices',
  }),

  // PDF generation (expensive)
  pdf: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 m'),
    prefix: 'ratelimit:pdf',
  }),

  // Email sending
  email: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    prefix: 'ratelimit:email',
  }),

  // Client portal access (by IP)
  portal: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'ratelimit:portal',
  }),

  // Auth attempts
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'ratelimit:auth',
  }),
};
```

### Auth Middleware

```tsx
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname } = request.nextUrl;

  // Client portal is public (authenticated by token in URL)
  if (pathname.startsWith('/portal/')) {
    return NextResponse.next();
  }

  // API webhooks don't require user auth (use webhook signature)
  if (pathname.startsWith('/api/webhooks/')) {
    return NextResponse.next();
  }

  // Auth pages
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (!token && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com; frame-src https://js.stripe.com; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

export const config = {
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico).*)'],
};
```

## Performance

### Caching Strategies

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';

// Cache organization settings
export const getCachedOrganization = unstable_cache(
  async (orgId: string) => {
    return prisma.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        email: true,
        logo: true,
        invoicePrefix: true,
        defaultCurrency: true,
        paymentTerms: true,
        stripeAccountId: true,
      },
    });
  },
  ['organization'],
  { revalidate: 300, tags: ['organization'] }
);

// Cache client list
export const getCachedClients = unstable_cache(
  async (orgId: string) => {
    return prisma.client.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, email: true, company: true },
      orderBy: { name: 'asc' },
    });
  },
  ['clients'],
  { revalidate: 60, tags: ['clients'] }
);

// Cache dashboard stats
export const getCachedDashboardStats = unstable_cache(
  async (orgId: string) => {
    const [totalRevenue, outstanding, overdueCount] = await Promise.all([
      prisma.invoice.aggregate({
        where: { organizationId: orgId, status: 'PAID' },
        _sum: { total: true },
      }),
      prisma.invoice.aggregate({
        where: {
          organizationId: orgId,
          status: { in: ['SENT', 'VIEWED', 'PARTIAL'] },
        },
        _sum: { total: true, amountPaid: true },
      }),
      prisma.invoice.count({
        where: { organizationId: orgId, status: 'OVERDUE' },
      }),
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.total || 0),
      outstanding:
        Number(outstanding._sum.total || 0) -
        Number(outstanding._sum.amountPaid || 0),
      overdueCount,
    };
  },
  ['dashboard-stats'],
  { revalidate: 60, tags: ['invoices'] }
);
```

### Image Optimization

```tsx
// next.config.ts
import type { NextConfig } from 'next';

const config: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'invoice-logos.s3.amazonaws.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
  },
};

export default config;
```

### Bundle Optimization

```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic';

// Lazy load PDF preview (only on invoice detail)
export const InvoicePreview = dynamic(
  () => import('@/components/invoices/invoice-preview'),
  {
    loading: () => <div className="h-[600px] bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false,
  }
);

// Lazy load revenue chart
export const RevenueChart = dynamic(
  () => import('@/components/dashboard/revenue-chart'),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false,
  }
);

// Lazy load Stripe elements
export const StripeCheckout = dynamic(
  () => import('@/components/payments/stripe-checkout'),
  {
    loading: () => <div className="h-32 bg-gray-100 animate-pulse rounded-lg" />,
    ssr: false,
  }
);
```

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET }}
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_SECRET_KEY }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: invoice_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/invoice_test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, typecheck, test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Sentry Setup

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  beforeSend(event) {
    // Sanitize invoice data
    if (event.extra?.invoice) {
      event.extra.invoice = {
        id: event.extra.invoice.id,
        number: event.extra.invoice.number,
        // Remove financial details
      };
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
  const healthcheck = {
    uptime: process.uptime(),
    timestamp: Date.now(),
    status: 'ok',
    checks: {} as Record<string, { status: string; latency?: number }>,
  };

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthcheck.checks.database = {
      status: 'ok',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    healthcheck.status = 'degraded';
    healthcheck.checks.database = { status: 'error' };
  }

  // Stripe API check
  const stripeStart = Date.now();
  try {
    await stripe.balance.retrieve();
    healthcheck.checks.stripe = {
      status: 'ok',
      latency: Date.now() - stripeStart,
    };
  } catch (error) {
    healthcheck.checks.stripe = { status: 'error' };
  }

  // Memory check
  const memUsage = process.memoryUsage();
  healthcheck.checks.memory = {
    status: memUsage.heapUsed < 500 * 1024 * 1024 ? 'ok' : 'warning',
  };

  const statusCode = healthcheck.status === 'ok' ? 200 : 503;
  return NextResponse.json(healthcheck, { status: statusCode });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/invoice_app"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_DOMAIN="yourdomain.com"

# Redis (Rate Limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Sentry (Error Monitoring)
SENTRY_DSN="https://your-dsn@sentry.io/project"
NEXT_PUBLIC_SENTRY_DSN="https://your-dsn@sentry.io/project"

# Cron Jobs
CRON_SECRET="your-cron-secret"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment Checklist

- [ ] All environment variables configured in production
- [ ] Database migrations applied (`npx prisma migrate deploy`)
- [ ] Stripe webhook endpoint configured (`/api/webhooks/stripe`)
- [ ] Stripe webhook events enabled (payment_intent.succeeded, etc.)
- [ ] Resend domain verified and DNS configured
- [ ] Redis instance provisioned for rate limiting
- [ ] Sentry project configured and DSN added
- [ ] SSL certificate configured
- [ ] Rate limiting tested
- [ ] Database connection pooling enabled
- [ ] PDF generation tested with large invoices
- [ ] Email templates tested across email clients
- [ ] Recurring invoice cron job configured
- [ ] Stripe Connect onboarding tested (if multi-tenant)
- [ ] Client portal tested without authentication
- [ ] Health check endpoint accessible
- [ ] Audit logging verified
- [ ] RBAC permissions tested for all roles
- [ ] WCAG accessibility audit passed
- [ ] Load testing for PDF generation
- [ ] Security headers configured
- [ ] CSP allows Stripe.js

## Related Skills

- [[server-actions]] - Form handling and mutations
- [[api-routes]] - RESTful API design
- [[stripe-integration]] - Payment processing
- [[pdf-generation]] - Document generation
- [[email-integration]] - Transactional emails
- [[rbac]] - Role-based access control
- [[audit-logging]] - Activity tracking

## Changelog

- 1.0.0: Initial invoice app recipe with PDF, payments, recurring, and client portal
