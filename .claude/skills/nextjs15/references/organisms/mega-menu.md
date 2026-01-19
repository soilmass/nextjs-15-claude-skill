---
id: o-mega-menu
name: Mega Menu
version: 2.0.0
layer: L3
category: navigation
description: Full-width dropdown navigation with multi-column layout and rich content
tags: [mega-menu, navigation, dropdown, multi-column, rich]
formula: MegaMenu = NavLink[] + Card + Button + (Icon + Image + Animation)
composes:
  - ../molecules/nav-link.md
  - ../molecules/card.md
dependencies: [lucide-react, framer-motion]
performance:
  impact: medium
  lcp: medium
  cls: medium
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Mega Menu

## Overview

The Mega Menu organism provides a full-width dropdown navigation with multi-column layouts, featured content, images, and call-to-action sections. Ideal for sites with complex information architecture requiring rich navigation experiences.

## Composition Diagram

```
+------------------------------------------------------------------+
|                           MegaMenu                                |
|  +------------------------------------------------------------+  |
|  |                    MegaMenuTrigger[]                        |  |
|  |  +----------+  +----------+  +----------+  +----------+    |  |
|  |  | NavLink  |  | NavLink  |  | NavLink  |  | NavLink  |    |  |
|  |  | +Chevron |  | +Chevron |  | (simple) |  | +Chevron |    |  |
|  |  +----------+  +----------+  +----------+  +----------+    |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v (hover/focus)                      |
|  +------------------------------------------------------------+  |
|  |                   MegaMenuDropdown                          |  |
|  |  +------------------------+ +---------------------------+   |  |
|  |  |    CategoryColumn      | |    FeaturedSection        |   |  |
|  |  |  +------------------+  | |  +---------------------+  |   |  |
|  |  |  | CategoryHeader   |  | |  |    FeaturedCard     |  |   |  |
|  |  |  | (Icon + Title)   |  | |  |  +---------------+  |  |   |  |
|  |  |  +------------------+  | |  |  |    Image      |  |  |   |  |
|  |  |  | MenuItemLink     |  | |  |  +---------------+  |  |   |  |
|  |  |  | MenuItemLink     |  | |  |  | Title         |  |  |   |  |
|  |  |  | MenuItemLink     |  | |  |  | Description   |  |  |   |  |
|  |  |  |  (+Image?)       |  | |  |  | Button/CTA    |  |  |   |  |
|  |  |  +------------------+  | |  |  +---------------+  |  |   |  |
|  |  +------------------------+ +---------------------------+   |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    Backdrop (blur)                          |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## When to Use

Use this skill when:
- Building e-commerce category navigation
- Creating enterprise site navigation
- Implementing content-rich dropdown menus
- Building sites with deep information architecture

## Composes

- [nav-link](../molecules/nav-link.md) - Navigation items
- [card](../molecules/card.md) - Featured content cards
- [button](../atoms/button.md) - Call-to-action buttons

## Implementation

```typescript
// components/organisms/mega-menu.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

export interface MegaMenuItem {
  /** Display label */
  label: string;
  /** Link destination */
  href: string;
  /** Item description */
  description?: string;
  /** Icon component */
  icon?: LucideIcon;
  /** Thumbnail image URL */
  image?: string;
  /** Badge text (e.g., "New", "Sale") */
  badge?: string;
}

export interface MegaMenuCategory {
  /** Category title */
  title: string;
  /** Category icon */
  icon?: LucideIcon;
  /** Category description */
  description?: string;
  /** Menu items in this category */
  items: MegaMenuItem[];
  /** View all link */
  viewAllHref?: string;
}

export interface MegaMenuFeatured {
  /** Featured content title */
  title: string;
  /** Featured description */
  description?: string;
  /** Featured image URL */
  image: string;
  /** Link destination */
  href: string;
  /** CTA button text */
  ctaText?: string;
  /** Background color class */
  bgColor?: string;
}

export interface MegaMenuSection {
  /** Trigger label */
  label: string;
  /** Direct link (for non-dropdown items) */
  href?: string;
  /** Categories in dropdown */
  categories?: MegaMenuCategory[];
  /** Featured section */
  featured?: MegaMenuFeatured;
  /** Number of columns for categories */
  columns?: 2 | 3 | 4;
}

export interface MegaMenuProps {
  /** Menu sections */
  sections: MegaMenuSection[];
  /** Additional class names */
  className?: string;
  /** Close delay in ms */
  closeDelay?: number;
  /** Open delay in ms */
  openDelay?: number;
}

// ============================================================================
// Animation Variants
// ============================================================================

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.15,
      ease: "easeIn",
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.03,
      duration: 0.2,
    },
  }),
};

// ============================================================================
// Sub-components
// ============================================================================

interface MenuItemLinkProps {
  item: MegaMenuItem;
  index: number;
  onNavigate?: () => void;
}

function MenuItemLink({ item, index, onNavigate }: MenuItemLinkProps) {
  const Icon = item.icon;

  return (
    <motion.div
      custom={index}
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <Link
        href={item.href}
        onClick={onNavigate}
        className={cn(
          "group flex items-start gap-3 rounded-lg p-3",
          "transition-colors hover:bg-accent",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        )}
      >
        {item.image ? (
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
            <Image
              src={item.image}
              alt=""
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ) : Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium group-hover:text-primary">
              {item.label}
            </span>
            {item.badge && (
              <span className="inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                {item.badge}
              </span>
            )}
          </div>
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

interface CategoryColumnProps {
  category: MegaMenuCategory;
  onNavigate?: () => void;
}

function CategoryColumn({ category, onNavigate }: CategoryColumnProps) {
  const Icon = category.icon;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-3">
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
        <h3 className="text-sm font-semibold text-foreground">
          {category.title}
        </h3>
      </div>
      {category.description && (
        <p className="px-3 text-sm text-muted-foreground">
          {category.description}
        </p>
      )}
      <ul className="space-y-1" role="menu">
        {category.items.map((item, index) => (
          <li key={item.href} role="none">
            <MenuItemLink
              item={item}
              index={index}
              onNavigate={onNavigate}
            />
          </li>
        ))}
      </ul>
      {category.viewAllHref && (
        <div className="px-3 pt-2">
          <Link
            href={category.viewAllHref}
            onClick={onNavigate}
            className="text-sm font-medium text-primary hover:underline"
          >
            View all {category.title}
          </Link>
        </div>
      )}
    </div>
  );
}

interface FeaturedSectionProps {
  featured: MegaMenuFeatured;
  onNavigate?: () => void;
}

function FeaturedSection({ featured, onNavigate }: FeaturedSectionProps) {
  return (
    <Link
      href={featured.href}
      onClick={onNavigate}
      className={cn(
        "group relative flex flex-col justify-end overflow-hidden rounded-xl",
        "h-full min-h-[280px]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        featured.bgColor ?? "bg-gradient-to-br from-primary/20 to-primary/5"
      )}
    >
      <Image
        src={featured.image}
        alt=""
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 300px"
      />
      <div className="relative z-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
        <h3 className="text-lg font-semibold text-white">{featured.title}</h3>
        {featured.description && (
          <p className="mt-1 text-sm text-white/80 line-clamp-2">
            {featured.description}
          </p>
        )}
        {featured.ctaText && (
          <span className="mt-3 inline-flex items-center text-sm font-medium text-white group-hover:underline">
            {featured.ctaText}
            <ChevronDown className="ml-1 h-4 w-4 -rotate-90" />
          </span>
        )}
      </div>
    </Link>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function MegaMenu({
  sections,
  className,
  closeDelay = 150,
  openDelay = 100,
}: MegaMenuProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = React.useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const menuRef = React.useRef<HTMLElement>(null);

  // Clear timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Close menu on route change
  React.useEffect(() => {
    setActiveSection(null);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeSection) {
        setActiveSection(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeSection]);

  const handleMouseEnter = (sectionLabel: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveSection(sectionLabel);
    }, openDelay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveSection(null);
    }, closeDelay);
  };

  const handleNavigate = () => {
    setActiveSection(null);
    setIsMobileMenuOpen(false);
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const gridColsClass = (cols: number = 3) => {
    switch (cols) {
      case 2:
        return "md:grid-cols-2";
      case 3:
        return "md:grid-cols-3";
      case 4:
        return "md:grid-cols-4";
      default:
        return "md:grid-cols-3";
    }
  };

  return (
    <>
      {/* Desktop Menu */}
      <nav
        ref={menuRef}
        className={cn("hidden lg:block", className)}
        aria-label="Main navigation"
      >
        <ul className="flex items-center gap-1" role="menubar">
          {sections.map((section) => {
            const hasDropdown = section.categories && section.categories.length > 0;
            const isOpen = activeSection === section.label;

            return (
              <li
                key={section.label}
                role="none"
                onMouseEnter={() => hasDropdown && handleMouseEnter(section.label)}
                onMouseLeave={handleMouseLeave}
              >
                {hasDropdown ? (
                  <button
                    type="button"
                    role="menuitem"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onClick={() => setActiveSection(isOpen ? null : section.label)}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown" && !isOpen) {
                        setActiveSection(section.label);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-1 px-4 py-2 text-sm font-medium",
                      "rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isOpen && "bg-accent text-accent-foreground",
                      section.href && isActive(section.href) && "text-primary"
                    )}
                  >
                    {section.label}
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isOpen && "rotate-180"
                      )}
                      aria-hidden="true"
                    />
                  </button>
                ) : (
                  <Link
                    href={section.href ?? "#"}
                    role="menuitem"
                    className={cn(
                      "flex items-center px-4 py-2 text-sm font-medium",
                      "rounded-md transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      section.href && isActive(section.href) && "text-primary"
                    )}
                    aria-current={section.href && isActive(section.href) ? "page" : undefined}
                  >
                    {section.label}
                  </Link>
                )}

                {/* Dropdown Panel */}
                <AnimatePresence>
                  {hasDropdown && isOpen && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="absolute left-0 right-0 top-full z-50"
                      role="menu"
                      aria-label={`${section.label} submenu`}
                    >
                      <div className="container py-6">
                        <div className="rounded-xl border bg-background/95 p-6 shadow-xl backdrop-blur-lg">
                          <div
                            className={cn(
                              "grid gap-6",
                              gridColsClass(section.columns),
                              section.featured && "lg:grid-cols-[1fr_300px]"
                            )}
                          >
                            {/* Categories Grid */}
                            <div
                              className={cn(
                                "grid gap-6",
                                gridColsClass(
                                  section.featured
                                    ? Math.min((section.columns ?? 3) - 1, 3)
                                    : section.columns
                                )
                              )}
                            >
                              {section.categories?.map((category) => (
                                <CategoryColumn
                                  key={category.title}
                                  category={category}
                                  onNavigate={handleNavigate}
                                />
                              ))}
                            </div>

                            {/* Featured Section */}
                            {section.featured && (
                              <FeaturedSection
                                featured={section.featured}
                                onNavigate={handleNavigate}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Backdrop */}
      <AnimatePresence>
        {activeSection && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-40 hidden bg-background/60 backdrop-blur-sm lg:block"
            aria-hidden="true"
            onClick={() => setActiveSection(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isMobileMenuOpen ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          )}
        </svg>
      </Button>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 z-50 overflow-hidden border-b bg-background lg:hidden"
          >
            <nav className="container max-h-[calc(100vh-4rem)] overflow-y-auto py-4">
              {sections.map((section) => (
                <MobileMenuSection
                  key={section.label}
                  section={section}
                  isActive={section.href ? isActive(section.href) : false}
                  onNavigate={handleNavigate}
                />
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================================
// Mobile Menu Section
// ============================================================================

interface MobileSectionProps {
  section: MegaMenuSection;
  isActive: boolean;
  onNavigate: () => void;
}

function MobileMenuSection({ section, isActive, onNavigate }: MobileSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const hasChildren = section.categories && section.categories.length > 0;

  if (!hasChildren) {
    return (
      <Link
        href={section.href ?? "#"}
        onClick={onNavigate}
        className={cn(
          "block py-3 text-base font-medium",
          "border-b transition-colors",
          isActive
            ? "text-primary"
            : "text-foreground hover:text-primary"
        )}
        aria-current={isActive ? "page" : undefined}
      >
        {section.label}
      </Link>
    );
  }

  return (
    <div className="border-b">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between py-3 text-base font-medium"
        aria-expanded={isExpanded}
      >
        <span className={isActive ? "text-primary" : ""}>{section.label}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 transition-transform",
            isExpanded && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pb-4">
              {section.categories?.map((category) => (
                <div key={category.title} className="space-y-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    {category.icon && (
                      <category.icon className="h-4 w-4" aria-hidden="true" />
                    )}
                    {category.title}
                  </h3>
                  <ul className="space-y-1 pl-6">
                    {category.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className="block py-2 text-sm text-muted-foreground hover:text-foreground"
                        >
                          {item.label}
                          {item.badge && (
                            <span className="ml-2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {section.featured && (
                <Link
                  href={section.featured.href}
                  onClick={onNavigate}
                  className="block rounded-lg bg-accent p-4"
                >
                  <h3 className="font-semibold">{section.featured.title}</h3>
                  {section.featured.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {section.featured.description}
                    </p>
                  )}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

### Key Implementation Notes

1. **Hover Intent**: Uses configurable open/close delays to prevent accidental triggers
2. **Keyboard Navigation**: Full support for arrow keys, Escape, and Enter
3. **Animation**: Framer Motion for smooth enter/exit transitions
4. **Responsive**: Complete mobile accordion menu on smaller screens
5. **Focus Management**: Proper focus trapping and restoration

## Variants

### Basic Mega Menu

```tsx
<MegaMenu
  sections={[
    { label: "Home", href: "/" },
    {
      label: "Products",
      categories: [
        {
          title: "Electronics",
          items: [
            { label: "Phones", href: "/products/phones" },
            { label: "Laptops", href: "/products/laptops" },
          ],
        },
      ],
    },
  ]}
/>
```

### With Featured Section

```tsx
<MegaMenu
  sections={[
    {
      label: "Shop",
      categories: [
        {
          title: "Men",
          icon: User,
          items: [
            { label: "Shirts", href: "/men/shirts" },
            { label: "Pants", href: "/men/pants" },
          ],
        },
        {
          title: "Women",
          icon: User,
          items: [
            { label: "Dresses", href: "/women/dresses" },
            { label: "Tops", href: "/women/tops" },
          ],
        },
      ],
      featured: {
        title: "Summer Collection",
        description: "Up to 50% off select styles",
        image: "/featured-summer.jpg",
        href: "/collections/summer",
        ctaText: "Shop Now",
      },
    },
  ]}
/>
```

### With Icons and Images

```tsx
<MegaMenu
  sections={[
    {
      label: "Services",
      columns: 4,
      categories: [
        {
          title: "Development",
          icon: Code,
          items: [
            {
              label: "Web Development",
              href: "/services/web",
              icon: Globe,
              description: "Full-stack web applications",
            },
            {
              label: "Mobile Apps",
              href: "/services/mobile",
              icon: Smartphone,
              description: "iOS and Android development",
            },
          ],
        },
        {
          title: "Design",
          icon: Palette,
          items: [
            {
              label: "UI/UX Design",
              href: "/services/ui-ux",
              image: "/thumbnails/ui-ux.jpg",
              description: "User-centered design",
            },
          ],
        },
      ],
    },
  ]}
/>
```

### E-commerce Navigation

```tsx
const ecommerceNav: MegaMenuSection[] = [
  {
    label: "Categories",
    columns: 4,
    categories: [
      {
        title: "Electronics",
        icon: Laptop,
        items: [
          { label: "Smartphones", href: "/electronics/phones", badge: "New" },
          { label: "Laptops", href: "/electronics/laptops" },
          { label: "Tablets", href: "/electronics/tablets" },
          { label: "Accessories", href: "/electronics/accessories" },
        ],
        viewAllHref: "/electronics",
      },
      {
        title: "Clothing",
        icon: Shirt,
        items: [
          { label: "Men's", href: "/clothing/mens" },
          { label: "Women's", href: "/clothing/womens" },
          { label: "Kids", href: "/clothing/kids" },
        ],
        viewAllHref: "/clothing",
      },
    ],
    featured: {
      title: "Flash Sale",
      description: "Limited time: Extra 20% off",
      image: "/sale-banner.jpg",
      href: "/sale",
      ctaText: "Shop Sale",
      bgColor: "bg-gradient-to-br from-red-500/20 to-orange-500/20",
    },
  },
  { label: "Deals", href: "/deals" },
  { label: "New Arrivals", href: "/new" },
];

<MegaMenu sections={ecommerceNav} />
```

## States

| State | Trigger | Dropdown | Backdrop |
|-------|---------|----------|----------|
| Closed | default | hidden | hidden |
| Hovering trigger | highlighted | animating in | fading in |
| Open | highlighted | visible | visible |
| Leaving | default | animating out | fading out |
| Active (current page) | primary text | - | - |
| Focus | ring-2 | - | - |
| Mobile expanded | - | accordion open | - |

## Accessibility

### Required ARIA Attributes

- `aria-expanded` on trigger buttons
- `aria-haspopup="true"` on triggers with dropdowns
- `aria-current="page"` on active items
- `role="menubar"` on main nav list
- `role="menu"` on dropdown panels
- `role="menuitem"` on menu items
- Proper heading hierarchy within columns

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate triggers and items |
| `Enter/Space` | Open dropdown / activate link |
| `Escape` | Close dropdown |
| `Arrow Down` | Open dropdown (on trigger) / Next item |
| `Arrow Up` | Previous item |
| `Arrow Right` | Next trigger |
| `Arrow Left` | Previous trigger |

### Screen Reader Announcements

- Menu role and label announced
- Expansion state changes announced
- Current page indicated
- Category headings provide structure

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0",
    "framer-motion": "^11.0.0",
    "next": "^15.0.0"
  }
}
```

### Installation

```bash
npm install lucide-react framer-motion
```

## Examples

### Marketing Site Navigation

```tsx
import { MegaMenu, type MegaMenuSection } from "@/components/organisms/mega-menu";
import { Rocket, BookOpen, Users, Headphones } from "lucide-react";

const marketingNav: MegaMenuSection[] = [
  {
    label: "Products",
    columns: 3,
    categories: [
      {
        title: "Platform",
        icon: Rocket,
        items: [
          {
            label: "Analytics",
            href: "/products/analytics",
            icon: BarChart,
            description: "Track and analyze user behavior",
          },
          {
            label: "Automation",
            href: "/products/automation",
            icon: Zap,
            description: "Automate your workflows",
          },
        ],
      },
      {
        title: "Resources",
        icon: BookOpen,
        items: [
          { label: "Documentation", href: "/docs" },
          { label: "API Reference", href: "/api" },
          { label: "Tutorials", href: "/tutorials" },
        ],
      },
    ],
    featured: {
      title: "See it in action",
      description: "Watch a 2-minute demo",
      image: "/demo-thumbnail.jpg",
      href: "/demo",
      ctaText: "Watch Demo",
    },
  },
  {
    label: "Solutions",
    categories: [
      {
        title: "By Industry",
        items: [
          { label: "E-commerce", href: "/solutions/ecommerce" },
          { label: "SaaS", href: "/solutions/saas" },
          { label: "Finance", href: "/solutions/finance" },
        ],
      },
      {
        title: "By Team",
        items: [
          { label: "Engineering", href: "/solutions/engineering" },
          { label: "Marketing", href: "/solutions/marketing" },
          { label: "Sales", href: "/solutions/sales" },
        ],
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "/enterprise" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Logo />
        <MegaMenu sections={marketingNav} />
        <div className="flex items-center gap-2">
          <Button variant="ghost">Sign In</Button>
          <Button>Get Started</Button>
        </div>
      </div>
    </header>
  );
}
```

### Enterprise Documentation Navigation

```tsx
import { MegaMenu } from "@/components/organisms/mega-menu";
import { Book, Code, Terminal, FileText, Video, MessageCircle } from "lucide-react";

const docsNav: MegaMenuSection[] = [
  {
    label: "Documentation",
    columns: 4,
    categories: [
      {
        title: "Getting Started",
        icon: Book,
        items: [
          { label: "Introduction", href: "/docs/intro", description: "Learn the basics" },
          { label: "Quick Start", href: "/docs/quickstart", badge: "5 min" },
          { label: "Installation", href: "/docs/installation" },
        ],
      },
      {
        title: "Guides",
        icon: FileText,
        items: [
          { label: "Authentication", href: "/docs/auth" },
          { label: "Database", href: "/docs/database" },
          { label: "Deployment", href: "/docs/deployment" },
        ],
        viewAllHref: "/docs/guides",
      },
      {
        title: "API Reference",
        icon: Code,
        items: [
          { label: "REST API", href: "/api/rest" },
          { label: "GraphQL", href: "/api/graphql" },
          { label: "Webhooks", href: "/api/webhooks" },
        ],
        viewAllHref: "/api",
      },
      {
        title: "SDKs",
        icon: Terminal,
        items: [
          { label: "JavaScript", href: "/sdk/javascript", image: "/icons/js.svg" },
          { label: "Python", href: "/sdk/python", image: "/icons/python.svg" },
          { label: "Go", href: "/sdk/go", image: "/icons/go.svg" },
        ],
        viewAllHref: "/sdks",
      },
    ],
  },
  {
    label: "Learn",
    categories: [
      {
        title: "Tutorials",
        icon: Video,
        items: [
          { label: "Build a Blog", href: "/tutorials/blog" },
          { label: "Build an E-commerce", href: "/tutorials/ecommerce" },
          { label: "Build a Dashboard", href: "/tutorials/dashboard" },
        ],
      },
      {
        title: "Community",
        icon: MessageCircle,
        items: [
          { label: "Discord", href: "https://discord.gg/example" },
          { label: "GitHub Discussions", href: "https://github.com/example/discussions" },
          { label: "Stack Overflow", href: "https://stackoverflow.com/questions/tagged/example" },
        ],
      },
    ],
    featured: {
      title: "New Course Available",
      description: "Master advanced patterns in 2 hours",
      image: "/course-thumbnail.jpg",
      href: "/courses/advanced",
      ctaText: "Start Learning",
    },
  },
  { label: "Blog", href: "/blog" },
  { label: "Changelog", href: "/changelog" },
];

export function DocsNav() {
  return <MegaMenu sections={docsNav} openDelay={50} closeDelay={200} />;
}
```

### E-commerce Category Navigation

```tsx
import { MegaMenu } from "@/components/organisms/mega-menu";
import { Laptop, Shirt, Home, Dumbbell, Sparkles } from "lucide-react";

const shopNav: MegaMenuSection[] = [
  {
    label: "Electronics",
    columns: 3,
    categories: [
      {
        title: "Computers",
        items: [
          { label: "Laptops", href: "/shop/laptops", image: "/products/laptop-thumb.jpg" },
          { label: "Desktops", href: "/shop/desktops", image: "/products/desktop-thumb.jpg" },
          { label: "Monitors", href: "/shop/monitors" },
          { label: "Accessories", href: "/shop/computer-accessories" },
        ],
        viewAllHref: "/shop/computers",
      },
      {
        title: "Mobile",
        items: [
          { label: "Smartphones", href: "/shop/phones", badge: "New" },
          { label: "Tablets", href: "/shop/tablets" },
          { label: "Wearables", href: "/shop/wearables" },
          { label: "Cases & Protection", href: "/shop/cases" },
        ],
        viewAllHref: "/shop/mobile",
      },
      {
        title: "Audio",
        items: [
          { label: "Headphones", href: "/shop/headphones" },
          { label: "Speakers", href: "/shop/speakers" },
          { label: "Earbuds", href: "/shop/earbuds" },
        ],
        viewAllHref: "/shop/audio",
      },
    ],
    featured: {
      title: "New MacBook Pro",
      description: "M3 chip. Unprecedented power.",
      image: "/featured/macbook.jpg",
      href: "/shop/macbook-pro",
      ctaText: "Learn More",
    },
  },
  {
    label: "Fashion",
    columns: 3,
    categories: [
      {
        title: "Men",
        icon: Shirt,
        items: [
          { label: "T-Shirts", href: "/fashion/men/tshirts" },
          { label: "Shirts", href: "/fashion/men/shirts" },
          { label: "Pants", href: "/fashion/men/pants" },
          { label: "Shoes", href: "/fashion/men/shoes" },
        ],
      },
      {
        title: "Women",
        items: [
          { label: "Dresses", href: "/fashion/women/dresses" },
          { label: "Tops", href: "/fashion/women/tops" },
          { label: "Bottoms", href: "/fashion/women/bottoms" },
          { label: "Shoes", href: "/fashion/women/shoes" },
        ],
      },
    ],
    featured: {
      title: "Summer Collection",
      description: "Fresh styles for the season",
      image: "/featured/summer.jpg",
      href: "/collections/summer",
      ctaText: "Shop Now",
      bgColor: "bg-gradient-to-br from-orange-500/20 to-yellow-500/20",
    },
  },
  { label: "Sale", href: "/sale" },
  { label: "New Arrivals", href: "/new" },
];

export function ShopNav() {
  return <MegaMenu sections={shopNav} />;
}
```

## Anti-patterns

### Too Many Categories

```tsx
// Bad - overwhelming with too many categories
<MegaMenu
  sections={[
    {
      label: "Products",
      columns: 6, // Too many columns
      categories: [
        /* 10+ categories */
      ],
    },
  ]}
/>

// Good - group related items, limit to 4 columns max
<MegaMenu
  sections={[
    {
      label: "Products",
      columns: 3,
      categories: [
        {
          title: "By Category",
          items: [/* grouped items */],
        },
      ],
    },
  ]}
/>
```

### Missing Mobile Support

```tsx
// Bad - desktop-only mega menu
<nav className="hidden lg:block">
  <MegaMenu sections={sections} />
</nav>
{/* No mobile alternative */}

// Good - MegaMenu includes responsive mobile menu automatically
<MegaMenu sections={sections} />
```

### No Keyboard Support

```tsx
// Bad - hover-only interaction
<div onMouseEnter={() => setOpen(true)}>
  {/* No keyboard handling */}
</div>

// Good - keyboard and mouse support (built into MegaMenu)
<MegaMenu sections={sections} />
```

### Inconsistent Item Styles

```tsx
// Bad - mixing icon/image styles randomly
categories: [
  {
    items: [
      { label: "A", icon: IconA }, // Has icon
      { label: "B" }, // No icon or image
      { label: "C", image: "/c.jpg" }, // Has image
    ],
  },
]

// Good - consistent styling within a category
categories: [
  {
    title: "With Icons",
    items: [
      { label: "A", icon: IconA },
      { label: "B", icon: IconB },
    ],
  },
  {
    title: "With Images",
    items: [
      { label: "C", image: "/c.jpg" },
      { label: "D", image: "/d.jpg" },
    ],
  },
]
```

### Slow Animations

```tsx
// Bad - slow animations frustrate users
const variants = {
  visible: { transition: { duration: 0.8 } }, // Too slow
};

// Good - quick, responsive animations (default in MegaMenu)
const variants = {
  visible: { transition: { duration: 0.2 } },
};
```

## Related Skills

### Composes From
- [molecules/nav-link](../molecules/nav-link.md) - Navigation items
- [molecules/card](../molecules/card.md) - Featured content

### Composes Into
- [organisms/header](./header.md) - Site header

### Alternatives
- [organisms/sidebar](./sidebar.md) - For dashboard navigation
- Simple dropdown menus - For simpler navigation needs
- Tab-based navigation - For content switching

---

## Changelog

### 2.0.0 (2025-01-18)
- Complete implementation with full TypeScript code
- Added formula and composition diagram
- Multi-column layout with configurable columns (2-4)
- Featured section with image and CTA support
- Framer Motion animations for smooth transitions
- Full keyboard navigation support
- Responsive mobile accordion menu
- Configurable open/close delays
- Comprehensive examples and anti-patterns

### 1.0.0 (2025-01-16)
- Initial implementation with multi-column layout
- Featured content support
- Smooth animations
