---
id: t-email-template-layout
name: Email Template Layout
version: 2.0.0
layer: L4
category: layouts
description: Responsive email template layout for transactional emails
tags: [email, template, newsletter, transactional, responsive]
performance:
  impact: medium
  lcp: medium
  cls: low
formula: "EmailTemplateLayout = DisplayText(a-display-text) + InputButton(a-input-button)"
composes:
  - ../atoms/display-text.md
  - ../atoms/input-button.md
dependencies:
  - react
  - @react-email/components
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Email Template Layout

## Overview

A responsive email template layout using React Email for transactional emails. Supports major email clients with inline styles and table-based layouts.

## Composition Diagram

```
+------------------------------------------------------------------+
|                    EmailTemplateLayout                            |
|                   (max-width: 600px)                              |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |  Header                                                     |  |
|  |  +--------------------------------------------------------+ |  |
|  |  |  [ Company Logo ]                                       | |  |
|  |  +--------------------------------------------------------+ |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |  Content Section                                            |  |
|  |  +--------------------------------------------------------+ |  |
|  |  |  a DisplayText (Heading)                                | |  |
|  |  |  "Welcome aboard, {name}!"                              | |  |
|  |  +--------------------------------------------------------+ |  |
|  |  |                                                          | |  |
|  |  |  a DisplayText (Body)                                   | |  |
|  |  |  Paragraph content with styling...                      | |  |
|  |  |                                                          | |  |
|  |  +--------------------------------------------------------+ |  |
|  |  |           +---------------------------+                  | |  |
|  |  |           | a InputButton             |                  | |  |
|  |  |           |    [Get Started]          |                  | |  |
|  |  |           +---------------------------+                  | |  |
|  |  +--------------------------------------------------------+ |  |
|  |  |  Feature Cards (2-column)                               | |  |
|  |  |  +---------------------+ +---------------------+         | |  |
|  |  |  | [Icon] Title        | | [Icon] Title        |         | |  |
|  |  |  | Description...      | | Description...      |         | |  |
|  |  |  +---------------------+ +---------------------+         | |  |
|  |  +--------------------------------------------------------+ |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |  Footer                                                     |  |
|  |  ---------------------------------------------------------- |  |
|  |  Company Address                                            |  |
|  |  Email Preferences | Unsubscribe | Privacy                  |  |
|  |  (c) 2025 Company Name. All rights reserved.                |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Implementation

### Base Email Layout

```tsx
// emails/layouts/base-layout.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Font,
} from '@react-email/components';

interface BaseLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function BaseLayout({ preview, children }: BaseLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://example.com/logo.png"
              width="120"
              height="40"
              alt="Company Logo"
              style={logo}
            />
          </Section>

          {/* Content */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Hr style={divider} />
          <Section style={footer}>
            <Text style={footerText}>
              This email was sent by Company Name
              <br />
              123 Main Street, City, State 12345
            </Text>
            <Text style={footerLinks}>
              <Link href="https://example.com/preferences" style={footerLink}>
                Email Preferences
              </Link>
              {' | '}
              <Link href="https://example.com/unsubscribe" style={footerLink}>
                Unsubscribe
              </Link>
              {' | '}
              <Link href="https://example.com/privacy" style={footerLink}>
                Privacy Policy
              </Link>
            </Text>
            <Text style={copyright}>
              &copy; {new Date().getFullYear()} Company Name. All rights reserved.
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
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  borderRadius: '8px',
  overflow: 'hidden' as const,
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const header = {
  backgroundColor: '#ffffff',
  padding: '32px 40px',
  borderBottom: '1px solid #e5e7eb',
};

const logo = {
  display: 'block' as const,
};

const content = {
  padding: '40px',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '0',
};

const footer = {
  padding: '32px 40px',
  backgroundColor: '#f9fafb',
};

const footerText = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const footerLinks = {
  color: '#6b7280',
  fontSize: '13px',
  lineHeight: '20px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
};

const footerLink = {
  color: '#4f46e5',
  textDecoration: 'none',
};

const copyright = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '0',
  textAlign: 'center' as const,
};
```

### Welcome Email

```tsx
// emails/welcome.tsx
import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Img,
} from '@react-email/components';
import { BaseLayout } from './layouts/base-layout';

interface WelcomeEmailProps {
  name: string;
  loginUrl: string;
}

export function WelcomeEmail({ name, loginUrl }: WelcomeEmailProps) {
  return (
    <BaseLayout preview={`Welcome to our platform, ${name}!`}>
      <Heading style={heading}>Welcome aboard, {name}!</Heading>
      
      <Text style={paragraph}>
        We're thrilled to have you join us. Your account has been created 
        successfully, and you're now ready to explore everything we have to offer.
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={loginUrl}>
          Get Started
        </Button>
      </Section>

      <Text style={paragraph}>
        Here are a few things you can do to get started:
      </Text>

      {/* Feature Cards */}
      <Section style={features}>
        <Row>
          <Column style={featureColumn}>
            <Img
              src="https://example.com/icon-profile.png"
              width="48"
              height="48"
              alt=""
              style={featureIcon}
            />
            <Text style={featureTitle}>Complete Your Profile</Text>
            <Text style={featureDescription}>
              Add your photo and details to personalize your experience.
            </Text>
          </Column>
          <Column style={featureColumn}>
            <Img
              src="https://example.com/icon-explore.png"
              width="48"
              height="48"
              alt=""
              style={featureIcon}
            />
            <Text style={featureTitle}>Explore Features</Text>
            <Text style={featureDescription}>
              Discover all the tools and features available to you.
            </Text>
          </Column>
        </Row>
      </Section>

      <Text style={paragraph}>
        If you have any questions, feel free to reply to this email or visit 
        our <a href="https://example.com/help" style={link}>Help Center</a>.
      </Text>

      <Text style={signature}>
        Best regards,
        <br />
        The Team
      </Text>
    </BaseLayout>
  );
}

// Styles
const heading = {
  color: '#111827',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 24px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
};

const features = {
  margin: '32px 0',
};

const featureColumn = {
  padding: '0 12px',
  textAlign: 'center' as const,
  verticalAlign: 'top' as const,
  width: '50%',
};

const featureIcon = {
  margin: '0 auto 12px',
};

const featureTitle = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 8px',
};

const featureDescription = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const link = {
  color: '#4f46e5',
  textDecoration: 'underline',
};

const signature = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '32px 0 0',
};

export default WelcomeEmail;
```

### Password Reset Email

```tsx
// emails/password-reset.tsx
import {
  Button,
  Heading,
  Text,
  Section,
  Code,
} from '@react-email/components';
import { BaseLayout } from './layouts/base-layout';

interface PasswordResetEmailProps {
  name: string;
  resetUrl: string;
  expiresIn: string;
}

export function PasswordResetEmail({
  name,
  resetUrl,
  expiresIn,
}: PasswordResetEmailProps) {
  return (
    <BaseLayout preview="Reset your password">
      <Heading style={heading}>Reset Your Password</Heading>

      <Text style={paragraph}>Hi {name},</Text>

      <Text style={paragraph}>
        We received a request to reset the password for your account. Click the 
        button below to create a new password:
      </Text>

      <Section style={buttonContainer}>
        <Button style={button} href={resetUrl}>
          Reset Password
        </Button>
      </Section>

      <Text style={paragraph}>
        This link will expire in <strong>{expiresIn}</strong>. If you didn't 
        request a password reset, you can safely ignore this email.
      </Text>

      <Section style={warningBox}>
        <Text style={warningText}>
          If the button doesn't work, copy and paste this link into your browser:
        </Text>
        <Code style={code}>{resetUrl}</Code>
      </Section>

      <Text style={securityNote}>
        For security reasons, this link can only be used once. If you need to 
        reset your password again, please request a new link.
      </Text>
    </BaseLayout>
  );
}

const heading = {
  color: '#111827',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
};

const paragraph = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 24px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
};

const warningBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const warningText = {
  color: '#6b7280',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 12px',
};

const code = {
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  color: '#374151',
  display: 'block',
  fontSize: '12px',
  padding: '12px',
  wordBreak: 'break-all' as const,
};

const securityNote = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0 0',
};

export default PasswordResetEmail;
```

### Order Confirmation Email

```tsx
// emails/order-confirmation.tsx
import {
  Button,
  Heading,
  Text,
  Section,
  Row,
  Column,
  Img,
  Hr,
} from '@react-email/components';
import { BaseLayout } from './layouts/base-layout';

interface OrderItem {
  name: string;
  image: string;
  quantity: number;
  price: number;
}

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  trackingUrl: string;
}

export function OrderConfirmationEmail({
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  tax,
  total,
  shippingAddress,
  trackingUrl,
}: OrderConfirmationEmailProps) {
  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);

  return (
    <BaseLayout preview={`Order #${orderNumber} confirmed`}>
      {/* Success Banner */}
      <Section style={successBanner}>
        <Img
          src="https://example.com/check-circle.png"
          width="64"
          height="64"
          alt=""
          style={successIcon}
        />
        <Heading style={successHeading}>Order Confirmed!</Heading>
        <Text style={successText}>
          Thank you for your order, {customerName}
        </Text>
      </Section>

      <Section style={orderInfo}>
        <Text style={orderNumber}>Order #{orderNumber}</Text>
      </Section>

      {/* Order Items */}
      <Section style={itemsSection}>
        <Heading as="h2" style={sectionHeading}>
          Order Summary
        </Heading>
        
        {items.map((item, index) => (
          <Row key={index} style={itemRow}>
            <Column style={itemImageColumn}>
              <Img
                src={item.image}
                width="80"
                height="80"
                alt={item.name}
                style={itemImage}
              />
            </Column>
            <Column style={itemDetailsColumn}>
              <Text style={itemName}>{item.name}</Text>
              <Text style={itemQuantity}>Qty: {item.quantity}</Text>
            </Column>
            <Column style={itemPriceColumn}>
              <Text style={itemPrice}>{formatPrice(item.price)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Hr style={divider} />

      {/* Order Totals */}
      <Section style={totalsSection}>
        <Row style={totalRow}>
          <Column style={totalLabelColumn}>
            <Text style={totalLabel}>Subtotal</Text>
          </Column>
          <Column style={totalValueColumn}>
            <Text style={totalValue}>{formatPrice(subtotal)}</Text>
          </Column>
        </Row>
        <Row style={totalRow}>
          <Column style={totalLabelColumn}>
            <Text style={totalLabel}>Shipping</Text>
          </Column>
          <Column style={totalValueColumn}>
            <Text style={totalValue}>{formatPrice(shipping)}</Text>
          </Column>
        </Row>
        <Row style={totalRow}>
          <Column style={totalLabelColumn}>
            <Text style={totalLabel}>Tax</Text>
          </Column>
          <Column style={totalValueColumn}>
            <Text style={totalValue}>{formatPrice(tax)}</Text>
          </Column>
        </Row>
        <Hr style={totalsDivider} />
        <Row style={totalRow}>
          <Column style={totalLabelColumn}>
            <Text style={grandTotalLabel}>Total</Text>
          </Column>
          <Column style={totalValueColumn}>
            <Text style={grandTotalValue}>{formatPrice(total)}</Text>
          </Column>
        </Row>
      </Section>

      <Hr style={divider} />

      {/* Shipping Address */}
      <Section style={addressSection}>
        <Heading as="h2" style={sectionHeading}>
          Shipping Address
        </Heading>
        <Text style={address}>
          {shippingAddress.street}
          <br />
          {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
          <br />
          {shippingAddress.country}
        </Text>
      </Section>

      {/* Track Order Button */}
      <Section style={buttonContainer}>
        <Button style={button} href={trackingUrl}>
          Track Your Order
        </Button>
      </Section>
    </BaseLayout>
  );
}

// Styles
const successBanner = {
  backgroundColor: '#ecfdf5',
  borderRadius: '8px',
  padding: '32px',
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const successIcon = {
  margin: '0 auto 16px',
};

const successHeading = {
  color: '#065f46',
  fontSize: '24px',
  fontWeight: '700',
  margin: '0 0 8px',
};

const successText = {
  color: '#047857',
  fontSize: '16px',
  margin: '0',
};

const orderInfo = {
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const orderNumber = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const sectionHeading = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 16px',
};

const itemsSection = {
  marginBottom: '24px',
};

const itemRow = {
  marginBottom: '16px',
};

const itemImageColumn = {
  width: '80px',
  verticalAlign: 'top' as const,
};

const itemImage = {
  borderRadius: '8px',
  border: '1px solid #e5e7eb',
};

const itemDetailsColumn = {
  paddingLeft: '16px',
  verticalAlign: 'top' as const,
};

const itemName = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 4px',
};

const itemQuantity = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const itemPriceColumn = {
  textAlign: 'right' as const,
  verticalAlign: 'top' as const,
  width: '100px',
};

const itemPrice = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
};

const divider = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
};

const totalsSection = {
  marginBottom: '24px',
};

const totalRow = {
  marginBottom: '8px',
};

const totalLabelColumn = {
  width: '70%',
};

const totalValueColumn = {
  width: '30%',
  textAlign: 'right' as const,
};

const totalLabel = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};

const totalValue = {
  color: '#374151',
  fontSize: '14px',
  margin: '0',
};

const totalsDivider = {
  borderColor: '#e5e7eb',
  margin: '12px 0',
};

const grandTotalLabel = {
  color: '#111827',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0',
};

const grandTotalValue = {
  color: '#111827',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
};

const addressSection = {
  marginBottom: '32px',
};

const address = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#4f46e5',
  borderRadius: '8px',
  color: '#ffffff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
};

export default OrderConfirmationEmail;
```

### Email Preview Route

```tsx
// app/api/emails/preview/[template]/route.tsx
import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { WelcomeEmail } from '@/emails/welcome';
import { PasswordResetEmail } from '@/emails/password-reset';
import { OrderConfirmationEmail } from '@/emails/order-confirmation';

const templates = {
  welcome: () => (
    <WelcomeEmail
      name="John"
      loginUrl="https://example.com/login"
    />
  ),
  'password-reset': () => (
    <PasswordResetEmail
      name="John"
      resetUrl="https://example.com/reset?token=abc123"
      expiresIn="24 hours"
    />
  ),
  'order-confirmation': () => (
    <OrderConfirmationEmail
      orderNumber="ORD-12345"
      customerName="John Doe"
      items={[
        { name: 'Product 1', image: 'https://via.placeholder.com/80', quantity: 2, price: 29.99 },
        { name: 'Product 2', image: 'https://via.placeholder.com/80', quantity: 1, price: 49.99 },
      ]}
      subtotal={109.97}
      shipping={5.99}
      tax={9.24}
      total={125.20}
      shippingAddress={{
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zip: '10001',
        country: 'United States',
      }}
      trackingUrl="https://example.com/track/12345"
    />
  ),
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ template: string }> }
) {
  const { template } = await params;
  
  const templateFn = templates[template as keyof typeof templates];
  
  if (!templateFn) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  const html = render(templateFn());
  
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}
```

## Usage

```tsx
// Send welcome email
import { Resend } from 'resend';
import { WelcomeEmail } from '@/emails/welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'noreply@example.com',
  to: 'user@example.com',
  subject: 'Welcome to our platform!',
  react: <WelcomeEmail name="John" loginUrl="https://example.com/login" />,
});

// Preview emails in browser
// Navigate to /api/emails/preview/welcome
// Navigate to /api/emails/preview/order-confirmation
```

## Error States

### Email Rendering Error

```tsx
// emails/components/error-fallback.tsx
import { Section, Text, Button, Container } from '@react-email/components';

interface EmailErrorFallbackProps {
  templateName: string;
  errorMessage?: string;
}

export function EmailErrorFallback({
  templateName,
  errorMessage,
}: EmailErrorFallbackProps) {
  return (
    <Container style={container}>
      <Section style={errorSection}>
        <Text style={errorTitle}>Email Rendering Error</Text>
        <Text style={errorDescription}>
          There was a problem rendering the {templateName} email template.
        </Text>
        {errorMessage && (
          <Text style={errorDetails}>
            Error: {errorMessage}
          </Text>
        )}
        <Text style={errorHelp}>
          If this issue persists, please contact support.
        </Text>
      </Section>
    </Container>
  );
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px',
  maxWidth: '600px',
};

const errorSection = {
  backgroundColor: '#fef2f2',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center' as const,
};

const errorTitle = {
  color: '#991b1b',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 12px',
};

const errorDescription = {
  color: '#7f1d1d',
  fontSize: '14px',
  margin: '0 0 12px',
};

const errorDetails = {
  color: '#9ca3af',
  fontSize: '12px',
  fontFamily: 'monospace',
  margin: '0 0 12px',
};

const errorHelp = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
};
```

### Image Loading Fallback

```tsx
// emails/components/image-fallback.tsx
import { Img, Section, Text } from '@react-email/components';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  fallbackText?: string;
}

export function ImageWithFallback({
  src,
  alt,
  width,
  height,
  fallbackText,
}: ImageWithFallbackProps) {
  // Email clients that don't support images will show alt text
  // For broken images, we provide a styled fallback
  return (
    <>
      {/* Primary image */}
      <Img
        src={src}
        alt={alt}
        width={width}
        height={height}
        style={{
          display: 'block',
          outline: 'none',
          border: 'none',
          textDecoration: 'none',
        }}
      />
      {/* Fallback for text-only clients */}
      <Text
        style={{
          display: 'none',
          msoHide: 'all' as any,
        }}
      >
        {fallbackText || alt}
      </Text>
    </>
  );
}
```

### Missing Variable Handling

```tsx
// emails/utils/safe-render.ts
export function safeRender<T extends Record<string, any>>(
  props: T,
  defaults: Partial<T>
): T {
  const result = { ...defaults } as T;

  for (const key in props) {
    if (props[key] !== undefined && props[key] !== null) {
      result[key] = props[key];
    }
  }

  return result;
}

// Usage in email template
export function WelcomeEmail(rawProps: Partial<WelcomeEmailProps>) {
  const props = safeRender(rawProps, {
    name: 'Valued Customer',
    loginUrl: 'https://example.com/login',
  });

  return (
    <BaseLayout preview={`Welcome, ${props.name}!`}>
      <Heading>Welcome, {props.name}!</Heading>
      {/* ... */}
    </BaseLayout>
  );
}
```

### API Route Error Handling

```tsx
// app/api/emails/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { z } from 'zod';
import { WelcomeEmail } from '@/emails/welcome';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailSchema = z.object({
  to: z.string().email(),
  template: z.enum(['welcome', 'password-reset', 'order-confirmation']),
  data: z.record(z.any()),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, template, data } = sendEmailSchema.parse(body);

    // Validate required data for template
    if (template === 'welcome' && !data.name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: 'noreply@example.com',
      to,
      subject: getSubjectForTemplate(template, data),
      react: getEmailComponent(template, data),
    });

    if (error) {
      console.error('Email send error:', error);
      return NextResponse.json(
        { error: 'Failed to send email', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Loading States

### Email Preview Loading

```tsx
// app/api/emails/preview/[template]/loading.tsx
export default function EmailPreviewLoading() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#f6f9fc',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#4f46e5',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px',
          }}
        />
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          Loading email preview...
        </p>
      </div>
      <style>
        {`@keyframes spin { to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}
```

### Async Email Component

```tsx
// emails/components/async-content.tsx
import { Suspense } from 'react';
import { Section, Text, Skeleton } from '@react-email/components';

interface AsyncContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Note: Email rendering happens server-side, but this pattern
// is useful for emails that need to fetch data
export function AsyncContent({ children, fallback }: AsyncContentProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <Section style={loadingSection}>
            <div style={loadingBar} />
            <div style={{ ...loadingBar, width: '60%' }} />
            <div style={{ ...loadingBar, width: '80%' }} />
          </Section>
        )
      }
    >
      {children}
    </Suspense>
  );
}

const loadingSection = {
  padding: '16px 0',
};

const loadingBar = {
  height: '12px',
  backgroundColor: '#e5e7eb',
  borderRadius: '4px',
  marginBottom: '8px',
};
```

### Progressive Email Loading (Preview UI)

```tsx
// components/email-preview.tsx
"use client";

import * as React from "react";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmailPreviewProps {
  template: string;
  data: Record<string, any>;
}

export function EmailPreview({ template, data }: EmailPreviewProps) {
  const [html, setHtml] = React.useState<string>("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchPreview = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/emails/preview/${template}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to load preview");
      }

      const htmlContent = await response.text();
      setHtml(htmlContent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [template, data]);

  React.useEffect(() => {
    fetchPreview();
  }, [fetchPreview]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading email preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-destructive/5 rounded-lg">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
          <p className="text-sm text-destructive mb-4">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchPreview}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <iframe
        srcDoc={html}
        className="w-full h-[600px] bg-white"
        title="Email Preview"
      />
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Email Breakpoints

| Email Client | Max Width | Images | Fonts |
|--------------|-----------|--------|-------|
| Gmail (Web) | 600px | Full support | Web fonts |
| Gmail (Mobile) | 100% viewport | Full support | System fonts |
| Apple Mail | 600px | Full support | Web fonts |
| Outlook | 600px | Limited | System fonts |
| Yahoo | 600px | Full support | System fonts |

### Mobile-First Email Layout

```tsx
// emails/layouts/responsive-layout.tsx
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Font,
} from '@react-email/components';

interface ResponsiveLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export function ResponsiveLayout({ preview, children }: ResponsiveLayoutProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Inter"
          fallbackFontFamily="Helvetica"
          webFont={{
            url: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="x-apple-disable-message-reformatting" />
        <style>
          {`
            /* Mobile-first styles */
            @media only screen and (max-width: 600px) {
              .mobile-padding {
                padding-left: 16px !important;
                padding-right: 16px !important;
              }
              .mobile-full-width {
                width: 100% !important;
                max-width: 100% !important;
              }
              .mobile-stack {
                display: block !important;
                width: 100% !important;
              }
              .mobile-center {
                text-align: center !important;
              }
              .mobile-hide {
                display: none !important;
              }
              .mobile-show {
                display: block !important;
              }
              .mobile-text-lg {
                font-size: 18px !important;
                line-height: 26px !important;
              }
              .mobile-button {
                display: block !important;
                width: 100% !important;
              }
            }
          `}
        </style>
      </Head>
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container} className="mobile-full-width">
          {children}
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  maxWidth: '600px',
  width: '100%',
};
```

### Responsive Two-Column Layout

```tsx
// emails/components/responsive-columns.tsx
import { Section, Row, Column } from '@react-email/components';

interface ResponsiveColumnsProps {
  left: React.ReactNode;
  right: React.ReactNode;
  gap?: number;
}

export function ResponsiveColumns({
  left,
  right,
  gap = 24,
}: ResponsiveColumnsProps) {
  return (
    <Section style={section}>
      <Row>
        <Column
          style={column}
          className="mobile-stack"
        >
          {left}
        </Column>
        <Column
          style={{ width: gap }}
          className="mobile-hide"
        >
          {/* Spacer */}
        </Column>
        <Column
          style={column}
          className="mobile-stack"
        >
          {right}
        </Column>
      </Row>
    </Section>
  );
}

const section = {
  padding: '0 40px',
};

const column = {
  width: '50%',
  verticalAlign: 'top' as const,
};
```

### Mobile-Optimized Button

```tsx
// emails/components/responsive-button.tsx
import { Button, Section } from '@react-email/components';

interface ResponsiveButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

export function ResponsiveButton({
  href,
  children,
  variant = 'primary',
  fullWidth = false,
}: ResponsiveButtonProps) {
  const styles = variant === 'primary' ? primaryStyles : secondaryStyles;

  return (
    <Section style={container}>
      <Button
        href={href}
        style={{
          ...baseStyles,
          ...styles,
          ...(fullWidth ? { width: '100%', textAlign: 'center' as const } : {}),
        }}
        className="mobile-button"
      >
        {children}
      </Button>
    </Section>
  );
}

const container = {
  textAlign: 'center' as const,
};

const baseStyles = {
  display: 'inline-block',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  textDecoration: 'none',
  // Minimum touch target for mobile
  minHeight: '44px',
  lineHeight: '16px',
};

const primaryStyles = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
};

const secondaryStyles = {
  backgroundColor: 'transparent',
  color: '#4f46e5',
  border: '2px solid #4f46e5',
};
```

### Mobile Text Sizing

```tsx
// emails/components/responsive-text.tsx
import { Text, Heading } from '@react-email/components';

interface ResponsiveTextProps {
  children: React.ReactNode;
  size?: 'sm' | 'base' | 'lg' | 'xl';
  color?: string;
  align?: 'left' | 'center' | 'right';
}

const sizeMap = {
  sm: { fontSize: '14px', lineHeight: '20px', mobileClass: '' },
  base: { fontSize: '16px', lineHeight: '26px', mobileClass: '' },
  lg: { fontSize: '18px', lineHeight: '28px', mobileClass: 'mobile-text-lg' },
  xl: { fontSize: '24px', lineHeight: '32px', mobileClass: 'mobile-text-lg' },
};

export function ResponsiveText({
  children,
  size = 'base',
  color = '#374151',
  align = 'left',
}: ResponsiveTextProps) {
  const { fontSize, lineHeight, mobileClass } = sizeMap[size];

  return (
    <Text
      style={{
        color,
        fontSize,
        lineHeight,
        margin: '0 0 16px',
        textAlign: align,
      }}
      className={mobileClass}
    >
      {children}
    </Text>
  );
}

interface ResponsiveHeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center' | 'right';
}

const headingSizes = {
  h1: { fontSize: '28px', lineHeight: '36px' },
  h2: { fontSize: '24px', lineHeight: '32px' },
  h3: { fontSize: '20px', lineHeight: '28px' },
};

export function ResponsiveHeading({
  children,
  as = 'h1',
  align = 'left',
}: ResponsiveHeadingProps) {
  const { fontSize, lineHeight } = headingSizes[as];

  return (
    <Heading
      as={as}
      style={{
        color: '#111827',
        fontSize,
        fontWeight: '700',
        lineHeight,
        margin: '0 0 16px',
        textAlign: align,
      }}
      className="mobile-text-lg"
    >
      {children}
    </Heading>
  );
}
```

### Mobile Preview Frame

```tsx
// components/email-mobile-preview.tsx
"use client";

import * as React from "react";
import { Smartphone, Monitor, Tablet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmailMobilePreviewProps {
  html: string;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';

const viewModes: { id: ViewMode; icon: React.ElementType; width: number; label: string }[] = [
  { id: 'desktop', icon: Monitor, width: 600, label: 'Desktop' },
  { id: 'tablet', icon: Tablet, width: 480, label: 'Tablet' },
  { id: 'mobile', icon: Smartphone, width: 375, label: 'Mobile' },
];

export function EmailMobilePreview({ html }: EmailMobilePreviewProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>('desktop');

  const currentMode = viewModes.find((m) => m.id === viewMode)!;

  return (
    <div className="space-y-4">
      {/* View Mode Selector */}
      <div className="flex justify-center gap-2">
        {viewModes.map((mode) => (
          <Button
            key={mode.id}
            variant={viewMode === mode.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode(mode.id)}
          >
            <mode.icon className="h-4 w-4 mr-2" />
            {mode.label}
          </Button>
        ))}
      </div>

      {/* Preview Frame */}
      <div className="flex justify-center">
        <div
          className={cn(
            "border rounded-lg overflow-hidden bg-white transition-all duration-300",
            viewMode === 'mobile' && "rounded-[32px] border-8 border-gray-800"
          )}
          style={{ width: currentMode.width }}
        >
          {viewMode === 'mobile' && (
            <div className="h-6 bg-gray-800 flex justify-center items-center">
              <div className="w-16 h-3 bg-gray-700 rounded-full" />
            </div>
          )}
          <iframe
            srcDoc={html}
            className="w-full bg-white"
            style={{ height: viewMode === 'mobile' ? '600px' : '800px' }}
            title="Email Preview"
          />
        </div>
      </div>
    </div>
  );
}
```

## Related Skills

- [L5/email-sending](../patterns/email-sending.md) - Email sending patterns
- [L4/notifications-page](./notifications-page.md) - In-app notifications
- [L3/notification-center](../organisms/notification-center.md) - Notification UI

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with React Email templates
