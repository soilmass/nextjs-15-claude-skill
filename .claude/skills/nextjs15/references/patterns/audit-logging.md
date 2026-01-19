---
id: pt-audit-logging
name: Audit Logging
version: 1.1.0
layer: L5
category: observability
description: Comprehensive audit trail system for tracking user actions, admin operations, and system events for compliance and debugging
tags: [audit, logging, compliance, security, ecommerce, next15]
composes: []
formula: "AuditLogging = EventCapture + ContextEnrichment + SecureStorage + QueryInterface"
dependencies:
  prisma: "^6.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Audit Logging

## Overview

Audit logging is a critical component for enterprise applications that need to maintain a verifiable record of all significant events within the system. This pattern provides a comprehensive audit trail system designed for Next.js 15 applications that require compliance with regulatory frameworks such as PCI-DSS, HIPAA, SOC2, and GDPR.

The audit system captures detailed information about who performed what action, when it occurred, and what data was affected. It goes beyond simple logging by providing structured, queryable records that can be used for security investigations, compliance audits, debugging production issues, and understanding user behavior patterns. Each audit entry includes rich context such as the actor's identity, IP address, user agent, and a detailed description of the changes made.

A well-implemented audit logging system should be transparent to the application code, performant enough to not impact user experience, and reliable enough to never lose critical audit data even under system failures. The pattern presented here uses asynchronous processing with fallback mechanisms to ensure audit data is always captured while minimizing latency impact on user-facing operations.

## When to Use

- **Payment Processing**: Any financial transaction must be logged for PCI-DSS compliance, including successful payments, failed attempts, refunds, and chargebacks
- **Admin Operations**: Track all administrative actions on user accounts, including viewing sensitive data, modifying permissions, suspending accounts, or processing support requests
- **Authentication Events**: Log all login attempts (successful and failed), password changes, MFA enrollments, session management, and account lockouts
- **Data Modifications**: Record all CRUD operations on sensitive data including the before and after state to support rollback and investigation needs
- **API Access**: Track third-party API integrations, webhook deliveries, and external service calls for debugging and security monitoring
- **Compliance Requirements**: When regulatory frameworks mandate audit trails for data access and modifications

## When NOT to Use

- **High-Volume Read Operations**: Do not audit every page view or API read that does not access sensitive data; it creates unnecessary storage overhead
- **Real-time Analytics**: Audit logging is not a replacement for analytics systems; use dedicated analytics tools for user behavior tracking
- **Application Metrics**: Server performance metrics, error rates, and system health belong in monitoring systems, not audit logs
- **Temporary or Ephemeral Data**: Operations on cache, session data, or temporary files typically do not need audit trails

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      Audit Logging Architecture                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Event Sources                                 │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ Server      │  │ API         │  │ Background              │  │   │
│  │  │ Actions     │  │ Routes      │  │ Jobs                    │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │   │
│  └─────────┼────────────────┼──────────────────────┼───────────────┘   │
│            │                │                      │                    │
│            ▼                ▼                      ▼                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Audit Service Layer                           │   │
│  │                                                                  │   │
│  │  ┌───────────────────────────────────────────────────────────┐  │   │
│  │  │                   audit() Function                         │  │   │
│  │  │  - Context Extraction (user, IP, user-agent)              │  │   │
│  │  │  - Entry Validation                                        │  │   │
│  │  │  - Retention Policy Application                            │  │   │
│  │  │  - Async Write with Fallback                               │  │   │
│  │  └───────────────────────────────────────────────────────────┘  │   │
│  │                                                                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ auditAuth       │  │ auditFinancial  │  │ auditAdmin      │  │   │
│  │  │ - login         │  │ - orderCreate   │  │ - productUpdate │  │   │
│  │  │ - logout        │  │ - refundProcess │  │ - userAccess    │  │   │
│  │  │ - passwordChange│  │ - paymentFail   │  │ - roleChange    │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                                                            │
│            ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Storage Layer                                 │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ Primary DB      │  │ Fallback Queue  │  │ Archive Storage │  │   │
│  │  │ (PostgreSQL)    │  │ (Redis/SQS)     │  │ (S3/Glacier)    │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                                                            │
│            ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Query & Reporting                             │   │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │   │
│  │  │ Admin Dashboard │  │ Export API      │  │ Compliance      │  │   │
│  │  │ - Search/Filter │  │ - CSV/JSON      │  │ Reports         │  │   │
│  │  │ - Timeline View │  │ - Date Range    │  │ - SOC2/PCI      │  │   │
│  │  └─────────────────┘  └─────────────────┘  └─────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Database Schema

```prisma
// prisma/schema.prisma
model AuditLog {
  id          String    @id @default(cuid())
  timestamp   DateTime  @default(now())

  // Actor Information
  actorType   ActorType
  actorId     String?   // user ID, system identifier, or API key ID
  actorEmail  String?   // denormalized for quick reference
  actorIp     String?   // client IP address
  userAgent   String?   // browser/client identifier

  // Action Details
  action      String    // e.g., "order.create", "product.update", "user.login"
  resource    String    // e.g., "order", "product", "user"
  resourceId  String?   // ID of the affected resource

  // Context
  description String?   // human-readable description
  metadata    Json?     // additional structured context
  changes     Json?     // before/after state for modifications

  // Result
  status      AuditStatus @default(SUCCESS)
  errorMessage String?

  // Compliance
  category    AuditCategory
  retention   DateTime?   // when this record can be deleted (GDPR)
  sensitive   Boolean     @default(false) // marks PII-containing entries

  // Indexing for efficient queries
  @@index([timestamp])
  @@index([actorId])
  @@index([resource, resourceId])
  @@index([action])
  @@index([category])
  @@index([retention])
}

enum ActorType {
  USER        // Regular authenticated user
  ADMIN       // Administrative user
  SYSTEM      // Automated system process
  API         // External API client
  WEBHOOK     // Incoming webhook handler
}

enum AuditStatus {
  SUCCESS     // Action completed successfully
  FAILURE     // Action failed due to error
  DENIED      // Action was denied due to permissions
}

enum AuditCategory {
  AUTHENTICATION   // login, logout, password change, MFA
  AUTHORIZATION    // permission changes, role assignments
  DATA_ACCESS      // read operations on sensitive data
  DATA_MODIFY      // create, update, delete operations
  FINANCIAL        // payments, refunds, subscriptions
  ADMIN            // administrative panel actions
  SYSTEM           // automated/scheduled processes
  SECURITY         // security-related events
}
```

### Audit Service

```typescript
// lib/audit/service.ts
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import type { ActorType, AuditCategory, AuditStatus } from '@prisma/client';

export interface AuditContext {
  actorType: ActorType;
  actorId?: string;
  actorEmail?: string;
}

export interface AuditEntry {
  action: string;
  resource: string;
  resourceId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  changes?: { before?: unknown; after?: unknown };
  status?: AuditStatus;
  errorMessage?: string;
  category: AuditCategory;
  sensitive?: boolean;
}

// Queue for fallback when DB write fails
const auditQueue: Array<{
  entry: AuditEntry;
  context: AuditContext;
  timestamp: Date;
  ip?: string;
  userAgent?: string;
}> = [];

/**
 * Main audit function - captures and stores audit events
 * Uses fire-and-forget pattern to avoid blocking the main request
 */
export async function audit(
  entry: AuditEntry,
  context?: AuditContext
): Promise<void> {
  try {
    // Extract context from request headers if not provided
    const headersList = await headers();
    const session = await auth();

    const actorContext = context || {
      actorType: determineActorType(session),
      actorId: session?.user?.id,
      actorEmail: session?.user?.email,
    };

    const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               headersList.get('x-real-ip') ||
               undefined;

    const userAgent = headersList.get('user-agent') || undefined;

    // Attempt primary storage
    await prisma.auditLog.create({
      data: {
        ...entry,
        ...actorContext,
        actorIp: ip,
        userAgent,
        status: entry.status || 'SUCCESS',
        retention: getRetentionDate(entry.category),
        sensitive: entry.sensitive || false,
      },
    });
  } catch (error) {
    // Fallback: queue for retry
    console.error('Audit logging failed, queuing for retry:', error);
    queueAuditEntry(entry, context);
  }
}

function determineActorType(session: any): ActorType {
  if (!session?.user) return 'SYSTEM';
  if (session.user.role === 'ADMIN') return 'ADMIN';
  return 'USER';
}

/**
 * Calculate retention date based on category and compliance requirements
 */
function getRetentionDate(category: AuditCategory): Date {
  const now = new Date();

  switch (category) {
    case 'FINANCIAL':
      // PCI-DSS: Keep financial records for 7 years
      return new Date(now.setFullYear(now.getFullYear() + 7));

    case 'SECURITY':
    case 'AUTHENTICATION':
      // Security logs: 2 years for investigation purposes
      return new Date(now.setFullYear(now.getFullYear() + 2));

    case 'ADMIN':
    case 'AUTHORIZATION':
      // Administrative actions: 3 years
      return new Date(now.setFullYear(now.getFullYear() + 3));

    default:
      // Default: 1 year retention
      return new Date(now.setFullYear(now.getFullYear() + 1));
  }
}

/**
 * Queue audit entry for later processing when primary storage fails
 */
function queueAuditEntry(entry: AuditEntry, context?: AuditContext): void {
  auditQueue.push({
    entry,
    context: context || { actorType: 'SYSTEM' },
    timestamp: new Date(),
  });

  // Process queue in background
  if (auditQueue.length === 1) {
    processAuditQueue();
  }
}

async function processAuditQueue(): Promise<void> {
  while (auditQueue.length > 0) {
    const item = auditQueue[0];

    try {
      await prisma.auditLog.create({
        data: {
          ...item.entry,
          ...item.context,
          timestamp: item.timestamp,
          actorIp: item.ip,
          userAgent: item.userAgent,
          status: item.entry.status || 'SUCCESS',
          retention: getRetentionDate(item.entry.category),
        },
      });
      auditQueue.shift();
    } catch {
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

/**
 * Calculate the difference between two objects for audit trail
 * Excludes sensitive fields automatically
 */
export function diffChanges(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined
): Record<string, { old: unknown; new: unknown }> {
  const changes: Record<string, { old: unknown; new: unknown }> = {};

  // Fields that should never be logged
  const sensitiveFields = [
    'password',
    'passwordHash',
    'token',
    'secret',
    'apiKey',
    'refreshToken',
    'accessToken',
    'ssn',
    'socialSecurityNumber',
    'creditCard',
    'cardNumber',
    'cvv',
  ];

  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  for (const key of allKeys) {
    // Skip sensitive fields
    if (sensitiveFields.some((f) => key.toLowerCase().includes(f.toLowerCase()))) {
      continue;
    }

    const oldValue = before?.[key];
    const newValue = after?.[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes[key] = { old: oldValue, new: newValue };
    }
  }

  return changes;
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitive(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) {
    return '*'.repeat(value.length);
  }
  return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}
```

### Specialized Audit Functions

```typescript
// lib/audit/helpers.ts
import { audit, diffChanges, maskSensitive } from './service';

/**
 * Authentication-related audit events
 */
export const auditAuth = {
  login: async (userId: string, email: string, success: boolean, reason?: string) =>
    audit({
      action: 'auth.login',
      resource: 'user',
      resourceId: userId,
      category: 'AUTHENTICATION',
      status: success ? 'SUCCESS' : 'FAILURE',
      description: success ? `User logged in` : `Login failed: ${reason}`,
      metadata: { email: maskSensitive(email, 4) },
    }),

  logout: async (userId: string) =>
    audit({
      action: 'auth.logout',
      resource: 'user',
      resourceId: userId,
      category: 'AUTHENTICATION',
      description: 'User logged out',
    }),

  passwordChange: async (userId: string, method: 'reset' | 'change') =>
    audit({
      action: 'auth.password_change',
      resource: 'user',
      resourceId: userId,
      category: 'AUTHENTICATION',
      description: `Password ${method} completed`,
      metadata: { method },
    }),

  mfaEnroll: async (userId: string, method: 'totp' | 'sms' | 'email') =>
    audit({
      action: 'auth.mfa_enroll',
      resource: 'user',
      resourceId: userId,
      category: 'SECURITY',
      description: `MFA enrolled using ${method}`,
      metadata: { method },
    }),

  sessionInvalidated: async (userId: string, reason: string) =>
    audit({
      action: 'auth.session_invalidated',
      resource: 'user',
      resourceId: userId,
      category: 'SECURITY',
      description: `Session invalidated: ${reason}`,
      metadata: { reason },
    }),
};

/**
 * Financial transaction audit events
 */
export const auditFinancial = {
  orderCreate: async (orderId: string, total: number, userId: string) =>
    audit({
      action: 'order.create',
      resource: 'order',
      resourceId: orderId,
      category: 'FINANCIAL',
      description: `Order created for $${total.toFixed(2)}`,
      metadata: { total, userId },
    }),

  paymentAttempt: async (
    orderId: string,
    amount: number,
    success: boolean,
    paymentMethod: string,
    errorCode?: string
  ) =>
    audit({
      action: 'payment.attempt',
      resource: 'order',
      resourceId: orderId,
      category: 'FINANCIAL',
      status: success ? 'SUCCESS' : 'FAILURE',
      description: success
        ? `Payment of $${amount.toFixed(2)} processed`
        : `Payment failed: ${errorCode}`,
      metadata: {
        amount,
        paymentMethod: maskSensitive(paymentMethod, 4),
        errorCode,
      },
    }),

  refundProcess: async (
    orderId: string,
    amount: number,
    reason: string,
    adminId?: string
  ) =>
    audit(
      {
        action: 'order.refund',
        resource: 'order',
        resourceId: orderId,
        category: 'FINANCIAL',
        description: `Refund of $${amount.toFixed(2)} processed`,
        metadata: { amount, reason },
      },
      adminId ? { actorType: 'ADMIN', actorId: adminId } : undefined
    ),

  subscriptionChange: async (
    userId: string,
    oldPlan: string,
    newPlan: string,
    action: 'upgrade' | 'downgrade' | 'cancel'
  ) =>
    audit({
      action: `subscription.${action}`,
      resource: 'subscription',
      resourceId: userId,
      category: 'FINANCIAL',
      description: `Subscription ${action}: ${oldPlan} -> ${newPlan}`,
      changes: { before: { plan: oldPlan }, after: { plan: newPlan } },
    }),
};

/**
 * Administrative action audit events
 */
export const auditAdmin = {
  productUpdate: async (
    productId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
    adminId: string
  ) =>
    audit(
      {
        action: 'product.update',
        resource: 'product',
        resourceId: productId,
        category: 'ADMIN',
        description: 'Product updated',
        changes: diffChanges(before, after),
      },
      { actorType: 'ADMIN', actorId: adminId }
    ),

  userAccess: async (userId: string, reason: string, adminId: string) =>
    audit(
      {
        action: 'user.view',
        resource: 'user',
        resourceId: userId,
        category: 'DATA_ACCESS',
        description: `Admin viewed user data: ${reason}`,
        metadata: { reason },
        sensitive: true,
      },
      { actorType: 'ADMIN', actorId: adminId }
    ),

  roleChange: async (
    userId: string,
    oldRole: string,
    newRole: string,
    adminId: string
  ) =>
    audit(
      {
        action: 'user.role_change',
        resource: 'user',
        resourceId: userId,
        category: 'AUTHORIZATION',
        description: `User role changed from ${oldRole} to ${newRole}`,
        changes: { before: { role: oldRole }, after: { role: newRole } },
      },
      { actorType: 'ADMIN', actorId: adminId }
    ),

  userSuspend: async (userId: string, reason: string, adminId: string) =>
    audit(
      {
        action: 'user.suspend',
        resource: 'user',
        resourceId: userId,
        category: 'ADMIN',
        description: `User suspended: ${reason}`,
        metadata: { reason },
      },
      { actorType: 'ADMIN', actorId: adminId }
    ),

  dataExport: async (
    exportType: string,
    recordCount: number,
    adminId: string
  ) =>
    audit(
      {
        action: 'data.export',
        resource: 'export',
        category: 'DATA_ACCESS',
        description: `Exported ${recordCount} ${exportType} records`,
        metadata: { exportType, recordCount },
        sensitive: true,
      },
      { actorType: 'ADMIN', actorId: adminId }
    ),
};
```

### Query API

```typescript
// app/api/admin/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';
import { audit } from '@/lib/audit/service';

const querySchema = z.object({
  resource: z.string().optional(),
  resourceId: z.string().optional(),
  actorId: z.string().optional(),
  action: z.string().optional(),
  category: z.string().optional(),
  status: z.enum(['SUCCESS', 'FAILURE', 'DENIED']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  sortBy: z.enum(['timestamp', 'action', 'resource']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export async function GET(request: NextRequest) {
  const session = await auth();

  // Verify admin access
  if (session?.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const query = querySchema.parse(params);

    // Build dynamic where clause
    const where: Record<string, unknown> = {};

    if (query.resource) where.resource = query.resource;
    if (query.resourceId) where.resourceId = query.resourceId;
    if (query.actorId) where.actorId = query.actorId;
    if (query.action) where.action = { contains: query.action };
    if (query.category) where.category = query.category;
    if (query.status) where.status = query.status;

    if (query.startDate || query.endDate) {
      where.timestamp = {};
      if (query.startDate) {
        (where.timestamp as Record<string, Date>).gte = new Date(query.startDate);
      }
      if (query.endDate) {
        (where.timestamp as Record<string, Date>).lte = new Date(query.endDate);
      }
    }

    // Execute query with pagination
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        take: query.limit,
        skip: query.offset,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Audit this query access
    await audit(
      {
        action: 'audit.query',
        resource: 'audit_log',
        category: 'DATA_ACCESS',
        description: 'Admin queried audit logs',
        metadata: {
          filters: query,
          resultCount: logs.length,
        },
      },
      { actorType: 'ADMIN', actorId: session.user.id }
    );

    return NextResponse.json({
      logs,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
        hasMore: query.offset + logs.length < total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }
    throw error;
  }
}
```

### Audit Log Cleanup Job

```typescript
// lib/jobs/audit-cleanup.ts
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit/service';

/**
 * Clean up expired audit logs according to retention policy
 * Should be run as a scheduled job (e.g., daily via cron)
 */
export async function cleanupExpiredAuditLogs(): Promise<{
  deleted: number;
  archived: number;
}> {
  const now = new Date();

  // Find logs past retention date
  const expiredLogs = await prisma.auditLog.findMany({
    where: {
      retention: { lte: now },
    },
    take: 10000, // Process in batches
  });

  // Archive to cold storage before deletion (if configured)
  const archived = await archiveToS3(expiredLogs);

  // Delete from primary database
  const deleteResult = await prisma.auditLog.deleteMany({
    where: {
      id: { in: expiredLogs.map((log) => log.id) },
    },
  });

  // Log the cleanup operation
  await audit(
    {
      action: 'audit.cleanup',
      resource: 'audit_log',
      category: 'SYSTEM',
      description: `Cleaned up ${deleteResult.count} expired audit logs`,
      metadata: {
        deleted: deleteResult.count,
        archived,
        timestamp: now.toISOString(),
      },
    },
    { actorType: 'SYSTEM' }
  );

  return { deleted: deleteResult.count, archived };
}

async function archiveToS3(logs: unknown[]): Promise<number> {
  // Implementation would upload to S3/Glacier
  // Return count of archived records
  return logs.length;
}
```

## Examples

### Example 1: Using Audit in Server Actions

```typescript
// app/actions/product.ts
'use server';

import { audit, auditAdmin, diffChanges } from '@/lib/audit/service';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateProduct(productId: string, data: {
  name?: string;
  price?: number;
  description?: string;
  inventory?: number;
}) {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    await audit({
      action: 'product.update',
      resource: 'product',
      resourceId: productId,
      category: 'AUTHORIZATION',
      status: 'DENIED',
      description: 'Unauthorized product update attempt',
    });
    throw new Error('Unauthorized');
  }

  // Fetch current state for audit trail
  const before = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!before) {
    throw new Error('Product not found');
  }

  // Perform update
  const after = await prisma.product.update({
    where: { id: productId },
    data,
  });

  // Create audit record with changes
  await auditAdmin.productUpdate(
    productId,
    before as Record<string, unknown>,
    after as Record<string, unknown>,
    session.user.id
  );

  revalidatePath('/admin/products');
  revalidatePath(`/products/${productId}`);

  return after;
}

export async function deleteProduct(productId: string) {
  const session = await auth();

  if (session?.user?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  await prisma.product.delete({ where: { id: productId } });

  await audit(
    {
      action: 'product.delete',
      resource: 'product',
      resourceId: productId,
      category: 'ADMIN',
      description: `Product "${product?.name}" deleted`,
      metadata: { productName: product?.name },
    },
    { actorType: 'ADMIN', actorId: session.user.id }
  );

  revalidatePath('/admin/products');
}
```

### Example 2: Audit Dashboard Component

```tsx
// app/admin/audit/page.tsx
import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { AuditLogTable } from '@/components/admin/audit-log-table';
import { AuditFilters } from '@/components/admin/audit-filters';

interface SearchParams {
  page?: string;
  category?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || '1', 10);
  const limit = 50;
  const offset = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (params.category) where.category = params.category;
  if (params.action) where.action = { contains: params.action };
  if (params.startDate || params.endDate) {
    where.timestamp = {};
    if (params.startDate) {
      (where.timestamp as Record<string, Date>).gte = new Date(params.startDate);
    }
    if (params.endDate) {
      (where.timestamp as Record<string, Date>).lte = new Date(params.endDate);
    }
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Audit Logs</h1>

      <AuditFilters />

      <Suspense fallback={<div>Loading...</div>}>
        <AuditLogTable
          logs={logs}
          pagination={{
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          }}
        />
      </Suspense>
    </div>
  );
}
```

### Example 3: Middleware-based Audit Logging

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add request ID for tracing
  const requestId = crypto.randomUUID();
  response.headers.set('x-request-id', requestId);

  // Log sensitive route access
  const sensitiveRoutes = ['/admin', '/api/admin', '/account/settings'];
  const isSensitive = sensitiveRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isSensitive) {
    // Queue audit log via edge-compatible method
    await fetch(`${request.nextUrl.origin}/api/internal/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'route.access',
        resource: 'page',
        resourceId: request.nextUrl.pathname,
        metadata: {
          requestId,
          method: request.method,
          userAgent: request.headers.get('user-agent'),
        },
      }),
    }).catch(() => {
      // Silently fail - audit should never block requests
    });
  }

  return response;
}
```

## Anti-patterns

### Anti-pattern 1: Logging Sensitive Data

```typescript
// BAD - Logging sensitive information
await audit({
  action: 'user.update',
  resource: 'user',
  resourceId: userId,
  category: 'DATA_MODIFY',
  metadata: {
    password: newPassword,           // NEVER log passwords
    creditCard: cardNumber,          // NEVER log card numbers
    ssn: socialSecurityNumber,       // NEVER log SSN
  },
});

// GOOD - Mask or omit sensitive data
await audit({
  action: 'user.update',
  resource: 'user',
  resourceId: userId,
  category: 'DATA_MODIFY',
  description: 'User password updated',
  metadata: {
    cardLast4: maskSensitive(cardNumber, 4), // Only last 4 digits
    // SSN not logged at all
  },
});
```

### Anti-pattern 2: Synchronous Blocking Audit Calls

```typescript
// BAD - Blocking the response while audit completes
export async function POST(request: NextRequest) {
  const data = await request.json();

  // This blocks the response until audit is complete
  await prisma.auditLog.create({
    data: { action: 'api.call', ... },
  });

  // User waits for audit to complete
  return NextResponse.json({ success: true });
}

// GOOD - Fire-and-forget audit logging
export async function POST(request: NextRequest) {
  const data = await request.json();

  // Non-blocking audit - don't await
  audit({
    action: 'api.call',
    resource: 'api',
    category: 'DATA_ACCESS',
  }).catch(console.error);

  // Response returns immediately
  return NextResponse.json({ success: true });
}
```

### Anti-pattern 3: Missing Context and Actor Information

```typescript
// BAD - Minimal context makes logs useless
await audit({
  action: 'update',
  resource: 'data',
  category: 'DATA_MODIFY',
});

// GOOD - Rich context enables investigation
await audit({
  action: 'product.price_update',
  resource: 'product',
  resourceId: productId,
  category: 'ADMIN',
  description: `Price updated from $${oldPrice} to $${newPrice}`,
  changes: {
    before: { price: oldPrice },
    after: { price: newPrice },
  },
  metadata: {
    reason: 'Seasonal sale',
    approvedBy: managerId,
  },
}, {
  actorType: 'ADMIN',
  actorId: session.user.id,
  actorEmail: session.user.email,
});
```

## Testing

### Unit Tests for Audit Service

```typescript
// __tests__/lib/audit/service.test.ts
import { diffChanges, maskSensitive } from '@/lib/audit/service';

describe('Audit Service', () => {
  describe('diffChanges', () => {
    it('detects changed fields', () => {
      const before = { name: 'Old Name', price: 100 };
      const after = { name: 'New Name', price: 100 };

      const changes = diffChanges(before, after);

      expect(changes).toEqual({
        name: { old: 'Old Name', new: 'New Name' },
      });
    });

    it('detects added and removed fields', () => {
      const before = { name: 'Product', oldField: 'value' };
      const after = { name: 'Product', newField: 'value' };

      const changes = diffChanges(before, after);

      expect(changes).toHaveProperty('oldField');
      expect(changes).toHaveProperty('newField');
    });

    it('excludes sensitive fields', () => {
      const before = { name: 'User', password: 'old123' };
      const after = { name: 'User', password: 'new456' };

      const changes = diffChanges(before, after);

      expect(changes).not.toHaveProperty('password');
    });

    it('handles null/undefined before values', () => {
      const changes = diffChanges(null, { name: 'New' });

      expect(changes).toEqual({
        name: { old: undefined, new: 'New' },
      });
    });
  });

  describe('maskSensitive', () => {
    it('masks all but last N characters', () => {
      expect(maskSensitive('1234567890', 4)).toBe('******7890');
      expect(maskSensitive('secret@email.com', 4)).toBe('************.com');
    });

    it('masks entirely if shorter than visible chars', () => {
      expect(maskSensitive('abc', 4)).toBe('***');
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/audit.test.ts
import { prisma } from '@/lib/prisma';
import { audit, auditAuth } from '@/lib/audit/service';

describe('Audit Integration', () => {
  beforeEach(async () => {
    await prisma.auditLog.deleteMany();
  });

  it('creates audit log entry', async () => {
    await audit({
      action: 'test.action',
      resource: 'test',
      resourceId: 'test-123',
      category: 'SYSTEM',
      description: 'Test audit entry',
    });

    const logs = await prisma.auditLog.findMany();
    expect(logs).toHaveLength(1);
    expect(logs[0].action).toBe('test.action');
    expect(logs[0].resourceId).toBe('test-123');
  });

  it('sets correct retention dates', async () => {
    await audit({
      action: 'financial.test',
      resource: 'order',
      category: 'FINANCIAL',
    });

    const log = await prisma.auditLog.findFirst();
    const retention = new Date(log!.retention!);
    const expectedYear = new Date().getFullYear() + 7;

    expect(retention.getFullYear()).toBe(expectedYear);
  });

  it('captures authentication events correctly', async () => {
    await auditAuth.login('user-123', 'test@example.com', true);

    const log = await prisma.auditLog.findFirst({
      where: { action: 'auth.login' },
    });

    expect(log).toBeDefined();
    expect(log!.category).toBe('AUTHENTICATION');
    expect(log!.status).toBe('SUCCESS');
  });
});
```

## Related Skills

- [RBAC](../patterns/rbac.md) - Role-based access control for admin audit access
- [Error Tracking](../patterns/error-tracking.md) - Correlating errors with audit events
- [Background Jobs](../patterns/background-jobs.md) - Scheduled audit cleanup
- [Encryption](../patterns/encryption.md) - Encrypting sensitive audit data
- [Data Export](../patterns/data-export.md) - Exporting audit logs for compliance

---

## Changelog

### 1.1.0 (2026-01-18)
- Added comprehensive Overview section with compliance context
- Added When NOT to Use section
- Added detailed Composition Diagram
- Added specialized audit helpers for auth, financial, admin
- Added 3 real-world examples including middleware integration
- Added 3 anti-patterns with detailed explanations
- Added unit and integration tests
- Added audit log cleanup job for retention management
- Expanded Related Skills section

### 1.0.0 (2025-01-18)
- Initial implementation
- Database schema with Prisma
- Core audit service
- Query API for admin dashboard
