---
id: pt-multi-tenancy
name: Multi-Tenant Architecture
version: 1.0.0
layer: L5
category: architecture
description: Implement multi-tenant architecture with tenant isolation, subdomain routing, and tenant-aware data
tags: [multi-tenant, saas, tenant, subdomain, isolation, next15, react19]
composes: []
dependencies: []
formula: "MultiTenancy = TenantResolution + DataIsolation + SubdomainRouting + TenantContext"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Multi-Tenant Architecture

## When to Use

- When building SaaS applications
- For white-label solutions
- When serving multiple organizations from one codebase
- For isolated workspaces or teams
- When implementing subdomain-based routing

## Overview

This pattern implements multi-tenant architecture with subdomain routing, tenant isolation at the database level, and tenant-aware middleware.

## Database Schema

```prisma
// prisma/schema.prisma
model Tenant {
  id            String   @id @default(cuid())
  name          String
  slug          String   @unique
  domain        String?  @unique // Custom domain
  subdomain     String   @unique // e.g., "acme" for acme.yourapp.com

  // Branding
  logo          String?
  primaryColor  String?
  favicon       String?

  // Settings
  settings      Json     @default("{}")
  features      String[] @default([])

  // Billing
  plan          Plan     @default(FREE)
  stripeCustomerId String?

  // Relations
  users         TenantUser[]
  invitations   TenantInvitation[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([subdomain])
  @@index([domain])
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

model TenantUser {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  role      TenantRole @default(MEMBER)
  createdAt DateTime @default(now())

  @@unique([tenantId, userId])
  @@index([userId])
}

enum TenantRole {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model TenantInvitation {
  id        String   @id @default(cuid())
  tenantId  String
  tenant    Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  email     String
  role      TenantRole @default(MEMBER)
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@unique([tenantId, email])
}

// All tenant-scoped models include tenantId
model Project {
  id        String   @id @default(cuid())
  tenantId  String
  name      String
  // ... other fields

  @@index([tenantId])
}
```

## Tenant Resolution Middleware

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/api/webhooks"];
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || "yourapp.com";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Skip public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Resolve tenant from hostname
  const tenant = await resolveTenant(hostname);

  if (!tenant) {
    // Redirect to main site if tenant not found
    return NextResponse.redirect(new URL("/", `https://${APP_DOMAIN}`));
  }

  // Add tenant info to headers for downstream use
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenant.id);
  requestHeaders.set("x-tenant-slug", tenant.slug);

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

async function resolveTenant(hostname: string) {
  // Check for custom domain first
  if (!hostname.endsWith(APP_DOMAIN)) {
    return getTenantByDomain(hostname);
  }

  // Extract subdomain
  const subdomain = hostname.replace(`.${APP_DOMAIN}`, "").split(".")[0];

  if (!subdomain || subdomain === "www" || subdomain === "app") {
    return null;
  }

  return getTenantBySubdomain(subdomain);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## Tenant Context

```typescript
// lib/tenant/context.ts
import { headers } from "next/headers";
import { cache } from "react";
import { prisma } from "@/lib/db";

export interface TenantContext {
  id: string;
  slug: string;
  name: string;
  settings: Record<string, unknown>;
  features: string[];
  plan: string;
}

export const getTenant = cache(async (): Promise<TenantContext | null> => {
  const headersList = await headers();
  const tenantId = headersList.get("x-tenant-id");

  if (!tenantId) return null;

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      slug: true,
      name: true,
      settings: true,
      features: true,
      plan: true,
    },
  });

  return tenant as TenantContext;
});

// Client-side context
// contexts/tenant-context.tsx
"use client";

import { createContext, useContext } from "react";
import type { TenantContext } from "@/lib/tenant/context";

const TenantCtx = createContext<TenantContext | null>(null);

export function TenantProvider({
  tenant,
  children,
}: {
  tenant: TenantContext;
  children: React.ReactNode;
}) {
  return <TenantCtx.Provider value={tenant}>{children}</TenantCtx.Provider>;
}

export function useTenant(): TenantContext {
  const tenant = useContext(TenantCtx);
  if (!tenant) {
    throw new Error("useTenant must be used within TenantProvider");
  }
  return tenant;
}
```

## Tenant-Scoped Prisma Client

```typescript
// lib/db/tenant-client.ts
import { PrismaClient } from "@prisma/client";
import { getTenant } from "@/lib/tenant/context";

// Extend Prisma client with tenant scope
export function createTenantClient(tenantId: string) {
  const prisma = new PrismaClient();

  // Add middleware to automatically filter by tenantId
  prisma.$use(async (params, next) => {
    const tenantScopedModels = ["Project", "Document", "Task"];

    if (tenantScopedModels.includes(params.model || "")) {
      // Add tenantId to where clause for reads
      if (["findUnique", "findFirst", "findMany", "count", "aggregate"].includes(params.action)) {
        params.args.where = {
          ...params.args.where,
          tenantId,
        };
      }

      // Add tenantId to data for creates
      if (params.action === "create") {
        params.args.data.tenantId = tenantId;
      }

      // Add tenantId to where for updates/deletes
      if (["update", "updateMany", "delete", "deleteMany"].includes(params.action)) {
        params.args.where = {
          ...params.args.where,
          tenantId,
        };
      }
    }

    return next(params);
  });

  return prisma;
}

// Usage in server components/actions
export async function getTenantPrisma() {
  const tenant = await getTenant();
  if (!tenant) throw new Error("No tenant context");
  return createTenantClient(tenant.id);
}
```

## Tenant Service

```typescript
// lib/tenant/service.ts
import { prisma } from "@/lib/db";
import { TenantRole } from "@prisma/client";

export async function createTenant(
  name: string,
  userId: string
): Promise<string> {
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const tenant = await prisma.tenant.create({
    data: {
      name,
      slug,
      subdomain: slug,
      users: {
        create: {
          userId,
          role: "OWNER",
        },
      },
    },
  });

  return tenant.id;
}

export async function getUserTenants(userId: string) {
  return prisma.tenantUser.findMany({
    where: { userId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          slug: true,
          subdomain: true,
          logo: true,
        },
      },
    },
  });
}

export async function inviteToTenant(
  tenantId: string,
  email: string,
  role: TenantRole
) {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.tenantInvitation.create({
    data: {
      tenantId,
      email,
      role,
      token,
      expiresAt,
    },
  });

  // Send invitation email
  await sendInvitationEmail(email, token);

  return token;
}

export async function acceptInvitation(token: string, userId: string) {
  const invitation = await prisma.tenantInvitation.findUnique({
    where: { token },
  });

  if (!invitation || invitation.expiresAt < new Date()) {
    throw new Error("Invalid or expired invitation");
  }

  await prisma.$transaction([
    prisma.tenantUser.create({
      data: {
        tenantId: invitation.tenantId,
        userId,
        role: invitation.role,
      },
    }),
    prisma.tenantInvitation.delete({
      where: { id: invitation.id },
    }),
  ]);
}
```

## Tenant Switcher Component

```typescript
// components/tenant/tenant-switcher.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTenant } from "@/contexts/tenant-context";
import { cn } from "@/lib/utils";

interface TenantOption {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  logo: string | null;
}

export function TenantSwitcher({ tenants }: { tenants: TenantOption[] }) {
  const router = useRouter();
  const currentTenant = useTenant();
  const [open, setOpen] = useState(false);

  const handleSelect = (tenant: TenantOption) => {
    setOpen(false);

    if (tenant.id === currentTenant.id) return;

    // Navigate to tenant's subdomain
    const url = `https://${tenant.subdomain}.${process.env.NEXT_PUBLIC_APP_DOMAIN}`;
    window.location.href = url;
  };

  const handleCreateNew = () => {
    setOpen(false);
    router.push("/create-workspace");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          <Avatar className="h-5 w-5 mr-2">
            <AvatarImage src={currentTenant.logo || undefined} />
            <AvatarFallback>{currentTenant.name[0]}</AvatarFallback>
          </Avatar>
          <span className="truncate">{currentTenant.name}</span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search workspace..." />
          <CommandList>
            <CommandEmpty>No workspace found.</CommandEmpty>
            <CommandGroup heading="Workspaces">
              {tenants.map((tenant) => (
                <CommandItem
                  key={tenant.id}
                  onSelect={() => handleSelect(tenant)}
                  className="flex items-center gap-2"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={tenant.logo || undefined} />
                    <AvatarFallback>{tenant.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{tenant.name}</span>
                  {tenant.id === currentTenant.id && (
                    <Check className="ml-auto h-4 w-4" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              <CommandItem onSelect={handleCreateNew}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workspace
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
```

## Tenant Layout

```typescript
// app/[tenant]/layout.tsx
import { notFound } from "next/navigation";
import { getTenant } from "@/lib/tenant/context";
import { TenantProvider } from "@/contexts/tenant-context";

export default async function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tenant = await getTenant();

  if (!tenant) {
    notFound();
  }

  return (
    <TenantProvider tenant={tenant}>
      <div
        style={{
          "--primary-color": tenant.settings.primaryColor || undefined,
        } as React.CSSProperties}
      >
        {children}
      </div>
    </TenantProvider>
  );
}
```

## Anti-patterns

### Don't Query Without Tenant Scope

```typescript
// BAD - No tenant isolation
const projects = await prisma.project.findMany();

// GOOD - Tenant-scoped query
const tenantPrisma = await getTenantPrisma();
const projects = await tenantPrisma.project.findMany();
```

### Don't Hardcode Tenant in URLs

```typescript
// BAD - Hardcoded tenant
<Link href="/acme/projects">Projects</Link>

// GOOD - Relative to current tenant
<Link href="/projects">Projects</Link>
```

## Related Patterns

- [rbac](./rbac.md)
- [sso](./sso.md)
- [billing](./billing.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Subdomain routing
- Tenant isolation
- Tenant switcher
- Invitation system
