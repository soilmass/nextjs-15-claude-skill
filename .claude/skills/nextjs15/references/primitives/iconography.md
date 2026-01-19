---
id: p-iconography
name: Iconography
version: 2.0.0
layer: L0
category: visual
composes: []
description: Icon sizing, stroke widths, visual weight, and icon grid systems
tags: [icons, iconography, sizing, stroke-width, visual-weight, lucide, svg]
performance:
  impact: medium
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: false
  screen-reader: true
---

# Iconography

## Overview

Iconography primitives define consistent icon sizing, stroke weights, and visual balance across the design system. Icons should be optically balanced, maintain consistent visual weight, and scale appropriately with text.

## Design Tokens

```css
/* Icon System Tokens */
:root {
  /* Icon sizes (match common text sizes) */
  --icon-xs: 0.75rem;     /* 12px - Inline with small text */
  --icon-sm: 1rem;        /* 16px - Inline with body text */
  --icon-md: 1.25rem;     /* 20px - Default size */
  --icon-lg: 1.5rem;      /* 24px - Prominent icons */
  --icon-xl: 2rem;        /* 32px - Feature icons */
  --icon-2xl: 2.5rem;     /* 40px - Hero icons */
  --icon-3xl: 3rem;       /* 48px - Large display */
  --icon-4xl: 4rem;       /* 64px - Extra large */
  
  /* Stroke widths */
  --icon-stroke-thin: 1;
  --icon-stroke-light: 1.5;
  --icon-stroke-regular: 2;     /* Default */
  --icon-stroke-medium: 2.5;
  --icon-stroke-bold: 3;
  
  /* Icon optical adjustments */
  --icon-optical-sm: -0.0625em;  /* Visual centering adjustment */
  --icon-optical-md: -0.125em;
  
  /* Icon spacing (when used inline) */
  --icon-gap-xs: 0.25rem;   /* 4px */
  --icon-gap-sm: 0.375rem;  /* 6px */
  --icon-gap-md: 0.5rem;    /* 8px */
  --icon-gap-lg: 0.75rem;   /* 12px */
}
```

## Size Scale

| Token | Size | Use Case |
|-------|------|----------|
| `--icon-xs` | 12px | Small badges, compact UI |
| `--icon-sm` | 16px | Inline with body text |
| `--icon-md` | 20px | Default, buttons, inputs |
| `--icon-lg` | 24px | Navigation, prominent actions |
| `--icon-xl` | 32px | Feature highlights |
| `--icon-2xl` | 40px | Empty states, onboarding |
| `--icon-3xl` | 48px | Hero sections |
| `--icon-4xl` | 64px | Large illustrations |

## Icon Component

```tsx
// components/ui/icon.tsx
'use client';

import * as React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const iconVariants = cva('shrink-0', {
  variants: {
    size: {
      xs: 'h-3 w-3',      // 12px
      sm: 'h-4 w-4',      // 16px
      md: 'h-5 w-5',      // 20px
      lg: 'h-6 w-6',      // 24px
      xl: 'h-8 w-8',      // 32px
      '2xl': 'h-10 w-10', // 40px
      '3xl': 'h-12 w-12', // 48px
      '4xl': 'h-16 w-16', // 64px
    },
    strokeWidth: {
      thin: '[&>svg]:stroke-1',
      light: '[&>svg]:stroke-[1.5]',
      regular: '[&>svg]:stroke-2',
      medium: '[&>svg]:stroke-[2.5]',
      bold: '[&>svg]:stroke-[3]',
    },
    color: {
      inherit: 'text-inherit',
      current: 'text-current',
      primary: 'text-primary',
      secondary: 'text-secondary',
      muted: 'text-muted-foreground',
      success: 'text-green-500',
      warning: 'text-yellow-500',
      error: 'text-destructive',
      info: 'text-blue-500',
    },
  },
  defaultVariants: {
    size: 'md',
    strokeWidth: 'regular',
    color: 'current',
  },
});

export interface IconProps
  extends Omit<LucideProps, 'size' | 'strokeWidth'>,
    VariantProps<typeof iconVariants> {
  icon: LucideIcon;
  /** Accessible label for screen readers */
  label?: string;
  /** Whether icon is decorative (hidden from screen readers) */
  decorative?: boolean;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon: IconComponent,
      size,
      strokeWidth,
      color,
      label,
      decorative = false,
      className,
      ...props
    },
    ref
  ) => {
    // Map size variant to actual pixel values for Lucide
    const sizeMap = {
      xs: 12,
      sm: 16,
      md: 20,
      lg: 24,
      xl: 32,
      '2xl': 40,
      '3xl': 48,
      '4xl': 64,
    };
    
    const strokeMap = {
      thin: 1,
      light: 1.5,
      regular: 2,
      medium: 2.5,
      bold: 3,
    };

    return (
      <IconComponent
        ref={ref}
        size={sizeMap[size || 'md']}
        strokeWidth={strokeMap[strokeWidth || 'regular']}
        className={cn(iconVariants({ size, strokeWidth, color }), className)}
        aria-hidden={decorative || !label}
        aria-label={label}
        role={label ? 'img' : undefined}
        {...props}
      />
    );
  }
);
Icon.displayName = 'Icon';

export { Icon, iconVariants };
```

## Icon with Text

```tsx
// components/ui/icon-text.tsx
'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Icon, IconProps } from './icon';
import { cn } from '@/lib/utils';

interface IconTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  icon: LucideIcon;
  iconPosition?: 'left' | 'right';
  iconProps?: Partial<Omit<IconProps, 'icon'>>;
  gap?: 'xs' | 'sm' | 'md' | 'lg';
}

const gapClasses = {
  xs: 'gap-1',
  sm: 'gap-1.5',
  md: 'gap-2',
  lg: 'gap-3',
};

const IconText = React.forwardRef<HTMLSpanElement, IconTextProps>(
  (
    {
      icon,
      iconPosition = 'left',
      iconProps,
      gap = 'sm',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center',
          gapClasses[gap],
          className
        )}
        {...props}
      >
        {iconPosition === 'left' && (
          <Icon icon={icon} size="sm" decorative {...iconProps} />
        )}
        <span>{children}</span>
        {iconPosition === 'right' && (
          <Icon icon={icon} size="sm" decorative {...iconProps} />
        )}
      </span>
    );
  }
);
IconText.displayName = 'IconText';

export { IconText };
```

## Icon Button

```tsx
// components/ui/icon-button.tsx
'use client';

import * as React from 'react';
import { LucideIcon } from 'lucide-react';
import { Icon, type IconProps } from './icon';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const iconButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        xs: 'h-6 w-6',
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
        lg: 'h-12 w-12',
        xl: 'h-14 w-14',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

const iconSizeMap = {
  xs: 'xs' as const,
  sm: 'sm' as const,
  md: 'md' as const,
  lg: 'lg' as const,
  xl: 'xl' as const,
};

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: LucideIcon;
  label: string; // Required for accessibility
  iconProps?: Partial<Omit<IconProps, 'icon'>>;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant, size, iconProps, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(iconButtonVariants({ variant, size }), className)}
        aria-label={label}
        {...props}
      >
        <Icon
          icon={icon}
          size={iconSizeMap[size || 'md']}
          decorative
          {...iconProps}
        />
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
```

## Visual Weight Guidelines

### Stroke Width by Context

```tsx
// Recommended stroke widths for different contexts
const strokeGuidelines = {
  // Body text context (14-16px text)
  bodyText: {
    iconSize: 'sm', // 16px
    strokeWidth: 'regular', // 2
  },
  
  // Heading context (18-24px text)
  heading: {
    iconSize: 'lg', // 24px
    strokeWidth: 'light', // 1.5 - lighter for balance
  },
  
  // Button context
  button: {
    small: { iconSize: 'sm', strokeWidth: 'medium' },
    medium: { iconSize: 'md', strokeWidth: 'regular' },
    large: { iconSize: 'lg', strokeWidth: 'light' },
  },
  
  // Feature/hero context
  feature: {
    iconSize: 'xl', // 32px+
    strokeWidth: 'thin', // 1 - lighter for large icons
  },
  
  // Navigation
  navigation: {
    iconSize: 'md', // 20px
    strokeWidth: 'regular', // 2
  },
};
```

### Optical Alignment

```css
/* Icons often need optical adjustment for visual centering */
.icon-with-text {
  display: inline-flex;
  align-items: center;
  gap: var(--icon-gap-sm);
}

/* Vertical optical adjustment */
.icon-with-text svg {
  /* Slight upward shift for optical centering with text */
  transform: translateY(-0.0625em);
}

/* Button icon alignment */
.button-icon-left svg {
  margin-left: -0.125em; /* Optical alignment with button edge */
}

.button-icon-right svg {
  margin-right: -0.125em;
}
```

## Icon Grid System

```css
/* Icon design grid (for creating custom icons) */
.icon-grid {
  /* 24x24 grid with 2px stroke */
  --grid-size: 24;
  --stroke-width: 2;
  --padding: 2; /* 2px safe area */
  
  /* Live area: 20x20 (24 - 2*2 padding) */
  --live-area: calc(var(--grid-size) - var(--padding) * 2);
  
  /* Key shapes should align to pixel grid */
  /* Strokes should be centered on pixel boundaries */
}

/* Icon keyline shapes */
.icon-keyline-circle {
  /* Circle: 20px diameter, centered */
  cx: 12;
  cy: 12;
  r: 10;
}

.icon-keyline-square {
  /* Square: 18x18, centered */
  x: 3;
  y: 3;
  width: 18;
  height: 18;
}

.icon-keyline-landscape {
  /* Landscape rect: 20x16 */
  x: 2;
  y: 4;
  width: 20;
  height: 16;
}

.icon-keyline-portrait {
  /* Portrait rect: 16x20 */
  x: 4;
  y: 2;
  width: 16;
  height: 20;
}
```

## Lucide Icon Integration

```tsx
// lib/icons.ts
// Re-export commonly used icons with consistent naming

export {
  // Navigation
  Menu,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  
  // Actions
  Plus,
  Minus,
  Check,
  X as Close,
  Search,
  Filter,
  Settings,
  MoreHorizontal,
  MoreVertical,
  Edit,
  Trash2 as Delete,
  Copy,
  Download,
  Upload,
  Share2 as Share,
  
  // Status
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  HelpCircle,
  
  // Objects
  User,
  Users,
  Mail,
  Phone,
  Calendar,
  Clock,
  Image,
  File,
  Folder,
  Link,
  
  // Media
  Play,
  Pause,
  Volume2,
  VolumeX,
  
  // Social
  Github,
  Twitter,
  Linkedin,
  
  // Commerce
  ShoppingCart,
  CreditCard,
  Package,
  
  // Communication
  MessageSquare,
  Bell,
  Send,
} from 'lucide-react';

// Type for any Lucide icon
export type { LucideIcon } from 'lucide-react';
```

## Tailwind Configuration

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  theme: {
    extend: {
      // Icon size utilities
      spacing: {
        'icon-xs': '0.75rem',
        'icon-sm': '1rem',
        'icon-md': '1.25rem',
        'icon-lg': '1.5rem',
        'icon-xl': '2rem',
        'icon-2xl': '2.5rem',
        'icon-3xl': '3rem',
        'icon-4xl': '4rem',
      },
    },
  },
};

export default config;
```

## Anti-patterns

### Inconsistent Sizing

```tsx
// Bad - Random icon sizes
<SearchIcon size={18} />
<UserIcon size={22} />
<SettingsIcon size={19} />

// Good - Use consistent scale
<Icon icon={Search} size="md" />
<Icon icon={User} size="md" />
<Icon icon={Settings} size="md" />
```

### Missing Accessibility

```tsx
// Bad - No accessible label
<button>
  <TrashIcon />
</button>

// Good - Proper labeling
<IconButton
  icon={Trash2}
  label="Delete item"
/>
```

## Related Primitives

- [typography](./typography.md) - Text sizing for icon alignment
- [colors](./colors.md) - Icon colors
- [spacing](./spacing.md) - Icon gaps

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Reset versioning for consistency overhaul
