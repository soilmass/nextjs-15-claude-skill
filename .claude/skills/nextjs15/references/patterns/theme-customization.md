---
id: pt-theme-customization
name: User Theme Customization
version: 1.1.0
layer: L5
category: ui
description: User theme customization with CSS variables for Next.js applications
tags: [theme, dark-mode, customization, css-variables, next15, react19]
composes:
  - ../atoms/input-button.md
  - ../molecules/select.md
  - ../molecules/card.md
dependencies: []
formula: CSS Variables + Theme Provider + Persistence = Dynamic Theme System
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# User Theme Customization

## Overview

User theme customization enables dynamic visual personalization of web applications through CSS custom properties (variables) and JavaScript-based theme management. This pattern empowers users to tailor their experience by adjusting colors, typography, spacing, and other visual aspects according to their preferences or accessibility needs. Modern theme systems go beyond simple dark/light mode toggles to support comprehensive customization while maintaining design consistency.

In Next.js 15, theme customization requires careful consideration of server-side rendering, hydration mismatches, and flash of unstyled content (FOUC). The App Router's streaming capabilities and React 19's concurrent features introduce new challenges for theme synchronization. This pattern addresses these challenges through strategic use of inline scripts, CSS variables, and careful state hydration that ensures themes are applied correctly on both server and client renders.

A well-implemented theme system combines several key components: a theme configuration that defines available customization options, a theme provider that manages state and applies changes, persistence mechanisms that remember user preferences across sessions, and UI components that allow users to modify their settings. By leveraging CSS custom properties, themes can be applied instantly without re-rendering the entire component tree, providing a smooth and responsive customization experience.

## When to Use

- **Dark/light mode**: System-aware theme switching that respects user's OS preferences while allowing manual override
- **Brand customization**: White-label applications where customers need to apply their brand colors and styling
- **User preferences**: Applications where personalization enhances user engagement and satisfaction
- **Accessibility**: Supporting high contrast modes, reduced motion preferences, and custom font sizes for users with visual impairments
- **Multi-tenant applications**: SaaS platforms where each tenant requires distinct visual branding
- **Content platforms**: Blogs, documentation sites, and reading apps where users benefit from customizing their reading experience

## When NOT to Use

- **Single-theme applications**: Simple sites with fixed branding that do not need any visual customization
- **Server-only rendering**: Applications that cannot execute client-side JavaScript or where hydration is not supported
- **Performance-critical landing pages**: Where the theme initialization script would impact Core Web Vitals metrics
- **Embedded widgets**: Third-party embeds that should match the host page's styling rather than having independent themes

## Composition Diagram

```
+------------------------------------------------------------------------+
|                    Theme Customization Architecture                      |
+------------------------------------------------------------------------+
|                                                                          |
|  ┌────────────────────────────────────────────────────────────────────┐ |
|  │                        Initial Load                                 │ |
|  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │ |
|  │  │ HTML <head>  │───>│ Theme Script │───>│ Apply Class  │         │ |
|  │  │   Inline     │    │ (Blocking)   │    │ dark/light   │         │ |
|  │  └──────────────┘    └──────────────┘    └──────────────┘         │ |
|  └────────────────────────────────────────────────────────────────────┘ |
|                              │                                           |
|                              ▼                                           |
|  ┌────────────────────────────────────────────────────────────────────┐ |
|  │                      ThemeProvider                                  │ |
|  │  ┌──────────────────────────────────────────────────────────────┐ │ |
|  │  │ State Management                                              │ │ |
|  │  │  • Theme mode (light/dark/system)                            │ │ |
|  │  │  • Custom colors (primary, secondary, accent, etc.)          │ │ |
|  │  │  • Typography settings (font size, font family)              │ │ |
|  │  │  • Spacing & radius preferences                              │ │ |
|  │  └──────────────────────────────────────────────────────────────┘ │ |
|  │                              │                                      │ |
|  │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │ |
|  │  │ localStorage │<──>│ CSS Variable │<──>│ Media Query  │         │ |
|  │  │ Persistence  │    │ Application  │    │ Listener     │         │ |
|  │  └──────────────┘    └──────────────┘    └──────────────┘         │ |
|  └────────────────────────────────────────────────────────────────────┘ |
|                              │                                           |
|                              ▼                                           |
|  ┌────────────────────────────────────────────────────────────────────┐ |
|  │                     Theme UI Components                             │ |
|  │                                                                      │ |
|  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐   │ |
|  │  │   Theme    │  │   Color    │  │   Font     │  │   Layout   │   │ |
|  │  │   Toggle   │  │   Picker   │  │   Slider   │  │   Presets  │   │ |
|  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘   │ |
|  │        │               │               │               │           │ |
|  │        └───────────────┴───────────────┴───────────────┘           │ |
|  │                              │                                      │ |
|  │                              ▼                                      │ |
|  │              ┌──────────────────────────────┐                      │ |
|  │              │    Theme Customizer Panel    │                      │ |
|  │              │    (Unified Settings UI)     │                      │ |
|  │              └──────────────────────────────┘                      │ |
|  └────────────────────────────────────────────────────────────────────┘ |
|                                                                          |
|  CSS Variable Flow:                                                      |
|  ┌──────────────────────────────────────────────────────────────────┐   |
|  │ :root {                                                          │   |
|  │   --primary: 222.2 47.4% 11.2%;  ← Theme Provider Updates        │   |
|  │   --background: 0 0% 100%;                                       │   |
|  │   --foreground: 222.2 84% 4.9%;                                  │   |
|  │   --radius: 0.5rem;                                              │   |
|  │ }                                                                │   |
|  │                              │                                    │   |
|  │                              ▼                                    │   |
|  │ .component {                                                     │   |
|  │   background: hsl(var(--background));  ← Components Consume      │   |
|  │   color: hsl(var(--foreground));                                 │   |
|  │   border-radius: var(--radius);                                  │   |
|  │ }                                                                │   |
|  └──────────────────────────────────────────────────────────────────┘   |
+------------------------------------------------------------------------+
```

## Theme Configuration

```typescript
// lib/theme/config.ts
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  card: string;
  cardForeground: string;
  destructive: string;
  destructiveForeground: string;
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
}

export interface ThemeTypography {
  fontFamily: 'system' | 'inter' | 'roboto' | 'geist';
  fontSize: number; // base font size in px
  lineHeight: 'tight' | 'normal' | 'relaxed';
}

export interface ThemeSpacing {
  radius: number; // in rem
  density: 'compact' | 'normal' | 'comfortable';
}

export interface ThemeConfig {
  mode: ThemeMode;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  reducedMotion: boolean;
}

export const defaultLightColors: ThemeColors = {
  primary: '222.2 47.4% 11.2%',
  secondary: '210 40% 96.1%',
  accent: '210 40% 96.1%',
  background: '0 0% 100%',
  foreground: '222.2 84% 4.9%',
  muted: '210 40% 96.1%',
  mutedForeground: '215.4 16.3% 46.9%',
  border: '214.3 31.8% 91.4%',
  card: '0 0% 100%',
  cardForeground: '222.2 84% 4.9%',
  destructive: '0 84.2% 60.2%',
  destructiveForeground: '210 40% 98%',
  success: '142.1 76.2% 36.3%',
  successForeground: '355.7 100% 97.3%',
  warning: '38 92% 50%',
  warningForeground: '48 96% 89%',
};

export const defaultDarkColors: ThemeColors = {
  primary: '210 40% 98%',
  secondary: '217.2 32.6% 17.5%',
  accent: '217.2 32.6% 17.5%',
  background: '222.2 84% 4.9%',
  foreground: '210 40% 98%',
  muted: '217.2 32.6% 17.5%',
  mutedForeground: '215 20.2% 65.1%',
  border: '217.2 32.6% 17.5%',
  card: '222.2 84% 4.9%',
  cardForeground: '210 40% 98%',
  destructive: '0 62.8% 30.6%',
  destructiveForeground: '210 40% 98%',
  success: '142.1 70.6% 45.3%',
  successForeground: '144.9 80.4% 10%',
  warning: '48 96% 53%',
  warningForeground: '20.5 90.2% 10%',
};

export const defaultTheme: ThemeConfig = {
  mode: 'system',
  colors: defaultLightColors,
  typography: {
    fontFamily: 'system',
    fontSize: 16,
    lineHeight: 'normal',
  },
  spacing: {
    radius: 0.5,
    density: 'normal',
  },
  reducedMotion: false,
};

export const themePresets: Record<string, Partial<ThemeColors>> = {
  default: {},
  ocean: {
    primary: '199 89% 48%',
    accent: '187 100% 42%',
  },
  forest: {
    primary: '142.1 76.2% 36.3%',
    accent: '161 94% 30%',
  },
  sunset: {
    primary: '24.6 95% 53.1%',
    accent: '346.8 77.2% 49.8%',
  },
  lavender: {
    primary: '262.1 83.3% 57.8%',
    accent: '280 65% 60%',
  },
  monochrome: {
    primary: '0 0% 9%',
    accent: '0 0% 45%',
  },
};
```

## Theme Provider

```typescript
// providers/theme-provider.tsx
'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  ThemeConfig,
  ThemeMode,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  defaultTheme,
  defaultLightColors,
  defaultDarkColors,
} from '@/lib/theme/config';

interface ThemeContextValue {
  theme: ThemeConfig;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
  setColors: (colors: Partial<ThemeColors>) => void;
  setTypography: (typography: Partial<ThemeTypography>) => void;
  setSpacing: (spacing: Partial<ThemeSpacing>) => void;
  setReducedMotion: (reduced: boolean) => void;
  applyPreset: (presetName: string) => void;
  resetTheme: () => void;
  exportTheme: () => string;
  importTheme: (json: string) => boolean;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = 'user-theme-preferences';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(defaultTheme);
  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Load saved theme on mount
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTheme((prev) => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Failed to parse saved theme:', error);
      }
    }

    // Check reduced motion preference
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) {
      setTheme((prev) => ({ ...prev, reducedMotion: true }));
    }
  }, []);

  // Watch system color scheme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (theme.mode === 'system') {
        setResolvedMode(e.matches ? 'dark' : 'light');
      }
    };

    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.mode]);

  // Apply theme whenever it changes
  useEffect(() => {
    if (!mounted) return;

    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme));

    // Apply to document
    applyThemeToDocument(theme, resolvedMode);
  }, [theme, resolvedMode, mounted]);

  const applyThemeToDocument = (config: ThemeConfig, mode: 'light' | 'dark') => {
    const root = document.documentElement;

    // Apply mode class
    root.classList.remove('light', 'dark');
    root.classList.add(mode);

    // Get colors for current mode
    const baseColors = mode === 'dark' ? defaultDarkColors : defaultLightColors;
    const colors = { ...baseColors, ...config.colors };

    // Apply color CSS variables
    Object.entries(colors).forEach(([key, value]) => {
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--${cssKey}`, value);
    });

    // Apply typography
    root.style.setProperty('--font-size-base', `${config.typography.fontSize}px`);
    root.style.fontSize = `${config.typography.fontSize}px`;

    const lineHeightMap = { tight: '1.25', normal: '1.5', relaxed: '1.75' };
    root.style.setProperty('--line-height', lineHeightMap[config.typography.lineHeight]);

    const fontFamilyMap: Record<string, string> = {
      system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      inter: '"Inter", sans-serif',
      roboto: '"Roboto", sans-serif',
      geist: '"Geist", sans-serif',
    };
    root.style.setProperty('--font-family', fontFamilyMap[config.typography.fontFamily]);

    // Apply spacing
    root.style.setProperty('--radius', `${config.spacing.radius}rem`);

    const densityScale = { compact: 0.875, normal: 1, comfortable: 1.125 };
    root.style.setProperty('--density', String(densityScale[config.spacing.density]));

    // Apply reduced motion
    if (config.reducedMotion) {
      root.style.setProperty('--transition-duration', '0ms');
      root.classList.add('reduce-motion');
    } else {
      root.style.setProperty('--transition-duration', '150ms');
      root.classList.remove('reduce-motion');
    }
  };

  const setMode = useCallback((mode: ThemeMode) => {
    setTheme((prev) => ({ ...prev, mode }));

    if (mode === 'system') {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedMode(systemDark ? 'dark' : 'light');
    } else {
      setResolvedMode(mode);
    }
  }, []);

  const setColors = useCallback((colors: Partial<ThemeColors>) => {
    setTheme((prev) => ({ ...prev, colors: { ...prev.colors, ...colors } }));
  }, []);

  const setTypography = useCallback((typography: Partial<ThemeTypography>) => {
    setTheme((prev) => ({
      ...prev,
      typography: { ...prev.typography, ...typography },
    }));
  }, []);

  const setSpacing = useCallback((spacing: Partial<ThemeSpacing>) => {
    setTheme((prev) => ({
      ...prev,
      spacing: { ...prev.spacing, ...spacing },
    }));
  }, []);

  const setReducedMotion = useCallback((reduced: boolean) => {
    setTheme((prev) => ({ ...prev, reducedMotion: reduced }));
  }, []);

  const applyPreset = useCallback((presetName: string) => {
    const { themePresets } = require('@/lib/theme/config');
    const preset = themePresets[presetName];
    if (preset) {
      setColors(preset);
    }
  }, [setColors]);

  const resetTheme = useCallback(() => {
    setTheme(defaultTheme);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const exportTheme = useCallback((): string => {
    return JSON.stringify(theme, null, 2);
  }, [theme]);

  const importTheme = useCallback((json: string): boolean => {
    try {
      const imported = JSON.parse(json);
      setTheme((prev) => ({ ...prev, ...imported }));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Prevent flash by not rendering until mounted
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedMode,
        setMode,
        setColors,
        setTypography,
        setSpacing,
        setReducedMotion,
        applyPreset,
        resetTheme,
        exportTheme,
        importTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

## Theme Toggle Component

```typescript
// components/theme/theme-toggle.tsx
'use client';

import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/providers/theme-provider';

export function ThemeToggle() {
  const { theme, setMode, resolvedMode } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Current theme: ${theme.mode}. Click to change.`}
        >
          {resolvedMode === 'dark' ? (
            <Moon className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Sun className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setMode('light')}
          aria-selected={theme.mode === 'light'}
        >
          <Sun className="h-4 w-4 mr-2" aria-hidden="true" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setMode('dark')}
          aria-selected={theme.mode === 'dark'}
        >
          <Moon className="h-4 w-4 mr-2" aria-hidden="true" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setMode('system')}
          aria-selected={theme.mode === 'system'}
        >
          <Monitor className="h-4 w-4 mr-2" aria-hidden="true" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Simple toggle without dropdown for mobile
export function ThemeToggleSimple() {
  const { resolvedMode, setMode } = useTheme();

  const toggleTheme = () => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label={`Switch to ${resolvedMode === 'dark' ? 'light' : 'dark'} mode`}
    >
      {resolvedMode === 'dark' ? (
        <Sun className="h-5 w-5" aria-hidden="true" />
      ) : (
        <Moon className="h-5 w-5" aria-hidden="true" />
      )}
    </Button>
  );
}
```

## Theme Customizer Panel

```typescript
// components/theme/theme-customizer.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/theme-provider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ThemeToggle } from './theme-toggle';
import { themePresets } from '@/lib/theme/config';
import { Download, Upload, RotateCcw } from 'lucide-react';

const presetColors = [
  { name: 'Slate', value: '222.2 47.4% 11.2%' },
  { name: 'Blue', value: '221.2 83.2% 53.3%' },
  { name: 'Green', value: '142.1 76.2% 36.3%' },
  { name: 'Purple', value: '262.1 83.3% 57.8%' },
  { name: 'Rose', value: '346.8 77.2% 49.8%' },
  { name: 'Orange', value: '24.6 95% 53.1%' },
];

export function ThemeCustomizer() {
  const {
    theme,
    setColors,
    setTypography,
    setSpacing,
    setReducedMotion,
    applyPreset,
    resetTheme,
    exportTheme,
    importTheme,
  } = useTheme();

  const [importError, setImportError] = useState<string | null>(null);

  const handleExport = () => {
    const json = exportTheme();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'theme-preferences.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = importTheme(text);
        if (!success) {
          setImportError('Invalid theme file');
          setTimeout(() => setImportError(null), 3000);
        }
      }
    };
    input.click();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Theme Settings
          <ThemeToggle />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="colors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="spacing">Layout</TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-4">
            <div className="space-y-2">
              <Label>Theme Preset</Label>
              <Select onValueChange={(value) => applyPreset(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a preset" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(themePresets).map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {preset.charAt(0).toUpperCase() + preset.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Primary Color</Label>
              <div className="grid grid-cols-6 gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color.name}
                    className="h-8 w-8 rounded-full border-2 border-transparent transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2"
                    style={{
                      backgroundColor: `hsl(${color.value})`,
                      borderColor:
                        theme.colors.primary === color.value
                          ? 'hsl(var(--foreground))'
                          : 'transparent',
                    }}
                    onClick={() => setColors({ primary: color.value })}
                    title={color.name}
                    aria-label={`Set primary color to ${color.name}`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-primary">Custom Primary (HSL)</Label>
              <input
                id="custom-primary"
                type="text"
                className="w-full px-3 py-2 border rounded-md text-sm"
                placeholder="e.g., 221.2 83.2% 53.3%"
                defaultValue={theme.colors.primary}
                onBlur={(e) => {
                  if (e.target.value) {
                    setColors({ primary: e.target.value });
                  }
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-4">
            <div className="space-y-2">
              <Label>Font Family</Label>
              <Select
                value={theme.typography.fontFamily}
                onValueChange={(value) =>
                  setTypography({ fontFamily: value as ThemeTypography['fontFamily'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System Default</SelectItem>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="roboto">Roboto</SelectItem>
                  <SelectItem value="geist">Geist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Font Size: {theme.typography.fontSize}px</Label>
              <Slider
                value={[theme.typography.fontSize]}
                min={12}
                max={20}
                step={1}
                onValueChange={([value]) => setTypography({ fontSize: value })}
                aria-label="Adjust font size"
              />
            </div>

            <div className="space-y-2">
              <Label>Line Height</Label>
              <Select
                value={theme.typography.lineHeight}
                onValueChange={(value) =>
                  setTypography({ lineHeight: value as ThemeTypography['lineHeight'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tight">Tight (1.25)</SelectItem>
                  <SelectItem value="normal">Normal (1.5)</SelectItem>
                  <SelectItem value="relaxed">Relaxed (1.75)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="spacing" className="space-y-4">
            <div className="space-y-2">
              <Label>Border Radius: {theme.spacing.radius}rem</Label>
              <Slider
                value={[theme.spacing.radius]}
                min={0}
                max={1}
                step={0.125}
                onValueChange={([value]) => setSpacing({ radius: value })}
                aria-label="Adjust border radius"
              />
            </div>

            <div className="space-y-2">
              <Label>UI Density</Label>
              <Select
                value={theme.spacing.density}
                onValueChange={(value) =>
                  setSpacing({ density: value as ThemeSpacing['density'] })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="reduced-motion">Reduce Motion</Label>
              <Switch
                id="reduced-motion"
                checked={theme.reducedMotion}
                onCheckedChange={setReducedMotion}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleExport}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleImport}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>

          {importError && (
            <p className="text-sm text-destructive">{importError}</p>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={resetTheme}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Default
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

## Flash Prevention Script

```typescript
// app/layout.tsx
import { ThemeProvider } from '@/providers/theme-provider';

// Inline script to prevent flash of wrong theme
const themeScript = `
  (function() {
    try {
      const stored = localStorage.getItem('user-theme-preferences');
      const theme = stored ? JSON.parse(stored) : {};
      const mode = theme.mode || 'system';
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const resolved = mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;

      document.documentElement.classList.add(resolved);

      // Apply critical CSS variables immediately
      if (theme.colors) {
        const root = document.documentElement;
        Object.entries(theme.colors).forEach(([key, value]) => {
          const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
          root.style.setProperty('--' + cssKey, value);
        });
      }

      // Apply font size
      if (theme.typography?.fontSize) {
        document.documentElement.style.fontSize = theme.typography.fontSize + 'px';
      }

      // Apply reduced motion preference
      if (theme.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reduce-motion');
      }
    } catch (e) {
      // Fallback to system preference
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.classList.add(systemDark ? 'dark' : 'light');
    }
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
```

## CSS Variables Base Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Default light theme colors */
    --primary: 222.2 47.4% 11.2%;
    --secondary: 210 40% 96.1%;
    --accent: 210 40% 96.1%;
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --border: 214.3 31.8% 91.4%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --success: 142.1 76.2% 36.3%;
    --success-foreground: 355.7 100% 97.3%;
    --warning: 38 92% 50%;
    --warning-foreground: 48 96% 89%;

    /* Typography */
    --font-size-base: 16px;
    --line-height: 1.5;
    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

    /* Spacing */
    --radius: 0.5rem;
    --density: 1;

    /* Animation */
    --transition-duration: 150ms;
  }

  .dark {
    --primary: 210 40% 98%;
    --secondary: 217.2 32.6% 17.5%;
    --accent: 217.2 32.6% 17.5%;
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --border: 217.2 32.6% 17.5%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --success: 142.1 70.6% 45.3%;
    --success-foreground: 144.9 80.4% 10%;
    --warning: 48 96% 53%;
    --warning-foreground: 20.5 90.2% 10%;
  }

  /* Reduced motion support */
  .reduce-motion,
  .reduce-motion * {
    animation-duration: 0.001ms !important;
    transition-duration: 0.001ms !important;
  }

  /* Density scaling */
  .density-compact {
    --density: 0.875;
  }

  .density-comfortable {
    --density: 1.125;
  }
}

@layer base {
  * {
    border-color: hsl(var(--border));
  }

  body {
    background-color: hsl(var(--background));
    color: hsl(var(--foreground));
    font-family: var(--font-family);
    font-size: var(--font-size-base);
    line-height: var(--line-height);
    transition-property: background-color, color;
    transition-duration: var(--transition-duration);
  }
}
```

## Examples

### Example 1: Settings Page with Theme Customization

```typescript
// app/settings/appearance/page.tsx
'use client';

import { ThemeCustomizer } from '@/components/theme/theme-customizer';
import { ThemePreview } from '@/components/theme/theme-preview';

export default function AppearanceSettingsPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Appearance Settings</h1>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Customize Theme</h2>
          <ThemeCustomizer />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <ThemePreview />
        </div>
      </div>
    </div>
  );
}

// components/theme/theme-preview.tsx
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export function ThemePreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>

        <Input placeholder="Sample input field" />

        <div className="p-4 rounded-lg border bg-muted">
          <p className="text-muted-foreground">
            This is a muted section with subtle background.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-4 rounded-lg bg-success text-success-foreground">
            Success
          </div>
          <div className="p-4 rounded-lg bg-warning text-warning-foreground">
            Warning
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Example 2: Multi-Tenant Branding System

```typescript
// lib/theme/tenant.ts
import { ThemeColors } from './config';

interface TenantBranding {
  id: string;
  name: string;
  logo: string;
  colors: Partial<ThemeColors>;
  customCSS?: string;
}

export async function getTenantBranding(tenantId: string): Promise<TenantBranding | null> {
  // In production, fetch from database or API
  const response = await fetch(`/api/tenants/${tenantId}/branding`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;
  return response.json();
}

// providers/tenant-theme-provider.tsx
'use client';

import { useEffect } from 'react';
import { useTheme } from './theme-provider';

interface TenantThemeProviderProps {
  tenantBranding: {
    colors: Partial<ThemeColors>;
    customCSS?: string;
  } | null;
  children: React.ReactNode;
}

export function TenantThemeProvider({
  tenantBranding,
  children,
}: TenantThemeProviderProps) {
  const { setColors } = useTheme();

  useEffect(() => {
    if (tenantBranding?.colors) {
      setColors(tenantBranding.colors);
    }

    // Inject custom CSS if provided
    if (tenantBranding?.customCSS) {
      const style = document.createElement('style');
      style.id = 'tenant-custom-css';
      style.textContent = tenantBranding.customCSS;
      document.head.appendChild(style);

      return () => {
        const existing = document.getElementById('tenant-custom-css');
        if (existing) existing.remove();
      };
    }
  }, [tenantBranding, setColors]);

  return <>{children}</>;
}

// app/[tenant]/layout.tsx
import { getTenantBranding } from '@/lib/theme/tenant';
import { TenantThemeProvider } from '@/providers/tenant-theme-provider';

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant } = await params;
  const branding = await getTenantBranding(tenant);

  return (
    <TenantThemeProvider tenantBranding={branding}>
      {children}
    </TenantThemeProvider>
  );
}
```

### Example 3: Reading Mode for Blog/Documentation

```typescript
// components/theme/reading-mode.tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/providers/theme-provider';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Settings2 } from 'lucide-react';

const readingPresets = {
  default: {
    fontSize: 16,
    lineHeight: 'normal' as const,
    maxWidth: '65ch',
  },
  comfortable: {
    fontSize: 18,
    lineHeight: 'relaxed' as const,
    maxWidth: '60ch',
  },
  large: {
    fontSize: 20,
    lineHeight: 'relaxed' as const,
    maxWidth: '55ch',
  },
};

export function ReadingModeControls() {
  const { theme, setTypography } = useTheme();
  const [contentWidth, setContentWidth] = useState('65ch');

  const applyPreset = (preset: keyof typeof readingPresets) => {
    const settings = readingPresets[preset];
    setTypography({
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
    });
    setContentWidth(settings.maxWidth);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Reading settings">
          <Settings2 className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Reading Settings</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label>Quick Presets</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('default')}
              >
                Default
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('comfortable')}
              >
                Comfortable
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => applyPreset('large')}
              >
                Large
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Font Size: {theme.typography.fontSize}px</Label>
            <Slider
              value={[theme.typography.fontSize]}
              min={14}
              max={24}
              step={1}
              onValueChange={([value]) => setTypography({ fontSize: value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Line Spacing</Label>
            <div className="flex gap-2">
              {(['tight', 'normal', 'relaxed'] as const).map((height) => (
                <Button
                  key={height}
                  variant={theme.typography.lineHeight === height ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTypography({ lineHeight: height })}
                >
                  {height.charAt(0).toUpperCase() + height.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Preview: These settings will be applied to the article content for
              a better reading experience.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// app/blog/[slug]/page.tsx
import { ReadingModeControls } from '@/components/theme/reading-mode';

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  return (
    <article className="container py-8">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">{post.title}</h1>
        <ReadingModeControls />
      </header>

      <div
        className="prose prose-lg max-w-none dark:prose-invert"
        style={{
          maxWidth: 'var(--content-width, 65ch)',
          margin: '0 auto',
        }}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}
```

## Anti-patterns

### 1. Direct DOM Manipulation Without CSS Variables

```typescript
// BAD - Directly manipulating styles leads to inconsistent theming
function setDarkMode() {
  document.body.style.backgroundColor = '#1a1a1a';
  document.body.style.color = '#ffffff';

  // Every component needs manual updates
  document.querySelectorAll('.card').forEach((el) => {
    (el as HTMLElement).style.backgroundColor = '#2a2a2a';
  });

  document.querySelectorAll('.button').forEach((el) => {
    (el as HTMLElement).style.backgroundColor = '#3b82f6';
  });
}

// GOOD - Use CSS variables for consistent theming
function setDarkMode() {
  document.documentElement.classList.add('dark');
  // All components automatically update through CSS variables
}

// In CSS:
// .card { background: hsl(var(--card)); }
// .button { background: hsl(var(--primary)); }
```

### 2. Ignoring Hydration Mismatches

```typescript
// BAD - Server and client render different content
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // This causes hydration mismatch
  const [mode, setMode] = useState(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  );

  return (
    <div className={mode === 'dark' ? 'dark' : ''}>
      {children}
    </div>
  );
}

// GOOD - Use suppressHydrationWarning and inline script
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render children until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}

// In layout.tsx, use inline script to apply theme before React hydrates
const themeScript = `
  (function() {
    const theme = localStorage.getItem('theme') || 'system';
    // Apply theme immediately...
  })();
`;
```

### 3. Not Persisting User Preferences

```typescript
// BAD - Theme resets on every page load
function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  const toggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
    // User preference is lost on refresh!
  };

  return <button onClick={toggle}>Toggle</button>;
}

// GOOD - Persist to localStorage and load on mount
function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.add(saved);
    }
  }, []);

  const toggle = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  return <button onClick={toggle}>Toggle</button>;
}
```

### 4. Blocking Render on Theme Load

```typescript
// BAD - Synchronous localStorage read blocks render
export default function RootLayout({ children }: { children: React.ReactNode }) {
  // This runs on every render and blocks
  const theme = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('theme') || '{}')
    : {};

  return (
    <html className={theme.mode}>
      <body>{children}</body>
    </html>
  );
}

// GOOD - Use non-blocking inline script
const themeScript = `
  (function() {
    try {
      const theme = JSON.parse(localStorage.getItem('theme') || '{}');
      document.documentElement.classList.add(theme.mode || 'light');
    } catch {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### 5. Not Respecting System Preferences

```typescript
// BAD - Ignoring system color scheme preference
function useTheme() {
  const [theme, setTheme] = useState('light'); // Always starts light

  return { theme, setTheme };
}

// GOOD - Respect and watch system preference
function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [resolved, setResolved] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolved = () => {
      if (theme === 'system') {
        setResolved(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolved(theme);
      }
    };

    updateResolved();
    mediaQuery.addEventListener('change', updateResolved);

    return () => mediaQuery.removeEventListener('change', updateResolved);
  }, [theme]);

  return { theme, resolved, setTheme };
}
```

## Testing

### Unit Tests for Theme Context

```typescript
// __tests__/providers/theme-provider.test.tsx
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/providers/theme-provider';

// Mock matchMedia
const mockMatchMedia = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Test component that uses the hook
function TestComponent() {
  const { theme, resolvedMode, setMode, setColors, resetTheme } = useTheme();

  return (
    <div>
      <span data-testid="mode">{theme.mode}</span>
      <span data-testid="resolved">{resolvedMode}</span>
      <span data-testid="primary">{theme.colors.primary}</span>
      <button onClick={() => setMode('dark')}>Set Dark</button>
      <button onClick={() => setMode('light')}>Set Light</button>
      <button onClick={() => setMode('system')}>Set System</button>
      <button onClick={() => setColors({ primary: '0 100% 50%' })}>
        Set Red
      </button>
      <button onClick={() => resetTheme()}>Reset</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear();
    mockMatchMedia(false);
  });

  it('provides default theme values', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
  });

  it('allows setting theme mode', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByText('Set Dark'));

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('respects system preference when mode is system', async () => {
    mockMatchMedia(true); // System prefers dark

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
  });

  it('allows customizing colors', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByText('Set Red'));

    expect(screen.getByTestId('primary')).toHaveTextContent('0 100% 50%');
  });

  it('persists theme to localStorage', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByText('Set Dark'));

    const stored = JSON.parse(localStorage.getItem('user-theme-preferences') || '{}');
    expect(stored.mode).toBe('dark');
  });

  it('loads saved theme from localStorage', () => {
    localStorage.setItem(
      'user-theme-preferences',
      JSON.stringify({ mode: 'dark', colors: { primary: '0 50% 50%' } })
    );

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('mode')).toHaveTextContent('dark');
    expect(screen.getByTestId('primary')).toHaveTextContent('0 50% 50%');
  });

  it('resets theme to defaults', async () => {
    const user = userEvent.setup();

    localStorage.setItem(
      'user-theme-preferences',
      JSON.stringify({ mode: 'dark' })
    );

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    await user.click(screen.getByText('Reset'));

    expect(screen.getByTestId('mode')).toHaveTextContent('system');
    expect(localStorage.getItem('user-theme-preferences')).toBeNull();
  });
});
```

### Component Tests for Theme Toggle

```typescript
// __tests__/components/theme/theme-toggle.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/providers/theme-provider';
import { ThemeToggle } from '@/components/theme/theme-toggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });
  });

  it('renders with correct icon for current mode', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    // Default is system -> light, so sun icon should be visible
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('opens dropdown menu on click', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button'));

    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('changes theme when option is selected', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    await user.click(screen.getByRole('button'));
    await user.click(screen.getByText('Dark'));

    // Verify the class was added to document
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('has accessible label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-label');
  });
});
```

### Integration Tests for CSS Variable Application

```typescript
// __tests__/integration/theme-css-variables.test.tsx
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from '@/providers/theme-provider';

function TestColorApplication() {
  const { setColors, theme } = useTheme();

  return (
    <div>
      <button onClick={() => setColors({ primary: '0 100% 50%' })}>
        Change Color
      </button>
      <div
        data-testid="styled-div"
        style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
      />
    </div>
  );
}

describe('CSS Variable Application', () => {
  beforeEach(() => {
    localStorage.clear();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(() => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })),
    });
  });

  it('applies CSS variables to document root', async () => {
    render(
      <ThemeProvider>
        <TestColorApplication />
      </ThemeProvider>
    );

    await waitFor(() => {
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--primary')).toBeTruthy();
    });
  });

  it('updates CSS variables when theme changes', async () => {
    const user = userEvent.setup();

    render(
      <ThemeProvider>
        <TestColorApplication />
      </ThemeProvider>
    );

    await user.click(screen.getByText('Change Color'));

    await waitFor(() => {
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--primary')).toBe('0 100% 50%');
    });
  });

  it('applies dark mode class when dark mode is set', async () => {
    localStorage.setItem(
      'user-theme-preferences',
      JSON.stringify({ mode: 'dark' })
    );

    render(
      <ThemeProvider>
        <div>Test</div>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});
```

## Related Patterns

- [zustand](./zustand.md) - Alternative state management for theme preferences
- [local-storage](./local-storage.md) - Persistence patterns for user preferences
- [accessibility-testing](./accessibility-testing.md) - Testing high contrast and reduced motion modes
- [server-components](./server-components.md) - Handling theme in Server Components

---

## Changelog

### 1.1.0 (2025-01-18)
- Added comprehensive Overview section explaining the pattern
- Added When NOT to Use section with specific scenarios
- Expanded Composition Diagram with detailed architecture
- Added ThemeTypography and ThemeSpacing interfaces
- Added theme presets system
- Added export/import functionality for theme configurations
- Added 3 complete examples (settings page, multi-tenant, reading mode)
- Added 5 anti-patterns with code examples
- Added comprehensive testing section (unit, component, integration)
- Added CSS base styles with full variable definitions
- Improved accessibility with ARIA labels and keyboard support

### 1.0.0 (2025-01-18)
- Initial implementation
- CSS variables theme system
- Dark mode with system detection
- Theme customizer panel
- Flash prevention
