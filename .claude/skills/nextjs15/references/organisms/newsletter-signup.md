---
id: o-newsletter-signup
name: Newsletter Signup
version: 1.0.0
layer: L3
category: forms
description: Newsletter subscription form with email validation and success state
tags: [newsletter, signup, subscription, email, marketing, forms]
formula: "NewsletterSignup = FormField(m-form-field) + Button(a-button) + Input(a-input) + Alert(a-alert)"
composes:
  - ../molecules/form-field.md
  - ../atoms/input-button.md
  - ../atoms/input-text.md
  - ../atoms/feedback-alert.md
dependencies: ["react-hook-form", "zod", "lucide-react"]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Newsletter Signup

## Overview

The Newsletter Signup organism provides a subscription form with email validation, loading states, success/error feedback, and optional name field. Supports various layouts and integration with email service providers.

## When to Use

Use this skill when:
- Adding newsletter subscription to landing pages
- Building email capture forms
- Creating lead generation components
- Implementing mailing list signups

## Composition Diagram

```
+---------------------------------------------------------------------+
|                    NewsletterSignup (L3)                             |
+---------------------------------------------------------------------+
|  Inline Layout:                                                     |
|  +---------------------------------------------------------------+  |
|  | +------------------------------------------+ +---------------+ |  |
|  | | Input(a-input): Email                    | | Subscribe     | |  |
|  | | FormField(m-form-field)                  | | Button(a-btn) | |  |
|  | +------------------------------------------+ +---------------+ |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  Stacked Layout:                                                   |
|  +---------------------------------------------------------------+  |
|  | Heading: Subscribe to our newsletter                          |  |
|  | Description: Get the latest updates...                        |  |
|  |                                                                |  |
|  | +-----------------------------------------------------------+ |  |
|  | | Input(a-input): Email                                     | |  |
|  | +-----------------------------------------------------------+ |  |
|  | +-----------------------------------------------------------+ |  |
|  | | Subscribe Button(a-button)                                | |  |
|  | +-----------------------------------------------------------+ |  |
|  |                                                                |  |
|  | [ ] Checkbox: I agree to receive marketing emails            |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  Success State:                                                    |
|  +---------------------------------------------------------------+  |
|  | [Check Icon] Alert(a-alert)                                   |  |
|  | Thanks for subscribing! Check your email to confirm.         |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/newsletter-signup.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  name: z.string().optional(),
  consent: z.boolean().optional(),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterSignupProps {
  layout?: 'inline' | 'stacked' | 'card';
  title?: string;
  description?: string;
  placeholder?: string;
  buttonText?: string;
  showName?: boolean;
  showConsent?: boolean;
  consentText?: string;
  onSubmit?: (data: NewsletterFormData) => Promise<void>;
  successMessage?: string;
  className?: string;
}

export function NewsletterSignup({
  layout = 'inline',
  title,
  description,
  placeholder = 'Enter your email',
  buttonText = 'Subscribe',
  showName = false,
  showConsent = false,
  consentText = 'I agree to receive marketing emails',
  onSubmit,
  successMessage = 'Thanks for subscribing! Check your email to confirm.',
  className,
}: NewsletterSignupProps) {
  const [status, setStatus] = React.useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
  });

  const handleFormSubmit = async (data: NewsletterFormData) => {
    setStatus('loading');
    setErrorMessage('');

    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Default API call
        const res = await fetch('/api/newsletter/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.message || 'Subscription failed');
        }
      }

      setStatus('success');
      reset();
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  };

  if (status === 'success') {
    return (
      <div
        className={cn(
          'flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-900/20',
          'border border-green-200 dark:border-green-800',
          className
        )}
      >
        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
        <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
      </div>
    );
  }

  const isInline = layout === 'inline';
  const isCard = layout === 'card';

  return (
    <div
      className={cn(
        isCard && 'p-6 rounded-lg border bg-card',
        className
      )}
    >
      {(title || description) && (
        <div className={cn('mb-4', isInline && 'mb-0 mr-4')}>
          {title && (
            <h3 className="text-lg font-semibold">{title}</h3>
          )}
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit(handleFormSubmit)}
        className={cn(
          isInline && 'flex items-start gap-2',
          !isInline && 'space-y-4'
        )}
      >
        {showName && !isInline && (
          <div>
            <label htmlFor="newsletter-name" className="sr-only">
              Name
            </label>
            <input
              id="newsletter-name"
              type="text"
              {...register('name')}
              placeholder="Your name (optional)"
              className={cn(
                'w-full px-4 py-2 text-sm rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
              )}
            />
          </div>
        )}

        <div className={cn(isInline && 'flex-1', !isInline && 'relative')}>
          <label htmlFor="newsletter-email" className="sr-only">
            Email address
          </label>
          <div className="relative">
            {!isInline && (
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            )}
            <input
              id="newsletter-email"
              type="email"
              {...register('email')}
              placeholder={placeholder}
              disabled={status === 'loading'}
              className={cn(
                'w-full px-4 py-2 text-sm rounded-lg border bg-background',
                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                !isInline && 'pl-10',
                errors.email && 'border-destructive focus:ring-destructive/20'
              )}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'loading'}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            !isInline && 'w-full'
          )}
        >
          {status === 'loading' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Subscribing...
            </span>
          ) : (
            buttonText
          )}
        </button>

        {showConsent && !isInline && (
          <div className="flex items-start gap-2">
            <input
              id="newsletter-consent"
              type="checkbox"
              {...register('consent')}
              className="mt-1 h-4 w-4 rounded border-gray-300"
            />
            <label
              htmlFor="newsletter-consent"
              className="text-xs text-muted-foreground"
            >
              {consentText}
            </label>
          </div>
        )}
      </form>

      {status === 'error' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  );
}
```

## Usage

### Inline Layout

```tsx
import { NewsletterSignup } from '@/components/organisms/newsletter-signup';

export function Footer() {
  return (
    <NewsletterSignup
      layout="inline"
      placeholder="your@email.com"
      buttonText="Subscribe"
    />
  );
}
```

### Card Layout

```tsx
<NewsletterSignup
  layout="card"
  title="Stay Updated"
  description="Subscribe to our newsletter for the latest news and updates."
  showName
  showConsent
  onSubmit={async (data) => {
    await subscribeToMailchimp(data.email, data.name);
  }}
/>
```

### Stacked Layout

```tsx
<NewsletterSignup
  layout="stacked"
  title="Join Our Newsletter"
  description="Get weekly updates on new features and tips."
  buttonText="Join Now"
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Idle | Form ready for input, no activity | Default styling, button enabled |
| Focused | Email input has focus | Primary ring around input field, border highlight |
| Validating | User typing, real-time validation | No visual change during typing |
| Invalid | Email validation failed | Destructive border color, error message below input |
| Loading | Form submission in progress | Button shows spinner and "Subscribing..." text, inputs disabled |
| Success | Subscription completed successfully | Form replaced with green success alert, checkmark icon |
| Error | Submission failed | Error message with alert icon below form, destructive text color |
| Consent Unchecked | Consent checkbox not selected | Checkbox appears unchecked |
| Consent Checked | User agreed to marketing emails | Checkbox shows checkmark |

## Anti-patterns

### Bad: Not preventing duplicate submissions

```tsx
// Bad - User can submit multiple times
<button type="submit">Subscribe</button>

// Good - Disable button and show loading state
<button
  type="submit"
  disabled={status === 'loading'}
>
  {status === 'loading' ? (
    <span className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      Subscribing...
    </span>
  ) : (
    'Subscribe'
  )}
</button>
```

### Bad: Not validating email format on client

```tsx
// Bad - Only server-side validation
async function handleSubmit(data) {
  await api.subscribe(data.email); // Invalid emails hit the server
}

// Good - Client-side validation with Zod
const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

const { register, formState: { errors } } = useForm({
  resolver: zodResolver(newsletterSchema),
});

{errors.email && (
  <p className="text-destructive">{errors.email.message}</p>
)}
```

### Bad: Not clearing form after successful submission

```tsx
// Bad - Form keeps old values after success
async function handleSubmit(data) {
  await api.subscribe(data.email);
  setStatus('success');
  // Email still shows in input!
}

// Good - Reset form on success
async function handleSubmit(data) {
  await api.subscribe(data.email);
  setStatus('success');
  reset(); // Clear form fields
}
```

### Bad: Generic error messages that don't help users

```tsx
// Bad - Unhelpful error message
catch (error) {
  setErrorMessage('An error occurred');
}

// Good - Specific, actionable error messages
catch (error) {
  if (error.code === 'ALREADY_SUBSCRIBED') {
    setErrorMessage('This email is already subscribed to our newsletter.');
  } else if (error.code === 'INVALID_EMAIL') {
    setErrorMessage('Please enter a valid email address.');
  } else if (error.code === 'RATE_LIMITED') {
    setErrorMessage('Too many attempts. Please try again in a few minutes.');
  } else {
    setErrorMessage('Unable to subscribe. Please try again later.');
  }
}
```

## Accessibility

- Form inputs have associated labels (sr-only for inline)
- Error messages linked to inputs
- Loading state announced to screen readers
- Success state is clearly communicated

## Dependencies

```json
{
  "dependencies": {
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "lucide-react": "^0.460.0"
  }
}
```

## Related Skills

- [organisms/auth-form](./auth-form.md)
- [molecules/form-field](../molecules/form-field.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multiple layout variants
- Form validation with Zod
- Success and error states
