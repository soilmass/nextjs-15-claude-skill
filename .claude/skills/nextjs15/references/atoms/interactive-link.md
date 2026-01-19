---
id: a-interactive-link
name: Link
version: 2.0.0
layer: L1
category: interactive
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: Enhanced Next.js Link with external detection and prefetch control
tags: [link, anchor, navigation, next-link, external]
dependencies:
  next: "^15.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Link

## Overview

The Link atom extends Next.js Link with automatic external link detection, accessibility enhancements, and consistent styling. Handles internal navigation with prefetching and external links with proper security attributes.

## When to Use

Use this skill when:
- Creating navigation links within the application
- Linking to external websites
- Building inline text links in content
- Creating download links for files

## Implementation

```typescript
// components/ui/link.tsx
import * as React from "react";
import NextLink, { LinkProps as NextLinkProps } from "next/link";
import { ExternalLink } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const linkVariants = cva(
  "inline-flex items-center gap-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "text-primary underline-offset-4 hover:underline",
        muted: "text-muted-foreground hover:text-foreground",
        ghost: "text-foreground hover:text-primary",
        nav: "text-muted-foreground hover:text-foreground no-underline",
        inline: "text-primary underline underline-offset-4 hover:text-primary/80",
        button: "text-primary-foreground bg-primary px-4 py-2 rounded-md hover:bg-primary/90",
      },
      size: {
        sm: "text-sm",
        md: "text-base",
        lg: "text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface LinkProps
  extends Omit<NextLinkProps, "href">,
    VariantProps<typeof linkVariants> {
  href: string;
  /** Force external link behavior */
  external?: boolean;
  /** Show external link icon */
  showExternalIcon?: boolean;
  /** Open in new tab */
  newTab?: boolean;
  /** Disable link */
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

function isExternalUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//");
}

function isEmailOrTel(url: string): boolean {
  return url.startsWith("mailto:") || url.startsWith("tel:");
}

function isDownload(url: string): boolean {
  const extensions = [".pdf", ".zip", ".doc", ".docx", ".xls", ".xlsx", ".csv"];
  return extensions.some((ext) => url.toLowerCase().endsWith(ext));
}

export const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      href,
      external,
      showExternalIcon = true,
      newTab,
      disabled,
      variant,
      size,
      className,
      children,
      prefetch,
      ...props
    },
    ref
  ) => {
    const isExternal = external ?? isExternalUrl(href);
    const isSpecialLink = isEmailOrTel(href);
    const isFileDownload = isDownload(href);
    const opensNewTab = newTab ?? (isExternal && !isSpecialLink);

    // External or special links use regular anchor
    if (isExternal || isSpecialLink || isFileDownload) {
      return (
        <a
          ref={ref}
          href={disabled ? undefined : href}
          target={opensNewTab ? "_blank" : undefined}
          rel={opensNewTab ? "noopener noreferrer" : undefined}
          download={isFileDownload ? true : undefined}
          aria-disabled={disabled}
          className={cn(
            linkVariants({ variant, size }),
            disabled && "pointer-events-none opacity-50",
            className
          )}
          {...props}
        >
          {children}
          {isExternal && showExternalIcon && !isSpecialLink && (
            <ExternalLink className="h-3 w-3 shrink-0" aria-hidden="true" />
          )}
        </a>
      );
    }

    // Internal links use Next.js Link
    return (
      <NextLink
        ref={ref}
        href={disabled ? "#" : href}
        prefetch={prefetch}
        aria-disabled={disabled}
        className={cn(
          linkVariants({ variant, size }),
          disabled && "pointer-events-none opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </NextLink>
    );
  }
);
Link.displayName = "Link";
```

```typescript
// components/ui/breadcrumb-link.tsx
import * as React from "react";
import { Link } from "./link";
import { cn } from "@/lib/utils";

interface BreadcrumbLinkProps {
  href?: string;
  active?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function BreadcrumbLink({
  href,
  active,
  children,
  className,
}: BreadcrumbLinkProps) {
  if (active || !href) {
    return (
      <span
        aria-current={active ? "page" : undefined}
        className={cn(
          "text-sm",
          active ? "text-foreground font-medium" : "text-muted-foreground",
          className
        )}
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      variant="muted"
      size="sm"
      className={cn("hover:text-foreground", className)}
    >
      {children}
    </Link>
  );
}
```

```typescript
// components/ui/skip-link.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({
  href = "#main-content",
  children = "Skip to main content",
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "bg-background text-foreground px-4 py-2 rounded-md border shadow-lg",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
    >
      {children}
    </a>
  );
}
```

### Key Implementation Notes

1. **External Detection**: Automatically detects external URLs and adds security attributes (`rel="noopener noreferrer"`)
2. **Next.js Prefetch**: Uses Next.js Link for internal routes to enable prefetching and client-side navigation

## Variants

### Style Variants

```tsx
<Link href="/about" variant="default">Default link</Link>
<Link href="/about" variant="muted">Muted link</Link>
<Link href="/about" variant="ghost">Ghost link</Link>
<Link href="/about" variant="nav">Navigation link</Link>
<Link href="/about" variant="inline">Inline content link</Link>
<Link href="/about" variant="button">Button-styled link</Link>
```

### Size Variants

```tsx
<Link href="/about" size="sm">Small link</Link>
<Link href="/about" size="md">Medium link</Link>
<Link href="/about" size="lg">Large link</Link>
```

### External Links

```tsx
// Auto-detected
<Link href="https://github.com">GitHub</Link>

// Forced external
<Link href="/api/download" external>Download API</Link>

// Without icon
<Link href="https://example.com" showExternalIcon={false}>
  Example
</Link>
```

### Special Links

```tsx
// Email
<Link href="mailto:hello@example.com">Contact us</Link>

// Phone
<Link href="tel:+1234567890">Call us</Link>

// Download
<Link href="/files/report.pdf">Download Report</Link>
```

## States

| State | Text Color | Decoration | Ring | Cursor |
|-------|------------|------------|------|--------|
| Default | primary | underline-offset | none | pointer |
| Hover | primary/80 | underline | none | pointer |
| Focus | primary | underline | ring-2 | pointer |
| Active | primary | underline | ring-2 | pointer |
| Disabled | muted | none | none | not-allowed |
| Visited | primary | underline | none | pointer |

## Accessibility

### Required ARIA Attributes

- `aria-disabled="true"`: When link is disabled
- `aria-current="page"`: On active navigation links
- External links: Automatic `rel="noopener noreferrer"` for security

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus link |
| `Enter` | Activate link |
| `Shift+Tab` | Focus previous element |

### Screen Reader Announcements

- Link text read as interactive element
- "Opens in new tab" for external links (consider adding to text)
- External link icon has `aria-hidden="true"`

## Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "lucide-react": "^0.460.0",
    "class-variance-authority": "^0.7.1"
  }
}
```

### Installation

```bash
npm install lucide-react class-variance-authority
```

## Examples

### Basic Usage

```tsx
import { Link } from "@/components/ui/link";

export function Navigation() {
  return (
    <nav className="flex gap-4">
      <Link href="/" variant="nav">Home</Link>
      <Link href="/about" variant="nav">About</Link>
      <Link href="/contact" variant="nav">Contact</Link>
    </nav>
  );
}
```

### Inline Content Links

```tsx
import { Link } from "@/components/ui/link";

export function ArticleContent() {
  return (
    <p className="text-muted-foreground">
      Learn more about our{" "}
      <Link href="/privacy" variant="inline">privacy policy</Link>
      {" "}and{" "}
      <Link href="/terms" variant="inline">terms of service</Link>.
    </p>
  );
}
```

### External Links in Footer

```tsx
import { Link } from "@/components/ui/link";

export function Footer() {
  return (
    <footer className="flex gap-4">
      <Link href="https://twitter.com/example" variant="muted">
        Twitter
      </Link>
      <Link href="https://github.com/example" variant="muted">
        GitHub
      </Link>
      <Link href="https://discord.gg/example" variant="muted">
        Discord
      </Link>
    </footer>
  );
}
```

### Skip Link for Accessibility

```tsx
import { SkipLink } from "@/components/ui/skip-link";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <header>...</header>
      <main id="main-content">
        {children}
      </main>
    </>
  );
}
```

### Disabled Link

```tsx
import { Link } from "@/components/ui/link";

export function DisabledExample({ hasAccess }: { hasAccess: boolean }) {
  return (
    <Link
      href="/premium"
      disabled={!hasAccess}
      variant="default"
    >
      Premium Features
    </Link>
  );
}
```

### Button-Style Link

```tsx
import { Link } from "@/components/ui/link";

export function CTASection() {
  return (
    <div className="flex gap-4">
      <Link href="/signup" variant="button">
        Get Started
      </Link>
      <Link href="/demo" variant="ghost">
        Watch Demo
      </Link>
    </div>
  );
}
```

## Anti-patterns

### Using Button When Link is Appropriate

```tsx
// Bad - button for navigation
<button onClick={() => router.push("/about")}>About</button>

// Good - link for navigation
<Link href="/about">About</Link>
```

### Vague Link Text

```tsx
// Bad - non-descriptive
<Link href="/docs">Click here</Link>

// Good - descriptive link text
<Link href="/docs">View documentation</Link>
```

### Missing Security Attributes

```tsx
// Bad - external link without security
<a href="https://external.com" target="_blank">External</a>

// Good - Link component handles this automatically
<Link href="https://external.com">External</Link>
// Adds rel="noopener noreferrer" automatically
```

### Opening Internal Links in New Tab

```tsx
// Bad - internal links shouldn't open new tabs
<Link href="/about" newTab>About</Link>

// Good - let users control their navigation
<Link href="/about">About</Link>
```

## Related Skills

### Composes From
- [primitives/colors](../primitives/colors.md) - Link colors
- [primitives/typography](../primitives/typography.md) - Font styles

### Composes Into
- [molecules/nav-link](../molecules/nav-link.md) - Navigation with active state
- [molecules/breadcrumb](../molecules/breadcrumb.md) - Breadcrumb navigation
- [organisms/header](../organisms/header.md) - Site header navigation
- [organisms/footer](../organisms/footer.md) - Footer links

### Alternatives
- [input-button](./input-button.md) - For actions, not navigation
- Native `<a>` - For simple static links without enhancement

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Next.js Link integration
- Auto external link detection with security attributes
- CVA variants for styling
- BreadcrumbLink and SkipLink components
