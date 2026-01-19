---
id: o-social-share
name: Social Share
version: 2.0.0
layer: L3
category: marketing
composes: []
description: Social sharing buttons with counts, native share, and tracking
tags: [social, share, twitter, facebook, linkedin, viral]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "SocialShare = Button(a-button) + Icon(a-icon)"
dependencies:
  - react
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Social Share

## Overview

A social sharing organism with platform-specific share buttons, share counts, native Web Share API integration, and analytics tracking support.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ SocialShare                                                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Variant: "buttons" (default)                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ ┌────────────────┐ ┌────────────────┐ ┌──────────────┐ │    │
│  │ │ Button(a-btn)  │ │ Button(a-btn)  │ │ Button(a-btn)│ │    │
│  │ │ Icon(a-icon)   │ │ Icon(a-icon)   │ │ Icon(a-icon) │ │    │
│  │ │ 🐦 Twitter     │ │ 📘 Facebook    │ │ 💼 LinkedIn  │ │    │
│  │ │     1.2K       │ │     5.6K       │ │    892       │ │    │
│  │ └────────────────┘ └────────────────┘ └──────────────┘ │    │
│  │ ┌────────────────┐ ┌────────────────┐                  │    │
│  │ │ 💬 WhatsApp    │ │ 🔗 Copy Link   │                  │    │
│  │ └────────────────┘ └────────────────┘                  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Variant: "icons"                                                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐              │    │
│  │  │ 🐦│  │ 📘│  │ 💼│  │ 💬│  │ 📤│  │ 🔗│              │    │
│  │  └───┘  └───┘  └───┘  └───┘  └───┘  └───┘              │    │
│  │  Icon   Icon   Icon   Icon   Icon   Icon               │    │
│  │  (a-)   (a-)   (a-)   (a-)   (a-)   (a-)               │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Variant: "minimal"                                              │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  🐦 1.2K   📘 5.6K   💼   💬   📤   🔗                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Direction: "vertical"                                           │
│  ┌───────┐                                                       │
│  │  ┌───┐│  Features:                                            │
│  │  │ 🐦││  • Native Web Share API (mobile)                     │
│  │  └───┘│  • Copy to clipboard                                  │
│  │  ┌───┐│  • Share counts display                               │
│  │  │ 📘││  • Analytics tracking (onShare)                       │
│  │  └───┘│  • Platform-specific URLs                             │
│  │  ┌───┐│                                                       │
│  │  │ 💼││                                                       │
│  │  └───┘│  Total: 10K shares                                    │
│  └───────┘                                                       │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/social-share.tsx
'use client';

import * as React from 'react';
import {
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Mail,
  MessageCircle,
  Check,
  Share2,
  Copy,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface ShareData {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string; // Twitter handle
}

interface ShareCounts {
  twitter?: number;
  facebook?: number;
  linkedin?: number;
  pinterest?: number;
  total?: number;
}

interface SocialShareProps {
  data: ShareData;
  counts?: ShareCounts;
  platforms?: Platform[];
  showCounts?: boolean;
  showLabels?: boolean;
  showNativeShare?: boolean;
  showCopyLink?: boolean;
  variant?: 'buttons' | 'icons' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  direction?: 'horizontal' | 'vertical';
  onShare?: (platform: string) => void;
  className?: string;
}

type Platform =
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'whatsapp'
  | 'telegram'
  | 'reddit'
  | 'pinterest'
  | 'email';

// Platform configurations
const platformConfig: Record<
  Platform,
  {
    name: string;
    icon: React.ElementType;
    color: string;
    hoverColor: string;
    getUrl: (data: ShareData) => string;
  }
> = {
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-[#1DA1F2]',
    hoverColor: 'hover:bg-[#1a8cd8]',
    getUrl: (data) => {
      const params = new URLSearchParams({
        url: data.url,
        text: data.title,
        ...(data.hashtags?.length && { hashtags: data.hashtags.join(',') }),
        ...(data.via && { via: data.via }),
      });
      return `https://twitter.com/intent/tweet?${params}`;
    },
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-[#4267B2]',
    hoverColor: 'hover:bg-[#365899]',
    getUrl: (data) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(data.url)}`,
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-[#0077B5]',
    hoverColor: 'hover:bg-[#006097]',
    getUrl: (data) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(data.url)}`,
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-[#25D366]',
    hoverColor: 'hover:bg-[#20bd5a]',
    getUrl: (data) =>
      `https://wa.me/?text=${encodeURIComponent(`${data.title} ${data.url}`)}`,
  },
  telegram: {
    name: 'Telegram',
    icon: MessageCircle,
    color: 'bg-[#0088cc]',
    hoverColor: 'hover:bg-[#0077b3]',
    getUrl: (data) =>
      `https://t.me/share/url?url=${encodeURIComponent(data.url)}&text=${encodeURIComponent(data.title)}`,
  },
  reddit: {
    name: 'Reddit',
    icon: MessageCircle,
    color: 'bg-[#FF4500]',
    hoverColor: 'hover:bg-[#e63e00]',
    getUrl: (data) =>
      `https://reddit.com/submit?url=${encodeURIComponent(data.url)}&title=${encodeURIComponent(data.title)}`,
  },
  pinterest: {
    name: 'Pinterest',
    icon: MessageCircle,
    color: 'bg-[#E60023]',
    hoverColor: 'hover:bg-[#cc001f]',
    getUrl: (data) => {
      const params = new URLSearchParams({
        url: data.url,
        description: data.title,
        ...(data.image && { media: data.image }),
      });
      return `https://pinterest.com/pin/create/button/?${params}`;
    },
  },
  email: {
    name: 'Email',
    icon: Mail,
    color: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
    getUrl: (data) =>
      `mailto:?subject=${encodeURIComponent(data.title)}&body=${encodeURIComponent(`${data.description || ''}\n\n${data.url}`)}`,
  },
};

// Default platforms
const defaultPlatforms: Platform[] = [
  'twitter',
  'facebook',
  'linkedin',
  'whatsapp',
];

// Size configurations
const sizeConfig = {
  sm: {
    button: 'h-8 px-3 text-xs gap-1.5',
    icon: 'h-8 w-8',
    iconSize: 'h-4 w-4',
  },
  md: {
    button: 'h-10 px-4 text-sm gap-2',
    icon: 'h-10 w-10',
    iconSize: 'h-5 w-5',
  },
  lg: {
    button: 'h-12 px-5 text-base gap-2',
    icon: 'h-12 w-12',
    iconSize: 'h-6 w-6',
  },
};

// Format count for display
function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

// Copy to clipboard
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
}

// Share Button Component
function ShareButton({
  platform,
  data,
  count,
  showCount,
  showLabel,
  variant,
  size,
  onShare,
}: {
  platform: Platform;
  data: ShareData;
  count?: number;
  showCount: boolean;
  showLabel: boolean;
  variant: SocialShareProps['variant'];
  size: NonNullable<SocialShareProps['size']>;
  onShare?: (platform: string) => void;
}) {
  const config = platformConfig[platform];
  const Icon = config.icon;
  const sizeClasses = sizeConfig[size];

  const handleClick = () => {
    const url = config.getUrl(data);
    window.open(url, '_blank', 'noopener,noreferrer,width=600,height=400');
    onShare?.(platform);
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors',
          sizeClasses.iconSize
        )}
        aria-label={`Share on ${config.name}`}
      >
        <Icon className={sizeClasses.iconSize} />
        {showCount && count !== undefined && (
          <span className="text-xs">{formatCount(count)}</span>
        )}
      </button>
    );
  }

  if (variant === 'icons') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'flex items-center justify-center rounded-full text-white transition-colors',
          config.color,
          config.hoverColor,
          sizeClasses.icon
        )}
        aria-label={`Share on ${config.name}`}
      >
        <Icon className={sizeClasses.iconSize} />
      </button>
    );
  }

  // Default: buttons variant
  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center rounded-lg text-white transition-colors',
        config.color,
        config.hoverColor,
        sizeClasses.button
      )}
      aria-label={`Share on ${config.name}`}
    >
      <Icon className={sizeClasses.iconSize} />
      {showLabel && <span>{config.name}</span>}
      {showCount && count !== undefined && (
        <span className="ml-auto text-white/80">{formatCount(count)}</span>
      )}
    </button>
  );
}

// Native Share Button
function NativeShareButton({
  data,
  size,
  variant,
  onShare,
}: {
  data: ShareData;
  size: NonNullable<SocialShareProps['size']>;
  variant: SocialShareProps['variant'];
  onShare?: (platform: string) => void;
}) {
  const [isSupported, setIsSupported] = React.useState(false);
  const sizeClasses = sizeConfig[size];

  React.useEffect(() => {
    setIsSupported(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  if (!isSupported) return null;

  const handleShare = async () => {
    try {
      await navigator.share({
        title: data.title,
        text: data.description,
        url: data.url,
      });
      onShare?.('native');
    } catch {
      // User cancelled
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleShare}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Share"
      >
        <Share2 className={sizeClasses.iconSize} />
      </button>
    );
  }

  if (variant === 'icons') {
    return (
      <button
        onClick={handleShare}
        className={cn(
          'flex items-center justify-center rounded-full bg-primary text-primary-foreground',
          'hover:bg-primary/90 transition-colors',
          sizeClasses.icon
        )}
        aria-label="Share"
      >
        <Share2 className={sizeClasses.iconSize} />
      </button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
        sizeClasses.button
      )}
    >
      <Share2 className={sizeClasses.iconSize} />
      <span>Share</span>
    </button>
  );
}

// Copy Link Button
function CopyLinkButton({
  url,
  size,
  variant,
  onShare,
}: {
  url: string;
  size: NonNullable<SocialShareProps['size']>;
  variant: SocialShareProps['variant'];
  onShare?: (platform: string) => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const sizeClasses = sizeConfig[size];

  const handleCopy = async () => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopied(true);
      onShare?.('copy');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const Icon = copied ? Check : Copy;

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'flex items-center gap-1 transition-colors',
          copied ? 'text-green-600' : 'text-muted-foreground hover:text-foreground'
        )}
        aria-label={copied ? 'Copied!' : 'Copy link'}
      >
        <Icon className={sizeClasses.iconSize} />
      </button>
    );
  }

  if (variant === 'icons') {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'flex items-center justify-center rounded-full transition-colors',
          copied
            ? 'bg-green-500 text-white'
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300',
          sizeClasses.icon
        )}
        aria-label={copied ? 'Copied!' : 'Copy link'}
      >
        <Icon className={sizeClasses.iconSize} />
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition-colors',
        copied
          ? 'bg-green-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
        sizeClasses.button
      )}
    >
      <Icon className={sizeClasses.iconSize} />
      <span>{copied ? 'Copied!' : 'Copy link'}</span>
    </button>
  );
}

// Main Social Share Component
export function SocialShare({
  data,
  counts,
  platforms = defaultPlatforms,
  showCounts = false,
  showLabels = true,
  showNativeShare = true,
  showCopyLink = true,
  variant = 'buttons',
  size = 'md',
  direction = 'horizontal',
  onShare,
  className,
}: SocialShareProps) {
  return (
    <div
      className={cn(
        'flex gap-2',
        direction === 'vertical' && 'flex-col',
        variant === 'buttons' && 'flex-wrap',
        className
      )}
      role="group"
      aria-label="Share on social media"
    >
      {/* Native share (mobile) */}
      {showNativeShare && (
        <NativeShareButton
          data={data}
          size={size}
          variant={variant}
          onShare={onShare}
        />
      )}

      {/* Platform buttons */}
      {platforms.map((platform) => (
        <ShareButton
          key={platform}
          platform={platform}
          data={data}
          count={counts?.[platform as keyof ShareCounts]}
          showCount={showCounts}
          showLabel={showLabels && variant === 'buttons'}
          variant={variant}
          size={size}
          onShare={onShare}
        />
      ))}

      {/* Copy link */}
      {showCopyLink && (
        <CopyLinkButton
          url={data.url}
          size={size}
          variant={variant}
          onShare={onShare}
        />
      )}

      {/* Total count */}
      {showCounts && counts?.total !== undefined && (
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="font-medium">{formatCount(counts.total)}</span>
          <span className="ml-1">shares</span>
        </div>
      )}
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { SocialShare } from '@/components/organisms/social-share';

export function ArticleFooter({ article }) {
  return (
    <SocialShare
      data={{
        url: `https://example.com/articles/${article.slug}`,
        title: article.title,
        description: article.excerpt,
      }}
      onShare={(platform) => {
        analytics.track('article_shared', {
          articleId: article.id,
          platform,
        });
      }}
    />
  );
}
```

### Icon-Only Variant

```tsx
<SocialShare
  data={shareData}
  variant="icons"
  platforms={['twitter', 'facebook', 'linkedin']}
/>
```

### With Share Counts

```tsx
<SocialShare
  data={shareData}
  showCounts
  counts={{
    twitter: 1234,
    facebook: 5678,
    total: 10000,
  }}
/>
```

### Vertical Layout

```tsx
<SocialShare
  data={shareData}
  direction="vertical"
  variant="icons"
  size="lg"
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Buttons ready for interaction | Standard button styling |
| Hover | User hovering over a share button | Platform-specific hover color |
| Copied | Link copied to clipboard | Check icon, green color, "Copied!" text |
| Sharing | Native share dialog active | System share sheet visible |
| Loading | Share counts being fetched | Skeleton or spinner on count badges |
| Disabled | Sharing not available | Muted colors, non-interactive |

## Anti-patterns

### 1. Opening Share Links in Same Tab

```tsx
// Bad: User loses their place
function ShareButton({ platform, data }) {
  const handleClick = () => {
    window.location.href = getShareUrl(platform, data);
  };

  return <button onClick={handleClick}>{platform}</button>;
}

// Good: Open in popup window
function ShareButton({ platform, data }) {
  const handleClick = () => {
    const url = getShareUrl(platform, data);
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return <button onClick={handleClick}>{platform}</button>;
}
```

### 2. Not Encoding Share URL Parameters

```tsx
// Bad: Special characters break the URL
function getTwitterUrl(data) {
  return `https://twitter.com/intent/tweet?text=${data.title}&url=${data.url}`;
}

// Good: Properly encode all parameters
function getTwitterUrl(data) {
  const params = new URLSearchParams({
    text: data.title,
    url: data.url,
    ...(data.hashtags?.length && { hashtags: data.hashtags.join(",") }),
  });
  return `https://twitter.com/intent/tweet?${params}`;
}
```

### 3. Not Providing Fallback for Native Share API

```tsx
// Bad: Breaks on unsupported browsers
function ShareButton({ data }) {
  const handleShare = async () => {
    await navigator.share(data); // Throws on desktop browsers!
  };

  return <button onClick={handleShare}>Share</button>;
}

// Good: Check support and provide fallback
function ShareButton({ data }) {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(typeof navigator !== "undefined" && !!navigator.share);
  }, []);

  if (!isSupported) {
    return <CopyLinkButton url={data.url} />;
  }

  return (
    <button onClick={() => navigator.share(data)}>
      Share
    </button>
  );
}
```

### 4. Missing Accessibility Labels

```tsx
// Bad: Icon-only buttons without labels
<div className="flex gap-2">
  <button onClick={shareTwitter}><Twitter /></button>
  <button onClick={shareFacebook}><Facebook /></button>
</div>

// Good: Proper aria-labels for screen readers
<div className="flex gap-2" role="group" aria-label="Share on social media">
  <button onClick={shareTwitter} aria-label="Share on Twitter">
    <Twitter className="h-4 w-4" />
  </button>
  <button onClick={shareFacebook} aria-label="Share on Facebook">
    <Facebook className="h-4 w-4" />
  </button>
</div>
```

## Related Skills

- `molecules/share-button` - Simple share button
- `patterns/share-api` - Web Share API
- `patterns/social-sharing` - Social sharing patterns

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Multiple platforms support
- Three variants (buttons, icons, minimal)
- Native Web Share API integration
- Copy link functionality
- Share counts display
