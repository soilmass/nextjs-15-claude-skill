---
id: m-share-button
name: Share Button
version: 2.0.0
layer: L2
category: interactive
description: Share dialog trigger with Web Share API and fallback social sharing
tags: [share, social, dialog, clipboard, web-share]
performance:
  impact: low
  lcp: neutral
  cls: low
formula: "ShareButton = TriggerButton(a-input-button) + ShareIcon(a-display-icon) + SocialIcons(a-display-icon)[]"
composes:
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
dependencies:
  react: "^19.0.0"
  "@radix-ui/react-dialog": "^1.1.2"
  "@radix-ui/react-popover": "^1.1.2"
  lucide-react: "^0.460.0"
  class-variance-authority: "^0.7.1"
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Share Button

## Overview

A share button molecule that uses the native Web Share API when available, with a fallback dialog showing social sharing options and copy link functionality. Supports customizable share targets and tracking.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        ShareButton                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            Trigger (a-input-button)                       │  │
│  │   ┌─────────────┐  ┌─────────────────────────────────┐    │  │
│  │   │ Share Icon  │  │           Label                 │    │  │
│  │   │(a-display-  │  │                                 │    │  │
│  │   │   icon)     │  │          "Share"                │    │  │
│  │   │     📤      │  │                                 │    │  │
│  │   └─────────────┘  └─────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

Fallback Dialog (when Web Share API unavailable):
┌─────────────────────────────────────────────────────────────────┐
│                      Share Dialog                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │   [Twitter]  [Facebook]  [LinkedIn]  [Email]            │    │
│  │      🐦          📘          💼         ✉️             │    │
│  └─────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │   [https://example.com/page        ] [Copy Link 📋]    │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/molecules/share-button.tsx
'use client';

import * as React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  Share2,
  X,
  Copy,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  Link2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface ShareData {
  title?: string;
  text?: string;
  url: string;
}

interface ShareTarget {
  name: string;
  icon: React.ReactNode;
  color?: string;
  getShareUrl: (data: ShareData) => string;
}

interface ShareButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'>,
    VariantProps<typeof shareButtonVariants> {
  data: ShareData;
  onShare?: (target: string) => void;
  onCopy?: () => void;
  targets?: ShareTarget[];
  showLabel?: boolean;
  label?: string;
  dialogTitle?: string;
  preferNative?: boolean;
}

// Styles
const shareButtonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-10 px-5 text-sm',
        icon: 'h-9 w-9',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'md',
    },
  }
);

// Default share targets
const defaultShareTargets: ShareTarget[] = [
  {
    name: 'Twitter',
    icon: <Twitter className="h-5 w-5" />,
    color: 'hover:bg-[#1DA1F2] hover:text-white',
    getShareUrl: ({ title, url }) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title || '')}&url=${encodeURIComponent(url)}`,
  },
  {
    name: 'Facebook',
    icon: <Facebook className="h-5 w-5" />,
    color: 'hover:bg-[#4267B2] hover:text-white',
    getShareUrl: ({ url }) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: 'LinkedIn',
    icon: <Linkedin className="h-5 w-5" />,
    color: 'hover:bg-[#0077B5] hover:text-white',
    getShareUrl: ({ title, url }) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: 'WhatsApp',
    icon: <MessageCircle className="h-5 w-5" />,
    color: 'hover:bg-[#25D366] hover:text-white',
    getShareUrl: ({ title, url }) =>
      `https://wa.me/?text=${encodeURIComponent(`${title || ''} ${url}`)}`,
  },
  {
    name: 'Email',
    icon: <Mail className="h-5 w-5" />,
    color: 'hover:bg-gray-600 hover:text-white',
    getShareUrl: ({ title, text, url }) =>
      `mailto:?subject=${encodeURIComponent(title || '')}&body=${encodeURIComponent(`${text || ''}\n\n${url}`)}`,
  },
];

// Check if Web Share API is available
function canUseWebShare(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}

// Copy to clipboard utility
async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  
  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.style.position = 'fixed';
  textArea.style.left = '-999999px';
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  
  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}

// Share Dialog Content
function ShareDialogContent({
  data,
  targets,
  onShare,
  onCopy,
  onClose,
}: {
  data: ShareData;
  targets: ShareTarget[];
  onShare?: (target: string) => void;
  onCopy?: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = (target: ShareTarget) => {
    const shareUrl = target.getShareUrl(data);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    onShare?.(target.name);
    onClose();
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(data.url);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Error handling
    }
  };

  return (
    <div className="space-y-4">
      {/* Social share buttons */}
      <div className="grid grid-cols-5 gap-2">
        {targets.map((target) => (
          <button
            key={target.name}
            onClick={() => handleShare(target)}
            className={cn(
              'flex flex-col items-center gap-1.5 rounded-lg p-3 transition-colors',
              'border border-transparent bg-muted',
              target.color
            )}
            aria-label={`Share on ${target.name}`}
          >
            {target.icon}
            <span className="text-xs">{target.name}</span>
          </button>
        ))}
      </div>

      {/* Copy link section */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Or copy link</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-md border bg-muted px-3 py-2">
            <p className="truncate text-sm text-muted-foreground font-mono">
              {data.url}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-md border transition-colors',
              copied
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-background hover:bg-accent'
            )}
            aria-label={copied ? 'Copied' : 'Copy link'}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Share Button Component
export function ShareButton({
  data,
  onShare,
  onCopy,
  targets = defaultShareTargets,
  showLabel = true,
  label = 'Share',
  dialogTitle = 'Share',
  preferNative = true,
  variant,
  size,
  className,
  disabled,
  ...props
}: ShareButtonProps) {
  const [open, setOpen] = React.useState(false);

  const handleClick = async () => {
    // Try native Web Share API first
    if (preferNative && canUseWebShare()) {
      try {
        await navigator.share({
          title: data.title,
          text: data.text,
          url: data.url,
        });
        onShare?.('native');
        return;
      } catch (error) {
        // User cancelled or error - fall through to dialog
        if ((error as Error).name === 'AbortError') {
          return;
        }
      }
    }

    // Open fallback dialog
    setOpen(true);
  };

  const isIconOnly = !showLabel || size === 'icon' || size === 'icon-sm';

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        className={cn(shareButtonVariants({ variant, size }), className)}
        aria-label={isIconOnly ? label : undefined}
        {...props}
      >
        <Share2 className="h-4 w-4" />
        {showLabel && size !== 'icon' && size !== 'icon-sm' && (
          <span>{label}</span>
        )}
      </button>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">
              {dialogTitle}
            </Dialog.Title>
            <Dialog.Close className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>

          {/* Preview */}
          {data.title && (
            <div className="mb-4 rounded-lg border bg-muted p-3">
              <p className="font-medium line-clamp-1">{data.title}</p>
              {data.text && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {data.text}
                </p>
              )}
            </div>
          )}

          <ShareDialogContent
            data={data}
            targets={targets}
            onShare={onShare}
            onCopy={onCopy}
            onClose={() => setOpen(false)}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Compact Share Popover (alternative to dialog)
export function SharePopover({
  data,
  onShare,
  onCopy,
  targets = defaultShareTargets.slice(0, 4),
  variant,
  size = 'icon',
  className,
  ...props
}: Omit<ShareButtonProps, 'dialogTitle' | 'preferNative'>) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleShare = (target: ShareTarget) => {
    const shareUrl = target.getShareUrl(data);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    onShare?.(target.name);
    setOpen(false);
  };

  const handleCopy = async () => {
    try {
      await copyToClipboard(data.url);
      setCopied(true);
      onCopy?.();
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1500);
    } catch {
      // Error handling
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(shareButtonVariants({ variant, size }), className)}
        aria-label="Share"
        aria-expanded={open}
        {...props}
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 rounded-lg border bg-popover p-2 shadow-md">
            <div className="flex items-center gap-1">
              {targets.map((target) => (
                <button
                  key={target.name}
                  onClick={() => handleShare(target)}
                  className={cn(
                    'rounded-md p-2 transition-colors',
                    'hover:bg-accent'
                  )}
                  aria-label={`Share on ${target.name}`}
                >
                  {target.icon}
                </button>
              ))}
              <div className="mx-1 h-6 w-px bg-border" />
              <button
                onClick={handleCopy}
                className={cn(
                  'rounded-md p-2 transition-colors',
                  copied ? 'bg-green-500 text-white' : 'hover:bg-accent'
                )}
                aria-label={copied ? 'Copied' : 'Copy link'}
              >
                {copied ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Link2 className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Social Share Links (inline buttons)
export function SocialShareLinks({
  data,
  targets = defaultShareTargets,
  onShare,
  size = 'md',
  className,
}: {
  data: ShareData;
  targets?: ShareTarget[];
  onShare?: (target: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const handleShare = (target: ShareTarget) => {
    const shareUrl = target.getShareUrl(data);
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=400');
    onShare?.(target.name);
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {targets.map((target) => (
        <button
          key={target.name}
          onClick={() => handleShare(target)}
          className={cn(
            'rounded-full border transition-colors',
            'flex items-center justify-center',
            sizeClasses[size],
            target.color
          )}
          aria-label={`Share on ${target.name}`}
        >
          {React.cloneElement(target.icon as React.ReactElement, {
            className: iconSizes[size],
          })}
        </button>
      ))}
    </div>
  );
}
```

## Variants

### Size Variants

```tsx
<ShareButton size="sm" showLabel data={shareData} />
<ShareButton size="md" showLabel data={shareData} />
<ShareButton size="lg" showLabel data={shareData} />
<ShareButton size="icon" data={shareData} />
```

### Style Variants

```tsx
<ShareButton variant="default" data={shareData} />
<ShareButton variant="outline" data={shareData} />
<ShareButton variant="ghost" data={shareData} />
<ShareButton variant="secondary" data={shareData} />
```

### Popover vs Dialog

```tsx
<ShareButton data={shareData} /> // Full dialog
<SharePopover data={shareData} /> // Compact popover
```

## Usage

### Basic Share Button

```tsx
import { ShareButton } from '@/components/molecules/share-button';

export function ArticleHeader({ article }) {
  return (
    <ShareButton
      data={{
        title: article.title,
        text: article.excerpt,
        url: `https://example.com/articles/${article.slug}`,
      }}
      onShare={(target) => {
        analytics.track('article_shared', {
          articleId: article.id,
          target,
        });
      }}
    />
  );
}
```

### With Custom Targets

```tsx
import { ShareButton } from '@/components/molecules/share-button';
import { Send } from 'lucide-react';

const customTargets = [
  {
    name: 'Telegram',
    icon: <Send className="h-5 w-5" />,
    color: 'hover:bg-[#0088cc] hover:text-white',
    getShareUrl: ({ title, url }) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title || '')}`,
  },
  // ... other targets
];

<ShareButton
  data={shareData}
  targets={customTargets}
/>
```

### Inline Social Links

```tsx
import { SocialShareLinks } from '@/components/molecules/share-button';

export function ArticleFooter({ article }) {
  return (
    <div className="border-t pt-6">
      <p className="text-sm text-muted-foreground mb-3">
        Share this article
      </p>
      <SocialShareLinks
        data={{
          title: article.title,
          url: window.location.href,
        }}
        onShare={(target) => console.log('Shared via', target)}
      />
    </div>
  );
}
```

### Native Share First

```tsx
import { ShareButton } from '@/components/molecules/share-button';

// Uses Web Share API on mobile, falls back to dialog on desktop
<ShareButton
  data={{
    title: 'Check out this product!',
    url: productUrl,
  }}
  preferNative={true}
/>
```

### Compact Popover

```tsx
import { SharePopover } from '@/components/molecules/share-button';

export function CardActions({ item }) {
  return (
    <div className="flex items-center gap-2">
      <LikeButton />
      <SharePopover
        data={{
          title: item.title,
          url: `https://example.com/items/${item.id}`,
        }}
      />
    </div>
  );
}
```

## Anti-patterns

```tsx
// Don't forget to track shares for analytics
<ShareButton data={shareData} /> // No tracking

// Do track shares
<ShareButton
  data={shareData}
  onShare={(target) => analytics.track('content_shared', { target })}
/>

// Don't use relative URLs
<ShareButton data={{ url: '/articles/123' }} /> // Won't work

// Do use absolute URLs
<ShareButton data={{ url: 'https://example.com/articles/123' }} />

// Don't forget accessibility labels
<SharePopover data={shareData} /> // Icon-only needs label

// Component already includes aria-label, but verify it's appropriate
```

## Related Skills

- `molecules/copy-button` - Copy to clipboard
- `patterns/share-api` - Web Share API patterns
- `patterns/social-sharing` - Social sharing integration

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation with Web Share API
- Fallback dialog with social targets
- SharePopover compact variant
- SocialShareLinks inline variant
- Copy link functionality
- Analytics tracking support
