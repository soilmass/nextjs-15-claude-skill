---
id: pt-email-templates
name: Email Templates
version: 2.0.0
layer: L5
category: email
description: React-based email templates with react-email for transactional and marketing emails
tags: [email, templates, react-email, transactional, marketing, notifications]
composes:
  - ../atoms/input-button.md
  - ../molecules/card.md
dependencies:
  resend: "^4.0.0"
  react-email: "^3.0.0"
formula: React Email + Component Library + Inline Styles + Resend = Beautiful Responsive Emails
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

- Building consistent email templates with reusable components and layouts
- Creating transactional emails for welcome, password reset, and verification flows
- Designing invoice and receipt emails with dynamic line items and totals
- Developing marketing campaign emails with responsive mobile-first design
- Testing and previewing email templates during development

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    EMAIL TEMPLATES PATTERN                       │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                Component Layer                        │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │   Layout    │  │   Button    │  │   Heading   │  │      │
│  │  │ (header/ft) │  │  (CTA)      │  │   / Text    │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                Template Layer                         │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │  Welcome    │  │  Password   │  │   Invoice   │  │      │
│  │  │   Email     │  │   Reset     │  │   Email     │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 Render Layer                          │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │    HTML     │  │  Plain Text │  │   Preview   │  │      │
│  │  │   render    │  │   render    │  │   Server    │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Email Templates

Build beautiful, responsive email templates with React and react-email.

## Overview

This pattern covers:
- React Email component library
- Responsive email design
- Template organization
- Preview and testing
- Dynamic content
- Styling with Tailwind
- Email delivery with Resend

## Implementation

### Installation

```bash
npm install @react-email/components react-email resend
```

### Email Configuration

```typescript
// lib/email/config.ts
import { Resend } from 'resend';

export const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_CONFIG = {
  from: {
    default: 'App <noreply@example.com>',
    marketing: 'App Team <team@example.com>',
    support: 'Support <support@example.com>',
  },
  replyTo: 'support@example.com',
  baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
};
```

### Base Layout Component

```typescript
// emails/components/layout.tsx
import {
  Html,
  Head,
  Body,
  Container,
  Preview,
  Section,
  Img,
  Text,
  Link,
  Hr,
} from '@react-email/components';
import * as React from 'react';

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src={`${process.env.NEXT_PUBLIC_APP_URL}/logo.png`}
              width="120"
              height="40"
              alt="Logo"
            />
          </Section>

          {/* Content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              © {new Date().getFullYear()} Your Company. All rights reserved.
            </Text>
            <Text style={footerLinks}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/privacy`} style={link}>
                Privacy Policy
              </Link>
              {' • '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/terms`} style={link}>
                Terms of Service
              </Link>
              {' • '}
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe`} style={link}>
                Unsubscribe
              </Link>
            </Text>
            <Text style={footerAddress}>
              123 Main Street, City, State 12345
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '24px',
  textAlign: 'center' as const,
};

const content = {
  padding: '0 24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  padding: '0 24px',
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginBottom: '8px',
};

const footerLinks = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
  marginBottom: '8px',
};

const footerAddress = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};

const link = {
  color: '#556cd6',
  textDecoration: 'underline',
};
```

### Reusable Components

```typescript
// emails/components/button.tsx
import { Button as EmailButton } from '@react-email/components';
import * as React from 'react';

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ href, children, variant = 'primary' }: ButtonProps) {
  const styles = {
    primary: {
      backgroundColor: '#5469d4',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#24292e',
      color: '#ffffff',
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#5469d4',
      border: '1px solid #5469d4',
    },
  };

  return (
    <EmailButton
      href={href}
      style={{
        ...baseButtonStyle,
        ...styles[variant],
      }}
    >
      {children}
    </EmailButton>
  );
}

const baseButtonStyle = {
  borderRadius: '6px',
  fontSize: '16px',
  fontWeight: 'bold' as const,
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 24px',
};

// emails/components/heading.tsx
import { Heading as EmailHeading } from '@react-email/components';
import * as React from 'react';

interface HeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3';
}

export function Heading({ children, as = 'h1' }: HeadingProps) {
  const sizes = {
    h1: { fontSize: '24px', lineHeight: '32px' },
    h2: { fontSize: '20px', lineHeight: '28px' },
    h3: { fontSize: '16px', lineHeight: '24px' },
  };

  return (
    <EmailHeading
      as={as}
      style={{
        color: '#1a1a1a',
        fontWeight: 'bold',
        margin: '0 0 16px',
        ...sizes[as],
      }}
    >
      {children}
    </EmailHeading>
  );
}

// emails/components/text.tsx
import { Text as EmailText } from '@react-email/components';
import * as React from 'react';

interface TextProps {
  children: React.ReactNode;
  muted?: boolean;
}

export function Text({ children, muted }: TextProps) {
  return (
    <EmailText
      style={{
        color: muted ? '#666666' : '#333333',
        fontSize: '16px',
        lineHeight: '24px',
        margin: '0 0 16px',
      }}
    >
      {children}
    </EmailText>
  );
}
```

### Welcome Email Template

```typescript
// emails/templates/welcome.tsx
import { Section, Img } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <EmailLayout preview={`Welcome to our platform, ${name}!`}>
      <Img
        src={`${process.env.NEXT_PUBLIC_APP_URL}/email/welcome-hero.png`}
        width="100%"
        height="auto"
        alt="Welcome"
        style={{ borderRadius: '8px', marginBottom: '24px' }}
      />

      <Heading>Welcome aboard, {name}!</Heading>

      <Text>
        We're thrilled to have you join us. Your account is now active and ready
        to use. Here's what you can do to get started:
      </Text>

      <Section style={{ marginBottom: '24px' }}>
        <ul style={{ paddingLeft: '20px', margin: '0 0 16px' }}>
          <li style={{ marginBottom: '8px', color: '#333333' }}>
            Complete your profile to personalize your experience
          </li>
          <li style={{ marginBottom: '8px', color: '#333333' }}>
            Explore our features and discover what's possible
          </li>
          <li style={{ marginBottom: '8px', color: '#333333' }}>
            Connect with our community and start collaborating
          </li>
        </ul>
      </Section>

      <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Button href={loginUrl}>Get Started</Button>
      </Section>

      <Text muted>
        If you have any questions, don't hesitate to reach out to our support
        team. We're here to help!
      </Text>
    </EmailLayout>
  );
}

// Default props for preview
WelcomeEmail.PreviewProps = {
  name: 'John',
  loginUrl: 'https://example.com/login',
};

export default WelcomeEmail;
```

### Password Reset Email

```typescript
// emails/templates/password-reset.tsx
import { Section, Row, Column } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiresIn: number; // hours
}

export function PasswordResetEmail({
  name,
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps) {
  return (
    <EmailLayout preview="Reset your password">
      <Heading>Reset Your Password</Heading>

      <Text>Hi {name},</Text>

      <Text>
        We received a request to reset your password. Click the button below to
        create a new password:
      </Text>

      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button href={resetUrl}>Reset Password</Button>
      </Section>

      <Text muted>
        This link will expire in {expiresIn} hour{expiresIn > 1 ? 's' : ''}.
      </Text>

      <Section
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '16px',
          marginTop: '24px',
        }}
      >
        <Text style={{ margin: 0, fontSize: '14px' }}>
          <strong>Didn't request this?</strong>
          <br />
          If you didn't request a password reset, you can safely ignore this
          email. Your password will remain unchanged.
        </Text>
      </Section>
    </EmailLayout>
  );
}

PasswordResetEmail.PreviewProps = {
  name: 'John',
  resetUrl: 'https://example.com/reset-password?token=abc123',
  expiresIn: 1,
};

export default PasswordResetEmail;
```

### Invoice Email Template

```typescript
// emails/templates/invoice.tsx
import { Section, Row, Column, Hr } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from '../components/layout';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceEmailProps {
  customerName: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  paymentUrl: string;
  pdfUrl: string;
}

export function InvoiceEmail({
  customerName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  items,
  subtotal,
  tax,
  total,
  currency,
  paymentUrl,
  pdfUrl,
}: InvoiceEmailProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);

  return (
    <EmailLayout preview={`Invoice ${invoiceNumber} - ${formatCurrency(total)}`}>
      <Heading>Invoice {invoiceNumber}</Heading>

      <Text>Hi {customerName},</Text>

      <Text>
        Please find your invoice below. Payment is due by {dueDate}.
      </Text>

      {/* Invoice Details */}
      <Section
        style={{
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          padding: '16px',
          marginBottom: '24px',
        }}
      >
        <Row>
          <Column>
            <Text style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Invoice Number
            </Text>
            <Text style={{ margin: '4px 0 0', fontWeight: 'bold' }}>
              {invoiceNumber}
            </Text>
          </Column>
          <Column>
            <Text style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Invoice Date
            </Text>
            <Text style={{ margin: '4px 0 0', fontWeight: 'bold' }}>
              {invoiceDate}
            </Text>
          </Column>
          <Column>
            <Text style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              Due Date
            </Text>
            <Text style={{ margin: '4px 0 0', fontWeight: 'bold' }}>
              {dueDate}
            </Text>
          </Column>
        </Row>
      </Section>

      {/* Line Items */}
      <Section>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e6ebf1' }}>
              <th style={{ ...thStyle, textAlign: 'left' }}>Description</th>
              <th style={thStyle}>Qty</th>
              <th style={thStyle}>Price</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: '1px solid #e6ebf1' }}>
                <td style={{ ...tdStyle, textAlign: 'left' }}>
                  {item.description}
                </td>
                <td style={tdStyle}>{item.quantity}</td>
                <td style={tdStyle}>{formatCurrency(item.unitPrice)}</td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  {formatCurrency(item.total)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Totals */}
      <Section style={{ marginTop: '16px' }}>
        <Row>
          <Column style={{ width: '60%' }} />
          <Column style={{ width: '40%' }}>
            <table style={{ width: '100%' }}>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Subtotal</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>
                  {formatCurrency(subtotal)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 0', color: '#666' }}>Tax</td>
                <td style={{ padding: '4px 0', textAlign: 'right' }}>
                  {formatCurrency(tax)}
                </td>
              </tr>
              <tr style={{ borderTop: '2px solid #1a1a1a' }}>
                <td
                  style={{
                    padding: '8px 0',
                    fontWeight: 'bold',
                    fontSize: '18px',
                  }}
                >
                  Total
                </td>
                <td
                  style={{
                    padding: '8px 0',
                    textAlign: 'right',
                    fontWeight: 'bold',
                    fontSize: '18px',
                  }}
                >
                  {formatCurrency(total)}
                </td>
              </tr>
            </table>
          </Column>
        </Row>
      </Section>

      {/* Actions */}
      <Section style={{ textAlign: 'center', margin: '32px 0' }}>
        <Button href={paymentUrl}>Pay Now</Button>
      </Section>

      <Text muted style={{ textAlign: 'center' }}>
        <a href={pdfUrl} style={{ color: '#5469d4' }}>
          Download PDF
        </a>
      </Text>
    </EmailLayout>
  );
}

const thStyle = {
  padding: '12px 8px',
  fontSize: '12px',
  fontWeight: 'bold' as const,
  color: '#666',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
};

const tdStyle = {
  padding: '12px 8px',
  fontSize: '14px',
  textAlign: 'center' as const,
};

InvoiceEmail.PreviewProps = {
  customerName: 'John Doe',
  invoiceNumber: 'INV-2024-001',
  invoiceDate: 'January 15, 2024',
  dueDate: 'January 30, 2024',
  items: [
    { description: 'Pro Plan (Monthly)', quantity: 1, unitPrice: 49, total: 49 },
    { description: 'Additional Storage (10GB)', quantity: 2, unitPrice: 5, total: 10 },
  ],
  subtotal: 59,
  tax: 5.9,
  total: 64.9,
  currency: 'USD',
  paymentUrl: 'https://example.com/pay/inv-2024-001',
  pdfUrl: 'https://example.com/invoices/inv-2024-001.pdf',
};

export default InvoiceEmail;
```

### Email Sending Service

```typescript
// lib/email/send.ts
import { resend, EMAIL_CONFIG } from './config';
import { render } from '@react-email/render';
import type { ReactElement } from 'react';

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  template: ReactElement;
  from?: keyof typeof EMAIL_CONFIG.from;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: { name: string; value: string }[];
}

export async function sendEmail({
  to,
  subject,
  template,
  from = 'default',
  replyTo = EMAIL_CONFIG.replyTo,
  cc,
  bcc,
  tags,
}: SendEmailOptions) {
  const html = await render(template);
  const text = await render(template, { plainText: true });

  const result = await resend.emails.send({
    from: EMAIL_CONFIG.from[from],
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    replyTo,
    cc: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
    bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
    tags,
  });

  return result;
}

// Convenience functions for common emails
export async function sendWelcomeEmail(to: string, name: string) {
  const { WelcomeEmail } = await import('@/emails/templates/welcome');
  
  return sendEmail({
    to,
    subject: `Welcome to Our Platform, ${name}!`,
    template: WelcomeEmail({
      name,
      loginUrl: `${EMAIL_CONFIG.baseUrl}/login`,
    }),
    tags: [{ name: 'category', value: 'welcome' }],
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  resetUrl: string;
  expiresIn: number;
}) {
  const { PasswordResetEmail } = await import('@/emails/templates/password-reset');
  
  return sendEmail({
    to: params.to,
    subject: 'Reset Your Password',
    template: PasswordResetEmail(params),
    tags: [{ name: 'category', value: 'transactional' }],
  });
}
```

### Preview Development Server

```json
// package.json scripts
{
  "scripts": {
    "email:dev": "email dev -p 3001",
    "email:export": "email export --outDir ./out/emails"
  }
}
```

## Anti-patterns

1. **Complex layouts** - Keep email layouts simple for compatibility
2. **External stylesheets** - Inline all styles
3. **JavaScript in emails** - Email clients don't support JS
4. **Large images** - Optimize and host images externally
5. **No plain text** - Always include plain text version
6. **Missing preview text** - Always set preview/preheader text

## Related Skills

- [[transactional-email]] - Email delivery patterns
- [[password-reset]] - Password reset flow
- [[email-verification]] - Email verification

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial email templates pattern with React Email
