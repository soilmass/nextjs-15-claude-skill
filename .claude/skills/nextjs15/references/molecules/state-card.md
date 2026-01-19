---
id: m-state-card
name: State Card
version: 2.0.0
layer: L2
category: state
description: Complete state matrix for card component interactions and visual states
tags: [state, card, matrix, interaction, animation]
formula: "StateCard = Card(m-card) + StateManager(interaction/visual states) + LoadingOverlay + DragSupport"
composes: []
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# State Card

## Overview

The State Card defines the complete visual state matrix for the Card molecule across all interaction states. This reference ensures consistent behavior for cards in default, interactive, loading, selected, disabled, and error states with proper transitions and accessibility.

## When to Use

Use this skill when:
- Implementing interactive card components
- Ensuring consistent card state behavior
- Debugging card interaction issues
- Reviewing card accessibility compliance

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        StateCard (L2)                            │
├─────────────────────────────────────────────────────────────────┤
│                    State Machine Controller                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │    default ──► hover ──► active ──► selected              │  │
│  │       │          │         │            │                 │  │
│  │       ▼          ▼         ▼            ▼                 │  │
│  │    loading    disabled    error     dragging              │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Card (m-card)                            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                  CardContent                        │  │  │
│  │  │                                                     │  │  │
│  │  │    ┌─────────────────────────────────────────┐      │  │  │
│  │  │    │         Loading Overlay (optional)      │      │  │  │
│  │  │    │               🔄 Loader2                │      │  │  │
│  │  │    └─────────────────────────────────────────┘      │  │  │
│  │  │                                                     │  │  │
│  │  │                  {children}                         │  │  │
│  │  │                                                     │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Styles: border-color | background | shadow | scale | opacity    │
└─────────────────────────────────────────────────────────────────┘
```

## State Matrix

### Visual States

| State | Background | Border | Shadow | Scale | Cursor | Opacity |
|-------|------------|--------|--------|-------|--------|---------|
| **Default** | card | border | sm | 1 | default | 100% |
| **Hover** (interactive) | card | primary/50 | md | 1.02 | pointer | 100% |
| **Focus** (interactive) | card | - | sm | 1 | - | 100% |
| **Active/Pressed** | muted | primary | sm | 0.98 | pointer | 100% |
| **Selected** | primary/5 | primary | md | 1 | pointer | 100% |
| **Loading** | card | border | sm | 1 | wait | 70% |
| **Disabled** | muted | border/50 | none | 1 | not-allowed | 50% |
| **Error** | destructive/5 | destructive | sm | 1 | default | 100% |
| **Dragging** | card | primary | lg | 1.05 | grabbing | 90% |
| **Drop Target** | primary/10 | primary dashed | md | 1 | copy | 100% |

### Focus Ring Specifications

| Context | Ring Width | Ring Offset | Ring Color |
|---------|------------|-------------|------------|
| Keyboard Focus | 2px | 2px | ring (primary) |
| Focus Within | 2px | 2px | ring |
| Error + Focus | 2px | 2px | destructive |

### Transition Timings

| Property | Duration | Easing | Trigger |
|----------|----------|--------|---------|
| Background | 150ms | ease-out | hover/state |
| Border | 150ms | ease-out | hover/state |
| Shadow | 200ms | ease-out | hover |
| Transform (scale) | 100ms | ease-out | active/hover |
| Opacity | 150ms | ease | loading/disabled |

## Implementation

```typescript
// components/ui/stateful-card.tsx
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type CardState = 
  | "default" 
  | "hover" 
  | "active" 
  | "selected" 
  | "loading" 
  | "disabled" 
  | "error"
  | "dragging"
  | "dropTarget";

interface StatefulCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current state (usually auto-managed) */
  state?: CardState;
  /** Enable interactive mode */
  interactive?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error state */
  error?: boolean;
  /** Draggable card */
  draggable?: boolean;
  /** Drop target for drag-and-drop */
  isDropTarget?: boolean;
  /** Click handler */
  onClick?: () => void;
}

const stateStyles: Record<CardState, string> = {
  default: "bg-card border-border shadow-sm",
  hover: "bg-card border-primary/50 shadow-md scale-[1.02]",
  active: "bg-muted border-primary shadow-sm scale-[0.98]",
  selected: "bg-primary/5 border-primary shadow-md",
  loading: "bg-card border-border shadow-sm opacity-70 cursor-wait",
  disabled: "bg-muted border-border/50 shadow-none opacity-50 cursor-not-allowed",
  error: "bg-destructive/5 border-destructive shadow-sm",
  dragging: "bg-card border-primary shadow-lg scale-105 opacity-90 cursor-grabbing",
  dropTarget: "bg-primary/10 border-primary border-dashed shadow-md",
};

export function StatefulCard({
  state: externalState,
  interactive = false,
  selected = false,
  loading = false,
  disabled = false,
  error = false,
  draggable = false,
  isDropTarget = false,
  onClick,
  className,
  children,
  ...props
}: StatefulCardProps) {
  const [internalState, setInternalState] = React.useState<CardState>("default");
  
  // Determine effective state (external overrides internal)
  const effectiveState = React.useMemo((): CardState => {
    if (externalState) return externalState;
    if (disabled) return "disabled";
    if (loading) return "loading";
    if (error) return "error";
    if (isDropTarget) return "dropTarget";
    if (selected) return "selected";
    return internalState;
  }, [externalState, disabled, loading, error, isDropTarget, selected, internalState]);

  const handleMouseEnter = () => {
    if (interactive && !disabled && !loading) {
      setInternalState("hover");
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setInternalState(selected ? "selected" : "default");
    }
  };

  const handleMouseDown = () => {
    if (interactive && !disabled && !loading) {
      setInternalState("active");
    }
  };

  const handleMouseUp = () => {
    if (interactive && !disabled && !loading) {
      setInternalState("hover");
    }
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && interactive && !disabled && !loading) {
      e.preventDefault();
      setInternalState("active");
      onClick?.();
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && interactive) {
      setInternalState("hover");
    }
  };

  const handleDragStart = () => {
    if (draggable) {
      setInternalState("dragging");
    }
  };

  const handleDragEnd = () => {
    if (draggable) {
      setInternalState("default");
    }
  };

  return (
    <div
      role={interactive ? "button" : undefined}
      tabIndex={interactive && !disabled ? 0 : undefined}
      aria-disabled={disabled}
      aria-busy={loading}
      aria-selected={selected}
      aria-invalid={error}
      draggable={draggable}
      className={cn(
        "relative rounded-lg border text-card-foreground",
        "transition-all duration-150 ease-out",
        stateStyles[effectiveState],
        interactive && !disabled && !loading && [
          "cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        ],
        error && "focus-visible:ring-destructive",
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-card/50 rounded-lg z-10">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}
      {children}
    </div>
  );
}
```

```css
/* State transitions defined in Tailwind/CSS */

/* Base transition */
.card-stateful {
  transition-property: background-color, border-color, box-shadow, transform, opacity;
  transition-duration: 150ms;
  transition-timing-function: cubic-bezier(0, 0, 0.2, 1); /* ease-out */
}

/* Shadow transition is slightly slower */
.card-stateful {
  transition: 
    background-color 150ms ease-out,
    border-color 150ms ease-out,
    opacity 150ms ease,
    transform 100ms ease-out,
    box-shadow 200ms ease-out;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .card-stateful {
    transition-duration: 0ms;
    transform: none !important;
  }
}
```

### Key Implementation Notes

1. **State Priority**: External state > disabled > loading > error > selected > internal
2. **Event Isolation**: Prevents interaction when disabled/loading
3. **Keyboard Support**: Enter/Space activate interactive cards
4. **Drag Support**: Includes drag-and-drop state handling

## Interaction Flows

### Click Interaction

```
default → hover (mouse enter)
hover → active (mouse down)
active → hover (mouse up)
hover → default (mouse leave)
```

### Keyboard Interaction

```
default → focused (Tab)
focused → active (Enter/Space down)
active → focused (Enter/Space up)
focused → default (Tab away)
```

### Selection Interaction

```
default → hover → active → selected
selected → hover → active → default
```

### Loading Interaction

```
any state → loading (async operation)
loading → previous state or success/error
```

## Accessibility Patterns

### ARIA Mapping

| State | ARIA Attribute | Value |
|-------|----------------|-------|
| Interactive | `role` | "button" |
| Selected | `aria-selected` | "true" |
| Disabled | `aria-disabled` | "true" |
| Loading | `aria-busy` | "true" |
| Error | `aria-invalid` | "true" |
| Expanded (if applicable) | `aria-expanded` | "true"/"false" |

### Focus Management

```typescript
// Focus visible only for keyboard navigation
.card:focus-visible {
  outline: none;
  ring: 2px solid var(--ring);
  ring-offset: 2px;
}

// No focus ring for mouse clicks
.card:focus:not(:focus-visible) {
  outline: none;
  ring: none;
}
```

### Screen Reader Announcements

| State Change | Announcement |
|--------------|--------------|
| Selected | "[Card title] selected" |
| Loading | "[Card title] loading" |
| Error | "[Card title] error: [message]" |
| Disabled | "[Card title] disabled" |

## Examples

### Interactive Selection

```tsx
const [selectedId, setSelectedId] = React.useState<string | null>(null);

<div className="grid gap-4 md:grid-cols-3">
  {items.map((item) => (
    <StatefulCard
      key={item.id}
      interactive
      selected={selectedId === item.id}
      onClick={() => setSelectedId(item.id)}
    >
      <CardContent className="p-6">
        <h3>{item.title}</h3>
      </CardContent>
    </StatefulCard>
  ))}
</div>
```

### Loading State

```tsx
const [isLoading, setIsLoading] = React.useState(false);

<StatefulCard
  interactive
  loading={isLoading}
  onClick={async () => {
    setIsLoading(true);
    await performAction();
    setIsLoading(false);
  }}
>
  <CardContent className="p-6">
    Click to load
  </CardContent>
</StatefulCard>
```

### Error State

```tsx
<StatefulCard error>
  <CardContent className="p-6">
    <div className="flex items-center gap-2 text-destructive">
      <AlertCircle className="h-4 w-4" />
      <span>Failed to load content</span>
    </div>
    <Button variant="outline" size="sm" className="mt-4">
      Retry
    </Button>
  </CardContent>
</StatefulCard>
```

### Drag and Drop

```tsx
<StatefulCard
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData("text/plain", item.id);
  }}
>
  <CardContent className="p-6">
    Drag me
  </CardContent>
</StatefulCard>

<StatefulCard
  isDropTarget={isDraggingOver}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => handleDrop(e.dataTransfer.getData("text/plain"))}
>
  <CardContent className="p-6">
    Drop here
  </CardContent>
</StatefulCard>
```

## Anti-patterns

### Missing Loading Indicator

```tsx
// Bad - state change with no visual feedback
<StatefulCard loading={isLoading}>
  {/* No loading spinner visible */}
</StatefulCard>

// Good - clear loading indication
<StatefulCard loading={isLoading}>
  {/* Shows spinner overlay automatically */}
</StatefulCard>
```

### Conflicting States

```tsx
// Bad - multiple states active
<StatefulCard disabled loading selected />

// Good - state priority handled internally
<StatefulCard disabled /> // Disabled takes precedence
```

### No Focus Indication

```tsx
// Bad - removed focus ring
<StatefulCard className="focus:ring-0" interactive />

// Good - visible focus for accessibility
<StatefulCard interactive /> // Has focus ring by default
```

## Related Skills

### Implements States For
- [molecules/card](./card.md) - Base card component

### Pattern Used By
- [organisms/kanban-board](../organisms/kanban-board.md) - Draggable cards
- [organisms/product-card](../organisms/product-card.md) - Selectable products

### Related State Matrices
- [molecules/state-button](../atoms/state-button.md) - Button states
- [molecules/state-form-field](./state-form-field.md) - Form field states

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial state matrix definition
- StatefulCard implementation
- Drag-and-drop support
- Accessibility patterns
