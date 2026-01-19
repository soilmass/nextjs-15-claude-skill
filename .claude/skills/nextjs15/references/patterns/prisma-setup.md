---
id: pt-prisma-setup
name: Prisma ORM Setup
version: 1.0.0
layer: L5
category: database
description: Complete Prisma ORM setup and configuration for Next.js 15
tags: [database, prisma, orm, setup, next15, react19]
composes: []
dependencies:
  prisma: "^6.0.0"
formula: "PrismaSetup = Schema + Client + Migrations + Seeding"
performance:
  impact: low
  lcp: low
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Prisma ORM Setup

## Overview

Prisma is a type-safe ORM for Node.js and TypeScript. This pattern covers complete setup, configuration, and best practices for using Prisma with Next.js 15.

## When to Use

- New projects requiring database access
- Type-safe database queries
- Complex relational data models
- Database migrations management

## Installation

```bash
npm install prisma @prisma/client
npx prisma init
```

## Schema Configuration

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  image         String?
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  posts     Post[]
  comments  Comment[]
  accounts  Account[]
  sessions  Session[]

  @@map("users")
}

model Post {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String
  excerpt     String?
  published   Boolean  @default(false)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  tags     Tag[]
  comments Comment[]

  @@index([authorId])
  @@index([slug])
  @@map("posts")
}

model Tag {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  posts Post[]

  @@map("tags")
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  authorId String
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)

  postId String
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)

  parentId String?
  parent   Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies  Comment[] @relation("CommentReplies")

  @@index([authorId])
  @@index([postId])
  @@map("comments")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}
```

## Prisma Client Singleton

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Extended client with soft delete
// lib/db-extended.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async findMany({ model, operation, args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
        async findFirst({ model, operation, args, query }) {
          args.where = { ...args.where, deletedAt: null };
          return query(args);
        },
      },
    },
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
```

## Environment Configuration

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/mydb?schema=public"

# .env.local (for local development)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mydb_dev?schema=public"
```

## Migration Commands

```bash
# Create migration
npx prisma migrate dev --name init

# Apply migrations in production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio
npx prisma studio
```

## Seeding Database

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminPassword,
    },
  });

  // Create tags
  const tags = await Promise.all(
    ['Technology', 'Design', 'Business'].map((name) =>
      prisma.tag.upsert({
        where: { slug: name.toLowerCase() },
        update: {},
        create: {
          name,
          slug: name.toLowerCase(),
        },
      })
    )
  );

  // Create sample posts
  await prisma.post.createMany({
    data: [
      {
        title: 'Getting Started with Next.js 15',
        slug: 'getting-started-nextjs-15',
        content: 'Learn about the new features in Next.js 15...',
        excerpt: 'A comprehensive guide to Next.js 15',
        published: true,
        publishedAt: new Date(),
        authorId: admin.id,
      },
      {
        title: 'Building Modern Web Apps',
        slug: 'building-modern-web-apps',
        content: 'Best practices for modern web development...',
        excerpt: 'Modern web development techniques',
        published: true,
        publishedAt: new Date(),
        authorId: admin.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```json
// package.json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

## Type-Safe Queries

```typescript
// lib/queries/posts.ts
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Define include types for reuse
const postWithAuthor = Prisma.validator<Prisma.PostInclude>()({
  author: {
    select: { id: true, name: true, image: true },
  },
  tags: true,
  _count: { select: { comments: true } },
});

export type PostWithAuthor = Prisma.PostGetPayload<{
  include: typeof postWithAuthor;
}>;

export async function getPublishedPosts(
  page = 1,
  limit = 10
): Promise<{ posts: PostWithAuthor[]; total: number }> {
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      include: postWithAuthor,
      orderBy: { publishedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.post.count({ where: { published: true } }),
  ]);

  return { posts, total };
}

export async function getPostBySlug(slug: string): Promise<PostWithAuthor | null> {
  return prisma.post.findUnique({
    where: { slug },
    include: postWithAuthor,
  });
}
```

## Transaction Example

```typescript
// lib/actions/posts.ts
import { prisma } from '@/lib/db';

export async function createPostWithTags(
  data: { title: string; content: string; authorId: string },
  tagIds: string[]
) {
  return prisma.$transaction(async (tx) => {
    const post = await tx.post.create({
      data: {
        ...data,
        slug: slugify(data.title),
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });

    await tx.user.update({
      where: { id: data.authorId },
      data: { updatedAt: new Date() },
    });

    return post;
  });
}
```

## Anti-patterns

### Don't Create Multiple Clients

```typescript
// BAD - Creates new client on every import
export const prisma = new PrismaClient();

// GOOD - Use singleton pattern
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

## Related Skills

- [prisma-patterns](./prisma-patterns.md)
- [transactions](./transactions.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Schema examples
- Client singleton
- Seeding setup
