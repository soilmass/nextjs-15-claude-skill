---
id: o-keyboard-shortcuts
name: Keyboard Shortcuts
version: 2.0.0
layer: L3
category: utility
composes: []
description: Keyboard shortcuts overlay with categorized commands and search
tags: [keyboard, shortcuts, hotkeys, accessibility, help]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "KeyboardShortcuts = Dialog(m-dialog) + Input(a-input) + Kbd(a-kbd) + Icon(a-icon)"
dependencies:
  - react
  - "@radix-ui/react-dialog"
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Keyboard Shortcuts

## Overview

A keyboard shortcuts help overlay organism showing all available keyboard shortcuts organized by category. Triggered by pressing `?` or `Cmd/Ctrl+/`, with search functionality.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ KeyboardShortcuts                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Dialog (m-dialog)                                         │  │
│  │ ┌───────────────────────────────────────────────────────┐ │  │
│  │ │ Header                                                 │ │  │
│  │ │  ┌────────┐                                      [X]   │ │  │
│  │ │  │ Icon   │  Keyboard Shortcuts                        │ │  │
│  │ │  │(keybd) │                                            │ │  │
│  │ │  └────────┘                                            │ │  │
│  │ └───────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │ ┌───────────────────────────────────────────────────────┐ │  │
│  │ │ Search                                                 │ │  │
│  │ │  ┌─────────────────────────────────────────────────┐  │ │  │
│  │ │  │ Input (a-input)                                 │  │ │  │
│  │ │  │ 🔍 Search shortcuts...                          │  │ │  │
│  │ │  └─────────────────────────────────────────────────┘  │ │  │
│  │ └───────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │ ┌───────────────────────────────────────────────────────┐ │  │
│  │ │ Category: General                                     │ │  │
│  │ │  ┌─────────────────────────────────────────────────┐  │ │  │
│  │ │  │ Open command palette     ┌─────┐ + ┌─────┐      │  │ │  │
│  │ │  │                          │ Kbd │   │ Kbd │      │  │ │  │
│  │ │  │                          │ ⌘   │   │ K   │      │  │ │  │
│  │ │  │                          └─────┘   └─────┘      │  │ │  │
│  │ │  ├─────────────────────────────────────────────────┤  │ │  │
│  │ │  │ Save                     ┌─────┐ + ┌─────┐      │  │ │  │
│  │ │  │                          │ Kbd │   │ Kbd │      │  │ │  │
│  │ │  │                          │ ⌘   │   │ S   │      │  │ │  │
│  │ │  │                          └─────┘   └─────┘      │  │ │  │
│  │ │  └─────────────────────────────────────────────────┘  │ │  │
│  │ └───────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │ ┌───────────────────────────────────────────────────────┐ │  │
│  │ │ Footer                                                 │ │  │
│  │ │  Press [?] or [⌘] + [/] to open this dialog           │ │  │
│  │ └───────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/keyboard-shortcuts.tsx
'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, X, Command, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Shortcut {
  keys: string[];
  description: string;
  action?: () => void;
}

interface ShortcutCategory {
  name: string;
  shortcuts: Shortcut[];
}

interface KeyboardShortcutsProps {
  categories: ShortcutCategory[];
  trigger?: React.ReactNode;
  triggerKey?: string;
  enableGlobalShortcuts?: boolean;
  onShortcutExecute?: (shortcut: Shortcut) => void;
}

// Key display mapping
const keyDisplayMap: Record<string, string> = {
  meta: '⌘',
  cmd: '⌘',
  command: '⌘',
  ctrl: 'Ctrl',
  control: 'Ctrl',
  alt: 'Alt',
  option: '⌥',
  shift: '⇧',
  enter: '↵',
  return: '↵',
  escape: 'Esc',
  esc: 'Esc',
  backspace: '⌫',
  delete: '⌦',
  tab: '⇥',
  space: '␣',
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
  plus: '+',
  minus: '-',
};

// Format key for display
function formatKey(key: string): string {
  const lower = key.toLowerCase();
  return keyDisplayMap[lower] || key.toUpperCase();
}

// Check if we're on Mac
function isMac(): boolean {
  if (typeof window === 'undefined') return false;
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

// Parse shortcut string to check against event
function parseShortcut(keys: string[]): {
  modifiers: { meta: boolean; ctrl: boolean; alt: boolean; shift: boolean };
  key: string;
} {
  const modifiers = {
    meta: false,
    ctrl: false,
    alt: false,
    shift: false,
  };
  let mainKey = '';

  keys.forEach((k) => {
    const lower = k.toLowerCase();
    if (['meta', 'cmd', 'command'].includes(lower)) {
      modifiers.meta = true;
    } else if (['ctrl', 'control'].includes(lower)) {
      modifiers.ctrl = true;
    } else if (['alt', 'option'].includes(lower)) {
      modifiers.alt = true;
    } else if (lower === 'shift') {
      modifiers.shift = true;
    } else {
      mainKey = lower;
    }
  });

  return { modifiers, key: mainKey };
}

// Check if event matches shortcut
function matchesShortcut(
  event: KeyboardEvent,
  keys: string[]
): boolean {
  const { modifiers, key } = parseShortcut(keys);
  const mac = isMac();

  const metaMatch = mac
    ? modifiers.meta === event.metaKey
    : modifiers.meta === event.ctrlKey;
  const ctrlMatch = mac
    ? modifiers.ctrl === event.ctrlKey
    : modifiers.ctrl === event.ctrlKey && !modifiers.meta;
  const altMatch = modifiers.alt === event.altKey;
  const shiftMatch = modifiers.shift === event.shiftKey;
  const keyMatch = event.key.toLowerCase() === key;

  return metaMatch && ctrlMatch && altMatch && shiftMatch && keyMatch;
}

// Keyboard Key Badge
function KeyBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-[24px] items-center justify-center rounded border px-1.5',
        'bg-muted text-xs font-medium text-muted-foreground',
        'shadow-sm'
      )}
    >
      {children}
    </kbd>
  );
}

// Shortcut Keys Display
function ShortcutKeys({ keys }: { keys: string[] }) {
  const mac = isMac();

  // Replace meta/ctrl based on platform
  const displayKeys = keys.map((key) => {
    const lower = key.toLowerCase();
    if (['meta', 'cmd', 'command'].includes(lower)) {
      return mac ? '⌘' : 'Ctrl';
    }
    return formatKey(key);
  });

  return (
    <div className="flex items-center gap-1">
      {displayKeys.map((key, index) => (
        <React.Fragment key={index}>
          <KeyBadge>{key}</KeyBadge>
          {index < displayKeys.length - 1 && (
            <span className="text-muted-foreground text-xs">+</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Shortcut Item
function ShortcutItem({ shortcut }: { shortcut: Shortcut }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm">{shortcut.description}</span>
      <ShortcutKeys keys={shortcut.keys} />
    </div>
  );
}

// Category Section
function CategorySection({ category }: { category: ShortcutCategory }) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-muted-foreground">
        {category.name}
      </h3>
      <div className="divide-y">
        {category.shortcuts.map((shortcut, index) => (
          <ShortcutItem key={index} shortcut={shortcut} />
        ))}
      </div>
    </div>
  );
}

// Main Keyboard Shortcuts Component
export function KeyboardShortcuts({
  categories,
  trigger,
  triggerKey = '?',
  enableGlobalShortcuts = true,
  onShortcutExecute,
}: KeyboardShortcutsProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Filter categories by search
  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return categories;

    const query = search.toLowerCase();
    return categories
      .map((category) => ({
        ...category,
        shortcuts: category.shortcuts.filter(
          (shortcut) =>
            shortcut.description.toLowerCase().includes(query) ||
            shortcut.keys.some((key) => key.toLowerCase().includes(query))
        ),
      }))
      .filter((category) => category.shortcuts.length > 0);
  }, [categories, search]);

  // Global keyboard listener
  React.useEffect(() => {
    if (!enableGlobalShortcuts) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Open shortcuts dialog with ? or Cmd/Ctrl+/
      if (
        (event.key === triggerKey && !event.metaKey && !event.ctrlKey) ||
        (event.key === '/' && (event.metaKey || event.ctrlKey))
      ) {
        // Don't trigger in input fields
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }

        event.preventDefault();
        setOpen(true);
        return;
      }

      // Check other shortcuts
      categories.forEach((category) => {
        category.shortcuts.forEach((shortcut) => {
          if (matchesShortcut(event, shortcut.keys)) {
            event.preventDefault();
            shortcut.action?.();
            onShortcutExecute?.(shortcut);
          }
        });
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categories, enableGlobalShortcuts, triggerKey, onShortcutExecute]);

  // Reset search when closing
  React.useEffect(() => {
    if (!open) {
      setTimeout(() => setSearch(''), 200);
    }
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg max-h-[85vh] -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border bg-background shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" />
              <Dialog.Title className="font-semibold">
                Keyboard Shortcuts
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-sm p-1 hover:bg-accent"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Search */}
          <div className="border-b p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search shortcuts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(
                  'w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm',
                  'placeholder:text-muted-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-ring'
                )}
              />
            </div>
          </div>

          {/* Shortcuts List */}
          <div className="overflow-y-auto p-4 max-h-[60vh]">
            {filteredCategories.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  No shortcuts found for "{search}"
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredCategories.map((category) => (
                  <CategorySection key={category.name} category={category} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t p-4">
            <p className="text-xs text-muted-foreground text-center">
              Press <KeyBadge>{triggerKey}</KeyBadge> or{' '}
              <KeyBadge>{isMac() ? '⌘' : 'Ctrl'}</KeyBadge>
              <span className="mx-1">+</span>
              <KeyBadge>/</KeyBadge> to open this dialog
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Hook for registering shortcuts
export function useKeyboardShortcut(
  keys: string[],
  callback: () => void,
  options?: {
    enabled?: boolean;
    preventDefault?: boolean;
  }
) {
  const { enabled = true, preventDefault = true } = options || {};

  React.useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger in input fields
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (matchesShortcut(event, keys)) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keys, callback, enabled, preventDefault]);
}

// Pre-built shortcuts for common actions
export const commonShortcuts: ShortcutCategory[] = [
  {
    name: 'General',
    shortcuts: [
      { keys: ['Meta', 'K'], description: 'Open command palette' },
      { keys: ['Meta', '/'], description: 'Show keyboard shortcuts' },
      { keys: ['Meta', 'S'], description: 'Save' },
      { keys: ['Escape'], description: 'Close dialog / Cancel' },
    ],
  },
  {
    name: 'Navigation',
    shortcuts: [
      { keys: ['G', 'H'], description: 'Go to home' },
      { keys: ['G', 'S'], description: 'Go to settings' },
      { keys: ['G', 'P'], description: 'Go to profile' },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { keys: ['Meta', 'N'], description: 'Create new' },
      { keys: ['Meta', 'D'], description: 'Duplicate' },
      { keys: ['Meta', 'Backspace'], description: 'Delete' },
    ],
  },
];
```

## Usage

### Basic Usage

```tsx
import { KeyboardShortcuts, commonShortcuts } from '@/components/organisms/keyboard-shortcuts';

export function App() {
  return (
    <KeyboardShortcuts
      categories={[
        {
          name: 'Navigation',
          shortcuts: [
            { keys: ['G', 'H'], description: 'Go to home', action: () => router.push('/') },
            { keys: ['G', 'S'], description: 'Go to settings', action: () => router.push('/settings') },
          ],
        },
        {
          name: 'Actions',
          shortcuts: [
            { keys: ['Meta', 'N'], description: 'New document', action: () => createDocument() },
            { keys: ['Meta', 'S'], description: 'Save', action: () => saveDocument() },
          ],
        },
      ]}
    />
  );
}
```

### With Trigger Button

```tsx
<KeyboardShortcuts
  categories={shortcuts}
  trigger={
    <button className="p-2 rounded hover:bg-accent">
      <Keyboard className="h-4 w-4" />
    </button>
  }
/>
```

### Using the Hook

```tsx
import { useKeyboardShortcut } from '@/components/organisms/keyboard-shortcuts';

export function Editor() {
  useKeyboardShortcut(['Meta', 'S'], () => {
    saveDocument();
  });

  useKeyboardShortcut(['Meta', 'Shift', 'P'], () => {
    publishDocument();
  });

  return <div>...</div>;
}
```

### Custom Shortcuts

```tsx
const myShortcuts: ShortcutCategory[] = [
  {
    name: 'Editor',
    shortcuts: [
      { keys: ['Meta', 'B'], description: 'Bold' },
      { keys: ['Meta', 'I'], description: 'Italic' },
      { keys: ['Meta', 'K'], description: 'Insert link' },
    ],
  },
];

<KeyboardShortcuts categories={myShortcuts} />
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Dialog not visible | Overlay and content hidden |
| Open | Dialog visible and ready | Centered modal with overlay, shortcuts list visible |
| Searching | User typing in search input | Filtered shortcuts list based on query |
| No Results | Search query has no matches | Empty state message shown |
| Focus | Keyboard focus on element | Ring outline on focused input or close button |
| Hover | Mouse over shortcut item | No explicit hover state (list items are informational) |
| Platform Adapted | Mac vs Windows key display | Meta key shows as Cmd on Mac, Ctrl on Windows |

## Anti-patterns

### Not preventing shortcuts in input fields

```tsx
// Bad: Shortcuts trigger while user is typing
const handleKeyDown = (event: KeyboardEvent) => {
  if (matchesShortcut(event, shortcut.keys)) {
    event.preventDefault();
    shortcut.action?.();
  }
};

// Good: Skip shortcuts when user is in input context
const handleKeyDown = (event: KeyboardEvent) => {
  const target = event.target as HTMLElement;
  if (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.isContentEditable
  ) {
    return;
  }

  if (matchesShortcut(event, shortcut.keys)) {
    event.preventDefault();
    shortcut.action?.();
  }
};
```

### Hardcoded modifier key display

```tsx
// Bad: Always showing Mac-style keys regardless of platform
function ShortcutKeys({ keys }) {
  return (
    <div>
      {keys.map((key) => (
        <KeyBadge>{key === 'Meta' ? '⌘' : key}</KeyBadge>
      ))}
    </div>
  );
}

// Good: Platform-aware key display
function isMac(): boolean {
  if (typeof window === 'undefined') return false;
  return navigator.platform.toUpperCase().indexOf('MAC') >= 0;
}

function ShortcutKeys({ keys }) {
  const mac = isMac();
  const displayKeys = keys.map((key) => {
    if (['meta', 'cmd', 'command'].includes(key.toLowerCase())) {
      return mac ? '⌘' : 'Ctrl';
    }
    return formatKey(key);
  });

  return (
    <div>
      {displayKeys.map((key) => <KeyBadge>{key}</KeyBadge>)}
    </div>
  );
}
```

### Not cleaning up event listeners

```tsx
// Bad: Memory leak from unremoved event listener
React.useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  // Missing cleanup!
}, []);

// Good: Proper cleanup on unmount
React.useEffect(() => {
  if (!enableGlobalShortcuts) return;

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [categories, enableGlobalShortcuts, triggerKey, onShortcutExecute]);
```

### Not resetting search on dialog close

```tsx
// Bad: Search persists after closing, confusing on reopen
function KeyboardShortcuts({ categories }) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');

  // Search remains when dialog reopens
  return <Dialog.Root open={open} onOpenChange={setOpen}>...</Dialog.Root>;
}

// Good: Reset search state when dialog closes
React.useEffect(() => {
  if (!open) {
    setTimeout(() => setSearch(''), 200); // Delay for close animation
  }
}, [open]);
```

## Related Skills

- `organisms/command-palette` - Command palette
- `organisms/search-modal` - Search modal
- `patterns/keyboard-navigation` - Keyboard nav

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Platform-aware key display (Mac vs Windows)
- Search functionality
- useKeyboardShortcut hook
- Common shortcuts preset
