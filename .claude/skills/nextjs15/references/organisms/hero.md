---
id: o-hero
name: Hero
version: 2.0.0
layer: L3
category: marketing
description: Hero section with headline, description, CTAs, and optional media
tags: [hero, landing, marketing, banner, headline]
formula: "Hero = Card(m-card) + Button(a-button)[] + Badge(a-badge)"
composes:
  - ../molecules/card.md
dependencies: [framer-motion, lucide-react]
performance:
  impact: high
  lcp: critical
  cls: high
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Hero

## Overview

The Hero organism provides impactful landing page hero sections with animated headlines, descriptions, call-to-action buttons, and optional media (images, videos, or custom content). Supports multiple layout variants and background styles.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Hero (o-hero)                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Background Layer (gradient | grid | dots | blur)                 │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Content (variant: centered | split | splitReverse | stacked)     │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  Badge (a-badge) [optional, linked]                         │  │  │
│  │  │  "New Feature →"                                            │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  Title (h1)                                                 │  │  │
│  │  │  "Build faster with <gradient>our platform</gradient>"      │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  Description (p)                                            │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  Actions                                                    │  │  │
│  │  │  ┌──────────────────────┐  ┌──────────────────────┐         │  │  │
│  │  │  │ Button (a-button)    │  │ Button (a-button)    │         │  │  │
│  │  │  │ [primary] + Arrow    │  │ [outline/ghost]      │         │  │  │
│  │  │  └──────────────────────┘  └──────────────────────┘         │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                   │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │  Social Proof (optional)                                    │  │  │
│  │  │  "Trusted by leading companies"                             │  │  │
│  │  │  [Logo] [Logo] [Logo] [Logo]                                │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Media (optional: image | video | custom)                         │  │
│  │  └── Card (m-card) style with shadow-2xl                          │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## When to Use

Use this skill when:
- Building landing page headers
- Creating marketing page intros
- Designing product announcement sections
- Building app launch pages

## Molecules Used

- [card](../molecules/card.md) - Feature highlights

## Implementation

```typescript
// components/organisms/hero.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HeroAction {
  label: string;
  href: string;
  variant?: "default" | "outline" | "ghost";
  icon?: React.ReactNode;
}

interface HeroProps {
  /** Announcement badge */
  badge?: {
    text: string;
    href?: string;
  };
  /** Main headline */
  title: string;
  /** Highlighted text in title (wrapped with gradient) */
  titleHighlight?: string;
  /** Description paragraph */
  description: string;
  /** Primary CTA */
  primaryAction: HeroAction;
  /** Secondary CTA */
  secondaryAction?: HeroAction;
  /** Hero image */
  image?: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
  /** Video instead of image */
  video?: {
    src: string;
    poster?: string;
  };
  /** Custom media content */
  media?: React.ReactNode;
  /** Layout variant */
  variant?: "centered" | "split" | "splitReverse" | "stacked";
  /** Background style */
  background?: "none" | "gradient" | "grid" | "dots" | "blur";
  /** Social proof / logos */
  socialProof?: {
    label: string;
    logos: { src: string; alt: string }[];
  };
  /** Disable animations */
  disableAnimations?: boolean;
  /** Additional class names */
  className?: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Hero({
  badge,
  title,
  titleHighlight,
  description,
  primaryAction,
  secondaryAction,
  image,
  video,
  media,
  variant = "centered",
  background = "gradient",
  socialProof,
  disableAnimations = false,
  className,
}: HeroProps) {
  const MotionDiv = disableAnimations ? "div" : motion.div;
  const motionProps = disableAnimations
    ? {}
    : {
        variants: containerVariants,
        initial: "hidden",
        animate: "visible",
      };
  const itemProps = disableAnimations ? {} : { variants: itemVariants };

  // Process title with highlight
  const processedTitle = titleHighlight
    ? title.replace(
        titleHighlight,
        `<span class="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">${titleHighlight}</span>`
      )
    : title;

  const renderContent = () => (
    <MotionDiv
      {...motionProps}
      className={cn(
        variant === "centered" && "text-center max-w-4xl mx-auto",
        variant === "stacked" && "text-center max-w-4xl mx-auto",
        (variant === "split" || variant === "splitReverse") && "text-left",
        "space-y-6"
      )}
    >
      {/* Badge */}
      {badge && (
        <MotionDiv {...itemProps}>
          {badge.href ? (
            <Link href={badge.href}>
              <Badge
                variant="secondary"
                className="px-4 py-1.5 text-sm hover:bg-secondary/80 transition-colors"
              >
                {badge.text}
                <ArrowRight className="ml-2 h-3 w-3" />
              </Badge>
            </Link>
          ) : (
            <Badge variant="secondary" className="px-4 py-1.5 text-sm">
              {badge.text}
            </Badge>
          )}
        </MotionDiv>
      )}

      {/* Title */}
      <MotionDiv {...itemProps}>
        <h1
          className={cn(
            "font-bold tracking-tight text-balance",
            variant === "centered" || variant === "stacked"
              ? "text-4xl sm:text-5xl lg:text-6xl"
              : "text-3xl sm:text-4xl lg:text-5xl"
          )}
          dangerouslySetInnerHTML={{ __html: processedTitle }}
        />
      </MotionDiv>

      {/* Description */}
      <MotionDiv {...itemProps}>
        <p
          className={cn(
            "text-muted-foreground text-lg leading-relaxed",
            variant === "centered" && "max-w-2xl mx-auto",
            variant === "stacked" && "max-w-2xl mx-auto"
          )}
        >
          {description}
        </p>
      </MotionDiv>

      {/* Actions */}
      <MotionDiv
        {...itemProps}
        className={cn(
          "flex flex-wrap gap-4",
          (variant === "centered" || variant === "stacked") && "justify-center"
        )}
      >
        <Button size="lg" asChild>
          <Link href={primaryAction.href}>
            {primaryAction.label}
            {primaryAction.icon ?? <ArrowRight className="ml-2 h-4 w-4" />}
          </Link>
        </Button>
        {secondaryAction && (
          <Button size="lg" variant={secondaryAction.variant ?? "outline"} asChild>
            <Link href={secondaryAction.href}>
              {secondaryAction.icon}
              {secondaryAction.label}
            </Link>
          </Button>
        )}
      </MotionDiv>

      {/* Social Proof */}
      {socialProof && (
        <MotionDiv {...itemProps} className="pt-8">
          <p className="text-sm text-muted-foreground mb-4">
            {socialProof.label}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {socialProof.logos.map((logo, index) => (
              <Image
                key={index}
                src={logo.src}
                alt={logo.alt}
                width={120}
                height={40}
                className="h-8 w-auto object-contain grayscale"
              />
            ))}
          </div>
        </MotionDiv>
      )}
    </MotionDiv>
  );

  const renderMedia = () => {
    if (media) return media;

    if (video) {
      return (
        <MotionDiv
          {...itemProps}
          className="relative rounded-lg overflow-hidden shadow-2xl"
        >
          <video
            src={video.src}
            poster={video.poster}
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-auto"
          />
        </MotionDiv>
      );
    }

    if (image) {
      return (
        <MotionDiv
          {...itemProps}
          className="relative"
        >
          <div className="relative rounded-lg overflow-hidden shadow-2xl">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width ?? 800}
              height={image.height ?? 600}
              className="w-full h-auto"
              priority
            />
          </div>
          {/* Decorative blur behind image */}
          <div className="absolute -inset-4 -z-10 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl opacity-50" />
        </MotionDiv>
      );
    }

    return null;
  };

  const backgroundStyles = {
    none: "",
    gradient:
      "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background",
    grid: "bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]",
    dots: "bg-[radial-gradient(#80808020_1px,transparent_1px)] bg-[size:20px_20px]",
    blur: "",
  };

  return (
    <section
      className={cn(
        "relative overflow-hidden",
        backgroundStyles[background],
        className
      )}
    >
      {/* Blur background effect */}
      {background === "blur" && (
        <>
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/30 rounded-full filter blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full filter blur-3xl opacity-20" />
        </>
      )}

      <div className="container relative py-20 lg:py-32">
        {/* Centered Layout */}
        {variant === "centered" && (
          <div className="space-y-12">
            {renderContent()}
            {(image || video || media) && (
              <MotionDiv {...motionProps} className="mt-16">
                {renderMedia()}
              </MotionDiv>
            )}
          </div>
        )}

        {/* Split Layout */}
        {variant === "split" && (
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {renderContent()}
            {renderMedia()}
          </div>
        )}

        {/* Split Reverse Layout */}
        {variant === "splitReverse" && (
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">{renderMedia()}</div>
            <div className="order-1 lg:order-2">{renderContent()}</div>
          </div>
        )}

        {/* Stacked Layout */}
        {variant === "stacked" && (
          <div className="space-y-16">
            {renderContent()}
            {renderMedia()}
          </div>
        )}
      </div>
    </section>
  );
}
```

### Key Implementation Notes

1. **LCP Optimization**: Uses `priority` on hero images
2. **Animated Stagger**: Content animates in sequence
3. **Background Variants**: Multiple decorative background options
4. **Title Highlight**: Gradient text highlighting

## Variants

### Centered Hero

```tsx
<Hero
  badge={{ text: "New Feature", href: "/blog/announcement" }}
  title="Build faster with our platform"
  description="The modern development platform for building exceptional websites."
  primaryAction={{ label: "Get Started", href: "/signup" }}
  secondaryAction={{ label: "Learn More", href: "/docs" }}
  image={{ src: "/hero.png", alt: "Platform screenshot" }}
/>
```

### Split Hero

```tsx
<Hero
  variant="split"
  title="Ship products faster than ever"
  titleHighlight="faster than ever"
  description="Streamline your development workflow with our powerful tools."
  primaryAction={{ label: "Start Free Trial", href: "/trial" }}
  image={{ src: "/product.png", alt: "Product" }}
/>
```

### With Video

```tsx
<Hero
  variant="centered"
  title="See it in action"
  description="Watch how our platform transforms your workflow."
  primaryAction={{ label: "Watch Demo", href: "#", icon: <Play className="ml-2 h-4 w-4" /> }}
  video={{ src: "/demo.mp4", poster: "/poster.jpg" }}
/>
```

### With Social Proof

```tsx
<Hero
  title="Trusted by thousands"
  description="Join the companies that trust us."
  primaryAction={{ label: "Get Started", href: "/signup" }}
  socialProof={{
    label: "Trusted by leading companies",
    logos: [
      { src: "/logos/google.svg", alt: "Google" },
      { src: "/logos/meta.svg", alt: "Meta" },
      { src: "/logos/stripe.svg", alt: "Stripe" },
    ],
  }}
/>
```

## Performance

### LCP Optimization

- Hero images use `priority` prop
- Consider using `placeholder="blur"` with blurDataURL
- Optimize image sizes for above-the-fold content

### CLS Prevention

- Set explicit width/height on images
- Reserve space for dynamic content
- Avoid layout shifts from web fonts

## Accessibility

### Required Attributes

- Semantic heading hierarchy (h1)
- Alt text on all images
- Descriptive link text

### Screen Reader

- Badge links are announced properly
- Image descriptions are meaningful
- CTA purposes are clear

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
| Default | Hero section with content fully visible | Title, description, CTAs, and optional media displayed |
| Page Load | Initial load with animations | Staggered fade-in animations for badge, title, description, actions |
| Animations Complete | All animations finished | Static display of all content |
| Animations Disabled | No motion effects | All content visible immediately without transitions |
| Badge Hover | Mouse over announcement badge | Badge shows hover state if linked |
| Primary Button Hover | Mouse over primary CTA | Button shows hover state with slight color shift |
| Secondary Button Hover | Mouse over secondary CTA | Outline button shows hover background |
| Image Loading | Hero image still loading | Placeholder or skeleton may be visible |
| Image Loaded | Hero image fully rendered | Full resolution image displayed with decorative blur |
| Video Playing | Autoplay video active | Video content plays muted in loop |
| Centered Layout | Default centered alignment | Content centered with media below |
| Split Layout | Two-column layout | Content left, media right side by side |
| Split Reverse Layout | Reversed two-column | Media left, content right |
| Gradient Background | Gradient effect active | Radial gradient from top with primary color tint |
| Grid Background | Grid pattern visible | Subtle CSS grid lines as background decoration |
| Dots Background | Dot pattern visible | Polka dot pattern as background |
| Blur Background | Blur orbs visible | Large blurred circles of primary/secondary colors |

## Anti-patterns

### 1. Missing Primary Action

```tsx
// Bad: Hero without any CTA
<Hero
  title="Welcome to our platform"
  description="The best solution for your needs."
  // No primaryAction!
/>

// Good: Always provide a primary action
<Hero
  title="Welcome to our platform"
  description="The best solution for your needs."
  primaryAction={{ label: "Get Started", href: "/signup" }}
/>
```

### 2. Image Without Alt Text

```tsx
// Bad: Image missing alt attribute
<Hero
  title="Our Product"
  primaryAction={{ label: "Try Now", href: "/try" }}
  image={{ src: "/hero.png" }}  // No alt!
/>

// Good: Descriptive alt text for accessibility
<Hero
  title="Our Product"
  primaryAction={{ label: "Try Now", href: "/try" }}
  image={{
    src: "/hero.png",
    alt: "Dashboard showing analytics and user metrics"
  }}
/>
```

### 3. Large Images Without Priority

```tsx
// Bad: Hero image not prioritized (hurts LCP)
// The component handles this internally, but if customizing:
<Image
  src={heroImage}
  alt="Hero"
  // Missing priority prop!
/>

// Good: Always use priority for above-the-fold images
<Hero
  image={{
    src: "/hero.png",
    alt: "Product screenshot",
    // Component automatically sets priority={true}
  }}
  primaryAction={...}
/>
```

### 4. Multiple Media Types

```tsx
// Bad: Both image and video specified
<Hero
  title="Watch and See"
  primaryAction={{ label: "Learn More", href: "/learn" }}
  image={{ src: "/hero.png", alt: "Hero" }}
  video={{ src: "/demo.mp4" }}  // Conflict!
/>

// Good: Choose one media type
<Hero
  title="Watch and See"
  primaryAction={{ label: "Learn More", href: "/learn" }}
  video={{ src: "/demo.mp4", poster: "/poster.jpg" }}
/>

// Or use custom media for complex cases
<Hero
  title="Complex Media"
  primaryAction={{ label: "Explore", href: "/explore" }}
  media={<CustomMediaComponent />}
/>
```

## Related Skills

### Composes Into
- [templates/marketing-layout](../templates/marketing-layout.md)
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
- Background options
- Social proof support
