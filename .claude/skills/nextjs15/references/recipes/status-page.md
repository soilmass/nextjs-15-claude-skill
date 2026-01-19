---
id: r-status-page
name: Status Page
version: 3.0.0
layer: L6
category: recipes
description: Public status page for monitoring services, incidents, and uptime history
tags: [status, monitoring, incidents, uptime, developer-tools, starter]
formula: "StatusPage = MarketingLayout(t-marketing-layout) + ChangelogPage(t-changelog-page) + DashboardLayout(t-dashboard-layout) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + Header(o-header) + Sidebar(o-sidebar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + ActivityTimeline(o-activity-timeline) + Footer(o-footer) + Hero(o-hero) + Breadcrumb(m-breadcrumb) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + StatCard(m-stat-card) + Toast(m-toast) + Pagination(m-pagination) + Avatar(m-avatar) + SearchInput(m-search-input) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + ApiRoutes(pt-api-routes) + ServerComponents(pt-server-components) + PrismaSetup(pt-prisma-setup) + CronJobs(pt-cron-jobs) + BackgroundJobs(pt-background-jobs) + HealthChecks(pt-health-checks) + UptimeMonitoring(pt-uptime-monitoring) + IncidentManagement(pt-incident-management) + RealTimeUpdates(pt-real-time-updates) + WebsocketUpdates(pt-websocket-updates) + TransactionalEmail(pt-transactional-email) + WebhookDelivery(pt-webhook-delivery) + RssFeed(pt-rss-feed) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + GdprCompliance(pt-gdpr-compliance) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics)"
composes:
  # L4 Templates
  - ../templates/marketing-layout.md
  - ../templates/changelog-page.md
  - ../templates/dashboard-layout.md
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/activity-timeline.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/stat-card.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Infrastructure
  - ../patterns/api-routes.md
  - ../patterns/server-components.md
  - ../patterns/prisma-setup.md
  - ../patterns/cron-jobs.md
  - ../patterns/background-jobs.md
  # L5 Patterns - Monitoring Specific
  - ../patterns/health-checks.md
  - ../patterns/uptime-monitoring.md
  - ../patterns/incident-management.md
  # L5 Patterns - Real-time & Communication
  - ../patterns/real-time-updates.md
  - ../patterns/websocket-updates.md
  - ../patterns/transactional-email.md
  - ../patterns/webhook-delivery.md
  - ../patterns/rss-feed.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security (Additional)
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Privacy
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L3 Organisms - Additional
  - ../organisms/footer.md
  - ../organisms/hero.md
  # L2 Molecules - Additional
  - ../molecules/pagination.md
  - ../molecules/avatar.md
  - ../molecules/search-input.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - @tanstack/react-query@5.0.0
  - date-fns@3.0.0
skills:
  - api-routes
  - server-components
  - prisma-setup
  - cron-jobs
  - real-time-updates
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

A clean, professional status page application for displaying service health, incident history, and uptime metrics. Features include service monitoring with automatic health checks, incident management with timeline updates, scheduled maintenance windows, uptime history visualization, and subscriber notifications via email/webhook.

## Project Structure

```
status-page/
├── app/
│   ├── page.tsx                        # Public status page
│   ├── history/page.tsx                # Uptime history
│   ├── incidents/
│   │   └── [id]/page.tsx               # Incident detail
│   ├── subscribe/page.tsx              # Subscribe to updates
│   ├── (admin)/
│   │   ├── layout.tsx                  # Admin layout
│   │   └── admin/
│   │       ├── page.tsx                # Admin dashboard
│   │       ├── services/
│   │       │   ├── page.tsx            # Manage services
│   │       │   └── [id]/page.tsx       # Edit service
│   │       ├── incidents/
│   │       │   ├── page.tsx            # Incidents list
│   │       │   ├── new/page.tsx        # Create incident
│   │       │   └── [id]/page.tsx       # Manage incident
│   │       ├── maintenance/
│   │       │   ├── page.tsx            # Scheduled maintenance
│   │       │   └── new/page.tsx        # Schedule maintenance
│   │       ├── subscribers/page.tsx    # Manage subscribers
│   │       └── settings/page.tsx       # Status page settings
│   ├── api/
│   │   ├── status/route.ts             # Current status (public)
│   │   ├── services/
│   │   │   ├── route.ts                # CRUD services
│   │   │   └── [id]/
│   │   │       ├── route.ts            # Service CRUD
│   │   │       └── check/route.ts      # Manual health check
│   │   ├── incidents/
│   │   │   ├── route.ts                # CRUD incidents
│   │   │   └── [id]/
│   │   │       ├── route.ts            # Incident CRUD
│   │   │       └── updates/route.ts    # Incident updates
│   │   ├── maintenance/route.ts        # Scheduled maintenance
│   │   ├── subscribe/route.ts          # Subscribe endpoint
│   │   ├── unsubscribe/route.ts        # Unsubscribe endpoint
│   │   ├── webhooks/
│   │   │   └── health-check/route.ts   # Cron health checks
│   │   └── metrics/route.ts            # Uptime metrics
│   └── layout.tsx
├── components/
│   ├── ui/                             # Shared UI components
│   ├── status/
│   │   ├── status-overview.tsx
│   │   ├── service-list.tsx
│   │   ├── service-status.tsx
│   │   ├── status-badge.tsx
│   │   ├── uptime-bar.tsx
│   │   └── overall-status.tsx
│   ├── incidents/
│   │   ├── active-incidents.tsx
│   │   ├── incident-card.tsx
│   │   ├── incident-timeline.tsx
│   │   ├── incident-form.tsx
│   │   └── incident-update-form.tsx
│   ├── maintenance/
│   │   ├── scheduled-maintenance.tsx
│   │   ├── maintenance-card.tsx
│   │   └── maintenance-form.tsx
│   ├── history/
│   │   ├── uptime-chart.tsx
│   │   ├── daily-status.tsx
│   │   └── incident-history.tsx
│   ├── subscribe/
│   │   └── subscribe-form.tsx
│   └── layout/
│       ├── header.tsx
│       ├── footer.tsx
│       └── admin-sidebar.tsx
├── lib/
│   ├── db.ts                           # Prisma client
│   ├── health-checker.ts               # Health check logic
│   ├── notifications.ts                # Email/webhook notifications
│   ├── uptime-calculator.ts            # Uptime calculations
│   └── utils.ts
├── hooks/
│   ├── use-status.ts
│   ├── use-services.ts
│   └── use-incidents.ts
├── types/
│   └── index.ts
└── prisma/
    └── schema.prisma
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

model Service {
  id          String   @id @default(cuid())
  name        String
  description String?
  slug        String   @unique
  
  // Health check config
  healthCheckUrl String?
  healthCheckInterval Int @default(60) // seconds
  healthCheckTimeout Int @default(10) // seconds
  
  // Current status
  status      ServiceStatus @default(OPERATIONAL)
  lastCheckedAt DateTime?
  lastDownAt  DateTime?
  
  // Display
  order       Int      @default(0)
  isPublic    Boolean  @default(true)
  
  // Group
  groupId     String?
  group       ServiceGroup? @relation(fields: [groupId], references: [id])
  
  // Relations
  healthChecks HealthCheck[]
  incidentServices IncidentService[]
  maintenanceServices MaintenanceService[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
  @@index([groupId])
}

enum ServiceStatus {
  OPERATIONAL
  DEGRADED
  PARTIAL_OUTAGE
  MAJOR_OUTAGE
  MAINTENANCE
}

model ServiceGroup {
  id          String   @id @default(cuid())
  name        String
  description String?
  order       Int      @default(0)
  isExpanded  Boolean  @default(true)
  
  services    Service[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model HealthCheck {
  id          String   @id @default(cuid())
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  status      HealthCheckStatus
  responseTime Int?    // milliseconds
  statusCode  Int?
  errorMessage String?
  
  checkedAt   DateTime @default(now())
  
  @@index([serviceId, checkedAt])
}

enum HealthCheckStatus {
  UP
  DOWN
  DEGRADED
  TIMEOUT
}

model Incident {
  id          String   @id @default(cuid())
  title       String
  status      IncidentStatus @default(INVESTIGATING)
  impact      IncidentImpact @default(MINOR)
  
  // Timeline
  startedAt   DateTime @default(now())
  resolvedAt  DateTime?
  
  // Relations
  services    IncidentService[]
  updates     IncidentUpdate[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
  @@index([startedAt])
}

enum IncidentStatus {
  INVESTIGATING
  IDENTIFIED
  MONITORING
  RESOLVED
}

enum IncidentImpact {
  NONE
  MINOR
  MAJOR
  CRITICAL
}

model IncidentService {
  incidentId  String
  incident    Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  @@id([incidentId, serviceId])
}

model IncidentUpdate {
  id          String   @id @default(cuid())
  incidentId  String
  incident    Incident @relation(fields: [incidentId], references: [id], onDelete: Cascade)
  
  status      IncidentStatus
  message     String   @db.Text
  
  createdAt   DateTime @default(now())
  
  @@index([incidentId, createdAt])
}

model Maintenance {
  id          String   @id @default(cuid())
  title       String
  description String?  @db.Text
  
  status      MaintenanceStatus @default(SCHEDULED)
  
  scheduledStart DateTime
  scheduledEnd DateTime
  actualStart DateTime?
  actualEnd   DateTime?
  
  // Relations
  services    MaintenanceService[]
  updates     MaintenanceUpdate[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([status])
  @@index([scheduledStart])
}

enum MaintenanceStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model MaintenanceService {
  maintenanceId String
  maintenance   Maintenance @relation(fields: [maintenanceId], references: [id], onDelete: Cascade)
  
  serviceId   String
  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)
  
  @@id([maintenanceId, serviceId])
}

model MaintenanceUpdate {
  id          String   @id @default(cuid())
  maintenanceId String
  maintenance Maintenance @relation(fields: [maintenanceId], references: [id], onDelete: Cascade)
  
  message     String   @db.Text
  
  createdAt   DateTime @default(now())
}

model Subscriber {
  id          String   @id @default(cuid())
  email       String?  @unique
  webhookUrl  String?
  
  // Preferences
  notifyIncidents Boolean @default(true)
  notifyMaintenance Boolean @default(true)
  notifyResolved Boolean @default(true)
  
  // Verification
  isVerified  Boolean  @default(false)
  verifyToken String?
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model StatusPageSettings {
  id          String   @id @default("default")
  
  // Branding
  name        String   @default("Status Page")
  logo        String?
  favicon     String?
  
  // Colors
  primaryColor String  @default("#3b82f6")
  
  // Social
  twitterHandle String?
  supportUrl  String?
  
  // Features
  showUptime  Boolean  @default(true)
  showHistory Boolean  @default(true)
  uptimeDays  Int      @default(90)
  
  updatedAt   DateTime @updatedAt
}

// Daily aggregated uptime for history
model DailyUptime {
  id          String   @id @default(cuid())
  serviceId   String
  date        DateTime @db.Date
  
  uptimePercent Float
  totalChecks Int
  failedChecks Int
  avgResponseTime Float?
  
  @@unique([serviceId, date])
  @@index([date])
}
```

## Implementation

### Public Status Page

```tsx
// app/page.tsx
import { Suspense } from 'react';
import { db } from '@/lib/db';
import { OverallStatus } from '@/components/status/overall-status';
import { ServiceList } from '@/components/status/service-list';
import { ActiveIncidents } from '@/components/incidents/active-incidents';
import { ScheduledMaintenance } from '@/components/maintenance/scheduled-maintenance';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export const revalidate = 30; // Revalidate every 30 seconds

export default async function StatusPage() {
  const [settings, services, activeIncidents, scheduledMaintenance] = await Promise.all([
    db.statusPageSettings.findFirst(),
    db.service.findMany({
      where: { isPublic: true },
      include: { group: true },
      orderBy: [{ group: { order: 'asc' } }, { order: 'asc' }],
    }),
    db.incident.findMany({
      where: { status: { not: 'RESOLVED' } },
      include: {
        services: { include: { service: true } },
        updates: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { startedAt: 'desc' },
    }),
    db.maintenance.findMany({
      where: {
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
        scheduledEnd: { gte: new Date() },
      },
      include: { services: { include: { service: true } } },
      orderBy: { scheduledStart: 'asc' },
    }),
  ]);
  
  const overallStatus = calculateOverallStatus(services);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header settings={settings} />
      
      <main className="flex-1 container py-8">
        <OverallStatus status={overallStatus} />
        
        {activeIncidents.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Active Incidents</h2>
            <ActiveIncidents incidents={activeIncidents} />
          </section>
        )}
        
        {scheduledMaintenance.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">Scheduled Maintenance</h2>
            <ScheduledMaintenance maintenances={scheduledMaintenance} />
          </section>
        )}
        
        <section className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Services</h2>
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
          <ServiceList services={services} showUptime={settings?.showUptime} />
        </section>
      </main>
      
      <Footer settings={settings} />
    </div>
  );
}

function calculateOverallStatus(services: Array<{ status: string }>) {
  if (services.some(s => s.status === 'MAJOR_OUTAGE')) {
    return { status: 'MAJOR_OUTAGE', message: 'Major System Outage' };
  }
  if (services.some(s => s.status === 'PARTIAL_OUTAGE')) {
    return { status: 'PARTIAL_OUTAGE', message: 'Partial System Outage' };
  }
  if (services.some(s => s.status === 'DEGRADED')) {
    return { status: 'DEGRADED', message: 'Degraded Performance' };
  }
  if (services.some(s => s.status === 'MAINTENANCE')) {
    return { status: 'MAINTENANCE', message: 'Under Maintenance' };
  }
  return { status: 'OPERATIONAL', message: 'All Systems Operational' };
}
```

### Service Status Components

```tsx
// components/status/overall-status.tsx
import { CheckCircle, AlertTriangle, XCircle, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OverallStatusProps {
  status: {
    status: string;
    message: string;
  };
}

export function OverallStatus({ status }: OverallStatusProps) {
  const config = getStatusConfig(status.status);
  const Icon = config.icon;
  
  return (
    <div className={cn(
      'rounded-lg p-6 flex items-center gap-4',
      config.bg
    )}>
      <Icon className={cn('h-10 w-10', config.iconColor)} />
      <div>
        <h1 className={cn('text-2xl font-bold', config.textColor)}>
          {status.message}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          All services are monitored 24/7
        </p>
      </div>
    </div>
  );
}

function getStatusConfig(status: string) {
  switch (status) {
    case 'OPERATIONAL':
      return {
        icon: CheckCircle,
        bg: 'bg-green-500/10',
        iconColor: 'text-green-500',
        textColor: 'text-green-700',
      };
    case 'DEGRADED':
      return {
        icon: AlertTriangle,
        bg: 'bg-yellow-500/10',
        iconColor: 'text-yellow-500',
        textColor: 'text-yellow-700',
      };
    case 'PARTIAL_OUTAGE':
    case 'MAJOR_OUTAGE':
      return {
        icon: XCircle,
        bg: 'bg-red-500/10',
        iconColor: 'text-red-500',
        textColor: 'text-red-700',
      };
    case 'MAINTENANCE':
      return {
        icon: Wrench,
        bg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        textColor: 'text-blue-700',
      };
    default:
      return {
        icon: CheckCircle,
        bg: 'bg-gray-500/10',
        iconColor: 'text-gray-500',
        textColor: 'text-gray-700',
      };
  }
}
```

```tsx
// components/status/service-list.tsx
import { db } from '@/lib/db';
import { ServiceStatus } from './service-status';
import { UptimeBar } from './uptime-bar';
import type { Service, ServiceGroup } from '@prisma/client';

interface ServiceListProps {
  services: (Service & { group: ServiceGroup | null })[];
  showUptime?: boolean;
}

export async function ServiceList({ services, showUptime = true }: ServiceListProps) {
  // Group services
  const grouped = services.reduce((acc, service) => {
    const groupName = service.group?.name || 'Services';
    if (!acc[groupName]) {
      acc[groupName] = [];
    }
    acc[groupName].push(service);
    return acc;
  }, {} as Record<string, typeof services>);
  
  // Fetch uptime data if needed
  let uptimeData: Record<string, Array<{ date: Date; uptimePercent: number }>> = {};
  
  if (showUptime) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyUptimes = await db.dailyUptime.findMany({
      where: {
        serviceId: { in: services.map(s => s.id) },
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'asc' },
    });
    
    uptimeData = dailyUptimes.reduce((acc, uptime) => {
      if (!acc[uptime.serviceId]) {
        acc[uptime.serviceId] = [];
      }
      acc[uptime.serviceId].push({
        date: uptime.date,
        uptimePercent: uptime.uptimePercent,
      });
      return acc;
    }, {} as typeof uptimeData);
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([groupName, groupServices]) => (
        <div key={groupName}>
          {Object.keys(grouped).length > 1 && (
            <h3 className="text-lg font-medium mb-3">{groupName}</h3>
          )}
          
          <div className="border rounded-lg divide-y">
            {groupServices.map((service) => (
              <div key={service.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{service.name}</span>
                    {service.description && (
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    )}
                  </div>
                  <ServiceStatus status={service.status} />
                </div>
                
                {showUptime && uptimeData[service.id] && (
                  <UptimeBar data={uptimeData[service.id]} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

```tsx
// components/status/uptime-bar.tsx
'use client';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface UptimeBarProps {
  data: Array<{
    date: Date;
    uptimePercent: number;
  }>;
}

export function UptimeBar({ data }: UptimeBarProps) {
  // Fill missing days with 100% uptime
  const days = fillMissingDays(data, 30);
  
  const avgUptime = days.reduce((sum, d) => sum + d.uptimePercent, 0) / days.length;
  
  return (
    <div>
      <TooltipProvider>
        <div className="flex gap-0.5">
          {days.map((day, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'h-8 flex-1 rounded-sm cursor-pointer transition-transform hover:scale-110',
                    getUptimeColor(day.uptimePercent)
                  )}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">{format(day.date, 'MMM d, yyyy')}</p>
                <p className="text-sm">
                  {day.uptimePercent.toFixed(2)}% uptime
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>
      
      <div className="flex justify-between mt-2 text-xs text-muted-foreground">
        <span>30 days ago</span>
        <span>{avgUptime.toFixed(2)}% uptime</span>
        <span>Today</span>
      </div>
    </div>
  );
}

function getUptimeColor(percent: number) {
  if (percent >= 99.9) return 'bg-green-500';
  if (percent >= 99) return 'bg-green-400';
  if (percent >= 95) return 'bg-yellow-500';
  if (percent >= 90) return 'bg-orange-500';
  return 'bg-red-500';
}

function fillMissingDays(
  data: Array<{ date: Date; uptimePercent: number }>,
  days: number
) {
  const result = [];
  const dataMap = new Map(
    data.map(d => [format(d.date, 'yyyy-MM-dd'), d.uptimePercent])
  );
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    result.push({
      date,
      uptimePercent: dataMap.get(dateStr) ?? 100,
    });
  }
  
  return result;
}
```

### Incident Management

```tsx
// app/(admin)/admin/incidents/new/page.tsx
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { IncidentForm } from '@/components/incidents/incident-form';

export default async function NewIncidentPage() {
  const services = await db.service.findMany({
    where: { isPublic: true },
    orderBy: { name: 'asc' },
  });
  
  return (
    <div className="container max-w-2xl py-8">
      <h1 className="text-2xl font-bold mb-6">Report New Incident</h1>
      <IncidentForm services={services} />
    </div>
  );
}
```

```tsx
// components/incidents/incident-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Service } from '@prisma/client';

const incidentSchema = z.object({
  title: z.string().min(5).max(200),
  status: z.enum(['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED']),
  impact: z.enum(['NONE', 'MINOR', 'MAJOR', 'CRITICAL']),
  message: z.string().min(10),
  serviceIds: z.array(z.string()).min(1, 'Select at least one service'),
  notifySubscribers: z.boolean(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentFormProps {
  services: Service[];
  incident?: {
    id: string;
    title: string;
    status: string;
    impact: string;
  };
}

export function IncidentForm({ services, incident }: IncidentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: incident?.title || '',
      status: (incident?.status as any) || 'INVESTIGATING',
      impact: (incident?.impact as any) || 'MINOR',
      message: '',
      serviceIds: [],
      notifySubscribers: true,
    },
  });
  
  const onSubmit = async (data: IncidentFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(
        incident ? `/api/incidents/${incident.id}` : '/api/incidents',
        {
          method: incident ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      
      if (!response.ok) throw new Error('Failed to save incident');
      
      const result = await response.json();
      
      toast({ title: incident ? 'Incident updated' : 'Incident created' });
      router.push(`/admin/incidents/${result.id}`);
    } catch (error) {
      toast({
        title: 'Error saving incident',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Incident Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Brief description of the issue" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="INVESTIGATING">Investigating</SelectItem>
                    <SelectItem value="IDENTIFIED">Identified</SelectItem>
                    <SelectItem value="MONITORING">Monitoring</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="impact"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impact</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="NONE">None</SelectItem>
                    <SelectItem value="MINOR">Minor</SelectItem>
                    <SelectItem value="MAJOR">Major</SelectItem>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="serviceIds"
          render={() => (
            <FormItem>
              <FormLabel>Affected Services</FormLabel>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {services.map((service) => (
                  <FormField
                    key={service.id}
                    control={form.control}
                    name="serviceIds"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(service.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, service.id]);
                              } else {
                                field.onChange(
                                  field.value.filter((id) => id !== service.id)
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {service.name}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Initial Update Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the current situation and what's being done..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="notifySubscribers"
          render={({ field }) => (
            <FormItem className="flex items-center space-x-2 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="font-normal">
                Notify subscribers about this incident
              </FormLabel>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : incident ? 'Update Incident' : 'Create Incident'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### Health Check Cron Job

```ts
// app/api/webhooks/health-check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { checkServiceHealth } from '@/lib/health-checker';

// Verify cron secret to prevent unauthorized access
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Get all services with health check URLs
  const services = await db.service.findMany({
    where: { healthCheckUrl: { not: null } },
  });
  
  const results = await Promise.all(
    services.map(async (service) => {
      const result = await checkServiceHealth(
        service.healthCheckUrl!,
        service.healthCheckTimeout
      );
      
      // Record health check
      await db.healthCheck.create({
        data: {
          serviceId: service.id,
          status: result.status,
          responseTime: result.responseTime,
          statusCode: result.statusCode,
          errorMessage: result.errorMessage,
        },
      });
      
      // Update service status if changed
      const newStatus = mapHealthToServiceStatus(result.status);
      if (newStatus !== service.status) {
        await db.service.update({
          where: { id: service.id },
          data: {
            status: newStatus,
            lastCheckedAt: new Date(),
            ...(newStatus !== 'OPERATIONAL' && { lastDownAt: new Date() }),
          },
        });
      } else {
        await db.service.update({
          where: { id: service.id },
          data: { lastCheckedAt: new Date() },
        });
      }
      
      return { serviceId: service.id, ...result };
    })
  );
  
  return NextResponse.json({ checked: results.length, results });
}

function mapHealthToServiceStatus(health: string) {
  switch (health) {
    case 'UP':
      return 'OPERATIONAL';
    case 'DEGRADED':
      return 'DEGRADED';
    case 'DOWN':
    case 'TIMEOUT':
      return 'MAJOR_OUTAGE';
    default:
      return 'OPERATIONAL';
  }
}
```

```ts
// lib/health-checker.ts
interface HealthCheckResult {
  status: 'UP' | 'DOWN' | 'DEGRADED' | 'TIMEOUT';
  responseTime?: number;
  statusCode?: number;
  errorMessage?: string;
}

export async function checkServiceHealth(
  url: string,
  timeoutMs: number = 10000
): Promise<HealthCheckResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'StatusPage-HealthCheck/1.0',
      },
    });
    
    const responseTime = Date.now() - startTime;
    clearTimeout(timeout);
    
    if (response.ok) {
      // Check if response time indicates degraded performance
      if (responseTime > 5000) {
        return {
          status: 'DEGRADED',
          responseTime,
          statusCode: response.status,
        };
      }
      
      return {
        status: 'UP',
        responseTime,
        statusCode: response.status,
      };
    }
    
    return {
      status: 'DOWN',
      responseTime,
      statusCode: response.status,
      errorMessage: `HTTP ${response.status}: ${response.statusText}`,
    };
  } catch (error) {
    clearTimeout(timeout);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          status: 'TIMEOUT',
          responseTime: timeoutMs,
          errorMessage: `Request timed out after ${timeoutMs}ms`,
        };
      }
      
      return {
        status: 'DOWN',
        errorMessage: error.message,
      };
    }
    
    return {
      status: 'DOWN',
      errorMessage: 'Unknown error',
    };
  }
}
```

### Subscriber Notifications

```ts
// lib/notifications.ts
import { db } from '@/lib/db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface NotificationPayload {
  type: 'incident_created' | 'incident_updated' | 'incident_resolved' | 'maintenance_scheduled';
  title: string;
  message: string;
  url?: string;
}

export async function notifySubscribers(payload: NotificationPayload) {
  const subscribers = await db.subscriber.findMany({
    where: {
      isVerified: true,
      OR: [
        { notifyIncidents: payload.type.startsWith('incident') },
        { notifyMaintenance: payload.type === 'maintenance_scheduled' },
        { notifyResolved: payload.type === 'incident_resolved' },
      ],
    },
  });
  
  const emailSubscribers = subscribers.filter(s => s.email);
  const webhookSubscribers = subscribers.filter(s => s.webhookUrl);
  
  // Send emails
  if (emailSubscribers.length > 0) {
    await Promise.all(
      emailSubscribers.map(subscriber =>
        sendEmailNotification(subscriber.email!, payload)
      )
    );
  }
  
  // Send webhooks
  if (webhookSubscribers.length > 0) {
    await Promise.all(
      webhookSubscribers.map(subscriber =>
        sendWebhookNotification(subscriber.webhookUrl!, payload)
      )
    );
  }
}

async function sendEmailNotification(
  email: string,
  payload: NotificationPayload
) {
  try {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: email,
      subject: `[Status Update] ${payload.title}`,
      html: `
        <h2>${payload.title}</h2>
        <p>${payload.message}</p>
        ${payload.url ? `<p><a href="${payload.url}">View Details</a></p>` : ''}
      `,
    });
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

async function sendWebhookNotification(
  url: string,
  payload: NotificationPayload
) {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
      }),
    });
  } catch (error) {
    console.error('Failed to send webhook:', error);
  }
}
```

## Skills Used

| Skill | Purpose |
|-------|---------|
| [api-routes](../patterns/api-routes.md) | REST API endpoints for status, incidents, and services |
| [server-components](../patterns/server-components.md) | Server-side data fetching for status page |
| [prisma-setup](../patterns/prisma-setup.md) | Database schema and queries |
| [cron-jobs](../patterns/cron-jobs.md) | Scheduled health checks |
| [real-time-updates](../patterns/real-time-updates.md) | Live status updates via polling/SSE |

## Testing

### Unit Tests

```tsx
// __tests__/lib/health-checker.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkServiceHealth } from '@/lib/health-checker';

describe('checkServiceHealth', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns UP status for successful response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    });

    const result = await checkServiceHealth('https://example.com/health', 10000);

    expect(result.status).toBe('UP');
    expect(result.statusCode).toBe(200);
    expect(result.responseTime).toBeDefined();
  });

  it('returns DOWN status for failed response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    const result = await checkServiceHealth('https://example.com/health', 10000);

    expect(result.status).toBe('DOWN');
    expect(result.statusCode).toBe(503);
  });

  it('returns TIMEOUT status on request timeout', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      new Promise((_, reject) => {
        const error = new Error('Aborted');
        error.name = 'AbortError';
        reject(error);
      })
    );

    const result = await checkServiceHealth('https://example.com/health', 100);

    expect(result.status).toBe('TIMEOUT');
  });

  it('returns DEGRADED for slow responses', async () => {
    global.fetch = vi.fn().mockImplementation(() =>
      new Promise(resolve => {
        setTimeout(() => resolve({ ok: true, status: 200 }), 5500);
      })
    );

    const result = await checkServiceHealth('https://example.com/health', 10000);

    expect(result.status).toBe('DEGRADED');
  });
});
```

```tsx
// __tests__/lib/uptime-calculator.test.ts
import { describe, it, expect } from 'vitest';
import { calculateUptime, calculateOverallStatus } from '@/lib/uptime-calculator';

describe('calculateUptime', () => {
  it('calculates 100% uptime with no failures', () => {
    const checks = Array(100).fill({ status: 'UP' });
    expect(calculateUptime(checks)).toBe(100);
  });

  it('calculates correct percentage with failures', () => {
    const checks = [
      ...Array(90).fill({ status: 'UP' }),
      ...Array(10).fill({ status: 'DOWN' }),
    ];
    expect(calculateUptime(checks)).toBe(90);
  });

  it('returns 0 for all failures', () => {
    const checks = Array(10).fill({ status: 'DOWN' });
    expect(calculateUptime(checks)).toBe(0);
  });
});

describe('calculateOverallStatus', () => {
  it('returns OPERATIONAL when all services are operational', () => {
    const services = [
      { status: 'OPERATIONAL' },
      { status: 'OPERATIONAL' },
    ];
    expect(calculateOverallStatus(services).status).toBe('OPERATIONAL');
  });

  it('returns MAJOR_OUTAGE when any service has major outage', () => {
    const services = [
      { status: 'OPERATIONAL' },
      { status: 'MAJOR_OUTAGE' },
    ];
    expect(calculateOverallStatus(services).status).toBe('MAJOR_OUTAGE');
  });
});
```

### Integration Tests

```tsx
// __tests__/api/status.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createServer } from 'http';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { GET } from '@/app/api/status/route';

describe('GET /api/status', () => {
  it('returns current status for all services', async () => {
    const request = new Request('http://localhost/api/status');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('status');
    expect(data).toHaveProperty('services');
    expect(Array.isArray(data.services)).toBe(true);
  });

  it('includes incident information', async () => {
    const request = new Request('http://localhost/api/status');
    const response = await GET(request);
    const data = await response.json();

    expect(data).toHaveProperty('activeIncidents');
  });
});
```

### E2E Tests

```tsx
// e2e/status-page.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Status Page', () => {
  test('displays overall status', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-testid="overall-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="service-list"]')).toBeVisible();
  });

  test('shows service uptime bars', async ({ page }) => {
    await page.goto('/');

    const uptimeBars = page.locator('[data-testid="uptime-bar"]');
    await expect(uptimeBars.first()).toBeVisible();
  });

  test('displays active incidents', async ({ page }) => {
    await page.goto('/');

    // Check if incidents section appears when there are active incidents
    const incidentsSection = page.locator('[data-testid="active-incidents"]');
    // This may or may not be visible depending on current incidents
  });

  test('navigates to incident detail', async ({ page }) => {
    await page.goto('/');

    const incidentLink = page.locator('[data-testid="incident-link"]').first();
    if (await incidentLink.isVisible()) {
      await incidentLink.click();
      await expect(page).toHaveURL(/\/incidents\/.+/);
    }
  });

  test('subscribe form works', async ({ page }) => {
    await page.goto('/subscribe');

    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.click('[data-testid="subscribe-button"]');

    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function StatusError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error monitoring service
    console.error('Status page error:', error);
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to Load Status</h2>
        <p className="text-muted-foreground mb-4">
          We're having trouble fetching the latest status information.
        </p>
        <Button onClick={reset}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    </div>
  );
}
```

### API Error Handler

```tsx
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Validation error', details: error.errors },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Usage in API routes
export async function POST(request: NextRequest) {
  try {
    // ... handler logic
  } catch (error) {
    return handleAPIError(error);
  }
}
```

## Accessibility

### WCAG 2.1 AA Compliance

```tsx
// components/status/status-badge.tsx
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-sm font-medium',
        config.className
      )}
      role="status"
      aria-label={`Status: ${config.label}`}
    >
      {/* Visual indicator with aria-hidden */}
      <span
        className={cn('w-2 h-2 rounded-full', config.dotColor)}
        aria-hidden="true"
      />
      {config.label}
    </span>
  );
}

// Ensure sufficient color contrast (4.5:1 minimum)
function getStatusConfig(status: string) {
  const configs = {
    OPERATIONAL: {
      label: 'Operational',
      className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      dotColor: 'bg-green-500',
    },
    DEGRADED: {
      label: 'Degraded Performance',
      className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      dotColor: 'bg-yellow-500',
    },
    MAJOR_OUTAGE: {
      label: 'Major Outage',
      className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
      dotColor: 'bg-red-500',
    },
  };
  return configs[status] || configs.OPERATIONAL;
}
```

### Keyboard Navigation

```tsx
// components/status/uptime-bar.tsx
export function UptimeBar({ data }: UptimeBarProps) {
  return (
    <div
      role="img"
      aria-label={`Uptime history: ${avgUptime.toFixed(2)}% average over 30 days`}
    >
      <div className="flex gap-0.5" role="list">
        {days.map((day, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <button
                className={cn(
                  'h-8 flex-1 rounded-sm transition-transform hover:scale-110 focus:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
                  getUptimeColor(day.uptimePercent)
                )}
                aria-label={`${format(day.date, 'MMM d')}: ${day.uptimePercent.toFixed(2)}% uptime`}
                tabIndex={0}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{format(day.date, 'MMM d, yyyy')}</p>
              <p>{day.uptimePercent.toFixed(2)}% uptime</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Screen reader summary */}
      <span className="sr-only">
        Uptime over the past 30 days averages {avgUptime.toFixed(2)}%
      </span>
    </div>
  );
}
```

### Skip Links and Landmarks

```tsx
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* Skip link for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded"
        >
          Skip to main content
        </a>

        <header role="banner">
          <Header />
        </header>

        <main id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>

        <footer role="contentinfo">
          <Footer />
        </footer>
      </body>
    </html>
  );
}
```

## Security

### Input Validation

```tsx
// lib/validations/incident.ts
import { z } from 'zod';

export const incidentSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be less than 200 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\!\?]+$/, 'Title contains invalid characters'),
  status: z.enum(['INVESTIGATING', 'IDENTIFIED', 'MONITORING', 'RESOLVED']),
  impact: z.enum(['NONE', 'MINOR', 'MAJOR', 'CRITICAL']),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be less than 5000 characters'),
  serviceIds: z
    .array(z.string().cuid())
    .min(1, 'Select at least one service'),
  notifySubscribers: z.boolean().default(true),
});

export const subscribeSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  webhookUrl: z.string().url('Invalid webhook URL').optional(),
  notifyIncidents: z.boolean().default(true),
  notifyMaintenance: z.boolean().default(true),
}).refine(
  data => data.email || data.webhookUrl,
  { message: 'Either email or webhook URL is required' }
);
```

### Rate Limiting

```tsx
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different rate limits for different endpoints
export const rateLimits = {
  // Public status API - generous limits
  status: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:status',
  }),

  // Subscribe endpoint - prevent abuse
  subscribe: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    analytics: true,
    prefix: 'ratelimit:subscribe',
  }),

  // Admin API - moderate limits
  admin: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    analytics: true,
    prefix: 'ratelimit:admin',
  }),

  // Health check webhook - strict limits
  healthCheck: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '30 s'),
    analytics: true,
    prefix: 'ratelimit:healthcheck',
  }),
};

// Middleware usage
export async function withRateLimit(
  request: NextRequest,
  limiter: Ratelimit
) {
  const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success, limit, remaining, reset } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
          'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  return null;
}
```

### CSRF Protection

```tsx
// lib/csrf.ts
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function generateCSRFToken(): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const cookieStore = await cookies();

  cookieStore.set('csrf_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600,
  });

  return token;
}

export async function validateCSRFToken(token: string): Promise<boolean> {
  const cookieStore = await cookies();
  const storedToken = cookieStore.get('csrf_token')?.value;

  if (!storedToken || !token) return false;

  // Constant-time comparison to prevent timing attacks
  return token.length === storedToken.length &&
    token.split('').every((char, i) => char === storedToken[i]);
}
```

## Performance

### Caching Strategies

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { db } from '@/lib/db';

// Cache status data for 30 seconds
export const getCachedStatus = unstable_cache(
  async () => {
    const [services, activeIncidents, scheduledMaintenance] = await Promise.all([
      db.service.findMany({
        where: { isPublic: true },
        include: { group: true },
        orderBy: [{ group: { order: 'asc' } }, { order: 'asc' }],
      }),
      db.incident.findMany({
        where: { status: { not: 'RESOLVED' } },
        include: {
          services: { include: { service: true } },
          updates: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
        orderBy: { startedAt: 'desc' },
      }),
      db.maintenance.findMany({
        where: {
          status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
          scheduledEnd: { gte: new Date() },
        },
        include: { services: { include: { service: true } } },
        orderBy: { scheduledStart: 'asc' },
      }),
    ]);

    return { services, activeIncidents, scheduledMaintenance };
  },
  ['status-data'],
  { revalidate: 30, tags: ['status'] }
);

// Cache uptime history for 5 minutes
export const getCachedUptimeHistory = unstable_cache(
  async (serviceId: string, days: number = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return db.dailyUptime.findMany({
      where: {
        serviceId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });
  },
  ['uptime-history'],
  { revalidate: 300, tags: ['uptime'] }
);

// Invalidate cache on status changes
export async function invalidateStatusCache() {
  revalidateTag('status');
}
```

### Database Query Optimization

```tsx
// lib/queries.ts
import { db } from '@/lib/db';

// Optimized query with selective fields
export async function getPublicServices() {
  return db.service.findMany({
    where: { isPublic: true },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      lastCheckedAt: true,
      group: {
        select: {
          id: true,
          name: true,
          order: true,
        },
      },
    },
    orderBy: [{ group: { order: 'asc' } }, { order: 'asc' }],
  });
}

// Batch uptime queries with IN clause
export async function getBatchUptime(serviceIds: string[], days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const uptimes = await db.dailyUptime.findMany({
    where: {
      serviceId: { in: serviceIds },
      date: { gte: startDate },
    },
    orderBy: { date: 'asc' },
  });

  // Group by service ID for easy lookup
  return uptimes.reduce((acc, uptime) => {
    if (!acc[uptime.serviceId]) acc[uptime.serviceId] = [];
    acc[uptime.serviceId].push(uptime);
    return acc;
  }, {} as Record<string, typeof uptimes>);
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
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/statuspage_test
  CRON_SECRET: test-secret

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
          POSTGRES_DB: statuspage_test
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
      - run: pnpm install --frozen-lockfile
      - run: pnpm prisma generate
      - run: pnpm prisma db push
      - run: pnpm test:unit
      - run: pnpm test:integration

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
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
  beforeSend(event) {
    // Filter out expected errors
    if (event.exception?.values?.[0]?.type === 'AbortError') {
      return null;
    }
    return event;
  },
});
```

### Health Check Endpoint

```tsx
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  const checks = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {} as Record<string, { status: string; latency?: number; error?: string }>,
  };

  // Database check
  const dbStart = Date.now();
  try {
    await db.$queryRaw`SELECT 1`;
    checks.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    checks.status = 'unhealthy';
  }

  // Memory check
  const memUsage = process.memoryUsage();
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
  checks.checks.memory = {
    status: heapUsedMB < 512 ? 'healthy' : 'warning',
    latency: heapUsedMB,
  };

  return NextResponse.json(checks, {
    status: checks.status === 'healthy' ? 200 : 503,
  });
}
```

### Custom Metrics

```tsx
// lib/metrics.ts
import { Counter, Histogram, Registry } from 'prom-client';

export const registry = new Registry();

// Health check metrics
export const healthCheckDuration = new Histogram({
  name: 'status_health_check_duration_seconds',
  help: 'Duration of health checks in seconds',
  labelNames: ['service', 'status'],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [registry],
});

export const healthCheckTotal = new Counter({
  name: 'status_health_checks_total',
  help: 'Total number of health checks',
  labelNames: ['service', 'status'],
  registers: [registry],
});

// Incident metrics
export const incidentTotal = new Counter({
  name: 'status_incidents_total',
  help: 'Total number of incidents created',
  labelNames: ['impact', 'status'],
  registers: [registry],
});

// Page view metrics
export const pageViewsTotal = new Counter({
  name: 'status_page_views_total',
  help: 'Total status page views',
  registers: [registry],
});
```

## Environment Variables

```bash
# .env.example

# ===================
# Database
# ===================
DATABASE_URL="postgresql://user:password@localhost:5432/statuspage"

# ===================
# Authentication
# ===================
NEXTAUTH_SECRET="your-nextauth-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# ===================
# Cron Jobs
# ===================
CRON_SECRET="your-cron-secret-for-health-checks"

# ===================
# Email (Resend)
# ===================
RESEND_API_KEY="re_xxxxxxxxxxxxx"
EMAIL_FROM="status@yourdomain.com"

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
NEXT_PUBLIC_APP_URL="https://status.yourdomain.com"
NEXT_PUBLIC_APP_NAME="Your Company Status"
```

## Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured in deployment platform
- [ ] Database migrations applied (`pnpm prisma migrate deploy`)
- [ ] Cron job for health checks configured (e.g., Vercel Cron)
- [ ] Email service (Resend) configured and verified
- [ ] Redis instance provisioned for rate limiting
- [ ] SSL certificate configured for custom domain

### Security

- [ ] CRON_SECRET is unique and secure (32+ characters)
- [ ] NEXTAUTH_SECRET is unique and secure
- [ ] Database connection uses SSL in production
- [ ] Rate limiting enabled for all API endpoints
- [ ] CORS configured appropriately
- [ ] CSP headers configured

### Monitoring

- [ ] Sentry project created and DSN configured
- [ ] Health check endpoint accessible (`/api/health`)
- [ ] Uptime monitoring configured for status page itself
- [ ] Alert notifications configured for critical issues
- [ ] Log aggregation set up

### Performance

- [ ] ISR/caching configured for static pages
- [ ] Database indexes created (`pnpm prisma db push`)
- [ ] CDN configured for static assets
- [ ] Image optimization enabled

### Post-Deployment

- [ ] Verify all services show correct status
- [ ] Test incident creation and notifications
- [ ] Test subscription flow (email verification)
- [ ] Verify health check cron is running
- [ ] Test webhook notifications
- [ ] Monitor error rates for first 24 hours

## Related Skills

- **api-routes** - Next.js API route patterns
- **server-components** - Server component data fetching
- **prisma-setup** - Database configuration
- **cron-jobs** - Scheduled task patterns
- **real-time-updates** - Live status updates

## Changelog

- 1.0.0: Initial status page recipe with health monitoring and incident management
