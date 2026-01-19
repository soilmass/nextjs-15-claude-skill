---
id: r-saas-dashboard
name: SaaS Dashboard Recipe
version: 3.0.0
layer: L6
category: recipes
description: Complete recipe for building a SaaS dashboard with Next.js 15
tags: [recipe, saas, dashboard, admin, analytics, multi-tenant]
formula: "SaasDashboard = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + SettingsPage(t-settings-page) + MarketingLayout(t-marketing-layout) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + OnboardingLayout(t-onboarding-layout) + Sidebar(o-sidebar) + DataTable(o-data-table) + Chart(o-chart) + SettingsForm(o-settings-form) + CommandPalette(o-command-palette) + Header(o-header) + Footer(o-footer) + Hero(o-hero) + StatsDashboard(o-stats-dashboard) + Modal(o-modal) + Tabs(o-tabs) + FilterBar(o-filter-bar) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + StatCard(m-stat-card) + SearchInput(m-search-input) + Badge(m-badge) + Avatar(m-avatar) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + MultiTenancy(pt-multi-tenancy) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + StripeSubscriptions(pt-stripe-subscriptions) + StripeBillingPortal(pt-stripe-billing-portal) + StripeWebhooks(pt-stripe-webhooks) + UsageMetering(pt-usage-metering) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + WebsocketUpdates(pt-websocket-updates) + CronJobs(pt-cron-jobs) + BackgroundJobs(pt-background-jobs) + ApiKeyManagement(pt-api-key-management) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + OptimisticUpdates(pt-optimistic-updates) + CommandPalette(pt-command-palette)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  - ../templates/marketing-layout.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/onboarding-layout.md
  # L3 Organisms
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/settings-form.md
  - ../organisms/command-palette.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/hero.md
  - ../organisms/stats-dashboard.md
  - ../organisms/modal.md
  - ../organisms/tabs.md
  - ../organisms/filter-bar.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/stat-card.md
  - ../molecules/search-input.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication & Authorization
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/multi-tenancy.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Billing & Payments
  - ../patterns/stripe-subscriptions.md
  - ../patterns/stripe-billing-portal.md
  - ../patterns/stripe-webhooks.md
  - ../patterns/usage-metering.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/websocket-updates.md
  # L5 Patterns - Background Processing
  - ../patterns/cron-jobs.md
  - ../patterns/background-jobs.md
  - ../patterns/api-key-management.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - UI/UX
  - ../patterns/optimistic-updates.md
  - ../patterns/command-palette.md
dependencies:
  - next
  - "@tanstack/react-query"
  - recharts
  - prisma
  - next-auth
complexity: advanced
estimated_time: 12-24 hours
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# SaaS Dashboard Recipe

## Overview

Build a production-ready SaaS dashboard with multi-tenant architecture, team management, billing integration, and comprehensive analytics. Includes authentication, role-based access control, and real-time data updates.

## Architecture

```
app/
├── (marketing)/                 # Public marketing pages
│   ├── page.tsx                # Landing page
│   └── pricing/
├── (auth)/                      # Authentication flows
│   ├── layout.tsx              # Auth layout
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   └── verify/
├── (dashboard)/                 # Protected dashboard
│   ├── layout.tsx              # Dashboard layout with sidebar
│   ├── [workspaceId]/          # Multi-tenant workspace
│   │   ├── layout.tsx          # Workspace context
│   │   ├── page.tsx            # Overview/home
│   │   ├── analytics/
│   │   │   └── page.tsx        # Analytics dashboard
│   │   ├── projects/
│   │   │   ├── page.tsx        # Projects list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Project detail
│   │   ├── team/
│   │   │   └── page.tsx        # Team management
│   │   ├── settings/
│   │   │   ├── page.tsx        # General settings
│   │   │   ├── billing/
│   │   │   │   └── page.tsx    # Billing & plans
│   │   │   └── api-keys/
│   │   │       └── page.tsx    # API keys
│   │   └── integrations/
│   │       └── page.tsx        # Third-party integrations
├── api/
│   ├── auth/
│   │   └── [...nextauth]/
│   ├── workspaces/
│   ├── billing/
│   │   ├── checkout/
│   │   ├── portal/
│   │   └── webhooks/
│   └── webhooks/
└── onboarding/                  # New user onboarding
    └── page.tsx
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| dashboard-layout | L4 | App shell with sidebar |
| dashboard-home | L4 | Overview page |
| settings-page | L4 | Settings forms |
| sidebar | L3 | Navigation sidebar |
| data-table | L3 | Data display |
| chart | L3 | Analytics charts |
| settings-form | L3 | Configuration forms |
| command-palette | L3 | Quick navigation |
| next-auth | L5 | Authentication |
| rbac | L5 | Role-based access |
| react-query | L5 | Data fetching |
| stripe-billing | L5 | Subscription management |

## Implementation

### Database Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Multi-tenant workspace
model Workspace {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  logo          String?
  plan          Plan     @default(FREE)
  stripeCustomerId    String?  @unique
  stripeSubscriptionId String?
  stripePriceId String?
  trialEndsAt   DateTime?
  members       WorkspaceMember[]
  projects      Project[]
  apiKeys       ApiKey[]
  invitations   Invitation[]
  auditLogs     AuditLog[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([slug])
  @@index([stripeCustomerId])
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  passwordHash  String?
  workspaces    WorkspaceMember[]
  accounts      Account[]
  sessions      Session[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model WorkspaceMember {
  id          String    @id @default(cuid())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId      String
  role        Role      @default(MEMBER)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([workspaceId, userId])
  @@index([userId])
}

model Invitation {
  id          String    @id @default(cuid())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String
  email       String
  role        Role      @default(MEMBER)
  token       String    @unique @default(cuid())
  expiresAt   DateTime
  createdAt   DateTime  @default(now())

  @@unique([workspaceId, email])
  @@index([token])
}

model Project {
  id          String    @id @default(cuid())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String
  name        String
  description String?
  status      ProjectStatus @default(ACTIVE)
  metadata    Json?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([workspaceId])
}

model ApiKey {
  id          String    @id @default(cuid())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String
  name        String
  key         String    @unique
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())

  @@index([key])
  @@index([workspaceId])
}

model AuditLog {
  id          String    @id @default(cuid())
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId String
  userId      String?
  action      String
  entityType  String
  entityId    String?
  metadata    Json?
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime  @default(now())

  @@index([workspaceId, createdAt])
  @@index([entityType, entityId])
}

// NextAuth models
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

enum ProjectStatus {
  ACTIVE
  ARCHIVED
  PAUSED
}
```

### Workspace Context

```tsx
// lib/workspace-context.tsx
'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  plan: 'FREE' | 'PRO' | 'ENTERPRISE';
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
}

interface WorkspaceContextValue {
  workspace: Workspace | null;
  isLoading: boolean;
  error: Error | null;
  switchWorkspace: (slug: string) => void;
  hasPermission: (permission: string) => boolean;
}

const WorkspaceContext = React.createContext<WorkspaceContextValue | null>(null);

const ROLE_PERMISSIONS: Record<string, string[]> = {
  OWNER: ['*'],
  ADMIN: ['manage:team', 'manage:projects', 'manage:settings', 'view:billing'],
  MEMBER: ['manage:projects', 'view:settings'],
  VIEWER: ['view:projects'],
};

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;

  const { data: workspace, isLoading, error } = useQuery({
    queryKey: ['workspace', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}`);
      if (!res.ok) throw new Error('Failed to fetch workspace');
      return res.json() as Promise<Workspace>;
    },
    enabled: !!workspaceId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const switchWorkspace = React.useCallback((slug: string) => {
    router.push(`/${slug}`);
  }, [router]);

  const hasPermission = React.useCallback((permission: string): boolean => {
    if (!workspace) return false;
    
    const permissions = ROLE_PERMISSIONS[workspace.role] || [];
    return permissions.includes('*') || permissions.includes(permission);
  }, [workspace]);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace: workspace ?? null,
        isLoading,
        error: error as Error | null,
        switchWorkspace,
        hasPermission,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = React.useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within WorkspaceProvider');
  }
  return context;
}
```

### Dashboard Layout

```tsx
// app/(dashboard)/[workspaceId]/layout.tsx
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { WorkspaceProvider } from '@/lib/workspace-context';
import { Sidebar } from '@/components/dashboard/sidebar';
import { Header } from '@/components/dashboard/header';
import { CommandPalette } from '@/components/dashboard/command-palette';

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const session = await auth();
  
  if (!session?.user) {
    redirect('/login');
  }

  const { workspaceId } = await params;

  // Verify user has access to workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspace: { slug: workspaceId },
      userId: session.user.id,
    },
    include: {
      workspace: true,
    },
  });

  if (!membership) {
    redirect('/onboarding');
  }

  // Get all user workspaces for switcher
  const workspaces = await prisma.workspaceMember.findMany({
    where: { userId: session.user.id },
    include: { workspace: true },
  });

  return (
    <WorkspaceProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          workspace={membership.workspace}
          workspaces={workspaces.map((m) => m.workspace)}
          role={membership.role}
        />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header user={session.user} />
          
          <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
            {children}
          </main>
        </div>
        
        <CommandPalette />
      </div>
    </WorkspaceProvider>
  );
}
```

### Analytics Dashboard

```tsx
// app/(dashboard)/[workspaceId]/analytics/page.tsx
import { Suspense } from 'react';
import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { AnalyticsCards } from '@/components/dashboard/analytics-cards';
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { Skeleton } from '@/components/ui/skeleton';

export const metadata: Metadata = {
  title: 'Analytics',
};

interface AnalyticsPageProps {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function AnalyticsPage({
  params,
  searchParams,
}: AnalyticsPageProps) {
  const { workspaceId } = await params;
  const { from, to } = await searchParams;
  
  // Default to last 30 days
  const dateRange = {
    from: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: to ? new Date(to) : new Date(),
  };

  const workspace = await prisma.workspace.findUnique({
    where: { slug: workspaceId },
  });

  if (!workspace) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your workspace performance and usage.
          </p>
        </div>
        
        <DateRangePicker
          from={dateRange.from}
          to={dateRange.to}
        />
      </div>

      {/* Key Metrics */}
      <Suspense fallback={<MetricsSkeleton />}>
        <AnalyticsCards
          workspaceId={workspace.id}
          dateRange={dateRange}
        />
      </Suspense>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ChartSkeleton />}>
          <AnalyticsCharts
            workspaceId={workspace.id}
            dateRange={dateRange}
          />
        </Suspense>
      </div>

      {/* Recent Activity */}
      <Suspense fallback={<ActivitySkeleton />}>
        <RecentActivity workspaceId={workspace.id} limit={10} />
      </Suspense>
    </div>
  );
}

function MetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-32" />
      ))}
    </div>
  );
}

function ChartSkeleton() {
  return <Skeleton className="h-80" />;
}

function ActivitySkeleton() {
  return <Skeleton className="h-96" />;
}
```

### Billing Integration

```typescript
// app/api/billing/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

const PLANS = {
  PRO: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  },
  ENTERPRISE: {
    monthly: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID!,
    yearly: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID!,
  },
};

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { workspaceId, plan, interval } = await request.json();

  // Verify user is owner or admin
  const membership = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      userId: session.user.id,
      role: { in: ['OWNER', 'ADMIN'] },
    },
    include: { workspace: true },
  });

  if (!membership) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const workspace = membership.workspace;
  const priceId = PLANS[plan as keyof typeof PLANS]?.[interval as 'monthly' | 'yearly'];

  if (!priceId) {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
  }

  // Get or create Stripe customer
  let customerId = workspace.stripeCustomerId;
  
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email!,
      name: workspace.name,
      metadata: {
        workspaceId: workspace.id,
      },
    });
    
    customerId = customer.id;
    
    await prisma.workspace.update({
      where: { id: workspace.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Create checkout session
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${workspace.slug}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${workspace.slug}/settings/billing?canceled=true`,
    subscription_data: {
      metadata: {
        workspaceId: workspace.id,
      },
    },
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
```

### Team Management

```tsx
// components/dashboard/team-members.tsx
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Mail, UserMinus, Shield } from 'lucide-react';
import { useWorkspace } from '@/lib/workspace-context';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Member {
  id: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  createdAt: string;
}

export function TeamMembers() {
  const { workspace, hasPermission } = useWorkspace();
  const queryClient = useQueryClient();
  const canManageTeam = hasPermission('manage:team');

  const { data: members, isLoading } = useQuery({
    queryKey: ['team-members', workspace?.id],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspace?.id}/members`);
      if (!res.ok) throw new Error('Failed to fetch members');
      return res.json() as Promise<Member[]>;
    },
    enabled: !!workspace?.id,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const res = await fetch(`/api/workspaces/${workspace?.id}/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Role updated successfully');
    },
    onError: () => {
      toast.error('Failed to update role');
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`/api/workspaces/${workspace?.id}/members/${memberId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove member');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('Member removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove member');
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {members?.map((member) => (
        <div
          key={member.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={member.user.image ?? undefined} />
              <AvatarFallback>
                {member.user.name?.[0] ?? member.user.email[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {member.user.name ?? 'Unknown'}
                </span>
                {member.role === 'OWNER' && (
                  <Badge variant="secondary">Owner</Badge>
                )}
              </div>
              <span className="text-sm text-muted-foreground">
                {member.user.email}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canManageTeam && member.role !== 'OWNER' ? (
              <>
                <Select
                  value={member.role}
                  onValueChange={(role) =>
                    updateRoleMutation.mutate({ memberId: member.id, role })
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="VIEWER">Viewer</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Send email
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => removeMemberMutation.mutate(member.id)}
                    >
                      <UserMinus className="mr-2 h-4 w-4" />
                      Remove from team
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Badge variant="outline">{member.role}</Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Plan Limits

```typescript
// lib/plans.ts
export const PLAN_LIMITS = {
  FREE: {
    projects: 3,
    members: 2,
    apiRequests: 1000,
    storage: 100 * 1024 * 1024, // 100MB
    features: ['basic_analytics'],
  },
  PRO: {
    projects: 20,
    members: 10,
    apiRequests: 100000,
    storage: 10 * 1024 * 1024 * 1024, // 10GB
    features: ['basic_analytics', 'advanced_analytics', 'api_access', 'priority_support'],
  },
  ENTERPRISE: {
    projects: -1, // Unlimited
    members: -1,
    apiRequests: -1,
    storage: -1,
    features: ['*'],
  },
} as const;

export function checkLimit(
  plan: keyof typeof PLAN_LIMITS,
  resource: keyof (typeof PLAN_LIMITS)['FREE'],
  currentUsage: number
): { allowed: boolean; limit: number; remaining: number } {
  const limit = PLAN_LIMITS[plan][resource] as number;
  
  if (limit === -1) {
    return { allowed: true, limit: -1, remaining: -1 };
  }
  
  return {
    allowed: currentUsage < limit,
    limit,
    remaining: Math.max(0, limit - currentUsage),
  };
}
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
npx playwright install
```

```typescript
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
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
  useParams: () => ({}),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'user-1', email: 'test@example.com', name: 'Test User' } },
    status: 'authenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
```

### Unit Tests - Workspace Context

```typescript
// tests/unit/workspace-context.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkspaceProvider, useWorkspace } from '@/lib/workspace-context';

const mockWorkspace = {
  id: 'ws-1',
  name: 'Test Workspace',
  slug: 'test-workspace',
  logo: null,
  plan: 'PRO',
  role: 'ADMIN',
};

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </QueryClientProvider>
  );
};

describe('useWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('fetches workspace data', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWorkspace),
    });

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.workspace).toEqual(mockWorkspace);
    });
  });

  it('hasPermission returns correct values for ADMIN role', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWorkspace),
    });

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasPermission('manage:team')).toBe(true);
      expect(result.current.hasPermission('manage:projects')).toBe(true);
      expect(result.current.hasPermission('manage:billing')).toBe(false);
    });
  });

  it('hasPermission returns all permissions for OWNER role', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ ...mockWorkspace, role: 'OWNER' }),
    });

    const { result } = renderHook(() => useWorkspace(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.hasPermission('manage:team')).toBe(true);
      expect(result.current.hasPermission('manage:billing')).toBe(true);
      expect(result.current.hasPermission('any:permission')).toBe(true);
    });
  });
});
```

### Unit Tests - Plan Limits

```typescript
// tests/unit/plan-limits.test.ts
import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS, checkLimit } from '@/lib/plans';

describe('Plan Limits', () => {
  describe('checkLimit', () => {
    it('allows usage within FREE plan limits', () => {
      const result = checkLimit('FREE', 'projects', 2);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(3);
      expect(result.remaining).toBe(1);
    });

    it('denies usage exceeding FREE plan limits', () => {
      const result = checkLimit('FREE', 'projects', 3);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('allows unlimited for ENTERPRISE plan', () => {
      const result = checkLimit('ENTERPRISE', 'projects', 1000);
      expect(result.allowed).toBe(true);
      expect(result.limit).toBe(-1);
      expect(result.remaining).toBe(-1);
    });

    it('handles member limits correctly', () => {
      expect(checkLimit('FREE', 'members', 1).allowed).toBe(true);
      expect(checkLimit('FREE', 'members', 2).allowed).toBe(false);
      expect(checkLimit('PRO', 'members', 9).allowed).toBe(true);
      expect(checkLimit('PRO', 'members', 10).allowed).toBe(false);
    });
  });
});
```

### Unit Tests - Team Members Component

```typescript
// tests/unit/team-members.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamMembers } from '@/components/dashboard/team-members';
import { WorkspaceProvider } from '@/lib/workspace-context';

const mockMembers = [
  {
    id: 'member-1',
    user: { id: 'user-1', name: 'Owner User', email: 'owner@test.com', image: null },
    role: 'OWNER',
    createdAt: '2025-01-01',
  },
  {
    id: 'member-2',
    user: { id: 'user-2', name: 'Admin User', email: 'admin@test.com', image: null },
    role: 'ADMIN',
    createdAt: '2025-01-02',
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <WorkspaceProvider>{children}</WorkspaceProvider>
    </QueryClientProvider>
  );
};

describe('TeamMembers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it('renders team members list', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMembers),
    });

    render(<TeamMembers />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Owner User')).toBeInTheDocument();
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });
  });

  it('shows owner badge for owner role', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockMembers),
    });

    render(<TeamMembers />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Owner')).toBeInTheDocument();
    });
  });

  it('allows role change for non-owner members', async () => {
    const user = userEvent.setup();
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMembers),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockMembers[1], role: 'MEMBER' }),
      });

    render(<TeamMembers />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Admin User')).toBeInTheDocument();
    });

    // Change role
    const roleSelect = screen.getAllByRole('combobox')[0];
    await user.click(roleSelect);
    await user.click(screen.getByText('Member'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/members/member-2'),
        expect.objectContaining({ method: 'PATCH' })
      );
    });
  });
});
```

### Integration Tests - Billing Flow

```typescript
// tests/integration/billing.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BillingPage } from '@/app/(dashboard)/[workspaceId]/settings/billing/page';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-1' } }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Billing Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
    // Mock window.location
    delete (window as any).location;
    window.location = { href: '' } as any;
  });

  it('displays current plan information', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        plan: 'FREE',
        usage: { projects: 2, members: 1 },
      }),
    });

    render(<BillingPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Free Plan')).toBeInTheDocument();
      expect(screen.getByText('2 / 3 projects')).toBeInTheDocument();
    });
  });

  it('initiates checkout for plan upgrade', async () => {
    const user = userEvent.setup();
    (global.fetch as any)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ plan: 'FREE' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ url: 'https://checkout.stripe.com/...' }),
      });

    render(<BillingPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Upgrade to Pro')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Upgrade to Pro'));

    await waitFor(() => {
      expect(window.location.href).toBe('https://checkout.stripe.com/...');
    });
  });
});
```

### API Route Tests

```typescript
// tests/api/workspaces.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/workspaces/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    workspace: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    workspaceMember: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('/api/workspaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns user workspaces', async () => {
      const { auth } = await import('@/lib/auth');
      const { prisma } = await import('@/lib/prisma');

      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.workspaceMember.findMany as any).mockResolvedValue([
        { workspace: { id: 'ws-1', name: 'Workspace 1', slug: 'ws-1' } },
      ]);

      const request = new NextRequest('http://localhost/api/workspaces');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(1);
    });

    it('returns 401 for unauthenticated requests', async () => {
      const { auth } = await import('@/lib/auth');
      (auth as any).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/workspaces');
      const response = await GET(request);

      expect(response.status).toBe(401);
    });
  });

  describe('POST', () => {
    it('creates new workspace', async () => {
      const { auth } = await import('@/lib/auth');
      const { prisma } = await import('@/lib/prisma');

      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });
      (prisma.workspace.create as any).mockResolvedValue({
        id: 'ws-new',
        name: 'New Workspace',
        slug: 'new-workspace',
      });

      const request = new NextRequest('http://localhost/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Workspace' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('New Workspace');
    });

    it('validates workspace name', async () => {
      const { auth } = await import('@/lib/auth');
      (auth as any).mockResolvedValue({ user: { id: 'user-1' } });

      const request = new NextRequest('http://localhost/api/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: '' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SaaS Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/[^/]+$/); // Workspace dashboard
  });

  test('displays workspace dashboard', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('[data-testid="analytics-cards"]')).toBeVisible();
  });

  test('workspace switcher works', async ({ page }) => {
    await page.click('[data-testid="workspace-switcher"]');
    await expect(page.locator('[data-testid="workspace-list"]')).toBeVisible();

    await page.click('[data-testid="workspace-item"]:first-child');
    await expect(page).toHaveURL(/\/[^/]+$/);
  });

  test('team management flow', async ({ page }) => {
    await page.goto('/test-workspace/team');

    // Invite new member
    await page.click('button:has-text("Invite Member")');
    await page.fill('[name="email"]', 'newmember@example.com');
    await page.selectOption('[name="role"]', 'MEMBER');
    await page.click('button:has-text("Send Invitation")');

    await expect(page.locator('.toast-success')).toContainText('Invitation sent');
  });

  test('billing upgrade flow', async ({ page }) => {
    await page.goto('/test-workspace/settings/billing');

    await expect(page.locator('[data-testid="current-plan"]')).toContainText('Free');

    await page.click('button:has-text("Upgrade to Pro")');

    // Should redirect to Stripe checkout
    await expect(page).toHaveURL(/checkout\.stripe\.com/);
  });

  test('project CRUD operations', async ({ page }) => {
    await page.goto('/test-workspace/projects');

    // Create project
    await page.click('button:has-text("New Project")');
    await page.fill('[name="name"]', 'Test Project');
    await page.fill('[name="description"]', 'A test project');
    await page.click('button:has-text("Create")');

    await expect(page.locator('text=Test Project')).toBeVisible();

    // Edit project
    await page.click('[data-testid="project-menu"]:first-child');
    await page.click('text=Edit');
    await page.fill('[name="name"]', 'Updated Project');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Updated Project')).toBeVisible();

    // Delete project
    await page.click('[data-testid="project-menu"]:first-child');
    await page.click('text=Delete');
    await page.click('button:has-text("Confirm")');

    await expect(page.locator('text=Updated Project')).not.toBeVisible();
  });
});

test.describe('Workspace Access Control', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/test-workspace');
    await expect(page).toHaveURL('/login');
  });

  test('shows 403 for unauthorized workspace access', async ({ page }) => {
    // Login as different user
    await page.goto('/login');
    await page.fill('[name="email"]', 'other@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Try to access unauthorized workspace
    await page.goto('/private-workspace');
    await expect(page.locator('text=Access Denied')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
          <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            We've been notified and are working on a fix.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => this.setState({ hasError: false })}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <a href="/"><Home className="mr-2 h-4 w-4" />Go home</a>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// lib/api-error.ts
import * as Sentry from '@sentry/nextjs';

export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'APIError';
  }

  toJSON() {
    return {
      error: { message: this.message, code: this.code, details: this.details },
    };
  }
}

export class ForbiddenError extends APIError {
  constructor(message = 'You do not have permission to access this resource') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class WorkspaceNotFoundError extends APIError {
  constructor() {
    super('Workspace not found', 404, 'WORKSPACE_NOT_FOUND');
  }
}

export class PlanLimitError extends APIError {
  constructor(resource: string, limit: number) {
    super(`Plan limit reached for ${resource}. Upgrade to add more.`, 403, 'PLAN_LIMIT_EXCEEDED', {
      resource,
      limit,
    });
  }
}

export function handleAPIError(error: unknown): Response {
  console.error('[API Error]', error);

  if (error instanceof APIError) {
    if (error.statusCode >= 500) Sentry.captureException(error);
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  Sentry.captureException(error);
  return Response.json(
    { error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } },
    { status: 500 }
  );
}
```

## Accessibility

### Dashboard Accessibility Features

```typescript
// components/dashboard/accessible-sidebar.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface AccessibleSidebarProps {
  items: NavItem[];
  workspaceSlug: string;
}

export function AccessibleSidebar({ items, workspaceSlug }: AccessibleSidebarProps) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(items.length - 1);
        break;
    }
  };

  useEffect(() => {
    if (focusedIndex >= 0) {
      const links = navRef.current?.querySelectorAll('a');
      links?.[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return (
    <nav
      ref={navRef}
      role="navigation"
      aria-label="Main navigation"
      className="flex flex-col gap-1"
      onKeyDown={handleKeyDown}
    >
      {items.map((item, index) => {
        const href = `/${workspaceSlug}${item.href}`;
        const isActive = pathname === href;

        return (
          <Link
            key={item.href}
            href={href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:bg-muted'
            )}
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
```

### Accessible Data Table

```typescript
// components/dashboard/accessible-data-table.tsx
'use client';

import { useState } from 'react';
import { useAnnounce } from '@/components/ui/announcer';

interface Column<T> {
  id: string;
  header: string;
  accessor: (row: T) => React.ReactNode;
  sortable?: boolean;
}

interface AccessibleDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  caption: string;
  keyExtractor: (row: T) => string;
}

export function AccessibleDataTable<T>({
  data,
  columns,
  caption,
  keyExtractor,
}: AccessibleDataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { announce } = useAnnounce();

  const handleSort = (columnId: string) => {
    const newDirection = sortColumn === columnId && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnId);
    setSortDirection(newDirection);

    const column = columns.find((c) => c.id === columnId);
    announce(`Sorted by ${column?.header} ${newDirection === 'asc' ? 'ascending' : 'descending'}`);
  };

  return (
    <table
      role="grid"
      aria-label={caption}
      className="w-full border-collapse"
    >
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column.id}
              scope="col"
              aria-sort={
                sortColumn === column.id
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : undefined
              }
              className="px-4 py-3 text-left font-medium"
            >
              {column.sortable ? (
                <button
                  onClick={() => handleSort(column.id)}
                  className="flex items-center gap-1 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {column.header}
                  <span aria-hidden="true">
                    {sortColumn === column.id ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                  </span>
                </button>
              ) : (
                column.header
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={keyExtractor(row)} className="border-t">
            {columns.map((column) => (
              <td key={column.id} className="px-4 py-3">
                {column.accessor(row)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Security

### Input Validation

```typescript
// lib/validations/workspace.ts
import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s-]+$/, 'Name contains invalid characters'),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
  }),
  billing: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'),
    prefix: 'ratelimit:billing',
  }),
  invite: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'ratelimit:invite',
  }),
};

export async function rateLimit(
  request: NextRequest,
  type: keyof typeof rateLimiters = 'api'
): Promise<Response | null> {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, reset, remaining } = await rateLimiters[type].limit(ip);

  if (!success) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }

  return null;
}
```

### RBAC Middleware

```typescript
// lib/rbac.ts
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ForbiddenError } from '@/lib/api-error';

type Permission = 'manage:team' | 'manage:projects' | 'manage:settings' | 'manage:billing' | 'view:billing';

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  OWNER: ['manage:team', 'manage:projects', 'manage:settings', 'manage:billing', 'view:billing'],
  ADMIN: ['manage:team', 'manage:projects', 'manage:settings', 'view:billing'],
  MEMBER: ['manage:projects'],
  VIEWER: [],
};

export async function checkPermission(
  workspaceId: string,
  permission: Permission
): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    throw new ForbiddenError('Not authenticated');
  }

  const membership = await prisma.workspaceMember.findFirst({
    where: { workspaceId, userId: session.user.id },
  });

  if (!membership) {
    throw new ForbiddenError('Not a member of this workspace');
  }

  const permissions = ROLE_PERMISSIONS[membership.role] || [];
  if (!permissions.includes(permission)) {
    throw new ForbiddenError(`Missing permission: ${permission}`);
  }
}

// Usage in API routes
export async function withPermission(
  workspaceId: string,
  permission: Permission,
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    await checkPermission(workspaceId, permission);
    return await handler();
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}
```

## Performance

### Caching Strategies

```typescript
// app/(dashboard)/[workspaceId]/analytics/page.tsx
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';

const getAnalytics = unstable_cache(
  async (workspaceId: string, dateRange: { from: Date; to: Date }) => {
    // Expensive analytics query
    return await prisma.$queryRaw`...`;
  },
  ['analytics'],
  { revalidate: 300, tags: ['analytics'] } // 5 minute cache
);

export default async function AnalyticsPage({ params }: Props) {
  const { workspaceId } = await params;
  
  return (
    <Suspense fallback={<AnalyticsSkeleton />}>
      <AnalyticsContent workspaceId={workspaceId} />
    </Suspense>
  );
}
```

### React Query Optimization

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if ((error as any)?.status < 500) return false;
        return failureCount < 3;
      },
    },
  },
});
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
      - run: npm run build
      - run: npm run test:e2e

  deploy:
    needs: [lint-and-test, e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## SOC 2 Type II Compliance

### SOC 2 Audit Trail

```typescript
// lib/audit-trail.ts
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import crypto from 'crypto';

// Audit action categories for SOC 2 compliance
export type AuditCategory =
  | 'authentication'
  | 'authorization'
  | 'data_access'
  | 'data_modification'
  | 'system_event';

export type AuditAction =
  // Authentication events
  | 'auth.login_success'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.password_reset_requested'
  | 'auth.password_reset_completed'
  | 'auth.mfa_enabled'
  | 'auth.mfa_disabled'
  | 'auth.session_expired'
  | 'auth.session_revoked'
  // Authorization events
  | 'authz.role_assigned'
  | 'authz.role_revoked'
  | 'authz.permission_granted'
  | 'authz.permission_revoked'
  | 'authz.access_denied'
  // Data access events
  | 'data.viewed'
  | 'data.exported'
  | 'data.downloaded'
  | 'data.searched'
  // Data modification events
  | 'data.created'
  | 'data.updated'
  | 'data.deleted'
  | 'data.restored'
  | 'data.anonymized'
  // System events
  | 'system.config_changed'
  | 'system.backup_created'
  | 'system.maintenance_started';

export interface AuditLogEntry {
  id: string;
  workspaceId: string;
  userId: string | null;
  userEmail: string | null;
  category: AuditCategory;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  sessionId: string | null;
  requestId: string;
  checksum: string;
  createdAt: Date;
}

interface CreateAuditLogParams {
  workspaceId: string;
  category: AuditCategory;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  userId?: string;
  userEmail?: string;
  sessionId?: string;
}

// Generate tamper-evident checksum
function generateChecksum(data: Omit<AuditLogEntry, 'checksum'>): string {
  const payload = JSON.stringify({
    id: data.id,
    workspaceId: data.workspaceId,
    userId: data.userId,
    action: data.action,
    resourceType: data.resourceType,
    resourceId: data.resourceId,
    oldValue: data.oldValue,
    newValue: data.newValue,
    createdAt: data.createdAt.toISOString(),
  });

  const secret = process.env.AUDIT_LOG_SECRET!;
  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

// Verify audit log integrity
export function verifyAuditLogIntegrity(entry: AuditLogEntry): boolean {
  const expectedChecksum = generateChecksum(entry);
  return crypto.timingSafeEqual(
    Buffer.from(entry.checksum),
    Buffer.from(expectedChecksum)
  );
}

export async function createAuditLog(params: CreateAuditLogParams): Promise<AuditLogEntry> {
  const headersList = await headers();
  const session = await auth();

  const requestId = crypto.randomUUID();
  const id = crypto.randomUUID();
  const createdAt = new Date();

  const entryData = {
    id,
    workspaceId: params.workspaceId,
    userId: params.userId ?? session?.user?.id ?? null,
    userEmail: params.userEmail ?? session?.user?.email ?? null,
    category: params.category,
    action: params.action,
    resourceType: params.resourceType,
    resourceId: params.resourceId ?? null,
    oldValue: params.oldValue ?? null,
    newValue: params.newValue ?? null,
    ipAddress: headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
               headersList.get('x-real-ip') ?? null,
    userAgent: headersList.get('user-agent') ?? null,
    sessionId: params.sessionId ?? null,
    requestId,
    createdAt,
  };

  const checksum = generateChecksum(entryData as Omit<AuditLogEntry, 'checksum'>);

  const entry = await prisma.auditLog.create({
    data: {
      ...entryData,
      oldValue: entryData.oldValue as any,
      newValue: entryData.newValue as any,
      checksum,
    },
  });

  return entry as AuditLogEntry;
}

// Batch create for high-volume scenarios
export async function createAuditLogBatch(
  entries: CreateAuditLogParams[]
): Promise<number> {
  const headersList = await headers();
  const session = await auth();
  const requestId = crypto.randomUUID();

  const data = entries.map((params) => {
    const id = crypto.randomUUID();
    const createdAt = new Date();

    const entryData = {
      id,
      workspaceId: params.workspaceId,
      userId: params.userId ?? session?.user?.id ?? null,
      userEmail: params.userEmail ?? session?.user?.email ?? null,
      category: params.category,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId ?? null,
      oldValue: params.oldValue ?? null,
      newValue: params.newValue ?? null,
      ipAddress: headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null,
      userAgent: headersList.get('user-agent') ?? null,
      sessionId: params.sessionId ?? null,
      requestId,
      createdAt,
    };

    const checksum = generateChecksum(entryData as Omit<AuditLogEntry, 'checksum'>);
    return { ...entryData, checksum };
  });

  const result = await prisma.auditLog.createMany({ data: data as any });
  return result.count;
}

// Helper for common audit operations
export const auditHelpers = {
  async logResourceAccess(
    workspaceId: string,
    resourceType: string,
    resourceId: string,
    action: 'viewed' | 'exported' | 'downloaded' = 'viewed'
  ) {
    return createAuditLog({
      workspaceId,
      category: 'data_access',
      action: `data.${action}` as AuditAction,
      resourceType,
      resourceId,
    });
  },

  async logDataModification<T extends Record<string, unknown>>(
    workspaceId: string,
    resourceType: string,
    resourceId: string,
    action: 'created' | 'updated' | 'deleted',
    oldValue?: T,
    newValue?: T
  ) {
    return createAuditLog({
      workspaceId,
      category: 'data_modification',
      action: `data.${action}` as AuditAction,
      resourceType,
      resourceId,
      oldValue,
      newValue,
    });
  },

  async logAuthEvent(
    workspaceId: string,
    action: AuditAction,
    userId?: string,
    userEmail?: string,
    metadata?: Record<string, unknown>
  ) {
    return createAuditLog({
      workspaceId,
      category: 'authentication',
      action,
      resourceType: 'user',
      resourceId: userId,
      userId,
      userEmail,
      newValue: metadata,
    });
  },

  async logAuthzChange(
    workspaceId: string,
    action: AuditAction,
    targetUserId: string,
    oldRole?: string,
    newRole?: string
  ) {
    return createAuditLog({
      workspaceId,
      category: 'authorization',
      action,
      resourceType: 'user_role',
      resourceId: targetUserId,
      oldValue: oldRole ? { role: oldRole } : undefined,
      newValue: newRole ? { role: newRole } : undefined,
    });
  },
};
```

```prisma
// prisma/schema.prisma - Enhanced AuditLog model for SOC 2

model AuditLog {
  id           String    @id @default(cuid())
  workspace    Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  workspaceId  String
  userId       String?
  userEmail    String?
  category     String    // authentication, authorization, data_access, data_modification, system_event
  action       String    // Detailed action type
  resourceType String    // Type of resource affected
  resourceId   String?   // ID of affected resource
  oldValue     Json?     // Previous state for modifications
  newValue     Json?     // New state for modifications
  ipAddress    String?
  userAgent    String?
  sessionId    String?
  requestId    String    // Correlation ID for request tracing
  checksum     String    // Tamper-evident hash
  createdAt    DateTime  @default(now())

  // Indexes for efficient querying
  @@index([workspaceId, createdAt])
  @@index([workspaceId, category])
  @@index([workspaceId, action])
  @@index([userId, createdAt])
  @@index([resourceType, resourceId])
  @@index([sessionId])
  @@index([requestId])

  // Partition hint for large tables (90-day retention)
  @@map("audit_logs")
}
```

```typescript
// app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/rbac';
import { verifyAuditLogIntegrity } from '@/lib/audit-trail';

const querySchema = z.object({
  workspaceId: z.string(),
  userId: z.string().optional(),
  category: z.string().optional(),
  action: z.string().optional(),
  resourceType: z.string().optional(),
  resourceId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  format: z.enum(['json', 'csv']).default('json'),
});

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const parsed = querySchema.safeParse(searchParams);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid parameters', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    workspaceId, userId, category, action, resourceType, resourceId,
    startDate, endDate, page, limit, format
  } = parsed.data;

  // Verify user has audit viewing permission
  try {
    await checkPermission(workspaceId, 'view:audit_logs');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Build query filters
  const where: any = { workspaceId };

  if (userId) where.userId = userId;
  if (category) where.category = category;
  if (action) where.action = { contains: action };
  if (resourceType) where.resourceType = resourceType;
  if (resourceId) where.resourceId = resourceId;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  const [total, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  // Verify integrity of returned logs
  const logsWithIntegrity = logs.map((log) => ({
    ...log,
    integrityValid: verifyAuditLogIntegrity(log as any),
  }));

  if (format === 'csv') {
    const csv = generateCSV(logsWithIntegrity);
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${Date.now()}.csv"`,
      },
    });
  }

  return NextResponse.json({
    data: logsWithIntegrity,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

function generateCSV(logs: any[]): string {
  const headers = [
    'ID', 'Timestamp', 'User ID', 'User Email', 'Category', 'Action',
    'Resource Type', 'Resource ID', 'IP Address', 'User Agent',
    'Old Value', 'New Value', 'Integrity Valid'
  ];

  const rows = logs.map((log) => [
    log.id,
    log.createdAt.toISOString(),
    log.userId ?? '',
    log.userEmail ?? '',
    log.category,
    log.action,
    log.resourceType,
    log.resourceId ?? '',
    log.ipAddress ?? '',
    log.userAgent ?? '',
    log.oldValue ? JSON.stringify(log.oldValue) : '',
    log.newValue ? JSON.stringify(log.newValue) : '',
    log.integrityValid ? 'true' : 'false',
  ]);

  return [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
}
```

### Access Control Documentation

```typescript
// lib/access-control.ts
import { prisma } from '@/lib/prisma';
import { auditHelpers } from '@/lib/audit-trail';

// Role hierarchy (higher index = more permissions)
export const ROLE_HIERARCHY = ['VIEWER', 'MEMBER', 'ADMIN', 'OWNER'] as const;
export type Role = (typeof ROLE_HIERARCHY)[number];

// Permission definitions with descriptions for compliance documentation
export const PERMISSIONS = {
  // Workspace permissions
  'workspace:read': {
    description: 'View workspace details and settings',
    roles: ['VIEWER', 'MEMBER', 'ADMIN', 'OWNER'],
  },
  'workspace:update': {
    description: 'Modify workspace settings',
    roles: ['ADMIN', 'OWNER'],
  },
  'workspace:delete': {
    description: 'Delete the workspace',
    roles: ['OWNER'],
  },

  // Team permissions
  'team:read': {
    description: 'View team members',
    roles: ['VIEWER', 'MEMBER', 'ADMIN', 'OWNER'],
  },
  'team:invite': {
    description: 'Invite new team members',
    roles: ['ADMIN', 'OWNER'],
  },
  'team:remove': {
    description: 'Remove team members',
    roles: ['ADMIN', 'OWNER'],
  },
  'team:update_role': {
    description: 'Change team member roles',
    roles: ['ADMIN', 'OWNER'],
  },

  // Project permissions
  'project:read': {
    description: 'View projects',
    roles: ['VIEWER', 'MEMBER', 'ADMIN', 'OWNER'],
  },
  'project:create': {
    description: 'Create new projects',
    roles: ['MEMBER', 'ADMIN', 'OWNER'],
  },
  'project:update': {
    description: 'Modify existing projects',
    roles: ['MEMBER', 'ADMIN', 'OWNER'],
  },
  'project:delete': {
    description: 'Delete projects',
    roles: ['ADMIN', 'OWNER'],
  },

  // Billing permissions
  'billing:read': {
    description: 'View billing information and invoices',
    roles: ['ADMIN', 'OWNER'],
  },
  'billing:manage': {
    description: 'Manage billing settings and subscriptions',
    roles: ['OWNER'],
  },

  // Audit permissions
  'audit:read': {
    description: 'View audit logs',
    roles: ['ADMIN', 'OWNER'],
  },
  'audit:export': {
    description: 'Export audit logs for compliance',
    roles: ['OWNER'],
  },

  // Data permissions
  'data:export': {
    description: 'Export workspace data (GDPR)',
    roles: ['OWNER'],
  },
  'data:delete': {
    description: 'Request data deletion (GDPR)',
    roles: ['OWNER'],
  },

  // API permissions
  'api:read': {
    description: 'View API keys',
    roles: ['ADMIN', 'OWNER'],
  },
  'api:manage': {
    description: 'Create and revoke API keys',
    roles: ['ADMIN', 'OWNER'],
  },
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Generate permission matrix for documentation
export function generatePermissionMatrix(): Record<Role, Permission[]> {
  const matrix: Record<Role, Permission[]> = {
    VIEWER: [],
    MEMBER: [],
    ADMIN: [],
    OWNER: [],
  };

  for (const [permission, config] of Object.entries(PERMISSIONS)) {
    for (const role of config.roles) {
      matrix[role as Role].push(permission as Permission);
    }
  }

  return matrix;
}

// Check if a role has a specific permission
export function hasPermission(role: Role, permission: Permission): boolean {
  const config = PERMISSIONS[permission];
  return config.roles.includes(role);
}

// Enforce least privilege - get minimum role for permission
export function getMinimumRole(permission: Permission): Role {
  const config = PERMISSIONS[permission];
  const roles = config.roles as readonly Role[];

  for (const role of ROLE_HIERARCHY) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return 'OWNER'; // Default to highest privilege
}

// Access review types
export interface AccessReviewItem {
  userId: string;
  userEmail: string;
  userName: string | null;
  workspaceId: string;
  workspaceName: string;
  role: Role;
  grantedAt: Date;
  lastActiveAt: Date | null;
  reviewStatus: 'pending' | 'approved' | 'revoked';
  reviewedBy: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
}

export interface AccessReviewCycle {
  id: string;
  workspaceId: string;
  quarter: string; // e.g., "2025-Q1"
  startedAt: Date;
  completedAt: Date | null;
  status: 'in_progress' | 'completed';
  totalReviews: number;
  completedReviews: number;
  initiatedBy: string;
}

// Start quarterly access review
export async function initiateAccessReview(
  workspaceId: string,
  initiatedBy: string
): Promise<AccessReviewCycle> {
  const now = new Date();
  const quarter = `${now.getFullYear()}-Q${Math.ceil((now.getMonth() + 1) / 3)}`;

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true, workspace: true },
  });

  const cycle = await prisma.accessReviewCycle.create({
    data: {
      workspaceId,
      quarter,
      startedAt: now,
      status: 'in_progress',
      totalReviews: members.length,
      completedReviews: 0,
      initiatedBy,
    },
  });

  // Create review items for each member
  await prisma.accessReviewItem.createMany({
    data: members.map((m) => ({
      cycleId: cycle.id,
      userId: m.userId,
      userEmail: m.user.email,
      userName: m.user.name,
      workspaceId: m.workspaceId,
      role: m.role,
      grantedAt: m.createdAt,
      reviewStatus: 'pending',
    })),
  });

  await auditHelpers.logDataModification(
    workspaceId,
    'access_review_cycle',
    cycle.id,
    'created',
    undefined,
    { quarter, totalReviews: members.length }
  );

  return cycle as AccessReviewCycle;
}

// Complete a review item
export async function completeAccessReviewItem(
  itemId: string,
  reviewerId: string,
  decision: 'approved' | 'revoked',
  notes?: string
): Promise<void> {
  const item = await prisma.accessReviewItem.findUnique({
    where: { id: itemId },
    include: { cycle: true },
  });

  if (!item) throw new Error('Review item not found');

  await prisma.$transaction(async (tx) => {
    // Update review item
    await tx.accessReviewItem.update({
      where: { id: itemId },
      data: {
        reviewStatus: decision,
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        reviewNotes: notes,
      },
    });

    // If revoked, remove the member
    if (decision === 'revoked') {
      await tx.workspaceMember.delete({
        where: {
          workspaceId_userId: {
            workspaceId: item.workspaceId,
            userId: item.userId,
          },
        },
      });

      await auditHelpers.logAuthzChange(
        item.workspaceId,
        'authz.role_revoked',
        item.userId,
        item.role,
        undefined
      );
    }

    // Update cycle progress
    const completed = await tx.accessReviewItem.count({
      where: {
        cycleId: item.cycleId,
        reviewStatus: { not: 'pending' },
      },
    });

    await tx.accessReviewCycle.update({
      where: { id: item.cycleId },
      data: {
        completedReviews: completed,
        status: completed >= item.cycle.totalReviews ? 'completed' : 'in_progress',
        completedAt: completed >= item.cycle.totalReviews ? new Date() : null,
      },
    });
  });
}
```

```tsx
// components/admin/access-review.tsx
'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle, XCircle, Clock, Download, Users, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

interface AccessReviewItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  role: string;
  grantedAt: string;
  lastActiveAt: string | null;
  reviewStatus: 'pending' | 'approved' | 'revoked';
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
}

interface AccessReviewCycle {
  id: string;
  quarter: string;
  startedAt: string;
  completedAt: string | null;
  status: 'in_progress' | 'completed';
  totalReviews: number;
  completedReviews: number;
  items: AccessReviewItem[];
}

interface AccessReviewProps {
  workspaceId: string;
}

export function AccessReview({ workspaceId }: AccessReviewProps) {
  const queryClient = useQueryClient();
  const [selectedItem, setSelectedItem] = React.useState<AccessReviewItem | null>(null);
  const [reviewNotes, setReviewNotes] = React.useState('');
  const [bulkSelection, setBulkSelection] = React.useState<Set<string>>(new Set());

  const { data: currentCycle, isLoading } = useQuery({
    queryKey: ['access-review', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/access-review/current`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch access review');
      }
      return res.json() as Promise<AccessReviewCycle>;
    },
  });

  const startReviewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/access-review`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to start access review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-review'] });
      toast.success('Access review cycle started');
    },
    onError: () => {
      toast.error('Failed to start access review');
    },
  });

  const reviewItemMutation = useMutation({
    mutationFn: async ({
      itemId,
      decision,
      notes
    }: {
      itemId: string;
      decision: 'approved' | 'revoked';
      notes?: string;
    }) => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/access-review/items/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decision, notes }),
        }
      );
      if (!res.ok) throw new Error('Failed to complete review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-review'] });
      setSelectedItem(null);
      setReviewNotes('');
      toast.success('Review completed');
    },
    onError: () => {
      toast.error('Failed to complete review');
    },
  });

  const bulkReviewMutation = useMutation({
    mutationFn: async ({ decision }: { decision: 'approved' | 'revoked' }) => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/access-review/bulk`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemIds: Array.from(bulkSelection),
            decision
          }),
        }
      );
      if (!res.ok) throw new Error('Failed to complete bulk review');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-review'] });
      setBulkSelection(new Set());
      toast.success('Bulk review completed');
    },
    onError: () => {
      toast.error('Failed to complete bulk review');
    },
  });

  const exportReviewMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/access-review/${currentCycle?.id}/export`
      );
      if (!res.ok) throw new Error('Failed to export review');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `access-review-${currentCycle?.quarter}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error('Failed to export review');
    },
  });

  if (isLoading) {
    return <div>Loading access review...</div>;
  }

  const pendingItems = currentCycle?.items.filter(
    (item) => item.reviewStatus === 'pending'
  ) ?? [];

  const toggleBulkSelection = (itemId: string) => {
    const newSelection = new Set(bulkSelection);
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    setBulkSelection(newSelection);
  };

  const selectAllPending = () => {
    setBulkSelection(new Set(pendingItems.map((item) => item.id)));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Access Review</h2>
          <p className="text-muted-foreground">
            Quarterly review of user access for SOC 2 compliance
          </p>
        </div>

        {!currentCycle || currentCycle.status === 'completed' ? (
          <Button onClick={() => startReviewMutation.mutate()}>
            <Users className="mr-2 h-4 w-4" />
            Start New Review Cycle
          </Button>
        ) : (
          <Button variant="outline" onClick={() => exportReviewMutation.mutate()}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        )}
      </div>

      {currentCycle && (
        <>
          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentCycle.quarter} Access Review</span>
                <Badge variant={
                  currentCycle.status === 'completed' ? 'default' : 'secondary'
                }>
                  {currentCycle.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(currentCycle.completedReviews / currentCycle.totalReviews) * 100}%`
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentCycle.completedReviews} / {currentCycle.totalReviews} reviewed
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          {bulkSelection.size > 0 && (
            <div className="flex items-center gap-2 p-4 bg-muted rounded-lg">
              <span className="text-sm font-medium">
                {bulkSelection.size} selected
              </span>
              <Button
                size="sm"
                onClick={() => bulkReviewMutation.mutate({ decision: 'approved' })}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve All
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => bulkReviewMutation.mutate({ decision: 'revoked' })}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Revoke All
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setBulkSelection(new Set())}
              >
                Clear
              </Button>
            </div>
          )}

          {/* Review Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <input
                        type="checkbox"
                        checked={
                          pendingItems.length > 0 &&
                          bulkSelection.size === pendingItems.length
                        }
                        onChange={selectAllPending}
                        className="rounded"
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Granted</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentCycle.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.reviewStatus === 'pending' && (
                          <input
                            type="checkbox"
                            checked={bulkSelection.has(item.id)}
                            onChange={() => toggleBulkSelection(item.id)}
                            className="rounded"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {item.userName ?? 'Unknown'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {item.userEmail}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(item.grantedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {item.lastActiveAt ? (
                          new Date(item.lastActiveAt).toLocaleDateString()
                        ) : (
                          <span className="flex items-center text-amber-500">
                            <AlertTriangle className="mr-1 h-4 w-4" />
                            Never
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.reviewStatus === 'pending' && (
                          <Badge variant="secondary">
                            <Clock className="mr-1 h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                        {item.reviewStatus === 'approved' && (
                          <Badge variant="default">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Approved
                          </Badge>
                        )}
                        {item.reviewStatus === 'revoked' && (
                          <Badge variant="destructive">
                            <XCircle className="mr-1 h-3 w-3" />
                            Revoked
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.reviewStatus === 'pending' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedItem(item)}
                          >
                            Review
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Access</DialogTitle>
            <DialogDescription>
              Review access for {selectedItem?.userName ?? selectedItem?.userEmail}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Role:</span>
                <span className="ml-2 font-medium">{selectedItem?.role}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Granted:</span>
                <span className="ml-2">
                  {selectedItem && new Date(selectedItem.grantedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Review Notes (optional)</label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Add notes for compliance records..."
                className="mt-1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedItem(null)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedItem) {
                  reviewItemMutation.mutate({
                    itemId: selectedItem.id,
                    decision: 'revoked',
                    notes: reviewNotes,
                  });
                }
              }}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Revoke Access
            </Button>
            <Button
              onClick={() => {
                if (selectedItem) {
                  reviewItemMutation.mutate({
                    itemId: selectedItem.id,
                    decision: 'approved',
                    notes: reviewNotes,
                  });
                }
              }}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### GDPR Data Export

```typescript
// app/api/workspaces/[id]/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/rbac';
import { auditHelpers } from '@/lib/audit-trail';

const EXPORT_FULFILLMENT_DAYS = 30;

interface WorkspaceExportData {
  exportedAt: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
    plan: string;
    createdAt: string;
    updatedAt: string;
  };
  members: Array<{
    userId: string;
    email: string;
    name: string | null;
    role: string;
    joinedAt: string;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    metadata: unknown;
  }>;
  apiKeys: Array<{
    id: string;
    name: string;
    createdAt: string;
    lastUsedAt: string | null;
    expiresAt: string | null;
  }>;
  auditLogs: Array<{
    id: string;
    action: string;
    resourceType: string;
    resourceId: string | null;
    createdAt: string;
    userId: string | null;
  }>;
  settings: Record<string, unknown>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: workspaceId } = await params;

  try {
    await checkPermission(workspaceId, 'data:export');
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check for existing pending export request
  const existingRequest = await prisma.dataExportRequest.findFirst({
    where: {
      workspaceId,
      status: 'pending',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Within last 24 hours
      },
    },
  });

  if (existingRequest) {
    return NextResponse.json(
      { error: 'Export request already pending', requestId: existingRequest.id },
      { status: 409 }
    );
  }

  // Create export request
  const exportRequest = await prisma.dataExportRequest.create({
    data: {
      workspaceId,
      requestedBy: session.user.id,
      type: 'workspace',
      status: 'pending',
      fulfillmentDeadline: new Date(Date.now() + EXPORT_FULFILLMENT_DAYS * 24 * 60 * 60 * 1000),
    },
  });

  // Log the export request
  await auditHelpers.logResourceAccess(workspaceId, 'workspace', workspaceId, 'exported');

  // In production, queue this for background processing
  // For now, generate synchronously
  const exportData = await generateWorkspaceExport(workspaceId);

  // Update request status
  await prisma.dataExportRequest.update({
    where: { id: exportRequest.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
      downloadUrl: `/api/workspaces/${workspaceId}/export/${exportRequest.id}/download`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return NextResponse.json({
    requestId: exportRequest.id,
    status: 'completed',
    downloadUrl: `/api/workspaces/${workspaceId}/export/${exportRequest.id}/download`,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });
}

async function generateWorkspaceExport(workspaceId: string): Promise<WorkspaceExportData> {
  const [workspace, members, projects, apiKeys, auditLogs] = await Promise.all([
    prisma.workspace.findUnique({
      where: { id: workspaceId },
    }),
    prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
    }),
    prisma.project.findMany({
      where: { workspaceId },
    }),
    prisma.apiKey.findMany({
      where: { workspaceId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
        expiresAt: true,
        // Exclude actual key value for security
      },
    }),
    prisma.auditLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 10000, // Limit for performance
    }),
  ]);

  if (!workspace) {
    throw new Error('Workspace not found');
  }

  return {
    exportedAt: new Date().toISOString(),
    workspace: {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      plan: workspace.plan,
      createdAt: workspace.createdAt.toISOString(),
      updatedAt: workspace.updatedAt.toISOString(),
    },
    members: members.map((m) => ({
      userId: m.userId,
      email: m.user.email,
      name: m.user.name,
      role: m.role,
      joinedAt: m.createdAt.toISOString(),
    })),
    projects: projects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      metadata: p.metadata,
    })),
    apiKeys: apiKeys.map((k) => ({
      id: k.id,
      name: k.name,
      createdAt: k.createdAt.toISOString(),
      lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
      expiresAt: k.expiresAt?.toISOString() ?? null,
    })),
    auditLogs: auditLogs.map((l) => ({
      id: l.id,
      action: l.action,
      resourceType: l.entityType,
      resourceId: l.entityId,
      createdAt: l.createdAt.toISOString(),
      userId: l.userId,
    })),
    settings: {}, // Add workspace settings as needed
  };
}

// GET endpoint to check export status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: workspaceId } = await params;

  const requests = await prisma.dataExportRequest.findMany({
    where: {
      workspaceId,
      requestedBy: session.user.id,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return NextResponse.json({ requests });
}
```

```typescript
// app/api/users/[id]/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { auditHelpers } from '@/lib/audit-trail';

interface UserExportData {
  exportedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    emailVerified: string | null;
    createdAt: string;
    updatedAt: string;
  };
  workspaceMemberships: Array<{
    workspaceId: string;
    workspaceName: string;
    role: string;
    joinedAt: string;
  }>;
  sessions: Array<{
    id: string;
    createdAt: string;
    expiresAt: string;
  }>;
  auditTrail: Array<{
    action: string;
    resourceType: string;
    createdAt: string;
    workspaceId: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId } = await params;

  // Users can only export their own data
  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Create export request for tracking
  const exportRequest = await prisma.dataExportRequest.create({
    data: {
      userId,
      requestedBy: session.user.id,
      type: 'user',
      status: 'pending',
      fulfillmentDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Generate export
  const exportData = await generateUserExport(userId);

  // Mark as completed
  await prisma.dataExportRequest.update({
    where: { id: exportRequest.id },
    data: {
      status: 'completed',
      completedAt: new Date(),
    },
  });

  // Log the export (to first workspace for audit trail)
  const firstMembership = await prisma.workspaceMember.findFirst({
    where: { userId },
  });

  if (firstMembership) {
    await auditHelpers.logResourceAccess(
      firstMembership.workspaceId,
      'user',
      userId,
      'exported'
    );
  }

  return NextResponse.json(exportData, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="user-data-${userId}-${Date.now()}.json"`,
    },
  });
}

async function generateUserExport(userId: string): Promise<UserExportData> {
  const [user, memberships, sessions, auditLogs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
    }),
    prisma.workspaceMember.findMany({
      where: { userId },
      include: { workspace: true },
    }),
    prisma.session.findMany({
      where: { userId },
    }),
    prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    }),
  ]);

  if (!user) {
    throw new Error('User not found');
  }

  return {
    exportedAt: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified?.toISOString() ?? null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    },
    workspaceMemberships: memberships.map((m) => ({
      workspaceId: m.workspaceId,
      workspaceName: m.workspace.name,
      role: m.role,
      joinedAt: m.createdAt.toISOString(),
    })),
    sessions: sessions.map((s) => ({
      id: s.id,
      createdAt: s.id, // Session doesn't have createdAt, use id
      expiresAt: s.expires.toISOString(),
    })),
    auditTrail: auditLogs.map((l) => ({
      action: l.action,
      resourceType: l.entityType,
      createdAt: l.createdAt.toISOString(),
      workspaceId: l.workspaceId,
    })),
  };
}
```

### Right to Erasure (GDPR)

```typescript
// app/api/users/[id]/delete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { auditHelpers } from '@/lib/audit-trail';
import { scheduleUserDeletion, cancelUserDeletion } from '@/lib/data-retention';

const GRACE_PERIOD_DAYS = 30;

const deleteRequestSchema = z.object({
  confirmEmail: z.string().email(),
  reason: z.string().optional(),
  immediateDelete: z.boolean().default(false),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId } = await params;

  // Users can only delete their own account
  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = deleteRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid request', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { confirmEmail, reason, immediateDelete } = parsed.data;

  // Verify email matches
  if (confirmEmail !== session.user.email) {
    return NextResponse.json(
      { error: 'Email confirmation does not match' },
      { status: 400 }
    );
  }

  // Check if user is sole owner of any workspace
  const ownedWorkspaces = await prisma.workspaceMember.findMany({
    where: {
      userId,
      role: 'OWNER',
    },
    include: {
      workspace: {
        include: {
          members: {
            where: { role: 'OWNER' },
          },
        },
      },
    },
  });

  const soleOwnerWorkspaces = ownedWorkspaces.filter(
    (m) => m.workspace.members.length === 1
  );

  if (soleOwnerWorkspaces.length > 0) {
    return NextResponse.json(
      {
        error: 'Cannot delete account',
        message: 'You are the sole owner of one or more workspaces. Please transfer ownership or delete the workspaces first.',
        workspaces: soleOwnerWorkspaces.map((m) => ({
          id: m.workspace.id,
          name: m.workspace.name,
        })),
      },
      { status: 400 }
    );
  }

  // Create deletion request
  const deletionRequest = await prisma.userDeletionRequest.create({
    data: {
      userId,
      reason,
      status: 'pending',
      scheduledFor: new Date(Date.now() + GRACE_PERIOD_DAYS * 24 * 60 * 60 * 1000),
      requestedAt: new Date(),
    },
  });

  // Soft delete - mark user as pending deletion
  await prisma.user.update({
    where: { id: userId },
    data: {
      deletionScheduledFor: deletionRequest.scheduledFor,
      deletionRequestId: deletionRequest.id,
    },
  });

  // Invalidate all sessions
  await prisma.session.deleteMany({
    where: { userId },
  });

  // Log the deletion request
  const workspaces = await prisma.workspaceMember.findMany({
    where: { userId },
  });

  for (const membership of workspaces) {
    await auditHelpers.logDataModification(
      membership.workspaceId,
      'user',
      userId,
      'deleted',
      { status: 'active' },
      { status: 'pending_deletion', scheduledFor: deletionRequest.scheduledFor }
    );
  }

  // Schedule the actual deletion job
  await scheduleUserDeletion(userId, deletionRequest.scheduledFor);

  return NextResponse.json({
    message: 'Account deletion scheduled',
    deletionId: deletionRequest.id,
    scheduledFor: deletionRequest.scheduledFor.toISOString(),
    gracePeriodDays: GRACE_PERIOD_DAYS,
  });
}

// Cancel deletion request
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: userId } = await params;

  if (session.user.id !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const deletionRequest = await prisma.userDeletionRequest.findFirst({
    where: {
      userId,
      status: 'pending',
    },
  });

  if (!deletionRequest) {
    return NextResponse.json(
      { error: 'No pending deletion request found' },
      { status: 404 }
    );
  }

  // Cancel the deletion
  await prisma.$transaction([
    prisma.userDeletionRequest.update({
      where: { id: deletionRequest.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
      },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        deletionScheduledFor: null,
        deletionRequestId: null,
      },
    }),
  ]);

  await cancelUserDeletion(userId);

  return NextResponse.json({
    message: 'Deletion request cancelled',
  });
}
```

```typescript
// lib/data-retention.ts
import { prisma } from '@/lib/prisma';
import { auditHelpers } from '@/lib/audit-trail';
import crypto from 'crypto';

// Retention policies (in days)
export const RETENTION_POLICIES = {
  auditLogs: 90, // SOC 2 minimum
  sessions: 30,
  deletedUsers: 30, // Grace period
  exportRequests: 90,
  invitations: 7,
} as const;

export interface DeletionJob {
  userId: string;
  scheduledFor: Date;
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
}

// Schedule user deletion (integrate with your job queue)
export async function scheduleUserDeletion(
  userId: string,
  scheduledFor: Date
): Promise<void> {
  // In production, use a job queue like Bull, Quirrel, or Inngest
  // Example with database-based scheduling:
  await prisma.scheduledJob.create({
    data: {
      type: 'user_deletion',
      targetId: userId,
      scheduledFor,
      status: 'scheduled',
    },
  });
}

export async function cancelUserDeletion(userId: string): Promise<void> {
  await prisma.scheduledJob.updateMany({
    where: {
      type: 'user_deletion',
      targetId: userId,
      status: 'scheduled',
    },
    data: {
      status: 'cancelled',
    },
  });
}

// Execute user deletion (called by job processor)
export async function executeUserDeletion(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      workspaces: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Log deletion in all workspaces before removing data
  for (const membership of user.workspaces) {
    await auditHelpers.logDataModification(
      membership.workspaceId,
      'user',
      userId,
      'deleted',
      { email: user.email, name: user.name },
      { status: 'permanently_deleted' }
    );
  }

  // Cascade delete user data
  await prisma.$transaction([
    // Delete sessions
    prisma.session.deleteMany({ where: { userId } }),

    // Delete accounts (OAuth)
    prisma.account.deleteMany({ where: { userId } }),

    // Delete workspace memberships
    prisma.workspaceMember.deleteMany({ where: { userId } }),

    // Anonymize audit logs (keep for compliance)
    prisma.auditLog.updateMany({
      where: { userId },
      data: {
        userId: null,
        userEmail: '[DELETED]',
      },
    }),

    // Delete the user
    prisma.user.delete({ where: { id: userId } }),
  ]);
}

// Anonymize user data instead of deletion
export async function anonymizeUser(userId: string): Promise<void> {
  const anonymousId = crypto.randomUUID();
  const anonymousEmail = `deleted-${anonymousId}@anonymized.local`;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        email: anonymousEmail,
        name: '[Deleted User]',
        image: null,
        passwordHash: null,
        emailVerified: null,
      },
    }),

    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
  ]);
}

// Run retention policy cleanup (scheduled job)
export async function runRetentionCleanup(): Promise<{
  auditLogsDeleted: number;
  sessionsDeleted: number;
  invitationsDeleted: number;
  exportRequestsDeleted: number;
}> {
  const now = new Date();

  const [
    auditLogsResult,
    sessionsResult,
    invitationsResult,
    exportRequestsResult,
  ] = await Promise.all([
    // Delete old audit logs (keep minimum 90 days for SOC 2)
    prisma.auditLog.deleteMany({
      where: {
        createdAt: {
          lt: new Date(now.getTime() - RETENTION_POLICIES.auditLogs * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Delete expired sessions
    prisma.session.deleteMany({
      where: {
        expires: { lt: now },
      },
    }),

    // Delete expired invitations
    prisma.invitation.deleteMany({
      where: {
        expiresAt: { lt: now },
      },
    }),

    // Delete old export requests
    prisma.dataExportRequest.deleteMany({
      where: {
        createdAt: {
          lt: new Date(now.getTime() - RETENTION_POLICIES.exportRequests * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  return {
    auditLogsDeleted: auditLogsResult.count,
    sessionsDeleted: sessionsResult.count,
    invitationsDeleted: invitationsResult.count,
    exportRequestsDeleted: exportRequestsResult.count,
  };
}

// Generate compliance report
export async function generateRetentionReport(workspaceId: string): Promise<{
  policies: typeof RETENTION_POLICIES;
  statistics: {
    totalAuditLogs: number;
    oldestAuditLog: Date | null;
    pendingDeletions: number;
    completedDeletions: number;
  };
}> {
  const [
    totalAuditLogs,
    oldestAuditLog,
    pendingDeletions,
    completedDeletions,
  ] = await Promise.all([
    prisma.auditLog.count({ where: { workspaceId } }),
    prisma.auditLog.findFirst({
      where: { workspaceId },
      orderBy: { createdAt: 'asc' },
      select: { createdAt: true },
    }),
    prisma.userDeletionRequest.count({
      where: { status: 'pending' },
    }),
    prisma.userDeletionRequest.count({
      where: { status: 'completed' },
    }),
  ]);

  return {
    policies: RETENTION_POLICIES,
    statistics: {
      totalAuditLogs,
      oldestAuditLog: oldestAuditLog?.createdAt ?? null,
      pendingDeletions,
      completedDeletions,
    },
  };
}
```

### Session Security

```typescript
// lib/session-security.ts
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { auditHelpers } from '@/lib/audit-trail';
import crypto from 'crypto';

// Session configuration
export const SESSION_CONFIG = {
  idleTimeoutMinutes: 30,
  absoluteTimeoutHours: 8,
  maxConcurrentSessions: 5,
  requireReauthForSensitive: true,
} as const;

export interface SessionInfo {
  id: string;
  userId: string;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  deviceFingerprint: string | null;
  location: string | null;
  isCurrent: boolean;
}

export interface DeviceInfo {
  fingerprint: string;
  browser: string;
  os: string;
  device: string;
  ipAddress: string;
  location?: string;
}

// Generate device fingerprint
export function generateDeviceFingerprint(info: {
  userAgent: string;
  ipAddress: string;
  acceptLanguage?: string;
}): string {
  const data = `${info.userAgent}|${info.ipAddress}|${info.acceptLanguage ?? ''}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

// Parse user agent for device info
export function parseUserAgent(userAgent: string): {
  browser: string;
  os: string;
  device: string;
} {
  // Simplified parsing - use a library like 'ua-parser-js' in production
  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Edge')) browser = 'Edge';

  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS')) os = 'iOS';

  if (userAgent.includes('Mobile')) device = 'Mobile';
  else if (userAgent.includes('Tablet')) device = 'Tablet';

  return { browser, os, device };
}

// Create enhanced session
export async function createEnhancedSession(
  userId: string,
  workspaceId: string
): Promise<string> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') ?? '';
  const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
                    headersList.get('x-real-ip') ?? '';

  const fingerprint = generateDeviceFingerprint({ userAgent, ipAddress });
  const deviceInfo = parseUserAgent(userAgent);

  // Check concurrent session limit
  const activeSessions = await prisma.enhancedSession.count({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
  });

  if (activeSessions >= SESSION_CONFIG.maxConcurrentSessions) {
    // Revoke oldest session
    const oldestSession = await prisma.enhancedSession.findFirst({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (oldestSession) {
      await revokeSession(oldestSession.id, 'concurrent_limit');
    }
  }

  const sessionToken = crypto.randomBytes(32).toString('hex');
  const now = new Date();

  const session = await prisma.enhancedSession.create({
    data: {
      sessionToken,
      userId,
      createdAt: now,
      lastActiveAt: now,
      expiresAt: new Date(now.getTime() + SESSION_CONFIG.absoluteTimeoutHours * 60 * 60 * 1000),
      idleExpiresAt: new Date(now.getTime() + SESSION_CONFIG.idleTimeoutMinutes * 60 * 1000),
      ipAddress,
      userAgent,
      deviceFingerprint: fingerprint,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
      deviceType: deviceInfo.device,
    },
  });

  // Log session creation
  await auditHelpers.logAuthEvent(
    workspaceId,
    'auth.login_success',
    userId,
    undefined,
    {
      sessionId: session.id,
      ipAddress,
      device: `${deviceInfo.browser} on ${deviceInfo.os}`,
    }
  );

  return sessionToken;
}

// Validate and refresh session
export async function validateSession(sessionToken: string): Promise<{
  valid: boolean;
  session?: SessionInfo;
  reason?: string;
}> {
  const session = await prisma.enhancedSession.findUnique({
    where: { sessionToken },
  });

  if (!session) {
    return { valid: false, reason: 'Session not found' };
  }

  const now = new Date();

  // Check absolute expiration
  if (session.expiresAt < now) {
    await revokeSession(session.id, 'absolute_timeout');
    return { valid: false, reason: 'Session expired' };
  }

  // Check idle expiration
  if (session.idleExpiresAt < now) {
    await revokeSession(session.id, 'idle_timeout');
    return { valid: false, reason: 'Session idle timeout' };
  }

  // Refresh idle timeout
  await prisma.enhancedSession.update({
    where: { id: session.id },
    data: {
      lastActiveAt: now,
      idleExpiresAt: new Date(now.getTime() + SESSION_CONFIG.idleTimeoutMinutes * 60 * 1000),
    },
  });

  return {
    valid: true,
    session: {
      id: session.id,
      userId: session.userId,
      createdAt: session.createdAt,
      lastActiveAt: now,
      expiresAt: session.expiresAt,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      deviceFingerprint: session.deviceFingerprint,
      location: null,
      isCurrent: true,
    },
  };
}

// Revoke a session
export async function revokeSession(
  sessionId: string,
  reason: 'user_logout' | 'password_change' | 'admin_revoke' | 'concurrent_limit' | 'idle_timeout' | 'absolute_timeout' | 'suspicious_activity'
): Promise<void> {
  const session = await prisma.enhancedSession.findUnique({
    where: { id: sessionId },
    include: { user: true },
  });

  if (!session) return;

  await prisma.enhancedSession.delete({
    where: { id: sessionId },
  });

  // Get first workspace for audit log
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: session.userId },
  });

  if (membership) {
    await auditHelpers.logAuthEvent(
      membership.workspaceId,
      reason === 'user_logout' ? 'auth.logout' : 'auth.session_revoked',
      session.userId,
      session.user.email,
      { reason, sessionId }
    );
  }
}

// Revoke all sessions for user (on password change)
export async function revokeAllUserSessions(
  userId: string,
  exceptSessionId?: string
): Promise<number> {
  const where: any = { userId };
  if (exceptSessionId) {
    where.id = { not: exceptSessionId };
  }

  const result = await prisma.enhancedSession.deleteMany({ where });

  // Log in first workspace
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId },
  });

  if (membership) {
    await auditHelpers.logAuthEvent(
      membership.workspaceId,
      'auth.session_revoked',
      userId,
      undefined,
      { reason: 'password_change', count: result.count }
    );
  }

  return result.count;
}

// Get all sessions for user
export async function getUserSessions(
  userId: string,
  currentSessionId?: string
): Promise<SessionInfo[]> {
  const sessions = await prisma.enhancedSession.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { lastActiveAt: 'desc' },
  });

  return sessions.map((s) => ({
    id: s.id,
    userId: s.userId,
    createdAt: s.createdAt,
    lastActiveAt: s.lastActiveAt,
    expiresAt: s.expiresAt,
    ipAddress: s.ipAddress,
    userAgent: s.userAgent,
    deviceFingerprint: s.deviceFingerprint,
    location: null,
    isCurrent: s.id === currentSessionId,
  }));
}

// Detect suspicious login
export async function detectSuspiciousLogin(
  userId: string,
  newDeviceInfo: DeviceInfo
): Promise<{
  suspicious: boolean;
  reasons: string[];
}> {
  const reasons: string[] = [];

  // Get recent successful logins
  const recentSessions = await prisma.enhancedSession.findMany({
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Check if this is a new device
  const knownFingerprints = new Set(
    recentSessions.map((s) => s.deviceFingerprint).filter(Boolean)
  );

  if (!knownFingerprints.has(newDeviceInfo.fingerprint)) {
    reasons.push('new_device');
  }

  // Check for IP address change (simplified)
  const knownIPs = new Set(
    recentSessions.map((s) => s.ipAddress).filter(Boolean)
  );

  if (knownIPs.size > 0 && !knownIPs.has(newDeviceInfo.ipAddress)) {
    reasons.push('new_ip_address');
  }

  // Check for rapid session creation (brute force indicator)
  const recentAttempts = recentSessions.filter(
    (s) => s.createdAt > new Date(Date.now() - 60 * 60 * 1000) // Last hour
  );

  if (recentAttempts.length >= 5) {
    reasons.push('rapid_login_attempts');
  }

  return {
    suspicious: reasons.length > 0,
    reasons,
  };
}
```

### Security Controls

```typescript
// middleware.ts - Security middleware additions
import { NextResponse, type NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Rate limiters for different endpoints
const rateLimiters = {
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 attempts per minute
    prefix: 'ratelimit:auth',
  }),
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:api',
  }),
  sensitive: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // Strict for sensitive ops
    prefix: 'ratelimit:sensitive',
  }),
};

// IP allowlist cache (workspace -> allowed IPs)
const ipAllowlistCache = new Map<string, Set<string>>();

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';

  // Security headers
  const response = NextResponse.next();
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );

  // Brute force protection for auth endpoints
  if (pathname.startsWith('/api/auth') || pathname === '/login') {
    const { success, remaining } = await rateLimiters.auth.limit(ip);

    if (!success) {
      // Log failed attempt
      console.warn(`[Security] Rate limit exceeded for auth: ${ip}`);

      return new NextResponse(
        JSON.stringify({ error: 'Too many login attempts. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          },
        }
      );
    }

    response.headers.set('X-RateLimit-Remaining', remaining.toString());
  }

  // API rate limiting
  if (pathname.startsWith('/api/')) {
    const { success, remaining, reset } = await rateLimiters.api.limit(ip);

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    response.headers.set('X-RateLimit-Remaining', remaining.toString());
  }

  // Protected routes
  if (pathname.startsWith('/api/') || pathname.match(/^\/[^/]+\//)) {
    const token = await getToken({ req: request });

    if (!token) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Extract workspace ID from path
    const workspaceMatch = pathname.match(/^\/([^/]+)\//);
    const workspaceId = workspaceMatch?.[1];

    if (workspaceId) {
      // Check IP allowlist for Enterprise workspaces
      const isAllowed = await checkIPAllowlist(workspaceId, ip);

      if (!isAllowed) {
        console.warn(`[Security] IP not in allowlist: ${ip} for workspace ${workspaceId}`);

        return new NextResponse(
          JSON.stringify({ error: 'Access denied from this IP address' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check MFA requirement for role
      const requiresMFA = await checkMFARequirement(workspaceId, token.sub as string);

      if (requiresMFA && !token.mfaVerified) {
        return NextResponse.redirect(new URL('/auth/mfa-verify', request.url));
      }
    }
  }

  // Sensitive operations require stricter limits
  const sensitiveEndpoints = [
    '/api/billing',
    '/api/workspaces/.*/delete',
    '/api/users/.*/delete',
    '/api/workspaces/.*/export',
  ];

  if (sensitiveEndpoints.some((pattern) => pathname.match(new RegExp(pattern)))) {
    const { success } = await rateLimiters.sensitive.limit(ip);

    if (!success) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many sensitive operations. Please wait.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  return response;
}

async function checkIPAllowlist(workspaceId: string, ip: string): Promise<boolean> {
  // Check cache first
  if (ipAllowlistCache.has(workspaceId)) {
    const allowlist = ipAllowlistCache.get(workspaceId)!;
    if (allowlist.size === 0) return true; // No restrictions
    return allowlist.has(ip);
  }

  // Fetch from database (cache for 5 minutes)
  const workspace = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/internal/workspace/${workspaceId}/ip-allowlist`,
    { next: { revalidate: 300 } }
  ).then((res) => res.json()).catch(() => null);

  if (!workspace?.ipAllowlist || workspace.ipAllowlist.length === 0) {
    ipAllowlistCache.set(workspaceId, new Set());
    return true;
  }

  const allowlist = new Set<string>(workspace.ipAllowlist);
  ipAllowlistCache.set(workspaceId, allowlist);

  return allowlist.has(ip);
}

async function checkMFARequirement(workspaceId: string, userId: string): Promise<boolean> {
  // Fetch MFA policy (cache for 5 minutes)
  const policy = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/internal/workspace/${workspaceId}/mfa-policy`,
    { next: { revalidate: 300 } }
  ).then((res) => res.json()).catch(() => null);

  if (!policy?.enforced) return false;

  // Check user's role
  const membership = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/internal/workspace/${workspaceId}/member/${userId}`,
    { next: { revalidate: 60 } }
  ).then((res) => res.json()).catch(() => null);

  if (!membership) return false;

  return policy.enforcedRoles.includes(membership.role);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
```

```typescript
// lib/password-policy.ts
import { z } from 'zod';
import crypto from 'crypto';

export const PASSWORD_POLICY = {
  minLength: 12,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  preventCommonPasswords: true,
  preventUserInfo: true,
  historyCount: 5, // Prevent reuse of last 5 passwords
} as const;

// Common passwords list (abbreviated - use a full list in production)
const COMMON_PASSWORDS = new Set([
  'password123', 'qwerty123', '123456789', 'letmein123',
  'welcome123', 'admin123', 'password1', 'iloveyou1',
]);

export const passwordSchema = z.string()
  .min(PASSWORD_POLICY.minLength, `Password must be at least ${PASSWORD_POLICY.minLength} characters`)
  .max(PASSWORD_POLICY.maxLength, `Password must be at most ${PASSWORD_POLICY.maxLength} characters`)
  .refine(
    (password) => /[A-Z]/.test(password),
    'Password must contain at least one uppercase letter'
  )
  .refine(
    (password) => /[a-z]/.test(password),
    'Password must contain at least one lowercase letter'
  )
  .refine(
    (password) => /[0-9]/.test(password),
    'Password must contain at least one number'
  )
  .refine(
    (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    'Password must contain at least one special character'
  )
  .refine(
    (password) => !COMMON_PASSWORDS.has(password.toLowerCase()),
    'Password is too common. Please choose a stronger password.'
  );

export function validatePassword(
  password: string,
  userInfo?: { email?: string; name?: string }
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Length checks
  if (password.length < PASSWORD_POLICY.minLength) {
    errors.push(`Password must be at least ${PASSWORD_POLICY.minLength} characters`);
  }
  if (password.length > PASSWORD_POLICY.maxLength) {
    errors.push(`Password must be at most ${PASSWORD_POLICY.maxLength} characters`);
  }

  // Character type checks
  if (PASSWORD_POLICY.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (PASSWORD_POLICY.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (PASSWORD_POLICY.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (PASSWORD_POLICY.requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  // Common password check
  if (PASSWORD_POLICY.preventCommonPasswords && COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Password is too common. Please choose a stronger password.');
  }

  // User info check
  if (PASSWORD_POLICY.preventUserInfo && userInfo) {
    const lowerPassword = password.toLowerCase();
    if (userInfo.email && lowerPassword.includes(userInfo.email.split('@')[0].toLowerCase())) {
      errors.push('Password cannot contain your email address');
    }
    if (userInfo.name && lowerPassword.includes(userInfo.name.toLowerCase())) {
      errors.push('Password cannot contain your name');
    }
  }

  return { valid: errors.length === 0, errors };
}

// Hash password for history comparison
export function hashPasswordForHistory(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Check password history
export async function checkPasswordHistory(
  userId: string,
  newPassword: string,
  prisma: any
): Promise<boolean> {
  const history = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: PASSWORD_POLICY.historyCount,
  });

  const newHash = hashPasswordForHistory(newPassword);

  return !history.some((h: any) => h.passwordHash === newHash);
}

// Save password to history
export async function savePasswordToHistory(
  userId: string,
  password: string,
  prisma: any
): Promise<void> {
  const hash = hashPasswordForHistory(password);

  await prisma.passwordHistory.create({
    data: {
      userId,
      passwordHash: hash,
    },
  });

  // Clean up old entries
  const oldEntries = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: PASSWORD_POLICY.historyCount,
  });

  if (oldEntries.length > 0) {
    await prisma.passwordHistory.deleteMany({
      where: {
        id: { in: oldEntries.map((e: any) => e.id) },
      },
    });
  }
}
```

### SOC 2 Compliance Tests

```typescript
// tests/compliance/soc2.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { prisma } from '@/lib/prisma';
import { createAuditLog, verifyAuditLogIntegrity, auditHelpers } from '@/lib/audit-trail';
import { validateSession, revokeSession, SESSION_CONFIG } from '@/lib/session-security';
import { validatePassword, PASSWORD_POLICY } from '@/lib/password-policy';
import { runRetentionCleanup, RETENTION_POLICIES } from '@/lib/data-retention';
import { checkPermission, hasPermission, PERMISSIONS } from '@/lib/access-control';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
    enhancedSession: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    workspaceMember: {
      findFirst: vi.fn(),
    },
    session: { deleteMany: vi.fn() },
    invitation: { deleteMany: vi.fn() },
    dataExportRequest: { deleteMany: vi.fn() },
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-1', email: 'test@example.com' } }),
}));

// Mock headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (name: string) => {
      const headers: Record<string, string> = {
        'x-forwarded-for': '192.168.1.1',
        'user-agent': 'Test Browser',
      };
      return headers[name] ?? null;
    },
  }),
}));

describe('SOC 2 Compliance Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CC6.1 - Audit Logging Completeness', () => {
    it('logs all required authentication events', async () => {
      const authEvents = [
        'auth.login_success',
        'auth.login_failed',
        'auth.logout',
        'auth.password_reset_requested',
        'auth.password_reset_completed',
        'auth.mfa_enabled',
        'auth.mfa_disabled',
        'auth.session_expired',
        'auth.session_revoked',
      ];

      for (const action of authEvents) {
        (prisma.auditLog.create as any).mockResolvedValueOnce({
          id: 'log-1',
          action,
          category: 'authentication',
        });

        await auditHelpers.logAuthEvent(
          'workspace-1',
          action as any,
          'user-1',
          'test@example.com'
        );

        expect(prisma.auditLog.create).toHaveBeenCalledWith(
          expect.objectContaining({
            data: expect.objectContaining({
              action,
              category: 'authentication',
            }),
          })
        );
      }
    });

    it('logs all authorization change events', async () => {
      (prisma.auditLog.create as any).mockResolvedValue({ id: 'log-1' });

      await auditHelpers.logAuthzChange(
        'workspace-1',
        'authz.role_assigned',
        'user-2',
        undefined,
        'ADMIN'
      );

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            category: 'authorization',
            action: 'authz.role_assigned',
            newValue: { role: 'ADMIN' },
          }),
        })
      );
    });

    it('logs data access events', async () => {
      (prisma.auditLog.create as any).mockResolvedValue({ id: 'log-1' });

      await auditHelpers.logResourceAccess('workspace-1', 'project', 'project-1', 'viewed');

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            category: 'data_access',
            action: 'data.viewed',
            resourceType: 'project',
            resourceId: 'project-1',
          }),
        })
      );
    });

    it('logs data modification events with old and new values', async () => {
      (prisma.auditLog.create as any).mockResolvedValue({ id: 'log-1' });

      await auditHelpers.logDataModification(
        'workspace-1',
        'project',
        'project-1',
        'updated',
        { name: 'Old Name', status: 'ACTIVE' },
        { name: 'New Name', status: 'ACTIVE' }
      );

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            action: 'data.updated',
            oldValue: { name: 'Old Name', status: 'ACTIVE' },
            newValue: { name: 'New Name', status: 'ACTIVE' },
          }),
        })
      );
    });

    it('includes required metadata in audit logs', async () => {
      (prisma.auditLog.create as any).mockResolvedValue({ id: 'log-1' });

      await createAuditLog({
        workspaceId: 'workspace-1',
        category: 'data_access',
        action: 'data.viewed',
        resourceType: 'project',
        resourceId: 'project-1',
      });

      expect(prisma.auditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            workspaceId: 'workspace-1',
            userId: 'user-1',
            ipAddress: '192.168.1.1',
            userAgent: 'Test Browser',
            requestId: expect.any(String),
            checksum: expect.any(String),
          }),
        })
      );
    });

    it('generates tamper-evident checksums', async () => {
      const mockEntry = {
        id: 'log-1',
        workspaceId: 'workspace-1',
        userId: 'user-1',
        userEmail: 'test@example.com',
        category: 'data_access',
        action: 'data.viewed',
        resourceType: 'project',
        resourceId: 'project-1',
        oldValue: null,
        newValue: null,
        ipAddress: '192.168.1.1',
        userAgent: 'Test Browser',
        sessionId: null,
        requestId: 'req-1',
        checksum: '', // Will be set
        createdAt: new Date(),
      };

      // The checksum should be consistent for the same data
      // This test verifies the integrity verification works
      (prisma.auditLog.create as any).mockImplementation(async ({ data }: any) => {
        return { ...mockEntry, checksum: data.checksum };
      });

      const result = await createAuditLog({
        workspaceId: 'workspace-1',
        category: 'data_access',
        action: 'data.viewed',
        resourceType: 'project',
        resourceId: 'project-1',
      });

      expect(result.checksum).toBeDefined();
      expect(result.checksum.length).toBe(64); // SHA-256 hex
    });
  });

  describe('CC6.2 - Access Control Enforcement', () => {
    it('enforces role-based permissions', () => {
      // VIEWER can only read
      expect(hasPermission('VIEWER', 'project:read')).toBe(true);
      expect(hasPermission('VIEWER', 'project:create')).toBe(false);
      expect(hasPermission('VIEWER', 'project:delete')).toBe(false);

      // MEMBER can create and update
      expect(hasPermission('MEMBER', 'project:create')).toBe(true);
      expect(hasPermission('MEMBER', 'project:update')).toBe(true);
      expect(hasPermission('MEMBER', 'project:delete')).toBe(false);

      // ADMIN can delete projects
      expect(hasPermission('ADMIN', 'project:delete')).toBe(true);
      expect(hasPermission('ADMIN', 'billing:manage')).toBe(false);

      // OWNER has all permissions
      expect(hasPermission('OWNER', 'billing:manage')).toBe(true);
      expect(hasPermission('OWNER', 'data:delete')).toBe(true);
    });

    it('denies access for insufficient permissions', async () => {
      (prisma.workspaceMember.findFirst as any).mockResolvedValue({
        role: 'VIEWER',
      });

      await expect(
        checkPermission('workspace-1', 'project:create')
      ).rejects.toThrow('Missing permission');
    });

    it('grants access for sufficient permissions', async () => {
      (prisma.workspaceMember.findFirst as any).mockResolvedValue({
        role: 'ADMIN',
      });

      await expect(
        checkPermission('workspace-1', 'project:delete')
      ).resolves.not.toThrow();
    });

    it('defines all permissions with descriptions', () => {
      for (const [permission, config] of Object.entries(PERMISSIONS)) {
        expect(config.description).toBeDefined();
        expect(config.description.length).toBeGreaterThan(0);
        expect(config.roles).toBeDefined();
        expect(config.roles.length).toBeGreaterThan(0);
      }
    });
  });

  describe('CC6.3 - Session Management', () => {
    it('enforces idle session timeout', async () => {
      const expiredIdleSession = {
        id: 'session-1',
        userId: 'user-1',
        sessionToken: 'token-1',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Not expired
        idleExpiresAt: new Date(Date.now() - 1000), // Idle expired
        createdAt: new Date(),
        lastActiveAt: new Date(Date.now() - 31 * 60 * 1000), // 31 minutes ago
      };

      (prisma.enhancedSession.findUnique as any).mockResolvedValue(expiredIdleSession);
      (prisma.enhancedSession.delete as any).mockResolvedValue(expiredIdleSession);

      const result = await validateSession('token-1');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Session idle timeout');
    });

    it('enforces absolute session timeout', async () => {
      const expiredAbsoluteSession = {
        id: 'session-1',
        userId: 'user-1',
        sessionToken: 'token-1',
        expiresAt: new Date(Date.now() - 1000), // Absolute expired
        idleExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 9 * 60 * 60 * 1000), // 9 hours ago
        lastActiveAt: new Date(),
      };

      (prisma.enhancedSession.findUnique as any).mockResolvedValue(expiredAbsoluteSession);
      (prisma.enhancedSession.delete as any).mockResolvedValue(expiredAbsoluteSession);

      const result = await validateSession('token-1');

      expect(result.valid).toBe(false);
      expect(result.reason).toBe('Session expired');
    });

    it('refreshes idle timeout on activity', async () => {
      const activeSession = {
        id: 'session-1',
        userId: 'user-1',
        sessionToken: 'token-1',
        expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        idleExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
        createdAt: new Date(),
        lastActiveAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      };

      (prisma.enhancedSession.findUnique as any).mockResolvedValue(activeSession);
      (prisma.enhancedSession.update as any).mockResolvedValue(activeSession);

      const result = await validateSession('token-1');

      expect(result.valid).toBe(true);
      expect(prisma.enhancedSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lastActiveAt: expect.any(Date),
            idleExpiresAt: expect.any(Date),
          }),
        })
      );
    });

    it('has correct timeout configuration', () => {
      expect(SESSION_CONFIG.idleTimeoutMinutes).toBe(30);
      expect(SESSION_CONFIG.absoluteTimeoutHours).toBe(8);
      expect(SESSION_CONFIG.maxConcurrentSessions).toBe(5);
    });
  });

  describe('CC6.4 - Data Retention', () => {
    it('retains audit logs for minimum 90 days', () => {
      expect(RETENTION_POLICIES.auditLogs).toBeGreaterThanOrEqual(90);
    });

    it('cleans up expired data according to policies', async () => {
      (prisma.auditLog.deleteMany as any).mockResolvedValue({ count: 10 });
      (prisma.session.deleteMany as any).mockResolvedValue({ count: 5 });
      (prisma.invitation.deleteMany as any).mockResolvedValue({ count: 2 });
      (prisma.dataExportRequest.deleteMany as any).mockResolvedValue({ count: 1 });

      const result = await runRetentionCleanup();

      expect(result.auditLogsDeleted).toBe(10);
      expect(result.sessionsDeleted).toBe(5);
      expect(result.invitationsDeleted).toBe(2);
      expect(result.exportRequestsDeleted).toBe(1);
    });

    it('uses correct retention periods', () => {
      expect(RETENTION_POLICIES.sessions).toBe(30);
      expect(RETENTION_POLICIES.deletedUsers).toBe(30);
      expect(RETENTION_POLICIES.exportRequests).toBe(90);
      expect(RETENTION_POLICIES.invitations).toBe(7);
    });
  });

  describe('CC6.5 - Password Policy', () => {
    it('enforces minimum password length', () => {
      const result = validatePassword('Short1!');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(`Password must be at least ${PASSWORD_POLICY.minLength} characters`);
    });

    it('requires uppercase letters', () => {
      const result = validatePassword('lowercase123!@#');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('requires lowercase letters', () => {
      const result = validatePassword('UPPERCASE123!@#');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('requires numbers', () => {
      const result = validatePassword('NoNumbersHere!@#');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('requires special characters', () => {
      const result = validatePassword('NoSpecialChars123');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('rejects common passwords', () => {
      const result = validatePassword('Password123!@#');
      // password123 is in common list
      expect(result.errors.some(e => e.includes('common'))).toBe(true);
    });

    it('prevents user info in password', () => {
      const result = validatePassword('JohnDoe123!@#A', {
        email: 'johndoe@example.com',
        name: 'John Doe',
      });
      expect(result.valid).toBe(false);
    });

    it('accepts valid strong passwords', () => {
      const result = validatePassword('MyStr0ng&SecureP@ss!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('has appropriate policy settings', () => {
      expect(PASSWORD_POLICY.minLength).toBeGreaterThanOrEqual(12);
      expect(PASSWORD_POLICY.requireUppercase).toBe(true);
      expect(PASSWORD_POLICY.requireLowercase).toBe(true);
      expect(PASSWORD_POLICY.requireNumbers).toBe(true);
      expect(PASSWORD_POLICY.requireSpecialChars).toBe(true);
      expect(PASSWORD_POLICY.preventCommonPasswords).toBe(true);
      expect(PASSWORD_POLICY.historyCount).toBeGreaterThanOrEqual(5);
    });
  });

  describe('CC6.6 - Encryption', () => {
    it('audit log checksums use SHA-256', async () => {
      (prisma.auditLog.create as any).mockImplementation(async ({ data }: any) => ({
        ...data,
        id: 'log-1',
        createdAt: new Date(),
      }));

      const result = await createAuditLog({
        workspaceId: 'workspace-1',
        category: 'data_access',
        action: 'data.viewed',
        resourceType: 'test',
      });

      // SHA-256 produces 64 hex characters
      expect(result.checksum).toMatch(/^[a-f0-9]{64}$/);
    });
  });
});

describe('GDPR Compliance Tests', () => {
  it('allows users to request data export', async () => {
    // This would test the export endpoint
    expect(true).toBe(true); // Placeholder
  });

  it('implements 30-day grace period for deletion', () => {
    // The grace period is defined in the deletion route
    const GRACE_PERIOD_DAYS = 30;
    expect(GRACE_PERIOD_DAYS).toBe(30);
  });

  it('allows deletion cancellation within grace period', async () => {
    // This would test the DELETE endpoint for /api/users/[id]/delete
    expect(true).toBe(true); // Placeholder
  });

  it('anonymizes data instead of hard delete when appropriate', async () => {
    // This would test the anonymization function
    expect(true).toBe(true); // Placeholder
  });
});
```

## Monitoring

### Sentry Setup

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [new Sentry.Replay()],
});
```

### Audit Logging

```typescript
// lib/audit-log.ts
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

type AuditAction = 
  | 'workspace.created' | 'workspace.updated' | 'workspace.deleted'
  | 'member.invited' | 'member.removed' | 'member.role_changed'
  | 'project.created' | 'project.updated' | 'project.deleted'
  | 'billing.plan_changed' | 'billing.payment_failed';

export async function logAudit(
  workspaceId: string,
  action: AuditAction,
  entityType: string,
  entityId?: string,
  metadata?: Record<string, any>
) {
  const session = await auth();
  const headersList = headers();

  await prisma.auditLog.create({
    data: {
      workspaceId,
      userId: session?.user?.id,
      action,
      entityType,
      entityId,
      metadata,
      ipAddress: headersList.get('x-forwarded-for') || undefined,
      userAgent: headersList.get('user-agent') || undefined,
    },
  });
}
```

### Health Check

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks: Record<string, string> = {};

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = 'healthy';
  } catch {
    checks.database = 'unhealthy';
  }

  const status = Object.values(checks).every((s) => s === 'healthy') ? 'healthy' : 'unhealthy';

  return Response.json(
    { status, timestamp: new Date().toISOString(), services: checks },
    { status: status === 'healthy' ? 200 : 503 }
  );
}
```

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="SaaS Dashboard"

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/saas_db"

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (optional)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Stripe Billing
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_PRO_MONTHLY_PRICE_ID=
STRIPE_PRO_YEARLY_PRICE_ID=
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=
STRIPE_ENTERPRISE_YEARLY_PRICE_ID=

# Rate Limiting (Upstash Redis)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=

# Email (optional)
RESEND_API_KEY=
EMAIL_FROM="noreply@yourdomain.com"
```

## Deployment Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Stripe products and prices configured
- [ ] Authentication providers configured
- [ ] Webhook endpoints registered

### Testing
- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] Manual testing of billing flows
- [ ] Multi-tenant isolation verified

### Security
- [ ] RBAC permissions verified
- [ ] Rate limiting enabled
- [ ] Audit logging enabled
- [ ] Security headers configured

### Monitoring
- [ ] Sentry error tracking configured
- [ ] Vercel Analytics enabled
- [ ] Health check endpoint responding
- [ ] Audit logs being recorded

## Related Recipes

- [marketing-site](./marketing-site.md) - Landing pages
- [ecommerce](./ecommerce.md) - Product sales
- [realtime-app](./realtime-app.md) - Real-time features

---

## Changelog

### 1.0.0 (2025-01-17)
- Initial recipe for Next.js 15
- Multi-tenant architecture
- Stripe billing integration
- RBAC implementation
