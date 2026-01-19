---
id: o-footer
name: Footer
version: 2.0.0
layer: L3
category: navigation
description: Site footer with navigation links, social links, newsletter, and legal information
tags: [footer, navigation, social, newsletter, legal]
formula: "Footer = NavLink(m-nav-link)[] + FormField(m-form-field) + Button(a-button) + Input(a-input)"
composes:
  - ../molecules/nav-link.md
  - ../molecules/form-field.md
dependencies: [lucide-react]
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Footer

## Overview

The Footer organism provides a comprehensive site footer with multi-column navigation, social media links, newsletter signup, legal links, and copyright information. Supports multiple layout variants for different site types.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Footer (o-footer)                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Main Content (grid: 5-6 cols)                                    │  │
│  │  ┌─────────────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │  │
│  │  │  Brand Column   │  │  Section │  │  Section │  │  Section │    │  │
│  │  │  ├── Logo       │  │  ├── h3  │  │  ├── h3  │  │  ├── h3  │    │  │
│  │  │  ├── Desc       │  │  ├── Link│  │  ├── Link│  │  ├── Link│    │  │
│  │  │  └── Socials    │  │  ├── Link│  │  ├── Link│  │  ├── Link│    │  │
│  │  │      └── Icons  │  │  └── Link│  │  └── Link│  │  └── Link│    │  │
│  │  └─────────────────┘  └──────────┘  └──────────┘  └──────────┘    │  │
│  │                        NavLink(m-nav-link)[]                      │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Newsletter (optional)                                            │  │
│  │  ├── Title                                                        │  │
│  │  ├── Description                                                  │  │
│  │  └── FormField (m-form-field)                                     │  │
│  │      ├── Input (a-input) [email]                                  │  │
│  │      └── Button (a-button) [Subscribe]                            │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Bottom Bar                                                       │  │
│  │  ├── Copyright text                                               │  │
│  │  └── Legal Links: NavLink(m-nav-link)[]                           │  │
│  │      [Privacy] [Terms] [Cookies]                                  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## When to Use

Use this skill when:
- Building marketing site footers
- Creating e-commerce site footers
- Implementing SaaS product footers
- Building any site requiring navigation footer

## Composes

- [nav-link](../molecules/nav-link.md) - Footer navigation links
- [form-field](../molecules/form-field.md) - Newsletter signup

## Implementation

```typescript
// components/organisms/footer.tsx
import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface FooterProps {
  /** Logo component */
  logo?: React.ReactNode;
  /** Company description/tagline */
  description?: string;
  /** Navigation sections */
  sections: FooterSection[];
  /** Social media links */
  socialLinks?: SocialLink[];
  /** Show newsletter signup */
  showNewsletter?: boolean;
  /** Newsletter heading */
  newsletterTitle?: string;
  /** Newsletter description */
  newsletterDescription?: string;
  /** Newsletter submit handler */
  onNewsletterSubmit?: (email: string) => Promise<void>;
  /** Legal/bottom links */
  legalLinks?: FooterLink[];
  /** Copyright text */
  copyright?: string;
  /** Layout variant */
  variant?: "simple" | "standard" | "extended";
  /** Additional class names */
  className?: string;
}

export function Footer({
  logo,
  description,
  sections,
  socialLinks,
  showNewsletter = false,
  newsletterTitle = "Subscribe to our newsletter",
  newsletterDescription = "Get the latest updates and news delivered to your inbox.",
  onNewsletterSubmit,
  legalLinks,
  copyright,
  variant = "standard",
  className,
}: FooterProps) {
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !onNewsletterSubmit) return;

    setIsSubmitting(true);
    try {
      await onNewsletterSubmit(email);
      setSubmitted(true);
      setEmail("");
    } catch (error) {
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const copyrightText = copyright ?? `© ${currentYear} All rights reserved.`;

  if (variant === "simple") {
    return (
      <footer className={cn("border-t bg-background", className)}>
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {logo && <div>{logo}</div>}
            
            <nav className="flex flex-wrap justify-center gap-6">
              {sections.flatMap((section) =>
                section.links.map((link) => (
                  <FooterLinkItem key={link.href} link={link} />
                ))
              )}
            </nav>
            
            {socialLinks && (
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <SocialLinkItem key={social.href} social={social} />
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center text-sm text-muted-foreground">
            {copyrightText}
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn("border-t bg-background", className)}>
      <div className="container py-12 md:py-16">
        {/* Main footer content */}
        <div className={cn(
          "grid gap-8",
          variant === "extended"
            ? "lg:grid-cols-6"
            : "md:grid-cols-2 lg:grid-cols-5"
        )}>
          {/* Brand column */}
          <div className={cn(
            variant === "extended" ? "lg:col-span-2" : "md:col-span-2 lg:col-span-2"
          )}>
            {logo && <div className="mb-4">{logo}</div>}
            {description && (
              <p className="text-muted-foreground max-w-xs">
                {description}
              </p>
            )}
            
            {/* Social links */}
            {socialLinks && (
              <div className="mt-6 flex gap-4">
                {socialLinks.map((social) => (
                  <SocialLinkItem key={social.href} social={social} />
                ))}
              </div>
            )}
          </div>

          {/* Navigation sections */}
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold text-sm mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <FooterLinkItem link={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter section */}
        {showNewsletter && (
          <div className="mt-12 pt-8 border-t">
            <div className="max-w-md">
              <h3 className="font-semibold mb-2">{newsletterTitle}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {newsletterDescription}
              </p>
              
              {submitted ? (
                <p className="text-sm text-green-600 dark:text-green-400">
                  Thanks for subscribing!
                </p>
              ) : (
                <form
                  onSubmit={handleNewsletterSubmit}
                  className="flex gap-2"
                >
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="flex-1"
                    aria-label="Email address"
                  />
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "..." : "Subscribe"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {copyrightText}
          </p>
          
          {legalLinks && (
            <nav className="flex flex-wrap justify-center gap-6">
              {legalLinks.map((link) => (
                <FooterLinkItem key={link.href} link={link} size="sm" />
              ))}
            </nav>
          )}
        </div>
      </div>
    </footer>
  );
}

// Helper components
function FooterLinkItem({
  link,
  size = "default",
}: {
  link: FooterLink;
  size?: "default" | "sm";
}) {
  const className = cn(
    "text-muted-foreground transition-colors hover:text-foreground",
    size === "sm" ? "text-xs" : "text-sm"
  );

  if (link.external) {
    return (
      <a
        href={link.href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function SocialLinkItem({ social }: { social: SocialLink }) {
  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-muted-foreground hover:text-foreground transition-colors"
      aria-label={social.label}
    >
      {social.icon}
    </a>
  );
}
```

## Variants

### Simple Footer

```tsx
<Footer
  variant="simple"
  logo={<Logo />}
  sections={[
    {
      title: "Links",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Contact", href: "/contact" },
      ],
    },
  ]}
  socialLinks={socialLinks}
/>
```

### Standard Footer

```tsx
<Footer
  logo={<Logo />}
  description="Building the future of web development."
  sections={[
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Pricing", href: "/pricing" },
        { label: "Changelog", href: "/changelog" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "Blog", href: "/blog" },
        { label: "Careers", href: "/careers" },
      ],
    },
  ]}
  socialLinks={socialLinks}
  legalLinks={[
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ]}
/>
```

## States

| Element | Default | Hover | Focus |
|---------|---------|-------|-------|
| Links | muted-foreground | foreground | ring |
| Social icons | muted-foreground | foreground | ring |
| Newsletter input | input border | - | primary ring |
| Submit button | primary | primary/90 | ring |

## Accessibility

### Required ARIA Attributes

- `aria-label` on social links (icon-only)
- `aria-label` on newsletter email input
- Proper heading hierarchy (h3 for section titles)

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between links |
| `Enter` | Activate link |
| `Enter` (in form) | Submit newsletter |

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

## Related Skills

### Composes From
- [molecules/nav-link](../molecules/nav-link.md) - Navigation links
- [molecules/form-field](../molecules/form-field.md) - Newsletter input

### Composes Into
- [templates/marketing-layout](../templates/marketing-layout.md) - Marketing pages
- [templates/e-commerce-layout](../templates/e-commerce-layout.md) - Store pages

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with three variants
- Newsletter signup integration
- Social links support
