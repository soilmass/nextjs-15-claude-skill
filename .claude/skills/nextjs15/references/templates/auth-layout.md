---
id: t-auth-layout
name: Auth Layout
version: 2.0.0
layer: L4
category: layouts
description: Authentication pages layout with centered card, branding, and social proof
tags: [layout, auth, login, signup, authentication, centered]
composes:
  - ../organisms/auth-form.md
  - ../molecules/card.md
  - ../organisms/testimonials.md
formula: "AuthLayout = BrandingPanel(Testimonials(o-testimonials) + TrustBadges) + AuthCard(Card(m-card) + AuthForm(o-auth-form)) + Footer"
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

# Auth Layout

## Overview

The Auth Layout template provides the structure for authentication pages (login, signup, forgot password, etc.). Features a centered card design with optional branding panel, testimonials, and responsive behavior for both mobile and desktop.

## When to Use

Use this skill when:
- Building login pages
- Creating signup flows
- Building password reset pages
- Creating verification pages

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            Auth Layout                                  │
├───────────────────────────────────┬─────────────────────────────────────┤
│                                   │                                     │
│   Branding Panel (Desktop)        │        Auth Card (m-card)           │
│   ┌─────────────────────────────┐ │  ┌─────────────────────────────────┐│
│   │                             │ │  │ [Logo] Acme Inc (Mobile Header) ││
│   │  [Logo] Acme Inc            │ │  │                                 ││
│   │                             │ │  │  ┌───────────────────────────┐  ││
│   │                             │ │  │  │     AuthForm (o-auth)     │  ││
│   │  Testimonials (o-testimonials) │  │  │                           │  ││
│   │  ┌─────────────────────────┐│ │  │  │  "Welcome back"           │  ││
│   │  │ "This platform has      ││ │  │  │                           │  ││
│   │  │  transformed how we     ││ │  │  │  [Email         ]         │  ││
│   │  │  work..."               ││ │  │  │  [Password      ]         │  ││
│   │  │                         ││ │  │  │                           │  ││
│   │  │  [Avatar] Sarah Johnson ││ │  │  │  [Continue with Google]   │  ││
│   │  │          CEO, TechCorp  ││ │  │  │  [Continue with GitHub]   │  ││
│   │  └─────────────────────────┘│ │  │  │                           │  ││
│   │                             │ │  │  │  [     Sign In     ]      │  ││
│   │                             │ │  │  │                           │  ││
│   │  Trust Badges               │ │  │  │  Don't have an account?   │  ││
│   │  [Logo1] [Logo2] [Logo3]    │ │  │  │  Sign up                  │  ││
│   │                             │ │  │  └───────────────────────────┘  ││
│   └─────────────────────────────┘ │  └─────────────────────────────────┘│
│                                   │                                     │
│                                   │  ┌─────────────────────────────────┐│
│                                   │  │            Footer               ││
│                                   │  │  Terms of Service | Privacy     ││
│                                   │  └─────────────────────────────────┘│
└───────────────────────────────────┴─────────────────────────────────────┘
```

## Organisms Used

- [auth-form](../organisms/auth-form.md) - Authentication forms

## Implementation

```typescript
// app/(auth)/layout.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default async function AuthLayout({ children }: AuthLayoutProps) {
  // Redirect if already authenticated
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/80" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-primary-foreground">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary-foreground flex items-center justify-center">
              <span className="text-primary font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold">Acme Inc</span>
          </Link>

          {/* Testimonial */}
          <div className="space-y-6">
            <blockquote className="text-2xl font-medium leading-relaxed">
              "This platform has transformed how we work. The speed and reliability 
              are unmatched. We've seen a 40% increase in productivity since switching."
            </blockquote>
            <div className="flex items-center gap-4">
              <Image
                src="/testimonials/avatar.jpg"
                alt="Sarah Johnson"
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <p className="font-semibold">Sarah Johnson</p>
                <p className="text-sm opacity-80">CEO at TechCorp</p>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-8 opacity-60">
            <Image src="/logos/company1.svg" alt="Company 1" width={100} height={30} />
            <Image src="/logos/company2.svg" alt="Company 2" width={100} height={30} />
            <Image src="/logos/company3.svg" alt="Company 3" width={100} height={30} />
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="lg:hidden p-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold">Acme Inc</span>
          </Link>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 text-center text-sm text-muted-foreground">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
```

### Login Page

```typescript
// app/(auth)/login/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/organisms/auth-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      {/* Auth Form */}
      <AuthForm
        mode="login"
        providers={["google", "github"]}
        onSubmit={async (data) => {
          "use server";
          // Handle login
        }}
      />

      {/* Footer Link */}
      <p className="text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link href="/signup" className="font-medium text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </>
  );
}
```

### Signup Page

```typescript
// app/(auth)/signup/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/organisms/auth-form";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create a new account",
};

export default function SignupPage() {
  return (
    <>
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">
          Get started with your free account today
        </p>
      </div>

      {/* Auth Form */}
      <AuthForm
        mode="signup"
        providers={["google", "github"]}
        showNameField
        onSubmit={async (data) => {
          "use server";
          // Handle signup
        }}
      />

      {/* Footer Link */}
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
```

### Forgot Password Page

```typescript
// app/(auth)/forgot-password/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/organisms/auth-form";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Reset your password",
};

export default function ForgotPasswordPage() {
  return (
    <>
      {/* Back Link */}
      <Link
        href="/login"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to login
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Forgot password?</h1>
        <p className="text-muted-foreground">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      {/* Auth Form */}
      <AuthForm
        mode="forgot-password"
        onSubmit={async (data) => {
          "use server";
          // Handle password reset
        }}
      />
    </>
  );
}
```

## Key Implementation Notes

1. **Redirect Logic**: Authenticated users go to dashboard
2. **Split Layout**: Branding panel on desktop
3. **Social Proof**: Testimonial on branding panel
4. **Legal Links**: Terms and privacy in footer
5. **Mobile First**: Full-width on mobile

## Variants

### Centered Only (No Branding Panel)

```tsx
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-background rounded-lg border p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### With Background Image

```tsx
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/auth-bg.jpg"
          alt="Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background rounded-lg p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### With Animated Background

```tsx
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-gradient" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float-delayed" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background/80 backdrop-blur-lg rounded-lg p-8 border">
          {children}
        </div>
      </div>
    </div>
  );
}
```

## Performance

### Image Optimization

- Use priority on branding images
- Optimize logo and avatar sizes
- Consider blur placeholders

### Authentication

- Check auth server-side
- Redirect before render
- Cache session checks

## Accessibility

### Required Features

- Proper form labels
- Error announcements
- Focus management on validation
- Keyboard-accessible forms

### Screen Reader

- Form purpose announced
- Errors linked to fields
- Social buttons labeled

## Error States

### Form Validation Errors

```tsx
"use client";

import { useFormState } from "react-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface FormState {
  error?: string;
  fieldErrors?: Record<string, string[]>;
}

export function LoginForm() {
  const [state, formAction] = useFormState<FormState>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {/* Global Error */}
      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Email Field with Error */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <Input
          id="email"
          name="email"
          type="email"
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          aria-invalid={!!state.fieldErrors?.email}
          className={state.fieldErrors?.email ? "border-destructive" : ""}
        />
        {state.fieldErrors?.email && (
          <p id="email-error" className="text-sm text-destructive">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      {/* Password Field with Error */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <Input
          id="password"
          name="password"
          type="password"
          aria-describedby={state.fieldErrors?.password ? "password-error" : undefined}
          aria-invalid={!!state.fieldErrors?.password}
          className={state.fieldErrors?.password ? "border-destructive" : ""}
        />
        {state.fieldErrors?.password && (
          <p id="password-error" className="text-sm text-destructive">
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full">
        Sign In
      </Button>
    </form>
  );
}
```

### OAuth Error Handling

```tsx
// app/(auth)/login/page.tsx
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked: "This email is already registered with a different provider.",
  OAuthCallbackError: "Authentication failed. Please try again.",
  OAuthSignin: "Could not start the authentication process.",
  Verification: "The verification link has expired or is invalid.",
  Default: "An error occurred during authentication.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] || errorMessages.Default : null;

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <AuthForm mode="login" />
    </>
  );
}
```

### Rate Limiting Error

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock } from "lucide-react";

export function LoginFormWithRateLimit() {
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  const handleSubmit = async (formData: FormData) => {
    try {
      const result = await loginAction(formData);
      if (result.rateLimited) {
        setRateLimited(true);
        setRetryAfter(result.retryAfter);

        // Countdown timer
        const interval = setInterval(() => {
          setRetryAfter((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setRateLimited(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      {rateLimited && (
        <Alert variant="destructive">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Too many attempts. Please try again in {retryAfter} seconds.
          </AlertDescription>
        </Alert>
      )}

      {/* Form fields */}

      <Button type="submit" disabled={rateLimited} className="w-full">
        {rateLimited ? `Wait ${retryAfter}s` : "Sign In"}
      </Button>
    </form>
  );
}
```

### Session Error Boundary

```tsx
// app/(auth)/layout.tsx
import { ErrorBoundary } from "react-error-boundary";

function AuthErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-xl font-semibold">Authentication Error</h1>
        <p className="text-muted-foreground">
          {error.message || "Something went wrong with authentication."}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={resetErrorBoundary}>Try Again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <ErrorBoundary FallbackComponent={AuthErrorFallback}>
      {/* Layout content */}
    </ErrorBoundary>
  );
}
```

## Loading States

### Auth Form Loading

```tsx
"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing in...
        </>
      ) : (
        "Sign In"
      )}
    </Button>
  );
}
```

### OAuth Provider Loading

```tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

const providers = [
  { id: "google", name: "Google", icon: GoogleIcon },
  { id: "github", name: "GitHub", icon: GithubIcon },
];

export function OAuthButtons() {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthSignIn = async (providerId: string) => {
    setLoadingProvider(providerId);
    try {
      await signIn(providerId, { callbackUrl: "/dashboard" });
    } catch (error) {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="space-y-2">
      {providers.map((provider) => (
        <Button
          key={provider.id}
          variant="outline"
          className="w-full"
          disabled={!!loadingProvider}
          onClick={() => handleOAuthSignIn(provider.id)}
        >
          {loadingProvider === provider.id ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <provider.icon className="mr-2 h-4 w-4" />
          )}
          Continue with {provider.name}
        </Button>
      ))}
    </div>
  );
}
```

### Full Page Loading State

```tsx
// app/(auth)/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex">
      {/* Branding Panel Skeleton (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary" />

      {/* Form Panel */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden p-4">
          <Skeleton className="h-8 w-32" />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            {/* Title */}
            <div className="text-center space-y-2">
              <Skeleton className="h-8 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <Skeleton className="h-px flex-1" />
              <Skeleton className="h-4 w-8" />
              <Skeleton className="h-px flex-1" />
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Submit Button */}
            <Skeleton className="h-10 w-full" />

            {/* Footer Link */}
            <Skeleton className="h-4 w-48 mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Password Strength Indicator

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

function getPasswordStrength(password: string): number {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;
  return strength;
}

export function PasswordInput() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const strength = getPasswordStrength(password);

  return (
    <div className="space-y-2">
      <Input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
      />

      {/* Strength Indicator */}
      {password && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "h-1 flex-1 rounded-full transition-colors",
                  level <= strength
                    ? strength <= 1
                      ? "bg-red-500"
                      : strength <= 2
                        ? "bg-yellow-500"
                        : strength <= 3
                          ? "bg-blue-500"
                          : "bg-green-500"
                    : "bg-muted"
                )}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {strength <= 1 && "Weak"}
            {strength === 2 && "Fair"}
            {strength === 3 && "Good"}
            {strength === 4 && "Strong"}
          </p>
        </div>
      )}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Layout Breakdown

| Breakpoint | Layout Changes |
|------------|----------------|
| `< 1024px` (mobile/tablet) | Full-width form, no branding panel, mobile header |
| `>= 1024px` (desktop) | Split layout with branding panel and form |

### Mobile-First Implementation

```tsx
// app/(auth)/layout.tsx
export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Branding Panel - Desktop only */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="relative z-10 flex flex-col justify-between p-8 lg:p-12 text-primary-foreground">
          <Logo />
          <Testimonial />
          <TrustBadges />
        </div>
      </div>

      {/* Form Panel - Full width on mobile, half on desktop */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Mobile Header - Shows only on mobile/tablet */}
        <header className="lg:hidden p-4 sm:p-6 flex justify-between items-center border-b">
          <Link href="/" className="flex items-center gap-2">
            <Logo size="sm" />
            <span className="font-bold">Acme Inc</span>
          </Link>
          <ThemeToggle />
        </header>

        {/* Main Content - Centered vertically */}
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-sm sm:max-w-md space-y-6 sm:space-y-8">
            {children}
          </div>
        </main>

        {/* Footer - Sticky on mobile */}
        <footer className="p-4 sm:p-6 text-center text-xs sm:text-sm text-muted-foreground border-t lg:border-0">
          <p>
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline">Terms</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline">Privacy Policy</Link>.
          </p>
        </footer>
      </div>
    </div>
  );
}
```

### Responsive Form Components

```tsx
// components/auth/auth-form.tsx
export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  return (
    <div className="space-y-6">
      {/* Header - Responsive text sizes */}
      <div className="text-center space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          {mode === "login"
            ? "Enter your credentials to access your account"
            : "Get started with your free account today"}
        </p>
      </div>

      {/* OAuth Buttons - Full width, stacked */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <Button variant="outline" className="h-10 sm:h-11">
          <GoogleIcon className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" className="h-10 sm:h-11">
          <GithubIcon className="mr-2 h-4 w-4" />
          GitHub
        </Button>
      </div>

      {/* Divider */}
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

      {/* Form - Responsive spacing */}
      <form className="space-y-3 sm:space-y-4">
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            placeholder="you@example.com"
            className="h-10 sm:h-11"
          />
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Password</label>
            {mode === "login" && (
              <Link
                href="/forgot-password"
                className="text-xs sm:text-sm text-primary hover:underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          <Input type="password" className="h-10 sm:h-11" />
        </div>

        <Button type="submit" className="w-full h-10 sm:h-11">
          {mode === "login" ? "Sign In" : "Create Account"}
        </Button>
      </form>

      {/* Footer Link */}
      <p className="text-center text-sm text-muted-foreground">
        {mode === "login" ? (
          <>
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
```

### Touch-Friendly Mobile Inputs

```tsx
// Mobile-optimized input fields
<Input
  type="email"
  inputMode="email"
  autoComplete="email"
  autoCapitalize="none"
  autoCorrect="off"
  className="h-12 text-base" // Larger touch target, prevents iOS zoom
/>

<Input
  type="password"
  autoComplete={mode === "login" ? "current-password" : "new-password"}
  className="h-12 text-base"
/>

// Mobile keyboard optimizations
<Input
  type="tel"
  inputMode="tel"
  autoComplete="tel"
  className="h-12 text-base"
/>
```

### Responsive Background Variations

```tsx
// Mobile-friendly animated background
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen relative">
      {/* Background - Simplified on mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Decorative elements - Hidden on mobile for performance */}
      <div className="hidden sm:block absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 bg-primary/20 rounded-full blur-3xl" />
      <div className="hidden sm:block absolute bottom-1/4 right-1/4 w-48 md:w-96 h-48 md:h-96 bg-secondary/20 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-background/80 backdrop-blur-lg rounded-lg sm:rounded-xl p-6 sm:p-8 border shadow-lg">
          {children}
        </div>
      </div>
    </div>
  );
}
```

## Route Group Structure

```
app/
├── (auth)/
│   ├── layout.tsx            # Auth layout
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── reset-password/
│   │   └── page.tsx
│   └── verify/
│       └── page.tsx
```

## Related Skills

### Composes Into
- [organisms/auth-form](../organisms/auth-form.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Split layout with branding
- Mobile-first design
- Multiple page variants
