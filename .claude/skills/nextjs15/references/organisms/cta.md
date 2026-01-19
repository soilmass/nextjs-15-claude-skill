---
id: o-cta
name: CTA
version: 2.0.0
layer: L3
category: marketing
description: Call-to-action section with headline, description, and action buttons
tags: [cta, call-to-action, conversion, marketing, banner]
formula: "CTA = FormField(m-form-field) + Button(a-button) + Input(a-input)"
composes:
  - ../molecules/form-field.md
dependencies: [framer-motion, lucide-react]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# CTA

## Overview

The CTA (Call-to-Action) organism creates compelling conversion sections with headlines, descriptions, action buttons, and optional visual elements. Designed to drive user action at key points in the page flow.

## When to Use

Use this skill when:
- Creating page-ending conversion sections
- Building mid-page promotional banners
- Designing newsletter signup sections
- Creating upgrade/trial prompts

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CTA (L3)                                   │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Centered / Split / Banner / Gradient Variant                 │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Title (h2): Headline text                              │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Description: Supporting text                           │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Actions (Option A - Buttons)                           │  │  │
│  │  │  Button(a-button)[Primary] + Button(a-button)[Secondary]│  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Actions (Option B - Newsletter)                        │  │  │
│  │  │  FormField(m-form-field)                                │  │  │
│  │  │  ┌─────────────────────────────┐ ┌─────────────────┐   │  │  │
│  │  │  │  Input(a-input): Email      │ │ Button: Submit  │   │  │  │
│  │  │  └─────────────────────────────┘ └─────────────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Visual (optional): Image / Illustration                │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [form-field](../molecules/form-field.md) - Email input for newsletter

## Implementation

```typescript
// components/organisms/cta.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CTAAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "secondary";
}

interface CTAProps {
  /** Main headline */
  title: string;
  /** Supporting description */
  description?: string;
  /** Primary action */
  primaryAction?: CTAAction;
  /** Secondary action */
  secondaryAction?: CTAAction;
  /** Show email input (newsletter style) */
  showEmailInput?: boolean;
  /** Email placeholder */
  emailPlaceholder?: string;
  /** Email submit handler */
  onEmailSubmit?: (email: string) => Promise<void>;
  /** Layout variant */
  variant?: "default" | "centered" | "split" | "banner" | "gradient";
  /** Background style */
  background?: "none" | "muted" | "primary" | "gradient";
  /** Additional visual element */
  visual?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

export function CTA({
  title,
  description,
  primaryAction,
  secondaryAction,
  showEmailInput = false,
  emailPlaceholder = "Enter your email",
  onEmailSubmit,
  variant = "default",
  background = "muted",
  visual,
  className,
}: CTAProps) {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !onEmailSubmit) return;

    setIsSubmitting(true);
    try {
      await onEmailSubmit(email);
      setIsSubmitted(true);
      setEmail("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const backgroundStyles = {
    none: "",
    muted: "bg-muted",
    primary: "bg-primary text-primary-foreground",
    gradient:
      "bg-gradient-to-br from-primary/90 to-primary text-primary-foreground",
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Banner variant
  if (variant === "banner") {
    return (
      <section
        className={cn(
          "py-4 px-4",
          backgroundStyles[background],
          className
        )}
      >
        <div className="container">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5" />
              <p className="font-medium">{title}</p>
            </div>
            {primaryAction && (
              <Button
                variant={background === "primary" ? "secondary" : "default"}
                size="sm"
                asChild
              >
                <Link href={primaryAction.href}>
                  {primaryAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Split variant
  if (variant === "split") {
    return (
      <section className={cn("py-20 lg:py-32", className)}>
        <div className="container">
          <div
            className={cn(
              "grid lg:grid-cols-2 gap-12 items-center rounded-2xl p-8 lg:p-12",
              backgroundStyles[background]
            )}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {title}
              </h2>
              {description && (
                <p
                  className={cn(
                    "text-lg",
                    background === "primary" || background === "gradient"
                      ? "text-primary-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {description}
                </p>
              )}

              {/* Actions or Email Form */}
              {showEmailInput ? (
                <form
                  onSubmit={handleEmailSubmit}
                  className="flex gap-3 max-w-md"
                >
                  <Input
                    type="email"
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={cn(
                      "flex-1",
                      (background === "primary" || background === "gradient") &&
                        "bg-white/10 border-white/20 placeholder:text-white/60"
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={isSubmitting || isSubmitted}
                    variant={background === "primary" ? "secondary" : "default"}
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isSubmitted ? (
                      "Subscribed!"
                    ) : (
                      "Subscribe"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {primaryAction && (
                    <Button
                      size="lg"
                      variant={background === "primary" ? "secondary" : "default"}
                      asChild
                    >
                      <Link href={primaryAction.href}>
                        {primaryAction.label}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  {secondaryAction && (
                    <Button
                      size="lg"
                      variant="outline"
                      className={cn(
                        (background === "primary" || background === "gradient") &&
                          "border-white/30 text-white hover:bg-white/10"
                      )}
                      asChild
                    >
                      <Link href={secondaryAction.href}>
                        {secondaryAction.label}
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </motion.div>

            {visual && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                {visual}
              </motion.div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // Centered/Default variant
  return (
    <section
      className={cn(
        "py-20 lg:py-32",
        variant === "gradient" && "relative overflow-hidden",
        className
      )}
    >
      {variant === "gradient" && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      )}

      <div className="container relative">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className={cn(
            "text-center max-w-3xl mx-auto",
            background !== "none" && "rounded-2xl p-8 lg:p-16",
            backgroundStyles[background]
          )}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl mb-6">
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "text-lg mb-8 max-w-2xl mx-auto",
                background === "primary" || background === "gradient"
                  ? "text-primary-foreground/80"
                  : "text-muted-foreground"
              )}
            >
              {description}
            </p>
          )}

          {/* Actions or Email Form */}
          {showEmailInput ? (
            <form
              onSubmit={handleEmailSubmit}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <Input
                type="email"
                placeholder={emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={cn(
                  "flex-1",
                  (background === "primary" || background === "gradient") &&
                    "bg-white/10 border-white/20 placeholder:text-white/60"
                )}
              />
              <Button
                type="submit"
                disabled={isSubmitting || isSubmitted}
                variant={background === "primary" ? "secondary" : "default"}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isSubmitted ? (
                  "Subscribed!"
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {primaryAction && (
                <Button
                  size="lg"
                  variant={background === "primary" ? "secondary" : "default"}
                  asChild
                >
                  <Link href={primaryAction.href}>
                    {primaryAction.label}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              {secondaryAction && (
                <Button
                  size="lg"
                  variant="outline"
                  className={cn(
                    (background === "primary" || background === "gradient") &&
                      "border-white/30 text-white hover:bg-white/10"
                  )}
                  asChild
                >
                  <Link href={secondaryAction.href}>
                    {secondaryAction.label}
                  </Link>
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
```

### Key Implementation Notes

1. **Multiple Variants**: Banner, split, centered, gradient layouts
2. **Email Capture**: Built-in newsletter signup form
3. **Background Options**: Muted, primary, gradient backgrounds
4. **Visual Support**: Optional image/illustration slot

## Variants

### Centered CTA

```tsx
<CTA
  title="Ready to get started?"
  description="Join thousands of teams already using our platform."
  primaryAction={{ label: "Start Free Trial", href: "/signup" }}
  secondaryAction={{ label: "Contact Sales", href: "/contact" }}
  background="muted"
/>
```

### Split CTA with Visual

```tsx
<CTA
  variant="split"
  title="Start building today"
  description="Get up and running in minutes."
  primaryAction={{ label: "Get Started", href: "/signup" }}
  background="gradient"
  visual={<img src="/dashboard.png" alt="Dashboard" />}
/>
```

### Newsletter CTA

```tsx
<CTA
  title="Stay up to date"
  description="Get the latest news and updates."
  showEmailInput
  onEmailSubmit={async (email) => {
    await subscribeToNewsletter(email);
  }}
  background="primary"
/>
```

### Banner CTA

```tsx
<CTA
  variant="banner"
  title="New: AI-powered features now available!"
  primaryAction={{ label: "Learn More", href: "/ai" }}
  background="primary"
/>
```

## Accessibility

### Required Attributes

- Form inputs have labels
- Buttons have clear purpose
- Color contrast meets WCAG

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate to inputs/buttons |
| `Enter` | Submit form/activate link |

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | CTA section in normal display | Title, description, and action buttons visible |
| Email Input Empty | Newsletter form with no input | Input shows placeholder text |
| Email Input Focused | User focused on email field | Input has focus ring, placeholder may clear |
| Email Input Filled | User entered email address | Input shows entered text |
| Submitting | Email form being submitted | Button shows spinner, disabled state |
| Submitted | Email successfully submitted | Button text changes to "Subscribed!" |
| Primary Button Hover | Mouse over primary action | Button shows hover state with slight color shift |
| Secondary Button Hover | Mouse over secondary action | Outline button shows hover background |
| Banner Variant | Compact horizontal layout | Single line with icon, text, and button inline |
| Split Variant | Two-column layout with visual | Content left, visual element right |
| Gradient Background | Gradient background applied | Smooth color transition from primary to secondary |
| Viewport Enter | Section scrolls into view | Fade-in and slide-up animation triggers |

## Anti-patterns

### 1. Missing Primary Action

```tsx
// Bad: CTA without any action
<CTA
  title="Ready to get started?"
  description="Join thousands of users."
/>

// Good: Always provide at least one action
<CTA
  title="Ready to get started?"
  description="Join thousands of users."
  primaryAction={{ label: "Sign Up", href: "/signup" }}
/>
```

### 2. Email Form Without Handler

```tsx
// Bad: Email input shown but no submit handler
<CTA
  title="Stay updated"
  showEmailInput={true}
  // Missing onEmailSubmit!
/>

// Good: Provide submit handler for email form
<CTA
  title="Stay updated"
  showEmailInput={true}
  onEmailSubmit={async (email) => {
    await subscribeToNewsletter(email);
  }}
/>
```

### 3. Conflicting Action Types

```tsx
// Bad: Both buttons and email form
<CTA
  title="Get started"
  primaryAction={{ label: "Sign Up", href: "/signup" }}
  secondaryAction={{ label: "Learn More", href: "/about" }}
  showEmailInput={true}  // Confusing - which should user click?
/>

// Good: Choose one action pattern
<CTA
  title="Get started"
  showEmailInput={true}
  onEmailSubmit={handleSubscribe}
/>

// Or
<CTA
  title="Get started"
  primaryAction={{ label: "Sign Up", href: "/signup" }}
  secondaryAction={{ label: "Learn More", href: "/about" }}
/>
```

### 4. Poor Contrast with Background

```tsx
// Bad: Primary background with default buttons
<CTA
  title="Subscribe now"
  background="primary"
  primaryAction={{ label: "Subscribe", href: "/sub" }}  // Primary on primary!
/>

// Good: Use contrasting button variants
<CTA
  title="Subscribe now"
  background="primary"
  primaryAction={{ label: "Subscribe", href: "/sub", variant: "secondary" }}
/>
```

## Related Skills

### Composes From
- [molecules/form-field](../molecules/form-field.md)

### Composes Into
- [templates/landing-page](../templates/landing-page.md)
- [templates/marketing-layout](../templates/marketing-layout.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Four layout variants
- Newsletter form support
