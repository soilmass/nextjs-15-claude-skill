---
id: m-mention-input
name: Mention Input
version: 2.0.0
layer: L2
category: forms
description: Text input with @mention support for tagging users or entities
tags: [mention, input, textarea, autocomplete, tagging, users]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "MentionInput = Input(a-input-text) + Avatar(a-display-avatar)"
composes:
  - ../atoms/input-text.md
  - ../atoms/display-avatar.md
dependencies:
  react: "^19.0.0"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Mention Input

## Overview

A text input component with @mention functionality for tagging users, channels, or other entities. Features autocomplete suggestions, keyboard navigation, and customizable trigger characters.

## Composition Diagram

```
+----------------------------------------------------------+
|                     MentionInput                          |
|  +----------------------------------------------------+  |
|  |                      Input                          |  |
|  | [Hey @john, can you review this PR? @jane ...    ] |  |
|  +----------------------------------------------------+  |
|                           |                              |
|                           v (triggered by @)             |
|  +----------------------------------------------------+  |
|  |              Mention Suggestions                    |  |
|  |  +----------------------------------------------+  |  |
|  |  | +--------+                                   |  |  |
|  |  | | Avatar | John Doe - Engineering            |  |  |
|  |  | +--------+                                   |  |  |
|  |  +----------------------------------------------+  |  |
|  |  | +--------+                                   |  |  |
|  |  | | Avatar | Jane Smith - Design               |  |  |
|  |  | +--------+                                   |  |  |
|  |  +----------------------------------------------+  |  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

## Implementation

```tsx
// components/ui/mention-input.tsx
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface MentionItem {
  id: string;
  label: string;
  avatar?: string;
  description?: string;
}

export interface MentionInputProps {
  /** Current value (plain text with mentions encoded) */
  value?: string;
  /** Change handler */
  onChange?: (value: string, mentions: string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Function to search for mention suggestions */
  onSearch?: (query: string) => Promise<MentionItem[]> | MentionItem[];
  /** Static list of mentionable items */
  items?: MentionItem[];
  /** Trigger character */
  trigger?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Multiline (textarea) */
  multiline?: boolean;
  /** Number of rows for multiline */
  rows?: number;
  /** Maximum length */
  maxLength?: number;
  /** Custom class */
  className?: string;
  /** Render custom mention item */
  renderItem?: (item: MentionItem, isSelected: boolean) => React.ReactNode;
}

interface MentionState {
  isOpen: boolean;
  query: string;
  startIndex: number;
  selectedIndex: number;
}

export function MentionInput({
  value = '',
  onChange,
  placeholder,
  onSearch,
  items = [],
  trigger = '@',
  disabled = false,
  multiline = false,
  rows = 3,
  maxLength,
  className,
  renderItem,
}: MentionInputProps) {
  const inputRef = React.useRef<HTMLTextAreaElement | HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = React.useState<MentionItem[]>([]);
  const [mentionState, setMentionState] = React.useState<MentionState>({
    isOpen: false,
    query: '',
    startIndex: 0,
    selectedIndex: 0,
  });
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0 });

  // Extract mentions from value
  const extractMentions = (text: string): string[] => {
    const regex = new RegExp(`${trigger}\\[(.*?)\\]\\((.*?)\\)`, 'g');
    const mentions: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      mentions.push(match[2]); // ID
    }
    return mentions;
  };

  // Get display text (with mentions rendered as @name)
  const getDisplayText = (text: string): string => {
    return text.replace(
      new RegExp(`${trigger}\\[(.*?)\\]\\((.*?)\\)`, 'g'),
      `${trigger}$1`
    );
  };

  // Search for suggestions
  React.useEffect(() => {
    if (!mentionState.isOpen) return;

    const searchSuggestions = async () => {
      let results: MentionItem[];
      
      if (onSearch) {
        results = await onSearch(mentionState.query);
      } else {
        const query = mentionState.query.toLowerCase();
        results = items.filter(
          (item) =>
            item.label.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        );
      }
      
      setSuggestions(results.slice(0, 10));
    };

    const debounce = setTimeout(searchSuggestions, 150);
    return () => clearTimeout(debounce);
  }, [mentionState.isOpen, mentionState.query, items, onSearch]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart || 0;
    
    // Check if we should open mention suggestions
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const triggerMatch = textBeforeCursor.match(new RegExp(`${trigger}(\\w*)$`));
    
    if (triggerMatch) {
      const query = triggerMatch[1];
      const startIndex = cursorPosition - query.length - 1;
      
      // Calculate dropdown position
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.height + 4,
          left: 0,
        });
      }
      
      setMentionState({
        isOpen: true,
        query,
        startIndex,
        selectedIndex: 0,
      });
    } else {
      setMentionState((prev) => ({ ...prev, isOpen: false }));
    }
    
    onChange?.(newValue, extractMentions(newValue));
  };

  const insertMention = (item: MentionItem) => {
    if (!inputRef.current) return;
    
    const cursorPosition = inputRef.current.selectionStart || 0;
    const beforeMention = value.slice(0, mentionState.startIndex);
    const afterCursor = value.slice(cursorPosition);
    
    // Encode mention as @[label](id)
    const mention = `${trigger}[${item.label}](${item.id}) `;
    const newValue = beforeMention + mention + afterCursor;
    
    onChange?.(newValue, extractMentions(newValue));
    setMentionState({ ...mentionState, isOpen: false });
    
    // Move cursor after mention
    setTimeout(() => {
      const newPosition = beforeMention.length + mention.length;
      inputRef.current?.setSelectionRange(newPosition, newPosition);
      inputRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!mentionState.isOpen) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setMentionState((prev) => ({
          ...prev,
          selectedIndex: Math.min(prev.selectedIndex + 1, suggestions.length - 1),
        }));
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setMentionState((prev) => ({
          ...prev,
          selectedIndex: Math.max(prev.selectedIndex - 1, 0),
        }));
        break;
        
      case 'Enter':
      case 'Tab':
        if (suggestions[mentionState.selectedIndex]) {
          e.preventDefault();
          insertMention(suggestions[mentionState.selectedIndex]);
        }
        break;
        
      case 'Escape':
        setMentionState((prev) => ({ ...prev, isOpen: false }));
        break;
    }
  };

  const defaultRenderItem = (item: MentionItem, isSelected: boolean) => (
    <div
      className={cn(
        'flex items-center gap-2 rounded-sm px-2 py-1.5 cursor-pointer',
        isSelected && 'bg-accent'
      )}
    >
      <Avatar className="h-6 w-6">
        <AvatarImage src={item.avatar} />
        <AvatarFallback className="text-xs">
          {item.label[0].toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{item.label}</p>
        {item.description && (
          <p className="text-xs text-muted-foreground truncate">
            {item.description}
          </p>
        )}
      </div>
    </div>
  );

  const InputComponent = multiline ? 'textarea' : 'input';

  return (
    <div className={cn('relative', className)}>
      <InputComponent
        ref={inputRef as any}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={multiline ? rows : undefined}
        className={cn(
          'flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          multiline && 'resize-none'
        )}
      />

      {/* Suggestions dropdown */}
      {mentionState.isOpen && suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-64 rounded-md border bg-popover p-1 shadow-md"
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left,
          }}
        >
          {suggestions.map((item, index) => (
            <div
              key={item.id}
              onClick={() => insertMention(item)}
              onMouseEnter={() =>
                setMentionState((prev) => ({ ...prev, selectedIndex: index }))
              }
            >
              {renderItem
                ? renderItem(item, index === mentionState.selectedIndex)
                : defaultRenderItem(item, index === mentionState.selectedIndex)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Usage

```tsx
import { MentionInput, MentionItem } from '@/components/ui/mention-input';

// Basic with static items
function BasicMention() {
  const [value, setValue] = React.useState('');
  const [mentions, setMentions] = React.useState<string[]>([]);
  
  const users: MentionItem[] = [
    { id: '1', label: 'John Doe', avatar: '/avatars/john.jpg', description: 'Engineering' },
    { id: '2', label: 'Jane Smith', avatar: '/avatars/jane.jpg', description: 'Design' },
    { id: '3', label: 'Bob Wilson', avatar: '/avatars/bob.jpg', description: 'Product' },
  ];
  
  return (
    <MentionInput
      value={value}
      onChange={(val, mentioned) => {
        setValue(val);
        setMentions(mentioned);
      }}
      items={users}
      placeholder="Type @ to mention someone..."
    />
  );
}

// With async search
function AsyncMention() {
  const [value, setValue] = React.useState('');
  
  const searchUsers = async (query: string) => {
    const response = await fetch(`/api/users/search?q=${query}`);
    return response.json();
  };
  
  return (
    <MentionInput
      value={value}
      onChange={(val) => setValue(val)}
      onSearch={searchUsers}
      placeholder="Type @ to mention someone..."
      multiline
      rows={4}
    />
  );
}

// Multiple triggers
function MultiTrigger() {
  // Implement with # for channels
  const [value, setValue] = React.useState('');
  
  return (
    <div className="space-y-2">
      <MentionInput
        value={value}
        onChange={(val) => setValue(val)}
        trigger="@"
        items={users}
        placeholder="@ for users, # for channels"
      />
    </div>
  );
}
```

## Parsing Mentions

```tsx
// lib/utils/mentions.ts

interface ParsedMention {
  id: string;
  label: string;
  start: number;
  end: number;
}

export function parseMentions(text: string, trigger = '@'): ParsedMention[] {
  const regex = new RegExp(`${trigger}\\[(.*?)\\]\\((.*?)\\)`, 'g');
  const mentions: ParsedMention[] = [];
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    mentions.push({
      label: match[1],
      id: match[2],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  
  return mentions;
}

export function mentionsToPlainText(text: string, trigger = '@'): string {
  return text.replace(
    new RegExp(`${trigger}\\[(.*?)\\]\\((.*?)\\)`, 'g'),
    `${trigger}$1`
  );
}

export function mentionsToHTML(text: string, trigger = '@'): string {
  return text.replace(
    new RegExp(`${trigger}\\[(.*?)\\]\\((.*?)\\)`, 'g'),
    `<span class="mention" data-id="$2">${trigger}$1</span>`
  );
}
```

## Related Skills

- [tag-input](./tag-input.md) - Tag input with chips
- [combobox](./combobox.md) - Searchable select
- [rich-text-editor](../patterns/rich-text-editor.md) - Full editor with mentions

---

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation
- Async search support
- Keyboard navigation
- Customizable rendering
