---
id: o-api-key-list
name: API Key List
version: 1.0.0
layer: L3
category: developer
description: List of API keys with creation, viewing, revocation, and copy functionality
tags: [api, keys, security, developer, credentials]
formula: "APIKeyList = Card(m-card) + Button(a-button) + Badge(a-badge) + CopyButton(m-copy-button) + ActionMenu(m-action-menu)"
composes:
  - ../molecules/card.md
  - ../atoms/input-button.md
  - ../atoms/display-badge.md
  - ../molecules/copy-button.md
  - ../molecules/action-menu.md
dependencies:
  - react
  - date-fns
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

# API Key List

## Overview

A secure list component for managing API keys with creation, viewing (masked), copying, and revocation capabilities. Includes last used timestamps and permission scopes.

## When to Use

Use this skill when:
- Building developer settings pages
- Creating API management dashboards
- Managing service credentials
- Implementing API access control

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        APIKeyList (L3)                               │
├─────────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Header                                                       │  │
│  │  "API Keys" + Badge(count) + Button(a-button)[+ Create Key]  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  API Key Item - Card(m-card)                                  │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  Key Icon + "Production Key" + Badge(a-badge)[Active]   │  │  │
│  │  │  ┌──────────────────────────────────────────────────┐   │  │  │
│  │  │  │  sk_live_••••••••••••3hK9                        │   │  │  │
│  │  │  │  Code(masked) + [Show] + CopyButton(m-copy-btn)  │   │  │  │
│  │  │  └──────────────────────────────────────────────────┘   │  │  │
│  │  │  Created: Jan 15, 2025 | Last used: 2 hours ago        │  │  │
│  │  │  Scopes: [read] [write]                                │  │  │
│  │  │  ActionMenu(m-action-menu): [Rename] [Revoke]          │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  API Key Item - Card(m-card)                                  │  │
│  │  ... more keys                                                │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Empty State (if no keys)                                     │  │
│  │  "No API keys yet" + Button[Create your first key]           │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/api-key-list.tsx
'use client';

import * as React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import {
  Key,
  Plus,
  Copy,
  Check,
  Eye,
  EyeOff,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface APIKey {
  id: string;
  name: string;
  key: string;
  prefix: string;
  createdAt: Date;
  lastUsedAt?: Date;
  expiresAt?: Date;
  scopes: string[];
  status: 'active' | 'expired' | 'revoked';
}

interface APIKeyListProps {
  keys: APIKey[];
  isLoading?: boolean;
  onCreate?: () => void;
  onRename?: (key: APIKey) => void;
  onRevoke?: (key: APIKey) => void;
  onCopy?: (key: string) => void;
  maxKeys?: number;
  className?: string;
}

function maskKey(key: string, prefix: string): string {
  return `${prefix}${'•'.repeat(20)}${key.slice(-4)}`;
}

function CopyButton({ text, onCopy }: { text: string; onCopy?: (text: string) => void }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    onCopy?.(text);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded hover:bg-accent transition-colors"
      aria-label="Copy API key"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

function StatusBadge({ status }: { status: APIKey['status'] }) {
  const styles = {
    active: 'bg-green-100 text-green-700',
    expired: 'bg-yellow-100 text-yellow-700',
    revoked: 'bg-red-100 text-red-700',
  };

  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', styles[status])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function KeyActions({
  apiKey,
  onRename,
  onRevoke,
}: {
  apiKey: APIKey;
  onRename?: (key: APIKey) => void;
  onRevoke?: (key: APIKey) => void;
}) {
  const [open, setOpen] = React.useState(false);

  if (apiKey.status !== 'active') return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 rounded hover:bg-accent transition-colors"
        aria-label="Key actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-1 w-36 rounded-lg border bg-popover py-1 shadow-lg">
            {onRename && (
              <button
                onClick={() => { setOpen(false); onRename(apiKey); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent"
              >
                <Edit className="h-4 w-4" />
                Rename
              </button>
            )}
            {onRevoke && (
              <button
                onClick={() => { setOpen(false); onRevoke(apiKey); }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
                Revoke
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function APIKeyItem({
  apiKey,
  onRename,
  onRevoke,
  onCopy,
}: {
  apiKey: APIKey;
  onRename?: (key: APIKey) => void;
  onRevoke?: (key: APIKey) => void;
  onCopy?: (key: string) => void;
}) {
  const [showKey, setShowKey] = React.useState(false);

  return (
    <div className="rounded-lg border bg-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Key className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{apiKey.name}</h3>
              <StatusBadge status={apiKey.status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Created {format(new Date(apiKey.createdAt), 'MMM d, yyyy')}
            </p>
          </div>
        </div>
        <KeyActions apiKey={apiKey} onRename={onRename} onRevoke={onRevoke} />
      </div>

      {/* Key Display */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
        <code className="flex-1 text-sm font-mono">
          {showKey ? apiKey.key : maskKey(apiKey.key, apiKey.prefix)}
        </code>
        <button
          onClick={() => setShowKey(!showKey)}
          className="p-1 rounded hover:bg-accent"
          aria-label={showKey ? 'Hide key' : 'Show key'}
        >
          {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
        <CopyButton text={apiKey.key} onCopy={onCopy} />
      </div>

      {/* Meta Info */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        {apiKey.lastUsedAt && (
          <span>
            Last used {formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })}
          </span>
        )}
        {apiKey.expiresAt && (
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Expires {format(new Date(apiKey.expiresAt), 'MMM d, yyyy')}
          </span>
        )}
      </div>

      {/* Scopes */}
      {apiKey.scopes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {apiKey.scopes.map((scope) => (
            <span key={scope} className="rounded bg-muted px-1.5 py-0.5 text-xs">
              {scope}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function APIKeyList({
  keys,
  isLoading = false,
  onCreate,
  onRename,
  onRevoke,
  onCopy,
  maxKeys = 10,
  className,
}: APIKeyListProps) {
  const canCreate = keys.length < maxKeys;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold">API Keys</h2>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {keys.length}/{maxKeys}
          </span>
        </div>
        {onCreate && canCreate && (
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Create Key
          </button>
        )}
      </div>

      {/* Keys List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : keys.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <Key className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="font-medium">No API keys yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create your first API key to get started
          </p>
          {onCreate && (
            <button
              onClick={onCreate}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Create API Key
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {keys.map((key) => (
            <APIKeyItem
              key={key.id}
              apiKey={key}
              onRename={onRename}
              onRevoke={onRevoke}
              onCopy={onCopy}
            />
          ))}
        </div>
      )}

      {/* Warning */}
      {keys.some(k => k.status === 'active') && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-800">
            Keep your API keys secure. Do not share them in public repositories or client-side code.
          </p>
        </div>
      )}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { APIKeyList } from '@/components/organisms/api-key-list';

const keys = [
  {
    id: '1',
    name: 'Production Key',
    key: 'sk_live_abc123def456ghi789',
    prefix: 'sk_live_',
    createdAt: new Date('2025-01-15'),
    lastUsedAt: new Date(),
    scopes: ['read', 'write'],
    status: 'active',
  },
];

<APIKeyList
  keys={keys}
  onCreate={() => openCreateDialog()}
  onRevoke={(key) => handleRevoke(key)}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | List displays keys with masked values | Keys shown with masked characters (dots), status badges visible |
| Loading | Initial key fetch in progress | Centered spinner replaces key list |
| Empty | No API keys exist | Empty state with key icon, "No API keys yet" message, and create button |
| Key Visible | User toggled show key | Full key value revealed, eye icon changes to eye-off |
| Key Hidden | Key value masked (default) | Key shows as prefix + dots + last 4 chars |
| Key Copied | User copied key to clipboard | Copy icon changes to green checkmark for 2 seconds |
| Actions Open | Key action menu expanded | Dropdown menu with Rename/Revoke options visible |
| Key Active | Key is valid and usable | Green "Active" badge displayed |
| Key Expired | Key has passed expiration date | Yellow "Expired" badge displayed |
| Key Revoked | Key has been manually revoked | Red "Revoked" badge, actions menu hidden |
| Max Reached | Maximum key limit reached | Create button hidden or disabled |

## Anti-patterns

### Bad: Exposing full API keys in logs or state

```tsx
// Bad - logging sensitive keys
console.log('API Key created:', newKey.fullValue);

// Bad - storing full key in component state unnecessarily
const [keys, setKeys] = useState(keysWithFullValues);

// Good - only store what's needed for display
const [keys, setKeys] = useState(keysWithMaskedValues);
// Full key shown only temporarily after creation
```

### Bad: Not confirming destructive actions

```tsx
// Bad - immediate revoke without confirmation
const handleRevoke = (key) => {
  revokeKey(key.id); // No confirmation!
};

// Good - require explicit confirmation
const handleRevoke = (key) => {
  if (confirm(`Revoke "${key.name}"? This cannot be undone.`)) {
    revokeKey(key.id);
  }
};

// Better - use a modal for important actions
<AlertDialog>
  <AlertDialogTrigger>Revoke</AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
    <AlertDialogDescription>
      This will immediately invalidate the key. Any applications using it will stop working.
    </AlertDialogDescription>
  </AlertDialogContent>
</AlertDialog>
```

### Bad: Missing key metadata for auditing

```tsx
// Bad - keys without creation/usage context
const keys = [
  { id: '1', name: 'My Key', key: 'sk_live_xxx' },
  // When was this created? Has it been used?
];

// Good - include audit metadata
const keys = [
  {
    id: '1',
    name: 'Production Key',
    key: 'sk_live_xxx',
    prefix: 'sk_live_',
    createdAt: new Date('2025-01-15'),
    lastUsedAt: new Date('2025-01-18'),
    expiresAt: new Date('2026-01-15'),
    scopes: ['read', 'write'],
    status: 'active',
  },
];
```

### Bad: Allowing unlimited API key creation

```tsx
// Bad - no limit on keys
<APIKeyList
  keys={keys}
  onCreate={createKey} // Can create infinitely
/>

// Good - enforce reasonable limits
<APIKeyList
  keys={keys}
  maxKeys={10}
  onCreate={keys.length < 10 ? createKey : undefined}
/>
```

## Related Skills

- `organisms/api-documentation` - API docs display
- `molecules/copy-button` - Copy functionality
- `patterns/secure-input` - Secure input handling

## Changelog

### 1.0.0 (2025-01-18)

- Initial implementation
- Key masking with show/hide toggle
- Copy to clipboard
- Revoke and rename actions
