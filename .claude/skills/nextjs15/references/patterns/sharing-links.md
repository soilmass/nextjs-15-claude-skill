---
id: pt-sharing-links
name: Shareable Links
version: 1.0.0
layer: L5
category: features
description: Generate and manage shareable links with optional expiration and access control
tags: [features, sharing, links, short-urls, access-control, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../atoms/display-badge.md
dependencies: []
formula: "SharingLinks = ShortURL + AccessToken + Expiration + Analytics"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Shareable Links

## Overview

Shareable links allow users to share content, documents, or resources via unique URLs. This pattern covers link generation, access control, expiration, and usage tracking.

## When to Use

- File sharing systems
- Document collaboration
- Referral programs
- Temporary access links
- Public share functionality

## Share Link Schema

```prisma
// prisma/schema.prisma
model ShareLink {
  id          String    @id @default(cuid())
  shortCode   String    @unique
  resourceType String   // 'document', 'file', 'page'
  resourceId  String
  createdById String
  createdBy   User      @relation(fields: [createdById], references: [id])

  password    String?   // Optional password protection
  expiresAt   DateTime?
  maxViews    Int?
  viewCount   Int       @default(0)
  isActive    Boolean   @default(true)

  permissions Json      @default("{\"canView\": true}")
  metadata    Json?

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  views       ShareLinkView[]

  @@index([shortCode])
  @@index([resourceType, resourceId])
  @@map("share_links")
}

model ShareLinkView {
  id          String    @id @default(cuid())
  shareLinkId String
  shareLink   ShareLink @relation(fields: [shareLinkId], references: [id], onDelete: Cascade)
  viewedAt    DateTime  @default(now())
  ipAddress   String?
  userAgent   String?
  referrer    String?

  @@index([shareLinkId])
  @@map("share_link_views")
}
```

## Share Link Service

```typescript
// lib/services/share-links.ts
import { prisma } from '@/lib/db';
import { nanoid } from 'nanoid';
import { hash, compare } from 'bcryptjs';

interface CreateShareLinkOptions {
  resourceType: string;
  resourceId: string;
  createdById: string;
  password?: string;
  expiresAt?: Date;
  maxViews?: number;
  permissions?: Record<string, boolean>;
}

export async function createShareLink(options: CreateShareLinkOptions) {
  const shortCode = nanoid(10);

  const shareLink = await prisma.shareLink.create({
    data: {
      shortCode,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      createdById: options.createdById,
      password: options.password ? await hash(options.password, 10) : null,
      expiresAt: options.expiresAt,
      maxViews: options.maxViews,
      permissions: options.permissions || { canView: true },
    },
  });

  return shareLink;
}

export async function validateShareLink(
  shortCode: string,
  password?: string
): Promise<{
  valid: boolean;
  error?: string;
  shareLink?: Awaited<ReturnType<typeof prisma.shareLink.findUnique>>;
}> {
  const shareLink = await prisma.shareLink.findUnique({
    where: { shortCode },
  });

  if (!shareLink) {
    return { valid: false, error: 'Link not found' };
  }

  if (!shareLink.isActive) {
    return { valid: false, error: 'This link has been deactivated' };
  }

  if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
    return { valid: false, error: 'This link has expired' };
  }

  if (shareLink.maxViews && shareLink.viewCount >= shareLink.maxViews) {
    return { valid: false, error: 'This link has reached its view limit' };
  }

  if (shareLink.password) {
    if (!password) {
      return { valid: false, error: 'Password required' };
    }
    const isValid = await compare(password, shareLink.password);
    if (!isValid) {
      return { valid: false, error: 'Invalid password' };
    }
  }

  return { valid: true, shareLink };
}

export async function recordView(
  shareLinkId: string,
  metadata: { ipAddress?: string; userAgent?: string; referrer?: string }
) {
  await prisma.$transaction([
    prisma.shareLinkView.create({
      data: {
        shareLinkId,
        ...metadata,
      },
    }),
    prisma.shareLink.update({
      where: { id: shareLinkId },
      data: { viewCount: { increment: 1 } },
    }),
  ]);
}

export async function deactivateLink(shortCode: string, userId: string) {
  const link = await prisma.shareLink.findUnique({ where: { shortCode } });

  if (!link) throw new Error('Link not found');
  if (link.createdById !== userId) throw new Error('Unauthorized');

  await prisma.shareLink.update({
    where: { shortCode },
    data: { isActive: false },
  });
}

export async function getUserShareLinks(userId: string) {
  return prisma.shareLink.findMany({
    where: { createdById: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { views: true } },
    },
  });
}
```

## Share Link Route

```typescript
// app/s/[code]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateShareLink, recordView } from '@/lib/services/share-links';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const password = request.nextUrl.searchParams.get('p') || undefined;

  const result = await validateShareLink(code, password);

  if (!result.valid || !result.shareLink) {
    // Redirect to error page or show error
    return NextResponse.redirect(
      new URL(`/share/error?reason=${encodeURIComponent(result.error || 'Invalid link')}`, request.url)
    );
  }

  const { shareLink } = result;

  // Record view
  await recordView(shareLink.id, {
    ipAddress: request.headers.get('x-forwarded-for') || undefined,
    userAgent: request.headers.get('user-agent') || undefined,
    referrer: request.headers.get('referer') || undefined,
  });

  // Redirect to actual resource
  const redirectUrl = getResourceUrl(shareLink.resourceType, shareLink.resourceId);
  return NextResponse.redirect(new URL(redirectUrl, request.url));
}

function getResourceUrl(type: string, id: string): string {
  switch (type) {
    case 'document':
      return `/documents/${id}`;
    case 'file':
      return `/files/${id}`;
    case 'page':
      return `/pages/${id}`;
    default:
      return '/';
  }
}
```

## Share Dialog Component

```typescript
// components/share-dialog.tsx
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Share2, Copy, Check, Calendar as CalendarIcon } from 'lucide-react';
import { createShareLinkAction } from '@/app/share/actions';
import { format } from 'date-fns';

interface ShareDialogProps {
  resourceType: string;
  resourceId: string;
}

export function ShareDialog({ resourceType, resourceId }: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Options
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [useExpiration, setUseExpiration] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date>();
  const [maxViews, setMaxViews] = useState<number>();

  const handleCreateLink = async () => {
    setIsLoading(true);
    try {
      const result = await createShareLinkAction({
        resourceType,
        resourceId,
        password: usePassword ? password : undefined,
        expiresAt: useExpiration ? expiresAt : undefined,
        maxViews,
      });

      if (result.shortCode) {
        setShareUrl(`${window.location.origin}/s/${result.shortCode}`);
      }
    } catch (error) {
      console.error('Failed to create share link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Link</DialogTitle>
        </DialogHeader>

        {shareUrl ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly />
              <Button size="icon" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <Button variant="outline" onClick={() => setShareUrl(null)} className="w-full">
              Create Another Link
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Password protection */}
            <div className="flex items-center justify-between">
              <Label htmlFor="use-password">Password protection</Label>
              <Switch
                id="use-password"
                checked={usePassword}
                onCheckedChange={setUsePassword}
              />
            </div>
            {usePassword && (
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            )}

            {/* Expiration */}
            <div className="flex items-center justify-between">
              <Label htmlFor="use-expiration">Set expiration</Label>
              <Switch
                id="use-expiration"
                checked={useExpiration}
                onCheckedChange={setUseExpiration}
              />
            </div>
            {useExpiration && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {expiresAt ? format(expiresAt, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={setExpiresAt}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            )}

            {/* Max views */}
            <div className="space-y-2">
              <Label htmlFor="max-views">Max views (optional)</Label>
              <Input
                id="max-views"
                type="number"
                min="1"
                value={maxViews || ''}
                onChange={(e) => setMaxViews(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Unlimited"
              />
            </div>

            <Button onClick={handleCreateLink} disabled={isLoading} className="w-full">
              {isLoading ? 'Creating...' : 'Create Share Link'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Social Share Buttons

```typescript
// components/social-share.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Twitter, Facebook, Linkedin, Mail, Link2 } from 'lucide-react';
import { toast } from 'sonner';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export function SocialShare({ url, title, description }: SocialShareProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || '');

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  return (
    <div className="flex gap-2">
      <Button size="icon" variant="outline" asChild>
        <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer">
          <Twitter className="h-4 w-4" />
        </a>
      </Button>
      <Button size="icon" variant="outline" asChild>
        <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer">
          <Facebook className="h-4 w-4" />
        </a>
      </Button>
      <Button size="icon" variant="outline" asChild>
        <a href={shareLinks.linkedin} target="_blank" rel="noopener noreferrer">
          <Linkedin className="h-4 w-4" />
        </a>
      </Button>
      <Button size="icon" variant="outline" asChild>
        <a href={shareLinks.email}>
          <Mail className="h-4 w-4" />
        </a>
      </Button>
      <Button size="icon" variant="outline" onClick={copyToClipboard}>
        <Link2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
```

## Anti-patterns

### Don't Use Predictable Codes

```typescript
// BAD - Sequential/predictable codes
const code = `share-${Date.now()}`;

// GOOD - Random, unguessable codes
const code = nanoid(10); // e.g., "V1StGXR8_Z"
```

## Related Skills

- [auth-middleware](./auth-middleware.md)
- [analytics](./analytics.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Share link generation
- Access control
- Social sharing
