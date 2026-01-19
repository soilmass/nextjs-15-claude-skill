---
id: pt-share-api
name: Web Share API
version: 2.0.0
layer: L5
category: data
description: Web Share API implementation with fallback support
tags: [share, social, web-share-api, clipboard, mobile]
composes: []
formula: "WebShareAPI = NativeShare + ClipboardFallback + ShareDialog + FileSharing"
dependencies:
  - react
  - next
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: low
  cls: neutral
---

# Web Share API

## Overview

A comprehensive Web Share API implementation with fallback to clipboard copy and social share links for browsers that don't support native sharing.

## When to Use

- Mobile-first applications needing native share sheets
- Progressive web apps requiring sharing capabilities
- Sharing files (images, PDFs) directly from the browser
- Providing consistent share experience across platforms
- Need for graceful degradation on unsupported browsers

## Composition Diagram

```
[Share Request] --> [useShare Hook]
                          |
                  [canShare Check]
                          |
            +-------------+-------------+
            |                           |
      [Supported]              [Not Supported]
            |                           |
      [navigator.share]          [Fallback Logic]
            |                           |
      [Native Sheet]      +-------------+-------------+
            |             |                           |
      [User Action]  [Clipboard]              [Share Dialog]
                          |                           |
                  [Copy Text/URL]             [Social Links]
                          |                           |
                  [Success Toast]             [Open Window]
```

## Implementation

### Share Hook

```tsx
// lib/share/use-share.ts
'use client';

import { useState, useCallback } from 'react';

export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
  files?: File[];
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'clipboard' | 'fallback';
  error?: Error;
}

export function useShare() {
  const [isSharing, setIsSharing] = useState(false);

  const canShare = useCallback((data?: ShareData): boolean => {
    if (typeof navigator === 'undefined') return false;
    if (!navigator.share) return false;
    if (!data) return true;

    // Check if files can be shared
    if (data.files?.length && !navigator.canShare?.({ files: data.files })) {
      return false;
    }

    return true;
  }, []);

  const share = useCallback(
    async (data: ShareData): Promise<ShareResult> => {
      setIsSharing(true);

      try {
        // Try native Web Share API
        if (canShare(data)) {
          await navigator.share({
            title: data.title,
            text: data.text,
            url: data.url,
            files: data.files,
          });
          setIsSharing(false);
          return { success: true, method: 'native' };
        }

        // Fallback: Copy to clipboard
        const shareText = [data.title, data.text, data.url]
          .filter(Boolean)
          .join('\n');

        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          setIsSharing(false);
          return { success: true, method: 'clipboard' };
        }

        // Last resort: execCommand (deprecated but widely supported)
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setIsSharing(false);
        return { success: true, method: 'clipboard' };
      } catch (error) {
        setIsSharing(false);
        
        // User cancelled share
        if ((error as Error).name === 'AbortError') {
          return { success: false, method: 'native', error: error as Error };
        }

        return { success: false, method: 'fallback', error: error as Error };
      }
    },
    [canShare]
  );

  return { share, canShare, isSharing };
}
```

### Share Button Component

```tsx
// components/share/share-button.tsx
'use client';

import { useState } from 'react';
import { Share2, Check, Copy, Link } from 'lucide-react';
import { useShare, ShareData } from '@/lib/share/use-share';
import { ShareDialog } from './share-dialog';

interface ShareButtonProps {
  data: ShareData;
  variant?: 'button' | 'icon';
  showFallbackDialog?: boolean;
  onShare?: (result: { success: boolean; method: string }) => void;
}

export function ShareButton({
  data,
  variant = 'button',
  showFallbackDialog = true,
  onShare,
}: ShareButtonProps) {
  const { share, canShare, isSharing } = useShare();
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    // If native share is available, use it
    if (canShare(data)) {
      const result = await share(data);
      onShare?.(result);
      return;
    }

    // Otherwise show fallback dialog
    if (showFallbackDialog) {
      setShowDialog(true);
      return;
    }

    // Or just copy to clipboard
    const result = await share(data);
    if (result.success && result.method === 'clipboard') {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    onShare?.(result);
  };

  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleShare}
          disabled={isSharing}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Share"
        >
          {copied ? (
            <Check className="h-5 w-5 text-green-500" />
          ) : (
            <Share2 className="h-5 w-5" />
          )}
        </button>
        {showDialog && (
          <ShareDialog
            data={data}
            isOpen={showDialog}
            onClose={() => setShowDialog(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isSharing}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share
          </>
        )}
      </button>
      {showDialog && (
        <ShareDialog
          data={data}
          isOpen={showDialog}
          onClose={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
```

### Share Dialog

```tsx
// components/share/share-dialog.tsx
'use client';

import { useState } from 'react';
import { X, Copy, Check, Mail, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareData } from '@/lib/share/use-share';

// Social platform icons (simplified versions)
const TwitterIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

interface ShareDialogProps {
  data: ShareData;
  isOpen: boolean;
  onClose: () => void;
}

const socialPlatforms = [
  {
    name: 'Twitter',
    icon: TwitterIcon,
    color: 'hover:bg-black hover:text-white',
    getUrl: (data: ShareData) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        data.text || data.title || ''
      )}&url=${encodeURIComponent(data.url || '')}`,
  },
  {
    name: 'Facebook',
    icon: FacebookIcon,
    color: 'hover:bg-[#1877F2] hover:text-white',
    getUrl: (data: ShareData) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        data.url || ''
      )}`,
  },
  {
    name: 'LinkedIn',
    icon: LinkedInIcon,
    color: 'hover:bg-[#0A66C2] hover:text-white',
    getUrl: (data: ShareData) =>
      `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
        data.url || ''
      )}&title=${encodeURIComponent(data.title || '')}`,
  },
  {
    name: 'WhatsApp',
    icon: WhatsAppIcon,
    color: 'hover:bg-[#25D366] hover:text-white',
    getUrl: (data: ShareData) =>
      `https://wa.me/?text=${encodeURIComponent(
        `${data.title || ''} ${data.url || ''}`
      )}`,
  },
  {
    name: 'Email',
    icon: Mail,
    color: 'hover:bg-gray-700 hover:text-white',
    getUrl: (data: ShareData) =>
      `mailto:?subject=${encodeURIComponent(
        data.title || ''
      )}&body=${encodeURIComponent(`${data.text || ''}\n\n${data.url || ''}`)}`,
  },
  {
    name: 'SMS',
    icon: MessageCircle,
    color: 'hover:bg-green-600 hover:text-white',
    getUrl: (data: ShareData) =>
      `sms:?body=${encodeURIComponent(`${data.title || ''} ${data.url || ''}`)}`,
  },
];

export function ShareDialog({ data, isOpen, onClose }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const shareText = data.url || [data.title, data.text].filter(Boolean).join('\n');
    await navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSocialShare = (platform: (typeof socialPlatforms)[0]) => {
    const url = platform.getUrl(data);
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-gray-800">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Share
              </h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content preview */}
            {(data.title || data.text) && (
              <div className="border-b border-gray-200 p-4 dark:border-gray-800">
                {data.title && (
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {data.title}
                  </h3>
                )}
                {data.text && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {data.text}
                  </p>
                )}
              </div>
            )}

            {/* Social platforms */}
            <div className="grid grid-cols-3 gap-2 p-4">
              {socialPlatforms.map((platform) => (
                <button
                  key={platform.name}
                  onClick={() => handleSocialShare(platform)}
                  className={`flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 text-gray-700 transition-colors dark:border-gray-700 dark:text-gray-300 ${platform.color}`}
                >
                  <platform.icon />
                  <span className="text-xs">{platform.name}</span>
                </button>
              ))}
            </div>

            {/* Copy link */}
            {data.url && (
              <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={data.url}
                    readOnly
                    className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-green-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Share Files Component

```tsx
// components/share/share-files.tsx
'use client';

import { useState, useRef } from 'react';
import { Share2, Image, FileText, Loader2 } from 'lucide-react';
import { useShare } from '@/lib/share/use-share';

interface ShareFilesProps {
  title?: string;
  text?: string;
}

export function ShareFiles({ title, text }: ShareFilesProps) {
  const { share, canShare, isSharing } = useShare();
  const [error, setError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setError(undefined);

    // Check if file sharing is supported
    if (!canShare({ files: Array.from(files) })) {
      setError('File sharing is not supported on this device');
      return;
    }

    const result = await share({
      title,
      text,
      files: Array.from(files),
    });

    if (!result.success) {
      setError('Failed to share files');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleFileSelect}
        className="hidden"
        id="share-files-input"
      />
      
      <label
        htmlFor="share-files-input"
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        {isSharing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Share2 className="h-4 w-4" />
        )}
        Share Files
      </label>

      {error && (
        <p className="mt-2 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
```

## Usage

```tsx
// Simple share button
import { ShareButton } from '@/components/share/share-button';

function ArticlePage({ article }) {
  return (
    <div>
      <h1>{article.title}</h1>
      <ShareButton
        data={{
          title: article.title,
          text: article.excerpt,
          url: `https://example.com/articles/${article.slug}`,
        }}
        onShare={(result) => {
          if (result.success) {
            analytics.track('article_shared', { method: result.method });
          }
        }}
      />
    </div>
  );
}

// Icon-only share
<ShareButton
  data={{ url: window.location.href }}
  variant="icon"
/>

// Use hook directly
import { useShare } from '@/lib/share/use-share';

function CustomShare() {
  const { share, canShare } = useShare();

  const handleShare = async () => {
    const result = await share({
      title: 'Check this out!',
      url: window.location.href,
    });
    
    if (result.method === 'clipboard') {
      toast('Link copied to clipboard!');
    }
  };

  return <button onClick={handleShare}>Share</button>;
}

// Share files
import { ShareFiles } from '@/components/share/share-files';

<ShareFiles title="Check out these photos" />
```

## Related Skills

- [L3/social-share](../organisms/social-share.md) - Social share buttons
- [L5/deep-linking](./deep-linking.md) - Deep linking
- [L5/clipboard-api](./clipboard-api.md) - Clipboard access

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation with fallback support
