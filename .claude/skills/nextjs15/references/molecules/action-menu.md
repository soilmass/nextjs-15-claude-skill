---
id: m-action-menu
name: Action Menu
version: 2.0.0
layer: L2
category: interactive
description: Context menu / action dropdown with keyboard navigation and nested submenus
tags: [menu, dropdown, context, actions, navigation]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "ActionMenu = TriggerButton(a-input-button) + MenuIcon(a-display-icon) + MenuItem[]"
composes:
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
dependencies:
  react: "^19.0.0"
  "@radix-ui/react-dropdown-menu": "^2.1.2"
  lucide-react: "^0.460.0"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Action Menu

## Overview

A dropdown action menu molecule built on Radix UI DropdownMenu. Supports items with icons, keyboard shortcuts, disabled states, destructive actions, nested submenus, checkboxes, and radio groups.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ActionMenu                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────── Trigger ───────────────────────────┐  │
│  │  ┌───────────────────────────────────────────────────────┐│  │
│  │  │            Button (a-input-button)                    ││  │
│  │  │                     ⋮ or ⋯                            ││  │
│  │  └───────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────── Dropdown ──────────────────────────┐  │
│  │  ┌───────────────────────────────────────────────────────┐│  │
│  │  │  📋  Copy                                  ⌘C         ││  │
│  │  ├───────────────────────────────────────────────────────┤│  │
│  │  │  ✏️  Edit                                  ⌘E         ││  │
│  │  ├───────────────────────────────────────────────────────┤│  │
│  │  │  📤  Share                                    ▶       ││  │
│  │  │      └── Submenu: Email, Link, Embed                  ││  │
│  │  ├───────────────────────────────────────────────────────┤│  │
│  │  │  ─────────────── (separator) ──────────────────       ││  │
│  │  ├───────────────────────────────────────────────────────┤│  │
│  │  │  🗑️  Delete (destructive)                   ⌘⌫        ││  │
│  │  └───────────────────────────────────────────────────────┘│  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/molecules/action-menu.tsx
'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Check,
  ChevronRight,
  Circle,
  MoreHorizontal,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface ActionMenuItem {
  type?: 'item' | 'separator' | 'label' | 'checkbox' | 'radio';
  label?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
  destructive?: boolean;
  checked?: boolean;
  value?: string;
  onSelect?: () => void;
  onCheckedChange?: (checked: boolean) => void;
  items?: ActionMenuItem[]; // For submenus
}

interface ActionMenuProps extends VariantProps<typeof triggerVariants> {
  items: ActionMenuItem[];
  trigger?: React.ReactNode;
  triggerIcon?: 'horizontal' | 'vertical';
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  modal?: boolean;
  onOpenChange?: (open: boolean) => void;
  'aria-label'?: string;
}

interface ActionMenuRadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  items: ActionMenuItem[];
}

// Styles
const triggerVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border border-input bg-background hover:bg-accent',
        ghost: 'hover:bg-accent/50',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-9 w-9',
        lg: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
);

const menuItemVariants = cva(
  'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
  {
    variants: {
      variant: {
        default: 'focus:bg-accent focus:text-accent-foreground',
        destructive: 'focus:bg-destructive focus:text-destructive-foreground text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Menu Content Component
const MenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenu.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenu.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenu.Portal>
    <DropdownMenu.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
        'data-[side=bottom]:slide-in-from-top-2',
        'data-[side=left]:slide-in-from-right-2',
        'data-[side=right]:slide-in-from-left-2',
        'data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </DropdownMenu.Portal>
));
MenuContent.displayName = 'MenuContent';

// Menu Item Component
function MenuItem({
  item,
  inset = false,
}: {
  item: ActionMenuItem;
  inset?: boolean;
}) {
  return (
    <DropdownMenu.Item
      className={cn(
        menuItemVariants({ variant: item.destructive ? 'destructive' : 'default' }),
        inset && 'pl-8'
      )}
      disabled={item.disabled}
      onSelect={(e) => {
        if (item.onSelect) {
          e.preventDefault();
          item.onSelect();
        }
      }}
    >
      {item.icon && <span className="mr-2 h-4 w-4">{item.icon}</span>}
      <span className="flex-1">{item.label}</span>
      {item.shortcut && (
        <span className="ml-auto text-xs tracking-widest text-muted-foreground">
          {item.shortcut}
        </span>
      )}
    </DropdownMenu.Item>
  );
}

// Checkbox Item Component
function CheckboxItem({ item }: { item: ActionMenuItem }) {
  return (
    <DropdownMenu.CheckboxItem
      className={cn(menuItemVariants(), 'pl-8')}
      checked={item.checked}
      onCheckedChange={item.onCheckedChange}
      disabled={item.disabled}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <DropdownMenu.ItemIndicator>
          <Check className="h-4 w-4" />
        </DropdownMenu.ItemIndicator>
      </span>
      {item.label}
    </DropdownMenu.CheckboxItem>
  );
}

// Radio Item Component
function RadioItem({ item }: { item: ActionMenuItem }) {
  return (
    <DropdownMenu.RadioItem
      className={cn(menuItemVariants(), 'pl-8')}
      value={item.value || ''}
      disabled={item.disabled}
    >
      <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
        <DropdownMenu.ItemIndicator>
          <Circle className="h-2 w-2 fill-current" />
        </DropdownMenu.ItemIndicator>
      </span>
      {item.label}
    </DropdownMenu.RadioItem>
  );
}

// Submenu Component
function SubMenu({ item }: { item: ActionMenuItem }) {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger
        className={cn(
          menuItemVariants(),
          'data-[state=open]:bg-accent data-[state=open]:text-accent-foreground'
        )}
        disabled={item.disabled}
      >
        {item.icon && <span className="mr-2 h-4 w-4">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        <ChevronRight className="ml-auto h-4 w-4" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className={cn(
            'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
            'data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
            'data-[side=bottom]:slide-in-from-top-2',
            'data-[side=left]:slide-in-from-right-2',
            'data-[side=right]:slide-in-from-left-2',
            'data-[side=top]:slide-in-from-bottom-2'
          )}
          sideOffset={2}
          alignOffset={-5}
        >
          {item.items?.map((subItem, index) => (
            <MenuItemRenderer key={index} item={subItem} />
          ))}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
}

// Item Renderer
function MenuItemRenderer({
  item,
  inset = false,
}: {
  item: ActionMenuItem;
  inset?: boolean;
}) {
  if (item.type === 'separator') {
    return <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />;
  }

  if (item.type === 'label') {
    return (
      <DropdownMenu.Label
        className={cn('px-2 py-1.5 text-sm font-semibold', inset && 'pl-8')}
      >
        {item.label}
      </DropdownMenu.Label>
    );
  }

  if (item.type === 'checkbox') {
    return <CheckboxItem item={item} />;
  }

  if (item.type === 'radio') {
    return <RadioItem item={item} />;
  }

  if (item.items && item.items.length > 0) {
    return <SubMenu item={item} />;
  }

  return <MenuItem item={item} inset={inset} />;
}

// Main Action Menu Component
export function ActionMenu({
  items,
  trigger,
  triggerIcon = 'horizontal',
  align = 'end',
  side = 'bottom',
  sideOffset = 4,
  modal = true,
  variant,
  size,
  onOpenChange,
  'aria-label': ariaLabel = 'Actions',
}: ActionMenuProps) {
  const TriggerIcon = triggerIcon === 'horizontal' ? MoreHorizontal : MoreVertical;

  return (
    <DropdownMenu.Root modal={modal} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        {trigger || (
          <button
            className={cn(triggerVariants({ variant, size }))}
            aria-label={ariaLabel}
          >
            <TriggerIcon className="h-4 w-4" />
          </button>
        )}
      </DropdownMenu.Trigger>

      <MenuContent align={align} side={side} sideOffset={sideOffset}>
        {items.map((item, index) => (
          <MenuItemRenderer key={index} item={item} />
        ))}
      </MenuContent>
    </DropdownMenu.Root>
  );
}

// Radio Group Action Menu
export function ActionMenuRadioGroup({
  value,
  onValueChange,
  items,
}: ActionMenuRadioGroupProps) {
  return (
    <DropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
      {items.map((item, index) => (
        <MenuItemRenderer key={index} item={{ ...item, type: 'radio' }} />
      ))}
    </DropdownMenu.RadioGroup>
  );
}

// Context Menu (right-click)
interface ContextMenuProps {
  items: ActionMenuItem[];
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

export function ContextMenu({
  items,
  children,
  onOpenChange,
}: ContextMenuProps) {
  return (
    <DropdownMenu.Root modal={false} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>
        {children}
      </DropdownMenu.Trigger>
      <MenuContent>
        {items.map((item, index) => (
          <MenuItemRenderer key={index} item={item} />
        ))}
      </MenuContent>
    </DropdownMenu.Root>
  );
}

// Pre-built: Row Actions Menu (common for tables)
interface RowActionsMenuProps {
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onArchive?: () => void;
  customItems?: ActionMenuItem[];
}

export function RowActionsMenu({
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onArchive,
  customItems = [],
}: RowActionsMenuProps) {
  const items: ActionMenuItem[] = [
    ...(onView ? [{ label: 'View', onSelect: onView }] : []),
    ...(onEdit ? [{ label: 'Edit', onSelect: onEdit }] : []),
    ...(onDuplicate ? [{ label: 'Duplicate', onSelect: onDuplicate }] : []),
    ...customItems,
    ...(onArchive || onDelete
      ? [
          { type: 'separator' as const },
          ...(onArchive ? [{ label: 'Archive', onSelect: onArchive }] : []),
          ...(onDelete
            ? [{ label: 'Delete', onSelect: onDelete, destructive: true }]
            : []),
        ]
      : []),
  ];

  return <ActionMenu items={items} aria-label="Row actions" />;
}

// Pre-built: Sort Menu
interface SortMenuProps {
  value: string;
  onValueChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  trigger?: React.ReactNode;
}

export function SortMenu({
  value,
  onValueChange,
  options,
  trigger,
}: SortMenuProps) {
  const items: ActionMenuItem[] = [
    { type: 'label', label: 'Sort by' },
    ...options.map((option) => ({
      type: 'radio' as const,
      label: option.label,
      value: option.value,
    })),
  ];

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        {trigger || (
          <button className={cn(triggerVariants({ variant: 'outline' }))}>
            Sort
          </button>
        )}
      </DropdownMenu.Trigger>
      <MenuContent>
        <DropdownMenu.Label className="px-2 py-1.5 text-sm font-semibold">
          Sort by
        </DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={value} onValueChange={onValueChange}>
          {options.map((option) => (
            <DropdownMenu.RadioItem
              key={option.value}
              value={option.value}
              className={cn(menuItemVariants(), 'pl-8')}
            >
              <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                <DropdownMenu.ItemIndicator>
                  <Circle className="h-2 w-2 fill-current" />
                </DropdownMenu.ItemIndicator>
              </span>
              {option.label}
            </DropdownMenu.RadioItem>
          ))}
        </DropdownMenu.RadioGroup>
      </MenuContent>
    </DropdownMenu.Root>
  );
}
```

## Variants

### Trigger Variants

```tsx
<ActionMenu variant="default" items={items} />
<ActionMenu variant="outline" items={items} />
<ActionMenu variant="ghost" items={items} />
```

### Icon Direction

```tsx
<ActionMenu triggerIcon="horizontal" items={items} /> // ...
<ActionMenu triggerIcon="vertical" items={items} />   // :
```

### Custom Trigger

```tsx
<ActionMenu
  trigger={<Button>Options</Button>}
  items={items}
/>
```

## Usage

### Basic Action Menu

```tsx
import { ActionMenu } from '@/components/molecules/action-menu';
import { Edit, Copy, Trash, Archive } from 'lucide-react';

export function ItemActions({ item }) {
  return (
    <ActionMenu
      items={[
        {
          label: 'Edit',
          icon: <Edit className="h-4 w-4" />,
          shortcut: '⌘E',
          onSelect: () => editItem(item),
        },
        {
          label: 'Duplicate',
          icon: <Copy className="h-4 w-4" />,
          shortcut: '⌘D',
          onSelect: () => duplicateItem(item),
        },
        { type: 'separator' },
        {
          label: 'Archive',
          icon: <Archive className="h-4 w-4" />,
          onSelect: () => archiveItem(item),
        },
        {
          label: 'Delete',
          icon: <Trash className="h-4 w-4" />,
          destructive: true,
          onSelect: () => deleteItem(item),
        },
      ]}
    />
  );
}
```

### With Submenus

```tsx
import { ActionMenu } from '@/components/molecules/action-menu';
import { Share, Twitter, Facebook, Mail } from 'lucide-react';

export function ShareMenu() {
  return (
    <ActionMenu
      items={[
        {
          label: 'Share',
          icon: <Share className="h-4 w-4" />,
          items: [
            {
              label: 'Twitter',
              icon: <Twitter className="h-4 w-4" />,
              onSelect: () => shareToTwitter(),
            },
            {
              label: 'Facebook',
              icon: <Facebook className="h-4 w-4" />,
              onSelect: () => shareToFacebook(),
            },
            {
              label: 'Email',
              icon: <Mail className="h-4 w-4" />,
              onSelect: () => shareViaEmail(),
            },
          ],
        },
      ]}
    />
  );
}
```

### With Checkboxes

```tsx
import { ActionMenu } from '@/components/molecules/action-menu';

export function ViewOptionsMenu({ options, onToggle }) {
  return (
    <ActionMenu
      items={[
        { type: 'label', label: 'View Options' },
        {
          type: 'checkbox',
          label: 'Show archived',
          checked: options.showArchived,
          onCheckedChange: (checked) => onToggle('showArchived', checked),
        },
        {
          type: 'checkbox',
          label: 'Compact view',
          checked: options.compactView,
          onCheckedChange: (checked) => onToggle('compactView', checked),
        },
      ]}
    />
  );
}
```

### Table Row Actions

```tsx
import { RowActionsMenu } from '@/components/molecules/action-menu';

export function DataTable({ data }) {
  return (
    <table>
      {data.map((row) => (
        <tr key={row.id}>
          <td>{row.name}</td>
          <td>
            <RowActionsMenu
              onView={() => viewRow(row)}
              onEdit={() => editRow(row)}
              onDuplicate={() => duplicateRow(row)}
              onDelete={() => deleteRow(row)}
            />
          </td>
        </tr>
      ))}
    </table>
  );
}
```

### Sort Menu

```tsx
import { SortMenu } from '@/components/molecules/action-menu';

export function ProductList() {
  const [sortBy, setSortBy] = useState('newest');

  return (
    <div>
      <SortMenu
        value={sortBy}
        onValueChange={setSortBy}
        options={[
          { value: 'newest', label: 'Newest first' },
          { value: 'oldest', label: 'Oldest first' },
          { value: 'price-asc', label: 'Price: Low to High' },
          { value: 'price-desc', label: 'Price: High to Low' },
        ]}
      />
      {/* Product list */}
    </div>
  );
}
```

## Anti-patterns

```tsx
// Don't use too many items without grouping
<ActionMenu
  items={[
    { label: 'Action 1' },
    { label: 'Action 2' },
    // ... 20 more items
  ]}
/>

// Do group related items with labels and separators
<ActionMenu
  items={[
    { type: 'label', label: 'Edit' },
    { label: 'Cut' },
    { label: 'Copy' },
    { label: 'Paste' },
    { type: 'separator' },
    { type: 'label', label: 'View' },
    { label: 'Zoom In' },
    { label: 'Zoom Out' },
  ]}
/>

// Don't forget keyboard shortcuts for common actions
<ActionMenu items={[{ label: 'Save' }]} />

// Do include shortcuts
<ActionMenu items={[{ label: 'Save', shortcut: '⌘S' }]} />
```

## Related Skills

- `molecules/toolbar` - Toolbar with actions
- `atoms/button` - Base button component
- `organisms/command-palette` - Command palette

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with Radix UI DropdownMenu
- Support for items, separators, labels
- Checkbox and radio items
- Nested submenus
- Keyboard shortcuts
- Pre-built RowActionsMenu and SortMenu
- Full keyboard navigation
