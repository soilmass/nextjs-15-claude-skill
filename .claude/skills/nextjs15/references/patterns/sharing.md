---
id: pt-sharing
name: Social Sharing
version: 1.1.0
layer: L5
category: social
description: Social sharing functionality for Next.js applications with Web Share API, platform-specific sharing, and analytics integration
tags: [social, sharing, twitter, facebook, linkedin, next15, react19, og-tags, meta]
composes:
  - ../atoms/input-button.md
  - ../organisms/dialog.md
  - ../atoms/input-text.md
  - ../molecules/toast.md
dependencies: []
formula: Share API + Fallback + Analytics = Cross-Platform Social Sharing
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Social Sharing

## Overview

Social sharing is a critical feature for content-driven applications that want to maximize reach and engagement. This pattern provides a comprehensive implementation for enabling users to share content across multiple platforms including Twitter/X, Facebook, LinkedIn, email, and native device sharing through the Web Share API.

The implementation follows a progressive enhancement approach: on devices that support the Web Share API (primarily mobile browsers and some desktop browsers), users get a native sharing experience that integrates with all apps on their device. On browsers without Web Share API support, a fallback dialog provides direct links to popular social platforms along with a copy-to-clipboard functionality.

This pattern also includes analytics tracking integration, allowing you to measure sharing behavior, understand which platforms are most popular with your audience, and track the viral coefficient of your content. The sharing components are fully accessible, supporting keyboard navigation and screen readers, and handle edge cases like long URLs, special characters, and failed share attempts gracefully.

## When to Use

- **Blog and content sharing**: Enable readers to share articles, tutorials, and news stories with their networks to increase organic reach and traffic
- **Product sharing in e-commerce**: Allow customers to share products they love with friends and family, driving word-of-mouth referrals
- **Social proof and engagement**: Encourage users to share their achievements, purchases, or milestones as social proof for your platform
- **Viral marketing campaigns**: Power referral programs and viral loops where users share content for rewards or recognition
- **Portfolio and creative work**: Help creators share their work samples, designs, or projects with potential clients or employers
- **Event and content promotion**: Enable sharing of event pages, webinars, podcasts, or video content to maximize attendance and viewership

## When NOT to Use

- **Private or authenticated content**: Never enable sharing for content that requires authentication or contains sensitive user data that could be exposed through shared URLs
- **Incomplete or draft content**: Avoid showing share buttons on draft states, preview modes, or content that isn't ready for public consumption
- **High-friction flows**: Don't interrupt critical user flows like checkout or signup with share prompts - wait until after completion
- **Content without proper OG tags**: Ensure pages have proper Open Graph metadata before enabling sharing, otherwise shared links will appear broken or unprofessional

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Social Sharing Architecture                                                       │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ ShareButton Component                                                        │ │
│  │                                                                              │ │
│  │  ┌──────────────────┐    ┌──────────────────────────────────────────────┐   │ │
│  │  │ Feature Detection │───▶│ Web Share API Check (navigator.share)       │   │ │
│  │  └──────────────────┘    └──────────────────────────────────────────────┘   │ │
│  │           │                              │                                   │ │
│  │           │                              │                                   │ │
│  │           ▼                              ▼                                   │ │
│  │  ┌──────────────────┐    ┌──────────────────────────────────────────────┐   │ │
│  │  │ Native Share     │    │ Fallback Dialog                               │   │ │
│  │  │ (Mobile/PWA)     │    │                                               │   │ │
│  │  │                  │    │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  │   │ │
│  │  │ - Uses device    │    │  │Twitter │ │Facebook│ │LinkedIn│ │ Email  │  │   │ │
│  │  │   share sheet    │    │  │/X Share│ │ Share  │ │ Share  │ │ Share  │  │   │ │
│  │  │ - All apps       │    │  └────────┘ └────────┘ └────────┘ └────────┘  │   │ │
│  │  │   available      │    │                                               │   │ │
│  │  └──────────────────┘    │  ┌────────────────────────────────────────┐   │   │ │
│  │                          │  │ Copy Link to Clipboard                  │   │   │ │
│  │                          │  │ - Visual feedback on copy              │   │   │ │
│  │                          │  │ - Fallback for older browsers          │   │   │ │
│  │                          │  └────────────────────────────────────────┘   │   │ │
│  │                          └──────────────────────────────────────────────┘   │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                          │                                        │
│                                          ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Analytics Layer                                                              │ │
│  │  ├─ Track share attempts (platform, content type, user segment)             │ │
│  │  ├─ Track successful shares vs. cancelled shares                            │ │
│  │  ├─ Track copy-to-clipboard events                                          │ │
│  │  └─ Calculate viral coefficient and share-through rates                     │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │ Server-Side: Open Graph Metadata Generation                                  │ │
│  │  ├─ generateMetadata() with og:title, og:description, og:image              │ │
│  │  ├─ Twitter Card meta tags (twitter:card, twitter:image)                    │ │
│  │  └─ Canonical URLs and structured data                                      │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Core Sharing Library

```typescript
// lib/sharing.ts
export interface ShareData {
  title: string;
  text?: string;
  url: string;
  image?: string;
  hashtags?: string[];
  via?: string; // Twitter username without @
}

export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'email' | 'copy' | 'whatsapp' | 'telegram' | 'reddit';

export interface ShareResult {
  success: boolean;
  platform: SharePlatform | 'native';
  error?: string;
}

/**
 * Check if the Web Share API is available
 */
export function canUseWebShare(): boolean {
  if (typeof window === 'undefined') return false;
  return 'share' in navigator && typeof navigator.share === 'function';
}

/**
 * Check if the Web Share API can share files (images, etc.)
 */
export function canShareFiles(): boolean {
  if (typeof window === 'undefined') return false;
  return 'canShare' in navigator && typeof navigator.canShare === 'function';
}

/**
 * Attempt to use native sharing via Web Share API
 */
export async function nativeShare(data: ShareData): Promise<ShareResult> {
  if (!canUseWebShare()) {
    return { success: false, platform: 'native', error: 'Web Share API not supported' };
  }

  try {
    await navigator.share({
      title: data.title,
      text: data.text,
      url: data.url,
    });
    return { success: true, platform: 'native' };
  } catch (error) {
    const err = error as Error;
    // User cancelled is not an error
    if (err.name === 'AbortError') {
      return { success: false, platform: 'native', error: 'cancelled' };
    }
    return { success: false, platform: 'native', error: err.message };
  }
}

/**
 * Generate share URL for a specific platform
 */
export function getShareUrl(platform: SharePlatform, data: ShareData): string {
  const encodedUrl = encodeURIComponent(data.url);
  const encodedTitle = encodeURIComponent(data.title);
  const encodedText = encodeURIComponent(data.text || data.title);
  const hashtags = data.hashtags?.join(',') || '';

  switch (platform) {
    case 'twitter':
      let twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
      if (hashtags) twitterUrl += `&hashtags=${encodeURIComponent(hashtags)}`;
      if (data.via) twitterUrl += `&via=${encodeURIComponent(data.via)}`;
      return twitterUrl;

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case 'whatsapp':
      return `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;

    case 'telegram':
      return `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

    case 'reddit':
      return `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`;

    case 'email':
      const subject = encodeURIComponent(data.title);
      const body = encodeURIComponent(`${data.text || ''}\n\n${data.url}`);
      return `mailto:?subject=${subject}&body=${body}`;

    default:
      return data.url;
  }
}

/**
 * Copy text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // Modern Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to legacy method
    }
  }

  // Legacy fallback using execCommand
  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Open share URL in a popup window
 */
export function openSharePopup(url: string, platform: SharePlatform): Window | null {
  const width = 600;
  const height = 400;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    url,
    `share-${platform}`,
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
  );
}

/**
 * Get platform display info
 */
export function getPlatformInfo(platform: SharePlatform) {
  const platforms: Record<SharePlatform, { name: string; color: string }> = {
    twitter: { name: 'X (Twitter)', color: '#000000' },
    facebook: { name: 'Facebook', color: '#1877F2' },
    linkedin: { name: 'LinkedIn', color: '#0A66C2' },
    whatsapp: { name: 'WhatsApp', color: '#25D366' },
    telegram: { name: 'Telegram', color: '#0088CC' },
    reddit: { name: 'Reddit', color: '#FF4500' },
    email: { name: 'Email', color: '#EA4335' },
    copy: { name: 'Copy Link', color: '#6B7280' },
  };
  return platforms[platform];
}
```

### Share Button Component

```typescript
// components/share-button.tsx
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Share2,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  Link,
  Check,
  MessageCircle,
  Send,
} from 'lucide-react';
import {
  ShareData,
  SharePlatform,
  canUseWebShare,
  nativeShare,
  getShareUrl,
  copyToClipboard,
  openSharePopup,
} from '@/lib/sharing';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  data: ShareData;
  onShare?: (platform: SharePlatform | 'native', success: boolean) => void;
  variant?: 'default' | 'outline' | 'ghost' | 'icon';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  showLabel?: boolean;
  platforms?: SharePlatform[];
}

const platformIcons: Record<SharePlatform, React.ComponentType<{ className?: string }>> = {
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
  telegram: Send,
  reddit: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
    </svg>
  ),
  email: Mail,
  copy: Link,
};

const defaultPlatforms: SharePlatform[] = ['twitter', 'facebook', 'linkedin', 'email'];

export function ShareButton({
  data,
  onShare,
  variant = 'outline',
  size = 'default',
  className,
  showLabel = true,
  platforms = defaultPlatforms,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const handleNativeShare = useCallback(async () => {
    const result = await nativeShare(data);
    if (result.success) {
      onShare?.('native', true);
    } else if (result.error !== 'cancelled') {
      // Web Share API not supported or failed, open fallback dialog
      setOpen(true);
    }
  }, [data, onShare]);

  const handlePlatformShare = useCallback(
    async (platform: SharePlatform) => {
      if (platform === 'copy') {
        const success = await copyToClipboard(data.url);
        if (success) {
          setCopied(true);
          toast.success('Link copied to clipboard');
          setTimeout(() => setCopied(false), 2000);
          onShare?.('copy', true);
        } else {
          toast.error('Failed to copy link');
          onShare?.('copy', false);
        }
      } else if (platform === 'email') {
        window.location.href = getShareUrl(platform, data);
        onShare?.('email', true);
      } else {
        const popup = openSharePopup(getShareUrl(platform, data), platform);
        onShare?.(platform, !!popup);
      }
    },
    [data, onShare]
  );

  // Use native share on supported devices
  if (canUseWebShare()) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={handleNativeShare}
        className={className}
        aria-label="Share this content"
      >
        <Share2 className="h-4 w-4" />
        {showLabel && size !== 'icon' && <span className="ml-2">Share</span>}
      </Button>
    );
  }

  // Fallback dialog for desktop
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={className}
          aria-label="Share this content"
        >
          <Share2 className="h-4 w-4" />
          {showLabel && size !== 'icon' && <span className="ml-2">Share</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share this content</DialogTitle>
          <DialogDescription>
            Share &quot;{data.title}&quot; with your network
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-4 gap-3 py-4">
          {platforms.map((platform) => {
            const Icon = platformIcons[platform];
            return (
              <Button
                key={platform}
                variant="outline"
                size="lg"
                className="flex flex-col gap-2 h-auto py-4"
                onClick={() => handlePlatformShare(platform)}
                aria-label={`Share on ${platform}`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs capitalize">{platform}</span>
              </Button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            type="text"
            value={data.url}
            readOnly
            className="flex-1"
            aria-label="Share URL"
          />
          <Button
            onClick={() => handlePlatformShare('copy')}
            variant="secondary"
            aria-label={copied ? 'Link copied' : 'Copy link'}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Link className="h-4 w-4" />
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

### Inline Share Buttons Variant

```typescript
// components/inline-share-buttons.tsx
'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Twitter, Facebook, Linkedin, Link, Check } from 'lucide-react';
import {
  ShareData,
  SharePlatform,
  getShareUrl,
  copyToClipboard,
  openSharePopup,
  getPlatformInfo,
} from '@/lib/sharing';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface InlineShareButtonsProps {
  data: ShareData;
  onShare?: (platform: SharePlatform, success: boolean) => void;
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  showCopy?: boolean;
}

export function InlineShareButtons({
  data,
  onShare,
  className,
  size = 'default',
  showCopy = true,
}: InlineShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(
    async (platform: SharePlatform) => {
      if (platform === 'copy') {
        const success = await copyToClipboard(data.url);
        if (success) {
          setCopied(true);
          toast.success('Link copied!');
          setTimeout(() => setCopied(false), 2000);
        }
        onShare?.('copy', success);
      } else {
        const popup = openSharePopup(getShareUrl(platform, data), platform);
        onShare?.(platform, !!popup);
      }
    },
    [data, onShare]
  );

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  const buttonSize = size === 'sm' ? 'h-8 w-8' : size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';

  const platforms: { platform: SharePlatform; icon: typeof Twitter; hoverColor: string }[] = [
    { platform: 'twitter', icon: Twitter, hoverColor: 'hover:text-black hover:bg-gray-100' },
    { platform: 'facebook', icon: Facebook, hoverColor: 'hover:text-[#1877F2] hover:bg-blue-50' },
    { platform: 'linkedin', icon: Linkedin, hoverColor: 'hover:text-[#0A66C2] hover:bg-blue-50' },
  ];

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {platforms.map(({ platform, icon: Icon, hoverColor }) => (
        <Tooltip key={platform}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(buttonSize, hoverColor)}
              onClick={() => handleShare(platform)}
              aria-label={`Share on ${getPlatformInfo(platform).name}`}
            >
              <Icon className={iconSize} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share on {getPlatformInfo(platform).name}</TooltipContent>
        </Tooltip>
      ))}
      {showCopy && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(buttonSize, 'hover:bg-gray-100')}
              onClick={() => handleShare('copy')}
              aria-label={copied ? 'Link copied' : 'Copy link'}
            >
              {copied ? (
                <Check className={cn(iconSize, 'text-green-500')} />
              ) : (
                <Link className={iconSize} />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copied ? 'Copied!' : 'Copy link'}</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
```

### Server-Side Open Graph Metadata

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { ShareButton } from '@/components/share-button';
import { InlineShareButtons } from '@/components/inline-share-buttons';
import { getPost } from '@/lib/posts';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) return {};

  const url = `https://example.com/blog/${slug}`;

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: 'My Blog',
      images: [
        {
          url: post.coverImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      creator: '@yourtwitterhandle',
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  const shareData = {
    title: post.title,
    text: post.excerpt,
    url: `https://example.com/blog/${slug}`,
    image: post.coverImage,
    hashtags: post.tags,
    via: 'yourtwitterhandle',
  };

  return (
    <article className="max-w-3xl mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground">
            By {post.author.name} on {new Date(post.publishedAt).toLocaleDateString()}
          </div>
          <InlineShareButtons data={shareData} />
        </div>
      </header>

      <div className="prose prose-lg" dangerouslySetInnerHTML={{ __html: post.content }} />

      <footer className="mt-12 pt-8 border-t">
        <div className="flex items-center justify-between">
          <p className="text-lg font-medium">Enjoyed this article? Share it!</p>
          <ShareButton
            data={shareData}
            platforms={['twitter', 'facebook', 'linkedin', 'whatsapp', 'email']}
          />
        </div>
      </footer>
    </article>
  );
}
```

## Examples

### Example 1: E-commerce Product Sharing

```typescript
// app/products/[slug]/page.tsx
import { ShareButton } from '@/components/share-button';
import { trackShare } from '@/lib/analytics';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);

  const shareData = {
    title: `Check out ${product.name}!`,
    text: `I found this amazing ${product.name} for ${formatPrice(product.price)}`,
    url: `https://store.example.com/products/${slug}`,
    image: product.images[0],
  };

  const handleShare = (platform: string, success: boolean) => {
    if (success) {
      trackShare({
        contentType: 'product',
        contentId: product.id,
        platform,
        value: product.price,
      });
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <ProductGallery images={product.images} />
      <div>
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-2xl font-semibold mt-2">{formatPrice(product.price)}</p>

        <div className="flex gap-4 mt-6">
          <AddToCartButton product={product} />
          <ShareButton
            data={shareData}
            onShare={handleShare}
            variant="outline"
          />
        </div>
      </div>
    </div>
  );
}
```

### Example 2: Achievement/Milestone Sharing

```typescript
// components/achievement-share.tsx
'use client';

import { ShareButton } from '@/components/share-button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface AchievementShareProps {
  achievement: {
    id: string;
    title: string;
    description: string;
    earnedAt: Date;
    imageUrl: string;
  };
  username: string;
}

export function AchievementShare({ achievement, username }: AchievementShareProps) {
  const shareData = {
    title: `I just earned "${achievement.title}"!`,
    text: `${achievement.description} - Achieved on ${achievement.earnedAt.toLocaleDateString()}`,
    url: `https://app.example.com/achievements/${achievement.id}?ref=${username}`,
    image: achievement.imageUrl,
    hashtags: ['achievement', 'milestone'],
  };

  return (
    <Card className="max-w-md">
      <CardHeader className="text-center">
        <Trophy className="h-12 w-12 mx-auto text-yellow-500" />
        <CardTitle>{achievement.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">{achievement.description}</p>
      </CardContent>
      <CardFooter className="justify-center">
        <ShareButton
          data={shareData}
          platforms={['twitter', 'facebook', 'linkedin']}
          showLabel
        />
      </CardFooter>
    </Card>
  );
}
```

### Example 3: Event Sharing with Calendar Integration

```typescript
// components/event-share.tsx
'use client';

import { ShareButton } from '@/components/share-button';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Clock } from 'lucide-react';

interface EventShareProps {
  event: {
    id: string;
    title: string;
    description: string;
    date: Date;
    location: string;
    imageUrl: string;
  };
}

export function EventShare({ event }: EventShareProps) {
  const shareData = {
    title: `Join me at ${event.title}`,
    text: `${event.description}\n\nDate: ${event.date.toLocaleDateString()}\nLocation: ${event.location}`,
    url: `https://events.example.com/${event.id}`,
    image: event.imageUrl,
    hashtags: ['event'],
  };

  const addToCalendar = () => {
    const googleCalendarUrl = new URL('https://calendar.google.com/calendar/render');
    googleCalendarUrl.searchParams.set('action', 'TEMPLATE');
    googleCalendarUrl.searchParams.set('text', event.title);
    googleCalendarUrl.searchParams.set('dates', formatGoogleDate(event.date));
    googleCalendarUrl.searchParams.set('details', event.description);
    googleCalendarUrl.searchParams.set('location', event.location);
    window.open(googleCalendarUrl.toString(), '_blank');
  };

  return (
    <div className="space-y-4 p-6 border rounded-lg">
      <h2 className="text-2xl font-bold">{event.title}</h2>
      <div className="flex items-center gap-2 text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>{event.date.toLocaleDateString()}</span>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{event.location}</span>
      </div>
      <div className="flex gap-3 pt-4">
        <Button onClick={addToCalendar} variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Add to Calendar
        </Button>
        <ShareButton
          data={shareData}
          platforms={['twitter', 'facebook', 'whatsapp', 'email']}
        />
      </div>
    </div>
  );
}

function formatGoogleDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
```

## Anti-patterns

### Anti-pattern 1: Missing Open Graph Tags

```typescript
// BAD: No metadata, shared links look broken
// app/blog/[slug]/page.tsx
export default async function BlogPost({ params }: Props) {
  const post = await getPost(params.slug);
  return <article>{post.content}</article>;
}

// GOOD: Complete Open Graph metadata
// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://example.com/blog/${slug}`,
      images: [{ url: post.coverImage, width: 1200, height: 630 }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  return <article>{post.content}</article>;
}
```

### Anti-pattern 2: Not Tracking Share Analytics

```typescript
// BAD: No tracking, no insights
<ShareButton data={shareData} />

// GOOD: Track shares for analytics
import { trackEvent } from '@/lib/analytics';

<ShareButton
  data={shareData}
  onShare={(platform, success) => {
    if (success) {
      trackEvent('content_shared', {
        platform,
        content_type: 'article',
        content_id: post.id,
        content_title: post.title,
      });
    }
  }}
/>
```

### Anti-pattern 3: Hardcoded Share URLs

```typescript
// BAD: Hardcoded URL that breaks in different environments
const shareData = {
  title: post.title,
  url: 'https://mysite.com/blog/' + slug, // Wrong in staging/dev
};

// GOOD: Dynamic URL based on environment or request
import { headers } from 'next/headers';

async function getShareUrl(path: string): Promise<string> {
  // Option 1: Environment variable
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Option 2: From request headers (for SSR)
  const headersList = await headers();
  const host = headersList.get('host');
  const protocol = headersList.get('x-forwarded-proto') || 'https';

  return `${protocol}://${host}${path}`;
}

const shareData = {
  title: post.title,
  url: await getShareUrl(`/blog/${slug}`),
};
```

### Anti-pattern 4: Sharing Private Content

```typescript
// BAD: Share button on authenticated content
export default async function PrivateDashboard() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1>Your Private Data</h1>
      <ShareButton data={{ title: 'My Dashboard', url: '/dashboard' }} />
    </div>
  );
}

// GOOD: Only show share for public content
export default async function PrivateDashboard() {
  const user = await getCurrentUser();
  return (
    <div>
      <h1>Your Private Data</h1>
      {/* No share button - content requires authentication */}
    </div>
  );
}

// For shareable public profiles
export default async function PublicProfile({ params }: Props) {
  const profile = await getPublicProfile(params.username);
  return (
    <div>
      <h1>{profile.name}</h1>
      <ShareButton
        data={{
          title: `${profile.name}'s Profile`,
          url: `https://example.com/@${params.username}`,
        }}
      />
    </div>
  );
}
```

## Testing

### Unit Tests for Sharing Utilities

```typescript
// __tests__/lib/sharing.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  canUseWebShare,
  getShareUrl,
  copyToClipboard,
  nativeShare,
} from '@/lib/sharing';

describe('sharing utilities', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('canUseWebShare', () => {
    it('returns false when navigator.share is not available', () => {
      const originalNavigator = global.navigator;
      // @ts-ignore
      delete global.navigator.share;
      expect(canUseWebShare()).toBe(false);
      global.navigator = originalNavigator;
    });

    it('returns true when navigator.share is available', () => {
      Object.defineProperty(global.navigator, 'share', {
        value: vi.fn(),
        writable: true,
      });
      expect(canUseWebShare()).toBe(true);
    });
  });

  describe('getShareUrl', () => {
    const testData = {
      title: 'Test Title',
      text: 'Test description',
      url: 'https://example.com/test',
    };

    it('generates correct Twitter share URL', () => {
      const url = getShareUrl('twitter', testData);
      expect(url).toContain('twitter.com/intent/tweet');
      expect(url).toContain('url=https%3A%2F%2Fexample.com%2Ftest');
      expect(url).toContain('text=Test%20Title');
    });

    it('generates correct Twitter URL with hashtags and via', () => {
      const url = getShareUrl('twitter', {
        ...testData,
        hashtags: ['nextjs', 'react'],
        via: 'myhandle',
      });
      expect(url).toContain('hashtags=nextjs%2Creact');
      expect(url).toContain('via=myhandle');
    });

    it('generates correct Facebook share URL', () => {
      const url = getShareUrl('facebook', testData);
      expect(url).toContain('facebook.com/sharer/sharer.php');
      expect(url).toContain('u=https%3A%2F%2Fexample.com%2Ftest');
    });

    it('generates correct LinkedIn share URL', () => {
      const url = getShareUrl('linkedin', testData);
      expect(url).toContain('linkedin.com/sharing/share-offsite');
    });

    it('generates correct email share URL', () => {
      const url = getShareUrl('email', testData);
      expect(url).toContain('mailto:');
      expect(url).toContain('subject=Test%20Title');
      expect(url).toContain('body=');
    });

    it('generates correct WhatsApp share URL', () => {
      const url = getShareUrl('whatsapp', testData);
      expect(url).toContain('api.whatsapp.com/send');
    });
  });

  describe('copyToClipboard', () => {
    it('uses Clipboard API when available', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText },
        writable: true,
      });

      const result = await copyToClipboard('test text');

      expect(writeText).toHaveBeenCalledWith('test text');
      expect(result).toBe(true);
    });

    it('falls back to execCommand when Clipboard API fails', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: vi.fn().mockRejectedValue(new Error()) },
        writable: true,
      });

      document.execCommand = vi.fn().mockReturnValue(true);

      const result = await copyToClipboard('test text');

      expect(document.execCommand).toHaveBeenCalledWith('copy');
      expect(result).toBe(true);
    });
  });

  describe('nativeShare', () => {
    it('returns success when share completes', async () => {
      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockResolvedValue(undefined),
        writable: true,
      });

      const result = await nativeShare({
        title: 'Test',
        url: 'https://example.com',
      });

      expect(result.success).toBe(true);
      expect(result.platform).toBe('native');
    });

    it('handles user cancellation gracefully', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';

      Object.defineProperty(navigator, 'share', {
        value: vi.fn().mockRejectedValue(abortError),
        writable: true,
      });

      const result = await nativeShare({
        title: 'Test',
        url: 'https://example.com',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('cancelled');
    });
  });
});
```

### Component Integration Tests

```typescript
// __tests__/components/share-button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareButton } from '@/components/share-button';

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('ShareButton', () => {
  const defaultProps = {
    data: {
      title: 'Test Article',
      text: 'This is a test article',
      url: 'https://example.com/test',
    },
  };

  it('renders share button', () => {
    render(<ShareButton {...defaultProps} />);
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('opens dialog on click when Web Share API is not available', async () => {
    const user = userEvent.setup();
    render(<ShareButton {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /share/i }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Share this content')).toBeInTheDocument();
  });

  it('shows platform buttons in dialog', async () => {
    const user = userEvent.setup();
    render(<ShareButton {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /share/i }));

    expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /facebook/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /linkedin/i })).toBeInTheDocument();
  });

  it('copies URL to clipboard when copy button is clicked', async () => {
    const user = userEvent.setup();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
    });

    render(<ShareButton {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByRole('button', { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith('https://example.com/test');
  });

  it('calls onShare callback when sharing', async () => {
    const onShare = vi.fn();
    const user = userEvent.setup();

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
    });

    render(<ShareButton {...defaultProps} onShare={onShare} />);

    await user.click(screen.getByRole('button', { name: /share/i }));
    await user.click(screen.getByRole('button', { name: /copy/i }));

    await waitFor(() => {
      expect(onShare).toHaveBeenCalledWith('copy', true);
    });
  });

  it('respects custom platforms prop', async () => {
    const user = userEvent.setup();
    render(
      <ShareButton
        {...defaultProps}
        platforms={['twitter', 'email']}
      />
    );

    await user.click(screen.getByRole('button', { name: /share/i }));

    expect(screen.getByRole('button', { name: /twitter/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /email/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /facebook/i })).not.toBeInTheDocument();
  });
});
```

## Related Skills

- [Analytics Integration](./analytics.md) - Track share events and measure viral coefficient
- [Toast Notifications](../molecules/toast.md) - Show feedback when link is copied
- [Dialog Component](../organisms/dialog.md) - Fallback share dialog implementation
- [Meta Tags & SEO](./seo.md) - Open Graph and Twitter Card configuration
- [Clipboard API](./clipboard.md) - Copy to clipboard functionality
- [Button Component](../atoms/input-button.md) - Base button styling and variants

---

## Changelog

### 1.1.0 (2025-01-18)
- Added WhatsApp, Telegram, and Reddit sharing support
- Added inline share buttons variant component
- Added comprehensive Open Graph metadata generation example
- Added achievement sharing example
- Added event sharing with calendar integration example
- Expanded anti-patterns section with code examples
- Added unit tests for sharing utilities
- Added component integration tests
- Improved accessibility with proper ARIA labels
- Added platform-specific hover colors
- Enhanced documentation with composition diagram

### 1.0.0 (2025-01-15)
- Initial implementation
- Web Share API support
- Platform-specific share URLs
- Copy to clipboard fallback
