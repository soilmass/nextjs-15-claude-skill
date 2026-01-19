---
id: pt-webhook-delivery
name: Outgoing Webhook Delivery
version: 1.0.0
layer: L5
category: integration
description: Outgoing webhook delivery with retry logic for Next.js applications
tags: [webhooks, delivery, retry, queue, next15]
composes:
  - ../molecules/card.md
  - ../molecules/badge.md
  - ../organisms/data-table.md
  - ../atoms/input-button.md
dependencies: []
formula: Event Trigger + Queue + Retry Logic = Reliable Webhook Delivery
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Outgoing Webhook Delivery

## When to Use

- **Event notifications**: Notifying external systems of events
- **Integrations**: Allowing users to configure webhook endpoints
- **Automation**: Triggering external workflows
- **Real-time updates**: Pushing data to third-party services

**Avoid when**: Polling is acceptable, or using existing integration platforms (Zapier).

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Webhook Delivery Architecture                                │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Webhook Service                                       │  │
│  │  ├─ Event Trigger: Queue webhook on event            │  │
│  │  ├─ Delivery: HTTP POST with signing                 │  │
│  │  └─ Retry: Exponential backoff on failure            │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Endpoint   │     │ Delivery     │     │ Logs &      │   │
│  │ Config     │     │ Queue        │     │ Monitoring  │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Types

```typescript
// lib/webhooks/types.ts
export type WebhookEventType =
  | 'user.created'
  | 'user.updated'
  | 'order.created'
  | 'order.completed'
  | 'payment.succeeded'
  | 'payment.failed'
  | 'subscription.created'
  | 'subscription.canceled';

export interface WebhookEndpoint {
  id: string;
  userId: string;
  url: string;
  secret: string;
  events: WebhookEventType[];
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventType: WebhookEventType;
  payload: Record<string, any>;
  status: 'pending' | 'success' | 'failed';
  attempts: number;
  maxAttempts: number;
  lastAttemptAt?: Date;
  nextRetryAt?: Date;
  response?: {
    statusCode: number;
    body?: string;
    duration: number;
  };
  error?: string;
  createdAt: Date;
}

export interface WebhookEvent {
  id: string;
  type: WebhookEventType;
  data: Record<string, any>;
  createdAt: Date;
}
```

## Webhook Service

```typescript
// lib/webhooks/service.ts
import { createHmac, randomBytes } from 'crypto';
import { db } from '@/lib/db';
import { WebhookEndpoint, WebhookDelivery, WebhookEventType, WebhookEvent } from './types';
import { nanoid } from 'nanoid';

const RETRY_DELAYS = [60, 300, 900, 3600, 86400]; // 1m, 5m, 15m, 1h, 24h

export class WebhookService {
  generateSecret(): string {
    return `whsec_${randomBytes(32).toString('hex')}`;
  }

  signPayload(payload: string, secret: string, timestamp: number): string {
    const signedPayload = `${timestamp}.${payload}`;
    return createHmac('sha256', secret).update(signedPayload).digest('hex');
  }

  async createEndpoint(
    userId: string,
    url: string,
    events: WebhookEventType[]
  ): Promise<WebhookEndpoint> {
    const secret = this.generateSecret();

    return db.webhookEndpoint.create({
      data: {
        id: nanoid(),
        userId,
        url,
        secret,
        events,
        enabled: true,
      },
    });
  }

  async triggerEvent(
    eventType: WebhookEventType,
    data: Record<string, any>,
    userId?: string
  ): Promise<void> {
    // Create event record
    const event: WebhookEvent = {
      id: nanoid(),
      type: eventType,
      data,
      createdAt: new Date(),
    };

    await db.webhookEvent.create({ data: event });

    // Find matching endpoints
    const endpoints = await db.webhookEndpoint.findMany({
      where: {
        enabled: true,
        events: { has: eventType },
        ...(userId && { userId }),
      },
    });

    // Queue deliveries
    for (const endpoint of endpoints) {
      await this.queueDelivery(endpoint.id, event);
    }
  }

  async queueDelivery(endpointId: string, event: WebhookEvent): Promise<WebhookDelivery> {
    return db.webhookDelivery.create({
      data: {
        id: nanoid(),
        endpointId,
        eventType: event.type,
        payload: {
          id: event.id,
          type: event.type,
          data: event.data,
          created_at: event.createdAt.toISOString(),
        },
        status: 'pending',
        attempts: 0,
        maxAttempts: 5,
      },
    });
  }

  async deliver(deliveryId: string): Promise<boolean> {
    const delivery = await db.webhookDelivery.findUnique({
      where: { id: deliveryId },
      include: { endpoint: true },
    });

    if (!delivery || !delivery.endpoint) {
      return false;
    }

    const { endpoint } = delivery;
    const payload = JSON.stringify(delivery.payload);
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.signPayload(payload, endpoint.secret, timestamp);

    const startTime = Date.now();
    let success = false;
    let responseData: WebhookDelivery['response'];
    let error: string | undefined;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': `t=${timestamp},v1=${signature}`,
          'X-Webhook-Id': delivery.id,
          'X-Webhook-Timestamp': timestamp.toString(),
          'User-Agent': 'WebhookDelivery/1.0',
        },
        body: payload,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      responseData = {
        statusCode: response.status,
        body: await response.text().catch(() => undefined),
        duration: Date.now() - startTime,
      };

      success = response.ok;
      if (!success) {
        error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error';
      responseData = {
        statusCode: 0,
        duration: Date.now() - startTime,
      };
    }

    const attempts = delivery.attempts + 1;
    const status = success
      ? 'success'
      : attempts >= delivery.maxAttempts
      ? 'failed'
      : 'pending';

    const nextRetryAt =
      status === 'pending'
        ? new Date(Date.now() + RETRY_DELAYS[Math.min(attempts - 1, RETRY_DELAYS.length - 1)] * 1000)
        : undefined;

    await db.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status,
        attempts,
        lastAttemptAt: new Date(),
        nextRetryAt,
        response: responseData,
        error,
      },
    });

    return success;
  }

  async processQueue(): Promise<void> {
    const pendingDeliveries = await db.webhookDelivery.findMany({
      where: {
        status: 'pending',
        OR: [
          { nextRetryAt: null },
          { nextRetryAt: { lte: new Date() } },
        ],
      },
      take: 100,
      orderBy: { createdAt: 'asc' },
    });

    for (const delivery of pendingDeliveries) {
      await this.deliver(delivery.id);
    }
  }

  async getDeliveryLogs(
    endpointId: string,
    options: { page?: number; limit?: number } = {}
  ): Promise<{ deliveries: WebhookDelivery[]; total: number }> {
    const { page = 1, limit = 20 } = options;

    const [deliveries, total] = await Promise.all([
      db.webhookDelivery.findMany({
        where: { endpointId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.webhookDelivery.count({ where: { endpointId } }),
    ]);

    return { deliveries, total };
  }
}

export const webhookService = new WebhookService();
```

## API Routes

```typescript
// app/api/webhooks/endpoints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { webhookService } from '@/lib/webhooks/service';
import { z } from 'zod';

const createSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  }

  const endpoint = await webhookService.createEndpoint(
    session.user.id,
    parsed.data.url,
    parsed.data.events as any[]
  );

  return NextResponse.json(endpoint, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const endpoints = await db.webhookEndpoint.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(endpoints);
}

// app/api/webhooks/endpoints/[id]/deliveries/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { webhookService } from '@/lib/webhooks/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const result = await webhookService.getDeliveryLogs(params.id, { page });

  return NextResponse.json(result);
}
```

## Webhook Endpoints Management

```typescript
// components/webhooks/webhook-endpoints.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { WebhookEndpoint, WebhookEventType } from '@/lib/webhooks/types';

const EVENT_TYPES: WebhookEventType[] = [
  'user.created',
  'user.updated',
  'order.created',
  'order.completed',
  'payment.succeeded',
  'payment.failed',
];

export function WebhookEndpoints() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [showSecret, setShowSecret] = useState<Record<string, boolean>>({});
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newEndpoint, setNewEndpoint] = useState({ url: '', events: [] as string[] });

  useEffect(() => {
    fetch('/api/webhooks/endpoints')
      .then((res) => res.json())
      .then(setEndpoints);
  }, []);

  const createEndpoint = async () => {
    try {
      const res = await fetch('/api/webhooks/endpoints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEndpoint),
      });

      if (!res.ok) throw new Error('Failed to create endpoint');

      const endpoint = await res.json();
      setEndpoints([endpoint, ...endpoints]);
      setCreateDialogOpen(false);
      setNewEndpoint({ url: '', events: [] });
      toast.success('Webhook endpoint created');
    } catch {
      toast.error('Failed to create endpoint');
    }
  };

  const toggleEndpoint = async (id: string, enabled: boolean) => {
    try {
      await fetch(`/api/webhooks/endpoints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled }),
      });

      setEndpoints(endpoints.map((e) => (e.id === id ? { ...e, enabled } : e)));
    } catch {
      toast.error('Failed to update endpoint');
    }
  };

  const deleteEndpoint = async (id: string) => {
    try {
      await fetch(`/api/webhooks/endpoints/${id}`, { method: 'DELETE' });
      setEndpoints(endpoints.filter((e) => e.id !== id));
      toast.success('Endpoint deleted');
    } catch {
      toast.error('Failed to delete endpoint');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Webhook Endpoints</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Endpoint
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Webhook Endpoint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Endpoint URL</Label>
                <Input
                  type="url"
                  placeholder="https://your-server.com/webhook"
                  value={newEndpoint.url}
                  onChange={(e) => setNewEndpoint({ ...newEndpoint, url: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Events</Label>
                <div className="grid grid-cols-2 gap-2">
                  {EVENT_TYPES.map((event) => (
                    <label key={event} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={newEndpoint.events.includes(event)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewEndpoint({
                              ...newEndpoint,
                              events: [...newEndpoint.events, event],
                            });
                          } else {
                            setNewEndpoint({
                              ...newEndpoint,
                              events: newEndpoint.events.filter((e) => e !== event),
                            });
                          }
                        }}
                      />
                      {event}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={createEndpoint} className="w-full">
                Create Endpoint
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {endpoints.map((endpoint) => (
          <Card key={endpoint.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <code className="text-sm bg-muted px-2 py-1 rounded">{endpoint.url}</code>
                    <Switch
                      checked={endpoint.enabled}
                      onCheckedChange={(checked) => toggleEndpoint(endpoint.id, checked)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Secret:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {showSecret[endpoint.id] ? endpoint.secret : '••••••••••••••••'}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() =>
                        setShowSecret({ ...showSecret, [endpoint.id]: !showSecret[endpoint.id] })
                      }
                    >
                      {showSecret[endpoint.id] ? (
                        <EyeOff className="h-3 w-3" />
                      ) : (
                        <Eye className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {endpoint.events.map((event) => (
                      <Badge key={event} variant="secondary" className="text-xs">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteEndpoint(endpoint.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Related Patterns

- [websocket](./websocket.md)
- [queue-processing](./queue-processing.md)
- [api-keys](./api-keys.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Webhook signing
- Retry with backoff
- Delivery logs
- Endpoint management UI
