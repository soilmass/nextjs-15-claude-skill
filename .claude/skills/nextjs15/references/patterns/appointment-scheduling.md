---
id: pt-appointment-scheduling
name: Appointment Scheduling
version: 1.0.0
layer: L5
category: scheduling
description: Calendar-based appointment scheduling with availability management and conflict detection
tags: [scheduling, calendar, appointments, booking, next15]
composes:
  - ../organisms/calendar.md
dependencies: []
formula: "AppointmentScheduling = Calendar + AvailabilitySlots + ConflictDetection + Notifications"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Appointment Scheduling

## When to Use

- Building booking systems for services
- Scheduling meetings with availability checks
- Managing resource allocation (rooms, equipment)
- Creating appointment-based workflows
- Implementing recurring appointments

## Composition Diagram

```
Appointment Flow
================

+------------------------------------------+
|  Availability Configuration              |
|  - Working hours                         |
|  - Blocked times                         |
|  - Buffer between appointments           |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Calendar View                           |
|  - Available slots (green)               |
|  - Booked slots (gray)                   |
|  - Selected slot (blue)                  |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Booking Confirmation                    |
|  - Attendee details                      |
|  - Conflict check                        |
|  - Confirmation email                    |
+------------------------------------------+
```

## Database Schema

```prisma
// prisma/schema.prisma
model Appointment {
  id          String    @id @default(cuid())
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime
  status      String    @default("confirmed") // confirmed, cancelled, completed
  hostId      String
  host        User      @relation("HostAppointments", fields: [hostId], references: [id])
  attendeeId  String?
  attendee    User?     @relation("AttendeeAppointments", fields: [attendeeId], references: [id])
  attendeeName  String?
  attendeeEmail String?
  location    String?
  notes       String?
  reminderSent Boolean  @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([hostId, startTime])
  @@index([attendeeId])
}

model Availability {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  dayOfWeek Int      // 0-6 (Sunday-Saturday)
  startTime String   // "09:00"
  endTime   String   // "17:00"
  isActive  Boolean  @default(true)

  @@unique([userId, dayOfWeek])
}

model BlockedTime {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  startTime DateTime
  endTime   DateTime
  reason    String?

  @@index([userId, startTime, endTime])
}
```

## Availability Service

```typescript
// lib/scheduling/availability.ts
import { prisma } from '@/lib/db';
import { addMinutes, format, parse, isBefore, isAfter } from 'date-fns';

const SLOT_DURATION = 30; // minutes
const BUFFER_TIME = 15; // minutes between appointments

export async function getAvailableSlots(
  hostId: string,
  date: Date
): Promise<{ start: Date; end: Date }[]> {
  const dayOfWeek = date.getDay();

  // Get host's availability for this day
  const availability = await prisma.availability.findUnique({
    where: { userId_dayOfWeek: { userId: hostId, dayOfWeek } },
  });

  if (!availability || !availability.isActive) {
    return [];
  }

  // Get existing appointments for this day
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const [appointments, blockedTimes] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        hostId,
        startTime: { gte: startOfDay, lte: endOfDay },
        status: { not: 'cancelled' },
      },
    }),
    prisma.blockedTime.findMany({
      where: {
        userId: hostId,
        startTime: { lte: endOfDay },
        endTime: { gte: startOfDay },
      },
    }),
  ]);

  // Generate all possible slots
  const slots: { start: Date; end: Date }[] = [];
  const dayStart = parse(availability.startTime, 'HH:mm', date);
  const dayEnd = parse(availability.endTime, 'HH:mm', date);

  let current = dayStart;
  while (isBefore(addMinutes(current, SLOT_DURATION), dayEnd)) {
    const slotEnd = addMinutes(current, SLOT_DURATION);

    // Check if slot conflicts with appointments
    const hasConflict = appointments.some((apt) => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = addMinutes(new Date(apt.endTime), BUFFER_TIME);
      return !(slotEnd <= aptStart || current >= aptEnd);
    });

    // Check if slot is blocked
    const isBlocked = blockedTimes.some((block) => {
      return !(slotEnd <= block.startTime || current >= block.endTime);
    });

    // Don't show past slots
    const isPast = isBefore(current, new Date());

    if (!hasConflict && !isBlocked && !isPast) {
      slots.push({ start: new Date(current), end: slotEnd });
    }

    current = addMinutes(current, SLOT_DURATION);
  }

  return slots;
}
```

## Booking Service

```typescript
// lib/scheduling/booking.ts
import { prisma } from '@/lib/db';
import { sendEmail } from '@/lib/email';

interface BookingData {
  hostId: string;
  startTime: Date;
  endTime: Date;
  attendeeName: string;
  attendeeEmail: string;
  title?: string;
  notes?: string;
}

export async function createAppointment(data: BookingData) {
  // Check for conflicts
  const conflict = await prisma.appointment.findFirst({
    where: {
      hostId: data.hostId,
      status: { not: 'cancelled' },
      OR: [
        { startTime: { lt: data.endTime }, endTime: { gt: data.startTime } },
      ],
    },
  });

  if (conflict) {
    throw new Error('Time slot is no longer available');
  }

  const appointment = await prisma.appointment.create({
    data: {
      hostId: data.hostId,
      startTime: data.startTime,
      endTime: data.endTime,
      attendeeName: data.attendeeName,
      attendeeEmail: data.attendeeEmail,
      title: data.title || 'Appointment',
      notes: data.notes,
    },
    include: { host: true },
  });

  // Send confirmation emails
  await Promise.all([
    sendEmail({
      to: data.attendeeEmail,
      subject: `Appointment Confirmed - ${appointment.title}`,
      template: 'appointment-confirmation',
      data: { appointment },
    }),
    sendEmail({
      to: appointment.host.email,
      subject: `New Appointment - ${appointment.title}`,
      template: 'new-appointment-host',
      data: { appointment },
    }),
  ]);

  return appointment;
}

export async function cancelAppointment(appointmentId: string, reason?: string) {
  const appointment = await prisma.appointment.update({
    where: { id: appointmentId },
    data: { status: 'cancelled', notes: reason },
    include: { host: true },
  });

  // Send cancellation emails
  if (appointment.attendeeEmail) {
    await sendEmail({
      to: appointment.attendeeEmail,
      subject: `Appointment Cancelled - ${appointment.title}`,
      template: 'appointment-cancelled',
      data: { appointment, reason },
    });
  }

  return appointment;
}
```

## Booking Calendar Component

```typescript
// components/scheduling/booking-calendar.tsx
'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, addDays, startOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface BookingCalendarProps {
  hostId: string;
  onSlotSelect: (slot: { start: Date; end: Date }) => void;
}

export function BookingCalendar({ hostId, onSlotSelect }: BookingCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const { data: slots, isLoading } = useQuery({
    queryKey: ['availability', hostId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () =>
      fetch(`/api/availability/${hostId}?date=${format(selectedDate, 'yyyy-MM-dd')}`)
        .then((r) => r.json()),
  });

  const weekStart = startOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => (
          <button
            key={day.toISOString()}
            onClick={() => setSelectedDate(day)}
            className={cn(
              'p-2 text-center rounded-lg',
              format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            )}
          >
            <div className="text-xs">{format(day, 'EEE')}</div>
            <div className="text-lg font-medium">{format(day, 'd')}</div>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2">
        {isLoading ? (
          <div>Loading...</div>
        ) : slots?.data?.length === 0 ? (
          <div className="col-span-3 text-center text-muted-foreground py-8">
            No available slots for this day
          </div>
        ) : (
          slots?.data?.map((slot: any) => (
            <Button
              key={slot.start}
              variant={selectedSlot?.start === slot.start ? 'default' : 'outline'}
              onClick={() => {
                setSelectedSlot(slot);
                onSlotSelect(slot);
              }}
            >
              {format(new Date(slot.start), 'h:mm a')}
            </Button>
          ))
        )}
      </div>
    </div>
  );
}
```

## Booking API Endpoint

```typescript
// app/api/appointments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createAppointment } from '@/lib/scheduling/booking';

const bookingSchema = z.object({
  hostId: z.string(),
  startTime: z.string().transform((s) => new Date(s)),
  endTime: z.string().transform((s) => new Date(s)),
  attendeeName: z.string().min(1),
  attendeeEmail: z.string().email(),
  title: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);

    const appointment = await createAppointment(data);

    return NextResponse.json({ data: appointment }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message.includes('no longer available')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}
```

## Anti-patterns

### Don't Skip Conflict Checks

```typescript
// BAD - No conflict detection
await prisma.appointment.create({ data });

// GOOD - Always check for conflicts
const conflict = await prisma.appointment.findFirst({
  where: { hostId, startTime: { lt: endTime }, endTime: { gt: startTime } },
});
if (conflict) throw new Error('Time slot unavailable');
```

## Related Skills

- [date-pickers](./date-pickers.md)
- [notifications](./notifications.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Availability management
- Conflict detection
- Email notifications
