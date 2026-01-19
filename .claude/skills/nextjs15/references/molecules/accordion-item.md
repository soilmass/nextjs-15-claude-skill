---
id: m-accordion-item
name: Accordion Item
version: 2.0.0
layer: L2
category: interactive
description: Collapsible content section with Radix UI primitives
tags: [accordion, collapse, expand, faq, disclosure]
formula: "AccordionItem = InputButton(a-input-button) + DisplayIcon(a-display-icon) + DisplayText(a-display-text)"
composes:
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
dependencies:
  "@radix-ui/react-accordion": "^1.2.1"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Accordion Item

## Overview

The Accordion molecule provides collapsible content sections with smooth animations. Built on Radix UI Accordion for accessibility, supports single or multiple open items, and animated expand/collapse transitions.

## When to Use

Use this skill when:
- Building FAQ sections
- Creating collapsible sidebars
- Organizing long content into sections
- Building settings panels with expandable groups

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      AccordionItem                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────── Trigger ───────────────────────────┐  │
│  │  ┌───────────────────────────────────────┐  ┌───────────┐ │  │
│  │  │           Title                       │  │  Chevron  │ │  │
│  │  │        (a-display-text)               │  │(a-display │ │  │
│  │  │                                       │  │  -icon)   │ │  │
│  │  │     "Is this accessible?"             │  │    ▼      │ │  │
│  │  └───────────────────────────────────────┘  └───────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────── Content ───────────────────────────┐  │
│  │                                                           │  │
│  │  Yes. It adheres to the WAI-ARIA design pattern.         │  │
│  │  (a-display-text)                                        │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Multiple Open:
┌─────────────────────────────────────────────────────────────────┐
│  Is this accessible?                                        ▲  │
│  ├─ Yes. It adheres to the WAI-ARIA design pattern.            │
├─────────────────────────────────────────────────────────────────┤
│  Can I customize the styling?                               ▼  │
├─────────────────────────────────────────────────────────────────┤
│  Is it animated?                                            ▲  │
│  ├─ Yes! With CSS transitions for smooth expand/collapse.     │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [input-button](../atoms/input-button.md) - Trigger button
- [display-icon](../atoms/display-icon.md) - Chevron icon
- [display-text](../atoms/display-text.md) - Title and content

## Implementation

```typescript
// components/ui/accordion.tsx
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all",
        "hover:underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "[&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all",
      "data-[state=closed]:animate-accordion-up",
      "data-[state=open]:animate-accordion-down"
    )}
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = "AccordionContent";

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
```

```css
/* Add to tailwind.config.ts */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
};
```

```typescript
// components/ui/accordion-variants.tsx
"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Card-style Accordion
export function AccordionCard({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root className={cn("space-y-2", className)} {...props}>
      {children}
    </AccordionPrimitive.Root>
  );
}

export function AccordionCardItem({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "rounded-lg border bg-card overflow-hidden",
        "data-[state=open]:ring-1 data-[state=open]:ring-ring",
        className
      )}
      {...props}
    >
      {children}
    </AccordionPrimitive.Item>
  );
}

export function AccordionCardTrigger({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header>
      <AccordionPrimitive.Trigger
        className={cn(
          "flex w-full items-center justify-between p-4 font-medium",
          "hover:bg-muted/50 transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
          className
        )}
        {...props}
      >
        {children}
        <div className="shrink-0 ml-4">
          <Plus className="h-4 w-4 transition-transform duration-200 [[data-state=open]_&]:hidden" />
          <Minus className="h-4 w-4 transition-transform duration-200 [[data-state=closed]_&]:hidden" />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionCardContent({
  children,
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "overflow-hidden text-sm",
        "data-[state=closed]:animate-accordion-up",
        "data-[state=open]:animate-accordion-down"
      )}
      {...props}
    >
      <div className={cn("border-t p-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}
```

### Key Implementation Notes

1. **Radix Animation**: Uses CSS variables from Radix for smooth height animations
2. **Single vs Multiple**: Use `type="single"` or `type="multiple"` on Accordion root

## Variants

### Single Open (Default)

```tsx
<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content for section 1</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>Content for section 2</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Multiple Open

```tsx
<Accordion type="multiple">
  <AccordionItem value="item-1">
    <AccordionTrigger>Section 1</AccordionTrigger>
    <AccordionContent>Content for section 1</AccordionContent>
  </AccordionItem>
  <AccordionItem value="item-2">
    <AccordionTrigger>Section 2</AccordionTrigger>
    <AccordionContent>Content for section 2</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Default Open

```tsx
<Accordion type="single" defaultValue="item-1">
  <AccordionItem value="item-1">
    <AccordionTrigger>Open by default</AccordionTrigger>
    <AccordionContent>This section is open initially</AccordionContent>
  </AccordionItem>
</Accordion>
```

### Card Style

```tsx
<AccordionCard type="single" collapsible>
  <AccordionCardItem value="item-1">
    <AccordionCardTrigger>Card Section 1</AccordionCardTrigger>
    <AccordionCardContent>Card content 1</AccordionCardContent>
  </AccordionCardItem>
</AccordionCard>
```

### With Icons

```tsx
<AccordionItem value="settings">
  <AccordionTrigger>
    <span className="flex items-center gap-2">
      <Settings className="h-4 w-4" />
      Settings
    </span>
  </AccordionTrigger>
  <AccordionContent>Settings content</AccordionContent>
</AccordionItem>
```

## States

| State | Trigger | Chevron | Content | Border |
|-------|---------|---------|---------|--------|
| Collapsed | normal | down | hidden (h=0) | bottom |
| Expanded | normal | up (180°) | visible | bottom |
| Hover | underline | - | - | - |
| Focus | ring-2 | - | - | - |
| Disabled | muted | muted | hidden | muted |

## Accessibility

### Required ARIA Attributes

- `role="region"` on content (automatic)
- `aria-expanded` on trigger (automatic)
- `aria-controls` linking trigger to content (automatic)
- Heading level via AccordionPrimitive.Header

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter/Space` | Toggle section |
| `Arrow Down` | Focus next trigger |
| `Arrow Up` | Focus previous trigger |
| `Home` | Focus first trigger |
| `End` | Focus last trigger |

### Screen Reader Announcements

- Trigger announced as button with expanded/collapsed state
- Content region associated with trigger
- State changes announced

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-accordion": "^1.2.1",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install @radix-ui/react-accordion lucide-react
```

## Examples

### FAQ Section

```tsx
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day money-back guarantee on all purchases.",
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 5-7 business days.",
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to over 50 countries worldwide.",
  },
];

export function FAQSection() {
  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
      <Accordion type="single" collapsible className="w-full max-w-2xl">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
```

### Settings Panel

```tsx
import {
  AccordionCard,
  AccordionCardItem,
  AccordionCardTrigger,
  AccordionCardContent,
} from "@/components/ui/accordion-variants";
import { User, Bell, Lock, Palette } from "lucide-react";

export function SettingsPanel() {
  return (
    <AccordionCard type="multiple" className="w-full max-w-lg">
      <AccordionCardItem value="profile">
        <AccordionCardTrigger>
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile Settings
          </span>
        </AccordionCardTrigger>
        <AccordionCardContent>
          <ProfileSettingsForm />
        </AccordionCardContent>
      </AccordionCardItem>

      <AccordionCardItem value="notifications">
        <AccordionCardTrigger>
          <span className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </span>
        </AccordionCardTrigger>
        <AccordionCardContent>
          <NotificationSettingsForm />
        </AccordionCardContent>
      </AccordionCardItem>

      <AccordionCardItem value="security">
        <AccordionCardTrigger>
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Security
          </span>
        </AccordionCardTrigger>
        <AccordionCardContent>
          <SecuritySettingsForm />
        </AccordionCardContent>
      </AccordionCardItem>
    </AccordionCard>
  );
}
```

### Controlled Accordion

```tsx
import { useState } from "react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export function ControlledAccordion() {
  const [openItem, setOpenItem] = useState<string | undefined>("item-1");

  const handleValueChange = (value: string) => {
    // Custom logic before changing
    if (value === "item-3" && !hasPermission) {
      toast.error("You need permission to view this section");
      return;
    }
    setOpenItem(value);
  };

  return (
    <Accordion
      type="single"
      collapsible
      value={openItem}
      onValueChange={handleValueChange}
    >
      <AccordionItem value="item-1">
        <AccordionTrigger>Public Section</AccordionTrigger>
        <AccordionContent>Anyone can view this</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>
          Restricted Section
          <Badge variant="secondary" className="ml-2">Requires Permission</Badge>
        </AccordionTrigger>
        <AccordionContent>Restricted content</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
```

## Anti-patterns

### Nesting Accordions

```tsx
// Bad - confusing nested accordions
<Accordion>
  <AccordionItem>
    <AccordionTrigger>Parent</AccordionTrigger>
    <AccordionContent>
      <Accordion> {/* Nested accordion */}
        <AccordionItem>...</AccordionItem>
      </Accordion>
    </AccordionContent>
  </AccordionItem>
</Accordion>

// Good - use flat structure or tree view
<Accordion type="multiple">
  <AccordionItem value="parent">...</AccordionItem>
  <AccordionItem value="child-1" className="ml-4">...</AccordionItem>
  <AccordionItem value="child-2" className="ml-4">...</AccordionItem>
</Accordion>
```

### Putting Interactive Content Before Trigger

```tsx
// Bad - button before trigger
<AccordionItem>
  <div className="flex justify-between">
    <Button>Action</Button> {/* Confusing focus order */}
    <AccordionTrigger>Title</AccordionTrigger>
  </div>
</AccordionItem>

// Good - interactive elements inside content
<AccordionItem>
  <AccordionTrigger>Title</AccordionTrigger>
  <AccordionContent>
    <Button>Action</Button>
  </AccordionContent>
</AccordionItem>
```

### Non-Collapsible Single Accordion

```tsx
// Bad - can't close the open item
<Accordion type="single"> {/* Missing collapsible */}
  ...
</Accordion>

// Good - allow closing
<Accordion type="single" collapsible>
  ...
</Accordion>
```

## Related Skills

### Composes From
- [atoms/input-button](../atoms/input-button.md) - Trigger
- [atoms/display-icon](../atoms/display-icon.md) - Chevron

### Composes Into
- [organisms/faq](../organisms/faq.md) - FAQ sections
- [organisms/sidebar](../organisms/sidebar.md) - Collapsible sidebar sections
- [organisms/settings-form](../organisms/settings-form.md) - Settings groups

### Alternatives
- [molecules/tabs](./tabs.md) - For switching views without stacking
- Disclosure pattern - For single expand/collapse

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Radix UI
- Single and multiple modes
- Card variant with plus/minus icons
- Smooth height animations
