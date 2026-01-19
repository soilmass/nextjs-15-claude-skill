---
id: o-mobile-menu
name: Mobile Menu
version: 2.0.0
layer: L3
category: navigation
description: Responsive mobile navigation menu with slide-out drawer and accordion navigation
tags: [mobile, menu, navigation, drawer, responsive, hamburger, sheet]
formula: MobileMenu = Sheet + HamburgerButton + SearchInput + AccordionNav + NavLink + UserProfile
composes:
  - ../molecules/nav-link.md
  - ../molecules/accordion-item.md
  - ../molecules/search-input.md
dependencies: [lucide-react, framer-motion, @radix-ui/react-dialog, @radix-ui/react-collapsible]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Mobile Menu

## Overview

The Mobile Menu organism provides a responsive navigation solution for mobile devices. Features a slide-out drawer (Sheet) with animated hamburger trigger, accordion-style nested navigation, integrated search, user profile section, and smooth animations. Includes focus trapping, proper ARIA attributes, and automatic closure on route changes for accessibility and optimal UX.

## When to Use

Use this skill when:
- Building responsive navigation for mobile and tablet devices
- Creating touch-friendly navigation menus with nested hierarchy
- Implementing hamburger menu patterns with smooth animations
- Building mobile-first navigation with search integration
- Requiring user profile access in mobile navigation

## Composition Diagram

```
+------------------------------------------------------------------+
|  MobileMenu                                                       |
|  +------------------------------------------------------------+  |
|  |  HamburgerButton (Trigger)                                 |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  [=] Animated hamburger icon (3 bars -> X)           |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |  Sheet/Drawer Panel (slides from right)                    |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  Header                                              |  |  |
|  |  |  +------------------+  +---------------------------+ |  |  |
|  |  |  | Logo             |  | CloseButton (X)           | |  |  |
|  |  |  +------------------+  +---------------------------+ |  |  |
|  |  +------------------------------------------------------+  |  |
|  |                                                          |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  SearchInput                                         |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  | [Q] Search...                        [Spinner] |  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |                                                          |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  UserProfile Section                                 |  |  |
|  |  |  +------+ +--------------------------------------+   |  |  |
|  |  |  |Avatar| | Name                                 |   |  |  |
|  |  |  |      | | email@example.com                    |   |  |  |
|  |  |  +------+ +--------------------------------------+   |  |  |
|  |  +------------------------------------------------------+  |  |
|  |                                                          |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  Navigation (Accordion)                              |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  | [icon] Home                        (NavLink)   |  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  | [v] Products                       (Accordion) |  |  |  |
|  |  |  |     +------------------------------------------+  |  |  |
|  |  |  |     | All Products              (NavLink)      |  |  |  |
|  |  |  |     | New Arrivals              (NavLink)      |  |  |  |
|  |  |  |     | Sale                      (NavLink)      |  |  |  |
|  |  |  |     +------------------------------------------+  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  | [icon] About                       (NavLink)   |  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  | [icon] Contact                     (NavLink)   |  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |                                                          |  |
|  |  +------------------------------------------------------+  |  |
|  |  |  Footer Actions                                      |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  |  | [Settings] [Sign Out]                          |  |  |  |
|  |  |  +------------------------------------------------+  |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |  Backdrop/Overlay (click to close)                         |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## Composes

- [nav-link](../molecules/nav-link.md) - Navigation items with active state
- [accordion-item](../molecules/accordion-item.md) - Expandable navigation sections
- [search-input](../molecules/search-input.md) - Mobile search functionality

## Implementation

```typescript
// components/organisms/mobile-menu.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as Dialog from "@radix-ui/react-dialog";
import * as Collapsible from "@radix-ui/react-collapsible";
import {
  Menu,
  X,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Home,
  ShoppingBag,
  Info,
  Mail,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
  description?: string;
  children?: NavItem[];
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  initials?: string;
}

interface MobileMenuProps {
  /** Navigation items with optional nested children */
  navItems: NavItem[];
  /** Optional user profile for authenticated users */
  user?: UserProfile | null;
  /** Logo component or element */
  logo?: React.ReactNode;
  /** Show search input */
  showSearch?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Sign out handler */
  onSignOut?: () => void;
  /** Settings click handler */
  onSettingsClick?: () => void;
  /** Custom footer content */
  footerContent?: React.ReactNode;
  /** Additional class name for the trigger button */
  triggerClassName?: string;
  /** Controlled open state */
  open?: boolean;
  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
}

// Hamburger Button Component with Animation
function HamburgerButton({
  isOpen,
  onClick,
  className,
}: {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex h-10 w-10 items-center justify-center rounded-md",
        "text-foreground hover:bg-accent focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "transition-colors lg:hidden",
        className
      )}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      <div className="flex h-5 w-5 flex-col items-center justify-center">
        <motion.span
          className="absolute h-0.5 w-5 bg-current"
          animate={{
            rotate: isOpen ? 45 : 0,
            y: isOpen ? 0 : -6,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="absolute h-0.5 w-5 bg-current"
          animate={{
            opacity: isOpen ? 0 : 1,
            scaleX: isOpen ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="absolute h-0.5 w-5 bg-current"
          animate={{
            rotate: isOpen ? -45 : 0,
            y: isOpen ? 0 : 6,
          }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </button>
  );
}

// Mobile Search Input Component
function MobileSearchInput({
  placeholder,
  onSearch,
}: {
  placeholder: string;
  onSearch?: (query: string) => void;
}) {
  const [value, setValue] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim() || !onSearch) return;

    setIsSearching(true);
    try {
      await onSearch(value);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search
        className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-10 w-full rounded-md border border-input bg-background pl-10 pr-10",
          "text-sm placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        )}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2">
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : value ? (
          <button
            type="button"
            onClick={handleClear}
            className="rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </form>
  );
}

// User Profile Section Component
function UserProfileSection({
  user,
  onSettingsClick,
  onSignOut,
}: {
  user: UserProfile;
  onSettingsClick?: () => void;
  onSignOut?: () => void;
}) {
  return (
    <div className="border-b pb-4">
      <div className="flex items-center gap-3">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt=""
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user.initials || user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {user.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {onSettingsClick && (
          <button
            type="button"
            onClick={onSettingsClick}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2",
              "text-sm text-muted-foreground hover:bg-accent hover:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "transition-colors"
            )}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        )}
        {onSignOut && (
          <button
            type="button"
            onClick={onSignOut}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md border px-3 py-2",
              "text-sm text-muted-foreground hover:bg-destructive hover:text-destructive-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "transition-colors"
            )}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        )}
      </div>
    </div>
  );
}

// Accordion Navigation Item Component
function AccordionNavItem({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: (href: string) => boolean;
  onNavigate: () => void;
}) {
  const [isOpen, setIsOpen] = React.useState(() =>
    item.children?.some((child) => isActive(child.href)) ?? false
  );

  if (!item.children || item.children.length === 0) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium",
          "transition-colors",
          isActive(item.href)
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-accent"
        )}
        aria-current={isActive(item.href) ? "page" : undefined}
      >
        {item.icon && (
          <span className="h-5 w-5 shrink-0" aria-hidden="true">
            {item.icon}
          </span>
        )}
        {item.label}
      </Link>
    );
  }

  return (
    <Collapsible.Root open={isOpen} onOpenChange={setIsOpen}>
      <Collapsible.Trigger
        className={cn(
          "flex w-full items-center justify-between rounded-md px-3 py-3",
          "text-base font-medium transition-colors",
          item.children.some((child) => isActive(child.href))
            ? "text-primary"
            : "text-foreground hover:bg-accent"
        )}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          {item.icon && (
            <span className="h-5 w-5 shrink-0" aria-hidden="true">
              {item.icon}
            </span>
          )}
          {item.label}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
          aria-hidden="true"
        />
      </Collapsible.Trigger>
      <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="ml-8 space-y-1 pb-2 pt-1">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                "transition-colors",
                isActive(child.href)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              aria-current={isActive(child.href) ? "page" : undefined}
            >
              {child.icon && (
                <span className="h-4 w-4 shrink-0" aria-hidden="true">
                  {child.icon}
                </span>
              )}
              {child.label}
            </Link>
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible.Root>
  );
}

// Main Mobile Menu Component
export function MobileMenu({
  navItems,
  user,
  logo,
  showSearch = true,
  searchPlaceholder = "Search...",
  onSearch,
  onSignOut,
  onSettingsClick,
  footerContent,
  triggerClassName,
  open: controlledOpen,
  onOpenChange,
}: MobileMenuProps) {
  const pathname = usePathname();
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (open: boolean) => {
    if (!isControlled) {
      setInternalOpen(open);
    }
    onOpenChange?.(open);
  };

  // Close menu on route change
  React.useEffect(() => {
    handleOpenChange(false);
  }, [pathname]);

  // Lock body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleNavigate = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      {/* Hamburger Trigger */}
      <Dialog.Trigger asChild>
        <HamburgerButton
          isOpen={isOpen}
          onClick={() => handleOpenChange(!isOpen)}
          className={triggerClassName}
        />
      </Dialog.Trigger>

      {/* Portal for Overlay and Content */}
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            {/* Backdrop Overlay */}
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </Dialog.Overlay>

            {/* Slide-out Panel */}
            <Dialog.Content asChild>
              <motion.div
                className={cn(
                  "fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col",
                  "bg-background shadow-xl",
                  "focus:outline-none"
                )}
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                role="dialog"
                aria-modal="true"
                aria-label="Mobile navigation menu"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                  {logo ? (
                    <Link href="/" onClick={handleNavigate} aria-label="Home">
                      {logo}
                    </Link>
                  ) : (
                    <span className="text-lg font-semibold">Menu</span>
                  )}
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-md",
                        "text-muted-foreground hover:bg-accent hover:text-foreground",
                        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                        "transition-colors"
                      )}
                      aria-label="Close menu"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-4 py-4">
                  {/* Search */}
                  {showSearch && (
                    <div className="mb-4">
                      <MobileSearchInput
                        placeholder={searchPlaceholder}
                        onSearch={onSearch}
                      />
                    </div>
                  )}

                  {/* User Profile */}
                  {user && (
                    <div className="mb-4">
                      <UserProfileSection
                        user={user}
                        onSettingsClick={() => {
                          onSettingsClick?.();
                          handleNavigate();
                        }}
                        onSignOut={() => {
                          onSignOut?.();
                          handleNavigate();
                        }}
                      />
                    </div>
                  )}

                  {/* Navigation */}
                  <nav aria-label="Mobile navigation">
                    <ul className="space-y-1" role="list">
                      {navItems.map((item) => (
                        <li key={item.href}>
                          <AccordionNavItem
                            item={item}
                            isActive={isActive}
                            onNavigate={handleNavigate}
                          />
                        </li>
                      ))}
                    </ul>
                  </nav>
                </div>

                {/* Footer */}
                {footerContent && (
                  <div className="border-t px-4 py-4">{footerContent}</div>
                )}
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}

// Pre-configured variant with common icons
export function MobileMenuWithIcons({
  navItems,
  ...props
}: Omit<MobileMenuProps, "navItems"> & { navItems: NavItem[] }) {
  const itemsWithIcons = navItems.map((item) => ({
    ...item,
    icon: item.icon || getDefaultIcon(item.href),
    children: item.children?.map((child) => ({
      ...child,
      icon: child.icon || getDefaultIcon(child.href),
    })),
  }));

  return <MobileMenu navItems={itemsWithIcons} {...props} />;
}

function getDefaultIcon(href: string): React.ReactNode {
  const iconMap: Record<string, React.ReactNode> = {
    "/": <Home className="h-full w-full" />,
    "/products": <ShoppingBag className="h-full w-full" />,
    "/shop": <ShoppingBag className="h-full w-full" />,
    "/about": <Info className="h-full w-full" />,
    "/contact": <Mail className="h-full w-full" />,
    "/settings": <Settings className="h-full w-full" />,
    "/profile": <User className="h-full w-full" />,
  };

  return iconMap[href] || null;
}
```

### Key Implementation Notes

1. **Radix Dialog**: Uses `@radix-ui/react-dialog` for accessible modal with focus trap
2. **Framer Motion**: Smooth spring animations for panel slide and hamburger morph
3. **Route Change Detection**: Automatically closes on `pathname` change via `usePathname()`
4. **Body Scroll Lock**: Prevents background scrolling when menu is open
5. **Accordion Navigation**: Uses `@radix-ui/react-collapsible` for nested items
6. **Controlled/Uncontrolled**: Supports both controlled (`open`/`onOpenChange`) and uncontrolled modes

## Variants

### Basic Mobile Menu

```tsx
<MobileMenu
  navItems={[
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]}
/>
```

### With Nested Navigation

```tsx
<MobileMenu
  navItems={[
    { label: "Home", href: "/" },
    {
      label: "Products",
      href: "/products",
      children: [
        { label: "All Products", href: "/products" },
        { label: "New Arrivals", href: "/products/new" },
        { label: "Sale", href: "/products/sale" },
      ],
    },
    { label: "About", href: "/about" },
  ]}
/>
```

### With User Profile

```tsx
<MobileMenu
  navItems={navItems}
  user={{
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/john.jpg",
  }}
  onSignOut={() => signOut()}
  onSettingsClick={() => router.push("/settings")}
/>
```

### With Search

```tsx
<MobileMenu
  navItems={navItems}
  showSearch
  searchPlaceholder="Search products..."
  onSearch={async (query) => {
    await searchProducts(query);
  }}
/>
```

### With Custom Logo

```tsx
<MobileMenu
  navItems={navItems}
  logo={
    <div className="flex items-center gap-2">
      <img src="/logo.svg" alt="" className="h-8 w-8" />
      <span className="font-bold text-xl">Brand</span>
    </div>
  }
/>
```

### With Footer Actions

```tsx
<MobileMenu
  navItems={navItems}
  footerContent={
    <div className="flex gap-2">
      <Button variant="outline" className="flex-1" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
      <Button className="flex-1" asChild>
        <Link href="/signup">Get Started</Link>
      </Button>
    </div>
  }
/>
```

### Controlled Mode

```tsx
const [menuOpen, setMenuOpen] = useState(false);

<MobileMenu
  navItems={navItems}
  open={menuOpen}
  onOpenChange={setMenuOpen}
/>

// Can programmatically open/close
<Button onClick={() => setMenuOpen(true)}>Open Menu</Button>
```

## States

| State | Panel | Backdrop | Body | Hamburger Icon |
|-------|-------|----------|------|----------------|
| Closed | Hidden (x: 100%) | Hidden | Scrollable | Three horizontal bars |
| Opening | Animating in (spring) | Fading in | Locked | Morphing to X |
| Open | Visible (x: 0) | Visible (50% opacity + blur) | Locked | X shape |
| Closing | Animating out (spring) | Fading out | Locked -> Scrollable | Morphing to bars |

### Accordion States

| State | Icon | Content | Border |
|-------|------|---------|--------|
| Collapsed | Chevron down | Hidden (h: 0) | None |
| Expanding | Rotating to up | Animating height | None |
| Expanded | Chevron up | Visible | None |
| Collapsing | Rotating to down | Animating height | None |

## Accessibility

### Required ARIA Attributes

- `aria-expanded` on hamburger trigger button
- `aria-label` on trigger ("Open menu" / "Close menu")
- `role="dialog"` on the menu panel
- `aria-modal="true"` on the panel
- `aria-label="Mobile navigation menu"` on dialog
- `aria-current="page"` on active navigation items
- `aria-expanded` on accordion triggers
- `role="list"` on navigation list

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Escape` | Close menu (focus returns to trigger) |
| `Tab` | Navigate within menu (trapped inside panel) |
| `Shift + Tab` | Navigate backwards within menu |
| `Enter` | Activate focused link or toggle accordion |
| `Space` | Activate focused link or toggle accordion |
| `Arrow Down` | Move to next item (in accordion context) |
| `Arrow Up` | Move to previous item (in accordion context) |

### Screen Reader Announcements

- Menu open/close state announced
- Navigation landmark identified via `aria-label`
- Current page announced via `aria-current`
- Accordion expand/collapse announced via `aria-expanded`
- Close button purpose announced via `aria-label`

### Focus Management

- Focus automatically moves to first focusable element when opened
- Focus trapped within panel while open (Radix Dialog handles this)
- Focus returns to trigger button when closed
- Close button accessible via keyboard

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0",
    "framer-motion": "^11.0.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-collapsible": "^1.1.0"
  }
}
```

### Installation

```bash
npm install lucide-react framer-motion @radix-ui/react-dialog @radix-ui/react-collapsible
```

### Tailwind Animation Config

Add to your `tailwind.config.ts`:

```typescript
module.exports = {
  theme: {
    extend: {
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
};
```

## Examples

### E-commerce Mobile Menu

```tsx
import { MobileMenu } from "@/components/organisms/mobile-menu";
import { ShoppingBag, Heart, Package, Gift } from "lucide-react";

const ecommerceNav = [
  { label: "Home", href: "/" },
  {
    label: "Shop",
    href: "/shop",
    icon: <ShoppingBag className="h-5 w-5" />,
    children: [
      { label: "Women", href: "/shop/women" },
      { label: "Men", href: "/shop/men" },
      { label: "Kids", href: "/shop/kids" },
      { label: "Accessories", href: "/shop/accessories" },
    ],
  },
  {
    label: "Collections",
    href: "/collections",
    icon: <Gift className="h-5 w-5" />,
    children: [
      { label: "Summer 2024", href: "/collections/summer-2024" },
      { label: "New Arrivals", href: "/collections/new" },
      { label: "Sale", href: "/collections/sale" },
    ],
  },
  { label: "Wishlist", href: "/wishlist", icon: <Heart className="h-5 w-5" /> },
  { label: "Orders", href: "/orders", icon: <Package className="h-5 w-5" /> },
];

export function EcommerceMobileMenu() {
  const { user, signOut } = useAuth();

  return (
    <MobileMenu
      navItems={ecommerceNav}
      user={user}
      onSignOut={signOut}
      showSearch
      searchPlaceholder="Search products..."
      onSearch={(query) => router.push(`/search?q=${query}`)}
      logo={<StoreLogo className="h-8" />}
      footerContent={
        <div className="text-center text-xs text-muted-foreground">
          Free shipping on orders over $50
        </div>
      }
    />
  );
}
```

### Dashboard Mobile Menu

```tsx
import { MobileMenu } from "@/components/organisms/mobile-menu";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart,
  Settings,
  HelpCircle,
} from "lucide-react";

const dashboardNav = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Users",
    href: "/dashboard/users",
    icon: <Users className="h-5 w-5" />,
    children: [
      { label: "All Users", href: "/dashboard/users" },
      { label: "Active", href: "/dashboard/users/active" },
      { label: "Pending", href: "/dashboard/users/pending" },
    ],
  },
  {
    label: "Reports",
    href: "/dashboard/reports",
    icon: <BarChart className="h-5 w-5" />,
    children: [
      { label: "Daily", href: "/dashboard/reports/daily" },
      { label: "Weekly", href: "/dashboard/reports/weekly" },
      { label: "Monthly", href: "/dashboard/reports/monthly" },
    ],
  },
  {
    label: "Documents",
    href: "/dashboard/documents",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
  {
    label: "Help",
    href: "/help",
    icon: <HelpCircle className="h-5 w-5" />,
  },
];

export function DashboardMobileMenu() {
  const { user, signOut } = useSession();
  const router = useRouter();

  return (
    <MobileMenu
      navItems={dashboardNav}
      user={{
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      }}
      onSignOut={signOut}
      onSettingsClick={() => router.push("/dashboard/settings")}
      logo={<AppLogo />}
    />
  );
}
```

### Marketing Site Mobile Menu

```tsx
import { MobileMenu } from "@/components/organisms/mobile-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const marketingNav = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Documentation", href: "/docs" },
      { label: "API Reference", href: "/api" },
      { label: "Guides", href: "/guides" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    label: "Company",
    href: "/about",
    children: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function MarketingMobileMenu() {
  return (
    <MobileMenu
      navItems={marketingNav}
      showSearch={false}
      logo={
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          <span className="font-bold text-xl">Acme</span>
        </div>
      }
      footerContent={
        <div className="flex flex-col gap-2">
          <Button variant="outline" className="w-full" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button className="w-full" asChild>
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </div>
      }
    />
  );
}
```

### Integration with Header

```tsx
import { Header } from "@/components/organisms/header";
import { MobileMenu } from "@/components/organisms/mobile-menu";

export function SiteHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          <NavLink href="/features">Features</NavLink>
          <NavLink href="/pricing">Pricing</NavLink>
          <NavLink href="/about">About</NavLink>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
        </div>

        {/* Mobile Menu */}
        <MobileMenu
          navItems={navItems}
          open={mobileMenuOpen}
          onOpenChange={setMobileMenuOpen}
          triggerClassName="lg:hidden"
        />
      </div>
    </header>
  );
}
```

## Anti-patterns

### No Route Change Handling

```tsx
// Bad - menu stays open after navigation
function BadMobileMenu({ navItems }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {/* Links don't close menu */}
      <Link href="/about">About</Link>
    </Sheet>
  );
}

// Good - closes on route change
function GoodMobileMenu({ navItems }) {
  // MobileMenu handles this internally
  return <MobileMenu navItems={navItems} />;
}
```

### Missing Focus Trap

```tsx
// Bad - focus escapes the menu
<div className="mobile-menu">
  <nav>
    <Link href="/about">About</Link>
  </nav>
</div>

// Good - focus trapped with Radix Dialog
<Dialog.Root>
  <Dialog.Portal>
    <Dialog.Content>
      {/* Focus automatically trapped */}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

### No Body Scroll Lock

```tsx
// Bad - page scrolls behind open menu
<div className={cn("fixed inset-0", open && "block")}>
  {/* Content */}
</div>

// Good - body scroll locked when open
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
  return () => {
    document.body.style.overflow = "";
  };
}, [isOpen]);
```

### Deep Accordion Nesting

```tsx
// Bad - deeply nested accordions are confusing
<MobileMenu
  navItems={[
    {
      label: "Products",
      href: "/products",
      children: [
        {
          label: "Electronics",
          href: "/products/electronics",
          children: [ // Third level - avoid
            { label: "Phones", href: "/products/electronics/phones" },
          ],
        },
      ],
    },
  ]}
/>

// Good - limit to two levels
<MobileMenu
  navItems={[
    {
      label: "Products",
      href: "/products",
      children: [
        { label: "Electronics", href: "/products/electronics" },
        { label: "Clothing", href: "/products/clothing" },
      ],
    },
  ]}
/>
```

### No Keyboard Support

```tsx
// Bad - custom trigger without keyboard handling
<div onClick={() => setOpen(true)}>Menu</div>

// Good - proper button with keyboard support
<button
  type="button"
  onClick={() => setOpen(true)}
  onKeyDown={(e) => e.key === "Enter" && setOpen(true)}
  aria-expanded={open}
  aria-label="Open menu"
>
  <MenuIcon />
</button>
```

## Related Skills

### Composes From
- [molecules/nav-link](../molecules/nav-link.md) - Navigation items
- [molecules/accordion-item](../molecules/accordion-item.md) - Expandable sections
- [molecules/search-input](../molecules/search-input.md) - Mobile search

### Composes Into
- [organisms/header](./header.md) - Site header
- [templates/marketing-layout](../templates/marketing-layout.md) - Marketing pages
- [templates/app-layout](../templates/app-layout.md) - Application pages

### Alternatives
- [organisms/sidebar](./sidebar.md) - For persistent side navigation
- Bottom sheet pattern - For iOS-style bottom navigation
- Hamburger + flyout - For simpler non-modal menus

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Added complete TypeScript implementation
- Added formula and composition diagram
- Added comprehensive variants and examples
- Updated frontmatter schema with formula field
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with focus trap
- Spring-based animations
- Nested navigation support
