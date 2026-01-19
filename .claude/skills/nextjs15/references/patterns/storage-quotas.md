---
id: pt-storage-quotas
name: User Storage Quota Management
version: 1.1.0
layer: L5
category: storage
description: User storage quota management and enforcement for Next.js applications
tags: [storage, quotas, limits, files, next15, react19, saas, multi-tenant]
composes:
  - ../molecules/progress-bar.md
  - ../molecules/card.md
  - ../atoms/feedback-alert.md
  - ../atoms/input-button.md
dependencies:
  prisma: "^6.0.0"
  zod: "^3.23.0"
formula: Usage Tracking + Quota Limits + Enforcement = Fair Resource Allocation
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# User Storage Quota Management

## Overview

Storage quota management is essential for SaaS applications, file storage platforms, and multi-tenant systems where fair resource allocation prevents abuse and controls infrastructure costs. This pattern provides a comprehensive approach to tracking, enforcing, and displaying storage quotas in Next.js 15 applications.

The pattern implements tiered storage plans (free, pro, enterprise) with configurable limits for total storage, individual file sizes, and file counts. Real-time usage tracking ensures accurate quota enforcement, while a user-friendly dashboard helps users understand their storage consumption and upgrade paths.

Modern storage quota systems must handle concurrent uploads, provide graceful degradation when limits are reached, and offer clear feedback to users about their usage. This pattern addresses all these concerns with type-safe implementations, optimistic UI updates, and accessible components that work across devices and assistive technologies.

## When to Use

- **File storage applications**: Managing user-uploaded files (documents, images, videos) with defined limits per user or organization
- **SaaS platforms**: Implementing tiered storage plans where different subscription levels get different quotas
- **Multi-tenant systems**: Ensuring fair resource allocation between tenants to prevent any single tenant from monopolizing storage
- **Cost control**: Preventing storage abuse and managing infrastructure costs with predictable resource allocation
- **Compliance requirements**: Meeting data retention policies that require tracking and limiting stored data per user
- **Content management systems**: Limiting media library sizes for blog posts, product images, or marketing assets

## When NOT to Use

- **Unlimited storage offerings**: If your business model provides unlimited storage, quota enforcement is unnecessary
- **Single-user applications**: Personal apps without multi-tenancy don't need complex quota management
- **Ephemeral storage**: Temporary file processing where files are deleted after use doesn't require quotas
- **Static content delivery**: CDN-served static assets that don't count against user quotas

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Storage Quota System Architecture                                        │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Quota Service Layer                                               │  │
│  │  ├─ Usage Tracking: Real-time storage consumption monitoring     │  │
│  │  ├─ Plan Management: Tier-based quota configuration (free/pro)   │  │
│  │  ├─ Enforcement: Upload blocking, soft limits, warnings          │  │
│  │  └─ Analytics: Usage trends, prediction, and reporting           │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│         │                    │                    │                     │
│         ▼                    ▼                    ▼                     │
│  ┌────────────────┐  ┌──────────────────┐  ┌───────────────────┐       │
│  │ Upload         │  │ Usage Dashboard  │  │ Notification      │       │
│  │ Validation     │  │ Component        │  │ System            │       │
│  │                │  │                  │  │                   │       │
│  │ - Size check   │  │ - Progress bar   │  │ - Warning emails  │       │
│  │ - Type check   │  │ - File list      │  │ - Upgrade prompts │       │
│  │ - Count check  │  │ - Plan info      │  │ - Limit alerts    │       │
│  └────────────────┘  └──────────────────┘  └───────────────────┘       │
│         │                    │                    │                     │
│         └────────────────────┼────────────────────┘                     │
│                              ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │ Database Layer (Prisma)                                           │  │
│  │  ├─ User: Storage plan, subscription status                       │  │
│  │  ├─ File: Individual file records with metadata                   │  │
│  │  ├─ StorageUsage: Aggregated usage tracking per user              │  │
│  │  └─ QuotaHistory: Historical usage for analytics                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## Types and Configuration

```typescript
// lib/storage/types.ts
import { z } from 'zod';

export type StoragePlan = 'free' | 'pro' | 'enterprise';

export interface StorageQuota {
  plan: StoragePlan;
  limit: number; // bytes
  used: number;
  fileCount: number;
  maxFileSize: number; // bytes
  maxFiles: number;
  warningThreshold: number; // percentage
  softLimit: number; // bytes - allows small overages
}

export interface StorageConfig {
  plan: StoragePlan;
  quotaBytes: number;
  maxFileSizeBytes: number;
  maxFiles: number;
  allowedTypes: string[];
  warningThreshold: number;
  softLimitMultiplier: number;
}

export const STORAGE_PLANS: Record<StoragePlan, StorageConfig> = {
  free: {
    plan: 'free',
    quotaBytes: 100 * 1024 * 1024, // 100 MB
    maxFileSizeBytes: 5 * 1024 * 1024, // 5 MB
    maxFiles: 50,
    allowedTypes: ['image/*', 'application/pdf'],
    warningThreshold: 80,
    softLimitMultiplier: 1.0, // no overage allowed
  },
  pro: {
    plan: 'pro',
    quotaBytes: 10 * 1024 * 1024 * 1024, // 10 GB
    maxFileSizeBytes: 100 * 1024 * 1024, // 100 MB
    maxFiles: 1000,
    allowedTypes: ['image/*', 'application/pdf', 'video/*', 'audio/*'],
    warningThreshold: 80,
    softLimitMultiplier: 1.1, // 10% overage allowed
  },
  enterprise: {
    plan: 'enterprise',
    quotaBytes: 100 * 1024 * 1024 * 1024, // 100 GB
    maxFileSizeBytes: 500 * 1024 * 1024, // 500 MB
    maxFiles: -1, // unlimited
    allowedTypes: ['*/*'],
    warningThreshold: 90,
    softLimitMultiplier: 1.2, // 20% overage allowed
  },
};

// Validation schemas
export const uploadRequestSchema = z.object({
  filename: z.string().min(1).max(255),
  size: z.number().positive(),
  mimeType: z.string(),
});

export const quotaUpdateSchema = z.object({
  userId: z.string().uuid(),
  plan: z.enum(['free', 'pro', 'enterprise']),
});

export type UploadRequest = z.infer<typeof uploadRequestSchema>;
export type QuotaUpdate = z.infer<typeof quotaUpdateSchema>;
```

## Database Schema

```prisma
// prisma/schema.prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  name          String?
  subscription  Subscription?
  files         File[]
  storageUsage  StorageUsage?
  quotaHistory  QuotaHistory[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model Subscription {
  id        String      @id @default(cuid())
  userId    String      @unique
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan      StoragePlan @default(FREE)
  status    SubStatus   @default(ACTIVE)
  startedAt DateTime    @default(now())
  expiresAt DateTime?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}

model File {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  filename    String
  originalName String
  mimeType    String
  size        Int      // bytes
  path        String
  url         String?
  isDeleted   Boolean  @default(false)
  deletedAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId, isDeleted])
  @@index([createdAt])
}

model StorageUsage {
  id         String   @id @default(cuid())
  userId     String   @unique
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  totalBytes BigInt   @default(0)
  fileCount  Int      @default(0)
  lastUpdated DateTime @default(now())

  @@index([userId])
}

model QuotaHistory {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  usedBytes  BigInt
  limitBytes BigInt
  fileCount  Int
  recordedAt DateTime @default(now())

  @@index([userId, recordedAt])
}

enum StoragePlan {
  FREE
  PRO
  ENTERPRISE
}

enum SubStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  TRIALING
}
```

## Quota Service

```typescript
// lib/storage/quota-service.ts
import { db } from '@/lib/db';
import { StorageQuota, StoragePlan, STORAGE_PLANS, UploadRequest } from './types';
import { cache } from 'react';

export interface QuotaCheckResult {
  allowed: boolean;
  reason?: string;
  warningLevel?: 'none' | 'approaching' | 'near' | 'exceeded';
  suggestUpgrade?: boolean;
  availableSpace?: number;
}

export class QuotaService {
  // Cache quota for 30 seconds to reduce database load
  private quotaCache = new Map<string, { quota: StorageQuota; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30 seconds

  async getQuota(userId: string, bypassCache = false): Promise<StorageQuota> {
    // Check cache first
    if (!bypassCache) {
      const cached = this.quotaCache.get(userId);
      if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
        return cached.quota;
      }
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    const planName = user?.subscription?.plan?.toLowerCase() as StoragePlan || 'free';
    const config = STORAGE_PLANS[planName];

    const usage = await db.file.aggregate({
      where: { userId, isDeleted: false },
      _sum: { size: true },
      _count: true,
    });

    const quota: StorageQuota = {
      plan: planName,
      limit: config.quotaBytes,
      used: usage._sum.size || 0,
      fileCount: usage._count,
      maxFileSize: config.maxFileSizeBytes,
      maxFiles: config.maxFiles,
      warningThreshold: config.warningThreshold,
      softLimit: Math.floor(config.quotaBytes * config.softLimitMultiplier),
    };

    // Update cache
    this.quotaCache.set(userId, { quota, timestamp: Date.now() });

    return quota;
  }

  async canUpload(userId: string, request: UploadRequest): Promise<QuotaCheckResult> {
    const quota = await this.getQuota(userId, true); // Bypass cache for accurate check
    const config = STORAGE_PLANS[quota.plan];

    // Check file type
    if (!this.isAllowedType(request.mimeType, config.allowedTypes)) {
      return {
        allowed: false,
        reason: `File type ${request.mimeType} is not allowed on your plan`,
        suggestUpgrade: quota.plan !== 'enterprise',
      };
    }

    // Check individual file size
    if (request.size > config.maxFileSizeBytes) {
      return {
        allowed: false,
        reason: `File exceeds maximum size of ${this.formatBytes(config.maxFileSizeBytes)}`,
        suggestUpgrade: quota.plan !== 'enterprise',
      };
    }

    // Check file count
    if (config.maxFiles !== -1 && quota.fileCount >= config.maxFiles) {
      return {
        allowed: false,
        reason: `Maximum file count of ${config.maxFiles} reached`,
        suggestUpgrade: quota.plan !== 'enterprise',
      };
    }

    // Check total storage (with soft limit consideration)
    const newTotal = quota.used + request.size;
    const warningLevel = this.getWarningLevel(newTotal, quota.limit, quota.softLimit);

    if (newTotal > quota.softLimit) {
      return {
        allowed: false,
        reason: `Upload would exceed storage quota of ${this.formatBytes(quota.limit)}`,
        warningLevel: 'exceeded',
        suggestUpgrade: quota.plan !== 'enterprise',
        availableSpace: Math.max(0, quota.softLimit - quota.used),
      };
    }

    return {
      allowed: true,
      warningLevel,
      suggestUpgrade: warningLevel !== 'none' && quota.plan !== 'enterprise',
      availableSpace: quota.softLimit - newTotal,
    };
  }

  private isAllowedType(mimeType: string, allowedTypes: string[]): boolean {
    if (allowedTypes.includes('*/*')) return true;

    return allowedTypes.some(pattern => {
      if (pattern.endsWith('/*')) {
        const category = pattern.slice(0, -2);
        return mimeType.startsWith(category + '/');
      }
      return pattern === mimeType;
    });
  }

  private getWarningLevel(
    used: number,
    limit: number,
    softLimit: number
  ): 'none' | 'approaching' | 'near' | 'exceeded' {
    const percentage = (used / limit) * 100;

    if (used >= softLimit) return 'exceeded';
    if (percentage >= 95) return 'near';
    if (percentage >= 80) return 'approaching';
    return 'none';
  }

  async trackUsage(
    userId: string,
    fileSize: number,
    operation: 'add' | 'remove'
  ): Promise<void> {
    const delta = operation === 'add' ? fileSize : -fileSize;
    const countDelta = operation === 'add' ? 1 : -1;

    await db.$transaction(async (tx) => {
      await tx.storageUsage.upsert({
        where: { userId },
        create: {
          userId,
          totalBytes: BigInt(Math.max(0, delta)),
          fileCount: Math.max(0, countDelta),
        },
        update: {
          totalBytes: { increment: BigInt(delta) },
          fileCount: { increment: countDelta },
          lastUpdated: new Date(),
        },
      });

      // Record history point (for analytics)
      const quota = await this.getQuota(userId, true);
      await tx.quotaHistory.create({
        data: {
          userId,
          usedBytes: BigInt(quota.used),
          limitBytes: BigInt(quota.limit),
          fileCount: quota.fileCount,
        },
      });
    });

    // Invalidate cache
    this.quotaCache.delete(userId);
  }

  async recalculateUsage(userId: string): Promise<StorageQuota> {
    // Recalculate from actual file records (useful for fixing drift)
    const result = await db.file.aggregate({
      where: { userId, isDeleted: false },
      _sum: { size: true },
      _count: true,
    });

    await db.storageUsage.upsert({
      where: { userId },
      create: {
        userId,
        totalBytes: BigInt(result._sum.size || 0),
        fileCount: result._count,
      },
      update: {
        totalBytes: BigInt(result._sum.size || 0),
        fileCount: result._count,
        lastUpdated: new Date(),
      },
    });

    // Invalidate and refetch
    this.quotaCache.delete(userId);
    return this.getQuota(userId, true);
  }

  getUsagePercentage(quota: StorageQuota): number {
    return Math.min(100, (quota.used / quota.limit) * 100);
  }

  formatBytes(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let unitIndex = 0;
    let size = bytes;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  async getUsageHistory(
    userId: string,
    days: number = 30
  ): Promise<Array<{ date: Date; used: number; limit: number }>> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await db.quotaHistory.findMany({
      where: {
        userId,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: 'asc' },
      select: {
        recordedAt: true,
        usedBytes: true,
        limitBytes: true,
      },
    });

    return history.map(h => ({
      date: h.recordedAt,
      used: Number(h.usedBytes),
      limit: Number(h.limitBytes),
    }));
  }
}

export const quotaService = new QuotaService();

// React Server Component cached version
export const getQuotaCached = cache(async (userId: string) => {
  return quotaService.getQuota(userId);
});
```

## API Routes

```typescript
// app/api/storage/quota/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { quotaService } from '@/lib/storage/quota-service';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quota = await quotaService.getQuota(session.user.id);
    return NextResponse.json(quota);
  } catch (error) {
    console.error('Failed to get quota:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve quota' },
      { status: 500 }
    );
  }
}

// app/api/storage/check/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { quotaService } from '@/lib/storage/quota-service';
import { uploadRequestSchema } from '@/lib/storage/types';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = uploadRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const result = await quotaService.canUpload(session.user.id, parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Upload check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check upload eligibility' },
      { status: 500 }
    );
  }
}

// app/api/storage/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { quotaService } from '@/lib/storage/quota-service';
import { uploadToStorage } from '@/lib/storage/upload';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Pre-upload check
    const canUpload = await quotaService.canUpload(session.user.id, {
      filename: file.name,
      size: file.size,
      mimeType: file.type,
    });

    if (!canUpload.allowed) {
      return NextResponse.json(
        {
          error: canUpload.reason,
          suggestUpgrade: canUpload.suggestUpgrade,
          availableSpace: canUpload.availableSpace,
        },
        { status: 403 }
      );
    }

    // Upload to storage (S3, R2, etc.)
    const uploadResult = await uploadToStorage(file, session.user.id);

    // Record in database
    const fileRecord = await db.file.create({
      data: {
        userId: session.user.id,
        filename: uploadResult.filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        path: uploadResult.path,
        url: uploadResult.url,
      },
    });

    // Track usage
    await quotaService.trackUsage(session.user.id, file.size, 'add');

    return NextResponse.json({
      id: fileRecord.id,
      url: fileRecord.url,
      warningLevel: canUpload.warningLevel,
      suggestUpgrade: canUpload.suggestUpgrade,
    });
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}

// app/api/storage/files/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { quotaService } from '@/lib/storage/quota-service';
import { deleteFromStorage } from '@/lib/storage/upload';
import { db } from '@/lib/db';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const file = await db.file.findUnique({
      where: { id, userId: session.user.id },
    });

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Soft delete in database
    await db.file.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    // Update usage tracking
    await quotaService.trackUsage(session.user.id, file.size, 'remove');

    // Optionally delete from storage immediately or schedule for later
    // await deleteFromStorage(file.path);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json(
      { error: 'Failed to delete file' },
      { status: 500 }
    );
  }
}
```

## Storage Usage Dashboard

```typescript
// components/storage/usage-dashboard.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, HardDrive, TrendingUp, FileIcon, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface StorageQuota {
  plan: string;
  limit: number;
  used: number;
  fileCount: number;
  maxFileSize: number;
  maxFiles: number;
  warningThreshold: number;
  softLimit: number;
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function getProgressColor(percentage: number): string {
  if (percentage >= 95) return 'bg-red-500';
  if (percentage >= 80) return 'bg-yellow-500';
  return 'bg-primary';
}

export function StorageUsageDashboard() {
  const [quota, setQuota] = useState<StorageQuota | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuota = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);

    try {
      const res = await fetch('/api/storage/quota');
      if (!res.ok) throw new Error('Failed to fetch quota');
      const data = await res.json();
      setQuota(data);
      setError(null);
    } catch (err) {
      setError('Failed to load storage information');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuota();
  }, [fetchQuota]);

  if (loading) {
    return <StorageDashboardSkeleton />;
  }

  if (error || !quota) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error || 'Unable to load storage data'}</AlertDescription>
      </Alert>
    );
  }

  const usagePercent = (quota.used / quota.limit) * 100;
  const isNearLimit = usagePercent > quota.warningThreshold;
  const isAtLimit = usagePercent >= 95;
  const isOverSoftLimit = quota.used >= quota.softLimit;

  return (
    <div className="space-y-4" role="region" aria-label="Storage usage information">
      {/* Warning alerts */}
      {isOverSoftLimit && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Storage Limit Exceeded</AlertTitle>
          <AlertDescription>
            You have exceeded your storage limit. Please delete files or upgrade your plan to continue uploading.
          </AlertDescription>
        </Alert>
      )}

      {isNearLimit && !isOverSoftLimit && (
        <Alert variant={isAtLimit ? 'destructive' : 'default'}>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {isAtLimit
              ? 'You are at your storage limit. Upgrade to continue uploading.'
              : 'You are approaching your storage limit. Consider upgrading your plan.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Main usage card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" aria-hidden="true" />
              Storage Usage
            </CardTitle>
            <CardDescription>
              {formatBytes(quota.limit - quota.used)} available
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="capitalize">
              {quota.plan} Plan
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fetchQuota(true)}
              disabled={refreshing}
              aria-label="Refresh storage data"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span aria-label="Storage used">{formatBytes(quota.used)} used</span>
              <span aria-label="Storage limit">{formatBytes(quota.limit)} total</span>
            </div>
            <Progress
              value={Math.min(usagePercent, 100)}
              className={`h-3 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-yellow-500' : ''}`}
              aria-label={`Storage usage: ${usagePercent.toFixed(1)}%`}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {usagePercent.toFixed(1)}% of quota used
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<FileIcon className="h-4 w-4" />}
              label="Files"
              value={`${quota.fileCount}${quota.maxFiles !== -1 ? ` / ${quota.maxFiles}` : ''}`}
            />
            <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Max File Size"
              value={formatBytes(quota.maxFileSize)}
            />
            <StatCard
              icon={<HardDrive className="h-4 w-4" />}
              label="Available"
              value={formatBytes(Math.max(0, quota.limit - quota.used))}
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              label="Warning At"
              value={`${quota.warningThreshold}%`}
            />
          </div>

          {/* Upgrade CTA */}
          {quota.plan !== 'enterprise' && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Need more storage?</p>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to {quota.plan === 'free' ? 'Pro' : 'Enterprise'} for more space
                  </p>
                </div>
                <Button asChild>
                  <Link href="/settings/billing">Upgrade Plan</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-medium">{value}</p>
    </div>
  );
}

function StorageDashboardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-3 w-full" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

## File Upload with Quota Validation

```typescript
// components/storage/file-uploader.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X, FileIcon, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface UploadResult {
  id: string;
  url: string;
  warningLevel?: string;
  suggestUpgrade?: boolean;
}

interface UploadError {
  error: string;
  suggestUpgrade?: boolean;
  availableSpace?: number;
}

export function FileUploader({
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes,
}: {
  onUploadComplete?: (files: UploadResult[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<UploadResult[]>([]);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);

      if (selectedFiles.length + files.length > maxFiles) {
        setErrors({ _general: `Maximum ${maxFiles} files allowed` });
        return;
      }

      setFiles((prev) => [...prev, ...selectedFiles]);
      setErrors({});

      // Reset input
      if (inputRef.current) inputRef.current.value = '';
    },
    [files.length, maxFiles]
  );

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setErrors({});
  }, []);

  const preCheckUpload = async (file: File): Promise<boolean> => {
    try {
      const res = await fetch('/api/storage/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
          mimeType: file.type,
        }),
      });

      const result = await res.json();

      if (!result.allowed) {
        setErrors((prev) => ({ ...prev, [file.name]: result.reason }));
        if (result.suggestUpgrade) setShowUpgradePrompt(true);
        return false;
      }

      return true;
    } catch {
      setErrors((prev) => ({ ...prev, [file.name]: 'Failed to check upload eligibility' }));
      return false;
    }
  };

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData: UploadError = await res.json();
        setErrors((prev) => ({ ...prev, [file.name]: errorData.error }));
        if (errorData.suggestUpgrade) setShowUpgradePrompt(true);
        return null;
      }

      const result: UploadResult = await res.json();

      if (result.suggestUpgrade) setShowUpgradePrompt(true);

      return result;
    } catch {
      setErrors((prev) => ({ ...prev, [file.name]: 'Upload failed' }));
      return null;
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setErrors({});
    setResults([]);

    const uploadedResults: UploadResult[] = [];

    for (const file of files) {
      // Pre-check quota
      const canUpload = await preCheckUpload(file);
      if (!canUpload) continue;

      // Simulate progress
      setProgress((prev) => ({ ...prev, [file.name]: 0 }));

      const progressInterval = setInterval(() => {
        setProgress((prev) => ({
          ...prev,
          [file.name]: Math.min((prev[file.name] || 0) + 10, 90),
        }));
      }, 200);

      const result = await uploadFile(file);

      clearInterval(progressInterval);
      setProgress((prev) => ({ ...prev, [file.name]: 100 }));

      if (result) {
        uploadedResults.push(result);
      }
    }

    setResults(uploadedResults);
    setUploading(false);

    if (uploadedResults.length > 0) {
      setFiles([]);
      onUploadComplete?.(uploadedResults);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        {/* Upgrade prompt */}
        {showUpgradePrompt && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>You are approaching your storage limit.</span>
              <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/settings/billing">Upgrade</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* General error */}
        {errors._general && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errors._general}</AlertDescription>
          </Alert>
        )}

        {/* Drop zone */}
        <div
          className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const droppedFiles = Array.from(e.dataTransfer.files);
            if (droppedFiles.length + files.length <= maxFiles) {
              setFiles((prev) => [...prev, ...droppedFiles]);
            }
          }}
        >
          <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop files here, or click to select
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={acceptedTypes?.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            id="file-upload"
          />
          <Button
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            Select Files
          </Button>
        </div>

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50"
              >
                <FileIcon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                  {errors[file.name] && (
                    <p className="text-xs text-destructive">{errors[file.name]}</p>
                  )}
                  {progress[file.name] !== undefined && (
                    <Progress value={progress[file.name]} className="h-1 mt-1" />
                  )}
                </div>
                {progress[file.name] === 100 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(index)}
                    disabled={uploading}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload button */}
        {files.length > 0 && (
          <Button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
          </Button>
        )}

        {/* Success message */}
        {results.length > 0 && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-300">
              Successfully uploaded {results.length} file{results.length > 1 ? 's' : ''}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
```

## Examples

### Basic Quota Display

```typescript
// app/dashboard/storage/page.tsx
import { auth } from '@/lib/auth';
import { getQuotaCached } from '@/lib/storage/quota-service';
import { StorageUsageDashboard } from '@/components/storage/usage-dashboard';
import { FileUploader } from '@/components/storage/file-uploader';
import { redirect } from 'next/navigation';

export default async function StoragePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  // Pre-fetch quota for SSR
  const quota = await getQuotaCached(session.user.id);

  return (
    <div className="container max-w-4xl py-8 space-y-8">
      <h1 className="text-3xl font-bold">Storage</h1>

      <StorageUsageDashboard />

      <section>
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        <FileUploader maxFiles={5} />
      </section>
    </div>
  );
}
```

### Multi-tenant Organization Quotas

```typescript
// lib/storage/org-quota-service.ts
import { db } from '@/lib/db';
import { STORAGE_PLANS, StorageConfig } from './types';

interface OrgQuota {
  orgId: string;
  plan: string;
  totalLimit: number;
  totalUsed: number;
  memberCount: number;
  perMemberLimit: number;
}

export class OrgQuotaService {
  async getOrgQuota(orgId: string): Promise<OrgQuota> {
    const org = await db.organization.findUnique({
      where: { id: orgId },
      include: {
        subscription: true,
        members: { select: { id: true } },
      },
    });

    if (!org) throw new Error('Organization not found');

    const plan = org.subscription?.plan || 'free';
    const config = STORAGE_PLANS[plan as keyof typeof STORAGE_PLANS];

    // Aggregate all member storage
    const totalUsage = await db.file.aggregate({
      where: {
        user: { organizationId: orgId },
        isDeleted: false,
      },
      _sum: { size: true },
    });

    const memberCount = org.members.length;
    const totalLimit = config.quotaBytes * memberCount; // Scale with seats

    return {
      orgId,
      plan,
      totalLimit,
      totalUsed: totalUsage._sum.size || 0,
      memberCount,
      perMemberLimit: config.quotaBytes,
    };
  }

  async canMemberUpload(
    orgId: string,
    userId: string,
    fileSize: number
  ): Promise<{ allowed: boolean; reason?: string }> {
    const [orgQuota, userQuota] = await Promise.all([
      this.getOrgQuota(orgId),
      db.file.aggregate({
        where: { userId, isDeleted: false },
        _sum: { size: true },
      }),
    ]);

    const userUsed = userQuota._sum.size || 0;

    // Check org-level limit
    if (orgQuota.totalUsed + fileSize > orgQuota.totalLimit) {
      return {
        allowed: false,
        reason: 'Organization storage limit exceeded',
      };
    }

    // Check per-member limit
    if (userUsed + fileSize > orgQuota.perMemberLimit) {
      return {
        allowed: false,
        reason: 'Individual member storage limit exceeded',
      };
    }

    return { allowed: true };
  }
}
```

### Storage Analytics Dashboard

```typescript
// components/storage/storage-analytics.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface UsageDataPoint {
  date: string;
  used: number;
  limit: number;
}

export function StorageAnalytics() {
  const [data, setData] = useState<UsageDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/storage/history?days=30')
      .then((res) => res.json())
      .then((history) => {
        setData(
          history.map((point: { date: string; used: number; limit: number }) => ({
            date: new Date(point.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            }),
            used: point.used / (1024 * 1024), // Convert to MB
            limit: point.limit / (1024 * 1024),
          }))
        );
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Usage Trend (30 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => `${value} MB`} />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)} MB`]}
              />
              <Line
                type="monotone"
                dataKey="used"
                stroke="#8884d8"
                name="Used"
              />
              <Line
                type="monotone"
                dataKey="limit"
                stroke="#82ca9d"
                name="Limit"
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Anti-patterns

### Don't Store Usage Without Validation

```typescript
// BAD - No validation before tracking
async function uploadFile(userId: string, file: File) {
  const result = await saveToStorage(file);
  await quotaService.trackUsage(userId, file.size, 'add');
  return result;
}

// GOOD - Validate quota before upload
async function uploadFile(userId: string, file: File) {
  const canUpload = await quotaService.canUpload(userId, {
    filename: file.name,
    size: file.size,
    mimeType: file.type,
  });

  if (!canUpload.allowed) {
    throw new QuotaExceededError(canUpload.reason);
  }

  const result = await saveToStorage(file);
  await quotaService.trackUsage(userId, file.size, 'add');
  return result;
}
```

### Don't Trust Client-Side File Size

```typescript
// BAD - Trusting client-reported size
export async function POST(request: NextRequest) {
  const { fileSize } = await request.json();
  const canUpload = await quotaService.canUpload(userId, fileSize);
  // File size could be manipulated!
}

// GOOD - Validate actual file size on server
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const actualSize = file.size; // Server-verified size

  const canUpload = await quotaService.canUpload(userId, {
    filename: file.name,
    size: actualSize,
    mimeType: file.type,
  });
}
```

### Don't Forget Transaction Safety

```typescript
// BAD - No transaction, usage can drift
async function deleteFile(userId: string, fileId: string) {
  const file = await db.file.delete({ where: { id: fileId } });
  await quotaService.trackUsage(userId, file.size, 'remove');
  // If trackUsage fails, usage is inaccurate!
}

// GOOD - Use transaction for atomic operations
async function deleteFile(userId: string, fileId: string) {
  return db.$transaction(async (tx) => {
    const file = await tx.file.update({
      where: { id: fileId, userId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await tx.storageUsage.update({
      where: { userId },
      data: {
        totalBytes: { decrement: BigInt(file.size) },
        fileCount: { decrement: 1 },
      },
    });

    return file;
  });
}
```

## Testing

```typescript
// __tests__/storage/quota-service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QuotaService } from '@/lib/storage/quota-service';
import { STORAGE_PLANS } from '@/lib/storage/types';

vi.mock('@/lib/db', () => ({
  db: {
    user: {
      findUnique: vi.fn(),
    },
    file: {
      aggregate: vi.fn(),
    },
    storageUsage: {
      upsert: vi.fn(),
    },
    quotaHistory: {
      create: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn({
      storageUsage: { upsert: vi.fn() },
      quotaHistory: { create: vi.fn() },
    })),
  },
}));

describe('QuotaService', () => {
  let service: QuotaService;
  const mockDb = await import('@/lib/db');

  beforeEach(() => {
    service = new QuotaService();
    vi.clearAllMocks();
  });

  describe('getQuota', () => {
    it('should return free plan quota for users without subscription', async () => {
      mockDb.db.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscription: null,
      });
      mockDb.db.file.aggregate.mockResolvedValue({
        _sum: { size: 50 * 1024 * 1024 },
        _count: 10,
      });

      const quota = await service.getQuota('user-1');

      expect(quota.plan).toBe('free');
      expect(quota.limit).toBe(STORAGE_PLANS.free.quotaBytes);
      expect(quota.used).toBe(50 * 1024 * 1024);
      expect(quota.fileCount).toBe(10);
    });

    it('should return pro plan quota for pro subscribers', async () => {
      mockDb.db.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscription: { plan: 'PRO' },
      });
      mockDb.db.file.aggregate.mockResolvedValue({
        _sum: { size: 1024 * 1024 * 1024 },
        _count: 100,
      });

      const quota = await service.getQuota('user-1');

      expect(quota.plan).toBe('pro');
      expect(quota.limit).toBe(STORAGE_PLANS.pro.quotaBytes);
    });
  });

  describe('canUpload', () => {
    it('should allow upload within quota', async () => {
      mockDb.db.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscription: { plan: 'FREE' },
      });
      mockDb.db.file.aggregate.mockResolvedValue({
        _sum: { size: 10 * 1024 * 1024 }, // 10 MB used
        _count: 5,
      });

      const result = await service.canUpload('user-1', {
        filename: 'test.pdf',
        size: 1 * 1024 * 1024, // 1 MB
        mimeType: 'application/pdf',
      });

      expect(result.allowed).toBe(true);
    });

    it('should reject upload exceeding quota', async () => {
      mockDb.db.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscription: { plan: 'FREE' },
      });
      mockDb.db.file.aggregate.mockResolvedValue({
        _sum: { size: 99 * 1024 * 1024 }, // 99 MB used
        _count: 45,
      });

      const result = await service.canUpload('user-1', {
        filename: 'large.pdf',
        size: 10 * 1024 * 1024, // 10 MB - would exceed
        mimeType: 'application/pdf',
      });

      expect(result.allowed).toBe(false);
      expect(result.suggestUpgrade).toBe(true);
    });

    it('should reject file exceeding max file size', async () => {
      mockDb.db.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscription: { plan: 'FREE' },
      });
      mockDb.db.file.aggregate.mockResolvedValue({
        _sum: { size: 10 * 1024 * 1024 },
        _count: 5,
      });

      const result = await service.canUpload('user-1', {
        filename: 'huge.pdf',
        size: 10 * 1024 * 1024, // 10 MB - exceeds 5 MB max
        mimeType: 'application/pdf',
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('maximum size');
    });

    it('should reject disallowed file types', async () => {
      mockDb.db.user.findUnique.mockResolvedValue({
        id: 'user-1',
        subscription: { plan: 'FREE' },
      });
      mockDb.db.file.aggregate.mockResolvedValue({
        _sum: { size: 10 * 1024 * 1024 },
        _count: 5,
      });

      const result = await service.canUpload('user-1', {
        filename: 'video.mp4',
        size: 1 * 1024 * 1024,
        mimeType: 'video/mp4', // Not allowed on free plan
      });

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('not allowed');
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(service.formatBytes(0)).toBe('0.0 B');
      expect(service.formatBytes(1024)).toBe('1.0 KB');
      expect(service.formatBytes(1024 * 1024)).toBe('1.0 MB');
      expect(service.formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(service.formatBytes(1536)).toBe('1.5 KB');
    });
  });

  describe('getUsagePercentage', () => {
    it('should calculate percentage correctly', () => {
      const quota = {
        plan: 'free' as const,
        limit: 100,
        used: 50,
        fileCount: 0,
        maxFileSize: 0,
        maxFiles: 0,
        warningThreshold: 80,
        softLimit: 100,
      };

      expect(service.getUsagePercentage(quota)).toBe(50);
    });

    it('should cap at 100%', () => {
      const quota = {
        plan: 'free' as const,
        limit: 100,
        used: 150,
        fileCount: 0,
        maxFileSize: 0,
        maxFiles: 0,
        warningThreshold: 80,
        softLimit: 100,
      };

      expect(service.getUsagePercentage(quota)).toBe(100);
    });
  });
});

// __tests__/components/storage-dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StorageUsageDashboard } from '@/components/storage/usage-dashboard';
import { describe, it, expect, beforeEach, vi } from 'vitest';

global.fetch = vi.fn();

describe('StorageUsageDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display quota information', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        plan: 'free',
        limit: 100 * 1024 * 1024,
        used: 50 * 1024 * 1024,
        fileCount: 25,
        maxFileSize: 5 * 1024 * 1024,
        maxFiles: 50,
        warningThreshold: 80,
        softLimit: 100 * 1024 * 1024,
      }),
    });

    render(<StorageUsageDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Storage Usage')).toBeInTheDocument();
      expect(screen.getByText('50.0 MB used')).toBeInTheDocument();
      expect(screen.getByText('100.0 MB total')).toBeInTheDocument();
      expect(screen.getByText('free')).toBeInTheDocument();
    });
  });

  it('should show warning when near limit', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        plan: 'free',
        limit: 100 * 1024 * 1024,
        used: 85 * 1024 * 1024, // 85% used
        fileCount: 40,
        maxFileSize: 5 * 1024 * 1024,
        maxFiles: 50,
        warningThreshold: 80,
        softLimit: 100 * 1024 * 1024,
      }),
    });

    render(<StorageUsageDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText(/approaching your storage limit/i)
      ).toBeInTheDocument();
    });
  });

  it('should show upgrade button for non-enterprise plans', async () => {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        plan: 'pro',
        limit: 10 * 1024 * 1024 * 1024,
        used: 5 * 1024 * 1024 * 1024,
        fileCount: 500,
        maxFileSize: 100 * 1024 * 1024,
        maxFiles: 1000,
        warningThreshold: 80,
        softLimit: 11 * 1024 * 1024 * 1024,
      }),
    });

    render(<StorageUsageDashboard />);

    await waitFor(() => {
      expect(screen.getByRole('link', { name: /upgrade plan/i })).toBeInTheDocument();
    });
  });

  it('should handle refresh button click', async () => {
    const user = userEvent.setup();

    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => ({
        plan: 'free',
        limit: 100 * 1024 * 1024,
        used: 50 * 1024 * 1024,
        fileCount: 25,
        maxFileSize: 5 * 1024 * 1024,
        maxFiles: 50,
        warningThreshold: 80,
        softLimit: 100 * 1024 * 1024,
      }),
    });

    render(<StorageUsageDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Storage Usage')).toBeInTheDocument();
    });

    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
```

## Related Patterns

- [file-upload](./file-upload.md) - File upload handling patterns
- [usage-metering](./usage-metering.md) - General usage metering for SaaS
- [stripe-payments](./stripe-payments.md) - Subscription billing integration
- [multi-tenant](./multi-tenant.md) - Multi-tenant architecture patterns

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive overview section
- Added when to use / when not to use guidance
- Expanded composition diagram
- Added Prisma database schema
- Enhanced quota service with caching and soft limits
- Added file type validation
- Added organization-level quotas example
- Added storage analytics component
- Added anti-patterns section
- Added comprehensive test examples
- Improved accessibility with ARIA attributes

### 1.0.0 (2025-01-18)
- Initial implementation
- Quota service with plan tiers
- Upload validation
- Usage dashboard component
