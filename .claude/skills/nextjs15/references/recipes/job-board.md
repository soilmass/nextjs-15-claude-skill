---
id: r-job-board
name: Job Board Platform
version: 3.0.0
layer: L6
category: recipes
description: Job listing platform with search, applications, and employer dashboard
tags: [jobs, hiring, recruitment, search, applications, employers]
formula: "JobBoard = SearchResultsPage(t-search-results-page) + DashboardLayout(t-dashboard-layout) + MarketingLayout(t-marketing-layout) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + SettingsPage(t-settings-page) + Header(o-header) + Sidebar(o-sidebar) + DataTable(o-data-table) + FileUploader(o-file-uploader) + SearchModal(o-search-modal) + Hero(o-hero) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + FilterBar(o-filter-bar) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + SearchInput(m-search-input) + StatCard(m-stat-card) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Filtering(pt-filtering) + UrlState(pt-url-state) + Pagination(pt-pagination) + Sorting(pt-sorting) + Search(pt-search) + FullTextSearch(pt-full-text-search) + StripeCheckout(pt-stripe-checkout) + StripeSubscriptions(pt-stripe-subscriptions) + StripeWebhooks(pt-stripe-webhooks) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + Opengraph(pt-opengraph) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + FileUpload(pt-file-upload) + ResumeParser(pt-resume-parser) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/search-results-page.md
  - ../templates/dashboard-layout.md
  - ../templates/marketing-layout.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/settings-page.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/file-uploader.md
  - ../organisms/search-modal.md
  - ../organisms/hero.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/filter-bar.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/search-input.md
  - ../molecules/stat-card.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/url-state.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  - ../patterns/search.md
  - ../patterns/full-text-search.md
  # L5 Patterns - Payments
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-subscriptions.md
  - ../patterns/stripe-webhooks.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  - ../patterns/opengraph.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Job Board Specific
  - ../patterns/file-upload.md
  - ../patterns/resume-parser.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
dependencies:
  - next
  - react
  - tailwindcss
  - prisma
  - elasticsearch
  - react-hook-form
  - zod
  - stripe
skills:
  - filtering
  - url-state
  - form-validation
  - multipart-upload
  - transactional-email
  - stripe-webhooks
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Job Board Platform Recipe

## Overview

A full-featured job board with advanced search, job posting management, application tracking, and subscription-based employer plans.

## Project Structure

```
job-board/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Job listings
│   │   ├── jobs/
│   │   │   ├── page.tsx          # Search/filter
│   │   │   └── [slug]/page.tsx   # Job detail
│   │   ├── companies/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   └── post-job/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── employer/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── applications/page.tsx
│   │   │   └── company/page.tsx
│   │   └── candidate/
│   │       ├── dashboard/page.tsx
│   │       ├── applications/page.tsx
│   │       ├── saved-jobs/page.tsx
│   │       └── profile/page.tsx
│   ├── api/
│   │   ├── jobs/route.ts
│   │   ├── applications/route.ts
│   │   ├── search/route.ts
│   │   └── webhooks/stripe/route.ts
│   └── layout.tsx
├── components/
│   ├── jobs/
│   │   ├── job-card.tsx
│   │   ├── job-filters.tsx
│   │   ├── job-search.tsx
│   │   └── job-form.tsx
│   ├── applications/
│   │   ├── application-form.tsx
│   │   └── application-card.tsx
│   └── company/
│       ├── company-card.tsx
│       └── company-profile.tsx
├── lib/
│   ├── prisma.ts
│   ├── search.ts
│   └── stripe.ts
└── prisma/
    └── schema.prisma
```

## Database Schema

```prisma
// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  role          UserRole  @default(CANDIDATE)
  company       Company?  @relation(fields: [companyId], references: [id])
  companyId     String?
  profile       CandidateProfile?
  applications  Application[]
  savedJobs     SavedJob[]
  createdAt     DateTime  @default(now())
}

enum UserRole {
  CANDIDATE
  EMPLOYER
  ADMIN
}

model Company {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  logo        String?
  website     String?
  location    String?
  size        String?
  industry    String?
  verified    Boolean   @default(false)
  jobs        Job[]
  users       User[]
  subscription Subscription?
  createdAt   DateTime  @default(now())
}

model Job {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  description   String
  requirements  String?
  benefits      String?
  type          JobType
  level         JobLevel
  salary        Json?     // { min, max, currency }
  location      String
  remote        RemoteType
  skills        String[]
  status        JobStatus @default(DRAFT)
  featured      Boolean   @default(false)
  expiresAt     DateTime?
  companyId     String
  company       Company   @relation(fields: [companyId], references: [id])
  applications  Application[]
  savedBy       SavedJob[]
  views         Int       @default(0)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([status, createdAt])
  @@index([companyId])
}

enum JobType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERNSHIP
  FREELANCE
}

enum JobLevel {
  ENTRY
  MID
  SENIOR
  LEAD
  EXECUTIVE
}

enum RemoteType {
  ONSITE
  REMOTE
  HYBRID
}

enum JobStatus {
  DRAFT
  ACTIVE
  PAUSED
  CLOSED
  EXPIRED
}

model Application {
  id          String    @id @default(cuid())
  status      ApplicationStatus @default(PENDING)
  coverLetter String?
  resumeUrl   String
  answers     Json?     // Custom questions
  notes       String?   // Internal notes
  rating      Int?      // 1-5
  jobId       String
  job         Job       @relation(fields: [jobId], references: [id])
  candidateId String
  candidate   User      @relation(fields: [candidateId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([jobId, candidateId])
}

enum ApplicationStatus {
  PENDING
  REVIEWING
  SHORTLISTED
  INTERVIEWING
  OFFERED
  HIRED
  REJECTED
}

model CandidateProfile {
  id          String    @id @default(cuid())
  headline    String?
  summary     String?
  resumeUrl   String?
  skills      String[]
  experience  Json[]    // Array of experience objects
  education   Json[]    // Array of education objects
  links       Json?     // { linkedin, github, portfolio }
  userId      String    @unique
  user        User      @relation(fields: [userId], references: [id])
}

model SavedJob {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  jobId     String
  job       Job      @relation(fields: [jobId], references: [id])
  createdAt DateTime @default(now())

  @@unique([userId, jobId])
}

model Subscription {
  id              String    @id @default(cuid())
  stripeCustomerId String
  stripePriceId   String
  status          String
  jobPostsLimit   Int
  featuredPosts   Int
  companyId       String    @unique
  company         Company   @relation(fields: [companyId], references: [id])
  currentPeriodEnd DateTime
}
```

## Implementation

### Job Search with Filters

```tsx
// components/jobs/job-search.tsx
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';
import { Search, MapPin, Briefcase, X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';

export function JobSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');

  const updateSearchParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when search changes
      params.delete('page');

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateSearchParams({ q: value || null });
  }, 300);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    debouncedSearch(e.target.value);
  };

  const clearSearch = () => {
    setQuery('');
    setLocation('');
    updateSearchParams({ q: null, location: null });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Job title, keywords, or company"
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex-1 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={location}
            onChange={handleLocationChange}
            placeholder="City, state, or remote"
            className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {(query || location) && (
          <button
            onClick={clearSearch}
            className="px-4 py-3 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isPending && (
        <div className="mt-2 text-sm text-gray-500">Searching...</div>
      )}
    </div>
  );
}
```

### Job Filters Component

```tsx
// components/jobs/job-filters.tsx
'use client';

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

const jobTypes = [
  { value: 'FULL_TIME', label: 'Full-time' },
  { value: 'PART_TIME', label: 'Part-time' },
  { value: 'CONTRACT', label: 'Contract' },
  { value: 'INTERNSHIP', label: 'Internship' },
  { value: 'FREELANCE', label: 'Freelance' },
];

const experienceLevels = [
  { value: 'ENTRY', label: 'Entry Level' },
  { value: 'MID', label: 'Mid Level' },
  { value: 'SENIOR', label: 'Senior Level' },
  { value: 'LEAD', label: 'Lead' },
  { value: 'EXECUTIVE', label: 'Executive' },
];

const remoteOptions = [
  { value: 'REMOTE', label: 'Remote' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'ONSITE', label: 'On-site' },
];

const salaryRanges = [
  { value: '0-50000', label: '$0 - $50k' },
  { value: '50000-100000', label: '$50k - $100k' },
  { value: '100000-150000', label: '$100k - $150k' },
  { value: '150000+', label: '$150k+' },
];

export function JobFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getSelectedValues = (key: string): string[] => {
    const value = searchParams.get(key);
    return value ? value.split(',') : [];
  };

  const updateFilter = useCallback(
    (key: string, value: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString());
      const current = getSelectedValues(key);

      let updated: string[];
      if (checked) {
        updated = [...current, value];
      } else {
        updated = current.filter((v) => v !== value);
      }

      if (updated.length > 0) {
        params.set(key, updated.join(','));
      } else {
        params.delete(key);
      }

      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
    },
    [pathname, router, searchParams]
  );

  const clearFilters = () => {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasFilters =
    searchParams.has('type') ||
    searchParams.has('level') ||
    searchParams.has('remote') ||
    searchParams.has('salary');

  return (
    <div className="bg-white rounded-xl border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Filters</h2>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Job Type */}
      <FilterSection
        title="Job Type"
        options={jobTypes}
        selectedValues={getSelectedValues('type')}
        onToggle={(value, checked) => updateFilter('type', value, checked)}
      />

      {/* Experience Level */}
      <FilterSection
        title="Experience Level"
        options={experienceLevels}
        selectedValues={getSelectedValues('level')}
        onToggle={(value, checked) => updateFilter('level', value, checked)}
      />

      {/* Remote */}
      <FilterSection
        title="Work Location"
        options={remoteOptions}
        selectedValues={getSelectedValues('remote')}
        onToggle={(value, checked) => updateFilter('remote', value, checked)}
      />

      {/* Salary */}
      <FilterSection
        title="Salary Range"
        options={salaryRanges}
        selectedValues={getSelectedValues('salary')}
        onToggle={(value, checked) => updateFilter('salary', value, checked)}
      />
    </div>
  );
}

interface FilterSectionProps {
  title: string;
  options: { value: string; label: string }[];
  selectedValues: string[];
  onToggle: (value: string, checked: boolean) => void;
}

function FilterSection({
  title,
  options,
  selectedValues,
  onToggle,
}: FilterSectionProps) {
  return (
    <div>
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Checkbox.Root
              checked={selectedValues.includes(option.value)}
              onCheckedChange={(checked) =>
                onToggle(option.value, checked as boolean)
              }
              className="w-4 h-4 border rounded flex items-center justify-center data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            >
              <Checkbox.Indicator>
                <Check className="w-3 h-3 text-white" />
              </Checkbox.Indicator>
            </Checkbox.Root>
            <span className="text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
```

### Job Card Component

```tsx
// components/jobs/job-card.tsx
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Clock, DollarSign, Bookmark, Building2 } from 'lucide-react';

interface JobCardProps {
  job: {
    id: string;
    slug: string;
    title: string;
    type: string;
    level: string;
    location: string;
    remote: string;
    salary?: { min: number; max: number; currency: string };
    skills: string[];
    featured: boolean;
    createdAt: Date;
    company: {
      name: string;
      slug: string;
      logo?: string;
    };
  };
  onSave?: (jobId: string) => void;
  isSaved?: boolean;
}

export function JobCard({ job, onSave, isSaved }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salary) return null;
    const { min, max, currency } = job.salary;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    });
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  };

  const typeLabels: Record<string, string> = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
    INTERNSHIP: 'Internship',
    FREELANCE: 'Freelance',
  };

  const remoteLabels: Record<string, string> = {
    REMOTE: 'Remote',
    HYBRID: 'Hybrid',
    ONSITE: 'On-site',
  };

  return (
    <article
      className={`bg-white rounded-xl border p-6 hover:shadow-lg transition-shadow ${
        job.featured ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {job.featured && (
        <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded mb-3">
          Featured
        </span>
      )}

      <div className="flex items-start gap-4">
        <Link href={`/companies/${job.company.slug}`}>
          {job.company.logo ? (
            <Image
              src={job.company.logo}
              alt={job.company.name}
              width={48}
              height={48}
              className="rounded-lg"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-gray-400" />
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <Link href={`/jobs/${job.slug}`}>
            <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
          </Link>

          <Link
            href={`/companies/${job.company.slug}`}
            className="text-gray-600 hover:text-gray-900"
          >
            {job.company.name}
          </Link>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              {remoteLabels[job.remote]}
            </span>
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              {typeLabels[job.type]}
            </span>
            {formatSalary() && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {formatSalary()}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-3">
            {job.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-md"
              >
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {onSave && (
            <button
              onClick={() => onSave(job.id)}
              className={`p-2 rounded-lg transition-colors ${
                isSaved
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          )}
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="w-3 h-3" />
            {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </article>
  );
}
```

### Application Form

```tsx
// components/applications/application-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Loader2, FileText } from 'lucide-react';

const schema = z.object({
  coverLetter: z.string().optional(),
  resumeUrl: z.string().min(1, 'Resume is required'),
});

type FormData = z.infer<typeof schema>;

interface ApplicationFormProps {
  jobId: string;
  jobTitle: string;
  onSuccess: () => void;
}

export function ApplicationForm({
  jobId,
  jobTitle,
  onSuccess,
}: ApplicationFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'resume');

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const { url } = await response.json();
      setUploadedFile({ name: file.name, url });
      setValue('resumeUrl', url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, jobId }),
      });

      if (response.ok) {
        onSuccess();
      }
    } catch (error) {
      console.error('Application failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Apply for {jobTitle}</h3>
        <p className="text-sm text-gray-600">
          Submit your application with your resume and optional cover letter.
        </p>
      </div>

      {/* Resume Upload */}
      <div>
        <label className="block text-sm font-medium mb-2">Resume *</label>
        <div className="border-2 border-dashed rounded-lg p-6 text-center">
          {uploadedFile ? (
            <div className="flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-sm">{uploadedFile.name}</span>
              <button
                type="button"
                onClick={() => {
                  setUploadedFile(null);
                  setValue('resumeUrl', '');
                }}
                className="text-sm text-red-600 hover:underline ml-2"
              >
                Remove
              </button>
            </div>
          ) : (
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              {isUploading ? (
                <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin text-blue-600" />
              ) : (
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              )}
              <p className="text-sm text-gray-600">
                {isUploading ? 'Uploading...' : 'Click to upload your resume'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                PDF, DOC, or DOCX (max 5MB)
              </p>
            </label>
          )}
        </div>
        {errors.resumeUrl && (
          <p className="mt-1 text-sm text-red-600">{errors.resumeUrl.message}</p>
        )}
      </div>

      {/* Cover Letter */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Cover Letter (Optional)
        </label>
        <textarea
          {...register('coverLetter')}
          rows={6}
          placeholder="Tell the employer why you're a great fit for this role..."
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !uploadedFile}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting...
          </>
        ) : (
          'Submit Application'
        )}
      </button>
    </form>
  );
}
```

### Jobs API Route

```tsx
// app/api/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const q = searchParams.get('q');
  const location = searchParams.get('location');
  const types = searchParams.get('type')?.split(',');
  const levels = searchParams.get('level')?.split(',');
  const remotes = searchParams.get('remote')?.split(',');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');

  const where: any = {
    status: 'ACTIVE',
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { skills: { hasSome: [q] } },
      { company: { name: { contains: q, mode: 'insensitive' } } },
    ];
  }

  if (location) {
    where.OR = [
      ...(where.OR || []),
      { location: { contains: location, mode: 'insensitive' } },
    ];
  }

  if (types?.length) {
    where.type = { in: types };
  }

  if (levels?.length) {
    where.level = { in: levels };
  }

  if (remotes?.length) {
    where.remote = { in: remotes };
  }

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      include: {
        company: {
          select: { name: true, slug: true, logo: true },
        },
        _count: { select: { applications: true } },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.job.count({ where }),
  ]);

  return NextResponse.json({
    jobs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}
```

## Skills Used

| Skill | Purpose | Reference |
|-------|---------|-----------|
| filtering | Advanced job filtering by type, level, salary | [filtering.md](../patterns/filtering.md) |
| url-state | Sync filters and search to URL params | [url-state.md](../patterns/url-state.md) |
| form-validation | Application and job posting forms | [form-validation.md](../patterns/form-validation.md) |
| multipart-upload | Resume and document uploads | [file-uploader.md](../organisms/file-uploader.md) |
| pagination | Paginated job listings | [pagination.md](../patterns/pagination.md) |
| search | Job search with debouncing | [search.md](../patterns/search.md) |

## Testing

### Test Setup

```tsx
// __tests__/setup.ts
import '@testing-library/jest-dom';
import { server } from './mocks/server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Unit Tests

```tsx
// __tests__/components/job-card.test.tsx
import { render, screen } from '@testing-library/react';
import { JobCard } from '@/components/jobs/job-card';

const mockJob = {
  id: '1',
  slug: 'senior-developer',
  title: 'Senior Developer',
  type: 'FULL_TIME',
  level: 'SENIOR',
  location: 'San Francisco, CA',
  remote: 'HYBRID',
  salary: { min: 120000, max: 180000, currency: 'USD' },
  skills: ['React', 'TypeScript', 'Node.js'],
  featured: false,
  createdAt: new Date(),
  company: { name: 'TechCorp', slug: 'techcorp', logo: null },
};

describe('JobCard', () => {
  it('renders job title and company', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('Senior Developer')).toBeInTheDocument();
    expect(screen.getByText('TechCorp')).toBeInTheDocument();
  });

  it('displays salary range formatted', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText(/\$120,000 - \$180,000/)).toBeInTheDocument();
  });

  it('shows featured badge when job is featured', () => {
    render(<JobCard job={{ ...mockJob, featured: true }} />);
    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('renders skills tags', () => {
    render(<JobCard job={mockJob} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });
});
```

### Integration Tests

```tsx
// __tests__/api/jobs.test.ts
import { GET } from '@/app/api/jobs/route';
import { prisma } from '@/lib/prisma';

jest.mock('@/lib/prisma', () => ({
  prisma: {
    job: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('GET /api/jobs', () => {
  it('returns paginated jobs', async () => {
    (prisma.job.findMany as jest.Mock).mockResolvedValue([mockJob]);
    (prisma.job.count as jest.Mock).mockResolvedValue(1);

    const request = new Request('http://localhost/api/jobs?page=1&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(data.jobs).toHaveLength(1);
    expect(data.pagination.total).toBe(1);
  });

  it('filters by job type', async () => {
    const request = new Request('http://localhost/api/jobs?type=FULL_TIME');
    await GET(request);

    expect(prisma.job.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          type: { in: ['FULL_TIME'] },
        }),
      })
    );
  });
});
```

### E2E Tests (Playwright)

```tsx
// e2e/job-search.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Job Search', () => {
  test('searches for jobs by keyword', async ({ page }) => {
    await page.goto('/jobs');
    await page.fill('input[placeholder*="Job title"]', 'React Developer');
    await page.waitForTimeout(500); // Debounce

    await expect(page.locator('[data-testid="job-card"]')).toHaveCount.greaterThan(0);
    await expect(page).toHaveURL(/q=React\+Developer/);
  });

  test('filters jobs by type', async ({ page }) => {
    await page.goto('/jobs');
    await page.click('text=Full-time');

    await expect(page).toHaveURL(/type=FULL_TIME/);
  });

  test('applies to a job', async ({ page }) => {
    await page.goto('/jobs/senior-developer');
    await page.click('text=Apply Now');

    await page.setInputFiles('input[type="file"]', 'test-resume.pdf');
    await page.fill('textarea', 'Cover letter content...');
    await page.click('text=Submit Application');

    await expect(page.locator('text=Application submitted')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-4">
          We encountered an error loading job listings.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
```

### API Error Handler

```tsx
// lib/api-error.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown) {
  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error:', error);
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Usage in route handler
export async function POST(request: Request) {
  try {
    const data = await request.json();
    // ... handle request
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### Form Validation Errors

```tsx
// lib/validations/job.ts
import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(100, 'Description must be at least 100 characters'),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'FREELANCE']),
  level: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']),
  location: z.string().min(2, 'Location is required'),
  remote: z.enum(['ONSITE', 'REMOTE', 'HYBRID']),
  salary: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
    currency: z.string().length(3),
  }).refine(data => data.max >= data.min, {
    message: 'Max salary must be greater than min salary',
  }).optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
});

export type JobInput = z.infer<typeof jobSchema>;
```

## Accessibility

### WCAG Compliance

| Criterion | Level | Implementation |
|-----------|-------|----------------|
| 1.1.1 Non-text Content | A | Alt text for company logos |
| 1.3.1 Info and Relationships | A | Semantic HTML, ARIA labels |
| 1.4.3 Contrast | AA | 4.5:1 text contrast ratio |
| 2.1.1 Keyboard | A | Full keyboard navigation |
| 2.4.4 Link Purpose | A | Descriptive link text |
| 4.1.2 Name, Role, Value | A | ARIA attributes on custom components |

### Focus Management

```tsx
// components/jobs/job-filters.tsx
import { useRef, useEffect } from 'react';

export function JobFilters({ onFilterChange }: Props) {
  const firstFilterRef = useRef<HTMLInputElement>(null);

  // Focus first filter when panel opens
  useEffect(() => {
    firstFilterRef.current?.focus();
  }, []);

  return (
    <div role="region" aria-label="Job filters">
      <h2 id="filter-heading" className="sr-only">Filter jobs</h2>
      <div role="group" aria-labelledby="filter-heading">
        <input
          ref={firstFilterRef}
          type="checkbox"
          aria-label="Full-time jobs"
          // ...
        />
      </div>
    </div>
  );
}
```

### Accessible Forms

```tsx
// components/applications/application-form.tsx
<form onSubmit={handleSubmit} aria-describedby="form-instructions">
  <p id="form-instructions" className="sr-only">
    Required fields are marked with an asterisk
  </p>

  <div>
    <label htmlFor="resume" className="block text-sm font-medium">
      Resume <span aria-label="required">*</span>
    </label>
    <input
      id="resume"
      type="file"
      accept=".pdf,.doc,.docx"
      aria-required="true"
      aria-describedby="resume-help resume-error"
    />
    <p id="resume-help" className="text-sm text-gray-500">
      PDF, DOC, or DOCX (max 5MB)
    </p>
    {errors.resume && (
      <p id="resume-error" role="alert" className="text-sm text-red-600">
        {errors.resume.message}
      </p>
    )}
  </div>
</form>
```

## Security

### Zod Validation

```tsx
// lib/validations/application.ts
import { z } from 'zod';

export const applicationSchema = z.object({
  jobId: z.string().cuid(),
  coverLetter: z.string().max(5000).optional(),
  resumeUrl: z.string().url().refine(
    url => url.startsWith(process.env.STORAGE_URL!),
    'Invalid resume URL'
  ),
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.string().max(1000),
  })).optional(),
});
```

### Rate Limiting

```tsx
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/applications')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new Response('Too many applications. Please try again later.', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
  }
}
```

### Auth Middleware

```tsx
// lib/auth-middleware.ts
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new APIError('Unauthorized', 401);
  }
  return session.user;
}

export async function requireEmployer() {
  const user = await requireAuth();
  if (user.role !== 'EMPLOYER') {
    throw new APIError('Forbidden - Employer access required', 403);
  }
  return user;
}
```

## Performance

### Caching Strategy

```tsx
// app/api/jobs/route.ts
import { unstable_cache } from 'next/cache';

const getCachedJobs = unstable_cache(
  async (filters: string) => {
    return prisma.job.findMany({
      where: JSON.parse(filters),
      include: { company: true },
    });
  },
  ['jobs'],
  { revalidate: 60, tags: ['jobs'] }
);

// Invalidate on job create/update
import { revalidateTag } from 'next/cache';
revalidateTag('jobs');
```

### Image Optimization

```tsx
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'storage.example.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
};

// Usage
<Image
  src={company.logo}
  alt={company.name}
  width={48}
  height={48}
  className="rounded-lg"
  placeholder="blur"
  blurDataURL={company.logoBlurHash}
/>
```

### Bundle Optimization

```tsx
// Dynamic imports for heavy components
const JobFilters = dynamic(() => import('@/components/jobs/job-filters'), {
  loading: () => <FiltersSkeleton />,
  ssr: false,
});

// Route segment config
export const dynamic = 'force-dynamic';
export const revalidate = 60;
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Run linting
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run unit tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test

      - name: Build application
        run: npm run build

  e2e:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

## Monitoring

### Sentry Integration

```tsx
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
});

// Track job application errors
export function trackApplicationError(jobId: string, error: Error) {
  Sentry.captureException(error, {
    tags: { feature: 'job-application' },
    extra: { jobId },
  });
}
```

### Health Checks

```tsx
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    database: false,
    elasticsearch: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (e) {
    console.error('Database health check failed:', e);
  }

  const healthy = checks.database;

  return Response.json(checks, {
    status: healthy ? 200 : 503,
  });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/jobboard"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Storage (for resumes)
STORAGE_URL="https://storage.example.com"
STORAGE_ACCESS_KEY="your-access-key"
STORAGE_SECRET_KEY="your-secret-key"

# Stripe (for subscriptions)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email"
SMTP_PASSWORD="your-password"

# Elasticsearch (optional)
ELASTICSEARCH_URL="http://localhost:9200"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://..."
SENTRY_AUTH_TOKEN="sntrys_..."

# Rate Limiting
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

## Deployment Checklist

- [ ] Environment variables configured in production
- [ ] Database migrations run successfully
- [ ] Stripe webhooks configured and tested
- [ ] Email service verified (application notifications)
- [ ] File storage configured for resume uploads
- [ ] Search indexing completed (if using Elasticsearch)
- [ ] SSL certificate installed
- [ ] Rate limiting enabled
- [ ] Error monitoring configured (Sentry)
- [ ] Health check endpoint verified
- [ ] Cache headers configured
- [ ] Image optimization working
- [ ] SEO meta tags added
- [ ] Analytics tracking installed
- [ ] Backup strategy in place
- [ ] Load testing completed

## Related Skills

- [[filtering]] - Advanced filtering
- [[url-state]] - URL state management
- [[multipart-upload]] - Resume uploads
- [[form-validation]] - Form handling
- [[stripe-webhooks]] - Subscription payments

## Changelog

### 1.0.0 (2025-01-17)
- Initial recipe implementation
- Job search and filters
- Application management
- Employer dashboard
- Subscription-based posting
