---
id: o-chat-interface
name: Chat Interface
version: 1.0.0
layer: L3
category: communication
description: Complete chat UI with message list, input, typing indicators, and real-time updates
tags: [chat, messaging, conversation, real-time, communication]
formula: "ChatInterface = ChatInput(o-chat-input) + MessageList + Avatar(a-avatar) + Badge(a-badge) + TypingIndicator"
composes:
  - ../atoms/display-avatar.md
  - ../atoms/display-badge.md
  - ../molecules/media-object.md
dependencies:
  - react
  - date-fns
  - lucide-react
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Chat Interface

## Overview

A complete chat interface organism combining message display, input, typing indicators, and real-time updates. Supports message grouping, reactions, and reply threads.

## When to Use

Use this skill when:
- Building messaging applications
- Creating customer support chat
- Implementing team collaboration tools
- Adding live chat to websites

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                       ChatInterface (L3)                             │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Chat Header                                                  │  │
│  │  Avatar(a-avatar) + "John Doe" + Badge(a-badge)[Online]      │  │
│  │  [Video] [Call] [Info] buttons                               │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Message List (scrollable)                                    │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Date Separator: "Today"                                │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Message (received)                                     │  │  │
│  │  │  ┌────────┐ ┌──────────────────────────────────────┐    │  │  │
│  │  │  │ Avatar │ │ Message bubble                       │    │  │  │
│  │  │  │        │ │ "Hey, how are you?"                  │    │  │  │
│  │  │  │        │ │ 10:30 AM                             │    │  │  │
│  │  │  └────────┘ └──────────────────────────────────────┘    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Message (sent)                                         │  │  │
│  │  │           ┌──────────────────────────────────────┐      │  │  │
│  │  │           │ "I'm doing great, thanks!"           │      │  │  │
│  │  │           │ 10:32 AM ✓✓                          │      │  │  │
│  │  │           └──────────────────────────────────────┘      │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Typing Indicator: "John is typing..."                  │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  ChatInput(o-chat-input)                                      │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/chat-interface.tsx
'use client';

import * as React from 'react';
import { format, isToday, isYesterday, isSameDay } from 'date-fns';
import {
  Phone,
  Video,
  Info,
  Check,
  CheckCheck,
  Loader2,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface User {
  id: string;
  name: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
}

interface Message {
  id: string;
  content: string;
  sender: User;
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  attachments?: { type: string; url: string; name: string }[];
  replyTo?: Message;
}

interface ChatInterfaceProps {
  messages: Message[];
  currentUser: User;
  recipient: User;
  isTyping?: boolean;
  isLoading?: boolean;
  onSend: (message: string, attachments: File[]) => void;
  onTyping?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showHeader?: boolean;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onInfo?: () => void;
  className?: string;
}

function formatMessageDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  return format(date, 'MMMM d, yyyy');
}

function Avatar({ user, size = 'md' }: { user: User; size?: 'sm' | 'md' }) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const sizeClasses = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm' };

  return (
    <div className={cn('relative rounded-full bg-muted flex items-center justify-center font-medium', sizeClasses[size])}>
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="h-full w-full rounded-full object-cover" />
      ) : (
        <span className="text-muted-foreground">{initials}</span>
      )}
      {user.status === 'online' && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
      )}
    </div>
  );
}

function MessageStatus({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'sending': return <Loader2 className="h-3 w-3 animate-spin" />;
    case 'sent': return <Check className="h-3 w-3" />;
    case 'delivered': return <CheckCheck className="h-3 w-3" />;
    case 'read': return <CheckCheck className="h-3 w-3 text-blue-500" />;
    default: return null;
  }
}

function DateSeparator({ date }: { date: Date }) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground font-medium">{formatMessageDate(date)}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function MessageBubble({
  message,
  isOwn,
  showAvatar,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}) {
  return (
    <div className={cn('flex gap-3 group', isOwn && 'flex-row-reverse')}>
      {showAvatar ? (
        <Avatar user={message.sender} size="sm" />
      ) : (
        <div className="w-8" />
      )}

      <div className={cn('max-w-[70%]', isOwn && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-2',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-br-md'
              : 'bg-muted rounded-bl-md'
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Attachments */}
        {message.attachments && message.attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.attachments.map((attachment, i) => (
              <a
                key={i}
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-xs text-primary hover:underline"
              >
                {attachment.name}
              </a>
            ))}
          </div>
        )}

        {/* Timestamp & Status */}
        <div className={cn('flex items-center gap-1 mt-1', isOwn && 'flex-row-reverse')}>
          <span className="text-xs text-muted-foreground">
            {format(new Date(message.timestamp), 'h:mm a')}
          </span>
          {isOwn && <MessageStatus status={message.status} />}
        </div>
      </div>
    </div>
  );
}

function TypingIndicator({ user }: { user: User }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <Avatar user={user} size="sm" />
      <div className="flex items-center gap-1 rounded-2xl bg-muted px-4 py-3">
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}

function ChatHeader({
  recipient,
  onVideoCall,
  onVoiceCall,
  onInfo,
}: {
  recipient: User;
  onVideoCall?: () => void;
  onVoiceCall?: () => void;
  onInfo?: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar user={recipient} />
        <div>
          <h2 className="font-semibold">{recipient.name}</h2>
          <p className="text-xs text-muted-foreground capitalize">
            {recipient.status || 'offline'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {onVoiceCall && (
          <button onClick={onVoiceCall} className="p-2 rounded-lg hover:bg-accent">
            <Phone className="h-5 w-5" />
          </button>
        )}
        {onVideoCall && (
          <button onClick={onVideoCall} className="p-2 rounded-lg hover:bg-accent">
            <Video className="h-5 w-5" />
          </button>
        )}
        {onInfo && (
          <button onClick={onInfo} className="p-2 rounded-lg hover:bg-accent">
            <Info className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Simple ChatInput inline (or import from chat-input.tsx)
function ChatInput({
  onSend,
  onTyping,
  disabled,
}: {
  onSend: (message: string, attachments: File[]) => void;
  onTyping?: () => void;
  disabled?: boolean;
}) {
  const [message, setMessage] = React.useState('');

  const handleSend = () => {
    if (!message.trim()) return;
    onSend(message.trim(), []);
    setMessage('');
  };

  return (
    <div className="border-t p-4">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => { setMessage(e.target.value); onTyping?.(); }}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 rounded-lg border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export function ChatInterface({
  messages,
  currentUser,
  recipient,
  isTyping = false,
  isLoading = false,
  onSend,
  onTyping,
  onLoadMore,
  hasMore = false,
  showHeader = true,
  onVideoCall,
  onVoiceCall,
  onInfo,
  className,
}: ChatInterfaceProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Group messages by date
  const groupedMessages = messages.reduce((acc, message, index) => {
    const prevMessage = messages[index - 1];
    const showDate = !prevMessage || !isSameDay(new Date(message.timestamp), new Date(prevMessage.timestamp));
    const showAvatar = !prevMessage || prevMessage.sender.id !== message.sender.id || showDate;
    acc.push({ message, showDate, showAvatar });
    return acc;
  }, [] as { message: Message; showDate: boolean; showAvatar: boolean }[]);

  return (
    <div className={cn('flex flex-col h-full bg-background', className)}>
      {showHeader && (
        <ChatHeader
          recipient={recipient}
          onVideoCall={onVideoCall}
          onVoiceCall={onVoiceCall}
          onInfo={onInfo}
        />
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4">
        {hasMore && (
          <button
            onClick={onLoadMore}
            className="w-full py-3 text-sm text-primary hover:underline"
          >
            Load earlier messages
          </button>
        )}

        {isLoading && messages.length === 0 ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-1 py-4">
            {groupedMessages.map(({ message, showDate, showAvatar }) => (
              <React.Fragment key={message.id}>
                {showDate && <DateSeparator date={new Date(message.timestamp)} />}
                <MessageBubble
                  message={message}
                  isOwn={message.sender.id === currentUser.id}
                  showAvatar={showAvatar}
                />
              </React.Fragment>
            ))}
            {isTyping && <TypingIndicator user={recipient} />}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput onSend={onSend} onTyping={onTyping} disabled={isLoading} />
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { ChatInterface } from '@/components/organisms/chat-interface';

<ChatInterface
  messages={messages}
  currentUser={currentUser}
  recipient={recipient}
  onSend={(message, files) => sendMessage({ content: message })}
  isTyping={isRecipientTyping}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Chat displays messages with input | Message list with avatars, timestamps, and input area |
| Loading | Initial messages being fetched | Centered spinner in message area |
| Empty | No messages in conversation | Empty message area, only input visible |
| Sending | Message being transmitted | New message appears with "sending" status and spinner |
| Sent | Message transmitted to server | Single checkmark status indicator |
| Delivered | Message received by recipient | Double checkmark status indicator |
| Read | Message viewed by recipient | Blue double checkmark status indicator |
| Typing | Recipient is typing | Animated typing indicator with bouncing dots |
| Load More | Older messages available | "Load earlier messages" link at top of list |
| Online | Recipient is active | Green status dot on recipient avatar |
| Offline | Recipient is inactive | No status dot or gray status dot |
| Away | Recipient is away | Yellow/amber status dot |
| Header Visible | Chat header shown | Recipient info, status, and action buttons at top |
| Header Hidden | Minimal interface | No header, just messages and input |

## Anti-patterns

### Bad: Not auto-scrolling to new messages

```tsx
// Bad - user must manually scroll to see new messages
const ChatInterface = ({ messages }) => {
  return (
    <div className="overflow-y-auto">
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
    </div>
  );
};

// Good - auto-scroll on new messages
const ChatInterface = ({ messages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div className="overflow-y-auto">
      {messages.map(msg => <Message key={msg.id} {...msg} />)}
      <div ref={messagesEndRef} />
    </div>
  );
};
```

### Bad: Grouping messages without date context

```tsx
// Bad - no visual separation between days
<div>
  {messages.map(msg => (
    <MessageBubble key={msg.id} message={msg} />
  ))}
</div>

// Good - group by date with separators
<div>
  {groupedMessages.map(({ message, showDate }) => (
    <Fragment key={message.id}>
      {showDate && <DateSeparator date={message.timestamp} />}
      <MessageBubble message={message} />
    </Fragment>
  ))}
</div>
```

### Bad: Showing duplicate typing indicators

```tsx
// Bad - multiple typing indicators stack up
{isTyping && <TypingIndicator />}
{isTyping && <TypingIndicator />} // Duplicate!

// Good - single typing indicator with user info
{isTyping && (
  <TypingIndicator user={recipient} />
)}
```

### Bad: Not handling message send failures

```tsx
// Bad - message disappears on failure
const sendMessage = async (content) => {
  const tempId = generateId();
  setMessages(prev => [...prev, { id: tempId, content, status: 'sending' }]);

  try {
    await api.sendMessage(content);
    // If this fails, message is stuck in "sending" state
  } catch (error) {
    console.error(error);
  }
};

// Good - show failure state with retry option
const sendMessage = async (content) => {
  const tempId = generateId();
  setMessages(prev => [...prev, { id: tempId, content, status: 'sending' }]);

  try {
    const response = await api.sendMessage(content);
    setMessages(prev =>
      prev.map(msg => msg.id === tempId ? { ...msg, id: response.id, status: 'sent' } : msg)
    );
  } catch (error) {
    setMessages(prev =>
      prev.map(msg => msg.id === tempId ? { ...msg, status: 'failed' } : msg)
    );
    // UI shows retry button for failed messages
  }
};
```

## Related Skills

- `organisms/chat-input` - Chat input component
- `molecules/media-object` - Message layout
- `patterns/real-time` - Real-time updates

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- Message grouping by date
- Typing indicators
- Read receipts
