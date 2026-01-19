---
id: t-dashboard-layout
name: Dashboard Layout
version: 2.0.0
layer: L4
category: layouts
description: Authenticated dashboard layout with sidebar, header, and content area
tags: [layout, dashboard, admin, sidebar, authenticated, app]
formula: "DashboardLayout = Sidebar(o-sidebar) + Header(o-header) + CommandPalette(o-command-palette) + Breadcrumb(m-breadcrumb)"
composes:
  - ../organisms/sidebar.md
  - ../organisms/header.md
  - ../organisms/command-palette.md
  - ../molecules/breadcrumb.md
dependencies: []
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Dashboard Layout

## Overview

The Dashboard Layout template provides the structure for authenticated application views. Features a collapsible sidebar, top header with user menu, breadcrumbs, and a main content area. Supports both desktop and mobile views with responsive behavior.

## When to Use

Use this skill when:
- Building admin dashboards
- Creating authenticated app views
- Building SaaS application interfaces
- Creating settings/management panels

## Composition Diagram

```
+------------------------------------------------------------------+
|                      DashboardLayout                              |
+------------------------------------------------------------------+
| +------------+  +----------------------------------------------+  |
| | o Sidebar  |  |  o Header                                    |  |
| | +--------+ |  |  +----------------------------------------+  |  |
| | | Logo   | |  |  | [=] | m Breadcrumb      | [?] [Bell] [O]|  |  |
| | | Acme   | |  |  +----------------------------------------+  |  |
| | +--------+ |  +----------------------------------------------+  |
| |            |                                                    |
| | Main Nav   |  +----------------------------------------------+  |
| | +--------+ |  |                                              |  |
| | |Dashboard||  |                   {children}                  |  |
| | |Analytics||  |                                              |  |
| | |Users   >||  |               Page Content Area              |  |
| | | - All   ||  |                                              |  |
| | | - Teams ||  |  (DashboardHome, SettingsPage, etc.)         |  |
| | | - Roles ||  |                                              |  |
| | |Products>||  |                                              |  |
| | |Orders   ||  |                                              |  |
| | |Billing  ||  |                                              |  |
| | +--------+ |  |                                              |  |
| |            |  |                                              |  |
| | Settings   |  |                                              |  |
| | +--------+ |  |                                              |  |
| | |Settings ||  |                                              |  |
| | |Notifs   ||  |                                              |  |
| | |Help     ||  +----------------------------------------------+  |
| | +--------+ |                                                    |
| |            |                                                    |
| | +--------+ |  +----------------------------------------------+  |
| | | User   | |  |  o CommandPalette (Cmd+K)                    |  |
| | | Menu   | |  |  [Search commands and pages...]              |  |
| | +--------+ |  +----------------------------------------------+  |
| +------------+                                                    |
+------------------------------------------------------------------+
```

## Organisms Used

- [sidebar](../organisms/sidebar.md) - Navigation sidebar
- [header](../organisms/header.md) - Dashboard header
- [command-palette](../organisms/command-palette.md) - Quick actions

## Implementation

```typescript
// app/(dashboard)/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { CommandPalette } from "@/components/organisms/command-palette";
import { Separator } from "@/components/ui/separator";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  // Authentication check
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  // Get sidebar state from cookies
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      {/* Sidebar */}
      <AppSidebar user={session.user} />
      
      {/* Main Content */}
      <SidebarInset>
        {/* Dashboard Header */}
        <DashboardHeader user={session.user} />
        
        {/* Page Content */}
        <main id="main-content" className="flex-1 overflow-auto">
          <div className="container py-6">
            {children}
          </div>
        </main>
      </SidebarInset>

      {/* Command Palette (Cmd+K) */}
      <CommandPalette />
    </SidebarProvider>
  );
}
```

### App Sidebar Component

```typescript
// components/dashboard/app-sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  BarChart3,
  Package,
  CreditCard,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AppSidebarProps {
  user: User;
}

// Navigation configuration
const mainNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/dashboard/analytics",
  },
  {
    title: "Users",
    icon: Users,
    href: "/dashboard/users",
    items: [
      { title: "All Users", href: "/dashboard/users" },
      { title: "Teams", href: "/dashboard/users/teams" },
      { title: "Roles", href: "/dashboard/users/roles" },
    ],
  },
  {
    title: "Products",
    icon: Package,
    href: "/dashboard/products",
    items: [
      { title: "All Products", href: "/dashboard/products" },
      { title: "Categories", href: "/dashboard/products/categories" },
      { title: "Inventory", href: "/dashboard/products/inventory" },
    ],
  },
  {
    title: "Orders",
    icon: FileText,
    href: "/dashboard/orders",
  },
  {
    title: "Billing",
    icon: CreditCard,
    href: "/dashboard/billing",
  },
];

const secondaryNavItems = [
  { title: "Settings", icon: Settings, href: "/dashboard/settings" },
  { title: "Notifications", icon: Bell, href: "/dashboard/notifications" },
  { title: "Help", icon: HelpCircle, href: "/dashboard/help" },
];

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Home className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Acme Inc</span>
                  <span className="truncate text-xs text-muted-foreground">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <React.Fragment key={item.title}>
                  {item.items ? (
                    <Collapsible
                      asChild
                      defaultOpen={pathname.startsWith(item.href)}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            isActive={pathname === item.href}
                          >
                            <item.icon className="size-4" />
                            <span>{item.title}</span>
                            <ChevronDown className="ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.items.map((subItem) => (
                              <SidebarMenuSubItem key={subItem.title}>
                                <SidebarMenuSubButton
                                  asChild
                                  isActive={pathname === subItem.href}
                                >
                                  <Link href={subItem.href}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        isActive={pathname === item.href}
                      >
                        <Link href={item.href}>
                          <item.icon className="size-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                </React.Fragment>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Secondary Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={pathname === item.href}
                  >
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User Menu */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                  <ChevronDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
```

### Dashboard Header Component

```typescript
// components/dashboard/dashboard-header.tsx
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Bell, Search, Command } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      {/* Sidebar Toggle */}
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      
      {/* Breadcrumbs */}
      <Breadcrumbs />
      
      {/* Spacer */}
      <div className="ml-auto flex items-center gap-2">
        {/* Search */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                Search <kbd className="ml-1 rounded bg-muted px-1">⌘K</kbd>
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
            3
          </span>
          <span className="sr-only">Notifications</span>
        </Button>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
```

## Key Implementation Notes

1. **Authentication**: Redirects unauthenticated users
2. **Sidebar State**: Persisted via cookies
3. **Collapsible Sidebar**: Icon mode on collapse
4. **Nested Navigation**: Support for sub-items
5. **Command Palette**: Cmd+K for quick actions

## Variants

### With Search Bar in Header

```tsx
<header className="...">
  <SidebarTrigger />
  <div className="flex-1 mx-4">
    <div className="relative max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search..."
        className="pl-10"
      />
    </div>
  </div>
  {/* ... rest of header */}
</header>
```

### With Page Tabs

```tsx
<SidebarInset>
  <DashboardHeader user={session.user} />
  <div className="border-b">
    <Tabs defaultValue="overview" className="container">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
    </Tabs>
  </div>
  <main className="flex-1 overflow-auto">
    {children}
  </main>
</SidebarInset>
```

## Performance

### Sidebar Optimization

- State persisted in cookies (SSR)
- Collapsed state uses CSS
- Menu items are links (prefetchable)

### Authentication

- Session checked at layout level
- Redirect happens server-side
- User data passed to children

## Accessibility

### Required Features

- Sidebar toggle is keyboard accessible
- Skip links preserved
- Focus management on collapse
- ARIA labels on buttons

### Screen Reader

- Navigation landmarks
- Current page indicated
- User menu announced

## Route Group Structure

```
app/
├── (dashboard)/
│   ├── layout.tsx           # Dashboard layout
│   ├── dashboard/
│   │   ├── page.tsx         # Dashboard home
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   └── billing/
│   │       └── page.tsx
```

## Error States

### Layout Error Boundary

```tsx
// app/(dashboard)/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Dashboard layout error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Dashboard Error
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {error.message || 'An error occurred loading the dashboard.'}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              Error ID: {error.digest}
            </p>
          )}
          <div className="flex gap-3">
            <Button onClick={reset} variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <a href="/logout">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Session Error Handling

```tsx
// components/dashboard/session-guard.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, LogIn } from 'lucide-react';

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (!res.ok) {
          if (res.status === 401) {
            setSessionError('Session expired');
          }
        }
      } catch {
        setSessionError('Unable to verify session');
      }
    };

    // Check session periodically
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, []);

  if (sessionError) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="mx-4 max-w-md rounded-xl border bg-card p-6 shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
          <h2 className="mt-4 text-center text-lg font-semibold">{sessionError}</h2>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Please sign in again to continue.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
```

## Loading States

### Layout Loading Skeleton

```tsx
// app/(dashboard)/loading.tsx
export default function DashboardLoading() {
  return (
    <div className="flex h-screen">
      {/* Sidebar skeleton */}
      <div className="hidden w-64 border-r bg-card lg:block">
        <div className="flex h-16 items-center gap-3 border-b px-4">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="space-y-2 p-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex flex-1 flex-col">
        {/* Header skeleton */}
        <div className="flex h-16 items-center gap-4 border-b px-4">
          <div className="h-8 w-8 animate-pulse rounded bg-muted lg:hidden" />
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="ml-auto flex gap-2">
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            <div className="h-8 w-8 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Content skeleton */}
        <div className="flex-1 p-6">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border p-6">
                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-8 w-24 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Sidebar Loading State

```tsx
// components/dashboard/sidebar-skeleton.tsx
export function SidebarSkeleton() {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        <div className="space-y-1">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 space-y-6 p-4">
        <div className="space-y-2">
          <div className="h-3 w-12 animate-pulse rounded bg-muted" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-2">
              <div className="h-4 w-4 animate-pulse rounded bg-muted" />
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          <div className="space-y-1">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-3 w-28 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Sidebar

```tsx
// components/dashboard/responsive-sidebar.tsx
'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ResponsiveSidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Mobile trigger */}
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-lg p-2 hover:bg-accent lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform bg-card transition-transform duration-300 lg:static lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Close button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-2 hover:bg-accent lg:hidden"
          aria-label="Close navigation"
        >
          <X className="h-5 w-5" />
        </button>

        {children}
      </aside>
    </>
  );
}
```

### Mobile Bottom Navigation

```tsx
// components/dashboard/mobile-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, BarChart, Users, Settings, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/analytics', icon: BarChart, label: 'Analytics' },
  { href: '/dashboard/new', icon: Plus, label: 'New', accent: true },
  { href: '/dashboard/users', icon: Users, label: 'Users' },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-card pb-safe lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2',
                item.accent
                  ? 'rounded-full bg-primary -mt-6 p-4 text-primary-foreground shadow-lg'
                  : isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
              )}
            >
              <item.icon className={cn('h-5 w-5', item.accent && 'h-6 w-6')} />
              {!item.accent && <span className="text-xs">{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

### Breakpoint Reference

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Sidebar | Hidden (overlay) | Hidden (overlay) | Visible (fixed) |
| Header height | 56px | 64px | 64px |
| Bottom nav | Visible | Visible | Hidden |
| Content padding | 16px | 24px | 24px |
| Main margin-bottom | 72px (for bottom nav) | 72px | 0 |

## SEO Considerations

### Metadata for Dashboard

```tsx
// app/(dashboard)/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard',
    default: 'Dashboard',
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};
```

### Page-Level Metadata

```tsx
// app/(dashboard)/dashboard/analytics/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics',
  description: 'View your analytics and performance metrics',
};
```

## Testing Strategies

### Layout Testing

```tsx
// __tests__/dashboard-layout.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardLayout from '@/app/(dashboard)/layout';

// Mock auth
vi.mock('@/lib/auth', () => ({
  getSession: vi.fn().mockResolvedValue({
    user: { name: 'John Doe', email: 'john@example.com' },
  }),
}));

// Mock cookies
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue({ value: 'true' }),
  }),
}));

describe('DashboardLayout', () => {
  it('renders sidebar and header', async () => {
    const layout = await DashboardLayout({ children: <div>Content</div> });
    render(layout);

    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('displays user info in sidebar', async () => {
    const layout = await DashboardLayout({ children: <div>Content</div> });
    render(layout);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('toggles sidebar on mobile', async () => {
    const layout = await DashboardLayout({ children: <div>Content</div> });
    render(layout);

    const menuButton = screen.getByLabelText('Open navigation');
    fireEvent.click(menuButton);

    expect(screen.getByRole('complementary')).toHaveClass('translate-x-0');
  });
});
```

### E2E Testing

```tsx
// e2e/dashboard-layout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.click('text=Analytics');
    await expect(page).toHaveURL('/dashboard/analytics');

    await page.click('text=Settings');
    await expect(page).toHaveURL('/dashboard/settings');
  });

  test('mobile sidebar opens and closes', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Open sidebar
    await page.click('[aria-label="Open navigation"]');
    await expect(page.locator('aside')).toBeVisible();

    // Close with X button
    await page.click('[aria-label="Close navigation"]');
    await expect(page.locator('aside')).not.toBeVisible();
  });

  test('command palette opens with keyboard', async ({ page }) => {
    await page.keyboard.press('Meta+k');
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test('breadcrumbs show correct path', async ({ page }) => {
    await page.goto('/dashboard/users/123');
    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Users')).toBeVisible();
  });
});
```

### Accessibility Testing

```tsx
// __tests__/dashboard-layout-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import DashboardLayout from '@/app/(dashboard)/layout';

expect.extend(toHaveNoViolations);

describe('DashboardLayout Accessibility', () => {
  it('has no accessibility violations', async () => {
    const layout = await DashboardLayout({ children: <div>Content</div> });
    const { container } = render(layout);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has skip link', async () => {
    const layout = await DashboardLayout({ children: <div>Content</div> });
    const { getByText } = render(layout);
    expect(getByText('Skip to main content')).toBeInTheDocument();
  });

  it('sidebar has proper ARIA attributes', async () => {
    const layout = await DashboardLayout({ children: <div>Content</div> });
    const { getByRole } = render(layout);

    const nav = getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label');
  });
});
```

## Related Skills

### Composes Into
- [templates/dashboard-home](./dashboard-home.md)
- [templates/settings-page](./settings-page.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Collapsible sidebar
- Authentication check
- Command palette integration
