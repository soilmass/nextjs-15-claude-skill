---
id: o-sidebar
name: Sidebar
version: 2.0.0
layer: L3
category: navigation
description: Collapsible sidebar navigation for dashboards and applications
tags: [sidebar, navigation, dashboard, menu, collapsible]
formula: "Sidebar = NavLink[] + AvatarGroup + Button + Tooltip + ScrollArea + Collapsible"
composes:
  - ../molecules/nav-link.md
  - ../molecules/avatar-group.md
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

# Sidebar

## Overview

The Sidebar organism provides a complete vertical navigation solution for dashboards and applications. Features collapsible/expandable states, grouped navigation sections, nested items with icons, user profile menu, and responsive behavior with mobile overlay support. Persists collapse state to localStorage and supports full keyboard navigation.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ Sidebar                                                         │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Header                                                      │ │
│ │ ┌───────────────────────┐ ┌───────────────────────────────┐ │ │
│ │ │ Logo                  │ │ Collapse Button               │ │ │
│ │ │ [Image + Text]        │ │ [Button + Tooltip]            │ │ │
│ │ └───────────────────────┘ └───────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ ScrollArea                                                  │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ NavSection                                              │ │ │
│ │ │ ┌─────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ Section Header (optional)                           │ │ │ │
│ │ │ └─────────────────────────────────────────────────────┘ │ │ │
│ │ │ ┌─────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ NavItem [NavLink + Tooltip + Badge]                 │ │ │ │
│ │ │ │ ├── Icon                                            │ │ │ │
│ │ │ │ ├── Label                                           │ │ │ │
│ │ │ │ └── Badge (optional)                                │ │ │ │
│ │ │ └─────────────────────────────────────────────────────┘ │ │ │
│ │ │ ┌─────────────────────────────────────────────────────┐ │ │ │
│ │ │ │ CollapsibleNavItem [Collapsible + NavLink[]]        │ │ │ │
│ │ │ │ ├── Parent Item (trigger)                           │ │ │ │
│ │ │ │ └── Children (collapsible content)                  │ │ │ │
│ │ │ │     ├── NavItem                                     │ │ │ │
│ │ │ │     ├── NavItem                                     │ │ │ │
│ │ │ │     └── NavItem                                     │ │ │ │
│ │ │ └─────────────────────────────────────────────────────┘ │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Footer                                                      │ │
│ │ ┌─────────────────────────────────────────────────────────┐ │ │
│ │ │ UserMenu [AvatarGroup + DropdownMenu]                   │ │ │
│ │ │ ├── Avatar                                              │ │ │
│ │ │ ├── User Name                                           │ │ │
│ │ │ ├── User Email                                          │ │ │
│ │ │ └── Dropdown Actions                                    │ │ │
│ │ └─────────────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## When to Use

Use this skill when:
- Building dashboard navigation
- Creating admin panel sidebars
- Implementing application shell navigation
- Building multi-section app navigation
- Creating workspace or project navigation

## Composes

- [nav-link](../molecules/nav-link.md) - Navigation items
- [avatar-group](../molecules/avatar-group.md) - User profile section
- [button](../atoms/button.md) - Collapse toggle
- [tooltip](../atoms/tooltip.md) - Labels in collapsed mode

## Implementation

```typescript
// components/organisms/sidebar.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// ============================================================================
// Types
// ============================================================================

export interface NavItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Route path */
  href: string;
  /** Icon component */
  icon?: LucideIcon | React.ReactNode;
  /** Badge content (e.g., notification count) */
  badge?: string | number;
  /** Badge variant */
  badgeVariant?: "default" | "destructive" | "outline";
  /** Nested navigation items */
  children?: NavItem[];
  /** Disable the item */
  disabled?: boolean;
  /** External link */
  external?: boolean;
}

export interface NavSection {
  /** Section identifier */
  id: string;
  /** Section header label (optional) */
  label?: string;
  /** Navigation items in this section */
  items: NavItem[];
}

export interface UserProfile {
  /** User's name */
  name: string;
  /** User's email */
  email: string;
  /** Avatar image URL */
  avatar?: string;
  /** User role or subtitle */
  role?: string;
}

export interface SidebarProps {
  /** Logo element or component */
  logo: React.ReactNode;
  /** Collapsed logo (icon-only version) */
  logoCollapsed?: React.ReactNode;
  /** Navigation sections */
  sections: NavSection[];
  /** User profile for footer */
  user?: UserProfile;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Controlled collapsed state */
  collapsed?: boolean;
  /** Callback when collapse state changes */
  onCollapsedChange?: (collapsed: boolean) => void;
  /** localStorage key for persistence */
  storageKey?: string;
  /** Width when expanded (default: 256px) */
  expandedWidth?: number;
  /** Width when collapsed (default: 64px) */
  collapsedWidth?: number;
  /** Custom footer content (replaces user menu) */
  footer?: React.ReactNode;
  /** Additional actions for user menu */
  userMenuActions?: React.ReactNode;
  /** Callback when user clicks sign out */
  onSignOut?: () => void;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Hook: useSidebarState
// ============================================================================

function useSidebarState({
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  storageKey = "sidebar-collapsed",
}: {
  defaultCollapsed?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  storageKey?: string;
}) {
  const [internalCollapsed, setInternalCollapsed] = React.useState(() => {
    if (typeof window === "undefined") return defaultCollapsed;
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? JSON.parse(stored) : defaultCollapsed;
    } catch {
      return defaultCollapsed;
    }
  });

  const isControlled = controlledCollapsed !== undefined;
  const collapsed = isControlled ? controlledCollapsed : internalCollapsed;

  const setCollapsed = React.useCallback(
    (value: boolean | ((prev: boolean) => boolean)) => {
      const newValue = typeof value === "function" ? value(collapsed) : value;

      if (!isControlled) {
        setInternalCollapsed(newValue);
        try {
          localStorage.setItem(storageKey, JSON.stringify(newValue));
        } catch {
          // localStorage not available
        }
      }

      onCollapsedChange?.(newValue);
    },
    [collapsed, isControlled, onCollapsedChange, storageKey]
  );

  return [collapsed, setCollapsed] as const;
}

// ============================================================================
// Context
// ============================================================================

interface SidebarContextValue {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebarContext() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("Sidebar components must be used within a Sidebar");
  }
  return context;
}

// ============================================================================
// NavItem Component
// ============================================================================

interface NavItemComponentProps {
  item: NavItem;
  depth?: number;
}

function NavItemComponent({ item, depth = 0 }: NavItemComponentProps) {
  const pathname = usePathname();
  const { collapsed } = useSidebarContext();
  const [isOpen, setIsOpen] = React.useState(false);

  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);

  const hasChildren = item.children && item.children.length > 0;

  // Auto-expand if a child is active
  React.useEffect(() => {
    if (hasChildren && item.children) {
      const childIsActive = item.children.some(
        (child) =>
          pathname === child.href || pathname.startsWith(`${child.href}/`)
      );
      if (childIsActive) {
        setIsOpen(true);
      }
    }
  }, [pathname, hasChildren, item.children]);

  const Icon = item.icon;
  const iconElement =
    typeof Icon === "function" ? (
      <Icon className="h-4 w-4 shrink-0" />
    ) : (
      Icon
    );

  const content = (
    <span
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-primary/10 text-primary",
        item.disabled && "pointer-events-none opacity-50",
        collapsed && depth === 0 && "justify-center px-2"
      )}
    >
      {iconElement}
      {(!collapsed || depth > 0) && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span
              className={cn(
                "ml-auto rounded-full px-2 py-0.5 text-xs font-medium",
                item.badgeVariant === "destructive"
                  ? "bg-destructive text-destructive-foreground"
                  : item.badgeVariant === "outline"
                  ? "border border-border"
                  : "bg-primary/10 text-primary"
              )}
            >
              {item.badge}
            </span>
          )}
          {hasChildren && (
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          )}
        </>
      )}
    </span>
  );

  // Collapsed mode with tooltip
  if (collapsed && depth === 0) {
    if (hasChildren) {
      return (
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center justify-center rounded-md p-2 transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive && "bg-primary/10 text-primary"
                  )}
                  aria-label={item.label}
                >
                  {iconElement}
                </button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              {item.label}
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent side="right" align="start" className="w-48">
            <DropdownMenuLabel>{item.label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {item.children?.map((child) => (
              <DropdownMenuItem key={child.id} asChild>
                <Link
                  href={child.href}
                  className={cn(
                    "flex items-center gap-2",
                    pathname === child.href && "text-primary"
                  )}
                >
                  {typeof child.icon === "function" ? (
                    <child.icon className="h-4 w-4" />
                  ) : (
                    child.icon
                  )}
                  {child.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center justify-center rounded-md p-2 transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "bg-primary/10 text-primary",
              item.disabled && "pointer-events-none opacity-50"
            )}
            aria-current={isActive ? "page" : undefined}
            aria-label={item.label}
            {...(item.external && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
          >
            {iconElement}
            {item.badge && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                {item.badge}
              </span>
            )}
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          <p>{item.label}</p>
          {item.badge && (
            <p className="text-xs text-muted-foreground">
              {item.badge} new
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Expanded mode with collapsible children
  if (hasChildren) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <button
            type="button"
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive && "bg-primary/10 text-primary"
            )}
            aria-expanded={isOpen}
          >
            {iconElement}
            <span className="flex-1 truncate text-left">{item.label}</span>
            {item.badge && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  item.badgeVariant === "destructive"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                {item.badge}
              </span>
            )}
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
          <div className="ml-4 mt-1 space-y-1 border-l pl-3">
            {item.children?.map((child) => (
              <NavItemComponent key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  // Standard link
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isActive && "bg-primary/10 text-primary",
        item.disabled && "pointer-events-none opacity-50",
        depth > 0 && "py-1.5 text-sm"
      )}
      aria-current={isActive ? "page" : undefined}
      {...(item.external && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
    >
      {depth === 0 && iconElement}
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge && (
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-medium",
            item.badgeVariant === "destructive"
              ? "bg-destructive text-destructive-foreground"
              : "bg-primary/10 text-primary"
          )}
        >
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ============================================================================
// NavSection Component
// ============================================================================

interface NavSectionComponentProps {
  section: NavSection;
}

function NavSectionComponent({ section }: NavSectionComponentProps) {
  const { collapsed } = useSidebarContext();

  return (
    <div className="space-y-1">
      {section.label && !collapsed && (
        <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {section.label}
        </h3>
      )}
      {collapsed && section.label && (
        <div className="mx-auto my-2 h-px w-8 bg-border" />
      )}
      {section.items.map((item) => (
        <NavItemComponent key={item.id} item={item} />
      ))}
    </div>
  );
}

// ============================================================================
// UserMenu Component
// ============================================================================

interface UserMenuProps {
  user: UserProfile;
  onSignOut?: () => void;
  additionalActions?: React.ReactNode;
}

function UserMenu({ user, onSignOut, additionalActions }: UserMenuProps) {
  const { collapsed } = useSidebarContext();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const trigger = (
    <button
      type="button"
      className={cn(
        "flex w-full items-center gap-3 rounded-md p-2 text-left transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        collapsed && "justify-center"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
      </Avatar>
      {!collapsed && (
        <>
          <div className="flex-1 truncate">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </>
      )}
    </button>
  );

  const menuContent = (
    <DropdownMenuContent
      side={collapsed ? "right" : "top"}
      align={collapsed ? "start" : "end"}
      className="w-56"
    >
      <DropdownMenuLabel>
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
          {user.role && (
            <p className="text-xs text-muted-foreground">{user.role}</p>
          )}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      {additionalActions && (
        <>
          <DropdownMenuSeparator />
          {additionalActions}
        </>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={onSignOut} className="text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  );

  if (collapsed) {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            <p className="font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </TooltipContent>
        </Tooltip>
        {menuContent}
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      {menuContent}
    </DropdownMenu>
  );
}

// ============================================================================
// Sidebar Component
// ============================================================================

export function Sidebar({
  logo,
  logoCollapsed,
  sections,
  user,
  defaultCollapsed = false,
  collapsed: controlledCollapsed,
  onCollapsedChange,
  storageKey = "sidebar-collapsed",
  expandedWidth = 256,
  collapsedWidth = 64,
  footer,
  userMenuActions,
  onSignOut,
  className,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useSidebarState({
    defaultCollapsed,
    collapsed: controlledCollapsed,
    onCollapsedChange,
    storageKey,
  });

  const sidebarRef = React.useRef<HTMLElement>(null);

  // Keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with keyboard shortcut (Cmd/Ctrl + B)
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setCollapsed((prev) => !prev);
      }

      // Focus sidebar with keyboard shortcut (Cmd/Ctrl + /)
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        const firstFocusable = sidebarRef.current?.querySelector<HTMLElement>(
          'a[href], button:not([disabled])'
        );
        firstFocusable?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [setCollapsed]);

  // Handle arrow key navigation within sidebar
  const handleKeyNavigation = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      const focusableElements = sidebarRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );

      if (!focusableElements) return;

      const currentIndex = Array.from(focusableElements).indexOf(
        document.activeElement as HTMLElement
      );

      if (currentIndex === -1) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          focusableElements[
            (currentIndex + 1) % focusableElements.length
          ]?.focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          focusableElements[
            (currentIndex - 1 + focusableElements.length) %
              focusableElements.length
          ]?.focus();
          break;
        case "Home":
          e.preventDefault();
          focusableElements[0]?.focus();
          break;
        case "End":
          e.preventDefault();
          focusableElements[focusableElements.length - 1]?.focus();
          break;
      }
    },
    []
  );

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <TooltipProvider delayDuration={0}>
        <aside
          ref={sidebarRef}
          className={cn(
            "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-background transition-all duration-300",
            className
          )}
          style={{ width: collapsed ? collapsedWidth : expandedWidth }}
          onKeyDown={handleKeyNavigation}
          role="navigation"
          aria-label="Main sidebar navigation"
        >
          {/* Header with Logo and Collapse Toggle */}
          <div
            className={cn(
              "flex h-16 shrink-0 items-center border-b px-4",
              collapsed && "justify-center px-2"
            )}
          >
            <Link
              href="/"
              className="flex items-center gap-2 overflow-hidden"
              aria-label="Home"
            >
              {collapsed ? logoCollapsed || logo : logo}
            </Link>
            {!collapsed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8"
                    onClick={() => setCollapsed(true)}
                    aria-label="Collapse sidebar"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Collapse sidebar (Ctrl+B)
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Expand button when collapsed */}
          {collapsed && (
            <div className="flex justify-center py-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setCollapsed(false)}
                    aria-label="Expand sidebar"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Expand sidebar (Ctrl+B)
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Navigation Sections */}
          <ScrollArea className="flex-1 px-3 py-4">
            <div className="space-y-6">
              {sections.map((section) => (
                <NavSectionComponent key={section.id} section={section} />
              ))}
            </div>
          </ScrollArea>

          {/* Footer with User Menu */}
          <div className={cn("shrink-0 border-t p-3", collapsed && "p-2")}>
            {footer || (user && (
              <UserMenu
                user={user}
                onSignOut={onSignOut}
                additionalActions={userMenuActions}
              />
            ))}
          </div>
        </aside>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
}

// ============================================================================
// Mobile Sidebar Component
// ============================================================================

interface MobileSidebarProps extends SidebarProps {
  /** Trigger element for opening mobile sidebar */
  trigger?: React.ReactNode;
}

export function MobileSidebar({
  trigger,
  ...props
}: MobileSidebarProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" className="lg:hidden">
            <ChevronRight className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <Sidebar {...props} collapsed={false} className="relative w-full" />
      </SheetContent>
    </Sheet>
  );
}

// ============================================================================
// Export useSidebar hook
// ============================================================================

export function useSidebar() {
  return useSidebarContext();
}
```

### Key Implementation Notes

1. **State Persistence**: Uses localStorage with a configurable key to persist collapsed state across sessions
2. **Keyboard Navigation**: Full keyboard support with Ctrl+B to toggle, arrow keys to navigate
3. **Tooltips in Collapsed Mode**: Shows tooltips with labels and nested items as dropdowns
4. **Auto-expand Children**: Automatically expands parent items when a child route is active
5. **Context API**: Provides `useSidebar` hook for child components to access sidebar state

## Variants

### Basic Sidebar

```tsx
<Sidebar
  logo={<Logo />}
  sections={[
    {
      id: "main",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
        { id: "projects", label: "Projects", href: "/projects", icon: Folder },
        { id: "settings", label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ]}
/>
```

### With Sections and Headers

```tsx
<Sidebar
  logo={<Logo />}
  sections={[
    {
      id: "overview",
      label: "Overview",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
        { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart },
      ],
    },
    {
      id: "management",
      label: "Management",
      items: [
        { id: "users", label: "Users", href: "/users", icon: Users },
        { id: "teams", label: "Teams", href: "/teams", icon: UserPlus },
      ],
    },
  ]}
/>
```

### With Nested Navigation

```tsx
<Sidebar
  logo={<Logo />}
  sections={[
    {
      id: "main",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
        {
          id: "projects",
          label: "Projects",
          href: "/projects",
          icon: Folder,
          children: [
            { id: "all", label: "All Projects", href: "/projects" },
            { id: "active", label: "Active", href: "/projects/active" },
            { id: "archived", label: "Archived", href: "/projects/archived" },
          ],
        },
      ],
    },
  ]}
/>
```

### With User Profile

```tsx
<Sidebar
  logo={<Logo />}
  sections={sections}
  user={{
    name: "John Doe",
    email: "john@example.com",
    avatar: "/avatars/john.jpg",
    role: "Administrator",
  }}
  onSignOut={() => signOut()}
/>
```

### With Badges

```tsx
<Sidebar
  logo={<Logo />}
  sections={[
    {
      id: "main",
      items: [
        { id: "inbox", label: "Inbox", href: "/inbox", icon: Mail, badge: 12, badgeVariant: "destructive" },
        { id: "tasks", label: "Tasks", href: "/tasks", icon: CheckSquare, badge: 3 },
      ],
    },
  ]}
/>
```

### Controlled Collapsed State

```tsx
function DashboardLayout() {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex">
      <Sidebar
        logo={<Logo />}
        sections={sections}
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
      />
      <main className={cn("flex-1 transition-all", collapsed ? "ml-16" : "ml-64")}>
        {children}
      </main>
    </div>
  );
}
```

## States

| State | Width | Content | Tooltips | Nested Items |
|-------|-------|---------|----------|--------------|
| Expanded | 256px | Full labels | Hidden | Collapsible |
| Collapsed | 64px | Icons only | Visible | Dropdown menu |
| Mobile (Sheet) | 256px | Full labels | Hidden | Collapsible |

### Visual States

| Element | Default | Hover | Active | Focused | Disabled |
|---------|---------|-------|--------|---------|----------|
| NavItem | muted-foreground | bg-accent | bg-primary/10, text-primary | ring-2 | opacity-50 |
| Section Header | muted-foreground | - | - | - | - |
| UserMenu | - | bg-accent | - | ring-2 | - |
| CollapseButton | ghost | bg-accent | - | ring-2 | - |

## Accessibility

### Required ARIA Attributes

- `role="navigation"` on sidebar container
- `aria-label="Main sidebar navigation"` on container
- `aria-label` on collapse toggle button
- `aria-expanded` on collapsible sections
- `aria-current="page"` on active items
- `aria-label` for icon-only buttons in collapsed mode

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between focusable items |
| `Enter/Space` | Activate item or expand/collapse section |
| `Arrow Up` | Move focus to previous item |
| `Arrow Down` | Move focus to next item |
| `Home` | Move focus to first item |
| `End` | Move focus to last item |
| `Escape` | Close mobile sidebar or dropdown |
| `Ctrl/Cmd + B` | Toggle sidebar collapsed state |
| `Ctrl/Cmd + /` | Focus sidebar |

### Screen Reader Announcements

- Navigation landmark identified
- Current page announced
- Expanded/collapsed state for sections
- Badge counts announced
- User menu state changes

### Focus Management

- Focus trap in mobile Sheet mode
- Focus returns to trigger on close
- Logical focus order maintained
- Visible focus indicators on all interactive elements

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0",
    "@radix-ui/react-collapsible": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.0",
    "@radix-ui/react-dropdown-menu": "^2.1.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "@radix-ui/react-scroll-area": "^1.1.0"
  }
}
```

### Installation

```bash
npm install lucide-react @radix-ui/react-collapsible @radix-ui/react-tooltip @radix-ui/react-dropdown-menu @radix-ui/react-dialog @radix-ui/react-scroll-area
```

## Examples

### Dashboard Layout

```tsx
import { Sidebar, MobileSidebar } from "@/components/organisms/sidebar";
import { Home, BarChart, Users, Settings, FileText, Bell, Menu } from "lucide-react";

const dashboardSections = [
  {
    id: "main",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
      { id: "analytics", label: "Analytics", href: "/analytics", icon: BarChart },
    ],
  },
  {
    id: "management",
    label: "Management",
    items: [
      {
        id: "users",
        label: "Users",
        href: "/users",
        icon: Users,
        children: [
          { id: "all-users", label: "All Users", href: "/users" },
          { id: "roles", label: "Roles", href: "/users/roles" },
          { id: "permissions", label: "Permissions", href: "/users/permissions" },
        ],
      },
      { id: "reports", label: "Reports", href: "/reports", icon: FileText },
    ],
  },
  {
    id: "system",
    label: "System",
    items: [
      { id: "notifications", label: "Notifications", href: "/notifications", icon: Bell, badge: 5 },
      { id: "settings", label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          logo={
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="" className="h-8 w-8" />
              <span className="font-bold">Acme Inc</span>
            </div>
          }
          logoCollapsed={<img src="/logo.svg" alt="" className="h-8 w-8" />}
          sections={dashboardSections}
          user={{
            name: "John Doe",
            email: "john@acme.com",
            avatar: "/avatars/john.jpg",
            role: "Administrator",
          }}
          onSignOut={() => signOut()}
        />
      </div>

      {/* Mobile Sidebar */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <MobileSidebar
          trigger={
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          }
          logo={
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="" className="h-8 w-8" />
              <span className="font-bold">Acme Inc</span>
            </div>
          }
          sections={dashboardSections}
          user={{
            name: "John Doe",
            email: "john@acme.com",
            avatar: "/avatars/john.jpg",
          }}
          onSignOut={() => signOut()}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {children}
      </main>
    </div>
  );
}
```

### Admin Panel Sidebar

```tsx
import { Sidebar } from "@/components/organisms/sidebar";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  CreditCard,
  Truck,
  MessageSquare,
  BarChart2,
  Settings,
  HelpCircle,
} from "lucide-react";

const adminSections = [
  {
    id: "dashboard",
    items: [
      { id: "overview", label: "Overview", href: "/admin", icon: LayoutDashboard },
    ],
  },
  {
    id: "catalog",
    label: "Catalog",
    items: [
      {
        id: "products",
        label: "Products",
        href: "/admin/products",
        icon: Package,
        badge: "New",
        children: [
          { id: "all-products", label: "All Products", href: "/admin/products" },
          { id: "categories", label: "Categories", href: "/admin/products/categories" },
          { id: "inventory", label: "Inventory", href: "/admin/products/inventory" },
        ],
      },
      { id: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingCart, badge: 12, badgeVariant: "destructive" },
    ],
  },
  {
    id: "customers",
    label: "Customers",
    items: [
      { id: "all-customers", label: "All Customers", href: "/admin/customers", icon: Users },
      { id: "reviews", label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    items: [
      { id: "transactions", label: "Transactions", href: "/admin/transactions", icon: CreditCard },
      { id: "shipping", label: "Shipping", href: "/admin/shipping", icon: Truck },
      { id: "reports", label: "Reports", href: "/admin/reports", icon: BarChart2 },
    ],
  },
  {
    id: "system",
    items: [
      { id: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
      { id: "help", label: "Help Center", href: "/admin/help", icon: HelpCircle, external: true },
    ],
  },
];

export function AdminSidebar() {
  return (
    <Sidebar
      logo={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            A
          </div>
          <span className="text-lg font-bold">Admin</span>
        </div>
      }
      logoCollapsed={
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          A
        </div>
      }
      sections={adminSections}
      user={{
        name: "Admin User",
        email: "admin@store.com",
        role: "Super Admin",
      }}
      userMenuActions={
        <>
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <HelpCircle className="mr-2 h-4 w-4" />
            Support
          </DropdownMenuItem>
        </>
      }
    />
  );
}
```

### Project Workspace Sidebar

```tsx
import { Sidebar } from "@/components/organisms/sidebar";
import {
  Home,
  Inbox,
  Calendar,
  Search,
  FileText,
  FolderKanban,
  Clock,
  Star,
  Trash2,
  Plus,
} from "lucide-react";

export function WorkspaceSidebar({ workspace }: { workspace: Workspace }) {
  const sections = [
    {
      id: "main",
      items: [
        { id: "home", label: "Home", href: `/w/${workspace.id}`, icon: Home },
        { id: "inbox", label: "Inbox", href: `/w/${workspace.id}/inbox`, icon: Inbox, badge: 3 },
        { id: "calendar", label: "Calendar", href: `/w/${workspace.id}/calendar`, icon: Calendar },
        { id: "search", label: "Search", href: `/w/${workspace.id}/search`, icon: Search },
      ],
    },
    {
      id: "favorites",
      label: "Favorites",
      items: workspace.favorites.map((item) => ({
        id: item.id,
        label: item.name,
        href: `/w/${workspace.id}/${item.type}/${item.id}`,
        icon: Star,
      })),
    },
    {
      id: "projects",
      label: "Projects",
      items: workspace.projects.map((project) => ({
        id: project.id,
        label: project.name,
        href: `/w/${workspace.id}/projects/${project.id}`,
        icon: FolderKanban,
        children: project.pages.map((page) => ({
          id: page.id,
          label: page.title,
          href: `/w/${workspace.id}/projects/${project.id}/${page.id}`,
        })),
      })),
    },
    {
      id: "recent",
      label: "Recent",
      items: [
        { id: "recent", label: "Recently Viewed", href: `/w/${workspace.id}/recent`, icon: Clock },
        { id: "trash", label: "Trash", href: `/w/${workspace.id}/trash`, icon: Trash2 },
      ],
    },
  ];

  return (
    <Sidebar
      logo={
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 items-center justify-center rounded text-xs font-bold"
            style={{ backgroundColor: workspace.color }}
          >
            {workspace.name[0]}
          </div>
          <span className="font-semibold">{workspace.name}</span>
        </div>
      }
      sections={sections}
      footer={
        <Button variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          New Page
        </Button>
      }
    />
  );
}
```

## Anti-patterns

### Too Many Top-Level Items

```tsx
// Bad - overwhelming flat navigation
<Sidebar
  sections={[
    {
      id: "all",
      items: [
        { id: "1", label: "Dashboard", href: "/dashboard", icon: Home },
        { id: "2", label: "Users", href: "/users", icon: Users },
        { id: "3", label: "Products", href: "/products", icon: Package },
        { id: "4", label: "Orders", href: "/orders", icon: ShoppingCart },
        { id: "5", label: "Inventory", href: "/inventory", icon: Box },
        { id: "6", label: "Reports", href: "/reports", icon: BarChart },
        { id: "7", label: "Analytics", href: "/analytics", icon: TrendingUp },
        { id: "8", label: "Settings", href: "/settings", icon: Settings },
        // ... more items
      ],
    },
  ]}
/>

// Good - organized into sections with nesting
<Sidebar
  sections={[
    {
      id: "overview",
      items: [
        { id: "dashboard", label: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      id: "commerce",
      label: "Commerce",
      items: [
        { id: "products", label: "Products", href: "/products", icon: Package },
        { id: "orders", label: "Orders", href: "/orders", icon: ShoppingCart },
        { id: "inventory", label: "Inventory", href: "/inventory", icon: Box },
      ],
    },
    {
      id: "insights",
      label: "Insights",
      items: [
        {
          id: "analytics",
          label: "Analytics",
          href: "/analytics",
          icon: BarChart,
          children: [
            { id: "reports", label: "Reports", href: "/reports" },
            { id: "trends", label: "Trends", href: "/trends" },
          ],
        },
      ],
    },
  ]}
/>
```

### Inconsistent Icons

```tsx
// Bad - some items with icons, some without
<Sidebar
  sections={[
    {
      id: "main",
      items: [
        { id: "1", label: "Dashboard", href: "/dashboard", icon: Home },
        { id: "2", label: "Users", href: "/users" }, // Missing icon
        { id: "3", label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ]}
/>

// Good - consistent icon usage
<Sidebar
  sections={[
    {
      id: "main",
      items: [
        { id: "1", label: "Dashboard", href: "/dashboard", icon: Home },
        { id: "2", label: "Users", href: "/users", icon: Users },
        { id: "3", label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ]}
/>
```

### Missing Collapsed Logo

```tsx
// Bad - long logo text gets cut off when collapsed
<Sidebar
  logo={
    <span className="text-xl font-bold">My Application Name</span>
  }
  // No logoCollapsed provided
/>

// Good - provide compact logo for collapsed state
<Sidebar
  logo={
    <div className="flex items-center gap-2">
      <Logo className="h-8 w-8" />
      <span className="font-bold">My App</span>
    </div>
  }
  logoCollapsed={<Logo className="h-8 w-8" />}
/>
```

### No Mobile Support

```tsx
// Bad - sidebar hidden on mobile with no alternative
<div className="hidden lg:block">
  <Sidebar {...props} />
</div>
<main>{children}</main>

// Good - include mobile sidebar
<>
  <div className="hidden lg:block">
    <Sidebar {...props} />
  </div>
  <div className="lg:hidden">
    <MobileSidebar {...props} />
  </div>
  <main>{children}</main>
</>
```

### Deep Nesting

```tsx
// Bad - too many nested levels
items: [
  {
    id: "level1",
    label: "Level 1",
    children: [
      {
        id: "level2",
        label: "Level 2",
        children: [
          {
            id: "level3",
            label: "Level 3",
            children: [/* ... */], // Too deep!
          },
        ],
      },
    ],
  },
]

// Good - limit to 2 levels max
items: [
  {
    id: "parent",
    label: "Parent",
    children: [
      { id: "child1", label: "Child 1", href: "/child1" },
      { id: "child2", label: "Child 2", href: "/child2" },
    ],
  },
]
```

## Related Skills

### Composes From
- [molecules/nav-link](../molecules/nav-link.md) - Navigation items
- [molecules/avatar-group](../molecules/avatar-group.md) - User section
- [atoms/button](../atoms/button.md) - Collapse toggle
- [atoms/tooltip](../atoms/tooltip.md) - Collapsed mode labels

### Composes Into
- [templates/dashboard-layout](../templates/dashboard-layout.md) - Dashboard pages
- [templates/admin-layout](../templates/admin-layout.md) - Admin panels

### Alternatives
- [organisms/header](./header.md) - For horizontal navigation
- Tab-based navigation for simpler applications
- Bottom navigation for mobile-first apps

---

## Changelog

### 2.0.0 (2025-01-18)
- Added complete TypeScript implementation
- Added formula field to frontmatter
- Added composition diagram
- Added keyboard navigation (Ctrl+B toggle, arrow keys)
- Added localStorage persistence
- Added tooltip support in collapsed mode
- Added nested navigation with collapsible sections
- Added user profile dropdown menu
- Added MobileSidebar component with Sheet
- Added useSidebar hook for external state access
- Added comprehensive examples and anti-patterns
- Standardized to atomic design system v2

### 1.0.0 (2025-01-16)
- Initial implementation with collapsible support
- Mobile sheet navigation
- User menu integration
