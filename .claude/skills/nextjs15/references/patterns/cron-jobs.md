---
id: pt-cron-jobs
name: Cron Jobs
version: 2.0.0
layer: L5
category: background
description: Schedule recurring tasks using cron expressions
tags: [jobs, cron, schedule, recurring, automation]
composes: []
dependencies: []
formula: Vercel Cron + Route Handler + Cron Expression = Scheduled Automation
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Daily/weekly report generation
- Database cleanup and maintenance
- Cache warming and invalidation
- Subscription renewal checks
- Data synchronization
- Health checks and monitoring

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Cron Job Architecture                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  vercel.json                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ {                                                   │   │
│  │   "crons": [                                        │   │
│  │     { "path": "/api/cron/daily", "schedule": "0 0 * * *" }
│  │     { "path": "/api/cron/hourly", "schedule": "0 * * * *" }
│  │   ]                                                 │   │
│  │ }                                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Vercel Scheduler triggers at schedule                      │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ /api/cron/daily/route.ts                            │   │
│  │                                                     │   │
│  │ 1. Verify CRON_SECRET header                        │   │
│  │ 2. Execute scheduled task                           │   │
│  │ 3. Log results                                      │   │
│  │ 4. Send alerts on failure                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Common schedules:                                          │
│  - "0 0 * * *" (daily at midnight)                         │
│  - "0 * * * *" (every hour)                                │
│  - "*/15 * * * *" (every 15 minutes)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Cron Jobs

Schedule recurring tasks like daily reports, cleanup jobs, and data syncs using cron expressions.

## Overview

Cron jobs handle:
- Daily/weekly reports
- Database cleanup
- Cache warming
- Data synchronization
- Subscription renewals
- Health checks

## Implementation

### Vercel Cron Jobs

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/daily-report",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 0 * * *"
    },
    {
      "path": "/api/cron/sync-data",
      "schedule": "*/15 * * * *"
    }
  ]
}

// app/api/cron/daily-report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { generateDailyReport } from "@/lib/reports";
import { sendEmail } from "@/lib/email";

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  try {
    // Generate the report
    const report = await generateDailyReport();
    
    // Send to admins
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true },
    });
    
    await Promise.all(
      admins.map((admin) =>
        sendEmail({
          to: admin.email,
          subject: `Daily Report - ${new Date().toLocaleDateString()}`,
          template: "daily-report",
          data: report,
        })
      )
    );
    
    return NextResponse.json({ success: true, sent: admins.length });
  } catch (error) {
    console.error("Daily report error:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

// Cron configuration for the route
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes
```

### Inngest Scheduled Functions

```typescript
// lib/inngest/functions/scheduled.ts
import { inngest } from "../client";

// Daily cleanup at midnight UTC
export const dailyCleanup = inngest.createFunction(
  { id: "daily-cleanup" },
  { cron: "0 0 * * *" }, // Every day at midnight
  async ({ step }) => {
    // Clean up expired sessions
    const deletedSessions = await step.run("delete-sessions", async () => {
      const result = await prisma.session.deleteMany({
        where: {
          expiresAt: { lt: new Date() },
        },
      });
      return result.count;
    });
    
    // Clean up old notifications
    const deletedNotifications = await step.run("delete-notifications", async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const result = await prisma.notification.deleteMany({
        where: {
          read: true,
          createdAt: { lt: thirtyDaysAgo },
        },
      });
      return result.count;
    });
    
    // Clean up orphaned files
    const deletedFiles = await step.run("delete-files", async () => {
      return await cleanOrphanedFiles();
    });
    
    return {
      deletedSessions,
      deletedNotifications,
      deletedFiles,
    };
  }
);

// Weekly analytics aggregation
export const weeklyAnalytics = inngest.createFunction(
  { id: "weekly-analytics" },
  { cron: "0 1 * * 0" }, // Every Sunday at 1 AM
  async ({ step }) => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Aggregate page views
    await step.run("aggregate-views", async () => {
      await prisma.$executeRaw`
        INSERT INTO weekly_analytics (week_start, page_views, unique_visitors)
        SELECT 
          date_trunc('week', created_at) as week_start,
          COUNT(*) as page_views,
          COUNT(DISTINCT visitor_id) as unique_visitors
        FROM page_views
        WHERE created_at >= ${lastWeek}
        GROUP BY week_start
        ON CONFLICT (week_start) DO UPDATE
        SET page_views = EXCLUDED.page_views,
            unique_visitors = EXCLUDED.unique_visitors
      `;
    });
    
    // Archive old detailed data
    await step.run("archive-old-data", async () => {
      await archiveOldAnalytics();
    });
    
    return { success: true };
  }
);

// Hourly cache warming
export const warmCache = inngest.createFunction(
  { id: "warm-cache" },
  { cron: "0 * * * *" }, // Every hour
  async ({ step }) => {
    // Warm popular product pages
    const popularProducts = await step.run("get-popular", async () => {
      return prisma.product.findMany({
        where: { published: true },
        orderBy: { views: "desc" },
        take: 100,
      });
    });
    
    // Prefetch and cache
    await step.run("warm-pages", async () => {
      await Promise.all(
        popularProducts.map((product) =>
          fetch(`${process.env.NEXT_PUBLIC_APP_URL}/products/${product.slug}`, {
            headers: { "X-Prerender": "1" },
          })
        )
      );
    });
    
    return { warmed: popularProducts.length };
  }
);
```

### QStash Scheduled Jobs

```typescript
// lib/qstash/schedules.ts
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

// Create a scheduled job
export async function createSchedule(
  name: string,
  cron: string,
  destination: string,
  payload?: unknown
) {
  const schedule = await qstash.schedules.create({
    destination: `${process.env.NEXT_PUBLIC_APP_URL}${destination}`,
    cron,
    body: payload ? JSON.stringify(payload) : undefined,
    headers: {
      "Content-Type": "application/json",
    },
  });
  
  return schedule.scheduleId;
}

// Delete a scheduled job
export async function deleteSchedule(scheduleId: string) {
  await qstash.schedules.delete(scheduleId);
}

// List all schedules
export async function listSchedules() {
  return qstash.schedules.list();
}

// Example: Set up schedules on app start
// lib/qstash/setup.ts
export async function setupSchedules() {
  // Daily report at 9 AM UTC
  await createSchedule(
    "daily-report",
    "0 9 * * *",
    "/api/cron/daily-report"
  );
  
  // Cleanup every night at midnight
  await createSchedule(
    "nightly-cleanup",
    "0 0 * * *",
    "/api/cron/cleanup"
  );
  
  // Check subscriptions every hour
  await createSchedule(
    "check-subscriptions",
    "0 * * * *",
    "/api/cron/subscriptions"
  );
}
```

### Cron Handler with Retries

```typescript
// lib/cron/handler.ts
import { NextRequest, NextResponse } from "next/server";

interface CronHandlerOptions {
  maxRetries?: number;
  timeout?: number;
  onError?: (error: Error) => Promise<void>;
}

export function createCronHandler(
  handler: () => Promise<unknown>,
  options: CronHandlerOptions = {}
) {
  const { maxRetries = 3, timeout = 300000, onError } = options;
  
  return async function (request: NextRequest) {
    // Verify cron request
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const retryCount = parseInt(
      request.headers.get("x-retry-count") || "0"
    );
    
    try {
      // Execute with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const result = await Promise.race([
        handler(),
        new Promise((_, reject) => {
          controller.signal.addEventListener("abort", () => {
            reject(new Error("Timeout"));
          });
        }),
      ]);
      
      clearTimeout(timeoutId);
      
      return NextResponse.json({ success: true, result });
    } catch (error) {
      console.error(`Cron job failed (attempt ${retryCount + 1}):`, error);
      
      if (onError) {
        await onError(error as Error);
      }
      
      // Return 500 to trigger retry (if configured)
      if (retryCount < maxRetries) {
        return NextResponse.json(
          { error: "Job failed, will retry" },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        { error: "Job failed after max retries" },
        { status: 500 }
      );
    }
  };
}

// Usage
// app/api/cron/daily-cleanup/route.ts
import { createCronHandler } from "@/lib/cron/handler";
import { sendAlertEmail } from "@/lib/email";

export const GET = createCronHandler(
  async () => {
    // Cleanup logic
    const deletedSessions = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    
    return { deletedSessions: deletedSessions.count };
  },
  {
    maxRetries: 3,
    timeout: 60000,
    onError: async (error) => {
      await sendAlertEmail({
        subject: "Cron Job Failed: daily-cleanup",
        body: error.message,
      });
    },
  }
);

export const dynamic = "force-dynamic";
```

### Cron Job Monitoring

```typescript
// lib/cron/monitor.ts
import { prisma } from "@/lib/db";

interface CronExecution {
  name: string;
  startedAt: Date;
  completedAt?: Date;
  status: "running" | "completed" | "failed";
  result?: unknown;
  error?: string;
}

export async function recordCronStart(name: string): Promise<string> {
  const execution = await prisma.cronExecution.create({
    data: {
      name,
      startedAt: new Date(),
      status: "running",
    },
  });
  
  return execution.id;
}

export async function recordCronComplete(
  executionId: string,
  result: unknown
): Promise<void> {
  await prisma.cronExecution.update({
    where: { id: executionId },
    data: {
      completedAt: new Date(),
      status: "completed",
      result: result as any,
    },
  });
}

export async function recordCronFailure(
  executionId: string,
  error: Error
): Promise<void> {
  await prisma.cronExecution.update({
    where: { id: executionId },
    data: {
      completedAt: new Date(),
      status: "failed",
      error: error.message,
    },
  });
}

// Wrapper to add monitoring
export function withMonitoring(
  name: string,
  handler: () => Promise<unknown>
) {
  return async () => {
    const executionId = await recordCronStart(name);
    
    try {
      const result = await handler();
      await recordCronComplete(executionId, result);
      return result;
    } catch (error) {
      await recordCronFailure(executionId, error as Error);
      throw error;
    }
  };
}

// Usage
export const GET = createCronHandler(
  withMonitoring("daily-report", async () => {
    return generateDailyReport();
  })
);
```

### Admin UI for Cron Jobs

```typescript
// app/admin/cron/page.tsx
import { prisma } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";

export default async function CronJobsPage() {
  const recentExecutions = await prisma.cronExecution.findMany({
    orderBy: { startedAt: "desc" },
    take: 50,
  });
  
  const jobStats = await prisma.cronExecution.groupBy({
    by: ["name", "status"],
    _count: true,
    where: {
      startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Cron Jobs</h1>
      
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {/* Render stats */}
      </div>
      
      {/* Recent executions */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left">Job</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Started</th>
              <th className="p-3 text-left">Duration</th>
            </tr>
          </thead>
          <tbody>
            {recentExecutions.map((execution) => (
              <tr key={execution.id} className="border-b">
                <td className="p-3">{execution.name}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      execution.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : execution.status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {execution.status}
                  </span>
                </td>
                <td className="p-3">
                  {formatDistanceToNow(execution.startedAt, { addSuffix: true })}
                </td>
                <td className="p-3">
                  {execution.completedAt
                    ? `${
                        (execution.completedAt.getTime() -
                          execution.startedAt.getTime()) /
                        1000
                      }s`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

## Variants

### Cron Expression Builder

```typescript
// lib/cron/expression.ts

export function buildCronExpression(options: {
  minute?: number | "*";
  hour?: number | "*";
  dayOfMonth?: number | "*";
  month?: number | "*";
  dayOfWeek?: number | "*";
}): string {
  const {
    minute = "*",
    hour = "*",
    dayOfMonth = "*",
    month = "*",
    dayOfWeek = "*",
  } = options;
  
  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
}

// Preset expressions
export const CronPresets = {
  everyMinute: "* * * * *",
  every5Minutes: "*/5 * * * *",
  every15Minutes: "*/15 * * * *",
  everyHour: "0 * * * *",
  everyDay: "0 0 * * *",
  everyDayAt9AM: "0 9 * * *",
  everyWeekday: "0 0 * * 1-5",
  everyWeekend: "0 0 * * 0,6",
  everyMonday: "0 0 * * 1",
  firstOfMonth: "0 0 1 * *",
} as const;
```

## Anti-patterns

### No Idempotency

```typescript
// BAD: Running twice creates duplicate entries
async function sendDailyDigest() {
  const users = await getUsers();
  for (const user of users) {
    await sendEmail(user.email, "Daily Digest");
    await createDigestRecord(user.id); // Duplicate if run twice!
  }
}

// GOOD: Idempotent operation
async function sendDailyDigest() {
  const today = new Date().toISOString().split("T")[0];
  
  const users = await prisma.user.findMany({
    where: {
      NOT: {
        digestRecords: { some: { date: today } },
      },
    },
  });
  
  for (const user of users) {
    await prisma.$transaction([
      prisma.digestRecord.create({ data: { userId: user.id, date: today } }),
      // Then send email...
    ]);
  }
}
```

## Related Skills

- `background-jobs` - Background processing
- `queues` - Message queues
- `scheduled-tasks` - Task scheduling

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Vercel Cron and Inngest
