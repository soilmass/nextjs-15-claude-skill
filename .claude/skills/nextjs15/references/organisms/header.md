---
id: o-header
name: Header
version: 2.0.0
layer: L3
category: navigation
description: Site header with logo, navigation, search, and responsive mobile menu
tags: [header, navigation, navbar, sticky, responsive]
formula: "Header = NavLink(m-nav-link)[] + SearchInput(m-search-input) + Button(a-button) + MobileMenu(Sheet)"
composes:
  - ../molecules/nav-link.md
  - ../molecules/search-input.md
dependencies: [framer-motion, lucide-react]
performance:
  impact: medium
  lcp: high
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Header

## Overview

The Header organism provides a complete site navigation header with logo, main navigation, search/command palette trigger, theme toggle, and responsive mobile menu. Features sticky behavior with blur effect on scroll and supports mega menu dropdowns.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header (o-header)                                                      │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Container (h-16, flex justify-between)                           │  │
│  │                                                                   │  │
│  │  ┌──────────┐  ┌────────────────────────┐  ┌───────────────────┐  │  │
│  │  │  Logo    │  │  NavigationMenu        │  │  Actions          │  │  │
│  │  │  (Link)  │  │  (desktop only)        │  │                   │  │  │
│  │  │          │  │  ┌──────────────────┐  │  │  ┌─────────────┐  │  │  │
│  │  │          │  │  │ NavLink[] items  │  │  │  │ SearchBtn   │  │  │  │
│  │  │          │  │  │ ├── Item         │  │  │  │ (a-button)  │  │  │  │
│  │  │          │  │  │ ├── Item         │  │  │  ├─────────────┤  │  │  │
│  │  │          │  │  │ └── Dropdown     │  │  │  │ ThemeToggle │  │  │  │
│  │  │          │  │  │     └── Children │  │  │  ├─────────────┤  │  │  │
│  │  │          │  │  └──────────────────┘  │  │  │ Actions     │  │  │  │
│  │  │          │  │  (m-nav-link)          │  │  │ (a-button)  │  │  │  │
│  │  │          │  │                        │  │  ├─────────────┤  │  │  │
│  │  │          │  │                        │  │  │ MobileMenu  │  │  │  │
│  │  │          │  │                        │  │  │ (lg:hidden) │  │  │  │
│  │  └──────────┘  └────────────────────────┘  │  └─────────────┘  │  │  │
│  │                                            └───────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  MobileMenu (Sheet, slide-right)                                  │  │
│  │  ├── NavLink(m-nav-link)[] [vertical stack]                       │  │
│  │  │   ├── Link item                                                │  │
│  │  │   ├── Link item                                                │  │
│  │  │   └── Children (indented)                                      │  │
│  │  └── Actions: SearchInput(m-search-input) + Button(a-button)[]    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## When to Use

Use this skill when:
- Building the main site navigation
- Creating marketing site headers
- Implementing dashboard navigation bars
- Building e-commerce site headers

## Composes

- [nav-link](../molecules/nav-link.md) - Navigation links
- [search-input](../molecules/search-input.md) - Search trigger
- Mobile menu trigger
- Theme toggle

## Implementation

```typescript
// components/organisms/header.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

interface NavItem {
  label: string;
  href: string;
  description?: string;
  children?: NavItem[];
}

interface HeaderProps {
  /** Logo component or element */
  logo: React.ReactNode;
  /** Navigation items */
  navItems: NavItem[];
  /** Right-side action buttons */
  actions?: React.ReactNode;
  /** Show search/command palette trigger */
  showSearch?: boolean;
  /** Search click handler */
  onSearchClick?: () => void;
  /** Sticky behavior */
  sticky?: boolean;
  /** Transparent until scroll */
  transparent?: boolean;
  /** Additional class names */
  className?: string;
}

export function Header({
  logo,
  navItems,
  actions,
  showSearch = true,
  onSearchClick,
  sticky = true,
  transparent = false,
  className,
}: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Track scroll position
  React.useEffect(() => {
    if (!sticky && !transparent) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll(); // Check initial state
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sticky, transparent]);

  // Close mobile menu on route change
  React.useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "z-50 w-full transition-all duration-300",
        sticky && "sticky top-0",
        isScrolled || !transparent
          ? "bg-background/80 backdrop-blur-lg border-b shadow-sm"
          : "bg-transparent",
        className
      )}
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 shrink-0"
            aria-label="Home"
          >
            {logo}
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden lg:flex">
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  {item.children ? (
                    <>
                      <NavigationMenuTrigger
                        className={cn(
                          isActive(item.href) && "text-primary"
                        )}
                      >
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <NavigationMenuLink asChild>
                                <Link
                                  href={child.href}
                                  className={cn(
                                    "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                                    "hover:bg-accent hover:text-accent-foreground",
                                    "focus:bg-accent focus:text-accent-foreground",
                                    isActive(child.href) && "bg-accent"
                                  )}
                                >
                                  <div className="text-sm font-medium leading-none">
                                    {child.label}
                                  </div>
                                  {child.description && (
                                    <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                      {child.description}
                                    </p>
                                  )}
                                </Link>
                              </NavigationMenuLink>
                            </li>
                          ))}
                        </ul>
                      </NavigationMenuContent>
                    </>
                  ) : (
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          isActive(item.href) && "text-primary"
                        )}
                      >
                        {item.label}
                      </NavigationMenuLink>
                    </Link>
                  )}
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Search Trigger */}
            {showSearch && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onSearchClick}
                aria-label="Search"
                className="hidden sm:flex"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Custom Actions */}
            <div className="hidden sm:flex items-center gap-2">
              {actions}
            </div>

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <nav className="flex flex-col gap-4 mt-8">
                  {navItems.map((item) => (
                    <div key={item.href}>
                      <SheetClose asChild>
                        <Link
                          href={item.href}
                          className={cn(
                            "block py-2 text-lg font-medium transition-colors",
                            isActive(item.href)
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                      {item.children && (
                        <div className="ml-4 mt-2 space-y-2">
                          {item.children.map((child) => (
                            <SheetClose key={child.href} asChild>
                              <Link
                                href={child.href}
                                className={cn(
                                  "block py-1.5 text-sm transition-colors",
                                  isActive(child.href)
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {child.label}
                              </Link>
                            </SheetClose>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {/* Mobile Actions */}
                  <div className="mt-4 pt-4 border-t space-y-4">
                    {showSearch && (
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onSearchClick?.();
                        }}
                      >
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </Button>
                    )}
                    {actions}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
```

```typescript
// components/ui/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

### Key Implementation Notes

1. **Scroll Detection**: Passive scroll listener for performance
2. **Route-based Active**: Auto-detects current route for active states
3. **Mobile Menu**: Sheet-based slide-out menu on smaller screens
4. **Blur Effect**: Backdrop blur on scroll for modern glass effect

## Variants

### Basic Header

```tsx
<Header
  logo={<Logo />}
  navItems={[
    { label: "Home", href: "/" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ]}
/>
```

### With Dropdown Navigation

```tsx
<Header
  logo={<Logo />}
  navItems={[
    { label: "Home", href: "/" },
    {
      label: "Products",
      href: "/products",
      children: [
        { label: "All Products", href: "/products", description: "Browse our catalog" },
        { label: "New Arrivals", href: "/products/new", description: "Latest additions" },
        { label: "Sale", href: "/products/sale", description: "Special offers" },
      ],
    },
    { label: "About", href: "/about" },
  ]}
/>
```

### With Actions

```tsx
<Header
  logo={<Logo />}
  navItems={navItems}
  actions={
    <>
      <Button variant="ghost" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/signup">Get Started</Link>
      </Button>
    </>
  }
/>
```

### Transparent Header (for Hero sections)

```tsx
<Header
  logo={<Logo />}
  navItems={navItems}
  transparent
  sticky
/>
```

### With Command Palette

```tsx
const [commandOpen, setCommandOpen] = React.useState(false);

<>
  <Header
    logo={<Logo />}
    navItems={navItems}
    onSearchClick={() => setCommandOpen(true)}
  />
  <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
</>
```

## States

| State | Background | Border | Shadow | Blur |
|-------|------------|--------|--------|------|
| Default (not scrolled) | transparent | none | none | none |
| Scrolled | background/80 | bottom | sm | lg |
| Mobile menu open | background/80 | bottom | sm | lg |

## Accessibility

### Required ARIA Attributes

- `aria-label` on logo link
- `aria-expanded` on mobile menu trigger
- `aria-current="page"` on current nav item
- Skip link recommended before header

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between items |
| `Enter/Space` | Activate links/dropdowns |
| `Escape` | Close mobile menu/dropdowns |
| `Arrow keys` | Navigate within dropdowns |

### Screen Reader Announcements

- Navigation landmark identified
- Current page announced
- Dropdown expansion announced
- Mobile menu state changes announced

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0",
    "@radix-ui/react-navigation-menu": "^1.2.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "next-themes": "^0.3.0"
  }
}
```

### Installation

```bash
npm install lucide-react @radix-ui/react-navigation-menu @radix-ui/react-dialog next-themes
```

## Examples

### Marketing Site Header

```tsx
import { Header } from "@/components/organisms/header";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const marketingNav = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  {
    label: "Resources",
    href: "/resources",
    children: [
      { label: "Documentation", href: "/docs", description: "Learn how to use our product" },
      { label: "API Reference", href: "/api", description: "Technical documentation" },
      { label: "Guides", href: "/guides", description: "Step-by-step tutorials" },
    ],
  },
];

export function MarketingHeader() {
  return (
    <Header
      logo={
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="" className="h-8 w-8" />
          <span className="font-bold text-xl">Brand</span>
        </div>
      }
      navItems={marketingNav}
      transparent
      actions={
        <>
          <Button variant="ghost" asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Start Free Trial</Link>
          </Button>
        </>
      }
    />
  );
}
```

### Dashboard Header

```tsx
export function DashboardHeader() {
  const [searchOpen, setSearchOpen] = React.useState(false);

  return (
    <>
      <Header
        logo={<Logo />}
        navItems={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Projects", href: "/projects" },
          { label: "Team", href: "/team" },
          { label: "Settings", href: "/settings" },
        ]}
        onSearchClick={() => setSearchOpen(true)}
        actions={
          <UserMenu />
        }
      />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
```

### E-commerce Header

```tsx
export function EcommerceHeader() {
  return (
    <Header
      logo={<StoreLogo />}
      navItems={[
        {
          label: "Shop",
          href: "/shop",
          children: [
            { label: "Women", href: "/shop/women" },
            { label: "Men", href: "/shop/men" },
            { label: "Kids", href: "/shop/kids" },
            { label: "Sale", href: "/shop/sale" },
          ],
        },
        { label: "New Arrivals", href: "/new" },
        { label: "Collections", href: "/collections" },
      ]}
      actions={
        <>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/wishlist">
              <Heart className="h-5 w-5" />
            </Link>
          </Button>
          <CartButton />
          <UserMenu />
        </>
      }
    />
  );
}
```

## Anti-patterns

### Too Many Top-level Items

```tsx
// Bad - overwhelming navigation
<Header
  navItems={[
    { label: "Home", href: "/" },
    { label: "Products", href: "/products" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Team", href: "/team" },
    { label: "Careers", href: "/careers" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ]}
/>

// Good - group related items
<Header
  navItems={[
    { label: "Home", href: "/" },
    {
      label: "Products",
      href: "/products",
      children: [/* ... */],
    },
    {
      label: "Company",
      href: "/about",
      children: [
        { label: "About", href: "/about" },
        { label: "Team", href: "/team" },
        { label: "Careers", href: "/careers" },
      ],
    },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ]}
/>
```

### Missing Mobile Navigation

```tsx
// Bad - nav items hidden on mobile
<nav className="hidden md:flex">
  {/* No mobile alternative */}
</nav>

// Good - responsive with mobile menu
<Header navItems={navItems} /> // Includes mobile Sheet
```

### No Skip Link

```tsx
// Bad - no way to skip navigation
<Header />
<main>...</main>

// Good - skip link for keyboard users
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to content
</a>
<Header />
<main id="main">...</main>
```

## Related Skills

### Composes From
- [molecules/nav-link](../molecules/nav-link.md) - Navigation links
- [molecules/search-input](../molecules/search-input.md) - Search trigger

### Composes Into
- [templates/marketing-layout](../templates/marketing-layout.md) - Marketing pages
- [templates/dashboard-layout](../templates/dashboard-layout.md) - App pages

### Alternatives
- [organisms/sidebar](./sidebar.md) - For dashboard navigation
- Separate top bar + side nav combination

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with responsive design
- Dropdown navigation support
- Mobile sheet menu
- Theme toggle integration
