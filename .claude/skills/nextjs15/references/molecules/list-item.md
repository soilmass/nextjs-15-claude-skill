---
id: m-list-item
name: List Item
version: 2.0.0
layer: L2
category: content
description: Versatile list item with icon, content, and actions
tags: [list, item, row, entry, interactive]
formula: "ListItem = Icon(a-display-icon) + PrimaryText(a-display-text) + SecondaryText(a-display-text) + Action(a-input-button)"
composes:
  - ../atoms/display-icon.md
  - ../atoms/display-text.md
  - ../atoms/input-button.md
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# List Item

## Overview

The List Item molecule provides a flexible row component for lists with support for icons, primary/secondary text, metadata, and actions. Suitable for navigation menus, settings lists, and data displays.

## When to Use

Use this skill when:
- Building navigation or settings lists
- Displaying list-based data (messages, notifications)
- Creating selectable item lists
- Building menu or sidebar items

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          ListItem                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌───────────────────────────────────┐  ┌────────┐  │
│  │Leading │  │           Content                 │  │Trailing│  │
│  │ Icon   │  │  ┌─────────────────────────────┐  │  │ Action │  │
│  │(a-disp │  │  │ Primary Text (a-display)    │  │  │(a-input│  │
│  │ -icon) │  │  │ "Settings"                  │  │  │  -btn) │  │
│  │        │  │  └─────────────────────────────┘  │  │        │  │
│  │  ⚙️    │  │  ┌─────────────────────────────┐  │  │   ▶    │  │
│  │        │  │  │ Secondary Text (a-display)  │  │  │        │  │
│  │        │  │  │ "Configure your preferences"│  │  │        │  │
│  │        │  │  └─────────────────────────────┘  │  │        │  │
│  └────────┘  └───────────────────────────────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘

With Avatar:
┌─────────────────────────────────────────────────────────────────┐
│  [👤]  │  John Doe                                   │  [⋯]    │
│        │  john@example.com                           │          │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [display-icon](../atoms/display-icon.md) - Leading/trailing icons
- [display-text](../atoms/display-text.md) - Primary and secondary text
- [display-avatar](../atoms/display-avatar.md) - User avatars
- [input-button](../atoms/input-button.md) - Action buttons

## Implementation

```typescript
// components/ui/list-item.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Leading element (icon, avatar, checkbox) */
  leading?: React.ReactNode;
  /** Primary text */
  primary: React.ReactNode;
  /** Secondary text */
  secondary?: React.ReactNode;
  /** Trailing element (action, badge, icon) */
  trailing?: React.ReactNode;
  /** Make the item interactive */
  interactive?: boolean;
  /** Selected state */
  selected?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Dense padding */
  dense?: boolean;
  /** As link */
  href?: string;
  /** Click handler */
  onClick?: () => void;
}

export function ListItem({
  leading,
  primary,
  secondary,
  trailing,
  interactive = false,
  selected = false,
  disabled = false,
  dense = false,
  href,
  onClick,
  className,
  children,
  ...props
}: ListItemProps) {
  const isClickable = interactive || !!onClick || !!href;

  const content = (
    <>
      {leading && (
        <div className="shrink-0 text-muted-foreground">{leading}</div>
      )}
      <div className="flex-1 min-w-0">
        <div className={cn(
          "text-sm font-medium text-foreground",
          disabled && "text-muted-foreground"
        )}>
          {primary}
        </div>
        {secondary && (
          <div className="text-sm text-muted-foreground truncate">
            {secondary}
          </div>
        )}
        {children}
      </div>
      {trailing && (
        <div className="shrink-0 text-muted-foreground">{trailing}</div>
      )}
    </>
  );

  const baseStyles = cn(
    "flex items-center gap-3",
    dense ? "px-3 py-2" : "px-4 py-3",
    isClickable && !disabled && [
      "cursor-pointer",
      "hover:bg-accent",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
    ],
    selected && "bg-accent",
    disabled && "opacity-50 cursor-not-allowed",
    className
  );

  if (href && !disabled) {
    return (
      <a href={href} className={baseStyles} {...props}>
        {content}
      </a>
    );
  }

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable && !disabled ? 0 : undefined}
      onClick={!disabled ? onClick : undefined}
      onKeyDown={
        isClickable && !disabled
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      aria-disabled={disabled}
      aria-selected={selected}
      className={baseStyles}
      {...props}
    >
      {content}
    </div>
  );
}
```

```typescript
// components/ui/list.tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface ListProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Add dividers between items */
  divided?: boolean;
  /** Render as ul/ol */
  as?: "div" | "ul" | "ol";
}

export function List({
  divided = false,
  as: Component = "div",
  className,
  children,
  ...props
}: ListProps) {
  return (
    <Component
      role={Component === "div" ? "list" : undefined}
      className={cn(
        divided && "[&>*+*]:border-t",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
```

```typescript
// components/ui/list-item-skeleton.tsx
import { Skeleton } from "./skeleton";
import { cn } from "@/lib/utils";

interface ListItemSkeletonProps {
  hasLeading?: boolean;
  hasSecondary?: boolean;
  hasTrailing?: boolean;
  dense?: boolean;
}

export function ListItemSkeleton({
  hasLeading = true,
  hasSecondary = true,
  hasTrailing = false,
  dense = false,
}: ListItemSkeletonProps) {
  return (
    <div className={cn(
      "flex items-center gap-3",
      dense ? "px-3 py-2" : "px-4 py-3"
    )}>
      {hasLeading && (
        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      )}
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-[60%]" />
        {hasSecondary && <Skeleton className="h-3 w-[40%]" />}
      </div>
      {hasTrailing && (
        <Skeleton className="h-4 w-16 shrink-0" />
      )}
    </div>
  );
}
```

### Key Implementation Notes

1. **Flexible Slots**: Leading, primary, secondary, and trailing slots for composition
2. **Keyboard Support**: Clickable items have proper focus and keyboard handling

## Variants

### Basic

```tsx
<ListItem primary="List item" />
```

### With Secondary Text

```tsx
<ListItem
  primary="John Doe"
  secondary="john@example.com"
/>
```

### With Icon

```tsx
<ListItem
  leading={<User className="h-5 w-5" />}
  primary="Profile"
  secondary="Manage your account"
/>
```

### With Avatar

```tsx
<ListItem
  leading={
    <Avatar>
      <AvatarImage src="/avatar.jpg" />
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  }
  primary="John Doe"
  secondary="Sent you a message"
  trailing={<span className="text-xs">2m ago</span>}
/>
```

### Interactive

```tsx
<ListItem
  interactive
  leading={<Settings className="h-5 w-5" />}
  primary="Settings"
  trailing={<ChevronRight className="h-4 w-4" />}
  onClick={() => navigate("/settings")}
/>
```

### Selected

```tsx
<ListItem
  interactive
  selected={isSelected}
  primary="Selected item"
  onClick={() => setSelected(true)}
/>
```

### Dense

```tsx
<ListItem
  dense
  leading={<File className="h-4 w-4" />}
  primary="document.pdf"
/>
```

### With Actions

```tsx
<ListItem
  primary="File.pdf"
  secondary="2.4 MB"
  trailing={
    <div className="flex gap-2">
      <Button size="icon" variant="ghost">
        <Download className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="ghost">
        <Trash className="h-4 w-4" />
      </Button>
    </div>
  }
/>
```

## States

| State | Background | Text | Cursor | Opacity |
|-------|------------|------|--------|---------|
| Default | transparent | foreground | default | 1 |
| Hover | accent | foreground | pointer | 1 |
| Focus | transparent | foreground | - | 1 |
| Selected | accent | foreground | pointer | 1 |
| Disabled | transparent | muted | not-allowed | 0.5 |

## Accessibility

### Required ARIA Attributes

- `role="button"` for interactive items
- `aria-selected` for selectable items
- `aria-disabled` for disabled items
- `tabindex="0"` for keyboard focus

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus between items |
| `Enter/Space` | Activate item |
| `Arrow Down/Up` | Move between items (in list context) |

### Screen Reader Announcements

- Primary text announced as label
- Secondary text as description
- Selected/disabled state announced

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install lucide-react
```

## Examples

### Navigation Menu

```tsx
import { List, ListItem } from "@/components/ui/list";
import { Home, Settings, User, LogOut } from "lucide-react";

export function NavigationMenu() {
  const pathname = usePathname();

  return (
    <List divided>
      <ListItem
        interactive
        leading={<Home className="h-5 w-5" />}
        primary="Home"
        selected={pathname === "/"}
        href="/"
      />
      <ListItem
        interactive
        leading={<User className="h-5 w-5" />}
        primary="Profile"
        selected={pathname === "/profile"}
        href="/profile"
      />
      <ListItem
        interactive
        leading={<Settings className="h-5 w-5" />}
        primary="Settings"
        selected={pathname === "/settings"}
        href="/settings"
      />
      <ListItem
        interactive
        leading={<LogOut className="h-5 w-5" />}
        primary="Log out"
        onClick={handleLogout}
      />
    </List>
  );
}
```

### Message List

```tsx
import { List, ListItem, ListItemSkeleton } from "@/components/ui/list";

export function MessageList({ messages, loading }) {
  if (loading) {
    return (
      <List>
        {Array.from({ length: 5 }).map((_, i) => (
          <ListItemSkeleton key={i} />
        ))}
      </List>
    );
  }

  return (
    <List divided>
      {messages.map((message) => (
        <ListItem
          key={message.id}
          interactive
          leading={
            <Avatar>
              <AvatarImage src={message.sender.avatar} />
              <AvatarFallback>{message.sender.initials}</AvatarFallback>
            </Avatar>
          }
          primary={message.sender.name}
          secondary={message.preview}
          trailing={
            <div className="text-right">
              <span className="text-xs text-muted-foreground">
                {formatTime(message.timestamp)}
              </span>
              {message.unread && (
                <Badge variant="default" className="ml-2">New</Badge>
              )}
            </div>
          }
          onClick={() => openMessage(message.id)}
        />
      ))}
    </List>
  );
}
```

### Settings List

```tsx
import { List, ListItem } from "@/components/ui/list";
import { Switch } from "@/components/ui/switch";

export function SettingsList({ settings, onToggle }) {
  return (
    <List divided>
      {settings.map((setting) => (
        <ListItem
          key={setting.id}
          leading={setting.icon}
          primary={setting.label}
          secondary={setting.description}
          trailing={
            <Switch
              checked={setting.enabled}
              onCheckedChange={(checked) => onToggle(setting.id, checked)}
            />
          }
        />
      ))}
    </List>
  );
}
```

## Anti-patterns

### Missing Keyboard Support

```tsx
// Bad - not keyboard accessible
<div onClick={handleClick}>
  <span>Item</span>
</div>

// Good - keyboard accessible
<ListItem
  interactive
  primary="Item"
  onClick={handleClick}
/>
```

### Inconsistent Density

```tsx
// Bad - mixing dense and non-dense
<List>
  <ListItem dense primary="Item 1" />
  <ListItem primary="Item 2" /> {/* Not dense */}
</List>

// Good - consistent density
<List>
  <ListItem dense primary="Item 1" />
  <ListItem dense primary="Item 2" />
</List>
```

### Action Buttons in Interactive Items

```tsx
// Bad - nested interactive elements
<ListItem interactive onClick={handleItemClick}>
  <Button onClick={handleButtonClick}>Action</Button>
</ListItem>

// Good - non-interactive item with action
<ListItem
  primary="Item"
  trailing={<Button onClick={handleAction}>Action</Button>}
/>
```

## Related Skills

### Composes From
- [atoms/display-avatar](../atoms/display-avatar.md) - User avatars
- [atoms/display-icon](../atoms/display-icon.md) - Icons
- [atoms/display-text](../atoms/display-text.md) - Text content

### Composes Into
- [organisms/sidebar](../organisms/sidebar.md) - Navigation lists
- [organisms/data-table](../organisms/data-table.md) - Table alternatives

### Alternatives
- [molecules/card](./card.md) - For standalone items
- Table row - For tabular data

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Interactive and selected states
- List wrapper component
- ListItemSkeleton for loading
