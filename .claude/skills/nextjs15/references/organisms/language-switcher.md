---
id: o-language-switcher
name: Language Switcher
version: 2.0.0
layer: L3
category: utility
composes: []
description: Locale selector dropdown with flag icons and language names
tags: [i18n, language, locale, internationalization, dropdown]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "LanguageSwitcher = DropdownMenu(m-dropdown-menu) + Button(a-button) + Icon(a-icon)"
dependencies:
  - react
  - "@radix-ui/react-dropdown-menu"
  - next/navigation
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Language Switcher

## Overview

A language/locale switcher organism with dropdown selection, flag icons, native language names, and seamless integration with Next.js internationalization routing.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ LanguageSwitcher                                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Dropdown Variant:                                              │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Trigger Button (a-button)                                 │  │
│  │  ┌───────────────────────────────────────────────────┐    │  │
│  │  │ 🇺🇸  English                              ▼       │    │  │
│  │  │     Icon(a-icon)                                  │    │  │
│  │  └───────────────────────────────────────────────────┘    │  │
│  │                        ↓                                  │  │
│  │  ┌───────────────────────────────────────────────────┐    │  │
│  │  │ DropdownMenu (m-dropdown-menu)                    │    │  │
│  │  │  Select Language                                  │    │  │
│  │  │  ─────────────────────────────────                │    │  │
│  │  │  🇺🇸  English (English)               ✓           │    │  │
│  │  │  🇪🇸  Español (Spanish)                           │    │  │
│  │  │  🇫🇷  Français (French)                           │    │  │
│  │  │  🇩🇪  Deutsch (German)                            │    │  │
│  │  │  🇯🇵  日本語 (Japanese)                            │    │  │
│  │  └───────────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Inline Variant:                                                │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  [EN] | [ES] | [FR] | [DE]                                │  │
│  │   ↑ Button (a-button) for each locale                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Compact Variant:                                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  ┌─────┐                                                  │  │
│  │  │ 🇺🇸  │  ← Icon-only Button (a-button)                  │  │
│  │  └─────┘                                                  │  │
│  │      ↓                                                    │  │
│  │  ┌───────────────────┐                                    │  │
│  │  │ Dropdown Menu     │                                    │  │
│  │  │  🇺🇸 English  ✓   │                                    │  │
│  │  │  🇪🇸 Español      │                                    │  │
│  │  │  🇫🇷 Français     │                                    │  │
│  │  └───────────────────┘                                    │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/language-switcher.tsx
'use client';

import * as React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { usePathname, useRouter } from 'next/navigation';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface Locale {
  code: string;
  name: string;
  nativeName: string;
  flag?: string;
  dir?: 'ltr' | 'rtl';
}

interface LanguageSwitcherProps {
  locales: Locale[];
  currentLocale: string;
  variant?: 'dropdown' | 'inline' | 'compact';
  showFlag?: boolean;
  showNativeName?: boolean;
  onChange?: (locale: string) => void;
  className?: string;
}

// Common locales with flags (emoji)
export const commonLocales: Locale[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', dir: 'rtl' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
];

// Locale Item Component
function LocaleItem({
  locale,
  isSelected,
  showFlag,
  showNativeName,
  onClick,
}: {
  locale: Locale;
  isSelected: boolean;
  showFlag: boolean;
  showNativeName: boolean;
  onClick: () => void;
}) {
  return (
    <DropdownMenu.Item
      onClick={onClick}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'focus:bg-accent focus:text-accent-foreground',
        isSelected && 'bg-accent/50'
      )}
    >
      {showFlag && locale.flag && (
        <span className="mr-2 text-base">{locale.flag}</span>
      )}
      <div className="flex-1">
        <span>{showNativeName ? locale.nativeName : locale.name}</span>
        {showNativeName && locale.name !== locale.nativeName && (
          <span className="ml-2 text-xs text-muted-foreground">
            ({locale.name})
          </span>
        )}
      </div>
      {isSelected && <Check className="ml-2 h-4 w-4" />}
    </DropdownMenu.Item>
  );
}

// Dropdown Variant
function DropdownLanguageSwitcher({
  locales,
  currentLocale,
  showFlag,
  showNativeName,
  onChange,
  className,
}: Omit<LanguageSwitcherProps, 'variant'>) {
  const router = useRouter();
  const pathname = usePathname();

  const currentLocaleData = locales.find((l) => l.code === currentLocale);

  const handleLocaleChange = (locale: string) => {
    if (onChange) {
      onChange(locale);
    } else {
      // Default behavior: update URL path
      const segments = pathname.split('/');
      if (locales.some((l) => l.code === segments[1])) {
        segments[1] = locale;
      } else {
        segments.splice(1, 0, locale);
      }
      router.push(segments.join('/'));
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm',
            'hover:bg-accent transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            className
          )}
          aria-label="Select language"
        >
          {showFlag && currentLocaleData?.flag && (
            <span className="text-base">{currentLocaleData.flag}</span>
          )}
          {!showFlag && <Globe className="h-4 w-4" />}
          <span className="hidden sm:inline">
            {showNativeName
              ? currentLocaleData?.nativeName
              : currentLocaleData?.name}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[12rem] overflow-hidden rounded-lg border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95"
          align="end"
          sideOffset={4}
        >
          <DropdownMenu.Label className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Select Language
          </DropdownMenu.Label>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          {locales.map((locale) => (
            <LocaleItem
              key={locale.code}
              locale={locale}
              isSelected={currentLocale === locale.code}
              showFlag={showFlag ?? true}
              showNativeName={showNativeName ?? true}
              onClick={() => handleLocaleChange(locale.code)}
            />
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// Inline Variant (horizontal list)
function InlineLanguageSwitcher({
  locales,
  currentLocale,
  showFlag,
  onChange,
  className,
}: Omit<LanguageSwitcherProps, 'variant' | 'showNativeName'>) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLocaleChange = (locale: string) => {
    if (onChange) {
      onChange(locale);
    } else {
      const segments = pathname.split('/');
      if (locales.some((l) => l.code === segments[1])) {
        segments[1] = locale;
      } else {
        segments.splice(1, 0, locale);
      }
      router.push(segments.join('/'));
    }
  };

  return (
    <div
      className={cn('flex items-center gap-1', className)}
      role="radiogroup"
      aria-label="Select language"
    >
      {locales.map((locale, index) => (
        <React.Fragment key={locale.code}>
          <button
            onClick={() => handleLocaleChange(locale.code)}
            className={cn(
              'px-2 py-1 text-sm rounded transition-colors',
              currentLocale === locale.code
                ? 'font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            role="radio"
            aria-checked={currentLocale === locale.code}
          >
            {showFlag && locale.flag ? (
              <span className="mr-1">{locale.flag}</span>
            ) : null}
            {locale.code.toUpperCase()}
          </button>
          {index < locales.length - 1 && (
            <span className="text-muted-foreground">|</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// Compact Variant (icon only)
function CompactLanguageSwitcher({
  locales,
  currentLocale,
  onChange,
  className,
}: Omit<LanguageSwitcherProps, 'variant' | 'showFlag' | 'showNativeName'>) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocaleData = locales.find((l) => l.code === currentLocale);

  const handleLocaleChange = (locale: string) => {
    if (onChange) {
      onChange(locale);
    } else {
      const segments = pathname.split('/');
      if (locales.some((l) => l.code === segments[1])) {
        segments[1] = locale;
      } else {
        segments.splice(1, 0, locale);
      }
      router.push(segments.join('/'));
    }
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-lg',
            'hover:bg-accent transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-ring',
            className
          )}
          aria-label={`Current language: ${currentLocaleData?.name}. Click to change.`}
        >
          {currentLocaleData?.flag || <Globe className="h-4 w-4" />}
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[10rem] overflow-hidden rounded-lg border bg-popover p-1 shadow-md"
          align="end"
          sideOffset={4}
        >
          {locales.map((locale) => (
            <DropdownMenu.Item
              key={locale.code}
              onClick={() => handleLocaleChange(locale.code)}
              className={cn(
                'flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none',
                'focus:bg-accent',
                currentLocale === locale.code && 'bg-accent/50'
              )}
            >
              {locale.flag && <span className="mr-2">{locale.flag}</span>}
              <span className="flex-1">{locale.nativeName}</span>
              {currentLocale === locale.code && (
                <Check className="ml-2 h-4 w-4" />
              )}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

// Main Component
export function LanguageSwitcher({
  variant = 'dropdown',
  ...props
}: LanguageSwitcherProps) {
  switch (variant) {
    case 'inline':
      return <InlineLanguageSwitcher {...props} />;
    case 'compact':
      return <CompactLanguageSwitcher {...props} />;
    default:
      return <DropdownLanguageSwitcher {...props} />;
  }
}

// Hook for getting current locale
export function useLocale(): string {
  const pathname = usePathname();
  const segments = pathname.split('/');
  
  // Check if first segment is a locale code
  const potentialLocale = segments[1];
  const isLocale = commonLocales.some((l) => l.code === potentialLocale);
  
  return isLocale ? potentialLocale : 'en';
}
```

## Usage

### Basic Dropdown

```tsx
import { LanguageSwitcher, commonLocales } from '@/components/organisms/language-switcher';

export function Header({ locale }) {
  return (
    <header>
      <LanguageSwitcher
        locales={commonLocales.filter((l) =>
          ['en', 'es', 'fr', 'de'].includes(l.code)
        )}
        currentLocale={locale}
      />
    </header>
  );
}
```

### Inline Variant

```tsx
<LanguageSwitcher
  variant="inline"
  locales={[
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  ]}
  currentLocale={locale}
/>
```

### Compact (Icon Only)

```tsx
<LanguageSwitcher
  variant="compact"
  locales={supportedLocales}
  currentLocale={locale}
/>
```

### With Custom Handler

```tsx
<LanguageSwitcher
  locales={locales}
  currentLocale={locale}
  onChange={(newLocale) => {
    // Custom logic, e.g., store in cookie
    document.cookie = `locale=${newLocale}; path=/`;
    router.refresh();
  }}
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Closed | Dropdown menu not visible | Only trigger button shown |
| Open | Dropdown expanded | Menu visible with locale options, overlay active |
| Hover | Mouse over trigger or menu item | Background highlight on hovered element |
| Focus | Keyboard focus on element | Ring outline on focused button or menu item |
| Selected | Current locale highlighted | Checkmark icon, accent background on selected item |
| Loading | Locale change in progress | Optional loading indicator during route change |
| RTL Active | RTL locale selected | Direction attribute changes, layout mirrors |

## Anti-patterns

### Not preserving current path on locale change

```tsx
// Bad: Redirecting to root on locale change
const handleLocaleChange = (locale: string) => {
  router.push(`/${locale}`);
};

// Good: Preserve current path when changing locale
const handleLocaleChange = (locale: string) => {
  const segments = pathname.split('/');
  if (locales.some((l) => l.code === segments[1])) {
    segments[1] = locale; // Replace existing locale
  } else {
    segments.splice(1, 0, locale); // Insert locale at position 1
  }
  router.push(segments.join('/'));
};
```

### Missing accessible label for compact variant

```tsx
// Bad: Icon-only button without accessible label
<button className="icon-button">
  {currentLocale.flag}
</button>

// Good: Provide descriptive aria-label
<button
  className="icon-button"
  aria-label={`Current language: ${currentLocaleData?.name}. Click to change.`}
>
  {currentLocale.flag}
</button>
```

### Inline variant without proper ARIA roles

```tsx
// Bad: Inline buttons without radio group semantics
<div className="flex gap-1">
  {locales.map((locale) => (
    <button onClick={() => handleChange(locale.code)}>
      {locale.code.toUpperCase()}
    </button>
  ))}
</div>

// Good: Proper radiogroup semantics for inline variant
<div
  className="flex gap-1"
  role="radiogroup"
  aria-label="Select language"
>
  {locales.map((locale) => (
    <button
      onClick={() => handleChange(locale.code)}
      role="radio"
      aria-checked={currentLocale === locale.code}
    >
      {locale.code.toUpperCase()}
    </button>
  ))}
</div>
```

### Not handling RTL locales properly

```tsx
// Bad: Ignoring text direction for RTL languages
const locales = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
];

// Good: Include direction information for proper layout
const locales = [
  { code: 'en', name: 'English', nativeName: 'English', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', dir: 'rtl' },
];

// Then update document direction on locale change
const handleLocaleChange = (locale: string) => {
  const localeData = locales.find((l) => l.code === locale);
  document.documentElement.dir = localeData?.dir || 'ltr';
  // ... navigation logic
};
```

## Related Skills

- `patterns/i18n` - Internationalization setup
- `organisms/user-menu` - User menu integration
- `templates/multilingual-layout` - Multilingual layouts

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Dropdown, inline, and compact variants
- Flag emoji support
- Native language names
- Next.js routing integration
