---
id: pt-device-sessions
name: Device Sessions
version: 2.0.0
layer: L5
category: auth
description: Manage user sessions across multiple devices in Next.js 15
tags: [auth, sessions, devices, security, multi-device]
composes: []
dependencies: []
formula: "DeviceSessions = DeviceFingerprint + SessionList (current + revoke) + SuspiciousActivityDetection"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Device Sessions Pattern

## When to Use

- For applications where users sign in from multiple devices
- When you need to provide session management UI
- For security-conscious applications requiring device tracking
- When implementing "Sign out all devices" functionality
- For detecting suspicious login activity

## Composition Diagram

```
Device Sessions UI
==================

+------------------------------------------+
|  Active Sessions                [Logout All]
+------------------------------------------+
|  +------------------------------------+  |
|  | [Desktop Icon] Chrome on macOS    |  |
|  |   San Francisco, US (Current)     |  |
|  |   Last active: Just now           |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | [Mobile Icon] Safari on iOS       |  |
|  |   New York, US                    |  |
|  |   Last active: 2 hours ago  [x]   |  |
|  +------------------------------------+  |
|  +------------------------------------+  |
|  | [Desktop Icon] Firefox on Windows |  |
|  |   London, UK                      |  |
|  |   Last active: 3 days ago   [x]   |  |
|  +------------------------------------+  |
+------------------------------------------+

Suspicious Activity Alert:
+------------------------------------------+
| [!] New Sign-in Detected                 |
|     - New device                         |
|     - New location (Tokyo, JP)           |
|                                          |
| [ It was me ]  [ Secure Account ]        |
+------------------------------------------+
```

## Overview

Device session management tracks and controls user sessions across multiple devices. This pattern covers device fingerprinting, session listing, remote logout, and suspicious activity detection.

## Implementation

### Device Fingerprinting

```typescript
// lib/auth/device.ts
import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';
import { createHash } from 'crypto';

export interface DeviceInfo {
  fingerprint: string;
  browser: string;
  browserVersion: string;
  os: string;
  osVersion: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  ip: string;
  location?: {
    city?: string;
    country?: string;
    region?: string;
  };
}

export async function getDeviceInfo(): Promise<DeviceInfo> {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0] ||
    headersList.get('x-real-ip') ||
    'unknown';

  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();

  // Determine device type
  let deviceType: DeviceInfo['deviceType'] = 'unknown';
  if (device.type === 'mobile') deviceType = 'mobile';
  else if (device.type === 'tablet') deviceType = 'tablet';
  else if (!device.type) deviceType = 'desktop';

  // Create fingerprint from stable attributes
  const fingerprintSource = [
    browser.name,
    browser.major,
    os.name,
    os.version,
    deviceType,
    // Note: IP is not included as it changes
  ].join('|');

  const fingerprint = createHash('sha256')
    .update(fingerprintSource)
    .digest('hex')
    .slice(0, 16);

  // Get location from IP (using a geolocation service)
  const location = await getLocationFromIP(ip);

  return {
    fingerprint,
    browser: browser.name || 'Unknown',
    browserVersion: browser.version || '',
    os: os.name || 'Unknown',
    osVersion: os.version || '',
    device: device.vendor ? `${device.vendor} ${device.model}` : 'Unknown',
    deviceType,
    ip,
    location,
  };
}

async function getLocationFromIP(ip: string): Promise<DeviceInfo['location']> {
  if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.')) {
    return undefined;
  }

  try {
    // Using ip-api.com (free tier)
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=city,country,regionName`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });
    
    if (!response.ok) return undefined;
    
    const data = await response.json();
    return {
      city: data.city,
      country: data.country,
      region: data.regionName,
    };
  } catch {
    return undefined;
  }
}
```

### Session Service

```typescript
// lib/auth/session-service.ts
import { prisma } from '@/lib/prisma';
import { SignJWT, jwtVerify } from 'jose';
import { getDeviceInfo, type DeviceInfo } from './device';

const SESSION_SECRET = new TextEncoder().encode(process.env.SESSION_SECRET!);

export interface Session {
  id: string;
  userId: string;
  token: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastActiveAt: Date;
  expiresAt: Date;
  isCurrent: boolean;
}

export class SessionService {
  // Create a new session
  async createSession(userId: string): Promise<Session> {
    const deviceInfo = await getDeviceInfo();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    // Create JWT token
    const token = await new SignJWT({ userId })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(expiresAt)
      .setJti(crypto.randomUUID())
      .sign(SESSION_SECRET);

    // Store session in database
    const session = await prisma.session.create({
      data: {
        userId,
        token: await this.hashToken(token),
        deviceFingerprint: deviceInfo.fingerprint,
        browser: deviceInfo.browser,
        browserVersion: deviceInfo.browserVersion,
        os: deviceInfo.os,
        osVersion: deviceInfo.osVersion,
        device: deviceInfo.device,
        deviceType: deviceInfo.deviceType,
        ip: deviceInfo.ip,
        city: deviceInfo.location?.city,
        country: deviceInfo.location?.country,
        expiresAt,
      },
    });

    return {
      id: session.id,
      userId,
      token,
      deviceInfo,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt,
      isCurrent: true,
    };
  }

  // Validate session and update last active
  async validateSession(token: string): Promise<{
    valid: boolean;
    session?: Session;
    error?: string;
  }> {
    try {
      const { payload } = await jwtVerify(token, SESSION_SECRET);
      const { userId } = payload as { userId: string };

      const tokenHash = await this.hashToken(token);
      const session = await prisma.session.findFirst({
        where: {
          userId,
          token: tokenHash,
          revokedAt: null,
          expiresAt: { gt: new Date() },
        },
      });

      if (!session) {
        return { valid: false, error: 'Session not found or expired' };
      }

      // Update last active
      await prisma.session.update({
        where: { id: session.id },
        data: { lastActiveAt: new Date() },
      });

      return {
        valid: true,
        session: {
          id: session.id,
          userId,
          token,
          deviceInfo: {
            fingerprint: session.deviceFingerprint,
            browser: session.browser,
            browserVersion: session.browserVersion || '',
            os: session.os,
            osVersion: session.osVersion || '',
            device: session.device,
            deviceType: session.deviceType as DeviceInfo['deviceType'],
            ip: session.ip,
            location: session.city
              ? { city: session.city, country: session.country || undefined }
              : undefined,
          },
          createdAt: session.createdAt,
          lastActiveAt: session.lastActiveAt,
          expiresAt: session.expiresAt,
          isCurrent: true,
        },
      };
    } catch (error) {
      return { valid: false, error: 'Invalid token' };
    }
  }

  // Get all sessions for a user
  async getUserSessions(userId: string, currentToken?: string): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      where: {
        userId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActiveAt: 'desc' },
    });

    const currentTokenHash = currentToken
      ? await this.hashToken(currentToken)
      : null;

    return sessions.map((session) => ({
      id: session.id,
      userId,
      token: '', // Don't expose tokens
      deviceInfo: {
        fingerprint: session.deviceFingerprint,
        browser: session.browser,
        browserVersion: session.browserVersion || '',
        os: session.os,
        osVersion: session.osVersion || '',
        device: session.device,
        deviceType: session.deviceType as DeviceInfo['deviceType'],
        ip: session.ip,
        location: session.city
          ? { city: session.city, country: session.country || undefined }
          : undefined,
      },
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      expiresAt: session.expiresAt,
      isCurrent: currentTokenHash === session.token,
    }));
  }

  // Revoke a specific session
  async revokeSession(sessionId: string, userId: string): Promise<boolean> {
    const result = await prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });

    return result.count > 0;
  }

  // Revoke all sessions except current
  async revokeAllOtherSessions(
    userId: string,
    currentToken: string
  ): Promise<number> {
    const currentTokenHash = await this.hashToken(currentToken);

    const result = await prisma.session.updateMany({
      where: {
        userId,
        token: { not: currentTokenHash },
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });

    return result.count;
  }

  // Revoke all sessions (logout everywhere)
  async revokeAllSessions(userId: string): Promise<number> {
    const result = await prisma.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return result.count;
  }

  // Check for suspicious activity
  async checkSuspiciousActivity(
    userId: string,
    deviceInfo: DeviceInfo
  ): Promise<{
    suspicious: boolean;
    reasons: string[];
  }> {
    const reasons: string[] = [];

    // Get recent sessions
    const recentSessions = await prisma.session.findMany({
      where: {
        userId,
        createdAt: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Check for new device
    const knownDevices = new Set(recentSessions.map((s) => s.deviceFingerprint));
    if (!knownDevices.has(deviceInfo.fingerprint)) {
      reasons.push('New device');
    }

    // Check for new location (different country)
    const knownCountries = new Set(
      recentSessions.map((s) => s.country).filter(Boolean)
    );
    if (
      deviceInfo.location?.country &&
      knownCountries.size > 0 &&
      !knownCountries.has(deviceInfo.location.country)
    ) {
      reasons.push('New location');
    }

    // Check for rapid logins from different IPs
    const recentIPs = new Set(
      recentSessions
        .filter((s) => s.createdAt > new Date(Date.now() - 60 * 60 * 1000)) // Last hour
        .map((s) => s.ip)
    );
    if (recentIPs.size > 3) {
      reasons.push('Multiple IPs in short time');
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }

  private async hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return Buffer.from(hash).toString('hex');
  }
}

export const sessionService = new SessionService();
```

### Session Management UI

```tsx
// components/settings/session-list.tsx
'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  LogOut,
  AlertTriangle,
} from 'lucide-react';
import type { Session } from '@/lib/auth/session-service';

interface SessionListProps {
  sessions: Session[];
  onRevoke: (sessionId: string) => Promise<void>;
  onRevokeAll: () => Promise<void>;
}

export function SessionList({
  sessions,
  onRevoke,
  onRevokeAll,
}: SessionListProps) {
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await onRevoke(sessionId);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    setRevokingAll(true);
    try {
      await onRevokeAll();
    } finally {
      setRevokingAll(false);
    }
  };

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'tablet':
        return <Tablet className="w-5 h-5" />;
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Active Sessions</h3>
        {sessions.length > 1 && (
          <button
            onClick={handleRevokeAll}
            disabled={revokingAll}
            className="text-sm text-red-600 hover:text-red-700"
          >
            {revokingAll ? 'Signing out...' : 'Sign out all other devices'}
          </button>
        )}
      </div>

      <div className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`p-4 border rounded-lg ${
              session.isCurrent ? 'border-blue-500 bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1 text-gray-500">
                  {getDeviceIcon(session.deviceInfo.deviceType)}
                </div>
                <div>
                  <div className="font-medium">
                    {session.deviceInfo.browser} on {session.deviceInfo.os}
                    {session.isCurrent && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {session.deviceInfo.device}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                    <Globe className="w-3 h-3" />
                    <span>
                      {session.deviceInfo.location
                        ? `${session.deviceInfo.location.city}, ${session.deviceInfo.location.country}`
                        : session.deviceInfo.ip}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Last active{' '}
                    {formatDistanceToNow(session.lastActiveAt, {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  disabled={revoking === session.id}
                  className="text-red-600 hover:text-red-700 p-2"
                  title="Sign out this device"
                >
                  {revoking === session.id ? (
                    <span className="animate-spin">⟳</span>
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Suspicious Activity Alert

```tsx
// components/auth/suspicious-activity-alert.tsx
'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface SuspiciousActivityAlertProps {
  reasons: string[];
  onDismiss: () => void;
  onSecureAccount: () => void;
}

export function SuspiciousActivityAlert({
  reasons,
  onDismiss,
  onSecureAccount,
}: SuspiciousActivityAlertProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-yellow-500" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold">
              New Sign-in Detected
            </h3>
            <p className="mt-2 text-gray-600">
              We noticed this sign-in attempt has some unusual characteristics:
            </p>
            <ul className="mt-2 list-disc list-inside text-sm text-gray-500">
              {reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              If this was you, you can safely dismiss this message.
              If not, we recommend securing your account.
            </p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 py-2 border rounded hover:bg-gray-50"
          >
            It was me
          </button>
          <button
            onClick={onSecureAccount}
            className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Secure Account
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Variants

### Session with Refresh Token Rotation

```typescript
// Rotate refresh token on each use for extra security
async function rotateSession(oldToken: string): Promise<{ accessToken: string; refreshToken: string }> {
  const session = await validateSession(oldToken);
  if (!session.valid) throw new Error('Invalid session');
  
  // Revoke old session
  await revokeSession(session.session!.id);
  
  // Create new session
  return createSession(session.session!.userId);
}
```

## Anti-Patterns

```typescript
// Bad: Not tracking devices
await createSession(userId); // No device info!

// Good: Track device information
const deviceInfo = await getDeviceInfo();
await createSession(userId, deviceInfo);

// Bad: No session expiration
const session = await prisma.session.create({ data: { userId } });
// Session lives forever!

// Good: Set expiration
await prisma.session.create({
  data: { userId, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
});
```

## Related Skills

- `session-management` - Session basics
- `jwt-tokens` - Token handling
- `geolocation` - Location detection
- `two-factor` - Additional security

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial device sessions pattern
