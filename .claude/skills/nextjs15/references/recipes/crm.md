---
id: r-crm
name: CRM
version: 3.0.0
layer: L6
category: recipes
description: Customer relationship management with contacts, companies, deals pipeline, activities, and reporting
tags: [crm, contacts, deals, pipeline, sales, activities, reporting]
formula: "Crm = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + ContactCard(o-contact-card) + DealPipeline(o-deal-pipeline) + ActivityTimeline(o-activity-timeline) + DataTable(o-data-table) + Header(o-header) + Sidebar(o-sidebar) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + FilterBar(o-filter-bar) + FileUploader(o-file-uploader) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + DatePicker(m-date-picker) + SearchInput(m-search-input) + StatCard(m-stat-card) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + MultiTenancy(pt-multi-tenancy) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + EmailIntegration(pt-email-integration) + CalendarIntegration(pt-calendar-integration) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + Search(pt-search) + Charts(pt-charts) + SearchFilters(pt-search-filters) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + DragAndDrop(pt-drag-and-drop) + FileUpload(pt-file-upload) + RichTextEditor(pt-rich-text-editor) + ExportData(pt-export-data) + ImportData(pt-import-data) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/contact-card.md
  - ../organisms/deal-pipeline.md
  - ../organisms/activity-timeline.md
  - ../organisms/data-table.md
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/filter-bar.md
  - ../organisms/file-uploader.md
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
  # L5 Patterns - Authentication
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
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  - ../patterns/email-integration.md
  - ../patterns/calendar-integration.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  - ../patterns/search.md
  - ../patterns/charts.md
  - ../patterns/search-filters.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - CRM Specific
  - ../patterns/drag-and-drop.md
  - ../patterns/file-upload.md
  - ../patterns/rich-text-editor.md
  - ../patterns/export-data.md
  - ../patterns/import-data.md
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
  - "@radix-ui/react-tabs"
  - "@radix-ui/react-popover"
  - recharts
  - lucide-react
  - date-fns
skills:
  - data-tables
  - pipeline-view
  - activity-timeline
  - search-filters
  - charts
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# CRM

## Overview

A comprehensive CRM application featuring:
- Contact and company management
- Deal pipeline with drag-and-drop stages
- Activity tracking (calls, emails, meetings)
- Task management and reminders
- Email integration
- Notes and file attachments
- Sales reporting and analytics
- Custom fields and properties

## Project Structure

```
crm/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard overview
│   │   ├── contacts/
│   │   │   ├── page.tsx                # Contact list
│   │   │   └── [contactId]/page.tsx    # Contact detail
│   │   ├── companies/
│   │   │   ├── page.tsx
│   │   │   └── [companyId]/page.tsx
│   │   ├── deals/
│   │   │   ├── page.tsx                # Pipeline view
│   │   │   └── [dealId]/page.tsx
│   │   ├── activities/page.tsx
│   │   ├── tasks/page.tsx
│   │   └── reports/
│   │       ├── page.tsx
│   │       ├── revenue/page.tsx
│   │       └── performance/page.tsx
│   ├── api/
│   │   ├── contacts/
│   │   │   ├── route.ts
│   │   │   └── [contactId]/route.ts
│   │   ├── companies/
│   │   │   ├── route.ts
│   │   │   └── [companyId]/route.ts
│   │   ├── deals/
│   │   │   ├── route.ts
│   │   │   └── [dealId]/route.ts
│   │   ├── activities/route.ts
│   │   ├── tasks/route.ts
│   │   └── reports/route.ts
│   └── layout.tsx
├── components/
│   ├── contacts/
│   │   ├── contact-card.tsx
│   │   ├── contact-form.tsx
│   │   └── contact-detail.tsx
│   ├── deals/
│   │   ├── deal-pipeline.tsx
│   │   ├── deal-card.tsx
│   │   └── deal-form.tsx
│   ├── activities/
│   │   ├── activity-timeline.tsx
│   │   ├── activity-form.tsx
│   │   └── activity-card.tsx
│   └── ui/
├── lib/
│   ├── api.ts
│   └── utils.ts
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

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  avatar    String?
  role      String   @default("sales_rep")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Owned records
  contacts    Contact[]  @relation("owner")
  companies   Company[]  @relation("owner")
  deals       Deal[]     @relation("owner")
  activities  Activity[]
  tasks       Task[]     @relation("assignee")
  createdTasks Task[]    @relation("creator")
  notes       Note[]

  @@index([email])
}

model Contact {
  id           String   @id @default(cuid())
  firstName    String
  lastName     String
  email        String?
  phone        String?
  mobile       String?
  jobTitle     String?
  department   String?
  
  // Address
  address      String?
  city         String?
  state        String?
  postalCode   String?
  country      String?
  
  // Social
  linkedin     String?
  twitter      String?
  
  // Company relation
  companyId    String?
  company      Company? @relation(fields: [companyId], references: [id])
  
  // Owner
  ownerId      String
  owner        User     @relation("owner", fields: [ownerId], references: [id])
  
  // Source
  source       String?  // 'website', 'referral', 'linkedin', etc.
  
  // Status
  status       ContactStatus @default(LEAD)
  
  // Custom fields
  customFields Json?
  
  // Relations
  deals        DealContact[]
  activities   Activity[]
  notes        Note[]
  tasks        Task[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([email])
  @@index([companyId])
  @@index([ownerId])
  @@index([status])
}

enum ContactStatus {
  LEAD
  QUALIFIED
  CUSTOMER
  CHURNED
  INACTIVE
}

model Company {
  id           String   @id @default(cuid())
  name         String
  domain       String?
  industry     String?
  size         String?  // '1-10', '11-50', '51-200', etc.
  type         String?  // 'prospect', 'partner', 'customer', etc.
  
  // Address
  address      String?
  city         String?
  state        String?
  postalCode   String?
  country      String?
  
  // Contact info
  phone        String?
  website      String?
  linkedin     String?
  
  // Financial
  annualRevenue Decimal? @db.Decimal(15, 2)
  
  // Owner
  ownerId      String
  owner        User     @relation("owner", fields: [ownerId], references: [id])
  
  // Custom fields
  customFields Json?
  
  // Relations
  contacts     Contact[]
  deals        Deal[]
  activities   Activity[]
  notes        Note[]
  
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([domain])
  @@index([ownerId])
}

model Deal {
  id           String   @id @default(cuid())
  name         String
  value        Decimal  @db.Decimal(15, 2)
  currency     String   @default("USD")
  
  // Pipeline
  stageId      String
  stage        DealStage @relation(fields: [stageId], references: [id])
  probability  Int       @default(0) // 0-100
  
  // Dates
  expectedCloseDate DateTime?
  actualCloseDate   DateTime?
  
  // Company & Contacts
  companyId    String?
  company      Company?  @relation(fields: [companyId], references: [id])
  contacts     DealContact[]
  
  // Owner
  ownerId      String
  owner        User      @relation("owner", fields: [ownerId], references: [id])
  
  // Status
  status       DealStatus @default(OPEN)
  lostReason   String?
  
  // Custom fields
  customFields Json?
  
  // Relations
  activities   Activity[]
  notes        Note[]
  tasks        Task[]
  
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([stageId])
  @@index([companyId])
  @@index([ownerId])
  @@index([status])
}

enum DealStatus {
  OPEN
  WON
  LOST
}

model DealStage {
  id          String   @id @default(cuid())
  name        String
  position    Int
  probability Int      @default(0)
  color       String?
  
  pipelineId  String
  pipeline    Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  
  deals       Deal[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([pipelineId, position])
  @@index([pipelineId])
}

model Pipeline {
  id          String      @id @default(cuid())
  name        String
  isDefault   Boolean     @default(false)
  stages      DealStage[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}

model DealContact {
  id        String  @id @default(cuid())
  dealId    String
  deal      Deal    @relation(fields: [dealId], references: [id], onDelete: Cascade)
  contactId String
  contact   Contact @relation(fields: [contactId], references: [id], onDelete: Cascade)
  role      String? // 'decision_maker', 'influencer', 'champion', etc.

  @@unique([dealId, contactId])
}

model Activity {
  id          String       @id @default(cuid())
  type        ActivityType
  subject     String
  description String?
  
  // Date/time
  dueDate     DateTime?
  completedAt DateTime?
  duration    Int?         // minutes
  
  // Relations
  contactId   String?
  contact     Contact?     @relation(fields: [contactId], references: [id])
  companyId   String?
  company     Company?     @relation(fields: [companyId], references: [id])
  dealId      String?
  deal        Deal?        @relation(fields: [dealId], references: [id])
  
  // Owner
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([contactId])
  @@index([companyId])
  @@index([dealId])
  @@index([userId])
  @@index([type])
  @@index([dueDate])
}

enum ActivityType {
  CALL
  EMAIL
  MEETING
  NOTE
  TASK
}

model Task {
  id          String     @id @default(cuid())
  title       String
  description String?
  priority    TaskPriority @default(MEDIUM)
  status      TaskStatus   @default(TODO)
  dueDate     DateTime?
  completedAt DateTime?
  
  // Relations
  contactId   String?
  contact     Contact?   @relation(fields: [contactId], references: [id])
  dealId      String?
  deal        Deal?      @relation(fields: [dealId], references: [id])
  
  // Assignee & Creator
  assigneeId  String
  assignee    User       @relation("assignee", fields: [assigneeId], references: [id])
  creatorId   String
  creator     User       @relation("creator", fields: [creatorId], references: [id])
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@index([assigneeId])
  @@index([status])
  @@index([dueDate])
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model Note {
  id          String   @id @default(cuid())
  content     String
  
  // Relations
  contactId   String?
  contact     Contact? @relation(fields: [contactId], references: [id])
  companyId   String?
  company     Company? @relation(fields: [companyId], references: [id])
  dealId      String?
  deal        Deal?    @relation(fields: [dealId], references: [id])
  
  // Author
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([contactId])
  @@index([companyId])
  @@index([dealId])
}
```

## Implementation

### Deal Pipeline

```tsx
// components/deals/deal-pipeline.tsx
'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { DealCard } from './deal-card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate: string | null;
  company: { id: string; name: string } | null;
  owner: { id: string; name: string; avatar: string | null };
  contacts: { contact: { id: string; firstName: string; lastName: string } }[];
}

interface Stage {
  id: string;
  name: string;
  position: number;
  probability: number;
  color: string | null;
  deals: Deal[];
}

interface DealPipelineProps {
  stages: Stage[];
  pipelineId: string;
}

export function DealPipeline({ stages: initialStages, pipelineId }: DealPipelineProps) {
  const [stages, setStages] = useState(initialStages);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const moveDeal = useMutation({
    mutationFn: async ({ dealId, stageId }: { dealId: string; stageId: string }) => {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stageId }),
      });
      if (!response.ok) throw new Error('Failed to move deal');
      return response.json();
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['pipeline', pipelineId] });
    },
  });

  const handleDragStart = (event: DragStartEvent) => {
    const dealId = event.active.id as string;
    for (const stage of stages) {
      const deal = stage.deals.find((d) => d.id === dealId);
      if (deal) {
        setActiveDeal(deal);
        break;
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const overId = over.id as string;

    // Find target stage
    let targetStage = stages.find((s) => s.id === overId);
    if (!targetStage) {
      // Dropped on a deal, find its stage
      for (const stage of stages) {
        if (stage.deals.some((d) => d.id === overId)) {
          targetStage = stage;
          break;
        }
      }
    }

    if (!targetStage) return;

    // Find current stage
    let currentStage: Stage | undefined;
    for (const stage of stages) {
      if (stage.deals.some((d) => d.id === dealId)) {
        currentStage = stage;
        break;
      }
    }

    if (!currentStage || currentStage.id === targetStage.id) return;

    // Optimistic update
    setStages((prev) => {
      const newStages = prev.map((stage) => {
        if (stage.id === currentStage!.id) {
          return {
            ...stage,
            deals: stage.deals.filter((d) => d.id !== dealId),
          };
        }
        if (stage.id === targetStage!.id) {
          const deal = currentStage!.deals.find((d) => d.id === dealId)!;
          return {
            ...stage,
            deals: [...stage.deals, deal],
          };
        }
        return stage;
      });
      return newStages;
    });

    moveDeal.mutate({ dealId, stageId: targetStage.id });
  };

  // Calculate totals
  const totals = stages.map((stage) => ({
    count: stage.deals.length,
    value: stage.deals.reduce((sum, d) => sum + d.value, 0),
    weighted: stage.deals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0),
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 h-full overflow-x-auto p-4">
        <SortableContext
          items={stages.map((s) => s.id)}
          strategy={horizontalListSortingStrategy}
        >
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex-shrink-0 w-80 flex flex-col bg-gray-100 dark:bg-gray-900 rounded-xl"
            >
              {/* Stage Header */}
              <div className="p-3 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {stage.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                    )}
                    <h3 className="font-semibold">{stage.name}</h3>
                    <span className="text-sm text-gray-500">
                      ({totals[index].count})
                    </span>
                  </div>
                  <span className="text-sm font-medium text-green-600">
                    {stage.probability}%
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {formatCurrency(totals[index].value)}
                  </span>
                  <span className="mx-1">·</span>
                  <span>
                    Weighted: {formatCurrency(totals[index].weighted)}
                  </span>
                </div>
              </div>

              {/* Deals */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                <SortableContext items={stage.deals.map((d) => d.id)}>
                  {stage.deals.map((deal) => (
                    <DealCard key={deal.id} deal={deal} />
                  ))}
                </SortableContext>

                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deal
                </Button>
              </div>
            </div>
          ))}
        </SortableContext>
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} isDragging />}
      </DragOverlay>
    </DndContext>
  );
}
```

### Deal Card

```tsx
// components/deals/deal-card.tsx
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Link from 'next/link';
import { format, isPast, differenceInDays } from 'date-fns';
import { Building2, Calendar, User, DollarSign } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn, formatCurrency } from '@/lib/utils';

interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  probability: number;
  expectedCloseDate: string | null;
  company: { id: string; name: string } | null;
  owner: { id: string; name: string; avatar: string | null };
  contacts: { contact: { id: string; firstName: string; lastName: string } }[];
}

interface DealCardProps {
  deal: Deal;
  isDragging?: boolean;
}

export function DealCard({ deal, isDragging }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = deal.expectedCloseDate && isPast(new Date(deal.expectedCloseDate));
  const daysUntilClose = deal.expectedCloseDate
    ? differenceInDays(new Date(deal.expectedCloseDate), new Date())
    : null;

  return (
    <Link href={`/deals/${deal.id}`}>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={cn(
          'bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border cursor-pointer',
          'hover:shadow-md hover:border-blue-300 transition-all',
          isDragging && 'shadow-lg rotate-2 opacity-90'
        )}
      >
        {/* Deal Name & Value */}
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm line-clamp-2">{deal.name}</h4>
          <span className="font-semibold text-green-600 whitespace-nowrap ml-2">
            {formatCurrency(deal.value, deal.currency)}
          </span>
        </div>

        {/* Company */}
        {deal.company && (
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
            <Building2 className="h-3.5 w-3.5" />
            <span className="truncate">{deal.company.name}</span>
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-3 text-gray-500">
            {/* Close Date */}
            {deal.expectedCloseDate && (
              <span className={cn(
                'flex items-center gap-1',
                isOverdue && 'text-red-500'
              )}>
                <Calendar className="h-3 w-3" />
                {daysUntilClose !== null && daysUntilClose >= 0
                  ? `${daysUntilClose}d`
                  : format(new Date(deal.expectedCloseDate), 'MMM d')
                }
              </span>
            )}

            {/* Probability */}
            <span className="flex items-center gap-1">
              <div
                className="h-1.5 w-8 rounded-full bg-gray-200 overflow-hidden"
              >
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${deal.probability}%` }}
                />
              </div>
              {deal.probability}%
            </span>
          </div>

          {/* Owner */}
          <Avatar className="h-6 w-6">
            <AvatarImage src={deal.owner.avatar || undefined} alt={deal.owner.name} />
            <AvatarFallback className="text-xs">{deal.owner.name[0]}</AvatarFallback>
          </Avatar>
        </div>

        {/* Contacts */}
        {deal.contacts.length > 0 && (
          <div className="flex items-center gap-1 mt-2 pt-2 border-t text-xs text-gray-500">
            <User className="h-3 w-3" />
            <span className="truncate">
              {deal.contacts
                .slice(0, 2)
                .map((c) => `${c.contact.firstName} ${c.contact.lastName}`)
                .join(', ')}
              {deal.contacts.length > 2 && ` +${deal.contacts.length - 2}`}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}
```

### Contact Detail

```tsx
// components/contacts/contact-detail.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Mail, Phone, Building2, MapPin, Linkedin,
  Twitter, Calendar, User, MoreHorizontal
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityTimeline } from '@/components/activities/activity-timeline';
import { cn } from '@/lib/utils';

const statusColors = {
  LEAD: 'bg-blue-100 text-blue-800',
  QUALIFIED: 'bg-purple-100 text-purple-800',
  CUSTOMER: 'bg-green-100 text-green-800',
  CHURNED: 'bg-red-100 text-red-800',
  INACTIVE: 'bg-gray-100 text-gray-800',
};

interface ContactDetailProps {
  contactId: string;
}

export function ContactDetail({ contactId }: ContactDetailProps) {
  const { data: contact, isLoading } = useQuery({
    queryKey: ['contact', contactId],
    queryFn: async () => {
      const response = await fetch(`/api/contacts/${contactId}`);
      if (!response.ok) throw new Error('Failed to fetch contact');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (!contact) return null;

  const fullName = `${contact.firstName} ${contact.lastName}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-2xl">
                {contact.firstName[0]}{contact.lastName[0]}
              </AvatarFallback>
            </Avatar>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{fullName}</h1>
                <Badge className={statusColors[contact.status as keyof typeof statusColors]}>
                  {contact.status}
                </Badge>
              </div>
              
              {contact.jobTitle && (
                <p className="text-gray-500">
                  {contact.jobTitle}
                  {contact.company && ` at ${contact.company.name}`}
                </p>
              )}
              
              <div className="flex items-center gap-4 mt-2 text-sm">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </a>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </Button>
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2">
          <Tabs defaultValue="activity" className="w-full">
            <TabsList>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="deals">Deals ({contact.deals?.length || 0})</TabsTrigger>
              <TabsTrigger value="notes">Notes ({contact.notes?.length || 0})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({contact.tasks?.length || 0})</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <ActivityTimeline
                activities={contact.activities}
                entityType="contact"
                entityId={contactId}
              />
            </TabsContent>

            <TabsContent value="deals" className="mt-4">
              <div className="space-y-3">
                {contact.deals?.map((dealContact: any) => (
                  <div
                    key={dealContact.deal.id}
                    className="bg-white dark:bg-gray-900 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{dealContact.deal.name}</h4>
                        <p className="text-sm text-gray-500">
                          {dealContact.deal.stage.name} · {dealContact.role || 'Contact'}
                        </p>
                      </div>
                      <span className="font-semibold text-green-600">
                        ${dealContact.deal.value.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <div className="space-y-3">
                {contact.notes?.map((note: any) => (
                  <div
                    key={note.id}
                    className="bg-white dark:bg-gray-900 rounded-lg border p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={note.user.avatar} />
                          <AvatarFallback>{note.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{note.user.name}</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-4">
              <div className="space-y-2">
                {contact.tasks?.map((task: any) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 bg-white dark:bg-gray-900 rounded-lg border p-3"
                  >
                    <input
                      type="checkbox"
                      checked={task.status === 'COMPLETED'}
                      className="rounded"
                      readOnly
                    />
                    <div className="flex-1">
                      <p className={cn(
                        'font-medium text-sm',
                        task.status === 'COMPLETED' && 'line-through text-gray-500'
                      )}>
                        {task.title}
                      </p>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500">
                          Due {format(new Date(task.dueDate), 'MMM d')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
            <h3 className="font-semibold mb-4">Details</h3>
            
            <div className="space-y-3 text-sm">
              {contact.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span>{contact.company.name}</span>
                </div>
              )}
              
              {contact.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {[contact.city, contact.state, contact.country]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
              
              {contact.linkedin && (
                <div className="flex items-center gap-2">
                  <Linkedin className="h-4 w-4 text-gray-400" />
                  <a href={contact.linkedin} className="text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                </div>
              )}
              
              {contact.twitter && (
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-gray-400" />
                  <a href={contact.twitter} className="text-blue-600 hover:underline">
                    Twitter
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Owner */}
          <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
            <h3 className="font-semibold mb-4">Owner</h3>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={contact.owner.avatar} />
                <AvatarFallback>{contact.owner.name[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{contact.owner.name}</p>
                <p className="text-sm text-gray-500">{contact.owner.email}</p>
              </div>
            </div>
          </div>

          {/* Source */}
          {contact.source && (
            <div className="bg-white dark:bg-gray-900 rounded-xl border p-4">
              <h3 className="font-semibold mb-2">Source</h3>
              <Badge variant="secondary">{contact.source}</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Reports API

```tsx
// app/api/reports/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { startOfMonth, endOfMonth, subMonths, eachDayOfInterval, format } from 'date-fns';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const reportType = searchParams.get('type') || 'overview';

  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));

  // Pipeline summary
  const pipelineSummary = await prisma.deal.groupBy({
    by: ['stageId'],
    where: { status: 'OPEN' },
    _count: true,
    _sum: { value: true },
  });

  const stages = await prisma.dealStage.findMany({
    orderBy: { position: 'asc' },
  });

  const pipelineData = stages.map((stage) => {
    const stageData = pipelineSummary.find((s) => s.stageId === stage.id);
    return {
      name: stage.name,
      count: stageData?._count || 0,
      value: Number(stageData?._sum.value) || 0,
      weighted: (Number(stageData?._sum.value) || 0) * (stage.probability / 100),
    };
  });

  // Won/Lost deals this month
  const [wonDeals, lostDeals] = await Promise.all([
    prisma.deal.aggregate({
      where: {
        status: 'WON',
        actualCloseDate: { gte: startOfCurrentMonth },
      },
      _count: true,
      _sum: { value: true },
    }),
    prisma.deal.aggregate({
      where: {
        status: 'LOST',
        actualCloseDate: { gte: startOfCurrentMonth },
      },
      _count: true,
      _sum: { value: true },
    }),
  ]);

  // Revenue trend (last 6 months)
  const revenueTrend = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    
    const monthRevenue = await prisma.deal.aggregate({
      where: {
        status: 'WON',
        actualCloseDate: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: { value: true },
    });

    revenueTrend.push({
      month: format(monthStart, 'MMM yyyy'),
      revenue: Number(monthRevenue._sum.value) || 0,
    });
  }

  // Activity metrics
  const activityMetrics = await prisma.activity.groupBy({
    by: ['type'],
    where: {
      createdAt: { gte: startOfCurrentMonth },
    },
    _count: true,
  });

  // Top performers
  const topPerformers = await prisma.deal.groupBy({
    by: ['ownerId'],
    where: {
      status: 'WON',
      actualCloseDate: { gte: startOfCurrentMonth },
    },
    _count: true,
    _sum: { value: true },
    orderBy: {
      _sum: { value: 'desc' },
    },
    take: 5,
  });

  const performerIds = topPerformers.map((p) => p.ownerId);
  const performers = await prisma.user.findMany({
    where: { id: { in: performerIds } },
    select: { id: true, name: true, avatar: true },
  });

  const topPerformersWithDetails = topPerformers.map((p) => ({
    ...performers.find((u) => u.id === p.ownerId),
    deals: p._count,
    revenue: Number(p._sum.value),
  }));

  return NextResponse.json({
    pipeline: {
      stages: pipelineData,
      totalValue: pipelineData.reduce((sum, s) => sum + s.value, 0),
      weightedValue: pipelineData.reduce((sum, s) => sum + s.weighted, 0),
      totalDeals: pipelineData.reduce((sum, s) => sum + s.count, 0),
    },
    performance: {
      won: {
        count: wonDeals._count || 0,
        value: Number(wonDeals._sum.value) || 0,
      },
      lost: {
        count: lostDeals._count || 0,
        value: Number(lostDeals._sum.value) || 0,
      },
      winRate: wonDeals._count && lostDeals._count
        ? (wonDeals._count / (wonDeals._count + lostDeals._count)) * 100
        : 0,
    },
    revenueTrend,
    activities: activityMetrics.map((a) => ({
      type: a.type,
      count: a._count,
    })),
    topPerformers: topPerformersWithDetails,
  });
}
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
npm install -D msw @mswjs/data
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
      exclude: ['node_modules/', 'tests/e2e/'],
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
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/dashboard',
  useParams: () => ({}),
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// MSW server setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### MSW Handlers for CRM APIs

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';

// Mock data factories
const mockContact = (overrides = {}) => ({
  id: `contact-${Math.random().toString(36).substr(2, 9)}`,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '+1 555-123-4567',
  jobTitle: 'VP of Sales',
  status: 'QUALIFIED',
  company: { id: 'company-1', name: 'Acme Corp' },
  owner: { id: 'user-1', name: 'Sales Rep', avatar: null },
  createdAt: new Date().toISOString(),
  ...overrides,
});

const mockDeal = (overrides = {}) => ({
  id: `deal-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Enterprise License',
  value: 50000,
  currency: 'USD',
  probability: 60,
  stageId: 'stage-2',
  status: 'OPEN',
  expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  company: { id: 'company-1', name: 'Acme Corp' },
  owner: { id: 'user-1', name: 'Sales Rep', avatar: null },
  contacts: [],
  ...overrides,
});

const mockStage = (overrides = {}) => ({
  id: `stage-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Qualification',
  position: 1,
  probability: 20,
  color: '#3B82F6',
  ...overrides,
});

export const handlers = [
  // Contacts
  http.get('/api/contacts', async ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('q');
    
    await delay(100);
    
    let contacts = [
      mockContact({ id: 'contact-1', firstName: 'John', lastName: 'Doe' }),
      mockContact({ id: 'contact-2', firstName: 'Jane', lastName: 'Smith', status: 'CUSTOMER' }),
      mockContact({ id: 'contact-3', firstName: 'Bob', lastName: 'Wilson', status: 'LEAD' }),
    ];
    
    if (status) {
      contacts = contacts.filter(c => c.status === status);
    }
    
    if (search) {
      contacts = contacts.filter(c => 
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    return HttpResponse.json({ data: contacts, total: contacts.length });
  }),

  http.get('/api/contacts/:contactId', async ({ params }) => {
    const { contactId } = params;
    
    if (contactId === 'not-found') {
      return HttpResponse.json({ error: 'Contact not found' }, { status: 404 });
    }
    
    await delay(50);
    return HttpResponse.json(mockContact({ 
      id: contactId,
      activities: [
        { id: 'act-1', type: 'CALL', subject: 'Discovery call', createdAt: new Date().toISOString() },
        { id: 'act-2', type: 'EMAIL', subject: 'Follow-up', createdAt: new Date().toISOString() },
      ],
      deals: [],
      notes: [],
      tasks: [],
    }));
  }),

  http.post('/api/contacts', async ({ request }) => {
    const body = await request.json() as any;
    await delay(100);
    
    if (!body.firstName || !body.lastName) {
      return HttpResponse.json(
        { error: 'First name and last name are required' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(mockContact(body), { status: 201 });
  }),

  http.patch('/api/contacts/:contactId', async ({ params, request }) => {
    const { contactId } = params;
    const body = await request.json() as any;
    await delay(50);
    
    return HttpResponse.json(mockContact({ id: contactId, ...body }));
  }),

  http.delete('/api/contacts/:contactId', async ({ params }) => {
    await delay(50);
    return new HttpResponse(null, { status: 204 });
  }),

  // Deals
  http.get('/api/deals', async () => {
    await delay(100);
    return HttpResponse.json({
      data: [
        mockDeal({ id: 'deal-1', name: 'Enterprise License', value: 50000 }),
        mockDeal({ id: 'deal-2', name: 'Professional Tier', value: 15000, stageId: 'stage-1' }),
        mockDeal({ id: 'deal-3', name: 'Startup Plan', value: 5000, stageId: 'stage-3' }),
      ],
    });
  }),

  http.get('/api/deals/:dealId', async ({ params }) => {
    const { dealId } = params;
    
    if (dealId === 'not-found') {
      return HttpResponse.json({ error: 'Deal not found' }, { status: 404 });
    }
    
    await delay(50);
    return HttpResponse.json(mockDeal({ id: dealId }));
  }),

  http.post('/api/deals', async ({ request }) => {
    const body = await request.json() as any;
    await delay(100);
    
    if (!body.name || !body.value) {
      return HttpResponse.json(
        { error: 'Name and value are required' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json(mockDeal(body), { status: 201 });
  }),

  http.patch('/api/deals/:dealId', async ({ params, request }) => {
    const { dealId } = params;
    const body = await request.json() as any;
    await delay(50);
    
    // Handle stage change (pipeline move)
    if (body.stageId) {
      return HttpResponse.json(mockDeal({ id: dealId, ...body }));
    }
    
    return HttpResponse.json(mockDeal({ id: dealId, ...body }));
  }),

  // Pipeline
  http.get('/api/pipeline/:pipelineId', async ({ params }) => {
    await delay(100);
    return HttpResponse.json({
      id: params.pipelineId,
      name: 'Sales Pipeline',
      stages: [
        { 
          ...mockStage({ id: 'stage-1', name: 'Lead', position: 0, probability: 10 }),
          deals: [mockDeal({ id: 'deal-2', stageId: 'stage-1' })]
        },
        { 
          ...mockStage({ id: 'stage-2', name: 'Qualified', position: 1, probability: 30 }),
          deals: [mockDeal({ id: 'deal-1', stageId: 'stage-2' })]
        },
        { 
          ...mockStage({ id: 'stage-3', name: 'Proposal', position: 2, probability: 60 }),
          deals: [mockDeal({ id: 'deal-3', stageId: 'stage-3' })]
        },
        { 
          ...mockStage({ id: 'stage-4', name: 'Negotiation', position: 3, probability: 80 }),
          deals: []
        },
        { 
          ...mockStage({ id: 'stage-5', name: 'Closed Won', position: 4, probability: 100 }),
          deals: []
        },
      ],
    });
  }),

  // Activities
  http.get('/api/activities', async ({ request }) => {
    const url = new URL(request.url);
    const contactId = url.searchParams.get('contactId');
    const dealId = url.searchParams.get('dealId');
    
    await delay(100);
    return HttpResponse.json({
      data: [
        { id: 'act-1', type: 'CALL', subject: 'Discovery call', duration: 30, completedAt: new Date().toISOString() },
        { id: 'act-2', type: 'EMAIL', subject: 'Proposal sent', completedAt: new Date().toISOString() },
        { id: 'act-3', type: 'MEETING', subject: 'Product demo', dueDate: new Date(Date.now() + 86400000).toISOString() },
      ],
    });
  }),

  http.post('/api/activities', async ({ request }) => {
    const body = await request.json() as any;
    await delay(100);
    
    if (!body.type || !body.subject) {
      return HttpResponse.json(
        { error: 'Type and subject are required' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({
      id: `act-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  // Tasks
  http.get('/api/tasks', async () => {
    await delay(100);
    return HttpResponse.json({
      data: [
        { id: 'task-1', title: 'Follow up with John', priority: 'HIGH', status: 'TODO', dueDate: new Date().toISOString() },
        { id: 'task-2', title: 'Send proposal', priority: 'MEDIUM', status: 'IN_PROGRESS' },
        { id: 'task-3', title: 'Schedule demo', priority: 'LOW', status: 'COMPLETED' },
      ],
    });
  }),

  http.patch('/api/tasks/:taskId', async ({ params, request }) => {
    const { taskId } = params;
    const body = await request.json() as any;
    await delay(50);
    
    return HttpResponse.json({
      id: taskId,
      title: 'Updated task',
      ...body,
    });
  }),

  // Reports
  http.get('/api/reports', async () => {
    await delay(150);
    return HttpResponse.json({
      pipeline: {
        stages: [
          { name: 'Lead', count: 10, value: 150000, weighted: 15000 },
          { name: 'Qualified', count: 8, value: 240000, weighted: 72000 },
          { name: 'Proposal', count: 5, value: 175000, weighted: 105000 },
          { name: 'Negotiation', count: 3, value: 120000, weighted: 96000 },
        ],
        totalValue: 685000,
        weightedValue: 288000,
        totalDeals: 26,
      },
      performance: {
        won: { count: 12, value: 450000 },
        lost: { count: 4, value: 80000 },
        winRate: 75,
      },
      revenueTrend: [
        { month: 'Aug 2024', revenue: 120000 },
        { month: 'Sep 2024', revenue: 95000 },
        { month: 'Oct 2024', revenue: 180000 },
        { month: 'Nov 2024', revenue: 150000 },
        { month: 'Dec 2024', revenue: 200000 },
        { month: 'Jan 2025', revenue: 175000 },
      ],
      topPerformers: [
        { id: 'user-1', name: 'Alice Johnson', deals: 8, revenue: 280000 },
        { id: 'user-2', name: 'Bob Smith', deals: 6, revenue: 195000 },
        { id: 'user-3', name: 'Carol Davis', deals: 4, revenue: 120000 },
      ],
    });
  }),

  // Health check
  http.get('/api/health', async () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: { database: 'up', redis: 'up' },
    });
  }),
];
```

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Unit Tests

```typescript
// tests/unit/deal-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DealCard } from '@/components/deals/deal-card';

const mockDeal = {
  id: 'deal-1',
  name: 'Enterprise License',
  value: 50000,
  currency: 'USD',
  probability: 60,
  expectedCloseDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  company: { id: 'company-1', name: 'Acme Corp' },
  owner: { id: 'user-1', name: 'John Doe', avatar: null },
  contacts: [
    { contact: { id: 'contact-1', firstName: 'Jane', lastName: 'Smith' } },
  ],
};

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => '' } },
}));

describe('DealCard', () => {
  it('renders deal name and value', () => {
    render(<DealCard deal={mockDeal} />);
    
    expect(screen.getByText('Enterprise License')).toBeInTheDocument();
    expect(screen.getByText('$50,000')).toBeInTheDocument();
  });

  it('renders company name', () => {
    render(<DealCard deal={mockDeal} />);
    expect(screen.getByText('Acme Corp')).toBeInTheDocument();
  });

  it('shows probability indicator', () => {
    render(<DealCard deal={mockDeal} />);
    expect(screen.getByText('60%')).toBeInTheDocument();
  });

  it('shows days until close date', () => {
    render(<DealCard deal={mockDeal} />);
    expect(screen.getByText(/\d+d/)).toBeInTheDocument();
  });

  it('shows overdue indicator for past dates', () => {
    const overdueDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    render(<DealCard deal={{ ...mockDeal, expectedCloseDate: overdueDate }} />);
    
    // Check for red styling or overdue text
    const dateElement = screen.getByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
    expect(dateElement.closest('span')).toHaveClass('text-red-500');
  });

  it('renders owner avatar', () => {
    render(<DealCard deal={mockDeal} />);
    expect(screen.getByText('J')).toBeInTheDocument(); // Avatar fallback
  });

  it('renders contacts list', () => {
    render(<DealCard deal={mockDeal} />);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('truncates multiple contacts with count', () => {
    const dealWithManyContacts = {
      ...mockDeal,
      contacts: [
        { contact: { id: 'c1', firstName: 'Jane', lastName: 'Smith' } },
        { contact: { id: 'c2', firstName: 'Bob', lastName: 'Wilson' } },
        { contact: { id: 'c3', firstName: 'Alice', lastName: 'Brown' } },
      ],
    };
    
    render(<DealCard deal={dealWithManyContacts} />);
    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('applies dragging styles when isDragging', () => {
    render(<DealCard deal={mockDeal} isDragging />);
    
    const card = screen.getByRole('link').firstChild;
    expect(card).toHaveClass('shadow-lg', 'rotate-2', 'opacity-90');
  });

  it('links to deal detail page', () => {
    render(<DealCard deal={mockDeal} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/deals/deal-1');
  });
});
```

```typescript
// tests/unit/contact-status.test.ts
import { describe, it, expect } from 'vitest';

// Status transition validation
const validTransitions: Record<string, string[]> = {
  LEAD: ['QUALIFIED', 'INACTIVE'],
  QUALIFIED: ['CUSTOMER', 'CHURNED', 'INACTIVE'],
  CUSTOMER: ['CHURNED'],
  CHURNED: ['CUSTOMER'],
  INACTIVE: ['LEAD', 'QUALIFIED'],
};

function canTransition(from: string, to: string): boolean {
  return validTransitions[from]?.includes(to) ?? false;
}

function getNextStatuses(current: string): string[] {
  return validTransitions[current] || [];
}

describe('Contact Status Transitions', () => {
  it('allows LEAD to transition to QUALIFIED', () => {
    expect(canTransition('LEAD', 'QUALIFIED')).toBe(true);
  });

  it('allows LEAD to transition to INACTIVE', () => {
    expect(canTransition('LEAD', 'INACTIVE')).toBe(true);
  });

  it('prevents LEAD from transitioning directly to CUSTOMER', () => {
    expect(canTransition('LEAD', 'CUSTOMER')).toBe(false);
  });

  it('allows QUALIFIED to transition to CUSTOMER', () => {
    expect(canTransition('QUALIFIED', 'CUSTOMER')).toBe(true);
  });

  it('allows CHURNED customer to be reactivated', () => {
    expect(canTransition('CHURNED', 'CUSTOMER')).toBe(true);
  });

  it('returns available next statuses for QUALIFIED', () => {
    const next = getNextStatuses('QUALIFIED');
    expect(next).toContain('CUSTOMER');
    expect(next).toContain('CHURNED');
    expect(next).toContain('INACTIVE');
  });
});
```

```typescript
// tests/unit/deal-calculations.test.ts
import { describe, it, expect } from 'vitest';

interface Deal {
  value: number;
  probability: number;
  stage: { probability: number };
}

function calculateWeightedValue(deal: Deal): number {
  return deal.value * (deal.probability / 100);
}

function calculatePipelineValue(deals: Deal[]): number {
  return deals.reduce((sum, deal) => sum + deal.value, 0);
}

function calculateWeightedPipelineValue(deals: Deal[]): number {
  return deals.reduce((sum, deal) => sum + calculateWeightedValue(deal), 0);
}

function calculateWinRate(won: number, lost: number): number {
  if (won + lost === 0) return 0;
  return (won / (won + lost)) * 100;
}

function calculateAverageDealSize(deals: Deal[]): number {
  if (deals.length === 0) return 0;
  return calculatePipelineValue(deals) / deals.length;
}

describe('Deal Calculations', () => {
  const mockDeals: Deal[] = [
    { value: 50000, probability: 60, stage: { probability: 60 } },
    { value: 25000, probability: 80, stage: { probability: 80 } },
    { value: 100000, probability: 30, stage: { probability: 30 } },
  ];

  it('calculates weighted value correctly', () => {
    expect(calculateWeightedValue(mockDeals[0])).toBe(30000);
    expect(calculateWeightedValue(mockDeals[1])).toBe(20000);
    expect(calculateWeightedValue(mockDeals[2])).toBe(30000);
  });

  it('calculates total pipeline value', () => {
    expect(calculatePipelineValue(mockDeals)).toBe(175000);
  });

  it('calculates weighted pipeline value', () => {
    expect(calculateWeightedPipelineValue(mockDeals)).toBe(80000);
  });

  it('calculates win rate', () => {
    expect(calculateWinRate(8, 2)).toBe(80);
    expect(calculateWinRate(0, 0)).toBe(0);
    expect(calculateWinRate(5, 5)).toBe(50);
  });

  it('calculates average deal size', () => {
    expect(calculateAverageDealSize(mockDeals)).toBeCloseTo(58333.33, 0);
    expect(calculateAverageDealSize([])).toBe(0);
  });
});
```

```typescript
// tests/unit/activity-timeline.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityTimeline } from '@/components/activities/activity-timeline';

const mockActivities = [
  {
    id: 'act-1',
    type: 'CALL',
    subject: 'Discovery call',
    description: 'Initial conversation about requirements',
    duration: 30,
    completedAt: new Date().toISOString(),
    user: { id: 'user-1', name: 'Sales Rep', avatar: null },
  },
  {
    id: 'act-2',
    type: 'EMAIL',
    subject: 'Proposal sent',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    user: { id: 'user-1', name: 'Sales Rep', avatar: null },
  },
  {
    id: 'act-3',
    type: 'MEETING',
    subject: 'Product demo',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    user: { id: 'user-1', name: 'Sales Rep', avatar: null },
  },
];

describe('ActivityTimeline', () => {
  it('renders all activities', () => {
    render(
      <ActivityTimeline 
        activities={mockActivities} 
        entityType="contact" 
        entityId="contact-1" 
      />
    );

    expect(screen.getByText('Discovery call')).toBeInTheDocument();
    expect(screen.getByText('Proposal sent')).toBeInTheDocument();
    expect(screen.getByText('Product demo')).toBeInTheDocument();
  });

  it('shows activity icons based on type', () => {
    render(
      <ActivityTimeline 
        activities={mockActivities} 
        entityType="contact" 
        entityId="contact-1" 
      />
    );

    // Check for appropriate icons (Phone, Mail, Calendar)
    expect(document.querySelector('[data-testid="icon-call"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="icon-email"]')).toBeInTheDocument();
    expect(document.querySelector('[data-testid="icon-meeting"]')).toBeInTheDocument();
  });

  it('displays call duration', () => {
    render(
      <ActivityTimeline 
        activities={mockActivities} 
        entityType="contact" 
        entityId="contact-1" 
      />
    );

    expect(screen.getByText(/30 min/)).toBeInTheDocument();
  });

  it('shows scheduled badge for future activities', () => {
    render(
      <ActivityTimeline 
        activities={mockActivities} 
        entityType="contact" 
        entityId="contact-1" 
      />
    );

    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('shows empty state when no activities', () => {
    render(
      <ActivityTimeline 
        activities={[]} 
        entityType="contact" 
        entityId="contact-1" 
      />
    );

    expect(screen.getByText(/no activities/i)).toBeInTheDocument();
  });
});
```

```typescript
// tests/unit/task-priority.test.ts
import { describe, it, expect } from 'vitest';

type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Task {
  id: string;
  priority: Priority;
  status: TaskStatus;
  dueDate?: string;
}

function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder: Record<Priority, number> = {
    URGENT: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  };
  
  return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

function getOverdueTasks(tasks: Task[]): Task[] {
  const now = new Date();
  return tasks.filter(
    task => 
      task.status !== 'COMPLETED' && 
      task.status !== 'CANCELLED' &&
      task.dueDate && 
      new Date(task.dueDate) < now
  );
}

function getUpcomingTasks(tasks: Task[], days: number = 7): Task[] {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  
  return tasks.filter(
    task =>
      task.status !== 'COMPLETED' &&
      task.status !== 'CANCELLED' &&
      task.dueDate &&
      new Date(task.dueDate) >= now &&
      new Date(task.dueDate) <= future
  );
}

describe('Task Priority and Sorting', () => {
  const mockTasks: Task[] = [
    { id: '1', priority: 'LOW', status: 'TODO' },
    { id: '2', priority: 'URGENT', status: 'TODO' },
    { id: '3', priority: 'HIGH', status: 'IN_PROGRESS' },
    { id: '4', priority: 'MEDIUM', status: 'TODO' },
  ];

  it('sorts tasks by priority (urgent first)', () => {
    const sorted = sortTasksByPriority(mockTasks);
    
    expect(sorted[0].priority).toBe('URGENT');
    expect(sorted[1].priority).toBe('HIGH');
    expect(sorted[2].priority).toBe('MEDIUM');
    expect(sorted[3].priority).toBe('LOW');
  });

  it('identifies overdue tasks', () => {
    const tasksWithDates: Task[] = [
      { id: '1', priority: 'HIGH', status: 'TODO', dueDate: new Date(Date.now() - 86400000).toISOString() },
      { id: '2', priority: 'MEDIUM', status: 'TODO', dueDate: new Date(Date.now() + 86400000).toISOString() },
      { id: '3', priority: 'LOW', status: 'COMPLETED', dueDate: new Date(Date.now() - 86400000).toISOString() },
    ];

    const overdue = getOverdueTasks(tasksWithDates);
    
    expect(overdue).toHaveLength(1);
    expect(overdue[0].id).toBe('1');
  });

  it('identifies upcoming tasks within range', () => {
    const now = Date.now();
    const tasksWithDates: Task[] = [
      { id: '1', priority: 'HIGH', status: 'TODO', dueDate: new Date(now + 2 * 86400000).toISOString() },
      { id: '2', priority: 'MEDIUM', status: 'TODO', dueDate: new Date(now + 10 * 86400000).toISOString() },
      { id: '3', priority: 'LOW', status: 'TODO', dueDate: new Date(now + 5 * 86400000).toISOString() },
    ];

    const upcoming = getUpcomingTasks(tasksWithDates, 7);
    
    expect(upcoming).toHaveLength(2);
    expect(upcoming.map(t => t.id)).toContain('1');
    expect(upcoming.map(t => t.id)).toContain('3');
  });
});
```

### Integration Tests

```typescript
// tests/integration/contact-management.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ContactsPage from '@/app/(dashboard)/contacts/page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Contact Management Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads and displays contacts list', async () => {
    render(<ContactsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('filters contacts by status', async () => {
    const user = userEvent.setup();
    render(<ContactsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Open status filter
    await user.click(screen.getByRole('combobox', { name: /status/i }));
    await user.click(screen.getByRole('option', { name: /customer/i }));

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('Bob Wilson')).not.toBeInTheDocument();
    });
  });

  it('searches contacts by name', async () => {
    const user = userEvent.setup();
    render(<ContactsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/search/i), 'Jane');

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
  });

  it('creates a new contact', async () => {
    const user = userEvent.setup();
    render(<ContactsPage />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('button', { name: /add contact/i }));

    // Fill form
    await user.type(screen.getByLabelText(/first name/i), 'New');
    await user.type(screen.getByLabelText(/last name/i), 'Contact');
    await user.type(screen.getByLabelText(/email/i), 'new@example.com');

    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/contact created/i)).toBeInTheDocument();
    });
  });

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup();
    render(<ContactsPage />, { wrapper: createWrapper() });

    await user.click(screen.getByRole('button', { name: /add contact/i }));
    await user.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/first name.*required/i)).toBeInTheDocument();
      expect(screen.getByText(/last name.*required/i)).toBeInTheDocument();
    });
  });
});
```

```typescript
// tests/integration/deal-pipeline.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DealPipeline } from '@/components/deals/deal-pipeline';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragEnd }: any) => {
    // Store onDragEnd for test access
    (window as any).__dndOnDragEnd = onDragEnd;
    return <div data-testid="dnd-context">{children}</div>;
  },
  DragOverlay: ({ children }: any) => children,
  closestCorners: vi.fn(),
  PointerSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => children,
  horizontalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
}));

const mockStages = [
  {
    id: 'stage-1',
    name: 'Lead',
    position: 0,
    probability: 10,
    color: '#3B82F6',
    deals: [
      { id: 'deal-1', name: 'Small Deal', value: 5000, currency: 'USD', probability: 10, expectedCloseDate: null, company: null, owner: { id: 'u1', name: 'Rep', avatar: null }, contacts: [] },
    ],
  },
  {
    id: 'stage-2',
    name: 'Qualified',
    position: 1,
    probability: 30,
    color: '#10B981',
    deals: [
      { id: 'deal-2', name: 'Medium Deal', value: 25000, currency: 'USD', probability: 30, expectedCloseDate: null, company: null, owner: { id: 'u1', name: 'Rep', avatar: null }, contacts: [] },
    ],
  },
];

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Deal Pipeline Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('renders all pipeline stages', () => {
    render(
      <DealPipeline stages={mockStages} pipelineId="pipeline-1" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Lead')).toBeInTheDocument();
    expect(screen.getByText('Qualified')).toBeInTheDocument();
  });

  it('displays deals in correct stages', () => {
    render(
      <DealPipeline stages={mockStages} pipelineId="pipeline-1" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('Small Deal')).toBeInTheDocument();
    expect(screen.getByText('Medium Deal')).toBeInTheDocument();
  });

  it('shows stage totals correctly', () => {
    render(
      <DealPipeline stages={mockStages} pipelineId="pipeline-1" />,
      { wrapper: createWrapper() }
    );

    // Check deal counts
    expect(screen.getByText('(1)')).toBeInTheDocument();
    
    // Check values
    expect(screen.getByText('$5,000')).toBeInTheDocument();
    expect(screen.getByText('$25,000')).toBeInTheDocument();
  });

  it('shows probability percentages', () => {
    render(
      <DealPipeline stages={mockStages} pipelineId="pipeline-1" />,
      { wrapper: createWrapper() }
    );

    expect(screen.getByText('10%')).toBeInTheDocument();
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('moves deal between stages on drag end', async () => {
    render(
      <DealPipeline stages={mockStages} pipelineId="pipeline-1" />,
      { wrapper: createWrapper() }
    );

    // Simulate drag end
    const onDragEnd = (window as any).__dndOnDragEnd;
    onDragEnd({
      active: { id: 'deal-1' },
      over: { id: 'stage-2' },
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/deals/deal-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ stageId: 'stage-2' }),
        })
      );
    });
  });
});
```

```typescript
// tests/integration/reports-dashboard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ReportsPage from '@/app/(dashboard)/reports/page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Reports Dashboard Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays pipeline summary', async () => {
    render(<ReportsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Pipeline Overview')).toBeInTheDocument();
      expect(screen.getByText('$685,000')).toBeInTheDocument(); // Total value
      expect(screen.getByText('$288,000')).toBeInTheDocument(); // Weighted value
    });
  });

  it('displays performance metrics', async () => {
    render(<ReportsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Won')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument(); // Won count
      expect(screen.getByText('75%')).toBeInTheDocument(); // Win rate
    });
  });

  it('displays revenue trend chart', async () => {
    render(<ReportsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Revenue Trend')).toBeInTheDocument();
      // Chart should have data labels
      expect(screen.getByText('Jan 2025')).toBeInTheDocument();
    });
  });

  it('displays top performers', async () => {
    render(<ReportsPage />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Top Performers')).toBeInTheDocument();
      expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
      expect(screen.getByText('$280,000')).toBeInTheDocument();
    });
  });
});
```

### API Route Tests

```typescript
// tests/api/contacts.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PATCH, DELETE } from '@/app/api/contacts/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  prisma: {
    contact: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-123' } }),
}));

describe('/api/contacts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET', () => {
    it('returns paginated contacts', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.contact.findMany as any).mockResolvedValue([
        { id: 'c1', firstName: 'John', lastName: 'Doe' },
      ]);
      (prisma.contact.count as any).mockResolvedValue(1);

      const request = new NextRequest('http://localhost/api/contacts');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.total).toBe(1);
    });

    it('filters by status', async () => {
      const { prisma } = await import('@/lib/db');
      
      const request = new NextRequest('http://localhost/api/contacts?status=CUSTOMER');
      await GET(request);

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'CUSTOMER' }),
        })
      );
    });

    it('searches by name', async () => {
      const { prisma } = await import('@/lib/db');
      
      const request = new NextRequest('http://localhost/api/contacts?q=John');
      await GET(request);

      expect(prisma.contact.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ firstName: expect.anything() }),
              expect.objectContaining({ lastName: expect.anything() }),
            ]),
          }),
        })
      );
    });
  });

  describe('POST', () => {
    it('creates a contact with valid data', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.contact.create as any).mockResolvedValue({
        id: 'new-contact',
        firstName: 'Jane',
        lastName: 'Doe',
      });

      const request = new NextRequest('http://localhost/api/contacts', {
        method: 'POST',
        body: JSON.stringify({ firstName: 'Jane', lastName: 'Doe' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it('validates required fields', async () => {
      const request = new NextRequest('http://localhost/api/contacts', {
        method: 'POST',
        body: JSON.stringify({ firstName: '' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('validates email format', async () => {
      const request = new NextRequest('http://localhost/api/contacts', {
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'invalid-email',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});
```

```typescript
// tests/api/deals.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PATCH } from '@/app/api/deals/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/db', () => ({
  prisma: {
    deal: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    dealStage: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth', () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: 'user-123' } }),
}));

describe('/api/deals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('creates a deal with valid data', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.dealStage.findFirst as any).mockResolvedValue({ id: 'stage-1', probability: 10 });
      (prisma.deal.create as any).mockResolvedValue({
        id: 'new-deal',
        name: 'New Deal',
        value: 50000,
      });

      const request = new NextRequest('http://localhost/api/deals', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Deal',
          value: 50000,
          stageId: 'stage-1',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);
    });

    it('validates deal value is positive', async () => {
      const request = new NextRequest('http://localhost/api/deals', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Invalid Deal',
          value: -1000,
          stageId: 'stage-1',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('validates probability range', async () => {
      const request = new NextRequest('http://localhost/api/deals', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Invalid Deal',
          value: 50000,
          stageId: 'stage-1',
          probability: 150,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH', () => {
    it('updates deal stage', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.deal.findUnique as any).mockResolvedValue({ id: 'deal-1', ownerId: 'user-123' });
      (prisma.dealStage.findFirst as any).mockResolvedValue({ id: 'stage-2', probability: 30 });
      (prisma.deal.update as any).mockResolvedValue({ id: 'deal-1', stageId: 'stage-2' });

      const request = new NextRequest('http://localhost/api/deals/deal-1', {
        method: 'PATCH',
        body: JSON.stringify({ stageId: 'stage-2' }),
      });

      const response = await PATCH(request, { params: { dealId: 'deal-1' } });
      expect(response.status).toBe(200);
    });

    it('updates probability when stage changes', async () => {
      const { prisma } = await import('@/lib/db');
      (prisma.deal.findUnique as any).mockResolvedValue({ id: 'deal-1', ownerId: 'user-123' });
      (prisma.dealStage.findFirst as any).mockResolvedValue({ id: 'stage-2', probability: 30 });

      const request = new NextRequest('http://localhost/api/deals/deal-1', {
        method: 'PATCH',
        body: JSON.stringify({ stageId: 'stage-2' }),
      });

      await PATCH(request, { params: { dealId: 'deal-1' } });

      expect(prisma.deal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ probability: 30 }),
        })
      );
    });
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/crm-workflow.spec.ts
import { test, expect } from '@playwright/test';

test.describe('CRM Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'sales@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('full sales cycle: lead to customer', async ({ page }) => {
    // Create contact
    await page.goto('/contacts');
    await page.click('button:has-text("Add Contact")');
    await page.fill('[name="firstName"]', 'Prospect');
    await page.fill('[name="lastName"]', 'Lead');
    await page.fill('[name="email"]', 'prospect@company.com');
    await page.fill('[name="phone"]', '+1 555-0100');
    await page.fill('[name="jobTitle"]', 'CTO');
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('.toast-success')).toContainText('Contact created');

    // Create deal for contact
    await page.click('[data-testid="contact-card"]:has-text("Prospect Lead")');
    await page.click('button:has-text("Create Deal")');
    await page.fill('[name="name"]', 'Enterprise Package');
    await page.fill('[name="value"]', '75000');
    await page.click('button:has-text("Save")');

    await expect(page.locator('.toast-success')).toContainText('Deal created');

    // Move deal through pipeline
    await page.goto('/deals');
    
    // Drag from Lead to Qualified
    const dealCard = page.locator('[data-testid="deal-card"]:has-text("Enterprise Package")');
    const qualifiedStage = page.locator('[data-testid="stage"]:has-text("Qualified")');
    await dealCard.dragTo(qualifiedStage);

    await expect(qualifiedStage.locator('[data-testid="deal-card"]')).toContainText('Enterprise Package');

    // Log activity
    await dealCard.click();
    await page.click('button:has-text("Log Call")');
    await page.fill('[name="subject"]', 'Discovery call - requirements gathering');
    await page.fill('[name="duration"]', '45');
    await page.fill('[name="description"]', 'Discussed technical requirements and budget');
    await page.click('button:has-text("Save")');

    await expect(page.locator('[data-testid="activity-timeline"]')).toContainText('Discovery call');

    // Mark deal as won
    await page.click('button:has-text("Mark as Won")');
    await page.click('button:has-text("Confirm")');

    // Verify contact status updated
    await page.goto('/contacts');
    await expect(page.locator('[data-testid="contact-card"]:has-text("Prospect Lead")')).toContainText('CUSTOMER');
  });

  test('pipeline drag and drop', async ({ page }) => {
    await page.goto('/deals');

    // Wait for pipeline to load
    await page.waitForSelector('[data-testid="deal-card"]');

    // Count deals in Lead stage
    const leadDeals = await page.locator('[data-testid="stage"]:has-text("Lead") [data-testid="deal-card"]').count();

    // Drag first deal to Qualified
    const dealCard = page.locator('[data-testid="stage"]:has-text("Lead") [data-testid="deal-card"]').first();
    const qualifiedStage = page.locator('[data-testid="stage"]:has-text("Qualified")');
    
    await dealCard.dragTo(qualifiedStage);

    // Verify deal moved
    const newLeadCount = await page.locator('[data-testid="stage"]:has-text("Lead") [data-testid="deal-card"]').count();
    expect(newLeadCount).toBe(leadDeals - 1);
  });

  test('contact search and filter', async ({ page }) => {
    await page.goto('/contacts');
    
    // Search by name
    await page.fill('[placeholder="Search contacts..."]', 'John');
    await expect(page.locator('[data-testid="contact-card"]')).toContainText('John');
    
    // Clear search
    await page.fill('[placeholder="Search contacts..."]', '');
    
    // Filter by status
    await page.click('[data-testid="status-filter"]');
    await page.click('[data-value="CUSTOMER"]');
    
    // Verify all visible contacts are customers
    const statuses = await page.locator('[data-testid="contact-card"] [data-testid="status-badge"]').allTextContents();
    expect(statuses.every(s => s === 'CUSTOMER')).toBe(true);
  });

  test('activity logging', async ({ page }) => {
    await page.goto('/contacts');
    await page.click('[data-testid="contact-card"]').first();

    // Log email
    await page.click('button:has-text("Log Activity")');
    await page.click('[data-value="EMAIL"]');
    await page.fill('[name="subject"]', 'Sent pricing proposal');
    await page.fill('[name="description"]', 'Attached enterprise pricing sheet');
    await page.click('button:has-text("Save")');

    await expect(page.locator('[data-testid="activity-timeline"]').first()).toContainText('Sent pricing proposal');

    // Log meeting
    await page.click('button:has-text("Log Activity")');
    await page.click('[data-value="MEETING"]');
    await page.fill('[name="subject"]', 'Product demo');
    await page.fill('[name="duration"]', '60');
    await page.click('button:has-text("Save")');

    await expect(page.locator('[data-testid="activity-timeline"]').first()).toContainText('Product demo');
  });
});
```

```typescript
// tests/e2e/reports.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Sales Reports', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'sales@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('displays pipeline overview', async ({ page }) => {
    await page.goto('/reports');

    await expect(page.locator('[data-testid="pipeline-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="weighted-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="deal-count"]')).toBeVisible();
  });

  test('displays win/loss metrics', async ({ page }) => {
    await page.goto('/reports');

    await expect(page.locator('[data-testid="won-deals"]')).toBeVisible();
    await expect(page.locator('[data-testid="lost-deals"]')).toBeVisible();
    await expect(page.locator('[data-testid="win-rate"]')).toBeVisible();
  });

  test('revenue chart is interactive', async ({ page }) => {
    await page.goto('/reports');

    const chart = page.locator('[data-testid="revenue-chart"]');
    await expect(chart).toBeVisible();

    // Hover over chart point
    await chart.hover({ position: { x: 100, y: 100 } });
    await expect(page.locator('[data-testid="chart-tooltip"]')).toBeVisible();
  });

  test('top performers list', async ({ page }) => {
    await page.goto('/reports');

    const performers = page.locator('[data-testid="top-performers"] [data-testid="performer-row"]');
    await expect(performers.first()).toBeVisible();
    
    // Should show name, deals count, and revenue
    await expect(performers.first()).toContainText(/\$[\d,]+/);
  });
});
```

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('CRM Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'sales@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
  });

  test('contacts page has no accessibility violations', async ({ page }) => {
    await page.goto('/contacts');
    await page.waitForSelector('[data-testid="contact-card"]');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('deals pipeline has no accessibility violations', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForSelector('[data-testid="deal-card"]');

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('keyboard navigation through pipeline', async ({ page }) => {
    await page.goto('/deals');
    await page.waitForSelector('[data-testid="deal-card"]');

    // Tab through stages
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('screen reader announces deal movement', async ({ page }) => {
    await page.goto('/deals');
    
    const liveRegion = page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();
  });
});
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Error Handling

### Error Boundary

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
      tags: { component: 'crm' },
      extra: { componentStack: errorInfo.componentStack },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert" className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          </div>
          <p className="text-red-600 mb-4">{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Page

```typescript
// app/error.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-4">
          We've been notified and are working on a fix.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4">Error ID: {error.digest}</p>
        )}
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try again
          </button>
          <a href="/dashboard" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Go to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
```

### CRM-Specific Error Classes

```typescript
// lib/errors/crm-errors.ts
export class CRMError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'CRMError';
  }
}

export class ContactNotFoundError extends CRMError {
  constructor(contactId: string) {
    super(`Contact not found: ${contactId}`, 'CONTACT_NOT_FOUND', 404);
    this.name = 'ContactNotFoundError';
  }
}

export class DealNotFoundError extends CRMError {
  constructor(dealId: string) {
    super(`Deal not found: ${dealId}`, 'DEAL_NOT_FOUND', 404);
    this.name = 'DealNotFoundError';
  }
}

export class InvalidStageTransitionError extends CRMError {
  constructor(currentStage: string, targetStage: string) {
    super(
      `Invalid stage transition from ${currentStage} to ${targetStage}`,
      'INVALID_STAGE_TRANSITION',
      400
    );
    this.name = 'InvalidStageTransitionError';
  }
}

export class DuplicateContactError extends CRMError {
  constructor(email: string) {
    super(
      `Contact with email ${email} already exists`,
      'DUPLICATE_CONTACT',
      409
    );
    this.name = 'DuplicateContactError';
  }
}

export class UnauthorizedAccessError extends CRMError {
  constructor(resource: string) {
    super(
      `You don't have permission to access this ${resource}`,
      'UNAUTHORIZED_ACCESS',
      403
    );
    this.name = 'UnauthorizedAccessError';
  }
}
```

### React Query Error Configuration

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { CRMError } from './errors/crm-errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof CRMError && error.statusCode < 500) return false;
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000,
    },
    mutations: {
      onError: (error) => {
        const message = error instanceof CRMError 
          ? error.message 
          : 'An error occurred';
        toast.error(message);
      },
    },
  },
});
```

## Accessibility

### WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|---------------|
| 1.1.1 Non-text Content | All icons have labels, avatars have alt text |
| 1.3.1 Info and Relationships | Semantic HTML for tables, lists |
| 1.4.1 Use of Color | Status badges include text labels |
| 1.4.3 Contrast | 4.5:1 minimum text contrast |
| 2.1.1 Keyboard | All interactive elements focusable |
| 2.1.2 No Keyboard Trap | Tab cycles through page correctly |
| 2.4.1 Bypass Blocks | Skip links provided |
| 2.4.7 Focus Visible | Clear focus indicators |
| 4.1.2 Name, Role, Value | ARIA labels on complex widgets |

### Skip Links

```typescript
// components/skip-links.tsx
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only focus-within:fixed focus-within:top-0 focus-within:left-0 focus-within:z-[100] focus-within:p-4 focus-within:bg-white">
      <a
        href="#main-content"
        className="block px-4 py-2 bg-blue-600 text-white rounded mb-2"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="block px-4 py-2 bg-blue-600 text-white rounded"
      >
        Skip to navigation
      </a>
    </div>
  );
}
```

### Accessible Pipeline

```typescript
// components/deals/accessible-pipeline.tsx
'use client';

import { useCallback } from 'react';

interface AccessiblePipelineProps {
  stages: Stage[];
  onMoveDeal: (dealId: string, stageId: string) => void;
}

export function AccessiblePipeline({ stages, onMoveDeal }: AccessiblePipelineProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, dealId: string, currentStageIndex: number) => {
      if (e.key === 'ArrowRight' && currentStageIndex < stages.length - 1) {
        e.preventDefault();
        onMoveDeal(dealId, stages[currentStageIndex + 1].id);
        announceStageChange(stages[currentStageIndex + 1].name);
      } else if (e.key === 'ArrowLeft' && currentStageIndex > 0) {
        e.preventDefault();
        onMoveDeal(dealId, stages[currentStageIndex - 1].id);
        announceStageChange(stages[currentStageIndex - 1].name);
      }
    },
    [stages, onMoveDeal]
  );

  return (
    <div role="application" aria-label="Deal pipeline">
      {stages.map((stage, stageIndex) => (
        <div
          key={stage.id}
          role="region"
          aria-label={`${stage.name} stage, ${stage.deals.length} deals`}
        >
          <h3 id={`stage-${stage.id}`}>{stage.name}</h3>
          <ul role="listbox" aria-labelledby={`stage-${stage.id}`}>
            {stage.deals.map((deal) => (
              <li
                key={deal.id}
                role="option"
                tabIndex={0}
                onKeyDown={(e) => handleKeyDown(e, deal.id, stageIndex)}
                aria-label={`${deal.name}, ${formatCurrency(deal.value)}`}
              >
                {deal.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div aria-live="polite" className="sr-only" id="pipeline-announcer" />
    </div>
  );
}

function announceStageChange(stageName: string) {
  const announcer = document.getElementById('pipeline-announcer');
  if (announcer) {
    announcer.textContent = `Moved to ${stageName}`;
  }
}
```

### Accessible Data Table

```typescript
// components/contacts/accessible-contacts-table.tsx
export function AccessibleContactsTable({ contacts }: { contacts: Contact[] }) {
  return (
    <table role="grid" aria-label="Contacts list">
      <thead>
        <tr>
          <th scope="col" aria-sort="none">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Company</th>
          <th scope="col">Status</th>
          <th scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody>
        {contacts.map((contact) => (
          <tr key={contact.id}>
            <td>
              <a href={`/contacts/${contact.id}`}>
                {contact.firstName} {contact.lastName}
              </a>
            </td>
            <td>{contact.email}</td>
            <td>{contact.company?.name || '-'}</td>
            <td>
              <span
                role="status"
                aria-label={`Status: ${contact.status}`}
              >
                {contact.status}
              </span>
            </td>
            <td>
              <button aria-label={`Actions for ${contact.firstName} ${contact.lastName}`}>
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Security

### Input Validation (Zod)

```typescript
// lib/validations/crm.ts
import { z } from 'zod';

export const contactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^[+\d\s()-]*$/, 'Invalid phone number').optional(),
  jobTitle: z.string().max(100).optional(),
  status: z.enum(['LEAD', 'QUALIFIED', 'CUSTOMER', 'CHURNED', 'INACTIVE']).optional(),
  companyId: z.string().uuid().optional(),
});

export const dealSchema = z.object({
  name: z.string().min(1, 'Deal name is required').max(200),
  value: z.number().min(0, 'Value must be positive'),
  currency: z.string().length(3).default('USD'),
  stageId: z.string().uuid(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().optional(),
  companyId: z.string().uuid().optional(),
  contactIds: z.array(z.string().uuid()).optional(),
});

export const activitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK']),
  subject: z.string().min(1, 'Subject is required').max(200),
  description: z.string().max(5000).optional(),
  duration: z.number().min(1).max(480).optional(),
  dueDate: z.string().datetime().optional(),
  contactId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
});
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const rateLimiters = {
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
  }),
  import: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
  }),
  export: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
  }),
};
```

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

## Performance

### Caching Strategies

```typescript
// app/api/contacts/route.ts
export async function GET(request: NextRequest) {
  const data = await getContacts();
  
  return Response.json(data, {
    headers: {
      'Cache-Control': 'private, s-maxage=60, stale-while-revalidate=300',
    },
  });
}
```

### React Query Optimization

```typescript
// hooks/use-contacts.ts
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

export function useContacts(filters: ContactFilters) {
  return useInfiniteQuery({
    queryKey: ['contacts', filters],
    queryFn: ({ pageParam = 0 }) => fetchContacts({ ...filters, offset: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    staleTime: 5 * 60 * 1000,
  });
}

// Prefetch on hover
export function usePrefetchContact() {
  const queryClient = useQueryClient();
  
  return useCallback((contactId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['contact', contactId],
      queryFn: () => fetchContact(contactId),
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);
}
```

### Dynamic Imports

```typescript
// components/deals/lazy-components.tsx
import dynamic from 'next/dynamic';

export const DealPipeline = dynamic(
  () => import('./deal-pipeline').then(mod => mod.DealPipeline),
  { loading: () => <PipelineSkeleton /> }
);

export const ReportsCharts = dynamic(
  () => import('./reports-charts'),
  { loading: () => <ChartSkeleton />, ssr: false }
);
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
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, unit-tests, e2e-tests]
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

### Package Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

## Monitoring

### Sentry Setup

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    new Sentry.Replay({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
```

### CRM-Specific Metrics

```typescript
// lib/monitoring/crm-metrics.ts
import { track } from '@vercel/analytics';
import * as Sentry from '@sentry/nextjs';

export function trackCRMEvent(event: string, properties?: Record<string, any>) {
  track(event, properties);
  Sentry.addBreadcrumb({
    category: 'crm',
    message: event,
    data: properties,
    level: 'info',
  });
}

// Usage
trackCRMEvent('deal_created', { value: 50000, stage: 'Lead' });
trackCRMEvent('deal_moved', { from: 'Lead', to: 'Qualified' });
trackCRMEvent('contact_converted', { from: 'LEAD', to: 'CUSTOMER' });
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: { database: 'up' },
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    );
  }
}
```

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Rate Limiting
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
SENTRY_AUTH_TOKEN=

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] All tests passing (unit, integration, E2E)
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error monitoring (Sentry) configured
- [ ] Analytics (Vercel) enabled
- [ ] Performance optimizations applied
- [ ] Accessibility audit passed
- [ ] CI/CD pipeline configured

## Related Skills

- [Data Tables](../patterns/data-tables.md) - Contact/company lists
- [Pipeline View](../patterns/pipeline-view.md) - Deal stages
- [Activity Timeline](../patterns/activity-timeline.md) - Activity tracking
- [Search Filters](../patterns/search-filters.md) - Advanced filtering
- [Charts](../patterns/charts.md) - Reporting

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to god-tier template
- Added comprehensive Testing section with MSW handlers
- Added 25+ unit tests for deals, contacts, activities, tasks
- Added integration tests for contact management, pipeline, reports
- Added E2E tests with Playwright for full sales cycle
- Added Error Handling section with CRM-specific error classes
- Added Accessibility section with WCAG 2.1 AA compliance
- Added accessible pipeline and data table components
- Added Security section with Zod validations
- Added Performance section with caching and React Query optimization
- Added CI/CD section with GitHub Actions
- Added Monitoring section with CRM-specific metrics

### 1.0.0 (2025-01-17)
- Initial implementation with contacts, companies, deals
- Deal pipeline with drag-and-drop
- Activity tracking and timeline
- Contact/company detail views
- Sales reporting dashboard
- Task management
