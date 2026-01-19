---
id: pt-hipaa-compliance
name: HIPAA Compliance
version: 1.0.0
layer: L5
category: compliance
description: Implement HIPAA-compliant data handling for healthcare applications
tags: [hipaa, compliance, healthcare, phi, encryption, audit, next15, react19]
composes: []
dependencies: []
formula: "HIPAA = Encryption + AccessControl + AuditLogs + ConsentManagement + DataRetention"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# HIPAA Compliance

## When to Use

- When building healthcare applications
- For handling Protected Health Information (PHI)
- When storing patient records
- For healthcare provider portals
- When building telehealth applications

## Overview

This pattern implements HIPAA-compliant data handling including encryption at rest and in transit, access control, comprehensive audit logging, and consent management. Note: This is a technical guide; consult legal/compliance experts for full HIPAA compliance.

## PHI Field Encryption

```typescript
// lib/hipaa/encryption.ts
import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const KEY = Buffer.from(process.env.PHI_ENCRYPTION_KEY!, "hex");

export interface EncryptedField {
  iv: string;
  authTag: string;
  data: string;
}

export function encryptPHI(plaintext: string): EncryptedField {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");

  return {
    iv: iv.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
    data: encrypted,
  };
}

export function decryptPHI(encrypted: EncryptedField): string {
  const iv = Buffer.from(encrypted.iv, "base64");
  const authTag = Buffer.from(encrypted.authTag, "base64");

  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted.data, "base64", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

// Tokenization for searchable encrypted fields
export function tokenize(value: string): string {
  const salt = process.env.PHI_TOKEN_SALT!;
  return crypto
    .createHmac("sha256", salt)
    .update(value.toLowerCase())
    .digest("hex");
}
```

## Database Schema with Encryption

```prisma
// prisma/schema.prisma
model Patient {
  id                String   @id @default(cuid())
  // Encrypted PHI fields stored as JSON
  encryptedName     Json     // EncryptedField
  encryptedSSN      Json     // EncryptedField
  encryptedDOB      Json     // EncryptedField
  encryptedAddress  Json     // EncryptedField

  // Tokenized fields for searching
  nameToken         String   @db.VarChar(64)
  ssnToken          String   @unique @db.VarChar(64)

  // Non-PHI fields
  mrn               String   @unique // Medical Record Number
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  records           MedicalRecord[]
  consents          Consent[]
  accessLogs        AuditLog[]
}

model MedicalRecord {
  id              String   @id @default(cuid())
  patientId       String
  patient         Patient  @relation(fields: [patientId], references: [id])

  // Encrypted medical data
  encryptedData   Json     // Full medical record encrypted
  recordType      String   // Type of record (lab, imaging, notes)

  createdById     String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([patientId, recordType])
}

model AuditLog {
  id          String   @id @default(cuid())
  timestamp   DateTime @default(now())
  userId      String
  patientId   String?
  patient     Patient? @relation(fields: [patientId], references: [id])
  action      String   // CREATE, READ, UPDATE, DELETE, EXPORT
  resource    String   // Table/resource accessed
  resourceId  String?
  ipAddress   String
  userAgent   String
  details     Json?    // Additional context

  @@index([timestamp])
  @@index([userId])
  @@index([patientId])
}

model Consent {
  id          String   @id @default(cuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  type        String   // TREATMENT, RESEARCH, MARKETING
  granted     Boolean
  grantedAt   DateTime?
  revokedAt   DateTime?
  documentUrl String?  // Signed consent document

  @@unique([patientId, type])
}
```

## Audit Logging

```typescript
// lib/hipaa/audit.ts
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { auth } from "@/auth";

export type AuditAction = "CREATE" | "READ" | "UPDATE" | "DELETE" | "EXPORT" | "LOGIN" | "LOGOUT";

interface AuditLogParams {
  action: AuditAction;
  resource: string;
  resourceId?: string;
  patientId?: string;
  details?: Record<string, unknown>;
}

export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  const session = await auth();
  const headersList = await headers();

  await prisma.auditLog.create({
    data: {
      userId: session?.user?.id || "anonymous",
      patientId: params.patientId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      ipAddress: headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "unknown",
      userAgent: headersList.get("user-agent") || "unknown",
      details: params.details,
    },
  });
}

// Middleware for automatic audit logging
export function withAuditLog<T extends (...args: any[]) => Promise<any>>(
  action: AuditAction,
  resource: string,
  fn: T
): T {
  return (async (...args: Parameters<T>) => {
    const result = await fn(...args);

    await logAuditEvent({
      action,
      resource,
      resourceId: result?.id,
      patientId: args[0]?.patientId || result?.patientId,
    });

    return result;
  }) as T;
}
```

## Patient Data Service

```typescript
// lib/hipaa/patient-service.ts
import { prisma } from "@/lib/db";
import { encryptPHI, decryptPHI, tokenize } from "./encryption";
import { logAuditEvent } from "./audit";

interface PatientInput {
  name: string;
  ssn: string;
  dateOfBirth: string;
  address: string;
}

interface Patient {
  id: string;
  mrn: string;
  name: string;
  ssn: string;
  dateOfBirth: string;
  address: string;
}

export async function createPatient(data: PatientInput): Promise<Patient> {
  const mrn = generateMRN();

  const patient = await prisma.patient.create({
    data: {
      mrn,
      encryptedName: encryptPHI(data.name),
      encryptedSSN: encryptPHI(data.ssn),
      encryptedDOB: encryptPHI(data.dateOfBirth),
      encryptedAddress: encryptPHI(data.address),
      nameToken: tokenize(data.name),
      ssnToken: tokenize(data.ssn),
    },
  });

  await logAuditEvent({
    action: "CREATE",
    resource: "Patient",
    resourceId: patient.id,
    patientId: patient.id,
  });

  return {
    id: patient.id,
    mrn: patient.mrn,
    name: data.name,
    ssn: maskSSN(data.ssn),
    dateOfBirth: data.dateOfBirth,
    address: data.address,
  };
}

export async function getPatient(id: string): Promise<Patient | null> {
  const patient = await prisma.patient.findUnique({
    where: { id },
  });

  if (!patient) return null;

  await logAuditEvent({
    action: "READ",
    resource: "Patient",
    resourceId: id,
    patientId: id,
  });

  return {
    id: patient.id,
    mrn: patient.mrn,
    name: decryptPHI(patient.encryptedName as any),
    ssn: maskSSN(decryptPHI(patient.encryptedSSN as any)),
    dateOfBirth: decryptPHI(patient.encryptedDOB as any),
    address: decryptPHI(patient.encryptedAddress as any),
  };
}

export async function searchPatientBySSN(ssn: string): Promise<Patient | null> {
  const token = tokenize(ssn);

  const patient = await prisma.patient.findUnique({
    where: { ssnToken: token },
  });

  if (!patient) return null;

  await logAuditEvent({
    action: "READ",
    resource: "Patient",
    resourceId: patient.id,
    patientId: patient.id,
    details: { searchType: "SSN" },
  });

  return {
    id: patient.id,
    mrn: patient.mrn,
    name: decryptPHI(patient.encryptedName as any),
    ssn: maskSSN(ssn),
    dateOfBirth: decryptPHI(patient.encryptedDOB as any),
    address: decryptPHI(patient.encryptedAddress as any),
  };
}

function generateMRN(): string {
  return `MRN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}

function maskSSN(ssn: string): string {
  return `***-**-${ssn.slice(-4)}`;
}
```

## Access Control

```typescript
// lib/hipaa/access-control.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { logAuditEvent } from "./audit";

export type Permission =
  | "patient:read"
  | "patient:write"
  | "patient:delete"
  | "records:read"
  | "records:write"
  | "audit:read";

const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: ["patient:read", "patient:write", "patient:delete", "records:read", "records:write", "audit:read"],
  physician: ["patient:read", "patient:write", "records:read", "records:write"],
  nurse: ["patient:read", "records:read", "records:write"],
  receptionist: ["patient:read", "patient:write"],
  auditor: ["audit:read"],
};

export async function checkAccess(permission: Permission): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  const role = session.user.role as string;
  const permissions = ROLE_PERMISSIONS[role] || [];

  return permissions.includes(permission);
}

export async function requireAccess(permission: Permission): Promise<void> {
  const hasAccess = await checkAccess(permission);

  if (!hasAccess) {
    const session = await auth();
    await logAuditEvent({
      action: "READ",
      resource: "AccessDenied",
      details: { permission, userId: session?.user?.id },
    });

    throw new Error("Access denied");
  }
}

// Check if user has relationship to patient (Break the Glass)
export async function checkPatientRelationship(
  patientId: string
): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // Check if user is assigned to patient's care team
  const assignment = await prisma.careTeamAssignment.findFirst({
    where: {
      patientId,
      providerId: session.user.id,
      active: true,
    },
  });

  return !!assignment;
}

// Break the Glass - emergency access with enhanced logging
export async function breakTheGlass(
  patientId: string,
  reason: string
): Promise<void> {
  const session = await auth();

  await logAuditEvent({
    action: "READ",
    resource: "BreakTheGlass",
    patientId,
    details: {
      reason,
      userId: session?.user?.id,
      acknowledgement: true,
    },
  });
}
```

## Consent Management

```typescript
// lib/hipaa/consent.ts
import { prisma } from "@/lib/db";
import { logAuditEvent } from "./audit";

export type ConsentType = "TREATMENT" | "RESEARCH" | "MARKETING" | "DATA_SHARING";

export async function grantConsent(
  patientId: string,
  type: ConsentType,
  documentUrl?: string
): Promise<void> {
  await prisma.consent.upsert({
    where: { patientId_type: { patientId, type } },
    create: {
      patientId,
      type,
      granted: true,
      grantedAt: new Date(),
      documentUrl,
    },
    update: {
      granted: true,
      grantedAt: new Date(),
      revokedAt: null,
      documentUrl,
    },
  });

  await logAuditEvent({
    action: "CREATE",
    resource: "Consent",
    patientId,
    details: { type, granted: true },
  });
}

export async function revokeConsent(
  patientId: string,
  type: ConsentType
): Promise<void> {
  await prisma.consent.update({
    where: { patientId_type: { patientId, type } },
    data: {
      granted: false,
      revokedAt: new Date(),
    },
  });

  await logAuditEvent({
    action: "UPDATE",
    resource: "Consent",
    patientId,
    details: { type, granted: false },
  });
}

export async function checkConsent(
  patientId: string,
  type: ConsentType
): Promise<boolean> {
  const consent = await prisma.consent.findUnique({
    where: { patientId_type: { patientId, type } },
  });

  return consent?.granted ?? false;
}
```

## Server Action with Compliance

```typescript
// app/actions/patient.ts
"use server";

import { requireAccess } from "@/lib/hipaa/access-control";
import { createPatient, getPatient } from "@/lib/hipaa/patient-service";
import { revalidatePath } from "next/cache";

export async function createPatientAction(formData: FormData) {
  await requireAccess("patient:write");

  const patient = await createPatient({
    name: formData.get("name") as string,
    ssn: formData.get("ssn") as string,
    dateOfBirth: formData.get("dateOfBirth") as string,
    address: formData.get("address") as string,
  });

  revalidatePath("/patients");

  return { success: true, patientId: patient.id };
}

export async function getPatientAction(id: string) {
  await requireAccess("patient:read");
  return getPatient(id);
}
```

## Anti-patterns

### Don't Log PHI in Plain Text

```typescript
// BAD - PHI in logs
console.log(`Created patient: ${patient.name}, SSN: ${patient.ssn}`);

// GOOD - Log only identifiers
console.log(`Created patient with ID: ${patient.id}`);
```

### Don't Skip Audit Logging

```typescript
// BAD - No audit trail
const patient = await prisma.patient.findUnique({ where: { id } });

// GOOD - Always audit PHI access
const patient = await getPatient(id); // Includes audit logging
```

## Related Patterns

- [encryption](./encryption.md)
- [rbac](./rbac.md)
- [logging](./logging.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- PHI encryption
- Audit logging
- Access control
- Consent management
