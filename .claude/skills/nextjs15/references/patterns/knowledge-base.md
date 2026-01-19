---
id: pt-knowledge-base
name: Knowledge Base
version: 1.0.0
layer: L5
category: content
description: Build a knowledge base or FAQ system with search, categories, and helpful content
tags: [knowledge-base, faq, help-center, documentation, search, next15, react19]
composes: []
dependencies: []
formula: "KnowledgeBase = Categories + Articles + Search + Feedback + Analytics"
performance:
  impact: high
  lcp: positive
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Knowledge Base

## When to Use

- When building help centers or support portals
- For FAQ and documentation systems
- When implementing self-service support
- For internal wikis and knowledge management
- When reducing support ticket volume

## Overview

This pattern implements a knowledge base system with hierarchical categories, full-text search, article feedback, and analytics tracking.

## Database Schema

```prisma
// prisma/schema.prisma
model Category {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  icon        String?
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  articles    Article[]
  order       Int       @default(0)

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([parentId])
}

model Article {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  excerpt     String?
  content     String    @db.Text

  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])

  authorId    String
  status      ArticleStatus @default(DRAFT)
  featured    Boolean   @default(false)

  // Search optimization
  searchVector String?  @db.Text

  // Feedback
  helpfulCount Int      @default(0)
  notHelpfulCount Int   @default(0)
  feedback    ArticleFeedback[]

  // Analytics
  viewCount   Int       @default(0)
  views       ArticleView[]

  publishedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([categoryId])
  @@index([status, publishedAt])
  @@fulltext([title, content])
}

enum ArticleStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model ArticleFeedback {
  id        String   @id @default(cuid())
  articleId String
  article   Article  @relation(fields: [articleId], references: [id])
  helpful   Boolean
  comment   String?
  userId    String?
  createdAt DateTime @default(now())

  @@index([articleId])
}

model ArticleView {
  id        String   @id @default(cuid())
  articleId String
  article   Article  @relation(fields: [articleId], references: [id])
  userId    String?
  sessionId String?
  source    String?  // search, browse, link
  createdAt DateTime @default(now())

  @@index([articleId, createdAt])
}
```

## Knowledge Base Service

```typescript
// lib/knowledge-base/service.ts
import { prisma } from "@/lib/db";
import { ArticleStatus } from "@prisma/client";

export async function getCategories() {
  return prisma.category.findMany({
    where: { parentId: null },
    include: {
      children: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: { articles: { where: { status: "PUBLISHED" } } },
      },
    },
    orderBy: { order: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      articles: {
        where: { status: "PUBLISHED" },
        orderBy: [{ featured: "desc" }, { viewCount: "desc" }],
      },
      children: {
        include: {
          _count: {
            select: { articles: { where: { status: "PUBLISHED" } } },
          },
        },
      },
      parent: true,
    },
  });
}

export async function getArticleBySlug(slug: string) {
  const article = await prisma.article.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
    },
  });

  if (article) {
    // Increment view count
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return article;
}

export async function searchArticles(query: string, limit: number = 10) {
  // Full-text search
  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { content: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      category: { select: { name: true, slug: true } },
    },
    take: limit,
  });

  return articles;
}

export async function getPopularArticles(limit: number = 5) {
  return prisma.article.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { viewCount: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      viewCount: true,
      category: { select: { name: true, slug: true } },
    },
  });
}

export async function getRelatedArticles(articleId: string, limit: number = 3) {
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: { categoryId: true, title: true },
  });

  if (!article) return [];

  return prisma.article.findMany({
    where: {
      id: { not: articleId },
      categoryId: article.categoryId,
      status: "PUBLISHED",
    },
    orderBy: { viewCount: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
    },
  });
}

export async function submitFeedback(
  articleId: string,
  helpful: boolean,
  comment?: string,
  userId?: string
) {
  await prisma.$transaction([
    prisma.articleFeedback.create({
      data: { articleId, helpful, comment, userId },
    }),
    prisma.article.update({
      where: { id: articleId },
      data: helpful
        ? { helpfulCount: { increment: 1 } }
        : { notHelpfulCount: { increment: 1 } },
    }),
  ]);
}
```

## Search Component

```typescript
// components/knowledge-base/search.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Search, FileText } from "lucide-react";

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: { name: string; slug: string };
}

export function KnowledgeBaseSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    fetch(`/api/knowledge-base/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data) => {
        setResults(data.articles);
        setOpen(true);
      })
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  const handleSelect = (slug: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/help/articles/${slug}`);
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder="Search for help..."
          className="pl-10 h-12 text-lg"
        />
      </div>

      {open && (query.length >= 2) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50">
          <Command>
            <CommandList>
              {loading ? (
                <div className="p-4 text-center text-muted-foreground">
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <CommandEmpty>No results found</CommandEmpty>
              ) : (
                <CommandGroup heading="Articles">
                  {results.map((result) => (
                    <CommandItem
                      key={result.id}
                      value={result.slug}
                      onSelect={() => handleSelect(result.slug)}
                      className="flex items-start gap-3 p-3"
                    >
                      <FileText className="h-5 w-5 mt-0.5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{result.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.category.name}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      )}
    </div>
  );
}
```

## Article Page

```typescript
// app/help/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/lib/knowledge-base/service";
import { ArticleContent } from "@/components/knowledge-base/article-content";
import { ArticleFeedback } from "@/components/knowledge-base/article-feedback";
import { RelatedArticles } from "@/components/knowledge-base/related-articles";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const relatedArticles = await getRelatedArticles(article.id);

  return (
    <div className="container max-w-4xl py-8">
      <Breadcrumbs
        items={[
          { label: "Help Center", href: "/help" },
          { label: article.category.name, href: `/help/categories/${article.category.slug}` },
          { label: article.title },
        ]}
      />

      <article className="mt-8">
        <h1 className="text-3xl font-bold mb-4">{article.title}</h1>

        <ArticleContent content={article.content} />

        <div className="mt-12 pt-8 border-t">
          <ArticleFeedback
            articleId={article.id}
            helpfulCount={article.helpfulCount}
            notHelpfulCount={article.notHelpfulCount}
          />
        </div>

        {relatedArticles.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Related Articles</h2>
            <RelatedArticles articles={relatedArticles} />
          </div>
        )}
      </article>
    </div>
  );
}
```

## Feedback Component

```typescript
// components/knowledge-base/article-feedback.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { submitFeedbackAction } from "@/app/actions/knowledge-base";

interface ArticleFeedbackProps {
  articleId: string;
  helpfulCount: number;
  notHelpfulCount: number;
}

export function ArticleFeedback({
  articleId,
  helpfulCount,
  notHelpfulCount,
}: ArticleFeedbackProps) {
  const [submitted, setSubmitted] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [helpful, setHelpful] = useState<boolean | null>(null);
  const [comment, setComment] = useState("");

  const handleFeedback = async (isHelpful: boolean) => {
    setHelpful(isHelpful);

    if (!isHelpful) {
      setShowComment(true);
    } else {
      await submitFeedbackAction(articleId, true);
      setSubmitted(true);
    }
  };

  const handleSubmitComment = async () => {
    await submitFeedbackAction(articleId, false, comment);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-muted-foreground">Thank you for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-muted-foreground">
        Was this article helpful?
      </p>

      {!showComment ? (
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => handleFeedback(true)}
            className="flex items-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            Yes ({helpfulCount})
          </Button>
          <Button
            variant="outline"
            onClick={() => handleFeedback(false)}
            className="flex items-center gap-2"
          >
            <ThumbsDown className="h-4 w-4" />
            No ({notHelpfulCount})
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="How can we improve this article?"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowComment(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitComment}>
              Submit Feedback
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Category Browser

```typescript
// components/knowledge-base/category-browser.tsx
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { FolderOpen, FileText, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  _count: { articles: number };
}

export function CategoryBrowser({ categories }: { categories: Category[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <Link key={category.id} href={`/help/categories/${category.slug}`}>
          <Card className="p-6 hover:shadow-md transition-shadow h-full">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FolderOpen className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-2">
                  {category.name}
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </h3>
                {category.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {category.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {category._count.articles} articles
                </p>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
```

## Anti-patterns

### Don't Skip Search Analytics

```typescript
// BAD - No tracking
const results = await searchArticles(query);
return results;

// GOOD - Track searches for improvement
await trackSearch(query, results.length);
const results = await searchArticles(query);
return results;
```

## Related Patterns

- [search](./search.md)
- [mdx-content](./mdx-content.md)
- [embeddings](./embeddings.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Category hierarchy
- Full-text search
- Article feedback
- View analytics
