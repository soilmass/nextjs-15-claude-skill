---
id: t-help-center-page
name: Help Center Page
version: 2.0.0
layer: L4
category: pages
description: FAQ and help center page with search and categorized articles
tags: [help, faq, support, documentation, knowledge-base]
performance:
  impact: medium
  lcp: medium
  cls: low
composes:
  - ../organisms/faq.md
  - ../molecules/search-input.md
  - ../molecules/card.md
dependencies:
  - react
  - next
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
formula: "HelpCenterPage = FAQ(o-faq) + SearchInput(m-search-input) + Card(m-card)"
---

# Help Center Page

## Overview

A comprehensive help center page with searchable FAQ, categorized articles, and contact support options. Supports both static content and dynamic content from a CMS.

## Composition Diagram

```
+------------------------------------------------------------------+
|                      HELP CENTER PAGE                             |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  |                      Help Hero                              |  |
|  |  [LifeBuoy Icon]                                           |  |
|  |  "How can we help you?"                                    |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                Search Input (m-search-input)               |  |
|  |  +------------------------------------------------------+  |  |
|  |  | [Search Icon] Search for articles, guides...    [X]  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  +------------------------------------------------------+  |  |
|  |  |              Search Results Dropdown                 |  |  |
|  |  |  [FileText] Article Title                       [>]  |  |  |
|  |  |  [FileText] Article Title                       [>]  |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |              Browse by Category (Cards: m-card)            |  |
|  |  +--------------+ +--------------+ +--------------+        |  |
|  |  | [Zap Icon]   | | [CreditCard] | | [Settings]   |        |  |
|  |  | Getting      | | Billing &    | | Account      |        |  |
|  |  | Started      | | Payments     | | Settings     |        |  |
|  |  | 12 articles  | | 8 articles   | | 15 articles  |        |  |
|  |  +--------------+ +--------------+ +--------------+        |  |
|  |  +--------------+ +--------------+ +--------------+        |  |
|  |  | [Shield]     | | [Users]      | | [Package]    |        |  |
|  |  | Security     | | Teams        | | Integrations |        |  |
|  |  +--------------+ +--------------+ +--------------+        |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |              Popular Articles (Cards: m-card)              |  |
|  |  +-----------------+ +-----------------+ +-----------------+|  |
|  |  |[FileText] Title | |[FileText] Title | |[FileText] Title ||  |
|  |  | Category        | | Category        | | Category        ||  |
|  |  | [Eye] views     | | [Eye] views     | | [Eye] views     ||  |
|  |  +-----------------+ +-----------------+ +-----------------+|  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                  Contact Support                           |  |
|  |  +----------------+ +----------------+ +----------------+  |  |
|  |  | [MessageSquare]| | [Mail]         | | [Phone]        |  |  |
|  |  | Live Chat      | | Email Support  | | Phone Support  |  |  |
|  |  | Available 24/7 | | 24hr response  | | Mon-Fri 9-6    |  |  |
|  |  | [Start Chat]   | | [Send Email]   | | [Call Now]     |  |  |
|  |  +----------------+ +----------------+ +----------------+  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |               FAQ Accordion (o-faq)                        |  |
|  |  +------------------------------------------------------+  |  |
|  |  | Question 1?                                     [v]  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | Question 2?                                     [>]  |  |  |
|  |  +------------------------------------------------------+  |  |
|  |  | Question 3?                                     [>]  |  |  |
|  |  +------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

## When to Use

Use this skill when:
- Building help/support center pages
- Creating searchable FAQ sections
- Implementing knowledge base systems
- Building customer self-service portals

## Implementation

### Help Center Page

```tsx
// app/help/page.tsx
import { Suspense } from 'react';
import { HelpSearch } from '@/components/help/help-search';
import { HelpCategories } from '@/components/help/help-categories';
import { PopularArticles } from '@/components/help/popular-articles';
import { ContactSupport } from '@/components/help/contact-support';
import { HelpHero } from '@/components/help/help-hero';

export const metadata = {
  title: 'Help Center',
  description: 'Find answers to your questions and get support',
};

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      <HelpHero />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search */}
        <div className="mb-12">
          <Suspense fallback={<div className="h-14 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />}>
            <HelpSearch />
          </Suspense>
        </div>

        {/* Categories */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
            Browse by Category
          </h2>
          <HelpCategories />
        </section>

        {/* Popular Articles */}
        <section className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900 dark:text-white">
            Popular Articles
          </h2>
          <PopularArticles />
        </section>

        {/* Contact Support */}
        <section>
          <ContactSupport />
        </section>
      </main>
    </div>
  );
}
```

### Help Hero

```tsx
// components/help/help-hero.tsx
import { LifeBuoy } from 'lucide-react';

export function HelpHero() {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-16 text-center text-white dark:from-blue-800 dark:to-blue-950">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 inline-flex rounded-full bg-white/20 p-4">
          <LifeBuoy className="h-10 w-10" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
          How can we help you?
        </h1>
        <p className="text-lg text-blue-100">
          Search our knowledge base or browse categories to find answers
        </p>
      </div>
    </header>
  );
}
```

### Help Search

```tsx
// components/help/help-search.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, FileText, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

interface SearchResult {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  slug: string;
}

export function HelpSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const searchArticles = useDebouncedCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/help/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setResults(data.articles || []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, 300);

  useEffect(() => {
    searchArticles(query);
  }, [query, searchArticles]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query) {
      router.push(`/help/search?q=${encodeURIComponent(query)}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative mx-auto max-w-2xl">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for articles, guides, tutorials..."
            className="w-full rounded-xl border-0 bg-white py-4 pl-12 pr-12 text-gray-900 shadow-lg ring-1 ring-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:ring-gray-700"
            aria-label="Search help articles"
            aria-expanded={isOpen}
            aria-controls="search-results"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          id="search-results"
          className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
          role="listbox"
        >
          {isLoading ? (
            <div className="p-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="mb-3 last:mb-0">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {results.slice(0, 5).map((result) => (
                  <li key={result.id}>
                    <a
                      href={`/help/articles/${result.slug}`}
                      className="flex items-start gap-3 p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      onClick={() => setIsOpen(false)}
                    >
                      <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {result.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-1 dark:text-gray-400">
                          {result.excerpt}
                        </p>
                        <span className="mt-1 inline-block text-xs text-blue-600 dark:text-blue-400">
                          {result.category}
                        </span>
                      </div>
                      <ArrowRight className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                    </a>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50">
                <button
                  onClick={handleSubmit}
                  className="flex w-full items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View all results
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No articles found for "{query}"
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Try different keywords or{' '}
                <a href="/help/contact" className="text-blue-600 hover:underline dark:text-blue-400">
                  contact support
                </a>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

### Help Categories

```tsx
// components/help/help-categories.tsx
import Link from 'next/link';
import {
  CreditCard,
  Settings,
  Shield,
  Users,
  Package,
  MessageCircle,
  BookOpen,
  Zap,
} from 'lucide-react';

const categories = [
  {
    id: 'getting-started',
    name: 'Getting Started',
    description: 'Learn the basics and set up your account',
    icon: Zap,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
    articleCount: 12,
  },
  {
    id: 'billing',
    name: 'Billing & Payments',
    description: 'Manage subscriptions, invoices, and payment methods',
    icon: CreditCard,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
    articleCount: 8,
  },
  {
    id: 'account',
    name: 'Account Settings',
    description: 'Profile, preferences, and security settings',
    icon: Settings,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
    articleCount: 15,
  },
  {
    id: 'security',
    name: 'Security & Privacy',
    description: 'Two-factor authentication, data privacy, and more',
    icon: Shield,
    color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    articleCount: 10,
  },
  {
    id: 'teams',
    name: 'Teams & Collaboration',
    description: 'Invite members, manage roles, and collaborate',
    icon: Users,
    color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400',
    articleCount: 7,
  },
  {
    id: 'integrations',
    name: 'Integrations',
    description: 'Connect with third-party apps and services',
    icon: Package,
    color: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400',
    articleCount: 20,
  },
  {
    id: 'api',
    name: 'API & Developers',
    description: 'API documentation, SDKs, and webhooks',
    icon: BookOpen,
    color: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
    articleCount: 25,
  },
  {
    id: 'troubleshooting',
    name: 'Troubleshooting',
    description: 'Common issues and how to resolve them',
    icon: MessageCircle,
    color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
    articleCount: 18,
  },
];

export function HelpCategories() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/help/category/${category.id}`}
          className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
        >
          <div className={`mb-4 inline-flex rounded-lg p-3 ${category.color}`}>
            <category.icon className="h-6 w-6" />
          </div>
          <h3 className="mb-2 font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {category.name}
          </h3>
          <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            {category.description}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-500">
            {category.articleCount} articles
          </span>
        </Link>
      ))}
    </div>
  );
}
```

### Popular Articles

```tsx
// components/help/popular-articles.tsx
import Link from 'next/link';
import { FileText, ChevronRight, Eye } from 'lucide-react';

const articles = [
  {
    id: '1',
    title: 'How to reset your password',
    category: 'Account Settings',
    views: 12540,
    slug: 'reset-password',
  },
  {
    id: '2',
    title: 'Setting up two-factor authentication',
    category: 'Security & Privacy',
    views: 8920,
    slug: 'two-factor-auth',
  },
  {
    id: '3',
    title: 'Understanding your billing cycle',
    category: 'Billing & Payments',
    views: 7650,
    slug: 'billing-cycle',
  },
  {
    id: '4',
    title: 'Inviting team members to your workspace',
    category: 'Teams & Collaboration',
    views: 6340,
    slug: 'invite-team-members',
  },
  {
    id: '5',
    title: 'Connecting to Slack integration',
    category: 'Integrations',
    views: 5890,
    slug: 'slack-integration',
  },
  {
    id: '6',
    title: 'API rate limits and best practices',
    category: 'API & Developers',
    views: 4520,
    slug: 'api-rate-limits',
  },
];

export function PopularArticles() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <Link
          key={article.id}
          href={`/help/articles/${article.slug}`}
          className="group flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-700"
        >
          <div className="flex-shrink-0 rounded-lg bg-gray-100 p-2.5 dark:bg-gray-800">
            <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {article.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
              {article.category}
            </p>
            <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
              <Eye className="h-3.5 w-3.5" />
              <span>{article.views.toLocaleString()} views</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
        </Link>
      ))}
    </div>
  );
}
```

### Contact Support

```tsx
// components/help/contact-support.tsx
import Link from 'next/link';
import { MessageSquare, Mail, Phone, Clock } from 'lucide-react';

const contactOptions = [
  {
    id: 'chat',
    name: 'Live Chat',
    description: 'Chat with our support team in real-time',
    icon: MessageSquare,
    availability: 'Available 24/7',
    action: 'Start Chat',
    href: '/help/chat',
    primary: true,
  },
  {
    id: 'email',
    name: 'Email Support',
    description: 'Send us a detailed message and we\'ll respond within 24 hours',
    icon: Mail,
    availability: 'Response within 24 hours',
    action: 'Send Email',
    href: '/help/contact',
    primary: false,
  },
  {
    id: 'phone',
    name: 'Phone Support',
    description: 'Speak directly with our support team',
    icon: Phone,
    availability: 'Mon-Fri, 9am-6pm EST',
    action: 'Call Now',
    href: 'tel:+1-800-123-4567',
    primary: false,
  },
];

export function ContactSupport() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Still need help?
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Can't find what you're looking for? Our support team is here to help.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {contactOptions.map((option) => (
          <div
            key={option.id}
            className="rounded-xl border border-gray-200 p-6 text-center dark:border-gray-700"
          >
            <div
              className={`mx-auto mb-4 inline-flex rounded-full p-3 ${
                option.primary
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              <option.icon className="h-6 w-6" />
            </div>
            <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
              {option.name}
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
              {option.description}
            </p>
            <div className="mb-4 flex items-center justify-center gap-1 text-xs text-gray-500">
              <Clock className="h-3.5 w-3.5" />
              <span>{option.availability}</span>
            </div>
            <Link
              href={option.href}
              className={`inline-flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                option.primary
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
              }`}
            >
              {option.action}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Article Page

```tsx
// app/help/articles/[slug]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ThumbsUp, ThumbsDown, Clock, Eye } from 'lucide-react';
import { ArticleFeedback } from '@/components/help/article-feedback';
import { RelatedArticles } from '@/components/help/related-articles';

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/help/articles/${slug}`, {
    next: { revalidate: 3600 },
  });
  
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) return { title: 'Article Not Found' };
  
  return {
    title: `${article.title} | Help Center`,
    description: article.excerpt,
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link
            href="/help"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Help Center
          </Link>
        </nav>

        {/* Article */}
        <article className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <header className="mb-8">
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {article.category}
            </span>
            <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
              {article.title}
            </h1>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime} min read
              </span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {article.views.toLocaleString()} views
              </span>
              <span>Last updated: {new Date(article.updatedAt).toLocaleDateString()}</span>
            </div>
          </header>

          {/* Content */}
          <div
            className="prose prose-gray max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Feedback */}
          <ArticleFeedback articleId={article.id} />
        </article>

        {/* Related Articles */}
        <Suspense fallback={null}>
          <RelatedArticles currentSlug={slug} category={article.category} />
        </Suspense>
      </div>
    </div>
  );
}
```

### Article Feedback

```tsx
// components/help/article-feedback.tsx
'use client';

import { useState } from 'react';
import { ThumbsUp, ThumbsDown, Check } from 'lucide-react';

interface ArticleFeedbackProps {
  articleId: string;
}

export function ArticleFeedback({ articleId }: ArticleFeedbackProps) {
  const [feedback, setFeedback] = useState<'helpful' | 'not-helpful' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = async (type: 'helpful' | 'not-helpful') => {
    setIsSubmitting(true);
    try {
      await fetch(`/api/help/articles/${articleId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      setFeedback(type);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (feedback) {
    return (
      <div className="mt-8 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
        <span className="text-green-700 dark:text-green-300">
          Thanks for your feedback!
        </span>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-6 text-center dark:border-gray-700 dark:bg-gray-800/50">
      <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
        Was this article helpful?
      </h3>
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={() => submitFeedback('helpful')}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:shadow disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
        >
          <ThumbsUp className="h-4 w-4" />
          Yes, it helped
        </button>
        <button
          onClick={() => submitFeedback('not-helpful')}
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 transition-all hover:bg-gray-50 hover:shadow disabled:opacity-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-700"
        >
          <ThumbsDown className="h-4 w-4" />
          No, I need more help
        </button>
      </div>
    </div>
  );
}
```

## Variants

### FAQ Accordion Style

```tsx
// components/help/faq-accordion.tsx
'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export function FAQAccordion({ faqs }: { faqs: FAQ[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white dark:divide-gray-700 dark:border-gray-800 dark:bg-gray-900">
      {faqs.map((faq) => (
        <div key={faq.id}>
          <button
            onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
            className="flex w-full items-center justify-between p-6 text-left"
            aria-expanded={openId === faq.id}
          >
            <span className="font-medium text-gray-900 dark:text-white">
              {faq.question}
            </span>
            <ChevronDown
              className={`h-5 w-5 text-gray-500 transition-transform ${
                openId === faq.id ? 'rotate-180' : ''
              }`}
            />
          </button>
          <AnimatePresence>
            {openId === faq.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400">
                  {faq.answer}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
```

## Usage

```tsx
// Basic help center page
// Navigate to /help

// Link to specific category
<Link href="/help/category/billing">Billing Help</Link>

// Link to specific article
<Link href="/help/articles/reset-password">Password Reset Guide</Link>

// Search link with query
<Link href="/help/search?q=payment">Search payment articles</Link>
```

## Error States

### Search Error

```tsx
// components/help/search-error.tsx
'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

export function SearchError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center dark:border-red-800 dark:bg-red-900/20">
      <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
      <p className="mt-2 text-sm text-red-700 dark:text-red-300">
        Search failed. Please try again.
      </p>
      <button
        onClick={onRetry}
        className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-red-600 hover:underline dark:text-red-400"
      >
        <RefreshCw className="h-3 w-3" />
        Retry
      </button>
    </div>
  );
}
```

### Article Not Found

```tsx
// components/help/article-not-found.tsx
import { FileQuestion } from 'lucide-react';
import Link from 'next/link';

export function ArticleNotFound() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
      <FileQuestion className="mx-auto h-12 w-12 text-gray-400" />
      <h2 className="mt-4 text-xl font-semibold">Article not found</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        The article you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link
          href="/help"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Help Center
        </Link>
        <Link
          href="/help/contact"
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
}
```

### Error Boundary

```tsx
// app/help/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function HelpError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Help center error:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
        <h2 className="mt-4 text-xl font-semibold">Something went wrong</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't load this page. Please try again.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <a
            href="/help"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
          >
            <Home className="h-4 w-4" />
            Help home
          </a>
        </div>
      </div>
    </div>
  );
}
```

## Loading States

### Page Loading Skeleton

```tsx
// app/help/loading.tsx
export default function HelpLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Hero skeleton */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-16 text-center">
        <div className="mx-auto h-16 w-16 animate-pulse rounded-full bg-white/20" />
        <div className="mx-auto mt-6 h-10 w-64 animate-pulse rounded bg-white/20" />
        <div className="mx-auto mt-4 h-6 w-96 max-w-full animate-pulse rounded bg-white/20" />
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Search skeleton */}
        <div className="mx-auto mb-12 max-w-2xl">
          <div className="h-14 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
        </div>

        {/* Categories skeleton */}
        <div className="mb-8 h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="mb-4 h-12 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-2 h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="mt-3 h-3 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```

### Search Loading

```tsx
// components/help/search-loading.tsx
export function SearchLoading() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Layout

```tsx
// components/help/responsive-help-center.tsx
export function ResponsiveHelpCenter() {
  return (
    <div className="min-h-screen">
      {/* Hero - responsive padding */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 px-4 py-12 sm:py-16 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 sm:mb-6 inline-flex rounded-full bg-white/20 p-3 sm:p-4">
            <LifeBuoy className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            How can we help?
          </h1>
          <p className="text-base sm:text-lg text-blue-100 px-4">
            Search our knowledge base or browse categories
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:px-8">
        {/* Search - full width on mobile */}
        <div className="mb-8 sm:mb-12">
          <HelpSearch />
        </div>

        {/* Categories - responsive grid */}
        <section className="mb-12 sm:mb-16">
          <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-bold">
            Browse by Category
          </h2>
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>

        {/* Popular articles - responsive grid */}
        <section className="mb-12 sm:mb-16">
          <h2 className="mb-6 sm:mb-8 text-xl sm:text-2xl font-bold">
            Popular Articles
          </h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>

        {/* Contact support - stack on mobile */}
        <ContactSupport />
      </main>
    </div>
  );
}
```

### Mobile Search

```tsx
// components/help/mobile-search.tsx
'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

export function MobileHelpSearch() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative sm:hidden">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className="flex w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left text-gray-500 dark:bg-gray-800"
        >
          <Search className="h-5 w-5" />
          <span>Search for help...</span>
        </button>
      ) : (
        <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-3 border-b p-4">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Search for help..."
              autoFocus
              className="flex-1 bg-transparent outline-none"
            />
            <button onClick={() => setIsExpanded(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>
          {/* Search results */}
          <div className="p-4">
            {/* Results go here */}
          </div>
        </div>
      )}
    </div>
  );
}
```

### Breakpoint Reference

| Element | Mobile (<640px) | Tablet (640-1024px) | Desktop (>1024px) |
|---------|----------------|---------------------|-------------------|
| Hero padding | 48px | 64px | 64px |
| Categories | 1 column | 2 columns | 4 columns |
| Articles | 1 column | 2 columns | 3 columns |
| Contact cards | Stacked | 3 columns | 3 columns |
| Search | Full screen | Dropdown | Dropdown |

## SEO Considerations

### Metadata Configuration

```tsx
// app/help/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center | Support',
  description: 'Find answers to your questions and get support',
  openGraph: {
    title: 'Help Center',
    description: 'Search our knowledge base or contact support',
    type: 'website',
  },
};
```

### Article Metadata

```tsx
// app/help/articles/[slug]/page.tsx
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);

  return {
    title: `${article.title} | Help Center`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
    },
  };
}
```

### Structured Data

```tsx
// components/help/help-structured-data.tsx
export function HelpStructuredData({ categories }: { categories: Category[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: categories.flatMap((cat) =>
      cat.articles.map((article) => ({
        '@type': 'Question',
        name: article.title,
        acceptedAnswer: {
          '@type': 'Answer',
          text: article.excerpt,
        },
      }))
    ),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
```

## Testing Strategies

### Component Testing

```tsx
// __tests__/help-center.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import HelpCenterPage from '@/app/help/page';
import { HelpSearch } from '@/components/help/help-search';

describe('HelpCenterPage', () => {
  it('renders help center header', () => {
    render(<HelpCenterPage />);
    expect(screen.getByText('How can we help you?')).toBeInTheDocument();
  });

  it('displays categories', () => {
    render(<HelpCenterPage />);
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
    expect(screen.getByText('Billing & Payments')).toBeInTheDocument();
  });
});

describe('HelpSearch', () => {
  it('searches articles', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        articles: [{ id: '1', title: 'Test Article', slug: 'test' }],
      }),
    });

    render(<HelpSearch />);

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'password' },
    });

    await waitFor(() => {
      expect(screen.getByText('Test Article')).toBeInTheDocument();
    });
  });

  it('shows no results message', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ articles: [] }),
    });

    render(<HelpSearch />);

    fireEvent.change(screen.getByPlaceholderText(/search/i), {
      target: { value: 'nonexistent' },
    });

    await waitFor(() => {
      expect(screen.getByText(/no articles found/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Testing

```tsx
// e2e/help-center.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Help Center', () => {
  test('displays categories', async ({ page }) => {
    await page.goto('/help');

    await expect(page.getByText('Getting Started')).toBeVisible();
    await expect(page.getByText('Billing & Payments')).toBeVisible();
  });

  test('search works', async ({ page }) => {
    await page.goto('/help');

    await page.fill('[placeholder*="Search"]', 'password');
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('category navigation', async ({ page }) => {
    await page.goto('/help');

    await page.click('text=Getting Started');
    await expect(page).toHaveURL(/category\/getting-started/);
  });

  test('article feedback works', async ({ page }) => {
    await page.goto('/help/articles/reset-password');

    await page.click('text=Yes, it helped');
    await expect(page.getByText('Thanks for your feedback')).toBeVisible();
  });

  test('mobile search expands', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/help');

    await page.click('[placeholder*="Search"]');
    await expect(page.locator('[data-testid="mobile-search"]')).toBeVisible();
  });
});
```

### Accessibility Testing

```tsx
// __tests__/help-accessibility.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import HelpCenterPage from '@/app/help/page';

expect.extend(toHaveNoViolations);

describe('Help Center Accessibility', () => {
  it('has no violations', async () => {
    const { container } = render(<HelpCenterPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('search has proper ARIA attributes', () => {
    const { container } = render(<HelpCenterPage />);
    const search = container.querySelector('[role="search"]') || container.querySelector('input[type="search"]');
    expect(search).toHaveAttribute('aria-label');
  });

  it('category cards are keyboard accessible', () => {
    const { getAllByRole } = render(<HelpCenterPage />);
    const links = getAllByRole('link');
    links.forEach((link) => {
      expect(link).toHaveAttribute('href');
    });
  });
});
```

## Related Skills

- [L3/search-modal](../organisms/search-modal.md) - Command palette search
- [L3/cookie-consent](../organisms/cookie-consent.md) - GDPR compliance
- [L4/404-page](./404-page.md) - Error pages

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with search, categories, and contact options
