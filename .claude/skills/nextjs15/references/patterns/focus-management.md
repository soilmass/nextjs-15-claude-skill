---
id: pt-focus-management
name: Focus Management
version: 2.0.0
layer: L5
category: browser
description: Focus trap, restoration, and visible focus indicators
tags: [focus, a11y, trap, restoration, indicators]
composes:
  - ../organisms/dialog.md
  - ../organisms/sheet.md
dependencies: []
formula: Focus Trap + Focus Restoration + Visible Indicators = Accessible UI
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## When to Use

- Trapping focus in modals and dialogs
- Restoring focus when components unmount
- Managing focus for keyboard navigation
- Implementing visible focus indicators
- Programmatic focus control for SPAs

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Focus Management Patterns                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Focus Trap (Modals, Dialogs)                        │   │
│  │                                                     │   │
│  │ ┌─────────────────────────────────────────────────┐ │   │
│  │ │ FocusScope                                      │ │   │
│  │ │ - Trap focus within container                   │ │   │
│  │ │ - Tab cycles through focusable elements         │ │   │
│  │ │ - Escape to close (optional)                    │ │   │
│  │ │ - Auto-focus first element                      │ │   │
│  │ └─────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Focus Restoration                                   │   │
│  │ - Save focus before modal opens                     │   │
│  │ - Restore focus when modal closes                   │   │
│  │ - Handle edge cases (removed elements)              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Visible Focus Indicators                            │   │
│  │ - :focus-visible styling                            │   │
│  │ - Custom focus rings                                │   │
│  │ - High contrast mode support                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Focus Management

## Overview

Focus management patterns for accessible interfaces including focus trapping, focus restoration, focus indicators, and programmatic focus control.

## Implementation

### Focus Scope Component

```tsx
// components/focus/focus-scope.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';

interface FocusScopeContextValue {
  contain: boolean;
  restoreFocus: boolean;
}

const FocusScopeContext = createContext<FocusScopeContextValue>({
  contain: false,
  restoreFocus: false,
});

interface FocusScopeProps {
  children: ReactNode;
  contain?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function FocusScope({
  children,
  contain = false,
  restoreFocus = true,
  autoFocus = true,
  className,
}: FocusScopeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLSpanElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];

    const elements = containerRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    return Array.from(elements).filter((el) => {
      return el.offsetParent !== null && !el.hasAttribute('inert');
    });
  }, []);

  const focusFirst = useCallback(() => {
    const elements = getFocusableElements();
    elements[0]?.focus();
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const elements = getFocusableElements();
    elements[elements.length - 1]?.focus();
  }, [getFocusableElements]);

  // Store previous focus
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;

    if (autoFocus) {
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        const elements = getFocusableElements();
        const autoFocusElement = containerRef.current?.querySelector<HTMLElement>(
          '[data-autofocus]'
        );
        (autoFocusElement || elements[0])?.focus();
      });
    }

    return () => {
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [autoFocus, restoreFocus, getFocusableElements]);

  // Handle focus containment
  const handleStartFocus = () => {
    if (contain) focusLast();
  };

  const handleEndFocus = () => {
    if (contain) focusFirst();
  };

  return (
    <FocusScopeContext.Provider value={{ contain, restoreFocus }}>
      {contain && (
        <span ref={startRef} tabIndex={0} onFocus={handleStartFocus} />
      )}
      <div ref={containerRef} className={className}>
        {children}
      </div>
      {contain && (
        <span ref={endRef} tabIndex={0} onFocus={handleEndFocus} />
      )}
    </FocusScopeContext.Provider>
  );
}
```

### Focus Ring Component

```tsx
// components/focus/focus-ring.tsx
'use client';

import { ReactNode, useState, cloneElement, isValidElement } from 'react';

interface FocusRingProps {
  children: ReactNode;
  focusRingClass?: string;
  within?: boolean;
}

export function FocusRing({
  children,
  focusRingClass = 'ring-2 ring-blue-500 ring-offset-2',
  within = false,
}: FocusRingProps) {
  const [isFocusVisible, setIsFocusVisible] = useState(false);

  const handleFocus = (e: React.FocusEvent) => {
    // Only show focus ring for keyboard navigation
    if (e.target.matches(':focus-visible')) {
      setIsFocusVisible(true);
    }
  };

  const handleBlur = () => {
    setIsFocusVisible(false);
  };

  if (!isValidElement(children)) {
    return <>{children}</>;
  }

  const focusProps = within
    ? {
        onFocusCapture: handleFocus,
        onBlurCapture: handleBlur,
      }
    : {
        onFocus: handleFocus,
        onBlur: handleBlur,
      };

  return cloneElement(children as React.ReactElement, {
    ...focusProps,
    className: `${children.props.className || ''} ${
      isFocusVisible ? focusRingClass : ''
    }`.trim(),
  });
}
```

### Focus Visible Hook

```tsx
// lib/focus/use-focus-visible.ts
'use client';

import { useState, useCallback } from 'react';

export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback((e: React.FocusEvent) => {
    setIsFocused(true);
    if (e.target.matches(':focus-visible')) {
      setIsFocusVisible(true);
    }
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    setIsFocusVisible(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      setIsFocusVisible(true);
    }
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  return {
    isFocused,
    isFocusVisible,
    focusProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
      onKeyDown: handleKeyDown,
      onMouseDown: handleMouseDown,
    },
  };
}
```

### Focus Within Hook

```tsx
// lib/focus/use-focus-within.ts
'use client';

import { useState, useCallback } from 'react';

export function useFocusWithin() {
  const [isFocusWithin, setIsFocusWithin] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocusWithin(true);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Check if focus moved outside the container
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsFocusWithin(false);
    }
  }, []);

  return {
    isFocusWithin,
    focusWithinProps: {
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
  };
}
```

### Focus Order Manager

```tsx
// lib/focus/focus-manager.ts
class FocusManager {
  private focusHistory: HTMLElement[] = [];
  private maxHistory = 10;

  saveFocus() {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement !== document.body) {
      this.focusHistory.push(activeElement);
      if (this.focusHistory.length > this.maxHistory) {
        this.focusHistory.shift();
      }
    }
  }

  restoreFocus() {
    const lastElement = this.focusHistory.pop();
    if (lastElement && document.contains(lastElement)) {
      lastElement.focus();
      return true;
    }
    return false;
  }

  focusElement(element: HTMLElement | null) {
    if (element) {
      this.saveFocus();
      element.focus();
    }
  }

  focusFirst(container: HTMLElement) {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      this.focusElement(focusable[0]);
    }
  }

  focusLast(container: HTMLElement) {
    const focusable = this.getFocusableElements(container);
    if (focusable.length > 0) {
      this.focusElement(focusable[focusable.length - 1]);
    }
  }

  getFocusableElements(container: HTMLElement): HTMLElement[] {
    const elements = container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    return Array.from(elements).filter(
      (el) => el.offsetParent !== null && !el.hasAttribute('inert')
    );
  }
}

export const focusManager = new FocusManager();
```

### Focus Guard Component

```tsx
// components/focus/focus-guard.tsx
'use client';

import { useEffect, useRef, ReactNode } from 'react';

interface FocusGuardProps {
  children: ReactNode;
  onFocusEscape?: (direction: 'start' | 'end') => void;
}

export function FocusGuard({ children, onFocusEscape }: FocusGuardProps) {
  const startGuardRef = useRef<HTMLSpanElement>(null);
  const endGuardRef = useRef<HTMLSpanElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleStartGuardFocus = () => {
      onFocusEscape?.('start');
    };

    const handleEndGuardFocus = () => {
      onFocusEscape?.('end');
    };

    const startGuard = startGuardRef.current;
    const endGuard = endGuardRef.current;

    startGuard?.addEventListener('focus', handleStartGuardFocus);
    endGuard?.addEventListener('focus', handleEndGuardFocus);

    return () => {
      startGuard?.removeEventListener('focus', handleStartGuardFocus);
      endGuard?.removeEventListener('focus', handleEndGuardFocus);
    };
  }, [onFocusEscape]);

  return (
    <>
      <span
        ref={startGuardRef}
        tabIndex={0}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
      <div ref={containerRef}>{children}</div>
      <span
        ref={endGuardRef}
        tabIndex={0}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      />
    </>
  );
}
```

### Inert Content Hook

```tsx
// lib/focus/use-inert.ts
'use client';

import { useEffect, useRef } from 'react';

export function useInert(isInert: boolean) {
  const ref = useRef<HTMLDivElement>(null);
  const previousInertElements = useRef<Set<Element>>(new Set());

  useEffect(() => {
    if (!ref.current || !isInert) return;

    const container = ref.current;
    const body = document.body;

    // Get all siblings and their descendants
    const walker = document.createTreeWalker(
      body,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (container.contains(node)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const elementsToInert: Element[] = [];
    let node = walker.nextNode();
    while (node) {
      if (node instanceof Element && !node.hasAttribute('inert')) {
        elementsToInert.push(node);
      }
      node = walker.nextNode();
    }

    // Make elements inert
    elementsToInert.forEach((el) => {
      el.setAttribute('inert', '');
      previousInertElements.current.add(el);
    });

    return () => {
      previousInertElements.current.forEach((el) => {
        el.removeAttribute('inert');
      });
      previousInertElements.current.clear();
    };
  }, [isInert]);

  return ref;
}
```

### Auto Focus Input

```tsx
// components/focus/auto-focus-input.tsx
'use client';

import { useEffect, useRef, InputHTMLAttributes, forwardRef } from 'react';

interface AutoFocusInputProps extends InputHTMLAttributes<HTMLInputElement> {
  selectOnFocus?: boolean;
  focusDelay?: number;
}

export const AutoFocusInput = forwardRef<HTMLInputElement, AutoFocusInputProps>(
  ({ selectOnFocus = false, focusDelay = 0, ...props }, forwardedRef) => {
    const internalRef = useRef<HTMLInputElement>(null);
    const ref = (forwardedRef as React.RefObject<HTMLInputElement>) || internalRef;

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (ref.current) {
          ref.current.focus();
          if (selectOnFocus) {
            ref.current.select();
          }
        }
      }, focusDelay);

      return () => clearTimeout(timeoutId);
    }, [focusDelay, selectOnFocus, ref]);

    return <input ref={ref} {...props} />;
  }
);

AutoFocusInput.displayName = 'AutoFocusInput';
```

## Usage

```tsx
// Focus scope for modals
import { FocusScope } from '@/components/focus/focus-scope';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <FocusScope contain restoreFocus autoFocus>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          {children}
          <button onClick={onClose}>Close</button>
        </div>
      </FocusScope>
    </div>
  );
}

// Focus visible styling
import { useFocusVisible } from '@/lib/focus/use-focus-visible';

function Button({ children, ...props }) {
  const { isFocusVisible, focusProps } = useFocusVisible();

  return (
    <button
      {...props}
      {...focusProps}
      className={`btn ${isFocusVisible ? 'ring-2 ring-blue-500' : ''}`}
    >
      {children}
    </button>
  );
}

// Focus within for form groups
import { useFocusWithin } from '@/lib/focus/use-focus-within';

function FormGroup({ label, children }) {
  const { isFocusWithin, focusWithinProps } = useFocusWithin();

  return (
    <div
      {...focusWithinProps}
      className={`form-group ${isFocusWithin ? 'border-blue-500' : ''}`}
    >
      <label>{label}</label>
      {children}
    </div>
  );
}

// Auto focus input
import { AutoFocusInput } from '@/components/focus/auto-focus-input';

function SearchModal() {
  return (
    <AutoFocusInput
      type="search"
      placeholder="Search..."
      selectOnFocus
    />
  );
}

// Inert content when modal is open
import { useInert } from '@/lib/focus/use-inert';

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const mainContentRef = useInert(modalOpen);

  return (
    <>
      <div ref={mainContentRef}>
        <main>Main content</main>
      </div>
      {modalOpen && <Modal onClose={() => setModalOpen(false)} />}
    </>
  );
}
```

## Related Skills

- [L5/keyboard-navigation](./keyboard-navigation.md) - Keyboard navigation
- [L5/accessibility](./accessibility.md) - A11y patterns
- [L2/button](../molecules/button.md) - Button component

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with focus scope and utilities
