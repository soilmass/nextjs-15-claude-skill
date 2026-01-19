---
id: r-contract-management
name: Contract Management
version: 3.0.0
layer: L6
category: recipes
description: Legal contract management platform with document versioning, e-signatures, templates, approval workflows, and compliance tracking
tags: [contracts, legal, e-signatures, documents, versioning, templates, workflows, compliance]
formula: "ContractManagement = DashboardLayout(t-dashboard-layout) + DashboardHome(t-dashboard-home) + SettingsPage(t-settings-page) + DocumentViewer(t-document-viewer) + AuthLayout(t-auth-layout) + ProfilePage(t-profile-page) + ContractEditor(o-contract-editor) + SignaturePad(o-signature-pad) + VersionHistory(o-version-history) + ApprovalWorkflow(o-approval-workflow) + DataTable(o-data-table) + Header(o-header) + Sidebar(o-sidebar) + Chart(o-chart) + Timeline(o-timeline) + Modal(o-modal) + FilterBar(o-filter-bar) + FileUploader(o-file-uploader) + Breadcrumb(m-breadcrumb) + Pagination(m-pagination) + Card(m-card) + FormField(m-form-field) + Badge(m-badge) + Avatar(m-avatar) + DatePicker(m-date-picker) + SearchInput(m-search-input) + StatCard(m-stat-card) + Toast(m-toast) + ProgressBar(m-progress-bar) + NextAuth(pt-next-auth) + AuthMiddleware(pt-auth-middleware) + SessionManagement(pt-session-management) + Rbac(pt-rbac) + MultiTenancy(pt-multi-tenancy) + RateLimiting(pt-rate-limiting) + AuditLogging(pt-audit-logging) + FormValidation(pt-form-validation) + ZodSchemas(pt-zod-schemas) + ServerActions(pt-server-actions) + TransactionalEmail(pt-transactional-email) + PdfGeneration(pt-pdf-generation) + FileStorage(pt-file-storage) + ErrorBoundaries(pt-error-boundaries) + ErrorTracking(pt-error-tracking) + SkeletonLoading(pt-skeleton-loading) + AnalyticsEvents(pt-analytics-events) + Filtering(pt-filtering) + Pagination(pt-pagination) + Sorting(pt-sorting) + Search(pt-search) + ReactQuery(pt-react-query) + Zustand(pt-zustand) + OptimisticUpdates(pt-optimistic-updates) + RichTextEditor(pt-rich-text-editor) + ExportData(pt-export-data) + Encryption(pt-encryption) + TestingE2e(pt-testing-e2e) + TestingUnit(pt-testing-unit)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  - ../templates/auth-layout.md
  - ../templates/profile-page.md
  # L3 Organisms
  - ../organisms/data-table.md
  - ../organisms/header.md
  - ../organisms/sidebar.md
  - ../organisms/chart.md
  - ../organisms/timeline.md
  - ../organisms/modal.md
  - ../organisms/filter-bar.md
  - ../organisms/file-uploader.md
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
  - ../molecules/progress-bar.md
  # L5 Patterns - Authentication
  - ../patterns/next-auth.md
  - ../patterns/auth-middleware.md
  - ../patterns/session-management.md
  - ../patterns/rbac.md
  - ../patterns/multi-tenancy.md
  # L5 Patterns - Security
  - ../patterns/rate-limiting.md
  - ../patterns/audit-logging.md
  - ../patterns/encryption.md
  # L5 Patterns - Forms & Validation
  - ../patterns/form-validation.md
  - ../patterns/zod-schemas.md
  - ../patterns/server-actions.md
  # L5 Patterns - Documents
  - ../patterns/transactional-email.md
  - ../patterns/pdf-generation.md
  - ../patterns/file-storage.md
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
  # L5 Patterns - Content
  - ../patterns/rich-text-editor.md
  - ../patterns/export-data.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
dependencies:
  - next@15.0.0
  - react@19.0.0
  - typescript@5.6.0
  - tailwindcss@4.0.0
  - prisma@6.0.0
  - "@tanstack/react-query"
  - react-hook-form
  - zod
  - "@radix-ui/react-dialog"
  - "@radix-ui/react-tabs"
  - "@radix-ui/react-popover"
  - "@tiptap/react"
  - "@react-pdf/renderer"
  - lucide-react
  - date-fns
  - docusign-esign
  - aws-sdk
skills:
  - document-versioning
  - e-signatures
  - approval-workflows
  - template-management
  - audit-trails
  - compliance
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# Contract Management

## Overview

A comprehensive contract management platform featuring:
- Document creation with rich text editor
- Template library with merge fields
- Document versioning with diff comparison
- E-signature integration (DocuSign/built-in)
- Multi-party approval workflows
- Automated reminders and notifications
- Compliance tracking and audit trails
- Contract analytics and reporting
- Secure document storage with encryption

## Architecture

```
+----------------------------------------------------------+
|                    Next.js App                            |
+----------------------------------------------------------+
|  Contract    |  Templates  |  Signatures  |  Workflows   |
|  Editor      |  Library    |  (e-sign)    |  (Approvals) |
+----------------------------------------------------------+
|              Prisma ORM + PostgreSQL                      |
+----------------------------------------------------------+
|  Documents   |  Versions   |  Signatures  |  Audit Logs  |
+----------------------------------------------------------+
|                 S3 / Cloud Storage                        |
+----------------------------------------------------------+
```

## Project Structure

```
contract-management/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Dashboard overview
│   │   ├── contracts/
│   │   │   ├── page.tsx                  # Contract list
│   │   │   ├── new/page.tsx              # Create contract
│   │   │   └── [contractId]/
│   │   │       ├── page.tsx              # Contract detail
│   │   │       ├── edit/page.tsx         # Edit contract
│   │   │       ├── versions/page.tsx     # Version history
│   │   │       └── sign/page.tsx         # Signature page
│   │   ├── templates/
│   │   │   ├── page.tsx                  # Template library
│   │   │   ├── new/page.tsx              # Create template
│   │   │   └── [templateId]/
│   │   │       ├── page.tsx              # Template detail
│   │   │       └── edit/page.tsx         # Edit template
│   │   ├── workflows/
│   │   │   ├── page.tsx                  # Workflow list
│   │   │   └── [workflowId]/page.tsx     # Workflow detail
│   │   ├── approvals/
│   │   │   ├── page.tsx                  # Pending approvals
│   │   │   └── [approvalId]/page.tsx     # Approval detail
│   │   ├── reports/
│   │   │   ├── page.tsx                  # Reports overview
│   │   │   ├── contracts/page.tsx        # Contract analytics
│   │   │   └── compliance/page.tsx       # Compliance reports
│   │   ├── contacts/
│   │   │   ├── page.tsx                  # Contact list
│   │   │   └── [contactId]/page.tsx      # Contact detail
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── signatures/page.tsx       # Signature settings
│   │       ├── workflows/page.tsx        # Default workflows
│   │       └── integrations/page.tsx     # DocuSign, etc.
│   ├── sign/
│   │   └── [token]/page.tsx              # Public signing page
│   ├── api/
│   │   ├── contracts/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   ├── [id]/versions/route.ts
│   │   │   ├── [id]/sign/route.ts
│   │   │   ├── [id]/approve/route.ts
│   │   │   └── [id]/pdf/route.ts
│   │   ├── templates/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── signatures/
│   │   │   ├── route.ts
│   │   │   └── verify/route.ts
│   │   ├── workflows/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── contacts/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── upload/route.ts
│   │   └── webhooks/
│   │       └── docusign/route.ts
│   └── layout.tsx
├── components/
│   ├── contracts/
│   │   ├── contract-editor.tsx
│   │   ├── contract-card.tsx
│   │   ├── contract-form.tsx
│   │   ├── contract-viewer.tsx
│   │   └── contract-status.tsx
│   ├── templates/
│   │   ├── template-editor.tsx
│   │   ├── template-card.tsx
│   │   ├── merge-fields.tsx
│   │   └── template-preview.tsx
│   ├── signatures/
│   │   ├── signature-pad.tsx
│   │   ├── signature-request.tsx
│   │   ├── signer-list.tsx
│   │   └── signature-status.tsx
│   ├── versions/
│   │   ├── version-list.tsx
│   │   ├── version-diff.tsx
│   │   └── version-restore.tsx
│   ├── workflows/
│   │   ├── workflow-builder.tsx
│   │   ├── workflow-step.tsx
│   │   ├── approval-card.tsx
│   │   └── workflow-timeline.tsx
│   ├── reports/
│   │   ├── contract-chart.tsx
│   │   ├── compliance-table.tsx
│   │   └── expiration-calendar.tsx
│   └── ui/
├── lib/
│   ├── contracts.ts
│   ├── signatures.ts
│   ├── docusign.ts
│   ├── pdf.ts
│   ├── storage.ts
│   ├── encryption.ts
│   └── utils.ts
├── hooks/
│   ├── use-contract.ts
│   ├── use-signature.ts
│   └── use-workflow.ts
└── prisma/
    └── schema.prisma
```

## Skills Used

| Skill | Layer | Purpose |
|-------|-------|---------|
| contract-editor | L3 | Rich text contract editing |
| signature-pad | L3 | Digital signature capture |
| version-history | L3 | Document version tracking |
| approval-workflow | L3 | Multi-step approval process |
| pdf-generation | L5 | Contract PDF export |
| file-storage | L5 | Secure document storage |
| encryption | L5 | Document encryption at rest |
| audit-logging | L5 | Compliance audit trails |

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
  id                String   @id @default(cuid())
  name              String
  slug              String   @unique
  logo              String?

  // DocuSign integration
  docusignAccountId String?
  docusignIntegrationKey String?

  // Settings
  defaultWorkflowId String?

  members           OrganizationMember[]
  contracts         Contract[]
  templates         Template[]
  workflows         Workflow[]
  contacts          Contact[]
  auditLogs         AuditLog[]

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  name          String
  avatar        String?
  passwordHash  String

  // Signature
  signatureImage String?
  initialsImage  String?

  memberships   OrganizationMember[]
  contracts     Contract[]       @relation("creator")
  approvals     Approval[]
  signatures    Signature[]
  auditLogs     AuditLog[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model OrganizationMember {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           MemberRole   @default(MEMBER)

  // Permissions
  canCreateContracts  Boolean @default(true)
  canApproveContracts Boolean @default(false)
  canManageTemplates  Boolean @default(false)
  canManageWorkflows  Boolean @default(false)
  canViewAllContracts Boolean @default(false)

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt      DateTime     @default(now())

  @@unique([organizationId, userId])
}

enum MemberRole {
  OWNER
  ADMIN
  MANAGER
  MEMBER
  VIEWER
}

model Contract {
  id             String         @id @default(cuid())
  organizationId String
  creatorId      String

  // Basic info
  title          String
  description    String?
  contractNumber String?

  // Type and category
  type           ContractType   @default(GENERAL)
  category       String?

  // Status
  status         ContractStatus @default(DRAFT)

  // Content
  content        String         @db.Text  // Rich text content
  contentHtml    String?        @db.Text  // Rendered HTML

  // Template
  templateId     String?
  mergeData      Json?          // Merge field values

  // Dates
  effectiveDate  DateTime?      @db.Date
  expirationDate DateTime?      @db.Date
  terminatedDate DateTime?      @db.Date

  // Value
  totalValue     Decimal?       @db.Decimal(15, 2)
  currency       String         @default("USD")

  // Workflow
  workflowId     String?

  // Storage
  documentUrl    String?        // Final signed PDF
  attachments    Json?          // Additional attachments

  // Encryption
  encryptionKey  String?        // Encrypted key for document

  organization   Organization   @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  creator        User           @relation("creator", fields: [creatorId], references: [id])
  template       Template?      @relation(fields: [templateId], references: [id])
  workflow       Workflow?      @relation(fields: [workflowId], references: [id])
  versions       ContractVersion[]
  signers        ContractSigner[]
  approvals      Approval[]
  comments       Comment[]
  reminders      Reminder[]
  tags           ContractTag[]

  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt

  @@index([organizationId])
  @@index([status])
  @@index([expirationDate])
}

enum ContractType {
  GENERAL
  NDA
  MSA
  SOW
  EMPLOYMENT
  VENDOR
  LICENSE
  LEASE
  PARTNERSHIP
  OTHER
}

enum ContractStatus {
  DRAFT
  PENDING_APPROVAL
  APPROVED
  PENDING_SIGNATURE
  PARTIALLY_SIGNED
  SIGNED
  ACTIVE
  EXPIRED
  TERMINATED
  CANCELLED
}

model ContractVersion {
  id           String   @id @default(cuid())
  contractId   String
  versionNumber Int
  content      String   @db.Text
  contentHtml  String?  @db.Text
  changeNotes  String?
  createdById  String

  // Snapshot of merge data at this version
  mergeData    Json?

  contract     Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)

  createdAt    DateTime @default(now())

  @@unique([contractId, versionNumber])
  @@index([contractId])
}

model Template {
  id             String       @id @default(cuid())
  organizationId String
  name           String
  description    String?
  type           ContractType @default(GENERAL)
  category       String?

  // Content with merge fields
  content        String       @db.Text
  contentHtml    String?      @db.Text

  // Merge fields definition
  mergeFields    Json?        // Array of field definitions

  // Default settings
  defaultWorkflowId String?
  defaultExpirationDays Int?

  // Status
  isActive       Boolean      @default(true)
  isPublic       Boolean      @default(false) // Shared across org

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  contracts      Contract[]

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
}

model ContractSigner {
  id           String       @id @default(cuid())
  contractId   String
  contactId    String?
  userId       String?      // Internal user

  // Signer info
  name         String
  email        String
  role         String?      // e.g., "CEO", "Legal Counsel"

  // Signing order
  order        Int          @default(0)

  // Status
  status       SignerStatus @default(PENDING)

  // Access token for signing
  signingToken String       @unique @default(cuid())
  tokenExpiresAt DateTime?

  // DocuSign
  docusignRecipientId String?

  contract     Contract     @relation(fields: [contractId], references: [id], onDelete: Cascade)
  contact      Contact?     @relation(fields: [contactId], references: [id])
  user         User?        @relation(fields: [userId], references: [id])
  signature    Signature?

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  @@index([contractId])
  @@index([signingToken])
}

enum SignerStatus {
  PENDING
  SENT
  VIEWED
  SIGNED
  DECLINED
  EXPIRED
}

model Signature {
  id           String   @id @default(cuid())
  signerId     String   @unique
  contractId   String

  // Signature data
  signatureImage String?  // Base64 or URL
  signatureType SignatureType @default(DRAWN)

  // Legal info
  ipAddress    String?
  userAgent    String?
  timestamp    DateTime @default(now())

  // Verification
  hash         String?  // Hash of document at signing
  certificate  String?  @db.Text // Digital certificate

  signer       ContractSigner @relation(fields: [signerId], references: [id], onDelete: Cascade)

  @@index([contractId])
}

enum SignatureType {
  DRAWN
  TYPED
  UPLOADED
  DOCUSIGN
}

model Workflow {
  id             String       @id @default(cuid())
  organizationId String
  name           String
  description    String?

  // Steps
  steps          WorkflowStep[]

  // Settings
  isDefault      Boolean      @default(false)
  isActive       Boolean      @default(true)

  // Auto-actions
  autoReminders  Boolean      @default(true)
  reminderDays   Int[]        @default([3, 1])

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  contracts      Contract[]

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@index([organizationId])
}

model WorkflowStep {
  id           String         @id @default(cuid())
  workflowId   String
  name         String
  order        Int
  type         WorkflowStepType

  // Approvers (for approval steps)
  approverType ApproverType?
  approverIds  String[]       // User IDs or role names

  // Settings
  requireAll   Boolean        @default(false) // All approvers must approve
  timeoutDays  Int?           // Auto-escalate after X days

  workflow     Workflow       @relation(fields: [workflowId], references: [id], onDelete: Cascade)
  approvals    Approval[]

  @@unique([workflowId, order])
  @@index([workflowId])
}

enum WorkflowStepType {
  APPROVAL
  REVIEW
  SIGNATURE
  NOTIFICATION
}

enum ApproverType {
  SPECIFIC_USERS
  ROLE
  MANAGER
  LEGAL_TEAM
}

model Approval {
  id           String         @id @default(cuid())
  contractId   String
  stepId       String
  approverId   String

  // Status
  status       ApprovalStatus @default(PENDING)
  decision     ApprovalDecision?
  comment      String?

  // Timing
  requestedAt  DateTime       @default(now())
  respondedAt  DateTime?
  dueDate      DateTime?

  contract     Contract       @relation(fields: [contractId], references: [id], onDelete: Cascade)
  step         WorkflowStep   @relation(fields: [stepId], references: [id])
  approver     User           @relation(fields: [approverId], references: [id])

  @@index([contractId])
  @@index([approverId])
  @@index([status])
}

enum ApprovalStatus {
  PENDING
  COMPLETED
  EXPIRED
}

enum ApprovalDecision {
  APPROVED
  REJECTED
  CHANGES_REQUESTED
}

model Contact {
  id             String       @id @default(cuid())
  organizationId String
  name           String
  email          String
  phone          String?
  company        String?
  title          String?

  // Address
  address        String?
  city           String?
  state          String?
  postalCode     String?
  country        String?

  // Notes
  notes          String?

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  signers        ContractSigner[]

  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  @@unique([organizationId, email])
  @@index([organizationId])
}

model Comment {
  id         String   @id @default(cuid())
  contractId String
  userId     String
  parentId   String?

  content    String   @db.Text
  resolved   Boolean  @default(false)

  // Position in document (for inline comments)
  position   Json?

  contract   Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)
  parent     Comment? @relation("replies", fields: [parentId], references: [id])
  replies    Comment[] @relation("replies")

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([contractId])
}

model Reminder {
  id         String       @id @default(cuid())
  contractId String
  type       ReminderType
  daysBeforeAfter Int     // Negative for before, positive for after
  sent       Boolean      @default(false)
  sentAt     DateTime?

  contract   Contract     @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@index([contractId])
}

enum ReminderType {
  EXPIRATION
  SIGNATURE_PENDING
  APPROVAL_PENDING
  RENEWAL
}

model ContractTag {
  id         String   @id @default(cuid())
  contractId String
  name       String

  contract   Contract @relation(fields: [contractId], references: [id], onDelete: Cascade)

  @@unique([contractId, name])
  @@index([name])
}

model AuditLog {
  id             String       @id @default(cuid())
  organizationId String
  userId         String?
  contractId     String?

  action         String       // e.g., "contract.created", "signature.completed"
  entityType     String
  entityId       String?
  changes        Json?        // Before/after for updates
  metadata       Json?        // Additional context

  ipAddress      String?
  userAgent      String?

  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user           User?        @relation(fields: [userId], references: [id])

  createdAt      DateTime     @default(now())

  @@index([organizationId])
  @@index([contractId])
  @@index([action])
  @@index([createdAt])
}
```

## Implementation

### Contract Editor

```tsx
// components/contracts/contract-editor.tsx
'use client';

import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { useState, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Table as TableIcon,
  Highlighter,
  Undo,
  Redo,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MergeFieldInserter } from './merge-field-inserter';

// Custom merge field extension
const MergeField = {
  name: 'mergeField',
  addAttributes() {
    return {
      fieldName: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: 'span[data-merge-field]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      {
        ...HTMLAttributes,
        'data-merge-field': HTMLAttributes.fieldName,
        class: 'merge-field bg-blue-100 text-blue-800 px-1 rounded',
      },
      `{{${HTMLAttributes.fieldName}}}`,
    ];
  },
};

interface ContractEditorProps {
  content: string;
  onChange: (content: string, html: string) => void;
  mergeFields?: { name: string; label: string; type: string }[];
  readOnly?: boolean;
}

export function ContractEditor({
  content,
  onChange,
  mergeFields = [],
  readOnly = false,
}: ContractEditorProps) {
  const [showMergeFields, setShowMergeFields] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Start writing your contract...',
      }),
      Highlight,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      const json = JSON.stringify(editor.getJSON());
      const html = editor.getHTML();
      onChange(json, html);
    },
  });

  const insertMergeField = useCallback(
    (fieldName: string) => {
      if (!editor) return;

      editor
        .chain()
        .focus()
        .insertContent(`{{${fieldName}}}`)
        .run();

      setShowMergeFields(false);
    },
    [editor]
  );

  if (!editor) {
    return <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />;
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      {!readOnly && (
        <div className="border-b bg-gray-50 p-2 flex flex-wrap gap-1">
          <Button
            size="sm"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            size="sm"
            variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
          >
            <AlignRight className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            size="sm"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              editor
                .chain()
                .focus()
                .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                .run()
            }
          >
            <TableIcon className="h-4 w-4" />
          </Button>

          <Button
            size="sm"
            variant={editor.isActive('highlight') ? 'default' : 'ghost'}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
          >
            <Highlighter className="h-4 w-4" />
          </Button>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
          >
            <Redo className="h-4 w-4" />
          </Button>

          {/* Merge Fields */}
          {mergeFields.length > 0 && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <MergeFieldInserter
                fields={mergeFields}
                onInsert={insertMergeField}
              />
            </>
          )}
        </div>
      )}

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose max-w-none p-4 min-h-[500px] focus:outline-none"
      />

      {/* Bubble Menu */}
      {editor && !readOnly && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="bg-white shadow-lg rounded-lg p-1 flex gap-1 border">
            <Button
              size="sm"
              variant={editor.isActive('bold') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('italic') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant={editor.isActive('highlight') ? 'default' : 'ghost'}
              onClick={() => editor.chain().focus().toggleHighlight().run()}
            >
              <Highlighter className="h-3 w-3" />
            </Button>
          </div>
        </BubbleMenu>
      )}
    </div>
  );
}
```

### Signature Pad

```tsx
// components/signatures/signature-pad.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Eraser, Check, Upload } from 'lucide-react';

interface SignaturePadProps {
  onComplete: (signature: string, type: 'drawn' | 'typed' | 'uploaded') => void;
  signerName?: string;
}

export function SignaturePad({ onComplete, signerName = '' }: SignaturePadProps) {
  const canvasRef = useRef<SignatureCanvas>(null);
  const [typedSignature, setTypedSignature] = useState(signerName);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');

  const handleClear = () => {
    if (canvasRef.current) {
      canvasRef.current.clear();
    }
    setTypedSignature('');
    setUploadedImage(null);
  };

  const handleComplete = () => {
    let signatureData: string;
    let signatureType: 'drawn' | 'typed' | 'uploaded';

    switch (activeTab) {
      case 'draw':
        if (canvasRef.current?.isEmpty()) {
          return;
        }
        signatureData = canvasRef.current!.toDataURL('image/png');
        signatureType = 'drawn';
        break;

      case 'type':
        if (!typedSignature.trim()) {
          return;
        }
        // Generate signature image from text
        signatureData = generateTypedSignature(typedSignature);
        signatureType = 'typed';
        break;

      case 'upload':
        if (!uploadedImage) {
          return;
        }
        signatureData = uploadedImage;
        signatureType = 'uploaded';
        break;

      default:
        return;
    }

    onComplete(signatureData, signatureType);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border rounded-lg p-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="draw">Draw</TabsTrigger>
          <TabsTrigger value="type">Type</TabsTrigger>
          <TabsTrigger value="upload">Upload</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-4">
          <div className="border-2 border-dashed rounded-lg bg-white">
            <SignatureCanvas
              ref={canvasRef}
              canvasProps={{
                className: 'w-full h-48',
                style: { width: '100%', height: '192px' },
              }}
              backgroundColor="white"
              penColor="black"
            />
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Use your mouse or finger to draw your signature
          </p>
        </TabsContent>

        <TabsContent value="type" className="mt-4">
          <Input
            value={typedSignature}
            onChange={(e) => setTypedSignature(e.target.value)}
            placeholder="Type your full name"
            className="text-2xl h-16"
          />
          {typedSignature && (
            <div className="mt-4 p-4 border rounded-lg bg-white">
              <p
                className="text-3xl text-center"
                style={{ fontFamily: 'cursive' }}
              >
                {typedSignature}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <div className="border-2 border-dashed rounded-lg p-8 text-center">
            {uploadedImage ? (
              <div className="space-y-4">
                <img
                  src={uploadedImage}
                  alt="Uploaded signature"
                  className="max-h-32 mx-auto"
                />
                <Button variant="outline" onClick={() => setUploadedImage(null)}>
                  Remove
                </Button>
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload a signature image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between mt-4 pt-4 border-t">
        <Button variant="outline" onClick={handleClear}>
          <Eraser className="h-4 w-4 mr-2" />
          Clear
        </Button>
        <Button onClick={handleComplete}>
          <Check className="h-4 w-4 mr-2" />
          Apply Signature
        </Button>
      </div>
    </div>
  );
}

function generateTypedSignature(text: string): string {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 100;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.font = '48px cursive';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  return canvas.toDataURL('image/png');
}
```

### Approval Workflow

```tsx
// components/workflows/approval-workflow.tsx
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';

interface Approval {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED';
  decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED' | null;
  comment: string | null;
  requestedAt: string;
  respondedAt: string | null;
  dueDate: string | null;
  approver: {
    id: string;
    name: string;
    email: string;
    avatar: string | null;
  };
  step: {
    id: string;
    name: string;
    order: number;
  };
}

interface WorkflowStep {
  id: string;
  name: string;
  order: number;
  type: string;
  approvals: Approval[];
}

interface ApprovalWorkflowProps {
  contractId: string;
  steps: WorkflowStep[];
  currentUserId: string;
  canApprove: boolean;
}

export function ApprovalWorkflow({
  contractId,
  steps,
  currentUserId,
  canApprove,
}: ApprovalWorkflowProps) {
  const [comment, setComment] = useState('');
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const submitApproval = useMutation({
    mutationFn: async ({
      approvalId,
      decision,
      comment,
    }: {
      approvalId: string;
      decision: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
      comment?: string;
    }) => {
      const res = await fetch(`/api/contracts/${contractId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, decision, comment }),
      });
      if (!res.ok) throw new Error('Failed to submit approval');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      setComment('');
      setSelectedApprovalId(null);
    },
  });

  const getStepStatus = (step: WorkflowStep) => {
    const approvals = step.approvals;
    if (approvals.length === 0) return 'pending';

    const completed = approvals.filter((a) => a.status === 'COMPLETED');
    const rejected = completed.filter((a) => a.decision === 'REJECTED');

    if (rejected.length > 0) return 'rejected';
    if (completed.length === approvals.length) return 'completed';
    if (completed.length > 0) return 'in_progress';
    return 'pending';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Approval Workflow</h3>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gray-200" />

        {/* Steps */}
        <div className="space-y-6">
          {steps.map((step, index) => {
            const status = getStepStatus(step);
            const myApproval = step.approvals.find(
              (a) => a.approver.id === currentUserId && a.status === 'PENDING'
            );

            return (
              <div key={step.id} className="relative flex gap-4">
                {/* Status icon */}
                <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-white border-2 rounded-full">
                  {getStatusIcon(status)}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-6">
                  <div className="bg-white border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{step.name}</h4>
                        <p className="text-sm text-gray-500">
                          Step {step.order + 1} of {steps.length}
                        </p>
                      </div>
                      <Badge
                        variant={
                          status === 'completed'
                            ? 'success'
                            : status === 'rejected'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {status.replace('_', ' ')}
                      </Badge>
                    </div>

                    {/* Approvers */}
                    <div className="space-y-3">
                      {step.approvals.map((approval) => (
                        <div
                          key={approval.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={approval.approver.avatar || undefined} />
                              <AvatarFallback>
                                {approval.approver.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {approval.approver.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {approval.approver.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {approval.status === 'COMPLETED' ? (
                              <div className="flex items-center gap-1">
                                {approval.decision === 'APPROVED' ? (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                ) : approval.decision === 'REJECTED' ? (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                ) : (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                )}
                                <span className="text-sm">
                                  {approval.decision?.toLowerCase().replace('_', ' ')}
                                </span>
                                {approval.comment && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button size="sm" variant="ghost">
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Comment</DialogTitle>
                                      </DialogHeader>
                                      <p>{approval.comment}</p>
                                    </DialogContent>
                                  </Dialog>
                                )}
                              </div>
                            ) : approval.approver.id === currentUserId && canApprove ? (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedApprovalId(approval.id)}
                                >
                                  Review
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Pending</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Approval Dialog */}
      <Dialog
        open={!!selectedApprovalId}
        onOpenChange={() => setSelectedApprovalId(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Submit Your Decision</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Comment (optional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="mt-1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Button
                onClick={() =>
                  selectedApprovalId &&
                  submitApproval.mutate({
                    approvalId: selectedApprovalId,
                    decision: 'APPROVED',
                    comment: comment || undefined,
                  })
                }
                disabled={submitApproval.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  selectedApprovalId &&
                  submitApproval.mutate({
                    approvalId: selectedApprovalId,
                    decision: 'CHANGES_REQUESTED',
                    comment: comment || undefined,
                  })
                }
                disabled={submitApproval.isPending}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Request Changes
              </Button>

              <Button
                variant="destructive"
                onClick={() =>
                  selectedApprovalId &&
                  submitApproval.mutate({
                    approvalId: selectedApprovalId,
                    decision: 'REJECTED',
                    comment: comment || undefined,
                  })
                }
                disabled={submitApproval.isPending}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
```

### Version History with Diff

```tsx
// components/versions/version-diff.tsx
'use client';

import { useMemo } from 'react';
import { diffWords, diffLines } from 'diff';
import { format } from 'date-fns';
import { GitBranch, ArrowRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Version {
  id: string;
  versionNumber: number;
  content: string;
  contentHtml: string | null;
  changeNotes: string | null;
  createdAt: string;
  createdBy: {
    id: string;
    name: string;
  };
}

interface VersionDiffProps {
  versions: Version[];
  selectedVersions: [string, string];
  onVersionsChange: (versions: [string, string]) => void;
}

export function VersionDiff({
  versions,
  selectedVersions,
  onVersionsChange,
}: VersionDiffProps) {
  const [oldVersionId, newVersionId] = selectedVersions;

  const oldVersion = versions.find((v) => v.id === oldVersionId);
  const newVersion = versions.find((v) => v.id === newVersionId);

  const diff = useMemo(() => {
    if (!oldVersion || !newVersion) return [];

    // Use plain text content for diffing
    const oldText = stripHtml(oldVersion.contentHtml || oldVersion.content);
    const newText = stripHtml(newVersion.contentHtml || newVersion.content);

    return diffLines(oldText, newText);
  }, [oldVersion, newVersion]);

  const stats = useMemo(() => {
    let added = 0;
    let removed = 0;

    diff.forEach((part) => {
      const lines = part.value.split('\n').filter(Boolean).length;
      if (part.added) added += lines;
      if (part.removed) removed += lines;
    });

    return { added, removed };
  }, [diff]);

  return (
    <div className="space-y-4">
      {/* Version selectors */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-500">Compare</label>
          <Select
            value={oldVersionId}
            onValueChange={(value) => onVersionsChange([value, newVersionId])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  Version {v.versionNumber} -{' '}
                  {format(new Date(v.createdAt), 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <ArrowRight className="h-5 w-5 text-gray-400" />

        <div className="flex-1">
          <label className="text-sm font-medium text-gray-500">To</label>
          <Select
            value={newVersionId}
            onValueChange={(value) => onVersionsChange([oldVersionId, value])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  Version {v.versionNumber} -{' '}
                  {format(new Date(v.createdAt), 'MMM d, yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Diff stats */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Changes:</span>
        </div>
        <Badge variant="success" className="bg-green-100 text-green-800">
          +{stats.added} additions
        </Badge>
        <Badge variant="destructive" className="bg-red-100 text-red-800">
          -{stats.removed} deletions
        </Badge>
      </div>

      {/* Diff view */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-4 py-2 border-b text-sm font-medium">
          Diff View
        </div>
        <div className="p-4 font-mono text-sm whitespace-pre-wrap">
          {diff.map((part, index) => (
            <span
              key={index}
              className={
                part.added
                  ? 'bg-green-100 text-green-800'
                  : part.removed
                  ? 'bg-red-100 text-red-800 line-through'
                  : ''
              }
            >
              {part.value}
            </span>
          ))}
        </div>
      </div>

      {/* Version notes */}
      {newVersion?.changeNotes && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-1">Change Notes</h4>
          <p className="text-blue-800">{newVersion.changeNotes}</p>
        </div>
      )}
    </div>
  );
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || '';
}
```

### Contract Signing API

```tsx
// app/api/contracts/[id]/sign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createHash } from 'crypto';
import { generateSignedPDF } from '@/lib/pdf';
import { uploadToS3 } from '@/lib/storage';
import { sendSignatureConfirmation } from '@/lib/email';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const { signingToken, signatureImage, signatureType } = body;

  // Find signer by token
  const signer = await prisma.contractSigner.findUnique({
    where: { signingToken },
    include: {
      contract: {
        include: {
          signers: true,
          organization: true,
        },
      },
    },
  });

  if (!signer) {
    return NextResponse.json({ error: 'Invalid signing token' }, { status: 404 });
  }

  if (signer.status === 'SIGNED') {
    return NextResponse.json({ error: 'Already signed' }, { status: 400 });
  }

  if (signer.tokenExpiresAt && new Date(signer.tokenExpiresAt) < new Date()) {
    return NextResponse.json({ error: 'Signing link expired' }, { status: 400 });
  }

  // Get document hash for verification
  const documentHash = createHash('sha256')
    .update(signer.contract.content)
    .digest('hex');

  // Create signature record
  const signature = await prisma.signature.create({
    data: {
      signerId: signer.id,
      contractId: signer.contractId,
      signatureImage,
      signatureType: signatureType.toUpperCase(),
      ipAddress: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent'),
      hash: documentHash,
    },
  });

  // Update signer status
  await prisma.contractSigner.update({
    where: { id: signer.id },
    data: { status: 'SIGNED' },
  });

  // Check if all signers have signed
  const allSigned = signer.contract.signers.every(
    (s) => s.id === signer.id || s.status === 'SIGNED'
  );

  if (allSigned) {
    // Generate final signed PDF
    const pdfBuffer = await generateSignedPDF(signer.contract.id);

    // Upload to S3
    const pdfUrl = await uploadToS3(
      pdfBuffer,
      `contracts/${signer.contract.id}/signed-contract.pdf`,
      'application/pdf'
    );

    // Update contract status
    await prisma.contract.update({
      where: { id: signer.contract.id },
      data: {
        status: 'SIGNED',
        documentUrl: pdfUrl,
      },
    });

    // Send confirmation to all signers
    for (const s of signer.contract.signers) {
      await sendSignatureConfirmation(s.email, signer.contract, pdfUrl);
    }
  } else {
    // Update to partially signed
    await prisma.contract.update({
      where: { id: signer.contract.id },
      data: { status: 'PARTIALLY_SIGNED' },
    });

    // Notify next signer
    const nextSigner = signer.contract.signers.find(
      (s) => s.status === 'PENDING' || s.status === 'SENT'
    );

    if (nextSigner) {
      await sendSigningRequest(nextSigner, signer.contract);
    }
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      organizationId: signer.contract.organizationId,
      contractId: signer.contract.id,
      action: 'signature.completed',
      entityType: 'signature',
      entityId: signature.id,
      metadata: {
        signerName: signer.name,
        signerEmail: signer.email,
        signatureType,
        allSigned,
      },
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    },
  });

  return NextResponse.json({
    success: true,
    allSigned,
    message: allSigned
      ? 'Contract fully executed'
      : 'Signature recorded. Waiting for other signers.',
  });
}

async function sendSigningRequest(signer: any, contract: any) {
  // Send email with signing link
  const signingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign/${signer.signingToken}`;

  // Implementation for sending email
}
```

## Testing

### Unit Tests

```tsx
// __tests__/lib/contracts.test.ts
import { describe, it, expect, vi } from 'vitest';
import {
  validateMergeFields,
  applyMergeFields,
  generateContractNumber,
} from '@/lib/contracts';

describe('validateMergeFields', () => {
  it('returns true when all required fields are provided', () => {
    const template = {
      mergeFields: [
        { name: 'client_name', required: true },
        { name: 'contract_date', required: true },
        { name: 'notes', required: false },
      ],
    };

    const data = {
      client_name: 'Acme Corp',
      contract_date: '2024-01-15',
    };

    expect(validateMergeFields(template, data)).toEqual({ valid: true, missing: [] });
  });

  it('returns missing required fields', () => {
    const template = {
      mergeFields: [
        { name: 'client_name', required: true },
        { name: 'amount', required: true },
      ],
    };

    const data = {
      client_name: 'Acme Corp',
    };

    expect(validateMergeFields(template, data)).toEqual({
      valid: false,
      missing: ['amount'],
    });
  });
});

describe('applyMergeFields', () => {
  it('replaces merge field placeholders with values', () => {
    const content = 'This agreement is between {{client_name}} and {{company_name}}.';
    const data = {
      client_name: 'Acme Corp',
      company_name: 'Our Company Inc.',
    };

    const result = applyMergeFields(content, data);
    expect(result).toBe('This agreement is between Acme Corp and Our Company Inc.');
  });

  it('handles missing values gracefully', () => {
    const content = 'Amount: {{amount}}';
    const data = {};

    const result = applyMergeFields(content, data);
    expect(result).toBe('Amount: {{amount}}');
  });
});

describe('generateContractNumber', () => {
  it('generates sequential contract numbers', () => {
    expect(generateContractNumber('CONTRACT', 1)).toBe('CONTRACT-0001');
    expect(generateContractNumber('CONTRACT', 42)).toBe('CONTRACT-0042');
    expect(generateContractNumber('NDA', 100)).toBe('NDA-0100');
  });
});
```

### E2E Tests

```tsx
// e2e/contracts.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Contract Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/');
  });

  test('creates a new contract from template', async ({ page }) => {
    await page.goto('/contracts/new');

    // Select template
    await page.click('[data-testid="template-selector"]');
    await page.click('text=Non-Disclosure Agreement');

    // Fill merge fields
    await page.fill('[data-testid="field-client_name"]', 'Test Client');
    await page.fill('[data-testid="field-effective_date"]', '2024-03-01');

    // Create contract
    await page.click('[data-testid="create-contract"]');

    // Verify redirect
    await expect(page).toHaveURL(/\/contracts\/[\w-]+/);
  });

  test('adds signers and sends for signature', async ({ page }) => {
    await page.goto('/contracts/test-contract-id');

    // Add signer
    await page.click('[data-testid="add-signer"]');
    await page.fill('[data-testid="signer-name"]', 'John Doe');
    await page.fill('[data-testid="signer-email"]', 'john@example.com');
    await page.click('[data-testid="save-signer"]');

    // Send for signature
    await page.click('[data-testid="send-for-signature"]');

    // Verify status change
    await expect(page.locator('[data-testid="contract-status"]')).toContainText(
      'Pending Signature'
    );
  });

  test('completes signature flow', async ({ page }) => {
    // Go to signing page
    await page.goto('/sign/test-signing-token');

    // Draw signature
    const canvas = page.locator('[data-testid="signature-canvas"]');
    await canvas.click({ position: { x: 100, y: 50 } });

    // Apply signature
    await page.click('[data-testid="apply-signature"]');

    // Confirm
    await page.click('[data-testid="confirm-signature"]');

    // Verify success
    await expect(page.locator('[data-testid="signature-success"]')).toBeVisible();
  });
});
```

## Error Handling

### Error Boundary

```tsx
// app/contracts/[id]/error.tsx
'use client';

import { useEffect } from 'react';
import { FileX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import * as Sentry from '@sentry/nextjs';

export default function ContractError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { component: 'contract' },
    });
  }, [error]);

  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center max-w-md">
        <FileX className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Unable to Load Contract</h2>
        <p className="text-gray-600 mb-4">
          {error.message || 'An error occurred while loading the contract.'}
        </p>
        <div className="flex gap-2 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <a href="/contracts">Back to Contracts</a>
          </Button>
        </div>
      </div>
    </div>
  );
}
```

## Accessibility

### WCAG Compliance

```tsx
// components/contracts/contract-status.tsx
export function ContractStatus({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string; icon: ReactNode }> = {
    DRAFT: { label: 'Draft', color: 'gray', icon: <FileText /> },
    PENDING_SIGNATURE: { label: 'Pending Signature', color: 'yellow', icon: <Clock /> },
    SIGNED: { label: 'Signed', color: 'green', icon: <CheckCircle /> },
    // ...
  };

  const config = statusConfig[status];

  return (
    <Badge
      role="status"
      aria-label={`Contract status: ${config.label}`}
      className={`bg-${config.color}-100 text-${config.color}-800`}
    >
      <span className="flex items-center gap-1">
        {config.icon}
        {config.label}
      </span>
    </Badge>
  );
}
```

## Security

### Document Encryption

```tsx
// lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export async function encryptDocument(
  content: string,
  masterKey: string
): Promise<{ encrypted: string; key: string }> {
  // Generate document-specific key
  const documentKey = randomBytes(KEY_LENGTH);
  const iv = randomBytes(IV_LENGTH);

  // Encrypt content
  const cipher = createCipheriv(ALGORITHM, documentKey, iv);
  let encrypted = cipher.update(content, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  // Combine IV + authTag + encrypted
  const combined = Buffer.concat([
    iv,
    authTag,
    Buffer.from(encrypted, 'base64'),
  ]).toString('base64');

  // Encrypt document key with master key
  const derivedKey = (await scryptAsync(masterKey, 'salt', KEY_LENGTH)) as Buffer;
  const keyIv = randomBytes(IV_LENGTH);
  const keyCipher = createCipheriv(ALGORITHM, derivedKey, keyIv);
  let encryptedKey = keyCipher.update(documentKey);
  encryptedKey = Buffer.concat([encryptedKey, keyCipher.final()]);
  const keyAuthTag = keyCipher.getAuthTag();

  const combinedKey = Buffer.concat([keyIv, keyAuthTag, encryptedKey]).toString('base64');

  return { encrypted: combined, key: combinedKey };
}

export async function decryptDocument(
  encrypted: string,
  encryptedKey: string,
  masterKey: string
): Promise<string> {
  // Decrypt document key
  const keyBuffer = Buffer.from(encryptedKey, 'base64');
  const keyIv = keyBuffer.subarray(0, IV_LENGTH);
  const keyAuthTag = keyBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encKeyData = keyBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const derivedKey = (await scryptAsync(masterKey, 'salt', KEY_LENGTH)) as Buffer;
  const keyDecipher = createDecipheriv(ALGORITHM, derivedKey, keyIv);
  keyDecipher.setAuthTag(keyAuthTag);
  const documentKey = Buffer.concat([
    keyDecipher.update(encKeyData),
    keyDecipher.final(),
  ]);

  // Decrypt content
  const contentBuffer = Buffer.from(encrypted, 'base64');
  const iv = contentBuffer.subarray(0, IV_LENGTH);
  const authTag = contentBuffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const encData = contentBuffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, documentKey, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encData, undefined, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

## Performance

### Document Caching

```tsx
// lib/cache.ts
import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';

export const getCachedContract = unstable_cache(
  async (contractId: string) => {
    return prisma.contract.findUnique({
      where: { id: contractId },
      include: {
        signers: true,
        versions: { orderBy: { versionNumber: 'desc' }, take: 5 },
        approvals: { include: { approver: true, step: true } },
      },
    });
  },
  ['contract'],
  { revalidate: 60, tags: ['contracts'] }
);

export const getCachedTemplates = unstable_cache(
  async (organizationId: string) => {
    return prisma.template.findMany({
      where: { organizationId, isActive: true },
      orderBy: { name: 'asc' },
    });
  },
  ['templates'],
  { revalidate: 300, tags: ['templates'] }
);
```

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:unit
      - run: pnpm test:integration

  e2e:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e

  deploy:
    runs-on: ubuntu-latest
    needs: [test, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## Monitoring

### Audit Logging

```tsx
// lib/audit.ts
import { prisma } from '@/lib/prisma';
import { getCurrentUser, getCurrentOrganization } from '@/lib/auth';
import { headers } from 'next/headers';

export async function logAuditEvent(
  action: string,
  entityType: string,
  entityId?: string,
  changes?: Record<string, any>,
  metadata?: Record<string, any>
) {
  const user = await getCurrentUser();
  const org = await getCurrentOrganization();
  const headersList = await headers();

  if (!org) return;

  await prisma.auditLog.create({
    data: {
      organizationId: org.id,
      userId: user?.id,
      action,
      entityType,
      entityId,
      changes,
      metadata,
      ipAddress: headersList.get('x-forwarded-for') || undefined,
      userAgent: headersList.get('user-agent') || undefined,
    },
  });
}

// Usage
await logAuditEvent(
  'contract.created',
  'contract',
  contract.id,
  null,
  { templateId: contract.templateId }
);
```

## Environment Variables

```bash
# .env.example

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/contracts"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# DocuSign (optional)
DOCUSIGN_INTEGRATION_KEY="your-integration-key"
DOCUSIGN_SECRET_KEY="your-secret-key"
DOCUSIGN_ACCOUNT_ID="your-account-id"
DOCUSIGN_BASE_URL="https://demo.docusign.net/restapi"

# Storage (S3)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="contracts-bucket"

# Encryption
DOCUMENT_ENCRYPTION_KEY="your-32-byte-encryption-key"

# Email
RESEND_API_KEY="re_xxx"
EMAIL_FROM="contracts@yourdomain.com"

# Monitoring
NEXT_PUBLIC_SENTRY_DSN="https://xxx@sentry.io/xxx"

# App
NEXT_PUBLIC_APP_URL="https://contracts.yourdomain.com"
```

## Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] DocuSign integration configured (if using)
- [ ] S3 bucket configured with proper permissions
- [ ] Encryption keys securely stored
- [ ] Email templates configured
- [ ] Audit logging enabled
- [ ] SSL certificate configured

## Related Recipes

- [r-document-management](./document-management.md) - General document management
- [r-approval-workflows](./approval-workflows.md) - Advanced workflow patterns
- [r-e-signatures](./e-signatures.md) - E-signature integration

## Changelog

### v3.0.0 (2025-01-18)
- Initial contract management recipe with versioning, e-signatures, and workflows
