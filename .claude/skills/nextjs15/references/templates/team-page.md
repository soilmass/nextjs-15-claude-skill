---
id: t-team-page
name: Team Page
version: 2.0.0
layer: L4
category: pages
description: Team directory page with member profiles and org structure
tags: [team, directory, about, profiles, organization]
performance:
  impact: medium
  lcp: medium
  cls: low
formula: "TeamPage = Team(o-team) + Card(m-card) + AvatarGroup(m-avatar-group)"
composes:
  - ../organisms/team.md
  - ../molecules/card.md
  - ../molecules/avatar-group.md
dependencies:
  - react
  - next
  - lucide-react
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Team Page

## Overview

A team directory page showcasing team members with profiles, roles, and social links. Supports filtering by department, search, and detailed member profiles.

## Composition Diagram

```
+------------------------------------------------------------------------+
|                            TeamPage                                     |
+------------------------------------------------------------------------+
|  +--------------------------------------------------------------------+ |
|  |                      TeamHeader (gradient)                         | |
|  |             [Users Icon]                                           | |
|  |          Meet Our Team                                             | |
|  |   We're a diverse group of passionate individuals...               | |
|  +--------------------------------------------------------------------+ |
|                                                                         |
|  +--------------------------------------------------------------------+ |
|  |                        TeamStats                                   | |
|  |  +-------------+ +-------------+ +-------------+ +-------------+   | |
|  |  | [Users]     | | [Globe]     | | [Building]  | | [Award]     |   | |
|  |  | 50+ Members | | 12 Countries| | 8 Depts     | | 200+ Years  |   | |
|  |  +-------------+ +-------------+ +-------------+ +-------------+   | |
|  +--------------------------------------------------------------------+ |
|                                                                         |
|  +--------------------------------------------------------------------+ |
|  |                      TeamFilters                                   | |
|  |  [Search icon] [Search by name or role...________________] [X]     | |
|  |                                                                     | |
|  |  [All Depts] [Engineering] [Design] [Product] [Marketing] [...]    | |
|  +--------------------------------------------------------------------+ |
|                                                                         |
|  +--------------------------------------------------------------------+ |
|  |                  TeamGrid (o-team)                                 | |
|  |  +---------------+ +---------------+ +---------------+ +---------+ | |
|  |  | Card          | | Card          | | Card          | | Card    | | |
|  |  | (m-card)      | | (m-card)      | | (m-card)      | |(m-card) | | |
|  |  | +----------+  | | +----------+  | | +----------+  | |         | | |
|  |  | | [Avatar] |  | | | [Avatar] |  | | | [Avatar] |  | |         | | |
|  |  | | Hover:   |  | | |          |  | | |          |  | |         | | |
|  |  | | [Social] |  | | |          |  | | |          |  | |         | | |
|  |  | +----------+  | | +----------+  | | +----------+  | |         | | |
|  |  | [Name]        | | [Name]        | | [Name]        | |         | | |
|  |  | [Role]        | | [Role]        | | [Role]        | |         | | |
|  |  | [Bio...]      | | [Bio...]      | | [Bio...]      | |         | | |
|  |  | [Location]    | | [Location]    | | [Location]    | |         | | |
|  |  +---------------+ +---------------+ +---------------+ +---------+ | |
|  |                                                                     | |
|  |  AvatarGroup (m-avatar-group) shown on hover for social links      | |
|  +--------------------------------------------------------------------+ |
+------------------------------------------------------------------------+
```

## Implementation

### Team Page

```tsx
// app/team/page.tsx
import { Suspense } from 'react';
import { TeamHeader } from '@/components/team/team-header';
import { TeamFilters } from '@/components/team/team-filters';
import { TeamGrid } from '@/components/team/team-grid';
import { TeamStats } from '@/components/team/team-stats';
import { TeamSkeleton } from '@/components/team/team-skeleton';

interface TeamPageProps {
  searchParams: Promise<{
    department?: string;
    search?: string;
  }>;
}

export const metadata = {
  title: 'Our Team',
  description: 'Meet the talented people behind our company',
};

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const params = await searchParams;
  const department = params.department || 'all';
  const search = params.search || '';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TeamHeader />
      
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Stats */}
        <TeamStats />

        {/* Filters */}
        <div className="my-8">
          <TeamFilters activeDepartment={department} searchQuery={search} />
        </div>

        {/* Team Grid */}
        <Suspense fallback={<TeamSkeleton />}>
          <TeamGrid department={department} search={search} />
        </Suspense>
      </main>
    </div>
  );
}
```

### Team Header

```tsx
// components/team/team-header.tsx
import { Users } from 'lucide-react';

export function TeamHeader() {
  return (
    <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-20 text-white">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <div className="mb-6 inline-flex rounded-full bg-white/20 p-4 backdrop-blur-sm">
          <Users className="h-10 w-10" />
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Meet Our Team
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-white/90">
          We're a diverse group of passionate individuals working together to build 
          amazing products and create meaningful experiences for our users.
        </p>
      </div>
    </header>
  );
}
```

### Team Stats

```tsx
// components/team/team-stats.tsx
import { Users, Globe2, Building2, Award } from 'lucide-react';

const stats = [
  { label: 'Team Members', value: '50+', icon: Users },
  { label: 'Countries', value: '12', icon: Globe2 },
  { label: 'Departments', value: '8', icon: Building2 },
  { label: 'Years Experience', value: '200+', icon: Award },
];

export function TeamStats() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <stat.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Team Filters

```tsx
// components/team/team-filters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const departments = [
  { id: 'all', name: 'All Departments' },
  { id: 'engineering', name: 'Engineering' },
  { id: 'design', name: 'Design' },
  { id: 'product', name: 'Product' },
  { id: 'marketing', name: 'Marketing' },
  { id: 'sales', name: 'Sales' },
  { id: 'support', name: 'Support' },
  { id: 'operations', name: 'Operations' },
  { id: 'leadership', name: 'Leadership' },
];

interface TeamFiltersProps {
  activeDepartment: string;
  searchQuery: string;
}

export function TeamFilters({ activeDepartment, searchQuery }: TeamFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);

  const updateSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.push(`/team?${params.toString()}`);
  }, 300);

  const updateDepartment = (dept: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (dept === 'all') {
      params.delete('department');
    } else {
      params.set('department', dept);
    }
    router.push(`/team?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearch('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`/team?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            updateSearch(e.target.value);
          }}
          placeholder="Search by name or role..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
          aria-label="Search team members"
        />
        {search && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Department Tabs */}
      <div className="flex flex-wrap gap-2">
        {departments.map((dept) => (
          <button
            key={dept.id}
            onClick={() => updateDepartment(dept.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeDepartment === dept.id
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-800 dark:hover:bg-gray-800'
            }`}
          >
            {dept.name}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Team Grid

```tsx
// components/team/team-grid.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Linkedin, Twitter, Github, Mail } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: string;
  bio: string;
  avatar: string;
  location: string;
  social: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    email?: string;
  };
}

interface TeamGridProps {
  department: string;
  search: string;
}

async function getTeamMembers(department: string, search: string): Promise<TeamMember[]> {
  const params = new URLSearchParams();
  if (department !== 'all') params.set('department', department);
  if (search) params.set('search', search);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/team?${params.toString()}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) throw new Error('Failed to fetch team');
  return res.json();
}

export async function TeamGrid({ department, search }: TeamGridProps) {
  const members = await getTeamMembers(department, search);

  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-400">
          No team members found matching your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member) => (
        <TeamMemberCard key={member.id} member={member} />
      ))}
    </div>
  );
}

function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      {/* Avatar */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20">
        <Image
          src={member.avatar}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Social Links Overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
          {member.social.linkedin && (
            <a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label={`${member.name} on LinkedIn`}
            >
              <Linkedin className="h-5 w-5" />
            </a>
          )}
          {member.social.twitter && (
            <a
              href={member.social.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label={`${member.name} on Twitter`}
            >
              <Twitter className="h-5 w-5" />
            </a>
          )}
          {member.social.github && (
            <a
              href={member.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label={`${member.name} on GitHub`}
            >
              <Github className="h-5 w-5" />
            </a>
          )}
          {member.social.email && (
            <a
              href={`mailto:${member.social.email}`}
              className="rounded-full bg-white/20 p-2.5 text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              aria-label={`Email ${member.name}`}
            >
              <Mail className="h-5 w-5" />
            </a>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="p-5">
        <Link href={`/team/${member.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400">
            {member.name}
          </h3>
        </Link>
        <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          {member.role}
        </p>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
          {member.bio}
        </p>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-500">
          {member.location}
        </p>
      </div>
    </article>
  );
}
```

### Team Member Profile Page

```tsx
// app/team/[id]/page.tsx
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Linkedin, Twitter, Github, Mail, MapPin, Briefcase, Calendar } from 'lucide-react';

interface TeamMemberPageProps {
  params: Promise<{ id: string }>;
}

async function getTeamMember(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/team/${id}`, {
    next: { revalidate: 3600 },
  });
  
  if (!res.ok) return null;
  return res.json();
}

export async function generateMetadata({ params }: TeamMemberPageProps) {
  const { id } = await params;
  const member = await getTeamMember(id);
  
  if (!member) return { title: 'Team Member Not Found' };
  
  return {
    title: `${member.name} - ${member.role}`,
    description: member.bio,
  };
}

export default async function TeamMemberPage({ params }: TeamMemberPageProps) {
  const { id } = await params;
  const member = await getTeamMember(id);

  if (!member) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <nav className="mb-8">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Team
          </Link>
        </nav>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="relative h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            <div className="absolute -bottom-16 left-8">
              <Image
                src={member.avatar}
                alt={member.name}
                width={128}
                height={128}
                className="rounded-2xl border-4 border-white shadow-lg dark:border-gray-900"
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-20">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {member.name}
                </h1>
                <p className="mt-1 text-lg font-medium text-indigo-600 dark:text-indigo-400">
                  {member.role}
                </p>
                
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {member.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {member.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {member.joinDate}
                  </span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-2">
                {member.social.linkedin && (
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {member.social.twitter && (
                  <a
                    href={member.social.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                    aria-label="Twitter"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {member.social.github && (
                  <a
                    href={member.social.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {member.social.email && (
                  <a
                    href={`mailto:${member.social.email}`}
                    className="rounded-lg border border-gray-200 p-2.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-indigo-400"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                About
              </h2>
              <div className="prose prose-gray max-w-none dark:prose-invert">
                <p>{member.bio}</p>
              </div>
            </div>

            {/* Skills */}
            {member.skills && (
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Team Skeleton

```tsx
// components/team/team-skeleton.tsx
export function TeamSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-800" />
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Variants

### Org Chart View

```tsx
// components/team/org-chart.tsx
interface OrgNode {
  id: string;
  name: string;
  role: string;
  avatar: string;
  reports?: OrgNode[];
}

export function OrgChart({ data }: { data: OrgNode }) {
  return (
    <div className="flex flex-col items-center">
      <OrgNode node={data} />
      {data.reports && data.reports.length > 0 && (
        <>
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700" />
          <div className="flex items-start gap-8">
            {data.reports.map((report, index) => (
              <div key={report.id} className="flex flex-col items-center">
                {index > 0 && <div className="absolute h-px w-8 bg-gray-300" />}
                <OrgChart data={report} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function OrgNode({ node }: { node: OrgNode }) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <img
        src={node.avatar}
        alt={node.name}
        className="h-16 w-16 rounded-full"
      />
      <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">
        {node.name}
      </h3>
      <p className="text-sm text-gray-500">{node.role}</p>
    </div>
  );
}
```

## Usage

```tsx
// Basic team page
// Navigate to /team

// Filter by department
// Navigate to /team?department=engineering

// Search team members
// Navigate to /team?search=john

// View member profile
// Navigate to /team/member-123
```

## Error States

### Team Page Error Boundary

```tsx
// app/team/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function TeamError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Team page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Unable to load team
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            We couldn't load the team directory. Please try again.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Team Member Not Found

```tsx
// app/team/[id]/not-found.tsx
import Link from 'next/link';
import { User, Users, Home } from 'lucide-react';

export default function TeamMemberNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <User className="h-10 w-10 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Team member not found
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This team member doesn't exist or has left the organization.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/team"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Users className="h-4 w-4" />
              View all team
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <Home className="h-4 w-4" />
              Go home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Empty Team State

```tsx
// components/team/team-empty-state.tsx
import { Users, Search } from 'lucide-react';

interface TeamEmptyStateProps {
  searchQuery?: string;
  department?: string;
  onClearFilters?: () => void;
}

export function TeamEmptyState({
  searchQuery,
  department,
  onClearFilters,
}: TeamEmptyStateProps) {
  const hasFilters = searchQuery || (department && department !== 'all');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
        {hasFilters ? (
          <Search className="h-8 w-8 text-gray-400" />
        ) : (
          <Users className="h-8 w-8 text-gray-400" />
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        {hasFilters ? 'No team members found' : 'No team members yet'}
      </h3>
      <p className="mt-2 text-gray-600 dark:text-gray-400">
        {hasFilters
          ? 'Try adjusting your search or filters.'
          : 'Team members will appear here once added.'}
      </p>
      {hasFilters && onClearFilters && (
        <button
          onClick={onClearFilters}
          className="mt-4 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
```

## Loading States

### Team Page Loading

```tsx
// app/team/loading.tsx
export default function TeamLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header Skeleton */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-20">
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-6 h-18 w-18 animate-pulse rounded-full bg-white/20" />
          <div className="mx-auto h-12 w-64 animate-pulse rounded bg-white/20" />
          <div className="mx-auto mt-4 h-6 w-96 animate-pulse rounded bg-white/20" />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Stats Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="h-12 w-12 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-2">
                <div className="h-6 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="my-8 space-y-4">
          <div className="h-11 max-w-md animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-10 w-24 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800"
              />
            ))}
          </div>
        </div>

        {/* Team Grid Skeleton */}
        <TeamSkeleton />
      </main>
    </div>
  );
}
```

### Team Grid Skeleton

```tsx
// components/team/team-skeleton.tsx
export function TeamSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
        >
          {/* Image Skeleton */}
          <div className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-800" />

          {/* Content Skeleton */}
          <div className="p-5 space-y-3">
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-10 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Team Page with Suspense

```tsx
// app/team/page.tsx with granular Suspense
import { Suspense } from 'react';

export default async function TeamPage({ searchParams }: TeamPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - renders immediately */}
      <TeamHeader />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Stats - separate Suspense */}
        <Suspense fallback={<StatsSkeleton />}>
          <TeamStats />
        </Suspense>

        {/* Filters - client component, renders immediately */}
        <div className="my-8">
          <TeamFilters
            activeDepartment={params.department || 'all'}
            searchQuery={params.search || ''}
          />
        </div>

        {/* Team Grid - separate Suspense with key for re-fetching */}
        <Suspense
          key={JSON.stringify(params)}
          fallback={<TeamSkeleton />}
        >
          <TeamGrid
            department={params.department || 'all'}
            search={params.search || ''}
          />
        </Suspense>
      </main>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
      ))}
    </div>
  );
}
```

### Member Profile Loading

```tsx
// app/team/[id]/loading.tsx
export default function TeamMemberLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link Skeleton */}
        <div className="mb-8 h-5 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />

        {/* Profile Card Skeleton */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Header */}
          <div className="h-48 animate-pulse bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
            <div className="absolute -bottom-16 left-8">
              <div className="h-32 w-32 animate-pulse rounded-2xl bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>

          {/* Content */}
          <div className="px-8 pb-8 pt-20">
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
              <div className="space-y-4">
                <div className="h-8 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="flex gap-4">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
                ))}
              </div>
            </div>

            {/* Bio Skeleton */}
            <div className="mt-8 space-y-3">
              <div className="h-5 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>

            {/* Skills Skeleton */}
            <div className="mt-8 space-y-3">
              <div className="h-5 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="flex flex-wrap gap-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-7 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Mobile Responsiveness

### Responsive Team Layout

```tsx
// app/team/page.tsx - responsive version
export default async function TeamPageResponsive({ searchParams }: TeamPageProps) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header - Responsive padding and text */}
      <header className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-4 py-12 sm:py-20">
        <div className="relative mx-auto max-w-4xl text-center text-white">
          <div className="mb-4 sm:mb-6 inline-flex rounded-full bg-white/20 p-3 sm:p-4 backdrop-blur-sm">
            <Users className="h-8 w-8 sm:h-10 sm:w-10" />
          </div>
          <h1 className="mb-3 sm:mb-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Meet Our Team
          </h1>
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-white/90">
            We're a diverse group building amazing products together.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
        {/* Stats - Responsive grid */}
        <TeamStats />

        {/* Filters */}
        <div className="my-6 sm:my-8">
          <TeamFilters
            activeDepartment={params.department || 'all'}
            searchQuery={params.search || ''}
          />
        </div>

        {/* Team Grid */}
        <Suspense fallback={<TeamSkeleton />}>
          <TeamGrid
            department={params.department || 'all'}
            search={params.search || ''}
          />
        </Suspense>
      </main>
    </div>
  );
}
```

### Mobile Team Filters

```tsx
// components/team/mobile-team-filters.tsx
'use client';

import { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export function MobileTeamFilters({
  activeDepartment,
  searchQuery,
}: {
  activeDepartment: string;
  searchQuery: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchQuery);
  const [showDepartments, setShowDepartments] = useState(false);

  const departments = [
    { id: 'all', name: 'All' },
    { id: 'engineering', name: 'Engineering' },
    { id: 'design', name: 'Design' },
    { id: 'product', name: 'Product' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'sales', name: 'Sales' },
  ];

  return (
    <div className="space-y-4">
      {/* Search - Full width on mobile */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or role..."
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-10 pr-10 text-sm sm:text-base dark:border-gray-700 dark:bg-gray-900"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* Department Pills - Horizontal scroll on mobile */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                if (dept.id === 'all') {
                  params.delete('department');
                } else {
                  params.set('department', dept.id);
                }
                router.push(`/team?${params.toString()}`);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                activeDepartment === dept.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-800'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>
        {/* Fade gradient on mobile */}
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-50 dark:from-gray-950 sm:hidden" />
      </div>
    </div>
  );
}
```

### Responsive Team Grid

```tsx
// components/team/responsive-team-grid.tsx
export function ResponsiveTeamGrid({ members }: { members: TeamMember[] }) {
  if (members.length === 0) {
    return <TeamEmptyState />;
  }

  return (
    <div className="grid gap-4 grid-cols-2 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {members.map((member) => (
        <ResponsiveTeamCard key={member.id} member={member} />
      ))}
    </div>
  );
}

function ResponsiveTeamCard({ member }: { member: TeamMember }) {
  return (
    <article className="group overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      {/* Avatar - Aspect ratio maintained */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/20 dark:to-purple-900/20">
        <Image
          src={member.avatar}
          alt={member.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Social Links - Show on hover (desktop) or always visible (mobile) */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 sm:gap-3">
          {member.social.linkedin && (
            <a
              href={member.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white/20 p-2 text-white backdrop-blur-sm hover:bg-white/30"
              aria-label={`${member.name} on LinkedIn`}
            >
              <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          )}
          {/* ... other social links */}
        </div>
      </div>

      {/* Info - Compact on mobile */}
      <div className="p-3 sm:p-5">
        <Link href={`/team/${member.id}`}>
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400 line-clamp-1">
            {member.name}
          </h3>
        </Link>
        <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 line-clamp-1">
          {member.role}
        </p>
        <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 line-clamp-2 dark:text-gray-400">
          {member.bio}
        </p>
        <p className="mt-2 sm:mt-3 text-xs text-gray-500 dark:text-gray-500">
          {member.location}
        </p>
      </div>
    </article>
  );
}
```

### Mobile Team Stats

```tsx
// components/team/mobile-team-stats.tsx
export function MobileTeamStats() {
  const stats = [
    { label: 'Team Members', value: '50+', icon: Users },
    { label: 'Countries', value: '12', icon: Globe2 },
    { label: 'Departments', value: '8', icon: Building2 },
    { label: 'Years Exp.', value: '200+', icon: Award },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 sm:gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:p-6 dark:border-gray-800 dark:bg-gray-900"
        >
          <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <stat.icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Mobile Member Profile

```tsx
// components/team/mobile-member-profile.tsx
export function MobileMemberProfile({ member }: { member: TeamMember }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <nav className="mb-6 sm:mb-8">
          <Link
            href="/team"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 dark:text-gray-400"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Team
          </Link>
        </nav>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-xl sm:rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
          {/* Header - Shorter on mobile */}
          <div className="relative h-32 sm:h-48 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
            <div className="absolute -bottom-12 sm:-bottom-16 left-4 sm:left-8">
              <Image
                src={member.avatar}
                alt={member.name}
                width={96}
                height={96}
                className="h-24 w-24 sm:h-32 sm:w-32 rounded-xl sm:rounded-2xl border-4 border-white shadow-lg dark:border-gray-900"
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-16 sm:pt-20">
            {/* Name and role - Stack on mobile */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  {member.name}
                </h1>
                <p className="mt-1 text-base sm:text-lg font-medium text-indigo-600 dark:text-indigo-400">
                  {member.role}
                </p>

                {/* Meta - Wrap on mobile */}
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-4 w-4" />
                    {member.department}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {member.location}
                  </span>
                </div>
              </div>

              {/* Social Links - Row on mobile */}
              <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                {member.social.linkedin && (
                  <a
                    href={member.social.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
                    aria-label="LinkedIn"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {/* ... other social links */}
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6 sm:mt-8">
              <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                About
              </h2>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                {member.bio}
              </p>
            </div>

            {/* Skills - Scrollable on mobile */}
            {member.skills && (
              <div className="mt-6 sm:mt-8">
                <h2 className="mb-3 sm:mb-4 text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {member.skills.map((skill: string) => (
                    <span
                      key={skill}
                      className="rounded-full bg-indigo-100 px-3 py-1 text-xs sm:text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Related Skills

- [L4/profile-page](./profile-page.md) - User profile pages
- [L3/user-menu](../organisms/user-menu.md) - User dropdown menu
- [L2/avatar](../molecules/avatar.md) - Avatar component

## Changelog

### 1.0.0 (2025-01-17)
- Initial implementation with grid, filters, and profile pages
