---
id: o-theme-switcher
name: Theme Switcher
version: 2.0.0
layer: L3
category: utility
composes: []
description: Light/dark/system theme toggle with smooth transitions and persistence
tags: [theme, dark-mode, light-mode, toggle, accessibility]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "ThemeSwitcher = DropdownMenu(m-dropdown-menu) + Button(a-button) + Icon(a-icon)"
dependencies:
  - react
  - next-themes
  - lucide-react
  - framer-motion
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Theme Switcher

## Overview

A theme switcher organism with support for light, dark, and system modes. Includes smooth icon transitions, dropdown variant for multiple themes, and seamless integration with next-themes.

## Composition Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│ ThemeSwitcher                                                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TOGGLE VARIANT:                                                 │
│  ┌─────────────────────┐                                         │
│  │ Button (a-button)   │                                         │
│  │ ┌─────────────────┐ │                                         │
│  │ │ Icon (a-icon)   │ │  (cycles: Sun → Moon → Monitor)         │
│  │ │ [☀️/🌙/🖥️]       │ │                                         │
│  │ └─────────────────┘ │                                         │
│  └─────────────────────┘                                         │
│                                                                  │
│  DROPDOWN VARIANT:                                               │
│  ┌─────────────────────┐                                         │
│  │ Button (a-button)   │                                         │
│  │ ┌───────────────┐   │                                         │
│  │ │ Icon (a-icon) │   │                                         │
│  │ └───────────────┘   │                                         │
│  └─────────┬───────────┘                                         │
│            │                                                     │
│  ┌─────────▼───────────────────────┐                             │
│  │ DropdownMenu (m-dropdown-menu)  │                             │
│  │ ┌─────────────────────────────┐ │                             │
│  │ │ ☀️ Light              [✓]   │ │                             │
│  │ │ 🌙 Dark                     │ │                             │
│  │ │ 🖥️ System                   │ │                             │
│  │ └─────────────────────────────┘ │                             │
│  └─────────────────────────────────┘                             │
│                                                                  │
│  SEGMENTED VARIANT:                                              │
│  ┌─────────────────────────────────────────┐                     │
│  │ [☀️ Light] [🌙 Dark] [🖥️ System]         │                     │
│  │  Button    Button    Button (a-button)  │                     │
│  └─────────────────────────────────────────┘                     │
└──────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/theme-switcher.tsx
'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Monitor, Check, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
type Theme = 'light' | 'dark' | 'system';

interface ThemeSwitcherProps {
  variant?: 'toggle' | 'dropdown' | 'segmented';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ElementType;
}

// Theme options
const themeOptions: ThemeOption[] = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

// Size configurations
const sizeConfig = {
  sm: {
    button: 'h-8 w-8',
    icon: 'h-4 w-4',
    text: 'text-xs',
  },
  md: {
    button: 'h-9 w-9',
    icon: 'h-5 w-5',
    text: 'text-sm',
  },
  lg: {
    button: 'h-10 w-10',
    icon: 'h-5 w-5',
    text: 'text-base',
  },
};

// Animated Icon Component
function AnimatedThemeIcon({
  theme,
  size = 'md',
}: {
  theme: string | undefined;
  size?: 'sm' | 'md' | 'lg';
}) {
  const iconClass = sizeConfig[size].icon;

  return (
    <div className="relative">
      <AnimatePresence mode="wait">
        {theme === 'light' && (
          <motion.div
            key="light"
            initial={{ rotate: -90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Sun className={iconClass} />
          </motion.div>
        )}
        {theme === 'dark' && (
          <motion.div
            key="dark"
            initial={{ rotate: 90, opacity: 0, scale: 0 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -90, opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Moon className={iconClass} />
          </motion.div>
        )}
        {(theme === 'system' || !theme) && (
          <motion.div
            key="system"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Monitor className={iconClass} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Toggle Variant (cycles through themes)
function ThemeToggle({
  size = 'md',
  showLabel = false,
  className,
}: Omit<ThemeSwitcherProps, 'variant'>) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const cycleTheme = () => {
    const themes: Theme[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme as Theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const config = sizeConfig[size];

  if (!mounted) {
    return (
      <button
        className={cn(
          'rounded-lg border bg-background transition-colors',
          'hover:bg-accent',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
          showLabel ? 'px-3 py-2' : config.button,
          className
        )}
        aria-label="Toggle theme"
      >
        <div className={cn(config.icon, 'animate-pulse bg-muted rounded')} />
      </button>
    );
  }

  return (
    <button
      onClick={cycleTheme}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border bg-background transition-colors',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        showLabel ? 'px-3 py-2' : config.button,
        className
      )}
      aria-label={`Current theme: ${theme}. Click to change.`}
    >
      <AnimatedThemeIcon theme={theme} size={size} />
      {showLabel && (
        <span className={cn(config.text, 'capitalize')}>{theme}</span>
      )}
    </button>
  );
}

// Dropdown Variant
function ThemeDropdown({
  size = 'md',
  showLabel = false,
  className,
}: Omit<ThemeSwitcherProps, 'variant'>) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const config = sizeConfig[size];

  if (!mounted) {
    return (
      <button
        className={cn(
          'rounded-lg border bg-background',
          showLabel ? 'px-3 py-2' : config.button,
          className
        )}
      >
        <div className={cn(config.icon, 'animate-pulse bg-muted rounded')} />
      </button>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-lg border bg-background transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            showLabel ? 'px-3 py-2' : config.button,
            className
          )}
          aria-label="Select theme"
        >
          <AnimatedThemeIcon theme={theme} size={size} />
          {showLabel && (
            <span className={cn(config.text, 'capitalize')}>{theme}</span>
          )}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[8rem] overflow-hidden rounded-lg border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
          align="end"
          sideOffset={4}
        >
          {themeOptions.map((option) => (
            <DropdownMenu.Item
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                'relative flex cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors',
                'focus:bg-accent focus:text-accent-foreground',
                theme === option.value && 'bg-accent/50'
              )}
            >
              <option.icon className="mr-2 h-4 w-4" />
              <span className="flex-1">{option.label}</span>
              {theme === option.value && (
                <Check className="ml-2 h-4 w-4 text-primary" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// Segmented Control Variant
function ThemeSegmented({
  size = 'md',
  className,
}: Omit<ThemeSwitcherProps, 'variant' | 'showLabel'>) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const config = sizeConfig[size];

  if (!mounted) {
    return (
      <div
        className={cn(
          'inline-flex rounded-lg border bg-muted p-1',
          className
        )}
      >
        {themeOptions.map((option) => (
          <div
            key={option.value}
            className={cn(
              'flex items-center justify-center rounded-md px-3 py-1.5',
              config.icon
            )}
          >
            <div className="h-4 w-4 animate-pulse bg-muted-foreground/20 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex rounded-lg border bg-muted p-1',
        className
      )}
      role="radiogroup"
      aria-label="Theme selection"
    >
      {themeOptions.map((option) => {
        const isSelected = theme === option.value;
        const Icon = option.icon;

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            role="radio"
            aria-checked={isSelected}
            className={cn(
              'relative flex items-center justify-center gap-2 rounded-md px-3 py-1.5 transition-all',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              isSelected
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className={config.icon} />
            <span className={cn(config.text, 'hidden sm:inline')}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Main Theme Switcher Component
export function ThemeSwitcher({
  variant = 'toggle',
  ...props
}: ThemeSwitcherProps) {
  switch (variant) {
    case 'dropdown':
      return <ThemeDropdown {...props} />;
    case 'segmented':
      return <ThemeSegmented {...props} />;
    default:
      return <ThemeToggle {...props} />;
  }
}

// Theme Provider Setup Component (for reference)
export function ThemeProviderSetup() {
  return (
    <code className="text-sm">
      {`// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}`}
    </code>
  );
}

// Custom Theme Colors Example
export function CustomThemeExample() {
  const { theme, setTheme } = useTheme();
  
  const colorThemes = [
    { name: 'Default', value: 'default', color: 'bg-primary' },
    { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
    { name: 'Green', value: 'green', color: 'bg-green-500' },
    { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
  ];

  return (
    <div className="flex items-center gap-2">
      <Palette className="h-4 w-4 text-muted-foreground" />
      {colorThemes.map((colorTheme) => (
        <button
          key={colorTheme.value}
          onClick={() => {
            document.documentElement.setAttribute(
              'data-theme',
              colorTheme.value
            );
          }}
          className={cn(
            'h-6 w-6 rounded-full transition-transform hover:scale-110',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            colorTheme.color
          )}
          aria-label={`${colorTheme.name} theme`}
        />
      ))}
    </div>
  );
}
```

## Usage

### Basic Toggle

```tsx
import { ThemeSwitcher } from '@/components/organisms/theme-switcher';

export function Header() {
  return (
    <header className="flex items-center justify-between p-4">
      <Logo />
      <ThemeSwitcher />
    </header>
  );
}
```

### Dropdown Variant

```tsx
<ThemeSwitcher variant="dropdown" showLabel />
```

### Segmented Control

```tsx
<ThemeSwitcher variant="segmented" size="sm" />
```

### In Settings Page

```tsx
export function AppearanceSettings() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Select your preferred theme
        </p>
      </div>
      <ThemeSwitcher variant="segmented" />
    </div>
  );
}
```

### Provider Setup

```tsx
// app/layout.tsx
import { ThemeProvider } from 'next-themes';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Light | Light theme active | Sun icon visible |
| Dark | Dark theme active | Moon icon visible |
| System | Following system preference | Monitor icon visible |
| Loading | Hydration in progress | Skeleton placeholder |
| Hover | Button being hovered | Background highlight |
| Focus | Keyboard focus on trigger | Focus ring visible |
| Open | Dropdown menu open | Menu items visible |

## Anti-patterns

### 1. Not handling hydration mismatch

```tsx
// Bad: Causes hydration error
function ThemeSwitch() {
  const { theme } = useTheme();
  return <span>{theme}</span>; // Server renders undefined
}

// Good: Wait for client mount
function ThemeSwitch() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-9 animate-pulse bg-muted rounded-lg" />;
  }

  return <span>{theme}</span>;
}
```

### 2. Missing suppressHydrationWarning on html tag

```tsx
// Bad: Hydration warning in console
<html lang="en">
  <body>
    <ThemeProvider attribute="class">
      {children}
    </ThemeProvider>
  </body>
</html>

// Good: Suppress hydration warning
<html lang="en" suppressHydrationWarning>
  <body>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      {children}
    </ThemeProvider>
  </body>
</html>
```

### 3. Not respecting system preference initially

```tsx
// Bad: Forces a default theme
<ThemeProvider
  defaultTheme="light" // Ignores user's system preference
>

// Good: Default to system preference
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
```

### 4. Abrupt theme transition causing flash

```tsx
// Bad: No transition control causes jarring change
<ThemeProvider attribute="class">

// Good: Disable transition during change to prevent flash
<ThemeProvider
  attribute="class"
  enableSystem
  disableTransitionOnChange // Prevents transition during theme change
>

// Or add CSS to control specific transitions
// globals.css
html.transitioning * {
  transition: none !important;
}
```

## Related Skills

- `patterns/theming` - Theme CSS variables
- `primitives/color-tokens` - Color system
- `organisms/user-menu` - User menu with theme

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation with next-themes
- Toggle, dropdown, and segmented variants
- Animated icon transitions with Framer Motion
- SSR-safe with hydration handling
