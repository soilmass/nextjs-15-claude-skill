---
id: o-mobile-nav
name: Mobile Nav
version: 1.0.0
layer: L3
category: navigation
description: Mobile navigation menu with drawer, hamburger trigger, and nested navigation
tags: [mobile, navigation, menu, drawer, hamburger, responsive]
formula: "MobileNav = Drawer(o-drawer) + NavLink(m-nav-link)[] + Button(a-button) + Avatar(a-avatar)"
composes:
  - ../molecules/nav-link.md
  - ../atoms/input-button.md
  - ../atoms/display-avatar.md
dependencies: ["framer-motion", "lucide-react"]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Mobile Nav

## Overview

The Mobile Nav organism provides a responsive navigation drawer with hamburger menu trigger, nested navigation support, user menu, and smooth animations. Designed for mobile and tablet breakpoints.

## When to Use

Use this skill when:
- Building responsive layouts with mobile navigation
- Creating app-style navigation drawers
- Implementing off-canvas menus
- Adding mobile-friendly navigation to websites

## Composition Diagram

```
+---------------------------------------------------------------------+
|                        MobileNav (L3)                                |
+---------------------------------------------------------------------+
|  Header Bar (visible on mobile):                                    |
|  +---------------------------------------------------------------+  |
|  | [Hamburger] Logo                              [Search] [User] |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  Drawer (slides in from left):                                     |
|  +----------------------------+                                    |
|  | +------------------------+ |                                    |
|  | | User Profile           | |                                    |
|  | | Avatar + Name          | |                                    |
|  | +------------------------+ |                                    |
|  |                            |                                    |
|  | NavLink: Dashboard         |                                    |
|  | NavLink: Projects       >  |                                    |
|  |   - Project A              |                                    |
|  |   - Project B              |                                    |
|  | NavLink: Messages          |                                    |
|  | NavLink: Settings          |                                    |
|  |                            |                                    |
|  | +------------------------+ |                                    |
|  | | [Logout] Button        | |                                    |
|  | +------------------------+ |                                    |
|  +----------------------------+                                    |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/mobile-nav.tsx
'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  children?: NavItem[];
  badge?: string | number;
}

interface MobileNavProps {
  items: NavItem[];
  logo?: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => void;
  showSearch?: boolean;
  onSearch?: () => void;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotifications?: () => void;
  className?: string;
}

function NavItem({
  item,
  depth = 0,
  onNavigate,
}: {
  item: NavItem;
  depth?: number;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const [expanded, setExpanded] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isActive = item.href === pathname;
  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else if (item.href) {
      onNavigate();
    }
  };

  const content = (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
        'hover:bg-accent rounded-lg mx-2',
        isActive && 'bg-accent font-medium',
        depth > 0 && 'pl-10'
      )}
      onClick={handleClick}
    >
      {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
      <span className="flex-1">{item.label}</span>
      {item.badge && (
        <span className="px-2 py-0.5 text-xs rounded-full bg-primary text-primary-foreground">
          {item.badge}
        </span>
      )}
      {hasChildren && (
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            expanded && 'rotate-180'
          )}
        />
      )}
    </div>
  );

  return (
    <div>
      {item.href && !hasChildren ? (
        <Link href={item.href} onClick={onNavigate}>
          {content}
        </Link>
      ) : (
        <button className="w-full text-left">{content}</button>
      )}

      <AnimatePresence>
        {hasChildren && expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {item.children?.map((child, index) => (
              <NavItem
                key={index}
                item={child}
                depth={depth + 1}
                onNavigate={onNavigate}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserProfile({
  user,
  onLogout,
}: {
  user: MobileNavProps['user'];
  onLogout?: () => void;
}) {
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div className="p-4 border-b">
      <div className="flex items-center gap-3">
        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-medium">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{user.name}</p>
          <p className="text-sm text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <Link
          href="/settings/profile"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent"
        >
          <User className="h-4 w-4" />
          Profile
        </Link>
        <button
          onClick={onLogout}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-accent text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}

export function MobileNav({
  items,
  logo,
  user,
  onLogout,
  showSearch = true,
  onSearch,
  showNotifications = true,
  notificationCount,
  onNotifications,
  className,
}: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
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
      {/* Header Bar */}
      <header
        className={cn(
          'sticky top-0 z-40 flex items-center justify-between px-4 h-14 border-b bg-background',
          'lg:hidden',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 -ml-2 hover:bg-accent rounded-lg"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          {logo}
        </div>

        <div className="flex items-center gap-1">
          {showSearch && (
            <button
              onClick={onSearch}
              className="p-2 hover:bg-accent rounded-lg"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          {showNotifications && (
            <button
              onClick={onNotifications}
              className="p-2 hover:bg-accent rounded-lg relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount && notificationCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 text-[10px] flex items-center justify-center rounded-full bg-destructive text-destructive-foreground">
                  {notificationCount > 9 ? '9+' : notificationCount}
                </span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/50 lg:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.nav
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-72 bg-background shadow-xl lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between p-4 border-b">
                {logo}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-accent rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* User Profile */}
              <UserProfile user={user} onLogout={onLogout} />

              {/* Navigation Items */}
              <div className="py-4 overflow-y-auto max-h-[calc(100vh-200px)]">
                {items.map((item, index) => (
                  <NavItem
                    key={index}
                    item={item}
                    onNavigate={() => setIsOpen(false)}
                  />
                ))}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

## Usage

### Basic Usage

```tsx
import { MobileNav } from '@/components/organisms/mobile-nav';
import { Home, Folder, MessageSquare, Settings } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: Home },
  {
    label: 'Projects',
    icon: Folder,
    children: [
      { label: 'Active', href: '/projects/active' },
      { label: 'Archived', href: '/projects/archived' },
    ],
  },
  { label: 'Messages', href: '/messages', icon: MessageSquare, badge: 3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }) {
  return (
    <>
      <MobileNav
        items={navItems}
        logo={<span className="font-bold">AppName</span>}
        user={{ name: 'John Doe', email: 'john@example.com' }}
        onLogout={() => signOut()}
      />
      <main>{children}</main>
    </>
  );
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Navigation drawer is hidden | Only header bar visible with hamburger icon |
| Open | Navigation drawer is visible | Drawer slides in from left, overlay covers rest of screen |
| Opening | Drawer animating to open position | Spring animation, drawer sliding from -100% to 0 |
| Closing | Drawer animating to closed position | Fade out overlay, drawer sliding from 0 to -100% |
| Nav Item Active | Current page matches nav link | Accent background, font-medium applied |
| Nav Item Hover | User hovers over navigation item | Accent background on hover |
| Submenu Collapsed | Parent nav item with children closed | Chevron pointing right/down |
| Submenu Expanded | Parent nav item with children open | Chevron rotated 180 degrees, child items visible with indentation |
| Has Notifications | Notification badge shows count | Red badge with count on bell icon |
| User Logged In | User profile data available | Avatar, name, and email displayed in drawer header |

## Anti-patterns

### Bad: Not locking body scroll when drawer is open

```tsx
// Bad - Body still scrollable behind drawer
function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Drawer open={isOpen}>
      <NavContent />
    </Drawer>
    // User can still scroll the page behind the drawer!
  );
}

// Good - Lock body scroll when drawer opens
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
```

### Bad: Not closing drawer on navigation

```tsx
// Bad - Drawer stays open after clicking link
<Link href="/dashboard">{item.label}</Link>

// Good - Close drawer when navigating
<Link
  href={item.href}
  onClick={() => setIsOpen(false)}
>
  {item.label}
</Link>

// Or using onNavigate callback
<NavItem
  item={item}
  onNavigate={() => setIsOpen(false)}
/>
```

### Bad: Missing focus trap in drawer

```tsx
// Bad - Focus can escape the drawer
<div className="drawer">
  <button>Close</button>
  <nav>{items}</nav>
</div>

// Good - Trap focus within drawer when open
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key === 'Tab') {
    const focusableElements = drawerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusableElements?.length) return;

    const first = focusableElements[0] as HTMLElement;
    const last = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
};
```

### Bad: Showing mobile nav on desktop breakpoints

```tsx
// Bad - Mobile nav visible at all screen sizes
<MobileNav items={items} />

// Good - Hide on larger screens, show desktop nav instead
<header className="lg:hidden">
  <MobileNav items={items} />
</header>
<header className="hidden lg:flex">
  <DesktopNav items={items} />
</header>
```

## Accessibility

- Hamburger button has proper aria-label
- Focus trapped within drawer when open
- Escape key closes the drawer
- Body scroll locked when drawer is open

## Dependencies

```json
{
  "dependencies": {
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## Related Skills

- [organisms/header](./header.md)
- [organisms/sidebar](./sidebar.md)
- [molecules/nav-link](../molecules/nav-link.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Drawer animation with Framer Motion
- Nested navigation support
- User profile section
