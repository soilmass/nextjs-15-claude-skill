---
id: o-chat-input
name: Chat Input
version: 1.0.0
layer: L3
category: communication
description: Chat message input with file attachments, emoji picker, and send functionality
tags: [chat, input, message, attachments, communication]
formula: "ChatInput = Textarea(a-textarea) + Button(a-button) + FileInput(a-file) + EmojiPicker + AttachmentPreview"
composes:
  - ../atoms/input-textarea.md
  - ../atoms/input-button.md
  - ../atoms/input-file.md
  - ../atoms/display-icon.md
dependencies:
  - react
  - lucide-react
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Chat Input

## Overview

A feature-rich chat input component supporting multi-line messages, file attachments, emoji insertion, and keyboard shortcuts. Optimized for real-time messaging applications.

## When to Use

Use this skill when:
- Building chat or messaging interfaces
- Creating comment input sections
- Implementing support ticket systems
- Adding feedback input forms

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChatInput (L3)                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Attachments Preview (if any)                             │  │
│  │  ┌─────────┐ ┌─────────┐                                  │  │
│  │  │ File.pdf│ │Image.png│  [x] remove                      │  │
│  │  │  12KB   │ │ preview │                                  │  │
│  │  └─────────┘ └─────────┘                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Input Area                                               │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Textarea(a-textarea)                               │  │  │
│  │  │  "Type a message..."                                │  │  │
│  │  │  (auto-resize, max 5 lines)                         │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Actions Bar                                              │  │
│  │  ┌─────┐ ┌─────┐ ┌─────┐           ┌─────────────────┐   │  │
│  │  │ 📎  │ │ 😀  │ │ @   │           │  Send Button    │   │  │
│  │  │Attach│ │Emoji│ │Mntn │           │  Button(a-btn)  │   │  │
│  │  └─────┘ └─────┘ └─────┘           └─────────────────┘   │  │
│  │  FileInput(a-file)                  [Ctrl+Enter]         │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/chat-input.tsx
'use client';

import * as React from 'react';
import {
  Paperclip,
  Smile,
  Send,
  X,
  File,
  Image as ImageIcon,
  Loader2,
  AtSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Attachment {
  id: string;
  file: File;
  preview?: string;
  progress?: number;
}

interface ChatInputProps {
  onSend: (message: string, attachments: File[]) => void;
  onTyping?: () => void;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  maxAttachments?: number;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  showMentions?: boolean;
  onMentionTrigger?: () => void;
  className?: string;
}

const EMOJI_LIST = ['😀', '😂', '❤️', '👍', '🎉', '🔥', '💯', '🙏', '😊', '🤔'];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function AttachmentPreview({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove: () => void;
}) {
  const isImage = attachment.file.type.startsWith('image/');

  return (
    <div className="relative group flex items-center gap-2 rounded-lg border bg-muted/50 p-2">
      {isImage && attachment.preview ? (
        <img
          src={attachment.preview}
          alt={attachment.file.name}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
          <File className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{attachment.file.name}</p>
        <p className="text-xs text-muted-foreground">
          {formatFileSize(attachment.file.size)}
        </p>
      </div>
      <button
        onClick={onRemove}
        className="p-1 rounded-full hover:bg-accent opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove attachment"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function EmojiPicker({
  onSelect,
  onClose,
}: {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute bottom-full left-0 z-50 mb-2 rounded-lg border bg-popover p-2 shadow-lg">
        <div className="grid grid-cols-5 gap-1">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              onClick={() => { onSelect(emoji); onClose(); }}
              className="p-2 text-lg hover:bg-accent rounded transition-colors"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function ChatInput({
  onSend,
  onTyping,
  placeholder = 'Type a message...',
  disabled = false,
  isLoading = false,
  maxAttachments = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedFileTypes = ['image/*', 'application/pdf', '.doc', '.docx'],
  showMentions = false,
  onMentionTrigger,
  className,
}: ChatInputProps) {
  const [message, setMessage] = React.useState('');
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [showEmoji, setShowEmoji] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > maxFileSize) {
        alert(`File ${file.name} is too large. Max size is ${formatFileSize(maxFileSize)}`);
        return false;
      }
      return true;
    });

    const newAttachments = validFiles.slice(0, maxAttachments - attachments.length).map((file) => {
      const attachment: Attachment = { id: Math.random().toString(), file };
      if (file.type.startsWith('image/')) {
        attachment.preview = URL.createObjectURL(file);
      }
      return attachment;
    });

    setAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => {
      const attachment = prev.find((a) => a.id === id);
      if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
      return prev.filter((a) => a.id !== id);
    });
  };

  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || isLoading) return;

    onSend(message.trim(), attachments.map((a) => a.file));
    setMessage('');
    attachments.forEach((a) => { if (a.preview) URL.revokeObjectURL(a.preview); });
    setAttachments([]);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newMessage = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newMessage);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
        textarea.focus();
      }, 0);
    }
  };

  const canSend = (message.trim() || attachments.length > 0) && !disabled && !isLoading;

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 border-b">
          {attachments.map((attachment) => (
            <AttachmentPreview
              key={attachment.id}
              attachment={attachment}
              onRemove={() => removeAttachment(attachment.id)}
            />
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => { setMessage(e.target.value); onTyping?.(); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          rows={1}
          className={cn(
            'w-full resize-none bg-transparent text-sm placeholder:text-muted-foreground',
            'focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
          )}
        />
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between border-t px-3 py-2">
        <div className="flex items-center gap-1">
          {/* Attach File */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedFileTypes.join(',')}
            onChange={handleFileChange}
            className="hidden"
            disabled={attachments.length >= maxAttachments}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={attachments.length >= maxAttachments || disabled}
            className="p-2 rounded hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Emoji Picker */}
          <div className="relative">
            <button
              onClick={() => setShowEmoji(!showEmoji)}
              disabled={disabled}
              className="p-2 rounded hover:bg-accent disabled:opacity-50"
              aria-label="Add emoji"
            >
              <Smile className="h-5 w-5 text-muted-foreground" />
            </button>
            {showEmoji && (
              <EmojiPicker
                onSelect={insertEmoji}
                onClose={() => setShowEmoji(false)}
              />
            )}
          </div>

          {/* Mention */}
          {showMentions && (
            <button
              onClick={onMentionTrigger}
              disabled={disabled}
              className="p-2 rounded hover:bg-accent disabled:opacity-50"
              aria-label="Mention someone"
            >
              <AtSign className="h-5 w-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Send Button */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground hidden sm:block">
            Ctrl + Enter
          </span>
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
              'bg-primary text-primary-foreground hover:bg-primary/90',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { ChatInput } from '@/components/organisms/chat-input';

<ChatInput
  onSend={(message, attachments) => {
    sendMessage({ content: message, files: attachments });
  }}
  placeholder="Type your message..."
/>
```

### With Typing Indicator

```tsx
<ChatInput
  onSend={handleSend}
  onTyping={() => socket.emit('typing', { roomId })}
/>
```

### Restricted File Types

```tsx
<ChatInput
  onSend={handleSend}
  maxAttachments={3}
  maxFileSize={5 * 1024 * 1024} // 5MB
  allowedFileTypes={['image/*']}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Input ready for text entry | Empty textarea with placeholder, action buttons visible |
| Typing | User entering text | Textarea expands as content grows, placeholder hidden |
| Disabled | Input interaction blocked | Reduced opacity, cursor not-allowed, all buttons disabled |
| Sending | Message being transmitted | Send button shows spinner, input disabled temporarily |
| Has Attachments | Files attached to message | Attachment preview section visible above input |
| Attachment Uploading | File being processed | Attachment shows progress indicator |
| Emoji Picker Open | Emoji selection active | Emoji grid popover visible below emoji button |
| Max Attachments | Attachment limit reached | Paperclip button disabled |
| File Too Large | Attached file exceeds limit | Error alert shown, file not added |
| Invalid File Type | Unsupported file attached | Error alert shown, file rejected |
| Can Send | Message ready to send | Send button enabled (has text or attachments) |
| Cannot Send | Nothing to send | Send button disabled (empty text and no attachments) |

## Anti-patterns

### Bad: Not cleaning up object URLs for attachment previews

```tsx
// Bad - memory leak from unreleased object URLs
const handleFileChange = (files) => {
  const previews = files.map(file => ({
    file,
    preview: URL.createObjectURL(file), // Never cleaned up!
  }));
  setAttachments(previews);
};

// Good - revoke URLs on removal and unmount
const removeAttachment = (id) => {
  setAttachments(prev => {
    const attachment = prev.find(a => a.id === id);
    if (attachment?.preview) {
      URL.revokeObjectURL(attachment.preview);
    }
    return prev.filter(a => a.id !== id);
  });
};

// Also cleanup on component unmount
useEffect(() => {
  return () => {
    attachments.forEach(a => {
      if (a.preview) URL.revokeObjectURL(a.preview);
    });
  };
}, []);
```

### Bad: Not validating files before adding

```tsx
// Bad - accepting any file
const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  setAttachments(prev => [...prev, ...files]); // No validation!
};

// Good - validate size, type, and count
const handleFileChange = (e) => {
  const files = Array.from(e.target.files);
  const validFiles = files.filter(file => {
    if (file.size > maxFileSize) {
      toast.error(`${file.name} exceeds ${formatFileSize(maxFileSize)} limit`);
      return false;
    }
    if (!allowedFileTypes.some(type => file.type.match(type))) {
      toast.error(`${file.name} is not a supported file type`);
      return false;
    }
    return true;
  });

  const remaining = maxAttachments - attachments.length;
  setAttachments(prev => [...prev, ...validFiles.slice(0, remaining)]);
};
```

### Bad: Sending messages without trimming whitespace

```tsx
// Bad - sending whitespace-only messages
const handleSend = () => {
  if (message) { // "   " is truthy!
    onSend(message, attachments);
  }
};

// Good - trim and validate
const handleSend = () => {
  const trimmedMessage = message.trim();
  if (!trimmedMessage && attachments.length === 0) return;

  onSend(trimmedMessage, attachments.map(a => a.file));
  setMessage('');
  setAttachments([]);
};
```

### Bad: Not debouncing typing indicator

```tsx
// Bad - firing typing event on every keystroke
<textarea
  onChange={(e) => {
    setMessage(e.target.value);
    onTyping(); // Called on EVERY character
  }}
/>

// Good - debounce typing indicator
const debouncedTyping = useDebouncedCallback(onTyping, 1000);

<textarea
  onChange={(e) => {
    setMessage(e.target.value);
    debouncedTyping();
  }}
/>
```

## Related Skills

- `organisms/chat-interface` - Full chat UI
- `molecules/mention-input` - @ mentions
- `atoms/input-textarea` - Textarea component

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- File attachments with preview
- Emoji picker
- Keyboard shortcuts
- Auto-resize textarea
