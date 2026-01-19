---
id: pt-command-palette
name: Command Palette
version: 1.0.0
layer: L5
category: navigation
description: Cmd+K command palette with search, actions, and keyboard navigation
tags: [command-palette, search, keyboard, navigation, cmdk, next15]
composes: []
dependencies: []
formula: "CommandPalette = KeyboardShortcut + SearchInput + ActionList + KeyboardNavigation"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Command Palette

## When to Use

- Global application search
- Quick action execution
- Keyboard-first navigation
- Power user shortcuts
- Multi-purpose launcher

## Composition Diagram

```
Command Palette
===============

+------------------------------------------+
|  [Cmd+K to open]                         |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  +------------------------------------+  |
|  | Search commands...           Esc  |  |
|  +------------------------------------+  |
|                                          |
|  Pages                                   |
|  +------------------------------------+  |
|  | Home                         Enter |  |
|  +------------------------------------+  |
|  | Dashboard                         |  |
|  | Settings                          |  |
|                                          |
|  Actions                                 |
|  +------------------------------------+  |
|  | Create new post            Cmd+N  |  |
|  +------------------------------------+  |
|  | Toggle dark mode           Cmd+D  |  |
+------------------------------------------+
```

## Installation

```bash
npm install cmdk
```

## Command Palette Component

```typescript
// components/command-palette.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Command } from 'cmdk';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import {
  Home,
  Settings,
  Search,
  FileText,
  Plus,
  Moon,
  Sun,
  LogOut,
  User,
} from 'lucide-react';
import { useTheme } from 'next-themes';

interface CommandItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string[];
  action: () => void;
  group: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  // Toggle palette with Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const commands: CommandItem[] = [
    // Navigation
    { id: 'home', name: 'Go to Home', icon: Home, action: () => router.push('/'), group: 'Navigation' },
    { id: 'dashboard', name: 'Go to Dashboard', icon: Home, action: () => router.push('/dashboard'), group: 'Navigation' },
    { id: 'settings', name: 'Go to Settings', icon: Settings, action: () => router.push('/settings'), group: 'Navigation' },
    { id: 'profile', name: 'Go to Profile', icon: User, action: () => router.push('/profile'), group: 'Navigation' },

    // Actions
    { id: 'new-post', name: 'Create New Post', icon: Plus, shortcut: ['Cmd', 'N'], action: () => router.push('/posts/new'), group: 'Actions' },
    { id: 'search', name: 'Search Posts', icon: Search, shortcut: ['Cmd', 'F'], action: () => router.push('/search'), group: 'Actions' },

    // Theme
    {
      id: 'toggle-theme',
      name: theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: ['Cmd', 'D'],
      action: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
      group: 'Preferences',
    },

    // Account
    { id: 'logout', name: 'Log Out', icon: LogOut, action: () => router.push('/logout'), group: 'Account' },
  ];

  // Group commands
  const groupedCommands = commands.reduce((acc, cmd) => {
    if (!acc[cmd.group]) acc[cmd.group] = [];
    acc[cmd.group].push(cmd);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 overflow-hidden max-w-lg">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              value={search}
              onValueChange={setSearch}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
            <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
              Esc
            </kbd>
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {Object.entries(groupedCommands).map(([group, items]) => (
              <Command.Group key={group} heading={group}>
                {items.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={item.name}
                    onSelect={() => runCommand(item.action)}
                    className="flex items-center gap-2 px-2 py-2 cursor-pointer rounded-md aria-selected:bg-accent"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.name}</span>
                    {item.shortcut && (
                      <div className="flex gap-1">
                        {item.shortcut.map((key) => (
                          <kbd
                            key={key}
                            className="pointer-events-none h-5 select-none rounded border bg-muted px-1.5 font-mono text-[10px] font-medium"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    )}
                  </Command.Item>
                ))}
              </Command.Group>
            ))}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
```

## Global Keyboard Shortcuts

```typescript
// hooks/use-keyboard-shortcuts.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

interface Shortcut {
  key: string;
  meta?: boolean;
  ctrl?: boolean;
  shift?: boolean;
  action: () => void;
}

export function useKeyboardShortcuts() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const shortcuts: Shortcut[] = [
      { key: 'n', meta: true, action: () => router.push('/posts/new') },
      { key: 'd', meta: true, action: () => setTheme(theme === 'dark' ? 'light' : 'dark') },
      { key: '/', action: () => document.querySelector<HTMLInputElement>('[data-search]')?.focus() },
    ];

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      for (const shortcut of shortcuts) {
        const metaMatch = shortcut.meta ? e.metaKey || e.ctrlKey : true;
        const ctrlMatch = shortcut.ctrl ? e.ctrlKey : true;
        const shiftMatch = shortcut.shift ? e.shiftKey : true;

        if (e.key.toLowerCase() === shortcut.key && metaMatch && ctrlMatch && shiftMatch) {
          e.preventDefault();
          shortcut.action();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router, theme, setTheme]);
}
```

## Search Integration

```typescript
// components/command-palette-with-search.tsx
'use client';

import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

export function CommandPaletteWithSearch() {
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 300);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedSearch],
    queryFn: () =>
      fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`).then((r) => r.json()),
    enabled: debouncedSearch.length > 2,
  });

  return (
    <Command>
      <Command.Input
        placeholder="Search..."
        value={search}
        onValueChange={setSearch}
      />
      <Command.List>
        {isLoading && (
          <Command.Loading>Searching...</Command.Loading>
        )}

        {searchResults?.posts?.length > 0 && (
          <Command.Group heading="Posts">
            {searchResults.posts.map((post: any) => (
              <Command.Item key={post.id} value={post.title}>
                {post.title}
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {searchResults?.users?.length > 0 && (
          <Command.Group heading="Users">
            {searchResults.users.map((user: any) => (
              <Command.Item key={user.id} value={user.name}>
                {user.name}
              </Command.Item>
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command>
  );
}
```

## Layout Integration

```typescript
// app/layout.tsx
import { CommandPalette } from '@/components/command-palette';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
```

## Trigger Button

```typescript
// components/command-trigger.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function CommandTrigger() {
  return (
    <Button
      variant="outline"
      className="relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
      onClick={() => {
        const event = new KeyboardEvent('keydown', {
          key: 'k',
          metaKey: true,
        });
        document.dispatchEvent(event);
      }}
    >
      <Search className="mr-2 h-4 w-4" />
      Search...
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">Cmd</span>K
      </kbd>
    </Button>
  );
}
```

## Anti-patterns

### Don't Block Typing Shortcuts in Inputs

```typescript
// BAD - Shortcuts fire while typing
window.addEventListener('keydown', (e) => {
  if (e.key === 'n') doSomething(); // Fires when typing 'n'!
});

// GOOD - Check target
window.addEventListener('keydown', (e) => {
  if (e.target instanceof HTMLInputElement) return;
  if (e.key === 'n') doSomething();
});
```

## Related Skills

- [search](./search.md)
- [keyboard-navigation](./keyboard-navigation.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- cmdk integration
- Global shortcuts
- Search integration
