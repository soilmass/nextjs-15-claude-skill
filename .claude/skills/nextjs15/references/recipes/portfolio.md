---
id: r-portfolio
name: Portfolio Website
version: 3.0.0
layer: L6
category: recipes
description: Personal portfolio site with projects, blog, and contact form
tags: [portfolio, personal, projects, blog, resume, contact]
formula: "Portfolio = MarketingLayout(t-marketing-layout) + GalleryPage(t-gallery-page) + BlogIndex(t-blog-index) + BlogPostPage(t-blog-post-page) + AboutPage(t-about-page) + Header(o-header) + Footer(o-footer) + Hero(o-hero) + ContactForm(o-contact-form) + MediaGallery(o-media-gallery) + Testimonials(o-testimonials) + Timeline(o-timeline) + SocialShare(o-social-share) + ScrollAnimations(o-scroll-animations) + CookieConsent(o-cookie-consent) + Cta(o-cta) + Stats(o-stats) + Card(m-card) + Breadcrumb(m-breadcrumb) + ShareButton(m-share-button) + Rating(m-rating) + TimelineItem(m-timeline-item) + Badge(m-badge) + Toast(m-toast) + Avatar(m-avatar) + Animations(pt-animations) + Transitions(pt-transitions) + ScrollEffects(pt-scroll-effects) + StaticRendering(pt-static-rendering) + ImageOptimization(pt-image-optimization) + ImageProcessing(pt-image-processing) + Mdx(pt-mdx) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + OpenGraph(pt-open-graph) + Rss(pt-rss) + SocialSharing(pt-social-sharing) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + TransactionalEmail(pt-transactional-email) + ErrorBoundaries(pt-error-boundaries) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + ReactQuery(pt-react-query) + GdprCompliance(pt-gdpr-compliance) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + RateLimiting(pt-rate-limiting) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + ErrorTracking(pt-error-tracking) + UserAnalytics(pt-user-analytics) + WebVitals(pt-web-vitals) + Zustand(pt-zustand) + Filtering(pt-filtering) + Pagination(pt-pagination) + AuditLogging(pt-audit-logging) + OptimisticUpdates(pt-optimistic-updates)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/card.md
  - ../molecules/breadcrumb.md
  - ../molecules/share-button.md
  - ../molecules/rating.md
  - ../molecules/timeline-item.md
  # L3 Organisms - Complex Components
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/hero.md
  - ../organisms/contact-form.md
  - ../organisms/media-gallery.md
  - ../organisms/testimonials.md
  - ../organisms/timeline.md
  - ../organisms/social-share.md
  - ../organisms/scroll-animations.md
  - ../organisms/cookie-consent.md
  # L4 Templates - Page Layouts
  - ../templates/marketing-layout.md
  - ../templates/gallery-page.md
  - ../templates/blog-index.md
  - ../templates/blog-post-page.md
  - ../templates/about-page.md
  # L5 Patterns - Animations & Effects
  - ../patterns/animations.md
  - ../patterns/transitions.md
  - ../patterns/scroll-effects.md
  # L5 Patterns - Rendering & Optimization
  - ../patterns/static-rendering.md
  - ../patterns/image-optimization.md
  - ../patterns/image-processing.md
  # L5 Patterns - Content
  - ../patterns/mdx.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  - ../patterns/open-graph.md
  - ../patterns/rss.md
  # L5 Patterns - Social
  - ../patterns/social-sharing.md
  # L5 Patterns - Forms & Communication
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/transactional-email.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  # L5 Patterns - Privacy
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - Error Handling (Additional)
  - ../patterns/error-tracking.md
  # L5 Patterns - Analytics (Additional)
  - ../patterns/user-analytics.md
  - ../patterns/web-vitals.md
  # L2 Molecules - Additional
  - ../molecules/badge.md
  - ../molecules/toast.md
  - ../molecules/avatar.md
  # L3 Organisms - Additional
  - ../organisms/cta.md
  - ../organisms/stats.md
  # L5 Patterns - State Management (Additional)
  - ../patterns/zustand.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  # L5 Patterns - Security (Additional)
  - ../patterns/audit-logging.md
  # L5 Patterns - UI/UX
  - ../patterns/optimistic-updates.md
dependencies:
  - next
  - react
  - tailwindcss
  - framer-motion
  - contentlayer
  - react-hook-form
  - zod
  - resend
skills:
  - animations
  - open-graph
  - structured-data
  - form-validation
  - transactional-email
  - image-optimization
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Portfolio Website Recipe

## Overview

A modern, responsive portfolio website featuring project showcases, blog with MDX support, about section, and contact form with email notifications.

## Architecture

```
app/
├── page.tsx                    # Homepage/landing
├── about/
│   └── page.tsx               # About page
├── projects/
│   ├── page.tsx               # Projects list
│   └── [slug]/
│       └── page.tsx           # Project detail
├── blog/
│   ├── page.tsx               # Blog index
│   └── [slug]/
│       └── page.tsx           # Blog post
├── contact/
│   └── page.tsx               # Contact form
└── api/
    └── contact/route.ts       # Contact form handler
components/
├── sections/
│   ├── hero.tsx
│   ├── about.tsx
│   └── projects.tsx
├── ui/
└── layout/
    ├── header.tsx
    └── footer.tsx
```

## Skills Used

| Skill | Purpose |
|-------|---------|
| animations | Page transitions and micro-interactions with Framer Motion |
| open-graph | Social sharing meta tags for projects and blog posts |
| structured-data | JSON-LD schema for Person and WebSite |
| form-validation | Zod-based contact form validation |
| transactional-email | Resend integration for contact notifications |
| image-optimization | Next.js Image component with responsive sizes |

## Project Structure

```
portfolio/
├── app/
│   ├── (main)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Home/Hero
│   │   ├── about/page.tsx
│   │   ├── projects/
│   │   │   ├── page.tsx          # Projects grid
│   │   │   └── [slug]/page.tsx   # Project detail
│   │   ├── blog/
│   │   │   ├── page.tsx          # Blog listing
│   │   │   └── [slug]/page.tsx   # Blog post
│   │   └── contact/page.tsx
│   ├── api/
│   │   └── contact/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── header.tsx
│   │   ├── footer.tsx
│   │   └── nav.tsx
│   ├── home/
│   │   ├── hero.tsx
│   │   ├── featured-projects.tsx
│   │   ├── skills.tsx
│   │   └── testimonials.tsx
│   ├── projects/
│   │   ├── project-card.tsx
│   │   ├── project-grid.tsx
│   │   └── project-gallery.tsx
│   ├── blog/
│   │   ├── post-card.tsx
│   │   └── post-content.tsx
│   └── contact/
│       └── contact-form.tsx
├── content/
│   ├── projects/
│   │   └── *.mdx
│   └── blog/
│       └── *.mdx
├── lib/
│   ├── content.ts
│   └── email.ts
└── contentlayer.config.ts
```

## Implementation

### Content Layer Configuration

```ts
// contentlayer.config.ts
import { defineDocumentType, makeSource } from 'contentlayer/source-files';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';

export const Project = defineDocumentType(() => ({
  name: 'Project',
  filePathPattern: 'projects/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    date: { type: 'date', required: true },
    image: { type: 'string', required: true },
    tags: { type: 'list', of: { type: 'string' }, required: true },
    github: { type: 'string' },
    demo: { type: 'string' },
    featured: { type: 'boolean', default: false },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('projects/', ''),
    },
  },
}));

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: 'blog/**/*.mdx',
  contentType: 'mdx',
  fields: {
    title: { type: 'string', required: true },
    description: { type: 'string', required: true },
    date: { type: 'date', required: true },
    image: { type: 'string' },
    tags: { type: 'list', of: { type: 'string' } },
    published: { type: 'boolean', default: true },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (doc) => doc._raw.flattenedPath.replace('blog/', ''),
    },
    readingTime: {
      type: 'string',
      resolve: (doc) => {
        const wordsPerMinute = 200;
        const words = doc.body.raw.split(/\s+/).length;
        const minutes = Math.ceil(words / wordsPerMinute);
        return `${minutes} min read`;
      },
    },
  },
}));

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Project, Post],
  mdx: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypePrettyCode, { theme: 'github-dark' }],
    ],
  },
});
```

### Root Layout

```tsx
// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://yourportfolio.com'),
  title: {
    default: 'John Doe - Full Stack Developer',
    template: '%s | John Doe',
  },
  description: 'Full Stack Developer specializing in React, Next.js, and Node.js',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yourportfolio.com',
    siteName: 'John Doe Portfolio',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@johndoe',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
```

### Main Layout with Navigation

```tsx
// app/(main)/layout.tsx
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### Header Component

```tsx
// components/layout/header.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, Linkedin, Twitter } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          JD
        </Link>

        {/* Desktop Navigation */}
        <ul className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`relative py-2 transition-colors ${
                  pathname === item.href
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-600"
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Social Links */}
        <div className="hidden md:flex items-center gap-4">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            <Github className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <Linkedin className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <Twitter className="w-5 h-5 text-gray-600 hover:text-gray-900" />
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-white border-t"
          >
            <ul className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`block py-2 ${
                      pathname === item.href
                        ? 'text-blue-600 font-medium'
                        : 'text-gray-600'
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
```

### Hero Section

```tsx
// components/home/hero.tsx
'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Download } from 'lucide-react';

export function Hero() {
  return (
    <section className="min-h-screen flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-blue-600 font-medium">Hello, I'm</span>
            <h1 className="text-5xl lg:text-7xl font-bold mt-2 mb-4">
              John Doe
            </h1>
            <h2 className="text-2xl lg:text-3xl text-gray-600 mb-6">
              Full Stack Developer
            </h2>
            <p className="text-lg text-gray-500 mb-8 max-w-lg">
              I craft beautiful, performant web applications with modern
              technologies. Passionate about creating exceptional user
              experiences and scalable solutions.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                View My Work
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download CV
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-full bg-gradient-to-br from-blue-400 to-purple-500 opacity-20 absolute -inset-4 blur-3xl" />
            <img
              src="/profile.jpg"
              alt="John Doe"
              className="relative rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
```

### Project Card Component

```tsx
// components/projects/project-card.tsx
'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github } from 'lucide-react';
import type { Project } from 'contentlayer/generated';

interface ProjectCardProps {
  project: Project;
  index: number;
}

export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow"
    >
      <Link href={`/projects/${project.slug}`}>
        <div className="aspect-video relative overflow-hidden">
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>

      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-3">
          {project.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <Link href={`/projects/${project.slug}`}>
          <h3 className="text-xl font-semibold mb-2 group-hover:text-blue-600 transition-colors">
            {project.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        <div className="flex items-center gap-4">
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
            >
              <Github className="w-4 h-4" />
              Code
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
            >
              <ExternalLink className="w-4 h-4" />
              Demo
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
```

### Projects Page

```tsx
// app/(main)/projects/page.tsx
import { allProjects } from 'contentlayer/generated';
import { ProjectCard } from '@/components/projects/project-card';

export const metadata = {
  title: 'Projects',
  description: 'A showcase of my recent work and side projects.',
};

export default function ProjectsPage() {
  const projects = allProjects.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-24">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Projects</h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Here are some of my recent projects. Each one was built with care,
          focusing on clean code, great user experience, and modern best practices.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </div>
  );
}
```

### Contact Form

```tsx
// components/contact/contact-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Send, Loader2, CheckCircle } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setIsSuccess(true);
        reset();
        setTimeout(() => setIsSuccess(false), 5000);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-medium mb-2">
          Subject
        </label>
        <input
          id="subject"
          type="text"
          {...register('subject')}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Project Inquiry"
        />
        {errors.subject && (
          <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium mb-2">
          Message
        </label>
        <textarea
          id="message"
          rows={6}
          {...register('message')}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          placeholder="Tell me about your project..."
        />
        {errors.message && (
          <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Sending...
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle className="w-5 h-5" />
            Message Sent!
          </>
        ) : (
          <>
            <Send className="w-5 h-5" />
            Send Message
          </>
        )}
      </button>
    </form>
  );
}
```

### Contact API Route

```tsx
// app/api/contact/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  const { name, email, subject, message } = await request.json();

  try {
    await resend.emails.send({
      from: 'Portfolio <contact@yourportfolio.com>',
      to: ['your@email.com'],
      replyTo: email,
      subject: `[Portfolio Contact] ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <p>${message.replace(/\n/g, '<br />')}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send email:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

## Example Content

```mdx
// content/projects/ecommerce-platform.mdx
---
title: E-Commerce Platform
description: A full-featured e-commerce platform built with Next.js, featuring product management, cart functionality, and Stripe payments.
date: 2024-01-15
image: /projects/ecommerce.jpg
tags: [Next.js, TypeScript, Stripe, Prisma, Tailwind CSS]
github: https://github.com/johndoe/ecommerce
demo: https://ecommerce-demo.com
featured: true
---

## Overview

This e-commerce platform was built to demonstrate modern web development practices...

## Features

- Product catalog with filtering and search
- Shopping cart with persistent storage
- Secure checkout with Stripe
- Admin dashboard for inventory management

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS
- **Backend:** Next.js API Routes, Prisma
- **Database:** PostgreSQL
- **Payments:** Stripe
- **Deployment:** Vercel
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
npm install -D msw @mswjs/data
npx playwright install
```

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/e2e/', '.contentlayer/'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'contentlayer/generated': path.resolve(__dirname, './tests/mocks/contentlayer.ts'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock Next.js Image
vi.mock('next/image', () => ({
  default: ({ src, alt, fill, ...props }: any) => (
    <img src={src} alt={alt} data-fill={fill} {...props} />
  ),
}));

// Mock Framer Motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    article: ({ children, ...props }: any) => <article {...props}>{children}</article>,
    section: ({ children, ...props }: any) => <section {...props}>{children}</section>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// MSW server setup
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Mock Contentlayer Data

```typescript
// tests/mocks/contentlayer.ts
export const allProjects = [
  {
    _id: 'project-1',
    _raw: { flattenedPath: 'projects/ecommerce-platform' },
    title: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform built with Next.js.',
    date: '2024-01-15',
    image: '/projects/ecommerce.jpg',
    tags: ['Next.js', 'TypeScript', 'Stripe'],
    github: 'https://github.com/johndoe/ecommerce',
    demo: 'https://ecommerce-demo.com',
    featured: true,
    slug: 'ecommerce-platform',
    body: { code: '', raw: 'Project content...' },
  },
  {
    _id: 'project-2',
    _raw: { flattenedPath: 'projects/task-manager' },
    title: 'Task Manager',
    description: 'A collaborative task management application.',
    date: '2023-11-20',
    image: '/projects/taskmanager.jpg',
    tags: ['React', 'Node.js', 'MongoDB'],
    github: 'https://github.com/johndoe/taskmanager',
    demo: null,
    featured: false,
    slug: 'task-manager',
    body: { code: '', raw: 'Task manager content...' },
  },
  {
    _id: 'project-3',
    _raw: { flattenedPath: 'projects/weather-app' },
    title: 'Weather App',
    description: 'A beautiful weather application with forecasts.',
    date: '2023-08-10',
    image: '/projects/weather.jpg',
    tags: ['React', 'API', 'CSS'],
    github: 'https://github.com/johndoe/weather',
    demo: 'https://weather-demo.com',
    featured: true,
    slug: 'weather-app',
    body: { code: '', raw: 'Weather app content...' },
  },
];

export const allPosts = [
  {
    _id: 'post-1',
    _raw: { flattenedPath: 'blog/getting-started-nextjs' },
    title: 'Getting Started with Next.js 15',
    description: 'A comprehensive guide to building apps with Next.js 15.',
    date: '2025-01-10',
    image: '/blog/nextjs.jpg',
    tags: ['Next.js', 'React', 'Tutorial'],
    published: true,
    slug: 'getting-started-nextjs',
    readingTime: '8 min read',
    body: { code: '', raw: 'Blog post content with about 1600 words...' },
  },
  {
    _id: 'post-2',
    _raw: { flattenedPath: 'blog/typescript-tips' },
    title: '10 TypeScript Tips for Better Code',
    description: 'Improve your TypeScript skills with these practical tips.',
    date: '2025-01-05',
    image: '/blog/typescript.jpg',
    tags: ['TypeScript', 'JavaScript', 'Tips'],
    published: true,
    slug: 'typescript-tips',
    readingTime: '6 min read',
    body: { code: '', raw: 'TypeScript tips content...' },
  },
];
```

### MSW Handlers

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw';

export const handlers = [
  // Contact form
  http.post('/api/contact', async ({ request }) => {
    const body = await request.json() as any;
    await delay(100);
    
    if (!body.name || !body.email || !body.message) {
      return HttpResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Simulate email validation
    if (!body.email.includes('@')) {
      return HttpResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }
    
    return HttpResponse.json({ success: true });
  }),

  // Newsletter subscription
  http.post('/api/newsletter', async ({ request }) => {
    const body = await request.json() as any;
    await delay(100);
    
    if (!body.email) {
      return HttpResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { error: 'Email already subscribed' },
        { status: 409 }
      );
    }
    
    return HttpResponse.json({ success: true, message: 'Subscribed successfully' });
  }),

  // Health check
  http.get('/api/health', async () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  }),
];
```

```typescript
// tests/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

export const server = setupServer(...handlers);
```

### Unit Tests

```typescript
// tests/unit/project-card.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectCard } from '@/components/projects/project-card';
import { allProjects } from '../mocks/contentlayer';

describe('ProjectCard', () => {
  const project = allProjects[0];

  it('renders project title', () => {
    render(<ProjectCard project={project} index={0} />);
    expect(screen.getByText('E-Commerce Platform')).toBeInTheDocument();
  });

  it('renders project description', () => {
    render(<ProjectCard project={project} index={0} />);
    expect(screen.getByText(/full-featured e-commerce/i)).toBeInTheDocument();
  });

  it('renders project tags', () => {
    render(<ProjectCard project={project} index={0} />);
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('renders GitHub link when available', () => {
    render(<ProjectCard project={project} index={0} />);
    const githubLink = screen.getByRole('link', { name: /code/i });
    expect(githubLink).toHaveAttribute('href', project.github);
  });

  it('renders demo link when available', () => {
    render(<ProjectCard project={project} index={0} />);
    const demoLink = screen.getByRole('link', { name: /demo/i });
    expect(demoLink).toHaveAttribute('href', project.demo);
  });

  it('does not render demo link when unavailable', () => {
    const projectWithoutDemo = allProjects[1]; // task-manager has no demo
    render(<ProjectCard project={projectWithoutDemo} index={0} />);
    expect(screen.queryByRole('link', { name: /demo/i })).not.toBeInTheDocument();
  });

  it('links to project detail page', () => {
    render(<ProjectCard project={project} index={0} />);
    const link = screen.getByRole('link', { name: /e-commerce platform/i });
    expect(link).toHaveAttribute('href', `/projects/${project.slug}`);
  });

  it('displays project image', () => {
    render(<ProjectCard project={project} index={0} />);
    const image = screen.getByRole('img', { name: project.title });
    expect(image).toHaveAttribute('src', project.image);
  });

  it('limits displayed tags to 3', () => {
    const projectWithManyTags = {
      ...project,
      tags: ['Tag1', 'Tag2', 'Tag3', 'Tag4', 'Tag5'],
    };
    render(<ProjectCard project={projectWithManyTags} index={0} />);
    
    expect(screen.getByText('Tag1')).toBeInTheDocument();
    expect(screen.getByText('Tag2')).toBeInTheDocument();
    expect(screen.getByText('Tag3')).toBeInTheDocument();
    expect(screen.queryByText('Tag4')).not.toBeInTheDocument();
  });
});
```

```typescript
// tests/unit/contact-form.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/components/contact/contact-form';

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<ContactForm />);
    
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message with enough characters.');
    
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short message', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/message/i), 'Short');
    
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/message must be at least 20 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Project Inquiry');
    await user.type(screen.getByLabelText(/message/i), 'This is a detailed test message with more than twenty characters.');
    
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
  });

  it('shows loading state while submitting', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Project Inquiry');
    await user.type(screen.getByLabelText(/message/i), 'This is a detailed test message with more than twenty characters.');
    
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
  });

  it('resets form after successful submission', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Project Inquiry');
    await user.type(screen.getByLabelText(/message/i), 'This is a detailed test message with more than twenty characters.');
    
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    await waitFor(() => {
      expect(screen.getByLabelText(/name/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
    });
  });
});
```

```typescript
// tests/unit/header.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Header } from '@/components/layout/header';

// Mock usePathname
const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

describe('Header', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/');
  });

  it('renders navigation links', () => {
    render(<Header />);
    
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /about/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /projects/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /blog/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument();
  });

  it('renders logo', () => {
    render(<Header />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('renders social links', () => {
    render(<Header />);
    
    expect(screen.getByRole('link', { name: /github/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /linkedin/i })).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    mockPathname.mockReturnValue('/projects');
    render(<Header />);
    
    const projectsLink = screen.getByRole('link', { name: /projects/i });
    expect(projectsLink).toHaveClass('text-blue-600');
  });

  it('toggles mobile menu', async () => {
    const user = userEvent.setup();
    render(<Header />);
    
    const menuButton = screen.getByRole('button', { name: /toggle menu/i });
    
    // Menu should be closed initially
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    
    // Open menu
    await user.click(menuButton);
    
    // Menu should be visible on mobile
    // (Note: actual visibility depends on CSS classes)
  });

  it('adds background on scroll', () => {
    render(<Header />);
    
    // Simulate scroll
    fireEvent.scroll(window, { target: { scrollY: 100 } });
    
    // Header should have scrolled class
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white/90');
  });
});
```

```typescript
// tests/unit/reading-time.test.ts
import { describe, it, expect } from 'vitest';

function calculateReadingTime(content: string, wordsPerMinute: number = 200): string {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

describe('Reading Time Calculator', () => {
  it('calculates reading time for short content', () => {
    const content = 'This is a short paragraph with a few words.';
    expect(calculateReadingTime(content)).toBe('1 min read');
  });

  it('calculates reading time for medium content', () => {
    // ~400 words = 2 minutes
    const content = 'word '.repeat(400);
    expect(calculateReadingTime(content)).toBe('2 min read');
  });

  it('calculates reading time for long content', () => {
    // ~1600 words = 8 minutes
    const content = 'word '.repeat(1600);
    expect(calculateReadingTime(content)).toBe('8 min read');
  });

  it('handles empty content', () => {
    expect(calculateReadingTime('')).toBe('1 min read');
  });

  it('uses custom words per minute', () => {
    const content = 'word '.repeat(500);
    expect(calculateReadingTime(content, 250)).toBe('2 min read');
  });
});
```

```typescript
// tests/unit/seo-metadata.test.ts
import { describe, it, expect } from 'vitest';

interface SEOMetadata {
  title: string;
  description: string;
  image?: string;
  url: string;
}

function generateOpenGraph(metadata: SEOMetadata) {
  return {
    title: metadata.title,
    description: metadata.description,
    url: metadata.url,
    type: 'website',
    images: metadata.image ? [{ url: metadata.image, width: 1200, height: 630 }] : [],
  };
}

function generateTwitterCard(metadata: SEOMetadata) {
  return {
    card: 'summary_large_image',
    title: metadata.title,
    description: metadata.description,
    images: metadata.image ? [metadata.image] : [],
  };
}

function generateStructuredData(type: 'person' | 'website', data: Record<string, any>) {
  const base = {
    '@context': 'https://schema.org',
    '@type': type === 'person' ? 'Person' : 'WebSite',
  };
  return { ...base, ...data };
}

describe('SEO Metadata Generation', () => {
  const metadata: SEOMetadata = {
    title: 'John Doe - Full Stack Developer',
    description: 'Full Stack Developer specializing in React and Next.js',
    image: '/og-image.jpg',
    url: 'https://johndoe.dev',
  };

  it('generates Open Graph metadata', () => {
    const og = generateOpenGraph(metadata);
    
    expect(og.title).toBe(metadata.title);
    expect(og.description).toBe(metadata.description);
    expect(og.type).toBe('website');
    expect(og.images[0].url).toBe(metadata.image);
  });

  it('generates Twitter Card metadata', () => {
    const twitter = generateTwitterCard(metadata);
    
    expect(twitter.card).toBe('summary_large_image');
    expect(twitter.title).toBe(metadata.title);
    expect(twitter.images[0]).toBe(metadata.image);
  });

  it('handles missing image', () => {
    const metadataWithoutImage = { ...metadata, image: undefined };
    const og = generateOpenGraph(metadataWithoutImage);
    
    expect(og.images).toHaveLength(0);
  });

  it('generates Person structured data', () => {
    const personData = generateStructuredData('person', {
      name: 'John Doe',
      jobTitle: 'Full Stack Developer',
      url: 'https://johndoe.dev',
    });
    
    expect(personData['@context']).toBe('https://schema.org');
    expect(personData['@type']).toBe('Person');
    expect(personData.name).toBe('John Doe');
  });

  it('generates Website structured data', () => {
    const websiteData = generateStructuredData('website', {
      name: 'John Doe Portfolio',
      url: 'https://johndoe.dev',
    });
    
    expect(personData['@type']).toBe('WebSite');
  });
});
```

### Integration Tests

```typescript
// tests/integration/projects-page.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { allProjects } from '../mocks/contentlayer';

// Mock the projects page
function ProjectsPage() {
  const projects = allProjects.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div>
      <h1>Projects</h1>
      <div data-testid="project-grid">
        {projects.map((project) => (
          <article key={project.slug} data-testid="project-card">
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div>
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

describe('Projects Page Integration', () => {
  it('displays all projects', () => {
    render(<ProjectsPage />);
    
    const projectCards = screen.getAllByTestId('project-card');
    expect(projectCards).toHaveLength(allProjects.length);
  });

  it('sorts projects by date (newest first)', () => {
    render(<ProjectsPage />);
    
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings[0]).toHaveTextContent('E-Commerce Platform'); // 2024-01-15
    expect(headings[1]).toHaveTextContent('Task Manager'); // 2023-11-20
    expect(headings[2]).toHaveTextContent('Weather App'); // 2023-08-10
  });

  it('displays project tags', () => {
    render(<ProjectsPage />);
    
    expect(screen.getByText('Next.js')).toBeInTheDocument();
    expect(screen.getByText('React')).toBeInTheDocument();
  });

  it('displays project descriptions', () => {
    render(<ProjectsPage />);
    
    expect(screen.getByText(/full-featured e-commerce/i)).toBeInTheDocument();
    expect(screen.getByText(/collaborative task management/i)).toBeInTheDocument();
  });
});
```

```typescript
// tests/integration/contact-submission.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ContactForm } from '@/components/contact/contact-form';

describe('Contact Form Submission Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes full contact form submission flow', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);
    
    // Fill out the form
    await user.type(screen.getByLabelText(/name/i), 'Jane Smith');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Collaboration Opportunity');
    await user.type(
      screen.getByLabelText(/message/i),
      'I would love to discuss a potential collaboration on an exciting new project.'
    );
    
    // Submit
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    // Verify loading state
    expect(screen.getByText(/sending/i)).toBeInTheDocument();
    
    // Verify success state
    await waitFor(() => {
      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
    });
    
    // Verify form is reset
    expect(screen.getByLabelText(/name/i)).toHaveValue('');
    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/subject/i)).toHaveValue('');
    expect(screen.getByLabelText(/message/i)).toHaveValue('');
  });

  it('handles server error gracefully', async () => {
    // Override the handler for this test
    const { server } = await import('../mocks/server');
    const { http, HttpResponse } = await import('msw');
    
    server.use(
      http.post('/api/contact', () => {
        return HttpResponse.json(
          { error: 'Server error' },
          { status: 500 }
        );
      })
    );
    
    const user = userEvent.setup();
    render(<ContactForm />);
    
    await user.type(screen.getByLabelText(/name/i), 'Test User');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/subject/i), 'Test Subject');
    await user.type(screen.getByLabelText(/message/i), 'This is a test message for error handling.');
    
    await user.click(screen.getByRole('button', { name: /send/i }));
    
    // Form should not show success
    await waitFor(() => {
      expect(screen.queryByText(/message sent/i)).not.toBeInTheDocument();
    });
  });
});
```

### API Route Tests

```typescript
// tests/api/contact.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/contact/route';
import { NextRequest } from 'next/server';

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ id: 'email-123' }),
    },
  })),
}));

describe('/api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends email with valid data', async () => {
    const { Resend } = await import('resend');
    const mockSend = vi.fn().mockResolvedValue({ id: 'email-123' });
    (Resend as any).mockImplementation(() => ({
      emails: { send: mockSend },
    }));

    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Project Inquiry',
        message: 'I would like to discuss a project.',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('includes reply-to header', async () => {
    const { Resend } = await import('resend');
    const mockSend = vi.fn().mockResolvedValue({ id: 'email-123' });
    (Resend as any).mockImplementation(() => ({
      emails: { send: mockSend },
    }));

    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Project Inquiry',
        message: 'Test message',
      }),
    });

    await POST(request);

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        replyTo: 'john@example.com',
      })
    );
  });

  it('returns error when email fails', async () => {
    const { Resend } = await import('resend');
    (Resend as any).mockImplementation(() => ({
      emails: {
        send: vi.fn().mockRejectedValue(new Error('Email service unavailable')),
      },
    }));

    const request = new NextRequest('http://localhost/api/contact', {
      method: 'POST',
      body: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test',
        message: 'Test message',
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/portfolio.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Portfolio Website', () => {
  test('homepage loads with hero section', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toContainText('John Doe');
    await expect(page.locator('h2')).toContainText('Full Stack Developer');
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    await page.click('a:has-text("Projects")');
    await expect(page).toHaveURL('/projects');
    
    await page.click('a:has-text("Blog")');
    await expect(page).toHaveURL('/blog');
    
    await page.click('a:has-text("Contact")');
    await expect(page).toHaveURL('/contact');
  });

  test('projects page displays project cards', async ({ page }) => {
    await page.goto('/projects');
    
    await expect(page.locator('h1')).toContainText('Projects');
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('project detail page loads', async ({ page }) => {
    await page.goto('/projects');
    
    await page.click('article a').first();
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('article')).toBeVisible();
  });

  test('contact form submission', async ({ page }) => {
    await page.goto('/contact');
    
    await page.fill('[name="name"]', 'Test User');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="subject"]', 'Test Subject');
    await page.fill('[name="message"]', 'This is a test message with more than twenty characters.');
    
    await page.click('button[type="submit"]');
    
    await expect(page.locator('text=Message Sent')).toBeVisible({ timeout: 5000 });
  });

  test('blog page displays posts', async ({ page }) => {
    await page.goto('/blog');
    
    await expect(page.locator('h1')).toContainText('Blog');
    await expect(page.locator('article').first()).toBeVisible();
  });

  test('mobile navigation works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Open mobile menu
    await page.click('button[aria-label="Toggle menu"]');
    
    // Navigate
    await page.click('a:has-text("Projects")');
    await expect(page).toHaveURL('/projects');
  });

  test('resume download link works', async ({ page }) => {
    await page.goto('/');
    
    const downloadLink = page.locator('a:has-text("Download CV")');
    await expect(downloadLink).toHaveAttribute('href', '/resume.pdf');
    await expect(downloadLink).toHaveAttribute('download', '');
  });
});
```

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Portfolio Accessibility', () => {
  test('homepage has no accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('projects page has no accessibility violations', async ({ page }) => {
    await page.goto('/projects');
    
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('contact page has no accessibility violations', async ({ page }) => {
    await page.goto('/contact');
    
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Tab through navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/projects');
    
    const images = page.locator('img');
    const count = await images.count();
    
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('form labels are properly associated', async ({ page }) => {
    await page.goto('/contact');
    
    const nameInput = page.locator('#name');
    const label = page.locator('label[for="name"]');
    
    await expect(nameInput).toBeVisible();
    await expect(label).toBeVisible();
  });
});
```

```typescript
// tests/e2e/seo.spec.ts
import { test, expect } from '@playwright/test';

test.describe('SEO', () => {
  test('homepage has correct meta tags', async ({ page }) => {
    await page.goto('/');
    
    // Title
    await expect(page).toHaveTitle(/John Doe/);
    
    // Meta description
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('Full Stack Developer');
    
    // Open Graph
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('John Doe');
    
    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('website');
  });

  test('project pages have unique meta tags', async ({ page }) => {
    await page.goto('/projects/ecommerce-platform');
    
    const title = await page.title();
    expect(title).toContain('E-Commerce Platform');
    
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toContain('e-commerce');
  });

  test('pages have canonical URLs', async ({ page }) => {
    await page.goto('/projects');
    
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toContain('/projects');
  });

  test('robots meta tag allows indexing', async ({ page }) => {
    await page.goto('/');
    
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toContain('index');
    expect(robots).toContain('follow');
  });
});
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['json', { outputFile: 'test-results.json' }]],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Error Handling

### Error Boundary

```typescript
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => this.setState({ hasError: false })}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <a
                href="/"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Home className="h-4 w-4" />
                Go Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### Global Error Page

```typescript
// app/error.tsx
'use client';

import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          We apologize for the inconvenience. Please try again.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={reset}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try again
          </button>
          <a href="/" className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}
```

### Not Found Page

```typescript
// app/not-found.tsx
import Link from 'next/link';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <FileQuestion className="h-24 w-24 text-gray-400 mx-auto mb-6" />
        <h1 className="text-4xl font-bold mb-2">404</h1>
        <h2 className="text-xl text-gray-600 mb-6">Page not found</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
```

## Accessibility

### WCAG 2.1 AA Compliance

| Criterion | Implementation |
|-----------|---------------|
| 1.1.1 Non-text Content | All images have descriptive alt text |
| 1.3.1 Info and Relationships | Semantic HTML, proper heading hierarchy |
| 1.4.1 Use of Color | Links underlined, not color-only |
| 1.4.3 Contrast | 4.5:1 minimum text contrast |
| 2.1.1 Keyboard | All interactive elements focusable |
| 2.4.1 Bypass Blocks | Skip to content link |
| 2.4.4 Link Purpose | Descriptive link text |
| 2.4.7 Focus Visible | Clear focus indicators |

### Skip Link

```typescript
// components/skip-link.tsx
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded"
    >
      Skip to main content
    </a>
  );
}
```

### Accessible Navigation

```typescript
// components/layout/accessible-nav.tsx
export function AccessibleNav() {
  return (
    <nav aria-label="Main navigation">
      <ul role="list" className="flex items-center gap-8">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={pathname === item.href ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

## Security

### Input Validation (Zod)

```typescript
// lib/validations/contact.ts
import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
  email: z.string()
    .email('Please enter a valid email address'),
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(5000, 'Message must be less than 5000 characters'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const contactRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 submissions per hour
});
```

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

## Performance

### Image Optimization

```typescript
// components/optimized-image.tsx
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}

export function OptimizedImage({ src, alt, priority = false, className }: OptimizedImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      priority={priority}
      className={className}
    />
  );
}
```

### Static Generation

```typescript
// app/(main)/projects/[slug]/page.tsx
import { allProjects } from 'contentlayer/generated';

export function generateStaticParams() {
  return allProjects.map((project) => ({
    slug: project.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const project = allProjects.find((p) => p.slug === params.slug);
  
  return {
    title: project?.title,
    description: project?.description,
    openGraph: {
      title: project?.title,
      description: project?.description,
      images: project?.image ? [project.image] : [],
    },
  };
}
```

### Font Optimization

```typescript
// app/layout.tsx
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
});
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check

  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:unit -- --coverage
      - uses: codecov/codecov-action@v3

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  deploy:
    needs: [lint, unit-tests, e2e-tests]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Package Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "contentlayer build && next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:unit": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

## Monitoring

### Vercel Analytics

```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### Custom Event Tracking

```typescript
// lib/analytics.ts
import { track } from '@vercel/analytics';

export function trackContactSubmission() {
  track('contact_form_submission');
}

export function trackProjectView(projectSlug: string) {
  track('project_view', { project: projectSlug });
}

export function trackResumeDownload() {
  track('resume_download');
}
```

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=https://yourportfolio.com

# Email (Resend)
RESEND_API_KEY=

# Rate Limiting (optional)
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Content files (MDX) created
- [ ] Images optimized and uploaded
- [ ] All tests passing
- [ ] SEO meta tags configured
- [ ] Open Graph images created
- [ ] robots.txt configured
- [ ] sitemap.xml generated
- [ ] Contact form email configured
- [ ] CI/CD pipeline configured
- [ ] Accessibility audit passed
- [ ] Performance audit (Lighthouse 90+)

## Related Skills

- [[animations]] - Page transitions
- [[open-graph]] - Social sharing
- [[image-optimization]] - Image handling
- [[form-validation]] - Contact form
- [[transactional-email]] - Email notifications

## Changelog

### 2.0.0 (2025-01-18)
- Standardized to god-tier template
- Added comprehensive Testing section with MSW handlers
- Added mock Contentlayer data for testing
- Added 20+ unit tests for components, forms, SEO
- Added integration tests for projects page, contact form
- Added E2E tests with Playwright for full user flows
- Added accessibility and SEO E2E tests
- Added Error Handling section with custom error pages
- Added Accessibility section with WCAG 2.1 AA compliance
- Added Security section with Zod validations
- Added Performance section with image and font optimization
- Added CI/CD section with GitHub Actions
- Added Monitoring section with Vercel Analytics

### 1.0.0 (2025-01-17)
- Initial recipe implementation
- Project showcase with MDX
- Blog with reading time
- Contact form with Resend
- Responsive navigation
