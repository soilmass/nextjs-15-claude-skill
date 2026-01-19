---
id: o-modal
name: Modal
version: 1.0.0
layer: L3
category: overlays
description: Modal/dialog component with overlay, focus trap, and animation
tags: [modal, dialog, overlay, popup, lightbox]
formula: "Modal = Card(m-card) + Button(a-button) + IconButton"
composes:
  - ../molecules/card.md
  - ../atoms/input-button.md
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

# Modal

## Overview

The Modal organism provides a flexible modal/dialog component with overlay backdrop, focus trapping, keyboard navigation, and smooth animations. Supports multiple sizes, custom headers/footers, and portal rendering.

## When to Use

Use this skill when:
- Displaying important information that requires attention
- Creating confirmation dialogs
- Building form modals
- Showing image or content previews

## Composition Diagram

```
+---------------------------------------------------------------------+
|                          Modal (L3)                                  |
+---------------------------------------------------------------------+
|  Overlay (backdrop):                                                |
|  +---------------------------------------------------------------+  |
|  |                    (semi-transparent background)               |  |
|  |  +----------------------------------------------------------+ |  |
|  |  |                    ModalContent                           | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  |  |  ModalHeader                                         | | |  |
|  |  |  |  Title                                     [X] Close | | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  |                                                          | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  |  |  ModalBody                                           | | |  |
|  |  |  |  {children} - Main content area                      | | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  |                                                          | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  |  |  ModalFooter                                         | | |  |
|  |  |  |  [Cancel] Button(a)   [Confirm] Button(a)            | | |  |
|  |  |  +------------------------------------------------------+ | |  |
|  |  +----------------------------------------------------------+ |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/modal.tsx
'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[95vw] max-h-[95vh]',
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  footer,
  className,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Focus management
  React.useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      modalRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      previousActiveElement.current?.focus();
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Focus trap
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  };

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeOnOverlayClick ? onClose : undefined}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'relative w-full bg-background rounded-lg shadow-xl',
              'focus:outline-none',
              sizeClasses[size],
              size === 'full' && 'h-full overflow-hidden',
              className
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
            aria-describedby={description ? 'modal-description' : undefined}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-start justify-between p-4 border-b">
                <div>
                  {title && (
                    <h2
                      id="modal-title"
                      className="text-lg font-semibold leading-none"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p
                      id="modal-description"
                      className="mt-1 text-sm text-muted-foreground"
                    >
                      {description}
                    </p>
                  )}
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={cn(
                      'p-1.5 rounded-lg transition-colors',
                      'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary'
                    )}
                    aria-label="Close modal"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div
              className={cn(
                'p-4',
                size === 'full' && 'overflow-y-auto flex-1'
              )}
            >
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 p-4 border-t">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

// Convenience components
interface ModalButtonProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

export function ModalButton({
  variant = 'secondary',
  onClick,
  disabled,
  loading,
  children,
}: ModalButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'border bg-background hover:bg-accent',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant]
      )}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// Hook for modal state management
export function useModal(initialState = false) {
  const [isOpen, setIsOpen] = React.useState(initialState);

  const open = React.useCallback(() => setIsOpen(true), []);
  const close = React.useCallback(() => setIsOpen(false), []);
  const toggle = React.useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
}
```

## Usage

### Basic Usage

```tsx
import { Modal, ModalButton, useModal } from '@/components/organisms/modal';

export function Example() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <button onClick={open}>Open Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={close}
        title="Confirm Action"
        description="Are you sure you want to proceed?"
        footer={
          <>
            <ModalButton onClick={close}>Cancel</ModalButton>
            <ModalButton variant="primary" onClick={handleConfirm}>
              Confirm
            </ModalButton>
          </>
        }
      >
        <p>This action cannot be undone.</p>
      </Modal>
    </>
  );
}
```

### Form Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={close}
  title="Edit Profile"
  size="lg"
  footer={
    <>
      <ModalButton onClick={close}>Cancel</ModalButton>
      <ModalButton variant="primary" loading={isSubmitting}>
        Save Changes
      </ModalButton>
    </>
  }
>
  <form className="space-y-4">
    <input type="text" placeholder="Name" />
    <input type="email" placeholder="Email" />
  </form>
</Modal>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Modal is not visible | No modal elements rendered in DOM (portal empty) |
| Opening | Modal animating to visible state | Overlay fades in, content scales up from 0.95 with slight upward motion |
| Open | Modal is fully visible and interactive | Semi-transparent backdrop with blur, centered modal content |
| Closing | Modal animating to hidden state | Overlay fades out, content scales down with downward motion |
| Focused | Modal has received focus | Focus ring on close button or first focusable element |
| Loading | Action in progress within modal | Submit button shows loading spinner, buttons disabled |
| Full Size | Modal using 'full' size variant | Modal expands to 95vw/95vh, content area scrollable |
| With Footer | Modal has footer actions | Bottom border separator, right-aligned action buttons |

## Anti-patterns

### Bad: Not returning focus to trigger element on close

```tsx
// Bad - Focus lost when modal closes
function Modal({ isOpen, onClose, children }) {
  return isOpen ? (
    <div className="modal">
      <button onClick={onClose}>Close</button>
      {children}
    </div>
  ) : null;
}

// Good - Store and restore focus
const previousActiveElement = useRef<HTMLElement | null>(null);

useEffect(() => {
  if (isOpen) {
    previousActiveElement.current = document.activeElement as HTMLElement;
    modalRef.current?.focus();
  } else {
    previousActiveElement.current?.focus();
  }
}, [isOpen]);
```

### Bad: Not trapping focus within modal

```tsx
// Bad - Focus can escape to background elements
<div className="modal">
  <input type="text" />
  <button>Submit</button>
</div>

// Good - Implement focus trap
const handleKeyDown = (e: React.KeyboardEvent) => {
  if (e.key !== 'Tab') return;

  const focusableElements = modalRef.current?.querySelectorAll(
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
};
```

### Bad: Not using portal for modal rendering

```tsx
// Bad - Modal rendered inside component tree
function Page() {
  return (
    <div className="overflow-hidden"> {/* This clips the modal! */}
      <Modal isOpen={isOpen}>
        <Content />
      </Modal>
    </div>
  );
}

// Good - Use portal to render at document.body
return createPortal(
  <div className="fixed inset-0 z-50">
    <Overlay />
    <ModalContent />
  </div>,
  document.body
);
```

### Bad: Not handling escape key and overlay click

```tsx
// Bad - User cannot close modal easily
<div className="modal">
  <button onClick={onClose}>X</button>
  {children}
</div>

// Good - Multiple ways to dismiss modal
useEffect(() => {
  if (!isOpen || !closeOnEscape) return;
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  };
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [isOpen, closeOnEscape, onClose]);

// Overlay click handling
<div
  className="fixed inset-0 bg-black/60"
  onClick={closeOnOverlayClick ? onClose : undefined}
  aria-hidden="true"
/>
```

## Accessibility

- Focus trapped within modal when open
- Escape key closes modal
- Proper ARIA attributes for dialog
- Focus returns to trigger on close

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

- [organisms/dialog](./dialog.md)
- [organisms/drawer](./drawer.md)
- [molecules/card](../molecules/card.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Focus trap and keyboard navigation
- Multiple sizes
- Portal rendering
