---
id: pt-rbac
name: Role-Based Access Control
version: 2.0.0
layer: L5
category: auth
description: Implement role-based permissions with hierarchical roles and resource-level access control
tags: [auth, rbac, permissions, roles, authorization, next15]
composes: []
dependencies:
  next-auth: "^5.0.0"
formula: "RBAC = Roles (hierarchy) + Permissions (granular) + Middleware (enforcement) + UI (gates)"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Role-Based Access Control (RBAC)

## When to Use

- When different users need different levels of access
- For applications with admin, moderator, and user roles
- When you need granular permission control
- For multi-tenant applications with organization roles
- When compliance requires audit trails on access

## Composition Diagram

```
RBAC Architecture
=================

+-------------------------------------------+
|              Permission Matrix            |
|  +-----+--------+-------+------+------+   |
|  | Role| user:* | post:*| admin| audit|   |
|  +-----+--------+-------+------+------+   |
|  |Admin|   [x]  |  [x]  |  [x] |  [x] |   |
|  +-----+--------+-------+------+------+   |
|  |Mod  |   [x]  |  [x]  |  [ ] |  [ ] |   |
|  +-----+--------+-------+------+------+   |
|  |User |   [ ]  |  [x]  |  [ ] |  [ ] |   |
|  +-----+--------+-------+------+------+   |
+-------------------------------------------+

Enforcement Points:
- Middleware (route protection)
- Server Actions (action guards)
- Components (permission gates)
- API Routes (permission checks)
```

## Overview

RBAC restricts system access based on user roles. This pattern implements hierarchical roles with granular permissions, supporting both route-level and resource-level access control in Next.js 15.

## Permission System

```typescript
// lib/auth/permissions.ts

// Define all permissions
export const PERMISSIONS = {
  // User permissions
  "user:read": "View user profiles",
  "user:write": "Edit user profiles",
  "user:delete": "Delete users",
  "user:manage": "Manage user roles",
  
  // Content permissions
  "post:read": "View posts",
  "post:create": "Create posts",
  "post:edit": "Edit own posts",
  "post:edit:any": "Edit any post",
  "post:delete": "Delete own posts",
  "post:delete:any": "Delete any post",
  "post:publish": "Publish posts",
  
  // Admin permissions
  "admin:access": "Access admin panel",
  "admin:settings": "Modify system settings",
  "admin:billing": "Manage billing",
  "admin:audit": "View audit logs",
} as const;

export type Permission = keyof typeof PERMISSIONS;

// Define roles with permissions
export const ROLES = {
  guest: {
    name: "Guest",
    permissions: ["post:read"] as Permission[],
  },
  user: {
    name: "User",
    permissions: [
      "user:read",
      "post:read",
      "post:create",
      "post:edit",
      "post:delete",
    ] as Permission[],
  },
  moderator: {
    name: "Moderator",
    permissions: [
      "user:read",
      "user:write",
      "post:read",
      "post:create",
      "post:edit",
      "post:edit:any",
      "post:delete",
      "post:delete:any",
      "post:publish",
    ] as Permission[],
  },
  admin: {
    name: "Admin",
    permissions: [
      "user:read",
      "user:write",
      "user:delete",
      "user:manage",
      "post:read",
      "post:create",
      "post:edit",
      "post:edit:any",
      "post:delete",
      "post:delete:any",
      "post:publish",
      "admin:access",
      "admin:settings",
      "admin:billing",
      "admin:audit",
    ] as Permission[],
  },
  superadmin: {
    name: "Super Admin",
    permissions: Object.keys(PERMISSIONS) as Permission[],
  },
} as const;

export type Role = keyof typeof ROLES;

// Permission checking utilities
export function hasPermission(role: Role, permission: Permission): boolean {
  const roleConfig = ROLES[role];
  return roleConfig?.permissions.includes(permission) ?? false;
}

export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

export function getRolePermissions(role: Role): Permission[] {
  return ROLES[role]?.permissions ?? [];
}
```

## Permission Hook

```typescript
// hooks/use-permissions.ts
"use client";

import { useSession } from "next-auth/react";
import { hasPermission, hasAnyPermission, type Permission, type Role } from "@/lib/auth/permissions";

export function usePermissions() {
  const { data: session, status } = useSession();
  const role = (session?.user?.role as Role) ?? "guest";

  return {
    role,
    loading: status === "loading",
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    isAdmin: role === "admin" || role === "superadmin",
    isModerator: role === "moderator" || role === "admin" || role === "superadmin",
  };
}

// Usage
function EditButton({ postId }: { postId: string }) {
  const { can } = usePermissions();
  
  if (!can("post:edit:any")) {
    return null;
  }
  
  return <Button>Edit</Button>;
}
```

## Permission Guard Component

```typescript
// components/auth/permission-guard.tsx
"use client";

import { usePermissions } from "@/hooks/use-permissions";
import { type Permission } from "@/lib/auth/permissions";

interface PermissionGuardProps {
  permission: Permission | Permission[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
  mode?: "any" | "all";
}

export function PermissionGuard({
  permission,
  fallback = null,
  children,
  mode = "any",
}: PermissionGuardProps) {
  const { can, canAny, loading } = usePermissions();

  if (loading) {
    return null; // Or loading skeleton
  }

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = mode === "all"
    ? permissions.every((p) => can(p))
    : permissions.some((p) => can(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Usage
<PermissionGuard permission="admin:access">
  <AdminPanel />
</PermissionGuard>

<PermissionGuard 
  permission={["post:edit:any", "post:delete:any"]} 
  mode="any"
>
  <ModeratorTools />
</PermissionGuard>
```

## Server-Side Permission Check

```typescript
// lib/auth/authorize.ts
import { auth } from "@/auth";
import { hasPermission, type Permission, type Role } from "@/lib/auth/permissions";
import { redirect } from "next/navigation";

export async function authorize(permission: Permission) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const role = session.user.role as Role;
  
  if (!hasPermission(role, permission)) {
    redirect("/unauthorized");
  }
  
  return session;
}

export async function authorizeAny(permissions: Permission[]) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }
  
  const role = session.user.role as Role;
  const hasAccess = permissions.some((p) => hasPermission(role, p));
  
  if (!hasAccess) {
    redirect("/unauthorized");
  }
  
  return session;
}

// Usage in Server Component
// app/admin/page.tsx
export default async function AdminPage() {
  const session = await authorize("admin:access");
  
  return <AdminDashboard user={session.user} />;
}
```

## Resource-Level Authorization

```typescript
// lib/auth/policies.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { hasPermission, type Role } from "@/lib/auth/permissions";

type PolicyResult = { allowed: boolean; reason?: string };

// Post policy
export async function canEditPost(postId: string): Promise<PolicyResult> {
  const session = await auth();
  
  if (!session?.user) {
    return { allowed: false, reason: "Not authenticated" };
  }
  
  const role = session.user.role as Role;
  
  // Admins can edit any post
  if (hasPermission(role, "post:edit:any")) {
    return { allowed: true };
  }
  
  // Users can edit their own posts
  if (hasPermission(role, "post:edit")) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    
    if (post?.authorId === session.user.id) {
      return { allowed: true };
    }
  }
  
  return { allowed: false, reason: "Not authorized to edit this post" };
}

export async function canDeletePost(postId: string): Promise<PolicyResult> {
  const session = await auth();
  
  if (!session?.user) {
    return { allowed: false, reason: "Not authenticated" };
  }
  
  const role = session.user.role as Role;
  
  if (hasPermission(role, "post:delete:any")) {
    return { allowed: true };
  }
  
  if (hasPermission(role, "post:delete")) {
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });
    
    if (post?.authorId === session.user.id) {
      return { allowed: true };
    }
  }
  
  return { allowed: false, reason: "Not authorized to delete this post" };
}

// Usage in Server Action
// app/actions/posts.ts
"use server";

import { canDeletePost } from "@/lib/auth/policies";
import { revalidatePath } from "next/cache";

export async function deletePost(postId: string) {
  const { allowed, reason } = await canDeletePost(postId);
  
  if (!allowed) {
    throw new Error(reason || "Unauthorized");
  }
  
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/posts");
}
```

## Role Management UI

```typescript
// components/admin/role-manager.tsx
"use client";

import { useState } from "react";
import { ROLES, PERMISSIONS, type Role, type Permission } from "@/lib/auth/permissions";
import { updateUserRole } from "@/app/actions/admin";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export function RoleManager({ user }: { user: User }) {
  const [role, setRole] = useState<Role>(user.role);
  const [saving, setSaving] = useState(false);

  const handleRoleChange = async (newRole: Role) => {
    setSaving(true);
    try {
      await updateUserRole(user.id, newRole);
      setRole(newRole);
      toast.success(`Role updated to ${ROLES[newRole].name}`);
    } catch (error) {
      toast.error("Failed to update role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Select
          value={role}
          onValueChange={(value) => handleRoleChange(value as Role)}
          disabled={saving}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ROLES).map(([key, config]) => (
              <SelectItem key={key} value={key}>
                {config.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Permissions</p>
        <div className="flex flex-wrap gap-1">
          {ROLES[role].permissions.map((permission) => (
            <Badge key={permission} variant="secondary" className="text-xs">
              {permission}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Middleware with RBAC

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";
import { hasPermission, type Permission, type Role } from "@/lib/auth/permissions";

const routePermissions: Record<string, Permission[]> = {
  "/admin": ["admin:access"],
  "/admin/users": ["user:manage"],
  "/admin/settings": ["admin:settings"],
  "/admin/billing": ["admin:billing"],
  "/posts/new": ["post:create"],
  "/posts/[id]/edit": ["post:edit"],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Find matching route permission
  const matchedRoute = Object.keys(routePermissions)
    .find((route) => {
      const pattern = route.replace(/\[.*?\]/g, "[^/]+");
      return new RegExp(`^${pattern}$`).test(pathname);
    });
  
  if (!matchedRoute) {
    return NextResponse.next();
  }
  
  const requiredPermissions = routePermissions[matchedRoute];
  const token = request.cookies.get("access-token")?.value;
  const session = token ? await verifyToken(token) : null;
  
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  
  const role = session.role as Role;
  const hasAccess = requiredPermissions.some((p) => hasPermission(role, p));
  
  if (!hasAccess) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
  
  return NextResponse.next();
}
```

## Database Schema for Dynamic Roles

```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  role      Role     @relation(fields: [roleId], references: [id])
  roleId    String
}

model Role {
  id          String       @id @default(cuid())
  name        String       @unique
  description String?
  permissions Permission[]
  users       User[]
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}

model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  roles       Role[]
  createdAt   DateTime @default(now())
}
```

## Anti-patterns

### Don't Check Permissions in Frontend Only

```typescript
// BAD - Only client-side check
function DeleteButton({ postId }) {
  const { can } = usePermissions();
  if (!can("post:delete")) return null;
  
  return <Button onClick={() => fetch(`/api/posts/${postId}`, { method: 'DELETE' })}>
    Delete
  </Button>;
}

// GOOD - Check on both client and server
// Client
function DeleteButton({ postId }) {
  const { can } = usePermissions();
  if (!can("post:delete")) return null;
  return <Button onClick={() => deletePost(postId)}>Delete</Button>;
}

// Server action
export async function deletePost(postId) {
  const { allowed } = await canDeletePost(postId);
  if (!allowed) throw new Error("Unauthorized");
  // Delete post
}
```

## Related Skills

- [auth-middleware](./auth-middleware.md)
- [session-management](./session-management.md)
- [next-auth](./next-auth.md)

---

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-16)
- Initial implementation
- Permission system
- Resource policies
- Role management UI
