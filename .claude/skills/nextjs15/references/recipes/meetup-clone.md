---
id: r-meetup-clone
name: Meetup Clone
version: 3.0.0
layer: L6
category: recipes
description: Community event platform with groups, events, RSVPs, discussions, and location-based discovery
tags: [meetup, community, events, groups, social, location-based]
formula: "MeetupClone = SearchResultsPage(t-search-results-page) + DashboardLayout(t-dashboard-layout) + MarketingLayout(t-marketing-layout) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + SettingsPage(t-settings-page) + Calendar(o-calendar) + Hero(o-hero) + MediaGallery(o-media-gallery) + CommentsSection(o-comments-section) + FileUploader(o-file-uploader) + Header(o-header) + Footer(o-footer) + NotificationCenter(o-notification-center) + SearchModal(o-search-modal) + SocialShare(o-social-share) + SettingsForm(o-settings-form) + Faq(o-faq) + AvatarGroup(m-avatar-group) + Card(m-card) + Tabs(m-tabs) + DatePicker(m-date-picker) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + ShareButton(m-share-button) + TagInput(m-tag-input) + AddressInput(m-address-input) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + SocialAuth(pt-social-auth) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + Search(pt-search) + FullTextSearch(pt-full-text-search) + Filtering(pt-filtering) + Sorting(pt-sorting) + Pagination(pt-pagination) + OptimisticUpdates(pt-optimistic-updates) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + Websockets(pt-websockets) + PushNotifications(pt-push-notifications) + MapsIntegration(pt-maps-integration) + Geolocation(pt-geolocation) + CalendarIntegration(pt-calendar-integration) + DatePickers(pt-date-pickers) + FileUpload(pt-file-upload) + FileStorage(pt-file-storage) + ImageOptimization(pt-image-optimization) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + SocialSharing(pt-social-sharing) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + TestingE2e(pt-testing-e2e)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/avatar-group.md
  - ../molecules/card.md
  - ../molecules/tabs.md
  - ../molecules/date-picker.md
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/share-button.md
  - ../molecules/tag-input.md
  - ../molecules/address-input.md
  # L3 Organisms - Complex Components
  - ../organisms/calendar.md
  - ../organisms/hero.md
  - ../organisms/media-gallery.md
  - ../organisms/comments-section.md
  - ../organisms/file-uploader.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/notification-center.md
  - ../organisms/search-modal.md
  - ../organisms/social-share.md
  - ../organisms/settings-form.md
  - ../organisms/faq.md
  # L4 Templates - Page Layouts
  - ../templates/search-results-page.md
  - ../templates/dashboard-layout.md
  - ../templates/marketing-layout.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/settings-page.md
  # L5 Patterns - Authentication & Security
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/social-auth.md
  - ../patterns/rbac.md
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Search & Discovery
  - ../patterns/search.md
  - ../patterns/full-text-search.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  - ../patterns/pagination.md
  # L5 Patterns - State & Real-time
  - ../patterns/optimistic-updates.md
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/websockets.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Location & Calendar
  - ../patterns/maps-integration.md
  - ../patterns/geolocation.md
  - ../patterns/calendar-integration.md
  - ../patterns/date-pickers.md
  # L5 Patterns - File Handling
  - ../patterns/file-upload.md
  - ../patterns/file-storage.md
  - ../patterns/image-optimization.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - Social & SEO
  - ../patterns/social-sharing.md
  - ../patterns/sitemap.md
  - ../patterns/structured-data.md
  - ../patterns/metadata-api.md
  # L5 Patterns - Error Handling & UX
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  - ../patterns/user-analytics.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - mapbox-gl@3.0.0
  - uploadthing@6.0.0
skills:
  - geolocation
  - maps
  - social-features
  - realtime-updates
  - image-upload
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

A community-driven event platform similar to Meetup. Features group creation with member management, event scheduling with RSVPs, discussion boards, location-based discovery, and social features. Users can discover local groups based on interests and attend events.

## Project Structure

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx                    # Discover groups/events
│   └── about/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   └── register/page.tsx
├── groups/
│   ├── page.tsx                    # Browse groups
│   ├── create/page.tsx             # Create group
│   └── [slug]/
│       ├── page.tsx                # Group home
│       ├── events/page.tsx         # Group events
│       ├── members/page.tsx        # Members list
│       ├── discussions/page.tsx    # Discussions
│       ├── photos/page.tsx         # Photo gallery
│       └── about/page.tsx          # About & rules
├── events/
│   ├── page.tsx                    # Browse events
│   └── [id]/
│       ├── page.tsx                # Event detail
│       └── attendees/page.tsx      # Attendee list
├── (dashboard)/
│   ├── layout.tsx
│   ├── page.tsx                    # My groups & events
│   ├── calendar/page.tsx           # My calendar
│   ├── messages/page.tsx           # Messages
│   └── settings/page.tsx
├── organizer/                      # Group organizer tools
│   ├── [groupId]/
│   │   ├── page.tsx                # Organizer dashboard
│   │   ├── events/new/page.tsx     # Create event
│   │   ├── members/page.tsx        # Manage members
│   │   ├── settings/page.tsx       # Group settings
│   │   └── analytics/page.tsx
├── api/
│   ├── groups/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   ├── [id]/join/route.ts
│   │   └── [id]/leave/route.ts
│   ├── events/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── [id]/rsvp/route.ts
│   ├── discussions/
│   │   ├── route.ts
│   │   └── [id]/comments/route.ts
│   ├── discover/route.ts
│   └── upload/route.ts
└── components/
    ├── groups/
    │   ├── group-card.tsx
    │   ├── group-header.tsx
    │   ├── group-form.tsx
    │   └── member-list.tsx
    ├── events/
    │   ├── event-card.tsx
    │   ├── event-form.tsx
    │   ├── rsvp-button.tsx
    │   └── attendee-avatars.tsx
    ├── discussions/
    │   ├── discussion-card.tsx
    │   ├── discussion-form.tsx
    │   └── comment-thread.tsx
    ├── discover/
    │   ├── category-nav.tsx
    │   ├── location-picker.tsx
    │   └── nearby-map.tsx
    └── shared/
        ├── interest-tags.tsx
        └── user-avatar.tsx
lib/
├── geo.ts
├── interests.ts
└── notifications.ts
```

## Database Schema

```prisma
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
  bio           String?   @db.Text
  
  // Location
  city          String?
  state         String?
  country       String?
  latitude      Float?
  longitude     Float?
  
  // Interests
  interests     String[]
  
  memberships   GroupMember[]
  organizedGroups Group[]
  rsvps         RSVP[]
  discussions   Discussion[]
  comments      Comment[]
  photos        Photo[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Category {
  id        String   @id @default(cuid())
  name      String   @unique
  slug      String   @unique
  icon      String?
  
  groups    Group[]
}

model Group {
  id              String       @id @default(cuid())
  organizerId     String
  categoryId      String?
  
  name            String
  slug            String       @unique
  description     String       @db.Text
  
  // Media
  avatarUrl       String?
  bannerUrl       String?
  
  // Location
  city            String
  state           String?
  country         String       @default("US")
  latitude        Float?
  longitude       Float?
  isOnlineOnly    Boolean      @default(false)
  
  // Settings
  isPublic        Boolean      @default(true)
  requireApproval Boolean      @default(false)
  
  // Topics/interests
  topics          String[]
  
  // Links
  website         String?
  
  // Stats
  memberCount     Int          @default(0)
  
  organizer       User         @relation(fields: [organizerId], references: [id])
  category        Category?    @relation(fields: [categoryId], references: [id])
  members         GroupMember[]
  events          Event[]
  discussions     Discussion[]
  photos          Photo[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([city, state])
  @@index([categoryId])
  @@index([memberCount])
}

model GroupMember {
  id        String           @id @default(cuid())
  groupId   String
  userId    String
  role      GroupMemberRole  @default(MEMBER)
  status    MemberStatus     @default(ACTIVE)
  
  // Notifications
  emailEvents    Boolean      @default(true)
  emailDiscussions Boolean    @default(true)
  
  group     Group            @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  joinedAt  DateTime         @default(now())
  
  @@unique([groupId, userId])
  @@index([groupId])
  @@index([userId])
}

enum GroupMemberRole {
  ORGANIZER
  CO_ORGANIZER
  EVENT_ORGANIZER
  MEMBER
}

enum MemberStatus {
  PENDING
  ACTIVE
  BANNED
}

model Event {
  id              String       @id @default(cuid())
  groupId         String
  createdById     String
  
  title           String
  description     String       @db.Text
  
  // Media
  imageUrl        String?
  
  // Timing
  startTime       DateTime
  endTime         DateTime?
  timezone        String       @default("UTC")
  
  // Location
  isOnline        Boolean      @default(false)
  venueName       String?
  venueAddress    String?
  venueCity       String?
  venueState      String?
  latitude        Float?
  longitude       Float?
  
  // Virtual
  onlineUrl       String?
  
  // RSVP settings
  rsvpLimit       Int?
  waitlistEnabled Boolean      @default(true)
  guestLimit      Int          @default(0)
  rsvpDeadline    DateTime?
  
  // Fees
  fee             Decimal?     @db.Decimal(10, 2)
  feeCurrency     String?
  
  // Status
  status          EventStatus  @default(SCHEDULED)
  
  // Stats
  rsvpYesCount    Int          @default(0)
  rsvpMaybeCount  Int          @default(0)
  waitlistCount   Int          @default(0)
  
  group           Group        @relation(fields: [groupId], references: [id], onDelete: Cascade)
  rsvps           RSVP[]
  comments        EventComment[]
  photos          Photo[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([groupId])
  @@index([startTime])
  @@index([status])
}

enum EventStatus {
  DRAFT
  SCHEDULED
  CANCELLED
  COMPLETED
}

model RSVP {
  id          String     @id @default(cuid())
  eventId     String
  userId      String
  
  response    RSVPResponse
  guests      Int        @default(0)
  
  // Waitlist
  isWaitlist  Boolean    @default(false)
  waitlistPosition Int?
  
  // Attendance
  attended    Boolean?
  
  event       Event      @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user        User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
  
  @@unique([eventId, userId])
  @@index([eventId])
  @@index([userId])
}

enum RSVPResponse {
  YES
  MAYBE
  NO
}

model EventComment {
  id        String   @id @default(cuid())
  eventId   String
  userId    String
  parentId  String?
  
  content   String   @db.Text
  
  event     Event    @relation(fields: [eventId], references: [id], onDelete: Cascade)
  parent    EventComment?  @relation("CommentReplies", fields: [parentId], references: [id])
  replies   EventComment[] @relation("CommentReplies")
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([eventId])
}

model Discussion {
  id        String    @id @default(cuid())
  groupId   String
  authorId  String
  
  title     String
  content   String    @db.Text
  
  isPinned  Boolean   @default(false)
  isLocked  Boolean   @default(false)
  
  // Stats
  viewCount    Int    @default(0)
  commentCount Int    @default(0)
  
  group     Group     @relation(fields: [groupId], references: [id], onDelete: Cascade)
  author    User      @relation(fields: [authorId], references: [id])
  comments  Comment[]
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([groupId])
  @@index([createdAt])
}

model Comment {
  id           String     @id @default(cuid())
  discussionId String
  authorId     String
  parentId     String?
  
  content      String     @db.Text
  
  discussion   Discussion @relation(fields: [discussionId], references: [id], onDelete: Cascade)
  author       User       @relation(fields: [authorId], references: [id])
  parent       Comment?   @relation("Replies", fields: [parentId], references: [id])
  replies      Comment[]  @relation("Replies")
  
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  
  @@index([discussionId])
}

model Photo {
  id        String   @id @default(cuid())
  groupId   String
  eventId   String?
  uploaderId String
  
  url       String
  caption   String?
  
  group     Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  event     Event?   @relation(fields: [eventId], references: [id])
  uploader  User     @relation(fields: [uploaderId], references: [id])
  
  createdAt DateTime @default(now())
  
  @@index([groupId])
  @@index([eventId])
}
```

## Implementation

### Discover Page with Location

```tsx
// app/(marketing)/page.tsx
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { CategoryNav } from '@/components/discover/category-nav';
import { NearbyMap } from '@/components/discover/nearby-map';
import { GroupCard } from '@/components/groups/group-card';
import { EventCard } from '@/components/events/event-card';
import { cookies } from 'next/headers';

interface Props {
  searchParams: Promise<{
    category?: string;
    lat?: string;
    lng?: string;
  }>;
}

export default async function DiscoverPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getCurrentUser();
  
  // Get location from params, user profile, or default
  const latitude = params.lat ? parseFloat(params.lat) : user?.latitude || 40.7128;
  const longitude = params.lng ? parseFloat(params.lng) : user?.longitude || -74.0060;
  
  // Fetch categories
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  
  // Fetch nearby groups
  const groups = await prisma.$queryRaw`
    SELECT g.*, 
      (6371 * acos(cos(radians(${latitude})) * cos(radians(g.latitude)) * 
      cos(radians(g.longitude) - radians(${longitude})) + 
      sin(radians(${latitude})) * sin(radians(g.latitude)))) AS distance
    FROM "Group" g
    WHERE g."isPublic" = true
      ${params.category ? prisma.$queryRaw`AND g."categoryId" = ${params.category}` : prisma.$queryRaw``}
    ORDER BY distance
    LIMIT 12
  `;
  
  // Fetch upcoming events nearby
  const events = await prisma.event.findMany({
    where: {
      status: 'SCHEDULED',
      startTime: { gte: new Date() },
      group: { isPublic: true },
      // In production, add geospatial filter
    },
    include: {
      group: true,
      _count: { select: { rsvps: { where: { response: 'YES' } } } },
    },
    orderBy: { startTime: 'asc' },
    take: 8,
  });
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-rose-500 to-pink-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find your community
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Discover local groups and events based on your interests
          </p>
          
          {/* Search/Location */}
          <div className="max-w-2xl mx-auto">
            <LocationPicker
              defaultLat={latitude}
              defaultLng={longitude}
            />
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <CategoryNav
            categories={categories}
            selected={params.category}
          />
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Nearby Map */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Groups Near You</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 rounded-xl overflow-hidden">
              <NearbyMap
                groups={groups}
                center={{ lat: latitude, lng: longitude }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {groups.slice(0, 4).map((group: any) => (
                <GroupCard key={group.id} group={group} compact />
              ))}
            </div>
          </div>
        </section>
        
        {/* Upcoming Events */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
        
        {/* Popular Groups */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Popular Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.slice(0, 6).map((group: any) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
```

### Group Page

```tsx
// app/groups/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { GroupHeader } from '@/components/groups/group-header';
import { EventCard } from '@/components/events/event-card';
import { DiscussionCard } from '@/components/discussions/discussion-card';
import { MemberAvatars } from '@/components/groups/member-avatars';
import { JoinButton } from '@/components/groups/join-button';
import Link from 'next/link';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function GroupPage({ params }: Props) {
  const { slug } = await params;
  const user = await getCurrentUser();
  
  const group = await prisma.group.findUnique({
    where: { slug },
    include: {
      organizer: true,
      category: true,
      members: {
        where: { status: 'ACTIVE' },
        include: { user: true },
        take: 12,
        orderBy: { joinedAt: 'asc' },
      },
      events: {
        where: {
          status: 'SCHEDULED',
          startTime: { gte: new Date() },
        },
        orderBy: { startTime: 'asc' },
        take: 3,
        include: {
          _count: { select: { rsvps: { where: { response: 'YES' } } } },
        },
      },
      discussions: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { author: true, _count: { select: { comments: true } } },
      },
      _count: {
        select: {
          members: { where: { status: 'ACTIVE' } },
          events: true,
        },
      },
    },
  });
  
  if (!group) {
    notFound();
  }
  
  // Check membership
  const membership = user
    ? await prisma.groupMember.findUnique({
        where: { groupId_userId: { groupId: group.id, userId: user.id } },
      })
    : null;
  
  const isMember = membership?.status === 'ACTIVE';
  const isOrganizer = membership?.role === 'ORGANIZER' || membership?.role === 'CO_ORGANIZER';
  
  return (
    <div className="min-h-screen bg-gray-50">
      <GroupHeader
        group={group}
        memberCount={group._count.members}
        isMember={isMember}
        isOrganizer={isOrganizer}
      />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white rounded-lg border p-6">
              <h2 className="font-semibold mb-4">About</h2>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: group.description }}
              />
              
              {group.topics.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-wrap gap-2">
                    {group.topics.map((topic) => (
                      <span
                        key={topic}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Upcoming Events</h2>
                <Link
                  href={`/groups/${slug}/events`}
                  className="text-sm text-rose-600 hover:underline"
                >
                  See all
                </Link>
              </div>
              
              {group.events.length > 0 ? (
                <div className="space-y-4">
                  {group.events.map((event) => (
                    <EventCard key={event.id} event={event} compact />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No upcoming events
                </p>
              )}
            </div>
            
            {/* Discussions */}
            {isMember && (
              <div className="bg-white rounded-lg border p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold">Discussions</h2>
                  <Link
                    href={`/groups/${slug}/discussions`}
                    className="text-sm text-rose-600 hover:underline"
                  >
                    See all
                  </Link>
                </div>
                
                {group.discussions.length > 0 ? (
                  <div className="space-y-4">
                    {group.discussions.map((discussion) => (
                      <DiscussionCard key={discussion.id} discussion={discussion} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    No discussions yet. Start one!
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Button */}
            {!isMember && (
              <JoinButton
                groupId={group.id}
                requireApproval={group.requireApproval}
              />
            )}
            
            {/* Organizer */}
            <div className="bg-white rounded-lg border p-6">
              <h3 className="font-semibold mb-4">Organizer</h3>
              <Link
                href={`/members/${group.organizer.id}`}
                className="flex items-center gap-3"
              >
                <img
                  src={group.organizer.avatarUrl || '/default-avatar.png'}
                  alt={group.organizer.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">{group.organizer.name}</p>
                  <p className="text-sm text-gray-500">Organizer</p>
                </div>
              </Link>
            </div>
            
            {/* Members */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Members</h3>
                <Link
                  href={`/groups/${slug}/members`}
                  className="text-sm text-rose-600"
                >
                  See all ({group._count.members})
                </Link>
              </div>
              <MemberAvatars members={group.members.map(m => m.user)} />
            </div>
            
            {/* Location */}
            {!group.isOnlineOnly && (
              <div className="bg-white rounded-lg border p-6">
                <h3 className="font-semibold mb-4">Location</h3>
                <p className="text-gray-600">
                  {group.city}, {group.state}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### RSVP Button Component

```tsx
// components/events/rsvp-button.tsx
'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, HelpCircle, Users } from 'lucide-react';

interface RSVPButtonProps {
  eventId: string;
  currentRsvp: 'YES' | 'MAYBE' | 'NO' | null;
  rsvpCount: number;
  rsvpLimit: number | null;
  isWaitlistEnabled: boolean;
  isMember: boolean;
}

export function RSVPButton({
  eventId,
  currentRsvp,
  rsvpCount,
  rsvpLimit,
  isWaitlistEnabled,
  isMember,
}: RSVPButtonProps) {
  const queryClient = useQueryClient();
  const [showOptions, setShowOptions] = useState(false);
  
  const isFull = rsvpLimit !== null && rsvpCount >= rsvpLimit;
  
  const mutation = useMutation({
    mutationFn: async (response: 'YES' | 'MAYBE' | 'NO') => {
      const res = await fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response }),
      });
      
      if (!res.ok) throw new Error('RSVP failed');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event', eventId] });
      setShowOptions(false);
    },
  });
  
  if (!isMember) {
    return (
      <button
        disabled
        className="w-full py-3 bg-gray-100 text-gray-500 rounded-lg font-medium"
      >
        Join group to RSVP
      </button>
    );
  }
  
  const getButtonStyle = (response: string) => {
    if (currentRsvp === response) {
      switch (response) {
        case 'YES': return 'bg-green-600 text-white';
        case 'MAYBE': return 'bg-yellow-500 text-white';
        case 'NO': return 'bg-gray-600 text-white';
      }
    }
    return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
  };
  
  if (currentRsvp) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            onClick={() => mutation.mutate('YES')}
            disabled={mutation.isPending || (isFull && currentRsvp !== 'YES')}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${getButtonStyle('YES')}`}
          >
            <Check className="h-4 w-4" /> Going
          </button>
          <button
            onClick={() => mutation.mutate('MAYBE')}
            disabled={mutation.isPending}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${getButtonStyle('MAYBE')}`}
          >
            <HelpCircle className="h-4 w-4" /> Maybe
          </button>
          <button
            onClick={() => mutation.mutate('NO')}
            disabled={mutation.isPending}
            className={`flex-1 py-2 rounded-lg font-medium flex items-center justify-center gap-2 ${getButtonStyle('NO')}`}
          >
            <X className="h-4 w-4" /> No
          </button>
        </div>
        
        <p className="text-sm text-center text-gray-500">
          <Users className="h-4 w-4 inline mr-1" />
          {rsvpCount} going
          {rsvpLimit && ` / ${rsvpLimit} spots`}
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <button
        onClick={() => mutation.mutate('YES')}
        disabled={mutation.isPending || (isFull && !isWaitlistEnabled)}
        className="w-full py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50"
      >
        {isFull 
          ? (isWaitlistEnabled ? 'Join Waitlist' : 'Event Full')
          : "I'm Going!"
        }
      </button>
      
      <div className="flex gap-2">
        <button
          onClick={() => mutation.mutate('MAYBE')}
          disabled={mutation.isPending}
          className="flex-1 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
        >
          Maybe
        </button>
        <button
          onClick={() => mutation.mutate('NO')}
          disabled={mutation.isPending}
          className="flex-1 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200"
        >
          Can't Go
        </button>
      </div>
      
      <p className="text-sm text-center text-gray-500">
        {rsvpCount} going
        {rsvpLimit && ` · ${rsvpLimit - rsvpCount} spots left`}
      </p>
    </div>
  );
}
```

### Event Card

```tsx
// components/events/event-card.tsx
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, MapPin, Users, Globe } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    imageUrl: string | null;
    startTime: string;
    isOnline: boolean;
    venueName: string | null;
    venueCity: string | null;
    group: {
      name: string;
      slug: string;
    };
    _count: {
      rsvps: number;
    };
  };
  compact?: boolean;
}

export function EventCard({ event, compact }: EventCardProps) {
  const startDate = new Date(event.startTime);
  
  if (compact) {
    return (
      <Link href={`/events/${event.id}`} className="flex gap-4 p-3 hover:bg-gray-50 rounded-lg">
        <div className="flex-shrink-0 w-14 text-center">
          <p className="text-sm font-bold text-rose-600">
            {format(startDate, 'MMM').toUpperCase()}
          </p>
          <p className="text-2xl font-bold">{format(startDate, 'd')}</p>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{event.title}</p>
          <p className="text-sm text-gray-500">
            {format(startDate, 'EEEE, h:mm a')}
          </p>
          <p className="text-sm text-gray-500">
            {event._count.rsvps} going
          </p>
        </div>
      </Link>
    );
  }
  
  return (
    <Link href={`/events/${event.id}`} className="block bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
      {/* Image */}
      <div className="aspect-video bg-gray-100">
        {event.imageUrl ? (
          <img
            src={event.imageUrl}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <Calendar className="h-12 w-12" />
          </div>
        )}
      </div>
      
      <div className="p-4">
        {/* Date */}
        <p className="text-sm text-rose-600 font-medium">
          {format(startDate, 'EEE, MMM d · h:mm a')}
        </p>
        
        {/* Title */}
        <h3 className="font-semibold mt-1 line-clamp-2">{event.title}</h3>
        
        {/* Group */}
        <p className="text-sm text-gray-500 mt-1">{event.group.name}</p>
        
        {/* Location & Attendees */}
        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            {event.isOnline ? (
              <>
                <Globe className="h-4 w-4" />
                Online
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4" />
                {event.venueCity || event.venueName}
              </>
            )}
          </span>
          <span className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {event._count.rsvps} going
          </span>
        </div>
      </div>
    </Link>
  );
}
```

### Join Group Button

```tsx
// components/groups/join-button.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface JoinButtonProps {
  groupId: string;
  requireApproval: boolean;
}

export function JoinButton({ groupId, requireApproval }: JoinButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/join`, {
        method: 'POST',
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to join');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] });
      
      if (data.status === 'PENDING') {
        // Show pending message
      } else {
        router.refresh();
      }
    },
  });
  
  return (
    <button
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className="w-full py-3 bg-rose-600 text-white rounded-lg font-medium hover:bg-rose-700 disabled:opacity-50"
    >
      {mutation.isPending 
        ? 'Joining...' 
        : requireApproval 
          ? 'Request to Join'
          : 'Join Group'
      }
    </button>
  );
}
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| [search-results-page](../templates/search-results-page.md) | L5 | Browse groups and events with filters |
| [dashboard-layout](../templates/dashboard-layout.md) | L5 | Member dashboard for managing groups |
| [marketing-layout](../templates/marketing-layout.md) | L5 | Public discover page |
| [calendar](../organisms/calendar.md) | L4 | Event scheduling and calendar view |
| [hero](../organisms/hero.md) | L4 | Landing page hero with search |
| [media-gallery](../organisms/media-gallery.md) | L4 | Group and event photo galleries |
| [comments-section](../organisms/comments-section.md) | L4 | Discussion threads and event comments |
| [file-uploader](../organisms/file-uploader.md) | L4 | Upload group/event images |
| [search](../patterns/search.md) | L3 | Group and event search |
| [filtering](../patterns/filtering.md) | L3 | Category, location, date filters |
| [optimistic-updates](../patterns/optimistic-updates.md) | L3 | Instant RSVP feedback |
| [react-query](../patterns/react-query.md) | L3 | Data fetching and caching |
| [avatar-group](../molecules/avatar-group.md) | L2 | Display attendee avatars |
| [card](../molecules/card.md) | L2 | Group and event cards |
| [tabs](../molecules/tabs.md) | L2 | Group page navigation |
| [date-picker](../molecules/date-picker.md) | L2 | Event scheduling |

## Testing

### Test Setup

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
    include: ['**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/setup.ts'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}));

// Mock mapbox-gl
vi.mock('mapbox-gl', () => ({
  Map: vi.fn(),
  Marker: vi.fn(),
}));
```

### Unit Tests

```typescript
// __tests__/components/rsvp-button.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RSVPButton } from '@/components/events/rsvp-button';
import { vi } from 'vitest';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('RSVPButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('renders join group message for non-members', () => {
    render(
      <RSVPButton
        eventId="event-1"
        currentRsvp={null}
        rsvpCount={5}
        rsvpLimit={null}
        isWaitlistEnabled={true}
        isMember={false}
      />,
      { wrapper }
    );

    expect(screen.getByText('Join group to RSVP')).toBeInTheDocument();
  });

  it('shows going button for members', () => {
    render(
      <RSVPButton
        eventId="event-1"
        currentRsvp={null}
        rsvpCount={5}
        rsvpLimit={10}
        isWaitlistEnabled={true}
        isMember={true}
      />,
      { wrapper }
    );

    expect(screen.getByText("I'm Going!")).toBeInTheDocument();
  });

  it('shows waitlist option when event is full', () => {
    render(
      <RSVPButton
        eventId="event-1"
        currentRsvp={null}
        rsvpCount={10}
        rsvpLimit={10}
        isWaitlistEnabled={true}
        isMember={true}
      />,
      { wrapper }
    );

    expect(screen.getByText('Join Waitlist')).toBeInTheDocument();
  });

  it('shows event full when no waitlist', () => {
    render(
      <RSVPButton
        eventId="event-1"
        currentRsvp={null}
        rsvpCount={10}
        rsvpLimit={10}
        isWaitlistEnabled={false}
        isMember={true}
      />,
      { wrapper }
    );

    expect(screen.getByText('Event Full')).toBeInTheDocument();
  });

  it('displays current RSVP status', () => {
    render(
      <RSVPButton
        eventId="event-1"
        currentRsvp="YES"
        rsvpCount={5}
        rsvpLimit={10}
        isWaitlistEnabled={true}
        isMember={true}
      />,
      { wrapper }
    );

    const goingButton = screen.getByText('Going');
    expect(goingButton).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// __tests__/integration/group-membership.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { JoinButton } from '@/components/groups/join-button';

const server = setupServer(
  rest.post('/api/groups/:groupId/join', (req, res, ctx) => {
    return res(ctx.json({ status: 'ACTIVE', role: 'MEMBER' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('Group Membership Flow', () => {
  it('allows user to join a public group', async () => {
    render(<JoinButton groupId="group-1" requireApproval={false} />);

    fireEvent.click(screen.getByText('Join Group'));

    await waitFor(() => {
      expect(screen.getByText('Joining...')).toBeInTheDocument();
    });
  });

  it('shows request button for private groups', () => {
    render(<JoinButton groupId="group-1" requireApproval={true} />);

    expect(screen.getByText('Request to Join')).toBeInTheDocument();
  });

  it('handles join failure gracefully', async () => {
    server.use(
      rest.post('/api/groups/:groupId/join', (req, res, ctx) => {
        return res(ctx.status(400), ctx.json({ message: 'Already a member' }));
      })
    );

    render(<JoinButton groupId="group-1" requireApproval={false} />);
    fireEvent.click(screen.getByText('Join Group'));

    await waitFor(() => {
      // Component should handle error state
    });
  });
});
```

### E2E Tests

```typescript
// e2e/event-rsvp.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Event RSVP Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('user can RSVP to an event', async ({ page }) => {
    await page.goto('/events/test-event-123');

    // Click RSVP button
    await page.click('text="I\'m Going!"');

    // Verify RSVP confirmation
    await expect(page.locator('text="Going"')).toBeVisible();

    // Verify attendee count updated
    await expect(page.locator('text="going"')).toContainText(/\d+ going/);
  });

  test('user can change RSVP response', async ({ page }) => {
    await page.goto('/events/test-event-123');

    // Initial RSVP
    await page.click('text="I\'m Going!"');
    await expect(page.locator('button:has-text("Going")')).toBeVisible();

    // Change to Maybe
    await page.click('text="Maybe"');
    await expect(page.locator('button:has-text("Maybe")')).toHaveClass(/bg-yellow/);
  });

  test('user sees waitlist when event is full', async ({ page }) => {
    await page.goto('/events/full-event-456');

    await expect(page.locator('text="Join Waitlist"')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// components/error-boundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
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

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Event platform error:', error, errorInfo);
    // Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              We couldn't load this content. Please try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### API Error Handler

```typescript
// lib/api-errors.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: unknown): Response {
  console.error('API Error:', error);

  if (error instanceof APIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Don't expose internal errors
    return Response.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }

  return Response.json({ error: 'Unknown error' }, { status: 500 });
}

// Usage in API routes
export async function POST(request: Request) {
  try {
    // ... handle request
  } catch (error) {
    return handleAPIError(error);
  }
}
```

## Accessibility

```tsx
// components/accessible-event-card.tsx
'use client';

import Link from 'next/link';
import { format } from 'date-fns';

interface AccessibleEventCardProps {
  event: {
    id: string;
    title: string;
    startTime: Date;
    venueName?: string;
    isOnline: boolean;
    attendeeCount: number;
  };
}

export function AccessibleEventCard({ event }: AccessibleEventCardProps) {
  const formattedDate = format(event.startTime, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(event.startTime, 'h:mm a');

  return (
    <article
      className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
      aria-labelledby={`event-title-${event.id}`}
    >
      <Link
        href={`/events/${event.id}`}
        className="block focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 rounded-lg"
      >
        <h3
          id={`event-title-${event.id}`}
          className="font-semibold text-lg mb-2"
        >
          {event.title}
        </h3>

        <dl className="space-y-1 text-sm text-gray-600">
          <div>
            <dt className="sr-only">Date</dt>
            <dd>
              <time dateTime={event.startTime.toISOString()}>
                {formattedDate} at {formattedTime}
              </time>
            </dd>
          </div>

          <div>
            <dt className="sr-only">Location</dt>
            <dd>
              {event.isOnline ? 'Online Event' : event.venueName || 'TBD'}
            </dd>
          </div>

          <div>
            <dt className="sr-only">Attendees</dt>
            <dd>
              {event.attendeeCount}{' '}
              {event.attendeeCount === 1 ? 'person' : 'people'} going
            </dd>
          </div>
        </dl>
      </Link>
    </article>
  );
}

// WCAG 2.1 AA Compliance Checklist:
// - Color contrast ratio >= 4.5:1 for normal text
// - Color contrast ratio >= 3:1 for large text
// - Focus indicators visible on all interactive elements
// - Semantic HTML structure (article, h3, dl/dt/dd)
// - Screen reader announcements for dynamic content
// - Keyboard navigation support
// - Time elements with proper datetime attributes
```

## Security

### Input Validation

```typescript
// lib/validation/event.ts
import { z } from 'zod';

export const createEventSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .regex(/^[\w\s\-.,!?']+$/, 'Title contains invalid characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(5000, 'Description must be less than 5000 characters'),
  startTime: z
    .string()
    .datetime()
    .refine((date) => new Date(date) > new Date(), {
      message: 'Start time must be in the future',
    }),
  endTime: z.string().datetime().optional(),
  isOnline: z.boolean(),
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(500).optional(),
  rsvpLimit: z.number().int().positive().max(10000).optional(),
  groupId: z.string().cuid(),
});

export const rsvpSchema = z.object({
  response: z.enum(['YES', 'MAYBE', 'NO']),
  guests: z.number().int().min(0).max(10).optional(),
});

// Sanitize user input
export function sanitizeHtml(html: string): string {
  // Use a library like DOMPurify for production
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '');
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limits for different actions
export const rateLimits = {
  // Event creation: 10 events per hour
  createEvent: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:create-event',
  }),

  // RSVP: 60 RSVPs per minute (for bulk testing)
  rsvp: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'ratelimit:rsvp',
  }),

  // Join group: 20 per hour
  joinGroup: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'ratelimit:join-group',
  }),

  // Comments: 30 per 10 minutes
  comment: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '10 m'),
    prefix: 'ratelimit:comment',
  }),
};

export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await limiter.limit(identifier);
  return { success, remaining, reset };
}
```

## Performance

### Caching Strategies

```typescript
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cache group data for 5 minutes
export const getCachedGroup = unstable_cache(
  async (slug: string) => {
    return prisma.group.findUnique({
      where: { slug },
      include: {
        organizer: true,
        category: true,
        _count: { select: { members: true, events: true } },
      },
    });
  },
  ['group'],
  { revalidate: 300, tags: ['groups'] }
);

// Cache upcoming events for 2 minutes
export const getCachedUpcomingEvents = unstable_cache(
  async (groupId: string, limit = 5) => {
    return prisma.event.findMany({
      where: {
        groupId,
        status: 'SCHEDULED',
        startTime: { gte: new Date() },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
      include: {
        _count: { select: { rsvps: { where: { response: 'YES' } } } },
      },
    });
  },
  ['upcoming-events'],
  { revalidate: 120, tags: ['events'] }
);

// Revalidate cache after mutations
export async function revalidateGroupCache(groupId: string) {
  // Using revalidateTag in Server Actions
  const { revalidateTag } = await import('next/cache');
  revalidateTag('groups');
  revalidateTag(`group-${groupId}`);
}
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  DATABASE_URL: ${{ secrets.DATABASE_URL }}
  MAPBOX_TOKEN: ${{ secrets.MAPBOX_TOKEN }}

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

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: meetup_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/meetup_test
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3

  e2e:
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
    needs: [lint, test, e2e]
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

## Monitoring

### Sentry Integration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
  ],
});
```

### Health Checks

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'unknown',
      cache: 'unknown',
    },
  };

  try {
    // Check database
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = 'healthy';
  } catch {
    health.services.database = 'unhealthy';
    health.status = 'degraded';
  }

  const statusCode = health.status === 'healthy' ? 200 : 503;
  return NextResponse.json(health, { status: statusCode });
}
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/meetup_clone"

# Authentication
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-min-32-chars"

# Mapbox (for location features)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your-mapbox-public-token"

# File uploads (UploadThing)
UPLOADTHING_SECRET="sk_live_your-uploadthing-secret"
UPLOADTHING_APP_ID="your-app-id"

# Email (optional, for notifications)
RESEND_API_KEY="re_your-resend-api-key"

# Redis (for rate limiting)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-redis-token"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://your-sentry-dsn@sentry.io/project"

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="MeetupClone"
```

## Deployment Checklist

- [ ] **Environment Setup**
  - [ ] All environment variables configured in production
  - [ ] Database connection string uses connection pooling
  - [ ] Mapbox token restricted to production domain
  - [ ] File upload size limits configured

- [ ] **Database**
  - [ ] Run `prisma migrate deploy` on production
  - [ ] Geospatial indexes created for location queries
  - [ ] Database backups configured

- [ ] **Security**
  - [ ] NEXTAUTH_SECRET is unique and secure (32+ chars)
  - [ ] Rate limiting enabled for all public endpoints
  - [ ] CORS configured for production domain only
  - [ ] CSP headers configured

- [ ] **Performance**
  - [ ] Static pages pre-rendered where possible
  - [ ] Image optimization configured
  - [ ] CDN caching headers set
  - [ ] Database connection pool sized appropriately

- [ ] **Monitoring**
  - [ ] Sentry error tracking configured
  - [ ] Health check endpoint accessible
  - [ ] Uptime monitoring configured
  - [ ] Log aggregation set up

- [ ] **Testing**
  - [ ] All tests passing in CI
  - [ ] E2E tests run against staging
  - [ ] Load testing completed for expected traffic

## Related Skills

- [[geolocation]] - Location-based discovery
- [[maps]] - Mapbox integration
- [[social-features]] - Following, RSVPs
- [[realtime-updates]] - Live notifications
- [[image-upload]] - Group/event photos

## Changelog

- 1.0.0: Initial meetup clone with groups, events, and discussions
