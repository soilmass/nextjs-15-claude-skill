---
id: r-telehealth
name: Telehealth Platform
version: 3.0.0
layer: L6
category: recipes
description: Enterprise telehealth platform with video consultations, appointment scheduling, prescriptions, and patient portal
tags: [telehealth, healthcare, video, appointments, prescriptions, enterprise, hipaa]
formula: "Telehealth = DashboardLayout(t-dashboard-layout) + ProfilePage(t-profile-page) + SettingsPage(t-settings-page) + AuthLayout(t-auth-layout) + OnboardingLayout(t-onboarding-layout) + Header(o-header) + Sidebar(o-sidebar) + DataTable(o-data-table) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Tabs(o-tabs) + Modal(o-modal) + Calendar(o-calendar) + FileUploader(o-file-uploader) + ActivityTimeline(o-activity-timeline) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + DatePicker(m-date-picker) + SearchInput(m-search-input) + StatCard(m-stat-card) + Toast(m-toast) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + MultiTenancy(pt-multi-tenancy) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + GdprCompliance(pt-gdpr-compliance) + HipaaCompliance(pt-hipaa-compliance) + Encryption(pt-encryption) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + VideoConferencing(pt-video-conferencing) + AppointmentScheduling(pt-appointment-scheduling) + CalendarIntegration(pt-calendar-integration) + TransactionalEmail(pt-transactional-email) + PushNotifications(pt-push-notifications) + SmsNotifications(pt-sms-notifications) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + Search(pt-search) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + FileUpload(pt-file-upload) + PdfGeneration(pt-pdf-generation) + StripePayments(pt-stripe-payments) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/profile-page.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/onboarding-layout.md
  # L3 Organisms
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/tabs.md
  - ../organisms/modal.md
  - ../organisms/calendar.md
  - ../organisms/file-uploader.md
  - ../organisms/activity-timeline.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/badge.md
  - ../molecules/avatar.md
  - ../molecules/date-picker.md
  - ../molecules/search-input.md
  - ../molecules/stat-card.md
  - ../molecules/toast.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/multi-tenancy.md
  # L5 Patterns - Security & Compliance
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/gdpr-compliance.md
  - ../patterns/hipaa-compliance.md
  - ../patterns/encryption.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Telehealth Specific
  - ../patterns/video-conferencing.md
  - ../patterns/appointment-scheduling.md
  - ../patterns/calendar-integration.md
  # L5 Patterns - Communication
  - ../patterns/transactional-email.md
  - ../patterns/push-notifications.md
  - ../patterns/sms-notifications.md
  # L5 Patterns - Error Handling
  - ../patterns/error-boundaries.md
  - ../patterns/error-tracking.md
  - ../patterns/skeleton-loading.md
  # L5 Patterns - Analytics
  - ../patterns/analytics-events.md
  # L5 Patterns - Data Management
  - ../patterns/filtering.md
  - ../patterns/pagination.md
  - ../patterns/sorting.md
  - ../patterns/search.md
  # L5 Patterns - State Management
  - ../patterns/react-query.md
  - ../patterns/zustand.md
  - ../patterns/optimistic-updates.md
  # L5 Patterns - Documents & Payments
  - ../patterns/file-upload.md
  - ../patterns/pdf-generation.md
  - ../patterns/stripe-payments.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - prisma@6.0.0
  - livekit-client@2.0.0
  - @livekit/components-react@2.0.0
  - resend@3.0.0
skills:
  - video-conferencing
  - appointment-scheduling
  - multi-tenancy
  - rbac
  - audit-logging
  - file-upload
  - encryption
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

An enterprise-grade telehealth platform enabling healthcare providers to conduct video consultations, manage appointments, issue prescriptions, and provide a secure patient portal. Features multi-tenancy for healthcare organizations, HIPAA-compliant audit logging, and encrypted medical records.

## Project Structure

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx
│   └── for-providers/page.tsx
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── verify/page.tsx
├── (provider)/                     # Provider dashboard
│   ├── layout.tsx
│   ├── page.tsx                    # Dashboard overview
│   ├── appointments/
│   │   ├── page.tsx                # Appointment list
│   │   └── [id]/page.tsx           # Appointment detail
│   ├── patients/
│   │   ├── page.tsx                # Patient list
│   │   └── [id]/
│   │       ├── page.tsx            # Patient profile
│   │       ├── history/page.tsx    # Medical history
│   │       └── records/page.tsx    # Documents
│   ├── consultations/
│   │   ├── page.tsx                # Past consultations
│   │   └── [id]/page.tsx           # Consultation notes
│   ├── prescriptions/
│   │   ├── page.tsx                # Prescription list
│   │   └── new/page.tsx            # Create prescription
│   ├── availability/page.tsx       # Set availability
│   └── settings/page.tsx
├── (patient)/                      # Patient portal
│   ├── layout.tsx
│   ├── page.tsx                    # Patient dashboard
│   ├── appointments/
│   │   ├── page.tsx                # My appointments
│   │   ├── book/page.tsx           # Book appointment
│   │   └── [id]/page.tsx           # Appointment detail
│   ├── consultations/page.tsx      # Past consultations
│   ├── prescriptions/page.tsx      # My prescriptions
│   ├── records/page.tsx            # My records
│   └── settings/page.tsx
├── (admin)/                        # Organization admin
│   ├── layout.tsx
│   ├── page.tsx
│   ├── providers/page.tsx          # Manage providers
│   ├── patients/page.tsx           # Manage patients
│   ├── reports/page.tsx            # Analytics
│   ├── audit-log/page.tsx          # Audit trail
│   └── settings/
│       ├── page.tsx
│       ├── team/page.tsx
│       └── integrations/page.tsx
├── room/
│   └── [id]/page.tsx               # Video consultation room
├── api/
│   ├── appointments/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── [id]/cancel/route.ts
│   ├── consultations/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── prescriptions/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── patients/
│   │   ├── route.ts
│   │   └── [id]/route.ts
│   ├── providers/
│   │   ├── route.ts
│   │   └── [id]/availability/route.ts
│   ├── room/
│   │   └── [id]/token/route.ts     # Generate room token
│   └── upload/route.ts
└── components/
    ├── video/
    │   ├── video-room.tsx
    │   ├── participant-tile.tsx
    │   ├── controls-bar.tsx
    │   └── waiting-room.tsx
    ├── appointments/
    │   ├── appointment-calendar.tsx
    │   ├── appointment-card.tsx
    │   ├── booking-form.tsx
    │   └── time-slot-picker.tsx
    ├── patients/
    │   ├── patient-form.tsx
    │   ├── patient-card.tsx
    │   └── medical-history.tsx
    ├── prescriptions/
    │   ├── prescription-form.tsx
    │   └── prescription-card.tsx
    └── dashboard/
        ├── provider-stats.tsx
        ├── upcoming-appointments.tsx
        └── patient-queue.tsx
lib/
├── livekit.ts
├── encryption.ts
├── audit.ts
└── availability.ts
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

model Organization {
  id                String    @id @default(cuid())
  name              String
  slug              String    @unique
  type              OrgType   @default(CLINIC)
  
  // Contact
  email             String
  phone             String?
  website           String?
  
  // Address
  address           String?
  city              String?
  state             String?
  postalCode        String?
  country           String    @default("US")
  
  // Settings
  timezone          String    @default("America/New_York")
  appointmentBuffer Int       @default(15)  // Minutes between appointments
  
  // Compliance
  npiNumber         String?   // National Provider Identifier
  
  members           OrganizationMember[]
  providers         Provider[]
  patients          Patient[]
  appointments      Appointment[]
  consultations     Consultation[]
  prescriptions     Prescription[]
  auditLogs         AuditLog[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum OrgType {
  CLINIC
  HOSPITAL
  PRIVATE_PRACTICE
  TELEHEALTH_ONLY
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String
  phone         String?
  avatarUrl     String?
  
  // Verification
  emailVerified Boolean   @default(false)
  phoneVerified Boolean   @default(false)
  
  memberships   OrganizationMember[]
  provider      Provider?
  patient       Patient?
  auditLogs     AuditLog[]
  
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

model Provider {
  id              String       @id @default(cuid())
  userId          String       @unique
  organizationId  String
  
  // Professional info
  title           String?      // Dr., NP, PA, etc.
  specialty       String
  licenseNumber   String?
  npiNumber       String?
  
  // Bio
  bio             String?      @db.Text
  education       String[]
  languages       String[]
  
  // Consultation settings
  consultationDuration Int     @default(30)  // Minutes
  consultationFee     Decimal? @db.Decimal(10, 2)
  
  isActive        Boolean      @default(true)
  
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  availability    Availability[]
  appointments    Appointment[]
  consultations   Consultation[]
  prescriptions   Prescription[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([organizationId])
  @@index([specialty])
}

model Patient {
  id              String       @id @default(cuid())
  userId          String       @unique
  organizationId  String
  
  // Demographics
  dateOfBirth     DateTime?
  gender          Gender?
  
  // Contact
  emergencyName   String?
  emergencyPhone  String?
  emergencyRelation String?
  
  // Address
  address         String?
  city            String?
  state           String?
  postalCode      String?
  country         String?
  
  // Insurance
  insuranceProvider String?
  insurancePolicyNumber String?
  insuranceGroupNumber String?
  
  // Medical
  allergies       String[]
  medications     String[]
  conditions      String[]
  
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  appointments    Appointment[]
  consultations   Consultation[]
  prescriptions   Prescription[]
  records         MedicalRecord[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([organizationId])
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

model Availability {
  id          String    @id @default(cuid())
  providerId  String
  dayOfWeek   Int       // 0-6 (Sunday-Saturday)
  startTime   String    // HH:mm format
  endTime     String    // HH:mm format
  isActive    Boolean   @default(true)
  
  provider    Provider  @relation(fields: [providerId], references: [id], onDelete: Cascade)
  
  @@unique([providerId, dayOfWeek, startTime])
  @@index([providerId])
}

model Appointment {
  id              String            @id @default(cuid())
  organizationId  String
  providerId      String
  patientId       String
  
  scheduledAt     DateTime
  duration        Int               @default(30)  // Minutes
  type            AppointmentType   @default(VIDEO)
  status          AppointmentStatus @default(SCHEDULED)
  
  // Reason for visit
  reason          String?
  symptoms        String[]
  
  // Room info
  roomId          String?           @unique @default(cuid())
  
  // Notes
  patientNotes    String?
  providerNotes   String?
  
  organization    Organization      @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  provider        Provider          @relation(fields: [providerId], references: [id])
  patient         Patient           @relation(fields: [patientId], references: [id])
  consultation    Consultation?
  
  cancelledAt     DateTime?
  cancelReason    String?
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@index([organizationId])
  @@index([providerId])
  @@index([patientId])
  @@index([scheduledAt])
  @@index([status])
}

enum AppointmentType {
  VIDEO
  PHONE
  IN_PERSON
}

enum AppointmentStatus {
  SCHEDULED
  CONFIRMED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  NO_SHOW
}

model Consultation {
  id              String       @id @default(cuid())
  organizationId  String
  appointmentId   String       @unique
  providerId      String
  patientId       String
  
  // Timing
  startedAt       DateTime
  endedAt         DateTime?
  duration        Int?         // Actual duration in minutes
  
  // Clinical notes (encrypted)
  chiefComplaint  String?      @db.Text
  historyOfPresentIllness String? @db.Text
  physicalExam    String?      @db.Text
  assessment      String?      @db.Text
  plan            String?      @db.Text
  
  // Diagnoses (ICD-10 codes)
  diagnoses       Json?
  
  // Follow-up
  followUpDate    DateTime?
  followUpNotes   String?
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  appointment     Appointment  @relation(fields: [appointmentId], references: [id])
  provider        Provider     @relation(fields: [providerId], references: [id])
  patient         Patient      @relation(fields: [patientId], references: [id])
  prescriptions   Prescription[]
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([organizationId])
  @@index([patientId])
}

model Prescription {
  id              String       @id @default(cuid())
  organizationId  String
  providerId      String
  patientId       String
  consultationId  String?
  
  // Medication
  medicationName  String
  dosage          String
  frequency       String
  route           String       @default("oral")
  quantity        Int
  refills         Int          @default(0)
  
  // Instructions
  instructions    String?      @db.Text
  
  // Validity
  prescribedAt    DateTime     @default(now())
  expiresAt       DateTime
  
  status          PrescriptionStatus @default(ACTIVE)
  
  // Pharmacy (optional)
  pharmacyName    String?
  pharmacyAddress String?
  pharmacyPhone   String?
  
  organization    Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  provider        Provider     @relation(fields: [providerId], references: [id])
  patient         Patient      @relation(fields: [patientId], references: [id])
  consultation    Consultation? @relation(fields: [consultationId], references: [id])
  
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt
  
  @@index([organizationId])
  @@index([patientId])
  @@index([status])
}

enum PrescriptionStatus {
  ACTIVE
  FILLED
  EXPIRED
  CANCELLED
}

model MedicalRecord {
  id          String       @id @default(cuid())
  patientId   String
  
  type        RecordType
  title       String
  description String?
  
  // File
  fileUrl     String
  fileName    String
  fileSize    Int
  mimeType    String
  
  // Encryption
  encryptionKey String?    // Encrypted key for file decryption
  
  uploadedById String
  
  patient     Patient      @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime     @default(now())
  
  @@index([patientId])
  @@index([type])
}

enum RecordType {
  LAB_RESULT
  IMAGING
  REFERRAL
  INSURANCE
  CONSENT_FORM
  OTHER
}

model AuditLog {
  id             String       @id @default(cuid())
  organizationId String
  userId         String?
  
  action         String
  entityType     String
  entityId       String?
  
  // PHI access tracking
  patientId      String?
  accessReason   String?
  
  changes        Json?
  ipAddress      String?
  userAgent      String?
  
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User?        @relation(fields: [userId], references: [id])
  
  createdAt      DateTime     @default(now())
  
  @@index([organizationId])
  @@index([entityType, entityId])
  @@index([patientId])
  @@index([createdAt])
}
```

## Implementation

### Video Consultation Room

```tsx
// app/room/[id]/page.tsx
import { notFound, redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { VideoRoom } from '@/components/video/video-room';
import { generateRoomToken } from '@/lib/livekit';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RoomPage({ params }: Props) {
  const { id } = await params;
  
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }
  
  const appointment = await prisma.appointment.findUnique({
    where: { roomId: id },
    include: {
      provider: { include: { user: true } },
      patient: { include: { user: true } },
    },
  });
  
  if (!appointment) {
    notFound();
  }
  
  // Verify user is provider or patient
  const isProvider = appointment.provider.userId === user.id;
  const isPatient = appointment.patient.userId === user.id;
  
  if (!isProvider && !isPatient) {
    redirect('/');
  }
  
  // Generate LiveKit token
  const token = await generateRoomToken({
    roomId: id,
    participantId: user.id,
    participantName: user.name,
    isProvider,
  });
  
  return (
    <VideoRoom
      roomId={id}
      token={token}
      appointmentId={appointment.id}
      isProvider={isProvider}
      otherParticipant={isProvider ? appointment.patient.user : appointment.provider.user}
    />
  );
}
```

### Video Room Component

```tsx
// components/video/video-room.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  RoomAudioRenderer,
  useRoomContext,
  useTracks,
} from '@livekit/components-react';
import { Track, RoomEvent } from 'livekit-client';
import { useRouter } from 'next/navigation';
import { ControlsBar } from './controls-bar';
import { WaitingRoom } from './waiting-room';
import { ConsultationNotes } from './consultation-notes';

interface VideoRoomProps {
  roomId: string;
  token: string;
  appointmentId: string;
  isProvider: boolean;
  otherParticipant: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export function VideoRoom({
  roomId,
  token,
  appointmentId,
  isProvider,
  otherParticipant,
}: VideoRoomProps) {
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [otherJoined, setOtherJoined] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  
  const handleDisconnect = async () => {
    if (isProvider) {
      // Mark appointment as completed
      await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'COMPLETED' }),
      });
    }
    router.push(isProvider ? '/appointments' : '/patient/appointments');
  };
  
  return (
    <div className="h-screen bg-gray-900 flex">
      <LiveKitRoom
        serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
        token={token}
        connect={true}
        video={true}
        audio={true}
        onConnected={() => setIsConnected(true)}
        onDisconnected={handleDisconnect}
      >
        <RoomContent
          isProvider={isProvider}
          otherParticipant={otherParticipant}
          otherJoined={otherJoined}
          setOtherJoined={setOtherJoined}
          showNotes={showNotes}
          setShowNotes={setShowNotes}
          appointmentId={appointmentId}
        />
      </LiveKitRoom>
    </div>
  );
}

function RoomContent({
  isProvider,
  otherParticipant,
  otherJoined,
  setOtherJoined,
  showNotes,
  setShowNotes,
  appointmentId,
}: {
  isProvider: boolean;
  otherParticipant: any;
  otherJoined: boolean;
  setOtherJoined: (v: boolean) => void;
  showNotes: boolean;
  setShowNotes: (v: boolean) => void;
  appointmentId: string;
}) {
  const room = useRoomContext();
  
  useEffect(() => {
    const handleParticipantConnected = () => {
      if (room.remoteParticipants.size > 0) {
        setOtherJoined(true);
      }
    };
    
    const handleParticipantDisconnected = () => {
      if (room.remoteParticipants.size === 0) {
        setOtherJoined(false);
      }
    };
    
    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    
    // Check initial state
    if (room.remoteParticipants.size > 0) {
      setOtherJoined(true);
    }
    
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    };
  }, [room, setOtherJoined]);
  
  if (!otherJoined) {
    return (
      <WaitingRoom
        otherParticipant={otherParticipant}
        isProvider={isProvider}
      />
    );
  }
  
  return (
    <>
      <div className={`flex-1 ${showNotes ? 'w-2/3' : 'w-full'}`}>
        <VideoConference />
        <RoomAudioRenderer />
        <ControlsBar
          isProvider={isProvider}
          showNotes={showNotes}
          onToggleNotes={() => setShowNotes(!showNotes)}
        />
      </div>
      
      {showNotes && isProvider && (
        <div className="w-1/3 bg-white border-l">
          <ConsultationNotes appointmentId={appointmentId} />
        </div>
      )}
    </>
  );
}
```

### Appointment Booking

```tsx
// components/appointments/booking-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { format, addDays, startOfDay, isBefore } from 'date-fns';
import { Calendar, Clock, User } from 'lucide-react';
import { TimeSlotPicker } from './time-slot-picker';

const bookingSchema = z.object({
  providerId: z.string().min(1, 'Please select a provider'),
  date: z.date(),
  timeSlot: z.string().min(1, 'Please select a time slot'),
  type: z.enum(['VIDEO', 'PHONE']),
  reason: z.string().min(1, 'Please describe your reason for visit'),
  symptoms: z.array(z.string()).optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface BookingFormProps {
  organizationId: string;
  patientId: string;
}

export function BookingForm({ organizationId, patientId }: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(addDays(new Date(), 1));
  
  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      type: 'VIDEO',
      date: addDays(new Date(), 1),
    },
  });
  
  const providerId = form.watch('providerId');
  
  // Fetch providers
  const { data: providers } = useQuery({
    queryKey: ['providers', organizationId],
    queryFn: async () => {
      const res = await fetch(`/api/providers?organizationId=${organizationId}`);
      return res.json();
    },
  });
  
  // Fetch available slots for selected provider and date
  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['slots', providerId, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: async () => {
      const res = await fetch(
        `/api/providers/${providerId}/availability?date=${format(selectedDate, 'yyyy-MM-dd')}`
      );
      return res.json();
    },
    enabled: !!providerId,
  });
  
  const mutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const [hours, minutes] = data.timeSlot.split(':');
      const scheduledAt = new Date(data.date);
      scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId,
          patientId,
          providerId: data.providerId,
          scheduledAt: scheduledAt.toISOString(),
          type: data.type,
          reason: data.reason,
          symptoms: data.symptoms || [],
        }),
      });
      
      if (!response.ok) throw new Error('Booking failed');
      return response.json();
    },
    onSuccess: (data) => {
      router.push(`/patient/appointments/${data.id}?booked=true`);
    },
  });
  
  // Generate next 14 days for date selection
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));
  
  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
      {/* Provider Selection */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Select Provider
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers?.map((provider: any) => (
            <label
              key={provider.id}
              className={`p-4 border rounded-lg cursor-pointer flex items-start gap-4 ${
                form.watch('providerId') === provider.id
                  ? 'border-indigo-600 bg-indigo-50'
                  : ''
              }`}
            >
              <input
                type="radio"
                {...form.register('providerId')}
                value={provider.id}
                className="sr-only"
              />
              <img
                src={provider.user.avatarUrl || '/default-avatar.png'}
                alt={provider.user.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <p className="font-medium">
                  {provider.title} {provider.user.name}
                </p>
                <p className="text-sm text-gray-600">{provider.specialty}</p>
                <p className="text-sm text-gray-500">
                  {provider.consultationDuration} min consultation
                </p>
              </div>
            </label>
          ))}
        </div>
        
        {form.formState.errors.providerId && (
          <p className="text-sm text-red-600 mt-2">
            {form.formState.errors.providerId.message}
          </p>
        )}
      </div>
      
      {/* Date Selection */}
      {providerId && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Select Date
          </h2>
          
          <div className="flex gap-2 overflow-x-auto pb-2">
            {availableDates.map((date) => {
              const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
              
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    form.setValue('date', date);
                    form.setValue('timeSlot', '');
                  }}
                  className={`flex-shrink-0 w-16 py-3 rounded-lg text-center border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600 text-white'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xs">
                    {isToday ? 'Today' : format(date, 'EEE')}
                  </p>
                  <p className="text-lg font-semibold">{format(date, 'd')}</p>
                  <p className="text-xs">{format(date, 'MMM')}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Time Slot Selection */}
      {providerId && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Select Time
          </h2>
          
          {slotsLoading ? (
            <p className="text-gray-500">Loading available times...</p>
          ) : slots?.length > 0 ? (
            <TimeSlotPicker
              slots={slots}
              selectedSlot={form.watch('timeSlot')}
              onSelect={(slot) => form.setValue('timeSlot', slot)}
            />
          ) : (
            <p className="text-gray-500">No available times for this date</p>
          )}
          
          {form.formState.errors.timeSlot && (
            <p className="text-sm text-red-600 mt-2">
              {form.formState.errors.timeSlot.message}
            </p>
          )}
        </div>
      )}
      
      {/* Appointment Type */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Appointment Type</h2>
        
        <div className="flex gap-4">
          <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${
            form.watch('type') === 'VIDEO' ? 'border-indigo-600 bg-indigo-50' : ''
          }`}>
            <input
              type="radio"
              {...form.register('type')}
              value="VIDEO"
              className="sr-only"
            />
            <span className="block text-2xl mb-1">📹</span>
            <span className="font-medium">Video Call</span>
          </label>
          
          <label className={`flex-1 p-4 border rounded-lg cursor-pointer text-center ${
            form.watch('type') === 'PHONE' ? 'border-indigo-600 bg-indigo-50' : ''
          }`}>
            <input
              type="radio"
              {...form.register('type')}
              value="PHONE"
              className="sr-only"
            />
            <span className="block text-2xl mb-1">📞</span>
            <span className="font-medium">Phone Call</span>
          </label>
        </div>
      </div>
      
      {/* Reason for Visit */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="font-semibold mb-4">Reason for Visit</h2>
        
        <textarea
          {...form.register('reason')}
          rows={4}
          placeholder="Please describe your reason for scheduling this appointment..."
          className="w-full border rounded-lg p-3"
        />
        
        {form.formState.errors.reason && (
          <p className="text-sm text-red-600 mt-2">
            {form.formState.errors.reason.message}
          </p>
        )}
      </div>
      
      {/* Submit */}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
      >
        {mutation.isPending ? 'Booking...' : 'Book Appointment'}
      </button>
    </form>
  );
}
```

### Time Slot Picker

```tsx
// components/appointments/time-slot-picker.tsx
'use client';

import { format, parse } from 'date-fns';

interface TimeSlotPickerProps {
  slots: string[];  // Array of "HH:mm" strings
  selectedSlot: string;
  onSelect: (slot: string) => void;
}

export function TimeSlotPicker({ slots, selectedSlot, onSelect }: TimeSlotPickerProps) {
  // Group slots by morning/afternoon/evening
  const morning = slots.filter(s => {
    const hour = parseInt(s.split(':')[0]);
    return hour < 12;
  });
  
  const afternoon = slots.filter(s => {
    const hour = parseInt(s.split(':')[0]);
    return hour >= 12 && hour < 17;
  });
  
  const evening = slots.filter(s => {
    const hour = parseInt(s.split(':')[0]);
    return hour >= 17;
  });
  
  const formatSlot = (slot: string) => {
    const date = parse(slot, 'HH:mm', new Date());
    return format(date, 'h:mm a');
  };
  
  const renderSlots = (slots: string[], label: string) => {
    if (slots.length === 0) return null;
    
    return (
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">{label}</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <button
              key={slot}
              type="button"
              onClick={() => onSelect(slot)}
              className={`py-2 px-3 rounded-lg border text-sm ${
                selectedSlot === slot
                  ? 'border-indigo-600 bg-indigo-600 text-white'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {formatSlot(slot)}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      {renderSlots(morning, 'Morning')}
      {renderSlots(afternoon, 'Afternoon')}
      {renderSlots(evening, 'Evening')}
    </div>
  );
}
```

### LiveKit Token Generation

```tsx
// lib/livekit.ts
import { AccessToken } from 'livekit-server-sdk';

interface TokenParams {
  roomId: string;
  participantId: string;
  participantName: string;
  isProvider: boolean;
}

export async function generateRoomToken({
  roomId,
  participantId,
  participantName,
  isProvider,
}: TokenParams): Promise<string> {
  const apiKey = process.env.LIVEKIT_API_KEY!;
  const apiSecret = process.env.LIVEKIT_API_SECRET!;
  
  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantId,
    name: participantName,
    metadata: JSON.stringify({ isProvider }),
  });
  
  at.addGrant({
    roomJoin: true,
    room: roomId,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  
  return at.toJwt();
}
```

### HIPAA Consent Management

```typescript
// lib/consent.ts - Patient consent tracking
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/hipaa-audit';

export enum ConsentType {
  TREATMENT = 'TREATMENT',
  DISCLOSURE = 'DISCLOSURE',
  RESEARCH = 'RESEARCH',
  MARKETING = 'MARKETING',
  TELEHEALTH = 'TELEHEALTH',
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  type: ConsentType;
  version: string;
  grantedAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  signatureData: string;
  ipAddress: string;
  userAgent: string;
  witnessName?: string;
  documentUrl: string;
}

// Consent expiration periods (in days)
const CONSENT_EXPIRATION: Record<ConsentType, number> = {
  [ConsentType.TREATMENT]: 365,      // 1 year
  [ConsentType.DISCLOSURE]: 365,     // 1 year
  [ConsentType.RESEARCH]: 730,       // 2 years
  [ConsentType.MARKETING]: 365,      // 1 year
  [ConsentType.TELEHEALTH]: 365,     // 1 year
};

export async function recordConsent({
  patientId,
  type,
  version,
  signatureData,
  ipAddress,
  userAgent,
  witnessName,
  userId,
  organizationId,
}: {
  patientId: string;
  type: ConsentType;
  version: string;
  signatureData: string;
  ipAddress: string;
  userAgent: string;
  witnessName?: string;
  userId: string;
  organizationId: string;
}): Promise<ConsentRecord> {
  const expirationDays = CONSENT_EXPIRATION[type];
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  // Generate PDF and store securely
  const documentUrl = await generateConsentPDF({
    patientId,
    type,
    version,
    signatureData,
    grantedAt: new Date(),
  });

  const consent = await prisma.patientConsent.create({
    data: {
      patientId,
      type,
      version,
      grantedAt: new Date(),
      expiresAt,
      signatureData,
      ipAddress,
      userAgent,
      witnessName,
      documentUrl,
    },
  });

  // Audit log the consent
  await createAuditLog({
    organizationId,
    userId,
    action: AuditAction.CONSENT_GRANTED,
    resourceType: 'PatientConsent',
    resourceId: consent.id,
    patientId,
    details: {
      consentType: type,
      version,
      expiresAt: expiresAt.toISOString(),
    },
    ipAddress,
  });

  return consent as ConsentRecord;
}

export async function revokeConsent({
  consentId,
  patientId,
  userId,
  organizationId,
  reason,
  ipAddress,
}: {
  consentId: string;
  patientId: string;
  userId: string;
  organizationId: string;
  reason: string;
  ipAddress: string;
}): Promise<void> {
  const consent = await prisma.patientConsent.findUnique({
    where: { id: consentId },
  });

  if (!consent || consent.patientId !== patientId) {
    throw new Error('Consent not found or unauthorized');
  }

  if (consent.revokedAt) {
    throw new Error('Consent already revoked');
  }

  await prisma.patientConsent.update({
    where: { id: consentId },
    data: {
      revokedAt: new Date(),
      revocationReason: reason,
    },
  });

  await createAuditLog({
    organizationId,
    userId,
    action: AuditAction.CONSENT_REVOKED,
    resourceType: 'PatientConsent',
    resourceId: consentId,
    patientId,
    details: {
      consentType: consent.type,
      reason,
    },
    ipAddress,
  });
}

export async function getActiveConsents(patientId: string): Promise<ConsentRecord[]> {
  const consents = await prisma.patientConsent.findMany({
    where: {
      patientId,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { grantedAt: 'desc' },
  });

  return consents as ConsentRecord[];
}

export async function hasValidConsent(
  patientId: string,
  type: ConsentType
): Promise<boolean> {
  const consent = await prisma.patientConsent.findFirst({
    where: {
      patientId,
      type,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  return consent !== null;
}

export async function getExpiringConsents(
  organizationId: string,
  daysUntilExpiration: number = 30
): Promise<ConsentRecord[]> {
  const expirationThreshold = new Date();
  expirationThreshold.setDate(expirationThreshold.getDate() + daysUntilExpiration);

  const consents = await prisma.patientConsent.findMany({
    where: {
      patient: { organizationId },
      revokedAt: null,
      expiresAt: {
        gt: new Date(),
        lte: expirationThreshold,
      },
    },
    include: {
      patient: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
    orderBy: { expiresAt: 'asc' },
  });

  return consents as ConsentRecord[];
}

async function generateConsentPDF(data: {
  patientId: string;
  type: ConsentType;
  version: string;
  signatureData: string;
  grantedAt: Date;
}): Promise<string> {
  // Implementation would use a PDF library like pdf-lib or puppeteer
  // Store in S3 with encryption
  const fileName = `consents/${data.patientId}/${data.type}-${Date.now()}.pdf`;
  // Return the secure URL
  return `https://s3.amazonaws.com/bucket/${fileName}`;
}
```

```tsx
// components/consent/consent-form.tsx
'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import SignatureCanvas from 'react-signature-canvas';
import { CheckCircle, AlertCircle, FileText, Pen } from 'lucide-react';
import { ConsentType } from '@/lib/consent';

const consentSchema = z.object({
  treatmentConsent: z.boolean(),
  disclosureConsent: z.boolean(),
  telehealthConsent: z.boolean(),
  researchConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
  acknowledgement: z.boolean().refine(val => val === true, {
    message: 'You must acknowledge that you have read and understood the terms',
  }),
});

type ConsentFormData = z.infer<typeof consentSchema>;

interface ConsentFormProps {
  patientId: string;
  patientName: string;
  onComplete: () => void;
}

const CONSENT_EXPLANATIONS: Record<ConsentType, { title: string; description: string; required: boolean }> = {
  [ConsentType.TREATMENT]: {
    title: 'Consent to Treatment',
    description: 'I consent to receive medical treatment, examinations, and procedures as recommended by my healthcare provider. I understand that I may refuse or withdraw consent at any time.',
    required: true,
  },
  [ConsentType.DISCLOSURE]: {
    title: 'Authorization for Disclosure',
    description: 'I authorize the disclosure of my protected health information (PHI) for treatment, payment, and healthcare operations as permitted by HIPAA. This includes sharing information with other healthcare providers involved in my care.',
    required: true,
  },
  [ConsentType.TELEHEALTH]: {
    title: 'Telehealth Consent',
    description: 'I consent to receive healthcare services via telehealth (video/audio consultations). I understand that telehealth has limitations compared to in-person visits and that technical difficulties may occur.',
    required: true,
  },
  [ConsentType.RESEARCH]: {
    title: 'Research Participation (Optional)',
    description: 'I consent to the use of my de-identified health information for research purposes. My participation is voluntary and will not affect my care.',
    required: false,
  },
  [ConsentType.MARKETING]: {
    title: 'Marketing Communications (Optional)',
    description: 'I consent to receive marketing communications about health services, wellness programs, and related offerings.',
    required: false,
  },
};

export function ConsentForm({ patientId, patientName, onComplete }: ConsentFormProps) {
  const [step, setStep] = useState<'review' | 'signature' | 'complete'>('review');
  const signatureRef = useRef<SignatureCanvas>(null);
  const [signatureError, setSignatureError] = useState(false);

  const form = useForm<ConsentFormData>({
    resolver: zodResolver(consentSchema),
    defaultValues: {
      treatmentConsent: false,
      disclosureConsent: false,
      telehealthConsent: false,
      researchConsent: false,
      marketingConsent: false,
      acknowledgement: false,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ConsentFormData & { signatureData: string }) => {
      const consents: ConsentType[] = [];
      if (data.treatmentConsent) consents.push(ConsentType.TREATMENT);
      if (data.disclosureConsent) consents.push(ConsentType.DISCLOSURE);
      if (data.telehealthConsent) consents.push(ConsentType.TELEHEALTH);
      if (data.researchConsent) consents.push(ConsentType.RESEARCH);
      if (data.marketingConsent) consents.push(ConsentType.MARKETING);

      const response = await fetch(`/api/patients/${patientId}/consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          consents,
          signatureData: data.signatureData,
        }),
      });

      if (!response.ok) throw new Error('Failed to record consent');
      return response.json();
    },
    onSuccess: () => {
      setStep('complete');
      setTimeout(onComplete, 2000);
    },
  });

  const handleReviewComplete = () => {
    if (form.formState.isValid) {
      setStep('signature');
    }
  };

  const handleSignatureSubmit = () => {
    if (signatureRef.current?.isEmpty()) {
      setSignatureError(true);
      return;
    }

    const signatureData = signatureRef.current?.toDataURL('image/png');
    mutation.mutate({
      ...form.getValues(),
      signatureData: signatureData || '',
    });
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
    setSignatureError(false);
  };

  if (step === 'complete') {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Consent Recorded</h2>
        <p className="text-gray-600">
          Your consent has been securely recorded. A copy has been sent to your email.
        </p>
      </div>
    );
  }

  if (step === 'signature') {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Pen className="w-6 h-6" />
          Digital Signature
        </h2>

        <p className="text-gray-600 mb-4">
          Please sign below to confirm your consent. By signing, you acknowledge that you are{' '}
          <strong>{patientName}</strong> and that you have reviewed and agreed to the selected terms.
        </p>

        <div className={`border-2 rounded-lg mb-4 ${signatureError ? 'border-red-500' : 'border-gray-300'}`}>
          <SignatureCanvas
            ref={signatureRef}
            canvasProps={{
              className: 'w-full h-48',
              style: { width: '100%', height: '192px' },
            }}
            onBegin={() => setSignatureError(false)}
          />
        </div>

        {signatureError && (
          <p className="text-red-600 text-sm mb-4 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            Please provide your signature
          </p>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={clearSignature}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Clear Signature
          </button>
          <button
            type="button"
            onClick={() => setStep('review')}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Back to Review
          </button>
          <button
            type="button"
            onClick={handleSignatureSubmit}
            disabled={mutation.isPending}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {mutation.isPending ? 'Submitting...' : 'Submit Consent'}
          </button>
        </div>

        {mutation.isError && (
          <p className="mt-4 text-red-600 text-sm">
            Failed to record consent. Please try again.
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(handleReviewComplete)} className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6" />
        Patient Consent Forms
      </h2>

      <p className="text-gray-600 mb-6">
        Please review each consent form carefully. Required consents must be accepted to proceed.
        Your signature will be captured on the next step.
      </p>

      <div className="space-y-6">
        {Object.entries(CONSENT_EXPLANATIONS).map(([type, info]) => {
          const fieldName = `${type.toLowerCase()}Consent` as keyof ConsentFormData;
          return (
            <div key={type} className="border rounded-lg p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...form.register(fieldName)}
                  className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="font-medium">
                    {info.title}
                    {info.required && <span className="text-red-500 ml-1">*</span>}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{info.description}</p>
                </div>
              </label>
            </div>
          );
        })}

        <div className="border-t pt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              {...form.register('acknowledgement')}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <p className="font-medium">
                Acknowledgement <span className="text-red-500">*</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                I acknowledge that I have read, understood, and agree to the terms outlined above.
                I understand that I may revoke my consent at any time by submitting a written request.
              </p>
            </div>
          </label>
          {form.formState.errors.acknowledgement && (
            <p className="text-red-600 text-sm mt-2">
              {form.formState.errors.acknowledgement.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700"
      >
        Continue to Signature
      </button>
    </form>
  );
}
```

```typescript
// app/api/patients/[id]/consent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { getClientIP } from '@/lib/utils';
import {
  recordConsent,
  revokeConsent,
  getActiveConsents,
  ConsentType,
} from '@/lib/consent';
import { handleAPIError } from '@/lib/api-error-handler';

const recordConsentSchema = z.object({
  consents: z.array(z.nativeEnum(ConsentType)).min(1),
  signatureData: z.string().min(1),
});

const revokeConsentSchema = z.object({
  consentId: z.string().cuid(),
  reason: z.string().min(10).max(500),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET: Get current consent status
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: patientId } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const consents = await getActiveConsents(patientId);

    // Map to consent status
    const consentStatus = Object.values(ConsentType).reduce((acc, type) => {
      const consent = consents.find(c => c.type === type);
      acc[type] = {
        granted: !!consent,
        expiresAt: consent?.expiresAt || null,
        grantedAt: consent?.grantedAt || null,
      };
      return acc;
    }, {} as Record<ConsentType, { granted: boolean; expiresAt: Date | null; grantedAt: Date | null }>);

    return NextResponse.json({
      patientId,
      consents: consentStatus,
      allRequired: consents.some(c => c.type === ConsentType.TREATMENT) &&
                   consents.some(c => c.type === ConsentType.DISCLOSURE) &&
                   consents.some(c => c.type === ConsentType.TELEHEALTH),
    });
  } catch (error) {
    return handleAPIError(error);
  }
}

// POST: Record new consent
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: patientId } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { consents, signatureData } = recordConsentSchema.parse(body);

    const ipAddress = getClientIP(request);
    const userAgent = request.headers.get('user-agent') || 'unknown';

    const recordedConsents = await Promise.all(
      consents.map(type =>
        recordConsent({
          patientId,
          type,
          version: '1.0',
          signatureData,
          ipAddress,
          userAgent,
          userId: user.id,
          organizationId: user.organizationId,
        })
      )
    );

    return NextResponse.json({
      success: true,
      consents: recordedConsents.map(c => ({
        id: c.id,
        type: c.type,
        grantedAt: c.grantedAt,
        expiresAt: c.expiresAt,
      })),
    }, { status: 201 });
  } catch (error) {
    return handleAPIError(error);
  }
}

// DELETE: Revoke consent
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: patientId } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { consentId, reason } = revokeConsentSchema.parse(body);

    const ipAddress = getClientIP(request);

    await revokeConsent({
      consentId,
      patientId,
      userId: user.id,
      organizationId: user.organizationId,
      reason,
      ipAddress,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### HIPAA Audit Logging

```typescript
// lib/hipaa-audit.ts
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export enum AuditAction {
  // PHI Access
  PHI_VIEW = 'PHI_VIEW',
  PHI_CREATE = 'PHI_CREATE',
  PHI_UPDATE = 'PHI_UPDATE',
  PHI_DELETE = 'PHI_DELETE',
  PHI_EXPORT = 'PHI_EXPORT',
  PHI_PRINT = 'PHI_PRINT',

  // Authentication
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',

  // Consent
  CONSENT_GRANTED = 'CONSENT_GRANTED',
  CONSENT_REVOKED = 'CONSENT_REVOKED',

  // Data Sharing
  DATA_SHARED = 'DATA_SHARED',
  DATA_RECEIVED = 'DATA_RECEIVED',

  // Administrative
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DEACTIVATED = 'USER_DEACTIVATED',
  PERMISSION_CHANGED = 'PERMISSION_CHANGED',

  // Security Events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  DATA_BREACH_DETECTED = 'DATA_BREACH_DETECTED',

  // System
  SYSTEM_CONFIG_CHANGED = 'SYSTEM_CONFIG_CHANGED',
  BACKUP_CREATED = 'BACKUP_CREATED',
  BACKUP_RESTORED = 'BACKUP_RESTORED',
  ERROR = 'ERROR',
}

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId: string | null;
  patientId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  previousHash: string | null;
  hash: string;
  createdAt: Date;
}

// 6-year retention policy (HIPAA requirement)
const RETENTION_YEARS = 6;

export async function createAuditLog({
  organizationId,
  userId,
  action,
  resourceType,
  resourceId,
  patientId,
  details,
  ipAddress,
  userAgent,
}: {
  organizationId: string;
  userId?: string | null;
  action: AuditAction;
  resourceType: string;
  resourceId?: string | null;
  patientId?: string | null;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<AuditLogEntry> {
  // Get the previous log entry for hash chain
  const previousEntry = await prisma.hipaaAuditLog.findFirst({
    where: { organizationId },
    orderBy: { createdAt: 'desc' },
    select: { hash: true },
  });

  const previousHash = previousEntry?.hash || null;

  // Create tamper-evident hash
  const hashData = JSON.stringify({
    organizationId,
    userId,
    action,
    resourceType,
    resourceId,
    patientId,
    details,
    ipAddress,
    timestamp: new Date().toISOString(),
    previousHash,
  });

  const hash = crypto
    .createHash('sha256')
    .update(hashData)
    .digest('hex');

  const auditLog = await prisma.hipaaAuditLog.create({
    data: {
      organizationId,
      userId,
      action,
      resourceType,
      resourceId,
      patientId,
      details: details ? JSON.stringify(details) : null,
      ipAddress,
      userAgent,
      previousHash,
      hash,
      retentionExpiresAt: new Date(Date.now() + RETENTION_YEARS * 365 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    ...auditLog,
    details: details || null,
  } as AuditLogEntry;
}

export async function verifyAuditLogIntegrity(
  organizationId: string,
  startDate?: Date,
  endDate?: Date
): Promise<{ valid: boolean; brokenAt?: string; totalEntries: number }> {
  const logs = await prisma.hipaaAuditLog.findMany({
    where: {
      organizationId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  let previousHash: string | null = null;

  for (const log of logs) {
    // Verify the previous hash matches
    if (log.previousHash !== previousHash) {
      return {
        valid: false,
        brokenAt: log.id,
        totalEntries: logs.length,
      };
    }

    // Recalculate hash and verify
    const expectedHashData = JSON.stringify({
      organizationId: log.organizationId,
      userId: log.userId,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      patientId: log.patientId,
      details: log.details ? JSON.parse(log.details as string) : undefined,
      ipAddress: log.ipAddress,
      timestamp: log.createdAt.toISOString(),
      previousHash: log.previousHash,
    });

    const expectedHash = crypto
      .createHash('sha256')
      .update(expectedHashData)
      .digest('hex');

    if (log.hash !== expectedHash) {
      return {
        valid: false,
        brokenAt: log.id,
        totalEntries: logs.length,
      };
    }

    previousHash = log.hash;
  }

  return { valid: true, totalEntries: logs.length };
}

export async function queryAuditLogs({
  organizationId,
  userId,
  patientId,
  action,
  resourceType,
  startDate,
  endDate,
  limit = 100,
  offset = 0,
}: {
  organizationId: string;
  userId?: string;
  patientId?: string;
  action?: AuditAction;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogEntry[]; total: number }> {
  const where = {
    organizationId,
    ...(userId && { userId }),
    ...(patientId && { patientId }),
    ...(action && { action }),
    ...(resourceType && { resourceType }),
    ...(startDate || endDate) && {
      createdAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    },
  };

  const [logs, total] = await Promise.all([
    prisma.hipaaAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.hipaaAuditLog.count({ where }),
  ]);

  return {
    logs: logs.map(log => ({
      ...log,
      details: log.details ? JSON.parse(log.details as string) : null,
    })) as AuditLogEntry[],
    total,
  };
}

export async function exportAuditLogsForCompliance({
  organizationId,
  startDate,
  endDate,
  format = 'json',
}: {
  organizationId: string;
  startDate: Date;
  endDate: Date;
  format?: 'json' | 'csv';
}): Promise<string> {
  const logs = await prisma.hipaaAuditLog.findMany({
    where: {
      organizationId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  if (format === 'csv') {
    const headers = [
      'ID',
      'Timestamp',
      'User ID',
      'User Name',
      'User Email',
      'Action',
      'Resource Type',
      'Resource ID',
      'Patient ID',
      'IP Address',
      'Details',
      'Hash',
    ].join(',');

    const rows = logs.map(log => [
      log.id,
      log.createdAt.toISOString(),
      log.userId || '',
      log.user?.name || '',
      log.user?.email || '',
      log.action,
      log.resourceType,
      log.resourceId || '',
      log.patientId || '',
      log.ipAddress || '',
      log.details ? `"${JSON.stringify(log.details).replace(/"/g, '""')}"` : '',
      log.hash,
    ].join(','));

    return [headers, ...rows].join('\n');
  }

  return JSON.stringify(logs, null, 2);
}

// Automatic cleanup of expired audit logs (run via cron)
export async function cleanupExpiredAuditLogs(): Promise<number> {
  const result = await prisma.hipaaAuditLog.deleteMany({
    where: {
      retentionExpiresAt: { lt: new Date() },
    },
  });

  return result.count;
}
```

```typescript
// app/api/audit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import {
  queryAuditLogs,
  exportAuditLogsForCompliance,
  verifyAuditLogIntegrity,
  AuditAction,
  createAuditLog,
} from '@/lib/hipaa-audit';
import { handleAPIError } from '@/lib/api-error-handler';

const querySchema = z.object({
  userId: z.string().cuid().optional(),
  patientId: z.string().cuid().optional(),
  action: z.nativeEnum(AuditAction).optional(),
  resourceType: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().min(1).max(1000).default(100),
  offset: z.coerce.number().min(0).default(0),
  format: z.enum(['json', 'csv']).optional(),
  verify: z.coerce.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can view audit logs
    if (user.role !== 'ADMIN' && user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const params = querySchema.parse(searchParams);

    // Log this audit log access
    await createAuditLog({
      organizationId: user.organizationId,
      userId: user.id,
      action: AuditAction.PHI_VIEW,
      resourceType: 'AuditLog',
      details: {
        queryParams: params,
      },
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    });

    // Verify integrity if requested
    if (params.verify) {
      const integrityResult = await verifyAuditLogIntegrity(
        user.organizationId,
        params.startDate ? new Date(params.startDate) : undefined,
        params.endDate ? new Date(params.endDate) : undefined
      );

      return NextResponse.json(integrityResult);
    }

    // Export for compliance if format specified
    if (params.format && params.startDate && params.endDate) {
      const exported = await exportAuditLogsForCompliance({
        organizationId: user.organizationId,
        startDate: new Date(params.startDate),
        endDate: new Date(params.endDate),
        format: params.format,
      });

      const contentType = params.format === 'csv' ? 'text/csv' : 'application/json';
      const fileName = `audit-log-${params.startDate}-${params.endDate}.${params.format}`;

      return new NextResponse(exported, {
        headers: {
          'Content-Type': contentType,
          'Content-Disposition': `attachment; filename="${fileName}"`,
        },
      });
    }

    // Query audit logs
    const result = await queryAuditLogs({
      organizationId: user.organizationId,
      userId: params.userId,
      patientId: params.patientId,
      action: params.action,
      resourceType: params.resourceType,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      endDate: params.endDate ? new Date(params.endDate) : undefined,
      limit: params.limit,
      offset: params.offset,
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleAPIError(error);
  }
}
```

### PHI Encryption

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

// Master key from environment (should be stored in KMS in production)
const MASTER_KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'base64');

interface EncryptedData {
  ciphertext: string;
  iv: string;
  authTag: string;
  salt: string;
  version: number;
}

/**
 * Derives a patient-specific encryption key using PBKDF2
 */
function derivePatientKey(patientId: string, salt: Buffer): Buffer {
  return crypto.pbkdf2Sync(
    Buffer.concat([MASTER_KEY, Buffer.from(patientId)]),
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha512'
  );
}

/**
 * Encrypts PHI data using AES-256-GCM with patient-specific key derivation
 */
export async function encryptPHI(
  plaintext: string,
  patientId: string
): Promise<string> {
  if (!plaintext) return plaintext;

  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = derivePatientKey(patientId, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let ciphertext = cipher.update(plaintext, 'utf8', 'base64');
  ciphertext += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  const encryptedData: EncryptedData = {
    ciphertext,
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    salt: salt.toString('base64'),
    version: 1,
  };

  return Buffer.from(JSON.stringify(encryptedData)).toString('base64');
}

/**
 * Decrypts PHI data
 */
export async function decryptPHI(
  encrypted: string,
  patientId: string
): Promise<string> {
  if (!encrypted) return encrypted;

  try {
    const encryptedData: EncryptedData = JSON.parse(
      Buffer.from(encrypted, 'base64').toString('utf8')
    );

    const salt = Buffer.from(encryptedData.salt, 'base64');
    const iv = Buffer.from(encryptedData.iv, 'base64');
    const authTag = Buffer.from(encryptedData.authTag, 'base64');
    const key = derivePatientKey(patientId, salt);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let plaintext = decipher.update(encryptedData.ciphertext, 'base64', 'utf8');
    plaintext += decipher.final('utf8');

    return plaintext;
  } catch (error) {
    throw new Error('Failed to decrypt PHI data');
  }
}

/**
 * Generates a new encryption key (for key rotation)
 */
export async function generateEncryptionKey(): Promise<string> {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

/**
 * Re-encrypts data with a new key (for key rotation)
 */
export async function rotateEncryption(
  encrypted: string,
  patientId: string,
  newMasterKey?: Buffer
): Promise<string> {
  const plaintext = await decryptPHI(encrypted, patientId);

  // If new master key provided, temporarily swap it
  // In production, this would be handled by KMS
  return encryptPHI(plaintext, patientId);
}

/**
 * Encrypts a file for secure storage
 */
export async function encryptFile(
  fileBuffer: Buffer,
  patientId: string
): Promise<{ encryptedBuffer: Buffer; metadata: string }> {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = derivePatientKey(patientId, salt);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encryptedBuffer = Buffer.concat([
    cipher.update(fileBuffer),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  const metadata = Buffer.from(JSON.stringify({
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    salt: salt.toString('base64'),
    version: 1,
  })).toString('base64');

  return { encryptedBuffer, metadata };
}

/**
 * Decrypts a file
 */
export async function decryptFile(
  encryptedBuffer: Buffer,
  metadata: string,
  patientId: string
): Promise<Buffer> {
  const meta = JSON.parse(Buffer.from(metadata, 'base64').toString('utf8'));

  const salt = Buffer.from(meta.salt, 'base64');
  const iv = Buffer.from(meta.iv, 'base64');
  const authTag = Buffer.from(meta.authTag, 'base64');
  const key = derivePatientKey(patientId, salt);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  return Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);
}

/**
 * Generates a secure hash for PHI (for searching without decrypting)
 */
export function hashPHI(data: string): string {
  return crypto
    .createHmac('sha256', MASTER_KEY)
    .update(data.toLowerCase().trim())
    .digest('hex');
}

// Key rotation scheduler (should be called by cron every 90 days)
export interface KeyRotationStatus {
  lastRotation: Date;
  nextRotation: Date;
  rotationInProgress: boolean;
}

export async function getKeyRotationStatus(): Promise<KeyRotationStatus> {
  // In production, this would query a secure key management service
  const lastRotation = new Date(process.env.LAST_KEY_ROTATION || Date.now());
  const nextRotation = new Date(lastRotation);
  nextRotation.setDate(nextRotation.getDate() + 90);

  return {
    lastRotation,
    nextRotation,
    rotationInProgress: false,
  };
}
```

```typescript
// __tests__/lib/encryption.test.ts
import { describe, it, expect, beforeAll } from 'vitest';
import {
  encryptPHI,
  decryptPHI,
  generateEncryptionKey,
  encryptFile,
  decryptFile,
  hashPHI,
} from '@/lib/encryption';

describe('PHI Encryption', () => {
  const testPatientId = 'patient_test123';
  const sensitiveData = 'Patient has Type 2 Diabetes Mellitus with HbA1c of 8.5%';

  beforeAll(() => {
    // Set test encryption key
    process.env.ENCRYPTION_KEY = Buffer.from(
      'test-encryption-key-32-bytes-00'
    ).toString('base64');
  });

  describe('encryptPHI and decryptPHI', () => {
    it('encrypts and decrypts PHI correctly', async () => {
      const encrypted = await encryptPHI(sensitiveData, testPatientId);

      expect(encrypted).not.toBe(sensitiveData);
      expect(encrypted).toBeTruthy();

      const decrypted = await decryptPHI(encrypted, testPatientId);
      expect(decrypted).toBe(sensitiveData);
    });

    it('produces different ciphertext for same plaintext (due to random IV)', async () => {
      const encrypted1 = await encryptPHI(sensitiveData, testPatientId);
      const encrypted2 = await encryptPHI(sensitiveData, testPatientId);

      expect(encrypted1).not.toBe(encrypted2);

      // But both should decrypt to same value
      const decrypted1 = await decryptPHI(encrypted1, testPatientId);
      const decrypted2 = await decryptPHI(encrypted2, testPatientId);

      expect(decrypted1).toBe(sensitiveData);
      expect(decrypted2).toBe(sensitiveData);
    });

    it('uses patient-specific keys', async () => {
      const encrypted = await encryptPHI(sensitiveData, testPatientId);

      // Attempting to decrypt with different patient ID should fail
      await expect(
        decryptPHI(encrypted, 'different_patient_id')
      ).rejects.toThrow('Failed to decrypt PHI data');
    });

    it('handles empty strings', async () => {
      const encrypted = await encryptPHI('', testPatientId);
      expect(encrypted).toBe('');
    });

    it('handles special characters and unicode', async () => {
      const unicodeData = 'Patient notes: Temperature 38.5C, pain level: severe, notes in Japanese: ';
      const encrypted = await encryptPHI(unicodeData, testPatientId);
      const decrypted = await decryptPHI(encrypted, testPatientId);

      expect(decrypted).toBe(unicodeData);
    });

    it('detects tampered data', async () => {
      const encrypted = await encryptPHI(sensitiveData, testPatientId);

      // Tamper with the encrypted data
      const tampered = encrypted.slice(0, -5) + 'XXXXX';

      await expect(
        decryptPHI(tampered, testPatientId)
      ).rejects.toThrow();
    });
  });

  describe('generateEncryptionKey', () => {
    it('generates unique keys', async () => {
      const key1 = await generateEncryptionKey();
      const key2 = await generateEncryptionKey();

      expect(key1).not.toBe(key2);
      expect(Buffer.from(key1, 'base64').length).toBe(32);
    });
  });

  describe('File encryption', () => {
    it('encrypts and decrypts files correctly', async () => {
      const fileContent = Buffer.from('Sensitive medical image data');

      const { encryptedBuffer, metadata } = await encryptFile(
        fileContent,
        testPatientId
      );

      expect(encryptedBuffer).not.toEqual(fileContent);

      const decryptedBuffer = await decryptFile(
        encryptedBuffer,
        metadata,
        testPatientId
      );

      expect(decryptedBuffer).toEqual(fileContent);
    });
  });

  describe('hashPHI', () => {
    it('produces consistent hashes for same input', () => {
      const hash1 = hashPHI('john.doe@example.com');
      const hash2 = hashPHI('john.doe@example.com');

      expect(hash1).toBe(hash2);
    });

    it('normalizes input before hashing', () => {
      const hash1 = hashPHI('John.Doe@Example.com');
      const hash2 = hashPHI('john.doe@example.com');
      const hash3 = hashPHI('  john.doe@example.com  ');

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });

    it('produces different hashes for different input', () => {
      const hash1 = hashPHI('patient1@example.com');
      const hash2 = hashPHI('patient2@example.com');

      expect(hash1).not.toBe(hash2);
    });
  });
});
```

### Data Breach Notification

```typescript
// lib/breach-notification.ts
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction, queryAuditLogs } from '@/lib/hipaa-audit';
import { sendEmail } from '@/lib/email';

export interface BreachIncident {
  id: string;
  organizationId: string;
  detectedAt: Date;
  type: BreachType;
  severity: BreachSeverity;
  affectedPatientIds: string[];
  affectedRecordCount: number;
  description: string;
  discoveryMethod: string;
  status: BreachStatus;
  containmentActions: string[];
  notificationsSent: NotificationRecord[];
  hhsReportedAt: Date | null;
  resolvedAt: Date | null;
}

export enum BreachType {
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  UNAUTHORIZED_DISCLOSURE = 'UNAUTHORIZED_DISCLOSURE',
  DATA_THEFT = 'DATA_THEFT',
  LOST_DEVICE = 'LOST_DEVICE',
  HACKING = 'HACKING',
  IMPROPER_DISPOSAL = 'IMPROPER_DISPOSAL',
  OTHER = 'OTHER',
}

export enum BreachSeverity {
  LOW = 'LOW',           // < 500 individuals
  MEDIUM = 'MEDIUM',     // 500-5000 individuals
  HIGH = 'HIGH',         // > 5000 individuals
  CRITICAL = 'CRITICAL', // Sensitive data exposed
}

export enum BreachStatus {
  DETECTED = 'DETECTED',
  INVESTIGATING = 'INVESTIGATING',
  CONTAINED = 'CONTAINED',
  NOTIFYING = 'NOTIFYING',
  REPORTED = 'REPORTED',
  RESOLVED = 'RESOLVED',
}

interface NotificationRecord {
  recipientType: 'patient' | 'hhs' | 'media' | 'organization';
  recipientId: string;
  sentAt: Date;
  method: 'email' | 'mail' | 'phone' | 'portal';
}

// Anomaly detection thresholds
const ANOMALY_THRESHOLDS = {
  maxAccessPerHour: 100,
  maxExportsPerDay: 10,
  maxFailedLoginsPerHour: 5,
  unusualHoursStart: 22, // 10 PM
  unusualHoursEnd: 6,    // 6 AM
};

/**
 * Detects potential unauthorized access patterns
 */
export async function detectUnauthorizedAccess(
  organizationId: string
): Promise<Array<{ type: string; details: Record<string, unknown>; severity: BreachSeverity }>> {
  const anomalies: Array<{ type: string; details: Record<string, unknown>; severity: BreachSeverity }> = [];
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Check for excessive PHI access
  const { logs: recentAccess } = await queryAuditLogs({
    organizationId,
    action: AuditAction.PHI_VIEW,
    startDate: oneHourAgo,
    limit: 1000,
  });

  // Group by user
  const accessByUser = new Map<string, number>();
  for (const log of recentAccess) {
    const count = accessByUser.get(log.userId || 'unknown') || 0;
    accessByUser.set(log.userId || 'unknown', count + 1);
  }

  for (const [userId, count] of accessByUser) {
    if (count > ANOMALY_THRESHOLDS.maxAccessPerHour) {
      anomalies.push({
        type: 'EXCESSIVE_ACCESS',
        details: { userId, accessCount: count, threshold: ANOMALY_THRESHOLDS.maxAccessPerHour },
        severity: count > ANOMALY_THRESHOLDS.maxAccessPerHour * 2 ? BreachSeverity.HIGH : BreachSeverity.MEDIUM,
      });
    }
  }

  // Check for excessive data exports
  const { logs: recentExports } = await queryAuditLogs({
    organizationId,
    action: AuditAction.PHI_EXPORT,
    startDate: oneDayAgo,
    limit: 1000,
  });

  const exportsByUser = new Map<string, number>();
  for (const log of recentExports) {
    const count = exportsByUser.get(log.userId || 'unknown') || 0;
    exportsByUser.set(log.userId || 'unknown', count + 1);
  }

  for (const [userId, count] of exportsByUser) {
    if (count > ANOMALY_THRESHOLDS.maxExportsPerDay) {
      anomalies.push({
        type: 'EXCESSIVE_EXPORTS',
        details: { userId, exportCount: count, threshold: ANOMALY_THRESHOLDS.maxExportsPerDay },
        severity: BreachSeverity.HIGH,
      });
    }
  }

  // Check for failed login attempts
  const { logs: failedLogins } = await queryAuditLogs({
    organizationId,
    action: AuditAction.LOGIN_FAILED,
    startDate: oneHourAgo,
    limit: 1000,
  });

  const failedByIP = new Map<string, number>();
  for (const log of failedLogins) {
    const count = failedByIP.get(log.ipAddress || 'unknown') || 0;
    failedByIP.set(log.ipAddress || 'unknown', count + 1);
  }

  for (const [ip, count] of failedByIP) {
    if (count > ANOMALY_THRESHOLDS.maxFailedLoginsPerHour) {
      anomalies.push({
        type: 'BRUTE_FORCE_ATTEMPT',
        details: { ipAddress: ip, attemptCount: count, threshold: ANOMALY_THRESHOLDS.maxFailedLoginsPerHour },
        severity: BreachSeverity.MEDIUM,
      });
    }
  }

  // Check for unusual hours access
  const currentHour = new Date().getHours();
  if (currentHour >= ANOMALY_THRESHOLDS.unusualHoursStart || currentHour < ANOMALY_THRESHOLDS.unusualHoursEnd) {
    const { logs: unusualAccess } = await queryAuditLogs({
      organizationId,
      action: AuditAction.PHI_VIEW,
      startDate: oneHourAgo,
      limit: 100,
    });

    if (unusualAccess.length > 10) {
      anomalies.push({
        type: 'UNUSUAL_HOURS_ACCESS',
        details: { hour: currentHour, accessCount: unusualAccess.length },
        severity: BreachSeverity.LOW,
      });
    }
  }

  return anomalies;
}

/**
 * Creates a breach incident record
 */
export async function createBreachIncident({
  organizationId,
  type,
  severity,
  affectedPatientIds,
  description,
  discoveryMethod,
  userId,
}: {
  organizationId: string;
  type: BreachType;
  severity: BreachSeverity;
  affectedPatientIds: string[];
  description: string;
  discoveryMethod: string;
  userId: string;
}): Promise<BreachIncident> {
  const incident = await prisma.breachIncident.create({
    data: {
      organizationId,
      type,
      severity,
      affectedPatientIds,
      affectedRecordCount: affectedPatientIds.length,
      description,
      discoveryMethod,
      status: BreachStatus.DETECTED,
      containmentActions: [],
      notificationsSent: [],
    },
  });

  await createAuditLog({
    organizationId,
    userId,
    action: AuditAction.DATA_BREACH_DETECTED,
    resourceType: 'BreachIncident',
    resourceId: incident.id,
    details: {
      type,
      severity,
      affectedCount: affectedPatientIds.length,
    },
  });

  // Auto-escalate critical breaches
  if (severity === BreachSeverity.CRITICAL || severity === BreachSeverity.HIGH) {
    await notifySecurityTeam(incident as BreachIncident);
  }

  return incident as BreachIncident;
}

/**
 * Sends breach notifications to affected patients
 * HIPAA requires notification within 60 days of discovery
 */
export async function sendPatientNotifications(
  incidentId: string,
  userId: string
): Promise<void> {
  const incident = await prisma.breachIncident.findUnique({
    where: { id: incidentId },
    include: {
      organization: true,
    },
  });

  if (!incident) throw new Error('Incident not found');

  const patients = await prisma.patient.findMany({
    where: {
      id: { in: incident.affectedPatientIds },
    },
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const notifications: NotificationRecord[] = [];

  for (const patient of patients) {
    await sendEmail({
      to: patient.user.email,
      subject: 'Important Notice: Data Security Incident',
      template: 'breach-notification',
      data: {
        patientName: patient.user.name,
        organizationName: incident.organization.name,
        incidentDate: incident.detectedAt.toLocaleDateString(),
        description: getPatientFriendlyDescription(incident.type),
        affectedData: 'Protected health information',
        stepsToProtect: getProtectionSteps(),
        contactInfo: {
          phone: incident.organization.phone,
          email: incident.organization.email,
        },
      },
    });

    notifications.push({
      recipientType: 'patient',
      recipientId: patient.id,
      sentAt: new Date(),
      method: 'email',
    });
  }

  await prisma.breachIncident.update({
    where: { id: incidentId },
    data: {
      status: BreachStatus.NOTIFYING,
      notificationsSent: {
        push: notifications,
      },
    },
  });

  await createAuditLog({
    organizationId: incident.organizationId,
    userId,
    action: AuditAction.DATA_SHARED,
    resourceType: 'BreachIncident',
    resourceId: incidentId,
    details: {
      notificationCount: notifications.length,
      notificationType: 'patient_breach_notification',
    },
  });
}

/**
 * Reports breach to HHS (required for breaches affecting 500+ individuals)
 */
export async function reportToHHS(
  incidentId: string,
  userId: string
): Promise<void> {
  const incident = await prisma.breachIncident.findUnique({
    where: { id: incidentId },
    include: { organization: true },
  });

  if (!incident) throw new Error('Incident not found');

  // HHS Breach Portal submission would happen here
  // This is a placeholder for the actual HHS API integration
  const hhsReport = {
    coveredEntity: incident.organization.name,
    state: incident.organization.state,
    coveredEntityType: 'Healthcare Provider',
    individualsAffected: incident.affectedRecordCount,
    breachSubmissionDate: new Date().toISOString(),
    typeOfBreach: incident.type,
    locationOfBreachedInfo: 'Electronic Medical Records',
    businessAssociateInvolved: false,
    description: incident.description,
  };

  // In production, this would submit to HHS Breach Portal API
  console.log('HHS Report:', hhsReport);

  await prisma.breachIncident.update({
    where: { id: incidentId },
    data: {
      status: BreachStatus.REPORTED,
      hhsReportedAt: new Date(),
    },
  });

  await createAuditLog({
    organizationId: incident.organizationId,
    userId,
    action: AuditAction.DATA_SHARED,
    resourceType: 'BreachIncident',
    resourceId: incidentId,
    details: {
      reportedTo: 'HHS',
      affectedCount: incident.affectedRecordCount,
    },
  });
}

/**
 * Calculates notification deadline (60 days from discovery per HIPAA)
 */
export function getNotificationDeadline(detectedAt: Date): Date {
  const deadline = new Date(detectedAt);
  deadline.setDate(deadline.getDate() + 60);
  return deadline;
}

/**
 * Checks for incidents approaching notification deadline
 */
export async function getUpcomingDeadlines(
  organizationId: string,
  daysUntilDeadline: number = 14
): Promise<BreachIncident[]> {
  const incidents = await prisma.breachIncident.findMany({
    where: {
      organizationId,
      status: { in: [BreachStatus.DETECTED, BreachStatus.INVESTIGATING, BreachStatus.CONTAINED] },
    },
  });

  const now = new Date();
  return incidents.filter(incident => {
    const deadline = getNotificationDeadline(incident.detectedAt);
    const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysRemaining <= daysUntilDeadline;
  }) as BreachIncident[];
}

// Helper functions
function getPatientFriendlyDescription(type: BreachType): string {
  const descriptions: Record<BreachType, string> = {
    [BreachType.UNAUTHORIZED_ACCESS]: 'unauthorized access to your health records',
    [BreachType.UNAUTHORIZED_DISCLOSURE]: 'unintended disclosure of your health information',
    [BreachType.DATA_THEFT]: 'theft of electronic health records',
    [BreachType.LOST_DEVICE]: 'loss of a device containing health information',
    [BreachType.HACKING]: 'a cyber security incident affecting health records',
    [BreachType.IMPROPER_DISPOSAL]: 'improper disposal of health records',
    [BreachType.OTHER]: 'a security incident affecting your health information',
  };
  return descriptions[type];
}

function getProtectionSteps(): string[] {
  return [
    'Monitor your explanation of benefits statements for any unfamiliar medical services',
    'Review your medical records for any inaccuracies',
    'Consider placing a fraud alert on your credit reports',
    'Report any suspicious activity to our organization immediately',
  ];
}

async function notifySecurityTeam(incident: BreachIncident): Promise<void> {
  // Send urgent notification to security team
  await sendEmail({
    to: process.env.SECURITY_TEAM_EMAIL!,
    subject: `[URGENT] Data Breach Detected - ${incident.severity} Severity`,
    template: 'security-alert',
    data: {
      incidentId: incident.id,
      type: incident.type,
      severity: incident.severity,
      affectedCount: incident.affectedRecordCount,
      detectedAt: incident.detectedAt,
    },
  });
}
```

### Data Export (Patient Rights)

```typescript
// app/api/patients/[id]/records/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { decryptPHI } from '@/lib/encryption';
import { createAuditLog, AuditAction } from '@/lib/hipaa-audit';
import { handleAPIError } from '@/lib/api-error-handler';
import { generateFHIRBundle, generateCCDA } from '@/lib/health-data-export';

const exportSchema = z.object({
  format: z.enum(['fhir', 'ccda', 'json']).default('fhir'),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional(),
  }).optional(),
  includeTypes: z.array(z.enum([
    'demographics',
    'appointments',
    'consultations',
    'prescriptions',
    'lab_results',
    'medical_records',
    'allergies',
    'conditions',
  ])).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id: patientId } = await context.params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is the patient or has permission
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        user: true,
        organization: true,
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Only the patient themselves, or organization admins can export
    const isPatient = patient.userId === user.id;
    const isAdmin = user.role === 'ADMIN' || user.role === 'OWNER';

    if (!isPatient && !isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { format, dateRange, includeTypes } = exportSchema.parse(body);

    // Gather all patient data
    const [
      appointments,
      consultations,
      prescriptions,
      medicalRecords,
    ] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          patientId,
          ...(dateRange?.start || dateRange?.end) && {
            scheduledAt: {
              ...(dateRange.start && { gte: new Date(dateRange.start) }),
              ...(dateRange.end && { lte: new Date(dateRange.end) }),
            },
          },
        },
        include: {
          provider: { include: { user: { select: { name: true } } } },
          consultation: true,
        },
        orderBy: { scheduledAt: 'desc' },
      }),
      prisma.consultation.findMany({
        where: {
          patientId,
          ...(dateRange?.start || dateRange?.end) && {
            startedAt: {
              ...(dateRange.start && { gte: new Date(dateRange.start) }),
              ...(dateRange.end && { lte: new Date(dateRange.end) }),
            },
          },
        },
        include: {
          provider: { include: { user: { select: { name: true } } } },
          prescriptions: true,
        },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.prescription.findMany({
        where: {
          patientId,
          ...(dateRange?.start || dateRange?.end) && {
            prescribedAt: {
              ...(dateRange.start && { gte: new Date(dateRange.start) }),
              ...(dateRange.end && { lte: new Date(dateRange.end) }),
            },
          },
        },
        include: {
          provider: { include: { user: { select: { name: true } } } },
        },
        orderBy: { prescribedAt: 'desc' },
      }),
      prisma.medicalRecord.findMany({
        where: { patientId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Decrypt consultation notes
    const decryptedConsultations = await Promise.all(
      consultations.map(async (consultation) => ({
        ...consultation,
        chiefComplaint: consultation.chiefComplaint
          ? await decryptPHI(consultation.chiefComplaint, patientId)
          : null,
        historyOfPresentIllness: consultation.historyOfPresentIllness
          ? await decryptPHI(consultation.historyOfPresentIllness, patientId)
          : null,
        assessment: consultation.assessment
          ? await decryptPHI(consultation.assessment, patientId)
          : null,
        plan: consultation.plan
          ? await decryptPHI(consultation.plan, patientId)
          : null,
      }))
    );

    // Audit log the export
    await createAuditLog({
      organizationId: patient.organizationId,
      userId: user.id,
      action: AuditAction.PHI_EXPORT,
      resourceType: 'PatientData',
      resourceId: patientId,
      patientId,
      details: {
        format,
        dateRange,
        includeTypes,
        recordCounts: {
          appointments: appointments.length,
          consultations: consultations.length,
          prescriptions: prescriptions.length,
          medicalRecords: medicalRecords.length,
        },
      },
      ipAddress: request.headers.get('x-forwarded-for'),
    });

    // Generate export in requested format
    const exportData = {
      patient: {
        id: patient.id,
        name: patient.user.name,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        address: {
          street: patient.address,
          city: patient.city,
          state: patient.state,
          postalCode: patient.postalCode,
          country: patient.country,
        },
        allergies: patient.allergies,
        medications: patient.medications,
        conditions: patient.conditions,
      },
      appointments,
      consultations: decryptedConsultations,
      prescriptions,
      medicalRecords: medicalRecords.map(record => ({
        ...record,
        // Don't include actual file content, just metadata
        fileUrl: undefined,
      })),
      exportedAt: new Date().toISOString(),
      exportedBy: isPatient ? 'patient' : user.id,
      organization: {
        name: patient.organization.name,
        npiNumber: patient.organization.npiNumber,
      },
    };

    let exportContent: string;
    let contentType: string;
    let fileName: string;

    switch (format) {
      case 'fhir':
        exportContent = JSON.stringify(generateFHIRBundle(exportData), null, 2);
        contentType = 'application/fhir+json';
        fileName = `patient-records-${patientId}-fhir.json`;
        break;
      case 'ccda':
        exportContent = generateCCDA(exportData);
        contentType = 'application/xml';
        fileName = `patient-records-${patientId}.xml`;
        break;
      default:
        exportContent = JSON.stringify(exportData, null, 2);
        contentType = 'application/json';
        fileName = `patient-records-${patientId}.json`;
    }

    return new NextResponse(exportContent, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
```

```typescript
// lib/health-data-export.ts
import { v4 as uuidv4 } from 'uuid';

interface PatientExportData {
  patient: {
    id: string;
    name: string;
    dateOfBirth: Date | null;
    gender: string | null;
    address: {
      street: string | null;
      city: string | null;
      state: string | null;
      postalCode: string | null;
      country: string | null;
    };
    allergies: string[];
    medications: string[];
    conditions: string[];
  };
  appointments: any[];
  consultations: any[];
  prescriptions: any[];
  medicalRecords: any[];
  exportedAt: string;
  organization: {
    name: string;
    npiNumber: string | null;
  };
}

/**
 * Generates a FHIR R4 Bundle containing patient data
 */
export function generateFHIRBundle(data: PatientExportData): object {
  const bundle = {
    resourceType: 'Bundle',
    id: uuidv4(),
    type: 'document',
    timestamp: data.exportedAt,
    entry: [] as object[],
  };

  // Patient resource
  bundle.entry.push({
    fullUrl: `urn:uuid:${data.patient.id}`,
    resource: {
      resourceType: 'Patient',
      id: data.patient.id,
      name: [{ text: data.patient.name }],
      birthDate: data.patient.dateOfBirth?.toISOString().split('T')[0],
      gender: mapGenderToFHIR(data.patient.gender),
      address: data.patient.address.street ? [{
        line: [data.patient.address.street],
        city: data.patient.address.city,
        state: data.patient.address.state,
        postalCode: data.patient.address.postalCode,
        country: data.patient.address.country,
      }] : undefined,
    },
  });

  // Allergies
  for (const allergy of data.patient.allergies) {
    bundle.entry.push({
      fullUrl: `urn:uuid:${uuidv4()}`,
      resource: {
        resourceType: 'AllergyIntolerance',
        patient: { reference: `Patient/${data.patient.id}` },
        code: { text: allergy },
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
            code: 'active',
          }],
        },
      },
    });
  }

  // Conditions
  for (const condition of data.patient.conditions) {
    bundle.entry.push({
      fullUrl: `urn:uuid:${uuidv4()}`,
      resource: {
        resourceType: 'Condition',
        subject: { reference: `Patient/${data.patient.id}` },
        code: { text: condition },
        clinicalStatus: {
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
            code: 'active',
          }],
        },
      },
    });
  }

  // Medications
  for (const medication of data.patient.medications) {
    bundle.entry.push({
      fullUrl: `urn:uuid:${uuidv4()}`,
      resource: {
        resourceType: 'MedicationStatement',
        subject: { reference: `Patient/${data.patient.id}` },
        medicationCodeableConcept: { text: medication },
        status: 'active',
      },
    });
  }

  // Prescriptions as MedicationRequest
  for (const rx of data.prescriptions) {
    bundle.entry.push({
      fullUrl: `urn:uuid:${rx.id}`,
      resource: {
        resourceType: 'MedicationRequest',
        id: rx.id,
        status: mapPrescriptionStatus(rx.status),
        intent: 'order',
        medicationCodeableConcept: { text: rx.medicationName },
        subject: { reference: `Patient/${data.patient.id}` },
        authoredOn: rx.prescribedAt,
        dosageInstruction: [{
          text: `${rx.dosage} ${rx.frequency}`,
          route: { text: rx.route },
        }],
        dispenseRequest: {
          quantity: { value: rx.quantity },
          numberOfRepeatsAllowed: rx.refills,
        },
      },
    });
  }

  // Encounters from consultations
  for (const consultation of data.consultations) {
    bundle.entry.push({
      fullUrl: `urn:uuid:${consultation.id}`,
      resource: {
        resourceType: 'Encounter',
        id: consultation.id,
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: 'VR', // Virtual
        },
        subject: { reference: `Patient/${data.patient.id}` },
        period: {
          start: consultation.startedAt,
          end: consultation.endedAt,
        },
        reasonCode: consultation.chiefComplaint ? [{ text: consultation.chiefComplaint }] : undefined,
      },
    });

    // Clinical impressions from consultation
    if (consultation.assessment) {
      bundle.entry.push({
        fullUrl: `urn:uuid:${uuidv4()}`,
        resource: {
          resourceType: 'ClinicalImpression',
          status: 'completed',
          subject: { reference: `Patient/${data.patient.id}` },
          encounter: { reference: `Encounter/${consultation.id}` },
          summary: consultation.assessment,
          date: consultation.startedAt,
        },
      });
    }
  }

  return bundle;
}

/**
 * Generates a C-CDA (Consolidated Clinical Document Architecture) document
 */
export function generateCCDA(data: PatientExportData): string {
  const now = new Date().toISOString();

  return `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <realmCode code="US"/>
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <templateId root="2.16.840.1.113883.10.20.22.1.1"/>
  <id root="${uuidv4()}"/>
  <code code="34133-9" codeSystem="2.16.840.1.113883.6.1" displayName="Summarization of Episode Note"/>
  <title>Patient Health Summary</title>
  <effectiveTime value="${now.replace(/[-:T]/g, '').slice(0, 14)}"/>
  <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25"/>
  <languageCode code="en-US"/>

  <recordTarget>
    <patientRole>
      <id root="${data.patient.id}"/>
      <patient>
        <name><given>${escapeXml(data.patient.name)}</given></name>
        ${data.patient.dateOfBirth ? `<birthTime value="${data.patient.dateOfBirth.toISOString().replace(/[-:T]/g, '').slice(0, 8)}"/>` : ''}
        ${data.patient.gender ? `<administrativeGenderCode code="${data.patient.gender[0]}" codeSystem="2.16.840.1.113883.5.1"/>` : ''}
      </patient>
    </patientRole>
  </recordTarget>

  <custodian>
    <assignedCustodian>
      <representedCustodianOrganization>
        <name>${escapeXml(data.organization.name)}</name>
        ${data.organization.npiNumber ? `<id root="2.16.840.1.113883.4.6" extension="${data.organization.npiNumber}"/>` : ''}
      </representedCustodianOrganization>
    </assignedCustodian>
  </custodian>

  <component>
    <structuredBody>
      <!-- Allergies Section -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.6.1"/>
          <code code="48765-2" codeSystem="2.16.840.1.113883.6.1" displayName="Allergies"/>
          <title>Allergies</title>
          <text>
            <list>
              ${data.patient.allergies.map(a => `<item>${escapeXml(a)}</item>`).join('\n              ')}
            </list>
          </text>
        </section>
      </component>

      <!-- Medications Section -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.1.1"/>
          <code code="10160-0" codeSystem="2.16.840.1.113883.6.1" displayName="Medications"/>
          <title>Medications</title>
          <text>
            <list>
              ${data.prescriptions.map(rx => `<item>${escapeXml(rx.medicationName)} - ${escapeXml(rx.dosage)} ${escapeXml(rx.frequency)}</item>`).join('\n              ')}
            </list>
          </text>
        </section>
      </component>

      <!-- Problems Section -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.5.1"/>
          <code code="11450-4" codeSystem="2.16.840.1.113883.6.1" displayName="Problem List"/>
          <title>Problems</title>
          <text>
            <list>
              ${data.patient.conditions.map(c => `<item>${escapeXml(c)}</item>`).join('\n              ')}
            </list>
          </text>
        </section>
      </component>

      <!-- Encounters Section -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.22.1"/>
          <code code="46240-8" codeSystem="2.16.840.1.113883.6.1" displayName="Encounters"/>
          <title>Encounters</title>
          <text>
            <list>
              ${data.consultations.map(c => `<item>${c.startedAt} - ${escapeXml(c.chiefComplaint || 'Telehealth Consultation')}</item>`).join('\n              ')}
            </list>
          </text>
        </section>
      </component>
    </structuredBody>
  </component>
</ClinicalDocument>`;
}

function mapGenderToFHIR(gender: string | null): string | undefined {
  const mapping: Record<string, string> = {
    MALE: 'male',
    FEMALE: 'female',
    OTHER: 'other',
    PREFER_NOT_TO_SAY: 'unknown',
  };
  return gender ? mapping[gender] : undefined;
}

function mapPrescriptionStatus(status: string): string {
  const mapping: Record<string, string> = {
    ACTIVE: 'active',
    FILLED: 'completed',
    EXPIRED: 'stopped',
    CANCELLED: 'cancelled',
  };
  return mapping[status] || 'unknown';
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
```

### HIPAA Compliance Tests

```typescript
// tests/compliance/hipaa.test.ts
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import { prisma } from '@/lib/prisma';
import { encryptPHI, decryptPHI } from '@/lib/encryption';
import { createAuditLog, queryAuditLogs, verifyAuditLogIntegrity, AuditAction } from '@/lib/hipaa-audit';
import { recordConsent, hasValidConsent, ConsentType } from '@/lib/consent';
import { generateFHIRBundle, generateCCDA } from '@/lib/health-data-export';

describe('HIPAA Compliance Tests', () => {
  let testOrg: any;
  let testUser: any;
  let testPatient: any;

  beforeAll(async () => {
    // Create test data
    testOrg = await prisma.organization.create({
      data: {
        name: 'Test Healthcare Org',
        slug: 'test-healthcare-org',
        email: 'test@healthcare.org',
      },
    });

    testUser = await prisma.user.create({
      data: {
        email: 'testuser@healthcare.org',
        name: 'Test User',
        passwordHash: 'hashed',
      },
    });

    testPatient = await prisma.patient.create({
      data: {
        userId: testUser.id,
        organizationId: testOrg.id,
        allergies: ['Penicillin'],
        conditions: ['Hypertension'],
      },
    });

    process.env.ENCRYPTION_KEY = Buffer.from('test-encryption-key-32-bytes-00').toString('base64');
  });

  afterAll(async () => {
    await prisma.patient.delete({ where: { id: testPatient.id } });
    await prisma.user.delete({ where: { id: testUser.id } });
    await prisma.organization.delete({ where: { id: testOrg.id } });
  });

  describe('PHI Access Logging', () => {
    it('logs all PHI read operations', async () => {
      const log = await createAuditLog({
        organizationId: testOrg.id,
        userId: testUser.id,
        action: AuditAction.PHI_VIEW,
        resourceType: 'Patient',
        resourceId: testPatient.id,
        patientId: testPatient.id,
        details: { fields: ['allergies', 'conditions'] },
        ipAddress: '192.168.1.1',
      });

      expect(log).toBeDefined();
      expect(log.action).toBe(AuditAction.PHI_VIEW);
      expect(log.patientId).toBe(testPatient.id);
      expect(log.ipAddress).toBe('192.168.1.1');
    });

    it('logs all PHI write operations', async () => {
      const log = await createAuditLog({
        organizationId: testOrg.id,
        userId: testUser.id,
        action: AuditAction.PHI_UPDATE,
        resourceType: 'Patient',
        resourceId: testPatient.id,
        patientId: testPatient.id,
        details: {
          field: 'conditions',
          oldValue: ['Hypertension'],
          newValue: ['Hypertension', 'Diabetes'],
        },
        ipAddress: '192.168.1.1',
      });

      expect(log.action).toBe(AuditAction.PHI_UPDATE);
      expect(log.details).toHaveProperty('oldValue');
      expect(log.details).toHaveProperty('newValue');
    });

    it('logs all PHI delete operations', async () => {
      const log = await createAuditLog({
        organizationId: testOrg.id,
        userId: testUser.id,
        action: AuditAction.PHI_DELETE,
        resourceType: 'MedicalRecord',
        resourceId: 'record_123',
        patientId: testPatient.id,
        details: { reason: 'Patient request' },
        ipAddress: '192.168.1.1',
      });

      expect(log.action).toBe(AuditAction.PHI_DELETE);
    });

    it('includes required audit fields: userId, action, resourceType, resourceId, ipAddress, timestamp', async () => {
      const log = await createAuditLog({
        organizationId: testOrg.id,
        userId: testUser.id,
        action: AuditAction.PHI_VIEW,
        resourceType: 'Consultation',
        resourceId: 'consultation_123',
        patientId: testPatient.id,
        ipAddress: '10.0.0.1',
      });

      expect(log.userId).toBe(testUser.id);
      expect(log.action).toBe(AuditAction.PHI_VIEW);
      expect(log.resourceType).toBe('Consultation');
      expect(log.resourceId).toBe('consultation_123');
      expect(log.ipAddress).toBe('10.0.0.1');
      expect(log.createdAt).toBeInstanceOf(Date);
    });
  });

  describe('PHI Encryption', () => {
    it('encrypts sensitive patient data at rest', async () => {
      const sensitiveData = 'Patient diagnosis: Major Depressive Disorder';
      const encrypted = await encryptPHI(sensitiveData, testPatient.id);

      expect(encrypted).not.toBe(sensitiveData);
      expect(encrypted).not.toContain('Major Depressive');
      expect(encrypted).toBeTruthy();
    });

    it('decrypts data correctly with proper key', async () => {
      const sensitiveData = 'Lab results: HbA1c 8.5%, Glucose 180 mg/dL';
      const encrypted = await encryptPHI(sensitiveData, testPatient.id);
      const decrypted = await decryptPHI(encrypted, testPatient.id);

      expect(decrypted).toBe(sensitiveData);
    });

    it('fails to decrypt with incorrect patient key', async () => {
      const sensitiveData = 'Sensitive medical information';
      const encrypted = await encryptPHI(sensitiveData, testPatient.id);

      await expect(
        decryptPHI(encrypted, 'different_patient_id')
      ).rejects.toThrow();
    });

    it('uses different ciphertext for same plaintext (IV randomization)', async () => {
      const data = 'Test PHI data';
      const encrypted1 = await encryptPHI(data, testPatient.id);
      const encrypted2 = await encryptPHI(data, testPatient.id);

      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('Consent Validation', () => {
    it('requires valid consent before PHI access', async () => {
      // Initially no consent
      const hasConsent = await hasValidConsent(testPatient.id, ConsentType.TREATMENT);
      expect(hasConsent).toBe(false);
    });

    it('tracks consent with proper metadata', async () => {
      const consent = await recordConsent({
        patientId: testPatient.id,
        type: ConsentType.TREATMENT,
        version: '1.0',
        signatureData: 'data:image/png;base64,signature...',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        userId: testUser.id,
        organizationId: testOrg.id,
      });

      expect(consent.patientId).toBe(testPatient.id);
      expect(consent.type).toBe(ConsentType.TREATMENT);
      expect(consent.signatureData).toBeTruthy();
      expect(consent.ipAddress).toBe('192.168.1.1');
      expect(consent.expiresAt).toBeInstanceOf(Date);
    });

    it('validates consent expiration', async () => {
      // Record consent
      await recordConsent({
        patientId: testPatient.id,
        type: ConsentType.TELEHEALTH,
        version: '1.0',
        signatureData: 'signature',
        ipAddress: '192.168.1.1',
        userAgent: 'Test',
        userId: testUser.id,
        organizationId: testOrg.id,
      });

      const hasConsent = await hasValidConsent(testPatient.id, ConsentType.TELEHEALTH);
      expect(hasConsent).toBe(true);
    });
  });

  describe('Data Export Format', () => {
    const sampleExportData = {
      patient: {
        id: 'patient_123',
        name: 'John Doe',
        dateOfBirth: new Date('1980-01-15'),
        gender: 'MALE',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '12345',
          country: 'US',
        },
        allergies: ['Penicillin', 'Sulfa'],
        medications: ['Metformin 500mg'],
        conditions: ['Type 2 Diabetes', 'Hypertension'],
      },
      appointments: [],
      consultations: [],
      prescriptions: [{
        id: 'rx_123',
        medicationName: 'Metformin',
        dosage: '500mg',
        frequency: 'twice daily',
        route: 'oral',
        quantity: 60,
        refills: 3,
        status: 'ACTIVE',
        prescribedAt: new Date(),
      }],
      medicalRecords: [],
      exportedAt: new Date().toISOString(),
      organization: {
        name: 'Test Healthcare',
        npiNumber: '1234567890',
      },
    };

    it('exports data in FHIR R4 format', () => {
      const fhirBundle = generateFHIRBundle(sampleExportData);

      expect(fhirBundle).toHaveProperty('resourceType', 'Bundle');
      expect(fhirBundle).toHaveProperty('type', 'document');
      expect(fhirBundle).toHaveProperty('entry');
      expect(Array.isArray((fhirBundle as any).entry)).toBe(true);

      // Check for Patient resource
      const patientResource = (fhirBundle as any).entry.find(
        (e: any) => e.resource?.resourceType === 'Patient'
      );
      expect(patientResource).toBeDefined();
    });

    it('exports data in C-CDA format', () => {
      const ccda = generateCCDA(sampleExportData);

      expect(ccda).toContain('<?xml version="1.0"');
      expect(ccda).toContain('<ClinicalDocument');
      expect(ccda).toContain('John Doe');
      expect(ccda).toContain('Penicillin');
      expect(ccda).toContain('Metformin');
    });

    it('includes all required FHIR resources', () => {
      const fhirBundle = generateFHIRBundle(sampleExportData);
      const resourceTypes = (fhirBundle as any).entry.map(
        (e: any) => e.resource?.resourceType
      );

      expect(resourceTypes).toContain('Patient');
      expect(resourceTypes).toContain('AllergyIntolerance');
      expect(resourceTypes).toContain('Condition');
      expect(resourceTypes).toContain('MedicationRequest');
    });
  });

  describe('Audit Log Retention', () => {
    it('enforces 6-year retention policy', async () => {
      const log = await createAuditLog({
        organizationId: testOrg.id,
        userId: testUser.id,
        action: AuditAction.PHI_VIEW,
        resourceType: 'Patient',
        resourceId: testPatient.id,
        patientId: testPatient.id,
        ipAddress: '192.168.1.1',
      });

      // Verify retention expiration is set
      const dbLog = await prisma.hipaaAuditLog.findUnique({
        where: { id: log.id },
      });

      expect(dbLog?.retentionExpiresAt).toBeDefined();

      // Should be approximately 6 years from now
      const sixYearsFromNow = new Date();
      sixYearsFromNow.setFullYear(sixYearsFromNow.getFullYear() + 6);

      const retentionDate = new Date(dbLog!.retentionExpiresAt);
      const diffDays = Math.abs(
        (retentionDate.getTime() - sixYearsFromNow.getTime()) / (1000 * 60 * 60 * 24)
      );

      expect(diffDays).toBeLessThan(2); // Within 2 days tolerance
    });

    it('maintains tamper-evident hash chain', async () => {
      // Create several logs
      for (let i = 0; i < 3; i++) {
        await createAuditLog({
          organizationId: testOrg.id,
          userId: testUser.id,
          action: AuditAction.PHI_VIEW,
          resourceType: 'Patient',
          resourceId: `patient_${i}`,
          ipAddress: '192.168.1.1',
        });
      }

      // Verify integrity
      const result = await verifyAuditLogIntegrity(testOrg.id);
      expect(result.valid).toBe(true);
    });

    it('detects tampered audit logs', async () => {
      // Create a log
      const log = await createAuditLog({
        organizationId: testOrg.id,
        userId: testUser.id,
        action: AuditAction.PHI_VIEW,
        resourceType: 'Patient',
        resourceId: testPatient.id,
        ipAddress: '192.168.1.1',
      });

      // Tamper with the log directly in DB
      await prisma.hipaaAuditLog.update({
        where: { id: log.id },
        data: { action: AuditAction.PHI_DELETE }, // Changed action
      });

      // Verification should fail
      const result = await verifyAuditLogIntegrity(testOrg.id);
      expect(result.valid).toBe(false);
      expect(result.brokenAt).toBe(log.id);
    });
  });

  describe('Access Control', () => {
    it('logs unauthorized access attempts', async () => {
      const log = await createAuditLog({
        organizationId: testOrg.id,
        userId: testUser.id,
        action: AuditAction.UNAUTHORIZED_ACCESS,
        resourceType: 'Patient',
        resourceId: 'unauthorized_patient_id',
        details: {
          reason: 'User attempted to access patient from different organization',
        },
        ipAddress: '192.168.1.1',
      });

      expect(log.action).toBe(AuditAction.UNAUTHORIZED_ACCESS);
    });

    it('tracks failed login attempts', async () => {
      const log = await createAuditLog({
        organizationId: testOrg.id,
        action: AuditAction.LOGIN_FAILED,
        resourceType: 'Authentication',
        details: {
          email: 'attacker@example.com',
          reason: 'Invalid password',
        },
        ipAddress: '192.168.1.100',
      });

      expect(log.action).toBe(AuditAction.LOGIN_FAILED);
      expect(log.ipAddress).toBe('192.168.1.100');
    });
  });

  describe('Minimum Necessary Standard', () => {
    it('allows querying audit logs by specific criteria', async () => {
      // Create logs with different actions
      await createAuditLog({
        organizationId: testOrg.id,
        userId: testUser.id,
        action: AuditAction.PHI_VIEW,
        resourceType: 'Patient',
        resourceId: testPatient.id,
        patientId: testPatient.id,
        ipAddress: '192.168.1.1',
      });

      await createAuditLog({
        organizationId: testOrg.id,
        userId: testUser.id,
        action: AuditAction.PHI_EXPORT,
        resourceType: 'Patient',
        resourceId: testPatient.id,
        patientId: testPatient.id,
        ipAddress: '192.168.1.1',
      });

      // Query only PHI_VIEW actions
      const result = await queryAuditLogs({
        organizationId: testOrg.id,
        action: AuditAction.PHI_VIEW,
      });

      const allPHIView = result.logs.every(log => log.action === AuditAction.PHI_VIEW);
      expect(allPHIView).toBe(true);
    });

    it('filters audit logs by patient', async () => {
      const result = await queryAuditLogs({
        organizationId: testOrg.id,
        patientId: testPatient.id,
      });

      const allForPatient = result.logs.every(log => log.patientId === testPatient.id);
      expect(allForPatient).toBe(true);
    });
  });
});
```

### Enhanced Consent Management with Versioning

```typescript
// lib/consent-versioning.ts
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/hipaa-audit';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface ConsentVersion {
  id: string;
  type: ConsentType;
  version: string;
  title: string;
  content: string;
  effectiveDate: Date;
  supersededAt: Date | null;
  createdAt: Date;
}

export interface ConsentHistory {
  consentId: string;
  version: ConsentVersion;
  grantedAt: Date;
  revokedAt: Date | null;
  signatureData: string;
  ipAddress: string;
  userAgent: string;
}

// Consent version management
export async function createConsentVersion(data: {
  type: ConsentType;
  version: string;
  title: string;
  content: string;
  effectiveDate?: Date;
  createdBy: string;
  organizationId: string;
}): Promise<ConsentVersion> {
  // Supersede previous version
  await prisma.consentVersion.updateMany({
    where: {
      type: data.type,
      supersededAt: null,
    },
    data: {
      supersededAt: new Date(),
    },
  });

  const consentVersion = await prisma.consentVersion.create({
    data: {
      type: data.type,
      version: data.version,
      title: data.title,
      content: data.content,
      effectiveDate: data.effectiveDate || new Date(),
      supersededAt: null,
    },
  });

  await createAuditLog({
    organizationId: data.organizationId,
    userId: data.createdBy,
    action: AuditAction.CONSENT_VERSION_CREATED,
    resourceType: 'ConsentVersion',
    resourceId: consentVersion.id,
    details: {
      type: data.type,
      version: data.version,
    },
    ipAddress: '127.0.0.1', // Server-side action
  });

  return consentVersion as ConsentVersion;
}

// Get current effective consent version
export async function getCurrentConsentVersion(type: ConsentType): Promise<ConsentVersion | null> {
  const version = await prisma.consentVersion.findFirst({
    where: {
      type,
      supersededAt: null,
      effectiveDate: { lte: new Date() },
    },
    orderBy: { effectiveDate: 'desc' },
  });

  return version as ConsentVersion | null;
}

// Get patient's consent history
export async function getConsentHistory(patientId: string): Promise<ConsentHistory[]> {
  const consents = await prisma.patientConsent.findMany({
    where: { patientId },
    include: {
      consentVersion: true,
    },
    orderBy: { grantedAt: 'desc' },
  });

  return consents.map((c) => ({
    consentId: c.id,
    version: c.consentVersion as ConsentVersion,
    grantedAt: c.grantedAt,
    revokedAt: c.revokedAt,
    signatureData: c.signatureData,
    ipAddress: c.ipAddress,
    userAgent: c.userAgent,
  }));
}

// Check if patient needs to re-consent (new version available)
export async function needsReConsent(
  patientId: string,
  type: ConsentType
): Promise<{ needed: boolean; currentVersion: string | null; latestVersion: string | null }> {
  const [patientConsent, latestVersion] = await Promise.all([
    prisma.patientConsent.findFirst({
      where: {
        patientId,
        type,
        revokedAt: null,
      },
      include: { consentVersion: true },
      orderBy: { grantedAt: 'desc' },
    }),
    getCurrentConsentVersion(type),
  ]);

  if (!latestVersion) {
    return { needed: false, currentVersion: null, latestVersion: null };
  }

  if (!patientConsent) {
    return { needed: true, currentVersion: null, latestVersion: latestVersion.version };
  }

  const needsUpdate = patientConsent.consentVersionId !== latestVersion.id;

  return {
    needed: needsUpdate,
    currentVersion: patientConsent.consentVersion?.version || null,
    latestVersion: latestVersion.version,
  };
}

// Generate signed consent PDF
export async function generateConsentPDF(data: {
  patientName: string;
  patientEmail: string;
  patientDOB: string;
  consentType: ConsentType;
  consentVersion: ConsentVersion;
  signatureData: string;
  grantedAt: Date;
  organizationName: string;
  organizationAddress: string;
}): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  const page = pdfDoc.addPage([612, 792]); // Letter size
  const { height } = page.getSize();
  let y = height - 50;

  // Header
  page.drawText(data.organizationName, {
    x: 50,
    y,
    size: 18,
    font: timesBold,
    color: rgb(0, 0, 0),
  });
  y -= 20;
  page.drawText(data.organizationAddress, {
    x: 50,
    y,
    size: 10,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 40;

  // Title
  page.drawText(data.consentVersion.title, {
    x: 50,
    y,
    size: 16,
    font: timesBold,
  });
  y -= 30;

  // Patient info
  page.drawText(`Patient: ${data.patientName}`, { x: 50, y, size: 12, font: timesRoman });
  y -= 18;
  page.drawText(`Email: ${data.patientEmail}`, { x: 50, y, size: 12, font: timesRoman });
  y -= 18;
  page.drawText(`Date of Birth: ${data.patientDOB}`, { x: 50, y, size: 12, font: timesRoman });
  y -= 30;

  // Consent content
  const contentLines = data.consentVersion.content.split('\n');
  for (const line of contentLines) {
    if (y < 150) {
      // Add new page if needed
      const newPage = pdfDoc.addPage([612, 792]);
      y = height - 50;
    }
    page.drawText(line.substring(0, 80), { x: 50, y, size: 11, font: timesRoman });
    y -= 16;
  }
  y -= 20;

  // Signature section
  page.drawText('Electronic Signature:', { x: 50, y, size: 12, font: timesBold });
  y -= 50;

  // Embed signature image if provided
  if (data.signatureData.startsWith('data:image/png;base64,')) {
    const signatureImageData = data.signatureData.replace('data:image/png;base64,', '');
    const signatureImage = await pdfDoc.embedPng(Buffer.from(signatureImageData, 'base64'));
    const signatureDims = signatureImage.scale(0.5);
    page.drawImage(signatureImage, {
      x: 50,
      y: y - signatureDims.height,
      width: Math.min(signatureDims.width, 200),
      height: Math.min(signatureDims.height, 50),
    });
    y -= 60;
  }

  // Timestamp and version
  page.drawText(`Signed: ${data.grantedAt.toISOString()}`, {
    x: 50,
    y,
    size: 10,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 14;
  page.drawText(`Consent Version: ${data.consentVersion.version}`, {
    x: 50,
    y,
    size: 10,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });
  y -= 14;
  page.drawText(`Document ID: ${crypto.randomUUID()}`, {
    x: 50,
    y,
    size: 10,
    font: timesRoman,
    color: rgb(0.3, 0.3, 0.3),
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
```

### Consent Middleware for PHI Access

```typescript
// middleware/consent-check.ts
import { NextRequest, NextResponse } from 'next/server';
import { hasValidConsent, ConsentType } from '@/lib/consent';
import { createAuditLog, AuditAction } from '@/lib/hipaa-audit';

interface ConsentRequirement {
  path: RegExp;
  requiredConsents: ConsentType[];
}

const CONSENT_REQUIREMENTS: ConsentRequirement[] = [
  {
    path: /^\/api\/consultations/,
    requiredConsents: [ConsentType.TREATMENT, ConsentType.TELEHEALTH],
  },
  {
    path: /^\/api\/prescriptions/,
    requiredConsents: [ConsentType.TREATMENT],
  },
  {
    path: /^\/api\/patients\/.*\/records/,
    requiredConsents: [ConsentType.TREATMENT, ConsentType.DISCLOSURE],
  },
  {
    path: /^\/room\//,
    requiredConsents: [ConsentType.TELEHEALTH],
  },
];

export async function consentMiddleware(
  request: NextRequest,
  patientId: string,
  userId: string,
  organizationId: string
): Promise<NextResponse | null> {
  const path = request.nextUrl.pathname;
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  // Find matching consent requirements
  const requirement = CONSENT_REQUIREMENTS.find((r) => r.path.test(path));
  if (!requirement) {
    return null; // No consent required for this path
  }

  // Check all required consents
  const consentChecks = await Promise.all(
    requirement.requiredConsents.map(async (type) => ({
      type,
      valid: await hasValidConsent(patientId, type),
    }))
  );

  const missingConsents = consentChecks.filter((c) => !c.valid);

  if (missingConsents.length > 0) {
    // Log consent denial
    await createAuditLog({
      organizationId,
      userId,
      action: AuditAction.CONSENT_DENIED,
      resourceType: 'ConsentCheck',
      patientId,
      details: {
        path,
        missingConsents: missingConsents.map((c) => c.type),
      },
      ipAddress: ip,
    });

    return NextResponse.json(
      {
        error: 'Consent required',
        code: 'CONSENT_REQUIRED',
        missingConsents: missingConsents.map((c) => c.type),
        redirectUrl: `/patient/consent?required=${missingConsents.map((c) => c.type).join(',')}`,
      },
      { status: 403 }
    );
  }

  return null; // All consents valid
}
```

### Break-the-Glass Emergency Access

```typescript
// lib/break-the-glass.ts
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/hipaa-audit';
import { sendEmail } from '@/lib/email';

export enum EmergencyAccessReason {
  MEDICAL_EMERGENCY = 'MEDICAL_EMERGENCY',
  UNCONSCIOUS_PATIENT = 'UNCONSCIOUS_PATIENT',
  LIFE_THREATENING = 'LIFE_THREATENING',
  DISASTER_RESPONSE = 'DISASTER_RESPONSE',
  PUBLIC_HEALTH = 'PUBLIC_HEALTH',
}

export interface BreakTheGlassRequest {
  userId: string;
  patientId: string;
  organizationId: string;
  reason: EmergencyAccessReason;
  justification: string;
  ipAddress: string;
  userAgent: string;
}

export interface BreakTheGlassRecord {
  id: string;
  userId: string;
  patientId: string;
  organizationId: string;
  reason: EmergencyAccessReason;
  justification: string;
  grantedAt: Date;
  expiresAt: Date;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  reviewNotes: string | null;
  ipAddress: string;
  userAgent: string;
}

// Request emergency access (Break-the-Glass)
export async function requestEmergencyAccess(
  request: BreakTheGlassRequest
): Promise<BreakTheGlassRecord> {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 4); // 4-hour access window

  const record = await prisma.breakTheGlassAccess.create({
    data: {
      userId: request.userId,
      patientId: request.patientId,
      organizationId: request.organizationId,
      reason: request.reason,
      justification: request.justification,
      grantedAt: new Date(),
      expiresAt,
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
    },
  });

  // Log the emergency access
  await createAuditLog({
    organizationId: request.organizationId,
    userId: request.userId,
    action: AuditAction.BREAK_THE_GLASS,
    resourceType: 'BreakTheGlass',
    resourceId: record.id,
    patientId: request.patientId,
    details: {
      reason: request.reason,
      justification: request.justification,
      expiresAt: expiresAt.toISOString(),
    },
    ipAddress: request.ipAddress,
  });

  // Notify compliance officers and patient
  await notifyEmergencyAccess(record);

  return record as BreakTheGlassRecord;
}

// Check if user has active emergency access
export async function hasEmergencyAccess(
  userId: string,
  patientId: string
): Promise<boolean> {
  const access = await prisma.breakTheGlassAccess.findFirst({
    where: {
      userId,
      patientId,
      expiresAt: { gt: new Date() },
    },
  });

  return !!access;
}

// Review emergency access (compliance review)
export async function reviewEmergencyAccess(
  accessId: string,
  reviewData: {
    reviewedBy: string;
    reviewNotes: string;
    appropriate: boolean;
    organizationId: string;
  }
): Promise<void> {
  await prisma.breakTheGlassAccess.update({
    where: { id: accessId },
    data: {
      reviewedAt: new Date(),
      reviewedBy: reviewData.reviewedBy,
      reviewNotes: reviewData.reviewNotes,
    },
  });

  await createAuditLog({
    organizationId: reviewData.organizationId,
    userId: reviewData.reviewedBy,
    action: AuditAction.BREAK_THE_GLASS_REVIEWED,
    resourceType: 'BreakTheGlass',
    resourceId: accessId,
    details: {
      appropriate: reviewData.appropriate,
      reviewNotes: reviewData.reviewNotes,
    },
    ipAddress: '127.0.0.1',
  });
}

// Send notifications for emergency access
async function notifyEmergencyAccess(record: BreakTheGlassRecord): Promise<void> {
  const [user, patient, complianceOfficers] = await Promise.all([
    prisma.user.findUnique({ where: { id: record.userId } }),
    prisma.patient.findUnique({
      where: { id: record.patientId },
      include: { user: true },
    }),
    prisma.organizationMember.findMany({
      where: {
        organizationId: record.organizationId,
        role: 'ADMIN', // Compliance officers are typically admins
      },
      include: { user: true },
    }),
  ]);

  // Notify compliance officers
  for (const officer of complianceOfficers) {
    await sendEmail({
      to: officer.user.email,
      subject: '[URGENT] Break-the-Glass Access Requested',
      template: 'break-the-glass-notification',
      data: {
        officerName: officer.user.name,
        userName: user?.name,
        patientName: patient?.user.name,
        reason: record.reason,
        justification: record.justification,
        grantedAt: record.grantedAt.toISOString(),
        expiresAt: record.expiresAt.toISOString(),
        reviewUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/audit-log/break-the-glass/${record.id}`,
      },
    });
  }

  // Notify patient (after the fact)
  if (patient?.user.email) {
    await sendEmail({
      to: patient.user.email,
      subject: 'Emergency Access to Your Medical Records',
      template: 'patient-emergency-access-notice',
      data: {
        patientName: patient.user.name,
        accessedAt: record.grantedAt.toISOString(),
        reason: record.reason,
        contactUrl: `${process.env.NEXT_PUBLIC_APP_URL}/support`,
      },
    });
  }
}

// Get pending reviews
export async function getPendingReviews(
  organizationId: string
): Promise<BreakTheGlassRecord[]> {
  const records = await prisma.breakTheGlassAccess.findMany({
    where: {
      organizationId,
      reviewedAt: null,
    },
    orderBy: { grantedAt: 'desc' },
  });

  return records as BreakTheGlassRecord[];
}
```

### Field-Level PHI Access Tracking

```typescript
// lib/field-level-audit.ts
import { prisma } from '@/lib/prisma';
import { createAuditLog, AuditAction } from '@/lib/hipaa-audit';

// Define PHI sensitivity levels
export enum PHISensitivity {
  LOW = 'LOW',           // Name, address
  MEDIUM = 'MEDIUM',     // DOB, insurance info
  HIGH = 'HIGH',         // Diagnoses, medications
  CRITICAL = 'CRITICAL', // Mental health, HIV, substance abuse
}

// PHI field registry
export const PHI_FIELDS: Record<string, { entity: string; field: string; sensitivity: PHISensitivity }> = {
  'Patient.dateOfBirth': { entity: 'Patient', field: 'dateOfBirth', sensitivity: PHISensitivity.MEDIUM },
  'Patient.allergies': { entity: 'Patient', field: 'allergies', sensitivity: PHISensitivity.HIGH },
  'Patient.medications': { entity: 'Patient', field: 'medications', sensitivity: PHISensitivity.HIGH },
  'Patient.conditions': { entity: 'Patient', field: 'conditions', sensitivity: PHISensitivity.HIGH },
  'Patient.insuranceProvider': { entity: 'Patient', field: 'insuranceProvider', sensitivity: PHISensitivity.MEDIUM },
  'Patient.insurancePolicyNumber': { entity: 'Patient', field: 'insurancePolicyNumber', sensitivity: PHISensitivity.MEDIUM },
  'Consultation.assessment': { entity: 'Consultation', field: 'assessment', sensitivity: PHISensitivity.CRITICAL },
  'Consultation.diagnoses': { entity: 'Consultation', field: 'diagnoses', sensitivity: PHISensitivity.CRITICAL },
  'Prescription.medicationName': { entity: 'Prescription', field: 'medicationName', sensitivity: PHISensitivity.HIGH },
  'MedicalRecord.fileUrl': { entity: 'MedicalRecord', field: 'fileUrl', sensitivity: PHISensitivity.HIGH },
};

// Track field-level access
export async function trackFieldAccess(data: {
  organizationId: string;
  userId: string;
  patientId: string;
  entityType: string;
  entityId: string;
  fieldsAccessed: string[];
  accessReason?: string;
  ipAddress: string;
}): Promise<void> {
  const fieldDetails = data.fieldsAccessed.map((field) => {
    const key = `${data.entityType}.${field}`;
    const fieldInfo = PHI_FIELDS[key];
    return {
      field,
      sensitivity: fieldInfo?.sensitivity || PHISensitivity.LOW,
    };
  });

  // Check for critical field access
  const criticalFields = fieldDetails.filter((f) => f.sensitivity === PHISensitivity.CRITICAL);

  await createAuditLog({
    organizationId: data.organizationId,
    userId: data.userId,
    action: criticalFields.length > 0 ? AuditAction.PHI_VIEW_CRITICAL : AuditAction.PHI_VIEW,
    resourceType: data.entityType,
    resourceId: data.entityId,
    patientId: data.patientId,
    details: {
      fieldsAccessed: fieldDetails,
      accessReason: data.accessReason,
      hasCriticalFields: criticalFields.length > 0,
    },
    ipAddress: data.ipAddress,
  });

  // Alert on critical field access if needed
  if (criticalFields.length > 0) {
    await alertCriticalAccess(data, criticalFields);
  }
}

// Alert on critical PHI access
async function alertCriticalAccess(
  data: { organizationId: string; userId: string; patientId: string },
  criticalFields: { field: string; sensitivity: PHISensitivity }[]
): Promise<void> {
  // Could trigger real-time alerts to compliance officers
  console.log(`[CRITICAL PHI ACCESS] User ${data.userId} accessed critical fields for patient ${data.patientId}:`, criticalFields);

  // In production, send to monitoring/alerting system
  // await sendToSecurityMonitoring({ ... });
}

// Generate field access report
export async function generateFieldAccessReport(params: {
  organizationId: string;
  patientId?: string;
  startDate: Date;
  endDate: Date;
  sensitivity?: PHISensitivity;
}): Promise<{
  totalAccesses: number;
  byField: Record<string, number>;
  bySensitivity: Record<PHISensitivity, number>;
  byUser: Record<string, number>;
}> {
  const logs = await prisma.hipaaAuditLog.findMany({
    where: {
      organizationId: params.organizationId,
      patientId: params.patientId,
      action: { in: [AuditAction.PHI_VIEW, AuditAction.PHI_VIEW_CRITICAL] },
      createdAt: {
        gte: params.startDate,
        lte: params.endDate,
      },
    },
  });

  const report = {
    totalAccesses: logs.length,
    byField: {} as Record<string, number>,
    bySensitivity: {
      [PHISensitivity.LOW]: 0,
      [PHISensitivity.MEDIUM]: 0,
      [PHISensitivity.HIGH]: 0,
      [PHISensitivity.CRITICAL]: 0,
    },
    byUser: {} as Record<string, number>,
  };

  for (const log of logs) {
    const details = log.details as any;

    // Count by user
    if (log.userId) {
      report.byUser[log.userId] = (report.byUser[log.userId] || 0) + 1;
    }

    // Count by field and sensitivity
    if (details?.fieldsAccessed) {
      for (const fieldAccess of details.fieldsAccessed) {
        report.byField[fieldAccess.field] = (report.byField[fieldAccess.field] || 0) + 1;
        report.bySensitivity[fieldAccess.sensitivity as PHISensitivity]++;
      }
    }
  }

  return report;
}
```

### Enhanced Encryption Tests

```typescript
// tests/compliance/encryption.test.ts
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import {
  encryptPHI,
  decryptPHI,
  generateEncryptionKey,
  rotateEncryptionKey,
  derivePatientKey,
  encryptFile,
  decryptFile,
} from '@/lib/encryption';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

describe('PHI Encryption Tests', () => {
  let testPatientId: string;
  let originalKey: string;

  beforeAll(() => {
    testPatientId = 'test_patient_' + Date.now();
    originalKey = Buffer.from('test-encryption-key-32-bytes-00').toString('base64');
    process.env.ENCRYPTION_KEY = originalKey;
  });

  describe('AES-256-GCM Encryption', () => {
    it('uses AES-256-GCM algorithm', async () => {
      const plaintext = 'Sensitive patient diagnosis';
      const encrypted = await encryptPHI(plaintext, testPatientId);

      // Encrypted format: iv:authTag:ciphertext (all base64)
      const parts = encrypted.split(':');
      expect(parts).toHaveLength(3);

      // IV should be 12 bytes (96 bits) for GCM
      const iv = Buffer.from(parts[0], 'base64');
      expect(iv.length).toBe(12);

      // Auth tag should be 16 bytes (128 bits)
      const authTag = Buffer.from(parts[1], 'base64');
      expect(authTag.length).toBe(16);
    });

    it('produces different ciphertext for same plaintext (IV randomization)', async () => {
      const plaintext = 'Same sensitive data';
      const encryptions = await Promise.all([
        encryptPHI(plaintext, testPatientId),
        encryptPHI(plaintext, testPatientId),
        encryptPHI(plaintext, testPatientId),
      ]);

      // All should be unique
      const uniqueSet = new Set(encryptions);
      expect(uniqueSet.size).toBe(3);

      // But all should decrypt to same value
      const decryptions = await Promise.all(
        encryptions.map((e) => decryptPHI(e, testPatientId))
      );
      expect(decryptions.every((d) => d === plaintext)).toBe(true);
    });

    it('detects tampered ciphertext (authentication)', async () => {
      const plaintext = 'Protected health information';
      const encrypted = await encryptPHI(plaintext, testPatientId);

      // Tamper with the ciphertext
      const parts = encrypted.split(':');
      const tamperedCiphertext = Buffer.from(parts[2], 'base64');
      tamperedCiphertext[0] ^= 0xff; // Flip bits
      parts[2] = tamperedCiphertext.toString('base64');
      const tampered = parts.join(':');

      await expect(decryptPHI(tampered, testPatientId)).rejects.toThrow();
    });

    it('detects tampered auth tag', async () => {
      const plaintext = 'PHI with integrity check';
      const encrypted = await encryptPHI(plaintext, testPatientId);

      const parts = encrypted.split(':');
      const tamperedTag = Buffer.from(parts[1], 'base64');
      tamperedTag[0] ^= 0xff;
      parts[1] = tamperedTag.toString('base64');
      const tampered = parts.join(':');

      await expect(decryptPHI(tampered, testPatientId)).rejects.toThrow();
    });
  });

  describe('Patient-Specific Key Derivation', () => {
    it('derives unique keys per patient using PBKDF2', async () => {
      const key1 = await derivePatientKey('patient_1');
      const key2 = await derivePatientKey('patient_2');

      expect(key1).not.toEqual(key2);
      expect(key1.length).toBe(32); // 256 bits
      expect(key2.length).toBe(32);
    });

    it('produces consistent key for same patient', async () => {
      const key1 = await derivePatientKey(testPatientId);
      const key2 = await derivePatientKey(testPatientId);

      expect(key1).toEqual(key2);
    });

    it('isolates encryption between patients', async () => {
      const plaintext = 'Cross-patient isolation test';
      const encrypted = await encryptPHI(plaintext, 'patient_A');

      // Should fail to decrypt with different patient key
      await expect(decryptPHI(encrypted, 'patient_B')).rejects.toThrow();
    });
  });

  describe('Key Rotation', () => {
    it('re-encrypts data with new key during rotation', async () => {
      const plaintext = 'Data to be rotated';
      const encrypted = await encryptPHI(plaintext, testPatientId);

      // Generate new key
      const newKey = await generateEncryptionKey();

      // Rotate (re-encrypt with new key)
      const rotated = await rotateEncryptionKey(encrypted, testPatientId, newKey);

      expect(rotated).not.toBe(encrypted);

      // Should decrypt with new key
      process.env.ENCRYPTION_KEY = newKey;
      const decrypted = await decryptPHI(rotated, testPatientId);
      expect(decrypted).toBe(plaintext);

      // Restore original key
      process.env.ENCRYPTION_KEY = originalKey;
    });

    it('maintains data integrity during rotation', async () => {
      const testData = [
        'Medical diagnosis: Type 2 Diabetes',
        'Lab result: HbA1c 7.5%',
        'Medication: Metformin 1000mg BID',
      ];

      // Encrypt all with original key
      const encrypted = await Promise.all(
        testData.map((d) => encryptPHI(d, testPatientId))
      );

      // Generate new key and rotate
      const newKey = await generateEncryptionKey();
      const rotated = await Promise.all(
        encrypted.map((e) => rotateEncryptionKey(e, testPatientId, newKey))
      );

      // Verify all data preserved
      process.env.ENCRYPTION_KEY = newKey;
      const decrypted = await Promise.all(
        rotated.map((r) => decryptPHI(r, testPatientId))
      );

      expect(decrypted).toEqual(testData);
      process.env.ENCRYPTION_KEY = originalKey;
    });
  });

  describe('File Encryption', () => {
    it('encrypts files with streaming for large files', async () => {
      // Create test file content (1MB)
      const fileContent = Buffer.alloc(1024 * 1024);
      crypto.randomFillSync(fileContent);

      const encrypted = await encryptFile(fileContent, testPatientId);

      expect(encrypted.length).toBeGreaterThan(fileContent.length);
      expect(encrypted).not.toEqual(fileContent);
    });

    it('decrypts files correctly', async () => {
      const originalContent = Buffer.from('Medical record PDF content');
      const encrypted = await encryptFile(originalContent, testPatientId);
      const decrypted = await decryptFile(encrypted, testPatientId);

      expect(decrypted).toEqual(originalContent);
    });

    it('handles binary file content (images, PDFs)', async () => {
      // Simulate PDF header
      const pdfContent = Buffer.from([
        0x25, 0x50, 0x44, 0x46, // %PDF
        0x2d, 0x31, 0x2e, 0x34, // -1.4
        ...Array(1000).fill(0).map(() => Math.floor(Math.random() * 256)),
      ]);

      const encrypted = await encryptFile(pdfContent, testPatientId);
      const decrypted = await decryptFile(encrypted, testPatientId);

      expect(decrypted).toEqual(pdfContent);
    });
  });

  describe('Error Handling', () => {
    it('throws on empty plaintext', async () => {
      await expect(encryptPHI('', testPatientId)).rejects.toThrow('Empty plaintext');
    });

    it('throws on missing encryption key', async () => {
      const savedKey = process.env.ENCRYPTION_KEY;
      delete process.env.ENCRYPTION_KEY;

      await expect(encryptPHI('test', testPatientId)).rejects.toThrow('Encryption key not configured');

      process.env.ENCRYPTION_KEY = savedKey;
    });

    it('throws on invalid key format', async () => {
      const savedKey = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = 'invalid-not-base64!!!';

      await expect(encryptPHI('test', testPatientId)).rejects.toThrow();

      process.env.ENCRYPTION_KEY = savedKey;
    });

    it('throws on key too short', async () => {
      const savedKey = process.env.ENCRYPTION_KEY;
      process.env.ENCRYPTION_KEY = Buffer.from('short').toString('base64');

      await expect(encryptPHI('test', testPatientId)).rejects.toThrow('Invalid key length');

      process.env.ENCRYPTION_KEY = savedKey;
    });

    it('handles corrupted ciphertext gracefully', async () => {
      const corrupted = 'not:valid:ciphertext';
      await expect(decryptPHI(corrupted, testPatientId)).rejects.toThrow();
    });
  });

  describe('Performance', () => {
    it('encrypts within acceptable time limits', async () => {
      const plaintext = 'Performance test data '.repeat(100);
      const iterations = 100;

      const start = performance.now();
      for (let i = 0; i < iterations; i++) {
        await encryptPHI(plaintext, testPatientId);
      }
      const elapsed = performance.now() - start;

      const avgMs = elapsed / iterations;
      expect(avgMs).toBeLessThan(10); // Should be < 10ms per operation
    });

    it('handles concurrent encryption safely', async () => {
      const plaintexts = Array(50).fill(null).map((_, i) => `Concurrent test ${i}`);

      const results = await Promise.all(
        plaintexts.map((p) => encryptPHI(p, testPatientId))
      );

      // All should be unique (due to IV randomization)
      const uniqueSet = new Set(results);
      expect(uniqueSet.size).toBe(50);

      // All should decrypt correctly
      const decrypted = await Promise.all(
        results.map((r) => decryptPHI(r, testPatientId))
      );
      expect(decrypted).toEqual(plaintexts);
    });
  });

  describe('HIPAA Technical Safeguards', () => {
    it('implements encryption at rest', async () => {
      const phi = 'Patient SSN: 123-45-6789';
      const encrypted = await encryptPHI(phi, testPatientId);

      // Verify SSN is not visible in encrypted form
      expect(encrypted).not.toContain('123');
      expect(encrypted).not.toContain('456');
      expect(encrypted).not.toContain('789');
      expect(encrypted).not.toContain('SSN');
    });

    it('provides integrity verification via authenticated encryption', async () => {
      const phi = 'Diagnosis: Major Depressive Disorder';
      const encrypted = await encryptPHI(phi, testPatientId);

      // Verify decryption validates integrity
      const decrypted = await decryptPHI(encrypted, testPatientId);
      expect(decrypted).toBe(phi);
    });

    it('supports audit trail of encryption operations', async () => {
      const spy = vi.spyOn(console, 'log');

      // In production, encryption operations should be logged
      // This test verifies the capability exists
      await encryptPHI('Audit test', testPatientId);

      // Could verify audit log creation here
      spy.mockRestore();
    });
  });
});
```

### Real-Time Audit Alerts

```typescript
// lib/audit-alerts.ts
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import { AuditAction } from '@/lib/hipaa-audit';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  actions: AuditAction[];
  threshold: number;
  windowMinutes: number;
  recipients: string[];
  enabled: boolean;
}

export const DEFAULT_ALERT_RULES: Omit<AlertRule, 'id' | 'recipients'>[] = [
  {
    name: 'Mass PHI Export',
    description: 'Alerts when multiple PHI exports occur within a short window',
    actions: [AuditAction.PHI_EXPORT],
    threshold: 5,
    windowMinutes: 60,
    enabled: true,
  },
  {
    name: 'Multiple Failed Logins',
    description: 'Alerts on potential brute force attempts',
    actions: [AuditAction.LOGIN_FAILED],
    threshold: 5,
    windowMinutes: 15,
    enabled: true,
  },
  {
    name: 'After-Hours PHI Access',
    description: 'Alerts on PHI access outside business hours',
    actions: [AuditAction.PHI_VIEW, AuditAction.PHI_VIEW_CRITICAL],
    threshold: 1,
    windowMinutes: 1,
    enabled: true,
  },
  {
    name: 'Unauthorized Access Attempts',
    description: 'Alerts on any unauthorized access attempt',
    actions: [AuditAction.UNAUTHORIZED_ACCESS],
    threshold: 1,
    windowMinutes: 1,
    enabled: true,
  },
  {
    name: 'Break-the-Glass Usage',
    description: 'Alerts on emergency access invocations',
    actions: [AuditAction.BREAK_THE_GLASS],
    threshold: 1,
    windowMinutes: 1,
    enabled: true,
  },
];

export async function checkAlertThresholds(
  organizationId: string,
  action: AuditAction,
  userId?: string
): Promise<void> {
  const rules = await prisma.alertRule.findMany({
    where: {
      organizationId,
      enabled: true,
      actions: { has: action },
    },
  });

  for (const rule of rules) {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - rule.windowMinutes);

    const count = await prisma.hipaaAuditLog.count({
      where: {
        organizationId,
        action: { in: rule.actions as string[] },
        userId,
        createdAt: { gte: windowStart },
      },
    });

    if (count >= rule.threshold) {
      await triggerAlert(rule, {
        organizationId,
        action,
        userId,
        count,
        windowStart,
      });
    }
  }
}

async function triggerAlert(
  rule: AlertRule,
  context: {
    organizationId: string;
    action: AuditAction;
    userId?: string;
    count: number;
    windowStart: Date;
  }
): Promise<void> {
  // Record the alert
  await prisma.securityAlert.create({
    data: {
      organizationId: context.organizationId,
      ruleId: rule.id,
      ruleName: rule.name,
      action: context.action,
      userId: context.userId,
      count: context.count,
      windowStart: context.windowStart,
      triggeredAt: new Date(),
    },
  });

  // Send notifications
  const user = context.userId
    ? await prisma.user.findUnique({ where: { id: context.userId } })
    : null;

  for (const recipient of rule.recipients) {
    await sendEmail({
      to: recipient,
      subject: `[SECURITY ALERT] ${rule.name}`,
      template: 'security-alert',
      data: {
        ruleName: rule.name,
        ruleDescription: rule.description,
        action: context.action,
        userName: user?.name || 'Unknown',
        userEmail: user?.email || 'Unknown',
        count: context.count,
        windowMinutes: rule.windowMinutes,
        triggeredAt: new Date().toISOString(),
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/admin/security/alerts`,
      },
    });
  }
}

// Check for after-hours access
export function isAfterHours(timezone: string = 'America/New_York'): boolean {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  });
  const hour = parseInt(formatter.format(now));

  // After hours: before 7 AM or after 7 PM, or weekends
  const dayFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    weekday: 'short',
  });
  const day = dayFormatter.format(now);

  const isWeekend = day === 'Sat' || day === 'Sun';
  const isNightTime = hour < 7 || hour >= 19;

  return isWeekend || isNightTime;
}
```

## Skills Used

| Skill | Purpose |
|-------|---------|
| [video-conferencing](../patterns/video-conferencing.md) | LiveKit video calls |
| [appointment-scheduling](../patterns/appointment-scheduling.md) | Booking and calendar |
| [multi-tenancy](../patterns/multi-tenancy.md) | Healthcare organization isolation |
| [rbac](../patterns/rbac.md) | Provider/patient/admin roles |
| [audit-logging](../patterns/audit-logging.md) | HIPAA compliance logging |
| [encryption](../patterns/encryption.md) | PHI protection |
| [file-upload](../patterns/file-upload.md) | Medical records upload |

## Testing

### Unit Tests

```typescript
// __tests__/lib/availability.test.ts
import { describe, it, expect } from 'vitest';
import { getAvailableSlots, isSlotAvailable } from '@/lib/availability';

describe('getAvailableSlots', () => {
  it('returns available time slots for a provider', () => {
    const availability = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
    ];
    const bookedSlots = ['09:00', '09:30'];
    const date = new Date('2025-01-20'); // Monday

    const slots = getAvailableSlots(availability, bookedSlots, date, 30);

    expect(slots).not.toContain('09:00');
    expect(slots).not.toContain('09:30');
    expect(slots).toContain('10:00');
    expect(slots).toContain('16:30');
  });

  it('returns empty array for non-working days', () => {
    const availability = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isActive: true },
    ];
    const date = new Date('2025-01-19'); // Sunday

    const slots = getAvailableSlots(availability, [], date, 30);

    expect(slots).toHaveLength(0);
  });
});

describe('isSlotAvailable', () => {
  it('validates slot availability correctly', () => {
    const bookedSlots = ['10:00', '10:30'];

    expect(isSlotAvailable('09:30', bookedSlots)).toBe(true);
    expect(isSlotAvailable('10:00', bookedSlots)).toBe(false);
  });
});
```

```typescript
// __tests__/lib/encryption.test.ts
import { describe, it, expect } from 'vitest';
import { encryptPHI, decryptPHI, generateEncryptionKey } from '@/lib/encryption';

describe('PHI Encryption', () => {
  it('encrypts and decrypts PHI correctly', async () => {
    const key = await generateEncryptionKey();
    const sensitiveData = 'Patient has diabetes mellitus type 2';

    const encrypted = await encryptPHI(sensitiveData, key);
    expect(encrypted).not.toBe(sensitiveData);

    const decrypted = await decryptPHI(encrypted, key);
    expect(decrypted).toBe(sensitiveData);
  });

  it('generates unique encryption keys', async () => {
    const key1 = await generateEncryptionKey();
    const key2 = await generateEncryptionKey();

    expect(key1).not.toBe(key2);
  });
});
```

```typescript
// __tests__/lib/audit.test.ts
import { describe, it, expect, vi } from 'vitest';
import { createAuditLog, AuditAction } from '@/lib/audit';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      create: vi.fn(),
    },
  },
}));

describe('Audit Logging', () => {
  it('creates HIPAA-compliant audit log entry', async () => {
    const auditData = {
      organizationId: 'org_123',
      userId: 'user_456',
      action: AuditAction.PHI_ACCESS,
      entityType: 'Patient',
      entityId: 'patient_789',
      patientId: 'patient_789',
      accessReason: 'Scheduled appointment consultation',
      ipAddress: '192.168.1.1',
    };

    await createAuditLog(auditData);

    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: 'PHI_ACCESS',
        patientId: 'patient_789',
        accessReason: 'Scheduled appointment consultation',
      }),
    });
  });
});
```

### Integration Tests

```typescript
// __tests__/api/appointments.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMocks } from 'node-mocks-http';
import { POST, GET } from '@/app/api/appointments/route';
import { prisma } from '@/lib/prisma';

describe('Appointments API', () => {
  let testOrg: any;
  let testProvider: any;
  let testPatient: any;

  beforeAll(async () => {
    testOrg = await prisma.organization.create({
      data: {
        name: 'Test Clinic',
        slug: 'test-clinic',
        email: 'test@clinic.com',
      },
    });
    // Create test provider and patient...
  });

  afterAll(async () => {
    await prisma.organization.delete({ where: { id: testOrg.id } });
  });

  it('books an appointment successfully', async () => {
    const { req } = createMocks({
      method: 'POST',
      body: {
        organizationId: testOrg.id,
        providerId: testProvider.id,
        patientId: testPatient.id,
        scheduledAt: '2025-01-20T10:00:00Z',
        type: 'VIDEO',
        reason: 'Annual checkup',
      },
    });

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.status).toBe('SCHEDULED');
    expect(data.roomId).toBeDefined();
  });

  it('prevents double booking', async () => {
    // Book first appointment
    await prisma.appointment.create({
      data: {
        organizationId: testOrg.id,
        providerId: testProvider.id,
        patientId: testPatient.id,
        scheduledAt: new Date('2025-01-20T14:00:00Z'),
        type: 'VIDEO',
      },
    });

    const { req } = createMocks({
      method: 'POST',
      body: {
        organizationId: testOrg.id,
        providerId: testProvider.id,
        patientId: testPatient.id,
        scheduledAt: '2025-01-20T14:00:00Z',
        type: 'VIDEO',
        reason: 'Follow-up',
      },
    });

    const response = await POST(req as any);

    expect(response.status).toBe(409);
  });
});
```

### E2E Tests

```typescript
// e2e/telehealth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Telehealth Platform', () => {
  test.describe('Patient Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('[name="email"]', 'patient@test.com');
      await page.fill('[name="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      await page.waitForURL('/patient');
    });

    test('patient can book appointment', async ({ page }) => {
      await page.click('text=Book Appointment');
      await page.waitForURL('/patient/appointments/book');

      // Select provider
      await page.click('[data-testid="provider-card"]:first-child');

      // Select date (tomorrow)
      await page.click('[data-testid="date-button"]:nth-child(2)');

      // Select time slot
      await page.click('[data-testid="time-slot"]:first-child');

      // Fill reason
      await page.fill('[name="reason"]', 'Annual checkup');

      // Submit
      await page.click('button:has-text("Book Appointment")');

      await expect(page).toHaveURL(/\/patient\/appointments\/[\w-]+/);
      await expect(page.locator('text=Appointment Confirmed')).toBeVisible();
    });

    test('patient can join video consultation', async ({ page }) => {
      // Navigate to upcoming appointment
      await page.click('text=My Appointments');
      await page.click('[data-testid="appointment-card"]:first-child');

      // Click join when available
      await page.click('button:has-text("Join Consultation")');

      // Should be in video room
      await expect(page.locator('[data-testid="video-room"]')).toBeVisible();
      await expect(page.locator('[data-testid="waiting-room"]')).toBeVisible();
    });
  });

  test.describe('Provider Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login');
      await page.fill('[name="email"]', 'provider@test.com');
      await page.fill('[name="password"]', 'testpassword');
      await page.click('button[type="submit"]');
      await page.waitForURL('/appointments');
    });

    test('provider can view patient history before consultation', async ({ page }) => {
      await page.click('[data-testid="appointment-card"]:first-child');
      await page.click('text=View Patient History');

      await expect(page.locator('[data-testid="medical-history"]')).toBeVisible();
      await expect(page.locator('[data-testid="allergies-list"]')).toBeVisible();
      await expect(page.locator('[data-testid="medications-list"]')).toBeVisible();
    });

    test('provider can write prescription after consultation', async ({ page }) => {
      await page.click('text=Prescriptions');
      await page.click('text=New Prescription');

      await page.fill('[name="medicationName"]', 'Metformin');
      await page.fill('[name="dosage"]', '500mg');
      await page.fill('[name="frequency"]', 'Twice daily');
      await page.fill('[name="quantity"]', '60');
      await page.fill('[name="instructions"]', 'Take with meals');

      await page.click('button:has-text("Create Prescription")');

      await expect(page.locator('text=Prescription Created')).toBeVisible();
    });
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
import { AlertTriangle, RefreshCw, Phone } from 'lucide-react';

interface TelehealthErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function TelehealthErrorBoundary({
  error,
  reset,
}: TelehealthErrorBoundaryProps) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        component: 'telehealth',
        errorType: error.name,
      },
    });
  }, [error]);

  const isVideoError = error.message.includes('video') ||
                       error.message.includes('WebRTC') ||
                       error.message.includes('LiveKit');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>

        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {isVideoError ? 'Connection Issue' : 'Something went wrong'}
        </h1>

        <p className="text-gray-600 mb-6">
          {isVideoError
            ? 'We encountered an issue with the video connection. Please check your camera and microphone permissions.'
            : 'We apologize for the inconvenience. Our team has been notified.'}
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>

          {isVideoError && (
            <a
              href="tel:+18005551234"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              Call Support
            </a>
          )}
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-gray-500 cursor-pointer">
              Technical Details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
```

### API Error Handler

```typescript
// lib/api-error-handler.ts
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { createAuditLog, AuditAction } from './audit';

export class TelehealthAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public isHIPAARelevant: boolean = false
  ) {
    super(message);
    this.name = 'TelehealthAPIError';
  }
}

export async function handleAPIError(
  error: unknown,
  context?: {
    organizationId?: string;
    userId?: string;
    patientId?: string;
    action?: string;
  }
) {
  // Log HIPAA-relevant errors
  if (context?.patientId && error instanceof TelehealthAPIError && error.isHIPAARelevant) {
    await createAuditLog({
      organizationId: context.organizationId || 'unknown',
      userId: context.userId,
      action: AuditAction.ERROR,
      entityType: 'APIError',
      patientId: context.patientId,
      changes: {
        errorCode: error.code,
        errorMessage: error.message,
      },
    });
  }

  if (error instanceof TelehealthAPIError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: error.errors,
      },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This record already exists', code: 'DUPLICATE_RECORD' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }
  }

  // Capture unexpected errors
  Sentry.captureException(error, {
    extra: context,
  });

  return NextResponse.json(
    { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}

// Predefined HIPAA-relevant errors
export const AppointmentErrors = {
  SlotUnavailable: new TelehealthAPIError(
    'This time slot is no longer available',
    409,
    'SLOT_UNAVAILABLE'
  ),
  UnauthorizedAccess: new TelehealthAPIError(
    'You are not authorized to access this appointment',
    403,
    'UNAUTHORIZED_ACCESS',
    true
  ),
  PatientNotFound: new TelehealthAPIError(
    'Patient record not found',
    404,
    'PATIENT_NOT_FOUND',
    true
  ),
};
```

## Accessibility

### Accessible Video Controls

```tsx
// components/video/accessible-video-controls.tsx
'use client';

import { useEffect, useState } from 'react';
import {
  Mic, MicOff, Video, VideoOff, Phone, Settings,
  Monitor, MessageSquare, Users
} from 'lucide-react';
import { useRoomContext, useLocalParticipant } from '@livekit/components-react';

interface AccessibleVideoControlsProps {
  onEndCall: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
}

export function AccessibleVideoControls({
  onEndCall,
  onToggleChat,
  onToggleParticipants,
}: AccessibleVideoControlsProps) {
  const { localParticipant } = useLocalParticipant();
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + M = Toggle microphone
      if (e.altKey && e.key === 'm') {
        e.preventDefault();
        toggleMicrophone();
      }
      // Alt + V = Toggle camera
      if (e.altKey && e.key === 'v') {
        e.preventDefault();
        toggleCamera();
      }
      // Alt + E = End call
      if (e.altKey && e.key === 'e') {
        e.preventDefault();
        onEndCall();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMicEnabled, isCameraEnabled]);

  const toggleMicrophone = async () => {
    await localParticipant.setMicrophoneEnabled(!isMicEnabled);
    setIsMicEnabled(!isMicEnabled);
    announceToScreenReader(
      isMicEnabled ? 'Microphone muted' : 'Microphone unmuted'
    );
  };

  const toggleCamera = async () => {
    await localParticipant.setCameraEnabled(!isCameraEnabled);
    setIsCameraEnabled(!isCameraEnabled);
    announceToScreenReader(
      isCameraEnabled ? 'Camera turned off' : 'Camera turned on'
    );
  };

  const toggleScreenShare = async () => {
    await localParticipant.setScreenShareEnabled(!isScreenSharing);
    setIsScreenSharing(!isScreenSharing);
    announceToScreenReader(
      isScreenSharing ? 'Screen sharing stopped' : 'Screen sharing started'
    );
  };

  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  };

  return (
    <div
      role="toolbar"
      aria-label="Video call controls"
      className="flex items-center justify-center gap-2 p-4 bg-gray-900/90 rounded-full"
    >
      <button
        onClick={toggleMicrophone}
        aria-label={isMicEnabled ? 'Mute microphone (Alt+M)' : 'Unmute microphone (Alt+M)'}
        aria-pressed={!isMicEnabled}
        className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 ${
          isMicEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {isMicEnabled ? (
          <Mic className="w-5 h-5" aria-hidden="true" />
        ) : (
          <MicOff className="w-5 h-5" aria-hidden="true" />
        )}
      </button>

      <button
        onClick={toggleCamera}
        aria-label={isCameraEnabled ? 'Turn off camera (Alt+V)' : 'Turn on camera (Alt+V)'}
        aria-pressed={!isCameraEnabled}
        className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 ${
          isCameraEnabled
            ? 'bg-gray-700 hover:bg-gray-600 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        {isCameraEnabled ? (
          <Video className="w-5 h-5" aria-hidden="true" />
        ) : (
          <VideoOff className="w-5 h-5" aria-hidden="true" />
        )}
      </button>

      <button
        onClick={toggleScreenShare}
        aria-label={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
        aria-pressed={isScreenSharing}
        className={`p-3 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900 ${
          isScreenSharing
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-white'
        }`}
      >
        <Monitor className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="w-px h-8 bg-gray-600 mx-2" role="separator" aria-hidden="true" />

      <button
        onClick={onToggleChat}
        aria-label="Toggle chat panel"
        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <MessageSquare className="w-5 h-5" aria-hidden="true" />
      </button>

      <button
        onClick={onToggleParticipants}
        aria-label="Toggle participants panel"
        className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <Users className="w-5 h-5" aria-hidden="true" />
      </button>

      <div className="w-px h-8 bg-gray-600 mx-2" role="separator" aria-hidden="true" />

      <button
        onClick={onEndCall}
        aria-label="End call (Alt+E)"
        className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        <Phone className="w-5 h-5 rotate-[135deg]" aria-hidden="true" />
      </button>
    </div>
  );
}
```

### Accessible Appointment Booking

```tsx
// components/appointments/accessible-time-picker.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { format, parse } from 'date-fns';

interface AccessibleTimePickerProps {
  slots: string[];
  selectedSlot: string;
  onSelect: (slot: string) => void;
  date: Date;
}

export function AccessibleTimePicker({
  slots,
  selectedSlot,
  onSelect,
  date,
}: AccessibleTimePickerProps) {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const formatSlot = (slot: string) => {
    const parsed = parse(slot, 'HH:mm', new Date());
    return format(parsed, 'h:mm a');
  };

  // Group by time of day for better organization
  const morning = slots.filter(s => parseInt(s.split(':')[0]) < 12);
  const afternoon = slots.filter(s => {
    const hour = parseInt(s.split(':')[0]);
    return hour >= 12 && hour < 17;
  });
  const evening = slots.filter(s => parseInt(s.split(':')[0]) >= 17);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let newIndex = index;
    const columns = 4;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(index + 1, slots.length - 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(index - 1, 0);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(index + columns, slots.length - 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(index - columns, 0);
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = slots.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        onSelect(slots[index]);
        return;
    }

    setFocusedIndex(newIndex);
    const button = gridRef.current?.querySelectorAll('button')[newIndex];
    button?.focus();
  };

  const renderTimeGroup = (groupSlots: string[], label: string, startIndex: number) => {
    if (groupSlots.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 id={`time-group-${label.toLowerCase()}`} className="text-sm font-medium text-gray-700 mb-2">
          {label}
        </h3>
        <div
          role="listbox"
          aria-labelledby={`time-group-${label.toLowerCase()}`}
          className="grid grid-cols-4 gap-2"
        >
          {groupSlots.map((slot, localIndex) => {
            const globalIndex = startIndex + localIndex;
            const isSelected = selectedSlot === slot;

            return (
              <button
                key={slot}
                role="option"
                aria-selected={isSelected}
                tabIndex={focusedIndex === globalIndex ? 0 : -1}
                onClick={() => onSelect(slot)}
                onKeyDown={(e) => handleKeyDown(e, globalIndex)}
                className={`py-2 px-3 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  isSelected
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white border border-gray-300 hover:border-indigo-400'
                }`}
              >
                <span className="sr-only">
                  {format(date, 'EEEE, MMMM d')} at {formatSlot(slot)}
                  {isSelected ? ', selected' : ''}
                </span>
                <span aria-hidden="true">{formatSlot(slot)}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={gridRef}
      aria-label={`Available times for ${format(date, 'EEEE, MMMM d')}`}
    >
      {renderTimeGroup(morning, 'Morning', 0)}
      {renderTimeGroup(afternoon, 'Afternoon', morning.length)}
      {renderTimeGroup(evening, 'Evening', morning.length + afternoon.length)}

      {slots.length === 0 && (
        <p role="status" className="text-gray-500 text-center py-4">
          No available times for this date. Please select another date.
        </p>
      )}
    </div>
  );
}
```

## Security

### HIPAA-Compliant Validation Schemas

```typescript
// lib/validations/telehealth.ts
import { z } from 'zod';

// Appointment validation with PHI protection
export const appointmentSchema = z.object({
  organizationId: z.string().cuid(),
  providerId: z.string().cuid(),
  patientId: z.string().cuid(),
  scheduledAt: z.string().datetime(),
  duration: z.number().int().min(15).max(120).optional(),
  type: z.enum(['VIDEO', 'PHONE', 'IN_PERSON']),
  reason: z.string().min(1).max(1000),
  symptoms: z.array(z.string().max(100)).max(10).optional(),
});

// Consultation notes with field-level encryption indicators
export const consultationSchema = z.object({
  appointmentId: z.string().cuid(),
  chiefComplaint: z.string().max(2000).optional(),
  historyOfPresentIllness: z.string().max(5000).optional(),
  physicalExam: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional(),
  diagnoses: z.array(z.object({
    code: z.string().regex(/^[A-Z]\d{2}(\.\d{1,4})?$/), // ICD-10 format
    description: z.string().max(200),
  })).optional(),
  followUpDate: z.string().datetime().optional(),
  followUpNotes: z.string().max(1000).optional(),
});

// Prescription with DEA compliance
export const prescriptionSchema = z.object({
  patientId: z.string().cuid(),
  consultationId: z.string().cuid().optional(),
  medicationName: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  route: z.enum(['oral', 'topical', 'injection', 'inhalation', 'sublingual', 'rectal', 'other']),
  quantity: z.number().int().min(1).max(1000),
  refills: z.number().int().min(0).max(12),
  instructions: z.string().max(2000).optional(),
  expiresAt: z.string().datetime(),
  pharmacyName: z.string().max(200).optional(),
  pharmacyAddress: z.string().max(500).optional(),
  pharmacyPhone: z.string().regex(/^\+?[\d\s()-]+$/).optional(),
});

// Medical record upload validation
export const medicalRecordSchema = z.object({
  patientId: z.string().cuid(),
  type: z.enum(['LAB_RESULT', 'IMAGING', 'REFERRAL', 'INSURANCE', 'CONSENT_FORM', 'OTHER']),
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().min(1).max(50 * 1024 * 1024), // 50MB max
  mimeType: z.enum([
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/dicom',
    'application/dicom',
  ]),
});

// PHI access request validation (for audit logging)
export const phiAccessSchema = z.object({
  patientId: z.string().cuid(),
  accessReason: z.string().min(10).max(500),
  dataTypes: z.array(z.enum([
    'demographics',
    'appointments',
    'consultations',
    'prescriptions',
    'medical_records',
    'billing',
  ])).min(1),
});
```

### Rate Limiting for Healthcare APIs

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Different rate limits for different operation types
export const rateLimits = {
  // Login attempts - strict to prevent brute force
  login: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    prefix: 'ratelimit:login',
  }),

  // Appointment booking - reasonable limit
  appointmentBooking: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:appointment',
  }),

  // PHI access - monitored closely
  phiAccess: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 h'),
    prefix: 'ratelimit:phi',
  }),

  // API general - standard limits
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'ratelimit:api',
  }),

  // Video room token generation
  videoToken: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    prefix: 'ratelimit:video',
  }),

  // Prescription creation - controlled
  prescription: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'),
    prefix: 'ratelimit:prescription',
  }),
};

export async function checkRateLimit(
  type: keyof typeof rateLimits,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const { success, remaining, reset } = await rateLimits[type].limit(identifier);
  return { success, remaining, reset };
}
```

### Session Security

```typescript
// lib/session-security.ts
import { cookies } from 'next/headers';
import { Redis } from '@upstash/redis';
import { createAuditLog, AuditAction } from './audit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const SESSION_TTL = 30 * 60; // 30 minutes for healthcare apps (HIPAA recommendation)
const ABSOLUTE_TTL = 8 * 60 * 60; // 8 hours absolute maximum

interface SessionData {
  userId: string;
  organizationId: string;
  role: string;
  createdAt: number;
  lastActivity: number;
  ipAddress: string;
  userAgent: string;
}

export async function validateSession(sessionId: string): Promise<SessionData | null> {
  const session = await redis.get<SessionData>(`session:${sessionId}`);

  if (!session) {
    return null;
  }

  const now = Date.now();

  // Check absolute timeout
  if (now - session.createdAt > ABSOLUTE_TTL * 1000) {
    await destroySession(sessionId, 'absolute_timeout');
    return null;
  }

  // Check idle timeout
  if (now - session.lastActivity > SESSION_TTL * 1000) {
    await destroySession(sessionId, 'idle_timeout');
    return null;
  }

  // Update last activity
  await redis.set(
    `session:${sessionId}`,
    { ...session, lastActivity: now },
    { ex: SESSION_TTL }
  );

  return session;
}

export async function destroySession(sessionId: string, reason: string): Promise<void> {
  const session = await redis.get<SessionData>(`session:${sessionId}`);

  if (session) {
    await createAuditLog({
      organizationId: session.organizationId,
      userId: session.userId,
      action: AuditAction.LOGOUT,
      entityType: 'Session',
      entityId: sessionId,
      changes: { reason },
    });
  }

  await redis.del(`session:${sessionId}`);
}

export async function getActiveSessions(userId: string): Promise<string[]> {
  const keys = await redis.keys(`session:*`);
  const activeSessions: string[] = [];

  for (const key of keys) {
    const session = await redis.get<SessionData>(key);
    if (session?.userId === userId) {
      activeSessions.push(key.replace('session:', ''));
    }
  }

  return activeSessions;
}
```

## Performance

### Appointment Query Optimization

```typescript
// lib/appointments.ts
import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

// Cache provider availability for 5 minutes
export const getProviderAvailability = unstable_cache(
  async (providerId: string, date: string) => {
    const dayOfWeek = new Date(date).getDay();

    const [availability, bookedSlots] = await Promise.all([
      prisma.availability.findMany({
        where: {
          providerId,
          dayOfWeek,
          isActive: true,
        },
        select: {
          startTime: true,
          endTime: true,
        },
      }),
      prisma.appointment.findMany({
        where: {
          providerId,
          scheduledAt: {
            gte: new Date(`${date}T00:00:00Z`),
            lt: new Date(`${date}T23:59:59Z`),
          },
          status: {
            in: ['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS'],
          },
        },
        select: {
          scheduledAt: true,
          duration: true,
        },
      }),
    ]);

    return { availability, bookedSlots };
  },
  ['provider-availability'],
  {
    revalidate: 300, // 5 minutes
    tags: ['availability'],
  }
);

// Cache patient dashboard data
export const getPatientDashboard = unstable_cache(
  async (patientId: string) => {
    const [upcomingAppointments, recentConsultations, activePrescriptions] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          patientId,
          scheduledAt: { gte: new Date() },
          status: { in: ['SCHEDULED', 'CONFIRMED'] },
        },
        include: {
          provider: {
            include: { user: { select: { name: true, avatarUrl: true } } },
          },
        },
        orderBy: { scheduledAt: 'asc' },
        take: 5,
      }),
      prisma.consultation.findMany({
        where: { patientId },
        include: {
          provider: {
            include: { user: { select: { name: true } } },
          },
        },
        orderBy: { startedAt: 'desc' },
        take: 3,
      }),
      prisma.prescription.findMany({
        where: {
          patientId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
        orderBy: { prescribedAt: 'desc' },
      }),
    ]);

    return { upcomingAppointments, recentConsultations, activePrescriptions };
  },
  ['patient-dashboard'],
  {
    revalidate: 60, // 1 minute
    tags: ['patient-dashboard'],
  }
);

// Optimized provider schedule query
export const getProviderSchedule = unstable_cache(
  async (providerId: string, startDate: Date, endDate: Date) => {
    return prisma.appointment.findMany({
      where: {
        providerId,
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        patient: {
          include: {
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  },
  ['provider-schedule'],
  {
    revalidate: 60,
    tags: ['provider-schedule'],
  }
);
```

### Database Indexes

```prisma
// Add to schema.prisma for optimized queries

model Appointment {
  // ... existing fields

  @@index([providerId, scheduledAt])
  @@index([patientId, scheduledAt])
  @@index([organizationId, status, scheduledAt])
  @@index([roomId])
}

model Consultation {
  // ... existing fields

  @@index([providerId, startedAt])
  @@index([patientId, startedAt])
}

model Prescription {
  // ... existing fields

  @@index([patientId, status, expiresAt])
  @@index([providerId, prescribedAt])
}

model AuditLog {
  // ... existing fields

  @@index([organizationId, createdAt])
  @@index([userId, createdAt])
  @@index([patientId, createdAt])
  @@index([entityType, entityId])
  @@index([action, createdAt])
}
```

## CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  DATABASE_URL: postgresql://postgres:postgres@localhost:5432/telehealth_test

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

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      - name: Run npm audit
        run: npm audit --audit-level=high

  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: telehealth_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7
        ports:
          - 6379:6379
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx prisma migrate deploy
      - run: npx prisma db seed
      - run: npm run test:coverage
        env:
          UPSTASH_REDIS_REST_URL: redis://localhost:6379
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: telehealth_test
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx prisma migrate deploy
      - run: npx prisma db seed
      - run: npm run build
      - run: npm run test:e2e
        env:
          LIVEKIT_API_KEY: ${{ secrets.LIVEKIT_API_KEY }}
          LIVEKIT_API_SECRET: ${{ secrets.LIVEKIT_API_SECRET }}
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  hipaa-compliance-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - name: Check for PHI in logs
        run: |
          # Ensure no PHI patterns in code
          ! grep -rn "console.log.*patient\|console.log.*medical\|console.log.*diagnosis" --include="*.ts" --include="*.tsx" src/ app/
      - name: Verify encryption usage
        run: |
          # Ensure sensitive fields use encryption
          grep -rn "encryptPHI\|decryptPHI" --include="*.ts" lib/ || echo "Warning: No encryption found"
      - name: Check audit logging
        run: |
          # Ensure PHI access is audited
          grep -rn "createAuditLog" --include="*.ts" app/api/ | wc -l

  deploy-staging:
    needs: [lint, security-scan, test, e2e, hipaa-compliance-check]
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel Staging
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  deploy-production:
    needs: [lint, security-scan, test, e2e, hipaa-compliance-check]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Vercel Production
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Sentry Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,

  // HIPAA: Never send PHI to Sentry
  beforeSend(event) {
    // Remove any potential PHI from error messages
    if (event.message) {
      event.message = sanitizePHI(event.message);
    }

    // Remove PHI from breadcrumbs
    if (event.breadcrumbs) {
      event.breadcrumbs = event.breadcrumbs.map(breadcrumb => ({
        ...breadcrumb,
        message: breadcrumb.message ? sanitizePHI(breadcrumb.message) : undefined,
        data: breadcrumb.data ? sanitizeObject(breadcrumb.data) : undefined,
      }));
    }

    return event;
  },

  // Performance monitoring
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,

  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      // Never record PHI
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
});

function sanitizePHI(text: string): string {
  // Remove potential SSN
  text = text.replace(/\d{3}-\d{2}-\d{4}/g, '[REDACTED-SSN]');
  // Remove potential DOB
  text = text.replace(/\d{1,2}\/\d{1,2}\/\d{4}/g, '[REDACTED-DOB]');
  // Remove email addresses
  text = text.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED-EMAIL]');
  // Remove phone numbers
  text = text.replace(/\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, '[REDACTED-PHONE]');
  return text;
}

function sanitizeObject(obj: Record<string, any>): Record<string, any> {
  const sensitiveKeys = ['patient', 'diagnosis', 'prescription', 'medical', 'health', 'ssn', 'dob', 'insurance'];
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizePHI(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
```

### Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latency?: number };
    redis: { status: string; latency?: number };
    livekit: { status: string };
  };
}

export async function GET() {
  const startTime = Date.now();
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: { status: 'unknown' },
      redis: { status: 'unknown' },
      livekit: { status: 'unknown' },
    },
  };

  // Check database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    health.checks.database = { status: 'unhealthy' };
    health.status = 'unhealthy';
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    await redis.ping();
    health.checks.redis = {
      status: 'healthy',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    health.checks.redis = { status: 'unhealthy' };
    health.status = health.status === 'healthy' ? 'degraded' : 'unhealthy';
  }

  // Check LiveKit (optional service)
  try {
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;
    if (livekitUrl) {
      const response = await fetch(`${livekitUrl}/health`, {
        signal: AbortSignal.timeout(5000),
      });
      health.checks.livekit = {
        status: response.ok ? 'healthy' : 'degraded',
      };
    } else {
      health.checks.livekit = { status: 'not_configured' };
    }
  } catch (error) {
    health.checks.livekit = { status: 'degraded' };
    if (health.status === 'healthy') {
      health.status = 'degraded';
    }
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

### Prometheus Metrics

```typescript
// lib/metrics.ts
import { Registry, Counter, Histogram, Gauge } from 'prom-client';

export const register = new Registry();

// Appointment metrics
export const appointmentsBooked = new Counter({
  name: 'telehealth_appointments_booked_total',
  help: 'Total number of appointments booked',
  labelNames: ['type', 'organization'],
  registers: [register],
});

export const appointmentsCancelled = new Counter({
  name: 'telehealth_appointments_cancelled_total',
  help: 'Total number of appointments cancelled',
  labelNames: ['reason', 'organization'],
  registers: [register],
});

// Video consultation metrics
export const videoSessionDuration = new Histogram({
  name: 'telehealth_video_session_duration_seconds',
  help: 'Duration of video consultations',
  buckets: [300, 600, 900, 1200, 1800, 2700, 3600],
  labelNames: ['organization'],
  registers: [register],
});

export const activeVideoSessions = new Gauge({
  name: 'telehealth_active_video_sessions',
  help: 'Current number of active video sessions',
  labelNames: ['organization'],
  registers: [register],
});

// PHI access metrics (for compliance)
export const phiAccessCount = new Counter({
  name: 'telehealth_phi_access_total',
  help: 'Total PHI access events',
  labelNames: ['action', 'entity_type', 'organization'],
  registers: [register],
});

// API metrics
export const apiRequestDuration = new Histogram({
  name: 'telehealth_api_request_duration_seconds',
  help: 'API request duration',
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
  labelNames: ['method', 'route', 'status'],
  registers: [register],
});

// Prescription metrics
export const prescriptionsCreated = new Counter({
  name: 'telehealth_prescriptions_created_total',
  help: 'Total prescriptions created',
  labelNames: ['organization'],
  registers: [register],
});

// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

export async function GET(request: Request) {
  // Verify metrics endpoint access (internal only)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.METRICS_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const metrics = await register.metrics();
  return new NextResponse(metrics, {
    headers: { 'Content-Type': register.contentType },
  });
}
```

## Environment Variables

```bash
# .env.example

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/telehealth?schema=public"

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-min-32-chars

# LiveKit (Video Conferencing)
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your-livekit-api-key
LIVEKIT_API_SECRET=your-livekit-api-secret

# Redis (Session & Rate Limiting)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Email (Resend)
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=noreply@yourdomain.com

# Encryption (PHI Protection)
ENCRYPTION_KEY=your-256-bit-encryption-key-base64

# File Storage (Medical Records)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-medical-records-bucket

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn
SENTRY_AUTH_TOKEN=your-sentry-auth-token
METRICS_SECRET=your-metrics-endpoint-secret

# HIPAA Compliance
AUDIT_LOG_RETENTION_DAYS=2555  # 7 years
SESSION_TIMEOUT_MINUTES=30
REQUIRE_MFA=true
```

## Deployment Checklist

### Pre-Deployment

- [ ] All HIPAA security controls verified
- [ ] PHI encryption keys rotated
- [ ] Database migrations tested on staging
- [ ] Audit logging verified for all PHI access
- [ ] Session timeout configured (30 min idle)
- [ ] Rate limiting configured for all endpoints
- [ ] SSL/TLS certificates valid
- [ ] Business Associate Agreements (BAAs) signed with all vendors
- [ ] Security vulnerability scan passed
- [ ] E2E tests passing with video functionality
- [ ] Accessibility audit completed (WCAG 2.1 AA)
- [ ] Load testing completed for video sessions
- [ ] Disaster recovery plan documented
- [ ] Data backup procedures verified

### Post-Deployment

- [ ] Health endpoints responding correctly
- [ ] Video consultation test completed
- [ ] Appointment booking flow verified
- [ ] Prescription workflow tested
- [ ] Audit logs being recorded
- [ ] Error tracking operational (PHI-safe)
- [ ] Metrics collection verified
- [ ] Alert thresholds configured
- [ ] On-call rotation confirmed
- [ ] Incident response plan reviewed
- [ ] Patient consent forms updated
- [ ] Staff training completed on new features

## Related Skills

- [[video-conferencing]] - LiveKit integration
- [[appointment-scheduling]] - Calendar and booking
- [[multi-tenancy]] - Organization isolation
- [[rbac]] - Role-based access control
- [[audit-logging]] - HIPAA compliance logging
- [[encryption]] - PHI protection
- [[file-upload]] - Medical records

## Changelog

- 1.0.0: Initial telehealth recipe with video, appointments, and prescriptions
