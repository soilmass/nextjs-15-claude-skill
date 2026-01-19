---
id: pt-micro-interactions
name: Micro-Interaction Patterns
version: 2.0.0
layer: L5
category: animation
description: Subtle interactive feedback patterns that enhance UX through motion and visual cues
tags: [micro-interactions, feedback, ux, motion, haptic]
composes:
  - ../atoms/input-button.md
  - ../atoms/input-checkbox.md
  - ../atoms/input-switch.md
  - ../atoms/input-text.md
dependencies:
  framer-motion: "^11.15.0"
formula: Framer Motion + AnimatePresence + State Changes = Delightful Feedback
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Providing visual feedback for button clicks with loading, success, and error states
- Creating animated like buttons with particle effects
- Building toggle switches with smooth spring animations
- Implementing copy-to-clipboard buttons with confirmation feedback
- Adding ripple effects to buttons for material design feel

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   MICRO-INTERACTION PATTERNS                     │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                  User Action                          │      │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │      │
│  │  │  Click  │  │  Hover  │  │  Focus  │  │  Drag   │ │      │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               State Transition                        │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  idle → loading → success/error → idle          │ │      │
│  │  │  unchecked → checked (with animation)           │ │      │
│  │  │  default → copied → default (with feedback)     │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               Visual Feedback                         │      │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────────────┐ │      │
│  │  │  Spinner  │  │ Checkmark │  │     Particles    │ │      │
│  │  │  (load)   │  │ (success) │  │    (delight)     │ │      │
│  │  └───────────┘  └───────────┘  └──────────────────┘ │      │
│  │  ┌───────────┐  ┌───────────┐  ┌──────────────────┐ │      │
│  │  │  Ripple   │  │   Scale   │  │      Color       │ │      │
│  │  │  (touch)  │  │   (tap)   │  │    (state)       │ │      │
│  │  └───────────┘  └───────────┘  └──────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Micro-Interaction Patterns

## Overview

Micro-interactions are small, contained moments of animation that provide feedback, guide users, and add delight. They communicate state changes, confirm actions, and make interfaces feel responsive.

## Implementation

### Button Feedback States

```typescript
// components/ui/feedback-button.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonState = "idle" | "loading" | "success" | "error";

interface FeedbackButtonProps {
  onClick: () => Promise<void>;
  children: React.ReactNode;
  className?: string;
}

export function FeedbackButton({
  onClick,
  children,
  className,
}: FeedbackButtonProps) {
  const [state, setState] = useState<ButtonState>("idle");

  const handleClick = async () => {
    setState("loading");
    try {
      await onClick();
      setState("success");
      setTimeout(() => setState("idle"), 2000);
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 2000);
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={state !== "idle"}
      className={cn(
        "relative inline-flex items-center justify-center gap-2",
        "h-10 px-4 rounded-md font-medium",
        "bg-primary text-primary-foreground",
        "transition-colors duration-200",
        state === "success" && "bg-green-500",
        state === "error" && "bg-destructive",
        className
      )}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence mode="wait">
        {state === "idle" && (
          <motion.span
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.span>
        )}
        
        {state === "loading" && (
          <motion.span
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="h-4 w-4 animate-spin" />
          </motion.span>
        )}
        
        {state === "success" && (
          <motion.span
            key="success"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Check className="h-4 w-4" />
          </motion.span>
        )}
        
        {state === "error" && (
          <motion.span
            key="error"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <X className="h-4 w-4" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
```

### Like Button with Heart Animation

```typescript
// components/ui/like-button.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  initialLiked?: boolean;
  initialCount?: number;
  onLike?: (liked: boolean) => Promise<void>;
}

export function LikeButton({
  initialLiked = false,
  initialCount = 0,
  onLike,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [particles, setParticles] = useState<number[]>([]);

  const handleClick = async () => {
    const newLiked = !liked;
    setLiked(newLiked);
    setCount((c) => (newLiked ? c + 1 : c - 1));

    // Spawn particles on like
    if (newLiked) {
      setParticles(Array.from({ length: 6 }, (_, i) => i));
      setTimeout(() => setParticles([]), 700);
    }

    await onLike?.(newLiked);
  };

  return (
    <button
      onClick={handleClick}
      className="relative inline-flex items-center gap-1 p-2 rounded-full hover:bg-pink-50 transition-colors"
    >
      {/* Particles */}
      <AnimatePresence>
        {particles.map((i) => (
          <motion.div
            key={i}
            initial={{ scale: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: Math.cos((i * 60 * Math.PI) / 180) * 20,
              y: Math.sin((i * 60 * Math.PI) / 180) * 20,
            }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute top-1/2 left-1/2 h-2 w-2 rounded-full bg-pink-500"
          />
        ))}
      </AnimatePresence>

      {/* Heart icon */}
      <motion.div
        animate={{
          scale: liked ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={cn(
            "h-5 w-5 transition-colors duration-200",
            liked ? "fill-pink-500 text-pink-500" : "text-gray-400"
          )}
        />
      </motion.div>

      {/* Count */}
      <span className="text-sm font-medium text-gray-600">{count}</span>
    </button>
  );
}
```

### Toggle Switch with Motion

```typescript
// components/ui/animated-switch.tsx
"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function AnimatedSwitch({
  checked,
  onChange,
  disabled,
}: AnimatedSwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative h-6 w-11 rounded-full p-0.5",
        "transition-colors duration-200",
        checked ? "bg-primary" : "bg-gray-200",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <motion.div
        layout
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className={cn(
          "h-5 w-5 rounded-full bg-white shadow-sm",
          checked && "ml-auto"
        )}
      />
    </button>
  );
}
```

### Checkbox with Check Animation

```typescript
// components/ui/animated-checkbox.tsx
"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function AnimatedCheckbox({
  checked,
  onChange,
  label,
}: AnimatedCheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <button
        role="checkbox"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "h-5 w-5 rounded border-2 flex items-center justify-center",
          "transition-colors duration-200",
          checked
            ? "bg-primary border-primary"
            : "bg-white border-gray-300 hover:border-primary"
        )}
      >
        <motion.div
          initial={false}
          animate={{
            scale: checked ? 1 : 0,
            opacity: checked ? 1 : 0,
          }}
          transition={{ duration: 0.15 }}
        >
          <Check className="h-3 w-3 text-white" />
        </motion.div>
      </button>
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}
```

### Input Focus Interaction

```typescript
// components/ui/floating-input.tsx
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FloatingInputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function FloatingInput({
  label,
  type = "text",
  value,
  onChange,
  error,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = focused || hasValue;

  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={cn(
          "peer w-full h-14 px-4 pt-4 border rounded-lg bg-transparent",
          "outline-none transition-colors duration-200",
          focused ? "border-primary" : "border-gray-300",
          error && "border-destructive"
        )}
      />
      
      {/* Floating label */}
      <motion.label
        initial={false}
        animate={{
          y: isActive ? -24 : 0,
          scale: isActive ? 0.85 : 1,
          color: focused ? "var(--primary)" : "var(--muted-foreground)",
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2",
          "pointer-events-none origin-left",
          "bg-background px-1"
        )}
      >
        {label}
      </motion.label>
      
      {/* Focus line */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: focused ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-center"
      />
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
```

### Ripple Effect

```typescript
// components/ui/ripple.tsx
"use client";

import { useState, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function RippleButton({ children }: { children: React.ReactNode }) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const ripple = { id: Date.now(), x, y };
    setRipples((prev) => [...prev, ripple]);
    
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 600);
  };

  return (
    <button
      onClick={handleClick}
      className="relative overflow-hidden px-6 py-3 bg-primary text-primary-foreground rounded-lg"
    >
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 4, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute h-4 w-4 rounded-full bg-white/30 pointer-events-none"
            style={{
              left: ripple.x - 8,
              top: ripple.y - 8,
            }}
          />
        ))}
      </AnimatePresence>
      {children}
    </button>
  );
}
```

### Copy Button Feedback

```typescript
// components/ui/copy-button.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "relative h-8 w-8 rounded-md",
        "hover:bg-muted transition-colors",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Check className="h-4 w-4 text-green-500" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Copy className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
```

### Notification Badge Pulse

```typescript
// components/ui/notification-badge.tsx
"use client";

import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  children: React.ReactNode;
}

export function NotificationBadge({ count, children }: NotificationBadgeProps) {
  return (
    <div className="relative inline-flex">
      {children}
      
      {count > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center">
          {/* Ping animation */}
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
          
          {/* Badge */}
          <span className="relative inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
            {count > 99 ? "99+" : count}
          </span>
        </span>
      )}
    </div>
  );
}
```

## Variants

### Haptic Feedback (Mobile)

```typescript
// hooks/use-haptic.ts
export function useHaptic() {
  const vibrate = (pattern: number | number[] = 10) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  return {
    light: () => vibrate(10),
    medium: () => vibrate(20),
    heavy: () => vibrate([30, 10, 30]),
    success: () => vibrate([10, 50, 20]),
    error: () => vibrate([50, 30, 50, 30, 50]),
  };
}
```

## Anti-patterns

1. **Too many animations**: Overwhelming visual noise
2. **Slow feedback**: > 200ms feels unresponsive
3. **Inconsistent timing**: Different durations for similar actions
4. **No purpose**: Animation without meaning
5. **Ignoring reduced motion**: Not respecting user preferences

## Related Skills

- `L5/patterns/animations` - Full animations
- `L5/patterns/transitions` - CSS transitions
- `L5/patterns/accessibility` - Motion accessibility
- `L1/atoms/button` - Button component

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Framer Motion
