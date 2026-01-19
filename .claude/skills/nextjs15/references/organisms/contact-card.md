---
id: o-contact-card
name: Contact Card
version: 1.0.0
layer: L3
category: user
description: Contact or person information card with avatar, details, and action buttons
tags: [contact, card, profile, person, user]
formula: "ContactCard = Card(m-card) + Avatar(a-avatar) + Badge(a-badge) + Button(a-button) + Icon(a-icon)"
composes:
  - ../molecules/card.md
  - ../atoms/display-avatar.md
  - ../atoms/display-badge.md
  - ../atoms/input-button.md
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

# Contact Card

## Overview

A versatile contact card organism for displaying person or contact information including avatar, name, title, contact details, and quick action buttons. Supports different layouts and interaction states.

## When to Use

Use this skill when:
- Building contact/address books
- Displaying team member profiles
- Creating user directory listings
- Showing contact information in CRM systems

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       ContactCard (L3)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Card Header                                              │  │
│  │  ┌─────────────┐                                          │  │
│  │  │   Avatar    │  John Doe                                │  │
│  │  │ (a-avatar)  │  Senior Developer                        │  │
│  │  │    JD       │  Badge(a-badge)[Online]                  │  │
│  │  └─────────────┘                                          │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Contact Details                                          │  │
│  │  ┌────────┐                                               │  │
│  │  │ Icon   │  john.doe@company.com                         │  │
│  │  │(email) │                                               │  │
│  │  └────────┘                                               │  │
│  │  ┌────────┐                                               │  │
│  │  │ Icon   │  +1 (555) 123-4567                            │  │
│  │  │(phone) │                                               │  │
│  │  └────────┘                                               │  │
│  │  ┌────────┐                                               │  │
│  │  │ Icon   │  San Francisco, CA                            │  │
│  │  │(loc)   │                                               │  │
│  │  └────────┘                                               │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Actions                                                  │  │
│  │  Button(a-button)[Message] Button(a-button)[Call]        │  │
│  │  ... or ActionMenu(m-action-menu)                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/contact-card.tsx
'use client';

import * as React from 'react';
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Video,
  Calendar,
  ExternalLink,
  MoreHorizontal,
  Star,
  StarOff,
  Linkedin,
  Twitter,
  Github,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface SocialLink {
  type: 'linkedin' | 'twitter' | 'github' | 'website';
  url: string;
}

interface Contact {
  id: string;
  name: string;
  title?: string;
  company?: string;
  avatar?: string;
  email?: string;
  phone?: string;
  location?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  isFavorite?: boolean;
  tags?: string[];
  socials?: SocialLink[];
}

interface ContactCardProps {
  contact: Contact;
  variant?: 'default' | 'compact' | 'horizontal';
  showActions?: boolean;
  onMessage?: (contact: Contact) => void;
  onCall?: (contact: Contact) => void;
  onVideoCall?: (contact: Contact) => void;
  onSchedule?: (contact: Contact) => void;
  onToggleFavorite?: (contact: Contact) => void;
  onClick?: (contact: Contact) => void;
  className?: string;
}

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
  busy: 'bg-red-500',
};

const socialIcons = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
  website: ExternalLink,
};

function Avatar({
  src,
  name,
  status,
  size = 'lg',
}: {
  src?: string;
  name: string;
  status?: Contact['status'];
  size?: 'md' | 'lg';
}) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const sizeClasses = { md: 'h-12 w-12 text-sm', lg: 'h-16 w-16 text-lg' };

  return (
    <div className="relative">
      <div
        className={cn(
          'rounded-full bg-muted flex items-center justify-center font-medium',
          sizeClasses[size]
        )}
      >
        {src ? (
          <img src={src} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          <span className="text-muted-foreground">{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background',
            statusColors[status]
          )}
        />
      )}
    </div>
  );
}

function ContactDetail({
  icon: Icon,
  value,
  href,
}: {
  icon: React.ElementType;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <span className={cn(href && 'hover:underline')}>{value}</span>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block hover:text-primary transition-colors">
        {content}
      </a>
    );
  }

  return content;
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  variant = 'secondary',
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        variant === 'primary'
          ? 'bg-primary text-primary-foreground hover:bg-primary/90'
          : 'border hover:bg-accent'
      )}
    >
      <Icon className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export function ContactCard({
  contact,
  variant = 'default',
  showActions = true,
  onMessage,
  onCall,
  onVideoCall,
  onSchedule,
  onToggleFavorite,
  onClick,
  className,
}: ContactCardProps) {
  const isClickable = !!onClick;

  const cardContent = (
    <>
      {/* Header */}
      <div className={cn('flex gap-4', variant === 'horizontal' ? 'flex-row items-center' : 'flex-col items-center text-center')}>
        <Avatar
          src={contact.avatar}
          name={contact.name}
          status={contact.status}
          size={variant === 'compact' ? 'md' : 'lg'}
        />
        <div className={cn(variant === 'horizontal' && 'flex-1')}>
          <div className="flex items-center gap-2 justify-center">
            <h3 className="font-semibold">{contact.name}</h3>
            {onToggleFavorite && (
              <button
                onClick={(e) => { e.stopPropagation(); onToggleFavorite(contact); }}
                className="p-1 hover:bg-accent rounded"
              >
                {contact.isFavorite ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <StarOff className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            )}
          </div>
          {contact.title && (
            <p className="text-sm text-muted-foreground">{contact.title}</p>
          )}
          {contact.company && (
            <p className="text-sm text-muted-foreground">{contact.company}</p>
          )}
          {contact.tags && contact.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2 justify-center">
              {contact.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-2 py-0.5 text-xs">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Details */}
      {variant !== 'compact' && (
        <div className="mt-4 space-y-2">
          {contact.email && (
            <ContactDetail icon={Mail} value={contact.email} href={`mailto:${contact.email}`} />
          )}
          {contact.phone && (
            <ContactDetail icon={Phone} value={contact.phone} href={`tel:${contact.phone}`} />
          )}
          {contact.location && (
            <ContactDetail icon={MapPin} value={contact.location} />
          )}
        </div>
      )}

      {/* Social Links */}
      {contact.socials && contact.socials.length > 0 && variant !== 'compact' && (
        <div className="mt-4 flex justify-center gap-2">
          {contact.socials.map((social) => {
            const Icon = socialIcons[social.type];
            return (
              <a
                key={social.type}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-accent transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Icon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      )}

      {/* Actions */}
      {showActions && variant !== 'compact' && (
        <div className="mt-4 flex gap-2 justify-center">
          {onMessage && (
            <ActionButton
              icon={MessageSquare}
              label="Message"
              onClick={() => onMessage(contact)}
              variant="primary"
            />
          )}
          {onCall && (
            <ActionButton icon={Phone} label="Call" onClick={() => onCall(contact)} />
          )}
          {onVideoCall && (
            <ActionButton icon={Video} label="Video" onClick={() => onVideoCall(contact)} />
          )}
          {onSchedule && (
            <ActionButton icon={Calendar} label="Schedule" onClick={() => onSchedule(contact)} />
          )}
        </div>
      )}
    </>
  );

  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-4 transition-colors',
        isClickable && 'cursor-pointer hover:border-primary/50 hover:shadow-sm',
        className
      )}
      onClick={() => onClick?.(contact)}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
    >
      {cardContent}
    </div>
  );
}

// Grid wrapper for multiple cards
export function ContactCardGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('grid gap-4 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {children}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { ContactCard, ContactCardGrid } from '@/components/organisms/contact-card';

const contact = {
  id: '1',
  name: 'John Doe',
  title: 'Senior Developer',
  company: 'Acme Inc',
  email: 'john@acme.com',
  phone: '+1 555-123-4567',
  location: 'San Francisco, CA',
  status: 'online',
};

<ContactCard
  contact={contact}
  onMessage={(c) => openChat(c)}
  onCall={(c) => startCall(c)}
/>
```

### Compact Variant

```tsx
<ContactCard contact={contact} variant="compact" />
```

### With Social Links

```tsx
<ContactCard
  contact={{
    ...contact,
    socials: [
      { type: 'linkedin', url: 'https://linkedin.com/in/johndoe' },
      { type: 'twitter', url: 'https://twitter.com/johndoe' },
      { type: 'github', url: 'https://github.com/johndoe' },
    ],
  }}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Contact card in normal display state | Card with avatar, name, details, and actions visible |
| Hover (Card) | Mouse over clickable card | Border changes to primary tint, subtle shadow appears |
| Focused | Card has keyboard focus | Focus ring visible around card border |
| Status Online | Contact is currently available | Green status dot on avatar |
| Status Offline | Contact is not available | Gray status dot on avatar |
| Status Away | Contact is temporarily unavailable | Yellow status dot on avatar |
| Status Busy | Contact is busy/do not disturb | Red status dot on avatar |
| Favorited | Contact marked as favorite | Filled yellow star icon displayed |
| Not Favorited | Contact not marked as favorite | Outline star icon displayed |
| Compact Variant | Condensed view without details | Only avatar and name shown, smaller avatar size |
| Horizontal Variant | Side-by-side layout | Avatar left, content right in row layout |
| Action Hover | Mouse over action button | Button background changes to accent color |

## Anti-patterns

### 1. Missing Required Contact Data

```tsx
// Bad: Contact missing essential fields
const contact = {
  id: '1',
  // Missing name!
};

<ContactCard contact={contact} />

// Good: Provide at minimum id and name
const contact = {
  id: '1',
  name: 'John Doe',
};

<ContactCard contact={contact} />
```

### 2. Actions Without Handlers

```tsx
// Bad: showActions true but no handlers
<ContactCard
  contact={contact}
  showActions={true}
  // No onMessage, onCall, etc.
/>

// Good: Provide handlers for actions you want to show
<ContactCard
  contact={contact}
  showActions={true}
  onMessage={(c) => openChat(c)}
  onCall={(c) => startCall(c)}
/>
```

### 3. Using onClick With showActions

```tsx
// Bad: Card click conflicts with action buttons
<ContactCard
  contact={contact}
  onClick={(c) => openProfile(c)}
  showActions={true}  // Action clicks will also trigger card click
/>

// Good: Either use card click OR actions, not both
<ContactCard
  contact={contact}
  onClick={(c) => openProfile(c)}
  showActions={false}
/>

// Or handle click propagation in actions
<ContactCard
  contact={contact}
  showActions={true}
  onMessage={(c) => openChat(c)}  // Uses stopPropagation internally
/>
```

### 4. Inconsistent Avatar Handling

```tsx
// Bad: No fallback for missing avatar
<ContactCard
  contact={{
    id: '1',
    name: 'John Doe',
    avatar: undefined,  // Will show broken image
  }}
/>

// Good: Component handles this gracefully (shows initials)
// But ensure name is always provided for initials fallback
<ContactCard
  contact={{
    id: '1',
    name: 'John Doe',  // Required for initials fallback
    avatar: undefined,  // Falls back to "JD"
  }}
/>
```

## Related Skills

- `molecules/card` - Base card component
- `atoms/display-avatar` - Avatar display
- `organisms/team` - Team member display

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- Multiple layout variants
- Status indicators
- Social links
- Action buttons
