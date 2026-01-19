---
id: a-input-otp
name: OTP Input
version: 2.0.0
layer: L1
category: input
composes:
  - ../primitives/colors.md
  - ../primitives/typography.md
  - ../primitives/spacing.md
description: One-time password input with auto-focus between digits
tags: [input, otp, pin, verification, code, 2fa, mfa]
performance:
  impact: low
  lcp: neutral
  cls: neutral
dependencies:
  - react
  - input-otp
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# OTP Input

## Overview

A one-time password (OTP) input component for verification codes, PINs, and multi-factor authentication. Features auto-focus between digits, paste support, and mobile-optimized keyboard.

## Implementation

```tsx
// components/ui/input-otp.tsx
'use client';

import * as React from 'react';
import { OTPInput, OTPInputContext } from 'input-otp';
import { Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// Main OTP Input component
const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={cn(
      'flex items-center gap-2 has-[:disabled]:opacity-50',
      containerClassName
    )}
    className={cn('disabled:cursor-not-allowed', className)}
    {...props}
  />
));
InputOTP.displayName = 'InputOTP';

// Group of slots (e.g., 3 digits, separator, 3 digits)
const InputOTPGroup = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
InputOTPGroup.displayName = 'InputOTPGroup';

// Individual slot
const InputOTPSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'z-10 ring-2 ring-ring ring-offset-background',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground duration-1000" />
        </div>
      )}
    </div>
  );
});
InputOTPSlot.displayName = 'InputOTPSlot';

// Separator between groups
const InputOTPSeparator = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div ref={ref} role="separator" {...props}>
    <Minus className="h-4 w-4 text-muted-foreground" />
  </div>
));
InputOTPSeparator.displayName = 'InputOTPSeparator';

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
```

```css
/* Add to globals.css */
@keyframes caret-blink {
  0%, 70%, 100% { opacity: 1; }
  20%, 50% { opacity: 0; }
}

.animate-caret-blink {
  animation: caret-blink 1.2s ease-out infinite;
}
```

## Variants

### 6-Digit Code (Default)

```tsx
function SixDigitOTP({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
```

### 4-Digit PIN

```tsx
function FourDigitPIN({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}) {
  return (
    <InputOTP
      maxLength={4}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      pattern="^[0-9]*$"
      inputMode="numeric"
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
    </InputOTP>
  );
}
```

### Alphanumeric Code

```tsx
function AlphanumericOTP({
  value,
  onChange,
  onComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
}) {
  return (
    <InputOTP
      maxLength={6}
      value={value}
      onChange={onChange}
      onComplete={onComplete}
      pattern="^[a-zA-Z0-9]*$"
    >
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
```

### Custom Styled Slots

```tsx
const CustomSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-14 w-12 items-center justify-center rounded-lg border-2 bg-muted text-xl font-semibold transition-all',
        isActive && 'border-primary bg-background ring-2 ring-primary/20',
        char && 'border-primary/50 bg-primary/5',
        !char && !isActive && 'border-muted-foreground/20',
        className
      )}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-0.5 animate-caret-blink bg-primary" />
        </div>
      )}
    </div>
  );
});
CustomSlot.displayName = 'CustomSlot';

function StyledOTP({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <InputOTP maxLength={6} value={value} onChange={onChange}>
      <InputOTPGroup className="gap-3">
        <CustomSlot index={0} />
        <CustomSlot index={1} />
        <CustomSlot index={2} />
        <CustomSlot index={3} />
        <CustomSlot index={4} />
        <CustomSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  );
}
```

### With Password Masking

```tsx
const MaskedSlot = React.forwardRef<
  React.ElementRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext);
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index];

  return (
    <div
      ref={ref}
      className={cn(
        'relative flex h-10 w-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
        isActive && 'z-10 ring-2 ring-ring',
        className
      )}
      {...props}
    >
      {char && <span className="h-2 w-2 rounded-full bg-foreground" />}
      {hasFakeCaret && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-4 w-px animate-caret-blink bg-foreground" />
        </div>
      )}
    </div>
  );
});
MaskedSlot.displayName = 'MaskedSlot';
```

## Complete Verification Flow

```tsx
'use client';

import * as React from 'react';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '@/components/ui/input-otp';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  codeLength?: number;
}

export function OTPVerification({
  email,
  onVerify,
  onResend,
  codeLength = 6,
}: OTPVerificationProps) {
  const [value, setValue] = React.useState('');
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Cooldown timer for resend
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleComplete = async (code: string) => {
    setIsVerifying(true);
    setError(null);
    
    try {
      const success = await onVerify(code);
      if (!success) {
        setError('Invalid verification code. Please try again.');
        setValue('');
      }
    } catch (err) {
      setError('Verification failed. Please try again.');
      setValue('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    try {
      await onResend();
      setResendCooldown(60);
      setValue('');
      setError(null);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col items-center space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Verify your email</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We sent a {codeLength}-digit code to{' '}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <InputOTP
        maxLength={codeLength}
        value={value}
        onChange={(val) => {
          setValue(val);
          setError(null);
        }}
        onComplete={handleComplete}
        disabled={isVerifying}
      >
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      {isVerifying && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Verifying...
        </div>
      )}

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Didn't receive the code? </span>
        <Button
          variant="link"
          className="h-auto p-0"
          onClick={handleResend}
          disabled={resendCooldown > 0}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </Button>
      </div>
    </div>
  );
}
```

## Dependencies

```bash
npm install input-otp
```

## Accessibility

- Auto-focuses next input on valid character entry
- Supports paste for full code
- Backspace navigates to previous slot
- Screen reader announces current position
- Mobile numeric keyboard via `inputMode`

## Related Skills

- [input-text](./input-text.md) - Base text input
- [two-factor](../patterns/two-factor.md) - 2FA implementation
- [email-verification](../patterns/email-verification.md) - Email verification flow

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)
- Initial implementation
- Auto-focus and paste support
- Custom slot styling
- Verification flow example
