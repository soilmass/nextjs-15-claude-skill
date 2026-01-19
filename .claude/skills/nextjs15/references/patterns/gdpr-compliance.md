---
id: pt-gdpr-compliance
name: GDPR Compliance
version: 1.0.0
layer: L5
category: security
description: GDPR and privacy compliance implementation including consent management, data export, right to deletion, and privacy-by-design patterns
tags: [gdpr, privacy, compliance, consent, data-protection, ecommerce, next15]
composes: []
formula: "GDPRCompliance = ConsentManagement + DataExport + RightToErasure + PrivacyControls"
dependencies:
  prisma: "^6.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# GDPR Compliance

## Overview

Comprehensive GDPR compliance implementation covering consent management, data subject rights (access, portability, erasure), privacy controls, and data processing records.

## When to Use

- Operating in the EU or serving EU customers
- Processing personal data of any kind
- Implementing cookie consent banners
- Handling data export/deletion requests
- Marketing email consent management

## Implementation

### Database Schema

```prisma
model ConsentRecord {
  id          String        @id @default(cuid())
  userId      String?
  sessionId   String?
  email       String?

  // Consent types
  necessary   Boolean       @default(true)  // always true, can't opt out
  analytics   Boolean       @default(false)
  marketing   Boolean       @default(false)
  preferences Boolean       @default(false)

  // Metadata
  ipAddress   String?
  userAgent   String?
  source      String?       // where consent was given
  version     String?       // consent policy version

  givenAt     DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([userId])
  @@index([email])
  @@index([sessionId])
}

model DataRequest {
  id          String            @id @default(cuid())
  type        DataRequestType
  userId      String
  email       String
  status      DataRequestStatus @default(PENDING)

  // Processing
  requestedAt DateTime          @default(now())
  processedAt DateTime?
  completedAt DateTime?
  expiresAt   DateTime?         // for download links

  // Result
  downloadUrl String?           // for data export
  notes       String?

  @@index([userId])
  @@index([status])
}

enum DataRequestType {
  EXPORT      // Data portability (Article 20)
  DELETION    // Right to erasure (Article 17)
  ACCESS      // Right of access (Article 15)
}

enum DataRequestStatus {
  PENDING
  PROCESSING
  COMPLETED
  REJECTED
}
```

### Consent Service

```typescript
// lib/gdpr/consent.ts
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

const CONSENT_COOKIE = 'consent-preferences';
const CONSENT_VERSION = '1.0';

export async function getConsent(
  userId?: string,
  sessionId?: string
): Promise<ConsentPreferences | null> {
  // Check cookie first
  const cookieStore = cookies();
  const consentCookie = cookieStore.get(CONSENT_COOKIE);

  if (consentCookie) {
    try {
      return JSON.parse(consentCookie.value);
    } catch {
      // Invalid cookie, fall through
    }
  }

  // Check database for logged-in users
  if (userId) {
    const record = await prisma.consentRecord.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (record) {
      return {
        necessary: true,
        analytics: record.analytics,
        marketing: record.marketing,
        preferences: record.preferences,
      };
    }
  }

  return null; // No consent recorded
}

export async function saveConsent(
  preferences: ConsentPreferences,
  context: {
    userId?: string;
    sessionId?: string;
    email?: string;
    ipAddress?: string;
    userAgent?: string;
  }
): Promise<void> {
  // Always set necessary to true
  preferences.necessary = true;

  // Save to database
  await prisma.consentRecord.create({
    data: {
      ...preferences,
      ...context,
      version: CONSENT_VERSION,
      source: 'cookie-banner',
    },
  });

  // Set cookie (1 year expiry)
  const cookieStore = cookies();
  cookieStore.set(CONSENT_COOKIE, JSON.stringify(preferences), {
    maxAge: 365 * 24 * 60 * 60,
    httpOnly: false, // Needs to be readable by client JS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
}

export function hasConsent(
  preferences: ConsentPreferences | null,
  type: keyof ConsentPreferences
): boolean {
  if (!preferences) return type === 'necessary';
  return preferences[type] === true;
}
```

### Data Export Service

```typescript
// lib/gdpr/data-export.ts
import { prisma } from '@/lib/prisma';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function requestDataExport(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) throw new Error('User not found');

  const request = await prisma.dataRequest.create({
    data: {
      type: 'EXPORT',
      userId,
      email: user.email,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  // Process async
  processDataExport(request.id);

  return request.id;
}

async function processDataExport(requestId: string): Promise<void> {
  const request = await prisma.dataRequest.update({
    where: { id: requestId },
    data: { status: 'PROCESSING' },
  });

  // Collect all user data
  const userData = await collectUserData(request.userId);

  // Create JSON file
  const exportData = JSON.stringify(userData, null, 2);

  // Upload to S3
  const s3 = new S3Client({ region: process.env.AWS_REGION });
  const key = `exports/${request.userId}/${requestId}.json`;

  await s3.send(new PutObjectCommand({
    Bucket: process.env.EXPORT_BUCKET,
    Key: key,
    Body: exportData,
    ContentType: 'application/json',
  }));

  // Generate signed URL (valid for 7 days)
  const downloadUrl = await getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: process.env.EXPORT_BUCKET, Key: key }),
    { expiresIn: 7 * 24 * 60 * 60 }
  );

  await prisma.dataRequest.update({
    where: { id: requestId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      downloadUrl,
    },
  });

  // Send email notification
  await sendEmail({
    to: request.email,
    template: 'data-export-ready',
    data: { downloadUrl, expiresIn: '7 days' },
  });
}

async function collectUserData(userId: string) {
  const [user, orders, addresses, reviews, consents] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        // Exclude passwordHash
      },
    }),
    prisma.order.findMany({
      where: { userId },
      include: { items: true },
    }),
    prisma.address.findMany({ where: { userId } }),
    prisma.review.findMany({ where: { userId } }),
    prisma.consentRecord.findMany({ where: { userId } }),
  ]);

  return {
    exportDate: new Date().toISOString(),
    user,
    orders,
    addresses,
    reviews,
    consentHistory: consents,
  };
}
```

### Right to Erasure (Deletion)

```typescript
// lib/gdpr/deletion.ts
import { prisma } from '@/lib/prisma';

export async function requestDeletion(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });

  if (!user) throw new Error('User not found');

  const request = await prisma.dataRequest.create({
    data: {
      type: 'DELETION',
      userId,
      email: user.email,
    },
  });

  return request.id;
}

export async function processDeletion(requestId: string): Promise<void> {
  const request = await prisma.dataRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.type !== 'DELETION') {
    throw new Error('Invalid deletion request');
  }

  await prisma.dataRequest.update({
    where: { id: requestId },
    data: { status: 'PROCESSING' },
  });

  const userId = request.userId;

  // Delete in correct order (respecting foreign keys)
  await prisma.$transaction(async (tx) => {
    // Delete user-generated content
    await tx.review.deleteMany({ where: { userId } });
    await tx.wishlistItem.deleteMany({
      where: { wishlist: { userId } },
    });
    await tx.wishlist.deleteMany({ where: { userId } });

    // Anonymize orders (keep for accounting, remove PII)
    await tx.order.updateMany({
      where: { userId },
      data: {
        userId: null,
        shippingAddress: { name: 'DELETED', line1: 'DELETED' },
        billingAddress: null,
      },
    });

    // Delete addresses
    await tx.address.deleteMany({ where: { userId } });

    // Delete consent records
    await tx.consentRecord.deleteMany({ where: { userId } });

    // Finally delete user
    await tx.user.delete({ where: { id: userId } });
  });

  await prisma.dataRequest.update({
    where: { id: requestId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
      notes: 'User data deleted, orders anonymized',
    },
  });

  // Send confirmation
  await sendEmail({
    to: request.email,
    template: 'deletion-complete',
  });
}
```

## Examples

### Cookie Consent Banner

```tsx
// components/cookie-consent.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function CookieConsent() {
  const [show, setShow] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    const consent = document.cookie
      .split('; ')
      .find(row => row.startsWith('consent-preferences='));
    if (!consent) setShow(true);
  }, []);

  const acceptAll = async () => {
    const all = { necessary: true, analytics: true, marketing: true, preferences: true };
    await saveConsent(all);
    setShow(false);
  };

  const acceptSelected = async () => {
    await saveConsent(preferences);
    setShow(false);
  };

  const rejectAll = async () => {
    const minimal = { necessary: true, analytics: false, marketing: false, preferences: false };
    await saveConsent(minimal);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-6 z-50">
      <div className="container">
        <h3 className="font-semibold mb-2">Cookie Preferences</h3>
        <p className="text-sm text-muted-foreground mb-4">
          We use cookies to improve your experience. You can customize your preferences below.
        </p>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <span>Necessary (required)</span>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between">
            <span>Analytics</span>
            <Switch
              checked={preferences.analytics}
              onCheckedChange={(v) => setPreferences(p => ({ ...p, analytics: v }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Marketing</span>
            <Switch
              checked={preferences.marketing}
              onCheckedChange={(v) => setPreferences(p => ({ ...p, marketing: v }))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={rejectAll}>Reject All</Button>
          <Button variant="outline" onClick={acceptSelected}>Save Preferences</Button>
          <Button onClick={acceptAll}>Accept All</Button>
        </div>
      </div>
    </div>
  );
}
```

## Anti-patterns

- **Pre-checked consent**: Don't pre-select optional cookies
- **Cookie walls**: Don't block content entirely without consent
- **Ignoring requests**: Must respond to data requests within 30 days
- **Incomplete deletion**: Ensure all personal data is removed

## Related Skills

- [Cookie Consent](../organisms/cookie-consent.md)
- [Audit Logging](../patterns/audit-logging.md)
- [Transactional Email](../patterns/transactional-email.md)
