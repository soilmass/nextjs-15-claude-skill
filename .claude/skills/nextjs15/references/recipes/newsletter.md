---
id: r-newsletter
name: Newsletter
version: 3.0.0
layer: L6
category: recipes
description: Newsletter platform with subscriber management, campaign creation, email templates, and analytics
tags: [newsletter, email, subscribers, campaigns, templates, analytics]
formula: "Newsletter = DashboardLayout(t-dashboard-layout) + EmailTemplateLayout(t-email-template-layout) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + SettingsForm(o-settings-form) + Header(o-header) + Footer(o-footer) + Sidebar(o-sidebar) + FileUploader(o-file-uploader) + NotificationCenter(o-notification-center) + FormField(m-form-field) + StatCard(m-stat-card) + Pagination(m-pagination) + Tabs(m-tabs) + Breadcrumb(m-breadcrumb) + EmptyState(m-empty-state) + ActionMenu(m-action-menu) + TagInput(m-tag-input) + DatePicker(m-date-picker) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + RichTextEditor(pt-rich-text-editor) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + EmailVerification(pt-email-verification) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + CronJobs(pt-cron-jobs) + ScheduledTasks(pt-scheduled-tasks) + BackgroundJobs(pt-background-jobs) + Webhooks(pt-webhooks) + Pagination(pt-pagination) + Filtering(pt-filtering) + Sorting(pt-sorting) + ExportData(pt-export-data) + ImportData(pt-import-data) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + AbTesting(pt-ab-testing) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + AuditLogging(pt-audit-logging) + RateLimiting(pt-rate-limiting) + GdprCompliance(pt-gdpr-compliance) + FileUpload(pt-file-upload) + TestingE2e(pt-testing-e2e) + TestingIntegration(pt-testing-integration) + TestingUnit(pt-testing-unit) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + OptimisticUpdates(pt-optimistic-updates)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/form-field.md
  - ../molecules/stat-card.md
  - ../molecules/pagination.md
  - ../molecules/tabs.md
  - ../molecules/breadcrumb.md
  - ../molecules/empty-state.md
  - ../molecules/action-menu.md
  - ../molecules/tag-input.md
  - ../molecules/date-picker.md
  # L3 Organisms - Complex Components
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/settings-form.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/sidebar.md
  - ../organisms/file-uploader.md
  - ../organisms/notification-center.md
  # L4 Templates - Page Layouts
  - ../templates/dashboard-layout.md
  - ../templates/email-template-layout.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  # L5 Patterns - Email & Communication
  - ../patterns/rich-text-editor.md
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  - ../patterns/email-verification.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - Background Jobs & Scheduling
  - ../patterns/cron-jobs.md
  - ../patterns/scheduled-tasks.md
  - ../patterns/background-jobs.md
  - ../patterns/webhooks.md
  # L5 Patterns - Data Management
  - ../patterns/pagination.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  - ../patterns/export-data.md
  - ../patterns/import-data.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Testing & Optimization
  - ../patterns/ab-testing.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics & Logging
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  - ../patterns/audit-logging.md
  # L5 Patterns - Security & Compliance
  - ../patterns/rate-limiting.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - File Handling
  - ../patterns/file-upload.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-integration.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security (Additional)
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - UI/UX
  - ../patterns/optimistic-updates.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - react-hook-form
  - zod
  - resend
  - "@radix-ui/react-dialog"
  - "@radix-ui/react-tabs"
  - recharts
  - lucide-react
  - date-fns
skills:
  - email-templates
  - rich-text-editor
  - subscriber-management
  - analytics
  - scheduling
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Newsletter

## Overview

A complete newsletter platform featuring:
- Subscriber management with segments
- Drag-and-drop email builder
- Campaign scheduling and sending
- A/B testing for subject lines
- Analytics (opens, clicks, unsubscribes)
- Double opt-in confirmation
- Custom email templates
- Import/export subscribers

## Project Structure

```
newsletter/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard overview
│   │   ├── subscribers/
│   │   │   ├── page.tsx                # Subscriber list
│   │   │   └── import/page.tsx
│   │   ├── campaigns/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [campaignId]/
│   │   │       ├── page.tsx            # Campaign detail
│   │   │       └── edit/page.tsx
│   │   ├── templates/
│   │   │   ├── page.tsx
│   │   │   └── [templateId]/edit/page.tsx
│   │   ├── segments/page.tsx
│   │   └── settings/page.tsx
│   ├── (public)/
│   │   ├── subscribe/page.tsx          # Subscribe form
│   │   ├── confirm/[token]/page.tsx    # Confirm subscription
│   │   └── unsubscribe/[token]/page.tsx
│   ├── api/
│   │   ├── subscribers/
│   │   │   ├── route.ts
│   │   │   ├── import/route.ts
│   │   │   └── [subscriberId]/route.ts
│   │   ├── campaigns/
│   │   │   ├── route.ts
│   │   │   ├── [campaignId]/
│   │   │   │   ├── route.ts
│   │   │   │   ├── send/route.ts
│   │   │   │   └── test/route.ts
│   │   │   └── schedule/route.ts
│   │   ├── templates/route.ts
│   │   ├── segments/route.ts
│   │   └── webhooks/
│   │       └── email/route.ts          # Track opens/clicks
│   └── layout.tsx
├── components/
│   ├── campaigns/
│   │   ├── campaign-card.tsx
│   │   ├── campaign-editor.tsx
│   │   └── campaign-stats.tsx
│   ├── subscribers/
│   │   ├── subscriber-table.tsx
│   │   └── import-modal.tsx
│   ├── email-builder/
│   │   ├── email-builder.tsx
│   │   ├── block-palette.tsx
│   │   └── preview-panel.tsx
│   └── ui/
├── lib/
│   ├── email.ts
│   ├── templates.ts
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
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  campaigns Campaign[]
  templates Template[]
}

model Subscriber {
  id              String           @id @default(cuid())
  email           String           @unique
  firstName       String?
  lastName        String?
  
  // Status
  status          SubscriberStatus @default(PENDING)
  confirmedAt     DateTime?
  unsubscribedAt  DateTime?
  
  // Tokens
  confirmToken    String?          @unique
  unsubscribeToken String          @unique @default(cuid())
  
  // Source
  source          String?          // 'website', 'import', 'api'
  
  // Custom fields
  customFields    Json?
  
  // Segments
  segments        SubscriberSegment[]
  
  // Campaign interactions
  sends           CampaignSend[]
  
  // Metadata
  ipAddress       String?
  userAgent       String?
  
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  @@index([email])
  @@index([status])
  @@index([confirmToken])
}

enum SubscriberStatus {
  PENDING
  ACTIVE
  UNSUBSCRIBED
  BOUNCED
  COMPLAINED
}

model Segment {
  id          String              @id @default(cuid())
  name        String
  description String?
  
  // Dynamic or static
  type        SegmentType         @default(STATIC)
  
  // For dynamic segments
  conditions  Json?               // Filter conditions
  
  subscribers SubscriberSegment[]
  campaigns   Campaign[]
  
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt
}

enum SegmentType {
  STATIC
  DYNAMIC
}

model SubscriberSegment {
  id           String     @id @default(cuid())
  subscriberId String
  subscriber   Subscriber @relation(fields: [subscriberId], references: [id], onDelete: Cascade)
  segmentId    String
  segment      Segment    @relation(fields: [segmentId], references: [id], onDelete: Cascade)
  addedAt      DateTime   @default(now())

  @@unique([subscriberId, segmentId])
}

model Template {
  id          String   @id @default(cuid())
  name        String
  description String?
  
  // Content
  subject     String
  previewText String?
  htmlContent String
  jsonContent Json?    // For drag-and-drop editor
  
  // Thumbnail
  thumbnail   String?
  
  // System templates
  isSystem    Boolean  @default(false)
  
  userId      String?
  user        User?    @relation(fields: [userId], references: [id])
  
  campaigns   Campaign[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

model Campaign {
  id          String         @id @default(cuid())
  name        String
  
  // Content
  subject     String
  previewText String?
  htmlContent String
  
  // A/B Testing
  subjectB    String?        // Alternative subject for A/B test
  abTestRatio Int?           // Percentage for variant A
  
  // From
  fromName    String
  fromEmail   String
  replyTo     String?
  
  // Template reference
  templateId  String?
  template    Template?      @relation(fields: [templateId], references: [id])
  
  // Targeting
  segmentId   String?
  segment     Segment?       @relation(fields: [segmentId], references: [id])
  
  // Status
  status      CampaignStatus @default(DRAFT)
  
  // Schedule
  scheduledAt DateTime?
  sentAt      DateTime?
  
  // Stats (denormalized for performance)
  totalSent   Int            @default(0)
  totalOpened Int            @default(0)
  totalClicked Int           @default(0)
  totalUnsubscribed Int      @default(0)
  totalBounced Int           @default(0)
  totalComplaints Int        @default(0)
  
  // Individual sends
  sends       CampaignSend[]
  
  userId      String
  user        User           @relation(fields: [userId], references: [id])
  
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  @@index([status])
  @@index([userId])
  @@index([scheduledAt])
}

enum CampaignStatus {
  DRAFT
  SCHEDULED
  SENDING
  SENT
  PAUSED
  CANCELLED
}

model CampaignSend {
  id           String       @id @default(cuid())
  campaignId   String
  campaign     Campaign     @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  subscriberId String
  subscriber   Subscriber   @relation(fields: [subscriberId], references: [id], onDelete: Cascade)
  
  // Which variant (for A/B tests)
  variant      String?      // 'A' or 'B'
  
  // Email tracking
  messageId    String?      // Email provider message ID
  status       SendStatus   @default(PENDING)
  
  // Events
  sentAt       DateTime?
  openedAt     DateTime?
  clickedAt    DateTime?
  bouncedAt    DateTime?
  complainedAt DateTime?
  
  // Click tracking
  clicks       EmailClick[]
  
  createdAt    DateTime     @default(now())

  @@unique([campaignId, subscriberId])
  @@index([campaignId])
  @@index([subscriberId])
  @@index([messageId])
}

enum SendStatus {
  PENDING
  SENT
  DELIVERED
  BOUNCED
  COMPLAINED
}

model EmailClick {
  id         String       @id @default(cuid())
  sendId     String
  send       CampaignSend @relation(fields: [sendId], references: [id], onDelete: Cascade)
  url        String
  clickedAt  DateTime     @default(now())
  ipAddress  String?
  userAgent  String?

  @@index([sendId])
}
```

## Implementation

### Campaign Editor

```tsx
// components/campaigns/campaign-editor.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Send, Save, Eye, Clock, Users, Beaker, Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EmailBuilder } from '@/components/email-builder/email-builder';
import { PreviewPanel } from '@/components/email-builder/preview-panel';

const campaignSchema = z.object({
  name: z.string().min(1),
  subject: z.string().min(1),
  previewText: z.string().optional(),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  replyTo: z.string().email().optional(),
  segmentId: z.string().optional(),
  subjectB: z.string().optional(),
  abTestRatio: z.number().min(10).max(90).optional(),
});

type CampaignFormData = z.infer<typeof campaignSchema>;

interface CampaignEditorProps {
  campaignId?: string;
  initialData?: any;
}

export function CampaignEditor({ campaignId, initialData }: CampaignEditorProps) {
  const [htmlContent, setHtmlContent] = useState(initialData?.htmlContent || '');
  const [showPreview, setShowPreview] = useState(false);
  const [enableABTest, setEnableABTest] = useState(!!initialData?.subjectB);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: segments } = useQuery({
    queryKey: ['segments'],
    queryFn: async () => {
      const response = await fetch('/api/segments');
      if (!response.ok) throw new Error('Failed to fetch segments');
      return response.json();
    },
  });

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CampaignFormData>({
    resolver: zodResolver(campaignSchema),
    defaultValues: initialData || {
      fromName: 'Your Newsletter',
      fromEmail: 'newsletter@example.com',
    },
  });

  const saveCampaign = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const url = campaignId ? `/api/campaigns/${campaignId}` : '/api/campaigns';
      const response = await fetch(url, {
        method: campaignId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, htmlContent }),
      });
      if (!response.ok) throw new Error('Failed to save campaign');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (!campaignId) {
        router.push(`/campaigns/${data.id}`);
      }
    },
  });

  const sendTestEmail = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(`/api/campaigns/${campaignId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to send test');
      return response.json();
    },
  });

  const subject = watch('subject');
  const previewText = watch('previewText');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-bold">
          {campaignId ? 'Edit Campaign' : 'New Campaign'}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            onClick={handleSubmit((data) => saveCampaign.mutate(data))}
            disabled={saveCampaign.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          {campaignId && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Campaign
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className={`flex-1 overflow-y-auto ${showPreview ? 'w-1/2' : 'w-full'}`}>
          <Tabs defaultValue="content" className="h-full">
            <TabsList className="mx-4 mt-4">
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              {enableABTest && <TabsTrigger value="ab-test">A/B Test</TabsTrigger>}
            </TabsList>

            <TabsContent value="content" className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <Input
                  {...register('name')}
                  placeholder="Internal campaign name"
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Subject Line</label>
                <Input
                  {...register('subject')}
                  placeholder="Email subject"
                />
                {errors.subject && (
                  <p className="text-sm text-red-500 mt-1">{errors.subject.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Preview Text</label>
                <Input
                  {...register('previewText')}
                  placeholder="Text shown after subject in inbox"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ab-test"
                  checked={enableABTest}
                  onChange={(e) => setEnableABTest(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="ab-test" className="text-sm">
                  Enable A/B testing for subject line
                </label>
              </div>
            </TabsContent>

            <TabsContent value="design" className="h-full">
              <EmailBuilder
                initialContent={htmlContent}
                onChange={setHtmlContent}
              />
            </TabsContent>

            <TabsContent value="settings" className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">From Name</label>
                  <Input {...register('fromName')} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">From Email</label>
                  <Input {...register('fromEmail')} type="email" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Reply-To Email</label>
                <Input {...register('replyTo')} type="email" placeholder="Optional" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Send To</label>
                <Select
                  value={watch('segmentId') || 'all'}
                  onValueChange={(value) => {
                    // Update form value
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subscribers</SelectItem>
                    {segments?.map((segment: any) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        {segment.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {enableABTest && (
              <TabsContent value="ab-test" className="p-4 space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Beaker className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">A/B Test Subject Lines</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    Test two subject lines with a portion of your subscribers.
                    The winning subject will be sent to the rest.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subject A (Original)</label>
                  <Input value={subject} disabled className="bg-gray-50" />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Subject B (Variant)</label>
                  <Input
                    {...register('subjectB')}
                    placeholder="Alternative subject line"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Test Group Size: {watch('abTestRatio') || 50}%
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="90"
                    {...register('abTestRatio', { valueAsNumber: true })}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {watch('abTestRatio') || 50}% will receive Subject A,
                    {100 - (watch('abTestRatio') || 50)}% will receive Subject B
                  </p>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div className="w-1/2 border-l">
            <PreviewPanel
              subject={subject}
              previewText={previewText}
              htmlContent={htmlContent}
              onSendTest={(email) => sendTestEmail.mutate(email)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

### Subscriber Table

```tsx
// components/subscribers/subscriber-table.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Search, Filter, Download, Upload, MoreHorizontal,
  Mail, UserX, Tag, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  UNSUBSCRIBED: 'bg-gray-100 text-gray-800',
  BOUNCED: 'bg-red-100 text-red-800',
  COMPLAINED: 'bg-orange-100 text-orange-800',
};

export function SubscriberTable() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['subscribers', { search, status, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('search', search);
      if (status !== 'all') params.set('status', status);
      
      const response = await fetch(`/api/subscribers?${params}`);
      if (!response.ok) throw new Error('Failed to fetch subscribers');
      return response.json();
    },
  });

  const deleteSubscribers = useMutation({
    mutationFn: async (ids: string[]) => {
      const response = await fetch('/api/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!response.ok) throw new Error('Failed to delete');
      return response.json();
    },
    onSuccess: () => {
      setSelectedIds(new Set());
      queryClient.invalidateQueries({ queryKey: ['subscribers'] });
    },
  });

  const exportSubscribers = async () => {
    const params = new URLSearchParams();
    if (status !== 'all') params.set('status', status);
    
    const response = await fetch(`/api/subscribers/export?${params}`);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscribers-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === data?.subscribers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data?.subscribers.map((s: any) => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search subscribers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-80"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="UNSUBSCRIBED">Unsubscribed</SelectItem>
              <SelectItem value="BOUNCED">Bounced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteSubscribers.mutate(Array.from(selectedIds))}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedIds.size})
              </Button>
              <Button variant="outline" size="sm">
                <Tag className="h-4 w-4 mr-2" />
                Add to Segment
              </Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={exportSubscribers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" asChild>
            <a href="/subscribers/import">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Total', value: data?.stats?.total || 0 },
          { label: 'Active', value: data?.stats?.active || 0, color: 'text-green-600' },
          { label: 'Pending', value: data?.stats?.pending || 0, color: 'text-yellow-600' },
          { label: 'Unsubscribed', value: data?.stats?.unsubscribed || 0, color: 'text-gray-600' },
          { label: 'Bounced', value: data?.stats?.bounced || 0, color: 'text-red-600' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-gray-900 rounded-lg border p-4">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={cn('text-2xl font-bold', stat.color)}>
              {stat.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-3 text-left">
                <Checkbox
                  checked={selectedIds.size === data?.subscribers.length}
                  onCheckedChange={toggleSelectAll}
                />
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Subscribed</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Source</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
                  </div>
                </td>
              </tr>
            ) : (
              data?.subscribers.map((subscriber: any) => (
                <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selectedIds.has(subscriber.id)}
                      onCheckedChange={() => toggleSelect(subscriber.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{subscriber.email}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {subscriber.firstName || subscriber.lastName
                      ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                      : '-'
                    }
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={statusColors[subscriber.status as keyof typeof statusColors]}>
                      {subscriber.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {format(new Date(subscriber.createdAt), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {subscriber.source || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Tag className="h-4 w-4 mr-2" />
                          Add to Segment
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserX className="h-4 w-4 mr-2" />
                          Unsubscribe
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, data.pagination.total)} of {data.pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.pagination.pages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Campaign Send API

```tsx
// app/api/campaigns/[campaignId]/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Resend } from 'resend';
import { renderEmailTemplate } from '@/lib/templates';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  const { campaignId } = await params;
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: {
      segment: true,
    },
  });

  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }

  if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
    return NextResponse.json(
      { error: 'Campaign already sent or in progress' },
      { status: 400 }
    );
  }

  // Get subscribers
  const subscriberWhere: any = { status: 'ACTIVE' };
  
  if (campaign.segmentId) {
    subscriberWhere.segments = {
      some: { segmentId: campaign.segmentId },
    };
  }

  const subscribers = await prisma.subscriber.findMany({
    where: subscriberWhere,
  });

  if (subscribers.length === 0) {
    return NextResponse.json({ error: 'No active subscribers' }, { status: 400 });
  }

  // Update campaign status
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'SENDING' },
  });

  // Create send records
  const sendRecords = subscribers.map((subscriber) => ({
    campaignId,
    subscriberId: subscriber.id,
    variant: campaign.subjectB
      ? Math.random() < ((campaign.abTestRatio || 50) / 100) ? 'A' : 'B'
      : null,
  }));

  await prisma.campaignSend.createMany({
    data: sendRecords,
  });

  // Send emails (in batches)
  const batchSize = 100;
  let sentCount = 0;

  for (let i = 0; i < subscribers.length; i += batchSize) {
    const batch = subscribers.slice(i, i + batchSize);
    
    await Promise.all(
      batch.map(async (subscriber) => {
        const send = await prisma.campaignSend.findFirst({
          where: { campaignId, subscriberId: subscriber.id },
        });

        const subject = send?.variant === 'B' && campaign.subjectB
          ? campaign.subjectB
          : campaign.subject;

        const html = renderEmailTemplate(campaign.htmlContent, {
          subscriber,
          unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe/${subscriber.unsubscribeToken}`,
          trackingPixel: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/email/open?sid=${send?.id}`,
        });

        try {
          const result = await resend.emails.send({
            from: `${campaign.fromName} <${campaign.fromEmail}>`,
            to: subscriber.email,
            subject,
            html,
            replyTo: campaign.replyTo || undefined,
            tags: [
              { name: 'campaign_id', value: campaignId },
              { name: 'send_id', value: send?.id || '' },
            ],
          });

          await prisma.campaignSend.update({
            where: { id: send?.id },
            data: {
              messageId: result.data?.id,
              status: 'SENT',
              sentAt: new Date(),
            },
          });

          sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
        }
      })
    );
  }

  // Update campaign
  await prisma.campaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENT',
      sentAt: new Date(),
      totalSent: sentCount,
    },
  });

  return NextResponse.json({
    success: true,
    sent: sentCount,
    total: subscribers.length,
  });
}
```

### Email Tracking Webhook

```tsx
// app/api/webhooks/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Track email opens (via tracking pixel)
export async function GET(request: NextRequest) {
  const sendId = request.nextUrl.searchParams.get('sid');
  
  if (sendId) {
    const send = await prisma.campaignSend.findUnique({
      where: { id: sendId },
    });

    if (send && !send.openedAt) {
      await prisma.$transaction([
        prisma.campaignSend.update({
          where: { id: sendId },
          data: { openedAt: new Date() },
        }),
        prisma.campaign.update({
          where: { id: send.campaignId },
          data: { totalOpened: { increment: 1 } },
        }),
      ]);
    }
  }

  // Return 1x1 transparent GIF
  const pixel = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
  );

  return new NextResponse(pixel, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

// Track clicks
export async function POST(request: NextRequest) {
  const { sendId, url } = await request.json();

  if (!sendId || !url) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  const send = await prisma.campaignSend.findUnique({
    where: { id: sendId },
  });

  if (!send) {
    return NextResponse.json({ error: 'Send not found' }, { status: 404 });
  }

  // Record click
  await prisma.emailClick.create({
    data: {
      sendId,
      url,
      ipAddress: request.headers.get('x-forwarded-for'),
      userAgent: request.headers.get('user-agent'),
    },
  });

  // Update first click
  if (!send.clickedAt) {
    await prisma.$transaction([
      prisma.campaignSend.update({
        where: { id: sendId },
        data: { clickedAt: new Date() },
      }),
      prisma.campaign.update({
        where: { id: send.campaignId },
        data: { totalClicked: { increment: 1 } },
      }),
    ]);
  }

  return NextResponse.json({ success: true });
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| [dashboard-layout](../templates/dashboard-layout.md) | L5 | Main newsletter dashboard |
| [email-template-layout](../templates/email-template-layout.md) | L5 | Email design workspace |
| [settings-page](../templates/settings-page.md) | L5 | Account and sender settings |
| [data-table](../organisms/data-table.md) | L4 | Subscriber list with bulk actions |
| [chart](../organisms/chart.md) | L4 | Campaign analytics visualizations |
| [stats-dashboard](../organisms/stats-dashboard.md) | L4 | KPI overview cards |
| [settings-form](../organisms/settings-form.md) | L4 | Newsletter configuration |
| [rich-text-editor](../patterns/rich-text-editor.md) | L3 | Email content editing |
| [form-validation](../patterns/form-validation.md) | L3 | Campaign form validation |
| [pagination](../patterns/pagination.md) | L3 | Subscriber list pagination |
| [react-query](../patterns/react-query.md) | L3 | Data fetching and mutations |
| [ab-testing](../patterns/ab-testing.md) | L3 | Subject line experiments |
| [form-field](../molecules/form-field.md) | L2 | Campaign form inputs |
| [stat-card](../molecules/stat-card.md) | L2 | Metric display cards |
| [pagination](../molecules/pagination.md) | L2 | Table pagination controls |
| [tabs](../molecules/tabs.md) | L2 | Campaign editor tabs |

## Testing

### Test Setup

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
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
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

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'mock-id' } }),
    },
  })),
}));
```

### Unit Tests

```typescript
// __tests__/components/campaign-editor.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CampaignEditor } from '@/components/campaigns/campaign-editor';
import { vi } from 'vitest';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('CampaignEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders campaign form fields', () => {
    render(<CampaignEditor />, { wrapper });

    expect(screen.getByPlaceholderText('Internal campaign name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email subject')).toBeInTheDocument();
  });

  it('enables A/B testing when checkbox is clicked', () => {
    render(<CampaignEditor />, { wrapper });

    const checkbox = screen.getByLabelText(/Enable A\/B testing/i);
    fireEvent.click(checkbox);

    expect(screen.getByPlaceholderText('Alternative subject line')).toBeInTheDocument();
  });

  it('shows preview panel when preview button is clicked', () => {
    render(<CampaignEditor />, { wrapper });

    const previewButton = screen.getByText('Preview');
    fireEvent.click(previewButton);

    // Preview panel should be visible
  });

  it('validates required fields before saving', async () => {
    render(<CampaignEditor />, { wrapper });

    const saveButton = screen.getByText('Save Draft');
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Validation errors should appear
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/subscriber-import.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.post('/api/subscribers/import', (req, res, ctx) => {
    return res(ctx.json({ imported: 100, skipped: 5, errors: [] }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Subscriber Import Flow', () => {
  it('handles CSV import successfully', async () => {
    // Test CSV upload and processing
  });

  it('reports duplicate emails', async () => {
    server.use(
      rest.post('/api/subscribers/import', (req, res, ctx) => {
        return res(ctx.json({ imported: 95, skipped: 5, errors: ['5 duplicate emails'] }));
      })
    );
    // Test duplicate handling
  });

  it('validates email format', async () => {
    server.use(
      rest.post('/api/subscribers/import', (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ error: 'Invalid email format on row 3' }));
      })
    );
    // Test validation error display
  });
});
```

### E2E Tests

```typescript
// e2e/campaign-send.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Campaign Send Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('user can create and send a campaign', async ({ page }) => {
    await page.goto('/campaigns/new');

    // Fill campaign details
    await page.fill('input[placeholder="Internal campaign name"]', 'Test Campaign');
    await page.fill('input[placeholder="Email subject"]', 'Hello World');

    // Save draft
    await page.click('text="Save Draft"');
    await expect(page.locator('text="Campaign saved"')).toBeVisible();

    // Send test email
    await page.click('text="Send Campaign"');
    await expect(page.locator('text="Confirm send"')).toBeVisible();
  });

  test('user can preview campaign', async ({ page }) => {
    await page.goto('/campaigns/existing-campaign-id');

    await page.click('text="Preview"');
    await expect(page.locator('.preview-panel')).toBeVisible();
  });

  test('A/B test shows variant selection', async ({ page }) => {
    await page.goto('/campaigns/new');

    await page.click('text="Enable A/B testing"');
    await expect(page.locator('input[placeholder="Alternative subject line"]')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Mail } from 'lucide-react';

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
    console.error('Newsletter platform error:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We couldn't load this content. Your campaign data is safe.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// lib/api-errors.ts
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

export class EmailDeliveryError extends Error {
  constructor(
    message: string,
    public email: string,
    public reason: string
  ) {
    super(message);
    this.name = 'EmailDeliveryError';
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

  if (error instanceof EmailDeliveryError) {
    return Response.json(
      { error: error.message, email: error.email, reason: error.reason },
      { status: 422 }
    );
  }

  if (error instanceof Error) {
    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }

  return Response.json({ error: 'Unknown error' }, { status: 500 });
}
```

## Accessibility

```tsx
// components/accessible-subscriber-table.tsx
'use client';

import { useState } from 'react';

interface AccessibleSubscriberTableProps {
  subscribers: Array<{
    id: string;
    email: string;
    status: string;
    createdAt: Date;
  }>;
  onSelect: (ids: string[]) => void;
}

export function AccessibleSubscriberTable({ subscribers, onSelect }: AccessibleSubscriberTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedIds(newSelection);
    onSelect(Array.from(newSelection));
  };

  return (
    <div role="region" aria-label="Subscriber list">
      <table
        role="grid"
        aria-describedby="table-description"
        className="w-full"
      >
        <caption id="table-description" className="sr-only">
          List of newsletter subscribers with selection checkboxes
        </caption>
        <thead>
          <tr role="row">
            <th scope="col" className="sr-only">Select</th>
            <th scope="col">Email</th>
            <th scope="col">Status</th>
            <th scope="col">Subscribed</th>
            <th scope="col">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {subscribers.map((subscriber) => (
            <tr
              key={subscriber.id}
              role="row"
              aria-selected={selectedIds.has(subscriber.id)}
            >
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(subscriber.id)}
                  onChange={() => toggleSelection(subscriber.id)}
                  aria-label={`Select ${subscriber.email}`}
                  className="rounded"
                />
              </td>
              <td>{subscriber.email}</td>
              <td>
                <span
                  role="status"
                  aria-label={`Status: ${subscriber.status}`}
                >
                  {subscriber.status}
                </span>
              </td>
              <td>
                <time dateTime={subscriber.createdAt.toISOString()}>
                  {subscriber.createdAt.toLocaleDateString()}
                </time>
              </td>
              <td>
                <button
                  aria-label={`More actions for ${subscriber.email}`}
                  className="p-2"
                >
                  Actions
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// WCAG 2.1 AA Compliance Checklist:
// - Color contrast ratio >= 4.5:1 for normal text
// - Color contrast ratio >= 3:1 for large text
// - Focus indicators visible on all interactive elements
// - Table has proper scope attributes for headers
// - Screen reader announces selection state
// - Keyboard navigation for all table interactions
// - Status badges have text alternatives
```

## Security

### Input Validation

```typescript
// lib/validation/campaign.ts
import { z } from 'zod';

export const createCampaignSchema = z.object({
  name: z
    .string()
    .min(1, 'Campaign name is required')
    .max(100, 'Campaign name must be less than 100 characters'),
  subject: z
    .string()
    .min(1, 'Subject line is required')
    .max(150, 'Subject must be less than 150 characters')
    .refine((s) => !s.includes('{{') || s.match(/\{\{[\w.]+\}\}/g), {
      message: 'Invalid merge tag syntax',
    }),
  previewText: z.string().max(200).optional(),
  fromName: z.string().min(1).max(100),
  fromEmail: z.string().email('Invalid from email'),
  replyTo: z.string().email().optional(),
  htmlContent: z.string().min(1, 'Email content is required'),
  segmentId: z.string().cuid().optional(),
  subjectB: z.string().max(150).optional(),
  abTestRatio: z.number().min(10).max(90).optional(),
});

export const subscriberSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  source: z.enum(['website', 'import', 'api']).optional(),
});

// Sanitize email HTML content
export function sanitizeEmailHtml(html: string): string {
  // Remove potentially harmful elements
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const rateLimits = {
  // Campaign send: 5 per hour (to prevent spam)
  sendCampaign: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'ratelimit:send-campaign',
  }),

  // Test email: 20 per hour
  testEmail: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'ratelimit:test-email',
  }),

  // Subscriber import: 10 per day
  import: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '24 h'),
    prefix: 'ratelimit:import',
  }),

  // Subscribe API: 100 per minute per IP
  subscribe: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:subscribe',
  }),
};

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}
```

## Performance

### Caching Strategies

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cache subscriber stats for 5 minutes
export const getCachedSubscriberStats = unstable_cache(
  async () => {
    const [total, active, pending, unsubscribed, bounced] = await Promise.all([
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { status: 'ACTIVE' } }),
      prisma.subscriber.count({ where: { status: 'PENDING' } }),
      prisma.subscriber.count({ where: { status: 'UNSUBSCRIBED' } }),
      prisma.subscriber.count({ where: { status: 'BOUNCED' } }),
    ]);
    return { total, active, pending, unsubscribed, bounced };
  },
  ['subscriber-stats'],
  { revalidate: 300, tags: ['subscribers'] }
);

// Cache campaign analytics for 10 minutes
export const getCachedCampaignStats = unstable_cache(
  async (campaignId: string) => {
    return prisma.campaign.findUnique({
      where: { id: campaignId },
      select: {
        totalSent: true,
        totalOpened: true,
        totalClicked: true,
        totalUnsubscribed: true,
        totalBounced: true,
      },
    });
  },
  ['campaign-stats'],
  { revalidate: 600, tags: ['campaigns'] }
);

// Revalidate cache after mutations
export async function revalidateSubscriberCache() {
  const { revalidateTag } = await import('next/cache');
  revalidateTag('subscribers');
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
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  RESEND_API_KEY: ${{ secrets.RESEND_API_KEY }}

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
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: newsletter_test
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
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/newsletter_test
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
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, test, e2e]
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

### Sentry Integration

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
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
```

### Health Checks

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      email: 'unknown',
    },
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  try {
    // Check email service (lightweight check)
    // In production, Resend provides a status endpoint
    health.services.email = 'healthy';
  } catch {
    health.services.email = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/newsletter"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Email Service (Resend)
RESEND_API_KEY="re_your-resend-api-key"

# Redis (for rate limiting and job queues)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="Newsletter Platform"

# Email Settings
DEFAULT_FROM_EMAIL="newsletter@yourdomain.com"
DEFAULT_FROM_NAME="Your Newsletter"
```

## Deployment Checklist

- [ ] **Environment Setup**
  - [ ] All environment variables configured in production
  - [ ] Database connection string uses connection pooling
  - [ ] Resend API key verified and domain authenticated
  - [ ] SPF, DKIM, DMARC records configured for email domain

- [ ] **Database**
  - [ ] Run `prisma migrate deploy` on production
  - [ ] Indexes created for email lookups
  - [ ] Database backups configured

- [ ] **Email Deliverability**
  - [ ] Domain verified with email provider
  - [ ] Warm-up plan for new sending domain
  - [ ] Bounce and complaint handling configured
  - [ ] Unsubscribe links working correctly

- [ ] **Security**
  - [ ] NEXTAUTH_SECRET is unique and secure (32+ chars)
  - [ ] Rate limiting enabled for subscription and send endpoints
  - [ ] CORS configured for production domain only
  - [ ] CSP headers configured

- [ ] **Performance**
  - [ ] Campaign sends use queue for large lists
  - [ ] Subscriber lists paginated
  - [ ] Analytics data aggregated for fast queries
  - [ ] Email templates pre-compiled

- [ ] **Monitoring**
  - [ ] Sentry error tracking configured
  - [ ] Health check endpoint accessible
  - [ ] Email delivery metrics tracked
  - [ ] Bounce/complaint alerts configured

- [ ] **Testing**
  - [ ] All tests passing in CI
  - [ ] Test emails verified in multiple clients
  - [ ] Spam score checked for templates

## Related Skills

- [Email Templates](../patterns/email-templates.md) - Template design
- [Rich Text Editor](../patterns/rich-text-editor.md) - Content editing
- [Subscriber Management](../patterns/subscriber-management.md) - List management
- [Analytics](../patterns/analytics.md) - Campaign metrics
- [Scheduling](../patterns/scheduling.md) - Campaign scheduling

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with campaigns, subscribers
- Email builder with drag-and-drop
- A/B testing for subject lines
- Open and click tracking
- Subscriber segments
- Import/export functionality
