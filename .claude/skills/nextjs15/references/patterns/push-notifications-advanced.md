---
id: pt-push-notifications-advanced
name: Push Notifications Advanced
version: 1.0.0
layer: L5
category: messaging
description: Platform-specific push notification delivery for iOS, Android, and Web with scheduling, rich media, deep linking, analytics, and preference management
tags: [push-notifications, apns, fcm, web-push, deep-linking, rich-media, scheduling, next15]
composes: []
dependencies:
  web-push: "^3.6.6"
  firebase-admin: "^12.0.0"
  "@parse/node-apn": "^6.0.0"
  expo-server-sdk: "^3.7.0"
formula: "AdvancedPush = MultiPlatform(APNS+FCM+WebPush) + RichMedia + Scheduling + DeepLinking + Analytics + Preferences"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Push Notifications Advanced

## Overview

Push notifications are a critical engagement channel for modern applications, enabling real-time communication with users even when they're not actively using your app. This advanced pattern covers multi-platform delivery across iOS (APNs), Android (FCM), and Web (Web Push API), with sophisticated features like scheduled delivery, rich media attachments, deep linking, and comprehensive analytics.

Unlike simple notification implementations, this pattern addresses enterprise-scale challenges: managing millions of device tokens, handling platform-specific quirks, implementing notification preferences, A/B testing notification content, and ensuring reliable delivery with proper retry logic. We also cover the critical aspect of notification fatigue management to maintain user trust and engagement.

The implementation leverages Next.js 15 server components and server actions for secure token management, background job processing for scheduled notifications, and real-time analytics to measure notification effectiveness. All examples follow Apple's and Google's guidelines for notification best practices.

## When to Use

- Multi-platform applications requiring consistent notification experience across iOS, Android, and Web
- E-commerce applications with order updates, shipping notifications, and promotional campaigns
- Social applications with real-time activity notifications (likes, comments, follows)
- Messaging applications requiring instant delivery and read receipts
- News and content applications with breaking news and personalized recommendations
- SaaS applications with workflow notifications and team collaboration alerts
- Healthcare applications with appointment reminders and health alerts
- Financial applications with transaction alerts and security notifications

## When NOT to Use

- Email-only communication is sufficient for your use case
- Applications without mobile or PWA support
- Non-urgent updates that can wait for the next user session
- When notification permission is unlikely to be granted (anonymous/guest users)
- Compliance restrictions prohibit push notifications (certain financial/healthcare contexts)
- Simple status updates better served by in-app notifications alone

## Composition Diagram

```
+============================================================================+
|                    ADVANCED PUSH NOTIFICATION ARCHITECTURE                  |
+=============================================================================+
|                                                                             |
|   NOTIFICATION TRIGGER SOURCES                                              |
|   +------------------+  +------------------+  +------------------+          |
|   | Server Action    |  | Webhook Handler  |  | Cron Scheduler   |          |
|   | (user events)    |  | (external events)|  | (scheduled)      |          |
|   +--------+---------+  +--------+---------+  +--------+---------+          |
|            |                     |                     |                    |
|            +----------+----------+----------+----------+                    |
|                       |                                                     |
|                       v                                                     |
|   +------------------------------------------------------------------+     |
|   |  NOTIFICATION SERVICE                                             |     |
|   |  +------------------------------------------------------------+  |     |
|   |  | 1. Resolve recipients (user IDs -> device tokens)          |  |     |
|   |  | 2. Apply user preferences filter                           |  |     |
|   |  | 3. Check rate limits and notification fatigue              |  |     |
|   |  | 4. Prepare platform-specific payloads                      |  |     |
|   |  | 5. Queue for delivery or schedule for later                |  |     |
|   |  +------------------------------------------------------------+  |     |
|   +------------------------------------------------------------------+     |
|                       |                                                     |
|                       v                                                     |
|   +------------------------------------------------------------------+     |
|   |  SCHEDULING & QUEUE LAYER                                         |     |
|   |  +------------------------+  +-----------------------------+     |     |
|   |  | Immediate Queue        |  | Scheduled Queue             |     |     |
|   |  | (Redis/BullMQ)         |  | (sorted by delivery time)   |     |     |
|   |  +------------------------+  +-----------------------------+     |     |
|   +------------------------------------------------------------------+     |
|                       |                                                     |
|        +--------------+--------------+--------------+                       |
|        |              |              |              |                       |
|        v              v              v              v                       |
|   +---------+   +---------+   +---------+   +---------+                    |
|   | iOS     |   | Android |   | Web     |   | Expo    |                    |
|   | (APNs)  |   | (FCM)   |   | (VAPID) |   | (Expo)  |                    |
|   +----+----+   +----+----+   +----+----+   +----+----+                    |
|        |              |              |              |                       |
|        +-------+------+------+-------+------+------+                       |
|                |             |              |                               |
|                v             v              v                               |
|   +------------------------------------------------------------------+     |
|   |  DELIVERY HANDLERS                                                |     |
|   |  +------------------------------------------------------------+  |     |
|   |  | - Certificate/key-based authentication (APNs)              |  |     |
|   |  | - Service account authentication (FCM)                     |  |     |
|   |  | - VAPID key authentication (Web Push)                      |  |     |
|   |  | - Batch sending (up to 500 per request for FCM)            |  |     |
|   |  | - HTTP/2 multiplexing (APNs)                               |  |     |
|   |  +------------------------------------------------------------+  |     |
|   +------------------------------------------------------------------+     |
|                       |                                                     |
|                       v                                                     |
|   +------------------------------------------------------------------+     |
|   |  FEEDBACK & ANALYTICS                                             |     |
|   |  +------------------------------------------------------------+  |     |
|   |  | - Delivery receipts processing                             |  |     |
|   |  | - Invalid token cleanup (unregistered devices)             |  |     |
|   |  | - Open/click tracking via deep links                       |  |     |
|   |  | - A/B test result aggregation                              |  |     |
|   |  | - Engagement metrics per notification type                 |  |     |
|   |  +------------------------------------------------------------+  |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
|   CLIENT-SIDE HANDLING                                                      |
|   +------------------------------------------------------------------+     |
|   | iOS: didReceiveRemoteNotification, userNotificationCenter        |     |
|   | Android: onMessageReceived (FCM), NotificationCompat             |     |
|   | Web: push event handler, showNotification                        |     |
|   | - Deep link routing                                              |     |
|   | - Rich media display (images, actions)                           |     |
|   | - Background data sync                                           |     |
|   +------------------------------------------------------------------+     |
|                                                                             |
+=============================================================================+
```

## Implementation

### Core Types and Interfaces

```typescript
// lib/push/types.ts
export type Platform = "ios" | "android" | "web" | "expo";

export interface DeviceToken {
  id: string;
  userId: string;
  platform: Platform;
  token: string;
  deviceInfo?: {
    model?: string;
    osVersion?: string;
    appVersion?: string;
    locale?: string;
    timezone?: string;
  };
  createdAt: Date;
  lastActiveAt: Date;
}

export interface NotificationPayload {
  title: string;
  body: string;
  subtitle?: string; // iOS specific
  imageUrl?: string;
  iconUrl?: string;
  badgeCount?: number;
  sound?: string | { name: string; volume?: number };
  category?: string;
  threadId?: string; // iOS thread grouping
  collapseKey?: string; // Android collapse similar notifications
  priority?: "high" | "normal" | "low";
  ttl?: number; // Time to live in seconds
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  deepLink?: string;
  channelId?: string; // Android notification channel
}

export interface NotificationAction {
  id: string;
  title: string;
  icon?: string;
  destructive?: boolean;
  authenticationRequired?: boolean;
  foreground?: boolean;
  input?: {
    placeholder?: string;
    buttonTitle?: string;
  };
  deepLink?: string;
}

export interface ScheduledNotification {
  id: string;
  payload: NotificationPayload;
  recipients: NotificationRecipient[];
  scheduledAt: Date;
  timezone?: string;
  status: "pending" | "sent" | "cancelled";
  createdAt: Date;
  sentAt?: Date;
}

export interface NotificationRecipient {
  userId: string;
  segments?: string[];
  deviceTokens?: string[];
}

export interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  channels: {
    marketing: boolean;
    transactional: boolean;
    social: boolean;
    reminders: boolean;
  };
  quietHours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string;
    timezone: string;
  };
  frequency?: {
    maxPerDay: number;
    maxPerHour: number;
  };
}

export interface DeliveryResult {
  tokenId: string;
  platform: Platform;
  success: boolean;
  messageId?: string;
  error?: {
    code: string;
    message: string;
    shouldRemoveToken: boolean;
  };
}

export interface NotificationAnalytics {
  notificationId: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  dismissed: number;
  failed: number;
  byPlatform: Record<Platform, {
    sent: number;
    delivered: number;
    opened: number;
  }>;
}
```

### Multi-Platform Push Service

```typescript
// lib/push/push-service.ts
import webpush from "web-push";
import admin from "firebase-admin";
import apn from "@parse/node-apn";
import { Expo, ExpoPushMessage } from "expo-server-sdk";
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/db";
import type {
  Platform,
  DeviceToken,
  NotificationPayload,
  DeliveryResult,
  NotificationPreferences,
} from "./types";

const redis = Redis.fromEnv();
const expo = new Expo();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  });
}

// Initialize APNs
const apnProvider = new apn.Provider({
  token: {
    key: process.env.APNS_KEY!,
    keyId: process.env.APNS_KEY_ID!,
    teamId: process.env.APNS_TEAM_ID!,
  },
  production: process.env.NODE_ENV === "production",
});

// Initialize Web Push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export class PushNotificationService {
  /**
   * Send notification to a single user across all their devices
   */
  async sendToUser(
    userId: string,
    payload: NotificationPayload,
    options: {
      respectPreferences?: boolean;
      channel?: keyof NotificationPreferences["channels"];
    } = {}
  ): Promise<DeliveryResult[]> {
    const { respectPreferences = true, channel } = options;

    // Check user preferences
    if (respectPreferences) {
      const allowed = await this.checkPreferences(userId, channel);
      if (!allowed) {
        return [];
      }
    }

    // Check rate limits
    const rateLimited = await this.checkRateLimit(userId);
    if (rateLimited) {
      console.log(`Rate limited notifications for user ${userId}`);
      return [];
    }

    // Get all device tokens for user
    const tokens = await prisma.deviceToken.findMany({
      where: {
        userId,
        // Only active tokens (used in last 30 days)
        lastActiveAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    if (tokens.length === 0) {
      return [];
    }

    // Group tokens by platform
    const byPlatform = this.groupByPlatform(tokens);

    // Send to each platform
    const results = await Promise.all([
      this.sendToiOS(byPlatform.ios, payload),
      this.sendToAndroid(byPlatform.android, payload),
      this.sendToWeb(byPlatform.web, payload),
      this.sendToExpo(byPlatform.expo, payload),
    ]);

    // Flatten results
    const allResults = results.flat();

    // Process invalid tokens
    await this.processInvalidTokens(allResults);

    // Update rate limit counter
    await this.incrementNotificationCount(userId);

    // Track analytics
    await this.trackSend(payload, allResults);

    return allResults;
  }

  /**
   * Send to multiple users (broadcast)
   */
  async sendToUsers(
    userIds: string[],
    payload: NotificationPayload,
    options: {
      batchSize?: number;
      channel?: keyof NotificationPreferences["channels"];
    } = {}
  ): Promise<Map<string, DeliveryResult[]>> {
    const { batchSize = 500 } = options;
    const results = new Map<string, DeliveryResult[]>();

    // Process in batches
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map((userId) =>
          this.sendToUser(userId, payload, { channel: options.channel })
        )
      );

      batch.forEach((userId, index) => {
        results.set(userId, batchResults[index]);
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < userIds.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return results;
  }

  /**
   * Send to iOS devices via APNs
   */
  private async sendToiOS(
    tokens: DeviceToken[],
    payload: NotificationPayload
  ): Promise<DeliveryResult[]> {
    if (tokens.length === 0) return [];

    const notification = new apn.Notification();

    // Alert
    notification.alert = {
      title: payload.title,
      subtitle: payload.subtitle,
      body: payload.body,
    };

    // Optional properties
    if (payload.badgeCount !== undefined) {
      notification.badge = payload.badgeCount;
    }

    if (payload.sound) {
      notification.sound =
        typeof payload.sound === "string" ? payload.sound : payload.sound.name;
    }

    if (payload.category) {
      notification.category = payload.category;
    }

    if (payload.threadId) {
      notification.threadId = payload.threadId;
    }

    // Rich media (iOS 10+)
    if (payload.imageUrl) {
      notification.mutableContent = true;
      notification.payload = {
        ...notification.payload,
        "media-url": payload.imageUrl,
      };
    }

    // Deep link
    if (payload.deepLink) {
      notification.payload = {
        ...notification.payload,
        deepLink: payload.deepLink,
      };
    }

    // Custom data
    if (payload.data) {
      notification.payload = {
        ...notification.payload,
        ...payload.data,
      };
    }

    // Actions
    if (payload.actions && payload.actions.length > 0) {
      notification.category = payload.category || "DEFAULT_CATEGORY";
    }

    // Priority
    notification.priority =
      payload.priority === "high" ? 10 : payload.priority === "low" ? 1 : 5;

    // TTL
    if (payload.ttl) {
      notification.expiry = Math.floor(Date.now() / 1000) + payload.ttl;
    }

    // Bundle ID
    notification.topic = process.env.APNS_BUNDLE_ID!;

    // Send to all iOS tokens
    const results: DeliveryResult[] = [];

    // APNs supports HTTP/2 multiplexing, send concurrently
    const responses = await Promise.all(
      tokens.map((token) =>
        apnProvider.send(notification, token.token).then((response) => ({
          token,
          response,
        }))
      )
    );

    for (const { token, response } of responses) {
      if (response.sent.length > 0) {
        results.push({
          tokenId: token.id,
          platform: "ios",
          success: true,
        });
      } else {
        const failure = response.failed[0];
        results.push({
          tokenId: token.id,
          platform: "ios",
          success: false,
          error: {
            code: failure?.response?.reason || "UNKNOWN",
            message: failure?.error?.message || "Unknown error",
            shouldRemoveToken: this.shouldRemoveAPNsToken(
              failure?.response?.reason
            ),
          },
        });
      }
    }

    return results;
  }

  /**
   * Send to Android devices via FCM
   */
  private async sendToAndroid(
    tokens: DeviceToken[],
    payload: NotificationPayload
  ): Promise<DeliveryResult[]> {
    if (tokens.length === 0) return [];

    const results: DeliveryResult[] = [];

    // FCM allows up to 500 tokens per request
    const batchSize = 500;

    for (let i = 0; i < tokens.length; i += batchSize) {
      const batch = tokens.slice(i, i + batchSize);
      const tokenStrings = batch.map((t) => t.token);

      const message: admin.messaging.MulticastMessage = {
        tokens: tokenStrings,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        android: {
          priority: payload.priority === "high" ? "high" : "normal",
          notification: {
            channelId: payload.channelId || "default",
            icon: payload.iconUrl,
            sound: typeof payload.sound === "string" ? payload.sound : "default",
            clickAction: payload.deepLink
              ? "OPEN_DEEP_LINK"
              : "FLUTTER_NOTIFICATION_CLICK",
            tag: payload.collapseKey,
          },
          data: {
            ...(payload.data as Record<string, string>),
            deepLink: payload.deepLink || "",
          },
          ttl: payload.ttl ? payload.ttl * 1000 : undefined,
          collapseKey: payload.collapseKey,
        },
        data: payload.data as Record<string, string>,
      };

      // Add actions if present
      if (payload.actions && payload.actions.length > 0) {
        message.android!.notification!.clickAction = "NOTIFICATION_CLICK";
        message.data = {
          ...message.data,
          actions: JSON.stringify(payload.actions),
        };
      }

      try {
        const response = await admin.messaging().sendEachForMulticast(message);

        response.responses.forEach((resp, index) => {
          const token = batch[index];

          if (resp.success) {
            results.push({
              tokenId: token.id,
              platform: "android",
              success: true,
              messageId: resp.messageId,
            });
          } else {
            results.push({
              tokenId: token.id,
              platform: "android",
              success: false,
              error: {
                code: resp.error?.code || "UNKNOWN",
                message: resp.error?.message || "Unknown error",
                shouldRemoveToken: this.shouldRemoveFCMToken(resp.error?.code),
              },
            });
          }
        });
      } catch (error) {
        // Batch failed entirely
        batch.forEach((token) => {
          results.push({
            tokenId: token.id,
            platform: "android",
            success: false,
            error: {
              code: "BATCH_FAILED",
              message: (error as Error).message,
              shouldRemoveToken: false,
            },
          });
        });
      }
    }

    return results;
  }

  /**
   * Send to Web browsers via Web Push
   */
  private async sendToWeb(
    tokens: DeviceToken[],
    payload: NotificationPayload
  ): Promise<DeliveryResult[]> {
    if (tokens.length === 0) return [];

    const results: DeliveryResult[] = [];

    const webPayload = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.iconUrl || "/icons/icon-192x192.png",
      badge: "/icons/badge-72x72.png",
      image: payload.imageUrl,
      data: {
        ...payload.data,
        url: payload.deepLink || "/",
      },
      actions: payload.actions?.map((a) => ({
        action: a.id,
        title: a.title,
        icon: a.icon,
      })),
      tag: payload.collapseKey,
      requireInteraction: payload.priority === "high",
      renotify: true,
      silent: payload.priority === "low",
    });

    await Promise.all(
      tokens.map(async (token) => {
        try {
          // Parse the stored subscription object
          const subscription = JSON.parse(token.token);

          await webpush.sendNotification(subscription, webPayload, {
            TTL: payload.ttl || 86400,
            urgency: payload.priority || "normal",
          });

          results.push({
            tokenId: token.id,
            platform: "web",
            success: true,
          });
        } catch (error: any) {
          results.push({
            tokenId: token.id,
            platform: "web",
            success: false,
            error: {
              code: error.statusCode?.toString() || "UNKNOWN",
              message: error.message,
              shouldRemoveToken:
                error.statusCode === 404 || error.statusCode === 410,
            },
          });
        }
      })
    );

    return results;
  }

  /**
   * Send to Expo-managed devices
   */
  private async sendToExpo(
    tokens: DeviceToken[],
    payload: NotificationPayload
  ): Promise<DeliveryResult[]> {
    if (tokens.length === 0) return [];

    const results: DeliveryResult[] = [];

    // Filter valid Expo tokens
    const validTokens = tokens.filter((t) => Expo.isExpoPushToken(t.token));

    if (validTokens.length === 0) return [];

    const messages: ExpoPushMessage[] = validTokens.map((token) => ({
      to: token.token,
      title: payload.title,
      body: payload.body,
      subtitle: payload.subtitle,
      sound:
        typeof payload.sound === "string"
          ? payload.sound
          : payload.sound?.name || "default",
      badge: payload.badgeCount,
      data: {
        ...payload.data,
        deepLink: payload.deepLink,
      },
      channelId: payload.channelId || "default",
      priority:
        payload.priority === "high"
          ? "high"
          : payload.priority === "low"
            ? "low"
            : "default",
      ttl: payload.ttl,
      categoryId: payload.category,
      mutableContent: !!payload.imageUrl,
    }));

    // Chunk messages for Expo's batch API
    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);

        ticketChunk.forEach((ticket, index) => {
          const token = validTokens[index];

          if (ticket.status === "ok") {
            results.push({
              tokenId: token.id,
              platform: "expo",
              success: true,
              messageId: ticket.id,
            });
          } else {
            results.push({
              tokenId: token.id,
              platform: "expo",
              success: false,
              error: {
                code: ticket.details?.error || "UNKNOWN",
                message: ticket.message || "Unknown error",
                shouldRemoveToken: ticket.details?.error === "DeviceNotRegistered",
              },
            });
          }
        });
      } catch (error) {
        // Chunk failed
        validTokens.forEach((token) => {
          results.push({
            tokenId: token.id,
            platform: "expo",
            success: false,
            error: {
              code: "CHUNK_FAILED",
              message: (error as Error).message,
              shouldRemoveToken: false,
            },
          });
        });
      }
    }

    return results;
  }

  /**
   * Check user notification preferences
   */
  private async checkPreferences(
    userId: string,
    channel?: keyof NotificationPreferences["channels"]
  ): Promise<boolean> {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    if (!prefs || !prefs.enabled) {
      return false;
    }

    // Check channel-specific preference
    if (channel && prefs.channels) {
      const channels = prefs.channels as NotificationPreferences["channels"];
      if (!channels[channel]) {
        return false;
      }
    }

    // Check quiet hours
    if (prefs.quietHours) {
      const quietHours = prefs.quietHours as NotificationPreferences["quietHours"];
      if (quietHours?.enabled) {
        const isInQuietHours = this.isInQuietHours(
          quietHours.start,
          quietHours.end,
          quietHours.timezone
        );
        if (isInQuietHours) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if current time is within quiet hours
   */
  private isInQuietHours(
    start: string,
    end: string,
    timezone: string
  ): boolean {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const currentTime = formatter.format(now);
    const [currentHour, currentMinute] = currentTime.split(":").map(Number);
    const currentMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = start.split(":").map(Number);
    const startMinutes = startHour * 60 + startMinute;

    const [endHour, endMinute] = end.split(":").map(Number);
    const endMinutes = endHour * 60 + endMinute;

    // Handle overnight quiet hours (e.g., 22:00 to 07:00)
    if (startMinutes > endMinutes) {
      return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  /**
   * Rate limiting check
   */
  private async checkRateLimit(userId: string): Promise<boolean> {
    const prefs = await prisma.notificationPreference.findUnique({
      where: { userId },
    });

    const frequency = prefs?.frequency as NotificationPreferences["frequency"];

    if (!frequency) {
      return false; // No rate limit configured
    }

    const hourKey = `notif:rate:${userId}:hour:${Math.floor(Date.now() / 3600000)}`;
    const dayKey = `notif:rate:${userId}:day:${Math.floor(Date.now() / 86400000)}`;

    const [hourCount, dayCount] = await Promise.all([
      redis.get<number>(hourKey),
      redis.get<number>(dayKey),
    ]);

    if (
      (frequency.maxPerHour && (hourCount || 0) >= frequency.maxPerHour) ||
      (frequency.maxPerDay && (dayCount || 0) >= frequency.maxPerDay)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Increment notification count for rate limiting
   */
  private async incrementNotificationCount(userId: string): Promise<void> {
    const hourKey = `notif:rate:${userId}:hour:${Math.floor(Date.now() / 3600000)}`;
    const dayKey = `notif:rate:${userId}:day:${Math.floor(Date.now() / 86400000)}`;

    await Promise.all([
      redis.incr(hourKey).then(() => redis.expire(hourKey, 3600)),
      redis.incr(dayKey).then(() => redis.expire(dayKey, 86400)),
    ]);
  }

  /**
   * Group tokens by platform
   */
  private groupByPlatform(tokens: DeviceToken[]): Record<Platform, DeviceToken[]> {
    return {
      ios: tokens.filter((t) => t.platform === "ios"),
      android: tokens.filter((t) => t.platform === "android"),
      web: tokens.filter((t) => t.platform === "web"),
      expo: tokens.filter((t) => t.platform === "expo"),
    };
  }

  /**
   * Process and remove invalid tokens
   */
  private async processInvalidTokens(results: DeliveryResult[]): Promise<void> {
    const tokensToRemove = results
      .filter((r) => !r.success && r.error?.shouldRemoveToken)
      .map((r) => r.tokenId);

    if (tokensToRemove.length > 0) {
      await prisma.deviceToken.deleteMany({
        where: { id: { in: tokensToRemove } },
      });

      console.log(`Removed ${tokensToRemove.length} invalid device tokens`);
    }
  }

  /**
   * Track send analytics
   */
  private async trackSend(
    payload: NotificationPayload,
    results: DeliveryResult[]
  ): Promise<void> {
    const analytics = {
      timestamp: Date.now(),
      category: payload.category || "general",
      title: payload.title,
      sent: results.length,
      success: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      byPlatform: {
        ios: results.filter((r) => r.platform === "ios").length,
        android: results.filter((r) => r.platform === "android").length,
        web: results.filter((r) => r.platform === "web").length,
        expo: results.filter((r) => r.platform === "expo").length,
      },
    };

    // Store in Redis for real-time analytics
    await redis.lpush("push:analytics", JSON.stringify(analytics));
    await redis.ltrim("push:analytics", 0, 9999); // Keep last 10k
  }

  private shouldRemoveAPNsToken(reason?: string): boolean {
    const invalidReasons = [
      "Unregistered",
      "BadDeviceToken",
      "DeviceTokenNotForTopic",
      "ExpiredProviderToken",
    ];
    return reason ? invalidReasons.includes(reason) : false;
  }

  private shouldRemoveFCMToken(code?: string): boolean {
    const invalidCodes = [
      "messaging/invalid-registration-token",
      "messaging/registration-token-not-registered",
    ];
    return code ? invalidCodes.includes(code) : false;
  }
}

export const pushService = new PushNotificationService();
```

### Scheduled Notifications

```typescript
// lib/push/scheduler.ts
import { Redis } from "@upstash/redis";
import { prisma } from "@/lib/db";
import { pushService } from "./push-service";
import type {
  ScheduledNotification,
  NotificationPayload,
  NotificationRecipient,
} from "./types";

const redis = Redis.fromEnv();

export class NotificationScheduler {
  private readonly scheduledSetKey = "push:scheduled";
  private readonly scheduledDataKey = "push:scheduled:data";

  /**
   * Schedule a notification for future delivery
   */
  async schedule(
    payload: NotificationPayload,
    recipients: NotificationRecipient[],
    scheduledAt: Date,
    options: {
      timezone?: string;
      id?: string;
    } = {}
  ): Promise<string> {
    const id = options.id || `sched-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    const scheduled: ScheduledNotification = {
      id,
      payload,
      recipients,
      scheduledAt,
      timezone: options.timezone,
      status: "pending",
      createdAt: new Date(),
    };

    // Store in sorted set by scheduled time
    await Promise.all([
      redis.zadd(this.scheduledSetKey, {
        score: scheduledAt.getTime(),
        member: id,
      }),
      redis.hset(this.scheduledDataKey, {
        [id]: JSON.stringify(scheduled),
      }),
    ]);

    return id;
  }

  /**
   * Schedule with timezone-aware delivery
   */
  async scheduleAtLocalTime(
    payload: NotificationPayload,
    recipients: NotificationRecipient[],
    localTime: string, // "HH:mm" format
    date: Date,
    timezone: string
  ): Promise<string> {
    // Convert local time to UTC
    const [hours, minutes] = localTime.split(":").map(Number);
    const localDate = new Date(date);
    localDate.setHours(hours, minutes, 0, 0);

    // Get UTC time by accounting for timezone
    const utcTime = new Date(
      localDate.toLocaleString("en-US", { timeZone: timezone })
    );

    return this.schedule(payload, recipients, utcTime, { timezone });
  }

  /**
   * Cancel a scheduled notification
   */
  async cancel(id: string): Promise<boolean> {
    const exists = await redis.hget<string>(this.scheduledDataKey, id);

    if (!exists) {
      return false;
    }

    const scheduled = JSON.parse(exists) as ScheduledNotification;
    scheduled.status = "cancelled";

    await Promise.all([
      redis.zrem(this.scheduledSetKey, id),
      redis.hset(this.scheduledDataKey, { [id]: JSON.stringify(scheduled) }),
    ]);

    return true;
  }

  /**
   * Get all pending scheduled notifications
   */
  async getPending(limit: number = 100): Promise<ScheduledNotification[]> {
    const ids = await redis.zrange(this.scheduledSetKey, 0, limit - 1);

    if (!ids || ids.length === 0) {
      return [];
    }

    const data = await redis.hmget<Record<string, string>>(
      this.scheduledDataKey,
      ...ids
    );

    return Object.values(data)
      .filter(Boolean)
      .map((d) => JSON.parse(d as string) as ScheduledNotification);
  }

  /**
   * Process due notifications (called by cron)
   */
  async processDue(): Promise<number> {
    const now = Date.now();

    // Get notifications due for delivery
    const dueIds = await redis.zrangebyscore<string[]>(
      this.scheduledSetKey,
      0,
      now
    );

    if (!dueIds || dueIds.length === 0) {
      return 0;
    }

    let processed = 0;

    for (const id of dueIds) {
      const dataStr = await redis.hget<string>(this.scheduledDataKey, id);

      if (!dataStr) continue;

      const scheduled = JSON.parse(dataStr) as ScheduledNotification;

      if (scheduled.status !== "pending") continue;

      try {
        // Send to all recipients
        const userIds = scheduled.recipients.flatMap((r) =>
          r.userId ? [r.userId] : []
        );

        if (userIds.length > 0) {
          await pushService.sendToUsers(userIds, scheduled.payload);
        }

        // Update status
        scheduled.status = "sent";
        scheduled.sentAt = new Date();

        await Promise.all([
          redis.zrem(this.scheduledSetKey, id),
          redis.hset(this.scheduledDataKey, { [id]: JSON.stringify(scheduled) }),
        ]);

        processed++;
      } catch (error) {
        console.error(`Failed to send scheduled notification ${id}:`, error);
      }
    }

    return processed;
  }
}

export const scheduler = new NotificationScheduler();
```

### Deep Linking Handler

```typescript
// lib/push/deep-linking.ts
import { NextRequest, NextResponse } from "next/server";

export interface DeepLinkConfig {
  scheme: string; // e.g., "myapp"
  webFallback: string; // e.g., "https://myapp.com"
  routes: DeepLinkRoute[];
}

export interface DeepLinkRoute {
  path: string; // e.g., "/orders/:orderId"
  webPath?: string; // e.g., "/dashboard/orders/:orderId" - different web path
  params?: string[];
}

export const deepLinkConfig: DeepLinkConfig = {
  scheme: "myapp",
  webFallback: process.env.NEXT_PUBLIC_APP_URL!,
  routes: [
    { path: "/orders/:orderId", webPath: "/dashboard/orders/:orderId" },
    { path: "/messages/:conversationId" },
    { path: "/profile/:userId" },
    { path: "/settings" },
    { path: "/notifications" },
  ],
};

/**
 * Generate a deep link URL
 */
export function createDeepLink(
  path: string,
  params?: Record<string, string>
): string {
  let resolvedPath = path;

  // Replace path parameters
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      resolvedPath = resolvedPath.replace(`:${key}`, value);
    });
  }

  // Return app scheme URL
  return `${deepLinkConfig.scheme}://${resolvedPath}`;
}

/**
 * Generate web fallback URL
 */
export function createWebFallback(
  path: string,
  params?: Record<string, string>
): string {
  const route = deepLinkConfig.routes.find((r) => matchPath(r.path, path));
  let webPath = route?.webPath || path;

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      webPath = webPath.replace(`:${key}`, value);
    });
  }

  return `${deepLinkConfig.webFallback}${webPath}`;
}

/**
 * Create universal link with tracking
 */
export function createUniversalLink(
  path: string,
  params?: Record<string, string>,
  trackingParams?: Record<string, string>
): string {
  const baseUrl = createWebFallback(path, params);
  const url = new URL(baseUrl);

  // Add tracking parameters
  if (trackingParams) {
    Object.entries(trackingParams).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  // Add deep link intent for app interception
  url.searchParams.set("_dl", createDeepLink(path, params));

  return url.toString();
}

function matchPath(pattern: string, path: string): boolean {
  const patternParts = pattern.split("/");
  const pathParts = path.split("/");

  if (patternParts.length !== pathParts.length) return false;

  return patternParts.every((part, i) => {
    if (part.startsWith(":")) return true;
    return part === pathParts[i];
  });
}

// API Route for handling deep link redirects
// app/api/dl/[...path]/route.ts
export async function handleDeepLinkRedirect(
  request: NextRequest,
  path: string[]
): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const userAgent = request.headers.get("user-agent") || "";

  const fullPath = "/" + path.join("/");

  // Extract tracking params
  const notificationId = searchParams.get("nid");
  const campaignId = searchParams.get("cid");

  // Track click
  if (notificationId) {
    await trackDeepLinkClick(notificationId, {
      campaignId,
      userAgent,
      timestamp: Date.now(),
    });
  }

  // Detect platform
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);

  if (isIOS || isAndroid) {
    // Attempt app deep link first
    const appLink = createDeepLink(fullPath);
    const webFallback = createWebFallback(fullPath);

    // Return HTML that attempts to open app, falls back to web
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Opening app...</title>
          <script>
            window.location.replace("${appLink}");
            setTimeout(function() {
              window.location.replace("${webFallback}");
            }, 2000);
          </script>
        </head>
        <body>
          <p>Opening app...</p>
          <p><a href="${webFallback}">Click here if the app doesn't open</a></p>
        </body>
      </html>
    `,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }

  // Desktop/Web - redirect directly
  return NextResponse.redirect(createWebFallback(fullPath));
}

async function trackDeepLinkClick(
  notificationId: string,
  data: {
    campaignId?: string | null;
    userAgent: string;
    timestamp: number;
  }
): Promise<void> {
  // Implement tracking logic
  console.log("Deep link click:", { notificationId, ...data });
}
```

### Rich Media Service Worker

```typescript
// public/push-sw.js
// Service Worker for rich push notifications

self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();

  // Prepare notification options
  const options = {
    body: data.body,
    icon: data.icon || "/icons/icon-192x192.png",
    badge: data.badge || "/icons/badge-72x72.png",
    image: data.image,
    vibrate: [100, 50, 100],
    data: data.data || {},
    tag: data.tag,
    renotify: true,
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    actions: data.actions || [],
  };

  // Handle rich media - fetch and cache image
  if (data.image) {
    event.waitUntil(
      (async () => {
        try {
          // Pre-cache the image
          const cache = await caches.open("notification-images");
          await cache.add(data.image);
        } catch (error) {
          console.warn("Failed to cache notification image:", error);
        }

        await self.registration.showNotification(data.title, options);
      })()
    );
  } else {
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const data = event.notification.data;
  let targetUrl = data.url || data.deepLink || "/";

  // Handle action button clicks
  if (event.action) {
    const action = data.actions?.find((a) => a.action === event.action);
    if (action?.url) {
      targetUrl = action.url;
    }

    // Track action click
    trackEvent("notification_action", {
      notificationId: data.notificationId,
      action: event.action,
    });
  } else {
    // Track notification click
    trackEvent("notification_click", {
      notificationId: data.notificationId,
    });
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Check if already open
      for (const client of clientList) {
        if (client.url === targetUrl && "focus" in client) {
          return client.focus();
        }
      }

      // Open new window
      return clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener("notificationclose", (event) => {
  const data = event.notification.data;

  // Track dismissal
  trackEvent("notification_dismiss", {
    notificationId: data.notificationId,
  });
});

// Handle push subscription change
self.addEventListener("pushsubscriptionchange", (event) => {
  event.waitUntil(
    (async () => {
      const newSubscription = await self.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: self.VAPID_PUBLIC_KEY,
      });

      // Send new subscription to server
      await fetch("/api/push/subscription-change", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldEndpoint: event.oldSubscription?.endpoint,
          newSubscription: newSubscription.toJSON(),
        }),
      });
    })()
  );
});

function trackEvent(eventName, data) {
  // Send to analytics endpoint
  fetch("/api/push/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      event: eventName,
      ...data,
      timestamp: Date.now(),
    }),
  }).catch(() => {
    // Ignore analytics failures
  });
}
```

### Notification Preferences API

```typescript
// app/api/push/preferences/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const preferencesSchema = z.object({
  enabled: z.boolean().optional(),
  channels: z
    .object({
      marketing: z.boolean(),
      transactional: z.boolean(),
      social: z.boolean(),
      reminders: z.boolean(),
    })
    .partial()
    .optional(),
  quietHours: z
    .object({
      enabled: z.boolean(),
      start: z.string().regex(/^\d{2}:\d{2}$/),
      end: z.string().regex(/^\d{2}:\d{2}$/),
      timezone: z.string(),
    })
    .optional(),
  frequency: z
    .object({
      maxPerDay: z.number().min(1).max(100),
      maxPerHour: z.number().min(1).max(20),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const preferences = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  if (!preferences) {
    // Return defaults
    return NextResponse.json({
      enabled: true,
      channels: {
        marketing: true,
        transactional: true,
        social: true,
        reminders: true,
      },
      quietHours: null,
      frequency: null,
    });
  }

  return NextResponse.json({
    enabled: preferences.enabled,
    channels: preferences.channels,
    quietHours: preferences.quietHours,
    frequency: preferences.frequency,
  });
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const validation = preferencesSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid preferences", details: validation.error.errors },
      { status: 400 }
    );
  }

  const preferences = await prisma.notificationPreference.upsert({
    where: { userId: session.user.id },
    update: validation.data,
    create: {
      userId: session.user.id,
      enabled: validation.data.enabled ?? true,
      channels: validation.data.channels ?? {
        marketing: true,
        transactional: true,
        social: true,
        reminders: true,
      },
      quietHours: validation.data.quietHours,
      frequency: validation.data.frequency,
    },
  });

  return NextResponse.json(preferences);
}
```

## Examples

### Example 1: E-commerce Order Status Notifications

```typescript
// lib/notifications/order-notifications.ts
import { pushService } from "@/lib/push/push-service";
import { createUniversalLink } from "@/lib/push/deep-linking";
import { prisma } from "@/lib/db";

export async function sendOrderConfirmation(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      customer: true,
    },
  });

  if (!order) return;

  const deepLink = createUniversalLink(
    "/orders/:orderId",
    { orderId },
    { nid: `order-confirm-${orderId}`, cid: "order-status" }
  );

  await pushService.sendToUser(
    order.customerId,
    {
      title: "Order Confirmed!",
      body: `Your order #${order.id.slice(-6)} has been confirmed. We'll notify you when it ships.`,
      imageUrl: order.items[0]?.product.imageUrl,
      deepLink,
      category: "order",
      priority: "high",
      data: {
        orderId: order.id,
        orderTotal: order.total,
        itemCount: order.items.length,
      },
      actions: [
        {
          id: "view",
          title: "View Order",
          deepLink,
        },
        {
          id: "track",
          title: "Track",
          deepLink: createUniversalLink("/orders/:orderId/tracking", { orderId }),
        },
      ],
    },
    { channel: "transactional" }
  );
}

export async function sendShippingUpdate(
  orderId: string,
  trackingNumber: string,
  carrier: string
): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true },
  });

  if (!order) return;

  await pushService.sendToUser(
    order.customerId,
    {
      title: "Your Order Has Shipped!",
      body: `Order #${order.id.slice(-6)} is on its way via ${carrier}.`,
      deepLink: createUniversalLink(
        "/orders/:orderId/tracking",
        { orderId },
        { nid: `order-ship-${orderId}` }
      ),
      category: "order",
      priority: "high",
      data: {
        orderId: order.id,
        trackingNumber,
        carrier,
      },
      actions: [
        {
          id: "track",
          title: "Track Package",
          deepLink: createUniversalLink("/orders/:orderId/tracking", { orderId }),
        },
      ],
    },
    { channel: "transactional" }
  );
}

export async function sendDeliveryNotification(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      customer: true,
    },
  });

  if (!order) return;

  await pushService.sendToUser(
    order.customerId,
    {
      title: "Package Delivered!",
      body: `Your order #${order.id.slice(-6)} has been delivered.`,
      imageUrl: order.items[0]?.product.imageUrl,
      deepLink: createUniversalLink("/orders/:orderId", { orderId }),
      category: "order",
      priority: "high",
      data: {
        orderId: order.id,
      },
      actions: [
        {
          id: "review",
          title: "Leave Review",
          deepLink: createUniversalLink("/orders/:orderId/review", { orderId }),
        },
        {
          id: "help",
          title: "Report Issue",
          deepLink: createUniversalLink("/help/order/:orderId", { orderId }),
        },
      ],
    },
    { channel: "transactional" }
  );
}
```

### Example 2: Social Engagement Notifications

```typescript
// lib/notifications/social-notifications.ts
import { pushService } from "@/lib/push/push-service";
import { createUniversalLink } from "@/lib/push/deep-linking";
import { prisma } from "@/lib/db";

export async function sendNewFollowerNotification(
  userId: string,
  followerId: string
): Promise<void> {
  const [user, follower] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.user.findUnique({ where: { id: followerId } }),
  ]);

  if (!user || !follower) return;

  // Check for notification batching (multiple follows in short time)
  const recentFollows = await prisma.follow.count({
    where: {
      followingId: userId,
      createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) }, // Last 5 minutes
    },
  });

  if (recentFollows > 3) {
    // Batch notification
    await pushService.sendToUser(
      userId,
      {
        title: "You're Popular!",
        body: `${follower.name} and ${recentFollows - 1} others started following you`,
        iconUrl: follower.avatarUrl,
        deepLink: createUniversalLink("/notifications"),
        category: "social",
        collapseKey: "new-followers",
        data: {
          type: "new_followers",
          count: recentFollows,
          latestFollowerId: followerId,
        },
      },
      { channel: "social" }
    );
  } else {
    // Individual notification
    await pushService.sendToUser(
      userId,
      {
        title: "New Follower",
        body: `${follower.name} started following you`,
        iconUrl: follower.avatarUrl,
        deepLink: createUniversalLink("/profile/:userId", { userId: followerId }),
        category: "social",
        collapseKey: "new-followers",
        data: {
          type: "new_follower",
          followerId,
        },
        actions: [
          {
            id: "follow-back",
            title: "Follow Back",
            deepLink: createUniversalLink("/profile/:userId/follow", {
              userId: followerId,
            }),
          },
          {
            id: "view",
            title: "View Profile",
            deepLink: createUniversalLink("/profile/:userId", { userId: followerId }),
          },
        ],
      },
      { channel: "social" }
    );
  }
}

export async function sendMentionNotification(
  mentionedUserId: string,
  mentionerUserId: string,
  postId: string,
  excerpt: string
): Promise<void> {
  const mentioner = await prisma.user.findUnique({
    where: { id: mentionerUserId },
  });

  if (!mentioner) return;

  await pushService.sendToUser(
    mentionedUserId,
    {
      title: `${mentioner.name} mentioned you`,
      body: excerpt.length > 100 ? excerpt.slice(0, 97) + "..." : excerpt,
      iconUrl: mentioner.avatarUrl,
      deepLink: createUniversalLink("/posts/:postId", { postId }),
      category: "social",
      threadId: `mentions-${mentionedUserId}`,
      data: {
        type: "mention",
        postId,
        mentionerUserId,
      },
      actions: [
        {
          id: "reply",
          title: "Reply",
          foreground: true,
          input: {
            placeholder: "Write a reply...",
            buttonTitle: "Send",
          },
        },
      ],
    },
    { channel: "social" }
  );
}
```

### Example 3: Scheduled Marketing Campaign

```typescript
// app/actions/campaigns.ts
"use server";

import { scheduler } from "@/lib/push/scheduler";
import { prisma } from "@/lib/db";
import { createUniversalLink } from "@/lib/push/deep-linking";
import { revalidatePath } from "next/cache";

export async function scheduleCampaign(formData: FormData) {
  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const imageUrl = formData.get("imageUrl") as string | null;
  const targetUrl = formData.get("targetUrl") as string;
  const scheduledDate = new Date(formData.get("scheduledDate") as string);
  const targetSegments = formData.getAll("segments") as string[];

  // Get users in target segments
  const users = await prisma.user.findMany({
    where: {
      segments: {
        hasSome: targetSegments,
      },
      notificationPreferences: {
        channels: {
          path: ["marketing"],
          equals: true,
        },
      },
    },
    select: { id: true },
  });

  const campaignId = `campaign-${Date.now()}`;

  // Schedule the notification
  const notificationId = await scheduler.schedule(
    {
      title,
      body,
      imageUrl: imageUrl || undefined,
      deepLink: createUniversalLink(targetUrl, undefined, {
        cid: campaignId,
      }),
      category: "marketing",
      priority: "normal",
      data: {
        campaignId,
        type: "marketing",
      },
    },
    users.map((u) => ({ userId: u.id })),
    scheduledDate
  );

  // Store campaign record
  await prisma.campaign.create({
    data: {
      id: campaignId,
      notificationId,
      title,
      body,
      imageUrl,
      targetUrl,
      segments: targetSegments,
      scheduledAt: scheduledDate,
      recipientCount: users.length,
      status: "scheduled",
    },
  });

  revalidatePath("/admin/campaigns");

  return { campaignId, recipientCount: users.length };
}

export async function cancelCampaign(campaignId: string) {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
  });

  if (!campaign || campaign.status !== "scheduled") {
    throw new Error("Campaign cannot be cancelled");
  }

  await scheduler.cancel(campaign.notificationId);

  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: "cancelled" },
  });

  revalidatePath("/admin/campaigns");
}
```

## Anti-patterns

### Anti-pattern 1: Not Handling Token Expiration

```typescript
// BAD: Sending to stale tokens
async function sendNotification(userIds: string[], payload: any) {
  const tokens = await prisma.deviceToken.findMany({
    where: { userId: { in: userIds } },
  });

  // Tokens might be expired, causing delivery failures and wasting resources
  for (const token of tokens) {
    await sendToDevice(token, payload);
  }
}

// GOOD: Filter by activity and handle invalid tokens
async function sendNotification(userIds: string[], payload: any) {
  const tokens = await prisma.deviceToken.findMany({
    where: {
      userId: { in: userIds },
      // Only tokens active in last 30 days
      lastActiveAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  const results = await pushService.sendToTokens(tokens, payload);

  // Remove invalid tokens
  const invalidTokenIds = results
    .filter((r) => !r.success && r.error?.shouldRemoveToken)
    .map((r) => r.tokenId);

  if (invalidTokenIds.length > 0) {
    await prisma.deviceToken.deleteMany({
      where: { id: { in: invalidTokenIds } },
    });
  }
}
```

### Anti-pattern 2: Ignoring Platform Differences

```typescript
// BAD: Same payload for all platforms
const notification = {
  title: "New Message",
  body: "You have a new message",
  // Android-only field used for all platforms
  channelId: "messages",
};

await sendToAllDevices(notification);

// GOOD: Platform-specific payloads
const basePayload = {
  title: "New Message",
  body: "You have a new message",
};

// Use the push service that handles platform differences
await pushService.sendToUser(userId, {
  ...basePayload,
  // iOS-specific
  threadId: `messages-${conversationId}`,
  category: "MESSAGE_CATEGORY",
  // Android-specific
  channelId: "messages",
  collapseKey: `messages-${conversationId}`,
  // Web-specific handled by service
});
```

### Anti-pattern 3: No Rate Limiting or Preferences

```typescript
// BAD: Spamming users with notifications
async function onNewComment(comment: Comment) {
  // Send immediately without any checks
  await pushService.sendToUser(comment.postAuthorId, {
    title: "New comment",
    body: comment.text,
  });
}

// GOOD: Respect preferences and rate limits
async function onNewComment(comment: Comment) {
  // The push service handles:
  // - User preferences (enabled, channel preferences)
  // - Quiet hours
  // - Rate limiting (max per hour/day)
  await pushService.sendToUser(
    comment.postAuthorId,
    {
      title: "New comment",
      body: comment.text,
      collapseKey: `comments-${comment.postId}`, // Collapse multiple comments
    },
    {
      respectPreferences: true,
      channel: "social",
    }
  );
}
```

### Anti-pattern 4: No Deep Link Tracking

```typescript
// BAD: Static URLs without tracking
const notification = {
  title: "Check out our sale!",
  body: "50% off everything",
  url: "https://myapp.com/sale",
};

// GOOD: Trackable universal links
const notification = {
  title: "Check out our sale!",
  body: "50% off everything",
  deepLink: createUniversalLink(
    "/sale",
    {},
    {
      nid: `sale-notification-${Date.now()}`,
      cid: "winter-sale-2024",
      utm_source: "push",
      utm_medium: "notification",
      utm_campaign: "winter-sale",
    }
  ),
};
```

## Testing

### Unit Tests for Push Service

```typescript
// __tests__/push/push-service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { PushNotificationService } from "@/lib/push/push-service";

// Mock external services
vi.mock("firebase-admin", () => ({
  default: {
    apps: [],
    initializeApp: vi.fn(),
    credential: { cert: vi.fn() },
    messaging: () => ({
      sendEachForMulticast: vi.fn().mockResolvedValue({
        responses: [{ success: true, messageId: "msg-1" }],
      }),
    }),
  },
}));

vi.mock("@parse/node-apn", () => ({
  default: {
    Provider: vi.fn(() => ({
      send: vi.fn().mockResolvedValue({ sent: ["token1"], failed: [] }),
    })),
    Notification: vi.fn(() => ({})),
  },
}));

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue({}),
  },
}));

describe("PushNotificationService", () => {
  let service: PushNotificationService;

  beforeEach(() => {
    service = new PushNotificationService();
  });

  describe("sendToUser", () => {
    it("should filter users with disabled notifications", async () => {
      vi.mocked(prisma.deviceToken.findMany).mockResolvedValue([]);
      vi.mocked(prisma.notificationPreference.findUnique).mockResolvedValue({
        enabled: false,
        channels: {},
      } as any);

      const results = await service.sendToUser(
        "user-1",
        { title: "Test", body: "Test" },
        { respectPreferences: true }
      );

      expect(results).toEqual([]);
    });

    it("should respect channel preferences", async () => {
      vi.mocked(prisma.notificationPreference.findUnique).mockResolvedValue({
        enabled: true,
        channels: { marketing: false, transactional: true },
      } as any);

      const results = await service.sendToUser(
        "user-1",
        { title: "Marketing", body: "Buy now!" },
        { respectPreferences: true, channel: "marketing" }
      );

      expect(results).toEqual([]);
    });

    it("should send to all platforms", async () => {
      vi.mocked(prisma.notificationPreference.findUnique).mockResolvedValue({
        enabled: true,
        channels: { transactional: true },
      } as any);

      vi.mocked(prisma.deviceToken.findMany).mockResolvedValue([
        { id: "t1", platform: "ios", token: "ios-token", userId: "user-1" },
        { id: "t2", platform: "android", token: "android-token", userId: "user-1" },
        { id: "t3", platform: "web", token: JSON.stringify({ endpoint: "https://..." }), userId: "user-1" },
      ] as any);

      const results = await service.sendToUser(
        "user-1",
        { title: "Test", body: "Test" },
        { channel: "transactional" }
      );

      expect(results).toHaveLength(3);
      expect(results.filter((r) => r.success)).toHaveLength(3);
    });
  });

  describe("quiet hours", () => {
    it("should block during quiet hours", async () => {
      vi.mocked(prisma.notificationPreference.findUnique).mockResolvedValue({
        enabled: true,
        channels: {},
        quietHours: {
          enabled: true,
          start: "22:00",
          end: "08:00",
          timezone: "America/New_York",
        },
      } as any);

      // Mock current time to be 23:00 in NY
      vi.setSystemTime(new Date("2024-01-15T04:00:00Z")); // 23:00 EST

      const results = await service.sendToUser("user-1", {
        title: "Test",
        body: "Test",
      });

      expect(results).toEqual([]);
    });
  });
});
```

### Integration Tests for Scheduling

```typescript
// __tests__/push/scheduler.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NotificationScheduler } from "@/lib/push/scheduler";

describe("NotificationScheduler", () => {
  let scheduler: NotificationScheduler;

  beforeEach(async () => {
    scheduler = new NotificationScheduler();
    // Clear any existing scheduled notifications
  });

  it("should schedule a notification for future delivery", async () => {
    const scheduledAt = new Date(Date.now() + 3600000); // 1 hour from now

    const id = await scheduler.schedule(
      { title: "Test", body: "Test body" },
      [{ userId: "user-1" }],
      scheduledAt
    );

    expect(id).toMatch(/^sched-/);

    const pending = await scheduler.getPending();
    expect(pending.some((n) => n.id === id)).toBe(true);
  });

  it("should cancel a scheduled notification", async () => {
    const id = await scheduler.schedule(
      { title: "Test", body: "Test" },
      [{ userId: "user-1" }],
      new Date(Date.now() + 3600000)
    );

    const cancelled = await scheduler.cancel(id);
    expect(cancelled).toBe(true);

    const pending = await scheduler.getPending();
    expect(pending.some((n) => n.id === id && n.status === "pending")).toBe(false);
  });

  it("should process due notifications", async () => {
    // Schedule for past time
    await scheduler.schedule(
      { title: "Due", body: "Test" },
      [{ userId: "user-1" }],
      new Date(Date.now() - 1000)
    );

    const processed = await scheduler.processDue();
    expect(processed).toBeGreaterThan(0);
  });
});
```

## Related Skills

- [push-notifications.md](./push-notifications.md) - Basic push notification setup
- [message-queues.md](./message-queues.md) - Queue-based message delivery
- [background-jobs.md](./background-jobs.md) - Background job processing
- [deep-linking.md](./deep-linking.md) - Deep link handling
- [service-worker.md](./service-worker.md) - Service worker patterns
- [analytics.md](./analytics.md) - Analytics and tracking

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial comprehensive implementation
- Multi-platform support (iOS/APNs, Android/FCM, Web Push, Expo)
- Rich media notifications with images and actions
- Deep linking with tracking
- Scheduled notifications with timezone support
- Notification preferences and quiet hours
- Rate limiting and notification fatigue prevention
- Comprehensive analytics tracking
- Platform-specific payload handling
- Invalid token cleanup
