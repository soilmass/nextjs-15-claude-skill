---
id: r-hrm-system
name: HRM System
version: 1.0.0
layer: L6
category: recipes
description: Human resource management system with recruitment, onboarding, performance, and payroll
tags: [enterprise, hr, recruitment, payroll, performance, next15]
formula: "HrmSystem = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + SettingsPage(t-settings-page) + ProfilePage(t-profile-page) + DataTable(o-data-table) + Form(o-form) + Chart(o-chart) + StatsDashboard(o-stats-dashboard) + Modal(o-modal) + Tabs(o-tabs) + FilterBar(o-filter-bar) + FileUploader(o-file-uploader) + Sidebar(o-sidebar) + Header(o-header) + OrgChart(o-org-chart) + Timeline(o-timeline) + Rbac(pt-rbac) + AuditLogging(pt-audit-logging) + FileUpload(pt-file-upload) + ServerActions(pt-server-actions) + ZodSchemas(pt-zod-schemas) + FormValidation(pt-form-validation) + TransactionalEmail(pt-transactional-email) + PdfGeneration(pt-pdf-generation) + ExportData(pt-export-data) + ImportData(pt-import-data) + Encryption(pt-encryption) + CalendarIntegration(pt-calendar-integration) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/stats-dashboard.md
  - ../organisms/modal.md
  - ../organisms/tabs.md
  - ../organisms/filter-bar.md
  - ../organisms/file-uploader.md
  - ../organisms/sidebar.md
  - ../organisms/header.md
  # L5 Patterns
  - ../patterns/rbac.md
  - ../patterns/audit-logging.md
  - ../patterns/file-upload.md
  - ../patterns/server-actions.md
  - ../patterns/zod-schemas.md
  - ../patterns/form-validation.md
  - ../patterns/transactional-email.md
  - ../patterns/export-data.md
  - ../patterns/import-data.md
  - ../patterns/encryption.md
  - ../patterns/calendar-integration.md
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
dependencies:
  next: "^15.1.0"
  prisma: "^6.0.0"
  "@tanstack/react-query": "^5.0.0"
  react-hook-form: "^7.0.0"
  zod: "^3.23.0"
  "@dnd-kit/core": "^6.0.0"
  recharts: "^2.10.0"
  date-fns: "^3.0.0"
  "@react-pdf/renderer": "^3.0.0"
complexity: advanced
estimated_time: 40-60 hours
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# HRM System

## Overview

A comprehensive Human Resource Management system featuring:
- Recruitment pipeline with job postings, applicant tracking, and interview scheduling
- Employee onboarding with document collection, task checklists, and training modules
- Employee management with profiles, organizational hierarchy, and directory
- Performance management with reviews, goal tracking, and 360-degree feedback
- Payroll processing with salary calculations, deductions, and tax handling
- Leave management with requests, approvals, and balance tracking
- Document management with secure storage, version control, and e-signatures
- Reporting and analytics for headcount, turnover, and compensation insights

## Project Structure

```
hrm/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                         # HR Dashboard
│   │   ├── recruitment/
│   │   │   ├── page.tsx                     # Job listings
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [jobId]/page.tsx
│   │   │   ├── applicants/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [applicantId]/page.tsx
│   │   │   └── interviews/page.tsx
│   │   ├── onboarding/
│   │   │   ├── page.tsx
│   │   │   └── [employeeId]/page.tsx
│   │   ├── employees/
│   │   │   ├── page.tsx                     # Employee directory
│   │   │   ├── [employeeId]/page.tsx
│   │   │   └── org-chart/page.tsx
│   │   ├── performance/
│   │   │   ├── page.tsx
│   │   │   ├── reviews/page.tsx
│   │   │   ├── goals/page.tsx
│   │   │   └── feedback/page.tsx
│   │   ├── payroll/
│   │   │   ├── page.tsx
│   │   │   ├── runs/page.tsx
│   │   │   └── reports/page.tsx
│   │   ├── leave/
│   │   │   ├── page.tsx
│   │   │   └── calendar/page.tsx
│   │   ├── documents/page.tsx
│   │   └── reports/page.tsx
│   ├── api/
│   │   ├── employees/route.ts
│   │   ├── recruitment/route.ts
│   │   ├── payroll/route.ts
│   │   └── leave/route.ts
│   └── layout.tsx
├── components/
│   ├── recruitment/
│   ├── employees/
│   ├── performance/
│   ├── payroll/
│   └── ui/
├── lib/
│   ├── db.ts
│   ├── validations/
│   └── services/
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

model Employee {
  id              String   @id @default(cuid())
  employeeNumber  String   @unique
  email           String   @unique
  firstName       String
  lastName        String
  phone           String?
  dateOfBirth     DateTime?
  gender          Gender?
  nationalId      String?

  // Employment
  hireDate        DateTime
  terminationDate DateTime?
  status          EmploymentStatus @default(ACTIVE)
  employmentType  EmploymentType   @default(FULL_TIME)

  // Position
  departmentId    String?
  department      Department? @relation(fields: [departmentId], references: [id])
  positionId      String?
  position        Position?   @relation(fields: [positionId], references: [id])
  managerId       String?
  manager         Employee?   @relation("ManagerReports", fields: [managerId], references: [id])
  directReports   Employee[]  @relation("ManagerReports")

  // Compensation
  salaryRecords   SalaryRecord[]

  // Relations
  leaveRequests   LeaveRequest[]
  leaveBalances   LeaveBalance[]
  documents       Document[]
  performanceReviews PerformanceReview[] @relation("ReviewSubject")
  reviewsGiven    PerformanceReview[] @relation("Reviewer")
  goals           Goal[]
  onboardingTasks OnboardingTask[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([departmentId])
  @@index([managerId])
  @@index([status])
}

enum Gender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY
}

enum EmploymentStatus {
  ACTIVE
  ON_LEAVE
  TERMINATED
  PROBATION
}

enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERN
}

model Department {
  id          String     @id @default(cuid())
  name        String
  code        String     @unique
  description String?
  parentId    String?
  parent      Department?  @relation("DeptHierarchy", fields: [parentId], references: [id])
  children    Department[] @relation("DeptHierarchy")
  employees   Employee[]
  positions   Position[]
  headId      String?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

model Position {
  id          String     @id @default(cuid())
  title       String
  code        String     @unique
  description String?
  level       Int        @default(1)
  departmentId String?
  department  Department? @relation(fields: [departmentId], references: [id])
  employees   Employee[]
  minSalary   Decimal?   @db.Decimal(12, 2)
  maxSalary   Decimal?   @db.Decimal(12, 2)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}

// Recruitment
model JobPosting {
  id              String   @id @default(cuid())
  title           String
  description     String
  requirements    String?
  departmentId    String?
  positionId      String?
  location        String?
  employmentType  EmploymentType
  salaryMin       Decimal? @db.Decimal(12, 2)
  salaryMax       Decimal? @db.Decimal(12, 2)
  status          JobStatus @default(DRAFT)
  publishedAt     DateTime?
  closingDate     DateTime?
  applicants      Applicant[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([status])
}

enum JobStatus {
  DRAFT
  PUBLISHED
  CLOSED
  FILLED
}

model Applicant {
  id          String    @id @default(cuid())
  jobId       String
  job         JobPosting @relation(fields: [jobId], references: [id])
  firstName   String
  lastName    String
  email       String
  phone       String?
  resumeUrl   String?
  coverLetter String?
  status      ApplicantStatus @default(NEW)
  rating      Int?
  interviews  Interview[]
  notes       ApplicantNote[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([jobId])
  @@index([status])
}

enum ApplicantStatus {
  NEW
  SCREENING
  INTERVIEW
  OFFER
  HIRED
  REJECTED
}

model Interview {
  id          String    @id @default(cuid())
  applicantId String
  applicant   Applicant @relation(fields: [applicantId], references: [id])
  scheduledAt DateTime
  duration    Int       @default(60)
  type        InterviewType
  location    String?
  meetingUrl  String?
  interviewers String[]
  feedback    String?
  rating      Int?
  status      InterviewStatus @default(SCHEDULED)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([applicantId])
  @@index([scheduledAt])
}

enum InterviewType {
  PHONE
  VIDEO
  ONSITE
  TECHNICAL
  BEHAVIORAL
}

enum InterviewStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
  NO_SHOW
}

model ApplicantNote {
  id          String    @id @default(cuid())
  applicantId String
  applicant   Applicant @relation(fields: [applicantId], references: [id])
  content     String
  authorId    String
  createdAt   DateTime  @default(now())
}

// Leave Management
model LeaveType {
  id             String   @id @default(cuid())
  name           String
  code           String   @unique
  defaultDays    Int      @default(0)
  carryForward   Boolean  @default(false)
  maxCarryDays   Int?
  requiresApproval Boolean @default(true)
  leaveRequests  LeaveRequest[]
  leaveBalances  LeaveBalance[]
  createdAt      DateTime @default(now())
}

model LeaveRequest {
  id          String    @id @default(cuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id])
  leaveTypeId String
  leaveType   LeaveType @relation(fields: [leaveTypeId], references: [id])
  startDate   DateTime
  endDate     DateTime
  days        Decimal   @db.Decimal(4, 1)
  reason      String?
  status      LeaveStatus @default(PENDING)
  approvedBy  String?
  approvedAt  DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([employeeId])
  @@index([status])
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model LeaveBalance {
  id          String    @id @default(cuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id])
  leaveTypeId String
  leaveType   LeaveType @relation(fields: [leaveTypeId], references: [id])
  year        Int
  entitled    Decimal   @db.Decimal(4, 1)
  used        Decimal   @db.Decimal(4, 1) @default(0)
  carried     Decimal   @db.Decimal(4, 1) @default(0)

  @@unique([employeeId, leaveTypeId, year])
}

// Payroll
model SalaryRecord {
  id          String    @id @default(cuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id])
  baseSalary  Decimal   @db.Decimal(12, 2)
  currency    String    @default("USD")
  effectiveDate DateTime
  endDate     DateTime?
  createdAt   DateTime  @default(now())

  @@index([employeeId])
}

model PayrollRun {
  id          String    @id @default(cuid())
  period      String
  startDate   DateTime
  endDate     DateTime
  status      PayrollStatus @default(DRAFT)
  totalGross  Decimal   @db.Decimal(15, 2)
  totalNet    Decimal   @db.Decimal(15, 2)
  items       PayrollItem[]
  processedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

enum PayrollStatus {
  DRAFT
  PROCESSING
  COMPLETED
  PAID
}

model PayrollItem {
  id          String    @id @default(cuid())
  payrollId   String
  payroll     PayrollRun @relation(fields: [payrollId], references: [id])
  employeeId  String
  baseSalary  Decimal   @db.Decimal(12, 2)
  allowances  Decimal   @db.Decimal(12, 2) @default(0)
  deductions  Decimal   @db.Decimal(12, 2) @default(0)
  tax         Decimal   @db.Decimal(12, 2) @default(0)
  netSalary   Decimal   @db.Decimal(12, 2)
  createdAt   DateTime  @default(now())

  @@index([payrollId])
  @@index([employeeId])
}

// Performance
model PerformanceReview {
  id          String    @id @default(cuid())
  employeeId  String
  employee    Employee  @relation("ReviewSubject", fields: [employeeId], references: [id])
  reviewerId  String
  reviewer    Employee  @relation("Reviewer", fields: [reviewerId], references: [id])
  period      String
  type        ReviewType
  status      ReviewStatus @default(DRAFT)
  ratings     Json?
  overallRating Decimal? @db.Decimal(3, 2)
  strengths   String?
  improvements String?
  comments    String?
  submittedAt DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([employeeId])
  @@index([reviewerId])
}

enum ReviewType {
  ANNUAL
  QUARTERLY
  PROBATION
  SELF
  PEER
  MANAGER
}

enum ReviewStatus {
  DRAFT
  IN_PROGRESS
  SUBMITTED
  ACKNOWLEDGED
}

model Goal {
  id          String    @id @default(cuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id])
  title       String
  description String?
  dueDate     DateTime?
  status      GoalStatus @default(NOT_STARTED)
  progress    Int       @default(0)
  weight      Int       @default(1)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([employeeId])
}

enum GoalStatus {
  NOT_STARTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// Documents
model Document {
  id          String    @id @default(cuid())
  employeeId  String?
  employee    Employee? @relation(fields: [employeeId], references: [id])
  name        String
  type        DocumentType
  url         String
  size        Int
  mimeType    String
  version     Int       @default(1)
  signedAt    DateTime?
  signedBy    String?
  expiresAt   DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([employeeId])
  @@index([type])
}

enum DocumentType {
  CONTRACT
  ID_PROOF
  TAX_FORM
  POLICY
  CERTIFICATE
  OTHER
}

// Onboarding
model OnboardingTemplate {
  id          String    @id @default(cuid())
  name        String
  description String?
  tasks       OnboardingTemplateTask[]
  createdAt   DateTime  @default(now())
}

model OnboardingTemplateTask {
  id          String    @id @default(cuid())
  templateId  String
  template    OnboardingTemplate @relation(fields: [templateId], references: [id])
  title       String
  description String?
  dueInDays   Int       @default(0)
  assigneeType String   @default("employee")
  order       Int
  createdAt   DateTime  @default(now())
}

model OnboardingTask {
  id          String    @id @default(cuid())
  employeeId  String
  employee    Employee  @relation(fields: [employeeId], references: [id])
  title       String
  description String?
  dueDate     DateTime?
  status      TaskStatus @default(PENDING)
  completedAt DateTime?
  assigneeId  String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([employeeId])
  @@index([status])
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
}
```

## Core Modules

### Recruitment Module

```typescript
// lib/validations/recruitment.ts
import { z } from 'zod';

export const jobPostingSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  requirements: z.string().optional(),
  departmentId: z.string().optional(),
  location: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']),
  salaryMin: z.number().positive().optional(),
  salaryMax: z.number().positive().optional(),
});

export const applicantSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  coverLetter: z.string().optional(),
});

export type JobPostingInput = z.infer<typeof jobPostingSchema>;
export type ApplicantInput = z.infer<typeof applicantSchema>;
```

```typescript
// app/api/recruitment/jobs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { jobPostingSchema } from '@/lib/validations/recruitment';
import { requirePermission } from '@/lib/auth/rbac';

export async function GET(request: NextRequest) {
  const session = await requirePermission('recruitment:read');
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const departmentId = searchParams.get('departmentId');

  const jobs = await db.jobPosting.findMany({
    where: {
      ...(status && { status: status as any }),
      ...(departmentId && { departmentId }),
    },
    include: {
      _count: { select: { applicants: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  const session = await requirePermission('recruitment:write');
  const body = await request.json();

  const validated = jobPostingSchema.parse(body);

  const job = await db.jobPosting.create({
    data: validated,
  });

  return NextResponse.json(job, { status: 201 });
}
```

```typescript
// components/recruitment/applicant-pipeline.tsx
'use client';

import { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ApplicantPipelineProps {
  applicants: Applicant[];
  jobId: string;
}

const STAGES = [
  { id: 'NEW', label: 'New', color: 'bg-gray-100' },
  { id: 'SCREENING', label: 'Screening', color: 'bg-blue-100' },
  { id: 'INTERVIEW', label: 'Interview', color: 'bg-yellow-100' },
  { id: 'OFFER', label: 'Offer', color: 'bg-purple-100' },
  { id: 'HIRED', label: 'Hired', color: 'bg-green-100' },
];

export function ApplicantPipeline({ applicants, jobId }: ApplicantPipelineProps) {
  const queryClient = useQueryClient();

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/recruitment/applicants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobId] });
    },
  });

  const grouped = useMemo(() => {
    return STAGES.reduce((acc, stage) => {
      acc[stage.id] = applicants.filter(a => a.status === stage.id);
      return acc;
    }, {} as Record<string, Applicant[]>);
  }, [applicants]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const applicantId = active.id as string;
    const newStatus = over.id as string;

    updateStatus.mutate({ id: applicantId, status: newStatus });
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map(stage => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            applicants={grouped[stage.id] || []}
          />
        ))}
      </div>
    </DndContext>
  );
}
```

### Employee Management

```typescript
// components/employees/org-chart.tsx
'use client';

import { useCallback, useMemo } from 'react';
import { Avatar } from '@/components/ui/avatar';

interface OrgChartProps {
  employees: Employee[];
  onNodeClick?: (employee: Employee) => void;
}

interface TreeNode {
  employee: Employee;
  children: TreeNode[];
}

export function OrgChart({ employees, onNodeClick }: OrgChartProps) {
  const tree = useMemo(() => buildTree(employees), [employees]);

  return (
    <div className="overflow-auto p-8">
      <div className="flex flex-col items-center">
        {tree.map(node => (
          <OrgNode key={node.employee.id} node={node} onNodeClick={onNodeClick} />
        ))}
      </div>
    </div>
  );
}

function OrgNode({ node, onNodeClick, level = 0 }: {
  node: TreeNode;
  onNodeClick?: (e: Employee) => void;
  level?: number;
}) {
  const { employee, children } = node;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={() => onNodeClick?.(employee)}
        className="flex flex-col items-center p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow min-w-[180px]"
      >
        <Avatar
          src={employee.avatarUrl}
          alt={`${employee.firstName} ${employee.lastName}`}
          size="lg"
        />
        <span className="mt-2 font-medium text-gray-900">
          {employee.firstName} {employee.lastName}
        </span>
        <span className="text-sm text-gray-500">{employee.position?.title}</span>
        <span className="text-xs text-gray-400">{employee.department?.name}</span>
      </button>

      {children.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-300" />
          <div className="flex">
            {children.map((child, idx) => (
              <div key={child.employee.id} className="flex flex-col items-center">
                {children.length > 1 && (
                  <div className={`h-px bg-gray-300 ${
                    idx === 0 ? 'w-1/2 self-end' :
                    idx === children.length - 1 ? 'w-1/2 self-start' : 'w-full'
                  }`} />
                )}
                <div className="w-px h-6 bg-gray-300" />
                <OrgNode node={child} onNodeClick={onNodeClick} level={level + 1} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function buildTree(employees: Employee[]): TreeNode[] {
  const map = new Map<string, TreeNode>();
  const roots: TreeNode[] = [];

  employees.forEach(emp => {
    map.set(emp.id, { employee: emp, children: [] });
  });

  employees.forEach(emp => {
    const node = map.get(emp.id)!;
    if (emp.managerId && map.has(emp.managerId)) {
      map.get(emp.managerId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}
```

### Performance Module

```typescript
// lib/services/performance.ts
import { db } from '@/lib/db';

export async function createReviewCycle(params: {
  period: string;
  type: ReviewType;
  employeeIds: string[];
}) {
  const { period, type, employeeIds } = params;

  const reviews = await Promise.all(
    employeeIds.map(async (employeeId) => {
      const employee = await db.employee.findUnique({
        where: { id: employeeId },
        select: { managerId: true },
      });

      return db.performanceReview.create({
        data: {
          employeeId,
          reviewerId: employee?.managerId || employeeId,
          period,
          type,
          status: 'DRAFT',
        },
      });
    })
  );

  return reviews;
}

export async function calculateOverallRating(reviewId: string) {
  const review = await db.performanceReview.findUnique({
    where: { id: reviewId },
  });

  if (!review?.ratings) return null;

  const ratings = review.ratings as Record<string, number>;
  const values = Object.values(ratings);
  const average = values.reduce((a, b) => a + b, 0) / values.length;

  return Math.round(average * 100) / 100;
}
```

```typescript
// components/performance/review-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';

const RATING_CATEGORIES = [
  { id: 'quality', label: 'Quality of Work' },
  { id: 'productivity', label: 'Productivity' },
  { id: 'communication', label: 'Communication' },
  { id: 'teamwork', label: 'Teamwork' },
  { id: 'initiative', label: 'Initiative' },
];

const reviewSchema = z.object({
  ratings: z.record(z.number().min(1).max(5)),
  strengths: z.string().min(10, 'Please provide more detail'),
  improvements: z.string().min(10, 'Please provide more detail'),
  comments: z.string().optional(),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export function ReviewForm({ review, onSuccess }: {
  review: PerformanceReview;
  onSuccess?: () => void;
}) {
  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      ratings: (review.ratings as Record<string, number>) || {},
      strengths: review.strengths || '',
      improvements: review.improvements || '',
      comments: review.comments || '',
    },
  });

  const submitReview = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const res = await fetch(`/api/performance/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, status: 'SUBMITTED' }),
      });
      if (!res.ok) throw new Error('Failed to submit');
      return res.json();
    },
    onSuccess,
  });

  return (
    <form onSubmit={form.handleSubmit(data => submitReview.mutate(data))} className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-medium">Performance Ratings</h3>
        {RATING_CATEGORIES.map(category => (
          <div key={category.id} className="flex items-center justify-between">
            <label className="text-sm text-gray-700">{category.label}</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(value => (
                <button
                  key={value}
                  type="button"
                  onClick={() => form.setValue(`ratings.${category.id}`, value)}
                  className={`w-8 h-8 rounded-full border ${
                    form.watch(`ratings.${category.id}`) === value
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Key Strengths
        </label>
        <textarea
          {...form.register('strengths')}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
        {form.formState.errors.strengths && (
          <p className="text-sm text-red-600 mt-1">
            {form.formState.errors.strengths.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Areas for Improvement
        </label>
        <textarea
          {...form.register('improvements')}
          rows={3}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>

      <button
        type="submit"
        disabled={submitReview.isPending}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {submitReview.isPending ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}
```

### Payroll Module

```typescript
// lib/services/payroll.ts
import { db } from '@/lib/db';
import { Decimal } from '@prisma/client/runtime/library';

interface TaxBracket {
  min: number;
  max: number;
  rate: number;
}

const TAX_BRACKETS: TaxBracket[] = [
  { min: 0, max: 10000, rate: 0.10 },
  { min: 10000, max: 40000, rate: 0.12 },
  { min: 40000, max: 85000, rate: 0.22 },
  { min: 85000, max: 165000, rate: 0.24 },
  { min: 165000, max: Infinity, rate: 0.32 },
];

export function calculateTax(annualSalary: number): number {
  let tax = 0;
  let remaining = annualSalary;

  for (const bracket of TAX_BRACKETS) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, bracket.max - bracket.min);
    tax += taxable * bracket.rate;
    remaining -= taxable;
  }

  return Math.round(tax * 100) / 100;
}

export async function processPayroll(payrollId: string) {
  const payroll = await db.payrollRun.findUnique({
    where: { id: payrollId },
    include: { items: true },
  });

  if (!payroll || payroll.status !== 'DRAFT') {
    throw new Error('Invalid payroll run');
  }

  await db.payrollRun.update({
    where: { id: payrollId },
    data: { status: 'PROCESSING' },
  });

  const employees = await db.employee.findMany({
    where: { status: 'ACTIVE' },
    include: {
      salaryRecords: {
        where: { effectiveDate: { lte: payroll.endDate } },
        orderBy: { effectiveDate: 'desc' },
        take: 1,
      },
    },
  });

  let totalGross = 0;
  let totalNet = 0;

  for (const employee of employees) {
    const salary = employee.salaryRecords[0];
    if (!salary) continue;

    const monthlyBase = Number(salary.baseSalary) / 12;
    const annualTax = calculateTax(Number(salary.baseSalary));
    const monthlyTax = annualTax / 12;
    const netSalary = monthlyBase - monthlyTax;

    await db.payrollItem.create({
      data: {
        payrollId,
        employeeId: employee.id,
        baseSalary: monthlyBase,
        tax: monthlyTax,
        netSalary,
      },
    });

    totalGross += monthlyBase;
    totalNet += netSalary;
  }

  await db.payrollRun.update({
    where: { id: payrollId },
    data: {
      status: 'COMPLETED',
      totalGross,
      totalNet,
      processedAt: new Date(),
    },
  });
}
```

### Leave Management

```typescript
// app/api/leave/requests/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { differenceInBusinessDays } from 'date-fns';

const leaveRequestSchema = z.object({
  leaveTypeId: z.string(),
  startDate: z.string().transform(s => new Date(s)),
  endDate: z.string().transform(s => new Date(s)),
  reason: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.employeeId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { leaveTypeId, startDate, endDate, reason } = leaveRequestSchema.parse(body);

  const days = differenceInBusinessDays(endDate, startDate) + 1;

  // Check balance
  const balance = await db.leaveBalance.findFirst({
    where: {
      employeeId: session.employeeId,
      leaveTypeId,
      year: new Date().getFullYear(),
    },
  });

  const available = balance
    ? Number(balance.entitled) + Number(balance.carried) - Number(balance.used)
    : 0;

  if (days > available) {
    return NextResponse.json(
      { error: 'Insufficient leave balance' },
      { status: 400 }
    );
  }

  // Check for overlapping requests
  const overlapping = await db.leaveRequest.findFirst({
    where: {
      employeeId: session.employeeId,
      status: { in: ['PENDING', 'APPROVED'] },
      OR: [
        { startDate: { lte: endDate }, endDate: { gte: startDate } },
      ],
    },
  });

  if (overlapping) {
    return NextResponse.json(
      { error: 'Overlapping leave request exists' },
      { status: 400 }
    );
  }

  const leaveRequest = await db.leaveRequest.create({
    data: {
      employeeId: session.employeeId,
      leaveTypeId,
      startDate,
      endDate,
      days,
      reason,
    },
  });

  return NextResponse.json(leaveRequest, { status: 201 });
}
```

## Document Management

```typescript
// lib/services/documents.ts
import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/aws';
import { db } from '@/lib/db';
import crypto from 'crypto';

const BUCKET = process.env.AWS_S3_BUCKET!;
const ENCRYPTION_KEY = process.env.DOCUMENT_ENCRYPTION_KEY!;

export async function uploadDocument(params: {
  file: Buffer;
  fileName: string;
  mimeType: string;
  employeeId?: string;
  type: DocumentType;
}) {
  const { file, fileName, mimeType, employeeId, type } = params;

  // Encrypt sensitive documents
  const encrypted = encryptBuffer(file, ENCRYPTION_KEY);
  const key = `documents/${crypto.randomUUID()}/${fileName}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: encrypted,
    ContentType: mimeType,
    ServerSideEncryption: 'AES256',
  }));

  const document = await db.document.create({
    data: {
      employeeId,
      name: fileName,
      type,
      url: key,
      size: file.length,
      mimeType,
    },
  });

  return document;
}

export async function getDocumentUrl(documentId: string): Promise<string> {
  const document = await db.document.findUnique({ where: { id: documentId } });
  if (!document) throw new Error('Document not found');

  const command = new GetObjectCommand({
    Bucket: BUCKET,
    Key: document.url,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

function encryptBuffer(buffer: Buffer, key: string): Buffer {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]);
}
```

## Reporting

```typescript
// app/api/reports/headcount/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: NextRequest) {
  await requirePermission('reports:read');
  const { searchParams } = new URL(request.url);
  const months = parseInt(searchParams.get('months') || '12');

  const data = [];

  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const start = startOfMonth(date);
    const end = endOfMonth(date);

    const [total, hires, terminations, byDepartment] = await Promise.all([
      db.employee.count({
        where: {
          hireDate: { lte: end },
          OR: [
            { terminationDate: null },
            { terminationDate: { gt: end } },
          ],
        },
      }),
      db.employee.count({
        where: {
          hireDate: { gte: start, lte: end },
        },
      }),
      db.employee.count({
        where: {
          terminationDate: { gte: start, lte: end },
        },
      }),
      db.employee.groupBy({
        by: ['departmentId'],
        where: {
          hireDate: { lte: end },
          OR: [
            { terminationDate: null },
            { terminationDate: { gt: end } },
          ],
        },
        _count: true,
      }),
    ]);

    data.push({
      month: format(date, 'MMM yyyy'),
      total,
      hires,
      terminations,
      turnoverRate: total > 0 ? ((terminations / total) * 100).toFixed(1) : '0',
      byDepartment,
    });
  }

  return NextResponse.json(data);
}
```

```typescript
// components/reports/hr-dashboard.tsx
'use client';

import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { StatCard } from '@/components/ui/stat-card';

export function HRDashboard() {
  const { data: headcount } = useQuery({
    queryKey: ['headcount-report'],
    queryFn: () => fetch('/api/reports/headcount').then(r => r.json()),
  });

  const { data: turnover } = useQuery({
    queryKey: ['turnover-report'],
    queryFn: () => fetch('/api/reports/turnover').then(r => r.json()),
  });

  const latest = headcount?.[headcount.length - 1];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Employees"
          value={latest?.total || 0}
          trend={{ value: latest?.hires - latest?.terminations, isPositive: true }}
        />
        <StatCard
          title="New Hires (MTD)"
          value={latest?.hires || 0}
        />
        <StatCard
          title="Turnover Rate"
          value={`${latest?.turnoverRate || 0}%`}
        />
        <StatCard
          title="Open Positions"
          value={12}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium mb-4">Headcount Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={headcount}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#93c5fd" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg border">
          <h3 className="font-medium mb-4">Hires vs Terminations</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={headcount}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hires" fill="#22c55e" name="Hires" />
              <Bar dataKey="terminations" fill="#ef4444" name="Terminations" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
```

## Integrations

```typescript
// lib/integrations/payroll-provider.ts
export interface PayrollProvider {
  name: string;
  syncEmployees(employees: Employee[]): Promise<void>;
  processPayroll(payrollRun: PayrollRun): Promise<PayrollResult>;
  getPaystubs(employeeId: string, year: number): Promise<Paystub[]>;
}

export class ADPProvider implements PayrollProvider {
  name = 'ADP';
  private apiKey: string;
  private baseUrl = 'https://api.adp.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async syncEmployees(employees: Employee[]) {
    // Sync employee data to ADP
  }

  async processPayroll(payrollRun: PayrollRun) {
    // Submit payroll to ADP for processing
  }

  async getPaystubs(employeeId: string, year: number) {
    // Retrieve paystubs from ADP
  }
}

// lib/integrations/background-check.ts
export interface BackgroundCheckProvider {
  initiateCheck(applicantId: string, checkType: string): Promise<string>;
  getStatus(checkId: string): Promise<BackgroundCheckStatus>;
  getReport(checkId: string): Promise<BackgroundCheckReport>;
}

export class CheckrProvider implements BackgroundCheckProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initiateCheck(applicantId: string, checkType: string) {
    const res = await fetch('https://api.checkr.com/v1/invitations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        candidate_id: applicantId,
        package: checkType,
      }),
    });
    const data = await res.json();
    return data.id;
  }

  async getStatus(checkId: string) {
    // Get background check status
  }

  async getReport(checkId: string) {
    // Get full report
  }
}
```

## Security

```typescript
// lib/security/pii-protection.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY!;
const ALGORITHM = 'aes-256-gcm';

export function encryptPII(data: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decryptPII(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(ivHex, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Middleware for PII access logging
export async function logPIIAccess(params: {
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  fields: string[];
}) {
  await db.auditLog.create({
    data: {
      userId: params.userId,
      action: `PII_ACCESS:${params.action}`,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: { fields: params.fields },
      timestamp: new Date(),
    },
  });
}
```

```typescript
// lib/auth/hrm-permissions.ts
export const HRM_PERMISSIONS = {
  // Recruitment
  'recruitment:read': ['hr_admin', 'hr_manager', 'recruiter'],
  'recruitment:write': ['hr_admin', 'hr_manager', 'recruiter'],
  'recruitment:delete': ['hr_admin'],

  // Employees
  'employees:read': ['hr_admin', 'hr_manager', 'manager'],
  'employees:read_pii': ['hr_admin', 'hr_manager'],
  'employees:write': ['hr_admin', 'hr_manager'],
  'employees:terminate': ['hr_admin'],

  // Payroll
  'payroll:read': ['hr_admin', 'payroll_admin'],
  'payroll:process': ['hr_admin', 'payroll_admin'],
  'payroll:approve': ['hr_admin', 'finance_admin'],

  // Performance
  'performance:read': ['hr_admin', 'hr_manager', 'manager'],
  'performance:write': ['hr_admin', 'hr_manager', 'manager'],

  // Leave
  'leave:request': ['employee', 'manager', 'hr_admin'],
  'leave:approve': ['manager', 'hr_admin'],
  'leave:manage_balances': ['hr_admin'],

  // Reports
  'reports:read': ['hr_admin', 'hr_manager', 'executive'],
  'reports:export': ['hr_admin'],
} as const;
```

## Testing

```typescript
// tests/unit/payroll.test.ts
import { describe, it, expect } from 'vitest';
import { calculateTax } from '@/lib/services/payroll';

describe('Payroll Tax Calculation', () => {
  it('calculates tax for income in first bracket', () => {
    expect(calculateTax(5000)).toBe(500);
  });

  it('calculates tax across multiple brackets', () => {
    const tax = calculateTax(50000);
    expect(tax).toBeCloseTo(6600);
  });

  it('handles high income correctly', () => {
    const tax = calculateTax(200000);
    expect(tax).toBeGreaterThan(40000);
  });
});
```

```typescript
// tests/e2e/recruitment.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Recruitment Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'hr@example.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('creates a new job posting', async ({ page }) => {
    await page.click('text=Recruitment');
    await page.click('text=New Job');

    await page.fill('[name="title"]', 'Senior Software Engineer');
    await page.fill('[name="description"]', 'We are looking for an experienced...');
    await page.selectOption('[name="employmentType"]', 'FULL_TIME');

    await page.click('button:has-text("Save Draft")');

    await expect(page.locator('.toast')).toContainText('Job posting created');
  });

  test('moves applicant through pipeline', async ({ page }) => {
    await page.goto('/recruitment/jobs/test-job-id');

    const applicantCard = page.locator('[data-applicant-id="test-applicant"]');
    const interviewColumn = page.locator('[data-stage="INTERVIEW"]');

    await applicantCard.dragTo(interviewColumn);

    await expect(applicantCard).toBeVisible();
    await expect(interviewColumn).toContainText('Test Applicant');
  });
});
```

## Changelog

### v1.0.0 (2025-01-18)
- Initial release with core HRM modules
- Recruitment pipeline with applicant tracking
- Employee management and org chart visualization
- Performance review system with goal tracking
- Payroll processing with tax calculations
- Leave management with balance tracking
- Document management with encryption
- Comprehensive reporting and analytics
- Role-based access control for HR functions
- PII protection and audit logging
