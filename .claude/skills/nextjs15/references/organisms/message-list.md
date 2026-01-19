---
id: o-message-list
name: Message List
version: 1.0.0
layer: L3
category: communication
description: List of chat or email messages with avatars, timestamps, and actions
tags: [messages, chat, email, inbox, conversation, threads]
formula: "MessageList = ListItem(m-list-item)[] + Avatar(a-avatar) + Badge(a-badge) + Checkbox(a-checkbox) + ActionMenu(m-action-menu)"
composes:
  - ../molecules/list-item.md
  - ../molecules/action-menu.md
  - ../atoms/display-avatar.md
  - ../atoms/display-badge.md
  - ../atoms/input-checkbox.md
dependencies: ["date-fns", "lucide-react"]
performance:
  impact: medium
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Message List

## Overview

The Message List organism displays a list of messages (chat, email, or notifications) with sender information, previews, timestamps, and selection capabilities. Supports threading, read/unread states, and bulk actions.

## When to Use

Use this skill when:
- Building email or messaging interfaces
- Creating notification lists
- Displaying conversation threads
- Implementing inbox-style views

## Composition Diagram

```
+---------------------------------------------------------------------+
|                       MessageList (L3)                               |
+---------------------------------------------------------------------+
|  +---------------------------------------------------------------+  |
|  |  Toolbar: [Select All] [Archive] [Delete] [Mark Read]         |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | MessageItem (unread)                                          |  |
|  | [x] +--------+ John Doe                           2m ago      |  |
|  |     | Avatar | Meeting Tomorrow           [Star] [More]      |  |
|  |     +--------+ Hey, are we still on for the meeting...       |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | MessageItem (read)                                            |  |
|  | [ ] +--------+ Jane Smith                         1h ago      |  |
|  |     | Avatar | Project Update                                 |  |
|  |     +--------+ The latest changes have been deployed...      |  |
|  +---------------------------------------------------------------+  |
|                                                                     |
|  +---------------------------------------------------------------+  |
|  | MessageItem (with attachment)                                 |  |
|  | [ ] +--------+ Team                              Yesterday    |  |
|  |     | Avatar | Weekly Report                  [Attachment]    |  |
|  |     +--------+ Please find attached the weekly report...     |  |
|  +---------------------------------------------------------------+  |
+---------------------------------------------------------------------+
```

## Implementation

```tsx
// components/organisms/message-list.tsx
'use client';

import * as React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Star,
  MoreHorizontal,
  Archive,
  Trash2,
  Mail,
  MailOpen,
  Paperclip,
  Reply,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: {
    name: string;
    email: string;
    avatar?: string;
  };
  subject: string;
  preview: string;
  body?: string;
  timestamp: Date;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  threadCount?: number;
}

interface MessageListProps {
  messages: Message[];
  selectedIds?: string[];
  onSelect?: (ids: string[]) => void;
  onMessageClick?: (message: Message) => void;
  onStar?: (id: string, starred: boolean) => void;
  onArchive?: (ids: string[]) => void;
  onDelete?: (ids: string[]) => void;
  onMarkRead?: (ids: string[], read: boolean) => void;
  className?: string;
}

function MessageItem({
  message,
  isSelected,
  onSelect,
  onClick,
  onStar,
}: {
  message: Message;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
  onClick: () => void;
  onStar: (starred: boolean) => void;
}) {
  const [showActions, setShowActions] = React.useState(false);
  const initials = message.sender.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 border-b cursor-pointer',
        'hover:bg-accent/50 transition-colors',
        !message.isRead && 'bg-primary/5',
        isSelected && 'bg-accent'
      )}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => {
          e.stopPropagation();
          onSelect(e.target.checked);
        }}
        className="mt-1 h-4 w-4 rounded border-gray-300"
      />

      <div
        className="h-10 w-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0"
      >
        {message.sender.avatar ? (
          <img
            src={message.sender.avatar}
            alt={message.sender.name}
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          <span className="text-sm font-medium">{initials}</span>
        )}
      </div>

      <div className="flex-1 min-w-0" onClick={onClick}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                'text-sm truncate',
                !message.isRead && 'font-semibold'
              )}
            >
              {message.sender.name}
            </span>
            {message.threadCount && message.threadCount > 1 && (
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {message.threadCount}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {message.hasAttachment && (
              <Paperclip className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 mt-0.5">
          <h4
            className={cn(
              'text-sm truncate',
              !message.isRead && 'font-medium'
            )}
          >
            {message.subject}
          </h4>
        </div>

        <p className="text-sm text-muted-foreground truncate mt-0.5">
          {message.preview}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0">
        {showActions ? (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStar(!message.isStarred);
              }}
              className="p-1.5 hover:bg-accent rounded"
            >
              <Star
                className={cn(
                  'h-4 w-4',
                  message.isStarred ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
                )}
              />
            </button>
            <button className="p-1.5 hover:bg-accent rounded">
              <Archive className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="p-1.5 hover:bg-accent rounded">
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </>
        ) : (
          message.isStarred && (
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          )
        )}
      </div>
    </div>
  );
}

function MessageToolbar({
  selectedCount,
  allSelected,
  onSelectAll,
  onArchive,
  onDelete,
  onMarkRead,
}: {
  selectedCount: number;
  allSelected: boolean;
  onSelectAll: (selected: boolean) => void;
  onArchive: () => void;
  onDelete: () => void;
  onMarkRead: (read: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-3 border-b bg-muted/30">
      <input
        type="checkbox"
        checked={allSelected}
        onChange={(e) => onSelectAll(e.target.checked)}
        className="h-4 w-4 rounded border-gray-300"
      />

      {selectedCount > 0 && (
        <>
          <span className="text-sm text-muted-foreground">
            {selectedCount} selected
          </span>

          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={onArchive}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Archive"
            >
              <Archive className="h-4 w-4" />
            </button>
            <button
              onClick={() => onMarkRead(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Mark as read"
            >
              <MailOpen className="h-4 w-4" />
            </button>
            <button
              onClick={() => onMarkRead(false)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Mark as unread"
            >
              <Mail className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-destructive"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function MessageList({
  messages,
  selectedIds = [],
  onSelect,
  onMessageClick,
  onStar,
  onArchive,
  onDelete,
  onMarkRead,
  className,
}: MessageListProps) {
  const allSelected = selectedIds.length === messages.length && messages.length > 0;

  const handleSelectAll = (selected: boolean) => {
    onSelect?.(selected ? messages.map((m) => m.id) : []);
  };

  const handleSelect = (id: string, selected: boolean) => {
    if (selected) {
      onSelect?.([...selectedIds, id]);
    } else {
      onSelect?.(selectedIds.filter((i) => i !== id));
    }
  };

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      <MessageToolbar
        selectedCount={selectedIds.length}
        allSelected={allSelected}
        onSelectAll={handleSelectAll}
        onArchive={() => onArchive?.(selectedIds)}
        onDelete={() => onDelete?.(selectedIds)}
        onMarkRead={(read) => onMarkRead?.(selectedIds, read)}
      />

      <div className="divide-y">
        {messages.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No messages</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isSelected={selectedIds.includes(message.id)}
              onSelect={(selected) => handleSelect(message.id, selected)}
              onClick={() => onMessageClick?.(message)}
              onStar={(starred) => onStar?.(message.id, starred)}
            />
          ))
        )}
      </div>
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { MessageList } from '@/components/organisms/message-list';

export function Inbox() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  return (
    <MessageList
      messages={messages}
      selectedIds={selectedIds}
      onSelect={setSelectedIds}
      onMessageClick={(message) => openMessage(message)}
      onStar={(id, starred) => updateStar(id, starred)}
      onDelete={(ids) => deleteMessages(ids)}
    />
  );
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Message list displays with normal styling | Standard list appearance with borders |
| Empty | No messages in the list | Mail icon with "No messages" text centered |
| Unread | Message has not been read | Light primary background tint, bold sender name and subject |
| Read | Message has been read | Normal background, regular font weight |
| Selected | Message checkbox is checked | Accent background color applied |
| Hover | Mouse over message item | Accent/50 background, action buttons visible (star, archive, delete) |
| Starred | Message is marked as starred | Yellow filled star icon visible |
| Has Attachment | Message contains file attachment | Paperclip icon displayed next to timestamp |
| Threaded | Message is part of a thread | Thread count badge shown next to sender name |
| Bulk Selected | Multiple messages selected via toolbar | Selection count shown in toolbar, bulk action buttons enabled |

## Anti-patterns

### Bad: Not managing selection state properly

```tsx
// Bad - Using index-based selection
const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

function handleSelect(index: number) {
  setSelectedIndexes(prev =>
    prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
  );
}
// Problem: Indexes change when messages are deleted or reordered!

// Good - Using ID-based selection
const [selectedIds, setSelectedIds] = useState<string[]>([]);

function handleSelect(id: string, selected: boolean) {
  setSelectedIds(prev =>
    selected ? [...prev, id] : prev.filter(i => i !== id)
  );
}
```

### Bad: Not clearing selection after bulk actions

```tsx
// Bad - Selection persists after deletion
async function handleBulkDelete() {
  await deleteMessages(selectedIds);
  refetchMessages();
  // Selected IDs still reference deleted messages!
}

// Good - Clear selection after action completes
async function handleBulkDelete() {
  await deleteMessages(selectedIds);
  setSelectedIds([]); // Clear selection
  refetchMessages();
  toast.success(`Deleted ${selectedIds.length} messages`);
}
```

### Bad: Missing optimistic updates for read/unread state

```tsx
// Bad - Waiting for server before updating UI
async function handleMarkRead(id: string) {
  await api.markAsRead(id);
  refetchMessages(); // Slow, causes flicker
}

// Good - Optimistic update with rollback
async function handleMarkRead(id: string) {
  const previous = messages;
  setMessages(prev =>
    prev.map(m => m.id === id ? { ...m, isRead: true } : m)
  );
  try {
    await api.markAsRead(id);
  } catch {
    setMessages(previous);
    toast.error('Failed to mark as read');
  }
}
```

### Bad: Not providing accessible checkbox labels

```tsx
// Bad - Checkbox without proper labeling
<input
  type="checkbox"
  checked={isSelected}
  onChange={handleSelect}
/>

// Good - Checkbox with accessible label
<input
  type="checkbox"
  id={`select-${message.id}`}
  checked={isSelected}
  onChange={handleSelect}
  aria-label={`Select message from ${message.sender.name}: ${message.subject}`}
/>
```

## Accessibility

- Checkbox controls are keyboard accessible
- Message items are focusable and clickable
- Actions announced to screen readers

## Dependencies

```json
{
  "dependencies": {
    "date-fns": "^3.0.0",
    "lucide-react": "^0.460.0"
  }
}
```

## Related Skills

- [organisms/activity-feed](./activity-feed.md)
- [molecules/list-item](../molecules/list-item.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Selection and bulk actions
- Read/unread states
- Star and attachment indicators
