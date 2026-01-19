---
id: pt-certificates
name: Certificate Generation
version: 1.0.0
layer: L5
category: documents
description: PDF certificate generation with templates, dynamic data, and verification
tags: [pdf, certificates, generation, documents, next15]
composes: []
dependencies: []
formula: "Certificates = PDFTemplate + DynamicData + UniqueIdentifier + VerificationSystem"
performance:
  impact: low
  lcp: neutral
  cls: neutral
accessibility:
  wcag: N/A
  keyboard: false
  screen-reader: false
---

# Certificate Generation

## When to Use

- Course completion certificates
- Event attendance certificates
- Achievement awards
- Professional certifications
- Membership credentials

## Composition Diagram

```
Certificate Flow
================

+------------------------------------------+
|  Certificate Template                    |
|  - Layout design                         |
|  - Placeholder fields                    |
|  - Branding elements                     |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Data Population                         |
|  - Recipient name                        |
|  - Date/course info                      |
|  - Unique certificate ID                 |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  PDF Generation                          |
|  - Server-side rendering                 |
|  - High-quality output                   |
|  - QR code for verification              |
+------------------------------------------+
              |
              v
+------------------------------------------+
|  Delivery & Storage                      |
|  - Download link                         |
|  - Email delivery                        |
|  - Cloud storage                         |
+------------------------------------------+
```

## Database Schema

```prisma
// prisma/schema.prisma
model Certificate {
  id           String   @id @default(cuid())
  templateId   String
  template     CertificateTemplate @relation(fields: [templateId], references: [id])
  recipientId  String
  recipient    User     @relation(fields: [recipientId], references: [id])
  recipientName String
  issueDate    DateTime @default(now())
  expiryDate   DateTime?
  metadata     Json     // Course name, instructor, etc.
  pdfUrl       String?
  verificationCode String @unique
  isRevoked    Boolean  @default(false)
  createdAt    DateTime @default(now())

  @@index([recipientId])
  @@index([verificationCode])
}

model CertificateTemplate {
  id          String   @id @default(cuid())
  name        String
  description String?
  htmlContent String   @db.Text
  cssContent  String?  @db.Text
  isActive    Boolean  @default(true)
  certificates Certificate[]
  createdAt   DateTime @default(now())
}
```

## Certificate Service

```typescript
// lib/certificates/generator.ts
import { prisma } from '@/lib/db';
import puppeteer from 'puppeteer';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';
import QRCode from 'qrcode';

interface CertificateData {
  templateId: string;
  recipientId: string;
  recipientName: string;
  metadata: Record<string, any>;
  expiryDate?: Date;
}

export async function generateCertificate(data: CertificateData): Promise<{
  certificate: any;
  pdfUrl: string;
}> {
  const template = await prisma.certificateTemplate.findUnique({
    where: { id: data.templateId },
  });

  if (!template) throw new Error('Template not found');

  // Generate unique verification code
  const verificationCode = nanoid(12).toUpperCase();
  const verificationUrl = `${process.env.NEXT_PUBLIC_URL}/verify/${verificationCode}`;

  // Generate QR code
  const qrCode = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 1,
  });

  // Populate template with data
  const html = populateTemplate(template.htmlContent, {
    ...data.metadata,
    recipientName: data.recipientName,
    issueDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    verificationCode,
    qrCode,
  });

  // Generate PDF
  const pdfBuffer = await generatePDF(html, template.cssContent || '');

  // Upload to blob storage
  const { url: pdfUrl } = await put(
    `certificates/${verificationCode}.pdf`,
    pdfBuffer,
    { access: 'public' }
  );

  // Create database record
  const certificate = await prisma.certificate.create({
    data: {
      templateId: data.templateId,
      recipientId: data.recipientId,
      recipientName: data.recipientName,
      metadata: data.metadata,
      expiryDate: data.expiryDate,
      pdfUrl,
      verificationCode,
    },
  });

  return { certificate, pdfUrl };
}

function populateTemplate(html: string, data: Record<string, any>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (key === 'qrCode') {
      return `<img src="${data.qrCode}" alt="Verification QR Code" />`;
    }
    return data[key] || match;
  });
}

async function generatePDF(html: string, css: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          ${css}
          @page { size: A4 landscape; margin: 0; }
          body { margin: 0; }
        </style>
      </head>
      <body>${html}</body>
    </html>
  `, { waitUntil: 'networkidle0' });

  const pdf = await page.pdf({
    format: 'A4',
    landscape: true,
    printBackground: true,
  });

  await browser.close();

  return Buffer.from(pdf);
}
```

## Certificate Template HTML

```typescript
// lib/certificates/templates/course-completion.ts
export const courseCompletionTemplate = `
<div class="certificate">
  <div class="header">
    <img src="{{logoUrl}}" alt="Logo" class="logo" />
    <h1>Certificate of Completion</h1>
  </div>

  <div class="content">
    <p class="intro">This is to certify that</p>
    <h2 class="recipient">{{recipientName}}</h2>
    <p class="description">has successfully completed the course</p>
    <h3 class="course-name">{{courseName}}</h3>
    <p class="date">on {{issueDate}}</p>
  </div>

  <div class="footer">
    <div class="signature">
      <img src="{{signatureUrl}}" alt="Signature" />
      <p>{{instructorName}}</p>
      <p class="title">Instructor</p>
    </div>

    <div class="verification">
      {{qrCode}}
      <p class="code">ID: {{verificationCode}}</p>
    </div>
  </div>
</div>
`;

export const courseCompletionCSS = `
.certificate {
  width: 297mm;
  height: 210mm;
  padding: 20mm;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  font-family: 'Georgia', serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  border: 10px solid #1a365d;
}

.header { text-align: center; }
.header h1 { font-size: 36pt; color: #1a365d; margin: 0; }
.logo { height: 60px; margin-bottom: 20px; }

.content { text-align: center; }
.intro { font-size: 14pt; color: #4a5568; margin: 0; }
.recipient { font-size: 32pt; color: #1a365d; margin: 10px 0; }
.course-name { font-size: 24pt; color: #2d3748; margin: 10px 0; }
.date { font-size: 12pt; color: #718096; }

.footer {
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: flex-end;
}

.signature { text-align: center; }
.signature img { width: 150px; }
.signature p { margin: 5px 0; }
.signature .title { font-size: 10pt; color: #718096; }

.verification { text-align: center; }
.verification img { width: 100px; }
.verification .code { font-size: 10pt; font-family: monospace; }
`;
```

## Certificate API Endpoint

```typescript
// app/api/certificates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { generateCertificate } from '@/lib/certificates/generator';
import { z } from 'zod';

const createCertificateSchema = z.object({
  templateId: z.string(),
  recipientName: z.string(),
  metadata: z.record(z.any()),
});

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const data = createCertificateSchema.parse(body);

  const { certificate, pdfUrl } = await generateCertificate({
    ...data,
    recipientId: session.user.id,
  });

  return NextResponse.json({ data: { certificate, pdfUrl } }, { status: 201 });
}

// app/api/verify/[code]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
    include: { recipient: { select: { name: true } } },
  });

  if (!certificate) {
    return NextResponse.json({ valid: false, error: 'Certificate not found' });
  }

  if (certificate.isRevoked) {
    return NextResponse.json({ valid: false, error: 'Certificate has been revoked' });
  }

  if (certificate.expiryDate && certificate.expiryDate < new Date()) {
    return NextResponse.json({ valid: false, error: 'Certificate has expired' });
  }

  return NextResponse.json({
    valid: true,
    certificate: {
      recipientName: certificate.recipientName,
      issueDate: certificate.issueDate,
      metadata: certificate.metadata,
    },
  });
}
```

## Verification Page

```typescript
// app/verify/[code]/page.tsx
import { prisma } from '@/lib/db';
import { CheckCircle, XCircle } from 'lucide-react';

export default async function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode: code },
  });

  const isValid = certificate && !certificate.isRevoked &&
    (!certificate.expiryDate || certificate.expiryDate > new Date());

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      {isValid ? (
        <>
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Valid Certificate</h1>
          <p className="text-muted-foreground mb-4">
            This certificate is authentic and valid.
          </p>
          <div className="text-left p-4 bg-muted rounded-lg">
            <p><strong>Recipient:</strong> {certificate.recipientName}</p>
            <p><strong>Issue Date:</strong> {certificate.issueDate.toLocaleDateString()}</p>
            <p><strong>Certificate ID:</strong> {code}</p>
          </div>
        </>
      ) : (
        <>
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Certificate</h1>
          <p className="text-muted-foreground">
            This certificate could not be verified.
          </p>
        </>
      )}
    </div>
  );
}
```

## Anti-patterns

### Don't Generate PDFs on Client

```typescript
// BAD - Client-side PDF generation (limited)
import jsPDF from 'jspdf';
const pdf = new jsPDF();
pdf.text('Certificate', 10, 10);

// GOOD - Server-side with Puppeteer
const pdf = await generatePDF(html, css); // Full HTML/CSS support
```

## Related Skills

- [pdf-generation](./pdf-generation.md)
- [email-templates](./email-templates.md)

---

## Changelog

### 1.0.0 (2025-01-18)
- Initial implementation
- Puppeteer PDF generation
- QR code verification
- Template system
