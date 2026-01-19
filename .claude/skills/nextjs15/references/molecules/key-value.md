---
id: m-key-value
name: Key Value
version: 2.0.0
layer: L2
category: data
description: Key-value pair display with copy-to-clipboard and truncation support
tags: [key-value, metadata, details, copy, clipboard]
formula: "KeyValue = Label(a-display-text) + Value(a-display-text) + CopyButton(a-input-button)"
composes:
  - ../atoms/display-text.md
  - ../atoms/input-button.md
dependencies:
  lucide-react: "^0.460.0"
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Key Value

## Overview

The Key Value molecule displays labeled data pairs with optional copy-to-clipboard functionality, value truncation, and custom formatting. Ideal for metadata displays, detail views, and configuration panels.

## When to Use

Use this skill when:
- Displaying metadata (IDs, timestamps, statuses)
- Building detail/info panels
- Showing configuration values
- Creating invoice/receipt details

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         KeyValue                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────┐  ┌─────────────────────────┐  ┌────────┐  │
│  │       Key        │  │          Value          │  │  Copy  │  │
│  │  (a-display-     │  │      (a-display-        │  │ Button │  │
│  │      text)       │  │         text)           │  │(a-input│  │
│  │                  │  │                         │  │  -btn) │  │
│  │   "Order ID"     │  │  "ord_1234567890"       │  │   📋   │  │
│  │                  │  │                         │  │        │  │
│  └──────────────────┘  └─────────────────────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘

Vertical Layout:
┌─────────────────────────────────────────────────────────────────┐
│  Order ID                                                  📋   │
│  ord_1234567890                                                 │
├─────────────────────────────────────────────────────────────────┤
│  Status                                                    📋   │
│  Completed                                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [display-text](../atoms/display-text.md) - Key and value labels
- [input-button](../atoms/input-button.md) - Copy button
- [display-icon](../atoms/display-icon.md) - Copy indicator
- [interactive-tooltip](../atoms/interactive-tooltip.md) - Copy feedback

## Implementation

```typescript
// components/ui/key-value.tsx
"use client";

import * as React from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KeyValueProps {
  /** The label/key to display */
  label: string;
  /** The value to display */
  value: React.ReactNode;
  /** Enable copy to clipboard */
  copyable?: boolean;
  /** Value to copy (defaults to value if string) */
  copyValue?: string;
  /** Show link icon and make value clickable */
  href?: string;
  /** Open link in new tab */
  external?: boolean;
  /** Truncate long values */
  truncate?: boolean;
  /** Maximum characters before truncation */
  maxLength?: number;
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Monospace font for value */
  mono?: boolean;
  /** Additional class names */
  className?: string;
}

const sizeStyles = {
  sm: {
    label: "text-xs",
    value: "text-sm",
    icon: "h-3 w-3",
    button: "h-6 w-6",
  },
  md: {
    label: "text-sm",
    value: "text-base",
    icon: "h-4 w-4",
    button: "h-7 w-7",
  },
  lg: {
    label: "text-base",
    value: "text-lg",
    icon: "h-5 w-5",
    button: "h-8 w-8",
  },
};

export function KeyValue({
  label,
  value,
  copyable = false,
  copyValue,
  href,
  external = false,
  truncate = false,
  maxLength = 50,
  direction = "vertical",
  size = "md",
  mono = false,
  className,
}: KeyValueProps) {
  const [copied, setCopied] = React.useState(false);
  const styles = sizeStyles[size];

  const stringValue = typeof value === "string" ? value : String(value);
  const textToCopy = copyValue ?? stringValue;
  
  const shouldTruncate = truncate && stringValue.length > maxLength;
  const displayValue = shouldTruncate
    ? `${stringValue.slice(0, maxLength)}...`
    : value;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const renderValue = () => {
    const valueContent = (
      <span
        className={cn(
          styles.value,
          mono && "font-mono",
          shouldTruncate && "cursor-help"
        )}
        title={shouldTruncate ? stringValue : undefined}
      >
        {displayValue}
      </span>
    );

    if (href) {
      return (
        <a
          href={href}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={cn(
            "inline-flex items-center gap-1 text-primary hover:underline",
            styles.value,
            mono && "font-mono"
          )}
        >
          {displayValue}
          {external && <ExternalLink className={styles.icon} />}
        </a>
      );
    }

    return valueContent;
  };

  return (
    <div
      className={cn(
        direction === "horizontal"
          ? "flex items-center justify-between gap-4"
          : "flex flex-col gap-1",
        className
      )}
    >
      <dt className={cn(styles.label, "text-muted-foreground font-medium")}>
        {label}
      </dt>
      <dd className="flex items-center gap-2">
        {renderValue()}
        
        {copyable && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(styles.button, "p-0")}
                  onClick={handleCopy}
                  aria-label={copied ? "Copied" : `Copy ${label}`}
                >
                  {copied ? (
                    <Check className={cn(styles.icon, "text-green-500")} />
                  ) : (
                    <Copy className={cn(styles.icon, "text-muted-foreground")} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {copied ? "Copied!" : "Copy to clipboard"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </dd>
    </div>
  );
}
```

```typescript
// components/ui/key-value-list.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { KeyValue } from "./key-value";

interface KeyValueItem {
  label: string;
  value: React.ReactNode;
  copyable?: boolean;
  copyValue?: string;
  href?: string;
  external?: boolean;
  mono?: boolean;
}

interface KeyValueListProps {
  /** List of key-value items */
  items: KeyValueItem[];
  /** Layout direction for items */
  direction?: "horizontal" | "vertical";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Number of columns for grid layout */
  columns?: 1 | 2 | 3 | 4;
  /** Dividers between items */
  dividers?: boolean;
  /** Additional class names */
  className?: string;
}

export function KeyValueList({
  items,
  direction = "vertical",
  size = "md",
  columns = 1,
  dividers = false,
  className,
}: KeyValueListProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <dl
      className={cn(
        "grid gap-4",
        gridCols[columns],
        dividers && "divide-y [&>div]:pt-4 [&>div:first-child]:pt-0",
        className
      )}
    >
      {items.map((item, index) => (
        <KeyValue
          key={item.label}
          {...item}
          direction={direction}
          size={size}
        />
      ))}
    </dl>
  );
}
```

```typescript
// components/ui/key-value-card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyValueList, KeyValueItem } from "./key-value-list";

interface KeyValueCardProps {
  /** Card title */
  title?: string;
  /** Key-value items */
  items: KeyValueItem[];
  /** Layout direction */
  direction?: "horizontal" | "vertical";
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  /** Additional class names */
  className?: string;
}

export function KeyValueCard({
  title,
  items,
  direction = "horizontal",
  columns = 1,
  className,
}: KeyValueCardProps) {
  return (
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={!title ? "pt-6" : undefined}>
        <KeyValueList
          items={items}
          direction={direction}
          columns={columns}
          dividers={direction === "horizontal"}
        />
      </CardContent>
    </Card>
  );
}
```

### Key Implementation Notes

1. **Clipboard API**: Uses modern async clipboard API with fallback
2. **Truncation**: Shows full value on hover via title attribute
3. **Flexible Layout**: Supports both horizontal and vertical layouts
4. **Semantic HTML**: Uses `<dl>`, `<dt>`, `<dd>` for proper semantics

## Variants

### Basic Key-Value

```tsx
<KeyValue label="Status" value="Active" />
```

### Copyable Value

```tsx
<KeyValue
  label="API Key"
  value="sk_live_abc123..."
  copyable
  copyValue="sk_live_abc123def456"
  mono
  truncate
/>
```

### Linked Value

```tsx
<KeyValue
  label="Documentation"
  value="View Docs"
  href="https://docs.example.com"
  external
/>
```

### Horizontal Layout

```tsx
<KeyValue
  label="Price"
  value="$99.00"
  direction="horizontal"
/>
```

### Key-Value List

```tsx
<KeyValueList
  items={[
    { label: "Order ID", value: "ORD-12345", copyable: true, mono: true },
    { label: "Date", value: "Jan 15, 2025" },
    { label: "Status", value: <Badge>Completed</Badge> },
    { label: "Total", value: "$299.00" },
  ]}
  direction="horizontal"
  columns={2}
/>
```

### Key-Value Card

```tsx
<KeyValueCard
  title="Order Details"
  items={[
    { label: "Customer", value: "John Doe" },
    { label: "Email", value: "john@example.com", copyable: true },
    { label: "Phone", value: "+1 (555) 123-4567" },
  ]}
  direction="horizontal"
/>
```

## States

| State | Copy Icon | Value | Feedback |
|-------|-----------|-------|----------|
| Default | Copy icon | normal | - |
| Hover (copyable) | highlighted | normal | tooltip |
| Copied | Check icon | normal | "Copied!" tooltip |
| Truncated | Copy icon | ellipsis | full value on hover |
| Linked | External icon | primary color | underline on hover |

## Accessibility

### Required ARIA Attributes

- Uses semantic `<dl>`, `<dt>`, `<dd>` elements
- `aria-label` on copy button
- Link has proper `rel` for external links

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate to copyable/linked values |
| `Enter/Space` | Copy value or follow link |

### Screen Reader Announcements

- Label read as term
- Value read as definition
- Copy button announces action and state

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0",
    "@radix-ui/react-tooltip": "^1.1.0"
  }
}
```

### Installation

```bash
npm install lucide-react @radix-ui/react-tooltip
```

## Examples

### User Profile Details

```tsx
import { KeyValueCard } from "@/components/ui/key-value-card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserProfileDetails({ user }) {
  return (
    <KeyValueCard
      title="Profile Information"
      items={[
        {
          label: "Name",
          value: (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
              {user.name}
            </div>
          ),
        },
        { label: "Email", value: user.email, copyable: true },
        { label: "Role", value: <Badge>{user.role}</Badge> },
        { label: "Member Since", value: formatDate(user.createdAt) },
        { label: "User ID", value: user.id, copyable: true, mono: true, truncate: true },
      ]}
      columns={2}
    />
  );
}
```

### API Credentials Display

```tsx
export function APICredentials({ credentials }) {
  return (
    <div className="space-y-4">
      <KeyValue
        label="API Key"
        value={maskString(credentials.apiKey)}
        copyable
        copyValue={credentials.apiKey}
        mono
        size="lg"
      />
      <KeyValue
        label="API Secret"
        value={maskString(credentials.apiSecret)}
        copyable
        copyValue={credentials.apiSecret}
        mono
        size="lg"
      />
      <KeyValue
        label="Webhook URL"
        value={credentials.webhookUrl}
        copyable
        href={credentials.webhookUrl}
        external
        truncate
        maxLength={40}
      />
    </div>
  );
}
```

### Order Summary

```tsx
export function OrderSummary({ order }) {
  return (
    <KeyValueList
      items={[
        { label: "Subtotal", value: formatCurrency(order.subtotal) },
        { label: "Shipping", value: formatCurrency(order.shipping) },
        { label: "Tax", value: formatCurrency(order.tax) },
        { label: "Total", value: <strong>{formatCurrency(order.total)}</strong> },
      ]}
      direction="horizontal"
      dividers
    />
  );
}
```

### System Information

```tsx
export function SystemInfo() {
  return (
    <KeyValueCard
      title="System Status"
      items={[
        { label: "Version", value: "v2.4.1" },
        { label: "Environment", value: <Badge variant="secondary">Production</Badge> },
        { label: "Region", value: "us-east-1" },
        { label: "Uptime", value: "99.99%" },
        { label: "Last Deploy", value: "2 hours ago" },
        {
          label: "Documentation",
          value: "View Docs",
          href: "/docs",
        },
      ]}
      columns={3}
    />
  );
}
```

## Anti-patterns

### Missing Semantic Structure

```tsx
// Bad - using divs instead of description list
<div>
  <div>Label</div>
  <div>Value</div>
</div>

// Good - semantic HTML
<dl>
  <KeyValue label="Label" value="Value" />
</dl>
```

### Inconsistent Direction

```tsx
// Bad - mixing directions in same list
<KeyValueList items={items} direction="horizontal" />
<KeyValue label="Extra" value="Value" direction="vertical" />

// Good - consistent direction
<KeyValueList items={[...items, { label: "Extra", value: "Value" }]} direction="horizontal" />
```

### Missing Copy Feedback

```tsx
// Bad - no feedback on copy
<button onClick={() => navigator.clipboard.writeText(value)}>
  Copy
</button>

// Good - visual and text feedback
<KeyValue value={value} copyable /> // Shows check icon and tooltip
```

## Related Skills

### Composes From
- [atoms/display-text](../atoms/display-text.md) - Labels and values
- [atoms/input-button](../atoms/input-button.md) - Copy action
- [atoms/interactive-tooltip](../atoms/interactive-tooltip.md) - Copy feedback

### Composes Into
- [organisms/product-card](../organisms/product-card.md) - Product specs
- [organisms/checkout-summary](../organisms/checkout-summary.md) - Order details
- [templates/detail-page](../templates/detail-page.md) - Detail views

### Alternatives
- [molecules/table-row](./table-row.md) - For tabular data
- Raw text - For simple non-interactive displays

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with copy-to-clipboard
- KeyValueList and KeyValueCard variants
- Truncation and link support
