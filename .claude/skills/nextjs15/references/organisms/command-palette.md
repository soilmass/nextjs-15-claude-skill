---
id: o-command-palette
name: Command Palette
version: 2.1.0
layer: L3
category: navigation
description: Keyboard-driven command palette with search, actions, and quick navigation
tags: [command, palette, search, keyboard, spotlight, cmdk]
formula: Dialog + SearchInput + CommandGroup[] + CommandItem[] + KeyboardShortcuts
composes:
  - ../molecules/search-input.md
  - ../molecules/nav-link.md
dependencies: [cmdk, lucide-react, "@radix-ui/react-dialog"]
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Command Palette

## Overview

The Command Palette organism provides a keyboard-driven interface for quick navigation, search, and actions. Inspired by VS Code, Figma, Raycast, and Linear command palettes. Features fuzzy search, grouped commands with icons, keyboard shortcuts display, recent items section, nested command pages, and async search with loading states.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│  CommandPalette (Dialog Container)                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  CommandInput (Search)                           [⌘K] [×]     │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  🔍  Type a command or search...              ⏳         │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  CommandList (Scrollable)                                     │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  CommandGroup: Recent                                    │  │  │
│  │  │  ├─ CommandItem [🕐 Dashboard]               [↵]        │  │  │
│  │  │  └─ CommandItem [🕐 Settings]                [↵]        │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  CommandGroup: Navigation                                │  │  │
│  │  │  ├─ CommandItem [📄 Home]                    [⌘H]       │  │  │
│  │  │  ├─ CommandItem [📊 Analytics]               [⌘A]       │  │  │
│  │  │  └─ CommandItem [⚙️ Settings]                [⌘,]       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  CommandGroup: Actions                                   │  │  │
│  │  │  ├─ CommandItem [➕ New Project]             [⌘N]       │  │  │
│  │  │  ├─ CommandItem [🔍 Search Files]            [⌘P]       │  │  │
│  │  │  └─ CommandItem [🌙 Toggle Theme]            [⌘T]       │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  CommandEmpty                                            │  │  │
│  │  │  │  No results found for "xyz"                          │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  CommandFooter (Keyboard Hints)                               │  │
│  │  [↑↓ Navigate]  [↵ Select]  [⎋ Close]  [⌫ Back]             │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## When to Use

Use this skill when:
- Building power-user features (Cmd+K / Ctrl+K)
- Creating quick navigation interfaces
- Implementing global search with actions
- Adding keyboard-driven workflows
- Building Spotlight/Raycast-style launchers
- Creating nested command menus

## Composes

- [search-input](../molecules/search-input.md) - Search interface
- [nav-link](../molecules/nav-link.md) - Command items
- [button](../atoms/button.md) - Action triggers
- [kbd](../atoms/kbd.md) - Keyboard shortcut display

## Implementation

```typescript
// components/organisms/command-palette.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command as CommandPrimitive } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  X,
  Home,
  Settings,
  User,
  FileText,
  FolderOpen,
  Plus,
  Moon,
  Sun,
  Laptop,
  ArrowRight,
  Clock,
  Loader2,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// =============================================================================
// TYPES
// =============================================================================

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  shortcut?: string[];
  keywords?: string[];
  onSelect?: () => void;
  href?: string;
  disabled?: boolean;
  /** Nested commands - creates a sub-page */
  children?: CommandItem[];
}

export interface CommandGroup {
  id: string;
  label: string;
  items: CommandItem[];
  priority?: number;
}

export interface CommandPaletteProps {
  /** Controlled open state */
  open?: boolean;
  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
  /** Command groups to display */
  groups?: CommandGroup[];
  /** Async search handler for dynamic results */
  onSearch?: (query: string) => Promise<CommandItem[]>;
  /** Search debounce delay in ms */
  searchDebounce?: number;
  /** Placeholder text for search input */
  placeholder?: string;
  /** Enable recent items tracking */
  enableRecent?: boolean;
  /** Maximum recent items to store */
  maxRecentItems?: number;
  /** Storage key for recent items */
  recentStorageKey?: string;
  /** Additional class names */
  className?: string;
  /** Footer content override */
  footer?: React.ReactNode;
}

// =============================================================================
// HOOKS
// =============================================================================

/**
 * Hook for managing recent items in localStorage
 */
function useRecentItems(
  storageKey: string,
  maxItems: number
): [CommandItem[], (item: CommandItem) => void, () => void] {
  const [recentItems, setRecentItems] = React.useState<CommandItem[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setRecentItems(JSON.parse(stored));
      }
    } catch (e) {
      console.warn("Failed to load recent items:", e);
    }
  }, [storageKey]);

  // Add item to recent
  const addRecent = React.useCallback(
    (item: CommandItem) => {
      setRecentItems((prev) => {
        const filtered = prev.filter((i) => i.id !== item.id);
        const updated = [item, ...filtered].slice(0, maxItems);
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.warn("Failed to save recent items:", e);
        }
        return updated;
      });
    },
    [storageKey, maxItems]
  );

  // Clear recent items
  const clearRecent = React.useCallback(() => {
    setRecentItems([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.warn("Failed to clear recent items:", e);
    }
  }, [storageKey]);

  return [recentItems, addRecent, clearRecent];
}

/**
 * Hook for debounced search
 */
function useDebouncedSearch(
  query: string,
  onSearch: ((query: string) => Promise<CommandItem[]>) | undefined,
  delay: number
) {
  const [results, setResults] = React.useState<CommandItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!query.trim() || !onSearch) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const searchResults = await onSearch(query);
        setResults(searchResults);
      } catch (e) {
        console.error("Search failed:", e);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [query, onSearch, delay]);

  return { results, isLoading };
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

/**
 * Keyboard shortcut display component
 */
function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1",
        "rounded border bg-muted px-1.5 font-mono text-[10px] font-medium",
        "text-muted-foreground",
        className
      )}
    >
      {children}
    </kbd>
  );
}

/**
 * Single command item component
 */
function CommandItemComponent({
  item,
  onSelect,
  isSelected,
}: {
  item: CommandItem;
  onSelect: () => void;
  isSelected?: boolean;
}) {
  const hasChildren = item.children && item.children.length > 0;

  return (
    <CommandPrimitive.Item
      value={`${item.id}-${item.label}-${item.keywords?.join("-") || ""}`}
      onSelect={onSelect}
      disabled={item.disabled}
      className={cn(
        "relative flex cursor-pointer select-none items-center gap-3",
        "rounded-lg px-3 py-2.5 text-sm outline-none",
        "aria-selected:bg-accent aria-selected:text-accent-foreground",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        "transition-colors hover:bg-accent/50"
      )}
    >
      {/* Icon */}
      {item.icon && (
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
            "bg-muted text-muted-foreground",
            "aria-selected:bg-primary aria-selected:text-primary-foreground"
          )}
        >
          {item.icon}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        <span className="truncate font-medium">{item.label}</span>
        {item.description && (
          <span className="truncate text-xs text-muted-foreground">
            {item.description}
          </span>
        )}
      </div>

      {/* Shortcut or Arrow for children */}
      <div className="flex items-center gap-1.5 shrink-0">
        {item.shortcut && item.shortcut.length > 0 && (
          <div className="flex items-center gap-1">
            {item.shortcut.map((key, index) => (
              <Kbd key={index}>{key}</Kbd>
            ))}
          </div>
        )}
        {hasChildren && (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </CommandPrimitive.Item>
  );
}

/**
 * Command group component
 */
function CommandGroupComponent({
  group,
  onSelect,
}: {
  group: CommandGroup;
  onSelect: (item: CommandItem) => void;
}) {
  if (group.items.length === 0) return null;

  return (
    <CommandPrimitive.Group
      heading={group.label}
      className="overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
    >
      {group.items.map((item) => (
        <CommandItemComponent
          key={item.id}
          item={item}
          onSelect={() => onSelect(item)}
        />
      ))}
    </CommandPrimitive.Group>
  );
}

/**
 * Loading state component
 */
function CommandLoading() {
  return (
    <div className="flex items-center justify-center py-6">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
    </div>
  );
}

/**
 * Empty state component
 */
function CommandEmpty({ query }: { query: string }) {
  return (
    <div className="py-12 text-center">
      <Search className="mx-auto h-12 w-12 text-muted-foreground/50" />
      <p className="mt-4 text-sm text-muted-foreground">
        No results found for "{query}"
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Try searching with different keywords
      </p>
    </div>
  );
}

/**
 * Keyboard hints footer
 */
function CommandFooter() {
  return (
    <div className="flex items-center justify-center gap-4 border-t bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <Kbd><ArrowUp className="h-3 w-3" /></Kbd>
        <Kbd><ArrowDown className="h-3 w-3" /></Kbd>
        <span>Navigate</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Kbd><CornerDownLeft className="h-3 w-3" /></Kbd>
        <span>Select</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Kbd>Esc</Kbd>
        <span>Close</span>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CommandPalette({
  open: controlledOpen,
  onOpenChange,
  groups = [],
  onSearch,
  searchDebounce = 300,
  placeholder = "Type a command or search...",
  enableRecent = true,
  maxRecentItems = 5,
  recentStorageKey = "command-palette-recent",
  className,
  footer,
}: CommandPaletteProps) {
  const router = useRouter();
  const { setTheme } = useTheme();

  // State
  const [internalOpen, setInternalOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [pages, setPages] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Controlled vs uncontrolled
  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  // Recent items
  const [recentItems, addRecent, clearRecent] = useRecentItems(
    recentStorageKey,
    maxRecentItems
  );

  // Async search
  const { results: searchResults, isLoading } = useDebouncedSearch(
    query,
    onSearch,
    searchDebounce
  );

  // Current page for nested commands
  const currentPage = pages[pages.length - 1];

  // Global keyboard shortcut
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setIsOpen]);

  // Reset state on close
  React.useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setQuery("");
        setPages([]);
      }, 150);
    }
  }, [isOpen]);

  // Handle backspace to go back
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Backspace" && !query && pages.length > 0) {
        e.preventDefault();
        setPages((prev) => prev.slice(0, -1));
      }
    },
    [query, pages]
  );

  // Handle item selection
  const handleSelect = React.useCallback(
    (item: CommandItem) => {
      // Track in recent
      if (enableRecent && !item.children) {
        addRecent(item);
      }

      // Navigate to children
      if (item.children && item.children.length > 0) {
        setPages((prev) => [...prev, item.id]);
        setQuery("");
        return;
      }

      // Execute action
      if (item.onSelect) {
        item.onSelect();
        setIsOpen(false);
        return;
      }

      // Navigate to href
      if (item.href) {
        router.push(item.href);
        setIsOpen(false);
        return;
      }
    },
    [enableRecent, addRecent, router, setIsOpen]
  );

  // Find items for current page
  const getCurrentPageItems = React.useCallback((): CommandItem[] => {
    if (!currentPage) return [];

    const findItems = (items: CommandItem[]): CommandItem[] | null => {
      for (const item of items) {
        if (item.id === currentPage && item.children) {
          return item.children;
        }
        if (item.children) {
          const found = findItems(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    for (const group of groups) {
      const found = findItems(group.items);
      if (found) return found;
    }

    return [];
  }, [currentPage, groups]);

  // Build groups with recent and search results
  const displayGroups = React.useMemo((): CommandGroup[] => {
    // If on a nested page, show those items
    if (currentPage) {
      const pageItems = getCurrentPageItems();
      return [
        {
          id: "page-items",
          label: "Commands",
          items: pageItems,
        },
      ];
    }

    // If searching with async handler
    if (query && onSearch) {
      return searchResults.length > 0
        ? [{ id: "search-results", label: "Results", items: searchResults }]
        : [];
    }

    // Default: show recent + groups
    const result: CommandGroup[] = [];

    if (enableRecent && recentItems.length > 0 && !query) {
      result.push({
        id: "recent",
        label: "Recent",
        items: recentItems.map((item) => ({
          ...item,
          icon: item.icon || <Clock className="h-4 w-4" />,
        })),
      });
    }

    // Add provided groups
    const sortedGroups = [...groups].sort(
      (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
    );
    result.push(...sortedGroups);

    return result;
  }, [
    currentPage,
    getCurrentPageItems,
    query,
    onSearch,
    searchResults,
    enableRecent,
    recentItems,
    groups,
  ]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2",
            "overflow-hidden rounded-xl border bg-popover shadow-2xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            "data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2",
            "data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-top-[48%]",
            className
          )}
        >
          <CommandPrimitive
            className="flex h-full flex-col overflow-hidden"
            onKeyDown={handleKeyDown}
            loop
          >
            {/* Search Input */}
            <div className="flex items-center gap-2 border-b px-3">
              {pages.length > 0 ? (
                <button
                  onClick={() => setPages((prev) => prev.slice(0, -1))}
                  className="flex h-6 items-center gap-1 rounded-md bg-muted px-2 text-xs text-muted-foreground hover:bg-muted/80"
                >
                  <ArrowRight className="h-3 w-3 rotate-180" />
                  Back
                </button>
              ) : (
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}

              <CommandPrimitive.Input
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                placeholder={placeholder}
                className={cn(
                  "flex h-12 w-full bg-transparent py-3 text-sm outline-none",
                  "placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                )}
                autoFocus
              />

              {isLoading && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              )}

              <Dialog.Close asChild>
                <button
                  className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>

            {/* Command List */}
            <CommandPrimitive.List className="max-h-[400px] overflow-y-auto overflow-x-hidden p-2">
              {/* Loading State */}
              {isLoading && query && <CommandLoading />}

              {/* Empty State */}
              {!isLoading && query && displayGroups.length === 0 && (
                <CommandEmpty query={query} />
              )}

              {/* Groups */}
              {!isLoading &&
                displayGroups.map((group) => (
                  <CommandGroupComponent
                    key={group.id}
                    group={group}
                    onSelect={handleSelect}
                  />
                ))}

              {/* Clear Recent */}
              {enableRecent && recentItems.length > 0 && !query && !currentPage && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={clearRecent}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear recent items
                  </button>
                </div>
              )}
            </CommandPrimitive.List>

            {/* Footer */}
            {footer ?? <CommandFooter />}
          </CommandPrimitive>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// =============================================================================
// TRIGGER COMPONENT
// =============================================================================

export interface CommandTriggerProps {
  onClick?: () => void;
  className?: string;
  showShortcut?: boolean;
}

export function CommandTrigger({
  onClick,
  className,
  showShortcut = true,
}: CommandTriggerProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background px-3 py-2",
        "text-sm text-muted-foreground transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className
      )}
    >
      <Search className="h-4 w-4" />
      <span className="hidden sm:inline">Search...</span>
      {showShortcut && (
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      )}
    </button>
  );
}

// =============================================================================
// DEFAULT GROUPS FACTORY
// =============================================================================

export function createDefaultGroups(router: ReturnType<typeof useRouter>): CommandGroup[] {
  return [
    {
      id: "navigation",
      label: "Navigation",
      priority: 10,
      items: [
        {
          id: "home",
          label: "Home",
          description: "Go to home page",
          icon: <Home className="h-4 w-4" />,
          shortcut: ["⌘", "H"],
          href: "/",
        },
        {
          id: "settings",
          label: "Settings",
          description: "Manage your preferences",
          icon: <Settings className="h-4 w-4" />,
          shortcut: ["⌘", ","],
          href: "/settings",
        },
        {
          id: "profile",
          label: "Profile",
          description: "View your profile",
          icon: <User className="h-4 w-4" />,
          href: "/profile",
        },
      ],
    },
    {
      id: "actions",
      label: "Actions",
      priority: 5,
      items: [
        {
          id: "new-file",
          label: "New File",
          description: "Create a new file",
          icon: <Plus className="h-4 w-4" />,
          shortcut: ["⌘", "N"],
          onSelect: () => console.log("Create new file"),
        },
        {
          id: "open-file",
          label: "Open File",
          description: "Open an existing file",
          icon: <FolderOpen className="h-4 w-4" />,
          shortcut: ["⌘", "O"],
          onSelect: () => console.log("Open file dialog"),
        },
      ],
    },
  ];
}
```

### Key Implementation Notes

1. **cmdk Library**: Built on top of cmdk for fuzzy search and keyboard navigation
2. **Nested Pages**: Supports drill-down into command groups via `children` property
3. **Async Search**: Debounced search handler for server-side results
4. **Recent Items**: Persisted to localStorage with configurable limit
5. **Keyboard Navigation**: Full support for arrows, enter, escape, and backspace

## Variants

### Basic Command Palette

```tsx
import { CommandPalette } from "@/components/organisms/command-palette";

export function App() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      groups={[
        {
          id: "navigation",
          label: "Navigation",
          items: [
            { id: "home", label: "Home", href: "/" },
            { id: "about", label: "About", href: "/about" },
          ],
        },
      ]}
    />
  );
}
```

### With Async Search

```tsx
<CommandPalette
  open={open}
  onOpenChange={setOpen}
  onSearch={async (query) => {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    return data.results.map((item) => ({
      id: item.id,
      label: item.title,
      description: item.excerpt,
      href: item.url,
    }));
  }}
  searchDebounce={300}
/>
```

### With Nested Commands (Theme Switcher)

```tsx
<CommandPalette
  groups={[
    {
      id: "appearance",
      label: "Appearance",
      items: [
        {
          id: "theme",
          label: "Change Theme",
          icon: <Laptop className="h-4 w-4" />,
          children: [
            {
              id: "theme-light",
              label: "Light",
              icon: <Sun className="h-4 w-4" />,
              onSelect: () => setTheme("light"),
            },
            {
              id: "theme-dark",
              label: "Dark",
              icon: <Moon className="h-4 w-4" />,
              onSelect: () => setTheme("dark"),
            },
            {
              id: "theme-system",
              label: "System",
              icon: <Laptop className="h-4 w-4" />,
              onSelect: () => setTheme("system"),
            },
          ],
        },
      ],
    },
  ]}
/>
```

### With Header Integration

```tsx
import { Header } from "@/components/organisms/header";
import { CommandPalette, CommandTrigger } from "@/components/organisms/command-palette";

export function Layout({ children }) {
  const [commandOpen, setCommandOpen] = React.useState(false);

  return (
    <>
      <Header
        logo={<Logo />}
        navItems={navItems}
        onSearchClick={() => setCommandOpen(true)}
      />
      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        groups={commandGroups}
        onSearch={searchHandler}
      />
      <main>{children}</main>
    </>
  );
}
```

### Disabled Recent Items

```tsx
<CommandPalette
  groups={groups}
  enableRecent={false}
/>
```

## States

| State | Input | List | Loading | Footer |
|-------|-------|------|---------|--------|
| Empty | placeholder | Quick actions + Recent | Hidden | Visible |
| Typing | user input | Filtered results | Visible (if async) | Visible |
| Searching | user input | Previous/skeleton | Spinner | Visible |
| Results | user input | Search results | Hidden | Visible |
| No Results | user input | "No results" message | Hidden | Visible |
| Nested Page | placeholder | Child commands | Hidden | Visible |

## Accessibility

### Required ARIA Attributes

- `role="dialog"` on container
- `aria-modal="true"` on dialog
- `aria-label` on search input
- `aria-selected` on highlighted item
- Combobox listbox pattern from cmdk
- `aria-labelledby` for command groups

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Cmd/Ctrl + K` | Open/close palette |
| `↑/↓` | Navigate items |
| `Enter` | Select item |
| `Escape` | Close/go back to root |
| `Backspace` (empty input) | Go back to parent page |
| `Tab` | Move focus within dialog |

### Screen Reader Announcements

- Dialog opening/closing announced
- Current selection announced
- Group headings read before items
- Empty state announced
- Loading state announced

### Focus Management

- Focus trapped within dialog
- Initial focus on search input
- Focus returns to trigger on close
- Visible focus ring on all interactive elements

## Dependencies

```json
{
  "dependencies": {
    "cmdk": "^1.0.0",
    "lucide-react": "^0.460.0",
    "@radix-ui/react-dialog": "^1.1.0",
    "next-themes": "^0.3.0"
  }
}
```

### Installation

```bash
npm install cmdk lucide-react @radix-ui/react-dialog next-themes
```

## Examples

### Dashboard Command Palette

```tsx
import { CommandPalette, createDefaultGroups } from "@/components/organisms/command-palette";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export function DashboardCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  const groups: CommandGroup[] = [
    ...createDefaultGroups(router),
    {
      id: "dashboard",
      label: "Dashboard",
      priority: 15,
      items: [
        {
          id: "analytics",
          label: "Analytics",
          description: "View analytics dashboard",
          icon: <BarChart className="h-4 w-4" />,
          shortcut: ["⌘", "A"],
          href: "/dashboard/analytics",
        },
        {
          id: "users",
          label: "Users",
          description: "Manage users",
          icon: <Users className="h-4 w-4" />,
          href: "/dashboard/users",
        },
        {
          id: "projects",
          label: "Projects",
          description: "View all projects",
          icon: <Folder className="h-4 w-4" />,
          shortcut: ["⌘", "P"],
          href: "/dashboard/projects",
        },
      ],
    },
    {
      id: "appearance",
      label: "Appearance",
      items: [
        {
          id: "theme",
          label: "Change Theme",
          icon: <Palette className="h-4 w-4" />,
          children: [
            { id: "light", label: "Light", icon: <Sun className="h-4 w-4" />, onSelect: () => setTheme("light") },
            { id: "dark", label: "Dark", icon: <Moon className="h-4 w-4" />, onSelect: () => setTheme("dark") },
            { id: "system", label: "System", icon: <Laptop className="h-4 w-4" />, onSelect: () => setTheme("system") },
          ],
        },
      ],
    },
  ];

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      groups={groups}
      onSearch={async (query) => {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        return res.json();
      }}
    />
  );
}
```

### E-commerce Command Palette

```tsx
export function EcommerceCommandPalette() {
  const [open, setOpen] = React.useState(false);

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      placeholder="Search products, orders, customers..."
      groups={[
        {
          id: "quick-actions",
          label: "Quick Actions",
          priority: 20,
          items: [
            {
              id: "new-order",
              label: "Create Order",
              icon: <ShoppingCart className="h-4 w-4" />,
              shortcut: ["⌘", "O"],
              href: "/orders/new",
            },
            {
              id: "add-product",
              label: "Add Product",
              icon: <Package className="h-4 w-4" />,
              shortcut: ["⌘", "N"],
              href: "/products/new",
            },
          ],
        },
        {
          id: "navigation",
          label: "Navigation",
          items: [
            { id: "products", label: "Products", href: "/products" },
            { id: "orders", label: "Orders", href: "/orders" },
            { id: "customers", label: "Customers", href: "/customers" },
            { id: "inventory", label: "Inventory", href: "/inventory" },
          ],
        },
      ]}
      onSearch={async (query) => {
        const [products, orders, customers] = await Promise.all([
          searchProducts(query),
          searchOrders(query),
          searchCustomers(query),
        ]);
        return [
          ...products.map((p) => ({ ...p, type: "product" })),
          ...orders.map((o) => ({ ...o, type: "order" })),
          ...customers.map((c) => ({ ...c, type: "customer" })),
        ];
      }}
    />
  );
}
```

### Documentation Site Command Palette

```tsx
export function DocsCommandPalette() {
  const [open, setOpen] = React.useState(false);

  return (
    <CommandPalette
      open={open}
      onOpenChange={setOpen}
      placeholder="Search documentation..."
      enableRecent={true}
      maxRecentItems={10}
      groups={[
        {
          id: "docs-sections",
          label: "Documentation",
          items: [
            {
              id: "getting-started",
              label: "Getting Started",
              icon: <BookOpen className="h-4 w-4" />,
              children: [
                { id: "installation", label: "Installation", href: "/docs/installation" },
                { id: "quickstart", label: "Quick Start", href: "/docs/quickstart" },
                { id: "configuration", label: "Configuration", href: "/docs/configuration" },
              ],
            },
            {
              id: "components",
              label: "Components",
              icon: <Blocks className="h-4 w-4" />,
              href: "/docs/components",
            },
            {
              id: "api-reference",
              label: "API Reference",
              icon: <Code className="h-4 w-4" />,
              href: "/docs/api",
            },
          ],
        },
      ]}
      onSearch={async (query) => {
        const results = await searchDocs(query);
        return results.map((doc) => ({
          id: doc.slug,
          label: doc.title,
          description: doc.excerpt,
          href: `/docs/${doc.slug}`,
          keywords: doc.tags,
        }));
      }}
    />
  );
}
```

## Anti-patterns

### Too Many Top-Level Groups

```tsx
// Bad - overwhelming number of groups
<CommandPalette
  groups={[
    { id: "nav", label: "Navigation", items: [...] },
    { id: "actions", label: "Actions", items: [...] },
    { id: "settings", label: "Settings", items: [...] },
    { id: "help", label: "Help", items: [...] },
    { id: "account", label: "Account", items: [...] },
    { id: "tools", label: "Tools", items: [...] },
    { id: "admin", label: "Admin", items: [...] },
  ]}
/>

// Good - consolidate into logical groups with children
<CommandPalette
  groups={[
    {
      id: "quick-actions",
      label: "Quick Actions",
      items: [/* most common actions */],
    },
    {
      id: "navigation",
      label: "Go to",
      items: [
        { id: "settings", label: "Settings", children: [/* nested items */] },
        { id: "tools", label: "Tools", children: [/* nested items */] },
      ],
    },
  ]}
/>
```

### Missing Loading States

```tsx
// Bad - no indication of async search
<CommandPalette
  onSearch={async (query) => {
    // Long-running search with no feedback
    return await searchAPI(query);
  }}
/>

// Good - built-in loading state (automatic)
<CommandPalette
  onSearch={async (query) => {
    return await searchAPI(query);
  }}
  searchDebounce={300} // Debounce to reduce flicker
/>
```

### No Keyboard Shortcut Display

```tsx
// Bad - users don't know shortcuts exist
<CommandPalette
  groups={[{
    id: "actions",
    label: "Actions",
    items: [
      { id: "save", label: "Save", onSelect: handleSave },
    ],
  }]}
/>

// Good - show discoverable shortcuts
<CommandPalette
  groups={[{
    id: "actions",
    label: "Actions",
    items: [
      {
        id: "save",
        label: "Save",
        shortcut: ["⌘", "S"],
        onSelect: handleSave,
      },
    ],
  }]}
/>
```

### Ignoring Accessibility

```tsx
// Bad - no screen reader support
<div className="command-palette">
  <input type="text" />
  <div className="results">...</div>
</div>

// Good - use cmdk with proper ARIA
<CommandPrimitive role="combobox" aria-expanded={open}>
  <CommandPrimitive.Input aria-label="Search commands" />
  <CommandPrimitive.List role="listbox">
    <CommandPrimitive.Item role="option" aria-selected={selected}>
      ...
    </CommandPrimitive.Item>
  </CommandPrimitive.List>
</CommandPrimitive>
```

## Related Skills

### Composes From
- [molecules/search-input](../molecules/search-input.md) - Search interface
- [atoms/button](../atoms/button.md) - Action triggers
- [atoms/kbd](../atoms/kbd.md) - Keyboard shortcut display

### Composes Into
- [organisms/header](./header.md) - Site header search trigger
- [templates/dashboard-layout](../templates/dashboard-layout.md) - App navigation
- [templates/docs-layout](../templates/docs-layout.md) - Documentation search

### Alternatives
- [organisms/search-modal](./search-modal.md) - Simpler search-only modal
- [organisms/mega-menu](./mega-menu.md) - Visual navigation menu

---

## Changelog

### 2.1.0 (2025-01-18)
- Added formula field to frontmatter
- Added Composition Diagram section
- Complete TypeScript implementation with cmdk
- Nested command pages support
- Async search with loading states
- Recent items with localStorage persistence
- Keyboard shortcuts display
- Full accessibility compliance
- Comprehensive examples and anti-patterns

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with cmdk
- Nested pages support
- Async search integration
