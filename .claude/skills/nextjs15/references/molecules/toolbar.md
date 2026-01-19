---
id: m-toolbar
name: Toolbar
version: 2.0.0
layer: L2
category: interactive
description: Horizontal toolbar with grouped actions, separators, and responsive overflow
tags: [toolbar, actions, buttons, editor, navigation]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "Toolbar = ToolbarButton(a-input-button) + ToolbarIcon(a-display-icon) + Separator + ToggleGroup"
composes:
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
dependencies:
  react: "^19.0.0"
  "@radix-ui/react-toolbar": "^1.1.0"
  "@radix-ui/react-toggle-group": "^1.1.0"
  lucide-react: "^0.460.0"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Toolbar

## Overview

A horizontal toolbar molecule for grouping related actions. Built on Radix UI Toolbar for accessibility, with support for button groups, toggles, separators, and responsive overflow menus.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 Toolbar                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌────────────────┐ │ ┌─────────────────────────┐ │ ┌────────────────────┐  │
│  │  Button Group  │ │ │     Toggle Group        │ │ │    Overflow Menu   │  │
│  │ (a-input-btn)  │ │ │    (a-input-btn[])      │ │ │    (a-input-btn)   │  │
│  │                │ │ │                         │ │ │                    │  │
│  │ [Undo] [Redo]  │ │ │ [B] [I] [U] [S]         │ │ │        ⋯          │  │
│  └────────────────┘ │ └─────────────────────────┘ │ └────────────────────┘  │
│      separator      │        separator            │                         │
└─────────────────────────────────────────────────────────────────────────────┘

Text Editor Toolbar Example:
┌──────────────────────────────────────────────────────────────────────────────┐
│ [↩] [↪] │ [B] [I] [U] [S] │ [H1] [H2] [¶] │ [🔗] [📷] [📊] │ [⋯]           │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/molecules/toolbar.tsx
'use client';

import * as React from 'react';
import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import { cva, type VariantProps } from 'class-variance-authority';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface ToolbarProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Root>,
    VariantProps<typeof toolbarVariants> {
  children: React.ReactNode;
}

interface ToolbarButtonProps
  extends React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Button>,
    VariantProps<typeof toolbarButtonVariants> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

interface ToolbarToggleGroupProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root>,
    'type'
  > {
  type?: 'single' | 'multiple';
  children: React.ReactNode;
}

interface ToolbarToggleItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof toolbarButtonVariants> {
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

interface ToolbarDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}

// Styles
const toolbarVariants = cva(
  'flex items-center gap-1 rounded-lg border bg-background',
  {
    variants: {
      size: {
        sm: 'p-1',
        md: 'p-1.5',
        lg: 'p-2',
      },
      variant: {
        default: 'border-border',
        ghost: 'border-transparent bg-transparent',
        elevated: 'border-border shadow-sm',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

const toolbarButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      size: {
        sm: 'h-7 px-2 text-xs gap-1',
        md: 'h-8 px-3 text-sm gap-1.5',
        lg: 'h-9 px-4 text-sm gap-2',
        icon: 'h-8 w-8',
        'icon-sm': 'h-7 w-7',
        'icon-lg': 'h-9 w-9',
      },
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        active: 'bg-accent text-accent-foreground',
        ghost: 'hover:bg-accent/50',
      },
    },
    defaultVariants: {
      size: 'md',
      variant: 'default',
    },
  }
);

// Context for size propagation
const ToolbarContext = React.createContext<{
  size?: 'sm' | 'md' | 'lg';
}>({ size: 'md' });

// Main Toolbar
export function Toolbar({
  children,
  size,
  variant,
  className,
  ...props
}: ToolbarProps) {
  return (
    <ToolbarContext.Provider value={{ size: size ?? 'md' }}>
      <ToolbarPrimitive.Root
        className={cn(toolbarVariants({ size, variant }), className)}
        {...props}
      >
        {children}
      </ToolbarPrimitive.Root>
    </ToolbarContext.Provider>
  );
}

// Toolbar Button
export function ToolbarButton({
  icon,
  children,
  size,
  variant,
  className,
  ...props
}: ToolbarButtonProps) {
  const context = React.useContext(ToolbarContext);
  const buttonSize = size ?? (children ? context.size : `icon-${context.size}` as const);

  return (
    <ToolbarPrimitive.Button
      className={cn(toolbarButtonVariants({ size: buttonSize, variant }), className)}
      {...props}
    >
      {icon}
      {children}
    </ToolbarPrimitive.Button>
  );
}

// Toolbar Link
export function ToolbarLink({
  icon,
  children,
  size,
  variant,
  className,
  ...props
}: ToolbarButtonProps & { href: string }) {
  const context = React.useContext(ToolbarContext);
  const buttonSize = size ?? (children ? context.size : `icon-${context.size}` as const);

  return (
    <ToolbarPrimitive.Link
      className={cn(toolbarButtonVariants({ size: buttonSize, variant }), className)}
      {...props}
    >
      {icon}
      {children}
    </ToolbarPrimitive.Link>
  );
}

// Toolbar Separator
export function ToolbarSeparator({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof ToolbarPrimitive.Separator>) {
  return (
    <ToolbarPrimitive.Separator
      className={cn('mx-1 h-5 w-px bg-border', className)}
      {...props}
    />
  );
}

// Toolbar Toggle Group
export function ToolbarToggleGroup({
  type = 'single',
  children,
  className,
  ...props
}: ToolbarToggleGroupProps) {
  return (
    <ToolbarPrimitive.ToggleGroup
      type={type}
      className={cn('flex items-center gap-0.5', className)}
      {...props}
    >
      {children}
    </ToolbarPrimitive.ToggleGroup>
  );
}

// Toolbar Toggle Item
export function ToolbarToggleItem({
  icon,
  children,
  size,
  className,
  ...props
}: ToolbarToggleItemProps) {
  const context = React.useContext(ToolbarContext);
  const buttonSize = size ?? (children ? context.size : `icon-${context.size}` as const);

  return (
    <ToolbarPrimitive.ToggleItem
      className={cn(
        toolbarButtonVariants({ size: buttonSize, variant: 'default' }),
        'data-[state=on]:bg-accent data-[state=on]:text-accent-foreground',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </ToolbarPrimitive.ToggleItem>
  );
}

// Simple Dropdown for Toolbar
export function ToolbarDropdown({
  trigger,
  children,
  align = 'start',
}: ToolbarDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setOpen(!open)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute top-full mt-1 z-50 min-w-[8rem] rounded-md border bg-popover p-1 shadow-md',
            align === 'start' && 'left-0',
            align === 'center' && 'left-1/2 -translate-x-1/2',
            align === 'end' && 'right-0'
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// Dropdown Item
export function ToolbarDropdownItem({
  icon,
  children,
  onClick,
  disabled,
  className,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground focus:outline-none',
        'disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      {icon}
      {children}
    </button>
  );
}

// Toolbar Group wrapper
export function ToolbarGroup({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>{children}</div>
  );
}

// Overflow Menu for responsive toolbars
interface ToolbarOverflowProps {
  items: Array<{
    icon?: React.ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  }>;
}

export function ToolbarOverflow({ items }: ToolbarOverflowProps) {
  return (
    <ToolbarDropdown
      trigger={
        <ToolbarButton
          icon={<MoreHorizontal className="h-4 w-4" />}
          aria-label="More actions"
        />
      }
      align="end"
    >
      {items.map((item, index) => (
        <ToolbarDropdownItem
          key={index}
          icon={item.icon}
          onClick={item.onClick}
          disabled={item.disabled}
        >
          {item.label}
        </ToolbarDropdownItem>
      ))}
    </ToolbarDropdown>
  );
}

// Pre-built: Rich Text Editor Toolbar
interface RichTextToolbarProps {
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onStrikethrough?: () => void;
  onLink?: () => void;
  onBulletList?: () => void;
  onNumberedList?: () => void;
  onQuote?: () => void;
  onCode?: () => void;
  onImage?: () => void;
  activeFormats?: string[];
}

export function RichTextToolbar({
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onLink,
  onBulletList,
  onNumberedList,
  onQuote,
  onCode,
  onImage,
  activeFormats = [],
}: RichTextToolbarProps) {
  // Import icons dynamically or pass as props
  return (
    <Toolbar aria-label="Text formatting">
      <ToolbarToggleGroup type="multiple" value={activeFormats}>
        <ToolbarToggleItem value="bold" onClick={onBold} aria-label="Bold">
          <span className="font-bold">B</span>
        </ToolbarToggleItem>
        <ToolbarToggleItem value="italic" onClick={onItalic} aria-label="Italic">
          <span className="italic">I</span>
        </ToolbarToggleItem>
        <ToolbarToggleItem value="underline" onClick={onUnderline} aria-label="Underline">
          <span className="underline">U</span>
        </ToolbarToggleItem>
        <ToolbarToggleItem value="strikethrough" onClick={onStrikethrough} aria-label="Strikethrough">
          <span className="line-through">S</span>
        </ToolbarToggleItem>
      </ToolbarToggleGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarButton onClick={onBulletList} aria-label="Bullet list">
          <span>-</span>
        </ToolbarButton>
        <ToolbarButton onClick={onNumberedList} aria-label="Numbered list">
          <span>1.</span>
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarButton onClick={onLink} aria-label="Insert link">
          <span>Link</span>
        </ToolbarButton>
        <ToolbarButton onClick={onImage} aria-label="Insert image">
          <span>Image</span>
        </ToolbarButton>
        <ToolbarButton onClick={onCode} aria-label="Code block">
          <span>Code</span>
        </ToolbarButton>
      </ToolbarGroup>
    </Toolbar>
  );
}

// Pre-built: Document Actions Toolbar
interface DocumentToolbarProps {
  onSave?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  isSaving?: boolean;
}

export function DocumentToolbar({
  onSave,
  onUndo,
  onRedo,
  onPrint,
  onExport,
  onShare,
  canUndo = true,
  canRedo = true,
  isSaving = false,
}: DocumentToolbarProps) {
  return (
    <Toolbar aria-label="Document actions">
      <ToolbarButton onClick={onSave} disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </ToolbarButton>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ToolbarButton onClick={onUndo} disabled={!canUndo} aria-label="Undo">
          Undo
        </ToolbarButton>
        <ToolbarButton onClick={onRedo} disabled={!canRedo} aria-label="Redo">
          Redo
        </ToolbarButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarOverflow
        items={[
          { label: 'Print', onClick: onPrint },
          { label: 'Export', onClick: onExport },
          { label: 'Share', onClick: onShare },
        ]}
      />
    </Toolbar>
  );
}
```

## Variants

### Size Variants

```tsx
<Toolbar size="sm">...</Toolbar>
<Toolbar size="md">...</Toolbar>
<Toolbar size="lg">...</Toolbar>
```

### Style Variants

```tsx
<Toolbar variant="default">...</Toolbar>
<Toolbar variant="ghost">...</Toolbar>
<Toolbar variant="elevated">...</Toolbar>
```

### Button Sizes

```tsx
<ToolbarButton size="sm">Small</ToolbarButton>
<ToolbarButton size="md">Medium</ToolbarButton>
<ToolbarButton size="lg">Large</ToolbarButton>
<ToolbarButton size="icon"><Icon /></ToolbarButton>
```

## Usage

### Basic Toolbar

```tsx
import {
  Toolbar,
  ToolbarButton,
  ToolbarSeparator,
} from '@/components/molecules/toolbar';
import { Bold, Italic, Underline, Link } from 'lucide-react';

export function BasicToolbar() {
  return (
    <Toolbar>
      <ToolbarButton icon={<Bold className="h-4 w-4" />} aria-label="Bold" />
      <ToolbarButton icon={<Italic className="h-4 w-4" />} aria-label="Italic" />
      <ToolbarButton icon={<Underline className="h-4 w-4" />} aria-label="Underline" />
      <ToolbarSeparator />
      <ToolbarButton icon={<Link className="h-4 w-4" />}>
        Insert Link
      </ToolbarButton>
    </Toolbar>
  );
}
```

### Toggle Group Toolbar

```tsx
import {
  Toolbar,
  ToolbarToggleGroup,
  ToolbarToggleItem,
  ToolbarSeparator,
} from '@/components/molecules/toolbar';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

export function AlignmentToolbar() {
  const [alignment, setAlignment] = useState('left');

  return (
    <Toolbar>
      <ToolbarToggleGroup
        type="single"
        value={alignment}
        onValueChange={(value) => value && setAlignment(value)}
      >
        <ToolbarToggleItem value="left" icon={<AlignLeft className="h-4 w-4" />} />
        <ToolbarToggleItem value="center" icon={<AlignCenter className="h-4 w-4" />} />
        <ToolbarToggleItem value="right" icon={<AlignRight className="h-4 w-4" />} />
        <ToolbarToggleItem value="justify" icon={<AlignJustify className="h-4 w-4" />} />
      </ToolbarToggleGroup>
    </Toolbar>
  );
}
```

### With Dropdown

```tsx
import {
  Toolbar,
  ToolbarButton,
  ToolbarDropdown,
  ToolbarDropdownItem,
  ToolbarSeparator,
} from '@/components/molecules/toolbar';
import { Type, ChevronDown } from 'lucide-react';

export function FontToolbar() {
  return (
    <Toolbar>
      <ToolbarDropdown
        trigger={
          <ToolbarButton>
            <Type className="h-4 w-4" />
            Arial
            <ChevronDown className="h-3 w-3" />
          </ToolbarButton>
        }
      >
        <ToolbarDropdownItem onClick={() => setFont('Arial')}>Arial</ToolbarDropdownItem>
        <ToolbarDropdownItem onClick={() => setFont('Times')}>Times New Roman</ToolbarDropdownItem>
        <ToolbarDropdownItem onClick={() => setFont('Courier')}>Courier</ToolbarDropdownItem>
      </ToolbarDropdown>
      <ToolbarSeparator />
      {/* ... */}
    </Toolbar>
  );
}
```

### Responsive Toolbar with Overflow

```tsx
import {
  Toolbar,
  ToolbarButton,
  ToolbarOverflow,
  ToolbarSeparator,
} from '@/components/molecules/toolbar';

export function ResponsiveToolbar() {
  return (
    <Toolbar>
      {/* Always visible */}
      <ToolbarButton>Save</ToolbarButton>
      <ToolbarButton>Edit</ToolbarButton>
      
      <ToolbarSeparator />
      
      {/* Visible on larger screens */}
      <div className="hidden md:flex items-center gap-0.5">
        <ToolbarButton>Print</ToolbarButton>
        <ToolbarButton>Export</ToolbarButton>
        <ToolbarButton>Share</ToolbarButton>
      </div>
      
      {/* Overflow menu on smaller screens */}
      <div className="md:hidden">
        <ToolbarOverflow
          items={[
            { label: 'Print', onClick: handlePrint },
            { label: 'Export', onClick: handleExport },
            { label: 'Share', onClick: handleShare },
          ]}
        />
      </div>
    </Toolbar>
  );
}
```

## Anti-patterns

```tsx
// Don't forget aria-labels for icon-only buttons
<ToolbarButton icon={<Bold />} /> // Missing aria-label

// Do provide accessible labels
<ToolbarButton icon={<Bold />} aria-label="Bold" />

// Don't mix unrelated actions
<Toolbar>
  <ToolbarButton>Bold</ToolbarButton>
  <ToolbarButton>Delete Account</ToolbarButton> // Unrelated
</Toolbar>

// Do group related actions
<Toolbar>
  <ToolbarGroup>
    <ToolbarButton>Bold</ToolbarButton>
    <ToolbarButton>Italic</ToolbarButton>
  </ToolbarGroup>
  <ToolbarSeparator />
  <ToolbarGroup>
    <ToolbarButton>Save</ToolbarButton>
  </ToolbarGroup>
</Toolbar>
```

## Related Skills

- `atoms/button` - Base button component
- `molecules/action-menu` - Dropdown action menu
- `organisms/command-palette` - Command palette

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with Radix UI Toolbar
- Added toggle groups for multi-select
- Dropdown support
- Responsive overflow menu
- Pre-built RichTextToolbar and DocumentToolbar
