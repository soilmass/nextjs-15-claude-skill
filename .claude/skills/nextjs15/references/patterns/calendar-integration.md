---
id: pt-calendar-integration
name: Calendar Integration
version: 2.0.0
layer: L5
category: browser
description: Google Calendar and Outlook integration with event creation and syncing
tags: [calendar, google-calendar, outlook, events, scheduling, oauth]
composes:
  - ../organisms/calendar.md
  - ../atoms/input-button.md
dependencies:
  date-fns: "^4.1.0"
formula: OAuth + Calendar API + Event Types = Calendar Sync
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

## When to Use

- Integrating with Google Calendar or Outlook
- Creating and managing calendar events
- Exporting events as ICS files
- Implementing scheduling and booking systems
- Syncing events across platforms

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Calendar Integration Flow                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ OAuth Authentication                                │   │
│  │ - Google OAuth 2.0 / Microsoft OAuth                │   │
│  │ - Store refresh tokens securely                     │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                    │
│                        ▼                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Calendar API Client                                 │   │
│  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │   │
│  │ │ Create      │ │ Read        │ │ Update      │   │   │
│  │ │ Events      │ │ Events      │ │ Events      │   │   │
│  │ └─────────────┘ └─────────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Export Options:                                            │
│  - ICS file download (Add to Calendar)                     │
│  - Google Calendar URL link                                 │
│  - Outlook Web link                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# Calendar Integration

## Overview

Integrate with Google Calendar and Microsoft Outlook for event management, scheduling, and syncing. Includes OAuth authentication, event CRUD operations, and calendar export functionality.

## Implementation

### Calendar Types

```tsx
// lib/calendar/types.ts
export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  attendees?: EventAttendee[];
  recurrence?: RecurrenceRule;
  reminders?: EventReminder[];
  status?: 'confirmed' | 'tentative' | 'cancelled';
  visibility?: 'default' | 'public' | 'private';
}

export interface EventAttendee {
  email: string;
  name?: string;
  responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  count?: number;
  until?: Date;
  byDay?: string[];
}

export interface EventReminder {
  method: 'email' | 'popup';
  minutes: number;
}

export interface Calendar {
  id: string;
  name: string;
  color?: string;
  primary?: boolean;
}

export type CalendarProvider = 'google' | 'outlook';
```

### Calendar Service Interface

```tsx
// lib/calendar/calendar-service.ts
import { CalendarEvent, Calendar, CalendarProvider } from './types';

export interface ICalendarService {
  provider: CalendarProvider;
  getCalendars(): Promise<Calendar[]>;
  getEvents(calendarId: string, start: Date, end: Date): Promise<CalendarEvent[]>;
  createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent>;
  updateEvent(calendarId: string, eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEvent>;
  deleteEvent(calendarId: string, eventId: string): Promise<void>;
}
```

### Google Calendar Service

```tsx
// lib/calendar/google-calendar.ts
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ICalendarService, CalendarEvent, Calendar } from './types';

export class GoogleCalendarService implements ICalendarService {
  provider: 'google' = 'google';
  private calendar: calendar_v3.Calendar;

  constructor(accessToken: string) {
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async getCalendars(): Promise<Calendar[]> {
    const response = await this.calendar.calendarList.list();
    return (response.data.items || []).map((cal) => ({
      id: cal.id!,
      name: cal.summary!,
      color: cal.backgroundColor || undefined,
      primary: cal.primary || false,
    }));
  }

  async getEvents(calendarId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
    const response = await this.calendar.events.list({
      calendarId,
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []).map(this.mapGoogleEvent);
  }

  async createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent> {
    const response = await this.calendar.events.insert({
      calendarId,
      requestBody: this.toGoogleEvent(event),
    });

    return this.mapGoogleEvent(response.data);
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    const response = await this.calendar.events.patch({
      calendarId,
      eventId,
      requestBody: this.toGoogleEvent(event as CalendarEvent),
    });

    return this.mapGoogleEvent(response.data);
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.calendar.events.delete({ calendarId, eventId });
  }

  private mapGoogleEvent(event: calendar_v3.Schema$Event): CalendarEvent {
    const isAllDay = !event.start?.dateTime;
    return {
      id: event.id!,
      title: event.summary || 'Untitled',
      description: event.description || undefined,
      location: event.location || undefined,
      start: new Date(event.start?.dateTime || event.start?.date || ''),
      end: new Date(event.end?.dateTime || event.end?.date || ''),
      allDay: isAllDay,
      attendees: event.attendees?.map((a) => ({
        email: a.email!,
        name: a.displayName || undefined,
        responseStatus: a.responseStatus as EventAttendee['responseStatus'],
      })),
      status: event.status as CalendarEvent['status'],
    };
  }

  private toGoogleEvent(event: CalendarEvent): calendar_v3.Schema$Event {
    const googleEvent: calendar_v3.Schema$Event = {
      summary: event.title,
      description: event.description,
      location: event.location,
      attendees: event.attendees?.map((a) => ({
        email: a.email,
        displayName: a.name,
      })),
    };

    if (event.allDay) {
      googleEvent.start = { date: event.start.toISOString().split('T')[0] };
      googleEvent.end = { date: event.end.toISOString().split('T')[0] };
    } else {
      googleEvent.start = { dateTime: event.start.toISOString() };
      googleEvent.end = { dateTime: event.end.toISOString() };
    }

    if (event.recurrence) {
      googleEvent.recurrence = [this.toRRule(event.recurrence)];
    }

    if (event.reminders) {
      googleEvent.reminders = {
        useDefault: false,
        overrides: event.reminders.map((r) => ({
          method: r.method,
          minutes: r.minutes,
        })),
      };
    }

    return googleEvent;
  }

  private toRRule(rule: RecurrenceRule): string {
    let rrule = `RRULE:FREQ=${rule.frequency.toUpperCase()}`;
    if (rule.interval) rrule += `;INTERVAL=${rule.interval}`;
    if (rule.count) rrule += `;COUNT=${rule.count}`;
    if (rule.until) rrule += `;UNTIL=${rule.until.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;
    if (rule.byDay) rrule += `;BYDAY=${rule.byDay.join(',')}`;
    return rrule;
  }
}
```

### Microsoft Outlook Service

```tsx
// lib/calendar/outlook-calendar.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { ICalendarService, CalendarEvent, Calendar, RecurrenceRule } from './types';

export class OutlookCalendarService implements ICalendarService {
  provider: 'outlook' = 'outlook';
  private client: Client;

  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => done(null, accessToken),
    });
  }

  async getCalendars(): Promise<Calendar[]> {
    const response = await this.client.api('/me/calendars').get();
    return response.value.map((cal: any) => ({
      id: cal.id,
      name: cal.name,
      color: cal.hexColor || undefined,
      primary: cal.isDefaultCalendar || false,
    }));
  }

  async getEvents(calendarId: string, start: Date, end: Date): Promise<CalendarEvent[]> {
    const response = await this.client
      .api(`/me/calendars/${calendarId}/events`)
      .filter(`start/dateTime ge '${start.toISOString()}' and end/dateTime le '${end.toISOString()}'`)
      .orderby('start/dateTime')
      .get();

    return response.value.map(this.mapOutlookEvent);
  }

  async createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent> {
    const response = await this.client
      .api(`/me/calendars/${calendarId}/events`)
      .post(this.toOutlookEvent(event));

    return this.mapOutlookEvent(response);
  }

  async updateEvent(
    calendarId: string,
    eventId: string,
    event: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    const response = await this.client
      .api(`/me/calendars/${calendarId}/events/${eventId}`)
      .patch(this.toOutlookEvent(event as CalendarEvent));

    return this.mapOutlookEvent(response);
  }

  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.client.api(`/me/calendars/${calendarId}/events/${eventId}`).delete();
  }

  private mapOutlookEvent(event: any): CalendarEvent {
    return {
      id: event.id,
      title: event.subject || 'Untitled',
      description: event.body?.content || undefined,
      location: event.location?.displayName || undefined,
      start: new Date(event.start.dateTime + 'Z'),
      end: new Date(event.end.dateTime + 'Z'),
      allDay: event.isAllDay || false,
      attendees: event.attendees?.map((a: any) => ({
        email: a.emailAddress.address,
        name: a.emailAddress.name,
        responseStatus: this.mapResponseStatus(a.status?.response),
      })),
    };
  }

  private toOutlookEvent(event: CalendarEvent): any {
    return {
      subject: event.title,
      body: event.description ? { contentType: 'text', content: event.description } : undefined,
      location: event.location ? { displayName: event.location } : undefined,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: 'UTC',
      },
      isAllDay: event.allDay || false,
      attendees: event.attendees?.map((a) => ({
        emailAddress: { address: a.email, name: a.name },
        type: 'required',
      })),
    };
  }

  private mapResponseStatus(status: string): EventAttendee['responseStatus'] {
    const map: Record<string, EventAttendee['responseStatus']> = {
      none: 'needsAction',
      declined: 'declined',
      tentativelyAccepted: 'tentative',
      accepted: 'accepted',
    };
    return map[status] || 'needsAction';
  }
}
```

### Calendar Hook

```tsx
// hooks/use-calendar.ts
'use client';

import { useState, useCallback } from 'react';
import { CalendarEvent, Calendar, CalendarProvider } from '@/lib/calendar/types';

interface UseCalendarOptions {
  provider: CalendarProvider;
}

export function useCalendar({ provider }: UseCalendarOptions) {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendars = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/calendar/calendars?provider=${provider}`);
      if (!response.ok) throw new Error('Failed to fetch calendars');
      
      const data = await response.json();
      setCalendars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendars');
    } finally {
      setIsLoading(false);
    }
  }, [provider]);

  const fetchEvents = useCallback(
    async (calendarId: string, start: Date, end: Date) => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          provider,
          calendarId,
          start: start.toISOString(),
          end: end.toISOString(),
        });

        const response = await fetch(`/api/calendar/events?${params}`);
        if (!response.ok) throw new Error('Failed to fetch events');

        const data = await response.json();
        setEvents(data.map((e: any) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setIsLoading(false);
      }
    },
    [provider]
  );

  const createEvent = useCallback(
    async (calendarId: string, event: CalendarEvent) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/calendar/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, calendarId, event }),
        });

        if (!response.ok) throw new Error('Failed to create event');

        const newEvent = await response.json();
        setEvents((prev) => [...prev, { ...newEvent, start: new Date(newEvent.start), end: new Date(newEvent.end) }]);
        return newEvent;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create event');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [provider]
  );

  const deleteEvent = useCallback(
    async (calendarId: string, eventId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/calendar/events', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ provider, calendarId, eventId }),
        });

        if (!response.ok) throw new Error('Failed to delete event');

        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete event');
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [provider]
  );

  return {
    calendars,
    events,
    isLoading,
    error,
    fetchCalendars,
    fetchEvents,
    createEvent,
    deleteEvent,
  };
}
```

### Add to Calendar Button

```tsx
// components/add-to-calendar.tsx
'use client';

import { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { CalendarEvent } from '@/lib/calendar/types';

interface AddToCalendarProps {
  event: CalendarEvent;
  className?: string;
}

export function AddToCalendar({ event, className }: AddToCalendarProps) {
  const generateGoogleUrl = () => {
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${formatDate(event.start)}/${formatDate(event.end)}`,
      details: event.description || '',
      location: event.location || '',
    });

    return `https://calendar.google.com/calendar/render?${params}`;
  };

  const generateOutlookUrl = () => {
    const params = new URLSearchParams({
      subject: event.title,
      startdt: event.start.toISOString(),
      enddt: event.end.toISOString(),
      body: event.description || '',
      location: event.location || '',
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params}`;
  };

  const generateYahooUrl = () => {
    const params = new URLSearchParams({
      v: '60',
      title: event.title,
      st: formatDate(event.start),
      et: formatDate(event.end),
      desc: event.description || '',
      in_loc: event.location || '',
    });

    return `https://calendar.yahoo.com/?${params}`;
  };

  const generateICSContent = () => {
    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Your App//EN',
      'BEGIN:VEVENT',
      `DTSTART:${formatDate(event.start)}`,
      `DTEND:${formatDate(event.end)}`,
      `SUMMARY:${event.title}`,
      event.description ? `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}` : '',
      event.location ? `LOCATION:${event.location}` : '',
      `UID:${Date.now()}@yourapp.com`,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
      .filter(Boolean)
      .join('\r\n');

    return ics;
  };

  const downloadICS = () => {
    const content = generateICSContent();
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${className}`}
        >
          <Calendar className="w-4 h-4" />
          Add to Calendar
          <ChevronDown className="w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-white rounded-md shadow-lg border p-1 z-50"
          sideOffset={5}
        >
          <DropdownMenu.Item asChild>
            <a
              href={generateGoogleUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
            >
              Google Calendar
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <a
              href={generateOutlookUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
            >
              Outlook
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Item asChild>
            <a
              href={generateYahooUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
            >
              Yahoo Calendar
            </a>
          </DropdownMenu.Item>

          <DropdownMenu.Separator className="h-px bg-gray-200 my-1" />

          <DropdownMenu.Item
            onClick={downloadICS}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 cursor-pointer"
          >
            Download .ics file
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function formatDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}
```

### Calendar API Routes

```tsx
// app/api/calendar/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { GoogleCalendarService } from '@/lib/calendar/google-calendar';
import { OutlookCalendarService } from '@/lib/calendar/outlook-calendar';

export async function GET(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const provider = searchParams.get('provider');
  const calendarId = searchParams.get('calendarId');
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  if (!provider || !calendarId || !start || !end) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken(session, provider);
    const service = provider === 'google'
      ? new GoogleCalendarService(accessToken)
      : new OutlookCalendarService(accessToken);

    const events = await service.getEvents(calendarId, new Date(start), new Date(end));
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { provider, calendarId, event } = await request.json();

  try {
    const accessToken = await getAccessToken(session, provider);
    const service = provider === 'google'
      ? new GoogleCalendarService(accessToken)
      : new OutlookCalendarService(accessToken);

    const created = await service.createEvent(calendarId, {
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    });

    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create event' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { provider, calendarId, eventId } = await request.json();

  try {
    const accessToken = await getAccessToken(session, provider);
    const service = provider === 'google'
      ? new GoogleCalendarService(accessToken)
      : new OutlookCalendarService(accessToken);

    await service.deleteEvent(calendarId, eventId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete event' },
      { status: 500 }
    );
  }
}

async function getAccessToken(session: any, provider: string): Promise<string> {
  // Implement token retrieval based on your auth setup
  return session.accessToken;
}
```

## Usage

```tsx
// app/events/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCalendar } from '@/hooks/use-calendar';
import { AddToCalendar } from '@/components/add-to-calendar';
import { CalendarEvent } from '@/lib/calendar/types';

export default function EventsPage() {
  const { calendars, events, fetchCalendars, fetchEvents, createEvent, isLoading } = useCalendar({
    provider: 'google',
  });

  const [selectedCalendar, setSelectedCalendar] = useState<string>('');

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  useEffect(() => {
    if (selectedCalendar) {
      const start = new Date();
      const end = new Date();
      end.setMonth(end.getMonth() + 1);
      fetchEvents(selectedCalendar, start, end);
    }
  }, [selectedCalendar, fetchEvents]);

  const sampleEvent: CalendarEvent = {
    title: 'Team Meeting',
    description: 'Weekly sync meeting',
    location: 'Conference Room A',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000),
    end: new Date(Date.now() + 25 * 60 * 60 * 1000),
  };

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">Calendar Events</h1>

      <div className="flex gap-4">
        <select
          value={selectedCalendar}
          onChange={(e) => setSelectedCalendar(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">Select Calendar</option>
          {calendars.map((cal) => (
            <option key={cal.id} value={cal.id}>
              {cal.name}
            </option>
          ))}
        </select>

        <AddToCalendar event={sampleEvent} />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="p-4 border rounded-lg">
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-500">
                {event.start.toLocaleString()} - {event.end.toLocaleString()}
              </p>
              {event.location && (
                <p className="text-sm text-gray-600">{event.location}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Related Skills

- [[date-pickers]] - Date selection
- [[scheduling]] - Appointment scheduling
- [[oauth]] - OAuth authentication
- [[notifications]] - Event reminders

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0 (2025-01-17)
- Initial implementation
- Google Calendar and Outlook support
- Event CRUD operations
- Add to Calendar button
- ICS file generation
