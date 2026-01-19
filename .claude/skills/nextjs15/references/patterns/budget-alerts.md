---
id: pt-budget-alerts
name: Budget Alerts
version: 1.0.0
layer: L5
category: finance
description: Budget threshold notifications with spending tracking and alert management
tags: [finance, budget, alerts, notifications, spending, next15]
composes:
  - ../molecules/progress-bar.md
dependencies: []
formula: "BudgetAlerts = SpendingTracker + ThresholdConfig + NotificationSystem + AlertHistory"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Budget Alerts

## When to Use

- Building expense tracking applications
- Creating budget management dashboards
- Implementing spending limit notifications
- Alerting users about unusual spending
- Financial planning applications

## Composition Diagram

```
Budget Alert Flow
=================

+------------------------------------------+
|  Budget Configuration                    |
|  - Category limits                       |
|  - Alert thresholds (50%, 75%, 90%)      |
|  - Notification preferences              |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Spending Tracker                        |
|  - Real-time expense monitoring          |
|  - Category aggregation                  |
|  - Period calculations                   |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Alert Engine                            |
|  - Threshold breach detection            |
|  - Alert deduplication                   |
|  - Notification dispatch                 |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Notification Channels                   |
|  - In-app notifications                  |
|  - Email alerts                          |
|  - Push notifications                    |
+------------------------------------------+
```

## Database Schema

```prisma
// prisma/schema.prisma
model Budget {
  id         String    @id @default(cuid())
  userId     String
  user       User      @relation(fields: [userId], references: [id])
  name       String
  category   String
  amount     Float
  period     String    @default("monthly") // weekly, monthly, yearly
  startDate  DateTime  @default(now())
  alerts     BudgetAlert[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt

  @@unique([userId, category, period])
}

model BudgetAlert {
  id         String   @id @default(cuid())
  budgetId   String
  budget     Budget   @relation(fields: [budgetId], references: [id])
  threshold  Float    // 0.5, 0.75, 0.9, 1.0
  enabled    Boolean  @default(true)
  lastSentAt DateTime?
  createdAt  DateTime @default(now())

  @@unique([budgetId, threshold])
}

model Expense {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  amount     Float
  category   String
  description String?
  date       DateTime @default(now())
  createdAt  DateTime @default(now())

  @@index([userId, category, date])
}

model AlertHistory {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  budgetId  String
  type      String   // threshold_reached, budget_exceeded
  threshold Float
  spent     Float
  limit     Float
  readAt    DateTime?
  createdAt DateTime @default(now())

  @@index([userId, createdAt])
}
```

## Budget Alert Service

```typescript
// lib/budget/alert-service.ts
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { sendPushNotification } from '@/lib/push';

const ALERT_COOLDOWN_HOURS = 24;

export async function checkBudgetAlerts(userId: string) {
  const budgets = await prisma.budget.findMany({
    where: { userId },
    include: { alerts: { where: { enabled: true } } },
  });

  for (const budget of budgets) {
    const spent = await getSpentAmount(userId, budget.category, budget.period);
    const percentUsed = spent / budget.amount;

    for (const alert of budget.alerts) {
      if (percentUsed >= alert.threshold) {
        await triggerAlert(userId, budget, alert, spent);
      }
    }
  }
}

async function getSpentAmount(
  userId: string,
  category: string,
  period: string
): Promise<number> {
  const startDate = getPeriodStartDate(period);

  const result = await prisma.expense.aggregate({
    where: {
      userId,
      category,
      date: { gte: startDate },
    },
    _sum: { amount: true },
  });

  return result._sum.amount || 0;
}

function getPeriodStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case 'weekly':
      return new Date(now.setDate(now.getDate() - now.getDay()));
    case 'monthly':
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case 'yearly':
      return new Date(now.getFullYear(), 0, 1);
    default:
      return new Date(now.getFullYear(), now.getMonth(), 1);
  }
}

async function triggerAlert(
  userId: string,
  budget: any,
  alert: any,
  spent: number
) {
  // Check cooldown
  if (alert.lastSentAt) {
    const hoursSinceLast =
      (Date.now() - new Date(alert.lastSentAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLast < ALERT_COOLDOWN_HOURS) return;
  }

  // Create alert history
  await prisma.alertHistory.create({
    data: {
      userId,
      budgetId: budget.id,
      type: spent >= budget.amount ? 'budget_exceeded' : 'threshold_reached',
      threshold: alert.threshold,
      spent,
      limit: budget.amount,
    },
  });

  // Update last sent
  await prisma.budgetAlert.update({
    where: { id: alert.id },
    data: { lastSentAt: new Date() },
  });

  // Get user preferences
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, pushSubscription: true },
  });

  const percentUsed = Math.round((spent / budget.amount) * 100);
  const message = spent >= budget.amount
    ? `You've exceeded your ${budget.category} budget of $${budget.amount}`
    : `You've used ${percentUsed}% of your ${budget.category} budget`;

  // Send notifications
  if (user?.email) {
    await sendEmail({
      to: user.email,
      subject: `Budget Alert: ${budget.name}`,
      template: 'budget-alert',
      data: { budget, spent, percentUsed, message },
    });
  }

  if (user?.pushSubscription) {
    await sendPushNotification(user.pushSubscription, {
      title: 'Budget Alert',
      body: message,
      data: { budgetId: budget.id },
    });
  }
}
```

## Budget Dashboard Component

```typescript
// components/budget/budget-dashboard.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BudgetDashboard() {
  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets'],
    queryFn: () => fetch('/api/budgets').then((r) => r.json()),
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {budgets?.data?.map((budget: any) => (
        <BudgetCard key={budget.id} budget={budget} />
      ))}
    </div>
  );
}

function BudgetCard({ budget }: { budget: any }) {
  const percentUsed = (budget.spent / budget.amount) * 100;
  const isOverBudget = percentUsed > 100;
  const isWarning = percentUsed >= 75 && percentUsed < 100;

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{budget.name}</h3>
          <Badge variant="secondary">{budget.category}</Badge>
        </div>
        {isOverBudget && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Over Budget
          </Badge>
        )}
      </div>

      <Progress
        value={Math.min(percentUsed, 100)}
        className={cn(
          'h-3 mb-2',
          isOverBudget && '[&>div]:bg-destructive',
          isWarning && '[&>div]:bg-yellow-500'
        )}
      />

      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">
          ${budget.spent.toFixed(2)} of ${budget.amount.toFixed(2)}
        </span>
        <span
          className={cn(
            'font-medium',
            isOverBudget && 'text-destructive',
            isWarning && 'text-yellow-600'
          )}
        >
          {percentUsed.toFixed(0)}%
        </span>
      </div>

      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
        {budget.trend > 0 ? (
          <TrendingUp className="h-4 w-4 text-destructive" />
        ) : (
          <TrendingDown className="h-4 w-4 text-green-500" />
        )}
        <span>
          {budget.trend > 0 ? '+' : ''}{budget.trend}% vs last {budget.period}
        </span>
      </div>
    </div>
  );
}
```

## Alert Configuration Component

```typescript
// components/budget/alert-settings.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface AlertSettingsProps {
  budgetId: string;
  alerts: { threshold: number; enabled: boolean }[];
}

export function AlertSettings({ budgetId, alerts: initialAlerts }: AlertSettingsProps) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (data: typeof alerts) =>
      fetch(`/api/budgets/${budgetId}/alerts`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alerts: data }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success('Alert settings saved');
    },
  });

  return (
    <div className="space-y-4">
      <h4 className="font-medium">Alert Thresholds</h4>

      {alerts.map((alert, index) => (
        <div key={alert.threshold} className="flex items-center gap-4">
          <Switch
            checked={alert.enabled}
            onCheckedChange={(enabled) => {
              const newAlerts = [...alerts];
              newAlerts[index] = { ...alert, enabled };
              setAlerts(newAlerts);
            }}
          />
          <span className="w-16">{alert.threshold * 100}%</span>
          <span className="text-sm text-muted-foreground">
            Alert when spending reaches {alert.threshold * 100}% of budget
          </span>
        </div>
      ))}

      <Button onClick={() => saveMutation.mutate(alerts)} disabled={saveMutation.isPending}>
        Save Settings
      </Button>
    </div>
  );
}
```

## Budget API Endpoints

```typescript
// app/api/budgets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const budgets = await prisma.budget.findMany({
    where: { userId: session.user.id },
    include: { alerts: true },
  });

  // Calculate spent amounts
  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const startDate = getPeriodStartDate(budget.period);
      const result = await prisma.expense.aggregate({
        where: {
          userId: session.user.id,
          category: budget.category,
          date: { gte: startDate },
        },
        _sum: { amount: true },
      });

      return {
        ...budget,
        spent: result._sum.amount || 0,
      };
    })
  );

  return NextResponse.json({ data: budgetsWithSpent });
}
```

## Anti-patterns

### Don't Alert Too Frequently

```typescript
// BAD - No cooldown
async function checkAlerts() {
  if (spent >= threshold) {
    await sendNotification(); // Spam!
  }
}

// GOOD - Cooldown period
if (spent >= threshold && hoursSinceLast >= 24) {
  await sendNotification();
  await updateLastSent();
}
```

## Related Skills

- [notifications](./notifications.md)
- [charts](./charts.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multi-channel notifications
- Alert cooldown
- Budget dashboard
