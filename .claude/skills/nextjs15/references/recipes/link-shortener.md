---
id: r-link-shortener
name: Link Shortener
version: 3.0.0
layer: L6
category: recipes
description: URL shortener with custom aliases, analytics, QR codes, and link management
tags: [urls, shortener, analytics, qr-codes, links, tracking]
formula: "LinkShortener = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + LandingPage(t-landing-page) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + MarketingLayout(t-marketing-layout) + Header(o-header) + Sidebar(o-sidebar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + SearchInput(m-search-input) + StatCard(m-stat-card) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + UrlValidation(pt-url-validation) + QrCodes(pt-qr-codes) + UrlShortening(pt-url-shortening) + LinkExpiration(pt-link-expiration) + PasswordProtection(pt-password-protection) + Analytics(pt-analytics) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Geolocation(pt-geolocation) + DeviceDetection(pt-device-detection) + TransactionalEmail(pt-transactional-email) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + MetadataApi(pt-metadata-api) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + StripeSubscriptions(pt-stripe-subscriptions) + ApiKeyManagement(pt-api-key-management) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + StructuredData(pt-structured-data) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + OptimisticUpdates(pt-optimistic-updates)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/landing-page.md
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  - ../templates/marketing-layout.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/search-input.md
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
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Link Management
  - ../patterns/url-validation.md
  - ../patterns/qr-codes.md
  - ../patterns/url-shortening.md
  - ../patterns/link-expiration.md
  - ../patterns/password-protection.md
  # L5 Patterns - Analytics
  - ../patterns/analytics.md
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  - ../patterns/geolocation.md
  - ../patterns/device-detection.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Monetization
  - ../patterns/stripe-subscriptions.md
  - ../patterns/api-key-management.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - SEO (Additional)
  - ../patterns/structured-data.md
  # L5 Patterns - Security (Additional)
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
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
  - qrcode
  - nanoid
  - recharts
  - lucide-react
  - date-fns
skills:
  - url-validation
  - qr-codes
  - analytics
  - rate-limiting
  - geolocation
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Link Shortener

## Overview

A complete URL shortening service featuring:
- Short link generation with custom aliases
- Click analytics with detailed stats
- QR code generation
- Link expiration and password protection
- Geographic and device tracking
- Bulk link creation
- API access
- Custom domains

## Project Structure

```
link-shortener/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── links/
│   │   │   ├── page.tsx                # All links
│   │   │   └── [linkId]/page.tsx       # Link analytics
│   │   ├── qr/page.tsx                 # QR code generator
│   │   └── settings/page.tsx
│   ├── (redirect)/
│   │   └── [shortCode]/route.ts        # Redirect handler
│   ├── api/
│   │   ├── links/
│   │   │   ├── route.ts
│   │   │   ├── [linkId]/
│   │   │   │   ├── route.ts
│   │   │   │   ├── stats/route.ts
│   │   │   │   └── qr/route.ts
│   │   │   └── bulk/route.ts
│   │   └── clicks/route.ts
│   └── layout.tsx
├── components/
│   ├── links/
│   │   ├── link-form.tsx
│   │   ├── link-card.tsx
│   │   ├── link-table.tsx
│   │   └── link-stats.tsx
│   ├── qr/
│   │   └── qr-generator.tsx
│   └── ui/
├── lib/
│   ├── shortcode.ts
│   ├── geolocation.ts
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
  apiKey    String   @unique @default(cuid())
  plan      Plan     @default(FREE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  links     Link[]
  domains   Domain[]
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

model Domain {
  id          String   @id @default(cuid())
  domain      String   @unique
  verified    Boolean  @default(false)
  verifiedAt  DateTime?
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  links       Link[]
  createdAt   DateTime @default(now())

  @@index([userId])
}

model Link {
  id           String    @id @default(cuid())
  shortCode    String    @unique
  originalUrl  String
  
  // Customization
  title        String?
  description  String?
  
  // Settings
  password     String?
  expiresAt    DateTime?
  maxClicks    Int?
  
  // iOS/Android deep links
  iosUrl       String?
  androidUrl   String?
  
  // UTM parameters
  utmSource    String?
  utmMedium    String?
  utmCampaign  String?
  
  // Custom domain
  domainId     String?
  domain       Domain?   @relation(fields: [domainId], references: [id])
  
  // Owner
  userId       String?
  user         User?     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Stats (denormalized)
  totalClicks  Int       @default(0)
  
  // Clicks
  clicks       Click[]
  
  // Tags
  tags         LinkTag[]
  
  isActive     Boolean   @default(true)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  @@index([shortCode])
  @@index([userId])
  @@index([createdAt])
}

model Click {
  id          String   @id @default(cuid())
  linkId      String
  link        Link     @relation(fields: [linkId], references: [id], onDelete: Cascade)
  
  // Visitor info
  ipAddress   String?
  userAgent   String?
  referer     String?
  
  // Geolocation
  country     String?
  city        String?
  region      String?
  
  // Device info
  device      String?  // 'desktop', 'mobile', 'tablet'
  browser     String?
  os          String?
  
  // UTM tracking
  utmSource   String?
  utmMedium   String?
  utmCampaign String?
  
  clickedAt   DateTime @default(now())

  @@index([linkId])
  @@index([clickedAt])
  @@index([country])
}

model Tag {
  id     String    @id @default(cuid())
  name   String    @unique
  color  String
  links  LinkTag[]
}

model LinkTag {
  id      String @id @default(cuid())
  linkId  String
  link    Link   @relation(fields: [linkId], references: [id], onDelete: Cascade)
  tagId   String
  tag     Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@unique([linkId, tagId])
}
```

## Implementation

### Link Form

```tsx
// components/links/link-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Link2, Settings, Calendar, Lock, Smartphone, Tag,
  ChevronDown, ChevronUp, Copy, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

const linkSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL'),
  customCode: z.string().min(3).max(20).optional().or(z.literal('')),
  title: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  password: z.string().optional(),
  expiresAt: z.string().optional(),
  maxClicks: z.number().min(1).optional(),
  iosUrl: z.string().url().optional().or(z.literal('')),
  androidUrl: z.string().url().optional().or(z.literal('')),
  utmSource: z.string().optional(),
  utmMedium: z.string().optional(),
  utmCampaign: z.string().optional(),
});

type LinkFormData = z.infer<typeof linkSchema>;

interface LinkFormProps {
  onSuccess?: (link: any) => void;
}

export function LinkForm({ onSuccess }: LinkFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [createdLink, setCreatedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LinkFormData>({
    resolver: zodResolver(linkSchema),
  });

  const createLink = useMutation({
    mutationFn: async (data: LinkFormData) => {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create link');
      }
      return response.json();
    },
    onSuccess: (data) => {
      const shortUrl = `${window.location.origin}/${data.shortCode}`;
      setCreatedLink(shortUrl);
      queryClient.invalidateQueries({ queryKey: ['links'] });
      reset();
      onSuccess?.(data);
    },
  });

  const copyToClipboard = async () => {
    if (!createdLink) return;
    await navigator.clipboard.writeText(createdLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border p-6">
      <form onSubmit={handleSubmit((data) => createLink.mutate(data))} className="space-y-4">
        {/* URL Input */}
        <div>
          <label className="block text-sm font-medium mb-1">Destination URL</label>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              {...register('originalUrl')}
              placeholder="https://example.com/very-long-url"
              className="pl-9"
            />
          </div>
          {errors.originalUrl && (
            <p className="text-sm text-red-500 mt-1">{errors.originalUrl.message}</p>
          )}
        </div>

        {/* Custom Code */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Custom alias <span className="text-gray-400">(optional)</span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">{window.location.origin}/</span>
            <Input
              {...register('customCode')}
              placeholder="my-link"
              className="flex-1"
            />
          </div>
          {errors.customCode && (
            <p className="text-sm text-red-500 mt-1">{errors.customCode.message}</p>
          )}
        </div>

        {/* Advanced Options */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" type="button" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Advanced Options
              </span>
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Title & Description */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <Input {...register('title')} placeholder="Link title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input {...register('description')} placeholder="Short description" />
              </div>
            </div>

            {/* Expiration & Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Expires at
                </label>
                <Input {...register('expiresAt')} type="datetime-local" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  <Lock className="inline h-4 w-4 mr-1" />
                  Password protect
                </label>
                <Input {...register('password')} type="password" placeholder="Optional" />
              </div>
            </div>

            {/* Click Limit */}
            <div>
              <label className="block text-sm font-medium mb-1">Max clicks</label>
              <Input
                {...register('maxClicks', { valueAsNumber: true })}
                type="number"
                min="1"
                placeholder="Unlimited"
              />
            </div>

            {/* Mobile Deep Links */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Smartphone className="inline h-4 w-4 mr-1" />
                Mobile Deep Links
              </label>
              <Input {...register('iosUrl')} placeholder="iOS App URL" />
              <Input {...register('androidUrl')} placeholder="Android App URL" />
            </div>

            {/* UTM Parameters */}
            <div className="space-y-2">
              <label className="block text-sm font-medium">
                <Tag className="inline h-4 w-4 mr-1" />
                UTM Parameters
              </label>
              <div className="grid grid-cols-3 gap-2">
                <Input {...register('utmSource')} placeholder="Source" />
                <Input {...register('utmMedium')} placeholder="Medium" />
                <Input {...register('utmCampaign')} placeholder="Campaign" />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={createLink.isPending}
        >
          {createLink.isPending ? 'Creating...' : 'Shorten URL'}
        </Button>

        {createLink.error && (
          <p className="text-sm text-red-500 text-center">
            {createLink.error.message}
          </p>
        )}
      </form>

      {/* Created Link */}
      {createdLink && (
        <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200 mb-2">
            Your short link is ready!
          </p>
          <div className="flex items-center gap-2">
            <Input value={createdLink} readOnly className="bg-white" />
            <Button onClick={copyToClipboard} variant="outline">
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Link Stats

```tsx
// components/links/link-stats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Globe, Monitor, Smartphone, Tablet, MousePointerClick } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface LinkStatsProps {
  linkId: string;
}

export function LinkStats({ linkId }: LinkStatsProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['link-stats', linkId],
    queryFn: async () => {
      const response = await fetch(`/api/links/${linkId}/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
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

  const { link, clicksOverTime, topCountries, devices, browsers, referers } = data;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Clicks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{link.totalClicks.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {clicksOverTime[clicksOverTime.length - 1]?.clicks || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{topCountries.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Unique Visitors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.uniqueVisitors.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Clicks Over Time */}
      <Card>
        <CardHeader>
          <CardTitle>Clicks Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={clicksOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), 'MMM d')}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
              />
              <Area
                type="monotone"
                dataKey="clicks"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Top Countries */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Countries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCountries.slice(0, 10).map((country: any, index: number) => (
                <div key={country.country} className="flex items-center gap-3">
                  <span className="w-6 text-sm text-gray-500">{index + 1}</span>
                  <span className="text-2xl">{country.flag}</span>
                  <span className="flex-1">{country.country}</span>
                  <span className="font-medium">{country.clicks.toLocaleString()}</span>
                  <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${(country.clicks / topCountries[0].clicks) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={devices}
                    dataKey="count"
                    nameKey="device"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {devices.map((entry: any, index: number) => (
                      <Cell key={entry.device} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              {devices.map((device: any, index: number) => {
                const Icon = device.device === 'mobile' ? Smartphone :
                             device.device === 'tablet' ? Tablet : Monitor;
                return (
                  <div key={device.device} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <Icon className="h-4 w-4" />
                    <span className="capitalize">{device.device}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Browsers */}
        <Card>
          <CardHeader>
            <CardTitle>Browsers</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={browsers} layout="vertical">
                <XAxis type="number" />
                <YAxis type="category" dataKey="browser" width={80} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={4} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Referrers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Referrers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {referers.slice(0, 5).map((referer: any) => (
                <div key={referer.referer || 'direct'} className="flex items-center justify-between">
                  <span className="text-sm truncate max-w-[200px]">
                    {referer.referer || 'Direct'}
                  </span>
                  <span className="font-medium">{referer.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

### QR Code Generator

```tsx
// components/qr/qr-generator.tsx
'use client';

import { useState, useRef } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Palette, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface QRGeneratorProps {
  url: string;
}

export function QRGenerator({ url }: QRGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    size: 256,
    darkColor: '#000000',
    lightColor: '#ffffff',
    errorCorrection: 'M' as 'L' | 'M' | 'Q' | 'H',
    margin: 4,
  });

  const generateQR = async () => {
    if (!canvasRef.current) return;

    await QRCode.toCanvas(canvasRef.current, url, {
      width: settings.size,
      margin: settings.margin,
      color: {
        dark: settings.darkColor,
        light: settings.lightColor,
      },
      errorCorrectionLevel: settings.errorCorrection,
    });

    setQrUrl(canvasRef.current.toDataURL('image/png'));
  };

  // Generate on mount and when settings change
  useState(() => {
    generateQR();
  });

  const downloadQR = (format: 'png' | 'svg') => {
    if (!qrUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code.${format}`;
    
    if (format === 'png') {
      link.href = qrUrl;
    } else {
      // Generate SVG
      QRCode.toString(url, {
        type: 'svg',
        width: settings.size,
        margin: settings.margin,
        color: {
          dark: settings.darkColor,
          light: settings.lightColor,
        },
        errorCorrectionLevel: settings.errorCorrection,
      }, (err, svgString) => {
        if (svgString) {
          const blob = new Blob([svgString], { type: 'image/svg+xml' });
          link.href = URL.createObjectURL(blob);
          link.click();
        }
      });
      return;
    }
    
    link.click();
  };

  const copyQR = async () => {
    if (!canvasRef.current) return;
    
    canvasRef.current.toBlob(async (blob) => {
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
      }
    });
  };

  return (
    <div className="grid grid-cols-2 gap-8">
      {/* Preview */}
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 dark:bg-gray-900 rounded-xl">
        <canvas
          ref={canvasRef}
          className="rounded-lg shadow-lg"
          style={{
            width: Math.min(settings.size, 300),
            height: Math.min(settings.size, 300),
          }}
        />
        
        <p className="mt-4 text-sm text-gray-500 text-center break-all max-w-xs">
          {url}
        </p>

        <div className="flex gap-2 mt-4">
          <Button onClick={() => downloadQR('png')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            PNG
          </Button>
          <Button onClick={() => downloadQR('svg')} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            SVG
          </Button>
          <Button onClick={copyQR} variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-6">
        <h3 className="font-semibold flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Customize
        </h3>

        {/* Size */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Size: {settings.size}px
          </label>
          <Slider
            value={[settings.size]}
            onValueChange={([value]) => {
              setSettings({ ...settings, size: value });
              setTimeout(generateQR, 100);
            }}
            min={128}
            max={512}
            step={32}
          />
        </div>

        {/* Colors */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Palette className="inline h-4 w-4 mr-1" />
              Foreground
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.darkColor}
                onChange={(e) => {
                  setSettings({ ...settings, darkColor: e.target.value });
                  setTimeout(generateQR, 100);
                }}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={settings.darkColor}
                onChange={(e) => {
                  setSettings({ ...settings, darkColor: e.target.value });
                  setTimeout(generateQR, 100);
                }}
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Background
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.lightColor}
                onChange={(e) => {
                  setSettings({ ...settings, lightColor: e.target.value });
                  setTimeout(generateQR, 100);
                }}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <Input
                value={settings.lightColor}
                onChange={(e) => {
                  setSettings({ ...settings, lightColor: e.target.value });
                  setTimeout(generateQR, 100);
                }}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Error Correction */}
        <div>
          <label className="block text-sm font-medium mb-2">Error Correction</label>
          <Select
            value={settings.errorCorrection}
            onValueChange={(value) => {
              setSettings({ ...settings, errorCorrection: value as any });
              setTimeout(generateQR, 100);
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="L">Low (7%)</SelectItem>
              <SelectItem value="M">Medium (15%)</SelectItem>
              <SelectItem value="Q">Quartile (25%)</SelectItem>
              <SelectItem value="H">High (30%)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            Higher error correction allows for more damage but increases QR code complexity.
          </p>
        </div>

        {/* Margin */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Margin: {settings.margin} modules
          </label>
          <Slider
            value={[settings.margin]}
            onValueChange={([value]) => {
              setSettings({ ...settings, margin: value });
              setTimeout(generateQR, 100);
            }}
            min={0}
            max={8}
            step={1}
          />
        </div>
      </div>
    </div>
  );
}
```

### Redirect Handler

```tsx
// app/(redirect)/[shortCode]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGeolocation } from '@/lib/geolocation';
import { parseUserAgent } from '@/lib/utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params;

  const link = await prisma.link.findUnique({
    where: { shortCode },
  });

  if (!link || !link.isActive) {
    return NextResponse.redirect(new URL('/404', request.url));
  }

  // Check expiration
  if (link.expiresAt && new Date() > link.expiresAt) {
    return NextResponse.redirect(new URL('/expired', request.url));
  }

  // Check max clicks
  if (link.maxClicks && link.totalClicks >= link.maxClicks) {
    return NextResponse.redirect(new URL('/limit-reached', request.url));
  }

  // Check password
  if (link.password) {
    const providedPassword = request.nextUrl.searchParams.get('p');
    if (providedPassword !== link.password) {
      return NextResponse.redirect(
        new URL(`/password?code=${shortCode}`, request.url)
      );
    }
  }

  // Get visitor info
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown';
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || null;

  // Parse user agent
  const { device, browser, os } = parseUserAgent(userAgent);

  // Get geolocation
  const geo = await getGeolocation(ip);

  // Record click
  await prisma.$transaction([
    prisma.click.create({
      data: {
        linkId: link.id,
        ipAddress: ip,
        userAgent,
        referer,
        country: geo?.country,
        city: geo?.city,
        region: geo?.region,
        device,
        browser,
        os,
        utmSource: request.nextUrl.searchParams.get('utm_source'),
        utmMedium: request.nextUrl.searchParams.get('utm_medium'),
        utmCampaign: request.nextUrl.searchParams.get('utm_campaign'),
      },
    }),
    prisma.link.update({
      where: { id: link.id },
      data: { totalClicks: { increment: 1 } },
    }),
  ]);

  // Check for device-specific URLs
  if (device === 'mobile' && link.iosUrl && /iPhone|iPad/.test(userAgent)) {
    return NextResponse.redirect(link.iosUrl);
  }
  
  if (device === 'mobile' && link.androidUrl && /Android/.test(userAgent)) {
    return NextResponse.redirect(link.androidUrl);
  }

  // Build final URL with UTM parameters
  const finalUrl = new URL(link.originalUrl);
  
  if (link.utmSource) finalUrl.searchParams.set('utm_source', link.utmSource);
  if (link.utmMedium) finalUrl.searchParams.set('utm_medium', link.utmMedium);
  if (link.utmCampaign) finalUrl.searchParams.set('utm_campaign', link.utmCampaign);

  return NextResponse.redirect(finalUrl.toString());
}
```

### Stats API

```tsx
// app/api/links/[linkId]/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { subDays, startOfDay, endOfDay, eachDayOfInterval, format } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ linkId: string }> }
) {
  const { linkId } = await params;
  const session = await getServerSession(authOptions);

  const link = await prisma.link.findUnique({
    where: { id: linkId },
  });

  if (!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  // Check ownership
  if (link.userId && link.userId !== session?.user?.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const days = 30;
  const startDate = startOfDay(subDays(new Date(), days - 1));
  const endDate = endOfDay(new Date());

  // Clicks over time
  const clicksByDay = await prisma.click.groupBy({
    by: ['clickedAt'],
    where: {
      linkId,
      clickedAt: { gte: startDate, lte: endDate },
    },
    _count: true,
  });

  // Fill in missing days
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
  const clicksOverTime = dateRange.map((date) => {
    const dayClicks = clicksByDay.filter(
      (c) => format(c.clickedAt, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    return {
      date: format(date, 'yyyy-MM-dd'),
      clicks: dayClicks.reduce((sum, c) => sum + c._count, 0),
    };
  });

  // Top countries
  const topCountries = await prisma.click.groupBy({
    by: ['country'],
    where: { linkId, country: { not: null } },
    _count: true,
    orderBy: { _count: { country: 'desc' } },
    take: 20,
  });

  // Country flags map
  const countryFlags: Record<string, string> = {
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Japan': '🇯🇵',
    // Add more as needed
  };

  // Devices
  const devices = await prisma.click.groupBy({
    by: ['device'],
    where: { linkId, device: { not: null } },
    _count: true,
  });

  // Browsers
  const browsers = await prisma.click.groupBy({
    by: ['browser'],
    where: { linkId, browser: { not: null } },
    _count: true,
    orderBy: { _count: { browser: 'desc' } },
    take: 10,
  });

  // Referrers
  const referers = await prisma.click.groupBy({
    by: ['referer'],
    where: { linkId },
    _count: true,
    orderBy: { _count: { referer: 'desc' } },
    take: 10,
  });

  // Unique visitors (by IP)
  const uniqueVisitors = await prisma.click.groupBy({
    by: ['ipAddress'],
    where: { linkId },
  });

  return NextResponse.json({
    link,
    clicksOverTime,
    topCountries: topCountries.map((c) => ({
      country: c.country,
      flag: countryFlags[c.country || ''] || '🌐',
      clicks: c._count,
    })),
    devices: devices.map((d) => ({
      device: d.device,
      count: d._count,
    })),
    browsers: browsers.map((b) => ({
      browser: b.browser,
      count: b._count,
    })),
    referers: referers.map((r) => ({
      referer: r.referer,
      count: r._count,
    })),
    uniqueVisitors: uniqueVisitors.length,
  });
}
```

## Skills Used

| Skill | Purpose | Reference |
|-------|---------|-----------|
| url-validation | Validate and sanitize destination URLs | [url-validation.md](../patterns/url-validation.md) |
| qr-codes | Generate customizable QR codes for links | [qr-codes.md](../patterns/qr-codes.md) |
| analytics | Track clicks, devices, browsers, geography | [analytics.md](../patterns/analytics.md) |
| rate-limiting | Protect API from abuse | [rate-limiting.md](../patterns/rate-limiting.md) |
| geolocation | Track visitor locations | [geolocation.md](../patterns/geolocation.md) |

## Testing

### Test Setup

```tsx
// __tests__/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Unit Tests

```tsx
// __tests__/lib/shortcode.test.ts
import { generateShortCode, isValidShortCode } from '@/lib/shortcode';

describe('generateShortCode', () => {
  it('generates a code of default length', () => {
    const code = generateShortCode();
    expect(code).toHaveLength(7);
  });

  it('generates alphanumeric codes', () => {
    const code = generateShortCode();
    expect(code).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it('respects custom length', () => {
    const code = generateShortCode(10);
    expect(code).toHaveLength(10);
  });
});

describe('isValidShortCode', () => {
  it('accepts valid codes', () => {
    expect(isValidShortCode('abc123')).toBe(true);
    expect(isValidShortCode('MyLink')).toBe(true);
  });

  it('rejects invalid codes', () => {
    expect(isValidShortCode('ab')).toBe(false); // Too short
    expect(isValidShortCode('my-link!')).toBe(false); // Invalid chars
    expect(isValidShortCode('')).toBe(false); // Empty
  });
});
```

### Integration Tests

```tsx
// __tests__/api/links.test.ts
import { POST, GET } from '@/app/api/links/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    link: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('POST /api/links', () => {
  it('creates a short link', async () => {
    (prisma.link.create as jest.Mock).mockResolvedValue({
      id: '1',
      shortCode: 'abc123',
      originalUrl: 'https://example.com',
    });

    const request = new Request('http://localhost/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'https://example.com' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.shortCode).toBe('abc123');
  });

  it('validates URL format', async () => {
    const request = new Request('http://localhost/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl: 'not-a-url' }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it('checks for duplicate custom codes', async () => {
    (prisma.link.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

    const request = new Request('http://localhost/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalUrl: 'https://example.com',
        customCode: 'taken',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(409);
  });
});
```

### E2E Tests (Playwright)

```tsx
// e2e/link-shortener.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Link Shortener', () => {
  test('creates a short link', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Destination URL"]', 'https://example.com/very-long-url');
    await page.click('text=Shorten URL');

    await expect(page.locator('text=Your short link is ready')).toBeVisible();
    await expect(page.locator('input[readonly]')).toHaveValue(/http.*\/[a-zA-Z0-9]+/);
  });

  test('creates link with custom alias', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="Destination URL"]', 'https://example.com');
    await page.fill('input[placeholder="my-link"]', 'my-custom-link');
    await page.click('text=Shorten URL');

    await expect(page.locator('input[readonly]')).toHaveValue(/my-custom-link$/);
  });

  test('redirects to original URL', async ({ page }) => {
    // First create a link
    await page.goto('/');
    await page.fill('input[placeholder*="Destination URL"]', 'https://example.com');
    await page.click('text=Shorten URL');

    const shortUrl = await page.locator('input[readonly]').inputValue();
    const shortCode = shortUrl.split('/').pop();

    // Visit the short link
    const response = await page.goto(`/${shortCode}`);
    await expect(page).toHaveURL('https://example.com');
  });

  test('shows link analytics', async ({ page }) => {
    await page.goto('/links/link-123');

    await expect(page.locator('text=Total Clicks')).toBeVisible();
    await expect(page.locator('text=Top Countries')).toBeVisible();
    await expect(page.locator('[data-testid="clicks-chart"]')).toBeVisible();
  });
});

test.describe('QR Code Generator', () => {
  test('generates QR code for link', async ({ page }) => {
    await page.goto('/links/link-123');
    await page.click('text=QR Code');

    await expect(page.locator('canvas')).toBeVisible();
    await expect(page.locator('text=Download')).toBeVisible();
  });

  test('downloads QR code as PNG', async ({ page }) => {
    await page.goto('/qr?url=https://example.com');

    const downloadPromise = page.waitForEvent('download');
    await page.click('text=PNG');
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toMatch(/\.png$/);
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          We couldn't load this page. Please try again.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Try again
        </button>
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
  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Usage in route handler
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // ... handle request
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Form Validation Errors

```tsx
// lib/validations/link.ts
import { z } from 'zod';

export const linkSchema = z.object({
  originalUrl: z.string().url('Please enter a valid URL'),
  customCode: z.string()
    .min(3, 'Custom code must be at least 3 characters')
    .max(20, 'Custom code must be at most 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Only letters, numbers, hyphens, and underscores allowed')
    .optional()
    .or(z.literal('')),
  title: z.string().max(100).optional(),
  password: z.string().max(50).optional(),
  expiresAt: z.string().datetime().optional(),
  maxClicks: z.number().int().min(1).optional(),
});

export type LinkInput = z.infer<typeof linkSchema>;
```

## Accessibility

### WCAG Compliance

| Criterion | Level | Implementation |
|-----------|-------|----------------|
| 1.1.1 Non-text Content | A | Alt text for QR codes |
| 1.3.1 Info and Relationships | A | Semantic HTML, ARIA labels |
| 1.4.3 Contrast | AA | 4.5:1 text contrast ratio |
| 2.1.1 Keyboard | A | Full keyboard navigation |
| 2.4.4 Link Purpose | A | Descriptive link text |
| 3.3.1 Error Identification | A | Clear error messages |

### Focus Management

```tsx
// components/links/link-form.tsx
import { useRef, useEffect } from 'react';

export function LinkForm({ onSuccess }: Props) {
  const urlInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Focus URL input on mount
  useEffect(() => {
    urlInputRef.current?.focus();
  }, []);

  // Focus result after creation
  useEffect(() => {
    if (createdLink) {
      resultRef.current?.focus();
    }
  }, [createdLink]);

  return (
    <form aria-label="Create short link">
      <label htmlFor="url" className="sr-only">Destination URL</label>
      <input
        ref={urlInputRef}
        id="url"
        type="url"
        aria-describedby="url-help"
        aria-invalid={!!errors.originalUrl}
      />
      <p id="url-help" className="text-sm text-gray-500">
        Enter the URL you want to shorten
      </p>

      {createdLink && (
        <div ref={resultRef} tabIndex={-1} role="status" aria-live="polite">
          Your short link is ready!
        </div>
      )}
    </form>
  );
}
```

### Accessible Charts

```tsx
// components/links/link-stats.tsx
<div role="img" aria-label="Click statistics chart showing clicks over the last 30 days">
  <ResponsiveContainer>
    <AreaChart data={clicksOverTime} aria-hidden="true">
      {/* Chart content */}
    </AreaChart>
  </ResponsiveContainer>

  {/* Screen reader table alternative */}
  <table className="sr-only">
    <caption>Clicks over the last 30 days</caption>
    <thead>
      <tr><th>Date</th><th>Clicks</th></tr>
    </thead>
    <tbody>
      {clicksOverTime.map(d => (
        <tr key={d.date}>
          <td>{d.date}</td>
          <td>{d.clicks}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

## Security

### Zod Validation

```tsx
// lib/validations/link.ts
import { z } from 'zod';

// Blocklist of unsafe URL patterns
const unsafePatterns = [
  /^javascript:/i,
  /^data:/i,
  /^vbscript:/i,
];

export const linkSchema = z.object({
  originalUrl: z.string()
    .url('Invalid URL format')
    .refine(
      url => !unsafePatterns.some(pattern => pattern.test(url)),
      'URL contains unsafe protocol'
    )
    .refine(
      url => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      'Only HTTP and HTTPS URLs are allowed'
    ),
  customCode: z.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .optional(),
});
```

### Rate Limiting

```tsx
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const createLinkLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  prefix: 'ratelimit:create',
});

const redirectLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 m'),
  prefix: 'ratelimit:redirect',
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';

  // Rate limit link creation
  if (request.method === 'POST' && request.nextUrl.pathname === '/api/links') {
    const { success, limit, reset, remaining } = await createLinkLimit.limit(ip);

    if (!success) {
      return new Response('Rate limit exceeded. Try again later.', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }

  // Rate limit redirects (anti-abuse)
  if (request.nextUrl.pathname.match(/^\/[a-zA-Z0-9_-]+$/)) {
    const { success } = await redirectLimit.limit(ip);
    if (!success) {
      return new Response('Too many requests', { status: 429 });
    }
  }
}
```

### Auth Middleware

```tsx
// lib/auth-middleware.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new APIError('Unauthorized', 401);
  }
  return session.user;
}

export async function requireLinkOwner(linkId: string) {
  const user = await requireAuth();

  const link = await prisma.link.findUnique({
    where: { id: linkId },
  });

  if (!link) {
    throw new APIError('Link not found', 404);
  }

  if (link.userId !== user.id) {
    throw new APIError('Forbidden', 403);
  }

  return { user, link };
}
```

## Performance

### Caching Strategy

```tsx
// app/(redirect)/[shortCode]/route.ts
import { unstable_cache } from 'next/cache';

const getCachedLink = unstable_cache(
  async (shortCode: string) => {
    return prisma.link.findUnique({
      where: { shortCode },
      select: {
        id: true,
        originalUrl: true,
        password: true,
        expiresAt: true,
        maxClicks: true,
        totalClicks: true,
        isActive: true,
        iosUrl: true,
        androidUrl: true,
        utmSource: true,
        utmMedium: true,
        utmCampaign: true,
      },
    });
  },
  ['link'],
  { revalidate: 60 }
);

// Edge runtime for fast redirects
export const runtime = 'edge';
```

### Click Tracking Optimization

```tsx
// Use background processing for click tracking
import { Queue } from 'bullmq';

const clickQueue = new Queue('clicks', {
  connection: { host: 'redis', port: 6379 },
});

// In redirect handler - non-blocking
clickQueue.add('track', {
  linkId: link.id,
  ipAddress: ip,
  userAgent,
  referer,
  timestamp: Date.now(),
});
```

### Bundle Optimization

```tsx
// Dynamic imports for charts
const LinkStats = dynamic(() => import('@/components/links/link-stats'), {
  loading: () => <StatsSkeleton />,
  ssr: false,
});

const QRGenerator = dynamic(() => import('@/components/qr/qr-generator'), {
  loading: () => <QRSkeleton />,
  ssr: false,
});
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run linting
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test
          REDIS_URL: redis://localhost:6379

      - name: Build application
        run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
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
    Sentry.replayIntegration(),
  ],
});

// Track redirect errors
export function trackRedirectError(shortCode: string, error: Error) {
  Sentry.captureException(error, {
    tags: { feature: 'redirect' },
    extra: { shortCode },
  });
}

// Track API errors
export function trackAPIError(endpoint: string, error: Error) {
  Sentry.captureException(error, {
    tags: { feature: 'api', endpoint },
  });
}
```

### Health Checks

```tsx
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';

export async function GET() {
  const checks = {
    database: false,
    redis: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {
    console.error('Database health check failed:', e);
  }

  try {
    const redis = Redis.fromEnv();
    await redis.ping();
    checks.redis = true;
  } catch (e) {
    console.error('Redis health check failed:', e);
  }

  const healthy = checks.database && checks.redis;

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/links"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Redis (for rate limiting and caching)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# Geolocation API
GEOLOCATION_API_KEY="your-api-key"

# Base URL for short links
NEXT_PUBLIC_BASE_URL="https://short.example.com"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="sntrys_..."

# Analytics (optional)
PLAUSIBLE_DOMAIN="short.example.com"
```

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Database migrations run successfully
- [ ] Redis configured for rate limiting
- [ ] Custom domain DNS configured
- [ ] SSL certificate installed
- [ ] Edge runtime enabled for redirects
- [ ] Rate limiting tested and tuned
- [ ] Error monitoring configured (Sentry)
- [ ] Health check endpoint verified
- [ ] Geolocation API key configured
- [ ] Click tracking queue processing
- [ ] Cache headers configured
- [ ] SEO meta tags added
- [ ] Analytics tracking installed
- [ ] Backup strategy in place
- [ ] Load testing completed (redirect latency)

## Related Skills

- [URL Validation](../patterns/url-validation.md) - Input validation
- [QR Codes](../patterns/qr-codes.md) - QR generation
- [Analytics](../patterns/analytics.md) - Click tracking
- [Rate Limiting](../patterns/rate-limiting.md) - API protection
- [Geolocation](../patterns/geolocation.md) - Location tracking

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with link shortening
- Custom aliases and expiration
- Click analytics with geographic data
- QR code generation with customization
- Password protection and click limits
- Device-specific redirects
