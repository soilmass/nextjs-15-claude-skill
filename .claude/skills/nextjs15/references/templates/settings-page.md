---
id: t-settings-page
name: Settings Page
version: 2.0.0
layer: L4
category: pages
description: User/account settings page with tabs for different settings categories
tags: [page, settings, profile, account, preferences, configuration]
formula: "SettingsPage = SettingsForm(o-settings-form) + Tabs(m-tabs) + FormField(m-form-field) + InputSwitch(a-input-switch)"
composes:
  - ../organisms/settings-form.md
  - ../molecules/tabs.md
  - ../molecules/form-field.md
  - ../atoms/input-switch.md
dependencies: []
performance:
  impact: low
  lcp: low
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Settings Page

## Overview

The Settings Page template provides a comprehensive settings interface. Features tabbed navigation for different settings categories (profile, account, notifications, security, billing). Uses Server Actions for form submissions.

## When to Use

Use this skill when:
- Building user settings pages
- Creating account management
- Building preferences pages
- Creating admin configuration

## Composition Diagram

```
+------------------------------------------------------------------------+
|                          SettingsPage                                   |
+------------------------------------------------------------------------+
|  [Settings]                                                             |
|  [Manage your account settings and preferences.]                        |
|                                                                         |
|  +--------------------------------------------------------------------+ |
|  |                      Tabs (m-tabs)                                 | |
|  |  [Profile] [Account] [Notifications] [Security] [Billing]          | |
|  |  ================================================================= | |
|  +--------------------------------------------------------------------+ |
|                                                                         |
|  +--------------------------------------------------------------------+ |
|  |              SettingsForm (o-settings-form)                        | |
|  |                                                                     | |
|  |  +----------------------------------------------------------------+ | |
|  |  | Card: Profile Picture                                          | | |
|  |  | [Avatar]  [Upload Image]                                       | | |
|  |  |           JPG, GIF or PNG. 1MB max.                            | | |
|  |  +----------------------------------------------------------------+ | |
|  |                                                                     | |
|  |  +----------------------------------------------------------------+ | |
|  |  | Card: Profile Information                                      | | |
|  |  | +----------------------------+ +----------------------------+  | | |
|  |  | | FormField (m-form-field)   | | FormField                   |  | | |
|  |  | | [Name ___________________] | | [Email __________________]  |  | | |
|  |  | +----------------------------+ +----------------------------+  | | |
|  |  |                                                                | | |
|  |  | [Bio _______________________________________________________]  | | |
|  |  |                                                                | | |
|  |  | [Website _______________] [Location _________________]         | | |
|  |  |                                                                | | |
|  |  |                                          [Save Changes]        | | |
|  |  +----------------------------------------------------------------+ | |
|  |                                                                     | |
|  |  +----------------------------------------------------------------+ | |
|  |  | Card: Notifications                                            | | |
|  |  | [Marketing emails]              [InputSwitch (a-input-switch)] | | |
|  |  | ---------------------------------------------------------------| | |
|  |  | [Product updates]               [    Toggle    ]               | | |
|  |  | ---------------------------------------------------------------| | |
|  |  | [Security alerts]               [    Toggle    ]               | | |
|  |  +----------------------------------------------------------------+ | |
|  +--------------------------------------------------------------------+ |
+------------------------------------------------------------------------+
```

## Organisms Used

- [settings-form](../organisms/settings-form.md) - Settings forms

## Implementation

```typescript
// app/(dashboard)/dashboard/settings/page.tsx
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getUserSettings } from "@/lib/settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { AccountSettings } from "@/components/settings/account-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { BillingSettings } from "@/components/settings/billing-settings";

export const metadata: Metadata = {
  title: "Settings",
};

interface SettingsPageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const session = await getSession();
  
  if (!session) {
    redirect("/login");
  }

  const { tab = "profile" } = await searchParams;
  const settings = await getUserSettings(session.user.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue={tab} className="space-y-6">
        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
          <TabsTrigger
            value="profile"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="account"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Account
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Security
          </TabsTrigger>
          <TabsTrigger
            value="billing"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Billing
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSettings user={session.user} settings={settings.profile} />
        </TabsContent>

        <TabsContent value="account" className="space-y-6">
          <AccountSettings user={session.user} settings={settings.account} />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationSettings settings={settings.notifications} />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings user={session.user} settings={settings.security} />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingSettings
            subscription={settings.subscription}
            paymentMethods={settings.paymentMethods}
            invoices={settings.invoices}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### Profile Settings Component

```typescript
// components/settings/profile-settings.tsx
"use client";

import { useActionState } from "react";
import { updateProfile } from "@/app/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload } from "lucide-react";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  settings: {
    bio?: string;
    website?: string;
    location?: string;
  };
}

export function ProfileSettings({ user, settings }: ProfileSettingsProps) {
  const [state, action, isPending] = useActionState(updateProfile, null);

  return (
    <>
      {/* Avatar */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
          <CardDescription>
            Click on the avatar to upload a custom one from your files.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-2xl">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <p className="text-xs text-muted-foreground">
              JPG, GIF or PNG. 1MB max.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information. This will be displayed publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name}
                  required
                />
                {state?.errors?.name && (
                  <p className="text-sm text-destructive">{state.errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                />
                {state?.errors?.email && (
                  <p className="text-sm text-destructive">{state.errors.email}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={settings.bio}
                placeholder="Tell us about yourself"
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Brief description for your profile. Max 160 characters.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={settings.website}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  defaultValue={settings.location}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            {state?.success && (
              <p className="text-sm text-green-600">Profile updated successfully!</p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
```

### Notification Settings Component

```typescript
// components/settings/notification-settings.tsx
"use client";

import { useActionState } from "react";
import { updateNotifications } from "@/app/actions/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NotificationSettingsProps {
  settings: {
    email: {
      marketing: boolean;
      updates: boolean;
      security: boolean;
    };
    push: {
      enabled: boolean;
      mentions: boolean;
      comments: boolean;
    };
  };
}

export function NotificationSettings({ settings }: NotificationSettingsProps) {
  const [state, action, isPending] = useActionState(updateNotifications, null);

  return (
    <form action={action}>
      {/* Email Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Configure which emails you'd like to receive.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about new products and features.
              </p>
            </div>
            <Switch
              id="marketing"
              name="email.marketing"
              defaultChecked={settings.email.marketing}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="updates">Product updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about product updates and changes.
              </p>
            </div>
            <Switch
              id="updates"
              name="email.updates"
              defaultChecked={settings.email.updates}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security">Security alerts</Label>
              <p className="text-sm text-muted-foreground">
                Receive emails about your account security.
              </p>
            </div>
            <Switch
              id="security"
              name="email.security"
              defaultChecked={settings.email.security}
            />
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>
            Configure push notifications for your device.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled">Enable push notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive push notifications on this device.
              </p>
            </div>
            <Switch
              id="push-enabled"
              name="push.enabled"
              defaultChecked={settings.push.enabled}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mentions">Mentions</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone mentions you.
              </p>
            </div>
            <Switch
              id="mentions"
              name="push.mentions"
              defaultChecked={settings.push.mentions}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="comments">Comments</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone comments.
              </p>
            </div>
            <Switch
              id="comments"
              name="push.comments"
              defaultChecked={settings.push.comments}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </form>
  );
}
```

## Key Implementation Notes

1. **Tab Navigation**: URL-synced tabs
2. **Server Actions**: Form submissions
3. **Progressive Enhancement**: Works without JS
4. **Validation**: Server-side validation
5. **Feedback**: Success/error messages

## Variants

### Sidebar Navigation

```tsx
<div className="grid lg:grid-cols-[200px_1fr] gap-8">
  <nav className="space-y-1">
    {tabs.map((tab) => (
      <Link
        key={tab.value}
        href={`/settings?tab=${tab.value}`}
        className={cn(
          "block px-3 py-2 rounded-md text-sm",
          currentTab === tab.value
            ? "bg-muted font-medium"
            : "hover:bg-muted"
        )}
      >
        {tab.label}
      </Link>
    ))}
  </nav>
  <main>{/* Settings content */}</main>
</div>
```

### Card-based Layout

```tsx
<div className="grid gap-6 md:grid-cols-2">
  <Card>
    <CardHeader>
      <CardTitle>Profile</CardTitle>
    </CardHeader>
    <CardContent>
      <ProfileSummary />
      <Button variant="outline" asChild>
        <Link href="/settings/profile">Edit Profile</Link>
      </Button>
    </CardContent>
  </Card>
  {/* More setting cards */}
</div>
```

## Performance

### Form Handling

- Server Actions for mutations
- Optimistic updates where possible
- Debounce auto-save features

### Data Loading

- Load settings server-side
- Cache user preferences
- Prefetch adjacent tabs

## Accessibility

### Required Features

- Form labels on all inputs
- Switch states announced
- Tab panel properly labeled
- Error messages linked

### Screen Reader

- Settings groups announced
- Toggle states communicated
- Save confirmation announced

## Error States

### Settings Error Boundary

```tsx
// app/(dashboard)/dashboard/settings/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function SettingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Settings error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold">Unable to load settings</h1>
        <p className="mt-2 text-muted-foreground">
          There was a problem loading your settings. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Form Submission Error Handling

```tsx
// components/settings/settings-form-error.tsx
'use client';

import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface FormState {
  success?: boolean;
  errors?: Record<string, string[]>;
  message?: string;
}

export function SettingsFormError({ state }: { state: FormState | null }) {
  if (!state || state.success) return null;

  return (
    <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-destructive">
            {state.message || 'Failed to save settings'}
          </p>
          {state.errors && Object.keys(state.errors).length > 0 && (
            <ul className="mt-2 text-sm text-destructive/90 space-y-1">
              {Object.entries(state.errors).map(([field, errors]) =>
                errors.map((error, i) => (
                  <li key={`${field}-${i}`}>{error}</li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// Toast notification for async operations
export function showSettingsError(error: Error) {
  if (error.message.includes('unauthorized')) {
    toast.error('Session expired', {
      description: 'Please sign in again to continue.',
      action: {
        label: 'Sign in',
        onClick: () => window.location.href = '/login',
      },
    });
  } else if (error.message.includes('validation')) {
    toast.error('Invalid input', {
      description: 'Please check your settings and try again.',
    });
  } else {
    toast.error('Save failed', {
      description: 'Could not save your settings. Please try again.',
    });
  }
}
```

### Dangerous Action Confirmation

```tsx
// components/settings/danger-zone.tsx
'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

export function DangerZone() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className="rounded-lg border border-destructive/30 p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-5 w-5 text-destructive" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-destructive">Danger Zone</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Once you delete your account, there is no going back.
          </p>

          {!showConfirm ? (
            <button
              onClick={() => setShowConfirm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg border border-destructive px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" />
              Delete account
            </button>
          ) : (
            <div className="mt-4 space-y-3">
              <p className="text-sm">
                Type <strong>delete my account</strong> to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="delete my account"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="rounded-lg border px-4 py-2 text-sm hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  disabled={confirmText !== 'delete my account'}
                  className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground disabled:opacity-50"
                >
                  Permanently delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

## Loading States

### Settings Page Loading

```tsx
// app/(dashboard)/dashboard/settings/loading.tsx
export default function SettingsLoading() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
        <div className="h-5 w-64 animate-pulse rounded bg-muted" />
      </div>

      {/* Tabs Skeleton */}
      <div className="flex gap-4 border-b pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-20 animate-pulse rounded bg-muted" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-6">
        {/* Avatar Card */}
        <div className="rounded-lg border p-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 animate-pulse rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-8 w-28 animate-pulse rounded bg-muted" />
              <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-lg border p-6 space-y-6">
          <div className="space-y-2">
            <div className="h-6 w-40 animate-pulse rounded bg-muted" />
            <div className="h-4 w-72 animate-pulse rounded bg-muted" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                <div className="h-10 w-full animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <div className="h-10 w-28 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Form Submission Loading State

```tsx
// components/settings/profile-settings-with-loading.tsx
'use client';

import { useActionState } from 'react';
import { Loader2, Save, Check } from 'lucide-react';

export function ProfileSettingsForm({ user, settings }: ProfileSettingsProps) {
  const [state, action, isPending] = useActionState(updateProfile, null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <form action={action} className="space-y-6">
      {/* Form fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={user.name}
            disabled={isPending}
          />
        </div>
        {/* ... more fields */}
      </div>

      {/* Submit button with loading state */}
      <div className="flex items-center justify-end gap-4">
        {showSuccess && (
          <span className="flex items-center gap-2 text-sm text-green-600">
            <Check className="h-4 w-4" />
            Saved successfully
          </span>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
```

### Settings Card with Loading Skeleton

```tsx
// components/settings/settings-card-skeleton.tsx
export function SettingsCardSkeleton({
  rows = 3,
}: {
  rows?: number;
}) {
  return (
    <div className="rounded-lg border">
      {/* Header */}
      <div className="border-b p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-1 h-4 w-48 animate-pulse rounded bg-muted" />
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-28 animate-pulse rounded bg-muted" />
              <div className="h-3 w-48 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-6 w-10 animate-pulse rounded-full bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Settings Layout

```tsx
// app/(dashboard)/dashboard/settings/page.tsx - responsive version
export default async function SettingsPageResponsive({ searchParams }: SettingsPageProps) {
  const { tab = 'profile' } = await searchParams;

  return (
    <div className="space-y-6">
      {/* Header - Smaller on mobile */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <Tabs defaultValue={tab} className="space-y-6">
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-max sm:w-full border-b rounded-none h-auto p-0 bg-transparent">
            <TabsTrigger value="profile" className="min-w-max px-3 sm:px-4">
              Profile
            </TabsTrigger>
            <TabsTrigger value="account" className="min-w-max px-3 sm:px-4">
              Account
            </TabsTrigger>
            <TabsTrigger value="notifications" className="min-w-max px-3 sm:px-4">
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="min-w-max px-3 sm:px-4">
              Security
            </TabsTrigger>
            <TabsTrigger value="billing" className="min-w-max px-3 sm:px-4">
              Billing
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab Content */}
        <TabsContent value="profile">
          <ProfileSettings user={session.user} settings={settings.profile} />
        </TabsContent>
        {/* ... other tabs */}
      </Tabs>
    </div>
  );
}
```

### Mobile-Friendly Settings Cards

```tsx
// components/settings/mobile-settings-card.tsx
export function MobileSettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-4 sm:p-6 border-b">
        <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}
```

### Responsive Profile Settings

```tsx
// components/settings/responsive-profile-settings.tsx
export function ResponsiveProfileSettings({ user, settings }: ProfileSettingsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Avatar Card - Stack on mobile */}
      <MobileSettingsCard title="Profile Picture" description="Click to upload a new photo.">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="text-xl sm:text-2xl">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-center sm:items-start gap-2">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </Button>
            <p className="text-xs text-muted-foreground text-center sm:text-left">
              JPG, GIF or PNG. 1MB max.
            </p>
          </div>
        </div>
      </MobileSettingsCard>

      {/* Form Card */}
      <MobileSettingsCard
        title="Profile Information"
        description="Update your public profile."
      >
        <form action={action} className="space-y-4 sm:space-y-6">
          {/* Stack form fields on mobile */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" defaultValue={user.name} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={user.email} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              defaultValue={settings.bio}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Full-width button on mobile */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
            <Button type="button" variant="outline" className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Save changes
            </Button>
          </div>
        </form>
      </MobileSettingsCard>
    </div>
  );
}
```

### Mobile Notification Settings

```tsx
// components/settings/mobile-notification-settings.tsx
export function MobileNotificationSettings({ settings }: NotificationSettingsProps) {
  return (
    <form action={action}>
      <MobileSettingsCard title="Email Notifications">
        <div className="space-y-4 sm:space-y-6">
          {/* Touch-friendly toggle rows */}
          <div className="flex items-start justify-between gap-4 py-2">
            <div className="flex-1 min-w-0">
              <Label htmlFor="marketing" className="text-sm font-medium">
                Marketing emails
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Receive emails about new products and features.
              </p>
            </div>
            <Switch
              id="marketing"
              name="email.marketing"
              defaultChecked={settings.email.marketing}
              className="shrink-0"
            />
          </div>

          <Separator />

          <div className="flex items-start justify-between gap-4 py-2">
            <div className="flex-1 min-w-0">
              <Label htmlFor="updates" className="text-sm font-medium">
                Product updates
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Receive emails about product updates.
              </p>
            </div>
            <Switch
              id="updates"
              name="email.updates"
              defaultChecked={settings.email.updates}
              className="shrink-0"
            />
          </div>

          <Separator />

          <div className="flex items-start justify-between gap-4 py-2">
            <div className="flex-1 min-w-0">
              <Label htmlFor="security" className="text-sm font-medium">
                Security alerts
              </Label>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                Receive emails about your account security.
              </p>
            </div>
            <Switch
              id="security"
              name="email.security"
              defaultChecked={settings.email.security}
              className="shrink-0"
            />
          </div>
        </div>
      </MobileSettingsCard>

      {/* Sticky save button on mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t sm:relative sm:border-0 sm:p-0 sm:mt-6">
        <Button type="submit" className="w-full sm:w-auto">
          Save Preferences
        </Button>
      </div>
    </form>
  );
}
```

### Settings Navigation for Mobile

```tsx
// components/settings/mobile-settings-nav.tsx
'use client';

import { useState } from 'react';
import { ChevronRight, User, Settings, Shield, Bell, CreditCard, Menu } from 'lucide-react';
import Link from 'next/link';

const settingsTabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'account', label: 'Account', icon: Settings },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

export function MobileSettingsNav({ activeTab }: { activeTab: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const activeItem = settingsTabs.find(t => t.id === activeTab);

  return (
    <>
      {/* Mobile dropdown trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border p-4 sm:hidden"
      >
        <div className="flex items-center gap-3">
          {activeItem && <activeItem.icon className="h-5 w-5" />}
          <span className="font-medium">{activeItem?.label || 'Settings'}</span>
        </div>
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile dropdown menu */}
      {isOpen && (
        <div className="mt-2 rounded-lg border bg-card sm:hidden">
          {settingsTabs.map((tab) => (
            <Link
              key={tab.id}
              href={`/dashboard/settings?tab=${tab.id}`}
              onClick={() => setIsOpen(false)}
              className={`flex items-center justify-between px-4 py-3 ${
                activeTab === tab.id ? 'bg-accent' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}

      {/* Desktop tabs - hidden on mobile */}
      <div className="hidden sm:block">
        {/* Regular tabs component */}
      </div>
    </>
  );
}
```

## Related Skills

### Uses Layout
- [dashboard-layout](./dashboard-layout.md)

### Related Pages
- [dashboard-home](./dashboard-home.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Tabbed settings navigation
- Profile, notifications, security settings
- Server Actions integration
