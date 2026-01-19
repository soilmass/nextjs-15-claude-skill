---
id: pt-contact-form-handling
name: Contact Form Handling
version: 1.0.0
layer: L5
category: forms
description: Contact form processing with validation, spam protection, and email delivery
tags: [forms, contact, email, spam-protection, next15]
composes:
  - ../molecules/form-field.md
dependencies: []
formula: "ContactForm = Validation + SpamProtection + EmailDelivery + SuccessFeedback"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Contact Form Handling

## When to Use

- Website contact pages
- Support ticket creation
- Lead generation forms
- Feedback collection
- Business inquiry forms

## Composition Diagram

```
Contact Form Flow
=================

+------------------------------------------+
|  Form Submission                         |
|  - Name, email, message                  |
|  - Optional fields                       |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Spam Protection                         |
|  - Honeypot field                        |
|  - Rate limiting                         |
|  - reCAPTCHA (optional)                  |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Server Validation                       |
|  - Sanitize inputs                       |
|  - Validate email format                 |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Processing                              |
|  - Save to database                      |
|  - Send notification email               |
|  - Auto-reply to sender                  |
+------------------------------------------+
```

## Contact Form Component

```typescript
// components/forms/contact-form.tsx
'use client';

import { useActionState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { submitContactForm, type FormState } from '@/app/actions/contact';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormLabel, FormMessage } from '@/components/ui/form';
import { CheckCircle, AlertCircle } from 'lucide-react';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  honeypot: z.string().max(0), // Should be empty
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [state, action, isPending] = useActionState<FormState | null, FormData>(
    submitContactForm,
    null
  );

  const {
    register,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  if (state?.success) {
    return (
      <div className="p-6 text-center bg-green-50 rounded-lg">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Message Sent!</h3>
        <p className="text-muted-foreground">
          Thank you for contacting us. We'll get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      {/* Honeypot - hidden from users, bots will fill it */}
      <div className="hidden" aria-hidden="true">
        <Input
          {...register('honeypot')}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField>
          <FormLabel htmlFor="name">Name *</FormLabel>
          <Input
            id="name"
            {...register('name')}
            placeholder="John Doe"
            aria-invalid={!!errors.name || !!state?.errors?.name}
          />
          <FormMessage>
            {errors.name?.message || state?.errors?.name?.[0]}
          </FormMessage>
        </FormField>

        <FormField>
          <FormLabel htmlFor="email">Email *</FormLabel>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john@example.com"
            aria-invalid={!!errors.email || !!state?.errors?.email}
          />
          <FormMessage>
            {errors.email?.message || state?.errors?.email?.[0]}
          </FormMessage>
        </FormField>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormField>
          <FormLabel htmlFor="phone">Phone (optional)</FormLabel>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+1 (555) 123-4567"
          />
        </FormField>

        <FormField>
          <FormLabel htmlFor="subject">Subject *</FormLabel>
          <Input
            id="subject"
            {...register('subject')}
            placeholder="How can we help?"
            aria-invalid={!!errors.subject || !!state?.errors?.subject}
          />
          <FormMessage>
            {errors.subject?.message || state?.errors?.subject?.[0]}
          </FormMessage>
        </FormField>
      </div>

      <FormField>
        <FormLabel htmlFor="message">Message *</FormLabel>
        <Textarea
          id="message"
          {...register('message')}
          placeholder="Tell us more about your inquiry..."
          rows={5}
          aria-invalid={!!errors.message || !!state?.errors?.message}
        />
        <FormMessage>
          {errors.message?.message || state?.errors?.message?.[0]}
        </FormMessage>
      </FormField>

      {state?.error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          {state.error}
        </div>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Sending...' : 'Send Message'}
      </Button>
    </form>
  );
}
```

## Server Action

```typescript
// app/actions/contact.ts
'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().min(1),
  message: z.string().min(10).max(5000),
  honeypot: z.string().max(0),
});

export type FormState = {
  success: boolean;
  error?: string;
  errors?: Record<string, string[]>;
};

export async function submitContactForm(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || 'unknown';

  // Rate limiting
  const rateLimitResult = await rateLimit(ip, {
    maxRequests: 5,
    windowMs: 60 * 60 * 1000, // 1 hour
  });

  if (!rateLimitResult.success) {
    return {
      success: false,
      error: 'Too many requests. Please try again later.',
    };
  }

  // Parse and validate
  const rawData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || undefined,
    subject: formData.get('subject'),
    message: formData.get('message'),
    honeypot: formData.get('honeypot') || '',
  };

  const result = contactSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  // Check honeypot (spam detection)
  if (result.data.honeypot) {
    // Silently reject spam
    return { success: true };
  }

  const { name, email, phone, subject, message } = result.data;

  try {
    // Save to database
    const contact = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
        ip,
      },
    });

    // Send notification email to admin
    await sendEmail({
      to: process.env.CONTACT_EMAIL!,
      subject: `New Contact: ${subject}`,
      template: 'contact-notification',
      data: { name, email, phone, subject, message, id: contact.id },
    });

    // Send auto-reply to sender
    await sendEmail({
      to: email,
      subject: 'Thank you for contacting us',
      template: 'contact-auto-reply',
      data: { name, subject },
    });

    return { success: true };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      error: 'Failed to send message. Please try again.',
    };
  }
}
```

## Rate Limiting Utility

```typescript
// lib/rate-limit.ts
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
}

export async function rateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<{ success: boolean; remaining: number }> {
  const key = `ratelimit:contact:${identifier}`;
  const now = Date.now();
  const windowStart = now - options.windowMs;

  // Remove old entries
  await redis.zremrangebyscore(key, 0, windowStart);

  // Count current requests
  const requestCount = await redis.zcard(key);

  if (requestCount >= options.maxRequests) {
    return { success: false, remaining: 0 };
  }

  // Add new request
  await redis.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  await redis.expire(key, Math.ceil(options.windowMs / 1000));

  return { success: true, remaining: options.maxRequests - requestCount - 1 };
}
```

## reCAPTCHA Integration

```typescript
// lib/recaptcha.ts
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
  });

  const data = await response.json();
  return data.success && data.score >= 0.5;
}

// Updated server action with reCAPTCHA
export async function submitContactFormWithRecaptcha(
  prevState: FormState | null,
  formData: FormData
): Promise<FormState> {
  const recaptchaToken = formData.get('recaptchaToken') as string;

  if (!await verifyRecaptcha(recaptchaToken)) {
    return {
      success: false,
      error: 'reCAPTCHA verification failed. Please try again.',
    };
  }

  // Continue with normal validation...
}
```

## Email Templates

```typescript
// lib/email/templates/contact-notification.tsx
import { Html, Body, Container, Text, Heading, Hr } from '@react-email/components';

interface ContactNotificationProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  id: string;
}

export function ContactNotification({ name, email, phone, subject, message, id }: ContactNotificationProps) {
  return (
    <Html>
      <Body style={{ fontFamily: 'sans-serif' }}>
        <Container>
          <Heading>New Contact Form Submission</Heading>
          <Text><strong>From:</strong> {name} ({email})</Text>
          {phone && <Text><strong>Phone:</strong> {phone}</Text>}
          <Text><strong>Subject:</strong> {subject}</Text>
          <Hr />
          <Text><strong>Message:</strong></Text>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{message}</Text>
          <Hr />
          <Text style={{ fontSize: '12px', color: '#666' }}>
            Submission ID: {id}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

## Database Schema

```prisma
// prisma/schema.prisma
model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String
  message   String   @db.Text
  ip        String?
  status    String   @default("new") // new, replied, archived
  createdAt DateTime @default(now())

  @@index([email])
  @@index([createdAt])
}
```

## Anti-patterns

### Don't Trust Client-Side Validation Only

```typescript
// BAD - Only client validation
const onSubmit = async (data) => {
  await sendEmail(data); // No server validation!
};

// GOOD - Always validate on server
const result = contactSchema.safeParse(formData);
if (!result.success) return { errors: result.error.flatten().fieldErrors };
```

## Related Skills

- [form-validation](./form-validation.md)
- [server-actions](./server-actions.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Honeypot spam protection
- Rate limiting
- Email delivery
