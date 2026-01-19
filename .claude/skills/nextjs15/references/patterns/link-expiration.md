---
id: pt-link-expiration
name: Expiring Links
version: 1.0.0
layer: L5
category: security
description: Create secure, time-limited shareable links for files and resources
tags: [links, sharing, expiration, security, presigned-urls, next15, react19]
composes: []
dependencies: []
formula: "ExpiringLinks = TokenGeneration + Expiration + AccessControl + Analytics"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Expiring Links

## When to Use

- When sharing files with time-limited access
- For secure download links
- When implementing invitation links
- For password reset and verification links
- When sharing sensitive resources

## Overview

This pattern implements secure, time-limited shareable links with optional password protection, download limits, and access tracking.

## Database Schema

```prisma
// prisma/schema.prisma
model SharedLink {
  id            String    @id @default(cuid())
  token         String    @unique

  // Resource reference
  resourceType  String    // file, document, folder
  resourceId    String

  // Access control
  password      String?   // Hashed password
  maxAccesses   Int?      // null = unlimited
  accessCount   Int       @default(0)

  // Expiration
  expiresAt     DateTime

  // Tracking
  createdById   String
  accesses      LinkAccess[]

  createdAt     DateTime  @default(now())

  @@index([token])
  @@index([resourceType, resourceId])
  @@index([expiresAt])
}

model LinkAccess {
  id          String     @id @default(cuid())
  linkId      String
  link        SharedLink @relation(fields: [linkId], references: [id])
  ipAddress   String
  userAgent   String?
  accessedAt  DateTime   @default(now())

  @@index([linkId, accessedAt])
}
```

## Link Service

```typescript
// lib/links/service.ts
import { prisma } from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcryptjs";

interface CreateLinkOptions {
  resourceType: string;
  resourceId: string;
  createdById: string;
  expiresIn?: number; // seconds
  expiresAt?: Date;
  password?: string;
  maxAccesses?: number;
}

export async function createSharedLink(options: CreateLinkOptions): Promise<{
  token: string;
  url: string;
  expiresAt: Date;
}> {
  const token = crypto.randomBytes(32).toString("base64url");

  const expiresAt = options.expiresAt ||
    new Date(Date.now() + (options.expiresIn || 7 * 24 * 60 * 60) * 1000);

  const hashedPassword = options.password
    ? await bcrypt.hash(options.password, 10)
    : null;

  await prisma.sharedLink.create({
    data: {
      token,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      createdById: options.createdById,
      expiresAt,
      password: hashedPassword,
      maxAccesses: options.maxAccesses,
    },
  });

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/share/${token}`;

  return { token, url, expiresAt };
}

export async function validateLink(
  token: string,
  password?: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{
  valid: boolean;
  error?: string;
  resourceType?: string;
  resourceId?: string;
  requiresPassword?: boolean;
}> {
  const link = await prisma.sharedLink.findUnique({
    where: { token },
  });

  if (!link) {
    return { valid: false, error: "Link not found" };
  }

  // Check expiration
  if (new Date() > link.expiresAt) {
    return { valid: false, error: "Link has expired" };
  }

  // Check access limit
  if (link.maxAccesses && link.accessCount >= link.maxAccesses) {
    return { valid: false, error: "Access limit reached" };
  }

  // Check password
  if (link.password) {
    if (!password) {
      return { valid: false, requiresPassword: true };
    }

    const validPassword = await bcrypt.compare(password, link.password);
    if (!validPassword) {
      return { valid: false, error: "Invalid password" };
    }
  }

  // Record access
  await prisma.$transaction([
    prisma.sharedLink.update({
      where: { id: link.id },
      data: { accessCount: { increment: 1 } },
    }),
    prisma.linkAccess.create({
      data: {
        linkId: link.id,
        ipAddress: ipAddress || "unknown",
        userAgent: userAgent || null,
      },
    }),
  ]);

  return {
    valid: true,
    resourceType: link.resourceType,
    resourceId: link.resourceId,
  };
}

export async function revokeLink(token: string, userId: string): Promise<boolean> {
  const link = await prisma.sharedLink.findUnique({
    where: { token },
  });

  if (!link || link.createdById !== userId) {
    return false;
  }

  await prisma.sharedLink.delete({
    where: { id: link.id },
  });

  return true;
}

export async function getUserLinks(userId: string) {
  return prisma.sharedLink.findMany({
    where: {
      createdById: userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { accesses: true } },
    },
  });
}
```

## Presigned URL for Cloud Storage

```typescript
// lib/links/presigned.ts
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function createDownloadUrl(
  bucket: string,
  key: string,
  expiresIn: number = 3600 // 1 hour
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

export async function createUploadUrl(
  bucket: string,
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}
```

## Share Dialog Component

```typescript
// components/share/share-dialog.tsx
"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Check, Link } from "lucide-react";
import { createShareLinkAction } from "@/app/actions/links";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: string;
  resourceId: string;
  resourceName: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  resourceType,
  resourceId,
  resourceName,
}: ShareDialogProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  // Options
  const [expiration, setExpiration] = useState("7d");
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [limitAccess, setLimitAccess] = useState(false);
  const [maxAccesses, setMaxAccesses] = useState("10");

  const handleCreateLink = async () => {
    setLoading(true);

    const expiresIn = {
      "1h": 3600,
      "24h": 86400,
      "7d": 604800,
      "30d": 2592000,
    }[expiration];

    const result = await createShareLinkAction({
      resourceType,
      resourceId,
      expiresIn,
      password: usePassword ? password : undefined,
      maxAccesses: limitAccess ? parseInt(maxAccesses) : undefined,
    });

    setShareUrl(result.url);
    setLoading(false);
  };

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share {resourceName}</DialogTitle>
        </DialogHeader>

        {!shareUrl ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Link expiration</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Password protection</Label>
                <p className="text-sm text-muted-foreground">
                  Require password to access
                </p>
              </div>
              <Switch checked={usePassword} onCheckedChange={setUsePassword} />
            </div>

            {usePassword && (
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            )}

            <div className="flex items-center justify-between">
              <div>
                <Label>Limit accesses</Label>
                <p className="text-sm text-muted-foreground">
                  Maximum number of views
                </p>
              </div>
              <Switch checked={limitAccess} onCheckedChange={setLimitAccess} />
            </div>

            {limitAccess && (
              <Input
                type="number"
                value={maxAccesses}
                onChange={(e) => setMaxAccesses(e.target.value)}
                min="1"
                max="1000"
              />
            )}

            <Button onClick={handleCreateLink} disabled={loading} className="w-full">
              {loading ? "Creating..." : "Create Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Input value={shareUrl} readOnly className="font-mono text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              This link will expire in {expiration}
              {limitAccess && ` or after ${maxAccesses} accesses`}
              {usePassword && ", and is password protected"}.
            </p>

            <Button
              variant="outline"
              onClick={() => setShareUrl(null)}
              className="w-full"
            >
              Create Another Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
```

## Access Page

```typescript
// app/share/[token]/page.tsx
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { validateLink } from "@/lib/links/service";
import { PasswordForm } from "@/components/share/password-form";
import { ResourceViewer } from "@/components/share/resource-viewer";

interface SharePageProps {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ password?: string }>;
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  const { token } = await params;
  const { password } = await searchParams;
  const headersList = await headers();

  const result = await validateLink(
    token,
    password,
    headersList.get("x-forwarded-for") || undefined,
    headersList.get("user-agent") || undefined
  );

  if (!result.valid) {
    if (result.requiresPassword) {
      return <PasswordForm token={token} />;
    }

    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Link Unavailable</h1>
          <p className="text-muted-foreground">{result.error}</p>
        </div>
      </div>
    );
  }

  return (
    <ResourceViewer
      resourceType={result.resourceType!}
      resourceId={result.resourceId!}
    />
  );
}
```

## Cleanup Job

```typescript
// lib/links/cleanup.ts
import { prisma } from "@/lib/db";

export async function cleanupExpiredLinks(): Promise<number> {
  const result = await prisma.sharedLink.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  return result.count;
}

// Run via cron job
// 0 0 * * * node -e "require('./lib/links/cleanup').cleanupExpiredLinks()"
```

## Anti-patterns

### Don't Use Predictable Tokens

```typescript
// BAD - Sequential/predictable
const token = `link-${Date.now()}`;

// GOOD - Cryptographically secure random
const token = crypto.randomBytes(32).toString("base64url");
```

### Don't Store Plain Passwords

```typescript
// BAD - Plain text
await prisma.sharedLink.create({
  data: { password: "secret123" },
});

// GOOD - Hashed
const hashedPassword = await bcrypt.hash("secret123", 10);
await prisma.sharedLink.create({
  data: { password: hashedPassword },
});
```

## Related Patterns

- [encryption](./encryption.md)
- [magic-links](./magic-links.md)
- [api-keys](./api-keys.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Token generation
- Password protection
- Access tracking
- Presigned URLs
