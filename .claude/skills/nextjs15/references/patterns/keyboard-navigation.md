---
id: pt-keyboard-navigation
name: Keyboard Navigation
version: 2.0.0
layer: L5
category: data
description: Keyboard navigation patterns for accessible interfaces
tags: [keyboard, a11y, navigation, focus, shortcuts]
composes: []
formula: "KeyboardNav = RovingFocus + ArrowKeys + FocusTrap + Shortcuts + SkipLinks"
dependencies:
  - react
  - next
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Keyboard Navigation

## When to Use

- Building accessible menus, tabs, and listboxes
- Creating keyboard shortcuts for power users (Ctrl+K, Escape)
- Implementing focus traps in modals and dialogs
- Adding skip links for screen reader users
- Building command palettes with arrow key navigation
- Ensuring WCAG 2.1 AA compliance for keyboard users

## Composition Diagram

```
[User Keyboard Input]
        |
        +---> [Global Shortcuts Hook]
        |         |
        |         +---> [Match Shortcut] ---> [Execute Action]
        |
        +---> [Roving Focus Hook]
        |         |
        |         +---> [Arrow Up/Down] ---> [Move Focus Index]
        |         +---> [Home/End] ---> [Jump to First/Last]
        |         +---> [Enter/Space] ---> [Select Item]
        |
        +---> [Focus Trap Hook]
        |         |
        |         +---> [Tab] ---> [Cycle Within Container]
        |         +---> [Shift+Tab] ---> [Reverse Cycle]
        |         +---> [Escape] ---> [Close + Restore Focus]
        |
        v
[Accessible Component]
        |
        +---> [tabIndex Management]
        +---> [aria-selected State]
        +---> [Focus Visible Styles]
```

## Overview

Keyboard navigation patterns ensuring accessible interfaces with roving tabindex, arrow key navigation, and focus management.

## Implementation

### Roving Focus Hook

```tsx
// lib/keyboard/use-roving-focus.ts
'use client';

import { useState, useCallback, useRef, KeyboardEvent } from 'react';

interface UseRovingFocusOptions {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onFocusChange?: (index: number) => void;
}

export function useRovingFocus(
  itemCount: number,
  options: UseRovingFocusOptions = {}
) {
  const { orientation = 'vertical', loop = true, onFocusChange } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  const focusItem = useCallback(
    (index: number) => {
      const clampedIndex = loop
        ? ((index % itemCount) + itemCount) % itemCount
        : Math.max(0, Math.min(index, itemCount - 1));

      setFocusedIndex(clampedIndex);
      itemRefs.current[clampedIndex]?.focus();
      onFocusChange?.(clampedIndex);
    },
    [itemCount, loop, onFocusChange]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const { key } = event;
      let handled = false;

      switch (key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            focusItem(focusedIndex - 1);
            handled = true;
          }
          break;
        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            focusItem(focusedIndex + 1);
            handled = true;
          }
          break;
        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            focusItem(focusedIndex - 1);
            handled = true;
          }
          break;
        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            focusItem(focusedIndex + 1);
            handled = true;
          }
          break;
        case 'Home':
          focusItem(0);
          handled = true;
          break;
        case 'End':
          focusItem(itemCount - 1);
          handled = true;
          break;
      }

      if (handled) {
        event.preventDefault();
      }
    },
    [focusedIndex, focusItem, itemCount, orientation]
  );

  const getItemProps = useCallback(
    (index: number) => ({
      ref: setItemRef(index),
      tabIndex: index === focusedIndex ? 0 : -1,
      'aria-selected': index === focusedIndex,
    }),
    [focusedIndex, setItemRef]
  );

  return {
    focusedIndex,
    setFocusedIndex: focusItem,
    handleKeyDown,
    getItemProps,
  };
}
```

### Keyboard Shortcuts Hook

```tsx
// lib/keyboard/use-keyboard-shortcuts.ts
'use client';

import { useEffect, useCallback, useRef } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description?: string;
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: Shortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, preventDefault = true } = options;
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore if in input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow Escape in inputs
        if (event.key !== 'Escape') return;
      }

      const matchingShortcut = shortcutsRef.current.find((shortcut) => {
        if (shortcut.enabled === false) return false;

        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
        const altMatch = !!shortcut.alt === event.altKey;
        const shiftMatch = !!shortcut.shift === event.shiftKey;

        return keyMatch && ctrlMatch && altMatch && shiftMatch;
      });

      if (matchingShortcut) {
        if (preventDefault) {
          event.preventDefault();
        }
        matchingShortcut.action();
      }
    },
    [enabled, preventDefault]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Format shortcut for display
export function formatShortcut(shortcut: Omit<Shortcut, 'action'>): string {
  const parts: string[] = [];
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);

  if (shortcut.ctrl) parts.push(isMac ? '⌘' : 'Ctrl');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  
  // Format special keys
  const keyMap: Record<string, string> = {
    arrowup: '↑',
    arrowdown: '↓',
    arrowleft: '←',
    arrowright: '→',
    enter: '↵',
    escape: 'Esc',
    backspace: '⌫',
    delete: '⌦',
    ' ': 'Space',
  };

  const displayKey = keyMap[shortcut.key.toLowerCase()] || shortcut.key.toUpperCase();
  parts.push(displayKey);

  return parts.join(isMac ? '' : '+');
}
```

### Focus Trap Hook

```tsx
// lib/keyboard/use-focus-trap.ts
'use client';

import { useEffect, useRef, useCallback } from 'react';

interface UseFocusTrapOptions {
  enabled?: boolean;
  autoFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

export function useFocusTrap<T extends HTMLElement>(
  options: UseFocusTrapOptions = {}
) {
  const { enabled = true, autoFocus = true, restoreFocus = true, initialFocus } = options;
  const containerRef = useRef<T>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    return Array.from(elements).filter(
      (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
    );
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || event.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [enabled, getFocusableElements]
  );

  useEffect(() => {
    if (!enabled) return;

    previousActiveElement.current = document.activeElement as HTMLElement;

    if (autoFocus) {
      const focusTarget = initialFocus?.current || getFocusableElements()[0];
      focusTarget?.focus();
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [enabled, autoFocus, restoreFocus, initialFocus, getFocusableElements, handleKeyDown]);

  return containerRef;
}
```

### Arrow Key Navigation Component

```tsx
// components/keyboard/arrow-nav-list.tsx
'use client';

import { useRovingFocus } from '@/lib/keyboard/use-roving-focus';
import { ReactNode } from 'react';

interface ArrowNavListProps<T> {
  items: T[];
  renderItem: (item: T, index: number, isFocused: boolean) => ReactNode;
  orientation?: 'horizontal' | 'vertical';
  loop?: boolean;
  onSelect?: (item: T, index: number) => void;
  className?: string;
  itemClassName?: string;
  role?: string;
}

export function ArrowNavList<T>({
  items,
  renderItem,
  orientation = 'vertical',
  loop = true,
  onSelect,
  className,
  itemClassName,
  role = 'listbox',
}: ArrowNavListProps<T>) {
  const { focusedIndex, handleKeyDown, getItemProps } = useRovingFocus(
    items.length,
    { orientation, loop }
  );

  const handleItemClick = (item: T, index: number) => {
    onSelect?.(item, index);
  };

  const handleItemKeyDown = (
    event: React.KeyboardEvent,
    item: T,
    index: number
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(item, index);
    } else {
      handleKeyDown(event);
    }
  };

  return (
    <div
      role={role}
      className={className}
      aria-orientation={orientation}
    >
      {items.map((item, index) => (
        <div
          key={index}
          {...getItemProps(index)}
          role="option"
          className={itemClassName}
          onClick={() => handleItemClick(item, index)}
          onKeyDown={(e) => handleItemKeyDown(e, item, index)}
        >
          {renderItem(item, index, index === focusedIndex)}
        </div>
      ))}
    </div>
  );
}
```

### Keyboard Shortcut Display

```tsx
// components/keyboard/shortcut-hint.tsx
import { formatShortcut } from '@/lib/keyboard/use-keyboard-shortcuts';

interface ShortcutHintProps {
  shortcut: {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
  };
  className?: string;
}

export function ShortcutHint({ shortcut, className }: ShortcutHintProps) {
  const formatted = formatShortcut(shortcut);

  return (
    <kbd
      className={`inline-flex items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 font-mono text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 ${className}`}
    >
      {formatted}
    </kbd>
  );
}
```

### Keyboard Shortcuts Modal

```tsx
// components/keyboard/shortcuts-modal.tsx
'use client';

import { Fragment } from 'react';
import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFocusTrap } from '@/lib/keyboard/use-focus-trap';
import { ShortcutHint } from './shortcut-hint';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    description: string;
  }[];
}

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: ShortcutGroup[];
}

export function ShortcutsModal({ isOpen, onClose, groups }: ShortcutsModalProps) {
  const containerRef = useFocusTrap<HTMLDivElement>({ enabled: isOpen });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            ref={containerRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Keyboard className="h-6 w-6 text-gray-400" />
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <div className="grid gap-8 sm:grid-cols-2">
                {groups.map((group) => (
                  <div key={group.title}>
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {group.title}
                    </h3>
                    <div className="space-y-3">
                      {group.shortcuts.map((shortcut, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {shortcut.description}
                          </span>
                          <ShortcutHint shortcut={shortcut} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-800">
              <p className="text-center text-sm text-gray-500">
                Press <ShortcutHint shortcut={{ key: '?' }} /> anytime to show this help
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Skip Link Component

```tsx
// components/keyboard/skip-link.tsx
'use client';

import { useState } from 'react';

interface SkipLinkProps {
  href: string;
  children?: React.ReactNode;
}

export function SkipLink({ href, children = 'Skip to main content' }: SkipLinkProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <a
      href={href}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      className={`fixed left-4 top-4 z-[100] rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isFocused ? 'translate-y-0' : '-translate-y-20'
      }`}
    >
      {children}
    </a>
  );
}
```

## Usage

```tsx
// Roving focus in a menu
import { useRovingFocus } from '@/lib/keyboard/use-roving-focus';

function Menu({ items }) {
  const { focusedIndex, handleKeyDown, getItemProps } = useRovingFocus(
    items.length,
    { orientation: 'vertical' }
  );

  return (
    <div role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <button
          key={item.id}
          role="menuitem"
          {...getItemProps(index)}
          className={index === focusedIndex ? 'bg-blue-100' : ''}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

// Global keyboard shortcuts
import { useKeyboardShortcuts } from '@/lib/keyboard/use-keyboard-shortcuts';

function App() {
  useKeyboardShortcuts([
    { key: 'k', ctrl: true, action: () => openSearch(), description: 'Open search' },
    { key: 'Escape', action: () => closeModal() },
    { key: '?', action: () => showShortcuts(), description: 'Show shortcuts' },
  ]);
}

// Focus trap in modal
import { useFocusTrap } from '@/lib/keyboard/use-focus-trap';

function Modal({ isOpen, onClose, children }) {
  const containerRef = useFocusTrap<HTMLDivElement>({ enabled: isOpen });

  return isOpen ? (
    <div ref={containerRef} role="dialog" aria-modal="true">
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  ) : null;
}

// Skip link for accessibility
import { SkipLink } from '@/components/keyboard/skip-link';

function Layout({ children }) {
  return (
    <>
      <SkipLink href="#main-content" />
      <header>...</header>
      <main id="main-content">{children}</main>
    </>
  );
}
```

## Related Skills

- [L5/focus-management](./focus-management.md) - Focus management
- [L3/keyboard-shortcuts](../organisms/keyboard-shortcuts.md) - Shortcuts overlay
- [L5/accessibility](./accessibility.md) - A11y patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with roving focus and shortcuts
