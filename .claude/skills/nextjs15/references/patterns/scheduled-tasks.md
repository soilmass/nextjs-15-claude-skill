---
id: pt-scheduled-tasks
name: Scheduled Tasks
version: 2.0.0
layer: L5
category: background
description: Schedule one-time tasks for future execution
tags: [jobs, schedule, delay, future, tasks]
composes: []
dependencies: []
formula: QStash/Inngest + Delay + Callback = Future Task Execution
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

- Reminder emails at specific times
- Trial expiration notifications
- Subscription renewal processing
- Delayed follow-up actions
- Time-sensitive operations

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Scheduled Tasks Flow                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Action triggers schedule                                   │
│     │                                                       │
│     ▼                                                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Schedule Service (QStash/Inngest)                   │   │
│  │                                                     │   │
│  │ scheduleTask({                                      │   │
│  │   callback: '/api/tasks/reminder',                  │   │
│  │   delay: '24h',  // or absolute time               │   │
│  │   payload: { userId, type }                         │   │
│  │ })                                                  │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│          (waits for scheduled time)                        │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Callback Endpoint                                   │   │
│  │                                                     │   │
│  │ /api/tasks/reminder                                 │   │
│  │ - Verify signature                                  │   │
│  │ - Execute scheduled action                          │   │
│  │ - Handle cancellation if needed                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Capabilities:                                              │
│  - Cancel scheduled tasks                                  │
│  - Reschedule tasks                                        │
│  - Idempotent execution                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Scheduled Tasks

Schedule one-time tasks for future execution like reminder emails, subscription renewals, and delayed notifications.

## Overview

Scheduled tasks handle:
- Reminder emails
- Trial expirations
- Subscription renewals
- Delayed notifications
- Follow-up actions
- Time-sensitive operations

## Implementation

### Upstash QStash Scheduling

```typescript
// lib/scheduling/qstash.ts
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

interface ScheduledTask {
  taskId: string;
  type: string;
  data: unknown;
  scheduledFor: Date;
  status: "pending" | "completed" | "failed" | "cancelled";
}

export async function scheduleTask(
  type: string,
  data: unknown,
  scheduledFor: Date
): Promise<string> {
  const delaySeconds = Math.max(
    0,
    Math.floor((scheduledFor.getTime() - Date.now()) / 1000)
  );
  
  // Create task record
  const task = await prisma.scheduledTask.create({
    data: {
      type,
      data: data as any,
      scheduledFor,
      status: "pending",
    },
  });
  
  // Schedule with QStash
  const response = await qstash.publishJSON({
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/tasks/execute`,
    body: { taskId: task.id, type, data },
    delay: delaySeconds,
    headers: {
      "X-Task-ID": task.id,
    },
  });
  
  // Store QStash message ID for cancellation
  await prisma.scheduledTask.update({
    where: { id: task.id },
    data: { messageId: response.messageId },
  });
  
  return task.id;
}

export async function cancelTask(taskId: string): Promise<boolean> {
  const task = await prisma.scheduledTask.findUnique({
    where: { id: taskId },
  });
  
  if (!task || task.status !== "pending") {
    return false;
  }
  
  // Cancel in QStash
  if (task.messageId) {
    try {
      await qstash.messages.delete(task.messageId);
    } catch {
      // Message may have already been processed
    }
  }
  
  await prisma.scheduledTask.update({
    where: { id: taskId },
    data: { status: "cancelled" },
  });
  
  return true;
}

export async function getScheduledTasks(
  options: { type?: string; status?: string; limit?: number } = {}
): Promise<ScheduledTask[]> {
  return prisma.scheduledTask.findMany({
    where: {
      type: options.type,
      status: options.status as any,
    },
    orderBy: { scheduledFor: "asc" },
    take: options.limit || 100,
  });
}
```

### Task Execution Handler

```typescript
// app/api/tasks/execute/route.ts
import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@upstash/qstash/nextjs";
import {
  sendReminderEmail,
  processTrialExpiration,
  renewSubscription,
  sendFollowUp,
} from "@/lib/tasks/handlers";

async function handler(request: NextRequest) {
  const { taskId, type, data } = await request.json();
  
  // Update task status
  await prisma.scheduledTask.update({
    where: { id: taskId },
    data: { status: "processing" },
  });
  
  try {
    // Route to appropriate handler
    switch (type) {
      case "reminder":
        await sendReminderEmail(data);
        break;
      case "trial-expiration":
        await processTrialExpiration(data);
        break;
      case "subscription-renewal":
        await renewSubscription(data);
        break;
      case "follow-up":
        await sendFollowUp(data);
        break;
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    
    // Mark as completed
    await prisma.scheduledTask.update({
      where: { id: taskId },
      data: {
        status: "completed",
        completedAt: new Date(),
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    // Mark as failed
    await prisma.scheduledTask.update({
      where: { id: taskId },
      data: {
        status: "failed",
        error: (error as Error).message,
      },
    });
    
    throw error;
  }
}

export const POST = verifySignature(handler);
```

### Task Handlers

```typescript
// lib/tasks/handlers.ts
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import { scheduleTask } from "@/lib/scheduling/qstash";

// Reminder email handler
export async function sendReminderEmail(data: {
  userId: string;
  subject: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  
  if (!user) return;
  
  await sendEmail({
    to: user.email,
    subject: data.subject,
    template: "reminder",
    data: {
      name: user.name,
      message: data.message,
      linkText: data.linkText,
      linkUrl: data.linkUrl,
    },
  });
}

// Trial expiration handler
export async function processTrialExpiration(data: {
  subscriptionId: string;
}) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: data.subscriptionId },
    include: { user: true },
  });
  
  if (!subscription) return;
  
  // Check if they've upgraded
  if (subscription.status !== "trialing") {
    return; // Already handled
  }
  
  // Expire the trial
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: { status: "expired" },
  });
  
  // Send expiration email
  await sendEmail({
    to: subscription.user.email,
    subject: "Your trial has expired",
    template: "trial-expired",
    data: { name: subscription.user.name },
  });
}

// Subscription renewal handler
export async function renewSubscription(data: {
  subscriptionId: string;
}) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: data.subscriptionId },
    include: { user: true, plan: true },
  });
  
  if (!subscription || subscription.status !== "active") {
    return;
  }
  
  try {
    // Charge the card
    const charge = await stripe.charges.create({
      amount: subscription.plan.price,
      currency: "usd",
      customer: subscription.user.stripeCustomerId,
    });
    
    // Update subscription
    const newEndDate = new Date(subscription.currentPeriodEnd);
    newEndDate.setMonth(newEndDate.getMonth() + 1);
    
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { currentPeriodEnd: newEndDate },
    });
    
    // Schedule next renewal
    await scheduleTask(
      "subscription-renewal",
      { subscriptionId: subscription.id },
      newEndDate
    );
    
    // Send receipt
    await sendEmail({
      to: subscription.user.email,
      subject: "Subscription renewed",
      template: "receipt",
      data: {
        amount: subscription.plan.price,
        nextBillingDate: newEndDate,
      },
    });
  } catch (error) {
    // Payment failed
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "past_due" },
    });
    
    await sendEmail({
      to: subscription.user.email,
      subject: "Payment failed",
      template: "payment-failed",
      data: { name: subscription.user.name },
    });
  }
}

// Follow-up email handler
export async function sendFollowUp(data: {
  userId: string;
  context: string;
  template: string;
}) {
  const user = await prisma.user.findUnique({
    where: { id: data.userId },
  });
  
  if (!user) return;
  
  // Check if user is still eligible for follow-up
  const recentActivity = await prisma.activity.findFirst({
    where: {
      userId: user.id,
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  
  // Skip if they've been active recently
  if (recentActivity) return;
  
  await sendEmail({
    to: user.email,
    subject: "We miss you!",
    template: data.template,
    data: { name: user.name, context: data.context },
  });
}
```

### Common Scheduling Patterns

```typescript
// lib/scheduling/patterns.ts
import { scheduleTask } from "./qstash";

// Schedule a reminder before an event
export async function scheduleEventReminder(
  userId: string,
  eventId: string,
  eventTime: Date,
  reminderMinutes: number = 60
) {
  const reminderTime = new Date(
    eventTime.getTime() - reminderMinutes * 60 * 1000
  );
  
  if (reminderTime <= new Date()) {
    // Event is too soon, skip reminder
    return null;
  }
  
  return scheduleTask(
    "reminder",
    {
      userId,
      subject: "Event Reminder",
      message: `Your event starts in ${reminderMinutes} minutes`,
      linkUrl: `/events/${eventId}`,
      linkText: "View Event",
    },
    reminderTime
  );
}

// Schedule trial expiration
export async function scheduleTrialExpiration(
  subscriptionId: string,
  trialEndDate: Date
) {
  return scheduleTask(
    "trial-expiration",
    { subscriptionId },
    trialEndDate
  );
}

// Schedule subscription renewal
export async function scheduleRenewal(
  subscriptionId: string,
  renewalDate: Date
) {
  return scheduleTask(
    "subscription-renewal",
    { subscriptionId },
    renewalDate
  );
}

// Schedule a series of follow-ups
export async function scheduleOnboardingSequence(userId: string) {
  const now = new Date();
  
  const tasks = [
    {
      template: "day-1-tips",
      delay: 24 * 60 * 60 * 1000, // 1 day
    },
    {
      template: "day-3-features",
      delay: 3 * 24 * 60 * 60 * 1000, // 3 days
    },
    {
      template: "day-7-checkin",
      delay: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  ];
  
  return Promise.all(
    tasks.map((task) =>
      scheduleTask(
        "follow-up",
        {
          userId,
          context: "onboarding",
          template: task.template,
        },
        new Date(now.getTime() + task.delay)
      )
    )
  );
}

// Schedule a review request after purchase
export async function scheduleReviewRequest(
  userId: string,
  orderId: string,
  deliveryDate: Date
) {
  // Wait 3 days after delivery
  const reviewDate = new Date(
    deliveryDate.getTime() + 3 * 24 * 60 * 60 * 1000
  );
  
  return scheduleTask(
    "reminder",
    {
      userId,
      subject: "How was your purchase?",
      message: "We'd love to hear your feedback on your recent order",
      linkUrl: `/orders/${orderId}/review`,
      linkText: "Leave a Review",
    },
    reviewDate
  );
}
```

### Using Inngest for Scheduled Tasks

```typescript
// lib/inngest/functions/scheduled.ts
import { inngest } from "../client";

// Send delayed notification
export const sendDelayedNotification = inngest.createFunction(
  { id: "send-delayed-notification" },
  { event: "notification/schedule" },
  async ({ event, step }) => {
    const { userId, message, sendAt } = event.data;
    
    // Wait until scheduled time
    const now = new Date();
    const target = new Date(sendAt);
    
    if (target > now) {
      await step.sleepUntil("wait-for-send-time", target);
    }
    
    // Send the notification
    await step.run("send-notification", async () => {
      await createNotification({
        userId,
        type: "info",
        title: "Scheduled Notification",
        message,
      });
    });
    
    return { sent: true };
  }
);

// Drip campaign
export const dripCampaign = inngest.createFunction(
  { id: "drip-campaign" },
  { event: "campaign/start" },
  async ({ event, step }) => {
    const { userId, campaignId } = event.data;
    
    const emails = [
      { day: 0, template: "welcome" },
      { day: 3, template: "tips" },
      { day: 7, template: "features" },
      { day: 14, template: "case-study" },
      { day: 21, template: "upgrade" },
    ];
    
    for (const email of emails) {
      if (email.day > 0) {
        await step.sleep(`wait-day-${email.day}`, `${email.day} days`);
      }
      
      // Check if user unsubscribed
      const user = await step.run(`check-user-${email.day}`, async () => {
        return prisma.user.findUnique({
          where: { id: userId },
          select: { email: true, unsubscribed: true },
        });
      });
      
      if (!user || user.unsubscribed) {
        return { stopped: true, reason: "unsubscribed" };
      }
      
      await step.run(`send-email-${email.day}`, async () => {
        await sendEmail({
          to: user.email,
          template: email.template,
          data: { campaignId },
        });
      });
    }
    
    return { completed: true };
  }
);
```

### Admin UI for Scheduled Tasks

```typescript
// app/admin/tasks/page.tsx
import { getScheduledTasks, cancelTask } from "@/lib/scheduling/qstash";
import { formatDistanceToNow, format } from "date-fns";

export default async function ScheduledTasksPage() {
  const [pending, completed, failed] = await Promise.all([
    getScheduledTasks({ status: "pending", limit: 50 }),
    getScheduledTasks({ status: "completed", limit: 20 }),
    getScheduledTasks({ status: "failed", limit: 20 }),
  ]);
  
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Scheduled Tasks</h1>
      
      <section>
        <h2 className="text-lg font-semibold mb-4">Pending Tasks</h2>
        <TaskTable tasks={pending} showCancel />
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-4">Recent Completed</h2>
        <TaskTable tasks={completed} />
      </section>
      
      <section>
        <h2 className="text-lg font-semibold mb-4">Failed Tasks</h2>
        <TaskTable tasks={failed} showRetry />
      </section>
    </div>
  );
}

function TaskTable({
  tasks,
  showCancel,
  showRetry,
}: {
  tasks: ScheduledTask[];
  showCancel?: boolean;
  showRetry?: boolean;
}) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="p-2 text-left">Type</th>
          <th className="p-2 text-left">Scheduled For</th>
          <th className="p-2 text-left">Status</th>
          {(showCancel || showRetry) && <th className="p-2 text-left">Actions</th>}
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.taskId} className="border-b">
            <td className="p-2">{task.type}</td>
            <td className="p-2">
              {format(task.scheduledFor, "PPp")}
              <span className="text-muted-foreground text-sm ml-2">
                ({formatDistanceToNow(task.scheduledFor, { addSuffix: true })})
              </span>
            </td>
            <td className="p-2">
              <span
                className={`px-2 py-1 rounded text-xs ${
                  task.status === "completed"
                    ? "bg-green-100 text-green-800"
                    : task.status === "failed"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {task.status}
              </span>
            </td>
            {showCancel && (
              <td className="p-2">
                <CancelButton taskId={task.taskId} />
              </td>
            )}
            {showRetry && (
              <td className="p-2">
                <RetryButton task={task} />
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

## Anti-patterns

### No Idempotency

```typescript
// BAD: Running twice charges twice
async function renewSubscription(data: { subscriptionId: string }) {
  await stripe.charges.create({
    amount: subscription.plan.price,
    customer: subscription.stripeCustomerId,
  });
}

// GOOD: Check if already processed
async function renewSubscription(data: { subscriptionId: string }) {
  const subscription = await prisma.subscription.findUnique({
    where: { id: data.subscriptionId },
  });
  
  // Check if already renewed for this period
  const existingCharge = await prisma.charge.findFirst({
    where: {
      subscriptionId: data.subscriptionId,
      periodEnd: subscription.currentPeriodEnd,
    },
  });
  
  if (existingCharge) {
    return; // Already processed
  }
  
  // Process renewal...
}
```

## Related Skills

- `background-jobs` - Background processing
- `cron-jobs` - Recurring jobs
- `queues` - Message queues

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with QStash and Inngest
