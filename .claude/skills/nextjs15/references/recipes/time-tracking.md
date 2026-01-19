---
id: r-time-tracking
name: Time Tracking & Billing
version: 3.0.0
layer: L6
category: recipes
description: Enterprise time tracking platform with timers, time entries, projects, invoicing, retainer management, and comprehensive reporting
tags: [time-tracking, billing, invoicing, timers, projects, retainers, consulting, freelance]
formula: "TimeTracking = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + SettingsPage(t-settings-page) + InvoicePage(t-invoice-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + Timer(o-timer) + TimeEntryTable(o-time-entry-table) + ProjectCard(o-project-card) + InvoiceBuilder(o-invoice-builder) + DataTable(o-data-table) + Header(o-header) + Sidebar(o-sidebar) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Calendar(o-calendar) + Modal(o-modal) + FilterBar(o-filter-bar) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + DatePicker(m-date-picker) + TimePicker(m-time-picker) + SearchInput(m-search-input) + StatCard(m-stat-card) + Toast(m-toast) + ProgressBar(m-progress-bar) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + MultiTenancy(pt-multi-tenancy) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + TransactionalEmail(pt-transactional-email) + PdfGeneration(pt-pdf-generation) + StripeInvoicing(pt-stripe-invoicing) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + Charts(pt-charts) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + ExportData(pt-export-data) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  - ../templates/invoice-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/data-table.md
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/calendar.md
  - ../organisms/modal.md
  - ../organisms/filter-bar.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/date-picker.md
  - ../molecules/search-input.md
  - ../molecules/stat-card.md
  - ../molecules/toast.md
  - ../molecules/progress-bar.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/multi-tenancy.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Billing
  - ../patterns/transactional-email.md
  - ../patterns/pdf-generation.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  - ../patterns/charts.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Export
  - ../patterns/export-data.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - react-hook-form
  - zod
  - "@radix-ui/react-dialog"
  - "@radix-ui/react-popover"
  - "@radix-ui/react-select"
  - recharts
  - lucide-react
  - date-fns
  - "@react-pdf/renderer"
  - stripe
skills:
  - time-tracking
  - timers
  - invoicing
  - project-management
  - retainer-billing
  - reporting
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Time Tracking & Billing

## Overview

A comprehensive time tracking and billing platform featuring:
- Real-time timers with background persistence
- Manual time entry with bulk editing
- Project and client management
- Hourly rate configuration per project/client
- Invoice generation with PDF export
- Retainer management with usage tracking
- Team time tracking with approval workflows
- Detailed reports and analytics
- Integration with Stripe for payments

## Architecture

```
+--------------------------------------------------+
|                   Next.js App                     |
+--------------------------------------------------+
|  Timer Service  |  Time Entries  |  Invoicing    |
|  (Real-time)    |  (CRUD)        |  (PDF/Stripe) |
+--------------------------------------------------+
|           Prisma ORM + PostgreSQL                |
+--------------------------------------------------+
|  Projects  |  Clients  |  Retainers  |  Users    |
+--------------------------------------------------+
```

## Project Structure

```
time-tracking/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Timer + Today's entries
│   │   ├── time/
│   │   │   ├── page.tsx                # Time entries list
│   │   │   └── calendar/page.tsx       # Calendar view
│   │   ├── projects/
│   │   │   ├── page.tsx                # Projects list
│   │   │   └── [projectId]/page.tsx    # Project detail
│   │   ├── clients/
│   │   │   ├── page.tsx                # Clients list
│   │   │   └── [clientId]/page.tsx     # Client detail
│   │   ├── invoices/
│   │   │   ├── page.tsx                # Invoices list
│   │   │   ├── new/page.tsx            # Create invoice
│   │   │   └── [invoiceId]/page.tsx    # Invoice detail
│   │   ├── retainers/
│   │   │   ├── page.tsx                # Retainers list
│   │   │   └── [retainerId]/page.tsx   # Retainer detail
│   │   ├── reports/
│   │   │   ├── page.tsx                # Reports overview
│   │   │   ├── time/page.tsx           # Time reports
│   │   │   ├── revenue/page.tsx        # Revenue reports
│   │   │   └── team/page.tsx           # Team reports
│   │   ├── team/
│   │   │   ├── page.tsx                # Team members
│   │   │   └── approvals/page.tsx      # Time approvals
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── billing/page.tsx
│   │       └── integrations/page.tsx
│   ├── api/
│   │   ├── timer/
│   │   │   ├── route.ts                # Timer CRUD
│   │   │   ├── start/route.ts
│   │   │   └── stop/route.ts
│   │   ├── time-entries/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── bulk/route.ts
│   │   ├── projects/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── clients/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── invoices/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── [id]/pdf/route.ts
│   │   │   └── [id]/send/route.ts
│   │   ├── retainers/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── reports/route.ts
│   │   └── webhooks/stripe/route.ts
│   └── layout.tsx
├── components/
│   ├── timer/
│   │   ├── timer-widget.tsx
│   │   ├── timer-display.tsx
│   │   └── timer-controls.tsx
│   ├── time-entries/
│   │   ├── time-entry-row.tsx
│   │   ├── time-entry-form.tsx
│   │   ├── time-entry-table.tsx
│   │   └── bulk-edit-modal.tsx
│   ├── projects/
│   │   ├── project-card.tsx
│   │   ├── project-form.tsx
│   │   └── project-selector.tsx
│   ├── clients/
│   │   ├── client-card.tsx
│   │   └── client-form.tsx
│   ├── invoices/
│   │   ├── invoice-builder.tsx
│   │   ├── invoice-line-item.tsx
│   │   ├── invoice-preview.tsx
│   │   └── invoice-pdf.tsx
│   ├── retainers/
│   │   ├── retainer-card.tsx
│   │   ├── retainer-usage.tsx
│   │   └── retainer-form.tsx
│   ├── reports/
│   │   ├── time-chart.tsx
│   │   ├── revenue-chart.tsx
│   │   └── team-summary.tsx
│   └── ui/
├── lib/
│   ├── timer.ts
│   ├── invoicing.ts
│   ├── pdf.ts
│   ├── stripe.ts
│   └── utils.ts
├── hooks/
│   ├── use-timer.ts
│   └── use-time-entries.ts
└── prisma/
    └── schema.prisma
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| timer | L3 | Real-time timer with persistence |
| time-entry-table | L3 | Time entry management |
| invoice-builder | L3 | Invoice creation and editing |
| data-table | L3 | Data display with sorting/filtering |
| chart | L3 | Time and revenue visualizations |
| pdf-generation | L5 | Invoice PDF export |
| stripe-invoicing | L5 | Payment processing |
| multi-tenancy | L5 | Organization isolation |

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
  id              String   @id @default(cuid())
  name            String
  slug            String   @unique
  logo            String?
  timezone        String   @default("UTC")
  weekStartsOn    Int      @default(1) // 0=Sunday, 1=Monday

  // Billing settings
  defaultCurrency String   @default("USD")
  defaultHourlyRate Decimal? @db.Decimal(10, 2)
  invoicePrefix   String   @default("INV")
  invoiceNextNumber Int    @default(1)
  paymentTermsDays Int     @default(30)

  // Stripe
  stripeCustomerId String?

  members         OrganizationMember[]
  clients         Client[]
  projects        Project[]
  timeEntries     TimeEntry[]
  invoices        Invoice[]
  retainers       Retainer[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  avatar        String?
  passwordHash  String

  // Default rate for this user
  defaultHourlyRate Decimal? @db.Decimal(10, 2)

  memberships   OrganizationMember[]
  timeEntries   TimeEntry[]
  timers        Timer[]
  approvals     TimeEntryApproval[] @relation("approver")

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model OrganizationMember {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           MemberRole   @default(MEMBER)
  hourlyRate     Decimal?     @db.Decimal(10, 2)

  // Permissions
  canTrackTime   Boolean      @default(true)
  canViewReports Boolean      @default(false)
  canManageProjects Boolean   @default(false)
  canManageInvoices Boolean   @default(false)
  canApproveTime Boolean      @default(false)

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt      DateTime     @default(now())

  @@unique([organizationId, userId])
}

enum MemberRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
}

model Client {
  id             String       @id @default(cuid())
  organizationId String
  name           String
  email          String?
  phone          String?

  // Address
  addressLine1   String?
  addressLine2   String?
  city           String?
  state          String?
  postalCode     String?
  country        String?

  // Billing
  defaultHourlyRate Decimal?  @db.Decimal(10, 2)
  currency       String       @default("USD")
  paymentTermsDays Int?

  // Tax
  taxId          String?

  // Status
  isActive       Boolean      @default(true)

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  projects       Project[]
  invoices       Invoice[]
  retainers      Retainer[]

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
}

model Project {
  id             String       @id @default(cuid())
  organizationId String
  clientId       String?
  name           String
  description    String?
  color          String?

  // Budget
  budgetType     BudgetType   @default(NO_BUDGET)
  budgetHours    Decimal?     @db.Decimal(10, 2)
  budgetAmount   Decimal?     @db.Decimal(10, 2)

  // Rates
  hourlyRate     Decimal?     @db.Decimal(10, 2)
  billable       Boolean      @default(true)

  // Status
  status         ProjectStatus @default(ACTIVE)

  // Dates
  startDate      DateTime?
  endDate        DateTime?

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client         Client?      @relation(fields: [clientId], references: [id])
  tasks          Task[]
  timeEntries    TimeEntry[]
  invoiceItems   InvoiceLineItem[]

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
  @@index([clientId])
}

enum BudgetType {
  NO_BUDGET
  HOURS
  AMOUNT
}

enum ProjectStatus {
  ACTIVE
  ON_HOLD
  COMPLETED
  ARCHIVED
}

model Task {
  id          String      @id @default(cuid())
  projectId   String
  name        String
  description String?
  hourlyRate  Decimal?    @db.Decimal(10, 2)
  billable    Boolean     @default(true)

  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  timeEntries TimeEntry[]

  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt

  @@index([projectId])
}

model Timer {
  id             String       @id @default(cuid())
  userId         String
  organizationId String
  projectId      String?
  taskId         String?
  description    String?

  startedAt      DateTime     @default(now())

  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model TimeEntry {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  projectId      String?
  taskId         String?

  description    String?
  date           DateTime     @db.Date
  startTime      DateTime?
  endTime        DateTime?
  duration       Int          // Duration in seconds

  // Billing
  billable       Boolean      @default(true)
  hourlyRate     Decimal?     @db.Decimal(10, 2)

  // Approval
  status         TimeEntryStatus @default(PENDING)

  // Invoice
  invoiced       Boolean      @default(false)
  invoiceItemId  String?

  // Tags
  tags           String[]

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id])
  project        Project?     @relation(fields: [projectId], references: [id])
  task           Task?        @relation(fields: [taskId], references: [id])
  invoiceItem    InvoiceLineItem? @relation(fields: [invoiceItemId], references: [id])
  approvals      TimeEntryApproval[]

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
  @@index([userId])
  @@index([projectId])
  @@index([date])
  @@index([status])
}

enum TimeEntryStatus {
  PENDING
  APPROVED
  REJECTED
}

model TimeEntryApproval {
  id           String      @id @default(cuid())
  timeEntryId  String
  approverId   String
  status       TimeEntryStatus
  comment      String?

  timeEntry    TimeEntry   @relation(fields: [timeEntryId], references: [id], onDelete: Cascade)
  approver     User        @relation("approver", fields: [approverId], references: [id])

  createdAt    DateTime    @default(now())

  @@index([timeEntryId])
}

model Invoice {
  id             String        @id @default(cuid())
  organizationId String
  clientId       String
  number         String

  // Status
  status         InvoiceStatus @default(DRAFT)

  // Dates
  issueDate      DateTime      @db.Date
  dueDate        DateTime      @db.Date
  paidAt         DateTime?

  // Amounts
  subtotal       Decimal       @db.Decimal(10, 2)
  taxRate        Decimal?      @db.Decimal(5, 2)
  taxAmount      Decimal?      @db.Decimal(10, 2)
  discount       Decimal?      @db.Decimal(10, 2)
  total          Decimal       @db.Decimal(10, 2)
  amountPaid     Decimal       @default(0) @db.Decimal(10, 2)

  currency       String        @default("USD")

  // Notes
  notes          String?
  terms          String?

  // Payment
  stripeInvoiceId String?
  paymentLink    String?

  // PDF
  pdfUrl         String?

  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client         Client        @relation(fields: [clientId], references: [id])
  lineItems      InvoiceLineItem[]
  payments       Payment[]

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
  PAID
  PARTIALLY_PAID
  OVERDUE
  CANCELLED
}

model InvoiceLineItem {
  id           String      @id @default(cuid())
  invoiceId    String
  projectId    String?

  description  String
  quantity     Decimal     @db.Decimal(10, 2)
  unitPrice    Decimal     @db.Decimal(10, 2)
  amount       Decimal     @db.Decimal(10, 2)

  // Time period for time-based items
  periodStart  DateTime?   @db.Date
  periodEnd    DateTime?   @db.Date

  invoice      Invoice     @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  project      Project?    @relation(fields: [projectId], references: [id])
  timeEntries  TimeEntry[]

  @@index([invoiceId])
}

model Payment {
  id           String        @id @default(cuid())
  invoiceId    String
  amount       Decimal       @db.Decimal(10, 2)
  method       PaymentMethod
  reference    String?
  notes        String?
  paidAt       DateTime      @default(now())

  // Stripe
  stripePaymentId String?

  invoice      Invoice       @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
}

enum PaymentMethod {
  STRIPE
  BANK_TRANSFER
  CHECK
  CASH
  OTHER
}

model Retainer {
  id             String        @id @default(cuid())
  organizationId String
  clientId       String
  name           String

  // Type
  type           RetainerType  @default(HOURS)

  // Budget
  hoursIncluded  Decimal?      @db.Decimal(10, 2)
  amountIncluded Decimal?      @db.Decimal(10, 2)
  hourlyRate     Decimal?      @db.Decimal(10, 2)

  // Billing cycle
  billingCycle   BillingCycle  @default(MONTHLY)
  startDate      DateTime      @db.Date
  endDate        DateTime?     @db.Date

  // Rollover
  rolloverUnused Boolean       @default(false)
  maxRollover    Decimal?      @db.Decimal(10, 2)

  // Status
  status         RetainerStatus @default(ACTIVE)

  organization   Organization  @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  client         Client        @relation(fields: [clientId], references: [id])
  periods        RetainerPeriod[]

  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@index([organizationId])
  @@index([clientId])
}

enum RetainerType {
  HOURS
  AMOUNT
}

enum BillingCycle {
  WEEKLY
  BIWEEKLY
  MONTHLY
  QUARTERLY
  YEARLY
}

enum RetainerStatus {
  ACTIVE
  PAUSED
  CANCELLED
  COMPLETED
}

model RetainerPeriod {
  id            String    @id @default(cuid())
  retainerId    String
  periodStart   DateTime  @db.Date
  periodEnd     DateTime  @db.Date

  // Hours
  hoursIncluded Decimal   @db.Decimal(10, 2)
  hoursUsed     Decimal   @default(0) @db.Decimal(10, 2)
  hoursRolledOver Decimal @default(0) @db.Decimal(10, 2)

  // Amount
  amountIncluded Decimal? @db.Decimal(10, 2)
  amountUsed    Decimal?  @default(0) @db.Decimal(10, 2)

  retainer      Retainer  @relation(fields: [retainerId], references: [id], onDelete: Cascade)

  @@index([retainerId])
  @@index([periodStart, periodEnd])
}
```

## Implementation

### Timer Widget

```tsx
// components/timer/timer-widget.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Play, Pause, Square, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectSelector } from '@/components/projects/project-selector';
import { formatDuration } from '@/lib/utils';

interface Timer {
  id: string;
  projectId: string | null;
  taskId: string | null;
  description: string | null;
  startedAt: string;
}

export function TimerWidget() {
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const queryClient = useQueryClient();

  // Fetch active timer
  const { data: timer, isLoading } = useQuery<Timer | null>({
    queryKey: ['timer'],
    queryFn: async () => {
      const res = await fetch('/api/timer');
      if (!res.ok) return null;
      return res.json();
    },
    refetchInterval: 60000, // Sync every minute
  });

  // Calculate elapsed time
  useEffect(() => {
    if (!timer) {
      setElapsed(0);
      return;
    }

    const startTime = new Date(timer.startedAt).getTime();

    const updateElapsed = () => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // Sync description when timer loads
  useEffect(() => {
    if (timer) {
      setDescription(timer.description || '');
      setProjectId(timer.projectId);
    }
  }, [timer]);

  // Start timer mutation
  const startTimer = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/timer/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, projectId }),
      });
      if (!res.ok) throw new Error('Failed to start timer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timer'] });
    },
  });

  // Stop timer mutation
  const stopTimer = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/timer/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description, projectId }),
      });
      if (!res.ok) throw new Error('Failed to stop timer');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timer'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      setDescription('');
      setProjectId(null);
    },
  });

  // Discard timer mutation
  const discardTimer = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/timer', { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to discard timer');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timer'] });
      setDescription('');
      setProjectId(null);
    },
  });

  // Update timer description (debounced)
  const updateDescription = useCallback(
    async (value: string) => {
      if (!timer) return;
      await fetch('/api/timer', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: value, projectId }),
      });
    },
    [timer, projectId]
  );

  useEffect(() => {
    if (!timer) return;
    const timeout = setTimeout(() => updateDescription(description), 1000);
    return () => clearTimeout(timeout);
  }, [description, timer, updateDescription]);

  const isRunning = !!timer;

  return (
    <div className="bg-white dark:bg-gray-800 border rounded-lg p-4 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Description input */}
        <Input
          placeholder="What are you working on?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="flex-1"
        />

        {/* Project selector */}
        <ProjectSelector
          value={projectId}
          onChange={setProjectId}
          disabled={isRunning && !!timer?.projectId}
        />

        {/* Timer display */}
        <div className="flex items-center gap-2 min-w-[120px] justify-end">
          <Clock className="h-4 w-4 text-gray-500" />
          <span
            className={`font-mono text-xl tabular-nums ${
              isRunning ? 'text-green-600' : 'text-gray-500'
            }`}
          >
            {formatDuration(elapsed)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <>
              <Button
                size="icon"
                variant="outline"
                onClick={() => discardTimer.mutate()}
                disabled={discardTimer.isPending}
              >
                <Square className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={() => stopTimer.mutate()}
                disabled={stopTimer.isPending}
                className="bg-red-500 hover:bg-red-600"
              >
                <Pause className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              size="icon"
              onClick={() => startTimer.mutate()}
              disabled={startTimer.isPending}
              className="bg-green-500 hover:bg-green-600"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Time Entry Form

```tsx
// components/time-entries/time-entry-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ProjectSelector } from '@/components/projects/project-selector';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { parseDuration, formatDuration } from '@/lib/utils';

const timeEntrySchema = z.object({
  description: z.string().optional(),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
  date: z.date(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  duration: z.string().min(1, 'Duration is required'),
  billable: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
});

type TimeEntryFormData = z.infer<typeof timeEntrySchema>;

interface TimeEntryFormProps {
  entry?: {
    id: string;
    description: string | null;
    projectId: string | null;
    taskId: string | null;
    date: string;
    startTime: string | null;
    endTime: string | null;
    duration: number;
    billable: boolean;
    tags: string[];
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TimeEntryForm({ entry, onSuccess, onCancel }: TimeEntryFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<TimeEntryFormData>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: entry
      ? {
          description: entry.description || '',
          projectId: entry.projectId || undefined,
          taskId: entry.taskId || undefined,
          date: new Date(entry.date),
          startTime: entry.startTime ? format(new Date(entry.startTime), 'HH:mm') : '',
          endTime: entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : '',
          duration: formatDuration(entry.duration),
          billable: entry.billable,
          tags: entry.tags,
        }
      : {
          date: new Date(),
          duration: '',
          billable: true,
          tags: [],
        },
  });

  const mutation = useMutation({
    mutationFn: async (data: TimeEntryFormData) => {
      const url = entry ? `/api/time-entries/${entry.id}` : '/api/time-entries';
      const method = entry ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          date: format(data.date, 'yyyy-MM-dd'),
          duration: parseDuration(data.duration),
        }),
      });

      if (!res.ok) throw new Error('Failed to save time entry');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      onSuccess?.();
    },
  });

  const onSubmit = (data: TimeEntryFormData) => {
    mutation.mutate(data);
  };

  // Calculate duration from start/end times
  const calculateDuration = () => {
    const startTime = form.watch('startTime');
    const endTime = form.watch('endTime');

    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);

      let minutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (minutes < 0) minutes += 24 * 60; // Handle overnight

      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      form.setValue('duration', `${hours}:${mins.toString().padStart(2, '0')}`);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="What did you work on?"
          {...form.register('description')}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Project</Label>
          <ProjectSelector
            value={form.watch('projectId') || null}
            onChange={(value) => form.setValue('projectId', value || undefined)}
          />
        </div>

        <div>
          <Label>Date</Label>
          <DatePicker
            date={form.watch('date')}
            onSelect={(date) => date && form.setValue('date', date)}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <TimePicker
            value={form.watch('startTime') || ''}
            onChange={(value) => {
              form.setValue('startTime', value);
              calculateDuration();
            }}
          />
        </div>

        <div>
          <Label htmlFor="endTime">End Time</Label>
          <TimePicker
            value={form.watch('endTime') || ''}
            onChange={(value) => {
              form.setValue('endTime', value);
              calculateDuration();
            }}
          />
        </div>

        <div>
          <Label htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            placeholder="1:30"
            {...form.register('duration')}
          />
          {form.formState.errors.duration && (
            <p className="text-sm text-red-500 mt-1">
              {form.formState.errors.duration.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          id="billable"
          checked={form.watch('billable')}
          onCheckedChange={(checked) => form.setValue('billable', checked)}
        />
        <Label htmlFor="billable">Billable</Label>
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : entry ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
```

### Invoice Builder

```tsx
// components/invoices/invoice-builder.tsx
'use client';

import { useState, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { ClientSelector } from '@/components/clients/client-selector';
import { InvoiceLineItem } from './invoice-line-item';
import { InvoicePreview } from './invoice-preview';
import { formatCurrency } from '@/lib/utils';

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().min(0, 'Price must be non-negative'),
  projectId: z.string().optional(),
  timeEntryIds: z.array(z.string()).default([]),
});

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Client is required'),
  issueDate: z.date(),
  dueDate: z.date(),
  lineItems: z.array(lineItemSchema).min(1, 'At least one line item required'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  discount: z.number().min(0).optional(),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceBuilderProps {
  invoiceId?: string;
  defaultClientId?: string;
  defaultTimeEntries?: string[];
}

export function InvoiceBuilder({
  invoiceId,
  defaultClientId,
  defaultTimeEntries,
}: InvoiceBuilderProps) {
  const [showPreview, setShowPreview] = useState(false);
  const queryClient = useQueryClient();

  // Fetch uninvoiced time entries
  const { data: uninvoicedEntries } = useQuery({
    queryKey: ['time-entries', 'uninvoiced'],
    queryFn: async () => {
      const res = await fetch('/api/time-entries?invoiced=false&billable=true');
      if (!res.ok) throw new Error('Failed to fetch time entries');
      return res.json();
    },
  });

  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: defaultClientId || '',
      issueDate: new Date(),
      dueDate: addDays(new Date(), 30),
      lineItems: [],
      taxRate: 0,
      discount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lineItems',
  });

  // Calculate totals
  const watchedLineItems = form.watch('lineItems');
  const watchedTaxRate = form.watch('taxRate') || 0;
  const watchedDiscount = form.watch('discount') || 0;

  const totals = useMemo(() => {
    const subtotal = watchedLineItems.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
    const taxAmount = subtotal * (watchedTaxRate / 100);
    const total = subtotal + taxAmount - watchedDiscount;

    return { subtotal, taxAmount, total };
  }, [watchedLineItems, watchedTaxRate, watchedDiscount]);

  // Import time entries for a client
  const importTimeEntries = (clientId: string) => {
    if (!uninvoicedEntries) return;

    const clientEntries = uninvoicedEntries.filter(
      (e: any) => e.project?.clientId === clientId
    );

    // Group by project
    const byProject = clientEntries.reduce((acc: any, entry: any) => {
      const key = entry.projectId || 'no-project';
      if (!acc[key]) {
        acc[key] = {
          projectId: entry.projectId,
          projectName: entry.project?.name || 'No Project',
          entries: [],
          totalHours: 0,
          hourlyRate: entry.hourlyRate || entry.project?.hourlyRate || 0,
        };
      }
      acc[key].entries.push(entry);
      acc[key].totalHours += entry.duration / 3600;
      return acc;
    }, {});

    // Create line items for each project
    Object.values(byProject).forEach((group: any) => {
      append({
        description: `${group.projectName} - ${group.totalHours.toFixed(2)} hours`,
        quantity: group.totalHours,
        unitPrice: group.hourlyRate,
        projectId: group.projectId,
        timeEntryIds: group.entries.map((e: any) => e.id),
      });
    });
  };

  const createInvoice = useMutation({
    mutationFn: async (data: InvoiceFormData) => {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          issueDate: format(data.issueDate, 'yyyy-MM-dd'),
          dueDate: format(data.dueDate, 'yyyy-MM-dd'),
          subtotal: totals.subtotal,
          taxAmount: totals.taxAmount,
          total: totals.total,
        }),
      });

      if (!res.ok) throw new Error('Failed to create invoice');
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      window.location.href = `/invoices/${data.id}`;
    },
  });

  const onSubmit = (data: InvoiceFormData) => {
    createInvoice.mutate(data);
  };

  const selectedClientId = form.watch('clientId');

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      {/* Form */}
      <div className="space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">Client</label>
            <ClientSelector
              value={form.watch('clientId')}
              onChange={(value) => {
                form.setValue('clientId', value);
                // Clear line items when client changes
                form.setValue('lineItems', []);
              }}
            />
            {form.formState.errors.clientId && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.clientId.message}
              </p>
            )}
          </div>

          {/* Import Time Entries Button */}
          {selectedClientId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => importTimeEntries(selectedClientId)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Import Unbilled Time
            </Button>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Issue Date</label>
              <DatePicker
                date={form.watch('issueDate')}
                onSelect={(date) => date && form.setValue('issueDate', date)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Due Date</label>
              <DatePicker
                date={form.watch('dueDate')}
                onSelect={(date) => date && form.setValue('dueDate', date)}
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Line Items</label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  append({
                    description: '',
                    quantity: 1,
                    unitPrice: 0,
                    timeEntryIds: [],
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <Input
                        placeholder="Description"
                        {...form.register(`lineItems.${index}.description`)}
                      />
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-gray-500">Quantity</label>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`lineItems.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Unit Price</label>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`lineItems.${index}.unitPrice`, {
                              valueAsNumber: true,
                            })}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500">Amount</label>
                          <div className="h-10 flex items-center font-medium">
                            {formatCurrency(
                              (watchedLineItems[index]?.quantity || 0) *
                                (watchedLineItems[index]?.unitPrice || 0)
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => remove(index)}
                      className="ml-2"
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                  No line items. Add items or import unbilled time.
                </div>
              )}
            </div>
          </div>

          {/* Tax and Discount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tax Rate (%)</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                {...form.register('taxRate', { valueAsNumber: true })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Discount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                {...form.register('discount', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Textarea
              placeholder="Additional notes for the client..."
              {...form.register('notes')}
            />
          </div>

          {/* Totals */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(totals.subtotal)}</span>
            </div>
            {watchedTaxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({watchedTaxRate}%)</span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>
            )}
            {watchedDiscount > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Discount</span>
                <span>-{formatCurrency(watchedDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? 'Hide Preview' : 'Preview'}
            </Button>
            <Button type="submit" disabled={createInvoice.isPending}>
              {createInvoice.isPending ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="lg:sticky lg:top-4 lg:self-start">
          <InvoicePreview
            clientId={selectedClientId}
            issueDate={form.watch('issueDate')}
            dueDate={form.watch('dueDate')}
            lineItems={watchedLineItems}
            subtotal={totals.subtotal}
            taxRate={watchedTaxRate}
            taxAmount={totals.taxAmount}
            discount={watchedDiscount}
            total={totals.total}
            notes={form.watch('notes')}
          />
        </div>
      )}
    </div>
  );
}
```

### Retainer Usage Tracking

```tsx
// components/retainers/retainer-usage.tsx
'use client';

import { useMemo } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Clock, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatHours } from '@/lib/utils';

interface RetainerPeriod {
  id: string;
  periodStart: string;
  periodEnd: string;
  hoursIncluded: number;
  hoursUsed: number;
  hoursRolledOver: number;
  amountIncluded: number | null;
  amountUsed: number | null;
}

interface Retainer {
  id: string;
  name: string;
  type: 'HOURS' | 'AMOUNT';
  hoursIncluded: number | null;
  amountIncluded: number | null;
  hourlyRate: number | null;
  billingCycle: string;
  rolloverUnused: boolean;
  maxRollover: number | null;
  currentPeriod: RetainerPeriod | null;
  periods: RetainerPeriod[];
}

interface RetainerUsageProps {
  retainer: Retainer;
}

export function RetainerUsage({ retainer }: RetainerUsageProps) {
  const currentPeriod = retainer.currentPeriod;

  const stats = useMemo(() => {
    if (!currentPeriod) {
      return {
        totalAvailable: 0,
        used: 0,
        remaining: 0,
        percentUsed: 0,
        daysRemaining: 0,
        burnRate: 0,
        projectedOverage: 0,
      };
    }

    const totalAvailable =
      currentPeriod.hoursIncluded + currentPeriod.hoursRolledOver;
    const used = currentPeriod.hoursUsed;
    const remaining = Math.max(0, totalAvailable - used);
    const percentUsed = totalAvailable > 0 ? (used / totalAvailable) * 100 : 0;

    const periodStart = new Date(currentPeriod.periodStart);
    const periodEnd = new Date(currentPeriod.periodEnd);
    const today = new Date();

    const totalDays = differenceInDays(periodEnd, periodStart);
    const daysElapsed = Math.max(0, differenceInDays(today, periodStart));
    const daysRemaining = Math.max(0, differenceInDays(periodEnd, today));

    // Calculate burn rate (hours per day)
    const burnRate = daysElapsed > 0 ? used / daysElapsed : 0;

    // Project total usage at current rate
    const projectedTotal = burnRate * totalDays;
    const projectedOverage = Math.max(0, projectedTotal - totalAvailable);

    return {
      totalAvailable,
      used,
      remaining,
      percentUsed,
      daysRemaining,
      burnRate,
      projectedOverage,
    };
  }, [currentPeriod]);

  // Determine status color
  const getStatusColor = () => {
    if (stats.percentUsed >= 100) return 'text-red-600 bg-red-100';
    if (stats.percentUsed >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (!currentPeriod) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No active period. Create a new billing period to start tracking.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Period Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Period</span>
            <span className="text-sm font-normal text-gray-500">
              {format(new Date(currentPeriod.periodStart), 'MMM d')} -{' '}
              {format(new Date(currentPeriod.periodEnd), 'MMM d, yyyy')}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>
                  {formatHours(stats.used)} / {formatHours(stats.totalAvailable)} hours
                </span>
                <span className={`font-medium ${
                  stats.percentUsed >= 80 ? 'text-red-600' : ''
                }`}>
                  {stats.percentUsed.toFixed(1)}% used
                </span>
              </div>
              <Progress
                value={Math.min(100, stats.percentUsed)}
                className="h-3"
              />
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
              <div className="text-center">
                <Clock className="h-5 w-5 mx-auto text-blue-500 mb-1" />
                <p className="text-2xl font-bold">{formatHours(stats.remaining)}</p>
                <p className="text-xs text-gray-500">Hours Remaining</p>
              </div>

              <div className="text-center">
                <TrendingUp className="h-5 w-5 mx-auto text-green-500 mb-1" />
                <p className="text-2xl font-bold">{stats.burnRate.toFixed(1)}</p>
                <p className="text-xs text-gray-500">Hrs/Day Avg</p>
              </div>

              <div className="text-center">
                <DollarSign className="h-5 w-5 mx-auto text-purple-500 mb-1" />
                <p className="text-2xl font-bold">
                  {formatCurrency(stats.used * (retainer.hourlyRate || 0))}
                </p>
                <p className="text-xs text-gray-500">Value Used</p>
              </div>

              <div className="text-center">
                <AlertCircle className="h-5 w-5 mx-auto text-orange-500 mb-1" />
                <p className="text-2xl font-bold">{stats.daysRemaining}</p>
                <p className="text-xs text-gray-500">Days Remaining</p>
              </div>
            </div>

            {/* Overage warning */}
            {stats.projectedOverage > 0 && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Projected Overage</p>
                  <p className="text-sm">
                    At current rate, you may exceed by{' '}
                    <strong>{formatHours(stats.projectedOverage)}</strong> hours
                    ({formatCurrency(stats.projectedOverage * (retainer.hourlyRate || 0))})
                  </p>
                </div>
              </div>
            )}

            {/* Rollover info */}
            {currentPeriod.hoursRolledOver > 0 && (
              <div className="text-sm text-gray-500 pt-2 border-t">
                Includes {formatHours(currentPeriod.hoursRolledOver)} rolled over
                from previous period
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historical Periods */}
      <Card>
        <CardHeader>
          <CardTitle>Period History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {retainer.periods.slice(0, 6).map((period) => {
              const total = period.hoursIncluded + period.hoursRolledOver;
              const percent = total > 0 ? (period.hoursUsed / total) * 100 : 0;
              const isCurrent = period.id === currentPeriod?.id;

              return (
                <div
                  key={period.id}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    isCurrent ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium">
                        {format(new Date(period.periodStart), 'MMM d')} -{' '}
                        {format(new Date(period.periodEnd), 'MMM d, yyyy')}
                      </span>
                      {isCurrent && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <Progress value={Math.min(100, percent)} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>
                        {formatHours(period.hoursUsed)} / {formatHours(total)}
                      </span>
                      <span>{percent.toFixed(0)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Timer API Routes

```tsx
// app/api/timer/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const timer = await prisma.timer.findFirst({
    where: { userId: user.id },
    include: {
      project: { select: { id: true, name: true } },
      task: { select: { id: true, name: true } },
    },
  });

  return NextResponse.json(timer);
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { description, projectId, taskId } = body;

  const timer = await prisma.timer.updateMany({
    where: { userId: user.id },
    data: {
      description,
      projectId: projectId || null,
      taskId: taskId || null,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await prisma.timer.deleteMany({
    where: { userId: user.id },
  });

  return NextResponse.json({ success: true });
}
```

```tsx
// app/api/timer/start/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const org = await getCurrentOrganization();

  if (!user || !org) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { description, projectId, taskId } = body;

  // Check for existing timer
  const existingTimer = await prisma.timer.findFirst({
    where: { userId: user.id },
  });

  if (existingTimer) {
    return NextResponse.json(
      { error: 'Timer already running' },
      { status: 400 }
    );
  }

  const timer = await prisma.timer.create({
    data: {
      userId: user.id,
      organizationId: org.id,
      description,
      projectId: projectId || null,
      taskId: taskId || null,
      startedAt: new Date(),
    },
  });

  return NextResponse.json(timer);
}
```

```tsx
// app/api/timer/stop/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth';
import { startOfDay } from 'date-fns';

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  const org = await getCurrentOrganization();

  if (!user || !org) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { description, projectId } = body;

  // Find active timer
  const timer = await prisma.timer.findFirst({
    where: { userId: user.id },
  });

  if (!timer) {
    return NextResponse.json({ error: 'No active timer' }, { status: 400 });
  }

  // Calculate duration
  const endTime = new Date();
  const duration = Math.floor(
    (endTime.getTime() - timer.startedAt.getTime()) / 1000
  );

  // Get hourly rate
  let hourlyRate: number | null = null;

  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true },
    });

    hourlyRate = project?.hourlyRate?.toNumber() ||
      project?.client?.defaultHourlyRate?.toNumber() ||
      org.defaultHourlyRate?.toNumber() ||
      null;
  }

  // Create time entry
  const timeEntry = await prisma.timeEntry.create({
    data: {
      organizationId: org.id,
      userId: user.id,
      projectId: projectId || timer.projectId,
      taskId: timer.taskId,
      description: description || timer.description,
      date: startOfDay(timer.startedAt),
      startTime: timer.startedAt,
      endTime,
      duration,
      billable: true,
      hourlyRate,
    },
  });

  // Delete timer
  await prisma.timer.delete({
    where: { id: timer.id },
  });

  return NextResponse.json(timeEntry);
}
```

## Testing

### Unit Tests

```tsx
// __tests__/lib/timer.test.ts
import { describe, it, expect, vi } from 'vitest';
import { formatDuration, parseDuration, calculateBillableAmount } from '@/lib/utils';

describe('formatDuration', () => {
  it('formats seconds into HH:MM:SS', () => {
    expect(formatDuration(0)).toBe('0:00:00');
    expect(formatDuration(60)).toBe('0:01:00');
    expect(formatDuration(3600)).toBe('1:00:00');
    expect(formatDuration(3661)).toBe('1:01:01');
    expect(formatDuration(36000)).toBe('10:00:00');
  });

  it('handles large durations', () => {
    expect(formatDuration(86400)).toBe('24:00:00');
    expect(formatDuration(90061)).toBe('25:01:01');
  });
});

describe('parseDuration', () => {
  it('parses HH:MM format', () => {
    expect(parseDuration('1:30')).toBe(5400);
    expect(parseDuration('0:15')).toBe(900);
    expect(parseDuration('10:00')).toBe(36000);
  });

  it('parses HH:MM:SS format', () => {
    expect(parseDuration('1:30:00')).toBe(5400);
    expect(parseDuration('1:30:30')).toBe(5430);
  });

  it('parses decimal hours', () => {
    expect(parseDuration('1.5')).toBe(5400);
    expect(parseDuration('0.25')).toBe(900);
    expect(parseDuration('2.75')).toBe(9900);
  });

  it('returns 0 for invalid input', () => {
    expect(parseDuration('')).toBe(0);
    expect(parseDuration('invalid')).toBe(0);
  });
});

describe('calculateBillableAmount', () => {
  it('calculates amount from duration and rate', () => {
    expect(calculateBillableAmount(3600, 100)).toBe(100); // 1 hour at $100/hr
    expect(calculateBillableAmount(1800, 100)).toBe(50);  // 30 min at $100/hr
    expect(calculateBillableAmount(5400, 80)).toBe(120);  // 1.5 hrs at $80/hr
  });

  it('rounds to 2 decimal places', () => {
    expect(calculateBillableAmount(900, 100)).toBe(25);   // 15 min
    expect(calculateBillableAmount(600, 100)).toBe(16.67); // 10 min
  });

  it('returns 0 when rate is null', () => {
    expect(calculateBillableAmount(3600, null)).toBe(0);
  });
});
```

### Integration Tests

```tsx
// __tests__/api/timer.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as startTimer } from '@/app/api/timer/start/route';
import { POST as stopTimer } from '@/app/api/timer/stop/route';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma');
vi.mock('@/lib/auth', () => ({
  getCurrentUser: vi.fn().mockResolvedValue({ id: 'user_1' }),
  getCurrentOrganization: vi.fn().mockResolvedValue({ id: 'org_1' }),
}));

describe('Timer API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/timer/start', () => {
    it('creates a new timer', async () => {
      prisma.timer.findFirst.mockResolvedValue(null);
      prisma.timer.create.mockResolvedValue({
        id: 'timer_1',
        userId: 'user_1',
        startedAt: new Date(),
      });

      const request = new Request('http://localhost/api/timer/start', {
        method: 'POST',
        body: JSON.stringify({ description: 'Working on feature' }),
      });

      const response = await startTimer(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.id).toBe('timer_1');
    });

    it('returns error if timer already running', async () => {
      prisma.timer.findFirst.mockResolvedValue({ id: 'existing_timer' });

      const request = new Request('http://localhost/api/timer/start', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await startTimer(request);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/timer/stop', () => {
    it('creates time entry and deletes timer', async () => {
      const startTime = new Date(Date.now() - 3600000); // 1 hour ago

      prisma.timer.findFirst.mockResolvedValue({
        id: 'timer_1',
        userId: 'user_1',
        startedAt: startTime,
        description: 'Working',
      });

      prisma.timeEntry.create.mockResolvedValue({
        id: 'entry_1',
        duration: 3600,
      });

      const request = new Request('http://localhost/api/timer/stop', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await stopTimer(request);
      expect(response.status).toBe(200);

      expect(prisma.timeEntry.create).toHaveBeenCalled();
      expect(prisma.timer.delete).toHaveBeenCalledWith({
        where: { id: 'timer_1' },
      });
    });
  });
});
```

### E2E Tests

```tsx
// e2e/time-tracking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Time Tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
  });

  test('starts and stops timer', async ({ page }) => {
    // Fill in description
    await page.fill('[data-testid="timer-description"]', 'Working on project');

    // Select project
    await page.click('[data-testid="project-selector"]');
    await page.click('text=Test Project');

    // Start timer
    await page.click('[data-testid="start-timer"]');

    // Verify timer is running
    await expect(page.locator('[data-testid="timer-display"]')).toContainText('0:00:0');

    // Wait a few seconds
    await page.waitForTimeout(3000);

    // Stop timer
    await page.click('[data-testid="stop-timer"]');

    // Verify time entry was created
    await expect(page.locator('[data-testid="time-entries-table"]')).toContainText('Working on project');
  });

  test('creates manual time entry', async ({ page }) => {
    await page.goto('/time');

    // Open new entry form
    await page.click('[data-testid="new-entry-button"]');

    // Fill form
    await page.fill('[data-testid="description"]', 'Manual entry');
    await page.click('[data-testid="project-selector"]');
    await page.click('text=Test Project');
    await page.fill('[data-testid="duration"]', '2:30');

    // Submit
    await page.click('[data-testid="save-entry"]');

    // Verify entry appears
    await expect(page.locator('[data-testid="time-entries-table"]')).toContainText('Manual entry');
    await expect(page.locator('[data-testid="time-entries-table"]')).toContainText('2:30:00');
  });

  test('creates invoice from time entries', async ({ page }) => {
    await page.goto('/invoices/new');

    // Select client
    await page.click('[data-testid="client-selector"]');
    await page.click('text=Test Client');

    // Import time entries
    await page.click('[data-testid="import-time-button"]');

    // Verify line items added
    await expect(page.locator('[data-testid="line-items"]')).not.toBeEmpty();

    // Create invoice
    await page.click('[data-testid="create-invoice"]');

    // Verify redirect to invoice detail
    await expect(page).toHaveURL(/\/invoices\/[\w-]+/);
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/timer/timer-error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

export default function TimerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { component: 'timer' },
    });
  }, [error]);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-red-500" />
        <div className="flex-1">
          <h3 className="font-medium text-red-800">Timer Error</h3>
          <p className="text-sm text-red-600">
            {error.message || 'Failed to load timer. Your time is still being tracked.'}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={reset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );
}
```

### API Error Handler

```tsx
// lib/api-error.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR'
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): NextResponse {
  console.error('[API Error]', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: { message: error.message, code: error.code } },
      { status: error.statusCode }
    );
  }

  Sentry.captureException(error);

  return NextResponse.json(
    { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
    { status: 500 }
  );
}
```

## Accessibility

### WCAG 2.1 AA Compliance

```tsx
// components/timer/accessible-timer.tsx
export function AccessibleTimer({ elapsed, isRunning }: TimerProps) {
  return (
    <div
      role="timer"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`Timer: ${formatDuration(elapsed)}${isRunning ? ', running' : ', stopped'}`}
    >
      <span className="font-mono text-xl tabular-nums" aria-hidden="true">
        {formatDuration(elapsed)}
      </span>
      <span className="sr-only">
        {isRunning ? 'Timer is running' : 'Timer is stopped'}.
        Elapsed time: {formatSpokenDuration(elapsed)}
      </span>
    </div>
  );
}

function formatSpokenDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
  if (minutes > 0) parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);

  return parts.join(', ');
}
```

### Keyboard Navigation

```tsx
// components/time-entries/time-entry-row.tsx
export function TimeEntryRow({ entry, onEdit, onDelete }: TimeEntryRowProps) {
  return (
    <tr
      tabIndex={0}
      role="row"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onEdit(entry);
        }
        if (e.key === 'Delete') {
          e.preventDefault();
          onDelete(entry);
        }
      }}
      className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
    >
      {/* Row content */}
    </tr>
  );
}
```

## Security

### Input Validation

```tsx
// lib/validations/time-entry.ts
import { z } from 'zod';

export const timeEntrySchema = z.object({
  description: z.string().max(500).optional(),
  projectId: z.string().cuid().optional(),
  taskId: z.string().cuid().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.number().int().positive().max(86400), // Max 24 hours
  billable: z.boolean().default(true),
  hourlyRate: z.number().min(0).max(10000).optional(),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

export const bulkUpdateSchema = z.object({
  ids: z.array(z.string().cuid()).min(1).max(100),
  updates: z.object({
    projectId: z.string().cuid().optional(),
    billable: z.boolean().optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  }),
});
```

### Authorization

```tsx
// lib/auth/time-entry-auth.ts
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth';

export async function canAccessTimeEntry(entryId: string): Promise<boolean> {
  const user = await getCurrentUser();
  const org = await getCurrentOrganization();

  if (!user || !org) return false;

  const entry = await prisma.timeEntry.findUnique({
    where: { id: entryId },
  });

  if (!entry) return false;

  // Check organization membership
  if (entry.organizationId !== org.id) return false;

  // Users can access their own entries
  if (entry.userId === user.id) return true;

  // Managers can access team entries
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
  });

  return membership?.role === 'OWNER' ||
         membership?.role === 'ADMIN' ||
         membership?.role === 'MANAGER';
}
```

## Performance

### Caching Strategies

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getCachedProjects = unstable_cache(
  async (organizationId: string) => {
    return prisma.project.findMany({
      where: { organizationId, status: 'ACTIVE' },
      select: { id: true, name: true, color: true, clientId: true },
      orderBy: { name: 'asc' },
    });
  },
  ['projects'],
  { revalidate: 300, tags: ['projects'] }
);

export const getCachedTimeStats = unstable_cache(
  async (organizationId: string, userId: string, startDate: Date, endDate: Date) => {
    const entries = await prisma.timeEntry.aggregate({
      where: {
        organizationId,
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { duration: true },
      _count: true,
    });

    return {
      totalSeconds: entries._sum.duration || 0,
      entryCount: entries._count,
    };
  },
  ['time-stats'],
  { revalidate: 60, tags: ['time-entries'] }
);
```

### Database Optimization

```tsx
// Optimized time entries query with pagination
export async function getTimeEntries(
  organizationId: string,
  options: {
    userId?: string;
    projectId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
  }
) {
  const { page = 1, limit = 50, ...filters } = options;

  const where: any = { organizationId };
  if (filters.userId) where.userId = filters.userId;
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = filters.startDate;
    if (filters.endDate) where.date.lte = filters.endDate;
  }

  const [entries, total] = await Promise.all([
    prisma.timeEntry.findMany({
      where,
      select: {
        id: true,
        description: true,
        date: true,
        duration: true,
        billable: true,
        status: true,
        project: { select: { id: true, name: true, color: true } },
        task: { select: { id: true, name: true } },
        user: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.timeEntry.count({ where }),
  ]);

  return { entries, total, pages: Math.ceil(total / limit) };
}
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: timetracking_test
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
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma generate
      - run: pnpm prisma db push
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/timetracking_test
      - run: pnpm test:unit
      - run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/timetracking_test

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm build
      - run: pnpm test:e2e

  deploy:
    runs-on: ubuntu-latest
    needs: [test, e2e]
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

### Health Check

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, any>,
  };

  // Database check
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = { status: 'healthy' };
  } catch (error) {
    checks.checks.database = { status: 'unhealthy' };
    checks.status = 'unhealthy';
  }

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  });
}
```

### Metrics

```tsx
// lib/metrics.ts
import { track } from '@vercel/analytics';

export function trackTimerEvent(event: 'start' | 'stop' | 'discard', data?: Record<string, any>) {
  track(`timer_${event}`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}

export function trackInvoiceEvent(event: 'created' | 'sent' | 'paid', data?: Record<string, any>) {
  track(`invoice_${event}`, {
    ...data,
    timestamp: new Date().toISOString(),
  });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/timetracking"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_PUBLISHABLE_KEY="pk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# Email
RESEND_API_KEY="re_xxx"
EMAIL_FROM="invoices@yourdomain.com"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"
SENTRY_AUTH_TOKEN="your-sentry-token"

# App
NEXT_PUBLIC_APP_URL="https://timetracking.yourdomain.com"
```

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Stripe webhooks configured
- [ ] Email service configured
- [ ] Sentry error tracking enabled
- [ ] SSL certificate configured
- [ ] Rate limiting enabled
- [ ] Backup strategy in place

## Related Recipes

- [r-invoice-app](./invoice-app.md) - Standalone invoicing
- [r-project-management](./project-management.md) - Project management features
- [r-subscription-billing](./subscription-billing.md) - Recurring billing

## Changelog

### v3.0.0 (2025-01-18)
- Initial comprehensive time tracking recipe with timers, invoicing, and retainers
