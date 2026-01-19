---
id: pt-ticket-management
name: Support Ticket System
version: 1.0.0
layer: L5
category: support
description: Support ticket system for customer service in Next.js applications
tags: [tickets, support, helpdesk, customer-service, next15]
composes:
  - ../molecules/card.md
  - ../molecules/badge.md
  - ../organisms/data-table.md
  - ../organisms/dialog.md
dependencies: []
formula: Ticket Model + Status Workflow + Assignment = Customer Support System
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Support Ticket System

## When to Use

- **Customer support**: Managing customer inquiries and issues
- **Internal helpdesk**: IT support ticket tracking
- **Issue tracking**: Bug reports, feature requests
- **Service requests**: Processing service-related requests

**Avoid when**: Simple contact forms suffice, or using external helpdesk software.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Ticket Management Architecture                               │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Ticket Service                                        │  │
│  │  ├─ CRUD: Create, read, update, close tickets        │  │
│  │  ├─ Workflow: Status transitions, SLA tracking       │  │
│  │  └─ Assignment: Agent routing, workload balancing    │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ Ticket     │     │ Agent        │     │ Customer    │   │
│  │ Dashboard  │     │ Queue        │     │ Portal      │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Ticket Types

```typescript
// lib/tickets/types.ts
export type TicketStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'billing' | 'technical' | 'general' | 'feature_request' | 'bug';

export interface Ticket {
  id: string;
  number: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  customerId: string;
  customer: { id: string; name: string; email: string };
  assigneeId?: string;
  assignee?: { id: string; name: string };
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  dueAt?: Date;
  tags: string[];
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  authorId: string;
  author: { id: string; name: string; role: 'customer' | 'agent' };
  content: string;
  isInternal: boolean;
  attachments: { name: string; url: string }[];
  createdAt: Date;
}

export interface CreateTicketInput {
  subject: string;
  description: string;
  priority?: TicketPriority;
  category: TicketCategory;
  customerId: string;
}
```

## Ticket Service

```typescript
// lib/tickets/service.ts
import { db } from '@/lib/db';
import { Ticket, TicketStatus, CreateTicketInput, TicketMessage } from './types';
import { nanoid } from 'nanoid';

export class TicketService {
  async createTicket(input: CreateTicketInput): Promise<Ticket> {
    const ticketNumber = `TKT-${nanoid(8).toUpperCase()}`;

    return db.ticket.create({
      data: {
        number: ticketNumber,
        subject: input.subject,
        description: input.description,
        status: 'open',
        priority: input.priority || 'medium',
        category: input.category,
        customerId: input.customerId,
        dueAt: this.calculateDueDate(input.priority || 'medium'),
      },
      include: {
        customer: true,
        assignee: true,
        messages: { include: { author: true } },
      },
    });
  }

  async getTicket(id: string): Promise<Ticket | null> {
    return db.ticket.findUnique({
      where: { id },
      include: {
        customer: true,
        assignee: true,
        messages: {
          include: { author: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async listTickets(filters: {
    status?: TicketStatus[];
    assigneeId?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, assigneeId, customerId, page = 1, limit = 20 } = filters;

    const where = {
      ...(status && { status: { in: status } }),
      ...(assigneeId && { assigneeId }),
      ...(customerId && { customerId }),
    };

    const [tickets, total] = await Promise.all([
      db.ticket.findMany({
        where,
        include: { customer: true, assignee: true },
        orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.ticket.count({ where }),
    ]);

    return { tickets, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: TicketStatus, agentId: string): Promise<Ticket> {
    const update: Record<string, unknown> = { status, updatedAt: new Date() };

    if (status === 'resolved') {
      update.resolvedAt = new Date();
    }

    if (status === 'in_progress' && !await this.getTicket(id).then(t => t?.assigneeId)) {
      update.assigneeId = agentId;
    }

    return db.ticket.update({
      where: { id },
      data: update,
      include: { customer: true, assignee: true, messages: true },
    });
  }

  async assignTicket(id: string, assigneeId: string): Promise<Ticket> {
    return db.ticket.update({
      where: { id },
      data: { assigneeId, status: 'in_progress' },
      include: { customer: true, assignee: true },
    });
  }

  async addMessage(
    ticketId: string,
    authorId: string,
    content: string,
    isInternal = false
  ): Promise<TicketMessage> {
    return db.ticketMessage.create({
      data: { ticketId, authorId, content, isInternal },
      include: { author: true },
    });
  }

  private calculateDueDate(priority: string): Date {
    const hours = { urgent: 4, high: 8, medium: 24, low: 72 }[priority] || 24;
    return new Date(Date.now() + hours * 60 * 60 * 1000);
  }
}

export const ticketService = new TicketService();
```

## API Routes

```typescript
// app/api/tickets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { ticketService } from '@/lib/tickets/service';
import { z } from 'zod';

const createSchema = z.object({
  subject: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.enum(['billing', 'technical', 'general', 'feature_request', 'bug']),
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

  const ticket = await ticketService.createTicket({
    ...parsed.data,
    customerId: session.user.id,
  });

  return NextResponse.json(ticket, { status: 201 });
}

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const status = searchParams.get('status')?.split(',') as any;
  const page = parseInt(searchParams.get('page') || '1');

  const result = await ticketService.listTickets({
    status,
    customerId: session.user.role === 'customer' ? session.user.id : undefined,
    assigneeId: searchParams.get('assignee') || undefined,
    page,
  });

  return NextResponse.json(result);
}
```

## Ticket List Component

```typescript
// components/tickets/ticket-list.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Ticket, TicketStatus, TicketPriority } from '@/lib/tickets/types';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

const statusColors: Record<TicketStatus, string> = {
  open: 'bg-blue-500',
  in_progress: 'bg-yellow-500',
  waiting: 'bg-purple-500',
  resolved: 'bg-green-500',
  closed: 'bg-gray-500',
};

const priorityColors: Record<TicketPriority, string> = {
  low: 'bg-gray-400',
  medium: 'bg-blue-400',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

interface TicketListProps {
  tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No tickets found
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {tickets.map((ticket) => (
        <Link key={ticket.id} href={`/tickets/${ticket.id}`}>
          <Card className="hover:bg-muted/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{ticket.number}</span>
                    <Badge className={priorityColors[ticket.priority]}>
                      {ticket.priority}
                    </Badge>
                    <Badge className={statusColors[ticket.status]}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <h3 className="font-medium">{ticket.subject}</h3>
                  <p className="text-sm text-muted-foreground">
                    {ticket.customer.name} - {formatDistanceToNow(new Date(ticket.createdAt))} ago
                  </p>
                </div>
                {ticket.assignee && (
                  <span className="text-sm text-muted-foreground">
                    Assigned to {ticket.assignee.name}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
```

## Create Ticket Form

```typescript
// components/tickets/create-ticket-form.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function CreateTicketForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      subject: formData.get('subject'),
      description: formData.get('description'),
      category: formData.get('category'),
      priority: formData.get('priority'),
    };

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create ticket');

      const ticket = await res.json();
      toast.success('Ticket created successfully');
      router.push(`/tickets/${ticket.id}`);
    } catch {
      toast.error('Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required maxLength={200} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select name="category" required>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="billing">Billing</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
              <SelectItem value="bug">Bug Report</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <Select name="priority" defaultValue="medium">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" required rows={5} />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Ticket'}
      </Button>
    </form>
  );
}
```

## Related Patterns

- [sla-tracking](./sla-tracking.md)
- [email-verification](./email-verification.md)
- [rbac](./rbac.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Ticket CRUD operations
- Status workflow
- Agent assignment
- Customer portal components
