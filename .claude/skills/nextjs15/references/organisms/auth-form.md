---
id: o-auth-form
name: Auth Form
version: 2.0.0
layer: L3
category: forms
description: Authentication forms for login, signup, password reset, and OAuth providers
tags: [auth, login, signup, form, oauth, password-reset, magic-link]
composes:
  - ../molecules/form-field.md
  - ../molecules/password-input.md
  - ../atoms/input-button.md
  - ../atoms/input-text.md
  - ../atoms/input-checkbox.md
  - ../atoms/display-text.md
  - ../atoms/feedback-alert.md
formula: "AuthForm = FormField(m-form-field) + PasswordInput(m-password-input) + Button(a-button) + Checkbox(a-checkbox) + Alert(a-alert) + OAuth buttons"
dependencies:
  react-hook-form: "^7.53.0"
  "@hookform/resolvers": "^3.9.0"
  zod: "^3.23.0"
  lucide-react: "^0.460.0"
performance:
  impact: low
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Auth Form

## Overview

The Auth Form organism provides complete authentication UI including login, signup, password reset, and OAuth provider buttons. Features client-side validation with Zod schemas, loading states, comprehensive error handling, and support for magic link/passwordless authentication.

This organism composes molecules (form-field, password-input) and atoms (button, checkbox, alert) into a cohesive authentication experience that handles all common auth flows.

## When to Use

Use this skill when:
- Building login/signup pages
- Implementing password reset flows
- Adding OAuth authentication (Google, GitHub, etc.)
- Creating magic link authentication
- Building multi-step registration flows

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       AuthForm (L3)                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    FormField (L2)                         │  │
│  │  ┌─────────────┐  ┌────────────────┐  ┌───────────────┐   │  │
│  │  │ Label       │  │ Input          │  │ Error         │   │  │
│  │  │ (a-text)    │  │ (a-input-text) │  │ (a-alert)     │   │  │
│  │  └─────────────┘  └────────────────┘  └───────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                  PasswordInput (L2)                       │  │
│  │  ┌────────────────┐  ┌─────────────┐  ┌───────────────┐   │  │
│  │  │ Input          │  │ Toggle      │  │ Strength      │   │  │
│  │  │ (a-input-text) │  │ (a-button)  │  │ (a-progress)  │   │  │
│  │  └────────────────┘  └─────────────┘  └───────────────┘   │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌─────────────┐  ┌──────────────────┐  ┌─────────────────┐    │
│  │ Remember Me │  │ Submit Button    │  │ OAuth Buttons   │    │
│  │ (a-checkbox)│  │ (a-button)       │  │ (a-button[])    │    │
│  └─────────────┘  └──────────────────┘  └─────────────────┘    │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Alert (L1)                             │  │
│  │          For global form errors & success messages        │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Composes

- [form-field](../molecules/form-field.md) - Form inputs with label, description, and error handling
- [password-input](../molecules/password-input.md) - Password with visibility toggle and strength meter
- [input-button](../atoms/input-button.md) - Submit and OAuth buttons
- [input-text](../atoms/input-text.md) - Email/username inputs
- [input-checkbox](../atoms/input-checkbox.md) - Remember me checkbox
- [feedback-alert](../atoms/feedback-alert.md) - Error/success messages

## Implementation

```typescript
// components/organisms/auth-form.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Composed components from lower layers
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import { FormField } from "@/components/ui/form-field";

// ============================================
// Schemas
// ============================================

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// ============================================
// Types
// ============================================

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;
type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
type MagicLinkData = z.infer<typeof magicLinkSchema>;

type AuthFormVariant = "login" | "signup" | "forgot-password" | "reset-password" | "magic-link";

interface OAuthProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface AuthFormProps {
  /** Form variant */
  variant: AuthFormVariant;
  /** Submit handler */
  onSubmit: (data: LoginData | SignupData | ForgotPasswordData | ResetPasswordData | MagicLinkData) => Promise<void>;
  /** OAuth sign-in handler */
  onOAuthSignIn?: (provider: string) => Promise<void>;
  /** OAuth providers */
  oauthProviders?: OAuthProvider[];
  /** Show OAuth section */
  showOAuth?: boolean;
  /** Custom error message */
  error?: string;
  /** Success message */
  success?: string;
  /** Footer content (links to other auth pages) */
  footer?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

// ============================================
// OAuth Icons
// ============================================

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
    </svg>
  );
}

const defaultOAuthProviders: OAuthProvider[] = [
  { id: "google", name: "Google", icon: <GoogleIcon className="h-5 w-5" /> },
  { id: "github", name: "GitHub", icon: <GitHubIcon className="h-5 w-5" /> },
];

// ============================================
// Main Component
// ============================================

export function AuthForm({
  variant,
  onSubmit,
  onOAuthSignIn,
  oauthProviders = defaultOAuthProviders,
  showOAuth = true,
  error: externalError,
  success,
  footer,
  className,
}: AuthFormProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [oauthLoading, setOauthLoading] = React.useState<string | null>(null);

  // Select schema based on variant
  const schema = {
    login: loginSchema,
    signup: signupSchema,
    "forgot-password": forgotPasswordSchema,
    "reset-password": resetPasswordSchema,
    "magic-link": magicLinkSchema,
  }[variant];

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(variant),
  });

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data as LoginData | SignupData | ForgotPasswordData | ResetPasswordData | MagicLinkData);
    } catch (err) {
      form.setError("root", {
        message: err instanceof Error ? err.message : "An error occurred",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignIn = async (provider: string) => {
    if (!onOAuthSignIn) return;
    setOauthLoading(provider);
    try {
      await onOAuthSignIn(provider);
    } finally {
      setOauthLoading(null);
    }
  };

  const formError = form.formState.errors.root?.message || externalError;

  return (
    <div className={cn("w-full max-w-md space-y-6", className)}>
      {/* Title */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {getTitle(variant)}
        </h1>
        <p className="text-muted-foreground">
          {getDescription(variant)}
        </p>
      </div>

      {/* Error Alert */}
      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* OAuth Buttons */}
      {showOAuth && variant !== "forgot-password" && variant !== "reset-password" && (
        <>
          <div className="grid gap-2">
            {oauthProviders.map((provider) => (
              <Button
                key={provider.id}
                type="button"
                variant="outline"
                className="w-full"
                disabled={oauthLoading !== null}
                onClick={() => handleOAuthSignIn(provider.id)}
              >
                {oauthLoading === provider.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="mr-2">{provider.icon}</span>
                )}
                Continue with {provider.name}
              </Button>
            ))}
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        </>
      )}

      {/* Form */}
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Variant-specific fields */}
        {variant === "login" && (
          <LoginFields form={form} isSubmitting={isSubmitting} />
        )}
        {variant === "signup" && (
          <SignupFields form={form} isSubmitting={isSubmitting} />
        )}
        {variant === "forgot-password" && (
          <ForgotPasswordFields form={form} isSubmitting={isSubmitting} />
        )}
        {variant === "reset-password" && (
          <ResetPasswordFields form={form} isSubmitting={isSubmitting} />
        )}
        {variant === "magic-link" && (
          <MagicLinkFields form={form} isSubmitting={isSubmitting} />
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {getSubmitLabel(variant)}
        </Button>
      </form>

      {/* Footer */}
      {footer && (
        <div className="text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}

// ============================================
// Variant-specific field components
// ============================================

interface FieldProps {
  form: ReturnType<typeof useForm>;
  isSubmitting: boolean;
}

function LoginFields({ form, isSubmitting }: FieldProps) {
  return (
    <>
      <FormField
        label="Email"
        error={form.formState.errors.email?.message as string}
        required
      >
        <Input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isSubmitting}
          {...form.register("email")}
        />
      </FormField>

      <FormField
        label="Password"
        error={form.formState.errors.password?.message as string}
        required
      >
        <PasswordInput
          placeholder="Enter password"
          autoComplete="current-password"
          disabled={isSubmitting}
          {...form.register("password")}
        />
      </FormField>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="rememberMe"
            disabled={isSubmitting}
            {...form.register("rememberMe")}
          />
          <Label htmlFor="rememberMe" className="text-sm font-normal">
            Remember me
          </Label>
        </div>
        <a
          href="/forgot-password"
          className="text-sm text-primary hover:underline"
        >
          Forgot password?
        </a>
      </div>
    </>
  );
}

function SignupFields({ form, isSubmitting }: FieldProps) {
  return (
    <>
      <FormField
        label="Name"
        error={form.formState.errors.name?.message as string}
        required
      >
        <Input
          placeholder="Your name"
          autoComplete="name"
          disabled={isSubmitting}
          {...form.register("name")}
        />
      </FormField>

      <FormField
        label="Email"
        error={form.formState.errors.email?.message as string}
        required
      >
        <Input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          disabled={isSubmitting}
          {...form.register("email")}
        />
      </FormField>

      <FormField
        label="Password"
        error={form.formState.errors.password?.message as string}
        required
      >
        <PasswordInput
          placeholder="Create password"
          autoComplete="new-password"
          showStrength
          showRequirements
          disabled={isSubmitting}
          {...form.register("password")}
        />
      </FormField>

      <FormField
        label="Confirm Password"
        error={form.formState.errors.confirmPassword?.message as string}
        required
      >
        <PasswordInput
          placeholder="Confirm password"
          autoComplete="new-password"
          disabled={isSubmitting}
          {...form.register("confirmPassword")}
        />
      </FormField>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="acceptTerms"
          disabled={isSubmitting}
          {...form.register("acceptTerms")}
        />
        <Label htmlFor="acceptTerms" className="text-sm font-normal leading-tight">
          I agree to the{" "}
          <a href="/terms" className="text-primary hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </a>
        </Label>
      </div>
      {form.formState.errors.acceptTerms && (
        <p className="text-sm text-destructive">
          {form.formState.errors.acceptTerms.message as string}
        </p>
      )}
    </>
  );
}

function ForgotPasswordFields({ form, isSubmitting }: FieldProps) {
  return (
    <FormField
      label="Email"
      description="We'll send you a link to reset your password"
      error={form.formState.errors.email?.message as string}
      required
    >
      <Input
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isSubmitting}
        {...form.register("email")}
      />
    </FormField>
  );
}

function ResetPasswordFields({ form, isSubmitting }: FieldProps) {
  return (
    <>
      <FormField
        label="New Password"
        error={form.formState.errors.password?.message as string}
        required
      >
        <PasswordInput
          placeholder="Enter new password"
          autoComplete="new-password"
          showStrength
          showRequirements
          disabled={isSubmitting}
          {...form.register("password")}
        />
      </FormField>

      <FormField
        label="Confirm Password"
        error={form.formState.errors.confirmPassword?.message as string}
        required
      >
        <PasswordInput
          placeholder="Confirm new password"
          autoComplete="new-password"
          disabled={isSubmitting}
          {...form.register("confirmPassword")}
        />
      </FormField>
    </>
  );
}

function MagicLinkFields({ form, isSubmitting }: FieldProps) {
  return (
    <FormField
      label="Email"
      description="We'll send you a magic link to sign in"
      error={form.formState.errors.email?.message as string}
      required
    >
      <Input
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        disabled={isSubmitting}
        {...form.register("email")}
      />
    </FormField>
  );
}

// ============================================
// Helper functions
// ============================================

function getDefaultValues(variant: AuthFormVariant) {
  switch (variant) {
    case "login":
      return { email: "", password: "", rememberMe: false };
    case "signup":
      return { name: "", email: "", password: "", confirmPassword: "", acceptTerms: false };
    case "forgot-password":
    case "magic-link":
      return { email: "" };
    case "reset-password":
      return { password: "", confirmPassword: "" };
  }
}

function getTitle(variant: AuthFormVariant): string {
  switch (variant) {
    case "login": return "Welcome back";
    case "signup": return "Create an account";
    case "forgot-password": return "Forgot password?";
    case "reset-password": return "Reset password";
    case "magic-link": return "Sign in with magic link";
  }
}

function getDescription(variant: AuthFormVariant): string {
  switch (variant) {
    case "login": return "Enter your credentials to access your account";
    case "signup": return "Enter your details to get started";
    case "forgot-password": return "Enter your email and we'll send you a reset link";
    case "reset-password": return "Enter your new password below";
    case "magic-link": return "Enter your email to receive a sign-in link";
  }
}

function getSubmitLabel(variant: AuthFormVariant): string {
  switch (variant) {
    case "login": return "Sign In";
    case "signup": return "Create Account";
    case "forgot-password": return "Send Reset Link";
    case "reset-password": return "Reset Password";
    case "magic-link": return "Send Magic Link";
  }
}
```

### Key Implementation Notes

1. **Zod Validation**: Type-safe schemas for each variant with proper error messages
2. **React Hook Form**: Efficient form state management with automatic re-renders only for changed fields
3. **OAuth Integration**: Flexible provider system with loading states
4. **Composed Components**: Uses FormField (L2), PasswordInput (L2), Button (L1), Checkbox (L1), Alert (L1)
5. **Variant Pattern**: Single component handles all auth flows via variant prop

## Variants

### Login Form

```tsx
<AuthForm
  variant="login"
  onSubmit={async (data) => {
    await signIn("credentials", data);
  }}
  onOAuthSignIn={async (provider) => {
    await signIn(provider);
  }}
  footer={
    <p>
      Don't have an account?{" "}
      <a href="/signup" className="text-primary hover:underline">
        Sign up
      </a>
    </p>
  }
/>
```

### Signup Form

```tsx
<AuthForm
  variant="signup"
  onSubmit={async (data) => {
    await createAccount(data);
  }}
  footer={
    <p>
      Already have an account?{" "}
      <a href="/login" className="text-primary hover:underline">
        Sign in
      </a>
    </p>
  }
/>
```

### Forgot Password

```tsx
<AuthForm
  variant="forgot-password"
  onSubmit={async (data) => {
    await sendPasswordResetEmail(data.email);
  }}
  footer={
    <a href="/login" className="text-primary hover:underline">
      Back to login
    </a>
  }
/>
```

### Reset Password

```tsx
<AuthForm
  variant="reset-password"
  onSubmit={async (data) => {
    await resetPassword(token, data.password);
  }}
/>
```

### Magic Link

```tsx
<AuthForm
  variant="magic-link"
  showOAuth={false}
  onSubmit={async (data) => {
    await sendMagicLink(data.email);
  }}
/>
```

### Custom OAuth Providers

```tsx
<AuthForm
  variant="login"
  oauthProviders={[
    { id: "google", name: "Google", icon: <GoogleIcon /> },
    { id: "github", name: "GitHub", icon: <GitHubIcon /> },
    { id: "microsoft", name: "Microsoft", icon: <MicrosoftIcon /> },
  ]}
  onSubmit={handleSubmit}
  onOAuthSignIn={handleOAuth}
/>
```

## States

| State | Submit Button | Fields | Alert |
|-------|---------------|--------|-------|
| Idle | enabled | enabled | hidden |
| Submitting | disabled + spinner | disabled | hidden |
| Error | enabled | enabled | destructive |
| Success | disabled | disabled | success |
| OAuth Loading | disabled | disabled | hidden |

## Accessibility

### Required ARIA Attributes

- `aria-invalid` on fields with errors
- `aria-describedby` linking errors to fields via FormField
- `aria-live="polite"` on alert for error announcements
- Proper label associations via FormField

### Keyboard Navigation

| Key | Action |
|-----|--------|
| `Tab` | Navigate between fields |
| `Enter` | Submit form |
| `Space` | Toggle checkboxes, activate buttons |
| `Escape` | (Future) Close password strength popup |

### Screen Reader Announcements

- Form title and description announced on focus
- Field labels and descriptions announced
- Error messages announced with `role="alert"`
- Loading states announced via button text

## Dependencies

```json
{
  "dependencies": {
    "react-hook-form": "^7.53.0",
    "@hookform/resolvers": "^3.9.0",
    "zod": "^3.23.0",
    "lucide-react": "^0.460.0"
  }
}
```

### Installation

```bash
npm install react-hook-form @hookform/resolvers zod lucide-react
```

## Examples

### Next.js App Router Login Page

```tsx
// app/(auth)/login/page.tsx
import { AuthForm } from "@/components/organisms/auth-form";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function LoginPage() {
  async function handleSubmit(data: { email: string; password: string }) {
    "use server";
    const result = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (result?.error) {
      throw new Error("Invalid credentials");
    }
  }

  async function handleOAuth(provider: string) {
    "use server";
    await signIn(provider, { callbackUrl: "/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthForm
        variant="login"
        onSubmit={handleSubmit}
        onOAuthSignIn={handleOAuth}
        footer={
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        }
      />
    </div>
  );
}
```

### Registration with Email Verification

```tsx
// app/(auth)/signup/page.tsx
"use client";

import { useState } from "react";
import { AuthForm } from "@/components/organisms/auth-form";
import { createAccount } from "@/lib/auth";

export default function SignupPage() {
  const [success, setSuccess] = useState<string>();

  async function handleSubmit(data: {
    name: string;
    email: string;
    password: string;
  }) {
    await createAccount(data);
    setSuccess("Check your email to verify your account");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthForm
        variant="signup"
        onSubmit={handleSubmit}
        success={success}
        footer={
          <p>
            Already have an account?{" "}
            <a href="/login" className="text-primary hover:underline">
              Sign in
            </a>
          </p>
        }
      />
    </div>
  );
}
```

### Password Reset Flow

```tsx
// app/(auth)/reset-password/[token]/page.tsx
import { AuthForm } from "@/components/organisms/auth-form";
import { resetPassword, validateToken } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: { token: string };
}

export default async function ResetPasswordPage({ params }: Props) {
  const isValid = await validateToken(params.token);
  if (!isValid) notFound();

  async function handleSubmit(data: { password: string }) {
    "use server";
    await resetPassword(params.token, data.password);
    redirect("/login?reset=success");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <AuthForm
        variant="reset-password"
        onSubmit={handleSubmit}
      />
    </div>
  );
}
```

## Anti-patterns

### Missing Error Handling

```tsx
// Bad - no error handling
<AuthForm
  variant="login"
  onSubmit={async (data) => {
    await signIn("credentials", data); // Errors not caught
  }}
/>

// Good - proper error handling
<AuthForm
  variant="login"
  onSubmit={async (data) => {
    const result = await signIn("credentials", data);
    if (result?.error) {
      throw new Error("Invalid credentials"); // AuthForm catches this
    }
  }}
/>
```

### No Loading State Feedback

```tsx
// Bad - no visual feedback during submission
<form onSubmit={handleSubmit}>
  <button type="submit">Sign In</button>
</form>

// Good - AuthForm handles loading states automatically
<AuthForm variant="login" onSubmit={handleSubmit} />
```

### Inconsistent Validation

```tsx
// Bad - client validation doesn't match server
const clientSchema = z.object({
  password: z.string().min(6),
});
// Server requires 8 characters...

// Good - share schemas between client and server
import { loginSchema } from "@/lib/schemas/auth";
```

### No OAuth Error Handling

```tsx
// Bad - OAuth errors ignored
onOAuthSignIn={async (provider) => {
  await signIn(provider);
}}

// Good - handle OAuth failures
onOAuthSignIn={async (provider) => {
  try {
    await signIn(provider, { callbackUrl: "/dashboard" });
  } catch (error) {
    throw new Error(`${provider} sign-in failed`);
  }
}}
```

## Related Skills

### Composes From
- [molecules/form-field](../molecules/form-field.md) - Form inputs with validation
- [molecules/password-input](../molecules/password-input.md) - Password with visibility toggle
- [atoms/input-button](../atoms/input-button.md) - Submit and OAuth buttons
- [atoms/input-text](../atoms/input-text.md) - Email/username inputs
- [atoms/input-checkbox](../atoms/input-checkbox.md) - Remember me, accept terms
- [atoms/feedback-alert](../atoms/feedback-alert.md) - Error/success messages

### Composes Into
- [templates/auth-layout](../templates/auth-layout.md) - Authentication page layouts
- [recipes/saas-dashboard](../recipes/saas-dashboard.md) - SaaS starter with auth

### Alternatives
- [organisms/contact-form](./contact-form.md) - For non-auth forms
- [patterns/next-auth](../patterns/next-auth.md) - For NextAuth.js setup

---

## Changelog

### 2.0.0 (2025-01-18)
- Complete implementation added
- Added formula notation and composition diagram
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-16)
- Initial implementation with all auth variants
- OAuth provider support
- Magic link authentication
