---
id: m-copy-button
name: Copy Button
version: 2.0.0
layer: L2
category: interactive
description: Copy to clipboard button with visual feedback and accessibility
tags: [copy, clipboard, button, feedback, utility]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "CopyButton = Button(a-input-button) + StateIcon(a-display-icon)"
composes:
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
dependencies:
  react: "^19.0.0"
  lucide-react: "^0.460.0"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Copy Button

## Overview

A copy to clipboard button molecule with visual feedback states (idle, copying, copied, error). Uses the Clipboard API with fallback support, announces status to screen readers, and provides customizable content and styling.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CopyButton                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Button (a-input-button)                      │  │
│  │  ┌─────────┐  ┌───────────────────────────────────────┐   │  │
│  │  │  Icon   │  │            Label (optional)           │   │  │
│  │  │(a-disp- │  │                                       │   │  │
│  │  │lay-icon)│  │              "Copy"                   │   │  │
│  │  │   📋    │  │                                       │   │  │
│  │  └─────────┘  └───────────────────────────────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

State Transitions:
┌─────────┐   click   ┌──────────┐  success  ┌─────────┐  timeout  ┌─────────┐
│  idle   │ ────────▶ │ copying  │ ────────▶ │ copied  │ ────────▶ │  idle   │
│   📋    │           │    ⟳     │           │    ✓    │           │   📋    │
└─────────┘           └──────────┘           └─────────┘           └─────────┘
                            │ error
                            ▼
                      ┌─────────┐
                      │  error  │
                      │    ✗    │
                      └─────────┘
```

## Implementation

```tsx
// components/molecules/copy-button.tsx
'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Copy, Check, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type CopyStatus = 'idle' | 'copying' | 'copied' | 'error';

interface CopyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof copyButtonVariants> {
  value: string;
  onCopy?: (value: string) => void;
  onError?: (error: Error) => void;
  copiedDuration?: number;
  showLabel?: boolean;
  labels?: {
    idle?: string;
    copying?: string;
    copied?: string;
    error?: string;
  };
  icons?: {
    idle?: React.ReactNode;
    copying?: React.ReactNode;
    copied?: React.ReactNode;
    error?: React.ReactNode;
  };
}

// Styles
const copyButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border border-input bg-transparent hover:bg-accent',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        success: 'bg-green-500 text-white hover:bg-green-600',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        md: 'h-9 px-3 text-sm',
        lg: 'h-10 px-4 text-sm',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
        'icon-lg': 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

// Default labels
const defaultLabels = {
  idle: 'Copy',
  copying: 'Copying...',
  copied: 'Copied!',
  error: 'Failed',
};

// Copy to clipboard utility
async function copyToClipboard(text: string): Promise<void> {
  // Modern Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback for older browsers or non-secure contexts
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  textArea.style.top = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand('copy');
    if (!successful) {
      throw new Error('Copy command failed');
    }
  } finally {
    document.body.removeChild(textArea);
  }
}

// Main Copy Button Component
export function CopyButton({
  value,
  onCopy,
  onError,
  copiedDuration = 2000,
  showLabel = false,
  labels = {},
  icons = {},
  variant,
  size,
  className,
  disabled,
  ...props
}: CopyButtonProps) {
  const [status, setStatus] = React.useState<CopyStatus>('idle');
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  // Merge labels with defaults
  const mergedLabels = { ...defaultLabels, ...labels };

  // Default icons
  const defaultIcons = {
    idle: <Copy className="h-4 w-4" />,
    copying: <Loader2 className="h-4 w-4 animate-spin" />,
    copied: <Check className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
  };
  const mergedIcons = { ...defaultIcons, ...icons };

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    if (status === 'copying') return;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setStatus('copying');

    try {
      await copyToClipboard(value);
      setStatus('copied');
      onCopy?.(value);

      // Reset to idle after duration
      timeoutRef.current = setTimeout(() => {
        setStatus('idle');
      }, copiedDuration);
    } catch (error) {
      setStatus('error');
      onError?.(error instanceof Error ? error : new Error('Copy failed'));

      // Reset to idle after duration
      timeoutRef.current = setTimeout(() => {
        setStatus('idle');
      }, copiedDuration);
    }
  };

  // Determine button variant based on status
  const buttonVariant = status === 'copied' ? 'success' : variant;

  // Determine if showing only icon
  const isIconOnly = !showLabel && (size === 'icon' || size === 'icon-sm' || size === 'icon-lg');

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled || status === 'copying'}
      className={cn(
        copyButtonVariants({
          variant: buttonVariant,
          size: isIconOnly ? size : showLabel ? size : 'icon',
        }),
        status === 'copied' && 'bg-green-500 text-white hover:bg-green-600',
        status === 'error' && 'bg-destructive text-destructive-foreground',
        className
      )}
      aria-label={isIconOnly ? mergedLabels[status] : undefined}
      {...props}
    >
      {mergedIcons[status]}
      {showLabel && <span>{mergedLabels[status]}</span>}
      
      {/* Screen reader announcement */}
      <span className="sr-only" role="status" aria-live="polite">
        {status === 'copied' && 'Copied to clipboard'}
        {status === 'error' && 'Failed to copy'}
      </span>
    </button>
  );
}

// Copy Button with Input Preview
interface CopyInputProps extends Omit<CopyButtonProps, 'showLabel'> {
  label?: string;
  showFullValue?: boolean;
  maxLength?: number;
}

export function CopyInput({
  value,
  label,
  showFullValue = false,
  maxLength = 30,
  className,
  ...props
}: CopyInputProps) {
  const displayValue = showFullValue
    ? value
    : value.length > maxLength
    ? `${value.slice(0, maxLength)}...`
    : value;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">{label}</label>
      )}
      <div className="flex items-center gap-2">
        <div className="flex-1 rounded-md border bg-muted px-3 py-2">
          <code className="text-sm text-muted-foreground font-mono truncate block">
            {displayValue}
          </code>
        </div>
        <CopyButton value={value} {...props} />
      </div>
    </div>
  );
}

// Copy Code Block
interface CopyCodeBlockProps extends Omit<CopyButtonProps, 'value'> {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function CopyCodeBlock({
  code,
  language,
  showLineNumbers = false,
  className,
  ...props
}: CopyCodeBlockProps) {
  const lines = code.split('\n');

  return (
    <div className={cn('relative rounded-lg border bg-muted', className)}>
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        {language && (
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {language}
          </span>
        )}
        <CopyButton
          value={code}
          size="icon-sm"
          variant="ghost"
          {...props}
        />
      </div>
      
      {/* Code content */}
      <div className="overflow-x-auto p-4">
        <pre className="text-sm">
          <code>
            {showLineNumbers
              ? lines.map((line, i) => (
                  <div key={i} className="table-row">
                    <span className="table-cell pr-4 text-right text-muted-foreground select-none">
                      {i + 1}
                    </span>
                    <span className="table-cell">{line}</span>
                  </div>
                ))
              : code}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Copy Link Button (specialized for URLs)
interface CopyLinkButtonProps extends Omit<CopyButtonProps, 'labels'> {
  url?: string;
}

export function CopyLinkButton({
  value,
  url,
  ...props
}: CopyLinkButtonProps) {
  const copyValue = url || value;

  return (
    <CopyButton
      value={copyValue}
      labels={{
        idle: 'Copy link',
        copying: 'Copying...',
        copied: 'Link copied!',
        error: 'Failed to copy',
      }}
      showLabel
      {...props}
    />
  );
}

// Hook for custom copy implementations
export function useCopyToClipboard(options?: {
  copiedDuration?: number;
  onCopy?: (value: string) => void;
  onError?: (error: Error) => void;
}) {
  const { copiedDuration = 2000, onCopy, onError } = options || {};
  const [status, setStatus] = React.useState<CopyStatus>('idle');
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const copy = React.useCallback(
    async (value: string) => {
      if (status === 'copying') return false;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setStatus('copying');

      try {
        await copyToClipboard(value);
        setStatus('copied');
        onCopy?.(value);

        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
        }, copiedDuration);

        return true;
      } catch (error) {
        setStatus('error');
        onError?.(error instanceof Error ? error : new Error('Copy failed'));

        timeoutRef.current = setTimeout(() => {
          setStatus('idle');
        }, copiedDuration);

        return false;
      }
    },
    [status, copiedDuration, onCopy, onError]
  );

  const reset = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setStatus('idle');
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copy, status, reset, isCopied: status === 'copied' };
}
```

## Variants

### Size Variants

```tsx
<CopyButton size="sm" showLabel />
<CopyButton size="md" showLabel />
<CopyButton size="lg" showLabel />
<CopyButton size="icon-sm" />
<CopyButton size="icon" />
<CopyButton size="icon-lg" />
```

### Style Variants

```tsx
<CopyButton variant="default" />
<CopyButton variant="ghost" />
<CopyButton variant="outline" />
<CopyButton variant="secondary" />
```

### With Labels

```tsx
<CopyButton showLabel />
<CopyButton showLabel labels={{ idle: 'Copy code', copied: 'Done!' }} />
```

## Usage

### Basic Copy Button

```tsx
import { CopyButton } from '@/components/molecules/copy-button';

export function ShareUrl({ url }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="text"
        value={url}
        readOnly
        className="flex-1 rounded border px-3 py-2"
      />
      <CopyButton value={url} />
    </div>
  );
}
```

### Copy Input Field

```tsx
import { CopyInput } from '@/components/molecules/copy-button';

export function ApiKeyDisplay({ apiKey }) {
  return (
    <CopyInput
      value={apiKey}
      label="API Key"
      maxLength={20}
      onCopy={() => toast.success('API key copied')}
    />
  );
}
```

### Code Block with Copy

```tsx
import { CopyCodeBlock } from '@/components/molecules/copy-button';

export function CodeExample() {
  const code = `npm install @acme/sdk
import { Acme } from '@acme/sdk';

const client = new Acme({ apiKey: 'xxx' });`;

  return (
    <CopyCodeBlock
      code={code}
      language="typescript"
      showLineNumbers
      onCopy={() => toast.success('Code copied!')}
    />
  );
}
```

### Using the Hook

```tsx
import { useCopyToClipboard } from '@/components/molecules/copy-button';

export function CustomCopyUI({ text }) {
  const { copy, status, isCopied } = useCopyToClipboard({
    onCopy: () => analytics.track('content_copied'),
  });

  return (
    <div onClick={() => copy(text)} className="cursor-pointer">
      {isCopied ? (
        <span className="text-green-500">Copied!</span>
      ) : (
        <span>Click to copy</span>
      )}
    </div>
  );
}
```

### Copy Share Link

```tsx
import { CopyLinkButton } from '@/components/molecules/copy-button';

export function SharePost({ post }) {
  const shareUrl = `https://example.com/posts/${post.slug}`;

  return (
    <CopyLinkButton
      value={shareUrl}
      onCopy={() => {
        toast.success('Link copied to clipboard');
        analytics.track('share_link_copied', { postId: post.id });
      }}
    />
  );
}
```

## Anti-patterns

```tsx
// Don't forget to handle errors
<CopyButton value={text} /> // Errors silently fail

// Do handle errors for better UX
<CopyButton
  value={text}
  onError={(error) => toast.error('Failed to copy: ' + error.message)}
/>

// Don't use without accessible labels for icon-only
<CopyButton value={text} size="icon" /> // Missing context

// Default already includes aria-label, but customize if needed
<CopyButton
  value={text}
  size="icon"
  labels={{ idle: 'Copy invitation code' }}
/>

// Don't copy sensitive data without warning
<CopyButton value={password} /> // Security concern

// Do warn users about sensitive data
<CopyButton
  value={password}
  onCopy={() => toast.warning('Password copied - clear clipboard after use')}
/>
```

## Related Skills

- `atoms/button` - Base button component
- `molecules/share-button` - Share dialog
- `patterns/clipboard-api` - Clipboard API patterns

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with Clipboard API
- Added fallback for older browsers
- Visual feedback states (idle, copying, copied, error)
- Screen reader announcements
- CopyInput and CopyCodeBlock variants
- useCopyToClipboard hook
