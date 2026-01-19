---
id: p-brand-expression
name: Brand Expression
version: 2.0.0
layer: L0
category: theming
composes: []
description: Brand accent system and icon/illustration variables
tags: [design-tokens, brand, icons, illustrations, identity]
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: false
---

# Brand Expression

## Overview

Brand expression tokens define how a brand's visual identity is applied consistently across the interface. This includes the brand accent color system, icon styling, and illustration guidelines.

Key principles:
- Single brand hue with computed variations
- Consistent icon stroke and sizing
- Illustration style guidelines
- Configurable accent without redesign

## When to Use

Use this skill when:
- Setting up brand colors beyond semantic tokens
- Defining icon sizing and stroke conventions
- Creating illustration guidelines
- Enabling brand customization

## Implementation

### globals.css

```css
@layer base {
  :root {
    /* Brand Accent System (HSL-based for easy adjustment) */
    --brand-hue: 220;           /* Blue - change this for different brand */
    --brand-saturation: 90%;
    --brand-lightness: 50%;
    
    /* Computed brand colors */
    --brand-primary: hsl(var(--brand-hue), var(--brand-saturation), var(--brand-lightness));
    --brand-primary-hover: hsl(var(--brand-hue), var(--brand-saturation), calc(var(--brand-lightness) - 10%));
    --brand-primary-active: hsl(var(--brand-hue), var(--brand-saturation), calc(var(--brand-lightness) - 15%));
    --brand-primary-subtle: hsl(var(--brand-hue), calc(var(--brand-saturation) - 40%), 95%);
    --brand-primary-muted: hsl(var(--brand-hue), calc(var(--brand-saturation) - 60%), 90%);
    
    /* Brand gradient */
    --brand-gradient: linear-gradient(
      135deg,
      hsl(var(--brand-hue), var(--brand-saturation), var(--brand-lightness)) 0%,
      hsl(calc(var(--brand-hue) + 30), var(--brand-saturation), calc(var(--brand-lightness) + 10%)) 100%
    );
    
    /* Icon System */
    --icon-stroke-width: 1.5px;
    --icon-size-xs: 12px;
    --icon-size-sm: 16px;
    --icon-size-md: 20px;
    --icon-size-lg: 24px;
    --icon-size-xl: 32px;
    --icon-size-2xl: 40px;
    
    /* Illustration Variables */
    --illustration-stroke-width: 2px;
    --illustration-corner-radius: 8px;
    --illustration-primary: var(--brand-primary);
    --illustration-secondary: hsl(var(--muted));
    --illustration-accent: hsl(calc(var(--brand-hue) + 180), 70%, 60%);
  }
  
  .dark {
    /* Adjusted brand colors for dark mode */
    --brand-lightness: 60%;
    --brand-primary-subtle: hsl(var(--brand-hue), calc(var(--brand-saturation) - 40%), 15%);
    --brand-primary-muted: hsl(var(--brand-hue), calc(var(--brand-saturation) - 60%), 20%);
  }
}

/* Brand utilities */
.text-brand { color: var(--brand-primary); }
.bg-brand { background-color: var(--brand-primary); }
.bg-brand-subtle { background-color: var(--brand-primary-subtle); }
.bg-brand-gradient { background: var(--brand-gradient); }
.border-brand { border-color: var(--brand-primary); }
```

### lib/icons.tsx

```typescript
import * as React from "react";
import { LucideIcon, LucideProps } from "lucide-react";
import { cn } from "@/lib/utils";

// Icon size mapping
const sizeMap = {
  xs: "h-3 w-3",   // 12px
  sm: "h-4 w-4",   // 16px
  md: "h-5 w-5",   // 20px
  lg: "h-6 w-6",   // 24px
  xl: "h-8 w-8",   // 32px
  "2xl": "h-10 w-10", // 40px
};

interface IconProps extends LucideProps {
  icon: LucideIcon;
  size?: keyof typeof sizeMap;
  label?: string;
}

export function Icon({ 
  icon: IconComponent, 
  size = "md", 
  label,
  className,
  ...props 
}: IconProps) {
  return (
    <IconComponent
      className={cn(sizeMap[size], className)}
      strokeWidth={1.5}
      aria-label={label}
      aria-hidden={!label}
      {...props}
    />
  );
}

// Feature icon with background
interface FeatureIconProps extends IconProps {
  variant?: "default" | "brand" | "muted";
}

export function FeatureIcon({ 
  variant = "default",
  size = "lg",
  className,
  ...props 
}: FeatureIconProps) {
  const bgClasses = {
    default: "bg-primary/10 text-primary",
    brand: "bg-brand-subtle text-brand",
    muted: "bg-muted text-muted-foreground",
  };
  
  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-lg p-2",
      bgClasses[variant],
      className
    )}>
      <Icon size={size} {...props} />
    </div>
  );
}
```

## Brand Presets

### Tech/SaaS Blue

```css
:root {
  --brand-hue: 220;
  --brand-saturation: 90%;
  --brand-lightness: 50%;
}
```

### Nature Green

```css
:root {
  --brand-hue: 160;
  --brand-saturation: 70%;
  --brand-lightness: 45%;
}
```

### Warm Orange

```css
:root {
  --brand-hue: 25;
  --brand-saturation: 95%;
  --brand-lightness: 55%;
}
```

### Luxury Purple

```css
:root {
  --brand-hue: 270;
  --brand-saturation: 75%;
  --brand-lightness: 55%;
}
```

## Icon Guidelines

| Context | Size | Notes |
|---------|------|-------|
| Inline with text | sm (16px) | Match text line height |
| Button icons | md (20px) | Standard UI |
| Navigation | lg (24px) | Touch-friendly |
| Feature highlights | xl (32px) | With background |
| Hero/empty states | 2xl (40px) | Decorative |

### Stroke Consistency

- All icons use `strokeWidth={1.5}` for consistency
- Filled variants for selected/active states only
- Maintain optical alignment with text

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "0.460.0"
  }
}
```

## Examples

### Brand Button

```tsx
<Button className="bg-brand hover:bg-brand-primary-hover text-white">
  Get Started
</Button>

{/* Outline variant */}
<Button variant="outline" className="border-brand text-brand hover:bg-brand-subtle">
  Learn More
</Button>
```

### Feature Card with Icon

```tsx
<Card className="p-6">
  <FeatureIcon icon={Zap} variant="brand" className="mb-4" />
  <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
  <p className="text-muted-foreground">
    Optimized for speed from the ground up.
  </p>
</Card>
```

### Gradient Hero

```tsx
<section className="relative overflow-hidden">
  {/* Gradient background */}
  <div 
    className="absolute inset-0 -z-10"
    style={{ background: "var(--brand-gradient)", opacity: 0.1 }}
  />
  
  <div className="container py-24 text-center">
    <h1 className="text-5xl font-bold mb-6">
      Welcome to <span className="text-brand">Brand</span>
    </h1>
    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
      Build something amazing with our platform.
    </p>
  </div>
</section>
```

### Icon with Text

```tsx
<div className="flex items-center gap-2">
  <Icon icon={Check} size="sm" className="text-green-500" />
  <span>Feature included</span>
</div>

<Button>
  <Icon icon={ArrowRight} size="sm" />
  Continue
</Button>
```

### Logo Usage

```tsx
// Logo component with theme awareness
export function Logo({ className }: { className?: string }) {
  return (
    <svg 
      className={cn("h-8 w-auto text-brand", className)}
      viewBox="0 0 32 32"
    >
      {/* Logo paths using currentColor */}
    </svg>
  );
}
```

## Anti-patterns

### Hardcoded Brand Colors

```tsx
// Bad - not configurable
<div className="bg-blue-600 hover:bg-blue-700">...</div>

// Good - uses brand tokens
<div className="bg-brand hover:bg-brand-primary-hover">...</div>
```

### Inconsistent Icon Sizes

```tsx
// Bad - arbitrary sizing
<Icon className="h-[22px] w-[22px]" />

// Good - uses size scale
<Icon size="md" />
```

## Related Skills

### Composes Into
- [colors](./colors.md) - Base color system
- [display-icon](../atoms/display-icon.md) - Icon atom

### Related
- [dark-mode](./dark-mode.md) - Brand in dark mode
- [hero](../organisms/hero.md) - Brand in hero sections

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
