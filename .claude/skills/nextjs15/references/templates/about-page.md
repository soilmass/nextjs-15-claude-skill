---
id: t-about-page
name: About Page
version: 2.0.0
layer: L4
category: pages
description: Company about page with mission, team, values, and timeline
tags: [page, about, team, company, mission, values]
composes:
  - ../organisms/hero.md
  - ../organisms/team.md
  - ../organisms/timeline.md
  - ../organisms/features.md
  - ../organisms/cta.md
formula: "AboutPage = Hero(o-hero) + Stats + Mission + Features(o-features) + Timeline(o-timeline) + Team(o-team) + Offices + CTA(o-cta)"
dependencies: []
performance:
  impact: medium
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# About Page

## Overview

The About Page template provides a complete company/team presentation. Features mission statement, team members, company values, timeline/history, and office locations. Designed to build trust and humanize the brand.

## When to Use

Use this skill when:
- Building company about pages
- Creating team showcases
- Building "Our Story" pages
- Creating mission/values pages

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                       About Page                            │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Hero (o-hero)                       │  │
│  │  "We're building the future of web development"       │  │
│  │              + Team Photo Image                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Stats Section                       │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │  │
│  │  │  2019   │ │  150+   │ │ 10000+  │ │     12      │  │  │
│  │  │ Founded │ │ Members │ │Customers│ │  Countries  │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Mission Section                     │  │
│  │  ┌─────────────────────┐ ┌─────────────────────────┐  │  │
│  │  │    Mission Text     │ │    Mission Image        │  │  │
│  │  └─────────────────────┘ └─────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │               Features/Values (o-features)            │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │  │
│  │  │ Customer    │ │ Innovation  │ │  Collaboration  │  │  │
│  │  │   First     │ │             │ │                 │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                Timeline (o-timeline)                  │  │
│  │      ●────────●────────●────────●────────●            │  │
│  │     2019     2020     2021     2022     2023          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Team (o-team)                       │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────┐  │  │
│  │  │ Avatar  │ │ Avatar  │ │ Avatar  │ │   Avatar    │  │  │
│  │  │  Name   │ │  Name   │ │  Name   │ │    Name     │  │  │
│  │  │  Role   │ │  Role   │ │  Role   │ │    Role     │  │  │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                   Offices Section                     │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────┐  │  │
│  │  │ San Fran HQ │ │   London    │ │    Singapore    │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                    CTA (o-cta)                        │  │
│  │  "Join our team" [View Positions] [Our Culture]       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Organisms Used

- [hero](../organisms/hero.md) - Page header
- [team](../organisms/team.md) - Team members
- [timeline](../organisms/timeline.md) - Company history
- [features](../organisms/features.md) - Values display
- [cta](../organisms/cta.md) - Hiring CTA

## Implementation

```typescript
// app/(marketing)/about/page.tsx
import { Metadata } from "next";
import Image from "next/image";
import { Hero } from "@/components/organisms/hero";
import { Team } from "@/components/organisms/team";
import { Timeline } from "@/components/organisms/timeline";
import { CTA } from "@/components/organisms/cta";
import { FadeIn, Stagger, Counter } from "@/components/organisms/scroll-animations";
import { getTeamMembers, getCompanyTimeline } from "@/lib/cms";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about our mission, team, and the story behind Acme.",
};

// Company values
const values = [
  {
    icon: "Heart",
    title: "Customer First",
    description: "Every decision starts with our customers. Their success is our success.",
  },
  {
    icon: "Lightbulb",
    title: "Innovation",
    description: "We push boundaries and challenge the status quo to build better products.",
  },
  {
    icon: "Users",
    title: "Collaboration",
    description: "The best ideas come from diverse perspectives working together.",
  },
  {
    icon: "Target",
    title: "Excellence",
    description: "We hold ourselves to the highest standards in everything we do.",
  },
  {
    icon: "Shield",
    title: "Integrity",
    description: "We do the right thing, even when no one is watching.",
  },
  {
    icon: "Sprout",
    title: "Growth",
    description: "We invest in learning and growing, both personally and professionally.",
  },
];

// Company stats
const stats = [
  { value: 2019, label: "Founded" },
  { value: 150, suffix: "+", label: "Team Members" },
  { value: 10000, suffix: "+", label: "Customers" },
  { value: 12, label: "Countries" },
];

// Office locations
const offices = [
  {
    city: "San Francisco",
    country: "United States",
    address: "100 Market Street, Suite 500",
    image: "/offices/sf.jpg",
    isHQ: true,
  },
  {
    city: "London",
    country: "United Kingdom",
    address: "30 St Mary Axe",
    image: "/offices/london.jpg",
  },
  {
    city: "Singapore",
    country: "Singapore",
    address: "1 Raffles Place",
    image: "/offices/singapore.jpg",
  },
];

export default async function AboutPage() {
  const [teamMembers, timeline] = await Promise.all([
    getTeamMembers(),
    getCompanyTimeline(),
  ]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="container">
          <FadeIn>
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl mb-6">
                We're building the future of
                <span className="text-primary"> web development</span>
              </h1>
              <p className="text-xl text-muted-foreground">
                Founded in 2019, we've been on a mission to make web development faster, 
                easier, and more enjoyable for developers everywhere.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Mission Image */}
      <section className="container mb-20">
        <FadeIn>
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden">
            <Image
              src="/about/team-photo.jpg"
              alt="Our team working together"
              fill
              className="object-cover"
              priority
            />
          </div>
        </FadeIn>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <Stagger staggerDelay={0.1}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-bold tracking-tight">
                    <Counter to={stat.value} duration={2} />
                    {stat.suffix}
                  </div>
                  <div className="text-muted-foreground mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </Stagger>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <FadeIn direction="left">
              <div>
                <h2 className="text-3xl font-bold tracking-tight mb-6">
                  Our Mission
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    We believe that building for the web should be fast, intuitive, 
                    and even fun. That's why we're creating tools that empower 
                    developers to build amazing experiences without the complexity.
                  </p>
                  <p>
                    Our platform handles the hard parts—infrastructure, scaling, 
                    security—so you can focus on what matters: building great products 
                    for your users.
                  </p>
                  <p>
                    We're not just building software. We're building a community of 
                    developers who share our vision for a better web.
                  </p>
                </div>
              </div>
            </FadeIn>
            <FadeIn direction="right">
              <div className="relative aspect-square rounded-2xl overflow-hidden">
                <Image
                  src="/about/mission.jpg"
                  alt="Our mission"
                  fill
                  className="object-cover"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Our Values
              </h2>
              <p className="text-lg text-muted-foreground">
                These are the principles that guide everything we do
              </p>
            </div>
          </FadeIn>
          <Stagger staggerDelay={0.1}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-background rounded-lg border p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    {/* Icon would be rendered here */}
                    <span className="text-primary">✦</span>
                  </div>
                  <h3 className="font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </div>
              ))}
            </div>
          </Stagger>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Our Journey
              </h2>
              <p className="text-lg text-muted-foreground">
                From a small startup to a global platform
              </p>
            </div>
          </FadeIn>
          <Timeline
            events={timeline}
            alternate
            linePosition="center"
            animate
          />
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <Team
          title="Meet Our Team"
          description="The people behind the platform"
          members={teamMembers}
          variant="grid"
          columns={4}
          showBio
          showFilter
        />
      </section>

      {/* Offices Section */}
      <section className="py-20">
        <div className="container">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">
                Our Offices
              </h2>
              <p className="text-lg text-muted-foreground">
                Find us around the world
              </p>
            </div>
          </FadeIn>
          <Stagger staggerDelay={0.15}>
            <div className="grid md:grid-cols-3 gap-8">
              {offices.map((office, index) => (
                <div
                  key={index}
                  className="rounded-lg overflow-hidden border bg-background"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={office.image}
                      alt={`${office.city} office`}
                      fill
                      className="object-cover"
                    />
                    {office.isHQ && (
                      <div className="absolute top-4 left-4 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                        Headquarters
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-semibold text-lg">{office.city}</h3>
                    <p className="text-muted-foreground">{office.country}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {office.address}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Stagger>
        </div>
      </section>

      {/* Careers CTA */}
      <CTA
        title="Join our team"
        description="We're always looking for talented people to join us. Check out our open positions."
        primaryAction={{ label: "View Open Positions", href: "/careers" }}
        secondaryAction={{ label: "Our Culture", href: "/culture" }}
        variant="simple"
      />
    </>
  );
}
```

## Key Implementation Notes

1. **Section Flow**: Hero → Stats → Mission → Values → Timeline → Team → Offices → CTA
2. **Visual Variety**: Alternates between full-width and grid layouts
3. **Human Element**: Team photos and office images
4. **Scroll Animations**: Progressive reveals
5. **Dynamic Content**: Team and timeline from CMS

## Variants

### Startup About

```tsx
// Simpler, founder-focused
<section className="py-20">
  <div className="container max-w-3xl">
    <h1>Our Story</h1>
    <div className="prose prose-lg">
      {/* Founder letter in prose format */}
    </div>
    <div className="mt-12 flex items-center gap-4">
      <Avatar src="/founder.jpg" />
      <div>
        <p className="font-semibold">Jane Doe</p>
        <p className="text-muted-foreground">Founder & CEO</p>
      </div>
    </div>
  </div>
</section>
```

### Enterprise About

```tsx
// More formal, data-driven
<>
  <Hero variant="split" />
  <Stats stats={enterpriseStats} />
  <Features title="Why Fortune 500 Companies Choose Us" />
  <Testimonials variant="logos" />
  <Team title="Leadership" members={leadership} variant="featured" />
  <Awards />
  <Certifications />
</>
```

## Performance

### Image Optimization

- Team photos should be thumbnails
- Office images lazy loaded
- Use blur placeholders

### Content Loading

- Static generation with ISR
- Team data cached
- Timeline data cached

## Accessibility

### Required Features

- Proper heading hierarchy
- Alt text on all images
- Timeline is accessible
- Team filters keyboard accessible

### Screen Reader

- Section landmarks
- Team member details announced
- Timeline events chronological

## Error States

### Data Fetching Error Handling

```tsx
// app/(marketing)/about/page.tsx
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";

function TeamErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">Failed to load team members</p>
      <Button variant="outline" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}

function TimelineErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">Failed to load company timeline</p>
      <Button variant="outline" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
}

export default function AboutPage() {
  return (
    <>
      {/* Static content renders regardless of errors */}
      <HeroSection />
      <StatsSection stats={stats} />
      <MissionSection />
      <ValuesSection values={values} />

      {/* Dynamic content with error boundaries */}
      <ErrorBoundary FallbackComponent={TimelineErrorFallback}>
        <Suspense fallback={<TimelineSkeleton />}>
          <TimelineSection />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary FallbackComponent={TeamErrorFallback}>
        <Suspense fallback={<TeamSkeleton />}>
          <TeamSection />
        </Suspense>
      </ErrorBoundary>

      <OfficesSection offices={offices} />
      <CTASection />
    </>
  );
}
```

### Image Loading Error

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";

export function TeamMemberImage({ src, name }: { src: string; name: string }) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="aspect-square rounded-full bg-muted flex items-center justify-center">
        <User className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      className="object-cover rounded-full"
      onError={() => setError(true)}
    />
  );
}
```

### API Error State

```tsx
// components/about/team-section.tsx
async function TeamSection() {
  try {
    const teamMembers = await getTeamMembers();

    if (!teamMembers || teamMembers.length === 0) {
      return (
        <section className="py-20 bg-muted/30">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-muted-foreground">
              Team information is currently being updated.
            </p>
          </div>
        </section>
      );
    }

    return <Team members={teamMembers} />;
  } catch (error) {
    throw new Error("Failed to load team members");
  }
}
```

## Loading States

### Full Page Skeleton

```tsx
// app/(marketing)/about/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="animate-pulse">
      {/* Hero Skeleton */}
      <section className="py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-6 w-2/3 mx-auto" />
          </div>
        </div>
      </section>

      {/* Team Photo Skeleton */}
      <section className="container mb-20">
        <Skeleton className="aspect-[21/9] rounded-2xl" />
      </section>

      {/* Stats Skeleton */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="text-center space-y-2">
                <Skeleton className="h-10 w-20 mx-auto" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Skeleton */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 rounded-lg border">
                <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4 mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Skeleton */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <Skeleton className="h-8 w-40 mx-auto mb-4" />
            <Skeleton className="h-4 w-56 mx-auto" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
                <Skeleton className="h-5 w-24 mx-auto mb-2" />
                <Skeleton className="h-4 w-20 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

### Streaming with Suspense

```tsx
// app/(marketing)/about/page.tsx
import { Suspense } from "react";

// Skeleton components
function TimelineSkeleton() {
  return (
    <div className="space-y-8">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-4 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

function TeamSkeleton() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="text-center">
          <Skeleton className="h-32 w-32 rounded-full mx-auto mb-4" />
          <Skeleton className="h-5 w-24 mx-auto mb-2" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

// Async components
async function TimelineSection() {
  const timeline = await getCompanyTimeline();
  return <Timeline events={timeline} />;
}

async function TeamSection() {
  const team = await getTeamMembers();
  return <Team members={team} />;
}

export default function AboutPage() {
  return (
    <>
      {/* Static sections render immediately */}
      <HeroSection />
      <StatsSection />

      {/* Timeline streams in */}
      <section className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold mb-16">Our Journey</h2>
          <Suspense fallback={<TimelineSkeleton />}>
            <TimelineSection />
          </Suspense>
        </div>
      </section>

      {/* Team streams in */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold mb-16">Meet Our Team</h2>
          <Suspense fallback={<TeamSkeleton />}>
            <TeamSection />
          </Suspense>
        </div>
      </section>
    </>
  );
}
```

### Counter Animation with Loading

```tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useInView } from "framer-motion";

export function AnimatedCounter({
  value,
  suffix = ""
}: {
  value: number;
  suffix?: string
}) {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    setIsLoading(false);
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {isLoading ? (
        <span className="inline-block w-12 h-8 bg-muted animate-pulse rounded" />
      ) : (
        <>
          {count.toLocaleString()}
          {suffix}
        </>
      )}
    </span>
  );
}
```

## Mobile Responsiveness

### Responsive Layout Breakdown

| Breakpoint | Layout Changes |
|------------|----------------|
| `< 640px` (mobile) | Single column, stacked sections, smaller images |
| `640px - 1024px` (tablet) | 2-column grid for team/values |
| `> 1024px` (desktop) | Full multi-column layout, side-by-side content |

### Mobile-First Implementation

```tsx
export default function AboutPage() {
  return (
    <>
      {/* Hero - Responsive typography */}
      <section className="py-12 sm:py-16 lg:py-20 xl:py-32">
        <div className="container px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 sm:mb-6">
              We're building the future of
              <span className="text-primary"> web development</span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground">
              Founded in 2019, we've been on a mission to make web development
              faster, easier, and more enjoyable.
            </p>
          </div>
        </div>
      </section>

      {/* Team Photo - Responsive aspect ratio */}
      <section className="container px-4 sm:px-6 mb-12 sm:mb-16 lg:mb-20">
        <div className="relative aspect-[4/3] sm:aspect-video lg:aspect-[21/9] rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden">
          <Image
            src="/about/team-photo.jpg"
            alt="Our team"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Stats - Responsive grid */}
      <section className="py-12 sm:py-16 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission - Stack on mobile, side-by-side on desktop */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">
                Our Mission
              </h2>
              <div className="space-y-3 sm:space-y-4 text-base sm:text-lg text-muted-foreground">
                <p>We believe building for the web should be intuitive...</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative aspect-square rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden">
                <Image src="/about/mission.jpg" alt="Our mission" fill />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values - Responsive grid */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-4">
              Our Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-background rounded-lg border p-4 sm:p-6"
              >
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <span className="text-primary">✦</span>
                </div>
                <h3 className="font-semibold text-sm sm:text-base mb-1 sm:mb-2">
                  {value.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team - Responsive grid with different column counts */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="text-center">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 mx-auto mb-3 sm:mb-4">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
                <p className="font-semibold text-sm sm:text-base">
                  {member.name}
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {member.role}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices - Responsive cards */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {offices.map((office) => (
              <div key={office.city} className="rounded-lg overflow-hidden border">
                <div className="relative aspect-video">
                  <Image src={office.image} alt={office.city} fill />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="font-semibold text-base sm:text-lg">
                    {office.city}
                  </h3>
                  <p className="text-sm text-muted-foreground">{office.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
```

### Mobile Timeline

```tsx
// Vertical timeline for all screens, enhanced on desktop
<div className="relative">
  {/* Vertical line */}
  <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-border transform sm:-translate-x-1/2" />

  {timeline.map((event, index) => (
    <div
      key={event.year}
      className={cn(
        "relative pl-12 sm:pl-0 pb-8 sm:pb-12",
        // Alternate sides on desktop only
        index % 2 === 0 ? "sm:pr-1/2 sm:text-right" : "sm:pl-1/2"
      )}
    >
      {/* Dot */}
      <div className={cn(
        "absolute left-2.5 sm:left-1/2 w-3 h-3 rounded-full bg-primary transform sm:-translate-x-1/2",
        "top-1.5"
      )} />

      {/* Content */}
      <div className={cn(
        "sm:px-8",
        index % 2 === 0 ? "sm:pr-8" : "sm:pl-8"
      )}>
        <span className="text-sm font-medium text-primary">{event.year}</span>
        <h3 className="font-semibold mt-1">{event.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
      </div>
    </div>
  ))}
</div>
```

### Touch-Optimized Team Cards

```tsx
// Mobile-friendly team member interaction
<button
  onClick={() => setSelectedMember(member)}
  className="text-center w-full touch-manipulation active:scale-95 transition-transform"
>
  <div className="relative w-24 h-24 mx-auto mb-3">
    <Image src={member.avatar} alt={member.name} fill className="rounded-full" />
  </div>
  <p className="font-semibold">{member.name}</p>
  <p className="text-sm text-muted-foreground">{member.role}</p>
</button>

{/* Mobile bottom sheet for member details */}
<Sheet open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
  <SheetContent side="bottom" className="h-[70vh]">
    {selectedMember && <TeamMemberDetail member={selectedMember} />}
  </SheetContent>
</Sheet>
```

## Related Skills

### Uses Layout
- [marketing-layout](./marketing-layout.md)

### Related Pages
- [landing-page](./landing-page.md)
- [careers-page](./careers-page.md)

---

## Changelog

### 1.0.0 (2025-01-16)
- Initial implementation
- Team showcase
- Company timeline
- Values and offices sections
