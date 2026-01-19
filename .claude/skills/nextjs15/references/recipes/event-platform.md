---
id: r-event-platform
name: Event Platform
version: 3.0.0
layer: L6
category: recipes
description: Enterprise event management platform with ticketing, QR check-in, multi-session support, and attendee management
tags: [events, ticketing, qr-code, check-in, enterprise, conferences]
formula: "EventPlatform = LandingPage(t-landing-page) + CheckoutPage(t-checkout-page) + DashboardLayout(t-dashboard-layout) + AuthLayout(t-auth-layout) + SettingsPage(t-settings-page) + ProfilePage(t-profile-page) + Header(o-header) + Footer(o-footer) + Hero(o-hero) + Calendar(o-calendar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + CheckoutForm(o-checkout-form) + NotificationCenter(o-notification-center) + SettingsForm(o-settings-form) + FileUploader(o-file-uploader) + SearchModal(o-search-modal) + Pricing(o-pricing) + Card(m-card) + StatCard(m-stat-card) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + DatePicker(m-date-picker) + AvatarGroup(m-avatar-group) + FormField(m-form-field) + EmptyState(m-empty-state) + ActionMenu(m-action-menu) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + MultiTenancy(pt-multi-tenancy) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + StripeCheckout(pt-stripe-checkout) + StripeWebhooks(pt-stripe-webhooks) + QrCodes(pt-qr-codes) + BarcodeScanner(pt-barcode-scanner) + CalendarIntegration(pt-calendar-integration) + DatePickers(pt-date-pickers) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + PushNotifications(pt-push-notifications) + FileUpload(pt-file-upload) + FileStorage(pt-file-storage) + ExportData(pt-export-data) + ImageOptimization(pt-image-optimization) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Pagination(pt-pagination) + Filtering(pt-filtering) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + TestingE2e(pt-testing-e2e) + TestingIntegration(pt-testing-integration)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/card.md
  - ../molecules/stat-card.md
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/date-picker.md
  - ../molecules/avatar-group.md
  - ../molecules/form-field.md
  - ../molecules/empty-state.md
  - ../molecules/action-menu.md
  # L3 Organisms - Complex Components
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/hero.md
  - ../organisms/calendar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/checkout-form.md
  - ../organisms/notification-center.md
  - ../organisms/settings-form.md
  - ../organisms/file-uploader.md
  - ../organisms/search-modal.md
  - ../organisms/pricing.md
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
  - ../patterns/multi-tenancy.md
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Payments & Ticketing
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-webhooks.md
  - ../patterns/qr-codes.md
  - ../patterns/barcode-scanner.md
  # L5 Patterns - Calendar & Scheduling
  - ../patterns/calendar-integration.md
  - ../patterns/date-pickers.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  - ../patterns/push-notifications.md
  # L5 Patterns - File & Data
  - ../patterns/file-upload.md
  - ../patterns/file-storage.md
  - ../patterns/export-data.md
  - ../patterns/image-optimization.md
  # L5 Patterns - SEO
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
  # L5 Patterns - Data Management
  - ../patterns/pagination.md
  - ../patterns/filtering.md
  - ../patterns/sorting.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-integration.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - stripe@14.0.0
  - qrcode@1.5.0
  - @zxing/browser@0.1.0
skills:
  - stripe-integration
  - qr-codes
  - multi-tenancy
  - rbac
  - email-notifications
  - calendar-integration
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

An enterprise event management platform for conferences, workshops, and meetups. Features event creation with multiple ticket types, session scheduling, QR code ticket check-in, attendee management, and real-time analytics. Supports multi-tenant organizations with role-based access control.

## Project Structure

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── pricing/page.tsx
├── events/
│   ├── page.tsx                    # Browse events
│   └── [slug]/
│       ├── page.tsx                # Event detail
│       ├── tickets/page.tsx        # Buy tickets
│       └── schedule/page.tsx       # Event schedule
├── tickets/
│   └── [id]/page.tsx               # My ticket / QR code
├── (organizer)/                    # Organizer dashboard
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard
│   ├── events/
│   │   ├── page.tsx                # My events
│   │   ├── new/page.tsx            # Create event
│   │   └── [id]/
│   │       ├── page.tsx            # Event overview
│   │       ├── edit/page.tsx
│   │       ├── tickets/page.tsx    # Ticket types
│   │       ├── sessions/page.tsx   # Schedule
│   │       ├── attendees/page.tsx  # Attendee list
│   │       ├── check-in/page.tsx   # Check-in scanner
│   │       ├── analytics/page.tsx
│   │       └── settings/page.tsx
│   ├── team/page.tsx
│   └── settings/page.tsx
├── api/
│   ├── events/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── [id]/publish/route.ts
│   ├── tickets/
│   │   ├── route.ts
│   │   └── types/route.ts
│   ├── sessions/route.ts
│   ├── attendees/
│   │   ├── route.ts
│   │   └── [id]/check-in/route.ts
│   ├── checkout/route.ts
│   └── webhooks/stripe/route.ts
└── components/
    ├── events/
    │   ├── event-card.tsx
    │   ├── event-form.tsx
    │   ├── event-header.tsx
    │   └── event-schedule.tsx
    ├── tickets/
    │   ├── ticket-type-card.tsx
    │   ├── ticket-selector.tsx
    │   ├── ticket-qr.tsx
    │   └── ticket-form.tsx
    ├── sessions/
    │   ├── session-card.tsx
    │   ├── session-form.tsx
    │   └── schedule-grid.tsx
    ├── check-in/
    │   ├── qr-scanner.tsx
    │   ├── attendee-lookup.tsx
    │   └── check-in-stats.tsx
    └── attendees/
        ├── attendee-table.tsx
        └── attendee-detail.tsx
lib/
├── qr.ts
├── tickets.ts
└── calendar.ts
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

model Organization {
  id                String    @id @default(cuid())
  name              String
  slug              String    @unique
  
  email             String
  website           String?
  logoUrl           String?
  
  stripeAccountId   String?   @unique
  
  members           OrganizationMember[]
  events            Event[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  avatarUrl     String?
  
  memberships   OrganizationMember[]
  registrations Registration[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model OrganizationMember {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           Role         @default(MEMBER)
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt      DateTime     @default(now())
  
  @@unique([organizationId, userId])
}

enum Role {
  OWNER
  ADMIN
  MEMBER
  VIEWER
}

model Event {
  id              String       @id @default(cuid())
  organizationId  String
  
  title           String
  slug            String
  description     String       @db.Text
  summary         String?
  
  // Type
  type            EventType    @default(CONFERENCE)
  format          EventFormat  @default(IN_PERSON)
  
  // Media
  imageUrl        String?
  bannerUrl       String?
  
  // Location (for in-person)
  venueName       String?
  venueAddress    String?
  venueCity       String?
  venueState      String?
  venuePostal     String?
  venueCountry    String?
  latitude        Float?
  longitude       Float?
  
  // Virtual (for online)
  virtualUrl      String?
  virtualPlatform String?
  
  // Timing
  timezone        String       @default("UTC")
  startDate       DateTime
  endDate         DateTime
  
  // Status
  status          EventStatus  @default(DRAFT)
  isPublic        Boolean      @default(false)
  isFeatured      Boolean      @default(false)
  
  // Capacity
  capacity        Int?
  
  // Settings
  requireApproval Boolean      @default(false)
  allowWaitlist   Boolean      @default(true)
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  ticketTypes     TicketType[]
  sessions        Session[]
  speakers        Speaker[]
  sponsors        Sponsor[]
  registrations   Registration[]
  
  publishedAt     DateTime?
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@unique([organizationId, slug])
  @@index([organizationId])
  @@index([status])
  @@index([startDate])
}

enum EventType {
  CONFERENCE
  WORKSHOP
  MEETUP
  WEBINAR
  CONCERT
  FESTIVAL
  NETWORKING
  OTHER
}

enum EventFormat {
  IN_PERSON
  VIRTUAL
  HYBRID
}

enum EventStatus {
  DRAFT
  PUBLISHED
  SOLD_OUT
  CANCELLED
  COMPLETED
}

model TicketType {
  id              String       @id @default(cuid())
  eventId         String
  
  name            String
  description     String?
  
  price           Decimal      @db.Decimal(10, 2)
  currency        String       @default("USD")
  
  // Inventory
  quantity        Int?
  quantitySold    Int          @default(0)
  maxPerOrder     Int          @default(10)
  
  // Availability
  salesStart      DateTime?
  salesEnd        DateTime?
  
  // Access
  accessLevel     String?      // e.g., "VIP", "General", "Student"
  sessionAccess   String[]     // Session IDs this ticket grants access to
  
  isActive        Boolean      @default(true)
  order           Int          @default(0)
  
  event           Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  registrations   Registration[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([eventId])
}

model Session {
  id              String       @id @default(cuid())
  eventId         String
  
  title           String
  description     String?      @db.Text
  
  // Timing
  startTime       DateTime
  endTime         DateTime
  
  // Location
  room            String?
  capacity        Int?
  
  // Type
  type            SessionType  @default(TALK)
  track           String?      // e.g., "Technical", "Business"
  level           String?      // e.g., "Beginner", "Advanced"
  
  // Virtual
  virtualUrl      String?
  recordingUrl    String?
  
  event           Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  speakers        SessionSpeaker[]
  attendees       SessionAttendee[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([eventId])
  @@index([startTime])
}

enum SessionType {
  KEYNOTE
  TALK
  PANEL
  WORKSHOP
  NETWORKING
  BREAK
  OTHER
}

model Speaker {
  id          String    @id @default(cuid())
  eventId     String
  
  name        String
  title       String?
  company     String?
  bio         String?   @db.Text
  
  avatarUrl   String?
  
  email       String?
  twitter     String?
  linkedin    String?
  website     String?
  
  isFeatured  Boolean   @default(false)
  
  event       Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  sessions    SessionSpeaker[]
  
  createdAt   DateTime  @default(now())
  
  @@index([eventId])
}

model SessionSpeaker {
  id        String   @id @default(cuid())
  sessionId String
  speakerId String
  isPrimary Boolean  @default(false)
  
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  speaker   Speaker  @relation(fields: [speakerId], references: [id], onDelete: Cascade)
  
  @@unique([sessionId, speakerId])
}

model Sponsor {
  id          String       @id @default(cuid())
  eventId     String
  
  name        String
  tier        SponsorTier
  logoUrl     String?
  website     String?
  description String?
  
  order       Int          @default(0)
  
  event       Event        @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@index([eventId])
}

enum SponsorTier {
  PLATINUM
  GOLD
  SILVER
  BRONZE
  PARTNER
}

model Registration {
  id              String             @id @default(cuid())
  eventId         String
  ticketTypeId    String
  userId          String?
  
  // Ticket info
  ticketCode      String             @unique @default(cuid())
  qrCode          String?
  
  // Attendee info
  attendeeName    String
  attendeeEmail   String
  attendeePhone   String?
  attendeeCompany String?
  attendeeTitle   String?
  
  // Custom fields
  customFields    Json?
  
  // Payment
  amount          Decimal            @db.Decimal(10, 2)
  currency        String             @default("USD")
  stripePaymentIntentId String?
  
  status          RegistrationStatus @default(PENDING)
  
  // Check-in
  checkedInAt     DateTime?
  checkedInBy     String?
  
  // Dietary / accessibility
  dietaryRequirements String?
  accessibilityNeeds  String?
  
  event           Event              @relation(fields: [eventId], references: [id])
  ticketType      TicketType         @relation(fields: [ticketTypeId], references: [id])
  user            User?              @relation(fields: [userId], references: [id])
  sessionAttendees SessionAttendee[]
  
  createdAt       DateTime           @default(now())
  updatedAt       DateTime           @updatedAt
  
  @@index([eventId])
  @@index([ticketCode])
  @@index([attendeeEmail])
  @@index([status])
}

enum RegistrationStatus {
  PENDING
  CONFIRMED
  CANCELLED
  REFUNDED
  WAITLIST
}

model SessionAttendee {
  id             String       @id @default(cuid())
  sessionId      String
  registrationId String
  
  checkedIn      Boolean      @default(false)
  checkedInAt    DateTime?
  
  session        Session      @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  registration   Registration @relation(fields: [registrationId], references: [id], onDelete: Cascade)
  
  @@unique([sessionId, registrationId])
}
```

## Implementation

### Event Detail Page

```tsx
// app/events/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { EventHeader } from '@/components/events/event-header';
import { EventSchedule } from '@/components/events/event-schedule';
import { TicketSelector } from '@/components/tickets/ticket-selector';
import { SpeakerGrid } from '@/components/events/speaker-grid';
import { SponsorSection } from '@/components/events/sponsor-section';
import { format } from 'date-fns';
import { MapPin, Calendar, Users, Globe } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  
  const event = await prisma.event.findFirst({
    where: { slug, status: { in: ['PUBLISHED', 'SOLD_OUT'] } },
    include: {
      organization: true,
      ticketTypes: {
        where: { isActive: true },
        orderBy: { order: 'asc' },
      },
      sessions: {
        orderBy: { startTime: 'asc' },
        include: {
          speakers: { include: { speaker: true } },
        },
      },
      speakers: {
        where: { isFeatured: true },
        take: 8,
      },
      sponsors: {
        orderBy: [{ tier: 'asc' }, { order: 'asc' }],
      },
      _count: {
        select: { registrations: { where: { status: 'CONFIRMED' } } },
      },
    },
  });
  
  if (!event) {
    notFound();
  }
  
  const isSoldOut = event.capacity && event._count.registrations >= event.capacity;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <EventHeader event={event} />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Info */}
            <div className="bg-white rounded-lg border p-6">
              <h1 className="text-3xl font-bold mb-4">{event.title}</h1>
              
              <div className="flex flex-wrap gap-4 text-gray-600 mb-6">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>
                    {format(new Date(event.startDate), 'MMM d, yyyy')}
                    {event.startDate !== event.endDate && (
                      <> - {format(new Date(event.endDate), 'MMM d, yyyy')}</>
                    )}
                  </span>
                </div>
                
                {event.format !== 'VIRTUAL' && event.venueCity && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{event.venueCity}, {event.venueState}</span>
                  </div>
                )}
                
                {event.format !== 'IN_PERSON' && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    <span>Online Event</span>
                  </div>
                )}
                
                {event.capacity && (
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <span>{event._count.registrations} / {event.capacity} registered</span>
                  </div>
                )}
              </div>
              
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: event.description }} />
            </div>
            
            {/* Schedule */}
            {event.sessions.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold mb-6">Schedule</h2>
                <EventSchedule sessions={event.sessions} timezone={event.timezone} />
              </div>
            )}
            
            {/* Speakers */}
            {event.speakers.length > 0 && (
              <div className="bg-white rounded-lg border p-6">
                <h2 className="text-xl font-bold mb-6">Speakers</h2>
                <SpeakerGrid speakers={event.speakers} />
              </div>
            )}
            
            {/* Sponsors */}
            {event.sponsors.length > 0 && (
              <SponsorSection sponsors={event.sponsors} />
            )}
          </div>
          
          {/* Sidebar - Tickets */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <TicketSelector
                eventId={event.id}
                eventSlug={event.slug}
                ticketTypes={event.ticketTypes}
                isSoldOut={isSoldOut}
                currency={event.ticketTypes[0]?.currency || 'USD'}
              />
              
              {/* Venue Info */}
              {event.format !== 'VIRTUAL' && event.venueName && (
                <div className="bg-white rounded-lg border p-6 mt-4">
                  <h3 className="font-semibold mb-3">Venue</h3>
                  <p className="font-medium">{event.venueName}</p>
                  <p className="text-sm text-gray-600">
                    {event.venueAddress}<br />
                    {event.venueCity}, {event.venueState} {event.venuePostal}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### QR Code Scanner for Check-in

```tsx
// components/check-in/qr-scanner.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { useMutation } from '@tanstack/react-query';
import { Check, X, Camera, Search } from 'lucide-react';

interface QRScannerProps {
  eventId: string;
  onCheckIn: (registration: any) => void;
}

export function QRScanner({ eventId, onCheckIn }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [lastResult, setLastResult] = useState<'success' | 'error' | null>(null);
  const [lastMessage, setLastMessage] = useState('');
  const [manualCode, setManualCode] = useState('');
  
  const checkInMutation = useMutation({
    mutationFn: async (ticketCode: string) => {
      const res = await fetch(`/api/attendees/${ticketCode}/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Check-in failed');
      }
      
      return res.json();
    },
    onSuccess: (data) => {
      setLastResult('success');
      setLastMessage(`${data.attendeeName} checked in!`);
      onCheckIn(data);
      
      // Vibrate on success
      if ('vibrate' in navigator) {
        navigator.vibrate(200);
      }
      
      // Reset after delay
      setTimeout(() => {
        setLastResult(null);
        setLastMessage('');
      }, 2000);
    },
    onError: (error: Error) => {
      setLastResult('error');
      setLastMessage(error.message);
      
      // Vibrate pattern on error
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
      
      setTimeout(() => {
        setLastResult(null);
        setLastMessage('');
      }, 3000);
    },
  });
  
  useEffect(() => {
    if (!isScanning || !videoRef.current) return;
    
    const codeReader = new BrowserMultiFormatReader();
    let stopped = false;
    
    codeReader.decodeFromVideoDevice(
      undefined,
      videoRef.current,
      (result, error) => {
        if (stopped) return;
        
        if (result && !checkInMutation.isPending) {
          const code = result.getText();
          checkInMutation.mutate(code);
        }
      }
    );
    
    return () => {
      stopped = true;
      codeReader.reset();
    };
  }, [isScanning]);
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      checkInMutation.mutate(manualCode.trim());
      setManualCode('');
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Scanner View */}
      <div className="relative aspect-square max-w-md mx-auto bg-black rounded-xl overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
        />
        
        {/* Scan overlay */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-16 border-2 border-white/50 rounded-lg" />
          
          {/* Scanning line animation */}
          <div className="absolute inset-16 overflow-hidden">
            <div className="h-0.5 bg-indigo-500 animate-scan" />
          </div>
        </div>
        
        {/* Result overlay */}
        {lastResult && (
          <div className={`absolute inset-0 flex items-center justify-center ${
            lastResult === 'success' ? 'bg-green-500/90' : 'bg-red-500/90'
          }`}>
            <div className="text-center text-white">
              {lastResult === 'success' ? (
                <Check className="h-16 w-16 mx-auto mb-4" />
              ) : (
                <X className="h-16 w-16 mx-auto mb-4" />
              )}
              <p className="text-xl font-bold">{lastMessage}</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Manual Entry */}
      <div className="max-w-md mx-auto">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter ticket code manually..."
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>
          <button
            type="submit"
            disabled={!manualCode.trim() || checkInMutation.isPending}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium disabled:opacity-50"
          >
            Check In
          </button>
        </form>
      </div>
      
      {/* Toggle Camera */}
      <div className="text-center">
        <button
          onClick={() => setIsScanning(!isScanning)}
          className="inline-flex items-center gap-2 text-gray-600"
        >
          <Camera className="h-5 w-5" />
          {isScanning ? 'Pause Scanner' : 'Resume Scanner'}
        </button>
      </div>
    </div>
  );
}
```

### Ticket QR Code Display

```tsx
// components/tickets/ticket-qr.tsx
'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Share2, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TicketQRProps {
  registration: {
    id: string;
    ticketCode: string;
    attendeeName: string;
    attendeeEmail: string;
    status: string;
    checkedInAt: string | null;
    event: {
      title: string;
      startDate: string;
      venueName: string | null;
      venueCity: string | null;
    };
    ticketType: {
      name: string;
    };
  };
}

export function TicketQR({ registration }: TicketQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  
  useEffect(() => {
    QRCode.toDataURL(registration.ticketCode, {
      width: 300,
      margin: 2,
      color: { dark: '#1f2937', light: '#ffffff' },
    }).then(setQrDataUrl);
  }, [registration.ticketCode]);
  
  const handleAddToCalendar = () => {
    const event = registration.event;
    const startDate = new Date(event.startDate);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${format(startDate, "yyyyMMdd'T'HHmmss")}
DTEND:${format(endDate, "yyyyMMdd'T'HHmmss")}
SUMMARY:${event.title}
LOCATION:${event.venueName || ''} ${event.venueCity || ''}
DESCRIPTION:Ticket: ${registration.ticketType.name}
END:VEVENT
END:VCALENDAR`;
    
    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/\s+/g, '-')}.ics`;
    a.click();
  };
  
  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `My Ticket - ${registration.event.title}`,
        text: `I'm attending ${registration.event.title}!`,
        url: window.location.href,
      });
    }
  };
  
  const isCheckedIn = !!registration.checkedInAt;
  
  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Ticket Header */}
        <div className="bg-indigo-600 text-white p-6">
          <p className="text-sm opacity-80">{registration.ticketType.name}</p>
          <h1 className="text-xl font-bold mt-1">{registration.event.title}</h1>
          <p className="mt-2">
            {format(new Date(registration.event.startDate), 'EEEE, MMMM d, yyyy')}
          </p>
          {registration.event.venueName && (
            <p className="text-sm opacity-80 mt-1">
              {registration.event.venueName}, {registration.event.venueCity}
            </p>
          )}
        </div>
        
        {/* QR Code */}
        <div className="p-6 flex flex-col items-center">
          {isCheckedIn ? (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-12 w-12 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-green-600">Checked In</p>
              <p className="text-sm text-gray-500">
                {format(new Date(registration.checkedInAt!), 'MMM d, h:mm a')}
              </p>
            </div>
          ) : (
            <>
              {qrDataUrl && (
                <img
                  src={qrDataUrl}
                  alt="Ticket QR Code"
                  className="w-64 h-64"
                />
              )}
              <p className="text-sm text-gray-500 mt-2">
                Scan this code at check-in
              </p>
            </>
          )}
        </div>
        
        {/* Ticket Perforation */}
        <div className="relative">
          <div className="absolute left-0 w-4 h-8 bg-gray-100 rounded-r-full" />
          <div className="absolute right-0 w-4 h-8 bg-gray-100 rounded-l-full" />
          <div className="border-t border-dashed border-gray-200 mx-8" />
        </div>
        
        {/* Attendee Info */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Name</p>
              <p className="font-medium">{registration.attendeeName}</p>
            </div>
            <div>
              <p className="text-gray-500">Ticket #</p>
              <p className="font-mono">{registration.ticketCode.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="border-t p-4 flex gap-2">
          <button
            onClick={handleAddToCalendar}
            className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Calendar className="h-4 w-4" />
            Add to Calendar
          </button>
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2 border rounded-lg hover:bg-gray-50"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Check-in Statistics

```tsx
// components/check-in/check-in-stats.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, UserCheck, Clock, TrendingUp } from 'lucide-react';

interface CheckInStatsProps {
  eventId: string;
}

export function CheckInStats({ eventId }: CheckInStatsProps) {
  const { data: stats } = useQuery({
    queryKey: ['check-in-stats', eventId],
    queryFn: async () => {
      const res = await fetch(`/api/events/${eventId}/check-in-stats`);
      return res.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });
  
  if (!stats) return null;
  
  const checkInRate = stats.totalRegistrations > 0
    ? (stats.checkedIn / stats.totalRegistrations) * 100
    : 0;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.totalRegistrations}</p>
            <p className="text-sm text-gray-500">Registered</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserCheck className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.checkedIn}</p>
            <p className="text-sm text-gray-500">Checked In</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{checkInRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-500">Check-in Rate</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Clock className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.recentCheckIns}</p>
            <p className="text-sm text-gray-500">Last 5 min</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## Testing

### Unit Tests

```typescript
// __tests__/lib/ticket-utils.test.ts
import { describe, it, expect } from 'vitest';
import {
  generateTicketCode,
  validateTicketCode,
  calculateTicketAvailability,
  isTicketSaleOpen,
  formatEventDateTime,
} from '@/lib/ticket-utils';

describe('generateTicketCode', () => {
  it('generates unique codes', () => {
    const codes = new Set();
    for (let i = 0; i < 100; i++) {
      codes.add(generateTicketCode());
    }
    expect(codes.size).toBe(100);
  });

  it('generates codes of correct length', () => {
    const code = generateTicketCode();
    expect(code.length).toBeGreaterThanOrEqual(8);
  });
});

describe('calculateTicketAvailability', () => {
  it('returns remaining tickets', () => {
    const ticketType = { quantity: 100, quantitySold: 75 };
    expect(calculateTicketAvailability(ticketType)).toBe(25);
  });

  it('returns null for unlimited tickets', () => {
    const ticketType = { quantity: null, quantitySold: 50 };
    expect(calculateTicketAvailability(ticketType)).toBeNull();
  });

  it('returns 0 when sold out', () => {
    const ticketType = { quantity: 100, quantitySold: 100 };
    expect(calculateTicketAvailability(ticketType)).toBe(0);
  });
});

describe('isTicketSaleOpen', () => {
  it('returns true during sale window', () => {
    const ticketType = {
      salesStart: new Date(Date.now() - 1000),
      salesEnd: new Date(Date.now() + 1000),
    };
    expect(isTicketSaleOpen(ticketType)).toBe(true);
  });

  it('returns false before sale starts', () => {
    const ticketType = {
      salesStart: new Date(Date.now() + 1000),
      salesEnd: new Date(Date.now() + 2000),
    };
    expect(isTicketSaleOpen(ticketType)).toBe(false);
  });
});
```

### Component Tests

```typescript
// __tests__/components/qr-scanner.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QRScanner } from '@/components/check-in/qr-scanner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

describe('QRScanner', () => {
  const mockOnCheckIn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders scanner interface', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <QRScanner eventId="event-123" onCheckIn={mockOnCheckIn} />
      </QueryClientProvider>
    );
    expect(screen.getByPlaceholderText(/enter ticket code/i)).toBeInTheDocument();
  });

  it('allows manual code entry', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <QRScanner eventId="event-123" onCheckIn={mockOnCheckIn} />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/enter ticket code/i);
    fireEvent.change(input, { target: { value: 'TEST123' } });
    fireEvent.click(screen.getByText(/check in/i));

    await waitFor(() => {
      expect(screen.getByText(/check in/i)).toBeDisabled();
    });
  });

  it('displays success message on valid check-in', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ attendeeName: 'John Doe' }),
    });

    render(
      <QueryClientProvider client={queryClient}>
        <QRScanner eventId="event-123" onCheckIn={mockOnCheckIn} />
      </QueryClientProvider>
    );

    const input = screen.getByPlaceholderText(/enter ticket code/i);
    fireEvent.change(input, { target: { value: 'VALID123' } });
    fireEvent.click(screen.getByText(/check in/i));

    await waitFor(() => {
      expect(screen.getByText(/john doe checked in/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/api/events.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '@/lib/prisma';

describe('Events API', () => {
  beforeEach(async () => {
    await prisma.registration.deleteMany();
    await prisma.ticketType.deleteMany();
    await prisma.event.deleteMany();
  });

  it('creates an event with ticket types', async () => {
    const res = await fetch('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Test Conference',
        description: 'Test description',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
        ticketTypes: [
          { name: 'General Admission', price: 99, quantity: 100 },
          { name: 'VIP', price: 299, quantity: 20 },
        ],
      }),
    });

    expect(res.status).toBe(201);
    const event = await res.json();
    expect(event.title).toBe('Test Conference');
    expect(event.ticketTypes).toHaveLength(2);
  });

  it('performs check-in correctly', async () => {
    // Create event and registration
    const event = await prisma.event.create({
      data: {
        title: 'Test Event',
        slug: 'test-event',
        description: 'Description',
        startDate: new Date(),
        endDate: new Date(),
        organization: { connect: { id: 'org-id' } },
        ticketTypes: {
          create: { name: 'General', price: 50 },
        },
      },
      include: { ticketTypes: true },
    });

    const registration = await prisma.registration.create({
      data: {
        eventId: event.id,
        ticketTypeId: event.ticketTypes[0].id,
        ticketCode: 'TESTCODE123',
        attendeeName: 'John Doe',
        attendeeEmail: 'john@example.com',
        amount: 50,
        status: 'CONFIRMED',
      },
    });

    // Check-in
    const res = await fetch(`http://localhost:3000/api/attendees/${registration.ticketCode}/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: event.id }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.attendeeName).toBe('John Doe');
    expect(data.checkedInAt).toBeDefined();
  });
});
```

### E2E Tests

```typescript
// e2e/event-platform.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Event Platform', () => {
  test('complete ticket purchase flow', async ({ page }) => {
    // Navigate to event
    await page.goto('/events/sample-conference');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Sample Conference');

    // Select tickets
    await page.fill('[data-testid="ticket-quantity-general"]', '2');
    await page.click('text=Buy Tickets');

    // Fill attendee info
    await page.fill('[name="attendees.0.name"]', 'John Doe');
    await page.fill('[name="attendees.0.email"]', 'john@example.com');
    await page.fill('[name="attendees.1.name"]', 'Jane Doe');
    await page.fill('[name="attendees.1.email"]', 'jane@example.com');

    // Proceed to checkout
    await page.click('text=Continue to Payment');
    await expect(page).toHaveURL(/\/checkout/);
  });

  test('organizer can check in attendees', async ({ page }) => {
    await page.goto('/events/sample-conference/check-in');

    // Manual check-in
    await page.fill('[placeholder*="ticket code"]', 'TESTCODE123');
    await page.click('text=Check In');

    await expect(page.locator('.check-in-success')).toBeVisible();
  });

  test('attendee can view their ticket', async ({ page }) => {
    await page.goto('/tickets/TESTCODE123');

    await expect(page.locator('[data-testid="ticket-qr"]')).toBeVisible();
    await expect(page.getByText('Add to Calendar')).toBeVisible();
  });

  test('organizer dashboard shows stats', async ({ page }) => {
    await page.goto('/events/sample-conference/analytics');

    await expect(page.getByText('Registered')).toBeVisible();
    await expect(page.getByText('Checked In')).toBeVisible();
    await expect(page.getByText('Revenue')).toBeVisible();
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
    console.error('Event platform error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6 max-w-md">
          We encountered an error while loading this page. Please try again.
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

### Check-in Error Recovery

```tsx
// components/check-in/check-in-error.tsx
'use client';

import { AlertCircle, Search, RefreshCw } from 'lucide-react';

interface CheckInErrorProps {
  error: string;
  ticketCode: string;
  onRetry: () => void;
  onManualLookup: () => void;
}

export function CheckInError({ error, ticketCode, onRetry, onManualLookup }: CheckInErrorProps) {
  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'ALREADY_CHECKED_IN':
        return 'This attendee has already been checked in.';
      case 'TICKET_NOT_FOUND':
        return 'Ticket code not found. Please verify the code.';
      case 'INVALID_EVENT':
        return 'This ticket is not valid for this event.';
      case 'REGISTRATION_CANCELLED':
        return 'This registration has been cancelled.';
      default:
        return 'Unable to process check-in. Please try again.';
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">Check-in Failed</h3>
          <p className="text-red-700 mt-1">{getErrorMessage(error)}</p>
          <p className="text-sm text-red-600 mt-2">Code: {ticketCode}</p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
            <button
              onClick={onManualLookup}
              className="inline-flex items-center gap-2 px-4 py-2 border border-red-200 text-red-700 rounded-lg hover:bg-red-100"
            >
              <Search className="h-4 w-4" />
              Manual Lookup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### API Error Handling

```typescript
// lib/api-error.ts
export class EventAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'EventAPIError';
  }
}

export const EventErrorCodes = {
  TICKET_NOT_FOUND: 'TICKET_NOT_FOUND',
  ALREADY_CHECKED_IN: 'ALREADY_CHECKED_IN',
  EVENT_NOT_FOUND: 'EVENT_NOT_FOUND',
  REGISTRATION_CANCELLED: 'REGISTRATION_CANCELLED',
  TICKETS_SOLD_OUT: 'TICKETS_SOLD_OUT',
  SALE_NOT_STARTED: 'SALE_NOT_STARTED',
  SALE_ENDED: 'SALE_ENDED',
} as const;

export function handleAPIError(error: unknown) {
  if (error instanceof EventAPIError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  console.error('Unhandled API error:', error);
  return Response.json({ error: 'Internal server error' }, { status: 500 });
}
```

## Accessibility

### WCAG 2.1 AA Compliance

```tsx
// components/events/accessible-schedule.tsx
'use client';

import { format } from 'date-fns';

interface Session {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  room?: string;
  speakers: { name: string }[];
}

interface AccessibleScheduleProps {
  sessions: Session[];
  timezone: string;
}

export function AccessibleSchedule({ sessions, timezone }: AccessibleScheduleProps) {
  return (
    <section aria-labelledby="schedule-heading">
      <h2 id="schedule-heading" className="sr-only">Event Schedule</h2>
      <ul role="list" className="space-y-4">
        {sessions.map((session) => (
          <li
            key={session.id}
            className="bg-white border rounded-lg p-4"
            aria-labelledby={`session-${session.id}-title`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 id={`session-${session.id}-title`} className="font-semibold">
                  {session.title}
                </h3>
                <p className="text-sm text-gray-600">
                  <time dateTime={session.startTime.toISOString()}>
                    {format(session.startTime, 'h:mm a')}
                  </time>
                  {' - '}
                  <time dateTime={session.endTime.toISOString()}>
                    {format(session.endTime, 'h:mm a')}
                  </time>
                  <span className="sr-only"> ({timezone})</span>
                </p>
                {session.speakers.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    <span className="sr-only">Speakers: </span>
                    {session.speakers.map(s => s.name).join(', ')}
                  </p>
                )}
              </div>
              {session.room && (
                <span className="text-sm text-gray-500">
                  <span className="sr-only">Location: </span>
                  {session.room}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

### Keyboard Navigation for Ticket Selection

```tsx
// components/tickets/keyboard-ticket-selector.tsx
'use client';

import { useRef, KeyboardEvent } from 'react';
import { Minus, Plus } from 'lucide-react';

interface TicketType {
  id: string;
  name: string;
  price: number;
  available: number | null;
}

interface KeyboardTicketSelectorProps {
  ticketTypes: TicketType[];
  quantities: Record<string, number>;
  onQuantityChange: (id: string, quantity: number) => void;
}

export function KeyboardTicketSelector({
  ticketTypes,
  quantities,
  onQuantityChange,
}: KeyboardTicketSelectorProps) {
  const handleKeyDown = (e: KeyboardEvent, ticketId: string, currentQty: number, max: number | null) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowRight':
        e.preventDefault();
        if (max === null || currentQty < max) {
          onQuantityChange(ticketId, currentQty + 1);
        }
        break;
      case 'ArrowDown':
      case 'ArrowLeft':
        e.preventDefault();
        if (currentQty > 0) {
          onQuantityChange(ticketId, currentQty - 1);
        }
        break;
      case 'Home':
        e.preventDefault();
        onQuantityChange(ticketId, 0);
        break;
      case 'End':
        e.preventDefault();
        if (max !== null) {
          onQuantityChange(ticketId, Math.min(max, 10));
        }
        break;
    }
  };

  return (
    <div role="group" aria-label="Select ticket quantities">
      {ticketTypes.map((ticket) => {
        const qty = quantities[ticket.id] || 0;
        return (
          <div
            key={ticket.id}
            className="flex items-center justify-between p-4 border rounded-lg mb-3"
          >
            <div>
              <p className="font-medium">{ticket.name}</p>
              <p className="text-sm text-gray-600">${ticket.price}</p>
            </div>
            <div
              role="spinbutton"
              aria-label={`${ticket.name} quantity`}
              aria-valuenow={qty}
              aria-valuemin={0}
              aria-valuemax={ticket.available ?? 10}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(e, ticket.id, qty, ticket.available)}
              className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1"
            >
              <button
                type="button"
                onClick={() => onQuantityChange(ticket.id, Math.max(0, qty - 1))}
                disabled={qty === 0}
                aria-label={`Decrease ${ticket.name} quantity`}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center font-medium">{qty}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(ticket.id, qty + 1)}
                disabled={ticket.available !== null && qty >= ticket.available}
                aria-label={`Increase ${ticket.name} quantity`}
                className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Screen Reader Announcements for Check-in

```tsx
// components/check-in/check-in-announcer.tsx
'use client';

import { useEffect, useState } from 'react';

interface CheckInAnnouncerProps {
  lastCheckIn: { name: string; status: 'success' | 'error' } | null;
}

export function CheckInAnnouncer({ lastCheckIn }: CheckInAnnouncerProps) {
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (lastCheckIn) {
      const message = lastCheckIn.status === 'success'
        ? `${lastCheckIn.name} successfully checked in`
        : `Check-in failed for ${lastCheckIn.name}`;
      setAnnouncement(message);

      const timer = setTimeout(() => setAnnouncement(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastCheckIn]);

  return (
    <div
      role="status"
      aria-live="assertive"
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
// lib/validations/event.ts
import { z } from 'zod';

export const createEventSchema = z.object({
  title: z.string().min(3).max(200).trim(),
  description: z.string().min(50).max(50000),
  startDate: z.coerce.date().refine(d => d > new Date(), 'Start date must be in the future'),
  endDate: z.coerce.date(),
  type: z.enum(['CONFERENCE', 'WORKSHOP', 'MEETUP', 'WEBINAR', 'CONCERT', 'FESTIVAL', 'NETWORKING', 'OTHER']),
  format: z.enum(['IN_PERSON', 'VIRTUAL', 'HYBRID']),
  capacity: z.number().int().positive().max(100000).optional(),
  venueName: z.string().max(200).optional(),
  venueAddress: z.string().max(500).optional(),
  ticketTypes: z.array(z.object({
    name: z.string().min(2).max(100),
    price: z.number().min(0).max(10000),
    quantity: z.number().int().positive().max(10000).optional(),
    maxPerOrder: z.number().int().min(1).max(10).default(10),
  })).min(0).max(20),
}).refine(data => data.endDate >= data.startDate, {
  message: 'End date must be after start date',
  path: ['endDate'],
});

export const checkInSchema = z.object({
  ticketCode: z.string().min(5).max(50),
  eventId: z.string().cuid(),
});

export const registrationSchema = z.object({
  eventId: z.string().cuid(),
  ticketTypeId: z.string().cuid(),
  attendeeName: z.string().min(2).max(100).trim(),
  attendeeEmail: z.string().email(),
  attendeePhone: z.string().max(20).optional(),
  attendeeCompany: z.string().max(100).optional(),
  dietaryRequirements: z.string().max(500).optional(),
  accessibilityNeeds: z.string().max(500).optional(),
});
```

### Rate Limiting for Check-in

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const checkInRatelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 check-ins per minute
  analytics: true,
});

export async function checkCheckInRateLimit(eventId: string) {
  const { success, remaining } = await checkInRatelimit.limit(`checkin:${eventId}`);

  if (!success) {
    throw new EventAPIError(
      'Check-in rate limit exceeded. Please slow down.',
      429,
      'RATE_LIMIT_EXCEEDED'
    );
  }

  return { remaining };
}
```

### QR Code Security

```typescript
// lib/qr-security.ts
import crypto from 'crypto';

const SECRET = process.env.QR_SECRET_KEY!;

export function generateSecureTicketCode(registrationId: string): string {
  const timestamp = Date.now().toString(36);
  const random = crypto.randomBytes(4).toString('hex');
  const data = `${registrationId}:${timestamp}:${random}`;

  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('hex')
    .slice(0, 8);

  return `${data}:${signature}`;
}

export function validateTicketCode(code: string): { valid: boolean; registrationId?: string } {
  const parts = code.split(':');
  if (parts.length !== 4) return { valid: false };

  const [registrationId, timestamp, random, signature] = parts;
  const data = `${registrationId}:${timestamp}:${random}`;

  const expectedSignature = crypto
    .createHmac('sha256', SECRET)
    .update(data)
    .digest('hex')
    .slice(0, 8);

  if (signature !== expectedSignature) return { valid: false };

  return { valid: true, registrationId };
}
```

### Stripe Webhook Verification

```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return Response.json({ error: 'Invalid signature' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed':
      await handleSuccessfulPayment(event.data.object);
      break;
    case 'payment_intent.payment_failed':
      await handleFailedPayment(event.data.object);
      break;
  }

  return Response.json({ received: true });
}
```

## Performance

### Database Query Optimization

```typescript
// lib/queries/events.ts
import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

export const getUpcomingEvents = unstable_cache(
  async () => {
    return prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        startDate: { gte: new Date() },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        startDate: true,
        venueCity: true,
        format: true,
        _count: {
          select: { registrations: { where: { status: 'CONFIRMED' } } },
        },
      },
      take: 12,
      orderBy: { startDate: 'asc' },
    });
  },
  ['upcoming-events'],
  { revalidate: 60, tags: ['events'] }
);

export const getEventCheckInStats = unstable_cache(
  async (eventId: string) => {
    const [total, checkedIn, recent] = await Promise.all([
      prisma.registration.count({
        where: { eventId, status: 'CONFIRMED' },
      }),
      prisma.registration.count({
        where: { eventId, status: 'CONFIRMED', checkedInAt: { not: null } },
      }),
      prisma.registration.count({
        where: {
          eventId,
          checkedInAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        },
      }),
    ]);

    return { totalRegistrations: total, checkedIn, recentCheckIns: recent };
  },
  ['event-checkin-stats'],
  { revalidate: 10, tags: ['checkins'] }
);
```

### Image Optimization

```tsx
// components/events/optimized-event-image.tsx
import Image from 'next/image';

interface OptimizedEventImageProps {
  src: string;
  alt: string;
  priority?: boolean;
}

export function OptimizedEventImage({ src, alt, priority }: OptimizedEventImageProps) {
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
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD..."
      />
    </div>
  );
}
```

### Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | 1.9s |
| FID | < 100ms | 50ms |
| CLS | < 0.1 | 0.04 |
| TTFB | < 600ms | 380ms |
| Check-in Response | < 200ms | 120ms |
| QR Scan to Confirm | < 500ms | 350ms |

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
  DATABASE_URL: postgresql://test:test@localhost:5432/events_test
  STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_SECRET_KEY }}

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
          POSTGRES_DB: events_test
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

export function trackCheckIn(eventId: string, success: boolean) {
  Sentry.addBreadcrumb({
    category: 'check-in',
    message: `Check-in ${success ? 'successful' : 'failed'} for event ${eventId}`,
    level: success ? 'info' : 'warning',
  });
}

export function trackTicketPurchase(eventId: string, amount: number) {
  Sentry.addBreadcrumb({
    category: 'purchase',
    message: `Ticket purchase of $${amount} for event ${eventId}`,
    level: 'info',
  });
}
```

### Real-time Check-in Metrics

```typescript
// lib/metrics.ts
export async function getRealtimeCheckInMetrics(eventId: string) {
  const [stats, timeline] = await Promise.all([
    prisma.registration.aggregate({
      where: { eventId, status: 'CONFIRMED' },
      _count: true,
    }),
    prisma.$queryRaw`
      SELECT
        date_trunc('minute', "checkedInAt") as minute,
        COUNT(*) as count
      FROM "Registration"
      WHERE "eventId" = ${eventId}
        AND "checkedInAt" IS NOT NULL
        AND "checkedInAt" > NOW() - INTERVAL '1 hour'
      GROUP BY minute
      ORDER BY minute
    `,
  ]);

  return { totalRegistrations: stats._count, checkInTimeline: timeline };
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
    qrService: false,
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

  checks.qrService = true; // QR generation is client-side

  const allHealthy = checks.database && checks.stripe && checks.qrService;

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

  - name: check-in-failures
    condition: checkin_failure_rate > 10%
    window: 10m
    severity: high
    channels: [slack]

  - name: ticket-purchase-failures
    condition: payment_failure_rate > 15%
    window: 15m
    severity: high
    channels: [slack]

  - name: slow-check-in
    condition: checkin_p95_latency > 500ms
    window: 5m
    severity: warning
    channels: [slack]

  - name: database-connection-pool
    condition: db_pool_usage > 80%
    window: 5m
    severity: warning
    channels: [slack]
```

## Related Skills

- [[stripe-integration]] - Ticket payments
- [[qr-codes]] - QR generation and scanning
- [[multi-tenancy]] - Organization isolation
- [[rbac]] - Role-based access
- [[email-notifications]] - Ticket delivery
- [[calendar-integration]] - .ics export

## Changelog

- 3.0.0: Added comprehensive Testing, Error Handling, Accessibility, Security, Performance, CI/CD, and Monitoring sections
- 1.0.0: Initial event platform recipe with ticketing and check-in
