---
id: m-tabs
name: Tabs
version: 2.0.0
layer: L2
category: navigation
description: Accessible tabs with Radix UI primitives and URL sync
tags: [tabs, tablist, panel, navigation, radix]
formula: "Tabs = TabTrigger(a-input-button) + TabLabel(a-display-text)"
composes:
  - ../atoms/input-button.md
  - ../atoms/display-text.md
dependencies:
  "@radix-ui/react-tabs": "^1.1.1"
  nuqs: "^2.2.0"
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

The Tabs molecule provides content organization with accessible tab navigation. Built on Radix UI Tabs for proper keyboard navigation, roving tabindex, and ARIA semantics. Supports URL synchronization and vertical orientation.

## When to Use

Use this skill when:
- Organizing related content in a single view
- Building settings pages with sections
- Creating tabbed interfaces for data views
- Providing multiple views of the same data

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                            Tabs                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────── TabsList ───────────────────────────┐ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │ │
│  │  │ TabTrigger  │  │ TabTrigger  │  │ TabTrigger  │        │ │
│  │  │(a-input-btn)│  │(a-input-btn)│  │(a-input-btn)│        │ │
│  │  │             │  │             │  │             │        │ │
│  │  │  [Account]  │  │  Password   │  │  Settings   │        │ │
│  │  │   active    │  │             │  │             │        │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘        │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────── TabsContent ────────────────────────┐ │
│  │                                                            │ │
│  │                   Panel content here                       │ │
│  │               (associated with active tab)                 │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘

Underline Variant:
┌─────────────────────────────────────────────────────────────────┐
│   Profile     Account     Security     Notifications            │
│   ═══════     ───────     ────────     ─────────────            │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [input-button](../atoms/input-button.md) - Tab triggers
- [display-text](../atoms/display-text.md) - Tab labels

## Implementation

```typescript
// components/ui/tabs.tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: "default" | "outline" | "pills";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
    outline: "inline-flex h-10 items-center justify-center gap-1 border-b",
    pills: "inline-flex items-center justify-center gap-2",
  };

  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(variantStyles[variant], className)}
      {...props}
    />
  );
});
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: "default" | "outline" | "pills";
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = {
    default: [
      "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5",
      "text-sm font-medium ring-offset-background transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm",
    ],
    outline: [
      "inline-flex items-center justify-center whitespace-nowrap px-3 py-2",
      "text-sm font-medium text-muted-foreground transition-all border-b-2 border-transparent -mb-px",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      "hover:text-foreground",
      "data-[state=active]:text-foreground data-[state=active]:border-primary",
    ],
    pills: [
      "inline-flex items-center justify-center whitespace-nowrap rounded-full px-4 py-2",
      "text-sm font-medium transition-all",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "hover:bg-accent hover:text-accent-foreground",
      "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
    ],
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(variantStyles[variant], className)}
      {...props}
    />
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
```

```typescript
// components/ui/url-tabs.tsx
"use client";

import { useQueryState } from "nuqs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

interface UrlTabsProps {
  /** URL parameter name */
  paramName?: string;
  /** Default tab value */
  defaultValue: string;
  /** Tab configuration */
  tabs: Array<{
    value: string;
    label: string;
    content: React.ReactNode;
    disabled?: boolean;
  }>;
  /** List variant */
  variant?: "default" | "outline" | "pills";
  className?: string;
}

export function UrlTabs({
  paramName = "tab",
  defaultValue,
  tabs,
  variant = "default",
  className,
}: UrlTabsProps) {
  const [activeTab, setActiveTab] = useQueryState(paramName, {
    defaultValue,
  });

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => setActiveTab(value)}
      className={className}
    >
      <TabsList variant={variant}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.value}
            value={tab.value}
            variant={variant}
            disabled={tab.disabled}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.value} value={tab.value}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

```typescript
// components/ui/vertical-tabs.tsx
"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface VerticalTabsProps {
  tabs: Array<{
    value: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
  }>;
  defaultValue: string;
  className?: string;
}

export function VerticalTabs({
  tabs,
  defaultValue,
  className,
}: VerticalTabsProps) {
  return (
    <TabsPrimitive.Root
      defaultValue={defaultValue}
      orientation="vertical"
      className={cn("flex gap-6", className)}
    >
      <TabsPrimitive.List className="flex flex-col gap-1 w-48 shrink-0">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.value}
            value={tab.value}
            className={cn(
              "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-left",
              "text-muted-foreground transition-colors",
              "hover:text-foreground hover:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "data-[state=active]:text-primary data-[state=active]:bg-primary/10"
            )}
          >
            {tab.icon}
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      
      <div className="flex-1 min-w-0">
        {tabs.map((tab) => (
          <TabsPrimitive.Content
            key={tab.value}
            value={tab.value}
            className="focus-visible:outline-none"
          >
            {tab.content}
          </TabsPrimitive.Content>
        ))}
      </div>
    </TabsPrimitive.Root>
  );
}
```

### Key Implementation Notes

1. **Radix Primitives**: Uses Radix UI for proper ARIA and keyboard navigation
2. **Roving Tabindex**: Arrow keys navigate between tabs, Tab moves to content

## Variants

### Default (Contained)

```tsx
<Tabs defaultValue="account">
  <TabsList>
    <TabsTrigger value="account">Account</TabsTrigger>
    <TabsTrigger value="password">Password</TabsTrigger>
    <TabsTrigger value="settings">Settings</TabsTrigger>
  </TabsList>
  <TabsContent value="account">Account settings...</TabsContent>
  <TabsContent value="password">Password settings...</TabsContent>
  <TabsContent value="settings">Other settings...</TabsContent>
</Tabs>
```

### Outline (Underline)

```tsx
<Tabs defaultValue="overview">
  <TabsList variant="outline">
    <TabsTrigger value="overview" variant="outline">Overview</TabsTrigger>
    <TabsTrigger value="analytics" variant="outline">Analytics</TabsTrigger>
    <TabsTrigger value="reports" variant="outline">Reports</TabsTrigger>
  </TabsList>
  {/* Content */}
</Tabs>
```

### Pills

```tsx
<Tabs defaultValue="all">
  <TabsList variant="pills">
    <TabsTrigger value="all" variant="pills">All</TabsTrigger>
    <TabsTrigger value="active" variant="pills">Active</TabsTrigger>
    <TabsTrigger value="archived" variant="pills">Archived</TabsTrigger>
  </TabsList>
  {/* Content */}
</Tabs>
```

### URL Synced

```tsx
<UrlTabs
  paramName="section"
  defaultValue="profile"
  tabs={[
    { value: "profile", label: "Profile", content: <ProfileTab /> },
    { value: "security", label: "Security", content: <SecurityTab /> },
    { value: "billing", label: "Billing", content: <BillingTab /> },
  ]}
/>
```

### Vertical

```tsx
<VerticalTabs
  defaultValue="general"
  tabs={[
    { value: "general", label: "General", icon: <Settings />, content: <GeneralSettings /> },
    { value: "notifications", label: "Notifications", icon: <Bell />, content: <NotificationSettings /> },
    { value: "integrations", label: "Integrations", icon: <Plug />, content: <IntegrationSettings /> },
  ]}
/>
```

## States

| State | Background | Text | Border |
|-------|------------|------|--------|
| Default | transparent | muted-foreground | none |
| Hover | accent | foreground | none |
| Focus | transparent | foreground | ring-2 |
| Active | background/primary | foreground | shadow/border |
| Disabled | transparent | muted | none |

## Accessibility

### Required ARIA Attributes

- `role="tablist"` on TabsList (automatic)
- `role="tab"` on TabsTrigger (automatic)
- `role="tabpanel"` on TabsContent (automatic)
- `aria-selected` on active tab (automatic)
- `aria-controls` linking tab to panel (automatic)

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus to active tab, then to content |
| `Arrow Left/Right` | Navigate between tabs (horizontal) |
| `Arrow Up/Down` | Navigate between tabs (vertical) |
| `Home` | Focus first tab |
| `End` | Focus last tab |
| `Enter/Space` | Activate focused tab |

### Screen Reader Announcements

- Tab count and position announced
- "Selected" announced for active tab
- Panel content associated with tab

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-tabs": "^1.1.1",
    "nuqs": "^2.2.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install @radix-ui/react-tabs nuqs lucide-react
```

## Examples

### Settings Page

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { User, Lock, CreditCard, Bell } from "lucide-react";

export function SettingsPage() {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList variant="outline" className="w-full justify-start">
        <TabsTrigger value="profile" variant="outline" className="gap-2">
          <User className="h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="security" variant="outline" className="gap-2">
          <Lock className="h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger value="billing" variant="outline" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Billing
        </TabsTrigger>
        <TabsTrigger value="notifications" variant="outline" className="gap-2">
          <Bell className="h-4 w-4" />
          Notifications
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="mt-6">
        <ProfileSettings />
      </TabsContent>
      <TabsContent value="security" className="mt-6">
        <SecuritySettings />
      </TabsContent>
      <TabsContent value="billing" className="mt-6">
        <BillingSettings />
      </TabsContent>
      <TabsContent value="notifications" className="mt-6">
        <NotificationSettings />
      </TabsContent>
    </Tabs>
  );
}
```

### Dashboard with URL Tabs

```tsx
import { UrlTabs } from "@/components/ui/url-tabs";

export function DashboardPage() {
  return (
    <UrlTabs
      paramName="view"
      defaultValue="overview"
      variant="pills"
      tabs={[
        { value: "overview", label: "Overview", content: <OverviewChart /> },
        { value: "analytics", label: "Analytics", content: <AnalyticsChart /> },
        { value: "reports", label: "Reports", content: <ReportsTable /> },
        { value: "export", label: "Export", content: <ExportOptions /> },
      ]}
    />
  );
}
```

### Lazy Loading Tab Content

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Suspense, lazy } from "react";

const HeavyComponent = lazy(() => import("./HeavyComponent"));

export function LazyTabs() {
  return (
    <Tabs defaultValue="simple">
      <TabsList>
        <TabsTrigger value="simple">Simple</TabsTrigger>
        <TabsTrigger value="heavy">Heavy</TabsTrigger>
      </TabsList>
      
      <TabsContent value="simple">
        <p>This loads immediately</p>
      </TabsContent>
      
      <TabsContent value="heavy">
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <HeavyComponent />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
```

### Controlled Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState } from "react";

export function ControlledTabs() {
  const [activeTab, setActiveTab] = useState("tab1");

  const handleTabChange = (value: string) => {
    // Custom logic before changing
    if (value === "tab3" && !hasPermission) {
      toast.error("You don't have permission");
      return;
    }
    setActiveTab(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList>
        <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        <TabsTrigger value="tab3">Tab 3 (Restricted)</TabsTrigger>
      </TabsList>
      {/* Content */}
    </Tabs>
  );
}
```

## Anti-patterns

### Using Tabs for Navigation

```tsx
// Bad - tabs should switch content, not navigate
<TabsTrigger onClick={() => router.push("/page")}>Page</TabsTrigger>

// Good - use NavLink for navigation
<NavLink href="/page">Page</NavLink>
```

### Too Many Tabs

```tsx
// Bad - cognitive overload
<TabsList>
  {Array.from({ length: 10 }).map((_, i) => (
    <TabsTrigger key={i} value={`tab${i}`}>Tab {i}</TabsTrigger>
  ))}
</TabsList>

// Good - group or use dropdown for many options
<TabsList>
  <TabsTrigger value="main">Main</TabsTrigger>
  <TabsTrigger value="settings">Settings</TabsTrigger>
  <DropdownMenu>
    <DropdownMenuTrigger>More...</DropdownMenuTrigger>
    <DropdownMenuContent>...</DropdownMenuContent>
  </DropdownMenu>
</TabsList>
```

### Missing Content Association

```tsx
// Bad - content outside tabs
<TabsList>...</TabsList>
<div>Content here</div> {/* Not associated */}

// Good - use TabsContent
<TabsContent value="tab1">Content here</TabsContent>
```

## Related Skills

### Composes From
- [atoms/input-button](../atoms/input-button.md) - Tab triggers
- [atoms/display-text](../atoms/display-text.md) - Labels

### Composes Into
- [organisms/settings-form](../organisms/settings-form.md) - Settings sections
- [templates/dashboard](../templates/dashboard.md) - Dashboard views

### Alternatives
- [molecules/nav-link](./nav-link.md) - For page navigation
- [organisms/accordion](../organisms/accordion.md) - For vertical expansion

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with Radix UI
- Three variants: default, outline, pills
- URL sync with nuqs
- Vertical tabs component
