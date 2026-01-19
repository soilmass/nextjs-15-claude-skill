# L1: Atoms

> Base UI components. Single-purpose, highly reusable elements.

## Overview

Atoms are the smallest functional UI components. They are built directly on primitives and serve as the foundation for all higher-level compositions.

**Key principle**: Atoms only compose from primitives (L0). They should be single-purpose and highly reusable.

## Composition Rules

```
L1 Atoms
├── composes: L0 (primitives)
└── composed by: L2, L3, L4, L5, L6
```

## Categories

| Category | Description | Count |
|----------|-------------|-------|
| `display` | Text, headings, badges, avatars, images, icons | 12 |
| `input` | Buttons, text inputs, checkboxes, selects, switches | 13 |
| `feedback` | Alerts, toasts, progress bars, spinners | 5 |
| `layout` | Stack, center, spacer, divider | 4 |
| `interactive` | Tooltips, links, popovers, dropdowns | 4 |
| `state` | State matrices for buttons, inputs, checkboxes | 6 |

## Files (42 total)

### Display (12)
| ID | Name | Description |
|----|------|-------------|
| `a-display-text` | Text | Typography component with variants |
| `a-display-heading` | Heading | H1-H6 heading component |
| `a-display-badge` | Badge | Status and label badges |
| `a-display-avatar` | Avatar | User avatar with fallback |
| `a-display-icon` | Icon | Icon wrapper component |
| `a-display-image` | Image | Optimized image component |
| `a-display-code` | Code | Inline and block code |
| `a-display-skeleton` | Skeleton | Loading placeholder |
| `a-display-time` | Time | Time/date display |
| `a-display-currency` | Currency | Currency formatting |
| `a-display-percentage` | Percentage | Percentage display |

### Input (13)
| ID | Name | Description |
|----|------|-------------|
| `a-input-button` | Button | Primary interactive element |
| `a-input-text` | Text Input | Single-line text input |
| `a-input-textarea` | Textarea | Multi-line text input |
| `a-input-checkbox` | Checkbox | Boolean selection |
| `a-input-radio` | Radio | Single selection from options |
| `a-input-switch` | Switch | Toggle switch |
| `a-input-select` | Select | Dropdown selection |
| `a-input-slider` | Slider | Range input |
| `a-input-file` | File Input | File upload |
| `a-input-number` | Number Input | Numeric input |
| `a-input-otp` | OTP Input | One-time password |
| `a-input-color` | Color Input | Color picker |

### Feedback (5)
| ID | Name | Description |
|----|------|-------------|
| `a-feedback-alert` | Alert | Alert messages |
| `a-feedback-toast` | Toast | Toast notifications |
| `a-feedback-progress` | Progress | Progress indicators |
| `a-feedback-spinner` | Spinner | Loading spinner |
| `a-feedback-badge-notification` | Notification Badge | Notification count badge |

### Layout (4)
| ID | Name | Description |
|----|------|-------------|
| `a-layout-stack` | Stack | Vertical/horizontal stack |
| `a-layout-center` | Center | Centering container |
| `a-layout-spacer` | Spacer | Flexible space |
| `a-layout-divider` | Divider | Visual separator |

### Interactive (4)
| ID | Name | Description |
|----|------|-------------|
| `a-interactive-tooltip` | Tooltip | Hover tooltips |
| `a-interactive-link` | Link | Navigation link |
| `a-interactive-popover` | Popover | Click popovers |
| `a-interactive-dropdown-trigger` | Dropdown Trigger | Dropdown menu trigger |

### State (6)
| ID | Name | Description |
|----|------|-------------|
| `a-state-button` | Button States | Button state matrix |
| `a-state-input` | Input States | Input state matrix |
| `a-state-checkbox` | Checkbox States | Checkbox state matrix |
| `a-state-toggle` | Toggle States | Toggle state matrix |
| `a-state-select` | Select States | Select state matrix |
| `a-state-link` | Link States | Link state matrix |

## Implementation Pattern

All atoms follow this pattern:
- Use `class-variance-authority` (CVA) for variants
- Use `React.forwardRef` for ref forwarding
- Include comprehensive accessibility attributes
- Support composition via Radix UI Slot

```tsx
// Example atom pattern
import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("base-classes", {
  variants: { ... },
  defaultVariants: { ... }
});

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
```

## ID Convention

All atoms use the `a-` prefix: `a-{category}-{name}`
