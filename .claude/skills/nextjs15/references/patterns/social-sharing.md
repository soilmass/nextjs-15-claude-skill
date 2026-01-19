---
id: pt-social-sharing
name: Social Sharing
version: 2.0.0
layer: L5
category: data
description: Share content to social media platforms with custom formatting
tags: [share, social, twitter, facebook, linkedin, pinterest, whatsapp]
composes: []
formula: "SocialSharing = PlatformURLs + ShareDialog + CopyToClipboard + OpenGraphMeta"
dependencies:
  - react
  - next
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: neutral
  cls: neutral
---

# Social Sharing

## Overview

Enable sharing content to social media platforms with customizable share dialogs, copy link functionality, and native Web Share API support.

## When to Use

- Adding share buttons to blog posts or articles
- Enabling product sharing for e-commerce
- Building viral content distribution features
- Implementing referral programs
- Need for cross-platform social engagement

## Composition Diagram

```
[Share Content] --> [useShare Hook]
                          |
            +-------------+-------------+
            |             |             |
      [Native Share] [Platform URLs] [Clipboard]
            |             |             |
      [Web Share API] [Share Dialog] [Copy Link]
            |             |             |
            +-------------+-------------+
                          |
                  [Platform Selection]
                          |
      +---+---+---+---+---+---+
      |   |   |   |   |   |   |
    [TW][FB][LI][WA][TG][Email]
                          |
                  [Share Tracking]
```

## Implementation

### Share Types

```tsx
// lib/share/types.ts
export interface ShareContent {
  url: string;
  title: string;
  description?: string;
  image?: string;
  hashtags?: string[];
  via?: string; // Twitter username
}

export type SharePlatform =
  | 'twitter'
  | 'facebook'
  | 'linkedin'
  | 'pinterest'
  | 'whatsapp'
  | 'telegram'
  | 'reddit'
  | 'email'
  | 'copy'
  | 'native';

export interface ShareResult {
  success: boolean;
  platform: SharePlatform;
  error?: string;
}
```

### Share Utilities

```tsx
// lib/share/utils.ts
import { ShareContent, SharePlatform } from './types';

export function generateShareUrl(platform: SharePlatform, content: ShareContent): string {
  const { url, title, description, image, hashtags, via } = content;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  switch (platform) {
    case 'twitter': {
      const params = new URLSearchParams({
        url: url,
        text: title,
      });
      if (hashtags?.length) {
        params.set('hashtags', hashtags.join(','));
      }
      if (via) {
        params.set('via', via);
      }
      return `https://twitter.com/intent/tweet?${params}`;
    }

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case 'linkedin': {
      const params = new URLSearchParams({
        url: url,
        title: title,
      });
      if (description) {
        params.set('summary', description);
      }
      return `https://www.linkedin.com/shareArticle?mini=true&${params}`;
    }

    case 'pinterest': {
      const params = new URLSearchParams({
        url: url,
        description: title,
      });
      if (image) {
        params.set('media', image);
      }
      return `https://pinterest.com/pin/create/button/?${params}`;
    }

    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;

    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

    case 'reddit':
      return `https://reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;

    case 'email': {
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(`${description || title}\n\n${url}`);
      return `mailto:?subject=${subject}&body=${body}`;
    }

    default:
      return url;
  }
}

export function openShareWindow(url: string, platform: SharePlatform): void {
  const width = 600;
  const height = 400;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  window.open(
    url,
    `share-${platform}`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
  );
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

export function canUseNativeShare(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator;
}

export async function nativeShare(content: ShareContent): Promise<boolean> {
  if (!canUseNativeShare()) return false;

  try {
    await navigator.share({
      title: content.title,
      text: content.description,
      url: content.url,
    });
    return true;
  } catch (error) {
    // User cancelled or share failed
    return false;
  }
}
```

### Share Hook

```tsx
// hooks/use-share.ts
'use client';

import { useState, useCallback } from 'react';
import {
  ShareContent,
  SharePlatform,
  ShareResult,
} from '@/lib/share/types';
import {
  generateShareUrl,
  openShareWindow,
  copyToClipboard,
  nativeShare,
  canUseNativeShare,
} from '@/lib/share/utils';

interface UseShareOptions {
  onShare?: (result: ShareResult) => void;
  onError?: (error: Error) => void;
}

export function useShare(options: UseShareOptions = {}) {
  const [isSharing, setIsSharing] = useState(false);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);

  const share = useCallback(
    async (platform: SharePlatform, content: ShareContent): Promise<ShareResult> => {
      setIsSharing(true);

      try {
        let success = false;

        switch (platform) {
          case 'native':
            success = await nativeShare(content);
            break;

          case 'copy':
            success = await copyToClipboard(content.url);
            break;

          case 'email': {
            const url = generateShareUrl(platform, content);
            window.location.href = url;
            success = true;
            break;
          }

          default: {
            const url = generateShareUrl(platform, content);
            openShareWindow(url, platform);
            success = true;
          }
        }

        const result: ShareResult = { success, platform };
        setLastResult(result);
        options.onShare?.(result);
        return result;
      } catch (error) {
        const result: ShareResult = {
          success: false,
          platform,
          error: error instanceof Error ? error.message : 'Share failed',
        };
        setLastResult(result);
        options.onError?.(error instanceof Error ? error : new Error('Share failed'));
        return result;
      } finally {
        setIsSharing(false);
      }
    },
    [options]
  );

  return {
    share,
    isSharing,
    lastResult,
    canUseNativeShare: canUseNativeShare(),
  };
}
```

### Share Buttons Component

```tsx
// components/share-buttons.tsx
'use client';

import { useState } from 'react';
import {
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Mail,
  Share2,
  MessageCircle,
  Check,
} from 'lucide-react';
import { useShare } from '@/hooks/use-share';
import { ShareContent, SharePlatform } from '@/lib/share/types';

interface ShareButton {
  platform: SharePlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const shareButtons: ShareButton[] = [
  {
    platform: 'twitter',
    label: 'Twitter',
    icon: <Twitter className="w-5 h-5" />,
    color: 'bg-[#1DA1F2]',
    hoverColor: 'hover:bg-[#1a8cd8]',
  },
  {
    platform: 'facebook',
    label: 'Facebook',
    icon: <Facebook className="w-5 h-5" />,
    color: 'bg-[#1877F2]',
    hoverColor: 'hover:bg-[#166FE5]',
  },
  {
    platform: 'linkedin',
    label: 'LinkedIn',
    icon: <Linkedin className="w-5 h-5" />,
    color: 'bg-[#0A66C2]',
    hoverColor: 'hover:bg-[#095196]',
  },
  {
    platform: 'whatsapp',
    label: 'WhatsApp',
    icon: <MessageCircle className="w-5 h-5" />,
    color: 'bg-[#25D366]',
    hoverColor: 'hover:bg-[#20BD5A]',
  },
  {
    platform: 'email',
    label: 'Email',
    icon: <Mail className="w-5 h-5" />,
    color: 'bg-gray-600',
    hoverColor: 'hover:bg-gray-700',
  },
  {
    platform: 'copy',
    label: 'Copy Link',
    icon: <Link2 className="w-5 h-5" />,
    color: 'bg-gray-500',
    hoverColor: 'hover:bg-gray-600',
  },
];

interface ShareButtonsProps {
  content: ShareContent;
  platforms?: SharePlatform[];
  showLabels?: boolean;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  showNative?: boolean;
  className?: string;
}

export function ShareButtons({
  content,
  platforms = ['twitter', 'facebook', 'linkedin', 'copy'],
  showLabels = false,
  layout = 'horizontal',
  size = 'md',
  showNative = true,
  className = '',
}: ShareButtonsProps) {
  const { share, canUseNativeShare } = useShare();
  const [copiedRecently, setCopiedRecently] = useState(false);

  const handleShare = async (platform: SharePlatform) => {
    const result = await share(platform, content);
    
    if (platform === 'copy' && result.success) {
      setCopiedRecently(true);
      setTimeout(() => setCopiedRecently(false), 2000);
    }
  };

  const filteredButtons = shareButtons.filter((btn) => platforms.includes(btn.platform));

  const sizeClasses = {
    sm: 'p-2',
    md: 'p-2.5',
    lg: 'p-3',
  };

  return (
    <div
      className={`flex gap-2 ${layout === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'} ${className}`}
    >
      {showNative && canUseNativeShare && (
        <button
          onClick={() => handleShare('native')}
          className={`
            flex items-center justify-center gap-2 rounded-lg text-white
            bg-blue-600 hover:bg-blue-700 transition-colors
            ${sizeClasses[size]}
            ${showLabels ? 'px-4' : ''}
          `}
          title="Share"
        >
          <Share2 className="w-5 h-5" />
          {showLabels && <span>Share</span>}
        </button>
      )}

      {filteredButtons.map((btn) => (
        <button
          key={btn.platform}
          onClick={() => handleShare(btn.platform)}
          className={`
            flex items-center justify-center gap-2 rounded-lg text-white transition-colors
            ${btn.color} ${btn.hoverColor}
            ${sizeClasses[size]}
            ${showLabels ? 'px-4' : ''}
          `}
          title={btn.label}
        >
          {btn.platform === 'copy' && copiedRecently ? (
            <Check className="w-5 h-5" />
          ) : (
            btn.icon
          )}
          {showLabels && (
            <span>
              {btn.platform === 'copy' && copiedRecently ? 'Copied!' : btn.label}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
```

### Share Dialog Component

```tsx
// components/share-dialog.tsx
'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import {
  X,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  Mail,
  MessageCircle,
  Send,
  Check,
  Copy,
} from 'lucide-react';
import { ShareContent, SharePlatform } from '@/lib/share/types';
import { useShare } from '@/hooks/use-share';

interface ShareDialogProps {
  content: ShareContent;
  trigger: React.ReactNode;
  title?: string;
}

const platforms: {
  id: SharePlatform;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { id: 'twitter', label: 'Twitter', icon: <Twitter />, color: 'text-[#1DA1F2]' },
  { id: 'facebook', label: 'Facebook', icon: <Facebook />, color: 'text-[#1877F2]' },
  { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin />, color: 'text-[#0A66C2]' },
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle />, color: 'text-[#25D366]' },
  { id: 'telegram', label: 'Telegram', icon: <Send />, color: 'text-[#0088cc]' },
  { id: 'email', label: 'Email', icon: <Mail />, color: 'text-gray-600' },
];

export function ShareDialog({
  content,
  trigger,
  title = 'Share this',
}: ShareDialogProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { share } = useShare();

  const handleShare = async (platform: SharePlatform) => {
    await share(platform, content);
    if (platform !== 'copy') {
      setOpen(false);
    }
  };

  const handleCopy = async () => {
    const result = await share('copy', content);
    if (result.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 bg-white sm:rounded-xl rounded-t-xl shadow-xl w-full sm:max-w-md p-6 data-[state=open]:animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-xl font-semibold">{title}</Dialog.Title>
            <Dialog.Close className="p-1 rounded-md hover:bg-gray-100">
              <X className="w-5 h-5" />
            </Dialog.Close>
          </div>

          {/* Share preview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-sm line-clamp-2">{content.title}</h3>
            {content.description && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {content.description}
              </p>
            )}
          </div>

          {/* Platform buttons */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => handleShare(platform.id)}
                className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${platform.color}`}>
                  {platform.icon}
                </div>
                <span className="text-xs text-gray-600">{platform.label}</span>
              </button>
            ))}
          </div>

          {/* Copy link */}
          <div className="flex gap-2">
            <input
              type="text"
              value={content.url}
              readOnly
              className="flex-1 px-3 py-2 border rounded-lg bg-gray-50 text-sm text-gray-600"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                copied
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

### Share Count Display

```tsx
// components/share-count.tsx
'use client';

import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';

interface ShareCountProps {
  url: string;
  className?: string;
}

interface ShareCounts {
  facebook?: number;
  pinterest?: number;
  total: number;
}

export function ShareCount({ url, className }: ShareCountProps) {
  const [counts, setCounts] = useState<ShareCounts | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const response = await fetch(`/api/share-count?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          setCounts(data);
        }
      } catch (error) {
        console.error('Failed to fetch share counts:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCounts();
  }, [url]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1 text-gray-400 ${className}`}>
        <Share2 className="w-4 h-4" />
        <span className="text-sm">-</span>
      </div>
    );
  }

  if (!counts) return null;

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  return (
    <div className={`flex items-center gap-1 text-gray-600 ${className}`}>
      <Share2 className="w-4 h-4" />
      <span className="text-sm font-medium">{formatCount(counts.total)}</span>
      <span className="text-sm text-gray-400">shares</span>
    </div>
  );
}
```

### Share Count API Route

```tsx
// app/api/share-count/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'URL required' }, { status: 400 });
  }

  try {
    const counts = await getShareCounts(url);
    return NextResponse.json(counts);
  } catch (error) {
    return NextResponse.json({ total: 0 }, { status: 200 });
  }
}

async function getShareCounts(url: string) {
  const counts = {
    facebook: 0,
    pinterest: 0,
    total: 0,
  };

  // Facebook Graph API (requires app access token)
  try {
    const fbResponse = await fetch(
      `https://graph.facebook.com/?id=${encodeURIComponent(url)}&fields=engagement&access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`
    );
    if (fbResponse.ok) {
      const fbData = await fbResponse.json();
      counts.facebook = fbData.engagement?.share_count || 0;
    }
  } catch {}

  // Pinterest
  try {
    const pinterestResponse = await fetch(
      `https://api.pinterest.com/v1/urls/count.json?url=${encodeURIComponent(url)}`
    );
    if (pinterestResponse.ok) {
      const pinterestData = await pinterestResponse.json();
      counts.pinterest = pinterestData.count || 0;
    }
  } catch {}

  counts.total = counts.facebook + counts.pinterest;

  return counts;
}
```

### Open Graph Meta Component

```tsx
// components/open-graph-meta.tsx
import { ShareContent } from '@/lib/share/types';

interface OpenGraphMetaProps extends ShareContent {
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  twitterSite?: string;
}

export function generateOpenGraphMeta({
  url,
  title,
  description,
  image,
  type = 'website',
  siteName,
  twitterCard = 'summary_large_image',
  twitterSite,
}: OpenGraphMetaProps) {
  return {
    openGraph: {
      type,
      url,
      title,
      description,
      siteName,
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: twitterCard,
      site: twitterSite,
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

// Usage in page.tsx metadata
// export const metadata = {
//   ...generateOpenGraphMeta({
//     url: 'https://example.com/article',
//     title: 'Article Title',
//     description: 'Article description',
//     image: 'https://example.com/og-image.jpg',
//   }),
// };
```

## Usage

```tsx
// app/article/[slug]/page.tsx
import { ShareButtons } from '@/components/share-buttons';
import { ShareDialog } from '@/components/share-dialog';
import { ShareCount } from '@/components/share-count';
import { Share2 } from 'lucide-react';
import { generateOpenGraphMeta } from '@/components/open-graph-meta';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  // Fetch article data
  const article = await getArticle(slug);
  
  return {
    title: article.title,
    description: article.excerpt,
    ...generateOpenGraphMeta({
      url: `https://example.com/article/${slug}`,
      title: article.title,
      description: article.excerpt,
      image: article.coverImage,
      type: 'article',
    }),
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  const shareContent = {
    url: `https://example.com/article/${slug}`,
    title: article.title,
    description: article.excerpt,
    image: article.coverImage,
    hashtags: article.tags,
  };

  return (
    <article className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
      
      <div className="flex items-center gap-4 mb-8">
        <ShareCount url={shareContent.url} />
        
        <ShareButtons
          content={shareContent}
          platforms={['twitter', 'facebook', 'linkedin', 'copy']}
          size="sm"
        />
        
        <ShareDialog
          content={shareContent}
          trigger={
            <button className="flex items-center gap-2 px-3 py-1.5 border rounded-lg hover:bg-gray-50">
              <Share2 className="w-4 h-4" />
              More
            </button>
          }
        />
      </div>

      <div className="prose max-w-none">
        {article.content}
      </div>
    </article>
  );
}

async function getArticle(slug: string) {
  // Fetch article from database
  return {
    title: 'Sample Article',
    excerpt: 'This is a sample article description.',
    content: 'Article content here...',
    coverImage: 'https://example.com/cover.jpg',
    tags: ['nextjs', 'react'],
  };
}
```

## Related Skills

- [[share-api]] - Web Share API
- [[open-graph]] - Open Graph metadata
- [[clipboard-api]] - Clipboard operations
- [[social-auth]] - Social authentication

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Multiple platform support
- Share dialog component
- Share count display
- Open Graph meta generation
