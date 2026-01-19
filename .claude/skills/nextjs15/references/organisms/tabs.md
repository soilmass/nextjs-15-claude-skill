---
id: o-tabs
name: Tabs
version: 1.0.0
layer: L3
category: navigation
description: Tabbed interface component with keyboard navigation and content panels
tags: [tabs, navigation, panels, tablist, content]
formula: "Tabs = TabList + TabTrigger(m-tabs) + TabPanel + Badge(a-badge)"
composes:
  - ../molecules/tabs.md
  - ../atoms/display-badge.md
dependencies: ["@radix-ui/react-tabs", "framer-motion", "lucide-react"]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Tabs

## Overview

The Tabs organism provides a fully accessible tabbed interface with keyboard navigation, animated transitions, and support for icons, badges, and disabled states. Built on Radix UI Tabs for accessibility.

## When to Use

Use this skill when:
- Organizing content into logical sections
- Building settings pages with multiple categories
- Creating dashboard views with different data sets
- Implementing product detail pages with tabs

## Composition Diagram

```
+---------------------------------------------------------------------+
|                          Tabs (L3)                                   |
+---------------------------------------------------------------------+
|  TabList (variant: default | pills | underline):                    |
|  +---------------------------------------------------------------+  |
|  | [Tab 1] (active)  | [Tab 2]  | [Tab 3 (3)]  | [Tab 4] disabled|  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  TabPanel (active):                                                |
|  +---------------------------------------------------------------+  |
|  |                                                               |  |
|  |  Content for Tab 1                                            |  |
|  |  (animated fade/slide transition)                             |  |
|  |                                                               |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/tabs.tsx
'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  value: string;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
  content: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  animated?: boolean;
  className?: string;
}

const variantStyles = {
  default: {
    list: 'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1',
    trigger: cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5',
      'text-sm font-medium ring-offset-background transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm'
    ),
  },
  pills: {
    list: 'inline-flex items-center gap-2',
    trigger: cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2',
      'text-sm font-medium transition-all',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=inactive]:bg-muted data-[state=inactive]:hover:bg-muted/80',
      'data-[state=active]:bg-primary data-[state=active]:text-primary-foreground'
    ),
  },
  underline: {
    list: 'inline-flex items-center border-b',
    trigger: cn(
      'inline-flex items-center justify-center whitespace-nowrap px-4 py-2',
      'text-sm font-medium transition-all border-b-2 -mb-px',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=inactive]:border-transparent data-[state=inactive]:text-muted-foreground',
      'data-[state=inactive]:hover:text-foreground data-[state=inactive]:hover:border-muted-foreground/50',
      'data-[state=active]:border-primary data-[state=active]:text-foreground'
    ),
  },
};

const sizeStyles = {
  sm: {
    trigger: 'text-xs px-2 py-1',
    icon: 'h-3 w-3',
    badge: 'text-[10px] px-1',
  },
  md: {
    trigger: '',
    icon: 'h-4 w-4',
    badge: 'text-xs px-1.5',
  },
  lg: {
    trigger: 'text-base px-4 py-2',
    icon: 'h-5 w-5',
    badge: 'text-sm px-2',
  },
};

export function Tabs({
  items,
  defaultValue,
  value,
  onValueChange,
  variant = 'default',
  size = 'md',
  fullWidth = false,
  animated = true,
  className,
}: TabsProps) {
  const styles = variantStyles[variant];
  const sizes = sizeStyles[size];
  const [activeTab, setActiveTab] = React.useState(defaultValue || items[0]?.value);

  const handleValueChange = (newValue: string) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };

  return (
    <TabsPrimitive.Root
      value={value || activeTab}
      onValueChange={handleValueChange}
      className={cn('w-full', className)}
    >
      <TabsPrimitive.List
        className={cn(
          styles.list,
          fullWidth && 'flex w-full'
        )}
      >
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <TabsPrimitive.Trigger
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className={cn(
                styles.trigger,
                sizes.trigger,
                fullWidth && 'flex-1'
              )}
            >
              {Icon && <Icon className={cn('mr-2', sizes.icon)} />}
              <span>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'ml-2 rounded-full bg-muted-foreground/20',
                    sizes.badge
                  )}
                >
                  {item.badge}
                </span>
              )}
            </TabsPrimitive.Trigger>
          );
        })}
      </TabsPrimitive.List>

      <div className="mt-4">
        <AnimatePresence mode="wait">
          {items.map((item) => (
            <TabsPrimitive.Content
              key={item.value}
              value={item.value}
              forceMount
              className="data-[state=inactive]:hidden"
            >
              {animated ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.content}
                </motion.div>
              ) : (
                item.content
              )}
            </TabsPrimitive.Content>
          ))}
        </AnimatePresence>
      </div>
    </TabsPrimitive.Root>
  );
}

// Compound components for more control
export const TabsRoot = TabsPrimitive.Root;
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: 'default' | 'pills' | 'underline';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(variantStyles[variant].list, className)}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: 'default' | 'pills' | 'underline';
  }
>(({ className, variant = 'default', ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(variantStyles[variant].trigger, className)}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      className
    )}
    {...props}
  />
));
TabsContent.displayName = 'TabsContent';
```

## Usage

### Basic Usage

```tsx
import { Tabs } from '@/components/organisms/tabs';
import { User, Settings, Bell } from 'lucide-react';

const tabItems = [
  {
    value: 'profile',
    label: 'Profile',
    icon: User,
    content: <ProfileSettings />,
  },
  {
    value: 'notifications',
    label: 'Notifications',
    icon: Bell,
    badge: 3,
    content: <NotificationSettings />,
  },
  {
    value: 'security',
    label: 'Security',
    icon: Settings,
    content: <SecuritySettings />,
  },
];

export function SettingsPage() {
  return <Tabs items={tabItems} variant="underline" />;
}
```

### Pills Variant

```tsx
<Tabs items={tabItems} variant="pills" size="lg" />
```

### Controlled Tabs

```tsx
const [activeTab, setActiveTab] = React.useState('profile');

<Tabs
  items={tabItems}
  value={activeTab}
  onValueChange={setActiveTab}
/>
```

### Compound Components

```tsx
import { TabsRoot, TabsList, TabsTrigger, TabsContent } from '@/components/organisms/tabs';

<TabsRoot defaultValue="tab1">
  <TabsList variant="underline">
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</TabsRoot>
```

## Accessibility

- Full keyboard navigation (Arrow keys, Home, End)
- ARIA tablist, tab, and tabpanel roles
- Focus management between tabs
- Disabled tabs are not focusable

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-tabs": "^1.0.4",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Tab list with one tab active | Active tab highlighted |
| Hover | Hovering over inactive tab | Subtle background highlight |
| Focus | Tab trigger has keyboard focus | Focus ring visible |
| Active | Tab is currently selected | Full highlight, content shown |
| Disabled | Tab cannot be selected | Muted color, cursor not-allowed |
| Loading | Tab content is loading | Content area shows spinner |
| Animated | Content transitioning | Fade/slide animation |

## Anti-patterns

### 1. Using index as key instead of unique value

```tsx
// Bad: Using array index as key causes issues on reorder
{items.map((item, index) => (
  <TabsTrigger key={index} value={item.value}>
    {item.label}
  </TabsTrigger>
))}

// Good: Use unique value as key
{items.map((item) => (
  <TabsTrigger key={item.value} value={item.value}>
    {item.label}
  </TabsTrigger>
))}
```

### 2. Mounting all tab content regardless of visibility

```tsx
// Bad: All panels render even when hidden
<TabsContent value="tab1">
  <ExpensiveComponent /> {/* Always rendered */}
</TabsContent>

// Good: Use forceMount only when needed, otherwise lazy load
<TabsContent value="tab1" forceMount={false}>
  <ExpensiveComponent /> {/* Only renders when active */}
</TabsContent>

// Or conditionally render for expensive components
{activeTab === 'tab1' && <ExpensiveComponent />}
```

### 3. Not syncing controlled state properly

```tsx
// Bad: Internal and external state can desync
function Tabs({ value, onValueChange }) {
  const [activeTab, setActiveTab] = useState(value);

  const handleChange = (v) => {
    setActiveTab(v); // Internal state
    onValueChange?.(v); // External callback
  };
}

// Good: Prefer single source of truth
function Tabs({ value, onValueChange, defaultValue }) {
  // Let Radix handle internal state for uncontrolled
  // Or use only external value for controlled
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      defaultValue={defaultValue}
    >
      {/* ... */}
    </TabsPrimitive.Root>
  );
}
```

### 4. Missing keyboard navigation hints

```tsx
// Bad: No indication of keyboard support
<TabsList>
  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
</TabsList>

// Good: ARIA attributes are handled by Radix, but ensure proper labeling
<TabsList aria-label="Account settings">
  <TabsTrigger
    value="profile"
    aria-label="Profile settings tab"
  >
    Profile
  </TabsTrigger>
</TabsList>

// Radix automatically handles:
// - Arrow key navigation
// - Home/End keys
// - Tab focus management
```

## Related Skills

- [molecules/tabs](../molecules/tabs.md)
- [organisms/sidebar](./sidebar.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Multiple variants (default, pills, underline)
- Size options
- Animated transitions
