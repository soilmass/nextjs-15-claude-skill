---
id: t-admin-layout
name: Admin Layout
version: 2.0.0
layer: L4
category: layouts
description: Admin panel layout with sidebar navigation and dashboard structure
tags: [admin, dashboard, layout, sidebar, navigation]
performance:
  impact: medium
  lcp: medium
  cls: low
composes:
  - ../organisms/sidebar.md
  - ../organisms/header.md
  - ../molecules/breadcrumb.md
formula: "AdminLayout = Sidebar(o-sidebar) + Header(o-header) + Breadcrumb(m-breadcrumb) + MainContent"
dependencies:
  - react
  - next
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Admin Layout

## Overview

A comprehensive admin panel layout featuring a collapsible sidebar, top navigation bar, breadcrumbs, and responsive design. Includes user menu, notifications, and search functionality.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Admin Layout                                 │
├──────────────────────┬──────────────────────────────────────────────────┤
│                      │                                                  │
│  Sidebar (o-sidebar) │              Header (o-header)                   │
│  ┌────────────────┐  │  ┌────────────────────────────────────────────┐  │
│  │ [Logo] Admin   │  │  │ [Menu] Breadcrumb(m-breadcrumb)  [...] [?] │  │
│  ├────────────────┤  │  │                                    [Bell]  │  │
│  │ □ Dashboard    │  │  │              Home > Users          [User]  │  │
│  │ □ Users        │  │  └────────────────────────────────────────────┘  │
│  │ □ Orders       │  │                                                  │
│  │ □ Products     │  ├──────────────────────────────────────────────────┤
│  │ □ Content      │  │                                                  │
│  │ □ Analytics    │  │                                                  │
│  │ □ Billing      │  │                                                  │
│  │ □ Notifications│  │                   Main Content                   │
│  │ □ Files        │  │                                                  │
│  ├────────────────┤  │                  {children}                      │
│  │ ─────────────  │  │                                                  │
│  │ ⚙ Settings     │  │                                                  │
│  │ ? Help         │  │                                                  │
│  └────────────────┘  │                                                  │
│                      │                                                  │
│  [◄ Collapse]        │                                                  │
│                      │                                                  │
└──────────────────────┴──────────────────────────────────────────────────┘
```

## Implementation

### Admin Layout

```tsx
// app/admin/layout.tsx
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { AdminProvider } from '@/components/admin/admin-provider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminProvider>
  );
}
```

### Admin Provider (Context)

```tsx
// components/admin/admin-provider.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AdminContextValue {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <AdminContext.Provider
      value={{
        sidebarOpen,
        setSidebarOpen,
        sidebarCollapsed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}
```

### Admin Sidebar

```tsx
// components/admin/admin-sidebar.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  FileText,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
  Bell,
  Folder,
} from 'lucide-react';
import { useAdmin } from './admin-provider';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Content', href: '/admin/content', icon: FileText },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Billing', href: '/admin/billing', icon: CreditCard },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Files', href: '/admin/files', icon: Folder },
];

const secondaryNavigation = [
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Help', href: '/admin/help', icon: HelpCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, setSidebarCollapsed } = useAdmin();

  const NavLink = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <Link
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        )}
        title={sidebarCollapsed ? item.name : undefined}
      >
        <item.icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-blue-600 dark:text-blue-400')} />
        {!sidebarCollapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
          {!sidebarCollapsed && (
            <Link href="/admin" className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Admin"
                width={32}
                height={32}
                className="h-8 w-8"
              />
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Admin
              </span>
            </Link>
          )}
          
          {/* Mobile Close */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Collapse Toggle (Desktop) */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:block dark:hover:bg-gray-800"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </nav>

        {/* Secondary Navigation */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-800">
          {secondaryNavigation.map((item) => (
            <NavLink key={item.name} item={item} />
          ))}
        </div>
      </aside>
    </>
  );
}
```

### Admin Header

```tsx
// components/admin/admin-header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useAdmin } from './admin-provider';
import { AdminBreadcrumb } from './admin-breadcrumb';
import { AdminSearch } from './admin-search';
import { useTheme } from 'next-themes';

export function AdminHeader() {
  const { setSidebarOpen } = useAdmin();
  const [showSearch, setShowSearch] = useState(false);
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 sm:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <AdminBreadcrumb />
      </div>

      <div className="flex items-center gap-2">
        {/* Search Toggle */}
        <button
          onClick={() => setShowSearch(true)}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Search"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="w-80 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              align="end"
              sideOffset={8}
            >
              <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="space-y-3">
                <NotificationItem
                  title="New order received"
                  description="Order #12345 was placed"
                  time="5 min ago"
                />
                <NotificationItem
                  title="User registered"
                  description="john@example.com signed up"
                  time="1 hour ago"
                />
              </div>
              <div className="mt-4 border-t border-gray-100 pt-3 dark:border-gray-700">
                <Link
                  href="/admin/notifications"
                  className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View all notifications
                </Link>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* User Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
              <Image
                src="/avatars/admin.jpg"
                alt="Admin"
                width={32}
                height={32}
                className="h-8 w-8 rounded-full"
              />
              <span className="hidden text-sm font-medium text-gray-700 sm:block dark:text-gray-300">
                Admin User
              </span>
              <ChevronDown className="hidden h-4 w-4 text-gray-500 sm:block" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[200px] rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-800"
              align="end"
              sideOffset={8}
            >
              <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-700">
                <p className="font-medium text-gray-900 dark:text-white">
                  Admin User
                </p>
                <p className="text-sm text-gray-500">admin@example.com</p>
              </div>
              <DropdownMenu.Item asChild>
                <Link
                  href="/admin/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Item asChild>
                <Link
                  href="/admin/settings"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 h-px bg-gray-100 dark:bg-gray-700" />
              <DropdownMenu.Item
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>

      {/* Search Modal */}
      {showSearch && <AdminSearch onClose={() => setShowSearch(false)} />}
    </header>
  );
}

function NotificationItem({
  title,
  description,
  time,
}: {
  title: string;
  description: string;
  time: string;
}) {
  return (
    <div className="flex gap-3 rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50">
      <div className="h-2 w-2 mt-2 flex-shrink-0 rounded-full bg-blue-500" />
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">
          {title}
        </p>
        <p className="text-sm text-gray-500">{description}</p>
        <p className="mt-1 text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}
```

### Admin Breadcrumb

```tsx
// components/admin/admin-breadcrumb.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

const pathNames: Record<string, string> = {
  admin: 'Dashboard',
  users: 'Users',
  orders: 'Orders',
  products: 'Products',
  content: 'Content',
  analytics: 'Analytics',
  settings: 'Settings',
  billing: 'Billing',
  notifications: 'Notifications',
};

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length <= 1) {
    return (
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
        Dashboard
      </h1>
    );
  }

  return (
    <nav aria-label="Breadcrumb" className="hidden sm:block">
      <ol className="flex items-center gap-1 text-sm">
        <li>
          <Link
            href="/admin"
            className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Home className="h-4 w-4" />
          </Link>
        </li>
        {segments.slice(1).map((segment, index) => {
          const href = '/' + segments.slice(0, index + 2).join('/');
          const isLast = index === segments.length - 2;
          const name = pathNames[segment] || segment;

          return (
            <li key={segment} className="flex items-center gap-1">
              <ChevronRight className="h-4 w-4 text-gray-400" />
              {isLast ? (
                <span className="font-medium text-gray-900 dark:text-white">
                  {name}
                </span>
              ) : (
                <Link
                  href={href}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

### Admin Search

```tsx
// components/admin/admin-search.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, FileText, Users, Package, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface SearchResult {
  id: string;
  type: 'page' | 'user' | 'product' | 'order';
  title: string;
  description: string;
  href: string;
}

const icons = {
  page: FileText,
  user: Users,
  product: Package,
  order: Settings,
};

export function AdminSearch({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && results[selectedIndex]) {
        router.push(results[selectedIndex].href);
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, router, results, selectedIndex]);

  useEffect(() => {
    if (query.length >= 2) {
      // Mock search results
      setResults([
        { id: '1', type: 'page', title: 'Dashboard', description: 'Main dashboard', href: '/admin' },
        { id: '2', type: 'user', title: 'John Doe', description: 'john@example.com', href: '/admin/users/1' },
        { id: '3', type: 'product', title: 'Product Name', description: 'SKU: ABC123', href: '/admin/products/1' },
      ]);
    } else {
      setResults([]);
    }
  }, [query]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 pt-20"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center border-b border-gray-200 px-4 dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users, products, orders..."
            className="flex-1 bg-transparent px-4 py-4 text-gray-900 placeholder-gray-500 focus:outline-none dark:text-white"
          />
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-96 overflow-y-auto p-2">
            {results.map((result, index) => {
              const Icon = icons[result.type];
              return (
                <li key={result.id}>
                  <button
                    onClick={() => {
                      router.push(result.href);
                      onClose();
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left ${
                      index === selectedIndex
                        ? 'bg-blue-50 dark:bg-blue-900/20'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {result.title}
                      </p>
                      <p className="text-sm text-gray-500">{result.description}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {/* Quick Actions */}
        <div className="border-t border-gray-200 p-4 dark:border-gray-700">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
            Quick Actions
          </p>
          <div className="flex gap-2">
            <button className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
              Add User
            </button>
            <button className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
              New Product
            </button>
            <button className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
              View Reports
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

## Variants

### Horizontal Nav Layout

```tsx
// components/admin/admin-layout-horizontal.tsx
export function AdminLayoutHorizontal({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950">
      {/* Top Navigation */}
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          {/* Logo and Nav Links */}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">{children}</main>
    </div>
  );
}
```

## Usage

```tsx
// Admin pages automatically use the layout
// app/admin/page.tsx
export default function AdminDashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </div>
  );
}

// Nested admin pages
// app/admin/users/page.tsx
export default function UsersPage() {
  return (
    <div>
      <h1>Users</h1>
      {/* Users list */}
    </div>
  );
}
```

## Error States

### Layout Error Boundary

```tsx
// app/admin/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <AlertTriangle className="h-8 w-8 text-red-600" />
      </div>
      <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {error.message || 'An error occurred in the admin panel'}
      </p>
      <div className="mt-6 flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
      </div>
    </div>
  );
}
```

### Session Expired Handler

```tsx
// components/admin/session-expired.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, LogIn } from 'lucide-react';

export function SessionExpiredModal({ show }: { show: boolean }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (!show) return;

    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          router.push('/login?expired=true');
          return 0;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [show, router]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="mx-4 w-full max-w-md rounded-xl bg-white p-6 text-center dark:bg-gray-900">
        <Clock className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-4 text-xl font-semibold">Session Expired</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Your session has expired. Redirecting to login in {countdown} seconds.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
        >
          <LogIn className="h-4 w-4" />
          Login Now
        </button>
      </div>
    </div>
  );
}
```

### API Error Toast

```tsx
// components/admin/api-error-toast.tsx
'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function useApiError() {
  const handleError = (error: Error, context?: string) => {
    const message = error.message || 'An error occurred';

    toast.error(context ? `${context}: ${message}` : message, {
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    });
  };

  return { handleError };
}
```

## Loading States

### Layout Loading Skeleton

```tsx
// app/admin/loading.tsx
export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Stats skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-card p-6"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="mt-2 h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border bg-card">
        <div className="border-b p-4">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
              <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Sidebar Loading State

```tsx
// components/admin/sidebar-loading.tsx
export function SidebarLoading() {
  return (
    <aside className="w-64 border-r bg-white dark:bg-gray-900">
      {/* Logo skeleton */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
      </div>

      {/* Navigation skeleton */}
      <nav className="p-4 space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg px-3 py-2"
          >
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </nav>
    </aside>
  );
}
```

### Streaming with Suspense

```tsx
// app/admin/layout.tsx with streaming
import { Suspense } from 'react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminHeader } from '@/components/admin/admin-header';
import { SidebarLoading } from '@/components/admin/sidebar-loading';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <Suspense fallback={<SidebarLoading />}>
        <AdminSidebar />
      </Suspense>

      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Sidebar

```tsx
// components/admin/responsive-sidebar.tsx
'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAdmin } from './admin-provider';
import { cn } from '@/lib/utils';

export function ResponsiveSidebar({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, setSidebarOpen } = useAdmin();
  const pathname = usePathname();

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname, setSidebarOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [setSidebarOpen]);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-white transition-transform duration-300 dark:bg-gray-900 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>

        {children}
      </aside>
    </>
  );
}

// Mobile menu button for header
export function MobileMenuButton() {
  const { setSidebarOpen } = useAdmin();

  return (
    <button
      onClick={() => setSidebarOpen(true)}
      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800"
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
```

### Responsive Layout Classes

```tsx
// Breakpoint utility classes for admin layout
const layoutClasses = {
  // Sidebar
  sidebar: cn(
    'fixed inset-y-0 left-0 z-50 w-64',
    'lg:static lg:z-auto',
    'transition-transform duration-300',
    'bg-white dark:bg-gray-900 border-r'
  ),

  // Main content
  main: cn(
    'flex-1 overflow-y-auto',
    'p-4 sm:p-6 lg:p-8'
  ),

  // Header
  header: cn(
    'sticky top-0 z-30',
    'h-14 sm:h-16',
    'border-b bg-white dark:bg-gray-900',
    'px-4 sm:px-6'
  ),

  // Content grid
  contentGrid: cn(
    'grid gap-4',
    'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
  ),
};
```

### Mobile Navigation Patterns

```tsx
// components/admin/mobile-bottom-nav.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, BarChart, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const mobileNavItems = [
  { href: '/admin', icon: Home, label: 'Home' },
  { href: '/admin/users', icon: Users, label: 'Users' },
  { href: '/admin/analytics', icon: BarChart, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-white dark:bg-gray-900 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
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
| Header | 56px height | 64px height | 64px height |
| Content padding | 16px | 24px | 32px |
| Grid columns | 1 | 2 | 4 |
| Bottom nav | Visible | Visible | Hidden |

## SEO Considerations

### Metadata for Admin Pages

```tsx
// app/admin/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Dashboard',
    default: 'Admin Dashboard',
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

// Prevent admin pages from being indexed
export const headers = {
  'X-Robots-Tag': 'noindex, nofollow',
};
```

### Page-Specific Metadata

```tsx
// app/admin/users/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Users Management',
  description: 'Manage user accounts and permissions',
};
```

### Canonical URLs

```tsx
// components/admin/admin-head.tsx
export function AdminHead({ path }: { path: string }) {
  return (
    <>
      <link rel="canonical" href={`https://app.example.com${path}`} />
      <meta name="robots" content="noindex, nofollow" />
    </>
  );
}
```

## Testing Strategies

### Layout Component Testing

```tsx
// __tests__/admin-layout.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import AdminLayout from '@/app/admin/layout';
import { AdminProvider } from '@/components/admin/admin-provider';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({ push: vi.fn() }),
}));

describe('AdminLayout', () => {
  const renderWithProvider = (children: React.ReactNode) => {
    return render(
      <AdminProvider>
        {children}
      </AdminProvider>
    );
  };

  it('renders sidebar and header', () => {
    renderWithProvider(<AdminLayout><div>Content</div></AdminLayout>);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('toggles sidebar on mobile', () => {
    renderWithProvider(<AdminLayout><div>Content</div></AdminLayout>);

    const menuButton = screen.getByLabelText('Open menu');
    fireEvent.click(menuButton);

    expect(screen.getByRole('complementary')).toHaveClass('translate-x-0');
  });

  it('closes sidebar when clicking overlay', () => {
    renderWithProvider(<AdminLayout><div>Content</div></AdminLayout>);

    // Open sidebar
    fireEvent.click(screen.getByLabelText('Open menu'));

    // Click overlay
    const overlay = screen.getByRole('presentation');
    fireEvent.click(overlay);

    expect(screen.getByRole('complementary')).toHaveClass('-translate-x-full');
  });
});
```

### Sidebar Navigation Testing

```tsx
// __tests__/admin-sidebar.test.tsx
import { render, screen } from '@testing-library/react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';

describe('AdminSidebar', () => {
  it('renders all navigation items', () => {
    render(<AdminSidebar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('highlights active route', () => {
    vi.mocked(usePathname).mockReturnValue('/admin/users');
    render(<AdminSidebar />);

    const usersLink = screen.getByText('Users').closest('a');
    expect(usersLink).toHaveClass('bg-blue-50');
  });

  it('expands nested navigation', () => {
    render(<AdminSidebar />);

    fireEvent.click(screen.getByText('Users'));
    expect(screen.getByText('All Users')).toBeVisible();
    expect(screen.getByText('Teams')).toBeVisible();
  });
});
```

### E2E Testing

```tsx
// e2e/admin-layout.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Admin Layout', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/admin');
  });

  test('sidebar navigation works', async ({ page }) => {
    await page.click('text=Users');
    await expect(page).toHaveURL('/admin/users');

    await page.click('text=Settings');
    await expect(page).toHaveURL('/admin/settings');
  });

  test('mobile menu toggles correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Sidebar should be hidden initially
    const sidebar = page.locator('[role="complementary"]');
    await expect(sidebar).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -256, 0)');

    // Open menu
    await page.click('[aria-label="Open menu"]');
    await expect(sidebar).toHaveCSS('transform', 'none');

    // Close menu
    await page.click('[aria-label="Close sidebar"]');
    await expect(sidebar).toHaveCSS('transform', 'matrix(1, 0, 0, 1, -256, 0)');
  });

  test('user menu dropdown works', async ({ page }) => {
    await page.click('[aria-label="User menu"]');
    await expect(page.getByText('Profile')).toBeVisible();
    await expect(page.getByText('Sign out')).toBeVisible();
  });

  test('breadcrumb navigation works', async ({ page }) => {
    await page.goto('/admin/users/123');

    await expect(page.getByText('Dashboard')).toBeVisible();
    await expect(page.getByText('Users')).toBeVisible();

    await page.click('text=Dashboard');
    await expect(page).toHaveURL('/admin');
  });
});
```

### Accessibility Testing

```tsx
// __tests__/admin-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import AdminLayout from '@/app/admin/layout';

expect.extend(toHaveNoViolations);

describe('AdminLayout Accessibility', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has skip link for keyboard navigation', () => {
    const { getByText } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );
    expect(getByText('Skip to main content')).toBeInTheDocument();
  });

  it('sidebar has proper ARIA attributes', () => {
    const { getByRole } = render(
      <AdminLayout>
        <div>Content</div>
      </AdminLayout>
    );

    const nav = getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });
});
```

## Related Skills

- [L4/dashboard-page](./dashboard-page.md) - Dashboard template
- [L3/sidebar](../organisms/sidebar.md) - Sidebar component
- [L3/user-menu](../organisms/user-menu.md) - User dropdown menu

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with sidebar and header
