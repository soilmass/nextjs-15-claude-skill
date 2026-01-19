---
id: t-profile-page
name: Profile Page
version: 2.0.0
layer: L4
category: pages
description: User profile page with avatar, bio, activity, and settings sections
tags: [profile, user, account, settings, avatar]
performance:
  impact: medium
  lcp: medium
  cls: low
formula: "ProfilePage = ActivityFeed(o-activity-feed) + AvatarGroup(m-avatar-group) + Tabs(m-tabs) + FormField(m-form-field)"
composes:
  - ../molecules/avatar-group.md
  - ../organisms/activity-feed.md
  - ../molecules/tabs.md
  - ../molecules/form-field.md
dependencies:
  - react
  - react-hook-form
  - zod
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Profile Page

## Overview

A user profile page template with editable profile information, avatar upload, activity feed, and account settings. Supports both viewing and editing modes.

## Composition Diagram

```
+------------------------------------------------------------------------+
|                           ProfilePage                                   |
+------------------------------------------------------------------------+
|  +--------------------------------------------------------------------+ |
|  |                         Profile Header                              | |
|  |  +----------------+  +------------------------------------------+   | |
|  |  | AvatarUpload   |  |  ProfileInfo / ProfileEditForm           |   | |
|  |  | (m-avatar-     |  |  [Name]                    [Edit Profile]|   | |
|  |  |  group)        |  |  [@username]                             |   | |
|  |  |                |  |                                          |   | |
|  |  |    [Avatar]    |  |  [Bio description...]                    |   | |
|  |  |      [Cam]     |  |                                          |   | |
|  |  |                |  |  [Company] [Location] [Website] [Joined] |   | |
|  |  +----------------+  |                                          |   | |
|  |                      |  [Twitter] [GitHub] [LinkedIn]           |   | |
|  |                      |                                          |   | |
|  |                      |  ProfileStats                            |   | |
|  |                      |  [Posts: 42] [Followers: 1.2k] [Following]|   | |
|  |                      +------------------------------------------+   | |
|  +--------------------------------------------------------------------+ |
|                                                                         |
|  +--------------------------------------------------------------------+ |
|  |                      Content Tabs (m-tabs)                         | |
|  |  [Activity]  [Posts]  [Likes]                                      | |
|  |  ------------------------------------------------------------------| |
|  |  +----------------------------------------------------------------+| |
|  |  |              ActivityFeed (o-activity-feed)                    || |
|  |  |                                                                || |
|  |  |    [Activity Icon] No activity yet                             || |
|  |  |                                                                || |
|  |  +----------------------------------------------------------------+| |
|  +--------------------------------------------------------------------+ |
+------------------------------------------------------------------------+
```

## Implementation

```tsx
// app/profile/page.tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  MapPin,
  Link as LinkIcon,
  Calendar,
  Edit,
  Camera,
  Save,
  X,
  Loader2,
  Github,
  Twitter,
  Linkedin,
  Globe,
  Activity,
  Settings,
  Shield,
  Bell,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  company?: string;
  joinedAt: Date;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface ProfilePageProps {
  user: UserProfile;
  isOwnProfile?: boolean;
  onUpdate?: (data: Partial<UserProfile>) => Promise<void>;
  onAvatarChange?: (file: File) => Promise<string>;
}

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(160, 'Bio must be 160 characters or less').optional(),
  location: z.string().max(100).optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  company: z.string().max(100).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// Avatar Upload Component
function AvatarUpload({
  currentAvatar,
  name,
  onUpload,
  disabled,
}: {
  currentAvatar?: string;
  name: string;
  onUpload: (file: File) => void;
  disabled?: boolean;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="relative">
      <div className="h-32 w-32 rounded-full bg-muted overflow-hidden">
        {currentAvatar ? (
          <img
            src={currentAvatar}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-3xl font-bold text-muted-foreground">
            {initials}
          </div>
        )}
      </div>
      {!disabled && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          aria-label="Change avatar"
        >
          <Camera className="h-5 w-5" />
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

// Stats Display
function ProfileStats({ stats }: { stats: UserProfile['stats'] }) {
  if (!stats) return null;

  const items = [
    { label: 'Posts', value: stats.posts },
    { label: 'Followers', value: stats.followers },
    { label: 'Following', value: stats.following },
  ];

  return (
    <div className="flex gap-6">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

// Profile Info Display
function ProfileInfo({ user }: { user: UserProfile }) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-muted-foreground">@{user.username}</p>
      </div>

      {user.bio && <p className="text-sm">{user.bio}</p>}

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {user.company && (
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {user.company}
          </div>
        )}
        {user.location && (
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {user.location}
          </div>
        )}
        {user.website && (
          <a
            href={user.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-primary hover:underline"
          >
            <LinkIcon className="h-4 w-4" />
            {new URL(user.website).hostname}
          </a>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Social Links */}
      {user.social && (
        <div className="flex gap-3">
          {user.social.twitter && (
            <a
              href={`https://twitter.com/${user.social.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
              aria-label="Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {user.social.github && (
            <a
              href={`https://github.com/${user.social.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {user.social.linkedin && (
            <a
              href={`https://linkedin.com/in/${user.social.linkedin}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Profile Edit Form
function ProfileEditForm({
  user,
  onSubmit,
  onCancel,
  isLoading,
}: {
  user: UserProfile;
  onSubmit: (data: ProfileFormData) => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      username: user.username,
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      company: user.company || '',
    },
  });

  const bio = watch('bio');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <input
          {...register('name')}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            errors.name && 'border-destructive'
          )}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Username</label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            @
          </span>
          <input
            {...register('username')}
            className={cn(
              'w-full rounded-lg border bg-background pl-8 pr-3 py-2 text-sm',
              'focus:outline-none focus:ring-2 focus:ring-ring',
              errors.username && 'border-destructive'
            )}
          />
        </div>
        {errors.username && (
          <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea
          {...register('bio')}
          rows={3}
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm resize-none',
            'focus:outline-none focus:ring-2 focus:ring-ring'
          )}
        />
        <p className="mt-1 text-xs text-muted-foreground text-right">
          {bio?.length || 0}/160
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            {...register('location')}
            placeholder="City, Country"
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Company</label>
          <input
            {...register('company')}
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Website</label>
        <input
          {...register('website')}
          type="url"
          placeholder="https://"
          className={cn(
            'w-full rounded-lg border bg-background px-3 py-2 text-sm',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            errors.website && 'border-destructive'
          )}
        />
        {errors.website && (
          <p className="mt-1 text-xs text-destructive">{errors.website.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm rounded-lg hover:bg-accent"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg',
            'bg-primary text-primary-foreground hover:bg-primary/90',
            'disabled:opacity-50'
          )}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save changes
        </button>
      </div>
    </form>
  );
}

// Settings Navigation
function SettingsNav({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'account', label: 'Account', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <nav className="flex gap-1 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm rounded-lg whitespace-nowrap transition-colors',
            activeTab === tab.id
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-accent'
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
        </button>
      ))}
    </nav>
  );
}

// Main Profile Page
export default function ProfilePage({
  user,
  isOwnProfile = false,
  onUpdate,
  onAvatarChange,
}: ProfilePageProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [avatar, setAvatar] = React.useState(user.avatar);

  const handleAvatarUpload = async (file: File) => {
    if (onAvatarChange) {
      try {
        const newAvatarUrl = await onAvatarChange(file);
        setAvatar(newAvatarUrl);
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
    }
  };

  const handleProfileUpdate = async (data: ProfileFormData) => {
    if (onUpdate) {
      setIsLoading(true);
      try {
        await onUpdate(data);
        setIsEditing(false);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b">
        <AvatarUpload
          currentAvatar={avatar}
          name={user.name}
          onUpload={handleAvatarUpload}
          disabled={!isOwnProfile}
        />

        <div className="flex-1">
          {isEditing ? (
            <ProfileEditForm
              user={user}
              onSubmit={handleProfileUpdate}
              onCancel={() => setIsEditing(false)}
              isLoading={isLoading}
            />
          ) : (
            <>
              <div className="flex items-start justify-between">
                <ProfileInfo user={user} />
                {isOwnProfile && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border hover:bg-accent"
                  >
                    <Edit className="h-4 w-4" />
                    Edit profile
                  </button>
                )}
              </div>
              <div className="mt-6">
                <ProfileStats stats={user.stats} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="mt-8">
        <div className="flex gap-4 border-b">
          <button className="px-4 py-2 text-sm font-medium border-b-2 border-primary">
            Activity
          </button>
          <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Posts
          </button>
          <button className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
            Likes
          </button>
        </div>

        {/* Activity Feed Placeholder */}
        <div className="py-8 text-center text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No activity yet</p>
        </div>
      </div>
    </div>
  );
}
```

## Usage

### Basic Usage

```tsx
// app/profile/[username]/page.tsx
import ProfilePage from '@/components/templates/profile-page';
import { getCurrentUser, getUserByUsername } from '@/lib/auth';

export default async function Page({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const [currentUser, profileUser] = await Promise.all([
    getCurrentUser(),
    getUserByUsername(username),
  ]);

  const isOwnProfile = currentUser?.id === profileUser.id;

  return (
    <ProfilePage
      user={profileUser}
      isOwnProfile={isOwnProfile}
      onUpdate={async (data) => {
        'use server';
        await updateProfile(profileUser.id, data);
      }}
    />
  );
}
```

### With Avatar Upload

```tsx
<ProfilePage
  user={user}
  isOwnProfile
  onAvatarChange={async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch('/api/avatar', { method: 'POST', body: formData });
    const { url } = await res.json();
    return url;
  }}
/>
```

## Error States

### Profile Error Boundary

```tsx
// app/profile/[username]/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Profile page error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Unable to load profile
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          We couldn't load this profile. Please try again.
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
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### User Not Found

```tsx
// app/profile/[username]/not-found.tsx
import Link from 'next/link';
import { User, Search, Home } from 'lucide-react';

export default function ProfileNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <User className="h-10 w-10 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          User not found
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          This profile doesn't exist or has been removed.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
            Search users
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-accent"
          >
            <Home className="h-4 w-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### Profile Update Error Toast

```tsx
// components/profile/profile-update-error.tsx
'use client';

import { toast } from 'sonner';

export function handleProfileUpdateError(error: Error) {
  if (error.message.includes('username')) {
    toast.error('Username already taken', {
      description: 'Please choose a different username.',
    });
  } else if (error.message.includes('email')) {
    toast.error('Email already in use', {
      description: 'This email is associated with another account.',
    });
  } else {
    toast.error('Update failed', {
      description: 'Could not save your changes. Please try again.',
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    });
  }
}
```

## Loading States

### Profile Page Loading

```tsx
// app/profile/[username]/loading.tsx
export default function ProfileLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row items-start gap-6 pb-6 border-b">
        {/* Avatar Skeleton */}
        <div className="h-32 w-32 rounded-full bg-muted animate-pulse" />

        <div className="flex-1 space-y-4">
          {/* Name and Username */}
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
          </div>

          {/* Bio */}
          <div className="h-4 w-full max-w-md bg-muted animate-pulse rounded" />

          {/* Meta Info */}
          <div className="flex flex-wrap gap-4">
            <div className="h-4 w-24 bg-muted animate-pulse rounded" />
            <div className="h-4 w-28 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>

          {/* Social Links */}
          <div className="flex gap-3">
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
            <div className="h-5 w-5 bg-muted animate-pulse rounded" />
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center space-y-1">
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mt-8">
        <div className="flex gap-4 border-b">
          <div className="h-10 w-20 bg-muted animate-pulse rounded" />
          <div className="h-10 w-16 bg-muted animate-pulse rounded" />
          <div className="h-10 w-16 bg-muted animate-pulse rounded" />
        </div>

        {/* Activity Feed Skeleton */}
        <div className="py-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
                <div className="h-4 w-1/2 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

### Avatar Upload Loading State

```tsx
// components/profile/avatar-upload-loading.tsx
function AvatarUploadWithLoading({
  currentAvatar,
  name,
  onUpload,
  disabled,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        await onUpload(file);
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="relative">
      <div className={cn(
        "h-32 w-32 rounded-full bg-muted overflow-hidden",
        isUploading && "opacity-50"
      )}>
        {/* Avatar content */}
      </div>

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-32 w-32 rounded-full border-4 border-primary border-t-transparent animate-spin" />
        </div>
      )}

      {!disabled && !isUploading && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90"
          aria-label="Change avatar"
        >
          <Camera className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
```

### Activity Feed with Suspense

```tsx
// app/profile/[username]/page.tsx with Suspense
import { Suspense } from 'react';

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const user = await getUser(username);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header - rendered immediately */}
      <ProfileHeader user={user} />

      {/* Activity Feed - with Suspense boundary */}
      <div className="mt-8">
        <Suspense fallback={<ActivityFeedSkeleton />}>
          <ActivityFeed userId={user.id} />
        </Suspense>
      </div>
    </div>
  );
}

function ActivityFeedSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4 p-4 border rounded-lg">
          <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            <div className="h-3 w-1/4 bg-muted animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Profile Layout

```tsx
// components/profile/profile-page-responsive.tsx
export default function ProfilePageResponsive({ user, isOwnProfile }: ProfilePageProps) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Header - Stack on mobile, side-by-side on desktop */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4 sm:gap-6 pb-6 border-b">
        {/* Avatar - Centered on mobile */}
        <div className="relative">
          <AvatarUpload
            currentAvatar={user.avatar}
            name={user.name}
            disabled={!isOwnProfile}
            className="h-24 w-24 sm:h-32 sm:w-32"
          />
        </div>

        {/* Profile Info - Centered text on mobile */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            {/* Edit button - Full width on mobile */}
            {isOwnProfile && (
              <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-lg border hover:bg-accent">
                <Edit className="h-4 w-4" />
                Edit profile
              </button>
            )}
          </div>

          {/* Bio */}
          {user.bio && (
            <p className="mt-3 text-sm">{user.bio}</p>
          )}

          {/* Meta info - Wrap on small screens */}
          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {user.company && (
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {user.company}
              </span>
            )}
            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {user.location}
              </span>
            )}
          </div>

          {/* Stats - Horizontal scroll on very small screens */}
          <div className="mt-4 flex justify-center sm:justify-start gap-4 sm:gap-6 overflow-x-auto">
            <StatItem value={user.stats.posts} label="Posts" />
            <StatItem value={user.stats.followers} label="Followers" />
            <StatItem value={user.stats.following} label="Following" />
          </div>
        </div>
      </div>

      {/* Tabs - Scrollable on mobile */}
      <div className="mt-6 sm:mt-8">
        <div className="flex gap-2 sm:gap-4 border-b overflow-x-auto scrollbar-hide">
          <TabButton active>Activity</TabButton>
          <TabButton>Posts</TabButton>
          <TabButton>Likes</TabButton>
          <TabButton>Media</TabButton>
        </div>
      </div>
    </div>
  );
}
```

### Mobile Profile Edit Form

```tsx
// components/profile/mobile-profile-edit.tsx
'use client';

import * as React from 'react';
import { X, Save, Loader2 } from 'lucide-react';

export function MobileProfileEditForm({
  user,
  onSubmit,
  onCancel,
  isLoading,
}: ProfileEditFormProps) {
  return (
    <>
      {/* Full-screen modal on mobile */}
      <div className="fixed inset-0 z-50 bg-background sm:hidden">
        {/* Mobile Header */}
        <header className="sticky top-0 flex items-center justify-between border-b bg-background px-4 py-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <X className="h-5 w-5" />
            Cancel
          </button>
          <h1 className="font-semibold">Edit Profile</h1>
          <button
            type="submit"
            form="profile-form"
            disabled={isLoading}
            className="flex items-center gap-1 font-medium text-primary"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </button>
        </header>

        {/* Scrollable Form Content */}
        <div className="overflow-y-auto p-4 pb-safe">
          <form id="profile-form" onSubmit={onSubmit} className="space-y-4">
            {/* Avatar - Centered */}
            <div className="flex justify-center py-4">
              <AvatarUpload currentAvatar={user.avatar} name={user.name} />
            </div>

            {/* Form Fields - Full width inputs */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  name="name"
                  defaultValue={user.name}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-base"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Username</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    @
                  </span>
                  <input
                    name="username"
                    defaultValue={user.username}
                    className="w-full rounded-lg border bg-background pl-8 pr-4 py-3 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  name="bio"
                  defaultValue={user.bio}
                  rows={4}
                  className="w-full rounded-lg border bg-background px-4 py-3 text-base resize-none"
                />
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Regular modal on desktop (hidden on mobile) */}
      <div className="hidden sm:block">
        {/* Desktop edit form */}
      </div>
    </>
  );
}
```

### Profile Stats Mobile Layout

```tsx
// components/profile/profile-stats-mobile.tsx
function ProfileStatsMobile({ stats }: { stats: UserProfile['stats'] }) {
  if (!stats) return null;

  return (
    <>
      {/* Compact horizontal stats on mobile */}
      <div className="flex sm:hidden justify-around py-4 border-y">
        <button className="flex flex-col items-center min-w-0 px-2">
          <span className="text-lg font-bold tabular-nums">
            {formatNumber(stats.posts)}
          </span>
          <span className="text-xs text-muted-foreground">Posts</span>
        </button>
        <div className="w-px bg-border" />
        <button className="flex flex-col items-center min-w-0 px-2">
          <span className="text-lg font-bold tabular-nums">
            {formatNumber(stats.followers)}
          </span>
          <span className="text-xs text-muted-foreground">Followers</span>
        </button>
        <div className="w-px bg-border" />
        <button className="flex flex-col items-center min-w-0 px-2">
          <span className="text-lg font-bold tabular-nums">
            {formatNumber(stats.following)}
          </span>
          <span className="text-xs text-muted-foreground">Following</span>
        </button>
      </div>

      {/* Larger stats on desktop */}
      <div className="hidden sm:flex gap-6">
        {[
          { label: 'Posts', value: stats.posts },
          { label: 'Followers', value: stats.followers },
          { label: 'Following', value: stats.following },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-2xl font-bold">{item.value.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}
```

## Related Skills

- `organisms/user-menu` - User dropdown menu
- `patterns/image-upload` - Image upload patterns
- `templates/settings-page` - Settings page

## Changelog

### 1.0.0 (2025-01-17)

- Initial implementation
- Avatar upload with preview
- Inline edit mode
- Profile stats display
- Social links
- Activity tabs
