---
id: pt-social-auth
name: Social Authentication
version: 2.0.0
layer: L5
category: data
description: Social login with Google, GitHub, Facebook, Twitter, and Apple
tags: [auth, oauth, social-login, google, github, facebook, twitter, apple]
composes: []
formula: "SocialAuth = NextAuthConfig + OAuthProviders + SessionCallbacks + ProtectedRoutes"
dependencies:
  - react
  - next
  - next-auth
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
performance:
  impact: low
  lcp: low
  cls: neutral
---

# Social Authentication

## Overview

Implement social authentication using NextAuth.js with support for multiple providers including Google, GitHub, Facebook, Twitter/X, and Apple Sign-In.

## When to Use

- Reducing friction in user registration flow
- Building B2C applications with consumer logins
- Integrating with developer platforms (GitHub)
- Enterprise SSO requirements (Google Workspace)
- Cross-platform authentication needs

## Composition Diagram

```
[Sign In Page] --> [Social Login Buttons]
                          |
            +-------------+-------------+
            |      |      |      |      |
        [Google][GitHub][FB][Twitter][Apple]
            |      |      |      |      |
            +-------------+-------------+
                          |
                  [NextAuth Handler]
                          |
            +-------------+-------------+
            |             |             |
      [OAuth Flow]  [JWT Token]   [Session]
            |             |             |
      [User Info]   [Callbacks]   [Cookies]
                          |
                  [Prisma Adapter]
                          |
                  [User Database]
```

## Implementation

### NextAuth Configuration

```tsx
// lib/auth/config.ts
import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import AppleProvider from 'next-auth/providers/apple';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'read:user user:email',
        },
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: '2.0',
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
    newUser: '/auth/new-user',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Custom sign-in logic
      if (account?.provider === 'google') {
        // Verify email domain for enterprise
        // const email = user.email;
        // if (!email?.endsWith('@company.com')) {
        //   return false;
        // }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.provider = account.provider;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.accessToken = token.accessToken as string;
        session.provider = token.provider as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (isNewUser) {
        // Track new user signup
        console.log('New user signed up:', user.email);
      }
    },
    async linkAccount({ user, account }) {
      console.log('Account linked:', account.provider, 'to user:', user.id);
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === 'development',
};
```

### Auth Types Extension

```tsx
// types/next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth';
import { JWT, DefaultJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession['user'];
    accessToken?: string;
    provider?: string;
  }

  interface User extends DefaultUser {
    id: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    refreshToken?: string;
    provider?: string;
    userId?: string;
  }
}
```

### Auth API Route

```tsx
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth/config';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Social Login Buttons

```tsx
// components/auth/social-login-buttons.tsx
'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface SocialProvider {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
}

const providers: SocialProvider[] = [
  {
    id: 'google',
    name: 'Google',
    icon: (
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="currentColor"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="currentColor"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="currentColor"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    ),
    color: 'bg-white text-gray-700 border border-gray-300',
    hoverColor: 'hover:bg-gray-50',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    color: 'bg-gray-900 text-white',
    hoverColor: 'hover:bg-gray-800',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: 'bg-[#1877F2] text-white',
    hoverColor: 'hover:bg-[#166FE5]',
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: 'bg-black text-white',
    hoverColor: 'hover:bg-gray-900',
  },
  {
    id: 'apple',
    name: 'Apple',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
      </svg>
    ),
    color: 'bg-black text-white',
    hoverColor: 'hover:bg-gray-900',
  },
];

interface SocialLoginButtonsProps {
  providers?: string[];
  callbackUrl?: string;
  showLabels?: boolean;
  layout?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
}

export function SocialLoginButtons({
  providers: enabledProviders = ['google', 'github'],
  callbackUrl = '/',
  showLabels = true,
  layout = 'vertical',
  size = 'md',
}: SocialLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleSignIn = async (providerId: string) => {
    setLoadingProvider(providerId);
    try {
      await signIn(providerId, { callbackUrl });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setLoadingProvider(null);
    }
  };

  const filteredProviders = providers.filter((p) => enabledProviders.includes(p.id));

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5',
    lg: 'px-5 py-3 text-lg',
  };

  return (
    <div
      className={`flex gap-3 ${layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col'}`}
    >
      {filteredProviders.map((provider) => (
        <button
          key={provider.id}
          onClick={() => handleSignIn(provider.id)}
          disabled={loadingProvider !== null}
          className={`
            flex items-center justify-center gap-2 rounded-lg font-medium
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            ${provider.color} ${provider.hoverColor}
            ${sizeClasses[size]}
            ${layout === 'horizontal' && !showLabels ? 'flex-1 min-w-[48px]' : 'w-full'}
          `}
        >
          {loadingProvider === provider.id ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            provider.icon
          )}
          {showLabels && (
            <span>Continue with {provider.name}</span>
          )}
        </button>
      ))}
    </div>
  );
}
```

### Auth Provider Wrapper

```tsx
// components/auth/auth-provider.tsx
'use client';

import { SessionProvider } from 'next-auth/react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

### Sign In Page

```tsx
// app/auth/signin/page.tsx
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/config';
import { SocialLoginButtons } from '@/components/auth/social-login-buttons';

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getServerSession(authOptions);
  const { callbackUrl, error } = await searchParams;

  if (session) {
    redirect(callbackUrl || '/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {getErrorMessage(error)}
          </div>
        )}

        <div className="bg-white p-8 rounded-xl shadow-sm border">
          <SocialLoginButtons
            providers={['google', 'github', 'facebook', 'twitter', 'apple']}
            callbackUrl={callbackUrl || '/'}
          />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email sign in form can go here */}
          <form className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              Sign in with Email
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <a href="/auth/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}

function getErrorMessage(error: string): string {
  const errors: Record<string, string> = {
    OAuthSignin: 'Error starting the sign in process.',
    OAuthCallback: 'Error during the sign in process.',
    OAuthCreateAccount: 'Could not create user account.',
    EmailCreateAccount: 'Could not create user account.',
    Callback: 'Error during the sign in process.',
    OAuthAccountNotLinked: 'This email is already associated with another account.',
    EmailSignin: 'Error sending the verification email.',
    CredentialsSignin: 'Invalid credentials.',
    SessionRequired: 'Please sign in to access this page.',
    default: 'An error occurred during sign in.',
  };

  return errors[error] || errors.default;
}
```

### Protected Route Component

```tsx
// components/auth/protected-route.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
```

### User Menu Component

```tsx
// components/auth/user-menu.tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) {
    return (
      <Link
        href="/auth/signin"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Sign In
      </Link>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          )}
          <span className="text-sm font-medium hidden sm:block">
            {session.user.name?.split(' ')[0]}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[200px] bg-white rounded-lg shadow-lg border p-1 z-50"
          sideOffset={5}
          align="end"
        >
          <div className="px-3 py-2 border-b mb-1">
            <p className="font-medium text-sm">{session.user.name}</p>
            <p className="text-xs text-gray-500">{session.user.email}</p>
          </div>

          <DropdownMenu.Item asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

          <DropdownMenu.Item
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer text-red-600"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
```

## Usage

```tsx
// app/layout.tsx
import { AuthProvider } from '@/components/auth/auth-provider';
import { UserMenu } from '@/components/auth/user-menu';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <nav className="flex justify-between items-center p-4 border-b">
            <a href="/" className="text-xl font-bold">Logo</a>
            <UserMenu />
          </nav>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

```tsx
// app/dashboard/page.tsx
import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="p-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p>This content is only visible to authenticated users.</p>
      </div>
    </ProtectedRoute>
  );
}
```

## Related Skills

- [[session-management]] - Session handling
- [[magic-links]] - Email authentication
- [[two-factor]] - 2FA implementation
- [[rbac]] - Role-based access control

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Google, GitHub, Facebook, Twitter, Apple providers
- Social login buttons component
- User menu with sign out
- Protected route wrapper
