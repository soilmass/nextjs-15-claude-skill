---
id: pt-mentions-autocomplete
name: Mentions Autocomplete
version: 1.0.0
layer: L5
category: interaction
description: Implement @mentions autocomplete for user tagging in text inputs
tags: [mentions, autocomplete, tagging, users, textarea, next15, react19]
composes: []
dependencies: []
formula: "MentionsAutocomplete = TriggerDetection + SearchAPI + PopoverPositioning + InsertionLogic"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Mentions Autocomplete

## When to Use

- When building comment systems with user tagging
- For team collaboration features
- When implementing social features
- For task assignment with @mentions
- When building chat applications

## Overview

This pattern implements @mentions autocomplete that detects trigger characters, searches for users, and inserts formatted mentions into text inputs.

## Mention Input Component

```typescript
// components/mentions/mention-input.tsx
"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string, mentions: string[]) => void;
  placeholder?: string;
  onSubmit?: () => void;
}

interface MentionState {
  isActive: boolean;
  query: string;
  startPosition: number;
  triggerPosition: { top: number; left: number };
}

export function MentionInput({
  value,
  onChange,
  placeholder,
  onSubmit,
}: MentionInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mention, setMention] = useState<MentionState>({
    isActive: false,
    query: "",
    startPosition: 0,
    triggerPosition: { top: 0, left: 0 },
  });
  const [users, setUsers] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(mention.query, 200);

  // Search for users
  useEffect(() => {
    if (!mention.isActive || !debouncedQuery) {
      setUsers([]);
      return;
    }

    setLoading(true);
    fetch(`/api/users/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        setSelectedIndex(0);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery, mention.isActive]);

  // Detect @ trigger
  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPosition = e.target.selectionStart;

    // Find the last @ before cursor
    const textBeforeCursor = newValue.slice(0, cursorPosition);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);

      // Check if we're in a valid mention context
      // (no spaces after @ and @ is at start or preceded by whitespace)
      const charBeforeAt = lastAtIndex > 0 ? newValue[lastAtIndex - 1] : " ";
      const hasNoSpaces = !textAfterAt.includes(" ");
      const isValidStart = /\s/.test(charBeforeAt) || lastAtIndex === 0;

      if (hasNoSpaces && isValidStart) {
        const rect = getCaretCoordinates(e.target, lastAtIndex);

        setMention({
          isActive: true,
          query: textAfterAt,
          startPosition: lastAtIndex,
          triggerPosition: rect,
        });
      } else {
        setMention((m) => ({ ...m, isActive: false }));
      }
    } else {
      setMention((m) => ({ ...m, isActive: false }));
    }

    // Extract mentions from value
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newValue)) !== null) {
      mentions.push(match[2]); // User ID
    }

    onChange(newValue, mentions);
  }, [onChange]);

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!mention.isActive || users.length === 0) {
      if (e.key === "Enter" && !e.shiftKey && onSubmit) {
        e.preventDefault();
        onSubmit();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % users.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + users.length) % users.length);
        break;
      case "Enter":
      case "Tab":
        e.preventDefault();
        insertMention(users[selectedIndex]);
        break;
      case "Escape":
        setMention((m) => ({ ...m, isActive: false }));
        break;
    }
  };

  // Insert selected mention
  const insertMention = useCallback((user: User) => {
    if (!textareaRef.current) return;

    const beforeMention = value.slice(0, mention.startPosition);
    const afterMention = value.slice(
      mention.startPosition + mention.query.length + 1
    );

    // Format: @[Display Name](userId)
    const mentionText = `@[${user.name}](${user.id}) `;
    const newValue = beforeMention + mentionText + afterMention;

    // Extract all mentions
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newValue)) !== null) {
      mentions.push(match[2]);
    }

    onChange(newValue, mentions);
    setMention({ isActive: false, query: "", startPosition: 0, triggerPosition: { top: 0, left: 0 } });

    // Set cursor position after mention
    const newPosition = beforeMention.length + mentionText.length;
    setTimeout(() => {
      textareaRef.current?.setSelectionRange(newPosition, newPosition);
      textareaRef.current?.focus();
    }, 0);
  }, [value, mention, onChange]);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[100px]"
      />

      <Popover open={mention.isActive && (users.length > 0 || loading)}>
        <PopoverAnchor asChild>
          <div
            className="absolute"
            style={{
              top: mention.triggerPosition.top + 24,
              left: mention.triggerPosition.left,
            }}
          />
        </PopoverAnchor>
        <PopoverContent className="p-0 w-64" align="start" sideOffset={0}>
          <Command>
            <CommandList>
              {loading ? (
                <div className="p-2 text-sm text-muted-foreground">
                  Searching...
                </div>
              ) : users.length === 0 ? (
                <CommandEmpty>No users found</CommandEmpty>
              ) : (
                <CommandGroup>
                  {users.map((user, index) => (
                    <CommandItem
                      key={user.id}
                      value={user.username}
                      onSelect={() => insertMention(user)}
                      className={index === selectedIndex ? "bg-accent" : ""}
                    >
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

// Get caret position in textarea
function getCaretCoordinates(
  element: HTMLTextAreaElement,
  position: number
): { top: number; left: number } {
  const div = document.createElement("div");
  const style = getComputedStyle(element);

  // Copy styles
  for (const prop of style) {
    div.style.setProperty(prop, style.getPropertyValue(prop));
  }

  div.style.position = "absolute";
  div.style.visibility = "hidden";
  div.style.whiteSpace = "pre-wrap";

  const text = element.value.substring(0, position);
  div.textContent = text;

  const span = document.createElement("span");
  span.textContent = element.value.substring(position) || ".";
  div.appendChild(span);

  document.body.appendChild(div);

  const rect = span.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();

  document.body.removeChild(div);

  return {
    top: rect.top - elementRect.top + element.scrollTop,
    left: rect.left - elementRect.left,
  };
}
```

## User Search API

```typescript
// app/api/users/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q") || "";

  if (query.length < 1) {
    return NextResponse.json({ users: [] });
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
      id: { not: session.user.id }, // Exclude self
    },
    select: {
      id: true,
      username: true,
      name: true,
      image: true,
    },
    take: 10,
  });

  return NextResponse.json({
    users: users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatar: u.image,
    })),
  });
}
```

## Mention Display Component

```typescript
// components/mentions/mention-display.tsx
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface User {
  id: string;
  username: string;
  name: string;
  avatar?: string;
}

interface MentionDisplayProps {
  content: string;
  users: Record<string, User>;
}

export function MentionDisplay({ content, users }: MentionDisplayProps) {
  // Parse mentions and replace with components
  const parts = content.split(/(@\[([^\]]+)\]\(([^)]+)\))/g);

  return (
    <span>
      {parts.map((part, index) => {
        // Check if this is a mention pattern
        const mentionMatch = part.match(/@\[([^\]]+)\]\(([^)]+)\)/);

        if (mentionMatch) {
          const [, displayName, userId] = mentionMatch;
          const user = users[userId];

          if (!user) {
            return (
              <span key={index} className="text-primary font-medium">
                @{displayName}
              </span>
            );
          }

          return (
            <HoverCard key={index}>
              <HoverCardTrigger asChild>
                <Link
                  href={`/users/${user.username}`}
                  className="text-primary font-medium hover:underline"
                >
                  @{user.name}
                </Link>
              </HoverCardTrigger>
              <HoverCardContent className="w-64">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        }

        // Skip empty parts from regex groups
        if (index % 4 !== 0) return null;

        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
```

## Processing Mentions Server-Side

```typescript
// lib/mentions/process.ts
import { prisma } from "@/lib/db";

export function extractMentions(content: string): string[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push(match[2]); // User ID
  }

  return [...new Set(mentions)]; // Remove duplicates
}

export async function notifyMentionedUsers(
  content: string,
  authorId: string,
  resourceType: string,
  resourceId: string
) {
  const mentionedUserIds = extractMentions(content);

  if (mentionedUserIds.length === 0) return;

  // Create notifications for mentioned users
  await prisma.notification.createMany({
    data: mentionedUserIds
      .filter((id) => id !== authorId) // Don't notify self
      .map((userId) => ({
        userId,
        type: "MENTION",
        title: "You were mentioned",
        resourceType,
        resourceId,
        fromUserId: authorId,
      })),
  });
}

export function renderMentionsAsText(content: string): string {
  // Convert @[Name](id) to @Name for plain text
  return content.replace(/@\[([^\]]+)\]\([^)]+\)/g, "@$1");
}

export function renderMentionsAsHtml(content: string): string {
  // Convert @[Name](id) to linked HTML
  return content.replace(
    /@\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="/users/$2" class="mention">@$1</a>'
  );
}
```

## Comment Form with Mentions

```typescript
// components/comments/comment-form.tsx
"use client";

import { useState } from "react";
import { MentionInput } from "@/components/mentions/mention-input";
import { Button } from "@/components/ui/button";
import { createCommentAction } from "@/app/actions/comments";

interface CommentFormProps {
  postId: string;
  onCommentAdded?: () => void;
}

export function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [mentions, setMentions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (newContent: string, newMentions: string[]) => {
    setContent(newContent);
    setMentions(newMentions);
  };

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createCommentAction({
        postId,
        content,
        mentions,
      });

      setContent("");
      setMentions([]);
      onCommentAdded?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <MentionInput
        value={content}
        onChange={handleChange}
        placeholder="Write a comment... Use @ to mention someone"
        onSubmit={handleSubmit}
      />

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Block Input While Searching

```typescript
// BAD - Blocking input
const handleInput = async (e) => {
  const users = await searchUsers(query); // Blocks typing
  setUsers(users);
};

// GOOD - Debounce and async
const debouncedQuery = useDebounce(query, 200);
useEffect(() => {
  searchUsers(debouncedQuery).then(setUsers);
}, [debouncedQuery]);
```

## Related Patterns

- [search](./search.md)
- [autosave](./autosave.md)
- [rich-text-editor](./rich-text-editor.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Trigger detection
- User search
- Keyboard navigation
- Mention rendering
