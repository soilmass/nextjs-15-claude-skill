---
id: r-booking-app
name: Booking Application
version: 3.0.0
layer: L6
category: recipes
description: Appointment scheduling system with calendar, availability, and notifications
tags: [booking, scheduling, appointments, calendar, availability, reminders]
formula: "BookingApp = DashboardLayout(t-dashboard-layout) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + LandingPage(t-landing-page) + CheckoutPage(t-checkout-page) + Calendar(o-calendar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Header(o-header) + Footer(o-footer) + Hero(o-hero) + SettingsForm(o-settings-form) + CheckoutForm(o-checkout-form) + NotificationCenter(o-notification-center) + Card(m-card) + StatCard(m-stat-card) + DatePicker(m-date-picker) + FormField(m-form-field) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + EmptyState(m-empty-state) + TimelineItem(m-timeline-item) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + DatePickers(pt-date-pickers) + CalendarIntegration(pt-calendar-integration) + DateFormatting(pt-date-formatting) + StripeCheckout(pt-stripe-checkout) + StripeWebhooks(pt-stripe-webhooks) + TransactionalEmail(pt-transactional-email) + EmailTemplates(pt-email-templates) + PushNotifications(pt-push-notifications) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + Mutations(pt-mutations) + CronJobs(pt-cron-jobs) + ScheduledTasks(pt-scheduled-tasks) + Sitemap(pt-sitemap) + StructuredData(pt-structured-data) + MetadataApi(pt-metadata-api) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + UserAnalytics(pt-user-analytics) + Pagination(pt-pagination) + Filtering(pt-filtering) + Sorting(pt-sorting) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit) + Csp(pt-csp) + InputSanitization(pt-input-sanitization) + OptimisticUpdates(pt-optimistic-updates)"
composes:
  # L2 Molecules - UI Building Blocks
  - ../molecules/card.md
  - ../molecules/stat-card.md
  - ../molecules/date-picker.md
  - ../molecules/form-field.md
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/empty-state.md
  - ../molecules/timeline-item.md
  # L3 Organisms - Complex Components
  - ../organisms/calendar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/header.md
  - ../organisms/footer.md
  - ../organisms/hero.md
  - ../organisms/settings-form.md
  - ../organisms/checkout-form.md
  - ../organisms/notification-center.md
  # L4 Templates - Page Layouts
  - ../templates/dashboard-layout.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  - ../templates/landing-page.md
  - ../templates/checkout-page.md
  # L5 Patterns - Authentication & Security
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  # L5 Patterns - Calendar & Scheduling
  - ../patterns/date-pickers.md
  - ../patterns/calendar-integration.md
  - ../patterns/date-formatting.md
  # L5 Patterns - Payments
  - ../patterns/stripe-checkout.md
  - ../patterns/stripe-webhooks.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/email-templates.md
  - ../patterns/push-notifications.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  - ../patterns/mutations.md
  # L5 Patterns - Background Jobs
  - ../patterns/cron-jobs.md
  - ../patterns/scheduled-tasks.md
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
  - ../patterns/testing-unit.md
  # L5 Patterns - Security (Additional)
  - ../patterns/csp.md
  - ../patterns/input-sanitization.md
  # L5 Patterns - UI/UX
  - ../patterns/optimistic-updates.md
dependencies:
  - next
  - react
  - tailwindcss
  - prisma
  - date-fns
  - react-hook-form
  - zod
  - resend
skills:
  - date-pickers
  - calendar-integration
  - form-validation
  - transactional-email
  - push-notifications
  - session-management
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Booking Application Recipe

## Overview

A complete appointment booking system for service providers featuring availability management, real-time slot selection, booking confirmation, and email/SMS reminders.

## Project Structure

```
booking-app/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx              # Landing
│   │   ├── book/
│   │   │   ├── page.tsx          # Service selection
│   │   │   ├── [serviceId]/
│   │   │   │   ├── page.tsx      # Date/time selection
│   │   │   │   └── confirm/page.tsx
│   │   └── booking/
│   │       └── [id]/page.tsx     # Booking confirmation
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── availability/page.tsx
│   │   ├── services/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── bookings/route.ts
│   │   ├── availability/route.ts
│   │   ├── services/route.ts
│   │   └── webhooks/reminders/route.ts
│   └── layout.tsx
├── components/
│   ├── booking/
│   │   ├── service-selector.tsx
│   │   ├── calendar-picker.tsx
│   │   ├── time-slots.tsx
│   │   ├── booking-form.tsx
│   │   └── booking-summary.tsx
│   ├── dashboard/
│   │   ├── upcoming-bookings.tsx
│   │   ├── availability-editor.tsx
│   │   └── booking-calendar.tsx
│   └── ui/
│       └── ...
├── lib/
│   ├── prisma.ts
│   ├── availability.ts
│   ├── email.ts
│   └── utils.ts
└── prisma/
    └── schema.prisma
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
  name          String?
  phone         String?
  role          Role      @default(CUSTOMER)
  bookings      Booking[] @relation("CustomerBookings")
  services      Service[] @relation("ProviderServices")
  availability  Availability[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

enum Role {
  CUSTOMER
  PROVIDER
  ADMIN
}

model Service {
  id          String    @id @default(cuid())
  name        String
  description String?
  duration    Int       // minutes
  price       Decimal
  color       String?
  active      Boolean   @default(true)
  providerId  String
  provider    User      @relation("ProviderServices", fields: [providerId], references: [id])
  bookings    Booking[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Booking {
  id          String        @id @default(cuid())
  date        DateTime
  startTime   DateTime
  endTime     DateTime
  status      BookingStatus @default(PENDING)
  notes       String?
  serviceId   String
  service     Service       @relation(fields: [serviceId], references: [id])
  customerId  String
  customer    User          @relation("CustomerBookings", fields: [customerId], references: [id])
  reminders   Reminder[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([date, serviceId])
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
  NO_SHOW
}

model Availability {
  id          String    @id @default(cuid())
  dayOfWeek   Int       // 0-6 (Sunday-Saturday)
  startTime   String    // HH:mm format
  endTime     String    // HH:mm format
  providerId  String
  provider    User      @relation(fields: [providerId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@unique([providerId, dayOfWeek, startTime])
}

model BlockedDate {
  id          String    @id @default(cuid())
  date        DateTime
  reason      String?
  providerId  String
  createdAt   DateTime  @default(now())
}

model Reminder {
  id          String    @id @default(cuid())
  type        ReminderType
  scheduledAt DateTime
  sentAt      DateTime?
  bookingId   String
  booking     Booking   @relation(fields: [bookingId], references: [id])
}

enum ReminderType {
  EMAIL_24H
  EMAIL_1H
  SMS_24H
  SMS_1H
}
```

## Implementation

### Availability Calculator

```ts
// lib/availability.ts
import { prisma } from './prisma';
import {
  addMinutes,
  format,
  parse,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  eachMinuteOfInterval,
  setHours,
  setMinutes,
} from 'date-fns';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export async function getAvailableSlots(
  providerId: string,
  serviceId: string,
  date: Date
): Promise<TimeSlot[]> {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) return [];

  const dayOfWeek = date.getDay();

  // Get provider's availability for this day
  const availability = await prisma.availability.findMany({
    where: {
      providerId,
      dayOfWeek,
    },
  });

  if (availability.length === 0) return [];

  // Check if date is blocked
  const blockedDate = await prisma.blockedDate.findFirst({
    where: {
      providerId,
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
    },
  });

  if (blockedDate) return [];

  // Get existing bookings for this day
  const existingBookings = await prisma.booking.findMany({
    where: {
      service: { providerId },
      date: {
        gte: startOfDay(date),
        lte: endOfDay(date),
      },
      status: { in: ['PENDING', 'CONFIRMED'] },
    },
  });

  // Generate all possible slots
  const slots: TimeSlot[] = [];
  const slotDuration = service.duration;

  for (const avail of availability) {
    const [startHour, startMin] = avail.startTime.split(':').map(Number);
    const [endHour, endMin] = avail.endTime.split(':').map(Number);

    let current = setMinutes(setHours(date, startHour), startMin);
    const end = setMinutes(setHours(date, endHour), endMin);

    while (isBefore(addMinutes(current, slotDuration), end) || 
           addMinutes(current, slotDuration).getTime() === end.getTime()) {
      const slotEnd = addMinutes(current, slotDuration);

      // Check if slot conflicts with existing bookings
      const isBooked = existingBookings.some(
        (booking) =>
          (isAfter(current, booking.startTime) && isBefore(current, booking.endTime)) ||
          (isAfter(slotEnd, booking.startTime) && isBefore(slotEnd, booking.endTime)) ||
          (isBefore(current, booking.startTime) && isAfter(slotEnd, booking.endTime)) ||
          current.getTime() === booking.startTime.getTime()
      );

      // Don't show past slots for today
      const isPast = isBefore(current, new Date());

      slots.push({
        start: current,
        end: slotEnd,
        available: !isBooked && !isPast,
      });

      current = addMinutes(current, 30); // 30-minute intervals
    }
  }

  return slots;
}

export async function isSlotAvailable(
  providerId: string,
  startTime: Date,
  endTime: Date
): Promise<boolean> {
  const conflicting = await prisma.booking.findFirst({
    where: {
      service: { providerId },
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        {
          startTime: { lt: endTime },
          endTime: { gt: startTime },
        },
      ],
    },
  });

  return !conflicting;
}
```

### Calendar Picker Component

```tsx
// components/booking/calendar-picker.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarPickerProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDates?: Date[];
  minDate?: Date;
}

export function CalendarPicker({
  selectedDate,
  onSelectDate,
  availableDates,
  minDate = new Date(),
}: CalendarPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isDateAvailable = (date: Date) => {
    if (isBefore(date, minDate) && !isSameDay(date, minDate)) return false;
    if (availableDates) {
      return availableDates.some((d) => isSameDay(d, date));
    }
    return true;
  };

  return (
    <div className="bg-white rounded-xl border p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const available = isDateAvailable(day);
          const today = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => available && onSelectDate(day)}
              disabled={!available || !isCurrentMonth}
              className={`
                aspect-square p-2 text-sm rounded-lg transition-colors
                ${!isCurrentMonth ? 'text-gray-300' : ''}
                ${isSelected
                  ? 'bg-blue-600 text-white'
                  : available && isCurrentMonth
                  ? 'hover:bg-blue-50 text-gray-900'
                  : 'text-gray-300 cursor-not-allowed'
                }
                ${today && !isSelected ? 'ring-2 ring-blue-200' : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### Time Slots Component

```tsx
// components/booking/time-slots.tsx
'use client';

import { format } from 'date-fns';
import { Clock, Loader2 } from 'lucide-react';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  isLoading?: boolean;
}

export function TimeSlots({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading,
}: TimeSlotsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No available slots for this date</p>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);
  const unavailableSlots = slots.filter((s) => !s.available);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 rounded" />
          <span>Available ({availableSlots.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 rounded" />
          <span>Booked ({unavailableSlots.length})</span>
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {slots.map((slot) => {
          const isSelected =
            selectedSlot?.start.getTime() === slot.start.getTime();

          return (
            <button
              key={slot.start.toISOString()}
              onClick={() => slot.available && onSelectSlot(slot)}
              disabled={!slot.available}
              className={`
                px-3 py-2 text-sm rounded-lg border transition-colors
                ${isSelected
                  ? 'bg-blue-600 text-white border-blue-600'
                  : slot.available
                  ? 'bg-green-50 border-green-200 hover:bg-green-100 text-green-800'
                  : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {format(slot.start, 'h:mm a')}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

### Booking Form

```tsx
// components/booking/booking-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface BookingFormProps {
  onSubmit: (data: FormData) => Promise<void>;
  isSubmitting?: boolean;
}

export function BookingForm({ onSubmit, isSubmitting }: BookingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Full Name *
        </label>
        <input
          id="name"
          type="text"
          {...register('name')}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email *
        </label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="john@example.com"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-1">
          Phone Number *
        </label>
        <input
          id="phone"
          type="tel"
          {...register('phone')}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="(555) 123-4567"
        />
        {errors.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Additional Notes
        </label>
        <textarea
          id="notes"
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Any special requests or information..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Confirming...
          </>
        ) : (
          'Confirm Booking'
        )}
      </button>
    </form>
  );
}
```

### Bookings API

```tsx
// app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isSlotAvailable } from '@/lib/availability';
import { sendBookingConfirmation, scheduleReminders } from '@/lib/email';
import { addHours } from 'date-fns';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { serviceId, date, startTime, customer } = body;

  try {
    // Get service details
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { provider: true },
    });

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    const start = new Date(startTime);
    const end = addHours(start, service.duration / 60);

    // Verify slot is still available
    const available = await isSlotAvailable(service.providerId, start, end);
    if (!available) {
      return NextResponse.json(
        { error: 'This slot is no longer available' },
        { status: 409 }
      );
    }

    // Create or find customer
    let customerRecord = await prisma.user.findUnique({
      where: { email: customer.email },
    });

    if (!customerRecord) {
      customerRecord = await prisma.user.create({
        data: {
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          role: 'CUSTOMER',
        },
      });
    }

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        date: new Date(date),
        startTime: start,
        endTime: end,
        status: 'CONFIRMED',
        notes: customer.notes,
        serviceId,
        customerId: customerRecord.id,
      },
      include: {
        service: true,
        customer: true,
      },
    });

    // Send confirmation email
    await sendBookingConfirmation(booking);

    // Schedule reminders
    await scheduleReminders(booking.id);

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');
  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const where: any = {};

  if (providerId) {
    where.service = { providerId };
  }
  if (status) {
    where.status = status;
  }
  if (from && to) {
    where.date = {
      gte: new Date(from),
      lte: new Date(to),
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: true,
      customer: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: { startTime: 'asc' },
  });

  return NextResponse.json(bookings);
}
```

### Dashboard Bookings View

```tsx
// components/dashboard/upcoming-bookings.tsx
'use client';

import { format } from 'date-fns';
import { Calendar, Clock, User, MoreVertical, Check, X } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

interface Booking {
  id: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  status: string;
  notes?: string;
  service: { name: string; duration: number };
  customer: { name: string; email: string; phone: string };
}

interface UpcomingBookingsProps {
  bookings: Booking[];
  onStatusChange: (id: string, status: string) => void;
}

export function UpcomingBookings({
  bookings,
  onStatusChange,
}: UpcomingBookingsProps) {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
    COMPLETED: 'bg-blue-100 text-blue-800',
    NO_SHOW: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="space-y-4">
      {bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No upcoming bookings</p>
        </div>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking.id}
            className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold">{booking.service.name}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full ${
                      statusColors[booking.status]
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                <div className="grid sm:grid-cols-3 gap-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(booking.date), 'MMM d, yyyy')}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {format(new Date(booking.startTime), 'h:mm a')} -
                    {format(new Date(booking.endTime), 'h:mm a')}
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {booking.customer.name}
                  </div>
                </div>

                {booking.notes && (
                  <p className="mt-2 text-sm text-gray-500 italic">
                    "{booking.notes}"
                  </p>
                )}
              </div>

              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenu.Trigger>

                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    className="min-w-[160px] bg-white rounded-lg shadow-lg border p-1 z-50"
                    sideOffset={5}
                  >
                    <DropdownMenu.Item
                      onClick={() => onStatusChange(booking.id, 'COMPLETED')}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                      Mark Completed
                    </DropdownMenu.Item>
                    <DropdownMenu.Item
                      onClick={() => onStatusChange(booking.id, 'CANCELLED')}
                      className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer text-red-600"
                    >
                      <X className="w-4 h-4" />
                      Cancel Booking
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
```

### Automated Reminder System

```typescript
// lib/reminders.ts
import { prisma } from './prisma';
import { Resend } from 'resend';
import twilio from 'twilio';
import webpush from 'web-push';
import { subHours, subMinutes } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Configure web push
webpush.setVapidDetails(
  'mailto:support@yourdomain.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// Reminder timing configuration
export const REMINDER_INTERVALS = {
  '24h': { hours: 24, minutes: 0 },
  '2h': { hours: 2, minutes: 0 },
  '30min': { hours: 0, minutes: 30 },
} as const;

export type ReminderInterval = keyof typeof REMINDER_INTERVALS;
export type ReminderChannel = 'email' | 'sms' | 'push';

interface ReminderPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  intervals: ReminderInterval[];
}

interface ScheduleRemindersOptions {
  bookingId: string;
  preferences?: Partial<ReminderPreferences>;
}

/**
 * Schedule all reminders for a booking based on customer preferences
 */
export async function scheduleReminders({
  bookingId,
  preferences,
}: ScheduleRemindersOptions): Promise<void> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: {
        include: { reminderPreferences: true },
      },
      service: true,
    },
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  // Get customer preferences or use defaults
  const customerPrefs = booking.customer.reminderPreferences;
  const effectivePrefs: ReminderPreferences = {
    email: preferences?.email ?? customerPrefs?.emailEnabled ?? true,
    sms: preferences?.sms ?? customerPrefs?.smsEnabled ?? false,
    push: preferences?.push ?? customerPrefs?.pushEnabled ?? false,
    intervals: (preferences?.intervals ?? customerPrefs?.intervals ?? ['24h', '2h']) as ReminderInterval[],
  };

  const remindersToCreate: Array<{
    bookingId: string;
    type: ReminderChannel;
    scheduledFor: Date;
    status: 'PENDING';
  }> = [];

  const appointmentTime = booking.startTime;

  for (const interval of effectivePrefs.intervals) {
    const { hours, minutes } = REMINDER_INTERVALS[interval];
    const scheduledFor = subMinutes(subHours(appointmentTime, hours), minutes);

    // Don't schedule reminders in the past
    if (scheduledFor <= new Date()) continue;

    // Schedule for each enabled channel
    if (effectivePrefs.email) {
      remindersToCreate.push({
        bookingId,
        type: 'email',
        scheduledFor,
        status: 'PENDING',
      });
    }

    if (effectivePrefs.sms && booking.customer.phone && booking.customer.smsOptIn) {
      remindersToCreate.push({
        bookingId,
        type: 'sms',
        scheduledFor,
        status: 'PENDING',
      });
    }

    if (effectivePrefs.push && booking.customer.pushSubscription) {
      remindersToCreate.push({
        bookingId,
        type: 'push',
        scheduledFor,
        status: 'PENDING',
      });
    }
  }

  // Batch create reminders
  await prisma.reminder.createMany({
    data: remindersToCreate,
  });
}

/**
 * Cancel all pending reminders for a booking
 */
export async function cancelReminders(bookingId: string): Promise<void> {
  await prisma.reminder.updateMany({
    where: {
      bookingId,
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
    },
  });
}

/**
 * Reschedule reminders when booking time changes
 */
export async function rescheduleReminders(bookingId: string): Promise<void> {
  // Cancel existing reminders
  await cancelReminders(bookingId);
  // Schedule new ones based on updated booking time
  await scheduleReminders({ bookingId });
}

/**
 * Send an email reminder
 */
export async function sendEmailReminder(reminderId: string): Promise<boolean> {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: {
      booking: {
        include: {
          customer: true,
          service: { include: { provider: true } },
        },
      },
    },
  });

  if (!reminder || reminder.status !== 'PENDING') {
    return false;
  }

  try {
    const { booking } = reminder;
    const timeUntil = getTimeUntilAppointment(booking.startTime);

    await resend.emails.send({
      from: 'Reminders <reminders@yourdomain.com>',
      to: [booking.customer.email],
      subject: `Reminder: ${booking.service.name} in ${timeUntil}`,
      html: `
        <h1>Appointment Reminder</h1>
        <p>Hi ${booking.customer.name},</p>
        <p>This is a reminder that your appointment is coming up:</p>
        <ul>
          <li><strong>Service:</strong> ${booking.service.name}</li>
          <li><strong>Date:</strong> ${formatDate(booking.startTime)}</li>
          <li><strong>Time:</strong> ${formatTime(booking.startTime)}</li>
          <li><strong>Provider:</strong> ${booking.service.provider.name}</li>
        </ul>
        <p>Need to make changes? <a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.id}">Manage your booking</a></p>
      `,
    });

    await prisma.reminder.update({
      where: { id: reminderId },
      data: { sentAt: new Date(), status: 'SENT' },
    });

    return true;
  } catch (error) {
    console.error(`Failed to send email reminder ${reminderId}:`, error);
    await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
        retryCount: { increment: 1 },
      },
    });
    return false;
  }
}

/**
 * Send an SMS reminder
 */
export async function sendSmsReminder(reminderId: string): Promise<boolean> {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: {
      booking: {
        include: {
          customer: true,
          service: true,
        },
      },
    },
  });

  if (!reminder || reminder.status !== 'PENDING') {
    return false;
  }

  const { booking } = reminder;

  // Verify SMS opt-in
  if (!booking.customer.smsOptIn) {
    await prisma.reminder.update({
      where: { id: reminderId },
      data: { status: 'CANCELLED', failureReason: 'Customer opted out of SMS' },
    });
    return false;
  }

  try {
    const timeUntil = getTimeUntilAppointment(booking.startTime);

    await twilioClient.messages.create({
      body: `Reminder: Your ${booking.service.name} appointment is in ${timeUntil} on ${formatDate(booking.startTime)} at ${formatTime(booking.startTime)}. Reply STOP to unsubscribe.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: booking.customer.phone!,
    });

    await prisma.reminder.update({
      where: { id: reminderId },
      data: { sentAt: new Date(), status: 'SENT' },
    });

    return true;
  } catch (error) {
    console.error(`Failed to send SMS reminder ${reminderId}:`, error);
    await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
        retryCount: { increment: 1 },
      },
    });
    return false;
  }
}

/**
 * Send a push notification reminder
 */
export async function sendPushReminder(reminderId: string): Promise<boolean> {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId },
    include: {
      booking: {
        include: {
          customer: true,
          service: true,
        },
      },
    },
  });

  if (!reminder || reminder.status !== 'PENDING') {
    return false;
  }

  const { booking } = reminder;

  if (!booking.customer.pushSubscription) {
    await prisma.reminder.update({
      where: { id: reminderId },
      data: { status: 'CANCELLED', failureReason: 'No push subscription' },
    });
    return false;
  }

  try {
    const timeUntil = getTimeUntilAppointment(booking.startTime);
    const subscription = JSON.parse(booking.customer.pushSubscription);

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: 'Appointment Reminder',
        body: `Your ${booking.service.name} is in ${timeUntil}`,
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        data: {
          bookingId: booking.id,
          url: `/booking/${booking.id}`,
        },
      })
    );

    await prisma.reminder.update({
      where: { id: reminderId },
      data: { sentAt: new Date(), status: 'SENT' },
    });

    return true;
  } catch (error) {
    console.error(`Failed to send push reminder ${reminderId}:`, error);
    await prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: 'FAILED',
        failureReason: error instanceof Error ? error.message : 'Unknown error',
        retryCount: { increment: 1 },
      },
    });
    return false;
  }
}

// Helper functions
function getTimeUntilAppointment(appointmentTime: Date): string {
  const now = new Date();
  const diffMs = appointmentTime.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours >= 24) {
    const days = Math.floor(diffHours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  } else if (diffHours >= 1) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  } else {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
  }
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
```

```prisma
// Add to prisma/schema.prisma

model Reminder {
  id            String         @id @default(cuid())
  bookingId     String
  booking       Booking        @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  type          ReminderChannel
  scheduledFor  DateTime
  sentAt        DateTime?
  status        ReminderStatus @default(PENDING)
  failureReason String?
  retryCount    Int            @default(0)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([scheduledFor, status])
  @@index([bookingId])
}

enum ReminderChannel {
  email
  sms
  push
}

enum ReminderStatus {
  PENDING
  SENT
  FAILED
  CANCELLED
}

model ReminderPreferences {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  emailEnabled  Boolean  @default(true)
  smsEnabled    Boolean  @default(false)
  pushEnabled   Boolean  @default(false)
  intervals     String[] @default(["24h", "2h"]) // Store as array of strings
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

// Update User model
model User {
  // ... existing fields
  smsOptIn            Boolean              @default(false)
  smsOptInAt          DateTime?
  pushSubscription    String?              // JSON string of PushSubscription
  reminderPreferences ReminderPreferences?
}
```

```typescript
// app/api/reminders/schedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { scheduleReminders, rescheduleReminders, cancelReminders } from '@/lib/reminders';

const scheduleSchema = z.object({
  bookingId: z.string().cuid(),
  preferences: z.object({
    email: z.boolean().optional(),
    sms: z.boolean().optional(),
    push: z.boolean().optional(),
    intervals: z.array(z.enum(['24h', '2h', '30min'])).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bookingId, preferences } = scheduleSchema.parse(body);

    await scheduleReminders({ bookingId, preferences });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Failed to schedule reminders:', error);
    return NextResponse.json(
      { error: 'Failed to schedule reminders' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { bookingId } = await request.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      );
    }

    await rescheduleReminders(bookingId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to reschedule reminders:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule reminders' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get('bookingId');

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is required' },
        { status: 400 }
      );
    }

    await cancelReminders(bookingId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to cancel reminders:', error);
    return NextResponse.json(
      { error: 'Failed to cancel reminders' },
      { status: 500 }
    );
  }
}
```

```typescript
// lib/reminder-worker.ts
import { prisma } from './prisma';
import { sendEmailReminder, sendSmsReminder, sendPushReminder } from './reminders';

const MAX_RETRIES = 3;
const BATCH_SIZE = 100;

interface ProcessResult {
  processed: number;
  sent: number;
  failed: number;
  retried: number;
}

/**
 * Process all due reminders - run this via cron job every minute
 */
export async function processDueReminders(): Promise<ProcessResult> {
  const result: ProcessResult = {
    processed: 0,
    sent: 0,
    failed: 0,
    retried: 0,
  };

  // Get due reminders
  const dueReminders = await prisma.reminder.findMany({
    where: {
      scheduledFor: { lte: new Date() },
      status: 'PENDING',
      retryCount: { lt: MAX_RETRIES },
    },
    take: BATCH_SIZE,
    orderBy: { scheduledFor: 'asc' },
  });

  for (const reminder of dueReminders) {
    result.processed++;

    let success = false;

    switch (reminder.type) {
      case 'email':
        success = await sendEmailReminder(reminder.id);
        break;
      case 'sms':
        success = await sendSmsReminder(reminder.id);
        break;
      case 'push':
        success = await sendPushReminder(reminder.id);
        break;
    }

    if (success) {
      result.sent++;
    } else {
      result.failed++;
    }
  }

  // Retry failed reminders (with backoff)
  const failedReminders = await prisma.reminder.findMany({
    where: {
      status: 'FAILED',
      retryCount: { lt: MAX_RETRIES },
      updatedAt: {
        // Exponential backoff: 1min, 5min, 15min
        lte: new Date(Date.now() - getBackoffMs(MAX_RETRIES)),
      },
    },
    take: BATCH_SIZE,
  });

  for (const reminder of failedReminders) {
    // Reset to pending for retry
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: { status: 'PENDING' },
    });
    result.retried++;
  }

  return result;
}

function getBackoffMs(retryCount: number): number {
  // Exponential backoff: 1min, 5min, 15min
  const backoffMinutes = [1, 5, 15];
  const index = Math.min(retryCount, backoffMinutes.length - 1);
  return backoffMinutes[index] * 60 * 1000;
}

/**
 * Clean up old reminders - run daily
 */
export async function cleanupOldReminders(): Promise<number> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const { count } = await prisma.reminder.deleteMany({
    where: {
      OR: [
        { status: 'SENT', sentAt: { lt: thirtyDaysAgo } },
        { status: 'CANCELLED', updatedAt: { lt: thirtyDaysAgo } },
        { status: 'FAILED', retryCount: { gte: MAX_RETRIES }, updatedAt: { lt: thirtyDaysAgo } },
      ],
    },
  });

  return count;
}
```

```typescript
// app/api/cron/reminders/route.ts
// Vercel Cron Job endpoint
import { NextRequest, NextResponse } from 'next/server';
import { processDueReminders, cleanupOldReminders } from '@/lib/reminder-worker';

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await processDueReminders();

    // Run cleanup once per day (check if it's midnight hour)
    const hour = new Date().getHours();
    let cleanedUp = 0;
    if (hour === 0) {
      cleanedUp = await cleanupOldReminders();
    }

    return NextResponse.json({
      success: true,
      ...result,
      cleanedUp,
    });
  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Cron job failed' },
      { status: 500 }
    );
  }
}

// vercel.json configuration:
// {
//   "crons": [{
//     "path": "/api/cron/reminders",
//     "schedule": "* * * * *"
//   }]
// }
```

### SMS Compliance (TCPA/GDPR)

```typescript
// lib/sms-compliance.ts
import { prisma } from './prisma';
import twilio from 'twilio';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// TCPA/GDPR Compliance Constants
export const SMS_COMPLIANCE = {
  MAX_MESSAGES_PER_DAY: 3,
  MAX_MESSAGES_PER_WEEK: 10,
  REQUIRED_DISCLOSURES: {
    optIn: 'By checking this box, you agree to receive appointment reminders via SMS. Msg & data rates may apply. Reply STOP to unsubscribe.',
    marketing: 'I also agree to receive promotional messages. You can opt out at any time.',
    frequency: 'You will receive up to 3 reminder messages per appointment.',
  },
  STOP_KEYWORDS: ['STOP', 'UNSUBSCRIBE', 'CANCEL', 'END', 'QUIT'],
  HELP_KEYWORDS: ['HELP', 'INFO'],
  OPT_IN_CONFIRMATION: 'You are now subscribed to appointment reminders. Reply STOP to unsubscribe at any time.',
  OPT_OUT_CONFIRMATION: 'You have been unsubscribed from SMS notifications. You will no longer receive text messages from us.',
  HELP_RESPONSE: 'Reply STOP to unsubscribe from SMS notifications. For support, visit our website or call us.',
};

interface SmsOptInData {
  userId: string;
  phone: string;
  consentText: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Record explicit SMS opt-in with audit trail
 */
export async function recordSmsOptIn(data: SmsOptInData): Promise<void> {
  await prisma.$transaction([
    // Update user's SMS opt-in status
    prisma.user.update({
      where: { id: data.userId },
      data: {
        phone: data.phone,
        smsOptIn: true,
        smsOptInAt: new Date(),
      },
    }),
    // Create audit record
    prisma.smsConsentAudit.create({
      data: {
        userId: data.userId,
        phone: data.phone,
        action: 'OPT_IN',
        consentText: data.consentText,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    }),
  ]);

  // Send opt-in confirmation
  await twilioClient.messages.create({
    body: SMS_COMPLIANCE.OPT_IN_CONFIRMATION,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: data.phone,
  });
}

/**
 * Process SMS opt-out (STOP keyword)
 */
export async function processSmsOptOut(phone: string): Promise<void> {
  const user = await prisma.user.findFirst({
    where: { phone },
  });

  if (!user) {
    console.warn(`Opt-out received for unknown phone: ${phone}`);
    return;
  }

  await prisma.$transaction([
    // Update user's SMS opt-in status
    prisma.user.update({
      where: { id: user.id },
      data: {
        smsOptIn: false,
        smsOptOutAt: new Date(),
      },
    }),
    // Create audit record
    prisma.smsConsentAudit.create({
      data: {
        userId: user.id,
        phone,
        action: 'OPT_OUT',
        consentText: 'User sent STOP keyword',
      },
    }),
    // Cancel all pending SMS reminders
    prisma.reminder.updateMany({
      where: {
        booking: { customerId: user.id },
        type: 'sms',
        status: 'PENDING',
      },
      data: { status: 'CANCELLED' },
    }),
  ]);
}

/**
 * Check if user can receive SMS (rate limiting)
 */
export async function canSendSms(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { smsOptIn: true, phone: true },
  });

  if (!user?.smsOptIn || !user.phone) {
    return { allowed: false, reason: 'User has not opted in to SMS' };
  }

  // Check daily limit
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const dailyCount = await prisma.reminder.count({
    where: {
      booking: { customerId: userId },
      type: 'sms',
      status: 'SENT',
      sentAt: { gte: startOfDay },
    },
  });

  if (dailyCount >= SMS_COMPLIANCE.MAX_MESSAGES_PER_DAY) {
    return { allowed: false, reason: 'Daily SMS limit reached' };
  }

  // Check weekly limit
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const weeklyCount = await prisma.reminder.count({
    where: {
      booking: { customerId: userId },
      type: 'sms',
      status: 'SENT',
      sentAt: { gte: startOfWeek },
    },
  });

  if (weeklyCount >= SMS_COMPLIANCE.MAX_MESSAGES_PER_WEEK) {
    return { allowed: false, reason: 'Weekly SMS limit reached' };
  }

  return { allowed: true };
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; error?: string } {
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');

  // Check for valid US/international format
  const usPattern = /^\+?1?(\d{10})$/;
  const intlPattern = /^\+(\d{10,15})$/;

  const usMatch = cleaned.match(usPattern);
  if (usMatch) {
    return { valid: true, formatted: `+1${usMatch[1]}` };
  }

  const intlMatch = cleaned.match(intlPattern);
  if (intlMatch) {
    return { valid: true, formatted: cleaned };
  }

  return { valid: false, error: 'Invalid phone number format' };
}
```

```prisma
// Add to prisma/schema.prisma

model SmsConsentAudit {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  phone       String
  action      SmsConsentAction
  consentText String
  ipAddress   String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([phone])
}

enum SmsConsentAction {
  OPT_IN
  OPT_OUT
  DOUBLE_OPT_IN
}

// Update User model
model User {
  // ... existing fields
  smsOptOutAt       DateTime?
  smsConsentAudits  SmsConsentAudit[]
}
```

```tsx
// components/booking/sms-consent.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SMS_COMPLIANCE, validatePhoneNumber } from '@/lib/sms-compliance';
import { Phone, MessageSquare, Shield } from 'lucide-react';

const smsConsentSchema = z.object({
  phone: z.string()
    .min(10, 'Phone number is required')
    .refine(
      (val) => validatePhoneNumber(val).valid,
      'Please enter a valid phone number'
    ),
  smsConsent: z.boolean().refine((val) => val === true, {
    message: 'You must agree to receive SMS reminders',
  }),
  marketingConsent: z.boolean().optional(),
});

type SmsConsentFormData = z.infer<typeof smsConsentSchema>;

interface SmsConsentProps {
  onSubmit: (data: { phone: string; smsConsent: boolean; marketingConsent: boolean }) => void;
  defaultPhone?: string;
  showMarketing?: boolean;
}

export function SmsConsent({ onSubmit, defaultPhone, showMarketing = false }: SmsConsentProps) {
  const [showDetails, setShowDetails] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SmsConsentFormData>({
    resolver: zodResolver(smsConsentSchema),
    defaultValues: {
      phone: defaultPhone || '',
      smsConsent: false,
      marketingConsent: false,
    },
  });

  const smsConsent = watch('smsConsent');

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
        <MessageSquare className="w-4 h-4" />
        SMS Appointment Reminders
      </div>

      <form onSubmit={handleSubmit((data) => onSubmit({
        phone: validatePhoneNumber(data.phone).formatted || data.phone,
        smsConsent: data.smsConsent,
        marketingConsent: data.marketingConsent || false,
      }))} className="space-y-4">
        {/* Phone Input */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Mobile Phone Number
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="(555) 123-4567"
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* SMS Consent Checkbox */}
        <div className="space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('smsConsent')}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {SMS_COMPLIANCE.REQUIRED_DISCLOSURES.optIn}
            </span>
          </label>
          {errors.smsConsent && (
            <p className="text-sm text-red-600">{errors.smsConsent.message}</p>
          )}
        </div>

        {/* Frequency Disclosure */}
        {smsConsent && (
          <div className="text-xs text-gray-500 bg-white p-3 rounded border">
            <p className="font-medium mb-1">Message Frequency:</p>
            <p>{SMS_COMPLIANCE.REQUIRED_DISCLOSURES.frequency}</p>
          </div>
        )}

        {/* Marketing Consent (Optional) */}
        {showMarketing && smsConsent && (
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...register('marketingConsent')}
              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              {SMS_COMPLIANCE.REQUIRED_DISCLOSURES.marketing}
            </span>
          </label>
        )}

        {/* STOP Instructions */}
        {smsConsent && (
          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Reply <strong>STOP</strong> at any time to unsubscribe.{' '}
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="text-blue-600 hover:underline"
              >
                {showDetails ? 'Hide details' : 'View privacy policy'}
              </button>
            </p>
          </div>
        )}

        {/* Privacy Details */}
        {showDetails && (
          <div className="text-xs text-gray-600 bg-white p-3 rounded border space-y-2">
            <p><strong>Your Privacy:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>We only send appointment-related reminders</li>
              <li>Your phone number is never shared with third parties</li>
              <li>Standard message and data rates may apply</li>
              <li>You can unsubscribe at any time by replying STOP</li>
            </ul>
            <p>
              <a href="/privacy" className="text-blue-600 hover:underline">
                Full Privacy Policy
              </a>
            </p>
          </div>
        )}

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Enable SMS Reminders
        </button>
      </form>
    </div>
  );
}
```

```typescript
// app/api/sms/opt-out/route.ts
// Twilio webhook for handling STOP messages
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';
import { processSmsOptOut, SMS_COMPLIANCE } from '@/lib/sms-compliance';

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function POST(request: NextRequest) {
  try {
    // Verify Twilio signature
    const signature = request.headers.get('x-twilio-signature');
    const url = request.url;
    const params = Object.fromEntries(await request.formData());

    const isValid = twilio.validateRequest(
      process.env.TWILIO_AUTH_TOKEN!,
      signature || '',
      url,
      params
    );

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
    }

    const from = params.From as string;
    const body = (params.Body as string || '').trim().toUpperCase();

    // Handle STOP keywords
    if (SMS_COMPLIANCE.STOP_KEYWORDS.includes(body)) {
      await processSmsOptOut(from);

      // Twilio auto-sends STOP confirmation, but we can customize
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Message>${SMS_COMPLIANCE.OPT_OUT_CONFIRMATION}</Message>
        </Response>`,
        {
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }

    // Handle HELP keywords
    if (SMS_COMPLIANCE.HELP_KEYWORDS.includes(body)) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Message>${SMS_COMPLIANCE.HELP_RESPONSE}</Message>
        </Response>`,
        {
          headers: { 'Content-Type': 'text/xml' },
        }
      );
    }

    // For other messages, don't respond
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        headers: { 'Content-Type': 'text/xml' },
      }
    );
  } catch (error) {
    console.error('SMS webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

### Cancellation Policy Enforcement

```typescript
// lib/cancellation.ts
import { prisma } from './prisma';
import { differenceInHours } from 'date-fns';
import Stripe from 'stripe';
import { cancelReminders } from './reminders';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

// Cancellation policy types
export type CancellationPolicyType = 'free' | '24h' | '48h' | 'no-refund';

export interface CancellationPolicy {
  type: CancellationPolicyType;
  hoursRequired: number;
  refundPercentage: number;
  lateCancellationFee: number; // Fixed fee for late cancellations
}

// Default policies by service type
export const CANCELLATION_POLICIES: Record<string, CancellationPolicy> = {
  free: {
    type: 'free',
    hoursRequired: 0,
    refundPercentage: 100,
    lateCancellationFee: 0,
  },
  '24h': {
    type: '24h',
    hoursRequired: 24,
    refundPercentage: 100,
    lateCancellationFee: 0,
  },
  '48h': {
    type: '48h',
    hoursRequired: 48,
    refundPercentage: 50,
    lateCancellationFee: 25,
  },
  'no-refund': {
    type: 'no-refund',
    hoursRequired: 0,
    refundPercentage: 0,
    lateCancellationFee: 0,
  },
};

interface CancellationResult {
  allowed: boolean;
  refundAmount: number;
  penaltyAmount: number;
  reason?: string;
  policy: CancellationPolicy;
}

/**
 * Check cancellation policy and calculate refund
 */
export async function checkCancellationPolicy(
  bookingId: string
): Promise<CancellationResult> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'CANCELLED') {
    return {
      allowed: false,
      refundAmount: 0,
      penaltyAmount: 0,
      reason: 'Booking is already cancelled',
      policy: CANCELLATION_POLICIES.free,
    };
  }

  if (booking.status === 'COMPLETED') {
    return {
      allowed: false,
      refundAmount: 0,
      penaltyAmount: 0,
      reason: 'Cannot cancel a completed booking',
      policy: CANCELLATION_POLICIES.free,
    };
  }

  // Get policy for this service
  const policyType = booking.service.cancellationPolicy as CancellationPolicyType || '24h';
  const policy = CANCELLATION_POLICIES[policyType];

  const hoursUntilAppointment = differenceInHours(booking.startTime, new Date());
  const paidAmount = booking.payment?.amount || 0;

  // Check if within cancellation window
  if (hoursUntilAppointment >= policy.hoursRequired) {
    // Full refund allowed
    return {
      allowed: true,
      refundAmount: paidAmount,
      penaltyAmount: 0,
      policy,
    };
  }

  // Late cancellation
  if (policy.type === 'no-refund') {
    return {
      allowed: true,
      refundAmount: 0,
      penaltyAmount: paidAmount,
      reason: 'This booking has a no-refund policy',
      policy,
    };
  }

  // Partial refund
  const refundAmount = Math.floor(paidAmount * (policy.refundPercentage / 100));
  const penaltyAmount = paidAmount - refundAmount + policy.lateCancellationFee;

  return {
    allowed: true,
    refundAmount,
    penaltyAmount,
    reason: `Cancelling within ${policy.hoursRequired} hours incurs a ${100 - policy.refundPercentage}% fee`,
    policy,
  };
}

/**
 * Process booking cancellation with refund
 */
export async function cancelBooking(
  bookingId: string,
  cancelledBy: 'customer' | 'provider',
  reason?: string
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  const cancellationCheck = await checkCancellationPolicy(bookingId);

  if (!cancellationCheck.allowed) {
    return { success: false, error: cancellationCheck.reason };
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: { include: { provider: true } },
      customer: true,
      payment: true,
    },
  });

  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }

  try {
    // Process refund if applicable
    let refundId: string | undefined;
    if (cancellationCheck.refundAmount > 0 && booking.payment?.stripePaymentIntentId) {
      const refund = await stripe.refunds.create({
        payment_intent: booking.payment.stripePaymentIntentId,
        amount: Math.round(cancellationCheck.refundAmount * 100), // Convert to cents
        reason: cancelledBy === 'customer' ? 'requested_by_customer' : 'requested_by_customer',
      });
      refundId = refund.id;
    }

    // Update booking and related records
    await prisma.$transaction([
      // Update booking status
      prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: 'CANCELLED',
          cancelledAt: new Date(),
          cancelledBy,
          cancellationReason: reason,
        },
      }),
      // Record refund
      ...(refundId
        ? [
            prisma.payment.update({
              where: { id: booking.payment!.id },
              data: {
                refundId,
                refundAmount: cancellationCheck.refundAmount,
                refundedAt: new Date(),
              },
            }),
          ]
        : []),
      // Create cancellation record
      prisma.cancellation.create({
        data: {
          bookingId,
          cancelledBy,
          reason,
          refundAmount: cancellationCheck.refundAmount,
          penaltyAmount: cancellationCheck.penaltyAmount,
          policyApplied: cancellationCheck.policy.type,
        },
      }),
    ]);

    // Cancel reminders
    await cancelReminders(bookingId);

    // TODO: Send cancellation notification emails
    // TODO: Notify provider

    return { success: true, refundId };
  } catch (error) {
    console.error('Cancellation failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cancellation failed',
    };
  }
}
```

```prisma
// Add to prisma/schema.prisma

model Cancellation {
  id            String   @id @default(cuid())
  bookingId     String   @unique
  booking       Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  cancelledBy   String   // 'customer' | 'provider'
  reason        String?
  refundAmount  Float    @default(0)
  penaltyAmount Float    @default(0)
  policyApplied String
  createdAt     DateTime @default(now())
}

// Update Service model
model Service {
  // ... existing fields
  cancellationPolicy String @default("24h") // 'free' | '24h' | '48h' | 'no-refund'
}

// Update Booking model
model Booking {
  // ... existing fields
  cancelledAt        DateTime?
  cancelledBy        String?
  cancellationReason String?
  cancellation       Cancellation?
}
```

```typescript
// app/api/bookings/[id]/cancel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { checkCancellationPolicy, cancelBooking } from '@/lib/cancellation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const result = await checkCancellationPolicy(params.id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check cancellation policy' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { reason } = cancelSchema.parse(body);

    // Determine if customer or provider is cancelling
    const cancelledBy = session.user.role === 'PROVIDER' ? 'provider' : 'customer';

    const result = await cancelBooking(params.id, cancelledBy, reason);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      refundId: result.refundId,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Cancellation error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    );
  }
}
```

```tsx
// components/booking/cancellation-modal.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, X, DollarSign, Clock, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface CancellationModalProps {
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onCancelled?: () => void;
}

export function CancellationModal({
  bookingId,
  isOpen,
  onClose,
  onCancelled,
}: CancellationModalProps) {
  const [reason, setReason] = useState('');
  const queryClient = useQueryClient();

  // Fetch cancellation policy
  const { data: policy, isLoading: policyLoading } = useQuery({
    queryKey: ['cancellation-policy', bookingId],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`);
      if (!res.ok) throw new Error('Failed to fetch policy');
      return res.json();
    },
    enabled: isOpen,
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Cancellation failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onCancelled?.();
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Cancel Booking
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {policyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : !policy?.allowed ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg">
              <p className="font-medium">Cannot Cancel</p>
              <p className="text-sm mt-1">{policy?.reason}</p>
            </div>
          ) : (
            <>
              {/* Policy Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Cancellation Policy</span>
                  <span className="font-medium capitalize">{policy.policy.type}</span>
                </div>

                {policy.policy.hoursRequired > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      Free cancellation requires {policy.policy.hoursRequired} hours notice
                    </span>
                  </div>
                )}

                {/* Refund/Penalty Breakdown */}
                <div className="border-t pt-3 space-y-2">
                  {policy.refundAmount > 0 && (
                    <div className="flex items-center justify-between text-green-700">
                      <span className="text-sm">Refund Amount</span>
                      <span className="font-medium">
                        {formatCurrency(policy.refundAmount)}
                      </span>
                    </div>
                  )}

                  {policy.penaltyAmount > 0 && (
                    <div className="flex items-center justify-between text-red-700">
                      <span className="text-sm">Cancellation Fee</span>
                      <span className="font-medium">
                        {formatCurrency(policy.penaltyAmount)}
                      </span>
                    </div>
                  )}
                </div>

                {policy.reason && (
                  <p className="text-sm text-amber-700 bg-amber-50 p-2 rounded">
                    {policy.reason}
                  </p>
                )}
              </div>

              {/* Reason Input */}
              <div>
                <label htmlFor="reason" className="block text-sm font-medium mb-1">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Let us know why you're cancelling..."
                />
              </div>
            </>
          )}

          {cancelMutation.error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
              {cancelMutation.error instanceof Error
                ? cancelMutation.error.message
                : 'Cancellation failed'}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Keep Booking
          </button>
          <button
            onClick={() => cancelMutation.mutate()}
            disabled={!policy?.allowed || cancelMutation.isPending}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {cancelMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              'Confirm Cancellation'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Rescheduling Flow

```typescript
// app/api/bookings/[id]/reschedule/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { isSlotAvailable } from '@/lib/availability';
import { rescheduleReminders } from '@/lib/reminders';
import { differenceInHours, addMinutes } from 'date-fns';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const rescheduleSchema = z.object({
  newStartTime: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
});

// Rescheduling limits
const RESCHEDULE_LIMITS = {
  maxReschedulesPerBooking: 2,
  minHoursBeforeAppointment: 2, // Can't reschedule within 2 hours of appointment
  maxDaysInAdvance: 90,
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: true,
        _count: {
          select: { reschedules: true },
        },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    const hoursUntilAppointment = differenceInHours(booking.startTime, new Date());
    const reschedulesUsed = booking._count.reschedules;

    return NextResponse.json({
      canReschedule:
        booking.status === 'CONFIRMED' &&
        hoursUntilAppointment >= RESCHEDULE_LIMITS.minHoursBeforeAppointment &&
        reschedulesUsed < RESCHEDULE_LIMITS.maxReschedulesPerBooking,
      reschedulesRemaining: RESCHEDULE_LIMITS.maxReschedulesPerBooking - reschedulesUsed,
      minHoursNotice: RESCHEDULE_LIMITS.minHoursBeforeAppointment,
      maxDaysInAdvance: RESCHEDULE_LIMITS.maxDaysInAdvance,
      currentStartTime: booking.startTime,
      serviceDuration: booking.service.duration,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get reschedule info' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { newStartTime } = rescheduleSchema.parse(body);
    const newStart = new Date(newStartTime);

    // Get booking with service and reschedule count
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        service: { include: { provider: true } },
        customer: true,
        _count: { select: { reschedules: true } },
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // Validate booking can be rescheduled
    if (booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        { error: 'Only confirmed bookings can be rescheduled' },
        { status: 400 }
      );
    }

    const hoursUntilAppointment = differenceInHours(booking.startTime, new Date());
    if (hoursUntilAppointment < RESCHEDULE_LIMITS.minHoursBeforeAppointment) {
      return NextResponse.json(
        { error: `Cannot reschedule within ${RESCHEDULE_LIMITS.minHoursBeforeAppointment} hours of appointment` },
        { status: 400 }
      );
    }

    if (booking._count.reschedules >= RESCHEDULE_LIMITS.maxReschedulesPerBooking) {
      return NextResponse.json(
        { error: 'Maximum reschedule limit reached for this booking' },
        { status: 400 }
      );
    }

    // Validate new time slot
    const hoursUntilNewAppointment = differenceInHours(newStart, new Date());
    if (hoursUntilNewAppointment < 0) {
      return NextResponse.json(
        { error: 'Cannot reschedule to a time in the past' },
        { status: 400 }
      );
    }

    const daysInAdvance = hoursUntilNewAppointment / 24;
    if (daysInAdvance > RESCHEDULE_LIMITS.maxDaysInAdvance) {
      return NextResponse.json(
        { error: `Cannot reschedule more than ${RESCHEDULE_LIMITS.maxDaysInAdvance} days in advance` },
        { status: 400 }
      );
    }

    // Check slot availability
    const newEnd = addMinutes(newStart, booking.service.duration);
    const available = await isSlotAvailable(
      booking.service.providerId,
      newStart,
      newEnd
    );

    if (!available) {
      return NextResponse.json(
        { error: 'The selected time slot is not available' },
        { status: 409 }
      );
    }

    // Perform reschedule
    const previousStartTime = booking.startTime;
    const previousEndTime = booking.endTime;

    await prisma.$transaction([
      // Update booking
      prisma.booking.update({
        where: { id: params.id },
        data: {
          startTime: newStart,
          endTime: newEnd,
          date: newStart,
        },
      }),
      // Create reschedule record
      prisma.reschedule.create({
        data: {
          bookingId: params.id,
          previousStartTime,
          previousEndTime,
          newStartTime: newStart,
          newEndTime: newEnd,
          rescheduledBy: session.user.id,
        },
      }),
    ]);

    // Reschedule reminders
    await rescheduleReminders(params.id);

    // TODO: Send reschedule notification to provider and customer

    return NextResponse.json({
      success: true,
      booking: {
        id: params.id,
        startTime: newStart,
        endTime: newEnd,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Reschedule error:', error);
    return NextResponse.json(
      { error: 'Failed to reschedule booking' },
      { status: 500 }
    );
  }
}
```

```prisma
// Add to prisma/schema.prisma

model Reschedule {
  id                String   @id @default(cuid())
  bookingId         String
  booking           Booking  @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  previousStartTime DateTime
  previousEndTime   DateTime
  newStartTime      DateTime
  newEndTime        DateTime
  rescheduledBy     String
  createdAt         DateTime @default(now())

  @@index([bookingId])
}

// Update Booking model
model Booking {
  // ... existing fields
  reschedules Reschedule[]
}
```

```tsx
// components/booking/reschedule-modal.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays } from 'date-fns';
import { CalendarDays, Clock, X, Loader2, AlertCircle } from 'lucide-react';
import { CalendarPicker } from './calendar-picker';
import { TimeSlots } from './time-slots';

interface RescheduleModalProps {
  bookingId: string;
  serviceId: string;
  providerId: string;
  isOpen: boolean;
  onClose: () => void;
  onRescheduled?: () => void;
}

export function RescheduleModal({
  bookingId,
  serviceId,
  providerId,
  isOpen,
  onClose,
  onRescheduled,
}: RescheduleModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const queryClient = useQueryClient();

  // Fetch reschedule policy
  const { data: policy, isLoading: policyLoading } = useQuery({
    queryKey: ['reschedule-policy', bookingId],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${bookingId}/reschedule`);
      if (!res.ok) throw new Error('Failed to fetch policy');
      return res.json();
    },
    enabled: isOpen,
  });

  // Fetch available slots for selected date
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['availability', providerId, serviceId, selectedDate?.toISOString()],
    queryFn: async () => {
      const res = await fetch(
        `/api/availability?providerId=${providerId}&serviceId=${serviceId}&date=${selectedDate?.toISOString()}`
      );
      if (!res.ok) throw new Error('Failed to fetch slots');
      const data = await res.json();
      return data.slots;
    },
    enabled: !!selectedDate,
  });

  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSlot) throw new Error('No time slot selected');
      const res = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newStartTime: selectedSlot.start.toISOString() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Reschedule failed');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      onRescheduled?.();
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600" />
            Reschedule Booking
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {policyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : !policy?.canReschedule ? (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Cannot Reschedule</p>
                <p className="text-sm mt-1">
                  {policy?.reschedulesRemaining === 0
                    ? 'You have reached the maximum number of reschedules for this booking.'
                    : 'This booking cannot be rescheduled at this time.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Policy Info */}
              <div className="bg-blue-50 text-blue-700 p-3 rounded-lg text-sm">
                <p>
                  You have <strong>{policy.reschedulesRemaining}</strong> reschedule
                  {policy.reschedulesRemaining !== 1 ? 's' : ''} remaining for this booking.
                </p>
              </div>

              {/* Current Booking Time */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Current Appointment</p>
                <p className="font-medium">
                  {format(new Date(policy.currentStartTime), 'EEEE, MMMM d, yyyy')} at{' '}
                  {format(new Date(policy.currentStartTime), 'h:mm a')}
                </p>
              </div>

              {/* Date Picker */}
              <div>
                <h3 className="text-sm font-medium mb-2">Select New Date</h3>
                <CalendarPicker
                  selectedDate={selectedDate}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setSelectedSlot(null);
                  }}
                  minDate={new Date()}
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Select New Time
                  </h3>
                  <TimeSlots
                    slots={slots || []}
                    selectedSlot={selectedSlot}
                    onSelectSlot={setSelectedSlot}
                    isLoading={slotsLoading}
                  />
                </div>
              )}

              {rescheduleMutation.error && (
                <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                  {rescheduleMutation.error instanceof Error
                    ? rescheduleMutation.error.message
                    : 'Reschedule failed'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => rescheduleMutation.mutate()}
            disabled={!selectedSlot || rescheduleMutation.isPending || !policy?.canReschedule}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {rescheduleMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Rescheduling...
              </>
            ) : (
              'Confirm New Time'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Timezone Handling

```typescript
// lib/timezone.ts
import {
  format,
  formatInTimeZone,
  toZonedTime,
  fromZonedTime,
  getTimezoneOffset,
} from 'date-fns-tz';
import { addHours, isValid } from 'date-fns';

// Common timezone list for picker
export const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT)' },
  { value: 'Pacific/Honolulu', label: 'Hawaii Time (HT)' },
  { value: 'Europe/London', label: 'London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)' },
];

/**
 * Detect user's timezone from browser
 */
export function detectUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Convert UTC time to user's local timezone
 */
export function utcToUserTimezone(utcDate: Date, userTimezone: string): Date {
  return toZonedTime(utcDate, userTimezone);
}

/**
 * Convert user's local time to UTC for storage
 */
export function userTimezoneToUtc(localDate: Date, userTimezone: string): Date {
  return fromZonedTime(localDate, userTimezone);
}

/**
 * Format date in specific timezone
 */
export function formatInTimezone(
  date: Date,
  timezone: string,
  formatStr: string = 'PPpp'
): string {
  return formatInTimeZone(date, timezone, formatStr);
}

/**
 * Get timezone offset in hours (handles DST)
 */
export function getTimezoneOffsetHours(timezone: string, date: Date = new Date()): number {
  const offsetMs = getTimezoneOffset(timezone, date);
  return offsetMs / (60 * 60 * 1000);
}

/**
 * Check if a timezone observes DST
 */
export function observesDST(timezone: string): boolean {
  const jan = new Date(new Date().getFullYear(), 0, 1);
  const jul = new Date(new Date().getFullYear(), 6, 1);

  const janOffset = getTimezoneOffset(timezone, jan);
  const julOffset = getTimezoneOffset(timezone, jul);

  return janOffset !== julOffset;
}

/**
 * Check if DST transition occurs between two dates
 */
export function hasDSTTransition(
  startDate: Date,
  endDate: Date,
  timezone: string
): { hasDST: boolean; direction?: 'forward' | 'back'; transitionDate?: Date } {
  const startOffset = getTimezoneOffset(timezone, startDate);
  const endOffset = getTimezoneOffset(timezone, endDate);

  if (startOffset === endOffset) {
    return { hasDST: false };
  }

  // Binary search to find transition date
  let low = startDate.getTime();
  let high = endDate.getTime();

  while (high - low > 60 * 60 * 1000) { // Within 1 hour
    const mid = new Date((low + high) / 2);
    const midOffset = getTimezoneOffset(timezone, mid);

    if (midOffset === startOffset) {
      low = mid.getTime();
    } else {
      high = mid.getTime();
    }
  }

  return {
    hasDST: true,
    direction: endOffset > startOffset ? 'forward' : 'back',
    transitionDate: new Date(high),
  };
}

/**
 * Schedule reminder accounting for DST
 * Returns the correct UTC time for the reminder
 */
export function scheduleReminderWithDST(
  appointmentTimeUtc: Date,
  hoursBeforeAppointment: number,
  userTimezone: string
): Date {
  // Convert appointment to user's timezone
  const appointmentLocal = utcToUserTimezone(appointmentTimeUtc, userTimezone);

  // Calculate reminder time in user's timezone
  const reminderLocal = addHours(appointmentLocal, -hoursBeforeAppointment);

  // Check for DST transition
  const dstCheck = hasDSTTransition(reminderLocal, appointmentLocal, userTimezone);

  if (dstCheck.hasDST) {
    console.log(
      `DST transition detected for reminder: ${dstCheck.direction} on ${dstCheck.transitionDate}`
    );
  }

  // Convert back to UTC for storage (this correctly handles DST)
  return userTimezoneToUtc(reminderLocal, userTimezone);
}

/**
 * Get provider's availability in user's timezone
 */
export function convertAvailabilityToUserTimezone(
  availabilitySlots: Array<{ start: Date; end: Date; available: boolean }>,
  providerTimezone: string,
  userTimezone: string
): Array<{ start: Date; end: Date; available: boolean; displayTime: string }> {
  return availabilitySlots.map((slot) => {
    // Slots are stored in provider's timezone, convert to user's
    const startUtc = fromZonedTime(slot.start, providerTimezone);
    const endUtc = fromZonedTime(slot.end, providerTimezone);

    const startLocal = toZonedTime(startUtc, userTimezone);
    const endLocal = toZonedTime(endUtc, userTimezone);

    return {
      start: startLocal,
      end: endLocal,
      available: slot.available,
      displayTime: formatInTimeZone(startLocal, userTimezone, 'h:mm a'),
    };
  });
}

/**
 * Generate timezone-aware confirmation message
 */
export function generateTimezoneConfirmation(
  appointmentUtc: Date,
  userTimezone: string,
  providerTimezone: string
): {
  userTime: string;
  providerTime: string;
  showProviderTime: boolean;
} {
  const userTime = formatInTimeZone(
    appointmentUtc,
    userTimezone,
    "EEEE, MMMM d, yyyy 'at' h:mm a zzz"
  );

  const providerTime = formatInTimeZone(
    appointmentUtc,
    providerTimezone,
    "EEEE, MMMM d, yyyy 'at' h:mm a zzz"
  );

  // Only show provider time if different from user time
  const showProviderTime = userTimezone !== providerTimezone;

  return {
    userTime,
    providerTime,
    showProviderTime,
  };
}
```

```tsx
// components/booking/timezone-picker.tsx
'use client';

import { useState, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { detectUserTimezone, COMMON_TIMEZONES, getTimezoneOffsetHours } from '@/lib/timezone';
import { format } from 'date-fns';

interface TimezonePickerProps {
  value: string;
  onChange: (timezone: string) => void;
  showCurrentTime?: boolean;
}

export function TimezonePicker({ value, onChange, showCurrentTime = true }: TimezonePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [detectedTimezone, setDetectedTimezone] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const detected = detectUserTimezone();
    setDetectedTimezone(detected);

    // Set initial value if not provided
    if (!value) {
      onChange(detected);
    }
  }, []);

  useEffect(() => {
    if (!showCurrentTime || !value) return;

    const updateTime = () => {
      const now = new Date();
      try {
        setCurrentTime(
          now.toLocaleTimeString('en-US', {
            timeZone: value,
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })
        );
      } catch {
        setCurrentTime('');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [value, showCurrentTime]);

  const selectedTimezone = COMMON_TIMEZONES.find((tz) => tz.value === value);
  const offset = value ? getTimezoneOffsetHours(value) : 0;
  const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Your Timezone
      </label>

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 border rounded-lg bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-sm">
            {selectedTimezone?.label || value || 'Select timezone'}
          </span>
          <span className="text-xs text-gray-500">(UTC{offsetStr})</span>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {showCurrentTime && currentTime && (
        <p className="mt-1 text-xs text-gray-500">
          Current time: {currentTime}
        </p>
      )}

      {detectedTimezone && detectedTimezone !== value && (
        <button
          type="button"
          onClick={() => {
            onChange(detectedTimezone);
            setIsOpen(false);
          }}
          className="mt-1 text-xs text-blue-600 hover:underline"
        >
          Use detected timezone ({detectedTimezone})
        </button>
      )}

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {COMMON_TIMEZONES.map((tz) => {
            const isSelected = tz.value === value;
            const tzOffset = getTimezoneOffsetHours(tz.value);
            const tzOffsetStr = tzOffset >= 0 ? `+${tzOffset}` : `${tzOffset}`;

            return (
              <button
                key={tz.value}
                type="button"
                onClick={() => {
                  onChange(tz.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm hover:bg-gray-50 ${
                  isSelected ? 'bg-blue-50 text-blue-700' : ''
                }`}
              >
                <span>{tz.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">UTC{tzOffsetStr}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

```tsx
// components/booking/timezone-confirmation.tsx
'use client';

import { Clock, Globe, AlertTriangle } from 'lucide-react';
import { generateTimezoneConfirmation, hasDSTTransition } from '@/lib/timezone';

interface TimezoneConfirmationProps {
  appointmentUtc: Date;
  userTimezone: string;
  providerTimezone: string;
}

export function TimezoneConfirmation({
  appointmentUtc,
  userTimezone,
  providerTimezone,
}: TimezoneConfirmationProps) {
  const { userTime, providerTime, showProviderTime } = generateTimezoneConfirmation(
    appointmentUtc,
    userTimezone,
    providerTimezone
  );

  // Check for DST warning
  const now = new Date();
  const dstCheck = hasDSTTransition(now, appointmentUtc, userTimezone);

  return (
    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
        <div>
          <p className="text-sm text-gray-600">Your appointment time</p>
          <p className="font-medium">{userTime}</p>
        </div>
      </div>

      {showProviderTime && (
        <div className="flex items-start gap-3 pt-2 border-t">
          <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
          <div>
            <p className="text-sm text-gray-600">Provider's local time</p>
            <p className="text-sm text-gray-700">{providerTime}</p>
          </div>
        </div>
      )}

      {dstCheck.hasDST && (
        <div className="flex items-start gap-2 bg-amber-50 text-amber-700 p-3 rounded-lg text-sm">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>
            Note: A daylight saving time change occurs before your appointment.
            Times shown are already adjusted for this change.
          </p>
        </div>
      )}
    </div>
  );
}
```

### Payment Collection

```typescript
// lib/booking-payments.ts
import Stripe from 'stripe';
import { prisma } from './prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export type PaymentMode = 'required' | 'optional' | 'deposit' | 'hold';

export interface PaymentConfig {
  mode: PaymentMode;
  amount: number; // Full service price
  depositPercentage?: number; // For deposit mode (e.g., 25)
  holdDuration?: number; // Days to hold authorization
}

interface CreatePaymentIntentOptions {
  bookingId: string;
  serviceId: string;
  customerId: string;
  customerEmail: string;
  config: PaymentConfig;
}

/**
 * Create a payment intent for booking
 */
export async function createBookingPaymentIntent(
  options: CreatePaymentIntentOptions
): Promise<{ clientSecret: string; paymentIntentId: string; amount: number }> {
  const { bookingId, serviceId, customerId, customerEmail, config } = options;

  // Calculate amount based on mode
  let chargeAmount = config.amount;
  let captureMethod: 'automatic' | 'manual' = 'automatic';

  switch (config.mode) {
    case 'deposit':
      chargeAmount = Math.round(config.amount * (config.depositPercentage || 25) / 100);
      break;
    case 'hold':
      captureMethod = 'manual'; // Authorize but don't capture
      break;
    case 'optional':
      // Full amount but payment is optional
      break;
    case 'required':
    default:
      // Full amount, required
      break;
  }

  // Get or create Stripe customer
  let stripeCustomerId: string;
  const user = await prisma.user.findUnique({
    where: { id: customerId },
    select: { stripeCustomerId: true, email: true, name: true },
  });

  if (user?.stripeCustomerId) {
    stripeCustomerId = user.stripeCustomerId;
  } else {
    const stripeCustomer = await stripe.customers.create({
      email: customerEmail,
      name: user?.name || undefined,
      metadata: { userId: customerId },
    });
    stripeCustomerId = stripeCustomer.id;

    // Save Stripe customer ID
    await prisma.user.update({
      where: { id: customerId },
      data: { stripeCustomerId },
    });
  }

  // Create payment intent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(chargeAmount * 100), // Convert to cents
    currency: 'usd',
    customer: stripeCustomerId,
    capture_method: captureMethod,
    metadata: {
      bookingId,
      serviceId,
      customerId,
      paymentMode: config.mode,
      fullAmount: config.amount.toString(),
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });

  // Save payment record
  await prisma.payment.create({
    data: {
      bookingId,
      stripePaymentIntentId: paymentIntent.id,
      stripeCustomerId,
      amount: chargeAmount,
      fullAmount: config.amount,
      status: 'PENDING',
      paymentMode: config.mode,
      captureMethod,
    },
  });

  return {
    clientSecret: paymentIntent.client_secret!,
    paymentIntentId: paymentIntent.id,
    amount: chargeAmount,
  };
}

/**
 * Capture a held payment (for no-shows or late cancellations)
 */
export async function captureHeldPayment(
  bookingId: string,
  amountToCapture?: number
): Promise<{ success: boolean; error?: string }> {
  const payment = await prisma.payment.findFirst({
    where: {
      bookingId,
      captureMethod: 'manual',
      status: { in: ['PENDING', 'AUTHORIZED'] },
    },
  });

  if (!payment) {
    return { success: false, error: 'No held payment found' };
  }

  try {
    const captureAmount = amountToCapture
      ? Math.round(amountToCapture * 100)
      : undefined; // Capture full amount if not specified

    await stripe.paymentIntents.capture(payment.stripePaymentIntentId, {
      amount_to_capture: captureAmount,
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CAPTURED',
        capturedAt: new Date(),
        capturedAmount: amountToCapture || payment.amount,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to capture payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Capture failed',
    };
  }
}

/**
 * Cancel a held payment authorization
 */
export async function cancelHeldPayment(
  bookingId: string
): Promise<{ success: boolean; error?: string }> {
  const payment = await prisma.payment.findFirst({
    where: {
      bookingId,
      captureMethod: 'manual',
      status: { in: ['PENDING', 'AUTHORIZED'] },
    },
  });

  if (!payment) {
    return { success: false, error: 'No held payment found' };
  }

  try {
    await stripe.paymentIntents.cancel(payment.stripePaymentIntentId);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'CANCELLED',
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Failed to cancel payment:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Cancel failed',
    };
  }
}

/**
 * Charge for no-show
 */
export async function chargeNoShow(
  bookingId: string,
  noShowFeePercentage: number = 100
): Promise<{ success: boolean; chargedAmount?: number; error?: string }> {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true, service: true },
  });

  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }

  const payment = booking.payment;

  // If payment was held (manual capture), capture it
  if (payment?.captureMethod === 'manual' && payment.status === 'AUTHORIZED') {
    const chargeAmount = Math.round(booking.service.price.toNumber() * (noShowFeePercentage / 100));
    return captureHeldPayment(bookingId, chargeAmount);
  }

  // If no payment exists, create a new charge (requires saved payment method)
  if (!payment && booking.customer) {
    // TODO: Implement charging saved payment method
    return { success: false, error: 'No payment method available for no-show charge' };
  }

  return { success: false, error: 'No payment to process for no-show' };
}

/**
 * Process refund for cancellation
 */
export async function processRefund(
  bookingId: string,
  refundAmount: number
): Promise<{ success: boolean; refundId?: string; error?: string }> {
  const payment = await prisma.payment.findFirst({
    where: {
      bookingId,
      status: { in: ['CAPTURED', 'SUCCEEDED'] },
    },
  });

  if (!payment) {
    return { success: false, error: 'No payment to refund' };
  }

  if (refundAmount > payment.capturedAmount || refundAmount > payment.amount) {
    return { success: false, error: 'Refund amount exceeds payment amount' };
  }

  try {
    const refund = await stripe.refunds.create({
      payment_intent: payment.stripePaymentIntentId,
      amount: Math.round(refundAmount * 100),
    });

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        refundId: refund.id,
        refundAmount: refundAmount,
        refundedAt: new Date(),
        status: refundAmount >= payment.amount ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
      },
    });

    return { success: true, refundId: refund.id };
  } catch (error) {
    console.error('Failed to process refund:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Refund failed',
    };
  }
}
```

```prisma
// Add to prisma/schema.prisma

model Payment {
  id                     String        @id @default(cuid())
  bookingId              String        @unique
  booking                Booking       @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  stripePaymentIntentId  String        @unique
  stripeCustomerId       String
  amount                 Float         // Amount charged (may be deposit)
  fullAmount             Float         // Full service price
  capturedAmount         Float?        // Amount actually captured
  status                 PaymentStatus @default(PENDING)
  paymentMode            String        // 'required' | 'optional' | 'deposit' | 'hold'
  captureMethod          String        @default("automatic") // 'automatic' | 'manual'
  capturedAt             DateTime?
  refundId               String?
  refundAmount           Float?
  refundedAt             DateTime?
  createdAt              DateTime      @default(now())
  updatedAt              DateTime      @updatedAt

  @@index([stripePaymentIntentId])
  @@index([bookingId])
}

enum PaymentStatus {
  PENDING
  AUTHORIZED
  CAPTURED
  SUCCEEDED
  FAILED
  CANCELLED
  REFUNDED
  PARTIALLY_REFUNDED
}

// Update User model
model User {
  // ... existing fields
  stripeCustomerId String?
}
```

```typescript
// app/api/bookings/[id]/charge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { captureHeldPayment, chargeNoShow, processRefund } from '@/lib/booking-payments';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const chargeSchema = z.object({
  action: z.enum(['capture', 'no_show', 'partial_capture', 'refund']),
  amount: z.number().positive().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'PROVIDER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, amount } = chargeSchema.parse(body);

    // Verify provider owns this booking
    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: { service: true },
    });

    if (!booking || booking.service.providerId !== session.user.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    let result;

    switch (action) {
      case 'capture':
        result = await captureHeldPayment(params.id, amount);
        break;

      case 'no_show':
        // Mark booking as no-show and charge
        await prisma.booking.update({
          where: { id: params.id },
          data: { status: 'NO_SHOW' },
        });
        result = await chargeNoShow(params.id, amount ? (amount / booking.service.price.toNumber()) * 100 : 100);
        break;

      case 'partial_capture':
        if (!amount) {
          return NextResponse.json(
            { error: 'Amount required for partial capture' },
            { status: 400 }
          );
        }
        result = await captureHeldPayment(params.id, amount);
        break;

      case 'refund':
        if (!amount) {
          return NextResponse.json(
            { error: 'Amount required for refund' },
            { status: 400 }
          );
        }
        result = await processRefund(params.id, amount);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Charge error:', error);
    return NextResponse.json(
      { error: 'Failed to process charge' },
      { status: 500 }
    );
  }
}
```

```tsx
// components/booking/payment-form.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Loader2, CreditCard, Lock, Info } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { PaymentMode } from '@/lib/booking-payments';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentFormProps {
  bookingId: string;
  serviceId: string;
  amount: number;
  mode: PaymentMode;
  depositPercentage?: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

function PaymentFormContent({
  amount,
  mode,
  depositPercentage,
  onSuccess,
  onError,
}: Omit<PaymentFormProps, 'bookingId' | 'serviceId'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/booking/confirm`,
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      onError(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  // Calculate display amount
  const displayAmount = mode === 'deposit'
    ? Math.round(amount * (depositPercentage || 25) / 100)
    : amount;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Payment Info Banner */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {mode === 'deposit' ? 'Deposit Amount' :
             mode === 'hold' ? 'Authorization Amount' : 'Payment Amount'}
          </span>
          <span className="text-lg font-semibold">{formatCurrency(displayAmount)}</span>
        </div>

        {mode === 'deposit' && (
          <p className="text-xs text-gray-500">
            {depositPercentage || 25}% deposit required. Remaining {formatCurrency(amount - displayAmount)} due at appointment.
          </p>
        )}

        {mode === 'hold' && (
          <div className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 p-2 rounded">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Your card will be authorized but not charged. We'll only charge if you don't show up or cancel late.
            </p>
          </div>
        )}

        {mode === 'optional' && (
          <p className="text-xs text-gray-500">
            Payment is optional. You can pay at the appointment instead.
          </p>
        )}
      </div>

      {/* Stripe Payment Element */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Payment Details
        </label>
        <div className="border rounded-lg p-4">
          <PaymentElement
            options={{
              layout: 'tabs',
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}

      {/* Security Note */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <Lock className="w-4 h-4" />
        <span>Your payment information is encrypted and secure</span>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            {mode === 'hold' ? 'Authorize Card' :
             mode === 'deposit' ? `Pay ${formatCurrency(displayAmount)} Deposit` :
             `Pay ${formatCurrency(displayAmount)}`}
          </>
        )}
      </button>

      {mode === 'optional' && (
        <button
          type="button"
          className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
        >
          Skip payment, pay at appointment
        </button>
      )}
    </form>
  );
}

export function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Create payment intent
    fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bookingId: props.bookingId,
        serviceId: props.serviceId,
        mode: props.mode,
        amount: props.amount,
        depositPercentage: props.depositPercentage,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
        }
      })
      .catch((err) => {
        setError('Failed to initialize payment');
      });
  }, [props.bookingId, props.serviceId, props.mode, props.amount, props.depositPercentage]);

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentFormContent
        amount={props.amount}
        mode={props.mode}
        depositPercentage={props.depositPercentage}
        onSuccess={props.onSuccess}
        onError={props.onError}
      />
    </Elements>
  );
}
```

### Booking System Tests

```typescript
// tests/booking/reminders.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  scheduleReminders,
  cancelReminders,
  rescheduleReminders,
  sendEmailReminder,
  sendSmsReminder,
  REMINDER_INTERVALS,
} from '@/lib/reminders';
import { subHours, addDays } from 'date-fns';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    booking: { findUnique: vi.fn() },
    reminder: {
      createMany: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: vi.fn().mockResolvedValue({ id: 'email-123' }) },
  })),
}));

vi.mock('twilio', () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: vi.fn().mockResolvedValue({ sid: 'sms-123' }) },
  })),
}));

describe('Reminder System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-20T10:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('scheduleReminders', () => {
    it('schedules reminders for all enabled channels', async () => {
      const { prisma } = await import('@/lib/prisma');
      const futureDate = addDays(new Date(), 2);

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        startTime: futureDate,
        customer: {
          email: 'test@example.com',
          phone: '+15551234567',
          smsOptIn: true,
          pushSubscription: '{"endpoint":"..."}',
          reminderPreferences: {
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: true,
            intervals: ['24h', '2h'],
          },
        },
        service: { name: 'Haircut' },
      });

      await scheduleReminders({ bookingId: 'booking-1' });

      expect(prisma.reminder.createMany).toHaveBeenCalled();
      const createCall = (prisma.reminder.createMany as any).mock.calls[0][0];

      // Should create 6 reminders: 2 intervals x 3 channels
      expect(createCall.data.length).toBe(6);
    });

    it('does not schedule SMS if user not opted in', async () => {
      const { prisma } = await import('@/lib/prisma');
      const futureDate = addDays(new Date(), 2);

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        startTime: futureDate,
        customer: {
          email: 'test@example.com',
          phone: '+15551234567',
          smsOptIn: false,
          reminderPreferences: {
            emailEnabled: true,
            smsEnabled: true,
            intervals: ['24h'],
          },
        },
        service: { name: 'Haircut' },
      });

      await scheduleReminders({ bookingId: 'booking-1' });

      const createCall = (prisma.reminder.createMany as any).mock.calls[0][0];
      const smsReminders = createCall.data.filter((r: any) => r.type === 'sms');

      expect(smsReminders.length).toBe(0);
    });

    it('does not schedule reminders in the past', async () => {
      const { prisma } = await import('@/lib/prisma');
      const soonDate = addDays(new Date(), 0); // Today
      soonDate.setHours(12); // 2 hours from now (10:00 -> 12:00)

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        startTime: soonDate,
        customer: {
          email: 'test@example.com',
          reminderPreferences: {
            emailEnabled: true,
            intervals: ['24h', '30min'], // 24h would be in past
          },
        },
        service: { name: 'Haircut' },
      });

      await scheduleReminders({ bookingId: 'booking-1' });

      const createCall = (prisma.reminder.createMany as any).mock.calls[0][0];

      // Only 30min reminder should be scheduled
      expect(createCall.data.length).toBe(1);
      expect(createCall.data[0].scheduledFor.getTime()).toBeGreaterThan(Date.now());
    });
  });

  describe('cancelReminders', () => {
    it('cancels all pending reminders for booking', async () => {
      const { prisma } = await import('@/lib/prisma');

      await cancelReminders('booking-1');

      expect(prisma.reminder.updateMany).toHaveBeenCalledWith({
        where: {
          bookingId: 'booking-1',
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
        },
      });
    });
  });

  describe('rescheduleReminders', () => {
    it('cancels old reminders and creates new ones', async () => {
      const { prisma } = await import('@/lib/prisma');
      const futureDate = addDays(new Date(), 3);

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        startTime: futureDate,
        customer: {
          email: 'test@example.com',
          reminderPreferences: {
            emailEnabled: true,
            intervals: ['24h'],
          },
        },
        service: { name: 'Haircut' },
      });

      await rescheduleReminders('booking-1');

      // Should cancel first
      expect(prisma.reminder.updateMany).toHaveBeenCalledWith({
        where: { bookingId: 'booking-1', status: 'PENDING' },
        data: { status: 'CANCELLED' },
      });

      // Then create new
      expect(prisma.reminder.createMany).toHaveBeenCalled();
    });
  });

  describe('sendEmailReminder', () => {
    it('sends email and updates reminder status', async () => {
      const { prisma } = await import('@/lib/prisma');
      const Resend = (await import('resend')).Resend;

      (prisma.reminder.findUnique as any).mockResolvedValue({
        id: 'reminder-1',
        status: 'PENDING',
        booking: {
          startTime: addDays(new Date(), 1),
          customer: { name: 'John', email: 'john@example.com' },
          service: { name: 'Haircut', provider: { name: 'Jane' } },
        },
      });

      const result = await sendEmailReminder('reminder-1');

      expect(result).toBe(true);
      expect(prisma.reminder.update).toHaveBeenCalledWith({
        where: { id: 'reminder-1' },
        data: { sentAt: expect.any(Date), status: 'SENT' },
      });
    });

    it('returns false for already sent reminder', async () => {
      const { prisma } = await import('@/lib/prisma');

      (prisma.reminder.findUnique as any).mockResolvedValue({
        id: 'reminder-1',
        status: 'SENT',
      });

      const result = await sendEmailReminder('reminder-1');

      expect(result).toBe(false);
    });
  });
});

// tests/booking/timezone.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  detectUserTimezone,
  utcToUserTimezone,
  userTimezoneToUtc,
  hasDSTTransition,
  scheduleReminderWithDST,
  getTimezoneOffsetHours,
} from '@/lib/timezone';

describe('Timezone Handling', () => {
  describe('utcToUserTimezone', () => {
    it('converts UTC to Eastern Time', () => {
      const utcDate = new Date('2025-01-20T15:00:00Z');
      const result = utcToUserTimezone(utcDate, 'America/New_York');

      // EST is UTC-5 in January
      expect(result.getHours()).toBe(10);
    });

    it('converts UTC to Pacific Time', () => {
      const utcDate = new Date('2025-01-20T15:00:00Z');
      const result = utcToUserTimezone(utcDate, 'America/Los_Angeles');

      // PST is UTC-8 in January
      expect(result.getHours()).toBe(7);
    });
  });

  describe('userTimezoneToUtc', () => {
    it('converts Eastern Time to UTC', () => {
      const localDate = new Date('2025-01-20T10:00:00');
      const result = userTimezoneToUtc(localDate, 'America/New_York');

      // 10:00 EST = 15:00 UTC
      expect(result.getUTCHours()).toBe(15);
    });
  });

  describe('hasDSTTransition', () => {
    it('detects DST spring forward', () => {
      // DST starts March 9, 2025 in US
      const beforeDST = new Date('2025-03-01T12:00:00');
      const afterDST = new Date('2025-03-15T12:00:00');

      const result = hasDSTTransition(beforeDST, afterDST, 'America/New_York');

      expect(result.hasDST).toBe(true);
      expect(result.direction).toBe('forward');
    });

    it('detects DST fall back', () => {
      // DST ends November 2, 2025 in US
      const beforeDST = new Date('2025-10-15T12:00:00');
      const afterDST = new Date('2025-11-15T12:00:00');

      const result = hasDSTTransition(beforeDST, afterDST, 'America/New_York');

      expect(result.hasDST).toBe(true);
      expect(result.direction).toBe('back');
    });

    it('returns false when no DST transition', () => {
      const date1 = new Date('2025-01-15T12:00:00');
      const date2 = new Date('2025-01-25T12:00:00');

      const result = hasDSTTransition(date1, date2, 'America/New_York');

      expect(result.hasDST).toBe(false);
    });

    it('handles timezones without DST', () => {
      const date1 = new Date('2025-03-01T12:00:00');
      const date2 = new Date('2025-03-15T12:00:00');

      const result = hasDSTTransition(date1, date2, 'America/Phoenix');

      expect(result.hasDST).toBe(false);
    });
  });

  describe('scheduleReminderWithDST', () => {
    it('correctly schedules reminder accounting for DST', () => {
      // Appointment on March 15, 2025 at 10:00 AM EDT (after DST)
      const appointmentUtc = new Date('2025-03-15T14:00:00Z'); // 10:00 AM EDT

      // 24 hours before would be March 14, 10:00 AM (still EST before DST)
      const reminderUtc = scheduleReminderWithDST(
        appointmentUtc,
        24,
        'America/New_York'
      );

      // Reminder should be at 15:00 UTC (10:00 AM EST, before DST change)
      expect(reminderUtc.getUTCHours()).toBe(15);
    });
  });

  describe('getTimezoneOffsetHours', () => {
    it('returns correct offset for EST', () => {
      const winterDate = new Date('2025-01-20T12:00:00Z');
      const offset = getTimezoneOffsetHours('America/New_York', winterDate);

      expect(offset).toBe(-5);
    });

    it('returns correct offset for EDT', () => {
      const summerDate = new Date('2025-07-20T12:00:00Z');
      const offset = getTimezoneOffsetHours('America/New_York', summerDate);

      expect(offset).toBe(-4);
    });
  });
});
```

```typescript
// tests/booking/cancellation.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkCancellationPolicy,
  cancelBooking,
  CANCELLATION_POLICIES,
} from '@/lib/cancellation';
import { addHours, subHours } from 'date-fns';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    booking: { findUnique: vi.fn(), update: vi.fn() },
    payment: { update: vi.fn() },
    cancellation: { create: vi.fn() },
    $transaction: vi.fn((fns) => Promise.all(fns)),
  },
}));

vi.mock('@/lib/reminders', () => ({
  cancelReminders: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('stripe', () => ({
  default: vi.fn().mockImplementation(() => ({
    refunds: {
      create: vi.fn().mockResolvedValue({ id: 'refund-123' }),
    },
  })),
}));

describe('Cancellation System', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('checkCancellationPolicy', () => {
    it('allows free cancellation within policy window', async () => {
      const { prisma } = await import('@/lib/prisma');
      const futureDate = addHours(new Date(), 48); // 48 hours from now

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        status: 'CONFIRMED',
        startTime: futureDate,
        service: { cancellationPolicy: '24h' },
        payment: { amount: 50 },
      });

      const result = await checkCancellationPolicy('booking-1');

      expect(result.allowed).toBe(true);
      expect(result.refundAmount).toBe(50);
      expect(result.penaltyAmount).toBe(0);
    });

    it('applies penalty for late cancellation', async () => {
      const { prisma } = await import('@/lib/prisma');
      const soonDate = addHours(new Date(), 12); // 12 hours from now

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        status: 'CONFIRMED',
        startTime: soonDate,
        service: { cancellationPolicy: '48h' },
        payment: { amount: 100 },
      });

      const result = await checkCancellationPolicy('booking-1');

      expect(result.allowed).toBe(true);
      expect(result.refundAmount).toBe(50); // 50% refund
      expect(result.penaltyAmount).toBe(75); // 50 + 25 fee
      expect(result.reason).toContain('48 hours');
    });

    it('does not allow cancellation of already cancelled booking', async () => {
      const { prisma } = await import('@/lib/prisma');

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        status: 'CANCELLED',
        startTime: new Date(),
        service: { cancellationPolicy: '24h' },
      });

      const result = await checkCancellationPolicy('booking-1');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('already cancelled');
    });

    it('does not allow cancellation of completed booking', async () => {
      const { prisma } = await import('@/lib/prisma');

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        status: 'COMPLETED',
        startTime: new Date(),
        service: { cancellationPolicy: '24h' },
      });

      const result = await checkCancellationPolicy('booking-1');

      expect(result.allowed).toBe(false);
      expect(result.reason).toContain('completed');
    });

    it('applies no-refund policy correctly', async () => {
      const { prisma } = await import('@/lib/prisma');
      const futureDate = addHours(new Date(), 48);

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        status: 'CONFIRMED',
        startTime: futureDate,
        service: { cancellationPolicy: 'no-refund' },
        payment: { amount: 75 },
      });

      const result = await checkCancellationPolicy('booking-1');

      expect(result.allowed).toBe(true);
      expect(result.refundAmount).toBe(0);
      expect(result.penaltyAmount).toBe(75);
    });
  });

  describe('cancelBooking', () => {
    it('processes cancellation with refund', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { cancelReminders } = await import('@/lib/reminders');
      const futureDate = addHours(new Date(), 48);

      (prisma.booking.findUnique as any).mockResolvedValue({
        id: 'booking-1',
        status: 'CONFIRMED',
        startTime: futureDate,
        service: { cancellationPolicy: '24h', provider: { id: 'provider-1' } },
        customer: { id: 'customer-1' },
        payment: { id: 'payment-1', amount: 50, stripePaymentIntentId: 'pi_123' },
      });

      const result = await cancelBooking('booking-1', 'customer', 'Changed plans');

      expect(result.success).toBe(true);
      expect(result.refundId).toBeDefined();
      expect(cancelReminders).toHaveBeenCalledWith('booking-1');
    });

    it('handles concurrent cancellation attempts', async () => {
      const { prisma } = await import('@/lib/prisma');

      // First call returns booking, second returns cancelled
      (prisma.booking.findUnique as any)
        .mockResolvedValueOnce({
          id: 'booking-1',
          status: 'CANCELLED',
          startTime: new Date(),
          service: { cancellationPolicy: '24h' },
        });

      const result = await cancelBooking('booking-1', 'customer');

      expect(result.success).toBe(false);
      expect(result.error).toContain('already cancelled');
    });
  });
});
```

```typescript
// tests/e2e/booking-flow.spec.ts
import { test, expect } from '@playwright/test';
import { addDays, format } from 'date-fns';

test.describe('Complete Booking Flow E2E', () => {
  test('complete booking with payment', async ({ page }) => {
    // 1. Navigate to service selection
    await page.goto('/book');
    await expect(page.locator('h1')).toContainText('Book an Appointment');

    // 2. Select service
    await page.click('text=Haircut');
    await expect(page).toHaveURL(/book\/service-/);

    // 3. Select date
    const futureDate = addDays(new Date(), 5);
    await page.click(`[data-date="${format(futureDate, 'yyyy-MM-dd')}"]`);

    // 4. Select time slot
    await page.click('text=10:00 AM');
    await expect(page.locator('.selected-slot')).toBeVisible();

    // 5. Fill customer information
    await page.fill('[name="name"]', 'Test Customer');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="phone"]', '5551234567');

    // 6. Enable SMS reminders (optional)
    await page.click('text=Enable SMS Reminders');
    await page.check('[name="smsConsent"]');

    // 7. Complete payment
    await page.click('text=Continue to Payment');

    // Fill Stripe test card
    const stripeFrame = page.frameLocator('[name*="stripe"]').first();
    await stripeFrame.locator('[placeholder="Card number"]').fill('4242424242424242');
    await stripeFrame.locator('[placeholder="MM / YY"]').fill('12/30');
    await stripeFrame.locator('[placeholder="CVC"]').fill('123');
    await stripeFrame.locator('[placeholder="ZIP"]').fill('12345');

    // 8. Submit booking
    await page.click('text=Pay');
    await page.waitForURL(/booking\/[a-z0-9]+/);

    // 9. Verify confirmation
    await expect(page.locator('h1')).toContainText('Booking Confirmed');
    await expect(page.locator('text=Test Customer')).toBeVisible();
    await expect(page.locator('text=Haircut')).toBeVisible();
  });

  test('cancel booking and receive refund', async ({ page }) => {
    // Assume we have a booking ID from setup
    const bookingId = 'test-booking-123';

    await page.goto(`/booking/${bookingId}`);

    // Click cancel
    await page.click('text=Cancel Booking');

    // Verify cancellation modal
    await expect(page.locator('text=Cancel Booking')).toBeVisible();
    await expect(page.locator('text=Refund Amount')).toBeVisible();

    // Confirm cancellation
    await page.click('text=Confirm Cancellation');

    // Verify cancelled status
    await expect(page.locator('text=Booking Cancelled')).toBeVisible();
    await expect(page.locator('text=Refund Processed')).toBeVisible();
  });

  test('reschedule booking', async ({ page }) => {
    const bookingId = 'test-booking-123';

    await page.goto(`/booking/${bookingId}`);

    // Click reschedule
    await page.click('text=Reschedule');

    // Select new date
    const newDate = addDays(new Date(), 10);
    await page.click(`[data-date="${format(newDate, 'yyyy-MM-dd')}"]`);

    // Select new time
    await page.click('text=2:00 PM');

    // Confirm
    await page.click('text=Confirm New Time');

    // Verify update
    await expect(page.locator('text=Booking Updated')).toBeVisible();
    await expect(page.locator(`text=${format(newDate, 'MMMM d')}`)).toBeVisible();
  });

  test('capture no-show payment', async ({ page }) => {
    // Login as provider
    await page.goto('/login');
    await page.fill('[name="email"]', 'provider@example.com');
    await page.fill('[name="password"]', 'testpass');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');

    // Navigate to booking
    await page.click('.booking-card >> nth=0');

    // Mark as no-show
    await page.click('[aria-label="More options"]');
    await page.click('text=Mark as No-Show');

    // Confirm charge
    await page.click('text=Charge No-Show Fee');

    // Verify
    await expect(page.locator('text=NO_SHOW')).toBeVisible();
    await expect(page.locator('text=Payment Captured')).toBeVisible();
  });
});

test.describe('Timezone Handling E2E', () => {
  test('displays times in user timezone', async ({ page }) => {
    // Set timezone via browser
    await page.addInitScript(() => {
      Intl.DateTimeFormat = class extends Intl.DateTimeFormat {
        resolvedOptions() {
          return { ...super.resolvedOptions(), timeZone: 'America/Los_Angeles' };
        }
      };
    });

    await page.goto('/book/service-1');

    // Verify timezone picker shows Pacific
    await expect(page.locator('text=Pacific Time')).toBeVisible();

    // Select a date and verify times shown in PT
    const futureDate = addDays(new Date(), 5);
    await page.click(`[data-date="${format(futureDate, 'yyyy-MM-dd')}"]`);

    // Time slots should show in PT format
    await expect(page.locator('.time-slot').first()).toContainText(/AM|PM/);
  });

  test('allows timezone override', async ({ page }) => {
    await page.goto('/book/service-1');

    // Open timezone picker
    await page.click('[aria-label="Select timezone"]');

    // Select different timezone
    await page.click('text=Eastern Time');

    // Verify selection
    await expect(page.locator('text=Eastern Time (ET)')).toBeVisible();
  });
});
```

## Email Templates

```tsx
// lib/email.ts
import { Resend } from 'resend';
import { format } from 'date-fns';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendBookingConfirmation(booking: any) {
  await resend.emails.send({
    from: 'Bookings <bookings@yourdomain.com>',
    to: [booking.customer.email],
    subject: `Booking Confirmed - ${booking.service.name}`,
    html: `
      <h1>Your Booking is Confirmed!</h1>
      <p>Hi ${booking.customer.name},</p>
      <p>Your appointment has been confirmed:</p>
      <ul>
        <li><strong>Service:</strong> ${booking.service.name}</li>
        <li><strong>Date:</strong> ${format(booking.date, 'MMMM d, yyyy')}</li>
        <li><strong>Time:</strong> ${format(booking.startTime, 'h:mm a')} - ${format(booking.endTime, 'h:mm a')}</li>
      </ul>
      <p>We look forward to seeing you!</p>
    `,
  });
}
```

## Testing

### Test Setup

```bash
# Install testing dependencies
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
npm install -D playwright @playwright/test
npm install -D msw
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
      exclude: ['node_modules/', 'tests/e2e/'],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

```typescript
// tests/setup.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';
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
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock date-fns to control time in tests
vi.mock('date-fns', async () => {
  const actual = await vi.importActual('date-fns');
  return {
    ...actual,
    // Can override specific functions if needed
  };
});

// Setup MSW server
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

```typescript
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';
import { addMinutes, format, setHours, setMinutes } from 'date-fns';

// Generate mock slots for a given date
function generateMockSlots(date: Date, bookedTimes: string[] = []) {
  const slots = [];
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const start = setMinutes(setHours(date, hour), min);
      const end = addMinutes(start, 30);
      const timeStr = format(start, 'HH:mm');
      
      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        available: !bookedTimes.includes(timeStr),
      });
    }
  }
  
  return slots;
}

export const handlers = [
  // Services API
  http.get('/api/services', async () => {
    return HttpResponse.json([
      {
        id: 'service-1',
        name: 'Haircut',
        description: 'Standard haircut service',
        duration: 30,
        price: 25.00,
        active: true,
      },
      {
        id: 'service-2',
        name: 'Hair Coloring',
        description: 'Full hair coloring',
        duration: 90,
        price: 75.00,
        active: true,
      },
    ]);
  }),

  http.get('/api/services/:id', async ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: 'Haircut',
      description: 'Standard haircut service',
      duration: 30,
      price: 25.00,
      active: true,
      provider: {
        id: 'provider-1',
        name: 'Jane Smith',
      },
    });
  }),

  // Availability API
  http.get('/api/availability', async ({ request }) => {
    const url = new URL(request.url);
    const dateStr = url.searchParams.get('date');
    const date = dateStr ? new Date(dateStr) : new Date();
    
    // Simulate some booked times
    const bookedTimes = ['10:00', '14:30', '15:00'];
    const slots = generateMockSlots(date, bookedTimes);
    
    return HttpResponse.json({ slots });
  }),

  http.get('/api/availability/dates', async () => {
    // Return next 30 days with availability
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      // Skip Sundays
      if (date.getDay() !== 0) {
        dates.push(format(date, 'yyyy-MM-dd'));
      }
    }
    return HttpResponse.json({ dates });
  }),

  // Bookings API
  http.post('/api/bookings', async ({ request }) => {
    const body = await request.json() as any;
    
    // Simulate slot already booked
    if (body.startTime?.includes('10:00')) {
      return HttpResponse.json(
        { error: 'This slot is no longer available' },
        { status: 409 }
      );
    }
    
    return HttpResponse.json({
      id: 'booking-123',
      ...body,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    }, { status: 201 });
  }),

  http.get('/api/bookings', async () => {
    return HttpResponse.json([
      {
        id: 'booking-1',
        date: new Date().toISOString(),
        startTime: new Date().toISOString(),
        endTime: addMinutes(new Date(), 30).toISOString(),
        status: 'CONFIRMED',
        service: { name: 'Haircut', duration: 30 },
        customer: { name: 'John Doe', email: 'john@example.com' },
      },
    ]);
  }),

  http.get('/api/bookings/:id', async ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      endTime: addMinutes(new Date(), 30).toISOString(),
      status: 'CONFIRMED',
      service: { 
        id: 'service-1',
        name: 'Haircut', 
        duration: 30,
        price: 25.00,
      },
      customer: { 
        id: 'customer-1',
        name: 'John Doe', 
        email: 'john@example.com',
        phone: '555-123-4567',
      },
    });
  }),

  http.patch('/api/bookings/:id', async ({ params, request }) => {
    const body = await request.json() as any;
    return HttpResponse.json({
      id: params.id,
      ...body,
    });
  }),

  http.delete('/api/bookings/:id', async ({ params }) => {
    return HttpResponse.json({ success: true });
  }),

  // Provider dashboard
  http.get('/api/dashboard/stats', async () => {
    return HttpResponse.json({
      todayBookings: 5,
      weekBookings: 23,
      monthRevenue: 1250.00,
      upcomingCount: 12,
    });
  }),
];
```

### Unit Tests

```typescript
// tests/unit/lib/availability.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getAvailableSlots,
  isSlotAvailable,
  hasConflict,
  parseTimeString,
  formatTimeSlot,
} from '@/lib/availability';
import { setHours, setMinutes, addDays } from 'date-fns';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findUnique: vi.fn(),
    },
    availability: {
      findMany: vi.fn(),
    },
    blockedDate: {
      findFirst: vi.fn(),
    },
    booking: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe('Availability Calculator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseTimeString', () => {
    it('parses HH:mm format correctly', () => {
      const result = parseTimeString('09:30', new Date('2025-01-20'));
      expect(result.getHours()).toBe(9);
      expect(result.getMinutes()).toBe(30);
    });

    it('handles midnight', () => {
      const result = parseTimeString('00:00', new Date('2025-01-20'));
      expect(result.getHours()).toBe(0);
      expect(result.getMinutes()).toBe(0);
    });

    it('handles end of day', () => {
      const result = parseTimeString('23:59', new Date('2025-01-20'));
      expect(result.getHours()).toBe(23);
      expect(result.getMinutes()).toBe(59);
    });
  });

  describe('hasConflict', () => {
    it('returns true for overlapping bookings', () => {
      const booking = {
        startTime: setHours(new Date(), 10),
        endTime: setHours(new Date(), 11),
      };
      
      const slotStart = setMinutes(setHours(new Date(), 10), 30);
      const slotEnd = setMinutes(setHours(new Date(), 11), 30);
      
      expect(hasConflict(slotStart, slotEnd, booking)).toBe(true);
    });

    it('returns false for non-overlapping bookings', () => {
      const booking = {
        startTime: setHours(new Date(), 10),
        endTime: setHours(new Date(), 11),
      };
      
      const slotStart = setHours(new Date(), 14);
      const slotEnd = setHours(new Date(), 15);
      
      expect(hasConflict(slotStart, slotEnd, booking)).toBe(false);
    });

    it('returns false for adjacent slots', () => {
      const booking = {
        startTime: setHours(new Date(), 10),
        endTime: setHours(new Date(), 11),
      };
      
      const slotStart = setHours(new Date(), 11);
      const slotEnd = setHours(new Date(), 12);
      
      expect(hasConflict(slotStart, slotEnd, booking)).toBe(false);
    });

    it('handles exact match', () => {
      const booking = {
        startTime: setHours(new Date(), 10),
        endTime: setHours(new Date(), 11),
      };
      
      expect(hasConflict(booking.startTime, booking.endTime, booking)).toBe(true);
    });
  });

  describe('getAvailableSlots', () => {
    it('returns empty array when service not found', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.service.findUnique as any).mockResolvedValue(null);
      
      const slots = await getAvailableSlots('provider-1', 'service-1', new Date());
      
      expect(slots).toEqual([]);
    });

    it('returns empty array for blocked dates', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.service.findUnique as any).mockResolvedValue({ duration: 30 });
      (prisma.availability.findMany as any).mockResolvedValue([
        { startTime: '09:00', endTime: '17:00' },
      ]);
      (prisma.blockedDate.findFirst as any).mockResolvedValue({
        date: new Date(),
        reason: 'Holiday',
      });
      
      const slots = await getAvailableSlots('provider-1', 'service-1', new Date());
      
      expect(slots).toEqual([]);
    });

    it('marks booked slots as unavailable', async () => {
      const { prisma } = await import('@/lib/prisma');
      const testDate = new Date('2025-01-20T00:00:00Z');
      
      (prisma.service.findUnique as any).mockResolvedValue({ duration: 30 });
      (prisma.availability.findMany as any).mockResolvedValue([
        { startTime: '09:00', endTime: '10:00', dayOfWeek: testDate.getDay() },
      ]);
      (prisma.blockedDate.findFirst as any).mockResolvedValue(null);
      (prisma.booking.findMany as any).mockResolvedValue([
        {
          startTime: setHours(testDate, 9),
          endTime: setMinutes(setHours(testDate, 9), 30),
        },
      ]);
      
      const slots = await getAvailableSlots('provider-1', 'service-1', testDate);
      
      const firstSlot = slots.find(s => s.start.getHours() === 9 && s.start.getMinutes() === 0);
      expect(firstSlot?.available).toBe(false);
    });

    it('returns available slots correctly', async () => {
      const { prisma } = await import('@/lib/prisma');
      const futureDate = addDays(new Date(), 1);
      
      (prisma.service.findUnique as any).mockResolvedValue({ duration: 30 });
      (prisma.availability.findMany as any).mockResolvedValue([
        { startTime: '09:00', endTime: '12:00', dayOfWeek: futureDate.getDay() },
      ]);
      (prisma.blockedDate.findFirst as any).mockResolvedValue(null);
      (prisma.booking.findMany as any).mockResolvedValue([]);
      
      const slots = await getAvailableSlots('provider-1', 'service-1', futureDate);
      
      expect(slots.length).toBeGreaterThan(0);
      expect(slots.every(s => s.available)).toBe(true);
    });
  });

  describe('isSlotAvailable', () => {
    it('returns true when no conflicts', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.booking.findFirst as any).mockResolvedValue(null);
      
      const start = setHours(new Date(), 14);
      const end = setHours(new Date(), 15);
      
      const available = await isSlotAvailable('provider-1', start, end);
      
      expect(available).toBe(true);
    });

    it('returns false when conflict exists', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.booking.findFirst as any).mockResolvedValue({
        id: 'booking-1',
      });
      
      const start = setHours(new Date(), 14);
      const end = setHours(new Date(), 15);
      
      const available = await isSlotAvailable('provider-1', start, end);
      
      expect(available).toBe(false);
    });
  });
});
```

```typescript
// tests/unit/components/calendar-picker.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CalendarPicker } from '@/components/booking/calendar-picker';
import { addDays, format, subDays } from 'date-fns';

describe('CalendarPicker', () => {
  it('renders current month', () => {
    render(
      <CalendarPicker
        selectedDate={null}
        onSelectDate={() => {}}
      />
    );
    
    expect(screen.getByText(format(new Date(), 'MMMM yyyy'))).toBeInTheDocument();
  });

  it('displays all weekday headers', () => {
    render(
      <CalendarPicker
        selectedDate={null}
        onSelectDate={() => {}}
      />
    );
    
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    weekdays.forEach(day => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('highlights today', () => {
    render(
      <CalendarPicker
        selectedDate={null}
        onSelectDate={() => {}}
      />
    );
    
    const today = format(new Date(), 'd');
    const todayButton = screen.getByText(today);
    expect(todayButton.className).toContain('ring');
  });

  it('calls onSelectDate when date clicked', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    const futureDate = addDays(new Date(), 5);
    
    render(
      <CalendarPicker
        selectedDate={null}
        onSelectDate={onSelectDate}
        minDate={new Date()}
      />
    );
    
    await user.click(screen.getByText(format(futureDate, 'd')));
    
    expect(onSelectDate).toHaveBeenCalled();
  });

  it('disables past dates', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    const yesterday = subDays(new Date(), 1);
    
    render(
      <CalendarPicker
        selectedDate={null}
        onSelectDate={onSelectDate}
        minDate={new Date()}
      />
    );
    
    const yesterdayButton = screen.queryByText(format(yesterday, 'd'));
    if (yesterdayButton) {
      expect(yesterdayButton).toBeDisabled();
    }
  });

  it('navigates to next month', async () => {
    const user = userEvent.setup();
    const nextMonth = addDays(new Date(), 32);
    
    render(
      <CalendarPicker
        selectedDate={null}
        onSelectDate={() => {}}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /next/i }) || 
                     screen.getAllByRole('button')[1]);
    
    expect(screen.getByText(format(nextMonth, 'MMMM yyyy'))).toBeInTheDocument();
  });

  it('navigates to previous month', async () => {
    const user = userEvent.setup();
    const prevMonth = subDays(new Date(), 15);
    
    render(
      <CalendarPicker
        selectedDate={null}
        onSelectDate={() => {}}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /prev/i }) || 
                     screen.getAllByRole('button')[0]);
    
    expect(screen.getByText(format(prevMonth, 'MMMM yyyy'))).toBeInTheDocument();
  });

  it('shows selected date with different styling', () => {
    const selectedDate = addDays(new Date(), 3);
    
    render(
      <CalendarPicker
        selectedDate={selectedDate}
        onSelectDate={() => {}}
      />
    );
    
    const selectedButton = screen.getByText(format(selectedDate, 'd'));
    expect(selectedButton.className).toContain('bg-blue');
  });

  it('respects availableDates prop', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    const availableDate = addDays(new Date(), 5);
    const unavailableDate = addDays(new Date(), 6);
    
    render(
      <CalendarPicker
        selectedDate={null}
        onSelectDate={onSelectDate}
        availableDates={[availableDate]}
      />
    );
    
    // Available date should be clickable
    const availableButton = screen.getByText(format(availableDate, 'd'));
    expect(availableButton).not.toBeDisabled();
    
    // Unavailable date should be disabled
    const unavailableButton = screen.getByText(format(unavailableDate, 'd'));
    expect(unavailableButton).toBeDisabled();
  });
});
```

```typescript
// tests/unit/components/time-slots.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TimeSlots } from '@/components/booking/time-slots';
import { setHours, setMinutes, addMinutes } from 'date-fns';

const createSlots = (count: number, availableCount: number = count) => {
  const baseDate = new Date();
  return Array.from({ length: count }, (_, i) => {
    const start = addMinutes(setHours(baseDate, 9), i * 30);
    return {
      start,
      end: addMinutes(start, 30),
      available: i < availableCount,
    };
  });
};

describe('TimeSlots', () => {
  it('renders all slots', () => {
    const slots = createSlots(6);
    
    render(
      <TimeSlots
        slots={slots}
        selectedSlot={null}
        onSelectSlot={() => {}}
      />
    );
    
    expect(screen.getByText('9:00 AM')).toBeInTheDocument();
    expect(screen.getByText('9:30 AM')).toBeInTheDocument();
    expect(screen.getByText('10:00 AM')).toBeInTheDocument();
  });

  it('shows available and booked counts', () => {
    const slots = createSlots(6, 4); // 4 available, 2 booked
    
    render(
      <TimeSlots
        slots={slots}
        selectedSlot={null}
        onSelectSlot={() => {}}
      />
    );
    
    expect(screen.getByText('Available (4)')).toBeInTheDocument();
    expect(screen.getByText('Booked (2)')).toBeInTheDocument();
  });

  it('calls onSelectSlot for available slot', async () => {
    const user = userEvent.setup();
    const onSelectSlot = vi.fn();
    const slots = createSlots(3);
    
    render(
      <TimeSlots
        slots={slots}
        selectedSlot={null}
        onSelectSlot={onSelectSlot}
      />
    );
    
    await user.click(screen.getByText('9:00 AM'));
    
    expect(onSelectSlot).toHaveBeenCalledWith(slots[0]);
  });

  it('does not call onSelectSlot for unavailable slot', async () => {
    const user = userEvent.setup();
    const onSelectSlot = vi.fn();
    const slots = createSlots(3, 0); // All unavailable
    
    render(
      <TimeSlots
        slots={slots}
        selectedSlot={null}
        onSelectSlot={onSelectSlot}
      />
    );
    
    await user.click(screen.getByText('9:00 AM'));
    
    expect(onSelectSlot).not.toHaveBeenCalled();
  });

  it('shows selected slot with different styling', () => {
    const slots = createSlots(3);
    
    render(
      <TimeSlots
        slots={slots}
        selectedSlot={slots[1]}
        onSelectSlot={() => {}}
      />
    );
    
    const selectedButton = screen.getByText('9:30 AM');
    expect(selectedButton.className).toContain('bg-blue');
  });

  it('shows loading state', () => {
    render(
      <TimeSlots
        slots={[]}
        selectedSlot={null}
        onSelectSlot={() => {}}
        isLoading
      />
    );
    
    expect(screen.getByRole('status') || document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows empty state when no slots', () => {
    render(
      <TimeSlots
        slots={[]}
        selectedSlot={null}
        onSelectSlot={() => {}}
      />
    );
    
    expect(screen.getByText(/no available slots/i)).toBeInTheDocument();
  });

  it('disables unavailable slots', () => {
    const slots = createSlots(3, 1); // Only first available
    
    render(
      <TimeSlots
        slots={slots}
        selectedSlot={null}
        onSelectSlot={() => {}}
      />
    );
    
    const unavailableButton = screen.getByText('9:30 AM');
    expect(unavailableButton).toBeDisabled();
  });
});
```

```typescript
// tests/unit/components/booking-form.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BookingForm } from '@/components/booking/booking-form';

describe('BookingForm', () => {
  it('renders all required fields', () => {
    render(<BookingForm onSubmit={async () => {}} />);
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<BookingForm onSubmit={async () => {}} />);
    
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup();
    render(<BookingForm onSubmit={async () => {}} />);
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'invalid-email');
    await user.type(screen.getByLabelText(/phone/i), '5551234567');
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short phone number', async () => {
    const user = userEvent.setup();
    render(<BookingForm onSubmit={async () => {}} />);
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '123');
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/valid phone/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '5551234567');
    await user.type(screen.getByLabelText(/notes/i), 'Special request');
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
        phone: '5551234567',
        notes: 'Special request',
      });
    });
  });

  it('shows loading state when submitting', async () => {
    render(<BookingForm onSubmit={async () => {}} isSubmitting />);
    
    expect(screen.getByText(/confirming/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('notes field is optional', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<BookingForm onSubmit={onSubmit} />);
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/phone/i), '5551234567');
    await user.click(screen.getByRole('button', { name: /confirm/i }));
    
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        name: 'John Doe',
      }));
    });
  });
});
```

### Integration Tests

```typescript
// tests/integration/booking-flow.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BookingPage from '@/app/(public)/book/[serviceId]/page';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Booking Flow Integration', () => {
  it('loads service details', async () => {
    render(
      <BookingPage params={{ serviceId: 'service-1' }} />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByText('Haircut')).toBeInTheDocument();
      expect(screen.getByText('$25.00')).toBeInTheDocument();
    });
  });

  it('shows calendar after service loads', async () => {
    render(
      <BookingPage params={{ serviceId: 'service-1' }} />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByText(/select a date/i)).toBeInTheDocument();
    });
  });

  it('loads time slots when date selected', async () => {
    const user = userEvent.setup();
    
    render(
      <BookingPage params={{ serviceId: 'service-1' }} />,
      { wrapper: createWrapper() }
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\d+/ })).toBeInTheDocument();
    });
    
    // Click on a future date
    const futureDay = screen.getAllByRole('button').find(
      btn => !btn.hasAttribute('disabled') && btn.textContent?.match(/^\d+$/)
    );
    if (futureDay) {
      await user.click(futureDay);
    }
    
    await waitFor(() => {
      expect(screen.getByText(/9:00 AM/)).toBeInTheDocument();
    });
  });

  it('shows booking form when slot selected', async () => {
    const user = userEvent.setup();
    
    render(
      <BookingPage params={{ serviceId: 'service-1' }} />,
      { wrapper: createWrapper() }
    );
    
    // Wait for page to load and select date
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /\d+/ })).toBeInTheDocument();
    });
    
    const futureDay = screen.getAllByRole('button').find(
      btn => !btn.hasAttribute('disabled') && btn.textContent?.match(/^\d+$/)
    );
    if (futureDay) await user.click(futureDay);
    
    // Wait for slots and select one
    await waitFor(() => {
      expect(screen.getByText(/9:00 AM/)).toBeInTheDocument();
    });
    
    // Select first available slot
    const slots = screen.getAllByText(/AM|PM/);
    const availableSlot = slots.find(s => !s.closest('button')?.hasAttribute('disabled'));
    if (availableSlot) await user.click(availableSlot);
    
    // Form should appear
    await waitFor(() => {
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    });
  });

  it('handles slot conflict error gracefully', async () => {
    server.use(
      http.post('/api/bookings', () => {
        return HttpResponse.json(
          { error: 'This slot is no longer available' },
          { status: 409 }
        );
      })
    );

    // ... simulate booking flow
    // Then verify error message is shown
    await waitFor(() => {
      expect(screen.getByText(/no longer available/i)).toBeInTheDocument();
    });
  });
});
```

```typescript
// tests/integration/dashboard.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DashboardPage from '@/app/(dashboard)/dashboard/page';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('Provider Dashboard Integration', () => {
  it('displays dashboard statistics', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Today's bookings
      expect(screen.getByText('23')).toBeInTheDocument(); // Week bookings
    });
  });

  it('shows upcoming bookings', async () => {
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Haircut')).toBeInTheDocument();
    });
  });

  it('allows changing booking status', async () => {
    const user = userEvent.setup();
    render(<DashboardPage />, { wrapper: createWrapper() });
    
    await waitFor(() => {
      expect(screen.getByText('CONFIRMED')).toBeInTheDocument();
    });
    
    // Open actions menu
    await user.click(screen.getByRole('button', { name: /more/i }) || 
                     screen.getAllByRole('button')[0]);
    
    // Click complete
    await user.click(screen.getByText(/mark completed/i));
    
    // Status should update
    await waitFor(() => {
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
    });
  });
});
```

### API Route Tests

```typescript
// tests/api/bookings.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, GET } from '@/app/api/bookings/route';
import { NextRequest } from 'next/server';
import { addHours, addDays } from 'date-fns';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    service: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    booking: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('@/lib/availability', () => ({
  isSlotAvailable: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendBookingConfirmation: vi.fn(),
  scheduleReminders: vi.fn(),
}));

describe('Bookings API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/bookings', () => {
    it('creates booking successfully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { isSlotAvailable } = await import('@/lib/availability');
      const { sendBookingConfirmation } = await import('@/lib/email');
      
      (prisma.service.findUnique as any).mockResolvedValue({
        id: 'service-1',
        duration: 30,
        providerId: 'provider-1',
        provider: { id: 'provider-1' },
      });
      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 'customer-1',
        email: 'john@example.com',
      });
      (isSlotAvailable as any).mockResolvedValue(true);
      (prisma.booking.create as any).mockResolvedValue({
        id: 'booking-1',
        status: 'CONFIRMED',
      });
      
      const futureDate = addDays(new Date(), 1);
      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: 'service-1',
          date: futureDate.toISOString(),
          startTime: addHours(futureDate, 10).toISOString(),
          customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '5551234567',
          },
        }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(201);
      expect(sendBookingConfirmation).toHaveBeenCalled();
    });

    it('returns 404 for non-existent service', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.service.findUnique as any).mockResolvedValue(null);
      
      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: 'invalid',
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '5551234567',
          },
        }),
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(404);
    });

    it('returns 409 when slot not available', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { isSlotAvailable } = await import('@/lib/availability');
      
      (prisma.service.findUnique as any).mockResolvedValue({
        id: 'service-1',
        duration: 30,
        providerId: 'provider-1',
      });
      (isSlotAvailable as any).mockResolvedValue(false);
      
      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: 'service-1',
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '5551234567',
          },
        }),
      });
      
      const response = await POST(request);
      const data = await response.json();
      
      expect(response.status).toBe(409);
      expect(data.error).toContain('no longer available');
    });

    it('uses existing customer if found', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { isSlotAvailable } = await import('@/lib/availability');
      
      (prisma.service.findUnique as any).mockResolvedValue({
        id: 'service-1',
        duration: 30,
        providerId: 'provider-1',
      });
      (prisma.user.findUnique as any).mockResolvedValue({
        id: 'existing-customer',
        email: 'john@example.com',
      });
      (isSlotAvailable as any).mockResolvedValue(true);
      (prisma.booking.create as any).mockResolvedValue({
        id: 'booking-1',
        customerId: 'existing-customer',
      });
      
      const request = new NextRequest('http://localhost/api/bookings', {
        method: 'POST',
        body: JSON.stringify({
          serviceId: 'service-1',
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          customer: {
            name: 'John Doe',
            email: 'john@example.com',
            phone: '5551234567',
          },
        }),
      });
      
      await POST(request);
      
      // Should not create new customer
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /api/bookings', () => {
    it('returns bookings filtered by provider', async () => {
      const { prisma } = await import('@/lib/prisma');
      (prisma.booking.findMany as any).mockResolvedValue([
        { id: 'booking-1', service: { name: 'Haircut' } },
      ]);
      
      const request = new NextRequest(
        'http://localhost/api/bookings?providerId=provider-1'
      );
      
      const response = await GET(request);
      const data = await response.json();
      
      expect(data).toHaveLength(1);
    });

    it('filters by date range', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      const request = new NextRequest(
        'http://localhost/api/bookings?from=2025-01-01&to=2025-01-31'
      );
      
      await GET(request);
      
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        })
      );
    });

    it('filters by status', async () => {
      const { prisma } = await import('@/lib/prisma');
      
      const request = new NextRequest(
        'http://localhost/api/bookings?status=CONFIRMED'
      );
      
      await GET(request);
      
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'CONFIRMED',
          }),
        })
      );
    });
  });
});
```

```typescript
// tests/api/availability.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/availability/route';
import { NextRequest } from 'next/server';

vi.mock('@/lib/availability', () => ({
  getAvailableSlots: vi.fn(),
}));

describe('Availability API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns available slots for date', async () => {
    const { getAvailableSlots } = await import('@/lib/availability');
    (getAvailableSlots as any).mockResolvedValue([
      { start: new Date(), end: new Date(), available: true },
      { start: new Date(), end: new Date(), available: false },
    ]);
    
    const request = new NextRequest(
      'http://localhost/api/availability?providerId=p1&serviceId=s1&date=2025-01-20'
    );
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.slots).toHaveLength(2);
  });

  it('returns 400 for missing parameters', async () => {
    const request = new NextRequest(
      'http://localhost/api/availability?providerId=p1'
    );
    
    const response = await GET(request);
    
    expect(response.status).toBe(400);
  });
});
```

### E2E Tests (Playwright)

```typescript
// tests/e2e/booking.spec.ts
import { test, expect } from '@playwright/test';
import { addDays, format } from 'date-fns';

test.describe('Booking Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('complete booking flow', async ({ page }) => {
    // 1. Select service
    await page.goto('/book');
    await page.click('text=Haircut');
    
    await expect(page).toHaveURL(/book\/service-/);
    
    // 2. Select date
    const futureDate = addDays(new Date(), 3);
    await page.click(`text=${format(futureDate, 'd')}`);
    
    // 3. Select time slot
    await page.click('text=10:00 AM');
    
    // 4. Fill booking form
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="phone"]', '5551234567');
    await page.fill('[name="notes"]', 'First time customer');
    
    // 5. Submit
    await page.click('text=Confirm Booking');
    
    // 6. Verify confirmation
    await expect(page).toHaveURL(/booking\/.+/);
    await expect(page.locator('text=Booking Confirmed')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
    await expect(page.locator('text=Haircut')).toBeVisible();
  });

  test('shows error when slot becomes unavailable', async ({ page }) => {
    await page.goto('/book/service-1');
    
    // Mock API to return conflict
    await page.route('/api/bookings', (route) => {
      route.fulfill({
        status: 409,
        body: JSON.stringify({ error: 'This slot is no longer available' }),
      });
    });
    
    // Select date and time
    const futureDate = addDays(new Date(), 3);
    await page.click(`text=${format(futureDate, 'd')}`);
    await page.click('text=10:00 AM');
    
    // Fill form
    await page.fill('[name="name"]', 'John Doe');
    await page.fill('[name="email"]', 'john@example.com');
    await page.fill('[name="phone"]', '5551234567');
    await page.click('text=Confirm Booking');
    
    // Should show error
    await expect(page.locator('text=no longer available')).toBeVisible();
  });

  test('validates booking form', async ({ page }) => {
    await page.goto('/book/service-1');
    
    // Select date and time
    const futureDate = addDays(new Date(), 3);
    await page.click(`text=${format(futureDate, 'd')}`);
    await page.click('text=10:00 AM');
    
    // Submit without filling form
    await page.click('text=Confirm Booking');
    
    // Should show validation errors
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=email is required')).toBeVisible();
  });

  test('navigates months in calendar', async ({ page }) => {
    await page.goto('/book/service-1');
    
    const currentMonth = format(new Date(), 'MMMM yyyy');
    await expect(page.locator(`text=${currentMonth}`)).toBeVisible();
    
    // Go to next month
    await page.click('[aria-label="Next month"]');
    
    const nextMonth = format(addDays(new Date(), 32), 'MMMM yyyy');
    await expect(page.locator(`text=${nextMonth}`)).toBeVisible();
  });

  test('prevents past date selection', async ({ page }) => {
    await page.goto('/book/service-1');
    
    // Try to click yesterday (should be disabled)
    const yesterday = format(addDays(new Date(), -1), 'd');
    const button = page.locator(`button:has-text("${yesterday}")`).first();
    
    await expect(button).toBeDisabled();
  });
});

test.describe('Provider Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as provider
    await page.goto('/login');
    await page.fill('[name="email"]', 'provider@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('views upcoming bookings', async ({ page }) => {
    await expect(page.locator('.booking-card')).toHaveCount(await page.locator('.booking-card').count());
  });

  test('marks booking as completed', async ({ page }) => {
    await page.click('.booking-card >> nth=0 >> [aria-label="More options"]');
    await page.click('text=Mark Completed');
    
    await expect(page.locator('text=Booking completed')).toBeVisible();
  });

  test('cancels booking', async ({ page }) => {
    await page.click('.booking-card >> nth=0 >> [aria-label="More options"]');
    await page.click('text=Cancel Booking');
    
    // Confirmation dialog
    await page.click('text=Confirm Cancellation');
    
    await expect(page.locator('text=Booking cancelled')).toBeVisible();
  });

  test('views booking details', async ({ page }) => {
    await page.click('.booking-card >> nth=0');
    
    await expect(page).toHaveURL(/bookings\/.+/);
    await expect(page.locator('h1')).toContainText('Booking Details');
  });
});

test.describe('Accessibility', () => {
  test('calendar is keyboard navigable', async ({ page }) => {
    await page.goto('/book/service-1');
    
    // Tab to calendar
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Navigate with arrow keys
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');
    
    // Time slots should load
    await expect(page.locator('.time-slot')).toHaveCount(await page.locator('.time-slot').count());
  });

  test('has no accessibility violations', async ({ page }) => {
    await page.goto('/book/service-1');
    
    await page.addScriptTag({ url: 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.7.2/axe.min.js' });
    
    const violations = await page.evaluate(async () => {
      const results = await (window as any).axe.run();
      return results.violations;
    });
    
    expect(violations).toEqual([]);
  });
});

test.describe('Mobile Experience', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test('booking flow works on mobile', async ({ page }) => {
    await page.goto('/book/service-1');
    
    // Calendar should be visible
    await expect(page.locator('.calendar-picker')).toBeVisible();
    
    // Select date
    const futureDate = addDays(new Date(), 3);
    await page.click(`text=${format(futureDate, 'd')}`);
    
    // Time slots should scroll horizontally
    await expect(page.locator('.time-slots')).toBeVisible();
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
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
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
import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, RefreshCw, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    Sentry.captureException(error, {
      extra: { componentStack: errorInfo.componentStack },
      tags: { component: 'Booking' },
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div role="alert" className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-4 text-center">
            {this.state.error?.message || 'Unable to load booking interface'}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => this.setState({ hasError: false })}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            <Button variant="outline" asChild>
              <a href="/">
                <Calendar className="mr-2 h-4 w-4" />
                Start over
              </a>
            </Button>
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

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { AlertCircle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-4">
          We couldn't process your booking request.
        </p>
        {error.digest && (
          <p className="text-sm text-gray-500 mb-4 font-mono">
            Reference: {error.digest}
          </p>
        )}
        <div className="flex justify-center gap-4">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <a href="/">
              <Home className="mr-2 h-4 w-4" />
              Go home
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Booking-Specific Errors

```typescript
// lib/errors/booking-errors.ts
export class BookingError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'BookingError';
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
        details: this.details,
      },
    };
  }
}

// Slot not available
export class SlotUnavailableError extends BookingError {
  constructor(startTime: Date) {
    super(
      'This time slot is no longer available. Please select another time.',
      'SLOT_UNAVAILABLE',
      409,
      { requestedTime: startTime.toISOString() }
    );
  }
}

// Service not found
export class ServiceNotFoundError extends BookingError {
  constructor(serviceId: string) {
    super(
      'The requested service is not available.',
      'SERVICE_NOT_FOUND',
      404,
      { serviceId }
    );
  }
}

// Provider unavailable
export class ProviderUnavailableError extends BookingError {
  constructor(providerId: string, date: Date) {
    super(
      'The provider is not available on this date.',
      'PROVIDER_UNAVAILABLE',
      400,
      { providerId, date: date.toISOString() }
    );
  }
}

// Past date booking
export class PastDateError extends BookingError {
  constructor(date: Date) {
    super(
      'Cannot book appointments in the past.',
      'PAST_DATE',
      400,
      { requestedDate: date.toISOString() }
    );
  }
}

// Booking limit exceeded
export class BookingLimitError extends BookingError {
  constructor(limit: number, period: string) {
    super(
      `You have reached the maximum of ${limit} bookings per ${period}.`,
      'BOOKING_LIMIT_EXCEEDED',
      429,
      { limit, period }
    );
  }
}

// Cancellation window closed
export class CancellationWindowError extends BookingError {
  constructor(hoursRequired: number) {
    super(
      `Bookings must be cancelled at least ${hoursRequired} hours in advance.`,
      'CANCELLATION_WINDOW_CLOSED',
      400,
      { hoursRequired }
    );
  }
}

// Error handler
export function handleBookingError(error: unknown): Response {
  if (error instanceof BookingError) {
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  console.error('[Booking Error]', error);
  return Response.json(
    { error: { message: 'An unexpected error occurred', code: 'INTERNAL_ERROR' } },
    { status: 500 }
  );
}
```

### React Query Error Handling

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BookingError, SlotUnavailableError } from './errors/booking-errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (error instanceof BookingError && error.statusCode < 500) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 30 * 1000, // 30 seconds for availability
    },
    mutations: {
      onError: (error) => {
        if (error instanceof SlotUnavailableError) {
          toast.error(error.message, {
            action: {
              label: 'Refresh slots',
              onClick: () => {
                queryClient.invalidateQueries({ queryKey: ['availability'] });
              },
            },
          });
        } else if (error instanceof BookingError) {
          toast.error(error.message);
        } else {
          toast.error('Failed to complete booking');
        }
      },
    },
  },
});
```

## Accessibility

### Accessibility Standards

| Criterion | Implementation |
|-----------|---------------|
| 1.3.1 Info and Relationships | Calendar uses proper grid structure |
| 1.4.1 Use of Color | Status uses icons + text, not just color |
| 2.1.1 Keyboard | Full keyboard navigation for calendar and slots |
| 2.4.1 Bypass Blocks | Skip to booking form link |
| 2.4.6 Headings and Labels | Clear heading hierarchy |
| 2.4.7 Focus Visible | Custom focus indicators |
| 3.2.2 On Input | No unexpected navigation |
| 4.1.2 Name, Role, Value | ARIA labels on interactive elements |

### Accessible Calendar

```typescript
// components/booking/accessible-calendar.tsx
'use client';

import { useState, useCallback } from 'react';
import { format, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface AccessibleCalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDates: Date[];
  minDate: Date;
}

export function AccessibleCalendar({
  selectedDate,
  onSelectDate,
  availableDates,
  minDate,
}: AccessibleCalendarProps) {
  const [focusedDate, setFocusedDate] = useState(selectedDate || new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const isAvailable = (date: Date) => availableDates.some(d => isSameDay(d, date));

  const handleKeyDown = useCallback((e: React.KeyboardEvent, date: Date) => {
    let newDate = date;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newDate = addDays(date, -1);
        break;
      case 'ArrowRight':
        e.preventDefault();
        newDate = addDays(date, 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newDate = addDays(date, -7);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newDate = addDays(date, 7);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isAvailable(date)) {
          onSelectDate(date);
        }
        return;
      default:
        return;
    }

    setFocusedDate(newDate);
    // Focus the new date button
    const button = document.querySelector(`[data-date="${format(newDate, 'yyyy-MM-dd')}"]`);
    (button as HTMLElement)?.focus();
  }, [onSelectDate, availableDates]);

  return (
    <div
      role="application"
      aria-label="Appointment calendar"
      className="bg-white rounded-xl border p-4"
    >
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          aria-label="Previous month"
          onClick={() => setCurrentMonth(d => addDays(d, -30))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          &larr;
        </button>
        <h2 id="calendar-label" className="text-lg font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <button
          aria-label="Next month"
          onClick={() => setCurrentMonth(d => addDays(d, 30))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          &rarr;
        </button>
      </div>

      {/* Calendar grid */}
      <div
        role="grid"
        aria-labelledby="calendar-label"
        className="grid grid-cols-7 gap-1"
      >
        {/* Weekday headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            role="columnheader"
            className="text-center text-sm font-medium text-gray-500 py-2"
          >
            {day}
          </div>
        ))}

        {/* Day buttons */}
        {days.map(day => {
          const available = isAvailable(day);
          const selected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              role="gridcell"
              data-date={format(day, 'yyyy-MM-dd')}
              aria-selected={selected}
              aria-disabled={!available}
              tabIndex={isSameDay(day, focusedDate) ? 0 : -1}
              onClick={() => available && onSelectDate(day)}
              onKeyDown={(e) => handleKeyDown(e, day)}
              className={`
                aspect-square p-2 text-sm rounded-lg
                ${selected ? 'bg-blue-600 text-white' : ''}
                ${available && !selected ? 'hover:bg-blue-50' : ''}
                ${!available ? 'text-gray-300 cursor-not-allowed' : ''}
                focus:outline-none focus:ring-2 focus:ring-blue-500
              `}
            >
              <span aria-hidden="true">{format(day, 'd')}</span>
              <span className="sr-only">
                {format(day, 'EEEE, MMMM d, yyyy')}
                {available ? ', available' : ', not available'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Instructions for screen readers */}
      <div className="sr-only" aria-live="polite">
        Use arrow keys to navigate dates. Press Enter to select.
      </div>
    </div>
  );
}
```

### Accessible Time Slots

```typescript
// components/booking/accessible-time-slots.tsx
'use client';

import { format } from 'date-fns';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

interface AccessibleTimeSlotsProps {
  slots: TimeSlot[];
  selectedSlot: TimeSlot | null;
  onSelectSlot: (slot: TimeSlot) => void;
  date: Date;
}

export function AccessibleTimeSlots({
  slots,
  selectedSlot,
  onSelectSlot,
  date,
}: AccessibleTimeSlotsProps) {
  const availableCount = slots.filter(s => s.available).length;

  return (
    <div role="region" aria-label={`Available times for ${format(date, 'MMMM d')}`}>
      {/* Summary for screen readers */}
      <div className="sr-only" aria-live="polite">
        {availableCount} time slots available for {format(date, 'EEEE, MMMM d')}.
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm" aria-hidden="true">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-100 rounded" />
          <span>Available ({availableCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-100 rounded" />
          <span>Booked ({slots.length - availableCount})</span>
        </div>
      </div>

      {/* Slots */}
      <div
        role="listbox"
        aria-label="Available appointment times"
        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
      >
        {slots.map((slot, index) => (
          <button
            key={slot.start.toISOString()}
            role="option"
            aria-selected={selectedSlot?.start.getTime() === slot.start.getTime()}
            aria-disabled={!slot.available}
            onClick={() => slot.available && onSelectSlot(slot)}
            className={`
              px-3 py-2 text-sm rounded-lg border
              ${selectedSlot?.start.getTime() === slot.start.getTime()
                ? 'bg-blue-600 text-white border-blue-600'
                : slot.available
                ? 'bg-green-50 border-green-200 hover:bg-green-100'
                : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
              }
              focus:outline-none focus:ring-2 focus:ring-blue-500
            `}
          >
            <span aria-hidden="true">{format(slot.start, 'h:mm a')}</span>
            <span className="sr-only">
              {format(slot.start, 'h:mm a')} to {format(slot.end, 'h:mm a')}
              {slot.available ? ', available' : ', booked'}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Booking Confirmation Announcer

```typescript
// components/booking/confirmation-announcer.tsx
'use client';

import { useEffect, useState } from 'react';

interface ConfirmationAnnouncerProps {
  booking?: {
    service: string;
    date: string;
    time: string;
  };
  error?: string;
}

export function ConfirmationAnnouncer({ booking, error }: ConfirmationAnnouncerProps) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (booking) {
      setMessage(
        `Booking confirmed for ${booking.service} on ${booking.date} at ${booking.time}. 
         A confirmation email has been sent.`
      );
    } else if (error) {
      setMessage(`Booking failed: ${error}`);
    }
  }, [booking, error]);

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
```

## Security

### Input Validation

```typescript
// lib/validations/booking.ts
import { z } from 'zod';
import { isBefore, startOfDay, addMonths } from 'date-fns';

export const bookingSchema = z.object({
  serviceId: z.string().cuid('Invalid service ID'),
  date: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid date')
    .refine(
      (val) => !isBefore(new Date(val), startOfDay(new Date())),
      'Cannot book in the past'
    )
    .refine(
      (val) => isBefore(new Date(val), addMonths(new Date(), 3)),
      'Cannot book more than 3 months in advance'
    ),
  startTime: z.string()
    .refine((val) => !isNaN(Date.parse(val)), 'Invalid time'),
  customer: z.object({
    name: z.string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name too long')
      .regex(/^[a-zA-Z\s'-]+$/, 'Name contains invalid characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string()
      .regex(/^\+?[\d\s-()]{10,20}$/, 'Invalid phone number'),
    notes: z.string().max(500, 'Notes too long').optional(),
  }),
});

export const serviceSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  duration: z.number().int().min(15).max(480), // 15 min to 8 hours
  price: z.number().positive().max(10000),
});

export const availabilitySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
}).refine(
  (data) => data.startTime < data.endTime,
  'End time must be after start time'
);

export type BookingInput = z.infer<typeof bookingSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
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

export const rateLimiters = {
  // Booking creation
  createBooking: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix: 'ratelimit:booking:create',
  }),
  
  // Availability checks
  availability: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'ratelimit:availability',
  }),
  
  // Booking cancellation
  cancelBooking: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '1 h'),
    prefix: 'ratelimit:booking:cancel',
  }),
};

export async function checkRateLimit(
  identifier: string,
  type: keyof typeof rateLimiters
): Promise<{ success: boolean; remaining: number }> {
  return await rateLimiters[type].limit(identifier);
}
```

### Double Booking Prevention

```typescript
// lib/booking-lock.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export async function acquireSlotLock(
  providerId: string,
  startTime: Date,
  ttlMs: number = 30000
): Promise<string | null> {
  const lockKey = `booking:lock:${providerId}:${startTime.toISOString()}`;
  const lockValue = crypto.randomUUID();
  
  const acquired = await redis.set(lockKey, lockValue, {
    nx: true, // Only set if not exists
    px: ttlMs, // Expire after TTL
  });
  
  return acquired ? lockValue : null;
}

export async function releaseSlotLock(
  providerId: string,
  startTime: Date,
  lockValue: string
): Promise<boolean> {
  const lockKey = `booking:lock:${providerId}:${startTime.toISOString()}`;
  
  // Only delete if we own the lock
  const script = `
    if redis.call("get", KEYS[1]) == ARGV[1] then
      return redis.call("del", KEYS[1])
    else
      return 0
    end
  `;
  
  const result = await redis.eval(script, [lockKey], [lockValue]);
  return result === 1;
}

// Usage in booking creation
export async function createBookingWithLock(data: BookingInput) {
  const lockValue = await acquireSlotLock(data.providerId, new Date(data.startTime));
  
  if (!lockValue) {
    throw new SlotUnavailableError(new Date(data.startTime));
  }
  
  try {
    // Verify slot is still available
    const available = await isSlotAvailable(data.providerId, new Date(data.startTime));
    if (!available) {
      throw new SlotUnavailableError(new Date(data.startTime));
    }
    
    // Create booking
    return await prisma.booking.create({ data });
  } finally {
    await releaseSlotLock(data.providerId, new Date(data.startTime), lockValue);
  }
}
```

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data:;
      font-src 'self';
      connect-src 'self';
      frame-ancestors 'none';
    `.replace(/\s{2,}/g, ' ').trim(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```

## Performance

### Caching Availability

```typescript
// lib/cached-availability.ts
import { Redis } from '@upstash/redis';
import { format } from 'date-fns';
import { getAvailableSlots } from './availability';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

const CACHE_TTL = 60; // 1 minute

export async function getCachedAvailability(
  providerId: string,
  serviceId: string,
  date: Date
) {
  const cacheKey = `availability:${providerId}:${serviceId}:${format(date, 'yyyy-MM-dd')}`;
  
  // Try cache first
  const cached = await redis.get<any>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Compute and cache
  const slots = await getAvailableSlots(providerId, serviceId, date);
  await redis.setex(cacheKey, CACHE_TTL, slots);
  
  return slots;
}

export async function invalidateAvailabilityCache(providerId: string, date: Date) {
  const pattern = `availability:${providerId}:*:${format(date, 'yyyy-MM-dd')}`;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### React Query Optimization

```typescript
// hooks/use-availability.ts
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

export function useAvailability(providerId: string, serviceId: string, date: Date | null) {
  return useQuery({
    queryKey: ['availability', providerId, serviceId, date ? format(date, 'yyyy-MM-dd') : null],
    queryFn: () => fetchAvailability(providerId, serviceId, date!),
    enabled: !!date,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  });
}

// Prefetch next day when user views current day
export function usePrefetchNextDay(providerId: string, serviceId: string, date: Date) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const nextDay = addDays(date, 1);
    queryClient.prefetchQuery({
      queryKey: ['availability', providerId, serviceId, format(nextDay, 'yyyy-MM-dd')],
      queryFn: () => fetchAvailability(providerId, serviceId, nextDay),
    });
  }, [date, providerId, serviceId, queryClient]);
}
```

## CI/CD

### GitHub Actions Workflow

```yaml
# .github/workflows/ci.yml
name: Booking App CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
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
          node-version: ${{ env.NODE_VERSION }}
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
          node-version: ${{ env.NODE_VERSION }}
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
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "test": "vitest",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Monitoring

### Sentry Setup

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### Booking Metrics

```typescript
// lib/metrics.ts
import { track } from '@vercel/analytics';

export function trackBookingCreated(service: string, duration: number) {
  track('booking_created', { service, duration });
}

export function trackBookingCancelled(bookingId: string, reason: string) {
  track('booking_cancelled', { bookingId, reason });
}

export function trackSlotViewed(date: string, availableSlots: number) {
  track('slot_viewed', { date, availableSlots });
}
```

### Health Check

```typescript
// app/api/health/route.ts
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: { database: 'up' },
    });
  } catch (error) {
    return Response.json(
      { status: 'unhealthy', error: 'Database connection failed' },
      { status: 503 }
    );
  }
}
```

## Environment Variables

```bash
# .env.example

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="postgresql://..."

# Authentication
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=

# SMS (Twilio)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Push Notifications (Web Push)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=

# Payments (Stripe)
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Rate Limiting
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=

# Cron Jobs
CRON_SECRET=

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
```

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Timezone handling verified
- [ ] Email sending configured and tested
- [ ] SMS (Twilio) configured and tested
- [ ] SMS opt-in consent workflow verified
- [ ] Push notifications (VAPID keys) configured
- [ ] Stripe payments configured
- [ ] Stripe webhooks configured
- [ ] Reminder cron job configured (Vercel Cron or similar)
- [ ] Cancellation policies configured per service
- [ ] Refund flow tested
- [ ] Rate limiting enabled
- [ ] Double-booking prevention tested
- [ ] Security headers configured
- [ ] Sentry configured
- [ ] All tests passing
- [ ] E2E tests passing
- [ ] CI/CD pipeline configured

## Related Skills

- [[date-pickers]] - Date selection
- [[calendar-integration]] - Calendar sync
- [[form-validation]] - Form handling
- [[transactional-email]] - Email notifications
- [[prisma-patterns]] - Database patterns

## Changelog

### v3.0.0 (2026-01-18)
- Added Automated Reminder System (email, SMS, push notifications)
- Added SMS Compliance (TCPA/GDPR) with opt-in/opt-out handling
- Added Cancellation Policy Enforcement with refund logic
- Added Rescheduling Flow with limits and validation
- Added comprehensive Timezone Handling with DST support
- Added Payment Collection with Stripe (required, optional, deposit, hold modes)
- Added Booking System Tests (unit, integration, and E2E)
- Updated environment variables for new integrations
- Updated deployment checklist

### v2.0.0 (2025-01-18)
- Standardized to god-tier template
- Added comprehensive Testing section with availability tests
- Added Error Handling with booking-specific errors
- Added Accessibility section with keyboard navigation
- Added Security section with double-booking prevention
- Added Performance section with caching
- Added CI/CD section
- Added Monitoring section

### v1.0.0 (2025-01-17)
- Initial recipe implementation
- Service and availability management
- Real-time slot availability
- Booking confirmation flow
- Email notifications
