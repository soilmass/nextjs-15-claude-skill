---
id: pt-jwt-tokens
name: JWT Tokens
version: 2.0.0
layer: L5
category: auth
description: JWT token management for stateless authentication with access and refresh token patterns
tags: [jwt, tokens, auth, stateless, refresh-token, authentication]
composes: []
dependencies: []
formula: "JWTAuth = AccessToken (short-lived) + RefreshToken (long-lived) + Rotation + Middleware"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# JWT Tokens

## When to Use

- For stateless authentication (no server-side session storage)
- When building APIs consumed by multiple clients
- For microservices architectures requiring token verification
- When you need to embed user claims in the token
- For applications with distributed backends

## Composition Diagram

```
JWT Token Architecture
======================

Token Pair:
+-------------------+     +--------------------+
|   Access Token    |     |   Refresh Token    |
|  - userId         |     |  - userId          |
|  - email          |     |  - tokenFamily     |
|  - role           |     |  - 7 day expiry    |
|  - 15 min expiry  |     |                    |
+-------------------+     +--------------------+
         |                         |
         v                         v
+------------------------------------------+
|           HTTP-only Cookies              |
|  auth-token (15m)  refresh-token (7d)    |
+------------------------------------------+

Refresh Flow:
[Request] -> [Access Expired?] -> [Use Refresh] -> [New Pair] -> [Respond]
                 |                                      |
                 v (valid)                              v
              [Process Request]                [Invalidate Old Refresh]
```

Implement stateless authentication with JWT access and refresh tokens.

## Overview

This pattern covers:
- JWT token generation and validation
- Access and refresh token patterns
- Token rotation and revocation
- Secure cookie storage
- Token refresh middleware
- API authentication
- Security best practices

## Implementation

### Installation

```bash
npm install jose
```

### Token Configuration

```typescript
// lib/auth/jwt/config.ts
export const JWT_CONFIG = {
  // Access token (short-lived)
  access: {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresIn: '15m', // 15 minutes
    algorithm: 'HS256' as const,
  },
  // Refresh token (long-lived)
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET!,
    expiresIn: '7d', // 7 days
    algorithm: 'HS256' as const,
  },
  // Cookie settings
  cookies: {
    accessToken: {
      name: 'access_token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: 15 * 60, // 15 minutes in seconds
    },
    refreshToken: {
      name: 'refresh_token',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/api/auth', // Only sent to auth endpoints
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    },
  },
};

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  iat: number;
  exp: number;
  jti?: string; // Token ID for revocation
}

export interface RefreshTokenPayload {
  sub: string;
  family: string; // Token family for rotation detection
  iat: number;
  exp: number;
  jti: string;
}
```

### Token Service

```typescript
// lib/auth/jwt/token-service.ts
import { SignJWT, jwtVerify, JWTVerifyResult } from 'jose';
import { v4 as uuidv4 } from 'uuid';
import { JWT_CONFIG, type JWTPayload, type RefreshTokenPayload } from './config';
import { prisma } from '@/lib/prisma';

// Convert secret to Uint8Array
function getSecretKey(secret: string): Uint8Array {
  return new TextEncoder().encode(secret);
}

/**
 * Generate access token
 */
export async function generateAccessToken(user: {
  id: string;
  email: string;
  role: string;
}): Promise<string> {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };

  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: JWT_CONFIG.access.algorithm })
    .setIssuedAt()
    .setExpirationTime(JWT_CONFIG.access.expiresIn)
    .sign(getSecretKey(JWT_CONFIG.access.secret));
}

/**
 * Generate refresh token
 */
export async function generateRefreshToken(
  userId: string,
  family?: string
): Promise<{ token: string; jti: string; family: string }> {
  const jti = uuidv4();
  const tokenFamily = family || uuidv4();

  const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
    sub: userId,
    family: tokenFamily,
    jti,
  };

  const token = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: JWT_CONFIG.refresh.algorithm })
    .setIssuedAt()
    .setExpirationTime(JWT_CONFIG.refresh.expiresIn)
    .sign(getSecretKey(JWT_CONFIG.refresh.secret));

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      id: jti,
      userId,
      family: tokenFamily,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return { token, jti, family: tokenFamily };
}

/**
 * Verify access token
 */
export async function verifyAccessToken(
  token: string
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      getSecretKey(JWT_CONFIG.access.secret),
      { algorithms: [JWT_CONFIG.access.algorithm] }
    );

    return payload as unknown as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      getSecretKey(JWT_CONFIG.refresh.secret),
      { algorithms: [JWT_CONFIG.refresh.algorithm] }
    );

    return payload as unknown as RefreshTokenPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Refresh tokens with rotation
 */
export async function refreshTokens(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
} | null> {
  const payload = await verifyRefreshToken(refreshToken);
  
  if (!payload) {
    return null;
  }

  // Check if token exists and is valid
  const storedToken = await prisma.refreshToken.findUnique({
    where: { id: payload.jti },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt) {
    // Token reuse detected - revoke entire family
    if (payload.family) {
      await revokeTokenFamily(payload.family);
    }
    return null;
  }

  if (storedToken.expiresAt < new Date()) {
    return null;
  }

  // Revoke current refresh token
  await prisma.refreshToken.update({
    where: { id: payload.jti },
    data: { revokedAt: new Date() },
  });

  // Generate new tokens
  const [accessToken, newRefreshToken] = await Promise.all([
    generateAccessToken({
      id: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.role,
    }),
    generateRefreshToken(storedToken.userId, payload.family),
  ]);

  return {
    accessToken,
    refreshToken: newRefreshToken.token,
  };
}

/**
 * Revoke all tokens in a family (for logout or security)
 */
export async function revokeTokenFamily(family: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { family },
    data: { revokedAt: new Date() },
  });
}

/**
 * Revoke all user tokens (for password change, etc.)
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revokedAt: new Date() },
  });
}

/**
 * Clean up expired tokens (run periodically)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { revokedAt: { not: null } },
      ],
    },
  });

  return result.count;
}
```

### Database Schema

```prisma
// prisma/schema.prisma additions
model RefreshToken {
  id        String    @id // JWT ID (jti)
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  family    String    // Token family for rotation detection
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())

  @@index([userId])
  @@index([family])
  @@index([expiresAt])
}
```

### Cookie Utilities

```typescript
// lib/auth/jwt/cookies.ts
import { cookies } from 'next/headers';
import { JWT_CONFIG } from './config';

export async function setAuthCookies(
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies();

  cookieStore.set(
    JWT_CONFIG.cookies.accessToken.name,
    accessToken,
    JWT_CONFIG.cookies.accessToken
  );

  cookieStore.set(
    JWT_CONFIG.cookies.refreshToken.name,
    refreshToken,
    JWT_CONFIG.cookies.refreshToken
  );
}

export async function getAuthCookies() {
  const cookieStore = await cookies();

  return {
    accessToken: cookieStore.get(JWT_CONFIG.cookies.accessToken.name)?.value,
    refreshToken: cookieStore.get(JWT_CONFIG.cookies.refreshToken.name)?.value,
  };
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(JWT_CONFIG.cookies.accessToken.name);
  cookieStore.delete(JWT_CONFIG.cookies.refreshToken.name);
}
```

### Auth Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { JWT_CONFIG } from '@/lib/auth/jwt/config';

const PROTECTED_ROUTES = ['/dashboard', '/api/protected'];
const AUTH_ROUTES = ['/auth/login', '/auth/register'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const accessToken = request.cookies.get(JWT_CONFIG.cookies.accessToken.name)?.value;
  const refreshToken = request.cookies.get(JWT_CONFIG.cookies.refreshToken.name)?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => path.startsWith(route));
  const isAuthRoute = AUTH_ROUTES.some((route) => path.startsWith(route));

  // Try to verify access token
  let isAuthenticated = false;
  let needsRefresh = false;

  if (accessToken) {
    try {
      await jwtVerify(
        accessToken,
        new TextEncoder().encode(JWT_CONFIG.access.secret)
      );
      isAuthenticated = true;
    } catch {
      // Access token expired or invalid
      needsRefresh = !!refreshToken;
    }
  }

  // Handle token refresh
  if (needsRefresh && refreshToken) {
    const refreshResponse = await fetch(
      `${request.nextUrl.origin}/api/auth/refresh`,
      {
        method: 'POST',
        headers: {
          Cookie: `${JWT_CONFIG.cookies.refreshToken.name}=${refreshToken}`,
        },
      }
    );

    if (refreshResponse.ok) {
      const response = NextResponse.next();
      
      // Forward Set-Cookie headers from refresh response
      const setCookieHeader = refreshResponse.headers.get('set-cookie');
      if (setCookieHeader) {
        response.headers.set('set-cookie', setCookieHeader);
      }
      
      isAuthenticated = true;
      return response;
    }
  }

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/protected/:path*', '/auth/:path*'],
};
```

### Auth API Routes

```typescript
// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateAccessToken, generateRefreshToken } from '@/lib/auth/jwt/token-service';
import { setAuthCookies } from '@/lib/auth/jwt/cookies';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate tokens
    const [accessToken, refreshTokenData] = await Promise.all([
      generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      }),
      generateRefreshToken(user.id),
    ]);

    // Set cookies
    await setAuthCookies(accessToken, refreshTokenData.token);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }
    
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// app/api/auth/refresh/route.ts
import { NextResponse } from 'next/server';
import { refreshTokens } from '@/lib/auth/jwt/token-service';
import { getAuthCookies, setAuthCookies, clearAuthCookies } from '@/lib/auth/jwt/cookies';

export async function POST() {
  const { refreshToken } = await getAuthCookies();

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'No refresh token' },
      { status: 401 }
    );
  }

  const tokens = await refreshTokens(refreshToken);

  if (!tokens) {
    await clearAuthCookies();
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    );
  }

  await setAuthCookies(tokens.accessToken, tokens.refreshToken);

  return NextResponse.json({ success: true });
}

// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { verifyRefreshToken, revokeTokenFamily } from '@/lib/auth/jwt/token-service';
import { getAuthCookies, clearAuthCookies } from '@/lib/auth/jwt/cookies';

export async function POST() {
  const { refreshToken } = await getAuthCookies();

  if (refreshToken) {
    const payload = await verifyRefreshToken(refreshToken);
    if (payload?.family) {
      await revokeTokenFamily(payload.family);
    }
  }

  await clearAuthCookies();

  return NextResponse.json({ success: true });
}

// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt/token-service';
import { getAuthCookies } from '@/lib/auth/jwt/cookies';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const { accessToken } = await getAuthCookies();

  if (!accessToken) {
    return NextResponse.json(
      { error: 'Not authenticated' },
      { status: 401 }
    );
  }

  const payload = await verifyAccessToken(accessToken);

  if (!payload) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({ user });
}
```

### Auth Hook for Client

```typescript
// hooks/use-auth.ts
'use client';

import { create } from 'zustand';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const { user } = await response.json();
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null, isAuthenticated: false });
  },

  refresh: async () => {
    try {
      const response = await fetch('/api/auth/me');
      
      if (response.ok) {
        const { user } = await response.json();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    store.refresh();
  }, []);

  const login = async (email: string, password: string) => {
    await store.login(email, password);
    router.push('/dashboard');
  };

  const logout = async () => {
    await store.logout();
    router.push('/auth/login');
  };

  return {
    user: store.user,
    isLoading: store.isLoading,
    isAuthenticated: store.isAuthenticated,
    login,
    logout,
  };
}
```

## Variants

### API Key + JWT Hybrid

```typescript
// For API clients that need both API keys and JWT
export async function authenticateApiRequest(request: Request) {
  const apiKey = request.headers.get('x-api-key');
  const authHeader = request.headers.get('authorization');

  if (apiKey) {
    // Validate API key
    const key = await prisma.apiKey.findUnique({
      where: { key: hashApiKey(apiKey) },
      include: { user: true },
    });
    
    if (key && !key.revokedAt) {
      return { user: key.user, method: 'api-key' };
    }
  }

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const payload = await verifyAccessToken(token);
    
    if (payload) {
      const user = await prisma.user.findUnique({
        where: { id: payload.sub },
      });
      
      if (user) {
        return { user, method: 'jwt' };
      }
    }
  }

  return null;
}
```

## Anti-patterns

1. **Long-lived access tokens** - Access tokens should be short-lived (15 min)
2. **Storing tokens in localStorage** - Use httpOnly cookies
3. **No token rotation** - Rotate refresh tokens on each use
4. **No family tracking** - Track token families for reuse detection
5. **Synchronous operations** - Use async/await for all token operations
6. **No revocation** - Implement token revocation for logout/security

## Related Skills

- [[next-auth]] - Higher-level auth library
- [[api-keys]] - API key authentication
- [[session-management]] - Server-side sessions
- [[security-headers]] - Security headers

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial JWT pattern with access/refresh tokens and rotation
