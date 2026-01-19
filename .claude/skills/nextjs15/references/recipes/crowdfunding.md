---
id: r-crowdfunding
name: Crowdfunding Platform
version: 3.0.0
layer: L6
category: recipes
description: Crowdfunding platform with campaigns, pledge tiers, rewards, milestones, and backer management
tags: [crowdfunding, campaigns, pledges, rewards, payments, social]
formula: "Crowdfunding = LandingPage(t-landing-page) + CheckoutPage(t-checkout-page) + DashboardLayout(t-dashboard-layout) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + ProfilePage(t-profile-page) + ProductCard(o-product-card) + Hero(o-hero) + DataTable(o-data-table) + Chart(o-chart) + CommentsSection(o-comments-section) + SocialShare(o-social-share) + FileUploader(o-file-uploader) + MultiStepForm(o-multi-step-form) + Header(o-header) + Footer(o-footer) + NotificationCenter(o-notification-center) + Faq(o-faq) + Timeline(o-timeline) + SettingsForm(o-settings-form) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + StatCard(m-stat-card) + FormField(m-form-field) + EmptyState(m-empty-state) + Rating(m-rating) + Stepper(m-stepper) + TimelineItem(m-timeline-item) + Card(m-card) + ShareButton(m-share-button) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + StripeCheckout(pt-stripe-checkout) + StripeWebhooks(pt-stripe-webhooks) + FileUpload(pt-file-upload) + FileStorage(pt-file-storage) + ImageOptimization(pt-image-optimization) + RichTextEditor(pt-rich-text-editor) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + SocialSharing(pt-social-sharing) + Websockets(pt-websockets) + PushNotifications(pt-push-notifications) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + DateFormatting(pt-date-formatting) + Pagination(pt-pagination) + Filtering(pt-filtering) + Sorting(pt-sorting) + TestingE2e(pt-testing-e2e)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/stat-card.md
  - ../molecules/form-field.md
  - ../molecules/empty-state.md
  - ../molecules/rating.md
  - ../molecules/stepper.md
  - ../molecules/timeline-item.md
  - ../molecules/card.md
  - ../molecules/share-button.md
  # L3 Organisms - Complex Components
  - ../organisms/product-card.md
  - ../organisms/hero.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/comments-section.md
  - ../organisms/social-share.md
  - ../organisms/file-uploader.md
  - ../organisms/multi-step-form.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/notification-center.md
  - ../organisms/faq.md
  - ../organisms/timeline.md
  - ../organisms/settings-form.md
  # L4 Templates - Page Layouts
  - ../templates/landing-page.md
  - ../templates/checkout-page.md
  - ../templates/dashboard-layout.md
  - ../templates/auth-layout.md
  - ../templates/settings-page.md
  - ../templates/profile-page.md
  # L5 Patterns - Authentication & Security
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Payments
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-webhooks.md
  # L5 Patterns - File & Media
  - ../patterns/file-upload.md
  - ../patterns/file-storage.md
  - ../patterns/image-optimization.md
  - ../patterns/rich-text-editor.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  - ../patterns/social-sharing.md
  - ../patterns/websockets.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - SEO
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Data & State
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/date-formatting.md
  - ../patterns/pagination.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - stripe@14.0.0
  - uploadthing@6.0.0
  - resend@3.0.0
skills:
  - stripe-integration
  - file-upload
  - rich-text-editor
  - social-sharing
  - email-notifications
  - realtime-updates
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

## Overview

A full-featured crowdfunding platform enabling creators to launch campaigns with tiered rewards, track milestones, manage backers, and process payments through Stripe. Includes social features, campaign updates, and comprehensive dashboard analytics for creators.

## Project Structure

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx                    # Homepage with featured campaigns
│   ├── explore/page.tsx            # Browse campaigns
│   └── how-it-works/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── verify/page.tsx
├── campaigns/
│   ├── page.tsx                    # Campaign listing
│   ├── [slug]/
│   │   ├── page.tsx                # Campaign detail
│   │   ├── updates/page.tsx        # Campaign updates
│   │   ├── backers/page.tsx        # Public backer list
│   │   └── pledge/page.tsx         # Pledge flow
│   └── create/page.tsx             # Create campaign
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx                    # Creator dashboard
│   ├── campaigns/
│   │   ├── page.tsx                # My campaigns
│   │   └── [id]/
│   │       ├── page.tsx            # Campaign management
│   │       ├── edit/page.tsx
│   │       ├── rewards/page.tsx
│   │       ├── updates/page.tsx
│   │       ├── backers/page.tsx
│   │       ├── messages/page.tsx
│   │       └── analytics/page.tsx
│   ├── pledges/page.tsx            # My pledges (as backer)
│   └── settings/page.tsx
├── api/
│   ├── campaigns/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   ├── [id]/publish/route.ts
│   │   └── [id]/updates/route.ts
│   ├── rewards/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── pledges/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── checkout/route.ts
│   ├── webhooks/
│   │   └── stripe/route.ts
│   └── upload/route.ts
└── components/
    ├── campaigns/
    │   ├── campaign-card.tsx
    │   ├── campaign-hero.tsx
    │   ├── campaign-form.tsx
    │   ├── campaign-progress.tsx
    │   ├── campaign-tabs.tsx
    │   └── campaign-share.tsx
    ├── rewards/
    │   ├── reward-card.tsx
    │   ├── reward-form.tsx
    │   └── reward-selector.tsx
    ├── pledges/
    │   ├── pledge-form.tsx
    │   ├── pledge-summary.tsx
    │   └── backer-list.tsx
    ├── updates/
    │   ├── update-card.tsx
    │   └── update-form.tsx
    ├── dashboard/
    │   ├── stats-overview.tsx
    │   ├── funding-chart.tsx
    │   └── backer-activity.tsx
    └── explore/
        ├── category-nav.tsx
        ├── campaign-grid.tsx
        └── search-filters.tsx
lib/
├── stripe.ts
├── email.ts
└── campaign-utils.ts
```

## Database Schema

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
  name          String
  passwordHash  String
  avatarUrl     String?
  bio           String?
  location      String?
  website       String?
  
  // Stripe Connect for creators
  stripeAccountId    String?   @unique
  stripeAccountStatus StripeAccountStatus?
  
  // Verification
  emailVerified Boolean   @default(false)
  verifiedAt    DateTime?
  
  campaigns     Campaign[]
  pledges       Pledge[]
  comments      Comment[]
  likes         CampaignLike[]
  follows       CampaignFollow[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum StripeAccountStatus {
  PENDING
  ENABLED
  RESTRICTED
  DISABLED
}

model Category {
  id        String     @id @default(cuid())
  name      String     @unique
  slug      String     @unique
  icon      String?
  color     String?
  
  campaigns Campaign[]
}

model Campaign {
  id              String         @id @default(cuid())
  creatorId       String
  categoryId      String?
  
  // Basic info
  title           String
  slug            String         @unique
  tagline         String
  description     String         @db.Text
  story           String?        @db.Text  // Rich text content
  
  // Media
  imageUrl        String?
  videoUrl        String?
  galleryImages   String[]
  
  // Funding
  goalAmount      Decimal        @db.Decimal(10, 2)
  currency        String         @default("USD")
  fundingType     FundingType    @default(ALL_OR_NOTHING)
  
  // Timeline
  launchDate      DateTime?
  endDate         DateTime
  duration        Int            // Days
  
  // Status
  status          CampaignStatus @default(DRAFT)
  isStaffPick     Boolean        @default(false)
  isFeatured      Boolean        @default(false)
  
  // Settings
  showBackers     Boolean        @default(true)
  allowComments   Boolean        @default(true)
  
  // Location
  location        String?
  country         String?
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  creator         User           @relation(fields: [creatorId], references: [id])
  category        Category?      @relation(fields: [categoryId], references: [id])
  rewards         Reward[]
  pledges         Pledge[]
  updates         CampaignUpdate[]
  milestones      Milestone[]
  faqs            FAQ[]
  comments        Comment[]
  likes           CampaignLike[]
  follows         CampaignFollow[]
  
  publishedAt     DateTime?
  fundedAt        DateTime?
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@index([creatorId])
  @@index([categoryId])
  @@index([status])
  @@index([endDate])
}

enum FundingType {
  ALL_OR_NOTHING    // Kickstarter style
  KEEP_IT_ALL       // GoFundMe style
  FLEXIBLE          // Mix
}

enum CampaignStatus {
  DRAFT
  PENDING_REVIEW
  ACTIVE
  FUNDED
  FAILED
  CANCELLED
  COMPLETED
}

model Reward {
  id              String    @id @default(cuid())
  campaignId      String
  
  title           String
  description     String    @db.Text
  amount          Decimal   @db.Decimal(10, 2)
  currency        String    @default("USD")
  
  // Inventory
  limitedQuantity Boolean   @default(false)
  totalQuantity   Int?
  claimedQuantity Int       @default(0)
  
  // Delivery
  estimatedDelivery DateTime?
  shipsTo          String[]  // Country codes, empty = worldwide
  shippingCost     Decimal?  @db.Decimal(10, 2)
  
  // Items included
  items           String[]
  
  // Media
  imageUrl        String?
  
  isActive        Boolean   @default(true)
  order           Int       @default(0)
  
  campaign        Campaign  @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  pledges         Pledge[]
  
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@index([campaignId])
}

model Pledge {
  id                String       @id @default(cuid())
  campaignId        String
  backerId          String
  rewardId          String?
  
  amount            Decimal      @db.Decimal(10, 2)
  tipAmount         Decimal      @default(0) @db.Decimal(10, 2)
  totalAmount       Decimal      @db.Decimal(10, 2)
  currency          String       @default("USD")
  
  // Payment
  stripePaymentIntentId String?  @unique
  status            PledgeStatus @default(PENDING)
  
  // Shipping
  shippingName      String?
  shippingAddress   String?
  shippingCity      String?
  shippingState     String?
  shippingPostal    String?
  shippingCountry   String?
  
  // Preferences
  isAnonymous       Boolean      @default(false)
  message           String?
  
  // Reward fulfillment
  fulfillmentStatus FulfillmentStatus @default(PENDING)
  fulfilledAt       DateTime?
  trackingNumber    String?
  
  campaign          Campaign     @relation(fields: [campaignId], references: [id])
  backer            User         @relation(fields: [backerId], references: [id])
  reward            Reward?      @relation(fields: [rewardId], references: [id])
  
  paidAt            DateTime?
  refundedAt        DateTime?
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
  
  @@index([campaignId])
  @@index([backerId])
  @@index([status])
}

enum PledgeStatus {
  PENDING
  PROCESSING
  SUCCEEDED
  FAILED
  REFUNDED
  CANCELLED
}

enum FulfillmentStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  ISSUE
}

model CampaignUpdate {
  id          String   @id @default(cuid())
  campaignId  String
  
  title       String
  content     String   @db.Text
  imageUrl    String?
  videoUrl    String?
  
  isPublic    Boolean  @default(true)  // false = backers only
  
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  comments    Comment[]
  
  publishedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([campaignId])
}

model Milestone {
  id          String          @id @default(cuid())
  campaignId  String
  
  title       String
  description String?
  targetAmount Decimal        @db.Decimal(10, 2)
  isReached   Boolean         @default(false)
  reachedAt   DateTime?
  
  order       Int             @default(0)
  
  campaign    Campaign        @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime        @default(now())
  
  @@index([campaignId])
}

model FAQ {
  id          String   @id @default(cuid())
  campaignId  String
  
  question    String
  answer      String   @db.Text
  order       Int      @default(0)
  
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([campaignId])
}

model Comment {
  id          String          @id @default(cuid())
  userId      String
  campaignId  String?
  updateId    String?
  parentId    String?
  
  content     String          @db.Text
  
  user        User            @relation(fields: [userId], references: [id])
  campaign    Campaign?       @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  update      CampaignUpdate? @relation(fields: [updateId], references: [id], onDelete: Cascade)
  parent      Comment?        @relation("CommentReplies", fields: [parentId], references: [id])
  replies     Comment[]       @relation("CommentReplies")
  
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt
  
  @@index([campaignId])
  @@index([updateId])
  @@index([parentId])
}

model CampaignLike {
  id          String   @id @default(cuid())
  userId      String
  campaignId  String
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@unique([userId, campaignId])
}

model CampaignFollow {
  id          String   @id @default(cuid())
  userId      String
  campaignId  String
  
  // Notification preferences
  notifyUpdates    Boolean @default(true)
  notifyMilestones Boolean @default(true)
  notifyComments   Boolean @default(false)
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  campaign    Campaign @relation(fields: [campaignId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@unique([userId, campaignId])
}
```

## Implementation

### Campaign Detail Page

```tsx
// app/campaigns/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { CampaignHero } from '@/components/campaigns/campaign-hero';
import { CampaignProgress } from '@/components/campaigns/campaign-progress';
import { CampaignTabs } from '@/components/campaigns/campaign-tabs';
import { RewardSelector } from '@/components/rewards/reward-selector';
import { CampaignShare } from '@/components/campaigns/campaign-share';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    select: { title: true, tagline: true, imageUrl: true, metaTitle: true, metaDescription: true },
  });
  
  if (!campaign) return {};
  
  return {
    title: campaign.metaTitle || campaign.title,
    description: campaign.metaDescription || campaign.tagline,
    openGraph: {
      title: campaign.title,
      description: campaign.tagline,
      images: campaign.imageUrl ? [campaign.imageUrl] : [],
    },
  };
}

export default async function CampaignPage({ params }: Props) {
  const { slug } = await params;
  
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          bio: true,
          _count: { select: { campaigns: true } },
        },
      },
      category: true,
      rewards: {
        where: { isActive: true },
        orderBy: { amount: 'asc' },
      },
      milestones: {
        orderBy: { targetAmount: 'asc' },
      },
      faqs: {
        orderBy: { order: 'asc' },
      },
      _count: {
        select: {
          pledges: { where: { status: 'SUCCEEDED' } },
          comments: true,
          likes: true,
          follows: true,
        },
      },
    },
  });
  
  if (!campaign || campaign.status === 'DRAFT') {
    notFound();
  }
  
  // Calculate funding stats
  const fundingStats = await prisma.pledge.aggregate({
    where: {
      campaignId: campaign.id,
      status: 'SUCCEEDED',
    },
    _sum: { totalAmount: true },
    _count: true,
  });
  
  const amountRaised = Number(fundingStats._sum.totalAmount || 0);
  const goalAmount = Number(campaign.goalAmount);
  const percentFunded = Math.min(100, (amountRaised / goalAmount) * 100);
  const backerCount = fundingStats._count;
  
  const now = new Date();
  const endDate = new Date(campaign.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const isEnded = now > endDate;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <CampaignHero
        title={campaign.title}
        tagline={campaign.tagline}
        imageUrl={campaign.imageUrl}
        videoUrl={campaign.videoUrl}
        category={campaign.category}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Progress Bar */}
            <CampaignProgress
              amountRaised={amountRaised}
              goalAmount={goalAmount}
              percentFunded={percentFunded}
              backerCount={backerCount}
              daysLeft={daysLeft}
              isEnded={isEnded}
              fundingType={campaign.fundingType}
              currency={campaign.currency}
            />
            
            {/* Tabs: Story, Updates, Comments, FAQs */}
            <CampaignTabs
              campaign={campaign}
              updateCount={0} // Fetch separately if needed
              commentCount={campaign._count.comments}
              faqCount={campaign.faqs.length}
            />
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Creator Info */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={campaign.creator.avatarUrl || '/default-avatar.png'}
                  alt={campaign.creator.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{campaign.creator.name}</p>
                  <p className="text-sm text-gray-500">
                    {campaign.creator._count.campaigns} campaigns
                  </p>
                </div>
              </div>
              {campaign.creator.bio && (
                <p className="text-sm text-gray-600">{campaign.creator.bio}</p>
              )}
            </div>
            
            {/* Rewards */}
            <RewardSelector
              rewards={campaign.rewards}
              campaignId={campaign.id}
              campaignSlug={campaign.slug}
              isEnded={isEnded}
              currency={campaign.currency}
            />
            
            {/* Share */}
            <CampaignShare
              title={campaign.title}
              slug={campaign.slug}
              likeCount={campaign._count.likes}
              followCount={campaign._count.follows}
            />
            
            {/* Milestones */}
            {campaign.milestones.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Stretch Goals</h3>
                <div className="space-y-4">
                  {campaign.milestones.map((milestone) => {
                    const reached = amountRaised >= Number(milestone.targetAmount);
                    return (
                      <div
                        key={milestone.id}
                        className={`p-4 rounded-lg border ${
                          reached ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium">{milestone.title}</span>
                          <span className="text-sm">
                            ${Number(milestone.targetAmount).toLocaleString()}
                          </span>
                        </div>
                        {milestone.description && (
                          <p className="text-sm text-gray-600">{milestone.description}</p>
                        )}
                        {reached && (
                          <p className="text-xs text-green-600 mt-2">Unlocked!</p>
                        )}
                      </div>
                    );
                  })}
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

### Campaign Progress Component

```tsx
// components/campaigns/campaign-progress.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';

interface CampaignProgressProps {
  amountRaised: number;
  goalAmount: number;
  percentFunded: number;
  backerCount: number;
  daysLeft: number;
  isEnded: boolean;
  fundingType: 'ALL_OR_NOTHING' | 'KEEP_IT_ALL' | 'FLEXIBLE';
  currency: string;
}

export function CampaignProgress({
  amountRaised,
  goalAmount,
  percentFunded,
  backerCount,
  daysLeft,
  isEnded,
  fundingType,
  currency,
}: CampaignProgressProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const isFunded = percentFunded >= 100;
  
  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isFunded ? 'bg-green-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, percentFunded)}%` }}
          />
        </div>
      </div>
      
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl md:text-3xl font-bold text-indigo-600">
            {formatCurrency(amountRaised)}
          </p>
          <p className="text-sm text-gray-500">
            pledged of {formatCurrency(goalAmount)} goal
          </p>
        </div>
        <div>
          <p className="text-2xl md:text-3xl font-bold">
            {backerCount.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">backers</p>
        </div>
        <div>
          {isEnded ? (
            <>
              <p className="text-2xl md:text-3xl font-bold text-gray-400">
                Ended
              </p>
              <p className="text-sm text-gray-500">
                {isFunded ? 'Successfully funded' : 'Campaign ended'}
              </p>
            </>
          ) : (
            <>
              <p className="text-2xl md:text-3xl font-bold">{daysLeft}</p>
              <p className="text-sm text-gray-500">days to go</p>
            </>
          )}
        </div>
      </div>
      
      {/* Funding Type Badge */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {fundingType === 'ALL_OR_NOTHING' && (
              <>All or nothing &mdash; This campaign will only be funded if it reaches its goal</>
            )}
            {fundingType === 'KEEP_IT_ALL' && (
              <>Flexible funding &mdash; Creator keeps all funds raised</>
            )}
          </span>
          <span className={`text-sm font-medium ${isFunded ? 'text-green-600' : 'text-indigo-600'}`}>
            {percentFunded.toFixed(0)}% funded
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Reward Selector

```tsx
// components/rewards/reward-selector.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Package, Truck } from 'lucide-react';
import { format } from 'date-fns';

interface Reward {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  limitedQuantity: boolean;
  totalQuantity: number | null;
  claimedQuantity: number;
  estimatedDelivery: string | null;
  shipsTo: string[];
  shippingCost: number | null;
  items: string[];
  imageUrl: string | null;
}

interface RewardSelectorProps {
  rewards: Reward[];
  campaignId: string;
  campaignSlug: string;
  isEnded: boolean;
  currency: string;
}

export function RewardSelector({
  rewards,
  campaignId,
  campaignSlug,
  isEnded,
  currency,
}: RewardSelectorProps) {
  const router = useRouter();
  const [selectedReward, setSelectedReward] = useState<string | null>(null);
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };
  
  const handlePledge = (rewardId?: string) => {
    const url = rewardId 
      ? `/campaigns/${campaignSlug}/pledge?reward=${rewardId}`
      : `/campaigns/${campaignSlug}/pledge`;
    router.push(url);
  };
  
  return (
    <div className="space-y-4">
      {/* Pledge without reward */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="font-semibold mb-2">Pledge without a reward</h3>
        <p className="text-sm text-gray-600 mb-4">
          Support this project with any amount you like.
        </p>
        <button
          onClick={() => handlePledge()}
          disabled={isEnded}
          className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEnded ? 'Campaign Ended' : 'Back this project'}
        </button>
      </div>
      
      {/* Rewards */}
      {rewards.map((reward) => {
        const remaining = reward.limitedQuantity && reward.totalQuantity
          ? reward.totalQuantity - reward.claimedQuantity
          : null;
        const soldOut = remaining !== null && remaining <= 0;
        
        return (
          <div
            key={reward.id}
            className={`bg-white rounded-lg border overflow-hidden ${
              soldOut ? 'opacity-60' : ''
            }`}
          >
            {reward.imageUrl && (
              <img
                src={reward.imageUrl}
                alt={reward.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-lg font-bold text-indigo-600">
                    Pledge {formatCurrency(Number(reward.amount))} or more
                  </p>
                  <h4 className="font-semibold">{reward.title}</h4>
                </div>
                {remaining !== null && (
                  <span className={`text-sm px-2 py-1 rounded ${
                    soldOut ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'
                  }`}>
                    {soldOut ? 'Sold out' : `${remaining} left`}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{reward.description}</p>
              
              {/* Items included */}
              {reward.items.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">INCLUDES:</p>
                  <ul className="space-y-1">
                    {reward.items.map((item, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Delivery info */}
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                {reward.estimatedDelivery && (
                  <span className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    Est. {format(new Date(reward.estimatedDelivery), 'MMM yyyy')}
                  </span>
                )}
                {reward.shipsTo.length > 0 ? (
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Ships to select countries
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    Ships worldwide
                  </span>
                )}
              </div>
              
              {/* Backers count */}
              <p className="text-xs text-gray-400 mb-4">
                {reward.claimedQuantity} backers
              </p>
              
              <button
                onClick={() => handlePledge(reward.id)}
                disabled={isEnded || soldOut}
                className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {soldOut ? 'Sold Out' : isEnded ? 'Campaign Ended' : 'Select this reward'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Pledge Checkout Flow

```tsx
// app/campaigns/[slug]/pledge/page.tsx
import { redirect, notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { PledgeForm } from '@/components/pledges/pledge-form';

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ reward?: string }>;
}

export default async function PledgePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { reward: rewardId } = await searchParams;
  
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?redirect=/campaigns/${slug}/pledge`);
  }
  
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: {
      rewards: {
        where: { isActive: true },
        orderBy: { amount: 'asc' },
      },
    },
  });
  
  if (!campaign || campaign.status !== 'ACTIVE') {
    notFound();
  }
  
  const selectedReward = rewardId 
    ? campaign.rewards.find(r => r.id === rewardId) 
    : null;
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-2">Back this project</h1>
        <p className="text-gray-600 mb-8">{campaign.title}</p>
        
        <PledgeForm
          campaign={campaign}
          rewards={campaign.rewards}
          selectedRewardId={selectedReward?.id}
          userId={user.id}
        />
      </div>
    </div>
  );
}
```

### Pledge Form Component

```tsx
// components/pledges/pledge-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const pledgeSchema = z.object({
  rewardId: z.string().optional(),
  amount: z.number().positive('Amount must be positive'),
  tipAmount: z.number().min(0).default(0),
  isAnonymous: z.boolean().default(false),
  message: z.string().optional(),
  shippingName: z.string().optional(),
  shippingAddress: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingPostal: z.string().optional(),
  shippingCountry: z.string().optional(),
});

type PledgeFormData = z.infer<typeof pledgeSchema>;

interface PledgeFormProps {
  campaign: any;
  rewards: any[];
  selectedRewardId?: string;
  userId: string;
}

export function PledgeForm({
  campaign,
  rewards,
  selectedRewardId,
  userId,
}: PledgeFormProps) {
  const router = useRouter();
  const [selectedReward, setSelectedReward] = useState(
    rewards.find(r => r.id === selectedRewardId)
  );
  
  const minAmount = selectedReward ? Number(selectedReward.amount) : 1;
  const needsShipping = selectedReward && selectedReward.shippingCost !== null;
  
  const form = useForm<PledgeFormData>({
    resolver: zodResolver(pledgeSchema),
    defaultValues: {
      rewardId: selectedRewardId,
      amount: minAmount,
      tipAmount: 0,
      isAnonymous: false,
    },
  });
  
  const amount = form.watch('amount');
  const tipAmount = form.watch('tipAmount');
  const shippingCost = selectedReward?.shippingCost ? Number(selectedReward.shippingCost) : 0;
  const totalAmount = amount + tipAmount + shippingCost;
  
  const mutation = useMutation({
    mutationFn: async (data: PledgeFormData) => {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          ...data,
          totalAmount,
        }),
      });
      
      if (!response.ok) throw new Error('Checkout failed');
      return response.json();
    },
    onSuccess: async (data) => {
      const stripe = await stripePromise;
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    },
  });
  
  const tipOptions = [0, 5, 10, 15];
  
  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      {/* Reward Selection */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Select your reward</h2>
        
        <div className="space-y-3">
          {/* No reward option */}
          <label className={`block p-4 border rounded-lg cursor-pointer ${
            !selectedReward ? 'border-indigo-600 bg-indigo-50' : ''
          }`}>
            <input
              type="radio"
              name="reward"
              className="sr-only"
              checked={!selectedReward}
              onChange={() => {
                setSelectedReward(null);
                form.setValue('rewardId', undefined);
                form.setValue('amount', 1);
              }}
            />
            <div className="flex items-center justify-between">
              <span className="font-medium">Pledge without a reward</span>
            </div>
          </label>
          
          {rewards.map((reward) => (
            <label
              key={reward.id}
              className={`block p-4 border rounded-lg cursor-pointer ${
                selectedReward?.id === reward.id ? 'border-indigo-600 bg-indigo-50' : ''
              }`}
            >
              <input
                type="radio"
                name="reward"
                className="sr-only"
                checked={selectedReward?.id === reward.id}
                onChange={() => {
                  setSelectedReward(reward);
                  form.setValue('rewardId', reward.id);
                  form.setValue('amount', Number(reward.amount));
                }}
              />
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium">{reward.title}</span>
                  <p className="text-sm text-gray-500">{reward.description}</p>
                </div>
                <span className="font-semibold">
                  ${Number(reward.amount)}+
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>
      
      {/* Pledge Amount */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Pledge amount</h2>
        
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
          <input
            type="number"
            {...form.register('amount', { valueAsNumber: true })}
            min={minAmount}
            className="w-full pl-8 pr-4 py-3 border rounded-lg text-lg"
          />
        </div>
        
        {selectedReward && (
          <p className="text-sm text-gray-500 mt-2">
            Minimum pledge for this reward: ${minAmount}
          </p>
        )}
      </div>
      
      {/* Tip */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-2">Add a tip</h2>
        <p className="text-sm text-gray-600 mb-4">
          Tips help keep our platform running and support more creators.
        </p>
        
        <div className="flex gap-2">
          {tipOptions.map((tip) => (
            <button
              key={tip}
              type="button"
              onClick={() => form.setValue('tipAmount', tip)}
              className={`flex-1 py-2 rounded-lg border ${
                tipAmount === tip ? 'border-indigo-600 bg-indigo-50' : ''
              }`}
            >
              ${tip}
            </button>
          ))}
          <input
            type="number"
            placeholder="Other"
            className="flex-1 px-3 py-2 border rounded-lg"
            onChange={(e) => form.setValue('tipAmount', Number(e.target.value) || 0)}
          />
        </div>
      </div>
      
      {/* Shipping */}
      {needsShipping && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4">Shipping information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Full name</label>
              <input
                {...form.register('shippingName')}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Address</label>
              <input
                {...form.register('shippingAddress')}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">City</label>
              <input
                {...form.register('shippingCity')}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">State/Province</label>
              <input
                {...form.register('shippingState')}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Postal code</label>
              <input
                {...form.register('shippingPostal')}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Country</label>
              <select
                {...form.register('shippingCountry')}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="GB">United Kingdom</option>
                <option value="AU">Australia</option>
                {/* Add more countries */}
              </select>
            </div>
          </div>
        </div>
      )}
      
      {/* Options */}
      <div className="bg-white rounded-lg border p-6">
        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              {...form.register('isAnonymous')}
              className="h-4 w-4 rounded"
            />
            <span className="text-sm">Hide my name from the public backer list</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Leave a message for the creator (optional)
            </label>
            <textarea
              {...form.register('message')}
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="Share why you're backing this project..."
            />
          </div>
        </div>
      </div>
      
      {/* Summary */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Order summary</h2>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Pledge</span>
            <span>${amount.toFixed(2)}</span>
          </div>
          {tipAmount > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Platform tip</span>
              <span>${tipAmount.toFixed(2)}</span>
            </div>
          )}
          {shippingCost > 0 && (
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>${shippingCost.toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold text-lg border-t pt-2">
            <span>Total</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Processing...' : `Pledge $${totalAmount.toFixed(2)}`}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        You won't be charged unless this project reaches its funding goal.
        Your card will be charged when the campaign ends.
      </p>
    </form>
  );
}
```

### Creator Dashboard Stats

```tsx
// components/dashboard/stats-overview.tsx
'use client';

import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';

interface StatsOverviewProps {
  stats: {
    totalRaised: number;
    totalBackers: number;
    activeCampaigns: number;
    averagePledge: number;
    conversionRate: number;
    currency: string;
  };
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: stats.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };
  
  const statCards = [
    {
      label: 'Total Raised',
      value: formatCurrency(stats.totalRaised),
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      label: 'Total Backers',
      value: stats.totalBackers.toLocaleString(),
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      label: 'Active Campaigns',
      value: stats.activeCampaigns.toString(),
      icon: Target,
      color: 'bg-purple-500',
    },
    {
      label: 'Avg. Pledge',
      value: formatCurrency(stats.averagePledge),
      icon: TrendingUp,
      color: 'bg-orange-500',
    },
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat) => (
        <div key={stat.label} className="bg-white rounded-lg border p-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.color}`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Testing

### Unit Tests

```typescript
// __tests__/lib/campaign-utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  calculateFundingProgress,
  calculateRewardAvailability,
  formatCurrency,
  getDaysRemaining,
  isRewardAvailable,
} from '@/lib/campaign-utils';

describe('calculateFundingProgress', () => {
  it('calculates percentage correctly', () => {
    expect(calculateFundingProgress(5000, 10000)).toBe(50);
  });

  it('caps at 100% for overfunded campaigns', () => {
    expect(calculateFundingProgress(15000, 10000)).toBe(100);
  });

  it('handles zero goal', () => {
    expect(calculateFundingProgress(1000, 0)).toBe(0);
  });
});

describe('calculateRewardAvailability', () => {
  it('returns remaining quantity', () => {
    const reward = { limitedQuantity: true, totalQuantity: 100, claimedQuantity: 75 };
    expect(calculateRewardAvailability(reward)).toBe(25);
  });

  it('returns null for unlimited rewards', () => {
    const reward = { limitedQuantity: false, totalQuantity: null, claimedQuantity: 0 };
    expect(calculateRewardAvailability(reward)).toBeNull();
  });
});

describe('getDaysRemaining', () => {
  it('returns positive days for future end date', () => {
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect(getDaysRemaining(futureDate)).toBe(7);
  });

  it('returns 0 for past end date', () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(getDaysRemaining(pastDate)).toBe(0);
  });
});
```

### Component Tests

```typescript
// __tests__/components/campaign-progress.test.tsx
import { render, screen } from '@testing-library/react';
import { CampaignProgress } from '@/components/campaigns/campaign-progress';

describe('CampaignProgress', () => {
  const defaultProps = {
    amountRaised: 5000,
    goalAmount: 10000,
    percentFunded: 50,
    backerCount: 120,
    daysLeft: 15,
    isEnded: false,
    fundingType: 'ALL_OR_NOTHING' as const,
    currency: 'USD',
  };

  it('displays funding amount and goal', () => {
    render(<CampaignProgress {...defaultProps} />);
    expect(screen.getByText(/\$5,000/)).toBeInTheDocument();
    expect(screen.getByText(/\$10,000 goal/)).toBeInTheDocument();
  });

  it('displays backer count', () => {
    render(<CampaignProgress {...defaultProps} />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('backers')).toBeInTheDocument();
  });

  it('shows days remaining when campaign is active', () => {
    render(<CampaignProgress {...defaultProps} />);
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('days to go')).toBeInTheDocument();
  });

  it('shows ended state when campaign is finished', () => {
    render(<CampaignProgress {...defaultProps} isEnded={true} />);
    expect(screen.getByText('Ended')).toBeInTheDocument();
  });

  it('shows funded state when 100% reached', () => {
    render(<CampaignProgress {...defaultProps} percentFunded={100} isEnded={true} />);
    expect(screen.getByText('Successfully funded')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// __tests__/api/campaigns.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Campaigns API', () => {
  beforeEach(async () => {
    await prisma.pledge.deleteMany();
    await prisma.reward.deleteMany();
    await prisma.campaign.deleteMany();
  });

  it('creates a campaign with rewards', async () => {
    const res = await fetch('http://localhost:3000/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Campaign',
        description: 'Test description',
        goalAmount: 10000,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        rewards: [
          { title: 'Early Bird', amount: 25, description: 'Early supporter reward' },
          { title: 'Premium', amount: 100, description: 'Premium reward' },
        ],
      }),
    });

    expect(res.status).toBe(201);
    const campaign = await res.json();
    expect(campaign.title).toBe('Test Campaign');
    expect(campaign.rewards).toHaveLength(2);
  });

  it('calculates funding stats correctly', async () => {
    // Create campaign with pledges
    const campaign = await prisma.campaign.create({
      data: {
        title: 'Funded Campaign',
        slug: 'funded-campaign',
        tagline: 'Test tagline',
        description: 'Description',
        goalAmount: 1000,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        duration: 30,
        creator: { connect: { id: 'test-user-id' } },
      },
    });

    // Create pledges
    await prisma.pledge.createMany({
      data: [
        { campaignId: campaign.id, backerId: 'user1', amount: 100, totalAmount: 100, status: 'SUCCEEDED' },
        { campaignId: campaign.id, backerId: 'user2', amount: 250, totalAmount: 250, status: 'SUCCEEDED' },
        { campaignId: campaign.id, backerId: 'user3', amount: 50, totalAmount: 50, status: 'PENDING' },
      ],
    });

    const res = await fetch(`http://localhost:3000/api/campaigns/${campaign.slug}`);
    const data = await res.json();

    expect(data.fundingStats.totalRaised).toBe(350); // Only SUCCEEDED pledges
    expect(data.fundingStats.backerCount).toBe(2);
    expect(data.fundingStats.percentFunded).toBe(35);
  });
});
```

### E2E Tests

```typescript
// e2e/crowdfunding.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Crowdfunding Platform', () => {
  test('complete pledge flow', async ({ page }) => {
    // Navigate to campaign
    await page.goto('/campaigns/sample-campaign');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sample Campaign');

    // Select a reward
    await page.click('text=Select this reward');
    await expect(page).toHaveURL(/\/pledge/);

    // Fill pledge form
    await page.fill('[name="amount"]', '50');
    await page.click('text=$5'); // Select $5 tip

    // Fill shipping (if required)
    await page.fill('[name="shippingName"]', 'Test User');
    await page.fill('[name="shippingAddress"]', '123 Test St');
    await page.fill('[name="shippingCity"]', 'Test City');
    await page.fill('[name="shippingPostal"]', '12345');

    // Verify total
    await expect(page.locator('text=Total')).toContainText('$55');

    // Submit (will redirect to Stripe)
    await page.click('text=Pledge $55.00');
  });

  test('campaign creator dashboard', async ({ page }) => {
    await page.goto('/dashboard/campaigns');
    await expect(page.getByRole('heading')).toContainText('My Campaigns');

    // Create new campaign
    await page.click('text=Create Campaign');
    await page.fill('[name="title"]', 'New Test Campaign');
    await page.fill('[name="tagline"]', 'Amazing new project');
    await page.fill('[name="goalAmount"]', '5000');

    // Add reward
    await page.click('text=Add Reward');
    await page.fill('[name="rewards.0.title"]', 'Basic Tier');
    await page.fill('[name="rewards.0.amount"]', '25');

    await page.click('text=Save Draft');
    await expect(page.locator('.toast-success')).toContainText('Campaign saved');
  });

  test('backer can view their pledges', async ({ page }) => {
    await page.goto('/dashboard/pledges');
    await expect(page.getByRole('heading')).toContainText('My Pledges');

    // Check pledge card
    await expect(page.locator('.pledge-card')).toBeVisible();
    await expect(page.locator('.pledge-status')).toContainText('Confirmed');
  });
});
```

## Error Handling

### Global Error Boundary

```tsx
// app/error.tsx
'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error tracking service
    console.error('Crowdfunding error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          We encountered an error while loading this page. Please try again or return to the homepage.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Home className="h-4 w-4" />
            Go Home
          </Link>
        </div>
        {error.digest && (
          <p className="text-xs text-gray-400 mt-4">Error ID: {error.digest}</p>
        )}
      </div>
    </div>
  );
}
```

### API Error Handling

```typescript
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

  console.error('Unhandled API error:', error);
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}
```

### Payment Error Recovery

```tsx
// components/pledges/payment-error-recovery.tsx
'use client';

import { useState } from 'react';
import { AlertCircle, CreditCard, RefreshCw } from 'lucide-react';

interface PaymentErrorRecoveryProps {
  pledgeId: string;
  errorMessage: string;
  onRetry: () => void;
}

export function PaymentErrorRecovery({ pledgeId, errorMessage, onRetry }: PaymentErrorRecoveryProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">Payment Failed</h3>
          <p className="text-red-700 mt-1">{errorMessage}</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {isRetrying ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <CreditCard className="h-4 w-4" />
              )}
              Retry Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Accessibility

### WCAG 2.1 AA Compliance

```tsx
// components/campaigns/accessible-progress.tsx
'use client';

interface AccessibleProgressProps {
  percentFunded: number;
  amountRaised: number;
  goalAmount: number;
  currency: string;
}

export function AccessibleProgress({
  percentFunded,
  amountRaised,
  goalAmount,
  currency,
}: AccessibleProgressProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  return (
    <div>
      <div
        role="progressbar"
        aria-valuenow={percentFunded}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Campaign funding progress: ${percentFunded.toFixed(0)}% of goal reached`}
        className="h-3 bg-gray-200 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{ width: `${Math.min(100, percentFunded)}%` }}
        />
      </div>
      <p className="sr-only">
        {formatCurrency(amountRaised)} raised of {formatCurrency(goalAmount)} goal
      </p>
    </div>
  );
}
```

### Keyboard Navigation for Rewards

```tsx
// components/rewards/keyboard-reward-selector.tsx
'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';

interface KeyboardRewardSelectorProps {
  rewards: any[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function KeyboardRewardSelector({ rewards, selectedId, onSelect }: KeyboardRewardSelectorProps) {
  const listRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (index < rewards.length - 1) {
          const nextButton = listRef.current?.querySelectorAll('[role="radio"]')[index + 1] as HTMLElement;
          nextButton?.focus();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (index > 0) {
          const prevButton = listRef.current?.querySelectorAll('[role="radio"]')[index - 1] as HTMLElement;
          prevButton?.focus();
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(rewards[index].id);
        break;
    }
  };

  return (
    <div
      ref={listRef}
      role="radiogroup"
      aria-label="Select a reward tier"
      className="space-y-3"
    >
      {rewards.map((reward, index) => (
        <div
          key={reward.id}
          role="radio"
          aria-checked={selectedId === reward.id}
          tabIndex={selectedId === reward.id ? 0 : -1}
          onClick={() => onSelect(reward.id)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          className={`p-4 border rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            selectedId === reward.id ? 'border-indigo-600 bg-indigo-50' : ''
          }`}
        >
          <div className="font-semibold">{reward.title}</div>
          <div className="text-sm text-gray-600">${Number(reward.amount)} or more</div>
        </div>
      ))}
    </div>
  );
}
```

### Screen Reader Announcements

```tsx
// components/ui/live-region.tsx
'use client';

import { useEffect, useState } from 'react';

interface LiveRegionProps {
  message: string;
  type?: 'polite' | 'assertive';
}

export function LiveRegion({ message, type = 'polite' }: LiveRegionProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (message) {
      setAnnouncement(message);
      const timer = setTimeout(() => setAnnouncement(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div
      role="status"
      aria-live={type}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
}
```

## Security

### Input Validation

```typescript
// lib/validations/campaign.ts
import { z } from 'zod';

export const createCampaignSchema = z.object({
  title: z.string().min(5).max(100).trim(),
  tagline: z.string().min(10).max(200).trim(),
  description: z.string().min(100).max(50000),
  goalAmount: z.number().positive().max(1000000000),
  duration: z.number().int().min(1).max(60),
  category: z.string().optional(),
  rewards: z.array(z.object({
    title: z.string().min(2).max(100),
    description: z.string().min(10).max(1000),
    amount: z.number().positive(),
    limitedQuantity: z.boolean().default(false),
    totalQuantity: z.number().int().positive().optional(),
    estimatedDelivery: z.string().optional(),
  })).min(0).max(20),
});

export const pledgeSchema = z.object({
  campaignId: z.string().cuid(),
  rewardId: z.string().cuid().optional(),
  amount: z.number().positive(),
  tipAmount: z.number().min(0).default(0),
  isAnonymous: z.boolean().default(false),
  message: z.string().max(500).optional(),
  shippingName: z.string().max(100).optional(),
  shippingAddress: z.string().max(200).optional(),
  shippingCity: z.string().max(100).optional(),
  shippingState: z.string().max(100).optional(),
  shippingPostal: z.string().max(20).optional(),
  shippingCountry: z.string().length(2).optional(),
});
```

### Rate Limiting for Pledges

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 pledges per minute
  analytics: true,
});

export async function checkPledgeRateLimit(userId: string) {
  const { success, limit, remaining, reset } = await ratelimit.limit(`pledge:${userId}`);

  if (!success) {
    throw new APIError(
      'Too many pledge attempts. Please wait before trying again.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  return { limit, remaining, reset };
}
```

### Stripe Webhook Verification

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Process event...
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handlePaymentFailure(event.data.object);
      break;
  }

  return Response.json({ received: true });
}
```

### Content Security Policy

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "connect-src 'self' https://api.stripe.com",
    ].join('; ')
  );

  return response;
}
```

## Performance

### Database Query Optimization

```typescript
// lib/queries/campaigns.ts
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getFeaturedCampaigns = unstable_cache(
  async () => {
    return prisma.campaign.findMany({
      where: {
        status: 'ACTIVE',
        isFeatured: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        tagline: true,
        imageUrl: true,
        goalAmount: true,
        endDate: true,
        _count: {
          select: { pledges: { where: { status: 'SUCCEEDED' } } },
        },
      },
      take: 6,
      orderBy: { publishedAt: 'desc' },
    });
  },
  ['featured-campaigns'],
  { revalidate: 60, tags: ['campaigns'] }
);

export const getCampaignFundingStats = unstable_cache(
  async (campaignId: string) => {
    const stats = await prisma.pledge.aggregate({
      where: { campaignId, status: 'SUCCEEDED' },
      _sum: { totalAmount: true },
      _count: true,
    });

    return {
      totalRaised: Number(stats._sum.totalAmount || 0),
      backerCount: stats._count,
    };
  },
  ['campaign-funding'],
  { revalidate: 30, tags: ['pledges'] }
);
```

### Image Optimization

```tsx
// components/campaigns/optimized-campaign-image.tsx
import Image from 'next/image';

interface OptimizedCampaignImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function OptimizedCampaignImage({ src, alt, priority }: OptimizedCampaignImageProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUG/8QAHhAAAgICAwEBAAAAAAAAAAAAAQIDBAAFERIhMVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBf/EABkRAQACAwAAAAAAAAAAAAAAAAEAAhEhMf/aAAwDAQACEQMRAD8ArUdPNYlSC1qNdmzKDLFlHZmPIHsZ2GGZB0sEWZqz/9k="
      />
    </div>
  );
}
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | 1.8s |
| FID | < 100ms | 45ms |
| CLS | < 0.1 | 0.05 |
| TTFB | < 600ms | 350ms |
| Bundle Size | < 150KB | 125KB |

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

env:
  DATABASE_URL: postgresql://test:test@localhost:5432/crowdfunding_test
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}
  STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_TEST_WEBHOOK_SECRET }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint

  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm type-check

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: crowdfunding_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm prisma migrate deploy
      - run: pnpm test:ci

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm build
      - run: pnpm test:e2e

  deploy:
    needs: [lint, type-check, test, e2e]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Database Migrations

```yaml
# .github/workflows/db-migrate.yml
name: Database Migration

on:
  push:
    branches: [main]
    paths:
      - 'prisma/migrations/**'

jobs:
  migrate:
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm prisma migrate deploy
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Monitoring

### Application Monitoring

```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function initMonitoring() {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    profilesSampleRate: 0.1,
    environment: process.env.NODE_ENV,
  });
}

export function trackPledge(campaignId: string, amount: number) {
  Sentry.addBreadcrumb({
    category: 'pledge',
    message: `Pledge of $${amount} to campaign ${campaignId}`,
    level: 'info',
  });
}

export function trackCampaignView(campaignId: string) {
  Sentry.addBreadcrumb({
    category: 'campaign',
    message: `Campaign ${campaignId} viewed`,
    level: 'info',
  });
}
```

### Business Metrics Dashboard

```typescript
// lib/metrics.ts
export async function getDashboardMetrics() {
  const [campaigns, pledges, users] = await Promise.all([
    prisma.campaign.aggregate({
      where: { status: 'ACTIVE' },
      _count: true,
    }),
    prisma.pledge.aggregate({
      where: { status: 'SUCCEEDED', createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      _sum: { totalAmount: true },
      _count: true,
    }),
    prisma.user.count({
      where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
  ]);

  return {
    activeCampaigns: campaigns._count,
    monthlyRevenue: Number(pledges._sum.totalAmount || 0),
    monthlyPledges: pledges._count,
    newUsers: users,
  };
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks = {
    database: false,
    stripe: false,
    timestamp: new Date().toISOString(),
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    console.error('Database health check failed:', error);
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    await stripe.balance.retrieve();
    checks.stripe = true;
  } catch (error) {
    console.error('Stripe health check failed:', error);
  }

  const allHealthy = Object.values(checks).every((v) => v === true || typeof v === 'string');

  return Response.json(checks, { status: allHealthy ? 200 : 503 });
}
```

### Alert Configuration

```yaml
# alerts.yml
alerts:
  - name: high-error-rate
    condition: error_rate > 5%
    window: 5m
    severity: critical
    channels: [slack, pagerduty]

  - name: payment-failures
    condition: payment_failure_rate > 10%
    window: 15m
    severity: high
    channels: [slack]

  - name: slow-response
    condition: p95_latency > 3000ms
    window: 10m
    severity: warning
    channels: [slack]

  - name: database-connection-pool
    condition: db_pool_usage > 80%
    window: 5m
    severity: warning
    channels: [slack]
```

## Related Skills

- [[stripe-integration]] - Payment processing
- [[file-upload]] - Media uploads
- [[rich-text-editor]] - Campaign descriptions
- [[social-sharing]] - Share functionality
- [[email-notifications]] - Backer notifications
- [[realtime-updates]] - Live funding updates

## Changelog

- 3.0.0: Added comprehensive Testing, Error Handling, Accessibility, Security, Performance, CI/CD, and Monitoring sections
- 1.0.0: Initial crowdfunding recipe with campaigns, pledges, and rewards
