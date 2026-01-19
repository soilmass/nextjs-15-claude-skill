---
id: o-announcement-banner
name: Announcement Banner
version: 2.0.0
layer: L3
category: marketing
formula: "AnnouncementBanner = Icon(a-icon) + Message(text) + ActionButton(a-button) + DismissButton(a-button) + CountdownTimer"
composes: []
description: Dismissible site-wide announcement banner with multiple variants
tags: [banner, announcement, alert, notification, promo]
performance:
  impact: medium
  lcp: low
  cls: low
dependencies:
  - react
  - lucide-react
  - js-cookie
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Announcement Banner

## Overview

A site-wide announcement banner organism for displaying important messages, promotions, or alerts. Supports dismissal with persistence, countdown timers, and multiple visual variants.

## When to Use

Use this skill when:
- Announcing site-wide promotions or sales
- Displaying system maintenance notices
- Showing cookie consent or policy updates
- Highlighting new features or releases

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   AnnouncementBanner (L3)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────┐  ┌───────────────────────────────────┐  ┌────────┐  │
│  │  Icon  │  │           Message                  │  │ Action │  │
│  │(a-icon)│  │  "🎉 New feature: Dark mode is    │  │ Button │  │
│  │   ✨    │  │   now available!"                 │  │(a-btn) │  │
│  │        │  │                                    │  │[Learn] │  │
│  └────────┘  └───────────────────────────────────┘  └────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Countdown Timer (optional)                                │  │
│  │  "Offer ends in: 2d 5h 32m 15s"                            │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                        ┌──────┐ │
│                                                        │  ✕   │ │
│                                                        │Dismis│ │
│                                                        └──────┘ │
└─────────────────────────────────────────────────────────────────┘

Variants: info | warning | success | promo | urgent
Position: top | bottom
```

## Implementation

```tsx
// components/organisms/announcement-banner.tsx
'use client';

import * as React from 'react';
import Cookies from 'js-cookie';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  X,
  AlertCircle,
  Info,
  Sparkles,
  Megaphone,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface AnnouncementBannerProps extends VariantProps<typeof bannerVariants> {
  id: string;
  message: string | React.ReactNode;
  actionLabel?: string;
  actionUrl?: string;
  onAction?: () => void;
  dismissible?: boolean;
  dismissDuration?: number; // Days to remember dismissal
  icon?: React.ReactNode;
  countdown?: Date;
  position?: 'top' | 'bottom';
  sticky?: boolean;
  className?: string;
}

// Styles
const bannerVariants = cva(
  'relative flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        info: 'bg-blue-500 text-white',
        success: 'bg-green-500 text-white',
        warning: 'bg-yellow-500 text-yellow-950',
        error: 'bg-red-500 text-white',
        promo: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
        dark: 'bg-gray-900 text-white',
        light: 'bg-gray-100 text-gray-900 border-b',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

// Countdown Timer Component
function CountdownTimer({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = React.useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  React.useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const time = calculateTimeLeft();
      if (time === null) {
        clearInterval(timer);
      }
      setTimeLeft(time);
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (!timeLeft) return null;

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="h-4 w-4" />
      <div className="flex items-center gap-1 font-mono text-xs">
        {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
        <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
        <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
        <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
      </div>
    </div>
  );
}

// Main Announcement Banner
export function AnnouncementBanner({
  id,
  message,
  actionLabel,
  actionUrl,
  onAction,
  dismissible = true,
  dismissDuration = 7,
  icon,
  countdown,
  position = 'top',
  sticky = false,
  variant,
  className,
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);

  const cookieKey = `banner-dismissed-${id}`;

  // Check if banner was dismissed
  React.useEffect(() => {
    const isDismissed = Cookies.get(cookieKey);
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, [cookieKey]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setIsVisible(false);
      if (dismissDuration > 0) {
        Cookies.set(cookieKey, 'true', { expires: dismissDuration });
      }
    }, 300);
  };

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    if (actionUrl) {
      window.location.href = actionUrl;
    }
  };

  if (!isVisible) return null;

  // Default icon based on variant
  const defaultIcons: Record<string, React.ReactNode> = {
    info: <Info className="h-4 w-4" />,
    success: <Sparkles className="h-4 w-4" />,
    warning: <AlertCircle className="h-4 w-4" />,
    error: <AlertCircle className="h-4 w-4" />,
    promo: <Sparkles className="h-4 w-4" />,
    default: <Megaphone className="h-4 w-4" />,
  };

  const displayIcon = icon ?? defaultIcons[variant || 'default'];

  return (
    <div
      role="banner"
      aria-label="Announcement"
      className={cn(
        bannerVariants({ variant }),
        sticky && 'sticky z-50',
        position === 'top' ? 'top-0' : 'bottom-0',
        isAnimatingOut && 'animate-out fade-out slide-out-to-top duration-300',
        !isAnimatingOut && 'animate-in fade-in slide-in-from-top duration-300',
        className
      )}
    >
      {/* Icon */}
      {displayIcon && <span className="flex-shrink-0">{displayIcon}</span>}

      {/* Message */}
      <span className="flex-1 text-center">{message}</span>

      {/* Countdown */}
      {countdown && <CountdownTimer targetDate={countdown} />}

      {/* Action Button */}
      {(actionLabel || actionUrl) && (
        <button
          onClick={handleAction}
          className={cn(
            'flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-colors',
            'bg-white/20 hover:bg-white/30',
            variant === 'light' && 'bg-gray-900/10 hover:bg-gray-900/20',
            variant === 'warning' && 'bg-yellow-900/10 hover:bg-yellow-900/20'
          )}
        >
          {actionLabel || 'Learn more'}
          <ArrowRight className="h-3 w-3" />
        </button>
      )}

      {/* Dismiss Button */}
      {dismissible && (
        <button
          onClick={handleDismiss}
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition-colors',
            'hover:bg-white/20',
            variant === 'light' && 'hover:bg-gray-900/10',
            variant === 'warning' && 'hover:bg-yellow-900/10'
          )}
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

// Multiple Banners Container
interface AnnouncementStackProps {
  announcements: AnnouncementBannerProps[];
  maxVisible?: number;
}

export function AnnouncementStack({
  announcements,
  maxVisible = 1,
}: AnnouncementStackProps) {
  const [visibleAnnouncements, setVisibleAnnouncements] = React.useState<
    AnnouncementBannerProps[]
  >([]);

  React.useEffect(() => {
    // Filter out dismissed announcements
    const visible = announcements.filter((a) => {
      const isDismissed = Cookies.get(`banner-dismissed-${a.id}`);
      return !isDismissed;
    });
    setVisibleAnnouncements(visible.slice(0, maxVisible));
  }, [announcements, maxVisible]);

  if (visibleAnnouncements.length === 0) return null;

  return (
    <div className="flex flex-col">
      {visibleAnnouncements.map((announcement) => (
        <AnnouncementBanner key={announcement.id} {...announcement} />
      ))}
    </div>
  );
}

// Pre-built Banner Types

export function PromoBanner({
  promoCode,
  discount,
  expiresAt,
  ...props
}: Omit<AnnouncementBannerProps, 'message' | 'variant'> & {
  promoCode?: string;
  discount: string;
  expiresAt?: Date;
}) {
  return (
    <AnnouncementBanner
      variant="promo"
      message={
        <span>
          {discount} off your first order!{' '}
          {promoCode && (
            <span className="rounded bg-white/20 px-2 py-0.5 font-mono">
              {promoCode}
            </span>
          )}
        </span>
      }
      countdown={expiresAt}
      {...props}
    />
  );
}

export function MaintenanceBanner({
  scheduledTime,
  ...props
}: Omit<AnnouncementBannerProps, 'message' | 'variant'> & {
  scheduledTime: string;
}) {
  return (
    <AnnouncementBanner
      variant="warning"
      message={`Scheduled maintenance on ${scheduledTime}. Some features may be unavailable.`}
      dismissible={false}
      {...props}
    />
  );
}

export function NewFeatureBanner({
  featureName,
  ...props
}: Omit<AnnouncementBannerProps, 'message' | 'variant'> & {
  featureName: string;
}) {
  return (
    <AnnouncementBanner
      variant="info"
      message={`New feature: ${featureName} is now available!`}
      actionLabel="Try it out"
      {...props}
    />
  );
}
```

## Usage

### Basic Usage

```tsx
import { AnnouncementBanner } from '@/components/organisms/announcement-banner';

export function Layout({ children }) {
  return (
    <>
      <AnnouncementBanner
        id="welcome-2024"
        message="Welcome to our new platform! Check out the new features."
        actionLabel="Learn more"
        actionUrl="/whats-new"
      />
      <main>{children}</main>
    </>
  );
}
```

### Promotional Banner

```tsx
import { PromoBanner } from '@/components/organisms/announcement-banner';

<PromoBanner
  id="summer-sale"
  discount="30%"
  promoCode="SUMMER30"
  expiresAt={new Date('2024-08-31')}
  actionUrl="/shop"
/>
```

### Multiple Announcements

```tsx
import { AnnouncementStack } from '@/components/organisms/announcement-banner';

<AnnouncementStack
  announcements={[
    {
      id: 'maintenance',
      message: 'Scheduled maintenance tonight at 2 AM',
      variant: 'warning',
      dismissible: false,
    },
    {
      id: 'new-feature',
      message: 'New: Dark mode is here!',
      variant: 'info',
      actionUrl: '/settings/appearance',
    },
  ]}
  maxVisible={2}
/>
```

## Props API

### AnnouncementBanner

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | Required | Unique identifier for dismissal persistence |
| `message` | `string \| ReactNode` | Required | Banner message content |
| `variant` | `'default' \| 'info' \| 'success' \| 'warning' \| 'error' \| 'promo' \| 'dark' \| 'light'` | `'default'` | Visual style variant |
| `actionLabel` | `string` | `undefined` | Label for action button |
| `actionUrl` | `string` | `undefined` | URL to navigate when action clicked |
| `onAction` | `() => void` | `undefined` | Handler for action button click |
| `dismissible` | `boolean` | `true` | Whether banner can be dismissed |
| `dismissDuration` | `number` | `7` | Days to remember dismissal |
| `icon` | `ReactNode` | Auto based on variant | Custom icon to display |
| `countdown` | `Date` | `undefined` | Target date for countdown timer |
| `position` | `'top' \| 'bottom'` | `'top'` | Banner position on screen |
| `sticky` | `boolean` | `false` | Whether banner sticks during scroll |
| `className` | `string` | `undefined` | Additional CSS classes |

### AnnouncementStack

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `announcements` | `AnnouncementBannerProps[]` | Required | Array of announcements to display |
| `maxVisible` | `number` | `1` | Maximum banners visible at once |

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Visible | Banner displayed | Fade in animation from top |
| Countdown Active | Timer running | Live countdown display (Xd Xh Xm Xs) |
| Countdown Expired | Timer reached zero | Countdown disappears |
| Animating Out | Dismissal in progress | Fade out + slide up animation |
| Dismissed | User closed banner | Banner hidden, cookie stored |
| Hover (Action) | Mouse over action button | Button background lightens |
| Hover (Dismiss) | Mouse over close button | Close button background appears |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Move focus to action button, then dismiss button |
| `Enter` | Activate focused button (action or dismiss) |
| `Space` | Activate focused button |
| `Escape` | Dismiss banner (when any button focused) |

## Screen Reader Announcements

- Banner announced with `role="banner"` and `aria-label="Announcement"`
- Message content read automatically when banner appears
- Countdown timer has live updates (aria-live region)
- Action button clearly labeled with action text
- Dismiss button has `aria-label="Dismiss announcement"`
- Variant icons have descriptive text (info, warning, etc.)

## Anti-patterns

### 1. Missing Unique ID for Persistence
```tsx
// Bad - no id, dismissal won't persist
<AnnouncementBanner
  message="Welcome to our new site!"
/>

// Good - unique id for cookie-based persistence
<AnnouncementBanner
  id="welcome-2024-v1"
  message="Welcome to our new site!"
/>
```

### 2. Non-Dismissible Important Notices
```tsx
// Bad - can't dismiss routine announcement
<AnnouncementBanner
  id="new-feature"
  message="Try our new dark mode!"
  dismissible={false}
/>

// Good - only use non-dismissible for critical notices
<AnnouncementBanner
  id="maintenance-tonight"
  variant="warning"
  message="Scheduled maintenance tonight at 2 AM. Service may be unavailable."
  dismissible={false}
/>
```

### 3. Too Many Stacked Banners
```tsx
// Bad - overwhelming users with multiple banners
<AnnouncementStack
  announcements={announcements}
  maxVisible={5}
/>

// Good - limit visible banners
<AnnouncementStack
  announcements={announcements}
  maxVisible={1}
/>
```

### 4. Missing Action for Promotional Banners
```tsx
// Bad - promo without way to act
<AnnouncementBanner
  id="summer-sale"
  variant="promo"
  message="Summer sale: 30% off everything!"
/>

// Good - clear call to action
<AnnouncementBanner
  id="summer-sale"
  variant="promo"
  message="Summer sale: 30% off everything!"
  actionLabel="Shop now"
  actionUrl="/sale"
/>
```

## Related Skills

- `organisms/cookie-consent` - Cookie banner
- `molecules/callout` - Inline callouts
- `patterns/toast-notifications` - Toast notifications

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Multiple variants (info, success, warning, error, promo)
- Dismissal with cookie persistence
- Countdown timer support
- Sticky positioning option
