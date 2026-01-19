---
id: pt-seeding
name: Database Seeding Patterns
version: 2.0.0
layer: L5
category: database
description: Database seeding strategies for development, testing, and demo environments
tags: [database, seeding, prisma, faker, testing]
composes: []
dependencies:
  prisma: "^6.0.0"
formula: Faker + Factory Pattern + Environment Detection + Prisma = Reproducible Test Data
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

- Populating development databases with realistic test data for local development
- Creating factory functions for integration and E2E testing
- Seeding production databases with essential reference data (categories, roles)
- Generating demo environments with sample content for stakeholders
- Building CI/CD pipelines that need reproducible database states

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SEEDING                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Environment Detection                    │      │
│  │  ┌───────────────┐  ┌───────────┐  ┌─────────────┐  │      │
│  │  │  development  │  │   test    │  │ production  │  │      │
│  │  │  (full seed)  │  │ (minimal) │  │ (essential) │  │      │
│  │  └───────────────┘  └───────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                Factory Pattern                        │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  createUserData(overrides)                      │ │      │
│  │  │  createPostData({ authorId, ...overrides })     │ │      │
│  │  │  createCommentData(...)                         │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  │         │                                             │      │
│  │         ▼                                             │      │
│  │  ┌─────────────────────────────────────────────────┐ │      │
│  │  │  factory.user.create()                          │ │      │
│  │  │  factory.user.createMany(count)                 │ │      │
│  │  │  factory.post.create({ authorId })              │ │      │
│  │  └─────────────────────────────────────────────────┘ │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                                                       │
│         ▼                                                       │
│  ┌──────────────────────────────────────────────────────┐      │
│  │               Seed Execution                          │      │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │      │
│  │  │   Clear     │  │   Create    │  │   Create    │  │      │
│  │  │   Existing  │──▶│   Users     │──▶│   Posts     │  │      │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  │      │
│  └──────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

# Database Seeding Patterns

## Overview

Database seeding populates databases with initial or test data. This pattern covers strategies for development, testing, and production environments.

## Implementation

### Basic Seed Script

```typescript
// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data (in reverse order of dependencies)
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.tagsOnPosts.deleteMany();
  await prisma.categoriesOnPosts.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Create categories
  const categories = await Promise.all(
    ["Technology", "Design", "Business", "Lifestyle", "Tutorial"].map((name) =>
      prisma.category.create({
        data: {
          name,
          slug: name.toLowerCase().replace(/\s+/g, "-"),
        },
      })
    )
  );
  console.log(`📁 Created ${categories.length} categories`);

  // Create tags
  const tags = await Promise.all(
    [
      "javascript",
      "typescript",
      "react",
      "nextjs",
      "nodejs",
      "css",
      "tailwind",
      "prisma",
      "database",
      "api",
    ].map((name) =>
      prisma.tag.create({
        data: {
          name,
          slug: name.toLowerCase(),
        },
      })
    )
  );
  console.log(`🏷️  Created ${tags.length} tags`);

  // Create users
  const users = await Promise.all(
    Array.from({ length: 10 }).map(() =>
      prisma.user.create({
        data: {
          email: faker.internet.email().toLowerCase(),
          name: faker.person.fullName(),
          avatar: faker.image.avatar(),
          role: faker.helpers.arrayElement(["USER", "USER", "USER", "ADMIN"]),
        },
      })
    )
  );
  console.log(`👤 Created ${users.length} users`);

  // Create posts with relations
  const posts = await Promise.all(
    Array.from({ length: 30 }).map(() => {
      const title = faker.lorem.sentence();
      const published = faker.datatype.boolean({ probability: 0.7 });

      return prisma.post.create({
        data: {
          title,
          slug: faker.helpers.slugify(title).toLowerCase(),
          content: faker.lorem.paragraphs(5),
          excerpt: faker.lorem.paragraph(),
          published,
          publishedAt: published ? faker.date.past() : null,
          author: {
            connect: { id: faker.helpers.arrayElement(users).id },
          },
          categories: {
            create: faker.helpers
              .arrayElements(categories, { min: 1, max: 3 })
              .map((cat) => ({
                category: { connect: { id: cat.id } },
              })),
          },
          tags: {
            create: faker.helpers
              .arrayElements(tags, { min: 2, max: 5 })
              .map((tag) => ({
                tag: { connect: { id: tag.id } },
              })),
          },
        },
      });
    })
  );
  console.log(`📝 Created ${posts.length} posts`);

  // Create comments
  const publishedPosts = posts.filter((p) => p.published);
  const comments = await Promise.all(
    Array.from({ length: 50 }).map(() =>
      prisma.comment.create({
        data: {
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          author: {
            connect: { id: faker.helpers.arrayElement(users).id },
          },
          post: {
            connect: { id: faker.helpers.arrayElement(publishedPosts).id },
          },
        },
      })
    )
  );
  console.log(`💬 Created ${comments.length} comments`);

  // Create likes
  const likeSet = new Set<string>();
  const likesToCreate: { userId: string; postId: string }[] = [];

  for (let i = 0; i < 100; i++) {
    const userId = faker.helpers.arrayElement(users).id;
    const postId = faker.helpers.arrayElement(publishedPosts).id;
    const key = `${userId}-${postId}`;

    if (!likeSet.has(key)) {
      likeSet.add(key);
      likesToCreate.push({ userId, postId });
    }
  }

  await prisma.like.createMany({
    data: likesToCreate,
  });
  console.log(`❤️  Created ${likesToCreate.length} likes`);

  console.log("✅ Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Package.json Configuration

```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "prisma db seed",
    "db:reset": "prisma migrate reset",
    "db:seed:prod": "NODE_ENV=production tsx prisma/seed-prod.ts"
  }
}
```

### Factory Pattern for Testing

```typescript
// tests/factories/user.factory.ts
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

export type UserFactoryInput = Partial<Prisma.UserCreateInput>;

export function createUserData(
  overrides: UserFactoryInput = {}
): Prisma.UserCreateInput {
  return {
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    avatar: faker.image.avatar(),
    role: "USER",
    ...overrides,
  };
}

export function createManyUserData(
  count: number,
  overrides: UserFactoryInput = {}
): Prisma.UserCreateInput[] {
  return Array.from({ length: count }, () => createUserData(overrides));
}

// tests/factories/post.factory.ts
import { faker } from "@faker-js/faker";
import { Prisma } from "@prisma/client";

export type PostFactoryInput = Partial<Prisma.PostCreateInput> & {
  authorId: string;
};

export function createPostData({
  authorId,
  ...overrides
}: PostFactoryInput): Prisma.PostCreateInput {
  const title = faker.lorem.sentence();

  return {
    title,
    slug: faker.helpers.slugify(title).toLowerCase() + "-" + faker.string.nanoid(6),
    content: faker.lorem.paragraphs(3),
    excerpt: faker.lorem.paragraph(),
    published: true,
    publishedAt: new Date(),
    author: { connect: { id: authorId } },
    ...overrides,
  };
}

// tests/factories/index.ts
import { prisma } from "@/lib/db";
import { createUserData, createManyUserData, type UserFactoryInput } from "./user.factory";
import { createPostData, type PostFactoryInput } from "./post.factory";

export const factory = {
  user: {
    create: async (overrides?: UserFactoryInput) => {
      return prisma.user.create({ data: createUserData(overrides) });
    },
    createMany: async (count: number, overrides?: UserFactoryInput) => {
      return prisma.user.createMany({
        data: createManyUserData(count, overrides),
      });
    },
  },
  post: {
    create: async (input: PostFactoryInput) => {
      return prisma.post.create({ data: createPostData(input) });
    },
  },
};
```

### Test Database Setup

```typescript
// tests/setup.ts
import { prisma } from "@/lib/db";
import { beforeAll, beforeEach, afterAll } from "vitest";

beforeAll(async () => {
  // Ensure test database is used
  if (!process.env.DATABASE_URL?.includes("test")) {
    throw new Error("Tests must use test database");
  }
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.$transaction([
    prisma.comment.deleteMany(),
    prisma.like.deleteMany(),
    prisma.post.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

afterAll(async () => {
  await prisma.$disconnect();
});

// tests/integration/user.test.ts
import { describe, it, expect } from "vitest";
import { factory } from "../factories";
import { prisma } from "@/lib/db";

describe("User", () => {
  it("creates a user", async () => {
    const user = await factory.user.create({ name: "Test User" });

    expect(user.name).toBe("Test User");
    expect(user.email).toBeDefined();
  });

  it("creates multiple users", async () => {
    await factory.user.createMany(5);

    const count = await prisma.user.count();
    expect(count).toBe(5);
  });
});
```

### Environment-Specific Seeds

```typescript
// prisma/seeds/development.ts
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

export async function seedDevelopment(prisma: PrismaClient) {
  console.log("Seeding development data...");

  // Create test accounts
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      role: "USER",
    },
  });

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN",
    },
  });

  // Create sample data
  // ... lots of fake data for development
}

// prisma/seeds/production.ts
import { PrismaClient } from "@prisma/client";

export async function seedProduction(prisma: PrismaClient) {
  console.log("Seeding production data...");

  // Only seed essential reference data
  const categories = [
    { name: "Uncategorized", slug: "uncategorized" },
    { name: "General", slug: "general" },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }

  // Create system user if needed
  await prisma.user.upsert({
    where: { email: "system@app.com" },
    update: {},
    create: {
      email: "system@app.com",
      name: "System",
      role: "ADMIN",
    },
  });
}

// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
import { seedDevelopment } from "./seeds/development";
import { seedProduction } from "./seeds/production";

const prisma = new PrismaClient();

async function main() {
  const env = process.env.NODE_ENV || "development";

  switch (env) {
    case "production":
      await seedProduction(prisma);
      break;
    case "test":
      // Test seeds are handled by test setup
      console.log("Test environment - skipping seed");
      break;
    default:
      await seedDevelopment(prisma);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

### Seed with Relationships

```typescript
// prisma/seeds/with-relations.ts
import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

export async function seedWithRelations(prisma: PrismaClient) {
  // Create a complete user with all relations
  const user = await prisma.user.create({
    data: {
      email: "complete@example.com",
      name: "Complete User",
      role: "USER",
      profile: {
        create: {
          bio: faker.lorem.paragraph(),
          website: faker.internet.url(),
          location: faker.location.city(),
        },
      },
      posts: {
        create: Array.from({ length: 5 }).map(() => ({
          title: faker.lorem.sentence(),
          slug: faker.helpers.slugify(faker.lorem.sentence()).toLowerCase(),
          content: faker.lorem.paragraphs(3),
          published: true,
          publishedAt: faker.date.past(),
        })),
      },
      settings: {
        create: {
          theme: "system",
          emailNotifications: true,
          pushNotifications: false,
        },
      },
    },
    include: {
      profile: true,
      posts: true,
      settings: true,
    },
  });

  // Add comments and likes to posts
  for (const post of user.posts) {
    // Add comments from other users
    const commenters = await prisma.user.findMany({
      where: { id: { not: user.id } },
      take: 3,
    });

    for (const commenter of commenters) {
      await prisma.comment.create({
        data: {
          content: faker.lorem.sentences({ min: 1, max: 3 }),
          authorId: commenter.id,
          postId: post.id,
        },
      });

      // Maybe add a like
      if (faker.datatype.boolean()) {
        await prisma.like.create({
          data: {
            userId: commenter.id,
            postId: post.id,
          },
        });
      }
    }
  }

  return user;
}
```

## Variants

### Incremental Seeding

```typescript
// Only add new data, don't delete existing
export async function incrementalSeed(prisma: PrismaClient) {
  const existingCount = await prisma.user.count();
  
  if (existingCount < 10) {
    const toCreate = 10 - existingCount;
    await factory.user.createMany(toCreate);
    console.log(`Created ${toCreate} new users`);
  }
}
```

### Seeding from CSV/JSON

```typescript
// prisma/seeds/from-file.ts
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

export async function seedFromCSV(prisma: PrismaClient, filePath: string) {
  const content = readFileSync(filePath, "utf-8");
  const records = parse(content, { columns: true });

  await prisma.product.createMany({
    data: records.map((r: any) => ({
      name: r.name,
      sku: r.sku,
      price: parseFloat(r.price),
      stock: parseInt(r.stock),
    })),
    skipDuplicates: true,
  });
}
```

## Anti-patterns

1. **Seeding production with fake data**: Mixing test data in production
2. **No idempotency**: Seeds fail on re-run
3. **Hard-coded IDs**: Breaks on different databases
4. **Sequential inserts**: Slow for large datasets
5. **No cleanup strategy**: Test data accumulates

## Related Skills

- `L5/patterns/prisma-patterns` - Prisma ORM patterns
- `L5/patterns/migrations` - Database migrations
- `L5/patterns/testing-integration` - Integration testing
- `L5/patterns/faker` - Fake data generation

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to atomic design system v2
- Updated frontmatter schema

- 1.0.0: Initial implementation with factory pattern
