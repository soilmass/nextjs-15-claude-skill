---
id: pt-prisma-patterns
name: Prisma ORM Patterns
version: 2.1.0
layer: L5
category: data
description: Advanced Prisma patterns for Next.js 15 including connection management, queries, and best practices
tags: [prisma, orm, database, postgresql, mysql, sqlite]
composes:
  - ../organisms/data-table.md
  - ../molecules/pagination.md
dependencies:
  prisma: "^6.0.0"
formula: "Prisma = PrismaClient + Repository + DataTable(o-data-table) + Pagination(m-pagination)"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Prisma ORM Patterns

## Overview

Prisma provides type-safe database access with an intuitive API. This pattern covers connection management, query optimization, and best practices for Next.js applications.

## When to Use

- Type-safe database queries in Next.js
- Complex relational data models
- Full-text search capabilities
- Soft delete patterns
- Audit logging requirements

## Composition Diagram

```
+------------------------------------------+
|              Prisma Layer                |
|  +------------------------------------+  |
|  |        PrismaClient Singleton     |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |          Repository Layer         |  |
|  |  findUnique, findMany, create...  |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |         Service Layer             |  |
|  |  getPosts, createOrder, etc.      |  |
|  +------------------------------------+  |
|           |                             |
|           v                             |
|  +------------------------------------+  |
|  |    Server Component / Action      |  |
|  +------------------------------------+  |
+------------------------------------------+
```

## Implementation

### Database Client Singleton

```typescript
// lib/db.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// With connection pooling for serverless
// lib/db-edge.ts
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL!;

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

export const prismaEdge = new PrismaClient({ adapter });
```

### Schema Design

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}

// User model with relations
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar        String?
  role          Role      @default(USER)
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  posts         Post[]
  comments      Comment[]
  likes         Like[]
  accounts      Account[]
  sessions      Session[]
  
  // Soft delete
  deletedAt     DateTime?
  
  @@index([email])
  @@index([createdAt])
  @@map("users")
}

model Post {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String
  excerpt     String?
  published   Boolean   @default(false)
  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  // Relations
  author      User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId    String
  categories  CategoriesOnPosts[]
  tags        TagsOnPosts[]
  comments    Comment[]
  likes       Like[]
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  // Full-text search
  @@fulltext([title, content])
  @@index([authorId])
  @@index([published, publishedAt])
  @@index([slug])
  @@map("posts")
}

model Category {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  posts CategoriesOnPosts[]
  
  @@map("categories")
}

model CategoriesOnPosts {
  post       Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId     String
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId String
  
  @@id([postId, categoryId])
  @@map("categories_on_posts")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  posts TagsOnPosts[]
  
  @@map("tags")
}

model TagsOnPosts {
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String
  
  @@id([postId, tagId])
  @@map("tags_on_posts")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId  String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  
  // Self-referential for replies
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  parentId  String?
  replies   Comment[] @relation("CommentReplies")
  
  @@index([postId])
  @@index([authorId])
  @@map("comments")
}

model Like {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  post      Post     @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  
  @@unique([userId, postId])
  @@map("likes")
}

enum Role {
  USER
  ADMIN
  MODERATOR
}
```

### Repository Pattern

```typescript
// repositories/base.repository.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export abstract class BaseRepository<
  TModel,
  TCreateInput,
  TUpdateInput,
  TWhereUniqueInput,
  TWhereInput,
  TOrderByInput
> {
  protected abstract model: any;

  async findUnique(where: TWhereUniqueInput): Promise<TModel | null> {
    return this.model.findUnique({ where });
  }

  async findFirst(where: TWhereInput): Promise<TModel | null> {
    return this.model.findFirst({ where });
  }

  async findMany(params?: {
    where?: TWhereInput;
    orderBy?: TOrderByInput;
    skip?: number;
    take?: number;
  }): Promise<TModel[]> {
    return this.model.findMany(params);
  }

  async count(where?: TWhereInput): Promise<number> {
    return this.model.count({ where });
  }

  async create(data: TCreateInput): Promise<TModel> {
    return this.model.create({ data });
  }

  async update(where: TWhereUniqueInput, data: TUpdateInput): Promise<TModel> {
    return this.model.update({ where, data });
  }

  async delete(where: TWhereUniqueInput): Promise<TModel> {
    return this.model.delete({ where });
  }

  async upsert(
    where: TWhereUniqueInput,
    create: TCreateInput,
    update: TUpdateInput
  ): Promise<TModel> {
    return this.model.upsert({ where, create, update });
  }
}

// repositories/user.repository.ts
import { prisma } from "@/lib/db";
import { Prisma, User } from "@prisma/client";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<
  User,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput,
  Prisma.UserWhereUniqueInput,
  Prisma.UserWhereInput,
  Prisma.UserOrderByWithRelationInput
> {
  protected model = prisma.user;

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findWithPosts(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        posts: {
          where: { published: true },
          orderBy: { publishedAt: "desc" },
          take: 10,
        },
      },
    });
  }

  async findActive() {
    return prisma.user.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  async softDelete(id: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

export const userRepository = new UserRepository();
```

### Query Patterns

```typescript
// services/post.service.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Paginated query with filters
interface GetPostsParams {
  page?: number;
  limit?: number;
  search?: string;
  categorySlug?: string;
  authorId?: string;
  published?: boolean;
}

export async function getPosts({
  page = 1,
  limit = 10,
  search,
  categorySlug,
  authorId,
  published = true,
}: GetPostsParams = {}) {
  const where: Prisma.PostWhereInput = {
    published,
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(categorySlug && {
      categories: {
        some: {
          category: { slug: categorySlug },
        },
      },
    }),
    ...(authorId && { authorId }),
  };

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        categories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: page * limit < total,
    },
  };
}

// Full-text search
export async function searchPosts(query: string, limit = 10) {
  return prisma.post.findMany({
    where: {
      published: true,
      OR: [
        {
          title: {
            search: query.split(" ").join(" & "),
          },
        },
        {
          content: {
            search: query.split(" ").join(" & "),
          },
        },
      ],
    },
    take: limit,
    include: {
      author: {
        select: { name: true, avatar: true },
      },
    },
  });
}

// Aggregation
export async function getPostStats(postId: string) {
  const [post, viewCount, likeCount, commentCount] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      select: { title: true, publishedAt: true },
    }),
    prisma.postView.count({ where: { postId } }),
    prisma.like.count({ where: { postId } }),
    prisma.comment.count({ where: { postId } }),
  ]);

  return {
    ...post,
    stats: {
      views: viewCount,
      likes: likeCount,
      comments: commentCount,
    },
  };
}
```

### Transaction Patterns

```typescript
// services/user.service.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

// Sequential operations in transaction
export async function createUserWithProfile(
  userData: Prisma.UserCreateInput,
  profileData: { bio?: string; website?: string }
) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: userData,
    });

    const profile = await tx.profile.create({
      data: {
        userId: user.id,
        ...profileData,
      },
    });

    // Create default settings
    await tx.userSettings.create({
      data: {
        userId: user.id,
        theme: "system",
        notifications: true,
      },
    });

    return { user, profile };
  });
}

// Batch operations
export async function transferCredits(
  fromUserId: string,
  toUserId: string,
  amount: number
) {
  return prisma.$transaction(
    async (tx) => {
      // Check sender has enough credits
      const sender = await tx.user.findUnique({
        where: { id: fromUserId },
        select: { credits: true },
      });

      if (!sender || sender.credits < amount) {
        throw new Error("Insufficient credits");
      }

      // Deduct from sender
      const updatedSender = await tx.user.update({
        where: { id: fromUserId },
        data: { credits: { decrement: amount } },
      });

      // Add to receiver
      const updatedReceiver = await tx.user.update({
        where: { id: toUserId },
        data: { credits: { increment: amount } },
      });

      // Log transaction
      await tx.creditTransaction.create({
        data: {
          fromUserId,
          toUserId,
          amount,
          type: "TRANSFER",
        },
      });

      return { sender: updatedSender, receiver: updatedReceiver };
    },
    {
      maxWait: 5000, // Max time to wait for transaction
      timeout: 10000, // Max time for transaction to complete
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );
}
```

### Middleware Extensions

```typescript
// lib/db.ts
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient().$extends({
  query: {
    // Soft delete middleware
    user: {
      async findMany({ model, operation, args, query }) {
        // Exclude soft-deleted by default
        args.where = {
          ...args.where,
          deletedAt: null,
        };
        return query(args);
      },
      async delete({ model, operation, args, query }) {
        // Convert delete to soft delete
        return prisma.user.update({
          where: args.where,
          data: { deletedAt: new Date() },
        });
      },
    },
    // Audit logging
    $allModels: {
      async create({ model, operation, args, query }) {
        const result = await query(args);
        await logAudit(model, "create", result);
        return result;
      },
      async update({ model, operation, args, query }) {
        const result = await query(args);
        await logAudit(model, "update", result);
        return result;
      },
    },
  },
  model: {
    // Custom methods
    user: {
      async signUp(email: string, name: string) {
        return prisma.user.create({
          data: { email, name },
        });
      },
    },
  },
});

async function logAudit(model: string, action: string, data: any) {
  // Log to audit table or external service
  console.log(`[AUDIT] ${model}.${action}:`, data.id);
}

export { prisma };
```

## Variants

### Raw SQL Queries

```typescript
// When you need raw SQL
const results = await prisma.$queryRaw<{ id: string; count: bigint }[]>`
  SELECT author_id as id, COUNT(*) as count
  FROM posts
  WHERE published = true
  GROUP BY author_id
  HAVING COUNT(*) > 5
  ORDER BY count DESC
  LIMIT 10
`;

// Tagged template for safety (prevents SQL injection)
const userId = "some-id";
const user = await prisma.$queryRaw`
  SELECT * FROM users WHERE id = ${userId}
`;
```

### Connection Pooling for Serverless

```typescript
// For PlanetScale, Neon, or Supabase
// Use connection pooler URL for queries
// Use direct URL for migrations
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")      // Pooled connection
  directUrl = env("DIRECT_DATABASE_URL") // Direct connection
}
```

## Anti-patterns

1. **N+1 queries**: Not using `include` for related data
2. **No connection reuse**: Creating new clients per request
3. **Missing indexes**: Slow queries on filtered columns
4. **Unbounded queries**: No `take` limit on `findMany`
5. **Synchronous migrations**: Blocking deployments

## Related Skills

- `L5/patterns/migrations` - Database migrations
- `L5/patterns/seeding` - Database seeding
- `L5/patterns/transactions` - Transaction handling
- `L5/patterns/soft-delete` - Soft delete patterns

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with Prisma 6
