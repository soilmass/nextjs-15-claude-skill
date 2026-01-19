---
id: pt-urgency-indicators
name: Urgency Indicators
version: 1.1.0
layer: L5
category: browser
description: Conversion-boosting urgency elements including low stock warnings, countdown timers, limited-time offers, and real-time purchase notifications
tags: [urgency, scarcity, conversion, countdown, ecommerce, next15]
composes: []
formula: "UrgencyIndicators = LowStockBadges + CountdownTimers + PurchaseNotifications + LimitedOffers"
dependencies:
  date-fns: "^3.0.0"
  framer-motion: "^11.0.0"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Urgency Indicators

## Overview

Urgency indicators are conversion optimization elements that leverage psychological principles of scarcity and social proof to encourage purchasing decisions. When implemented ethically with accurate data, these components can significantly improve conversion rates while maintaining customer trust.

This pattern provides a comprehensive suite of urgency-related components for Next.js 15 e-commerce applications. It includes low stock warnings that display inventory levels, countdown timers for time-limited promotions, real-time purchase notifications showing recent buyer activity, and promotional banners for flash sales. All components are designed to be accessible, performant, and ethically implemented with truthful data.

The key to effective urgency indicators is authenticity. Fake urgency destroys customer trust and can lead to legal issues. All components in this pattern are designed to work with real inventory data, actual promotion end dates, and genuine purchase events. The psychological impact comes from truthful scarcity, not manufactured pressure.

## When to Use

- **Low Stock Alerts**: When inventory levels genuinely drop below a threshold (typically 10 or fewer items) to inform customers of limited availability
- **Flash Sales**: Time-limited promotions with genuine end dates where countdown timers help customers understand remaining time
- **Seasonal Events**: Holiday sales, Black Friday, or special events where promotions have defined end times
- **High-Demand Products**: Items that frequently sell out benefit from stock visibility to help customers make informed decisions
- **Social Proof**: Products with active purchase activity can display notifications to build confidence in buying decisions
- **Limited Editions**: Products with finite quantities where scarcity is inherent to the product offering

## When NOT to Use

- **Unlimited Stock Items**: Digital products or items with no real scarcity should not display fake stock warnings
- **Evergreen Promotions**: If a sale never actually ends, do not use countdown timers that reset
- **Low Traffic Products**: Purchase notifications for rarely-bought items will appear fake
- **Trust-Sensitive Contexts**: Medical, financial, or emergency services where pressure tactics are unethical

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Urgency Indicators Architecture                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Data Sources (Server)                         │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │   │
│  │  │ Inventory   │  │ Promotions  │  │ Purchase Events         │  │   │
│  │  │ Database    │  │ Config      │  │ (WebSocket/Polling)     │  │   │
│  │  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘  │   │
│  └─────────┼────────────────┼──────────────────────┼───────────────┘   │
│            │                │                      │                    │
│            ▼                ▼                      ▼                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Urgency Components (Client)                   │   │
│  │                                                                  │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │   │
│  │  │ LowStockBadge │  │ CountdownTimer│  │ PurchaseNotification│   │   │
│  │  │               │  │               │  │                   │    │   │
│  │  │ - Critical    │  │ - Days        │  │ - Toast Popup     │    │   │
│  │  │ - Warning     │  │ - Hours       │  │ - Product Image   │    │   │
│  │  │ - Out of Stock│  │ - Minutes     │  │ - Location        │    │   │
│  │  └───────────────┘  │ - Seconds     │  └───────────────────┘    │   │
│  │                     └───────────────┘                           │   │
│  │  ┌───────────────┐  ┌───────────────┐  ┌───────────────────┐    │   │
│  │  │ PromoBanner   │  │ ViewerCount   │  │ RecentlyViewed    │    │   │
│  │  │               │  │               │  │                   │    │   │
│  │  │ - Dismissible │  │ - Real-time   │  │ - Anonymous count │    │   │
│  │  │ - Countdown   │  │ - Threshold   │  │ - Time window     │    │   │
│  │  │ - Promo Code  │  │               │  │                   │    │   │
│  │  └───────────────┘  └───────────────┘  └───────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│            │                │                      │                    │
│            ▼                ▼                      ▼                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    Product Page Layout                           │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │ [Banner: 20% OFF - Ends in 02:15:30] [X]                │    │   │
│  │  ├─────────────────────────────────────────────────────────┤    │   │
│  │  │  Product Image  │  Product Info                         │    │   │
│  │  │                 │  ─────────────                         │    │   │
│  │  │                 │  Name: Premium Widget                  │    │   │
│  │  │                 │  Price: $99.99                         │    │   │
│  │  │                 │  [🔥 Only 3 left!] [Low Stock Badge]   │    │   │
│  │  │                 │                                        │    │   │
│  │  │                 │  Sale ends in: [02:15:30] [Timer]      │    │   │
│  │  │                 │                                        │    │   │
│  │  │                 │  [Add to Cart]                         │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────┐                               │   │
│  │  │ 🛒 Sarah from NYC purchased  │  [Purchase Notification]      │   │
│  │  │    this item 2 min ago       │                               │   │
│  │  └──────────────────────────────┘                               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Implementation

### Low Stock Badge

```tsx
// components/urgency/low-stock-badge.tsx
'use client';

import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Flame, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LowStockBadgeProps {
  inventory: number;
  lowThreshold?: number;
  criticalThreshold?: number;
  showExactCount?: boolean;
  className?: string;
}

export function LowStockBadge({
  inventory,
  lowThreshold = 10,
  criticalThreshold = 3,
  showExactCount = true,
  className,
}: LowStockBadgeProps) {
  // Out of stock state
  if (inventory === 0) {
    return (
      <Badge
        variant="destructive"
        className={cn('gap-1', className)}
        role="status"
        aria-live="polite"
      >
        <XCircle className="w-3 h-3" aria-hidden="true" />
        <span>Out of Stock</span>
      </Badge>
    );
  }

  // Critical stock level (1-3 items)
  if (inventory <= criticalThreshold) {
    return (
      <Badge
        variant="destructive"
        className={cn('animate-pulse gap-1', className)}
        role="status"
        aria-live="polite"
      >
        <Flame className="w-3 h-3" aria-hidden="true" />
        <span>
          {showExactCount ? `Only ${inventory} left!` : 'Almost gone!'}
        </span>
      </Badge>
    );
  }

  // Low stock level (4-10 items)
  if (inventory <= lowThreshold) {
    return (
      <Badge
        variant="secondary"
        className={cn('bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 gap-1', className)}
        role="status"
        aria-live="polite"
      >
        <AlertTriangle className="w-3 h-3" aria-hidden="true" />
        <span>
          {showExactCount ? `Low stock - ${inventory} remaining` : 'Low stock'}
        </span>
      </Badge>
    );
  }

  // Sufficient stock - render nothing
  return null;
}
```

### Countdown Timer

```tsx
// components/urgency/countdown-timer.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { differenceInSeconds, intervalToDuration } from 'date-fns';
import { Clock, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  endDate: Date;
  label?: string;
  onExpire?: () => void;
  variant?: 'default' | 'compact' | 'banner';
  showIcon?: boolean;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({
  endDate,
  label = 'Sale ends in',
  onExpire,
  variant = 'default',
  showIcon = true,
  className,
}: CountdownTimerProps) {
  const calculateTimeLeft = useCallback((): TimeLeft | null => {
    const seconds = differenceInSeconds(endDate, new Date());
    if (seconds <= 0) return null;

    const duration = intervalToDuration({
      start: new Date(),
      end: endDate,
    });

    return {
      days: duration.days || 0,
      hours: duration.hours || 0,
      minutes: duration.minutes || 0,
      seconds: duration.seconds || 0,
    };
  }, [endDate]);

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(calculateTimeLeft);
  const [hasExpired, setHasExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (!newTimeLeft && !hasExpired) {
        setHasExpired(true);
        onExpire?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, hasExpired, onExpire]);

  if (!timeLeft) {
    return null;
  }

  const { days, hours, minutes, seconds } = timeLeft;

  // Compact variant for inline display
  if (variant === 'compact') {
    return (
      <div
        className={cn('inline-flex items-center gap-1 text-sm', className)}
        role="timer"
        aria-live="polite"
        aria-label={`${label}: ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds remaining`}
      >
        {showIcon && <Timer className="w-4 h-4" aria-hidden="true" />}
        <span className="font-mono">
          {days > 0 && `${days}d `}
          {String(hours).padStart(2, '0')}:
          {String(minutes).padStart(2, '0')}:
          {String(seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  // Banner variant for promotional banners
  if (variant === 'banner') {
    return (
      <div
        className={cn('flex items-center gap-2', className)}
        role="timer"
        aria-live="polite"
      >
        <span className="text-sm font-medium">{label}</span>
        <div className="flex gap-1 font-mono text-sm font-bold">
          {days > 0 && <span>{days}d</span>}
          <span>{String(hours).padStart(2, '0')}h</span>
          <span>{String(minutes).padStart(2, '0')}m</span>
          <span>{String(seconds).padStart(2, '0')}s</span>
        </div>
      </div>
    );
  }

  // Default variant with time unit boxes
  return (
    <div className={className} role="timer" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        {showIcon && <Clock className="w-4 h-4" aria-hidden="true" />}
        <span>{label}</span>
      </div>
      <div className="flex gap-2">
        {days > 0 && <TimeUnit value={days} label="days" />}
        <TimeUnit value={hours} label="hrs" />
        <TimeUnit value={minutes} label="min" />
        <TimeUnit value={seconds} label="sec" />
      </div>
    </div>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center bg-muted rounded-lg px-3 py-2 min-w-[60px]">
      <span
        className="text-2xl font-bold tabular-nums"
        aria-label={`${value} ${label}`}
      >
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
```

### Real-time Purchase Notifications

```tsx
// components/urgency/purchase-notification.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { X, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Purchase {
  id: string;
  name: string;
  location: string;
  product: string;
  productImage: string;
  timestamp: Date;
}

interface PurchaseNotificationProps {
  productId?: string;
  enabled?: boolean;
  interval?: number;
  displayDuration?: number;
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}

// Fetch real purchases from API
async function fetchRecentPurchases(productId?: string): Promise<Purchase[]> {
  const url = productId
    ? `/api/purchases/recent?productId=${productId}`
    : '/api/purchases/recent';

  const response = await fetch(url);
  if (!response.ok) return [];
  return response.json();
}

export function PurchaseNotification({
  productId,
  enabled = true,
  interval = 30000,
  displayDuration = 5000,
  position = 'bottom-left',
  className,
}: PurchaseNotificationProps) {
  const [visible, setVisible] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Fetch purchases on mount
  useEffect(() => {
    if (!enabled) return;

    fetchRecentPurchases(productId).then(setPurchases);

    // Refresh purchases periodically
    const refreshInterval = setInterval(() => {
      fetchRecentPurchases(productId).then(setPurchases);
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [enabled, productId]);

  // Show notifications at intervals
  useEffect(() => {
    if (!enabled || purchases.length === 0 || dismissed) return;

    const showNotification = () => {
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
        setCurrentIndex((c) => (c + 1) % purchases.length);
      }, displayDuration);
    };

    // Initial delay before first notification
    const initialTimeout = setTimeout(showNotification, 5000);
    const intervalId = setInterval(showNotification, interval);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(intervalId);
    };
  }, [enabled, purchases, interval, displayDuration, dismissed]);

  const handleDismiss = useCallback(() => {
    setVisible(false);
    setDismissed(true);
  }, []);

  if (!enabled || purchases.length === 0) return null;

  const purchase = purchases[currentIndex];
  if (!purchase) return null;

  const positionClasses = {
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
  };

  const timeSince = getTimeSince(purchase.timestamp);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: position.includes('bottom') ? 50 : -50, x: 0 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: position.includes('bottom') ? 50 : -50 }}
          className={cn(
            'fixed z-50 bg-white dark:bg-gray-900 rounded-lg shadow-lg border p-4 max-w-sm',
            positionClasses[position],
            className
          )}
          role="status"
          aria-live="polite"
        >
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            aria-label="Dismiss notification"
          >
            <X className="w-3 h-3" />
          </button>

          <div className="flex gap-3">
            <div className="relative w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
              {purchase.productImage ? (
                <Image
                  src={purchase.productImage}
                  alt={purchase.product}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm truncate">
                <span className="font-medium">{purchase.name}</span>
                {purchase.location && (
                  <span className="text-muted-foreground"> from {purchase.location}</span>
                )}
              </p>
              <p className="text-sm font-semibold truncate">{purchase.product}</p>
              <p className="text-xs text-muted-foreground">{timeSince}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function getTimeSince(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}
```

### Limited Time Banner

```tsx
// components/urgency/promo-banner.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { CountdownTimer } from './countdown-timer';
import { cn } from '@/lib/utils';

interface PromoBannerProps {
  message: string;
  endDate: Date;
  discountCode?: string;
  bgColor?: string;
  textColor?: string;
  dismissible?: boolean;
  storageKey?: string;
  onDismiss?: () => void;
  onExpire?: () => void;
}

export function PromoBanner({
  message,
  endDate,
  discountCode,
  bgColor = 'bg-primary',
  textColor = 'text-primary-foreground',
  dismissible = true,
  storageKey = 'promo-banner-dismissed',
  onDismiss,
  onExpire,
}: PromoBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Check if previously dismissed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissedAt = localStorage.getItem(storageKey);
      if (dismissedAt) {
        // Allow re-showing after 24 hours
        const dismissedTime = parseInt(dismissedAt, 10);
        if (Date.now() - dismissedTime < 24 * 60 * 60 * 1000) {
          setDismissed(true);
        }
      }
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, Date.now().toString());
    }
    onDismiss?.();
  };

  const handleCopyCode = async () => {
    if (discountCode) {
      await navigator.clipboard.writeText(discountCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExpire = () => {
    setIsExpired(true);
    onExpire?.();
  };

  if (dismissed || isExpired || new Date() > endDate) return null;

  return (
    <div
      className={cn(bgColor, textColor, 'py-2 px-4')}
      role="banner"
      aria-label="Promotional offer"
    >
      <div className="container flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap flex-1">
          <span className="font-medium">{message}</span>

          {discountCode && (
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-sm font-mono transition-colors"
              aria-label={`Copy discount code ${discountCode}`}
            >
              {discountCode}
              {copied ? (
                <Check className="w-3 h-3" aria-hidden="true" />
              ) : (
                <Copy className="w-3 h-3" aria-hidden="true" />
              )}
            </button>
          )}

          <CountdownTimer
            endDate={endDate}
            label=""
            variant="banner"
            showIcon={false}
            onExpire={handleExpire}
          />
        </div>

        {dismissible && (
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            aria-label="Dismiss promotional banner"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
```

### Viewer Count Indicator

```tsx
// components/urgency/viewer-count.tsx
'use client';

import { useState, useEffect } from 'react';
import { Eye, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewerCountProps {
  productId: string;
  minThreshold?: number;
  className?: string;
}

export function ViewerCount({
  productId,
  minThreshold = 5,
  className,
}: ViewerCountProps) {
  const [viewerCount, setViewerCount] = useState<number | null>(null);

  useEffect(() => {
    // Register this viewer
    const register = async () => {
      const response = await fetch('/api/products/viewers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });

      if (response.ok) {
        const data = await response.json();
        setViewerCount(data.count);
      }
    };

    register();

    // Heartbeat to maintain presence
    const heartbeat = setInterval(register, 30000);

    // Unregister on unmount
    return () => {
      clearInterval(heartbeat);
      fetch('/api/products/viewers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
    };
  }, [productId]);

  // Only show if above threshold
  if (viewerCount === null || viewerCount < minThreshold) {
    return null;
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 text-sm text-muted-foreground',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Eye className="w-4 h-4" aria-hidden="true" />
      <span>{viewerCount} people viewing this</span>
    </div>
  );
}
```

## Examples

### Example 1: Complete Product Page Integration

```tsx
// app/products/[slug]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { LowStockBadge } from '@/components/urgency/low-stock-badge';
import { CountdownTimer } from '@/components/urgency/countdown-timer';
import { PurchaseNotification } from '@/components/urgency/purchase-notification';
import { PromoBanner } from '@/components/urgency/promo-banner';
import { ViewerCount } from '@/components/urgency/viewer-count';
import { AddToCartButton } from '@/components/cart/add-to-cart-button';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      activePromotion: true,
      category: true,
    },
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  const { activePromotion } = product;

  return (
    <div>
      {/* Promotional Banner */}
      {activePromotion && (
        <PromoBanner
          message={activePromotion.message}
          endDate={new Date(activePromotion.endDate)}
          discountCode={activePromotion.code}
          bgColor="bg-red-600"
        />
      )}

      <div className="container py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <LowStockBadge inventory={product.inventory} />
            </div>

            <p className="text-2xl font-semibold">
              ${product.price.toFixed(2)}
            </p>

            <p className="text-muted-foreground">{product.description}</p>

            {/* Viewer Count */}
            <ViewerCount productId={product.id} />

            {/* Sale Countdown */}
            {activePromotion && (
              <div className="p-4 bg-muted rounded-lg">
                <CountdownTimer
                  endDate={new Date(activePromotion.endDate)}
                  label="Flash sale ends in"
                />
              </div>
            )}

            {/* Add to Cart */}
            <AddToCartButton
              product={{
                id: product.id,
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                maxQuantity: product.inventory,
              }}
              disabled={product.inventory === 0}
            />
          </div>
        </div>
      </div>

      {/* Purchase Notifications */}
      <PurchaseNotification
        productId={product.id}
        enabled={product.inventory > 0 && product.inventory < 20}
      />
    </div>
  );
}
```

### Example 2: Flash Sale Landing Page

```tsx
// app/flash-sale/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { CountdownTimer } from '@/components/urgency/countdown-timer';
import { LowStockBadge } from '@/components/urgency/low-stock-badge';
import { Card, CardContent } from '@/components/ui/card';

interface FlashSaleProduct {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  inventory: number;
  image: string;
}

export default function FlashSalePage() {
  const [products, setProducts] = useState<FlashSaleProduct[]>([]);
  const [saleEndDate, setSaleEndDate] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    fetch('/api/flash-sale/current')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products);
        setSaleEndDate(new Date(data.endDate));
      });
  }, []);

  if (isExpired) {
    return (
      <div className="container py-16 text-center">
        <h1 className="text-4xl font-bold mb-4">Flash Sale Ended</h1>
        <p className="text-muted-foreground">
          Stay tuned for our next flash sale!
        </p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Flash Sale</h1>
        {saleEndDate && (
          <div className="flex justify-center">
            <CountdownTimer
              endDate={saleEndDate}
              label="Hurry! Sale ends in"
              onExpire={() => setIsExpired(true)}
            />
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="relative aspect-square mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded"
                />
                <div className="absolute top-2 left-2">
                  <LowStockBadge inventory={product.inventory} />
                </div>
              </div>
              <h3 className="font-semibold">{product.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold text-red-600">
                  ${product.salePrice.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Example 3: Cart Urgency Indicators

```tsx
// components/cart/cart-urgency.tsx
'use client';

import { useCartStore } from '@/stores/cart-store';
import { LowStockBadge } from '@/components/urgency/low-stock-badge';
import { CountdownTimer } from '@/components/urgency/countdown-timer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock, AlertTriangle } from 'lucide-react';

interface CartItemWithStock {
  id: string;
  name: string;
  quantity: number;
  currentInventory: number;
}

interface CartUrgencyProps {
  itemsWithStock: CartItemWithStock[];
  cartReservationExpiry?: Date;
}

export function CartUrgency({
  itemsWithStock,
  cartReservationExpiry
}: CartUrgencyProps) {
  // Find items where quantity might exceed available stock
  const lowStockItems = itemsWithStock.filter(
    (item) => item.currentInventory < item.quantity + 5
  );

  const outOfStockItems = itemsWithStock.filter(
    (item) => item.currentInventory === 0
  );

  return (
    <div className="space-y-3">
      {/* Cart Reservation Timer */}
      {cartReservationExpiry && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Items reserved for:</span>
            <CountdownTimer
              endDate={cartReservationExpiry}
              variant="compact"
              showIcon={false}
            />
          </AlertDescription>
        </Alert>
      )}

      {/* Out of Stock Warning */}
      {outOfStockItems.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {outOfStockItems.length === 1
              ? `"${outOfStockItems[0].name}" is now out of stock.`
              : `${outOfStockItems.length} items are now out of stock.`}
          </AlertDescription>
        </Alert>
      )}

      {/* Low Stock Warning */}
      {lowStockItems.length > 0 && outOfStockItems.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some items in your cart are running low on stock. Complete your
            purchase soon to secure them.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
```

## Anti-patterns

### Anti-pattern 1: Fake or Resetting Countdown Timers

```tsx
// BAD - Timer that resets when it expires
function FakeCountdown() {
  const [endDate, setEndDate] = useState(new Date(Date.now() + 3600000));

  const handleExpire = () => {
    // This creates fake urgency by resetting the timer
    setEndDate(new Date(Date.now() + 3600000)); // WRONG!
  };

  return <CountdownTimer endDate={endDate} onExpire={handleExpire} />;
}

// GOOD - Timer with genuine end date from server
function RealCountdown({ promotionEndDate }: { promotionEndDate: Date }) {
  const handleExpire = () => {
    // Refresh page or update UI to show promotion ended
    window.location.reload();
  };

  return <CountdownTimer endDate={promotionEndDate} onExpire={handleExpire} />;
}
```

### Anti-pattern 2: Fabricated Purchase Notifications

```tsx
// BAD - Hardcoded fake purchases
const FAKE_PURCHASES = [
  { name: 'John from NYC', product: 'Widget', time: 2 },
  { name: 'Jane from LA', product: 'Widget', time: 5 },
];

function FakePurchaseNotification() {
  // Cycling through fake data destroys trust
  return <PurchaseNotification purchases={FAKE_PURCHASES} />;
}

// GOOD - Real purchases from API
function RealPurchaseNotification({ productId }: { productId: string }) {
  const [purchases, setPurchases] = useState([]);

  useEffect(() => {
    fetch(`/api/purchases/recent?productId=${productId}`)
      .then(res => res.json())
      .then(setPurchases);
  }, [productId]);

  // Only show if there are real purchases
  if (purchases.length === 0) return null;

  return <PurchaseNotification purchases={purchases} />;
}
```

### Anti-pattern 3: Always-Visible Low Stock Warnings

```tsx
// BAD - Showing low stock when inventory is plentiful
function AlwaysUrgent({ inventory }: { inventory: number }) {
  // Showing urgent message regardless of actual stock
  return (
    <Badge variant="destructive">
      Selling fast! Only a few left! {/* WRONG - misleading */}
    </Badge>
  );
}

// GOOD - Only show when genuinely low
function HonestStock({ inventory }: { inventory: number }) {
  // Returns null when inventory is sufficient
  return <LowStockBadge inventory={inventory} lowThreshold={10} />;
}
```

## Testing

### Unit Tests for Low Stock Badge

```tsx
// __tests__/components/low-stock-badge.test.tsx
import { render, screen } from '@testing-library/react';
import { LowStockBadge } from '@/components/urgency/low-stock-badge';

describe('LowStockBadge', () => {
  it('renders nothing when inventory is above threshold', () => {
    const { container } = render(<LowStockBadge inventory={50} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders low stock warning when inventory is below low threshold', () => {
    render(<LowStockBadge inventory={8} />);
    expect(screen.getByText(/low stock/i)).toBeInTheDocument();
    expect(screen.getByText(/8 remaining/i)).toBeInTheDocument();
  });

  it('renders critical warning when inventory is at critical threshold', () => {
    render(<LowStockBadge inventory={2} />);
    expect(screen.getByText(/only 2 left/i)).toBeInTheDocument();
  });

  it('renders out of stock when inventory is 0', () => {
    render(<LowStockBadge inventory={0} />);
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument();
  });

  it('respects custom thresholds', () => {
    render(
      <LowStockBadge
        inventory={15}
        lowThreshold={20}
        criticalThreshold={5}
      />
    );
    expect(screen.getByText(/low stock/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<LowStockBadge inventory={3} />);
    const badge = screen.getByRole('status');
    expect(badge).toHaveAttribute('aria-live', 'polite');
  });
});
```

### Unit Tests for Countdown Timer

```tsx
// __tests__/components/countdown-timer.test.tsx
import { render, screen, act } from '@testing-library/react';
import { CountdownTimer } from '@/components/urgency/countdown-timer';

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders countdown with correct time units', () => {
    const endDate = new Date(Date.now() + 90061000); // 1 day, 1 hour, 1 min, 1 sec
    render(<CountdownTimer endDate={endDate} />);

    expect(screen.getByText('01')).toBeInTheDocument(); // days
    expect(screen.getByText('hrs')).toBeInTheDocument();
    expect(screen.getByText('min')).toBeInTheDocument();
    expect(screen.getByText('sec')).toBeInTheDocument();
  });

  it('calls onExpire when timer reaches zero', () => {
    const onExpire = jest.fn();
    const endDate = new Date(Date.now() + 1000);

    render(<CountdownTimer endDate={endDate} onExpire={onExpire} />);

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when already expired', () => {
    const endDate = new Date(Date.now() - 1000);
    const { container } = render(<CountdownTimer endDate={endDate} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders compact variant correctly', () => {
    const endDate = new Date(Date.now() + 3661000);
    render(<CountdownTimer endDate={endDate} variant="compact" />);

    expect(screen.getByText(/01:01:01/)).toBeInTheDocument();
  });

  it('has proper ARIA attributes for accessibility', () => {
    const endDate = new Date(Date.now() + 60000);
    render(<CountdownTimer endDate={endDate} />);

    const timer = screen.getByRole('timer');
    expect(timer).toHaveAttribute('aria-live', 'polite');
  });
});
```

### Integration Tests

```tsx
// __tests__/integration/urgency-indicators.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { PurchaseNotification } from '@/components/urgency/purchase-notification';

const mockPurchases = [
  {
    id: '1',
    name: 'Alice',
    location: 'NYC',
    product: 'Widget',
    productImage: '/widget.jpg',
    timestamp: new Date(Date.now() - 120000),
  },
];

const server = setupServer(
  http.get('/api/purchases/recent', () => {
    return HttpResponse.json(mockPurchases);
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('PurchaseNotification Integration', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('fetches and displays real purchase data', async () => {
    render(<PurchaseNotification enabled={true} />);

    // Wait for initial fetch
    await waitFor(() => {
      expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    // Fast-forward to when notification should appear
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('NYC')).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    server.use(
      http.get('/api/purchases/recent', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    const { container } = render(<PurchaseNotification enabled={true} />);

    await waitFor(() => {
      // Should render nothing on error
      expect(container.querySelector('[role="status"]')).not.toBeInTheDocument();
    });
  });
});
```

## Related Skills

- [Analytics Events](../patterns/analytics-events.md) - Track urgency indicator effectiveness
- [Inventory Management](../patterns/inventory-management.md) - Real-time stock data
- [Shopping Cart](../patterns/shopping-cart.md) - Cart urgency integration
- [A/B Testing](../patterns/ab-testing.md) - Test urgency variations
- [WebSocket](../patterns/websocket.md) - Real-time purchase events

---

## Changelog

### 1.1.0 (2026-01-18)
- Added comprehensive Overview section
- Added When NOT to Use section
- Added Composition Diagram
- Added ViewerCount component
- Added 3 real-world examples
- Added 3 anti-patterns with code examples
- Added unit and integration tests
- Enhanced accessibility with ARIA attributes
- Added Related Skills section

### 1.0.0 (2025-01-18)
- Initial implementation
- Low stock badge component
- Countdown timer component
- Purchase notification component
- Promo banner component
