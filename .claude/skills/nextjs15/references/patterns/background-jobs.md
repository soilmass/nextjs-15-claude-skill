---
id: pt-background-jobs
name: Background Jobs
version: 2.0.0
layer: L5
category: background
description: Process long-running tasks asynchronously outside the request lifecycle
tags: [jobs, background, async, queue, worker]
composes: []
dependencies: []
formula: Inngest/Trigger.dev + Functions + Events = Reliable Background Processing
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

- Email sending at scale
- Image/video processing
- Report and PDF generation
- Large data imports/exports
- Webhook delivery with retries
- Notification batching

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Background Jobs Architecture                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  API Request                                                │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Trigger Event                                       │   │
│  │ inngest.send({ name: 'user/signup', data })        │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│  Response: { success: true } (fast!)                       │
│                        │                                    │
│                        ▼ (async)                           │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Inngest Function                                    │   │
│  │                                                     │   │
│  │ inngest.createFunction(                             │   │
│  │   { id: 'send-welcome' },                          │   │
│  │   { event: 'user/signup' },                        │   │
│  │   async ({ event, step }) => {                     │   │
│  │     await step.run('send-email', () => ...)        │   │
│  │     await step.sleep('wait', '1h')                 │   │
│  │     await step.run('follow-up', () => ...)         │   │
│  │   }                                                │   │
│  │ )                                                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Features: Retries, Logging, Steps, Sleep, Fan-out         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Background Jobs

Process long-running tasks asynchronously to keep your API responses fast and handle complex operations reliably.

## Overview

Background jobs are used for:
- Email sending
- Image/video processing
- Report generation
- Data imports/exports
- Webhook delivery
- Notification batching

## Implementation

### Inngest for Background Jobs

```typescript
// lib/inngest/client.ts
import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "my-app",
  schemas: new EventSchemas().fromRecord<{
    "user/signed.up": { data: { userId: string; email: string } };
    "order/created": { data: { orderId: string; amount: number } };
    "email/send": { data: { to: string; subject: string; html: string } };
    "image/process": { data: { imageId: string; operations: string[] } };
  }>(),
});

// Define background functions
// lib/inngest/functions/welcome-email.ts
import { inngest } from "../client";
import { sendEmail } from "@/lib/email";

export const sendWelcomeEmail = inngest.createFunction(
  { id: "send-welcome-email" },
  { event: "user/signed.up" },
  async ({ event, step }) => {
    const { userId, email } = event.data;
    
    // Step 1: Get user details
    const user = await step.run("get-user", async () => {
      return prisma.user.findUnique({ where: { id: userId } });
    });
    
    // Step 2: Send welcome email
    await step.run("send-email", async () => {
      await sendEmail({
        to: email,
        subject: `Welcome to our app, ${user?.name}!`,
        template: "welcome",
        data: { name: user?.name },
      });
    });
    
    // Step 3: Schedule follow-up (after 3 days)
    await step.sleep("wait-for-followup", "3 days");
    
    // Step 4: Send follow-up email
    await step.run("send-followup", async () => {
      await sendEmail({
        to: email,
        subject: "How's it going?",
        template: "followup",
        data: { name: user?.name },
      });
    });
    
    return { sent: true };
  }
);
```

### API Route for Inngest

```typescript
// app/api/inngest/route.ts
import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { sendWelcomeEmail } from "@/lib/inngest/functions/welcome-email";
import { processOrder } from "@/lib/inngest/functions/process-order";
import { processImage } from "@/lib/inngest/functions/process-image";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    sendWelcomeEmail,
    processOrder,
    processImage,
  ],
});
```

### Trigger Background Jobs

```typescript
// app/actions/users.ts
"use server";

import { inngest } from "@/lib/inngest/client";
import { prisma } from "@/lib/db";

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  
  // Create user in database
  const user = await prisma.user.create({
    data: { email, name },
  });
  
  // Trigger background job
  await inngest.send({
    name: "user/signed.up",
    data: {
      userId: user.id,
      email: user.email,
    },
  });
  
  return { success: true, user };
}
```

### Upstash QStash for Serverless Jobs

```typescript
// lib/qstash/client.ts
import { Client } from "@upstash/qstash";

export const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

// Publish a job
export async function enqueueJob(
  destination: string,
  payload: unknown,
  options?: {
    delay?: number;
    retries?: number;
    callback?: string;
  }
) {
  const response = await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}${destination}`,
    body: payload,
    delay: options?.delay,
    retries: options?.retries || 3,
    callback: options?.callback
      ? `${process.env.NEXT_PUBLIC_APP_URL}${options.callback}`
      : undefined,
  });
  
  return response.messageId;
}

// Job handler wrapper
// app/api/jobs/[job]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@upstash/qstash/nextjs";

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ job: string }> }
) {
  const { job } = await params;
  const payload = await request.json();
  
  // Route to appropriate handler
  switch (job) {
    case "send-email":
      await handleSendEmail(payload);
      break;
    case "process-image":
      await handleProcessImage(payload);
      break;
    case "generate-report":
      await handleGenerateReport(payload);
      break;
    default:
      return NextResponse.json({ error: "Unknown job" }, { status: 400 });
  }
  
  return NextResponse.json({ success: true });
}

// Verify QStash signature
export const POST = verifySignature(handler);

// Job handlers
async function handleSendEmail(payload: {
  to: string;
  subject: string;
  template: string;
}) {
  const { to, subject, template } = payload;
  // Send email logic
}

async function handleProcessImage(payload: { imageId: string }) {
  // Image processing logic
}

async function handleGenerateReport(payload: { reportId: string }) {
  // Report generation logic
}
```

### Trigger QStash Jobs

```typescript
// app/actions/orders.ts
"use server";

import { enqueueJob } from "@/lib/qstash/client";

export async function createOrder(formData: FormData) {
  // Create order
  const order = await prisma.order.create({
    data: { /* ... */ },
  });
  
  // Queue background jobs
  await Promise.all([
    // Send confirmation email
    enqueueJob("/api/jobs/send-email", {
      to: order.email,
      subject: "Order Confirmation",
      template: "order-confirmation",
      orderId: order.id,
    }),
    
    // Process payment (with 5 second delay)
    enqueueJob("/api/jobs/process-payment", {
      orderId: order.id,
      amount: order.total,
    }, { delay: 5 }),
    
    // Generate invoice (with callback)
    enqueueJob("/api/jobs/generate-invoice", {
      orderId: order.id,
    }, {
      callback: "/api/callbacks/invoice-generated",
    }),
  ]);
  
  return { success: true, orderId: order.id };
}
```

### Simple Background Job with fetch

```typescript
// For simple fire-and-forget jobs without external services
// lib/jobs/simple.ts

export async function runBackgroundJob(
  endpoint: string,
  data: unknown,
  options?: { signal?: AbortSignal }
) {
  // Fire and don't wait
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Background-Job": "true",
      Authorization: `Bearer ${process.env.INTERNAL_API_KEY}`,
    },
    body: JSON.stringify(data),
    signal: options?.signal,
  }).catch(console.error); // Don't block on errors
}

// API route that handles background job
// app/api/internal/send-notification/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Verify internal request
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.INTERNAL_API_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const { userId, message } = await request.json();
  
  // Process in background (response already sent)
  await sendPushNotification(userId, message);
  await createNotificationRecord(userId, message);
  
  return NextResponse.json({ success: true });
}
```

### Job Status Tracking

```typescript
// lib/jobs/status.ts
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

interface JobStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  result?: unknown;
  error?: string;
  createdAt: number;
  updatedAt: number;
}

export async function createJob(jobId: string): Promise<JobStatus> {
  const job: JobStatus = {
    id: jobId,
    status: "pending",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  await redis.hset(`job:${jobId}`, job);
  await redis.expire(`job:${jobId}`, 86400); // 24 hours
  
  return job;
}

export async function updateJobStatus(
  jobId: string,
  update: Partial<JobStatus>
): Promise<void> {
  await redis.hset(`job:${jobId}`, {
    ...update,
    updatedAt: Date.now(),
  });
}

export async function getJobStatus(jobId: string): Promise<JobStatus | null> {
  const job = await redis.hgetall<JobStatus>(`job:${jobId}`);
  return job || null;
}

// API route for job status
// app/api/jobs/[id]/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getJobStatus } from "@/lib/jobs/status";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const status = await getJobStatus(id);
  
  if (!status) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  
  return NextResponse.json(status);
}

// Client hook for polling job status
// hooks/use-job-status.ts
"use client";

import { useQuery } from "@tanstack/react-query";

export function useJobStatus(jobId: string | null) {
  return useQuery({
    queryKey: ["job-status", jobId],
    queryFn: async () => {
      const res = await fetch(`/api/jobs/${jobId}/status`);
      return res.json();
    },
    enabled: !!jobId,
    refetchInterval: (data) => {
      if (data?.status === "completed" || data?.status === "failed") {
        return false; // Stop polling
      }
      return 2000; // Poll every 2 seconds
    },
  });
}
```

### Progress Tracking UI

```typescript
// components/job-progress.tsx
"use client";

import { useJobStatus } from "@/hooks/use-job-status";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

interface JobProgressProps {
  jobId: string;
  onComplete?: (result: unknown) => void;
  onError?: (error: string) => void;
}

export function JobProgress({ jobId, onComplete, onError }: JobProgressProps) {
  const { data: job, isLoading } = useJobStatus(jobId);
  
  useEffect(() => {
    if (job?.status === "completed" && onComplete) {
      onComplete(job.result);
    }
    if (job?.status === "failed" && onError) {
      onError(job.error || "Unknown error");
    }
  }, [job?.status, job?.result, job?.error, onComplete, onError]);
  
  if (isLoading || !job) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Initializing...
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {job.status === "completed" && (
            <CheckCircle className="h-4 w-4 text-green-500" />
          )}
          {job.status === "failed" && (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          {(job.status === "pending" || job.status === "processing") && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          <span className="text-sm capitalize">{job.status}</span>
        </div>
        {job.progress !== undefined && (
          <span className="text-sm text-muted-foreground">
            {job.progress}%
          </span>
        )}
      </div>
      
      {job.progress !== undefined && job.status === "processing" && (
        <Progress value={job.progress} />
      )}
      
      {job.error && (
        <p className="text-sm text-red-500">{job.error}</p>
      )}
    </div>
  );
}
```

## Variants

### Batched Jobs

```typescript
// lib/jobs/batch.ts
import { inngest } from "@/lib/inngest/client";

export const processBatch = inngest.createFunction(
  {
    id: "process-batch",
    batchEvents: {
      maxSize: 100,
      timeout: "5s",
    },
  },
  { event: "item/created" },
  async ({ events, step }) => {
    // Process all items in a single batch
    const items = events.map((e) => e.data);
    
    await step.run("process-items", async () => {
      await prisma.item.updateMany({
        where: { id: { in: items.map((i) => i.id) } },
        data: { processed: true },
      });
    });
    
    return { processed: items.length };
  }
);
```

### Fan-out Pattern

```typescript
// Process multiple items in parallel
export const processImages = inngest.createFunction(
  { id: "process-images" },
  { event: "album/created" },
  async ({ event, step }) => {
    const { imageIds } = event.data;
    
    // Fan out to process each image
    const results = await Promise.all(
      imageIds.map((imageId) =>
        step.run(`process-${imageId}`, async () => {
          return processImage(imageId);
        })
      )
    );
    
    return { processed: results.length };
  }
);
```

## Anti-patterns

### Long-Running Synchronous Jobs

```typescript
// BAD: Blocking the request
export async function POST(request: NextRequest) {
  const { images } = await request.json();
  
  // This blocks for minutes!
  for (const image of images) {
    await processImage(image);
  }
  
  return NextResponse.json({ success: true });
}

// GOOD: Queue for background processing
export async function POST(request: NextRequest) {
  const { images } = await request.json();
  
  const jobId = await enqueueJob("/api/jobs/process-images", { images });
  
  return NextResponse.json({ jobId }); // Return immediately
}
```

## Related Skills

- `queues` - Message queue patterns
- `cron-jobs` - Scheduled jobs
- `webhooks` - Webhook handlers
- `server-actions` - Server action triggers

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial implementation with Inngest and QStash
