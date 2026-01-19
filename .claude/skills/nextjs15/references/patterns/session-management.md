---
id: pt-session-management
name: Session Management
version: 2.0.0
layer: L5
category: auth
description: JWT and database session strategies with refresh tokens and session validation
tags: [auth, sessions, jwt, tokens, cookies, next15]
composes: []
dependencies: []
formula: "SessionManagement = (JWT | DatabaseSession) + RefreshToken + Middleware + SessionProvider"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Session Management

## When to Use

- For every authenticated application
- When you need to persist user state across requests
- To manage authentication tokens securely
- When implementing remember me functionality
- For applications requiring session timeout handling

## Composition Diagram

```
Session Architecture
====================

JWT Strategy (Stateless):
+------------------+     +------------------+
|   Access Token   | --> |   Refresh Token  |
|   (15 min TTL)   |     |   (7 day TTL)    |
+------------------+     +------------------+
         |                       |
         v                       v
+------------------------------------------+
|              HTTP-only Cookies           |
+------------------------------------------+

Database Strategy (Stateful):
+------------------+     +------------------+
|   Session Cookie | --> |   Database Row   |
|   (Session ID)   |     |   (User + Data)  |
+------------------+     +------------------+

Token Refresh Flow:
[Access Expired] -> [Send Refresh] -> [Get New Access] -> [Continue]
```

## Overview

Session management determines how user authentication state is maintained across requests. Next.js 15 supports both JWT-based (stateless) and database-backed (stateful) sessions, each with different tradeoffs.

## JWT Sessions (Stateless)

```typescript
// lib/auth/jwt.ts
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  exp: number;
}

export async function createToken(payload: Omit<SessionPayload, "exp">) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m") // Short-lived access token
    .sign(secret);
}

export async function createRefreshToken(userId: string) {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // Long-lived refresh token
    .sign(secret);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access-token")?.value;
  
  if (!token) return null;
  
  return verifyToken(token);
}

export async function setSession(payload: Omit<SessionPayload, "exp">) {
  const cookieStore = await cookies();
  
  const accessToken = await createToken(payload);
  const refreshToken = await createRefreshToken(payload.userId);
  
  cookieStore.set("access-token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });
  
  cookieStore.set("refresh-token", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("access-token");
  cookieStore.delete("refresh-token");
}
```

## Database Sessions (Stateful)

```typescript
// lib/auth/db-session.ts
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { nanoid } from "nanoid";

const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days in seconds

export interface Session {
  id: string;
  userId: string;
  expiresAt: Date;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = nanoid(32);
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);

  await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set("session-id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });

  return sessionId;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session-id")?.value;

  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  if (!session) return null;

  // Check if expired
  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }

  return session;
}

export async function extendSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session-id")?.value;

  if (!sessionId) return;

  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);

  await prisma.session.update({
    where: { id: sessionId },
    data: { expiresAt },
  });

  cookieStore.set("session-id", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get("session-id")?.value;

  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }

  cookieStore.delete("session-id");
}

export async function deleteAllUserSessions(userId: string) {
  await prisma.session.deleteMany({ where: { userId } });
}
```

## Token Refresh Flow

```typescript
// app/api/auth/refresh/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken, createToken, createRefreshToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db";

export async function POST() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get("refresh-token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "No refresh token" }, { status: 401 });
  }

  try {
    const payload = await verifyToken(refreshToken);
    if (!payload?.userId) {
      throw new Error("Invalid token");
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, role: true, active: true },
    });

    if (!user || !user.active) {
      throw new Error("User not found or inactive");
    }

    // Create new tokens
    const newAccessToken = await createToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const newRefreshToken = await createRefreshToken(user.id);

    // Set new cookies
    cookieStore.set("access-token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    cookieStore.set("refresh-token", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch {
    // Clear invalid tokens
    cookieStore.delete("access-token");
    cookieStore.delete("refresh-token");
    return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
  }
}
```

## Client-Side Session Hook

```typescript
// hooks/use-session.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface Session {
  user: User;
  expiresAt: Date;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/session");
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      } else {
        setSession(null);
      }
    } catch {
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        await fetchSession();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [fetchSession]);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/login");
  }, [router]);

  useEffect(() => {
    fetchSession();

    // Refresh token before expiry
    const interval = setInterval(() => {
      if (session?.expiresAt) {
        const expiresIn = new Date(session.expiresAt).getTime() - Date.now();
        if (expiresIn < 60 * 1000) { // Less than 1 minute
          refresh();
        }
      }
    }, 30 * 1000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [fetchSession, refresh, session?.expiresAt]);

  return {
    session,
    user: session?.user ?? null,
    loading,
    authenticated: !!session,
    refresh,
    signOut,
  };
}
```

## Session Validation Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("access-token")?.value;
  const refreshToken = request.cookies.get("refresh-token")?.value;

  // Check access token
  if (accessToken) {
    const session = await verifyToken(accessToken);
    if (session) {
      // Valid session - proceed
      const response = NextResponse.next();
      response.headers.set("x-user-id", session.userId);
      return response;
    }
  }

  // Access token expired/invalid, try refresh
  if (refreshToken) {
    const refreshPayload = await verifyToken(refreshToken);
    if (refreshPayload?.userId) {
      // Redirect to refresh endpoint then back to original URL
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      refreshUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(refreshUrl);
    }
  }

  // No valid session - redirect to login for protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/dashboard");
  if (isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}
```

## Session Activity Tracking

```typescript
// lib/auth/activity.ts
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function trackActivity(userId: string) {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for") || "unknown";
  const userAgent = headersList.get("user-agent") || "unknown";

  await prisma.userActivity.create({
    data: {
      userId,
      ip,
      userAgent,
      timestamp: new Date(),
    },
  });
}

export async function getActiveSessions(userId: string) {
  return prisma.session.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      expiresAt: true,
      userAgent: true,
      ip: true,
    },
  });
}

export async function revokeSession(sessionId: string, userId: string) {
  // Ensure user owns the session
  const session = await prisma.session.findFirst({
    where: { id: sessionId, userId },
  });

  if (!session) {
    throw new Error("Session not found");
  }

  await prisma.session.delete({ where: { id: sessionId } });
}
```

## Session UI Component

```typescript
// components/settings/active-sessions.tsx
"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Smartphone, LogOut } from "lucide-react";
import { revokeSession } from "@/app/actions/auth";
import { toast } from "sonner";

interface Session {
  id: string;
  createdAt: string;
  expiresAt: string;
  userAgent: string;
  ip: string;
  current: boolean;
}

export function ActiveSessions({ sessions }: { sessions: Session[] }) {
  const [revoking, setRevoking] = useState<string | null>(null);

  const handleRevoke = async (sessionId: string) => {
    setRevoking(sessionId);
    try {
      await revokeSession(sessionId);
      toast.success("Session revoked");
    } catch {
      toast.error("Failed to revoke session");
    } finally {
      setRevoking(null);
    }
  };

  const getDeviceIcon = (userAgent: string) => {
    if (userAgent.includes("Mobile")) {
      return <Smartphone className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {getDeviceIcon(session.userAgent)}
              <div>
                <p className="font-medium">
                  {session.current ? "Current session" : session.userAgent}
                </p>
                <p className="text-sm text-muted-foreground">
                  {session.ip} • {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {!session.current && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleRevoke(session.id)}
                disabled={revoking === session.id}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
```

## Anti-patterns

### Don't Store Passwords in Session

```typescript
// BAD
session.user.password = hashedPassword;

// GOOD - Only store identifiers
session.user.id = user.id;
```

### Don't Use Long-Lived Access Tokens

```typescript
// BAD - 7 day access token
setExpirationTime("7d")

// GOOD - Short access, long refresh
const accessToken = "15m";
const refreshToken = "7d";
```

## Related Skills

- [next-auth](./next-auth.md)
- [auth-middleware](./auth-middleware.md)
- [rbac](./rbac.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- JWT and DB sessions
- Refresh token flow
- Activity tracking
