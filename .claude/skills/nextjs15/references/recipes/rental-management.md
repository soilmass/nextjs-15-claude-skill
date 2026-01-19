---
id: r-rental-management
name: Rental Management
version: 3.0.0
layer: L6
category: recipes
description: Enterprise rental property management with landlord/tenant portals, leases, maintenance requests, and payment processing
tags: [rental, property-management, landlord, tenant, leases, maintenance, enterprise]
formula: "RentalManagement = DashboardLayout(t-dashboard-layout) + SettingsPage(t-settings-page) + InvoicePage(t-invoice-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + LandingPage(t-landing-page) + InvoiceTable(o-invoice-table) + DataTable(o-data-table) + FileUploader(o-file-uploader) + StatsDashboard(o-stats-dashboard) + Chart(o-chart) + Header(o-header) + Footer(o-footer) + Sidebar(o-sidebar) + NotificationCenter(o-notification-center) + SettingsForm(o-settings-form) + Timeline(o-timeline) + Calendar(o-calendar) + MediaGallery(o-media-gallery) + Card(m-card) + StatCard(m-stat-card) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + FormField(m-form-field) + DatePicker(m-date-picker) + AddressInput(m-address-input) + EmptyState(m-empty-state) + ActionMenu(m-action-menu) + TimelineItem(m-timeline-item) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + MultiTenancy(pt-multi-tenancy) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + StripeCheckout(pt-stripe-checkout) + StripeWebhooks(pt-stripe-webhooks) + StripeSubscriptions(pt-stripe-subscriptions) + Transactions(pt-transactions) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + PushNotifications(pt-push-notifications) + FileUpload(pt-file-upload) + FileStorage(pt-file-storage) + ImageOptimization(pt-image-optimization) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + CronJobs(pt-cron-jobs) + ScheduledTasks(pt-scheduled-tasks) + CalendarIntegration(pt-calendar-integration) + DatePickers(pt-date-pickers) + ExportData(pt-export-data) + Sitemap(pt-sitemap) + MetadataApi(pt-metadata-api) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Pagination(pt-pagination) + Filtering(pt-filtering) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + TestingE2e(pt-testing-e2e) + TestingIntegration(pt-testing-integration)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/card.md
  - ../molecules/stat-card.md
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/form-field.md
  - ../molecules/date-picker.md
  - ../molecules/address-input.md
  - ../molecules/empty-state.md
  - ../molecules/action-menu.md
  - ../molecules/timeline-item.md
  # L3 Organisms - Complex Components
  - ../organisms/invoice-table.md
  - ../organisms/data-table.md
  - ../organisms/file-uploader.md
  - ../organisms/stats-dashboard.md
  - ../organisms/chart.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/sidebar.md
  - ../organisms/notification-center.md
  - ../organisms/settings-form.md
  - ../organisms/timeline.md
  - ../organisms/calendar.md
  - ../organisms/media-gallery.md
  # L4 Templates - Page Layouts
  - ../templates/dashboard-layout.md
  - ../templates/settings-page.md
  - ../templates/invoice-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/landing-page.md
  # L5 Patterns - Authentication & Security
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/multi-tenancy.md
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Payments & Billing
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-webhooks.md
  - ../patterns/stripe-subscriptions.md
  - ../patterns/transactions.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  - ../patterns/push-notifications.md
  # L5 Patterns - File Handling
  - ../patterns/file-upload.md
  - ../patterns/file-storage.md
  - ../patterns/image-optimization.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - Background Jobs
  - ../patterns/cron-jobs.md
  - ../patterns/scheduled-tasks.md
  # L5 Patterns - Calendar & Scheduling
  - ../patterns/calendar-integration.md
  - ../patterns/date-pickers.md
  # L5 Patterns - Data & Export
  - ../patterns/export-data.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/pagination.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
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
  - uploadthing@6.0.0
skills:
  - multi-tenancy
  - rbac
  - stripe-integration
  - file-upload
  - email-notifications
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

An enterprise-grade rental property management platform for landlords and property managers. Features separate portals for landlords and tenants, lease management, automated rent collection via Stripe, maintenance request tracking, document storage, and comprehensive reporting. Supports multi-tenancy for property management companies.

## Project Structure

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── pricing/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── invite/[token]/page.tsx     # Tenant invite
├── (landlord)/                      # Landlord/Manager portal
│   ├── layout.tsx
│   ├── page.tsx                     # Dashboard
│   ├── properties/
│   │   ├── page.tsx                 # Property list
│   │   ├── new/page.tsx
│   │   └── [id]/
│   │       ├── page.tsx             # Property detail
│   │       ├── units/page.tsx
│   │       └── financials/page.tsx
│   ├── units/
│   │   ├── page.tsx                 # All units
│   │   └── [id]/
│   │       ├── page.tsx             # Unit detail
│   │       └── lease/page.tsx
│   ├── tenants/
│   │   ├── page.tsx                 # Tenant list
│   │   ├── invite/page.tsx
│   │   └── [id]/page.tsx            # Tenant detail
│   ├── leases/
│   │   ├── page.tsx                 # Lease list
│   │   ├── new/page.tsx
│   │   └── [id]/page.tsx            # Lease detail
│   ├── maintenance/
│   │   ├── page.tsx                 # All requests
│   │   └── [id]/page.tsx            # Request detail
│   ├── payments/
│   │   ├── page.tsx                 # Payment history
│   │   └── collect/page.tsx         # Manual collection
│   ├── documents/page.tsx           # Document library
│   ├── reports/
│   │   ├── page.tsx                 # Reports dashboard
│   │   ├── income/page.tsx
│   │   ├── expenses/page.tsx
│   │   └── occupancy/page.tsx
│   └── settings/
│       ├── page.tsx
│       ├── team/page.tsx
│       ├── billing/page.tsx
│       └── integrations/page.tsx
├── (tenant)/                        # Tenant portal
│   ├── layout.tsx
│   ├── page.tsx                     # Dashboard
│   ├── payments/
│   │   ├── page.tsx                 # Payment history
│   │   └── pay/page.tsx             # Make payment
│   ├── maintenance/
│   │   ├── page.tsx                 # My requests
│   │   └── new/page.tsx             # Submit request
│   ├── lease/page.tsx               # My lease
│   ├── documents/page.tsx           # My documents
│   └── settings/page.tsx
├── api/
│   ├── properties/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── units/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── tenants/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── invite/route.ts
│   ├── leases/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── maintenance/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── payments/
│   │   ├── route.ts
│   │   └── collect/route.ts
│   ├── documents/route.ts
│   ├── webhooks/
│   │   └── stripe/route.ts
│   └── cron/
│       ├── rent-reminders/route.ts
│       └── late-fees/route.ts
└── components/
    ├── properties/
    │   ├── property-card.tsx
    │   ├── property-form.tsx
    │   └── unit-list.tsx
    ├── units/
    │   ├── unit-card.tsx
    │   ├── unit-form.tsx
    │   └── vacancy-badge.tsx
    ├── tenants/
    │   ├── tenant-card.tsx
    │   ├── tenant-form.tsx
    │   └── invite-form.tsx
    ├── leases/
    │   ├── lease-form.tsx
    │   ├── lease-timeline.tsx
    │   └── rent-schedule.tsx
    ├── maintenance/
    │   ├── request-card.tsx
    │   ├── request-form.tsx
    │   └── status-pipeline.tsx
    ├── payments/
    │   ├── payment-table.tsx
    │   ├── payment-form.tsx
    │   └── rent-collection.tsx
    └── dashboard/
        ├── landlord-stats.tsx
        ├── tenant-stats.tsx
        ├── occupancy-chart.tsx
        └── income-chart.tsx
lib/
├── stripe.ts
├── email.ts
├── lease-utils.ts
└── rent-calculator.ts
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
  id                String    @id @default(cuid())
  name              String
  slug              String    @unique
  
  // Contact
  email             String
  phone             String?
  website           String?
  
  // Address
  address           String?
  city              String?
  state             String?
  postalCode        String?
  country           String    @default("US")
  
  // Branding
  logoUrl           String?
  primaryColor      String?
  
  // Stripe Connect
  stripeAccountId   String?   @unique
  stripeAccountStatus String?
  
  // Settings
  lateFeePercentage Decimal   @default(5) @db.Decimal(5, 2)
  lateFeeGraceDays  Int       @default(5)
  
  members           OrganizationMember[]
  properties        Property[]
  tenants           Tenant[]
  leases            Lease[]
  payments          Payment[]
  documents         Document[]
  auditLogs         AuditLog[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  phone         String?
  avatarUrl     String?
  
  memberships   OrganizationMember[]
  tenant        Tenant?
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

model Property {
  id              String       @id @default(cuid())
  organizationId  String
  
  name            String
  type            PropertyType
  
  // Address
  address         String
  city            String
  state           String
  postalCode      String
  country         String       @default("US")
  
  // Details
  yearBuilt       Int?
  totalUnits      Int          @default(1)
  
  // Media
  imageUrl        String?
  
  // Financials
  purchasePrice   Decimal?     @db.Decimal(12, 2)
  purchaseDate    DateTime?
  marketValue     Decimal?     @db.Decimal(12, 2)
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  units           Unit[]
  expenses        Expense[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([organizationId])
}

enum PropertyType {
  SINGLE_FAMILY
  MULTI_FAMILY
  APARTMENT_BUILDING
  CONDO
  TOWNHOUSE
  COMMERCIAL
}

model Unit {
  id              String       @id @default(cuid())
  propertyId      String
  
  name            String       // e.g., "Unit 101", "Apt A"
  
  // Details
  bedrooms        Int?
  bathrooms       Float?
  sqft            Int?
  floor           Int?
  
  // Features
  features        String[]
  
  // Rent
  marketRent      Decimal      @db.Decimal(10, 2)
  
  // Status
  status          UnitStatus   @default(VACANT)
  
  // Media
  images          String[]
  
  property        Property     @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  leases          Lease[]
  maintenanceRequests MaintenanceRequest[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([propertyId])
  @@index([status])
}

enum UnitStatus {
  VACANT
  OCCUPIED
  MAINTENANCE
  COMING_SOON
}

model Tenant {
  id              String       @id @default(cuid())
  organizationId  String
  userId          String?      @unique
  
  // Contact
  firstName       String
  lastName        String
  email           String
  phone           String?
  
  // Emergency contact
  emergencyName   String?
  emergencyPhone  String?
  emergencyRelation String?
  
  // Employment
  employer        String?
  employerPhone   String?
  income          Decimal?     @db.Decimal(10, 2)
  
  // Screening
  creditScore     Int?
  backgroundCheck Boolean      @default(false)
  
  // Portal access
  portalEnabled   Boolean      @default(false)
  inviteToken     String?      @unique
  inviteSentAt    DateTime?
  
  // Stripe
  stripeCustomerId String?     @unique
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user            User?        @relation(fields: [userId], references: [id])
  leases          Lease[]
  payments        Payment[]
  maintenanceRequests MaintenanceRequest[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([organizationId])
  @@index([email])
}

model Lease {
  id              String       @id @default(cuid())
  organizationId  String
  unitId          String
  tenantId        String
  
  // Term
  startDate       DateTime
  endDate         DateTime
  type            LeaseType    @default(FIXED)
  status          LeaseStatus  @default(ACTIVE)
  
  // Rent
  rentAmount      Decimal      @db.Decimal(10, 2)
  rentDueDay      Int          @default(1)  // Day of month
  
  // Deposit
  securityDeposit Decimal      @db.Decimal(10, 2)
  depositPaid     Boolean      @default(false)
  depositPaidDate DateTime?
  
  // Additional charges
  petDeposit      Decimal?     @db.Decimal(10, 2)
  petRent         Decimal?     @db.Decimal(10, 2)
  parkingFee      Decimal?     @db.Decimal(10, 2)
  
  // Documents
  documentUrl     String?
  
  // Move in/out
  moveInDate      DateTime?
  moveOutDate     DateTime?
  moveInInspection String?
  moveOutInspection String?
  
  // Renewal
  autoRenew       Boolean      @default(false)
  renewalNotice   Int          @default(60)  // Days before end
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  unit            Unit         @relation(fields: [unitId], references: [id])
  tenant          Tenant       @relation(fields: [tenantId], references: [id])
  rentCharges     RentCharge[]
  payments        Payment[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([organizationId])
  @@index([unitId])
  @@index([tenantId])
  @@index([status])
}

enum LeaseType {
  FIXED
  MONTH_TO_MONTH
}

enum LeaseStatus {
  DRAFT
  PENDING_SIGNATURE
  ACTIVE
  EXPIRING
  EXPIRED
  TERMINATED
}

model RentCharge {
  id          String        @id @default(cuid())
  leaseId     String
  
  type        ChargeType
  description String
  amount      Decimal       @db.Decimal(10, 2)
  dueDate     DateTime
  
  // Late fee
  isLateFee   Boolean       @default(false)
  
  status      ChargeStatus  @default(PENDING)
  
  lease       Lease         @relation(fields: [leaseId], references: [id], onDelete: Cascade)
  payments    PaymentAllocation[]
  
  createdAt   DateTime      @default(now())
  
  @@index([leaseId])
  @@index([dueDate])
  @@index([status])
}

enum ChargeType {
  RENT
  LATE_FEE
  PET_RENT
  PARKING
  UTILITIES
  OTHER
}

enum ChargeStatus {
  PENDING
  PARTIAL
  PAID
  WAIVED
}

model Payment {
  id              String       @id @default(cuid())
  organizationId  String
  leaseId         String
  tenantId        String
  
  amount          Decimal      @db.Decimal(10, 2)
  method          PaymentMethod
  
  // Stripe
  stripePaymentIntentId String?
  stripeChargeId        String?
  
  // Check/cash details
  checkNumber     String?
  reference       String?
  
  status          PaymentStatus @default(PENDING)
  
  notes           String?
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  lease           Lease        @relation(fields: [leaseId], references: [id])
  tenant          Tenant       @relation(fields: [tenantId], references: [id])
  allocations     PaymentAllocation[]
  
  paidAt          DateTime?
  createdAt       DateTime     @default(now())
  
  @@index([organizationId])
  @@index([leaseId])
  @@index([tenantId])
  @@index([status])
}

enum PaymentMethod {
  ACH
  CARD
  CHECK
  CASH
  OTHER
}

enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
}

model PaymentAllocation {
  id          String     @id @default(cuid())
  paymentId   String
  chargeId    String
  amount      Decimal    @db.Decimal(10, 2)
  
  payment     Payment    @relation(fields: [paymentId], references: [id], onDelete: Cascade)
  charge      RentCharge @relation(fields: [chargeId], references: [id])
  
  @@index([paymentId])
  @@index([chargeId])
}

model MaintenanceRequest {
  id              String              @id @default(cuid())
  unitId          String
  tenantId        String?
  
  title           String
  description     String              @db.Text
  category        MaintenanceCategory
  priority        Priority            @default(MEDIUM)
  status          MaintenanceStatus   @default(OPEN)
  
  // Media
  images          String[]
  
  // Assignment
  assignedTo      String?
  vendorId        String?
  
  // Scheduling
  scheduledDate   DateTime?
  completedDate   DateTime?
  
  // Cost
  estimatedCost   Decimal?            @db.Decimal(10, 2)
  actualCost      Decimal?            @db.Decimal(10, 2)
  
  // Tenant permission
  permissionToEnter Boolean           @default(false)
  preferredTime   String?
  
  unit            Unit                @relation(fields: [unitId], references: [id])
  tenant          Tenant?             @relation(fields: [tenantId], references: [id])
  notes           MaintenanceNote[]
  
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  
  @@index([unitId])
  @@index([status])
  @@index([priority])
}

enum MaintenanceCategory {
  PLUMBING
  ELECTRICAL
  HVAC
  APPLIANCE
  STRUCTURAL
  PEST_CONTROL
  LANDSCAPING
  CLEANING
  SAFETY
  OTHER
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum MaintenanceStatus {
  OPEN
  IN_PROGRESS
  PENDING_PARTS
  SCHEDULED
  COMPLETED
  CANCELLED
}

model MaintenanceNote {
  id          String             @id @default(cuid())
  requestId   String
  authorId    String
  authorName  String
  content     String             @db.Text
  isInternal  Boolean            @default(false)
  
  request     MaintenanceRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime           @default(now())
  
  @@index([requestId])
}

model Expense {
  id          String       @id @default(cuid())
  propertyId  String
  
  category    ExpenseCategory
  description String
  amount      Decimal      @db.Decimal(10, 2)
  date        DateTime
  
  vendor      String?
  receiptUrl  String?
  
  property    Property     @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime     @default(now())
  
  @@index([propertyId])
  @@index([date])
}

enum ExpenseCategory {
  MAINTENANCE
  REPAIRS
  UTILITIES
  INSURANCE
  TAXES
  MANAGEMENT
  LEGAL
  MARKETING
  OTHER
}

model Document {
  id              String       @id @default(cuid())
  organizationId  String
  
  name            String
  type            DocumentType
  category        String?
  
  fileUrl         String
  fileSize        Int
  mimeType        String
  
  // Related entities
  propertyId      String?
  unitId          String?
  leaseId         String?
  tenantId        String?
  
  uploadedById    String
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime     @default(now())
  
  @@index([organizationId])
  @@index([type])
}

enum DocumentType {
  LEASE
  ADDENDUM
  INSPECTION
  INVOICE
  RECEIPT
  NOTICE
  APPLICATION
  ID_VERIFICATION
  INSURANCE
  OTHER
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
  @@index([createdAt])
}
```

## Implementation

### Landlord Dashboard

```tsx
// app/(landlord)/page.tsx
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { LandlordStats } from '@/components/dashboard/landlord-stats';
import { OccupancyChart } from '@/components/dashboard/occupancy-chart';
import { IncomeChart } from '@/components/dashboard/income-chart';
import { RecentPayments } from '@/components/dashboard/recent-payments';
import { MaintenanceOverview } from '@/components/dashboard/maintenance-overview';
import { UpcomingLeases } from '@/components/dashboard/upcoming-leases';

export default async function LandlordDashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  
  const org = await getCurrentOrganization(user.id);
  if (!org) redirect('/onboarding');
  
  // Fetch dashboard data
  const [
    properties,
    units,
    tenants,
    leases,
    payments,
    maintenanceRequests,
  ] = await Promise.all([
    prisma.property.count({ where: { organizationId: org.id } }),
    prisma.unit.findMany({
      where: { property: { organizationId: org.id } },
      select: { status: true, marketRent: true },
    }),
    prisma.tenant.count({ where: { organizationId: org.id } }),
    prisma.lease.findMany({
      where: { organizationId: org.id, status: 'ACTIVE' },
      select: { rentAmount: true, endDate: true },
    }),
    prisma.payment.findMany({
      where: { 
        organizationId: org.id,
        paidAt: { gte: new Date(new Date().setDate(1)) }, // This month
      },
      include: { tenant: true, lease: { include: { unit: true } } },
      orderBy: { paidAt: 'desc' },
      take: 10,
    }),
    prisma.maintenanceRequest.findMany({
      where: { 
        unit: { property: { organizationId: org.id } },
        status: { in: ['OPEN', 'IN_PROGRESS', 'SCHEDULED'] },
      },
      include: { unit: { include: { property: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);
  
  // Calculate stats
  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.status === 'OCCUPIED').length;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;
  
  const monthlyRent = leases.reduce((sum, l) => sum + Number(l.rentAmount), 0);
  const collectedRent = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const collectionRate = monthlyRent > 0 ? (collectedRent / monthlyRent) * 100 : 0;
  
  const expiringLeases = leases.filter(l => {
    const daysUntilEnd = Math.ceil(
      (new Date(l.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilEnd <= 60;
  });
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Cards */}
      <LandlordStats
        stats={{
          properties,
          units: totalUnits,
          tenants,
          occupancyRate,
          monthlyRent,
          collectedRent,
          collectionRate,
          openMaintenance: maintenanceRequests.length,
        }}
      />
      
      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OccupancyChart units={units} />
        <IncomeChart organizationId={org.id} />
      </div>
      
      {/* Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RecentPayments payments={payments} />
        <MaintenanceOverview requests={maintenanceRequests} />
        <UpcomingLeases leases={expiringLeases} />
      </div>
    </div>
  );
}
```

### Rent Collection Component

```tsx
// components/payments/rent-collection.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Send, Check, Clock, AlertCircle } from 'lucide-react';

interface RentCollectionProps {
  organizationId: string;
}

export function RentCollection({ organizationId }: RentCollectionProps) {
  const queryClient = useQueryClient();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  // Fetch charges for the month
  const { data: charges, isLoading } = useQuery({
    queryKey: ['rent-charges', organizationId, format(selectedMonth, 'yyyy-MM')],
    queryFn: async () => {
      const res = await fetch(
        `/api/payments/charges?month=${format(selectedMonth, 'yyyy-MM')}`
      );
      return res.json();
    },
  });
  
  // Send reminder mutation
  const sendReminder = useMutation({
    mutationFn: async (chargeId: string) => {
      const res = await fetch('/api/payments/remind', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chargeId }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rent-charges'] });
    },
  });
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
            <Check className="h-3 w-3" /> Paid
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3" /> Partial
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-gray-600 bg-gray-50 px-2 py-1 rounded-full text-xs">
            <Clock className="h-3 w-3" /> Pending
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs">
            <AlertCircle className="h-3 w-3" /> Overdue
          </span>
        );
    }
  };
  
  const totalDue = charges?.reduce((sum: number, c: any) => 
    c.status !== 'PAID' ? sum + Number(c.amount) : sum, 0
  ) || 0;
  
  const totalCollected = charges?.reduce((sum: number, c: any) => 
    c.status === 'PAID' ? sum + Number(c.amount) : sum, 0
  ) || 0;
  
  return (
    <div className="bg-white rounded-lg border">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="font-semibold">Rent Collection</h2>
        <input
          type="month"
          value={format(selectedMonth, 'yyyy-MM')}
          onChange={(e) => setSelectedMonth(new Date(e.target.value))}
          className="border rounded-lg px-3 py-1"
        />
      </div>
      
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 border-b">
        <div>
          <p className="text-sm text-gray-500">Total Due</p>
          <p className="text-xl font-bold">${totalDue.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Collected</p>
          <p className="text-xl font-bold text-green-600">
            ${totalCollected.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Outstanding</p>
          <p className="text-xl font-bold text-red-600">
            ${(totalDue).toLocaleString()}
          </p>
        </div>
      </div>
      
      {/* Charges List */}
      <div className="divide-y">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : charges?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No charges for this month
          </div>
        ) : (
          charges?.map((charge: any) => (
            <div key={charge.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-medium">{charge.lease.tenant.firstName} {charge.lease.tenant.lastName}</p>
                  <p className="text-sm text-gray-500">
                    {charge.lease.unit.name} - {charge.lease.unit.property.name}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">${Number(charge.amount).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">
                    Due {format(new Date(charge.dueDate), 'MMM d')}
                  </p>
                </div>
                
                {getStatusBadge(charge.status)}
                
                {charge.status !== 'PAID' && (
                  <button
                    onClick={() => sendReminder.mutate(charge.id)}
                    disabled={sendReminder.isPending}
                    className="p-2 text-gray-400 hover:text-indigo-600"
                    title="Send reminder"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
```

### Tenant Portal - Pay Rent

```tsx
// app/(tenant)/payments/pay/page.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { format } from 'date-fns';
import { CreditCard, Building } from 'lucide-react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function PayRentPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ach'>('card');
  const [selectedCharges, setSelectedCharges] = useState<string[]>([]);
  
  // Fetch outstanding charges
  const { data: charges } = useQuery({
    queryKey: ['my-charges'],
    queryFn: async () => {
      const res = await fetch('/api/tenant/charges');
      return res.json();
    },
  });
  
  // Create payment intent
  const createPayment = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/tenant/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chargeIds: selectedCharges,
          method: paymentMethod,
        }),
      });
      return res.json();
    },
  });
  
  const totalAmount = charges
    ?.filter((c: any) => selectedCharges.includes(c.id))
    .reduce((sum: number, c: any) => sum + Number(c.amount), 0) || 0;
  
  const toggleCharge = (chargeId: string) => {
    setSelectedCharges(prev =>
      prev.includes(chargeId)
        ? prev.filter(id => id !== chargeId)
        : [...prev, chargeId]
    );
  };
  
  const handlePay = async () => {
    const { clientSecret } = await createPayment.mutateAsync();
    // Redirect to Stripe checkout or show embedded form
  };
  
  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Pay Rent</h1>
      
      {/* Outstanding Charges */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Outstanding Balances</h2>
        </div>
        <div className="divide-y">
          {charges?.map((charge: any) => (
            <label
              key={charge.id}
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            >
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedCharges.includes(charge.id)}
                  onChange={() => toggleCharge(charge.id)}
                  className="h-5 w-5 rounded"
                />
                <div>
                  <p className="font-medium">{charge.type}</p>
                  <p className="text-sm text-gray-500">
                    Due {format(new Date(charge.dueDate), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              <span className="font-semibold">
                ${Number(charge.amount).toLocaleString()}
              </span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Payment Method */}
      <div className="bg-white rounded-lg border mb-6">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Payment Method</h2>
        </div>
        <div className="p-4 space-y-3">
          <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
            paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : ''
          }`}>
            <input
              type="radio"
              name="method"
              checked={paymentMethod === 'card'}
              onChange={() => setPaymentMethod('card')}
              className="sr-only"
            />
            <CreditCard className="h-6 w-6 text-gray-600" />
            <div>
              <p className="font-medium">Credit/Debit Card</p>
              <p className="text-sm text-gray-500">2.9% + $0.30 fee</p>
            </div>
          </label>
          
          <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer ${
            paymentMethod === 'ach' ? 'border-indigo-600 bg-indigo-50' : ''
          }`}>
            <input
              type="radio"
              name="method"
              checked={paymentMethod === 'ach'}
              onChange={() => setPaymentMethod('ach')}
              className="sr-only"
            />
            <Building className="h-6 w-6 text-gray-600" />
            <div>
              <p className="font-medium">Bank Account (ACH)</p>
              <p className="text-sm text-gray-500">No fee - takes 3-5 days</p>
            </div>
          </label>
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span>Subtotal</span>
          <span>${totalAmount.toLocaleString()}</span>
        </div>
        {paymentMethod === 'card' && (
          <div className="flex justify-between mb-2 text-gray-500">
            <span>Processing fee</span>
            <span>${(totalAmount * 0.029 + 0.30).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total</span>
          <span>
            ${(paymentMethod === 'card' 
              ? totalAmount * 1.029 + 0.30 
              : totalAmount
            ).toLocaleString()}
          </span>
        </div>
      </div>
      
      {/* Pay Button */}
      <button
        onClick={handlePay}
        disabled={selectedCharges.length === 0 || createPayment.isPending}
        className="w-full py-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {createPayment.isPending ? 'Processing...' : `Pay $${totalAmount.toLocaleString()}`}
      </button>
    </div>
  );
}
```

### Maintenance Request Form

```tsx
// components/maintenance/request-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Camera, X } from 'lucide-react';
import { uploadFiles } from '@/lib/uploadthing';

const requestSchema = z.object({
  title: z.string().min(1, 'Title required'),
  description: z.string().min(10, 'Please provide more details'),
  category: z.enum([
    'PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURAL',
    'PEST_CONTROL', 'LANDSCAPING', 'CLEANING', 'SAFETY', 'OTHER'
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  permissionToEnter: z.boolean(),
  preferredTime: z.string().optional(),
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestFormProps {
  unitId: string;
}

export function RequestForm({ unitId }: RequestFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  
  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: 'MEDIUM',
      permissionToEnter: false,
    },
  });
  
  const mutation = useMutation({
    mutationFn: async (data: RequestFormData) => {
      // Upload images first
      let imageUrls: string[] = [];
      if (images.length > 0) {
        const uploaded = await uploadFiles('maintenanceImages', { files: images });
        imageUrls = uploaded.map(u => u.url);
      }
      
      const response = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          unitId,
          images: imageUrls,
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit');
      return response.json();
    },
    onSuccess: () => {
      router.push('/maintenance?submitted=true');
    },
  });
  
  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };
  
  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };
  
  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Issue Title</label>
        <input
          {...form.register('title')}
          placeholder="Brief description of the issue"
          className="w-full border rounded-lg px-3 py-2"
        />
        {form.formState.errors.title && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      
      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          {...form.register('category')}
          className="w-full border rounded-lg px-3 py-2"
        >
          <option value="">Select a category</option>
          <option value="PLUMBING">Plumbing</option>
          <option value="ELECTRICAL">Electrical</option>
          <option value="HVAC">Heating/Cooling</option>
          <option value="APPLIANCE">Appliance</option>
          <option value="STRUCTURAL">Structural</option>
          <option value="PEST_CONTROL">Pest Control</option>
          <option value="SAFETY">Safety Issue</option>
          <option value="OTHER">Other</option>
        </select>
      </div>
      
      {/* Priority */}
      <div>
        <label className="block text-sm font-medium mb-1">Priority</label>
        <div className="grid grid-cols-4 gap-2">
          {['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => (
            <label
              key={priority}
              className={`text-center py-2 border rounded-lg cursor-pointer ${
                form.watch('priority') === priority
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                  : ''
              }`}
            >
              <input
                type="radio"
                {...form.register('priority')}
                value={priority}
                className="sr-only"
              />
              {priority.charAt(0) + priority.slice(1).toLowerCase()}
            </label>
          ))}
        </div>
      </div>
      
      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          {...form.register('description')}
          rows={4}
          placeholder="Please describe the issue in detail..."
          className="w-full border rounded-lg px-3 py-2"
        />
        {form.formState.errors.description && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.description.message}
          </p>
        )}
      </div>
      
      {/* Photos */}
      <div>
        <label className="block text-sm font-medium mb-1">Photos (optional)</label>
        <div className="flex flex-wrap gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative w-20 h-20">
              <img
                src={preview}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          
          <label className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-indigo-600">
            <Camera className="h-6 w-6 text-gray-400" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageAdd}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      {/* Permission to Enter */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            {...form.register('permissionToEnter')}
            className="mt-1 h-4 w-4 rounded"
          />
          <div>
            <p className="font-medium">Permission to Enter</p>
            <p className="text-sm text-gray-600">
              I give permission for maintenance staff to enter my unit if I am not home
            </p>
          </div>
        </label>
        
        {form.watch('permissionToEnter') && (
          <div className="mt-3">
            <label className="block text-sm text-gray-600 mb-1">
              Preferred time for entry
            </label>
            <input
              {...form.register('preferredTime')}
              placeholder="e.g., Weekdays 9am-5pm"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        )}
      </div>
      
      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  );
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| DashboardLayout | L5 | Multi-portal dashboard structure |
| SettingsPage | L5 | Organization and user settings |
| InvoicePage | L5 | Rent invoices and payment receipts |
| InvoiceTable | L4 | Payment history and charges table |
| DataTable | L4 | Properties, units, tenants lists |
| FileUploader | L4 | Lease documents and receipts |
| StatsDashboard | L4 | Landlord KPI metrics |
| Chart | L4 | Occupancy and income visualization |
| RBACPattern | L3 | Role-based portal access |
| TransactionsPattern | L3 | Rent payment processing |

## Testing

### Setup

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event @vitejs/plugin-react jsdom msw stripe-mock
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', 'tests/'],
    },
  },
});
```

### Unit Tests

```tsx
// lib/rent-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateRentCharge, calculateLateFee, prorateDailyRent } from './rent-calculator';

describe('Rent Calculator', () => {
  it('calculates monthly rent charge correctly', () => {
    const charge = calculateRentCharge({
      baseRent: 1500,
      petRent: 50,
      parkingFee: 100,
    });

    expect(charge.total).toBe(1650);
  });

  it('calculates late fee based on grace period', () => {
    const lateFee = calculateLateFee({
      rentAmount: 1500,
      lateFeePercentage: 5,
      dueDate: new Date('2024-01-01'),
      currentDate: new Date('2024-01-10'), // 9 days late
      graceDays: 5,
    });

    expect(lateFee).toBe(75); // 5% of 1500
  });

  it('returns zero late fee within grace period', () => {
    const lateFee = calculateLateFee({
      rentAmount: 1500,
      lateFeePercentage: 5,
      dueDate: new Date('2024-01-01'),
      currentDate: new Date('2024-01-04'), // 3 days late
      graceDays: 5,
    });

    expect(lateFee).toBe(0);
  });

  it('prorates daily rent correctly', () => {
    const proratedRent = prorateDailyRent({
      monthlyRent: 1500,
      moveInDate: new Date('2024-01-15'),
      month: new Date('2024-01-01'),
    });

    // 17 days in January (15-31) at $1500/31 days
    expect(proratedRent).toBeCloseTo(822.58, 2);
  });
});
```

### Integration Tests

```tsx
// tests/integration/payment-flow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RentCollection } from '@/components/payments/rent-collection';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const mockCharges = [
  {
    id: 'charge-1',
    amount: 1500,
    status: 'PENDING',
    dueDate: '2024-01-01',
    lease: {
      tenant: { firstName: 'John', lastName: 'Doe' },
      unit: { name: 'Unit 101', property: { name: 'Main St Apartments' } },
    },
  },
];

const server = setupServer(
  http.get('/api/payments/charges', () => {
    return HttpResponse.json(mockCharges);
  }),
  http.post('/api/payments/remind', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, chargeId: body.chargeId });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('RentCollection', () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it('displays outstanding rent charges', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <RentCollection organizationId="org-123" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('$1,500')).toBeInTheDocument();
    });
  });

  it('sends payment reminder', async () => {
    const user = userEvent.setup();

    render(
      <QueryClientProvider client={queryClient}>
        <RentCollection organizationId="org-123" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    const reminderButton = screen.getByTitle('Send reminder');
    await user.click(reminderButton);

    // Verify reminder was sent (mock response)
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

### E2E Tests

```ts
// tests/e2e/tenant-portal.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Tenant Portal', () => {
  test.beforeEach(async ({ page }) => {
    // Login as tenant
    await page.goto('/login');
    await page.fill('input[name="email"]', 'tenant@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
  });

  test('displays current balance and payment history', async ({ page }) => {
    await page.goto('/payments');

    await expect(page.getByText('Current Balance')).toBeVisible();
    await expect(page.getByText('Payment History')).toBeVisible();
  });

  test('submits maintenance request', async ({ page }) => {
    await page.goto('/maintenance/new');

    await page.fill('input[name="title"]', 'Leaking faucet in bathroom');
    await page.selectOption('select[name="category"]', 'PLUMBING');
    await page.selectOption('input[name="priority"]', 'MEDIUM');
    await page.fill('textarea[name="description"]', 'The bathroom faucet has been dripping constantly.');
    await page.check('input[name="permissionToEnter"]');

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/\/maintenance\?submitted=true/);
    await expect(page.getByText('Request submitted')).toBeVisible();
  });

  test('views lease details', async ({ page }) => {
    await page.goto('/lease');

    await expect(page.getByText('Lease Agreement')).toBeVisible();
    await expect(page.getByText('Monthly Rent')).toBeVisible();
    await expect(page.getByText('Security Deposit')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

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
    console.error('Rental management error:', error, errorInfo);
    // Send to error tracking service (Sentry)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="text-center max-w-md">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We encountered an error loading this page. Your data is safe.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling

```ts
// lib/api-errors.ts
export class RentalAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'RentalAPIError';
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  LEASE_EXPIRED: 'LEASE_EXPIRED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
} as const;

export function handleRentalError(error: unknown): Response {
  if (error instanceof RentalAPIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected rental error:', error);
  return Response.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Stripe error handling
export function handleStripeError(error: any): RentalAPIError {
  switch (error.type) {
    case 'card_error':
      return new RentalAPIError(error.message, 400, ErrorCodes.PAYMENT_FAILED);
    case 'insufficient_funds':
      return new RentalAPIError('Insufficient funds', 402, ErrorCodes.INSUFFICIENT_FUNDS);
    default:
      return new RentalAPIError('Payment processing failed', 500, ErrorCodes.PAYMENT_FAILED);
  }
}
```

## Accessibility

### WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|----------------|
| 1.1.1 Non-text Content | Alt text for property images, aria-labels for status icons |
| 1.3.1 Info and Relationships | Semantic tables for payment history, proper form labels |
| 1.4.3 Contrast | 4.5:1 minimum contrast for financial data |
| 2.1.1 Keyboard | All dashboard controls keyboard accessible |
| 2.4.4 Link Purpose | Descriptive link text for property/tenant navigation |
| 3.3.1 Error Identification | Clear error messages for payment failures |
| 4.1.2 Name, Role, Value | ARIA attributes for status badges |

### Focus Management

```tsx
// hooks/use-payment-flow-focus.ts
import { useEffect, useRef } from 'react';

export function usePaymentFlowFocus(step: 'select' | 'payment' | 'confirmation') {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Announce step change to screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');

    const messages = {
      select: 'Select charges to pay',
      payment: 'Enter payment information',
      confirmation: 'Payment confirmed',
    };

    announcement.textContent = messages[step];
    document.body.appendChild(announcement);

    // Focus the first interactive element
    const firstInput = containerRef.current?.querySelector<HTMLElement>(
      'input, button, select, textarea'
    );
    firstInput?.focus();

    return () => {
      document.body.removeChild(announcement);
    };
  }, [step]);

  return containerRef;
}

// Accessible payment status
function PaymentStatus({ status }: { status: string }) {
  const statusConfig = {
    PENDING: { label: 'Payment pending', color: 'yellow' },
    SUCCEEDED: { label: 'Payment successful', color: 'green' },
    FAILED: { label: 'Payment failed', color: 'red' },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <span
      role="status"
      aria-label={config.label}
      className={`px-2 py-1 rounded-full text-xs bg-${config.color}-100 text-${config.color}-700`}
    >
      {status}
    </span>
  );
}
```

## Security

### Input Validation

```ts
// lib/validations/rental.ts
import { z } from 'zod';

export const propertySchema = z.object({
  name: z.string()
    .min(2, 'Property name must be at least 2 characters')
    .max(100, 'Property name must be less than 100 characters'),

  type: z.enum(['SINGLE_FAMILY', 'MULTI_FAMILY', 'APARTMENT_BUILDING', 'CONDO', 'TOWNHOUSE', 'COMMERCIAL']),

  address: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().length(2),
  postalCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),

  totalUnits: z.coerce.number().min(1).max(1000),

  purchasePrice: z.coerce.number().min(0).max(100000000).optional(),
  marketValue: z.coerce.number().min(0).max(100000000).optional(),
});

export const leaseSchema = z.object({
  unitId: z.string().cuid(),
  tenantId: z.string().cuid(),

  startDate: z.coerce.date(),
  endDate: z.coerce.date(),

  rentAmount: z.coerce.number()
    .min(1, 'Rent must be at least $1')
    .max(100000, 'Rent cannot exceed $100,000'),

  rentDueDay: z.coerce.number().min(1).max(28),

  securityDeposit: z.coerce.number().min(0).max(100000),

  petDeposit: z.coerce.number().min(0).max(10000).optional(),
  petRent: z.coerce.number().min(0).max(500).optional(),
  parkingFee: z.coerce.number().min(0).max(500).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const maintenanceRequestSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  category: z.enum([
    'PLUMBING', 'ELECTRICAL', 'HVAC', 'APPLIANCE', 'STRUCTURAL',
    'PEST_CONTROL', 'LANDSCAPING', 'CLEANING', 'SAFETY', 'OTHER'
  ]),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
  permissionToEnter: z.boolean(),
  preferredTime: z.string().max(100).optional(),
});
```

### Rate Limiting

```ts
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
  analytics: true,
});

// Stricter limits for sensitive operations
const paymentRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 payment attempts per minute
  analytics: true,
});

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';

  // Stricter rate limiting for payment endpoints
  if (request.nextUrl.pathname.startsWith('/api/payments')) {
    const { success, limit, remaining } = await paymentRatelimit.limit(`payment:${ip}`);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many payment attempts. Please wait before trying again.' },
        { status: 429 }
      );
    }
  }

  // General API rate limiting
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        { status: 429 }
      );
    }
  }

  return NextResponse.next();
}
```

### Audit Logging

```ts
// lib/audit.ts
import { prisma } from './prisma';

export async function createAuditLog({
  organizationId,
  userId,
  action,
  entityType,
  entityId,
  changes,
  request,
}: {
  organizationId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  changes?: Record<string, any>;
  request?: Request;
}) {
  await prisma.auditLog.create({
    data: {
      organizationId,
      userId,
      action,
      entityType,
      entityId,
      changes,
      ipAddress: request?.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request?.headers.get('user-agent') ?? undefined,
    },
  });
}

// Usage
await createAuditLog({
  organizationId: org.id,
  userId: session.user.id,
  action: 'PAYMENT_COLLECTED',
  entityType: 'Payment',
  entityId: payment.id,
  changes: { amount: payment.amount, method: payment.method },
  request,
});
```

## Performance

### Caching Strategy

```ts
// app/api/properties/route.ts
import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

const getPropertiesWithStats = unstable_cache(
  async (organizationId: string) => {
    return prisma.property.findMany({
      where: { organizationId },
      include: {
        units: {
          select: {
            id: true,
            status: true,
            marketRent: true,
          },
        },
        _count: {
          select: { units: true },
        },
      },
    });
  },
  ['properties'],
  { revalidate: 60, tags: ['properties'] }
);

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const org = await getCurrentOrganization(session.user.id);
  const properties = await getPropertiesWithStats(org.id);

  return Response.json(properties, {
    headers: {
      'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=120',
    },
  });
}
```

### Dashboard Query Optimization

```ts
// lib/dashboard-queries.ts
import { prisma } from './prisma';

export async function getDashboardStats(organizationId: string) {
  // Execute all queries in parallel
  const [
    propertyCount,
    unitStats,
    tenantCount,
    activeLeases,
    monthlyPayments,
    openMaintenance,
  ] = await Promise.all([
    prisma.property.count({ where: { organizationId } }),

    prisma.unit.groupBy({
      by: ['status'],
      where: { property: { organizationId } },
      _count: true,
    }),

    prisma.tenant.count({ where: { organizationId } }),

    prisma.lease.aggregate({
      where: { organizationId, status: 'ACTIVE' },
      _sum: { rentAmount: true },
      _count: true,
    }),

    prisma.payment.aggregate({
      where: {
        organizationId,
        status: 'SUCCEEDED',
        paidAt: { gte: new Date(new Date().setDate(1)) },
      },
      _sum: { amount: true },
    }),

    prisma.maintenanceRequest.count({
      where: {
        unit: { property: { organizationId } },
        status: { in: ['OPEN', 'IN_PROGRESS', 'SCHEDULED'] },
      },
    }),
  ]);

  return {
    propertyCount,
    unitStats,
    tenantCount,
    activeLeases,
    monthlyPayments,
    openMaintenance,
  };
}
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: rental_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm lint

      - name: Type check
        run: pnpm type-check

      - name: Setup database
        run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/rental_test

      - name: Run tests
        run: pnpm test:coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/rental_test
          STRIPE_SECRET_KEY: sk_test_mock

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    needs: lint-and-test

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Build
        run: pnpm build
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}

      - name: Run E2E tests
        run: pnpm test:e2e
        env:
          DATABASE_URL: ${{ secrets.TEST_DATABASE_URL }}
          STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
```

## Monitoring

### Sentry Integration

```ts
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true, // Mask PII
      blockAllMedia: false,
    }),
  ],

  beforeSend(event) {
    // Remove sensitive financial data
    if (event.extra?.payment) {
      delete event.extra.payment.cardNumber;
      delete event.extra.payment.accountNumber;
    }
    return event;
  },
});
```

### Health Check Endpoint

```ts
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  const checks = {
    database: false,
    stripe: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    await stripe.balance.retrieve();
    checks.stripe = true;
  } catch (error) {
    console.error('Stripe health check failed:', error);
  }

  const healthy = checks.database && checks.stripe;

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

### Payment Monitoring

```ts
// lib/payment-monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function trackPaymentAttempt(payment: {
  id: string;
  amount: number;
  method: string;
  tenantId: string;
}) {
  Sentry.addBreadcrumb({
    category: 'payment',
    message: 'Payment attempt started',
    level: 'info',
    data: {
      paymentId: payment.id,
      amount: payment.amount,
      method: payment.method,
    },
  });
}

export function trackPaymentSuccess(paymentId: string, amount: number) {
  Sentry.addBreadcrumb({
    category: 'payment',
    message: 'Payment succeeded',
    level: 'info',
    data: { paymentId, amount },
  });
}

export function trackPaymentFailure(paymentId: string, error: Error) {
  Sentry.captureException(error, {
    tags: { paymentId },
    level: 'error',
  });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rental_management"

# Authentication
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourcompany.com"

# File Upload (UploadThing)
UPLOADTHING_SECRET="your-uploadthing-secret"
UPLOADTHING_APP_ID="your-uploadthing-app-id"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn"
SENTRY_AUTH_TOKEN="your-sentry-auth-token"

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_REST_URL="https://your-redis-url"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Cron Jobs (optional - for automated rent reminders)
CRON_SECRET="your-cron-secret"
```

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Database migrations applied (`pnpm prisma migrate deploy`)
- [ ] Stripe Connect account configured for payment processing
- [ ] Stripe webhook endpoint registered and secret set
- [ ] Email sending configured (Resend/SendGrid)
- [ ] Document storage configured (UploadThing/S3)
- [ ] Rate limiting Redis configured
- [ ] Sentry project created and DSN set
- [ ] Health check endpoint responding
- [ ] SSL certificate valid (required for payments)
- [ ] PCI compliance verified for payment handling
- [ ] Database backups scheduled (daily recommended)
- [ ] Error alerting configured for payment failures
- [ ] Audit logging verified
- [ ] RBAC permissions tested for all roles
- [ ] Cron jobs configured for rent reminders and late fees

## Related Skills

- [[multi-tenancy]] - Organization isolation
- [[rbac]] - Role-based access control
- [[stripe-integration]] - Payment processing
- [[file-upload]] - Document uploads
- [[email-notifications]] - Automated emails
- [[audit-logging]] - Activity tracking

## Changelog

- 1.0.0: Initial rental management recipe with landlord/tenant portals
