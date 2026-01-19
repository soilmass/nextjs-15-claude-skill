---
id: pt-email-integration
name: Email Integration
version: 1.0.0
layer: L5
category: integration
description: Integrate email services for transactional emails, templates, and email automation
tags: [email, resend, nodemailer, templates, transactional, next15, react19]
composes: []
dependencies: []
formula: "EmailIntegration = Provider + Templates (React Email) + Queue + Tracking"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Email Integration

## When to Use

- When sending transactional emails (password reset, verification)
- For marketing emails and newsletters
- When implementing email notifications
- For order confirmations and receipts
- When building email automation workflows

## Overview

This pattern implements email integration using Resend with React Email for type-safe, component-based email templates. It covers transactional emails, templating, and email queueing.

## Installation

```bash
npm install resend @react-email/components
```

## Email Provider Setup

```typescript
// lib/email/index.ts
import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@example.com";
export const FROM_NAME = process.env.FROM_NAME || "My App";

export async function sendEmail({
  to,
  subject,
  react,
  text,
}: {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  text?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      text,
    });

    if (error) {
      console.error("Email error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}
```

## Email Templates with React Email

```typescript
// emails/welcome.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface WelcomeEmailProps {
  userName: string;
  loginUrl: string;
}

export function WelcomeEmail({ userName, loginUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to our platform!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img
            src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
            width="120"
            height="40"
            alt="Logo"
            style={logo}
          />
          <Heading style={heading}>Welcome, {userName}!</Heading>
          <Text style={text}>
            We're excited to have you on board. Get started by exploring
            your dashboard and setting up your profile.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={loginUrl}>
              Get Started
            </Button>
          </Section>
          <Text style={footer}>
            If you didn't create an account, you can safely ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const logo = { margin: "0 auto 20px" };
const heading = { fontSize: "24px", fontWeight: "600", textAlign: "center" as const };
const text = { fontSize: "16px", lineHeight: "24px", color: "#525252" };
const buttonContainer = { textAlign: "center" as const, margin: "32px 0" };
const button = {
  backgroundColor: "#000",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  padding: "12px 24px",
  textDecoration: "none",
};
const footer = { fontSize: "14px", color: "#8898aa", textAlign: "center" as const };
```

## Password Reset Email

```typescript
// emails/password-reset.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface PasswordResetEmailProps {
  resetUrl: string;
  expiresIn: string;
}

export function PasswordResetEmail({ resetUrl, expiresIn }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Reset your password</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Reset Your Password</Heading>
          <Text style={text}>
            We received a request to reset your password. Click the button
            below to create a new password.
          </Text>
          <Section style={buttonContainer}>
            <Button style={button} href={resetUrl}>
              Reset Password
            </Button>
          </Section>
          <Text style={warning}>
            This link will expire in {expiresIn}. If you didn't request
            a password reset, please ignore this email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = { backgroundColor: "#f6f9fc", fontFamily: "sans-serif" };
const container = { backgroundColor: "#fff", margin: "0 auto", padding: "40px 20px" };
const heading = { fontSize: "24px", fontWeight: "600" };
const text = { fontSize: "16px", lineHeight: "24px" };
const buttonContainer = { textAlign: "center" as const, margin: "32px 0" };
const button = { backgroundColor: "#000", borderRadius: "6px", color: "#fff", padding: "12px 24px" };
const warning = { fontSize: "14px", color: "#8898aa" };
```

## Email Service Functions

```typescript
// lib/email/send.ts
import { sendEmail } from "./index";
import { WelcomeEmail } from "@/emails/welcome";
import { PasswordResetEmail } from "@/emails/password-reset";
import { VerificationEmail } from "@/emails/verification";

export async function sendWelcomeEmail(email: string, userName: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/login`;

  return sendEmail({
    to: email,
    subject: "Welcome to Our Platform!",
    react: WelcomeEmail({ userName, loginUrl }),
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Reset Your Password",
    react: PasswordResetEmail({ resetUrl, expiresIn: "1 hour" }),
  });
}

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: "Verify Your Email",
    react: VerificationEmail({ verifyUrl }),
  });
}
```

## Server Action for Email

```typescript
// app/actions/email.ts
"use server";

import { auth } from "@/auth";
import { sendWelcomeEmail, sendPasswordResetEmail } from "@/lib/email/send";
import { prisma } from "@/lib/db";
import crypto from "crypto";

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  // Don't reveal if user exists
  if (!user) {
    return { success: true };
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      token,
      userId: user.id,
      expires,
    },
  });

  await sendPasswordResetEmail(email, token);

  return { success: true };
}

export async function resendVerificationEmail() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.verificationToken.create({
    data: {
      token,
      email: session.user.email,
      expires: new Date(Date.now() + 86400000), // 24 hours
    },
  });

  await sendVerificationEmail(session.user.email, token);

  return { success: true };
}
```

## Email Queue with Background Jobs

```typescript
// lib/email/queue.ts
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";
import { sendEmail } from "./index";

const connection = new Redis(process.env.REDIS_URL!);

export const emailQueue = new Queue("emails", { connection });

interface EmailJob {
  to: string;
  subject: string;
  template: string;
  data: Record<string, unknown>;
}

export async function queueEmail(job: EmailJob) {
  await emailQueue.add("send-email", job, {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  });
}

// Worker (run in separate process)
const worker = new Worker(
  "emails",
  async (job) => {
    const { to, subject, template, data } = job.data as EmailJob;
    const EmailTemplate = await import(`@/emails/${template}`);

    await sendEmail({
      to,
      subject,
      react: EmailTemplate.default(data),
    });
  },
  { connection }
);

worker.on("completed", (job) => {
  console.log(`Email sent: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`Email failed: ${job?.id}`, err);
});
```

## Anti-patterns

### Don't Block on Email Sending

```typescript
// BAD - Blocks the response
await sendWelcomeEmail(user.email, user.name);
return { success: true };

// GOOD - Queue and return immediately
await queueEmail({
  to: user.email,
  subject: "Welcome!",
  template: "welcome",
  data: { userName: user.name },
});
return { success: true };
```

### Don't Expose Email Infrastructure

```typescript
// BAD - Expose API key or email details
return { emailId: result.id, provider: "resend" };

// GOOD - Abstract the response
return { success: true, message: "Email sent" };
```

## Related Patterns

- [email-verification](./email-verification.md)
- [password-reset](./password-reset.md)
- [magic-links](./magic-links.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- React Email templates
- Resend integration
- Email queue system
