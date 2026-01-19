---
id: o-empty-dashboard
name: Empty Dashboard
version: 2.0.0
layer: L3
category: utility
composes:
  - ../molecules/card.md
  - ../molecules/empty-state.md
description: Empty state for dashboards with getting started CTAs and onboarding hints
tags: [empty, dashboard, onboarding, getting-started, cta]
performance:
  impact: medium
  lcp: low
  cls: low
formula: "EmptyDashboard = Card(m-card) + EmptyState(m-empty-state) + Button(a-button) + Icon(a-icon)"
dependencies:
  - react
  - lucide-react
  - framer-motion
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Empty Dashboard

## Overview

An empty dashboard state organism displaying helpful onboarding content, quick start actions, and feature highlights when users have no data yet.

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  EmptyDashboard (o-empty-dashboard)                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Illustration                                             │  │
│  │  └── Icon (a-icon) [Rocket, Sparkles, Zap]                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Title & Description                                      │  │
│  │  └── EmptyState (m-empty-state)                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  QuickActions Grid (2 cols)                               │  │
│  │  ┌─────────────────────┐  ┌─────────────────────┐         │  │
│  │  │  Card (m-card)      │  │  Card (m-card)      │         │  │
│  │  │  ├── Icon (a-icon)  │  │  ├── Icon (a-icon)  │         │  │
│  │  │  ├── Title          │  │  ├── Title          │         │  │
│  │  │  └── Description    │  │  └── Description    │         │  │
│  │  └─────────────────────┘  └─────────────────────┘         │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Features (3 cols)                                        │  │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐              │  │
│  │  │ Icon+Text │  │ Icon+Text │  │ Icon+Text │              │  │
│  │  └───────────┘  └───────────┘  └───────────┘              │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  HelpLinks                                                │  │
│  │  ├── Button (a-button) [Watch Video]                      │  │
│  │  ├── Button (a-button) [Read Docs]                        │  │
│  │  └── Button (a-button) [Contact Support]                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Implementation

```tsx
// components/organisms/empty-dashboard.tsx
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  FileText,
  Users,
  Settings,
  Sparkles,
  ArrowRight,
  Play,
  BookOpen,
  MessageSquare,
  Rocket,
  Zap,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  href?: string;
  primary?: boolean;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface EmptyDashboardProps {
  title?: string;
  description?: string;
  illustration?: React.ReactNode;
  quickActions?: QuickAction[];
  features?: Feature[];
  showVideo?: boolean;
  videoUrl?: string;
  onWatchVideo?: () => void;
  showDocs?: boolean;
  docsUrl?: string;
  showSupport?: boolean;
  onContactSupport?: () => void;
  userName?: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Default illustration (abstract shapes)
function DefaultIllustration() {
  return (
    <div className="relative h-48 w-48">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative">
          <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 rotate-12" />
          <div className="absolute inset-0 h-32 w-32 rounded-2xl bg-gradient-to-tl from-primary/30 to-transparent -rotate-12" />
          <div className="absolute inset-4 flex items-center justify-center">
            <Rocket className="h-16 w-16 text-primary" />
          </div>
        </div>
      </motion.div>
      
      {/* Floating elements */}
      <motion.div
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute top-0 right-0 h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center"
      >
        <Sparkles className="h-4 w-4 text-blue-500" />
      </motion.div>
      <motion.div
        animate={{ y: [5, -5, 5] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute bottom-4 left-0 h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center"
      >
        <Zap className="h-3 w-3 text-green-500" />
      </motion.div>
    </div>
  );
}

// Quick Action Card
function QuickActionCard({ action }: { action: QuickAction }) {
  const content = (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'group flex items-start gap-4 rounded-xl border p-4 transition-all cursor-pointer',
        action.primary
          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90'
          : 'bg-card hover:border-primary/50 hover:shadow-md'
      )}
      onClick={action.onClick}
    >
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg',
          action.primary
            ? 'bg-white/20'
            : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
        )}
      >
        {action.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold">{action.title}</h3>
        <p
          className={cn(
            'text-sm mt-0.5',
            action.primary ? 'text-primary-foreground/80' : 'text-muted-foreground'
          )}
        >
          {action.description}
        </p>
      </div>
      <ArrowRight
        className={cn(
          'h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1',
          action.primary ? 'text-primary-foreground/60' : 'text-muted-foreground'
        )}
      />
    </motion.div>
  );

  if (action.href) {
    return <a href={action.href}>{content}</a>;
  }

  return content;
}

// Feature Highlight
function FeatureHighlight({ feature }: { feature: Feature }) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex items-start gap-3 text-left"
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
        {feature.icon}
      </div>
      <div>
        <h4 className="font-medium text-sm">{feature.title}</h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          {feature.description}
        </p>
      </div>
    </motion.div>
  );
}

// Help Links
function HelpLinks({
  showVideo,
  videoUrl,
  onWatchVideo,
  showDocs,
  docsUrl,
  showSupport,
  onContactSupport,
}: Pick<
  EmptyDashboardProps,
  'showVideo' | 'videoUrl' | 'onWatchVideo' | 'showDocs' | 'docsUrl' | 'showSupport' | 'onContactSupport'
>) {
  const hasLinks = showVideo || showDocs || showSupport;
  if (!hasLinks) return null;

  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-wrap items-center justify-center gap-4 pt-6 border-t"
    >
      {showVideo && (
        <a
          href={videoUrl}
          onClick={(e) => {
            if (onWatchVideo) {
              e.preventDefault();
              onWatchVideo();
            }
          }}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <Play className="h-4 w-4" />
          Watch intro video
        </a>
      )}
      {showDocs && (
        <a
          href={docsUrl || '/docs'}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <BookOpen className="h-4 w-4" />
          Read documentation
        </a>
      )}
      {showSupport && (
        <button
          onClick={onContactSupport}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <MessageSquare className="h-4 w-4" />
          Contact support
        </button>
      )}
    </motion.div>
  );
}

// Default quick actions
const defaultQuickActions: QuickAction[] = [
  {
    id: 'create',
    title: 'Create your first project',
    description: 'Get started by creating a new project',
    icon: <Plus className="h-5 w-5" />,
    primary: true,
  },
  {
    id: 'import',
    title: 'Import existing data',
    description: 'Bring your data from other tools',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    id: 'invite',
    title: 'Invite team members',
    description: 'Collaborate with your team',
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 'settings',
    title: 'Configure settings',
    description: 'Customize your workspace',
    icon: <Settings className="h-5 w-5" />,
  },
];

// Default features
const defaultFeatures: Feature[] = [
  {
    icon: <Zap className="h-4 w-4 text-yellow-500" />,
    title: 'Lightning fast',
    description: 'Built for speed and performance',
  },
  {
    icon: <Shield className="h-4 w-4 text-green-500" />,
    title: 'Secure by default',
    description: 'Enterprise-grade security',
  },
  {
    icon: <Sparkles className="h-4 w-4 text-purple-500" />,
    title: 'AI-powered',
    description: 'Smart suggestions and automation',
  },
];

// Main Empty Dashboard Component
export function EmptyDashboard({
  title,
  description,
  illustration,
  quickActions = defaultQuickActions,
  features = defaultFeatures,
  showVideo = true,
  videoUrl,
  onWatchVideo,
  showDocs = true,
  docsUrl,
  showSupport = true,
  onContactSupport,
  userName,
}: EmptyDashboardProps) {
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-12"
    >
      {/* Illustration */}
      <motion.div variants={itemVariants} className="mb-8">
        {illustration || <DefaultIllustration />}
      </motion.div>

      {/* Title */}
      <motion.div variants={itemVariants} className="text-center max-w-md">
        <h1 className="text-2xl font-bold">
          {title || (
            <>
              {greeting}
              {userName && <span>, {userName}</span>}!
            </>
          )}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {description ||
            "Welcome to your dashboard. Let's get you set up and running in no time."}
        </p>
      </motion.div>

      {/* Quick Actions */}
      {quickActions.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mt-8 w-full max-w-2xl grid gap-3 sm:grid-cols-2"
        >
          {quickActions.map((action) => (
            <QuickActionCard key={action.id} action={action} />
          ))}
        </motion.div>
      )}

      {/* Features */}
      {features.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="mt-10 w-full max-w-2xl"
        >
          <h2 className="text-sm font-semibold text-center text-muted-foreground mb-4">
            What you can do
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map((feature, index) => (
              <FeatureHighlight key={index} feature={feature} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Help Links */}
      <div className="mt-8 w-full max-w-md">
        <HelpLinks
          showVideo={showVideo}
          videoUrl={videoUrl}
          onWatchVideo={onWatchVideo}
          showDocs={showDocs}
          docsUrl={docsUrl}
          showSupport={showSupport}
          onContactSupport={onContactSupport}
        />
      </div>
    </motion.div>
  );
}
```

## Usage

### Basic Usage

```tsx
import { EmptyDashboard } from '@/components/organisms/empty-dashboard';

export function DashboardPage({ user, hasData }) {
  if (!hasData) {
    return (
      <EmptyDashboard
        userName={user.firstName}
        quickActions={[
          {
            id: 'create',
            title: 'Create your first project',
            description: 'Start building something amazing',
            icon: <Plus className="h-5 w-5" />,
            primary: true,
            onClick: () => router.push('/projects/new'),
          },
        ]}
      />
    );
  }

  return <Dashboard data={data} />;
}
```

### Custom Actions

```tsx
<EmptyDashboard
  title="No projects yet"
  description="Create your first project to get started"
  quickActions={[
    {
      id: 'blank',
      title: 'Start from scratch',
      description: 'Create a blank project',
      icon: <FileText className="h-5 w-5" />,
      primary: true,
      onClick: () => createProject('blank'),
    },
    {
      id: 'template',
      title: 'Use a template',
      description: 'Start with a pre-built template',
      icon: <Sparkles className="h-5 w-5" />,
      onClick: () => openTemplates(),
    },
  ]}
/>
```

### With Video Modal

```tsx
<EmptyDashboard
  showVideo
  onWatchVideo={() => setVideoModalOpen(true)}
  showDocs
  docsUrl="/docs/getting-started"
/>
```

## States

| State | Description | Visual Change |
|-------|-------------|---------------|
| Default | Initial onboarding state with greeting and actions | Time-based greeting, animated illustration, action cards visible |
| Loading | Content is being fetched | Skeleton placeholders for actions and features |
| Animated | Animation variants active during entrance | Staggered fade-in with slide-up motion on all sections |
| Hover | User hovering over action card | Card scales up (1.02x), border highlight, shadow appears |
| Active | User clicking on action card | Card scales down (0.98x) for tactile feedback |
| Personalized | User name provided | Greeting includes user's first name |
| Minimal | No features or help links shown | Only illustration, title, and quick actions visible |

## Anti-patterns

### Missing onClick handler for action cards

```tsx
// Bad: Action card without handler leads to dead clicks
<EmptyDashboard
  quickActions={[
    {
      id: 'create',
      title: 'Create project',
      description: 'Get started',
      icon: <Plus className="h-5 w-5" />,
      // Missing onClick or href
    },
  ]}
/>

// Good: Always provide onClick or href for actionable items
<EmptyDashboard
  quickActions={[
    {
      id: 'create',
      title: 'Create project',
      description: 'Get started',
      icon: <Plus className="h-5 w-5" />,
      onClick: () => router.push('/projects/new'),
      // or href: '/projects/new'
    },
  ]}
/>
```

### Hardcoded greeting without time context

```tsx
// Bad: Static greeting ignores time of day
function EmptyDashboard({ userName }) {
  return (
    <h1>Welcome{userName && `, ${userName}`}!</h1>
  );
}

// Good: Dynamic greeting based on time of day
function EmptyDashboard({ userName }) {
  const greeting = React.useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  return (
    <h1>
      {greeting}{userName && `, ${userName}`}!
    </h1>
  );
}
```

### Showing empty dashboard when data exists

```tsx
// Bad: Always showing empty state without checking data
function DashboardPage({ data }) {
  return <EmptyDashboard />;
}

// Good: Conditional rendering based on data presence
function DashboardPage({ data, isLoading }) {
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!data || data.length === 0) {
    return <EmptyDashboard />;
  }

  return <Dashboard data={data} />;
}
```

### Animation without reduced motion preference

```tsx
// Bad: Ignoring user's motion preferences
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Good: Respecting reduced motion preference
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { staggerChildren: 0.1 },
  },
};
```

## Related Skills

- `molecules/empty-state` - Simple empty state
- `organisms/onboarding-flow` - Onboarding wizard
- `templates/dashboard-page` - Full dashboard

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema
- Added explicit composition references

### 1.0.0 (2025-01-17)

- Initial implementation
- Animated illustration
- Quick action cards
- Feature highlights
- Help links section
- Time-based greeting
