---
id: m-password-input
name: Password Input
version: 2.0.0
layer: L2
category: forms
description: Password input with visibility toggle and strength indicator
tags: [password, input, visibility, strength, security]
formula: "PasswordInput = InputText(a-input-text) + InputButton(a-input-button) + DisplayIcon(a-display-icon) + FeedbackProgress(a-feedback-progress)"
composes:
  - ../atoms/input-text.md
  - ../atoms/input-button.md
  - ../atoms/display-icon.md
  - ../atoms/feedback-progress.md
dependencies: []
performance:
  impact: low
  lcp: neutral
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Password Input

## Overview

The Password Input molecule combines a text input with visibility toggle and optional strength meter. Provides visual feedback on password quality and secure input handling.

## When to Use

Use this skill when:
- Building login forms
- Creating registration with password requirements
- Implementing password reset flows
- Building settings forms with password changes

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       PasswordInput (L2)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Input Wrapper                           │  │
│  │  ┌─────────────────────────────────────────┐  ┌────────┐  │  │
│  │  │         Input Text (a-input-text)       │  │ Toggle │  │  │
│  │  │   type="password" | type="text"         │  │ Button │  │  │
│  │  │   ********************************      │  │(a-input│  │  │
│  │  │                                         │  │ -btn)  │  │  │
│  │  │                                         │  │  👁️   │  │  │
│  │  └─────────────────────────────────────────┘  └────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              Strength Meter (optional)                     │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │         Progress (a-feedback-progress)              │  │  │
│  │  │  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  "Strong"              │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            Requirements Checklist (optional)               │  │
│  │  ✓ At least 8 characters                                  │  │
│  │  ✓ Contains uppercase letter                              │  │
│  │  ✗ Contains special character (a-display-icon + text)     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Atoms Used

- [input-text](../atoms/input-text.md) - Base input
- [input-button](../atoms/input-button.md) - Toggle button
- [display-icon](../atoms/display-icon.md) - Eye icons
- [feedback-progress](../atoms/feedback-progress.md) - Strength meter

## Implementation

```typescript
// components/ui/password-input.tsx
"use client";

import * as React from "react";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  /** Show password strength meter */
  showStrength?: boolean;
  /** Password requirements to check */
  requirements?: PasswordRequirement[];
  /** Show requirements checklist */
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const defaultRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /\d/.test(p) },
  { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

export function PasswordInput({
  className,
  showStrength = false,
  requirements = defaultRequirements,
  showRequirements = false,
  value,
  onChange,
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState("");
  
  const password = (value as string) ?? internalValue;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInternalValue(e.target.value);
    onChange?.(e);
  };

  const toggleVisibility = () => {
    setShowPassword(!showPassword);
  };

  const passedRequirements = requirements.filter((req) => req.test(password));
  const strength = requirements.length > 0
    ? (passedRequirements.length / requirements.length) * 100
    : 0;

  const strengthLabel = 
    strength === 0 ? "" :
    strength < 40 ? "Weak" :
    strength < 70 ? "Medium" :
    strength < 100 ? "Strong" :
    "Very Strong";

  const strengthColor =
    strength < 40 ? "bg-destructive" :
    strength < 70 ? "bg-yellow-500" :
    strength < 100 ? "bg-green-500" :
    "bg-green-600";

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={handleChange}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background",
            "placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
          onClick={toggleVisibility}
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          )}
        </Button>
      </div>

      {/* Strength Meter */}
      {showStrength && password.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Password strength</span>
            <span className={cn(
              strength < 40 && "text-destructive",
              strength >= 40 && strength < 70 && "text-yellow-600",
              strength >= 70 && "text-green-600"
            )}>
              {strengthLabel}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn("h-full transition-all duration-300", strengthColor)}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      )}

      {/* Requirements Checklist */}
      {showRequirements && password.length > 0 && (
        <ul className="space-y-1 text-sm" role="list" aria-label="Password requirements">
          {requirements.map((req, index) => {
            const passed = req.test(password);
            return (
              <li
                key={index}
                className={cn(
                  "flex items-center gap-2",
                  passed ? "text-green-600" : "text-muted-foreground"
                )}
              >
                {passed ? (
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span>{req.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
```

```typescript
// components/ui/confirm-password-input.tsx
"use client";

import * as React from "react";
import { PasswordInput } from "./password-input";
import { cn } from "@/lib/utils";

interface ConfirmPasswordInputProps {
  /** Password value */
  password: string;
  /** Confirm password value */
  confirmPassword: string;
  /** Password change handler */
  onPasswordChange: (value: string) => void;
  /** Confirm password change handler */
  onConfirmPasswordChange: (value: string) => void;
  /** Show strength meter on main password */
  showStrength?: boolean;
  /** Show requirements checklist */
  showRequirements?: boolean;
  /** Error message */
  error?: string;
  className?: string;
}

export function ConfirmPasswordInput({
  password,
  confirmPassword,
  onPasswordChange,
  onConfirmPasswordChange,
  showStrength = true,
  showRequirements = true,
  error,
  className,
}: ConfirmPasswordInputProps) {
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const showMismatch = confirmPassword.length > 0 && !passwordsMatch;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <PasswordInput
          id="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          showStrength={showStrength}
          showRequirements={showRequirements}
          placeholder="Enter password"
          autoComplete="new-password"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirm-password" className="text-sm font-medium">
          Confirm Password
        </label>
        <PasswordInput
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          placeholder="Confirm password"
          autoComplete="new-password"
          className={cn(
            showMismatch && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {showMismatch && (
          <p className="text-sm text-destructive">Passwords do not match</p>
        )}
        {passwordsMatch && (
          <p className="text-sm text-green-600">Passwords match</p>
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
```

### Key Implementation Notes

1. **Visibility Toggle**: Uses button with `tabIndex={-1}` to prevent focus disruption during typing
2. **Auto-complete**: Use `autoComplete="new-password"` for registration, `current-password` for login

## Variants

### Basic Password

```tsx
<PasswordInput placeholder="Enter password" />
```

### With Strength Meter

```tsx
<PasswordInput
  showStrength
  placeholder="Enter password"
/>
```

### With Requirements

```tsx
<PasswordInput
  showStrength
  showRequirements
  placeholder="Enter password"
/>
```

### Custom Requirements

```tsx
<PasswordInput
  showRequirements
  requirements={[
    { label: "At least 12 characters", test: (p) => p.length >= 12 },
    { label: "Contains a number", test: (p) => /\d/.test(p) },
    { label: "No common words", test: (p) => !commonWords.includes(p.toLowerCase()) },
  ]}
/>
```

### Confirm Password

```tsx
<ConfirmPasswordInput
  password={password}
  confirmPassword={confirmPassword}
  onPasswordChange={setPassword}
  onConfirmPasswordChange={setConfirmPassword}
  showStrength
  showRequirements
/>
```

## States

| State | Border | Background | Icon | Strength |
|-------|--------|------------|------|----------|
| Empty | input | background | eye | hidden |
| Typing | input | background | eye | visible |
| Weak | input | background | eye | red |
| Medium | input | background | eye | yellow |
| Strong | input | background | eye | green |
| Visible | input | background | eye-off | visible |
| Error | destructive | background | eye | - |
| Disabled | muted | muted | muted | hidden |

## Accessibility

### Required ARIA Attributes

- `aria-label` on toggle button
- `type="password"` or `type="text"` for visibility
- Requirements list with `role="list"`

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Focus input (skip toggle) |
| `Enter` | Toggle visibility (when button focused) |
| Password managers | Autofill supported |

### Screen Reader Announcements

- "Show/Hide password" button announced
- Strength level changes announced
- Requirements completion announced

## Dependencies

```json
{
  "dependencies": {
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install lucide-react
```

## Examples

### Login Form

```tsx
import { PasswordInput } from "@/components/ui/password-input";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password">Password</label>
        <PasswordInput
          id="password"
          placeholder="Enter password"
          autoComplete="current-password"
        />
      </div>
      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
}
```

### Registration Form

```tsx
import { ConfirmPasswordInput } from "@/components/ui/confirm-password-input";
import { useState } from "react";

export function RegistrationForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email">Email</label>
        <Input id="email" type="email" autoComplete="email" />
      </div>
      
      <ConfirmPasswordInput
        password={password}
        confirmPassword={confirmPassword}
        onPasswordChange={setPassword}
        onConfirmPasswordChange={setConfirmPassword}
        showStrength
        showRequirements
      />
      
      <Button
        type="submit"
        className="w-full"
        disabled={password !== confirmPassword || password.length < 8}
      >
        Create Account
      </Button>
    </form>
  );
}
```

### Password Change

```tsx
import { PasswordInput, ConfirmPasswordInput } from "@/components/ui/password-input";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="current">Current Password</label>
        <PasswordInput
          id="current"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          autoComplete="current-password"
        />
      </div>
      
      <ConfirmPasswordInput
        password={newPassword}
        confirmPassword={confirmPassword}
        onPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        showStrength
        showRequirements
      />
      
      <Button type="submit">Change Password</Button>
    </form>
  );
}
```

## Anti-patterns

### Wrong Autocomplete Attribute

```tsx
// Bad - wrong autocomplete for registration
<PasswordInput autoComplete="current-password" /> // Should be new-password

// Good
<PasswordInput autoComplete="new-password" /> // For registration
<PasswordInput autoComplete="current-password" /> // For login
```

### No Visibility Toggle

```tsx
// Bad - users can't verify what they typed
<input type="password" />

// Good
<PasswordInput />
```

### Overly Strict Requirements

```tsx
// Bad - frustrating for users
requirements={[
  { label: "Exactly 16 characters", test: (p) => p.length === 16 },
  { label: "No repeated characters", test: (p) => !/(.).*\1/.test(p) },
]}

// Good - reasonable requirements
requirements={[
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains letter and number", test: (p) => /[a-zA-Z]/.test(p) && /\d/.test(p) },
]}
```

## Related Skills

### Composes From
- [atoms/input-text](../atoms/input-text.md) - Base input
- [atoms/input-button](../atoms/input-button.md) - Toggle button
- [atoms/feedback-progress](../atoms/feedback-progress.md) - Strength bar

### Composes Into
- [organisms/auth-form](../organisms/auth-form.md) - Authentication forms
- [organisms/settings-form](../organisms/settings-form.md) - Account settings

### Alternatives
- [atoms/input-text](../atoms/input-text.md) - For non-password fields

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation
- Visibility toggle
- Strength meter with customizable requirements
- ConfirmPasswordInput component
