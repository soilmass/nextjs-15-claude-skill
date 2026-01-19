---
id: o-features
name: Features
version: 2.0.0
layer: L3
category: marketing
description: Feature showcase section with icons, titles, and descriptions
tags: [features, benefits, showcase, grid, marketing]
formula: "Features = Card(m-card)[] + Badge(a-badge)"
composes:
  - ../molecules/card.md
dependencies: [framer-motion, lucide-react]
performance:
  impact: medium
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Features

## Overview

The Features organism displays product/service features in visually appealing grid layouts. Supports various card styles, icons, animations, and layout options for showcasing benefits and capabilities.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  Features (o-features)                                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Header                                                   │  │
│  │  ├── Badge (a-badge) [optional]                           │  │
│  │  ├── Title (h2)                                           │  │
│  │  └── Description                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Features Grid (variant: grid, 2-4 cols)                  │  │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌───────────┐  │  │
│  │  │  Card (m-card)  │  │  Card (m-card)  │  │  Card ... │  │  │
│  │  │  ├── IconBox    │  │  ├── IconBox    │  │           │  │  │
│  │  │  ├── Title      │  │  ├── Title      │  │           │  │  │
│  │  │  └── Desc       │  │  └── Desc       │  │           │  │  │
│  │  └─────────────────┘  └─────────────────┘  └───────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Features List (variant: list)                            │  │
│  │  ├── [Icon] Title + Description ─────────────────────     │  │
│  │  ├── [Icon] Title + Description ─────────────────────     │  │
│  │  └── [Icon] Title + Description ─────────────────────     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Bento Grid (variant: bento)                              │  │
│  │  ┌───────────────────────┐  ┌───────────┐  ┌───────────┐  │  │
│  │  │  Card (large 2x2)     │  │  Card 1x1 │  │  Card 1x1 │  │  │
│  │  │                       │  └───────────┘  └───────────┘  │  │
│  │  │                       │  ┌─────────────────────────┐   │  │
│  │  └───────────────────────┘  │  Card (wide 2x1)        │   │  │
│  │                             └─────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## When to Use

Use this skill when:
- Showcasing product features
- Displaying service benefits
- Creating comparison sections
- Building "why choose us" sections

## Molecules Used

- [card](../molecules/card.md) - Feature cards

## Implementation

```typescript
// components/organisms/features.tsx
"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  href?: string;
}

interface FeaturesProps {
  /** Section badge */
  badge?: string;
  /** Section title */
  title?: string;
  /** Section description */
  description?: string;
  /** Features array */
  features: Feature[];
  /** Layout variant */
  variant?: "grid" | "list" | "alternating" | "bento";
  /** Number of columns */
  columns?: 2 | 3 | 4;
  /** Card style */
  cardStyle?: "default" | "bordered" | "gradient" | "minimal";
  /** Center content */
  centered?: boolean;
  /** Disable animations */
  disableAnimations?: boolean;
  /** Additional class names */
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function Features({
  badge,
  title,
  description,
  features,
  variant = "grid",
  columns = 3,
  cardStyle = "default",
  centered = true,
  disableAnimations = false,
  className,
}: FeaturesProps) {
  const MotionDiv = disableAnimations ? "div" : motion.div;

  const columnClasses = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-2 lg:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  };

  const cardStyles = {
    default: "bg-card border shadow-sm hover:shadow-md transition-shadow",
    bordered: "bg-transparent border-2 hover:border-primary/50 transition-colors",
    gradient: "bg-gradient-to-br from-primary/5 to-secondary/5 border-0",
    minimal: "bg-transparent border-0 shadow-none",
  };

  const renderFeatureCard = (feature: Feature, index: number) => {
    const CardWrapper = feature.href ? "a" : "div";
    const wrapperProps = feature.href
      ? { href: feature.href, className: "block" }
      : {};

    return (
      <MotionDiv
        key={index}
        variants={disableAnimations ? undefined : itemVariants}
        whileHover={disableAnimations ? undefined : { y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <CardWrapper {...wrapperProps}>
          <Card
            className={cn(
              "h-full",
              cardStyles[cardStyle],
              feature.href && "cursor-pointer"
            )}
          >
            <CardHeader>
              <div
                className={cn(
                  "mb-4 inline-flex items-center justify-center rounded-lg p-2.5",
                  cardStyle === "minimal"
                    ? "bg-primary/10"
                    : "bg-primary/10"
                )}
              >
                <span className="text-primary">{feature.icon}</span>
              </div>
              <CardTitle className="text-xl">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardContent>
          </Card>
        </CardWrapper>
      </MotionDiv>
    );
  };

  const renderListItem = (feature: Feature, index: number) => (
    <MotionDiv
      key={index}
      variants={disableAnimations ? undefined : itemVariants}
      className="flex gap-6 py-6 border-b last:border-0"
    >
      <div className="shrink-0">
        <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
          <span className="text-primary">{feature.icon}</span>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
        <p className="text-muted-foreground">{feature.description}</p>
      </div>
    </MotionDiv>
  );

  const renderAlternating = (feature: Feature, index: number) => {
    const isEven = index % 2 === 0;
    return (
      <MotionDiv
        key={index}
        variants={disableAnimations ? undefined : itemVariants}
        className={cn(
          "grid md:grid-cols-2 gap-8 items-center py-12",
          index !== 0 && "border-t"
        )}
      >
        <div className={cn("space-y-4", !isEven && "md:order-2")}>
          <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
            <span className="text-primary">{feature.icon}</span>
          </div>
          <h3 className="text-2xl font-semibold">{feature.title}</h3>
          <p className="text-muted-foreground text-lg leading-relaxed">
            {feature.description}
          </p>
        </div>
        <div
          className={cn(
            "aspect-video rounded-lg bg-muted",
            !isEven && "md:order-1"
          )}
        />
      </MotionDiv>
    );
  };

  const renderBento = () => {
    // Bento grid with varying sizes
    return (
      <div className="grid md:grid-cols-4 gap-4">
        {features.map((feature, index) => {
          const sizes = [
            "md:col-span-2 md:row-span-2",
            "md:col-span-2",
            "md:col-span-1",
            "md:col-span-1",
            "md:col-span-2",
            "md:col-span-2",
          ];
          const size = sizes[index % sizes.length];

          return (
            <MotionDiv
              key={index}
              variants={disableAnimations ? undefined : itemVariants}
              className={size}
            >
              <Card
                className={cn(
                  "h-full",
                  cardStyles[cardStyle],
                  index === 0 && "bg-gradient-to-br from-primary/10 to-primary/5"
                )}
              >
                <CardHeader>
                  <div className="inline-flex items-center justify-center rounded-lg bg-primary/10 p-2.5 w-fit">
                    <span className="text-primary">{feature.icon}</span>
                  </div>
                  <CardTitle className={index === 0 ? "text-2xl" : "text-lg"}>
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription
                    className={cn(
                      "leading-relaxed",
                      index === 0 && "text-base"
                    )}
                  >
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </MotionDiv>
          );
        })}
      </div>
    );
  };

  return (
    <section className={cn("py-20 lg:py-32", className)}>
      <div className="container">
        {/* Header */}
        {(badge || title || description) && (
          <MotionDiv
            variants={disableAnimations ? undefined : containerVariants}
            initial={disableAnimations ? undefined : "hidden"}
            whileInView={disableAnimations ? undefined : "visible"}
            viewport={{ once: true }}
            className={cn(
              "mb-16",
              centered && "text-center max-w-3xl mx-auto"
            )}
          >
            {badge && (
              <MotionDiv variants={disableAnimations ? undefined : itemVariants}>
                <span className="inline-block px-4 py-1.5 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary">
                  {badge}
                </span>
              </MotionDiv>
            )}
            {title && (
              <MotionDiv variants={disableAnimations ? undefined : itemVariants}>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
                  {title}
                </h2>
              </MotionDiv>
            )}
            {description && (
              <MotionDiv variants={disableAnimations ? undefined : itemVariants}>
                <p className="text-lg text-muted-foreground">
                  {description}
                </p>
              </MotionDiv>
            )}
          </MotionDiv>
        )}

        {/* Features Content */}
        <MotionDiv
          variants={disableAnimations ? undefined : containerVariants}
          initial={disableAnimations ? undefined : "hidden"}
          whileInView={disableAnimations ? undefined : "visible"}
          viewport={{ once: true, margin: "-100px" }}
        >
          {variant === "grid" && (
            <div className={cn("grid gap-6", columnClasses[columns])}>
              {features.map(renderFeatureCard)}
            </div>
          )}

          {variant === "list" && (
            <div className="max-w-3xl mx-auto divide-y">
              {features.map(renderListItem)}
            </div>
          )}

          {variant === "alternating" && (
            <div className="space-y-0">
              {features.map(renderAlternating)}
            </div>
          )}

          {variant === "bento" && renderBento()}
        </MotionDiv>
      </div>
    </section>
  );
}
```

### Key Implementation Notes

1. **Staggered Animation**: Features animate in sequence
2. **Multiple Layouts**: Grid, list, alternating, bento styles
3. **Viewport Trigger**: Animations start when section is visible
4. **Hover Effects**: Cards lift on hover

## Variants

### Grid Features

```tsx
<Features
  badge="Features"
  title="Everything you need"
  description="Our platform provides all the tools you need to succeed."
  features={[
    { icon: <Zap />, title: "Lightning Fast", description: "Optimized for speed." },
    { icon: <Shield />, title: "Secure", description: "Enterprise-grade security." },
    { icon: <Globe />, title: "Global CDN", description: "Content delivered worldwide." },
  ]}
/>
```

### Bento Grid

```tsx
<Features
  variant="bento"
  title="Powerful capabilities"
  features={features}
  cardStyle="gradient"
/>
```

### Alternating Layout

```tsx
<Features
  variant="alternating"
  features={[
    { icon: <Layers />, title: "Component Library", description: "Pre-built components." },
    { icon: <Code />, title: "Code Generation", description: "Auto-generate code." },
  ]}
/>
```

### Minimal Cards

```tsx
<Features
  features={features}
  cardStyle="minimal"
  columns={4}
/>
```

## Accessibility

### Required Attributes

- Semantic heading hierarchy
- Descriptive feature titles
- Icon-only elements have text alternatives

### Screen Reader

- Section purpose is clear
- Features are announced in logical order

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
| Default | Features section with all cards visible | Grid of feature cards with icons, titles, descriptions |
| Viewport Enter | Section scrolls into view | Staggered fade-in and slide-up animations trigger |
| Card Hover | Mouse over feature card | Card lifts slightly with shadow increase |
| Card Focused | Feature card has keyboard focus | Focus ring visible around card |
| Link Hover | Mouse over linked feature | Additional hover styling indicating clickability |
| Grid Layout | Standard multi-column grid | Cards in 2, 3, or 4 column layout |
| List Layout | Vertical list of features | Features stacked with icon and text side by side |
| Alternating Layout | Zig-zag content and visuals | Features alternate left/right with image placeholders |
| Bento Layout | Magazine-style mixed sizes | Featured card larger, others in varied grid sizes |
| Animations Disabled | No motion effects | Cards appear instantly without transitions |
| Bordered Card Style | Cards with prominent borders | Border-2 styling with no shadow |
| Gradient Card Style | Cards with gradient backgrounds | Subtle gradient from primary to secondary tints |
| Minimal Card Style | Cards without backgrounds | No borders or shadows, just content |

## Anti-patterns

### 1. Missing Icons for Features

```tsx
// Bad: Features without visual icons
<Features
  features={[
    { title: "Fast", description: "Lightning speed" },  // No icon!
    { title: "Secure", description: "Enterprise security" },  // No icon!
  ]}
/>

// Good: Each feature has an icon
<Features
  features={[
    { icon: <Zap className="h-6 w-6" />, title: "Fast", description: "..." },
    { icon: <Shield className="h-6 w-6" />, title: "Secure", description: "..." },
  ]}
/>
```

### 2. Too Many Columns for Content Length

```tsx
// Bad: 4 columns with long descriptions
<Features
  columns={4}  // Too cramped
  features={featuresWithLongDescriptions}
/>

// Good: Fewer columns for longer content
<Features
  columns={2}  // More space for reading
  features={featuresWithLongDescriptions}
/>

// Or use list variant for long content
<Features
  variant="list"
  features={featuresWithLongDescriptions}
/>
```

### 3. Inconsistent Feature Data

```tsx
// Bad: Mix of features with and without hrefs
<Features
  features={[
    { icon: <Zap />, title: "Fast", description: "...", href: "/fast" },
    { icon: <Shield />, title: "Secure", description: "..." },  // No link
    { icon: <Globe />, title: "Global", description: "...", href: "/global" },
  ]}
/>

// Good: Consistent structure - either all linked or none
<Features
  features={[
    { icon: <Zap />, title: "Fast", description: "...", href: "/fast" },
    { icon: <Shield />, title: "Secure", description: "...", href: "/secure" },
    { icon: <Globe />, title: "Global", description: "...", href: "/global" },
  ]}
/>
```

### 4. Using Bento Without Enough Features

```tsx
// Bad: Bento layout with only 2 features
<Features
  variant="bento"
  features={[
    { icon: <Zap />, title: "Fast", description: "..." },
    { icon: <Shield />, title: "Secure", description: "..." },
  ]}
/>

// Good: Bento works best with 4-6+ features
<Features
  variant="bento"
  features={sixFeatures}
/>

// Or use grid for fewer features
<Features
  variant="grid"
  columns={2}
  features={twoFeatures}
/>
```

## Related Skills

### Composes From
- [molecules/card](../molecules/card.md)

### Composes Into
- [templates/landing-page](../templates/landing-page.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Four layout variants
- Card style options
