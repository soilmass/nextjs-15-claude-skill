---
id: o-user-menu
name: User Menu
version: 2.0.0
layer: L3
category: user
description: User dropdown menu with avatar, account options, and sign out
tags: [user, menu, dropdown, avatar, account, auth]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "UserMenu = DropdownMenu(m-dropdown-menu) + Avatar(m-avatar) + Badge(a-badge)"
composes:
  - ../molecules/avatar.md
dependencies:
  - react
  - "@radix-ui/react-dropdown-menu"
  - lucide-react
  - next/link
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# User Menu

## Overview

A user account dropdown menu organism displaying the user's avatar and name with quick links to profile, settings, and sign out. Supports multiple accounts, keyboard navigation, and custom menu items.

## Composition Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ UserMenu                                                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Trigger:                                                        │
│  ┌─────────────────────┐                                         │
│  │ Avatar (m-avatar)   │                                         │
│  │ ┌─────────────────┐ │                                         │
│  │ │      [JD]       │ │  (click to open dropdown)               │
│  │ └─────────────────┘ │                                         │
│  └─────────┬───────────┘                                         │
│            │                                                     │
│  ┌─────────▼────────────────────────────────────────────┐        │
│  │ DropdownMenu (m-dropdown-menu)                       │        │
│  │ ┌──────────────────────────────────────────────────┐ │        │
│  │ │ User Header                                      │ │        │
│  │ │ ┌────────┐  John Doe  Badge(a-badge) [PRO]      │ │        │
│  │ │ │ Avatar │  john@example.com                    │ │        │
│  │ │ │(m-avatar) Role                                │ │        │
│  │ │ └────────┘                                      │ │        │
│  │ └──────────────────────────────────────────────────┘ │        │
│  │ ─────────────────────────────────────────────────── │        │
│  │ ┌──────────────────────────────────────────────────┐ │        │
│  │ │ 👤 Profile                                       │ │        │
│  │ │ ⚙️ Settings                                      │ │        │
│  │ │ 💳 Billing                                       │ │        │
│  │ └──────────────────────────────────────────────────┘ │        │
│  │ ─────────────────────────────────────────────────── │        │
│  │ ┌──────────────────────────────────────────────────┐ │        │
│  │ │ 🏢 Organizations               ▶ (submenu)       │ │        │
│  │ │ ☀️ Theme                       ▶ (submenu)       │ │        │
│  │ └──────────────────────────────────────────────────┘ │        │
│  │ ─────────────────────────────────────────────────── │        │
│  │ ┌──────────────────────────────────────────────────┐ │        │
│  │ │ ❓ Help & Support                                │ │        │
│  │ └──────────────────────────────────────────────────┘ │        │
│  │ ─────────────────────────────────────────────────── │        │
│  │ ┌──────────────────────────────────────────────────┐ │        │
│  │ │ 🚪 Sign out                                      │ │        │
│  │ └──────────────────────────────────────────────────┘ │        │
│  └──────────────────────────────────────────────────────┘        │
└──────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/user-menu.tsx
'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import Link from 'next/link';
import {
  User,
  Settings,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronRight,
  Check,
  Sparkles,
  Users,
  Building2,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface UserData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  plan?: 'free' | 'pro' | 'enterprise';
}

interface Organization {
  id: string;
  name: string;
  logo?: string;
  role: string;
}

interface UserMenuProps {
  user: UserData;
  organizations?: Organization[];
  currentOrgId?: string;
  onSignOut: () => void | Promise<void>;
  onSwitchOrg?: (orgId: string) => void;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  currentTheme?: 'light' | 'dark' | 'system';
  customItems?: React.ReactNode;
  showThemeSwitcher?: boolean;
  showOrganizations?: boolean;
}

// Avatar Component
function Avatar({
  src,
  name,
  size = 'md',
  className,
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-muted font-medium',
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        <span className="text-muted-foreground">{initials}</span>
      )}
    </div>
  );
}

// Plan Badge
function PlanBadge({ plan }: { plan: UserData['plan'] }) {
  if (!plan || plan === 'free') return null;

  const colors = {
    pro: 'bg-gradient-to-r from-purple-500 to-pink-500',
    enterprise: 'bg-gradient-to-r from-amber-500 to-orange-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white',
        colors[plan]
      )}
    >
      <Sparkles className="h-3 w-3" />
      {plan.toUpperCase()}
    </span>
  );
}

// Menu Item Component
const MenuItem = React.forwardRef<
  HTMLDivElement,
  {
    icon?: React.ReactNode;
    children: React.ReactNode;
    shortcut?: string;
    destructive?: boolean;
    disabled?: boolean;
    onSelect?: () => void;
  }
>(({ icon, children, shortcut, destructive, disabled, onSelect }, ref) => (
  <DropdownMenu.Item
    ref={ref}
    disabled={disabled}
    onSelect={onSelect}
    className={cn(
      'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
      'focus:bg-accent focus:text-accent-foreground',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      destructive && 'text-destructive focus:bg-destructive focus:text-destructive-foreground'
    )}
  >
    {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
    <span className="flex-1">{children}</span>
    {shortcut && (
      <span className="ml-auto text-xs tracking-widest text-muted-foreground">
        {shortcut}
      </span>
    )}
  </DropdownMenu.Item>
));
MenuItem.displayName = 'MenuItem';

// Menu Link Item
function MenuLinkItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DropdownMenu.Item asChild>
      <Link
        href={href}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
          'focus:bg-accent focus:text-accent-foreground'
        )}
      >
        {icon && <span className="mr-2 h-4 w-4">{icon}</span>}
        {children}
      </Link>
    </DropdownMenu.Item>
  );
}

// Theme Submenu
function ThemeSubmenu({
  currentTheme,
  onThemeChange,
}: {
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
}) {
  const themes = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'System', icon: <Monitor className="h-4 w-4" /> },
  ] as const;

  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'focus:bg-accent data-[state=open]:bg-accent'
        )}
      >
        <Sun className="mr-2 h-4 w-4" />
        <span className="flex-1">Theme</span>
        <ChevronRight className="ml-auto h-4 w-4" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 shadow-lg"
          sideOffset={2}
          alignOffset={-5}
        >
          {themes.map((theme) => (
            <DropdownMenu.Item
              key={theme.value}
              onSelect={() => onThemeChange(theme.value)}
              className={cn(
                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                'focus:bg-accent focus:text-accent-foreground'
              )}
            >
              {theme.icon}
              <span className="ml-2 flex-1">{theme.label}</span>
              {currentTheme === theme.value && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
}

// Organizations Submenu
function OrganizationsSubmenu({
  organizations,
  currentOrgId,
  onSwitchOrg,
}: {
  organizations: Organization[];
  currentOrgId?: string;
  onSwitchOrg: (orgId: string) => void;
}) {
  return (
    <DropdownMenu.Sub>
      <DropdownMenu.SubTrigger
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'focus:bg-accent data-[state=open]:bg-accent'
        )}
      >
        <Building2 className="mr-2 h-4 w-4" />
        <span className="flex-1">Organizations</span>
        <ChevronRight className="ml-auto h-4 w-4" />
      </DropdownMenu.SubTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.SubContent
          className="z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 shadow-lg"
          sideOffset={2}
          alignOffset={-5}
        >
          {organizations.map((org) => (
            <DropdownMenu.Item
              key={org.id}
              onSelect={() => onSwitchOrg(org.id)}
              className={cn(
                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                'focus:bg-accent focus:text-accent-foreground'
              )}
            >
              <Avatar src={org.logo} name={org.name} size="sm" className="mr-2 h-6 w-6" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{org.name}</p>
                <p className="truncate text-xs text-muted-foreground">{org.role}</p>
              </div>
              {currentOrgId === org.id && (
                <Check className="ml-2 h-4 w-4 flex-shrink-0" />
              )}
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
          <DropdownMenu.Item
            className={cn(
              'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
              'focus:bg-accent focus:text-accent-foreground'
            )}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create organization
          </DropdownMenu.Item>
        </DropdownMenu.SubContent>
      </DropdownMenu.Portal>
    </DropdownMenu.Sub>
  );
}

// Main User Menu Component
export function UserMenu({
  user,
  organizations = [],
  currentOrgId,
  onSignOut,
  onSwitchOrg,
  onThemeChange,
  currentTheme = 'system',
  customItems,
  showThemeSwitcher = true,
  showOrganizations = false,
}: UserMenuProps) {
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-full p-1 transition-colors',
            'hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
          )}
          aria-label="User menu"
        >
          <Avatar src={user.avatar} name={user.name} />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 w-64 overflow-hidden rounded-lg border bg-popover p-1 shadow-lg"
          sideOffset={8}
          align="end"
        >
          {/* User Info Header */}
          <div className="px-2 py-3 border-b mb-1">
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size="lg" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate">{user.name}</p>
                  <PlanBadge plan={user.plan} />
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                {user.role && (
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                )}
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <DropdownMenu.Group>
            <MenuLinkItem href="/profile" icon={<User className="h-4 w-4" />}>
              Profile
            </MenuLinkItem>
            <MenuLinkItem href="/settings" icon={<Settings className="h-4 w-4" />}>
              Settings
            </MenuLinkItem>
            <MenuLinkItem href="/billing" icon={<CreditCard className="h-4 w-4" />}>
              Billing
            </MenuLinkItem>
          </DropdownMenu.Group>

          <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />

          {/* Organizations */}
          {showOrganizations && organizations.length > 0 && onSwitchOrg && (
            <>
              <OrganizationsSubmenu
                organizations={organizations}
                currentOrgId={currentOrgId}
                onSwitchOrg={onSwitchOrg}
              />
              <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
            </>
          )}

          {/* Theme */}
          {showThemeSwitcher && onThemeChange && (
            <ThemeSubmenu
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
            />
          )}

          {/* Custom Items */}
          {customItems}

          <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />

          {/* Help */}
          <MenuLinkItem href="/help" icon={<HelpCircle className="h-4 w-4" />}>
            Help & Support
          </MenuLinkItem>

          <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />

          {/* Sign Out */}
          <MenuItem
            icon={<LogOut className="h-4 w-4" />}
            onSelect={handleSignOut}
            destructive
            disabled={isSigningOut}
          >
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </MenuItem>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

## Usage

### Basic Usage

```tsx
import { UserMenu } from '@/components/organisms/user-menu';
import { signOut } from '@/lib/auth';

export function Header() {
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatars/john.jpg',
    plan: 'pro' as const,
  };

  return (
    <header className="flex items-center justify-between p-4">
      <Logo />
      <UserMenu
        user={user}
        onSignOut={() => signOut()}
        onThemeChange={(theme) => setTheme(theme)}
        currentTheme="system"
      />
    </header>
  );
}
```

### With Organizations

```tsx
<UserMenu
  user={user}
  organizations={[
    { id: '1', name: 'Acme Corp', role: 'Admin' },
    { id: '2', name: 'Startup Inc', role: 'Member' },
  ]}
  currentOrgId="1"
  onSwitchOrg={(orgId) => switchOrganization(orgId)}
  showOrganizations
  onSignOut={signOut}
/>
```

### With Custom Items

```tsx
<UserMenu
  user={user}
  onSignOut={signOut}
  customItems={
    <>
      <DropdownMenu.Separator className="-mx-1 my-1 h-px bg-border" />
      <MenuLinkItem href="/api-keys" icon={<Key className="h-4 w-4" />}>
        API Keys
      </MenuLinkItem>
      <MenuLinkItem href="/team" icon={<Users className="h-4 w-4" />}>
        Team
      </MenuLinkItem>
    </>
  }
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Menu not visible | Only avatar trigger shown |
| Open | Dropdown menu visible | Full menu items displayed |
| Hover | Hovering over menu item | Item background highlighted |
| Focus | Keyboard focus on item | Focus ring visible |
| Submenu Open | Theme/org submenu visible | Nested menu shown |
| Signing Out | Sign out in progress | Loading state on button |
| Disabled | Item cannot be selected | Muted color, no interaction |

## Anti-patterns

### 1. Not handling async sign out

```tsx
// Bad: No loading state during sign out
<MenuItem onClick={signOut}>
  Sign out
</MenuItem>

// Good: Show loading state and handle errors
const [isSigningOut, setIsSigningOut] = useState(false);

const handleSignOut = async () => {
  setIsSigningOut(true);
  try {
    await signOut();
  } catch (error) {
    toast.error('Failed to sign out');
  } finally {
    setIsSigningOut(false);
  }
};

<MenuItem
  onClick={handleSignOut}
  disabled={isSigningOut}
>
  {isSigningOut ? 'Signing out...' : 'Sign out'}
</MenuItem>
```

### 2. Avatar without fallback

```tsx
// Bad: Shows broken image if avatar fails to load
<img src={user.avatar} alt={user.name} />

// Good: Use Avatar with fallback initials
<Avatar>
  <AvatarImage src={user.avatar} alt={user.name} />
  <AvatarFallback>
    {user.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
  </AvatarFallback>
</Avatar>
```

### 3. Missing keyboard navigation hints

```tsx
// Bad: No aria labels on trigger
<button onClick={() => setOpen(true)}>
  <Avatar src={user.avatar} />
</button>

// Good: Proper aria labels for accessibility
<DropdownMenu.Trigger asChild>
  <button
    aria-label={`User menu for ${user.name}`}
    aria-haspopup="menu"
    aria-expanded={open}
  >
    <Avatar src={user.avatar} name={user.name} />
  </button>
</DropdownMenu.Trigger>
```

### 4. Not truncating long names/emails

```tsx
// Bad: Long text breaks layout
<p>{user.name}</p>
<p>{user.email}</p>

// Good: Truncate with proper overflow handling
<div className="flex-1 min-w-0">
  <p className="font-semibold truncate">{user.name}</p>
  <p className="text-sm text-muted-foreground truncate">
    {user.email}
  </p>
</div>
```

## Related Skills

- `molecules/action-menu` - Base dropdown menu
- `atoms/avatar` - Avatar component
- `organisms/header` - Site header

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Avatar with fallback initials
- Plan badge display
- Theme switcher submenu
- Organizations submenu
- Full keyboard navigation
