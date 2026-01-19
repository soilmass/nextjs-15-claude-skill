---
id: m-empty-state
name: Empty State
version: 2.0.0
layer: L2
category: state
description: Placeholder for empty content with icon, message, and action
tags: [empty, placeholder, no-data, zero-state, illustration]
formula: "EmptyState = DisplayIcon(a-display-icon) + DisplayText(a-display-text) + InputButton(a-input-button)"
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

# Empty State

## Overview

The Empty State molecule provides user-friendly placeholders when there's no content to display. Features an icon or illustration, descriptive message, and optional action button to guide users on next steps.

## When to Use

Use this skill when:
- Lists or tables have no items
- Search returns no results
- User hasn't created any content yet
- Features are disabled or unavailable

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        EmptyState                                │
├─────────────────────────────────────────────────────────────────┤
│                    ┌─────────────────┐                          │
│                    │      Icon       │                          │
│                    │  (a-display-    │                          │
│                    │     icon)       │                          │
│                    │                 │                          │
│                    │       📭        │                          │
│                    └─────────────────┘                          │
│                    ┌─────────────────┐                          │
│                    │     Title       │                          │
│                    │  (a-display-    │                          │
│                    │     text)       │                          │
│                    │                 │                          │
│                    │  "No messages"  │                          │
│                    └─────────────────┘                          │
│                    ┌─────────────────┐                          │
│                    │   Description   │                          │
│                    │  (a-display-    │                          │
│                    │     text)       │                          │
│                    │                 │                          │
│                    │ "Your inbox is  │                          │
│                    │    empty"       │                          │
│                    └─────────────────┘                          │
│                    ┌─────────────────┐                          │
│                    │  Action Button  │                          │
│                    │  (a-input-      │                          │
│                    │     button)     │                          │
│                    │                 │                          │
│                    │ [Compose Email] │                          │
│                    └─────────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [display-icon](../atoms/display-icon.md) - State icon
- [display-text](../atoms/display-text.md) - Title and description
- [input-button](../atoms/input-button.md) - Action button

## Implementation

```typescript
// components/ui/empty-state.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface EmptyStateProps {
  /** Icon or illustration */
  icon?: React.ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  /** Size variant */
  size?: "sm" | "md" | "lg";
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = "md",
  className,
  children,
}: EmptyStateProps) {
  const sizeStyles = {
    sm: {
      container: "py-6 px-4",
      icon: "h-8 w-8",
      title: "text-sm",
      description: "text-xs",
    },
    md: {
      container: "py-12 px-6",
      icon: "h-12 w-12",
      title: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "py-16 px-8",
      icon: "h-16 w-16",
      title: "text-xl",
      description: "text-base",
    },
  };

  const styles = sizeStyles[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        styles.container,
        className
      )}
      role="status"
      aria-label={title}
    >
      {icon && (
        <div className={cn("text-muted-foreground mb-4", styles.icon)}>
          {icon}
        </div>
      )}

      <h3 className={cn("font-semibold text-foreground", styles.title)}>
        {title}
      </h3>

      {description && (
        <p
          className={cn(
            "text-muted-foreground mt-2 max-w-sm",
            styles.description
          )}
        >
          {description}
        </p>
      )}

      {children && <div className="mt-4">{children}</div>}

      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {action && (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
```

```typescript
// components/ui/empty-state-variants.tsx
import * as React from "react";
import {
  Search,
  FileText,
  Users,
  Inbox,
  ShoppingCart,
  FolderOpen,
  Image,
  MessageSquare,
  Bell,
  Bookmark,
} from "lucide-react";
import { EmptyState } from "./empty-state";

// Pre-configured empty states for common scenarios

export function NoSearchResults({
  query,
  onClear,
}: {
  query?: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      icon={<Search className="h-12 w-12" />}
      title="No results found"
      description={
        query
          ? `No results found for "${query}". Try adjusting your search.`
          : "Try adjusting your search or filters."
      }
      action={onClear ? { label: "Clear search", onClick: onClear } : undefined}
    />
  );
}

export function NoDocuments({
  onCreate,
}: {
  onCreate?: () => void;
}) {
  return (
    <EmptyState
      icon={<FileText className="h-12 w-12" />}
      title="No documents yet"
      description="Create your first document to get started."
      action={onCreate ? { label: "Create document", onClick: onCreate } : undefined}
    />
  );
}

export function NoUsers({
  onInvite,
}: {
  onInvite?: () => void;
}) {
  return (
    <EmptyState
      icon={<Users className="h-12 w-12" />}
      title="No team members"
      description="Invite team members to collaborate."
      action={onInvite ? { label: "Invite members", onClick: onInvite } : undefined}
    />
  );
}

export function EmptyInbox() {
  return (
    <EmptyState
      icon={<Inbox className="h-12 w-12" />}
      title="Inbox zero!"
      description="You're all caught up. No new messages."
    />
  );
}

export function EmptyCart({
  onBrowse,
}: {
  onBrowse?: () => void;
}) {
  return (
    <EmptyState
      icon={<ShoppingCart className="h-12 w-12" />}
      title="Your cart is empty"
      description="Looks like you haven't added anything to your cart yet."
      action={onBrowse ? { label: "Browse products", onClick: onBrowse } : undefined}
    />
  );
}

export function NoFiles({
  onUpload,
}: {
  onUpload?: () => void;
}) {
  return (
    <EmptyState
      icon={<FolderOpen className="h-12 w-12" />}
      title="No files uploaded"
      description="Upload files to get started."
      action={onUpload ? { label: "Upload files", onClick: onUpload } : undefined}
    />
  );
}

export function NoImages({
  onUpload,
}: {
  onUpload?: () => void;
}) {
  return (
    <EmptyState
      icon={<Image className="h-12 w-12" />}
      title="No images"
      description="Upload images to your gallery."
      action={onUpload ? { label: "Upload image", onClick: onUpload } : undefined}
    />
  );
}

export function NoComments() {
  return (
    <EmptyState
      icon={<MessageSquare className="h-12 w-12" />}
      title="No comments yet"
      description="Be the first to leave a comment."
    />
  );
}

export function NoNotifications() {
  return (
    <EmptyState
      icon={<Bell className="h-12 w-12" />}
      title="No notifications"
      description="You're all caught up!"
      size="sm"
    />
  );
}

export function NoBookmarks({
  onBrowse,
}: {
  onBrowse?: () => void;
}) {
  return (
    <EmptyState
      icon={<Bookmark className="h-12 w-12" />}
      title="No bookmarks"
      description="Save items to find them easily later."
      action={onBrowse ? { label: "Browse items", onClick: onBrowse } : undefined}
    />
  );
}
```

### Key Implementation Notes

1. **Contextual Messages**: Tailor messages to explain why there's no content and what users can do
2. **Clear Actions**: Always provide a next step when appropriate

## Variants

### Basic

```tsx
<EmptyState
  title="No items"
  description="There are no items to display."
/>
```

### With Icon

```tsx
<EmptyState
  icon={<Inbox className="h-12 w-12" />}
  title="No messages"
  description="Your inbox is empty."
/>
```

### With Action

```tsx
<EmptyState
  icon={<Plus className="h-12 w-12" />}
  title="No projects"
  description="Create your first project to get started."
  action={{
    label: "Create project",
    onClick: () => openCreateModal(),
  }}
/>
```

### With Two Actions

```tsx
<EmptyState
  icon={<Upload className="h-12 w-12" />}
  title="No files"
  description="Upload files to get started."
  action={{
    label: "Upload files",
    onClick: handleUpload,
  }}
  secondaryAction={{
    label: "Learn more",
    onClick: openDocs,
  }}
/>
```

### Size Variants

```tsx
<EmptyState size="sm" title="No items" />
<EmptyState size="md" title="No items" />
<EmptyState size="lg" title="No items" />
```

### With Custom Content

```tsx
<EmptyState
  icon={<Filter className="h-12 w-12" />}
  title="No matching results"
>
  <div className="flex gap-2 mt-4">
    <Badge>Category: Electronics</Badge>
    <Badge>Price: $100-$500</Badge>
  </div>
  <Button variant="link" onClick={clearFilters}>
    Clear all filters
  </Button>
</EmptyState>
```

## States

| Context | Icon | Title | Description | Action |
|---------|------|-------|-------------|--------|
| No data | relevant icon | what's missing | why + what to do | create action |
| No search results | search icon | "No results" | search term | clear search |
| First time | relevant icon | welcoming | getting started | create action |
| Error | error icon | error message | what went wrong | retry action |
| Success (zero) | success icon | "All done" | congratulations | - |

## Accessibility

### Required ARIA Attributes

- `role="status"` - Indicates dynamic content area
- `aria-label` - Provides context for the empty state

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus action button |
| `Enter/Space` | Activate action |

### Screen Reader Announcements

- Title announced as heading
- Description read after title
- Action buttons announced

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

### Data Table Empty State

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { Table } from "lucide-react";

export function DataTable({ data, onCreate }) {
  if (data.length === 0) {
    return (
      <div className="border rounded-lg">
        <EmptyState
          icon={<Table className="h-12 w-12" />}
          title="No data available"
          description="Add your first entry to see it here."
          action={{
            label: "Add entry",
            onClick: onCreate,
          }}
        />
      </div>
    );
  }

  return <table>...</table>;
}
```

### Search Results

```tsx
import { NoSearchResults } from "@/components/ui/empty-state-variants";

export function SearchResults({ query, results, onClear }) {
  if (results.length === 0) {
    return <NoSearchResults query={query} onClear={onClear} />;
  }

  return (
    <ul>
      {results.map((result) => (
        <li key={result.id}>{result.title}</li>
      ))}
    </ul>
  );
}
```

### Dashboard Widget

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { Activity } from "lucide-react";

export function ActivityWidget({ activities }) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            size="sm"
            icon={<Activity className="h-8 w-8" />}
            title="No recent activity"
            description="Activity will appear here as it happens."
          />
        </CardContent>
      </Card>
    );
  }

  return <ActivityList activities={activities} />;
}
```

### Filter Results

```tsx
import { EmptyState } from "@/components/ui/empty-state";
import { SlidersHorizontal } from "lucide-react";

export function FilteredList({ items, filters, onClearFilters }) {
  const filteredItems = applyFilters(items, filters);
  const hasActiveFilters = Object.values(filters).some(Boolean);

  if (filteredItems.length === 0 && hasActiveFilters) {
    return (
      <EmptyState
        icon={<SlidersHorizontal className="h-12 w-12" />}
        title="No matching items"
        description="Try adjusting or clearing your filters."
        action={{
          label: "Clear filters",
          onClick: onClearFilters,
        }}
      />
    );
  }

  if (filteredItems.length === 0) {
    return (
      <EmptyState
        icon={<Package className="h-12 w-12" />}
        title="No items yet"
        description="Add items to see them here."
      />
    );
  }

  return <ItemList items={filteredItems} />;
}
```

## Anti-patterns

### Generic Messages

```tsx
// Bad - not helpful
<EmptyState
  title="Nothing here"
  description="There's nothing to show."
/>

// Good - specific and actionable
<EmptyState
  title="No projects yet"
  description="Create a project to start organizing your work."
  action={{ label: "Create project", onClick: handleCreate }}
/>
```

### Missing Action

```tsx
// Bad - user doesn't know what to do
<EmptyState
  title="No team members"
  description="You haven't added any team members."
/>

// Good - clear next step
<EmptyState
  title="No team members"
  description="Invite team members to collaborate."
  action={{ label: "Invite members", onClick: handleInvite }}
/>
```

### Wrong Tone

```tsx
// Bad - negative tone
<EmptyState
  title="Error: No data"
  description="Failed to load data."
/>

// Good - friendly and helpful
<EmptyState
  title="No data to display"
  description="Add some data to see it here."
/>
```

## Related Skills

### Composes From
- [atoms/display-icon](../atoms/display-icon.md) - State icons
- [atoms/display-text](../atoms/display-text.md) - Messages
- [atoms/input-button](../atoms/input-button.md) - Actions

### Composes Into
- [organisms/data-table](../organisms/data-table.md) - Table empty state
- [templates/dashboard](../templates/dashboard.md) - Widget empty states

### Alternatives
- [display-skeleton](../atoms/display-skeleton.md) - For loading states
- [feedback-alert](../atoms/feedback-alert.md) - For error states

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Size variants (sm, md, lg)
- Pre-configured variants for common scenarios
- Primary and secondary actions
