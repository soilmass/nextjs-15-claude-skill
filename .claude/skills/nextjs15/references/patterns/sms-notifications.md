---
id: pt-sms-notifications
name: SMS Notification Sending
version: 1.0.0
layer: L5
category: notifications
description: SMS notification sending with Twilio for Next.js applications
tags: [sms, notifications, twilio, messaging, next15]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-text.md
  - ../molecules/toast.md
dependencies: []
formula: Twilio SDK + Message Queue + Templates = Reliable SMS Delivery
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# SMS Notification Sending

## When to Use

- **Authentication**: Two-factor authentication codes
- **Alerts**: Critical system alerts requiring immediate attention
- **Reminders**: Appointment reminders, shipping updates
- **Marketing**: Opt-in promotional messages (with consent)

**Avoid when**: Email would suffice, no user consent, or non-critical notifications.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ SMS Notification Architecture                                │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ SMS Service                                           │  │
│  │  ├─ Twilio Client: API integration                   │  │
│  │  ├─ Message Queue: Rate limiting, retry logic        │  │
│  │  └─ Templates: Reusable message templates            │  │
│  └───────────────────────────────────────────────────────┘  │
│         │                    │                    │         │
│         ▼                    ▼                    ▼         │
│  ┌────────────┐     ┌──────────────┐     ┌─────────────┐   │
│  │ OTP Codes  │     │ Alerts       │     │ Marketing   │   │
│  │ Verify API │     │ Notify API   │     │ Messaging   │   │
│  └────────────┘     └──────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## SMS Service Implementation

```typescript
// lib/sms/client.ts
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export interface SMSMessage {
  to: string;
  body: string;
  from?: string;
}

export interface SMSResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSMS(message: SMSMessage): Promise<SMSResult> {
  try {
    const result = await client.messages.create({
      to: message.to,
      body: message.body,
      from: message.from || process.env.TWILIO_PHONE_NUMBER!,
    });

    return {
      success: true,
      messageId: result.sid,
    };
  } catch (error) {
    console.error('SMS send error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendVerificationCode(phone: string): Promise<SMSResult> {
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({
        to: phone,
        channel: 'sms',
      });

    return {
      success: verification.status === 'pending',
      messageId: verification.sid,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function verifyCode(phone: string, code: string): Promise<boolean> {
  try {
    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({
        to: phone,
        code,
      });

    return verification.status === 'approved';
  } catch {
    return false;
  }
}
```

## SMS Templates

```typescript
// lib/sms/templates.ts
export type SMSTemplateType =
  | 'verification'
  | 'password_reset'
  | 'order_confirmation'
  | 'shipping_update'
  | 'appointment_reminder';

interface TemplateData {
  [key: string]: string | number;
}

const templates: Record<SMSTemplateType, (data: TemplateData) => string> = {
  verification: (data) =>
    `Your verification code is ${data.code}. It expires in ${data.expiry} minutes.`,

  password_reset: (data) =>
    `Your password reset code is ${data.code}. If you didn't request this, ignore this message.`,

  order_confirmation: (data) =>
    `Order #${data.orderId} confirmed! Total: $${data.total}. Track at: ${data.trackingUrl}`,

  shipping_update: (data) =>
    `Your order #${data.orderId} has shipped! Expected delivery: ${data.deliveryDate}. Track: ${data.trackingUrl}`,

  appointment_reminder: (data) =>
    `Reminder: Your appointment is on ${data.date} at ${data.time}. Reply CONFIRM to confirm or call ${data.phone} to reschedule.`,
};

export function renderTemplate(type: SMSTemplateType, data: TemplateData): string {
  const template = templates[type];
  if (!template) throw new Error(`Unknown template: ${type}`);
  return template(data);
}
```

## SMS Queue Service

```typescript
// lib/sms/queue.ts
import { db } from '@/lib/db';
import { sendSMS, SMSMessage, SMSResult } from './client';

interface QueuedSMS extends SMSMessage {
  id: string;
  priority: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
  attempts: number;
  maxAttempts: number;
}

export async function queueSMS(
  message: SMSMessage,
  options: { priority?: 'high' | 'normal' | 'low'; scheduledFor?: Date } = {}
): Promise<string> {
  const queued = await db.smsQueue.create({
    data: {
      ...message,
      priority: options.priority || 'normal',
      scheduledFor: options.scheduledFor,
      attempts: 0,
      maxAttempts: 3,
      status: 'pending',
    },
  });

  return queued.id;
}

export async function processQueue(): Promise<void> {
  const messages = await db.smsQueue.findMany({
    where: {
      status: 'pending',
      OR: [
        { scheduledFor: null },
        { scheduledFor: { lte: new Date() } },
      ],
    },
    orderBy: [
      { priority: 'desc' },
      { createdAt: 'asc' },
    ],
    take: 10,
  });

  for (const message of messages) {
    const result = await sendSMS({
      to: message.to,
      body: message.body,
      from: message.from || undefined,
    });

    await db.smsQueue.update({
      where: { id: message.id },
      data: {
        attempts: message.attempts + 1,
        status: result.success
          ? 'sent'
          : message.attempts + 1 >= message.maxAttempts
          ? 'failed'
          : 'pending',
        messageId: result.messageId,
        error: result.error,
        sentAt: result.success ? new Date() : undefined,
      },
    });
  }
}
```

## API Routes

```typescript
// app/api/sms/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendSMS } from '@/lib/sms/client';
import { renderTemplate, SMSTemplateType } from '@/lib/sms/templates';
import { z } from 'zod';

const sendSchema = z.object({
  to: z.string().regex(/^\+[1-9]\d{1,14}$/),
  template: z.string().optional(),
  body: z.string().optional(),
  data: z.record(z.union([z.string(), z.number()])).optional(),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = sendSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors }, { status: 400 });
  }

  const { to, template, body: messageBody, data } = parsed.data;

  const finalBody = template
    ? renderTemplate(template as SMSTemplateType, data || {})
    : messageBody;

  if (!finalBody) {
    return NextResponse.json({ error: 'Message body required' }, { status: 400 });
  }

  const result = await sendSMS({ to, body: finalBody });

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ messageId: result.messageId });
}

// app/api/sms/verify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sendVerificationCode, verifyCode } from '@/lib/sms/client';

export async function POST(request: NextRequest) {
  const { phone } = await request.json();
  const result = await sendVerificationCode(phone);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PUT(request: NextRequest) {
  const { phone, code } = await request.json();
  const valid = await verifyCode(phone, code);

  return NextResponse.json({ valid });
}
```

## Phone Verification Component

```typescript
// components/phone-verification.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PhoneVerificationProps {
  onVerified: (phone: string) => void;
}

export function PhoneVerification({ onVerified }: PhoneVerificationProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    const res = await fetch('/api/sms/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    setLoading(false);
    if (res.ok) {
      setCodeSent(true);
      toast.success('Verification code sent');
    } else {
      toast.error('Failed to send code');
    }
  };

  const verify = async () => {
    setLoading(true);
    const res = await fetch('/api/sms/verify', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code }),
    });

    setLoading(false);
    const { valid } = await res.json();

    if (valid) {
      toast.success('Phone verified');
      onVerified(phone);
    } else {
      toast.error('Invalid code');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          type="tel"
          placeholder="+1234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={codeSent}
        />
        {!codeSent && (
          <Button onClick={sendCode} disabled={loading || !phone}>
            Send Code
          </Button>
        )}
      </div>
      {codeSent && (
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Enter code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
          />
          <Button onClick={verify} disabled={loading || code.length < 4}>
            Verify
          </Button>
        </div>
      )}
    </div>
  );
}
```

## Related Patterns

- [two-factor](./two-factor.md)
- [email-verification](./email-verification.md)
- [alerting](./alerting.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Twilio integration
- SMS templates
- Queue processing
- Phone verification
