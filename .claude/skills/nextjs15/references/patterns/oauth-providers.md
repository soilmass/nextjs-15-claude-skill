---
id: pt-oauth-providers
name: OAuth Providers
version: 2.0.0
layer: L5
category: auth
description: Configure social login with OAuth providers using NextAuth.js v5
tags: [auth, oauth, social-login, google, github, next15, react19]
composes: []
dependencies: []
formula: "OAuthLogin = ProviderButtons (Google + GitHub + ...) + Callbacks (signIn + jwt + session) + AccountLinking"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# OAuth Providers

## When to Use

- For "Sign in with Google/GitHub/etc." functionality
- To reduce friction in user registration
- When you want to delegate authentication to trusted providers
- For applications targeting developer audiences (GitHub)
- When enterprise customers need Google Workspace integration

## Composition Diagram

```
OAuth Provider Setup
====================

Provider Buttons:
+------------------------------------------+
|  [G] Continue with Google                |
|  [GH] Continue with GitHub               |
|  [D] Continue with Discord               |
+------------------------------------------+

OAuth Flow:
[Click Button] -> [Redirect to Provider] -> [User Authorizes]
                                                   |
                                                   v
[Session Created] <- [Callback Processed] <- [Redirect Back]

Account Linking UI:
+------------------------------------------+
|  Linked Accounts                         |
|  +------------------------------------+  |
|  | [G] Google     user@gmail.com [x] |  |
|  +------------------------------------+  |
|  | [GH] GitHub    (Not linked)  [+]  |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Overview

OAuth providers enable "Sign in with Google/GitHub/etc." functionality. NextAuth.js v5 (Auth.js) simplifies OAuth integration with built-in providers. This pattern covers configuration, custom providers, and account linking.

## Basic OAuth Setup

```typescript
// auth.ts
import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import Discord from 'next-auth/providers/discord';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Request additional scopes
      authorization: {
        params: {
          scope: 'openid email profile',
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
    async jwt({ token, user, account, profile }) {
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
});

// types/next-auth.d.ts
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession['user'];
    accessToken?: string;
  }
}
```

## Route Handlers

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

## Sign In Buttons

```typescript
// components/auth/oauth-buttons.tsx
'use client';

import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useState } from 'react';

interface OAuthButtonsProps {
  callbackUrl?: string;
}

export function OAuthButtons({ callbackUrl = '/dashboard' }: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleSignIn = async (provider: string) => {
    setIsLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch (error) {
      console.error('Sign in error:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="grid gap-2">
      <Button
        variant="outline"
        onClick={() => handleSignIn('google')}
        disabled={isLoading !== null}
      >
        {isLoading === 'google' ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}
        Continue with Google
      </Button>

      <Button
        variant="outline"
        onClick={() => handleSignIn('github')}
        disabled={isLoading !== null}
      >
        {isLoading === 'github' ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.gitHub className="mr-2 h-4 w-4" />
        )}
        Continue with GitHub
      </Button>

      <Button
        variant="outline"
        onClick={() => handleSignIn('discord')}
        disabled={isLoading !== null}
      >
        {isLoading === 'discord' ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.discord className="mr-2 h-4 w-4" />
        )}
        Continue with Discord
      </Button>
    </div>
  );
}

// Server Component version
// components/auth/oauth-form.tsx
import { signIn } from '@/auth';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

export function OAuthForm() {
  return (
    <div className="grid gap-2">
      <form
        action={async () => {
          'use server';
          await signIn('google', { redirectTo: '/dashboard' });
        }}
      >
        <Button variant="outline" className="w-full" type="submit">
          <Icons.google className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>
      </form>

      <form
        action={async () => {
          'use server';
          await signIn('github', { redirectTo: '/dashboard' });
        }}
      >
        <Button variant="outline" className="w-full" type="submit">
          <Icons.gitHub className="mr-2 h-4 w-4" />
          Continue with GitHub
        </Button>
      </form>
    </div>
  );
}
```

## Account Linking

```typescript
// auth.ts
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/db';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [/* ... */],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account) return false;

      // Check if this OAuth account is already linked
      const existingAccount = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: account.provider,
            providerAccountId: account.providerAccountId,
          },
        },
      });

      if (existingAccount) {
        return true; // Account exists, allow sign in
      }

      // Check if user with this email exists
      const email = user.email || profile?.email;
      if (email) {
        const existingUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (existingUser) {
          // Link this OAuth account to existing user
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
            },
          });

          // Update user if needed
          user.id = existingUser.id;
          return true;
        }
      }

      // New user, allow normal flow
      return true;
    },
  },
});

// components/settings/linked-accounts.tsx
'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { unlinkAccount } from '@/app/actions/auth';
import { Icons } from '@/components/icons';

interface LinkedAccount {
  provider: string;
  providerAccountId: string;
}

interface LinkedAccountsProps {
  accounts: LinkedAccount[];
}

export function LinkedAccounts({ accounts }: LinkedAccountsProps) {
  const { data: session } = useSession();

  const providers = [
    { id: 'google', name: 'Google', icon: Icons.google },
    { id: 'github', name: 'GitHub', icon: Icons.gitHub },
    { id: 'discord', name: 'Discord', icon: Icons.discord },
  ];

  const isLinked = (providerId: string) =>
    accounts.some((a) => a.provider === providerId);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Linked Accounts</h3>
      <div className="space-y-2">
        {providers.map((provider) => {
          const linked = isLinked(provider.id);
          const Icon = provider.icon;

          return (
            <div
              key={provider.id}
              className="flex items-center justify-between p-3 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                <span>{provider.name}</span>
              </div>

              {linked ? (
                <form action={unlinkAccount.bind(null, provider.id)}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={accounts.length === 1}
                  >
                    Unlink
                  </Button>
                </form>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signIn(provider.id)}
                >
                  Link
                </Button>
              )}
            </div>
          );
        })}
      </div>
      {accounts.length === 1 && (
        <p className="text-sm text-muted-foreground">
          You must have at least one linked account or password.
        </p>
      )}
    </div>
  );
}
```

## Custom OAuth Provider

```typescript
// lib/auth/custom-provider.ts
import type { OAuthConfig } from 'next-auth/providers';

interface CustomProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

export function CustomOAuthProvider(): OAuthConfig<CustomProfile> {
  return {
    id: 'custom',
    name: 'Custom Provider',
    type: 'oauth',
    authorization: {
      url: 'https://provider.example.com/oauth/authorize',
      params: { scope: 'openid email profile' },
    },
    token: 'https://provider.example.com/oauth/token',
    userinfo: 'https://provider.example.com/api/user',
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        image: profile.avatar_url,
      };
    },
    clientId: process.env.CUSTOM_CLIENT_ID!,
    clientSecret: process.env.CUSTOM_CLIENT_SECRET!,
  };
}

// auth.ts
import { CustomOAuthProvider } from '@/lib/auth/custom-provider';

export const { handlers, auth } = NextAuth({
  providers: [
    Google({ /* ... */ }),
    CustomOAuthProvider(),
  ],
});
```

## OAuth with Additional Data

```typescript
// auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      // Request additional scopes
      authorization: {
        params: { scope: 'read:user user:email repo' },
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'github' && account.access_token) {
        // Fetch additional data from GitHub
        const repos = await fetch('https://api.github.com/user/repos', {
          headers: { Authorization: `Bearer ${account.access_token}` },
        }).then((r) => r.json());

        // Store in database
        await prisma.user.update({
          where: { id: user.id },
          data: {
            githubRepoCount: repos.length,
            githubUsername: (profile as any).login,
          },
        });
      }
      return true;
    },
  },
});
```

## Error Handling

```typescript
// app/auth/error/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams;
  const error = params.error;

  const errorMessages: Record<string, string> = {
    Configuration: 'There is a problem with the server configuration.',
    AccessDenied: 'You do not have permission to sign in.',
    Verification: 'The verification link has expired or has already been used.',
    OAuthSignin: 'Error starting the OAuth sign in flow.',
    OAuthCallback: 'Error in the OAuth callback handler.',
    OAuthCreateAccount: 'Could not create OAuth provider account.',
    EmailCreateAccount: 'Could not create email provider account.',
    Callback: 'Error in the OAuth callback handler.',
    OAuthAccountNotLinked:
      'This email is already associated with another account. Please sign in with your original method.',
    Default: 'An unexpected error occurred.',
  };

  const message = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="text-muted-foreground">{message}</p>
        <Button asChild>
          <Link href="/login">Try Again</Link>
        </Button>
      </div>
    </div>
  );
}
```

## Anti-patterns

### Don't Store Tokens Insecurely

```typescript
// BAD - Storing tokens in localStorage
localStorage.setItem('accessToken', token);

// GOOD - Let NextAuth handle token storage securely
// Tokens are stored in HTTP-only cookies or database
```

### Don't Skip Email Verification

```typescript
// BAD - Trust OAuth email without verification
async signIn({ user, account, profile }) {
  return true; // Accepts any email
}

// GOOD - Verify email is from OAuth provider
async signIn({ user, account, profile }) {
  // GitHub doesn't always provide verified email
  if (account?.provider === 'github') {
    const emails = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${account.access_token}` },
    }).then(r => r.json());
    
    const verified = emails.find((e: any) => e.verified && e.primary);
    if (!verified) return false;
  }
  return true;
}
```

## Related Skills

- [next-auth](./next-auth.md)
- [session-management](./session-management.md)
- [magic-links](./magic-links.md)

---

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Multi-provider setup
- Account linking
- Custom providers
- Error handling
