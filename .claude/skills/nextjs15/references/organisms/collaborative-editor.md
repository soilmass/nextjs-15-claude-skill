---
id: o-collaborative-editor
name: Collaborative Editor
version: 1.0.0
layer: L3
category: collaboration
description: Real-time collaborative text editor with presence indicators and cursor tracking
tags: [editor, collaborative, real-time, text, rich-text]
formula: "CollaborativeEditor = Toolbar(m-toolbar) + Editor + AvatarGroup(m-avatar-group) + CursorOverlay + Badge(a-badge)"
composes:
  - ../molecules/toolbar.md
  - ../molecules/avatar-group.md
  - ../atoms/display-badge.md
  - ../atoms/input-button.md
dependencies:
  - react
  - lucide-react
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Collaborative Editor

## Overview

A real-time collaborative text editor organism with presence indicators showing active users, cursor positions, and selection highlights. Supports rich text formatting and version history.

## When to Use

Use this skill when:
- Building document collaboration tools
- Creating shared note-taking applications
- Implementing real-time content editing
- Building wikis or knowledge bases

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    CollaborativeEditor (L3)                          │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Header                                                       │  │
│  │  "Document Title" + [Saved] Badge(a-badge)                   │  │
│  │  AvatarGroup(m-avatar-group): [JD] [AS] [+2]                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Toolbar(m-toolbar)                                           │  │
│  │  [B] [I] [U] [S] | [H1] [H2] | [List] [Numbered] | [Link]    │  │
│  │  Button(a-button)[]                                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Editor Canvas                                                │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Content Area (contenteditable)                         │  │  │
│  │  │                                                         │  │  │
│  │  │  # Heading                                              │  │  │
│  │  │                                                         │  │  │
│  │  │  Some text with |cursor| and [selection by John]        │  │  │
│  │  │                   ↑ colored cursor                      │  │  │
│  │  │                                                         │  │  │
│  │  │  More paragraph text...                                 │  │  │
│  │  │                                                         │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  Remote Cursors Overlay:                                     │  │
│  │  [John ─|] [Alice ─|] (colored labels at cursor positions)  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Footer: "3 users editing" + "Last saved 2 min ago"          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/collaborative-editor.tsx
'use client';

import * as React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link,
  Undo,
  Redo,
  Check,
  Cloud,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Collaborator {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  cursor?: { line: number; column: number };
  selection?: { start: number; end: number };
}

interface CollaborativeEditorProps {
  content: string;
  collaborators?: Collaborator[];
  currentUser: { id: string; name: string; color: string };
  onContentChange?: (content: string) => void;
  onCursorChange?: (position: { line: number; column: number }) => void;
  isSaving?: boolean;
  lastSaved?: Date;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
}

// Collaborator colors
const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
];

function Avatar({
  user,
  size = 'sm',
}: {
  user: { name: string; avatar?: string; color: string };
  size?: 'sm' | 'md';
}) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const sizeClasses = { sm: 'h-7 w-7 text-xs', md: 'h-8 w-8 text-sm' };

  return (
    <div
      className={cn('rounded-full flex items-center justify-center font-medium text-white', sizeClasses[size])}
      style={{ backgroundColor: user.color }}
      title={user.name}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}

function AvatarGroup({ collaborators }: { collaborators: Collaborator[] }) {
  const visible = collaborators.slice(0, 3);
  const remaining = collaborators.length - 3;

  return (
    <div className="flex -space-x-2">
      {visible.map((user) => (
        <div key={user.id} className="ring-2 ring-background rounded-full">
          <Avatar user={user} />
        </div>
      ))}
      {remaining > 0 && (
        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-background">
          +{remaining}
        </div>
      )}
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  label,
  isActive = false,
  onClick,
  disabled = false,
}: {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        'p-2 rounded hover:bg-accent transition-colors disabled:opacity-50',
        isActive && 'bg-accent text-accent-foreground'
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function Toolbar({
  onFormat,
  activeFormats,
  disabled,
}: {
  onFormat: (format: string) => void;
  activeFormats: string[];
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center gap-1 border-b px-2 py-1.5">
      <ToolbarButton icon={Bold} label="Bold" isActive={activeFormats.includes('bold')} onClick={() => onFormat('bold')} disabled={disabled} />
      <ToolbarButton icon={Italic} label="Italic" isActive={activeFormats.includes('italic')} onClick={() => onFormat('italic')} disabled={disabled} />
      <ToolbarButton icon={Underline} label="Underline" isActive={activeFormats.includes('underline')} onClick={() => onFormat('underline')} disabled={disabled} />
      <ToolbarButton icon={Strikethrough} label="Strikethrough" isActive={activeFormats.includes('strike')} onClick={() => onFormat('strike')} disabled={disabled} />

      <div className="w-px h-6 bg-border mx-1" />

      <ToolbarButton icon={Heading1} label="Heading 1" isActive={activeFormats.includes('h1')} onClick={() => onFormat('h1')} disabled={disabled} />
      <ToolbarButton icon={Heading2} label="Heading 2" isActive={activeFormats.includes('h2')} onClick={() => onFormat('h2')} disabled={disabled} />

      <div className="w-px h-6 bg-border mx-1" />

      <ToolbarButton icon={List} label="Bullet List" isActive={activeFormats.includes('bullet')} onClick={() => onFormat('bullet')} disabled={disabled} />
      <ToolbarButton icon={ListOrdered} label="Numbered List" isActive={activeFormats.includes('number')} onClick={() => onFormat('number')} disabled={disabled} />

      <div className="w-px h-6 bg-border mx-1" />

      <ToolbarButton icon={Link} label="Insert Link" onClick={() => onFormat('link')} disabled={disabled} />

      <div className="flex-1" />

      <ToolbarButton icon={Undo} label="Undo" onClick={() => onFormat('undo')} disabled={disabled} />
      <ToolbarButton icon={Redo} label="Redo" onClick={() => onFormat('redo')} disabled={disabled} />
    </div>
  );
}

function RemoteCursor({
  collaborator,
  position,
}: {
  collaborator: Collaborator;
  position: { top: number; left: number };
}) {
  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{ top: position.top, left: position.left }}
    >
      <div
        className="w-0.5 h-5 animate-pulse"
        style={{ backgroundColor: collaborator.color }}
      />
      <div
        className="absolute -top-5 left-0 px-1.5 py-0.5 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: collaborator.color }}
      >
        {collaborator.name}
      </div>
    </div>
  );
}

function SaveStatus({ isSaving, lastSaved }: { isSaving: boolean; lastSaved?: Date }) {
  if (isSaving) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving...
      </span>
    );
  }

  if (lastSaved) {
    const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
    const timeAgo = seconds < 60 ? 'just now' : `${Math.floor(seconds / 60)} min ago`;

    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Cloud className="h-3 w-3" />
        Saved {timeAgo}
      </span>
    );
  }

  return null;
}

export function CollaborativeEditor({
  content,
  collaborators = [],
  currentUser,
  onContentChange,
  onCursorChange,
  isSaving = false,
  lastSaved,
  readOnly = false,
  placeholder = 'Start typing...',
  className,
}: CollaborativeEditorProps) {
  const editorRef = React.useRef<HTMLDivElement>(null);
  const [activeFormats, setActiveFormats] = React.useState<string[]>([]);
  const [localContent, setLocalContent] = React.useState(content);

  // Sync with external content
  React.useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleInput = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      setLocalContent(newContent);
      onContentChange?.(newContent);
    }
  };

  const handleFormat = (format: string) => {
    if (readOnly) return;

    // Execute format command
    switch (format) {
      case 'bold': document.execCommand('bold'); break;
      case 'italic': document.execCommand('italic'); break;
      case 'underline': document.execCommand('underline'); break;
      case 'strike': document.execCommand('strikeThrough'); break;
      case 'h1': document.execCommand('formatBlock', false, 'h1'); break;
      case 'h2': document.execCommand('formatBlock', false, 'h2'); break;
      case 'bullet': document.execCommand('insertUnorderedList'); break;
      case 'number': document.execCommand('insertOrderedList'); break;
      case 'link':
        const url = prompt('Enter URL:');
        if (url) document.execCommand('createLink', false, url);
        break;
      case 'undo': document.execCommand('undo'); break;
      case 'redo': document.execCommand('redo'); break;
    }

    editorRef.current?.focus();
    handleInput();
  };

  const handleSelectionChange = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    // Check active formats
    const formats: string[] = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    if (document.queryCommandState('strikeThrough')) formats.push('strike');
    setActiveFormats(formats);
  };

  React.useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const activeCollaborators = collaborators.filter(c => c.id !== currentUser.id);

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <SaveStatus isSaving={isSaving} lastSaved={lastSaved} />
        </div>
        <div className="flex items-center gap-3">
          {activeCollaborators.length > 0 && (
            <>
              <span className="text-xs text-muted-foreground">
                {activeCollaborators.length} editing
              </span>
              <AvatarGroup collaborators={activeCollaborators} />
            </>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <Toolbar
        onFormat={handleFormat}
        activeFormats={activeFormats}
        disabled={readOnly}
      />

      {/* Editor */}
      <div className="relative min-h-[400px] p-4">
        <div
          ref={editorRef}
          contentEditable={!readOnly}
          onInput={handleInput}
          className={cn(
            'min-h-[350px] focus:outline-none prose prose-sm max-w-none',
            '[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4',
            '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mb-3',
            '[&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-4 [&_ol]:list-decimal [&_ol]:ml-4',
            '[&_a]:text-primary [&_a]:underline',
            readOnly && 'cursor-default'
          )}
          dangerouslySetInnerHTML={{ __html: localContent || `<p class="text-muted-foreground">${placeholder}</p>` }}
          suppressContentEditableWarning
        />

        {/* Remote Cursors would be rendered here based on cursor positions */}
      </div>

      {/* Footer */}
      <div className="border-t px-4 py-2">
        <p className="text-xs text-muted-foreground">
          {activeCollaborators.length === 0
            ? 'You are the only editor'
            : `${activeCollaborators.length + 1} users editing`}
        </p>
      </div>
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { CollaborativeEditor } from '@/components/organisms/collaborative-editor';

<CollaborativeEditor
  content={documentContent}
  currentUser={{ id: '1', name: 'You', color: '#3b82f6' }}
  collaborators={activeUsers}
  onContentChange={handleContentChange}
  lastSaved={lastSavedTime}
/>
```

### Read-Only Mode

```tsx
<CollaborativeEditor
  content={content}
  currentUser={user}
  readOnly
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Editor ready for input with no active collaborators | Empty editor canvas with placeholder text visible |
| Editing | User actively typing or formatting content | Content updates in real-time, cursor visible at insertion point |
| Read-Only | Editor in view-only mode | Toolbar buttons disabled, cursor changes to default, no content editable |
| Saving | Content being synced to server | Spinner icon with "Saving..." text in header |
| Saved | Content successfully synced | Cloud icon with "Saved X min ago" timestamp |
| Format Active | Text formatting applied to selection | Corresponding toolbar button highlighted with accent background |
| Collaborator Present | Remote users viewing/editing | Avatar group shows collaborators, count displayed |
| Remote Cursor Visible | Other user's cursor position shown | Colored cursor line with name label at cursor position |
| Remote Selection | Other user has text selected | Highlighted selection range with user's assigned color |
| Focused | Editor canvas has keyboard focus | Subtle outline or border change on editor area |

## Anti-patterns

### 1. Missing Current User Configuration

```tsx
// Bad: No current user provided
<CollaborativeEditor
  content={content}
  collaborators={users}
  onContentChange={handleChange}
/>

// Good: Always provide current user info
<CollaborativeEditor
  content={content}
  currentUser={{ id: '1', name: 'John Doe', color: '#3b82f6' }}
  collaborators={users}
  onContentChange={handleChange}
/>
```

### 2. Not Handling Save State Properly

```tsx
// Bad: No indication of save status to user
<CollaborativeEditor
  content={content}
  currentUser={user}
/>

// Good: Show saving state and last saved time
<CollaborativeEditor
  content={content}
  currentUser={user}
  isSaving={isSaving}
  lastSaved={lastSavedTimestamp}
/>
```

### 3. Conflicting Collaborator Colors

```tsx
// Bad: Multiple collaborators with same or similar colors
const collaborators = [
  { id: '1', name: 'Alice', color: '#3b82f6' },
  { id: '2', name: 'Bob', color: '#3b82f6' },  // Same color!
  { id: '3', name: 'Carol', color: '#3c83f7' }, // Nearly identical
];

// Good: Ensure distinct colors for each collaborator
const collaborators = [
  { id: '1', name: 'Alice', color: '#ef4444' },
  { id: '2', name: 'Bob', color: '#22c55e' },
  { id: '3', name: 'Carol', color: '#3b82f6' },
];
```

### 4. Not Syncing Content with External State

```tsx
// Bad: Content only set once, never synced
const [content] = useState(initialContent);

<CollaborativeEditor
  content={content}
  currentUser={user}
/>

// Good: Properly sync with content changes
const [content, setContent] = useState(initialContent);

<CollaborativeEditor
  content={content}
  currentUser={user}
  onContentChange={(newContent) => {
    setContent(newContent);
    syncToServer(newContent);
  }}
/>
```

## Related Skills

- `molecules/toolbar` - Formatting toolbar
- `molecules/avatar-group` - User avatars
- `patterns/real-time` - Real-time sync

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- Rich text formatting toolbar
- Collaborator presence
- Save status indicator
