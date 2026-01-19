---
id: pt-soft-delete
name: Soft Delete Patterns
version: 2.0.0
layer: L5
category: database
description: Soft delete implementation for data recovery, audit trails, and GDPR compliance
tags: [database, soft-delete, prisma, audit, recovery]
composes:
  - ../atoms/input-button.md
  - ../atoms/feedback-alert.md
dependencies:
  prisma: "^6.0.0"
formula: deletedAt Field + Prisma Extension + Auto-Filter + Cleanup Job = Recoverable Data
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Implementing data recovery functionality for accidental deletions
- Building audit trails that track who deleted what and when
- Maintaining referential integrity while hiding deleted records from users
- Creating trash/recycle bin features in admin interfaces
- Complying with GDPR requirements for data retention and recovery

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      SOFT DELETE PATTERN                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │                 Database Schema                       │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  User {                                         │ │      │
│  │  │    id: String                                   │ │      │
│  │  │    deletedAt: DateTime?  ◄── Soft delete flag   │ │      │
│  │  │    deletedBy: String?    ◄── Audit trail        │ │      │
│  │  │  }                                              │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Prisma Extension                         │      │
│  │  ┌────────────────┐  ┌─────────────────────────────┐ │      │
│  │  │  softDelete()  │  │  Auto-filter deletedAt     │ │      │
│  │  │  restore()     │  │  in findMany/findFirst     │ │      │
│  │  │  hardDelete()  │  │  Convert delete → update   │ │      │
│  │  └────────────────┘  └─────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                   Operations                          │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │   Delete    │  │   Restore   │  │   Purge     │  │      │
│  │  │  (soft)     │  │  (undelete) │  │  (cleanup)  │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Scheduled Cleanup                        │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │  Cron Job: Hard delete records older than     │   │      │
│  │  │  30 days in trash                             │   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Soft Delete Patterns

## Overview

Soft delete marks records as deleted without physically removing them, enabling data recovery, audit trails, and maintaining referential integrity. This pattern covers implementation strategies and middleware approaches.

## Implementation

### Schema Setup

```prisma
// prisma/schema.prisma
model User {
  id        String    @id @default(cuid())
  email     String    @unique
  name      String?
  
  // Soft delete fields
  deletedAt DateTime?
  deletedBy String?   // User who performed deletion
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  posts     Post[]
  
  @@index([deletedAt])
  @@map("users")
}

model Post {
  id        String    @id @default(cuid())
  title     String
  content   String
  
  author    User      @relation(fields: [authorId], references: [id])
  authorId  String
  
  // Soft delete
  deletedAt DateTime?
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([authorId])
  @@index([deletedAt])
  @@map("posts")
}
```

### Prisma Extension for Soft Delete

```typescript
// lib/db.ts
import { PrismaClient, Prisma } from "@prisma/client";

function createSoftDeleteExtension() {
  return Prisma.defineExtension({
    name: "softDelete",
    model: {
      $allModels: {
        // Soft delete a record
        async softDelete<T, A>(
          this: T,
          args: Prisma.Args<T, "update">
        ): Promise<Prisma.Result<T, A, "update">> {
          const context = Prisma.getExtensionContext(this);
          return (context as any).update({
            ...args,
            data: {
              ...(args.data as object),
              deletedAt: new Date(),
            },
          });
        },

        // Restore a soft-deleted record
        async restore<T, A>(
          this: T,
          args: Prisma.Args<T, "update">
        ): Promise<Prisma.Result<T, A, "update">> {
          const context = Prisma.getExtensionContext(this);
          return (context as any).update({
            ...args,
            data: {
              ...(args.data as object),
              deletedAt: null,
            },
          });
        },

        // Find including soft-deleted
        async findManyWithDeleted<T, A>(
          this: T,
          args?: Prisma.Args<T, "findMany">
        ): Promise<Prisma.Result<T, A, "findMany">> {
          const context = Prisma.getExtensionContext(this);
          return (context as any).findMany(args);
        },

        // Find only soft-deleted
        async findDeleted<T, A>(
          this: T,
          args?: Prisma.Args<T, "findMany">
        ): Promise<Prisma.Result<T, A, "findMany">> {
          const context = Prisma.getExtensionContext(this);
          return (context as any).findMany({
            ...args,
            where: {
              ...(args?.where as object),
              deletedAt: { not: null },
            },
          });
        },

        // Permanently delete
        async hardDelete<T, A>(
          this: T,
          args: Prisma.Args<T, "delete">
        ): Promise<Prisma.Result<T, A, "delete">> {
          const context = Prisma.getExtensionContext(this);
          return (context as any).delete(args);
        },
      },
    },
    query: {
      $allModels: {
        // Exclude soft-deleted by default
        async findMany({ model, operation, args, query }) {
          if (hasSoftDelete(model)) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        async findFirst({ model, operation, args, query }) {
          if (hasSoftDelete(model)) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        async findUnique({ model, operation, args, query }) {
          // findUnique doesn't support deletedAt filter
          // Use findFirst instead for soft delete check
          return query(args);
        },
        async count({ model, operation, args, query }) {
          if (hasSoftDelete(model)) {
            args.where = {
              ...args.where,
              deletedAt: null,
            };
          }
          return query(args);
        },
        // Convert delete to soft delete
        async delete({ model, operation, args, query }) {
          if (hasSoftDelete(model)) {
            return (prisma as any)[model].update({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        },
        // Convert deleteMany to soft delete
        async deleteMany({ model, operation, args, query }) {
          if (hasSoftDelete(model)) {
            return (prisma as any)[model].updateMany({
              where: args.where,
              data: { deletedAt: new Date() },
            });
          }
          return query(args);
        },
      },
    },
  });
}

// Models with soft delete
const SOFT_DELETE_MODELS = ["User", "Post", "Comment", "Project"];

function hasSoftDelete(model: string): boolean {
  return SOFT_DELETE_MODELS.includes(model);
}

const prismaBase = new PrismaClient();
export const prisma = prismaBase.$extends(createSoftDeleteExtension());

export type ExtendedPrismaClient = typeof prisma;
```

### Repository with Soft Delete

```typescript
// repositories/user.repository.ts
import { prisma } from "@/lib/db";
import type { User, Prisma } from "@prisma/client";

export class UserRepository {
  // Standard queries (exclude deleted)
  async findById(id: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
  }

  async findAll(params?: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
  }): Promise<User[]> {
    return prisma.user.findMany({
      ...params,
      where: {
        ...params?.where,
        deletedAt: null,
      },
    });
  }

  // Soft delete
  async delete(id: string, deletedBy?: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy,
      },
    });
  }

  // Restore
  async restore(id: string): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: {
        deletedAt: null,
        deletedBy: null,
      },
    });
  }

  // Find including deleted (for admin)
  async findByIdIncludeDeleted(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  // Find only deleted (for trash view)
  async findDeleted(): Promise<User[]> {
    return prisma.user.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    });
  }

  // Permanent delete (use with caution)
  async hardDelete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  // Bulk permanent delete old soft-deleted records
  async purgeDeleted(olderThan: Date): Promise<{ count: number }> {
    return prisma.user.deleteMany({
      where: {
        deletedAt: {
          not: null,
          lt: olderThan,
        },
      },
    });
  }
}

export const userRepository = new UserRepository();
```

### Server Actions with Soft Delete

```typescript
// app/actions/users.ts
"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function deleteUser(userId: string) {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Soft delete user and cascade to related records
    await prisma.$transaction(async (tx) => {
      // Soft delete user
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          deletedBy: session.user.id,
        },
      });

      // Soft delete user's posts
      await tx.post.updateMany({
        where: { authorId: userId },
        data: { deletedAt: new Date() },
      });

      // Soft delete user's comments
      await tx.comment.updateMany({
        where: { authorId: userId },
        data: { deletedAt: new Date() },
      });
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete user" };
  }
}

export async function restoreUser(userId: string) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Restore user and related records
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          deletedAt: null,
          deletedBy: null,
        },
      });

      // Optionally restore posts
      await tx.post.updateMany({
        where: { authorId: userId },
        data: { deletedAt: null },
      });
    });

    revalidatePath("/admin/users");
    revalidatePath("/admin/trash");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to restore user" };
  }
}

export async function permanentlyDeleteUser(userId: string) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // This will cascade delete due to foreign key constraints
    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/admin/trash");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to permanently delete user" };
  }
}
```

### Trash View Component

```typescript
// app/admin/trash/page.tsx
import { prisma } from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import { RestoreButton, PermanentDeleteButton } from "./actions";

async function getDeletedItems() {
  const [users, posts] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      take: 50,
    }),
    prisma.post.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
      take: 50,
      include: {
        author: {
          select: { name: true },
        },
      },
    }),
  ]);

  return { users, posts };
}

export default async function TrashPage() {
  const { users, posts } = await getDeletedItems();

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Trash</h1>
      <p className="text-muted-foreground mb-8">
        Items in trash will be permanently deleted after 30 days.
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Deleted Users ({users.length})</h2>
        <div className="space-y-2">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{user.name || user.email}</p>
                <p className="text-sm text-muted-foreground">
                  Deleted {formatDistanceToNow(user.deletedAt!)} ago
                </p>
              </div>
              <div className="flex gap-2">
                <RestoreButton type="user" id={user.id} />
                <PermanentDeleteButton type="user" id={user.id} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Deleted Posts ({posts.length})</h2>
        <div className="space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">{post.title}</p>
                <p className="text-sm text-muted-foreground">
                  by {post.author.name} • Deleted{" "}
                  {formatDistanceToNow(post.deletedAt!)} ago
                </p>
              </div>
              <div className="flex gap-2">
                <RestoreButton type="post" id={post.id} />
                <PermanentDeleteButton type="post" id={post.id} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

### Scheduled Cleanup Job

```typescript
// scripts/cleanup-trash.ts
// Run via cron: 0 0 * * * (daily at midnight)
import { prisma } from "@/lib/db";

const RETENTION_DAYS = 30;

async function cleanupTrash() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

  console.log(`Cleaning up items deleted before ${cutoffDate.toISOString()}`);

  // Delete in correct order to respect foreign keys
  const results = await prisma.$transaction([
    // Delete comments first
    prisma.comment.deleteMany({
      where: {
        deletedAt: { not: null, lt: cutoffDate },
      },
    }),
    // Then posts
    prisma.post.deleteMany({
      where: {
        deletedAt: { not: null, lt: cutoffDate },
      },
    }),
    // Finally users
    prisma.user.deleteMany({
      where: {
        deletedAt: { not: null, lt: cutoffDate },
      },
    }),
  ]);

  console.log("Cleanup complete:", {
    comments: results[0].count,
    posts: results[1].count,
    users: results[2].count,
  });
}

cleanupTrash().catch(console.error);
```

## Variants

### With Deletion Reason

```prisma
model User {
  id            String    @id @default(cuid())
  deletedAt     DateTime?
  deletedBy     String?
  deletionReason String?  // "user_request", "admin_action", "gdpr", etc.
}
```

### Paranoid Mode (Never Delete)

```typescript
// Some systems keep everything forever
const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      delete: ({ args }) => {
        throw new Error("Direct deletion is not allowed. Use softDelete instead.");
      },
      deleteMany: ({ args }) => {
        throw new Error("Direct deletion is not allowed. Use softDelete instead.");
      },
    },
  },
});
```

## Anti-patterns

1. **Not filtering by default**: Forgetting to exclude deleted records
2. **No cascade handling**: Orphaned related records
3. **No cleanup job**: Infinite data growth
4. **Missing indexes**: Slow queries on deletedAt
5. **No audit trail**: Not tracking who deleted

## Related Skills

- `L5/patterns/prisma-patterns` - Prisma ORM patterns
- `L5/patterns/audit-logging` - Audit logging
- `L5/patterns/transactions` - Transaction patterns
- `L5/patterns/gdpr-compliance` - GDPR data handling

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Prisma extension
