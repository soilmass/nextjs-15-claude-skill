---
id: o-sheet
name: Sheet
version: 2.0.0
layer: L3
category: overlays
description: Slide-out panel for side navigation, filters, and detailed content
tags: [sheet, sidebar, panel, slide, drawer, navigation]
formula: "Sheet = ScrollArea(m-scroll-area) + Button(a-button) + Separator(a-separator)"
composes: []
dependencies: ["@radix-ui/react-dialog", framer-motion, lucide-react]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Sheet

## Overview

The Sheet organism provides slide-out panels from any edge of the screen. Used for side navigation, filter panels, detail views, and settings. Built on Radix Dialog for accessibility with custom animations.

## When to Use

Use this skill when:
- Building side navigation menus
- Creating filter panels
- Displaying detail/edit views
- Building settings sidebars

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Sheet (slides from edge)                                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Main Page Content                 ┌────────────────────────────────┐   │
│  ┌──────────────────────────────┐  │ SheetContent                   │   │
│  │                              │  │  ┌────────────────────────┐ ✕  │   │
│  │                              │  │  │ SheetHeader            │    │   │
│  │                              │  │  │  SheetTitle            │    │   │
│  │      [Dimmed Overlay]        │◀─│  │  SheetDescription      │    │   │
│  │                              │  │  └────────────────────────┘    │   │
│  │                              │  │  Separator (a-separator)       │   │
│  │                              │  │  ─────────────────────────     │   │
│  │                              │  │                                │   │
│  │                              │  │  ┌────────────────────────┐    │   │
│  │                              │  │  │ ScrollArea             │    │   │
│  │                              │  │  │ (m-scroll-area)        │    │   │
│  │                              │  │  │                        │    │   │
│  │                              │  │  │   Content              │    │   │
│  │                              │  │  │   ...                  │    │   │
│  │                              │  │  │   ...                  │    │   │
│  └──────────────────────────────┘  │  │                        │    │   │
│                                    │  └────────────────────────┘    │   │
│                                    │                                │   │
│                                    │  ┌────────────────────────┐    │   │
│                                    │  │ SheetFooter            │    │   │
│                                    │  │ ┌──────┐  ┌──────────┐ │    │   │
│                                    │  │ │Button│  │  Button  │ │    │   │
│                                    │  │ │Cancel│  │  Save    │ │    │   │
│                                    │  │ └──────┘  └──────────┘ │    │   │
│                                    │  └────────────────────────┘    │   │
│                                    └────────────────────────────────┘   │
│                                                                          │
│  Variants:                                                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  NavigationSheet        FilterSheet           DetailSheet       │    │
│  │  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │    │
│  │  │ 🏠 Dashboard │      │ Category     │      │ Order #12345 │  │    │
│  │  │ 📦 Products  │      │ ☑ Electronics│      │              │  │    │
│  │  │ ⚙ Settings  │      │ ☑ Clothing   │      │ Details...   │  │    │
│  │  │   └ Profile  │      │ Price: ───●  │      │              │  │    │
│  │  │   └ Account  │      │ [Reset][Apply]│      │ [Print][Ship]│  │    │
│  │  └──────────────┘      └──────────────┘      └──────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

## Molecules Used

- [button](../atoms/button.md) - Action buttons
- [separator](../atoms/separator.md) - Section dividers
- [scroll-area](../molecules/scroll-area.md) - Scrollable content

## Implementation

```typescript
// components/organisms/sheet.tsx
"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
        right:
          "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
      },
      size: {
        default: "",
        sm: "",
        md: "",
        lg: "",
        xl: "",
        full: "",
      },
    },
    compoundVariants: [
      { side: "left", size: "sm", class: "sm:max-w-[300px]" },
      { side: "left", size: "md", class: "sm:max-w-[400px]" },
      { side: "left", size: "lg", class: "sm:max-w-[500px]" },
      { side: "left", size: "xl", class: "sm:max-w-[600px]" },
      { side: "left", size: "full", class: "w-full sm:max-w-full" },
      { side: "right", size: "sm", class: "sm:max-w-[300px]" },
      { side: "right", size: "md", class: "sm:max-w-[400px]" },
      { side: "right", size: "lg", class: "sm:max-w-[500px]" },
      { side: "right", size: "xl", class: "sm:max-w-[600px]" },
      { side: "right", size: "full", class: "w-full sm:max-w-full" },
      { side: "top", size: "sm", class: "max-h-[200px]" },
      { side: "top", size: "md", class: "max-h-[300px]" },
      { side: "top", size: "lg", class: "max-h-[400px]" },
      { side: "top", size: "full", class: "h-full max-h-full" },
      { side: "bottom", size: "sm", class: "max-h-[200px]" },
      { side: "bottom", size: "md", class: "max-h-[300px]" },
      { side: "bottom", size: "lg", class: "max-h-[400px]" },
      { side: "bottom", size: "full", class: "h-full max-h-full" },
    ],
    defaultVariants: {
      side: "right",
      size: "default",
    },
  }
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  showClose?: boolean;
}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", size, className, children, showClose = true, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side, size }), className)}
      {...props}
    >
      {children}
      {showClose && (
        <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      )}
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

// Navigation Sheet Component
interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: string;
  children?: NavItem[];
}

interface NavigationSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  items: NavItem[];
  header?: React.ReactNode;
  footer?: React.ReactNode;
  side?: "left" | "right";
  trigger?: React.ReactNode;
}

function NavigationSheet({
  open,
  onOpenChange,
  items,
  header,
  footer,
  side = "left",
  trigger,
}: NavigationSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side={side} className="flex flex-col p-0">
        {header && (
          <div className="p-6 border-b">
            {header}
          </div>
        )}
        <nav className="flex-1 overflow-auto p-4">
          <ul className="space-y-1">
            {items.map((item, index) => (
              <li key={index}>
                <a
                  href={item.href}
                  onClick={() => onOpenChange?.(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                >
                  {item.icon && (
                    <span className="flex-shrink-0 text-muted-foreground">
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {item.badge}
                    </span>
                  )}
                </a>
                {item.children && (
                  <ul className="ml-6 mt-1 space-y-1">
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex}>
                        <a
                          href={child.href}
                          onClick={() => onOpenChange?.(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        >
                          {child.icon}
                          {child.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
        {footer && (
          <div className="p-4 border-t mt-auto">
            {footer}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Filter Sheet Component
interface FilterOption {
  id: string;
  label: string;
  type: "checkbox" | "radio" | "range";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
}

interface FilterSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  filters: FilterOption[];
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  onApply?: () => void;
  onReset?: () => void;
  side?: "left" | "right";
  trigger?: React.ReactNode;
}

function FilterSheet({
  open,
  onOpenChange,
  title = "Filters",
  filters,
  values,
  onChange,
  onApply,
  onReset,
  side = "right",
  trigger,
}: FilterSheetProps) {
  const handleChange = (filterId: string, value: unknown) => {
    onChange({ ...values, [filterId]: value });
  };

  const activeCount = Object.values(values).filter(
    (v) => v !== undefined && v !== null && v !== ""
  ).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side={side} className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {title}
            {activeCount > 0 && (
              <span className="text-sm font-normal text-muted-foreground">
                {activeCount} active
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-auto py-4 -mx-6 px-6">
          <div className="space-y-6">
            {filters.map((filter) => (
              <div key={filter.id} className="space-y-3">
                <h4 className="font-medium text-sm">{filter.label}</h4>

                {filter.type === "checkbox" && filter.options && (
                  <div className="space-y-2">
                    {filter.options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={
                            Array.isArray(values[filter.id]) &&
                            (values[filter.id] as string[]).includes(option.value)
                          }
                          onChange={(e) => {
                            const current = (values[filter.id] as string[]) || [];
                            const newValue = e.target.checked
                              ? [...current, option.value]
                              : current.filter((v) => v !== option.value);
                            handleChange(filter.id, newValue);
                          }}
                          className="rounded border-input"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === "radio" && filter.options && (
                  <div className="space-y-2">
                    {filter.options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name={filter.id}
                          checked={values[filter.id] === option.value}
                          onChange={() => handleChange(filter.id, option.value)}
                          className="border-input"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                )}

                {filter.type === "range" && (
                  <div className="space-y-2">
                    <input
                      type="range"
                      min={filter.min ?? 0}
                      max={filter.max ?? 100}
                      value={(values[filter.id] as number) ?? filter.min ?? 0}
                      onChange={(e) =>
                        handleChange(filter.id, parseInt(e.target.value))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{filter.min ?? 0}</span>
                      <span>{values[filter.id] ?? filter.min ?? 0}</span>
                      <span>{filter.max ?? 100}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <SheetFooter className="gap-2 sm:gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => {
              onApply?.();
              onOpenChange?.(false);
            }}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Apply Filters
          </button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// Detail Sheet Component
interface DetailSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  side?: "left" | "right";
  size?: "default" | "sm" | "md" | "lg" | "xl" | "full";
  trigger?: React.ReactNode;
}

function DetailSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "right",
  size = "md",
  trigger,
}: DetailSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent side={side} size={size} className="flex flex-col">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-auto py-4 -mx-6 px-6">
          {children}
        </div>
        {footer && <SheetFooter>{footer}</SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  NavigationSheet,
  FilterSheet,
  DetailSheet,
};
```

### Key Implementation Notes

1. **Side Variants**: Left, right, top, bottom positioning
2. **Size Options**: Multiple width/height options
3. **Specialized Variants**: Navigation, filter, and detail sheets
4. **Scroll Handling**: Proper overflow for long content

## Variants

### Basic Sheet

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Sheet Title</SheetTitle>
      <SheetDescription>Sheet description</SheetDescription>
    </SheetHeader>
    <div className="py-4">
      {/* Content */}
    </div>
    <SheetFooter>
      <SheetClose asChild>
        <Button variant="outline">Cancel</Button>
      </SheetClose>
      <Button>Save</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### Navigation Sheet

```tsx
<NavigationSheet
  items={[
    { label: "Dashboard", href: "/dashboard", icon: <Home /> },
    { label: "Products", href: "/products", icon: <Package />, badge: "12" },
    {
      label: "Settings",
      href: "/settings",
      icon: <Settings />,
      children: [
        { label: "Profile", href: "/settings/profile" },
        { label: "Account", href: "/settings/account" },
      ],
    },
  ]}
  header={<Logo />}
  footer={<UserMenu />}
  trigger={<Button variant="ghost" size="icon"><Menu /></Button>}
/>
```

### Filter Sheet

```tsx
<FilterSheet
  title="Filter Products"
  filters={[
    {
      id: "category",
      label: "Category",
      type: "checkbox",
      options: [
        { value: "electronics", label: "Electronics" },
        { value: "clothing", label: "Clothing" },
      ],
    },
    {
      id: "price",
      label: "Max Price",
      type: "range",
      min: 0,
      max: 1000,
    },
    {
      id: "sort",
      label: "Sort By",
      type: "radio",
      options: [
        { value: "newest", label: "Newest" },
        { value: "price-asc", label: "Price: Low to High" },
      ],
    },
  ]}
  values={filters}
  onChange={setFilters}
  onApply={applyFilters}
  onReset={resetFilters}
  trigger={<Button variant="outline">Filters</Button>}
/>
```

### Detail Sheet

```tsx
<DetailSheet
  title="Order #12345"
  description="Order placed on Jan 15, 2025"
  size="lg"
  footer={
    <>
      <Button variant="outline">Print</Button>
      <Button>Mark as Shipped</Button>
    </>
  }
  trigger={<Button variant="ghost">View Details</Button>}
>
  <OrderDetails order={order} />
</DetailSheet>
```

### Left Side Sheet

```tsx
<Sheet>
  <SheetTrigger asChild>
    <Button>Menu</Button>
  </SheetTrigger>
  <SheetContent side="left" size="sm">
    <nav>
      {/* Navigation content */}
    </nav>
  </SheetContent>
</Sheet>
```

## Performance

### Animation

- CSS-based slide animations
- Hardware-accelerated transforms
- Optimized for 60fps

### Content Loading

- Content mounts on open
- Unmounts on close (optional)
- Lazy load heavy content

## Accessibility

### Required Attributes

- Sheet has role="dialog"
- Title linked via aria-labelledby
- Description via aria-describedby

### Screen Reader

- Announces when opened
- Content is navigable
- Close action announced

### Keyboard Navigation

- Escape closes sheet
- Tab cycles through content
- Focus trapped within sheet
- Focus returns on close

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "class-variance-authority": "^0.7.1",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Sheet is hidden | Not visible, no overlay |
| Opening | Sheet animating into view | Sliding in from edge with overlay fading in |
| Open | Sheet fully visible | Full panel visible with dimmed overlay behind |
| Closing | Sheet animating out | Sliding out to edge with overlay fading out |
| Scrolling | Content being scrolled | Scroll area active, header may become sticky |
| Focused | Interactive element has focus | Focus ring visible on active element |

## Anti-patterns

### 1. Using Full-Screen Sheet for Small Content

```tsx
// Bad: Full sheet for simple confirmation
<Sheet>
  <SheetContent side="right" size="full">
    <p>Are you sure?</p>
    <Button>Yes</Button>
  </SheetContent>
</Sheet>

// Good: Use appropriate size or a dialog instead
<Sheet>
  <SheetContent side="right" size="sm">
    <SheetHeader>
      <SheetTitle>Confirm Action</SheetTitle>
    </SheetHeader>
    <p>Are you sure you want to proceed?</p>
    <SheetFooter>
      <SheetClose asChild>
        <Button variant="outline">Cancel</Button>
      </SheetClose>
      <Button>Confirm</Button>
    </SheetFooter>
  </SheetContent>
</Sheet>
```

### 2. Not Handling Body Scroll Lock

```tsx
// Bad: Background content still scrollable
function CustomSheet({ open, children }) {
  return (
    <div className={open ? "fixed inset-0" : "hidden"}>
      <div className="bg-black/50" />
      <div className="fixed right-0 w-80">{children}</div>
    </div>
  );
}

// Good: Use Radix Dialog which handles scroll lock automatically
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent>
    {/* Radix handles body scroll lock */}
    {children}
  </SheetContent>
</Sheet>
```

### 3. Missing Close Button and Escape Key Handler

```tsx
// Bad: No way to close the sheet
<SheetContent showClose={false}>
  <div className="p-4">
    <h2>Settings</h2>
    {/* User is trapped! */}
  </div>
</SheetContent>

// Good: Multiple ways to close
<SheetContent>
  <SheetHeader>
    <SheetTitle>Settings</SheetTitle>
  </SheetHeader>
  {/* Close button in corner (showClose default true) */}
  {/* Click overlay to close */}
  {/* Press Escape to close */}
  <SheetFooter>
    <SheetClose asChild>
      <Button variant="outline">Close</Button>
    </SheetClose>
  </SheetFooter>
</SheetContent>
```

### 4. Not Returning Focus on Close

```tsx
// Bad: Focus lost after sheet closes
function MyComponent() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <CustomSheet onClose={() => setOpen(false)} />}
    </>
  );
}

// Good: Use Radix which returns focus automatically
<Sheet open={open} onOpenChange={setOpen}>
  <SheetTrigger asChild>
    <Button>Open Sheet</Button>
  </SheetTrigger>
  <SheetContent>
    {/* Focus returns to trigger when closed */}
  </SheetContent>
</Sheet>
```

## Related Skills

### Composes Into
- [templates/dashboard-layout](../templates/dashboard-layout.md)
- [templates/mobile-layout](../templates/mobile-layout.md)
- [organisms/cart](./cart.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Four side positions
- Size variants
- Navigation, filter, and detail sheets
