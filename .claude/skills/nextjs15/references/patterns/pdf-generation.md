---
id: pt-pdf-generation
name: PDF Generation
version: 2.0.0
layer: L5
category: files
description: Generate PDFs from React components with react-pdf or HTML with Puppeteer
tags: [pdf, generation, documents, invoices, reports, export]
composes: []
dependencies:
  @react-pdf/renderer: "^4.1.0"
formula: React-PDF/Puppeteer + Templates + Streaming = Professional Documents
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

- Generating invoices and receipts
- Creating reports from data
- Building downloadable certificates
- Producing printable documents
- Email attachment generation

## Composition Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ PDF Generation Approaches                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Approach 1: React-PDF (Component-based)             │   │
│  │                                                     │   │
│  │ InvoicePDF Component                                │   │
│  │ ├── Document                                        │   │
│  │ │   ├── Page                                        │   │
│  │ │   │   ├── Header (logo, company info)             │   │
│  │ │   │   ├── ItemsTable (products, prices)           │   │
│  │ │   │   └── Footer (totals, terms)                  │   │
│  │ │   └── Page 2... (if needed)                       │   │
│  │ └── renderToBuffer() or renderToStream()            │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Approach 2: Puppeteer (HTML-to-PDF)                 │   │
│  │                                                     │   │
│  │ 1. Render HTML page with data                       │   │
│  │ 2. Launch headless Chrome                           │   │
│  │ 3. Navigate to HTML                                 │   │
│  │ 4. page.pdf({ format: 'A4' })                       │   │
│  │ 5. Return PDF buffer                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

# PDF Generation

Generate PDFs from React components or HTML templates.

## Overview

This pattern covers:
- React-PDF for component-based PDFs
- Puppeteer for HTML-to-PDF conversion
- Invoice and report generation
- Table layouts and pagination
- Fonts and styling
- Background generation
- Streaming large documents

## Implementation

### React-PDF Approach

```bash
npm install @react-pdf/renderer
```

```typescript
// lib/pdf/invoice-pdf.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  renderToStream,
  renderToBuffer,
} from '@react-pdf/renderer';

// Register fonts
Font.register({
  family: 'Inter',
  fonts: [
    { src: '/fonts/Inter-Regular.ttf', fontWeight: 'normal' },
    { src: '/fonts/Inter-Medium.ttf', fontWeight: 'medium' },
    { src: '/fonts/Inter-Bold.ttf', fontWeight: 'bold' },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    color: '#666',
  },
  value: {
    flex: 1,
    color: '#1a1a1a',
  },
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  tableCell: {
    fontSize: 10,
  },
  descriptionCell: {
    flex: 3,
  },
  quantityCell: {
    flex: 1,
    textAlign: 'center',
  },
  priceCell: {
    flex: 1,
    textAlign: 'right',
  },
  totalCell: {
    flex: 1,
    textAlign: 'right',
  },
  totals: {
    marginTop: 20,
    alignItems: 'flex-end',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 4,
  },
  totalLabel: {
    width: 100,
    textAlign: 'right',
    marginRight: 20,
    color: '#666',
  },
  totalValue: {
    width: 80,
    textAlign: 'right',
  },
  grandTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#666',
    fontSize: 9,
  },
});

// Types
interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  company: {
    name: string;
    address: string;
    city: string;
    country: string;
    email: string;
    phone: string;
    logo?: string;
  };
  customer: {
    name: string;
    email: string;
    address: string;
    city: string;
    country: string;
  };
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  currency: string;
  notes?: string;
}

// Invoice PDF Component
export function InvoicePDF({ data }: { data: InvoiceData }) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: data.currency,
    }).format(amount);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {data.company.logo && (
              <Image src={data.company.logo} style={styles.logo} />
            )}
            <Text style={{ marginTop: 8 }}>{data.company.name}</Text>
            <Text style={{ color: '#666' }}>{data.company.address}</Text>
            <Text style={{ color: '#666' }}>
              {data.company.city}, {data.company.country}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.title}>INVOICE</Text>
            <Text style={styles.subtitle}>{data.invoiceNumber}</Text>
          </View>
        </View>

        {/* Bill To & Invoice Details */}
        <View style={{ flexDirection: 'row', marginBottom: 30 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text>{data.customer.name}</Text>
            <Text style={{ color: '#666' }}>{data.customer.email}</Text>
            <Text style={{ color: '#666' }}>{data.customer.address}</Text>
            <Text style={{ color: '#666' }}>
              {data.customer.city}, {data.customer.country}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <View style={styles.row}>
              <Text style={styles.label}>Invoice Date:</Text>
              <Text>{data.invoiceDate}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Due Date:</Text>
              <Text>{data.dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCell, styles.descriptionCell, { fontWeight: 'bold' }]}>
              Description
            </Text>
            <Text style={[styles.tableCell, styles.quantityCell, { fontWeight: 'bold' }]}>
              Qty
            </Text>
            <Text style={[styles.tableCell, styles.priceCell, { fontWeight: 'bold' }]}>
              Price
            </Text>
            <Text style={[styles.tableCell, styles.totalCell, { fontWeight: 'bold' }]}>
              Total
            </Text>
          </View>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.descriptionCell]}>
                {item.description}
              </Text>
              <Text style={[styles.tableCell, styles.quantityCell]}>
                {item.quantity}
              </Text>
              <Text style={[styles.tableCell, styles.priceCell]}>
                {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={[styles.tableCell, styles.totalCell]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax ({data.taxRate}%):</Text>
            <Text style={styles.totalValue}>{formatCurrency(data.tax)}</Text>
          </View>
          <View style={[styles.totalRow, { marginTop: 8 }]}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>Total:</Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatCurrency(data.total)}
            </Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={{ marginTop: 40 }}>
            <Text style={styles.sectionTitle}>Notes:</Text>
            <Text style={{ color: '#666' }}>{data.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Thank you for your business! • {data.company.email} • {data.company.phone}
        </Text>
      </Page>
    </Document>
  );
}

// Generate PDF buffer
export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return renderToBuffer(<InvoicePDF data={data} />);
}

// Generate PDF stream
export async function streamInvoicePDF(data: InvoiceData): Promise<NodeJS.ReadableStream> {
  return renderToStream(<InvoicePDF data={data} />);
}
```

### API Route for PDF Generation

```typescript
// app/api/invoices/[id]/pdf/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { generateInvoicePDF } from '@/lib/pdf/invoice-pdf';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  // Fetch invoice data
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      customer: true,
    },
  });

  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
  }

  // Check access
  if (invoice.userId !== session.user.id) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  // Transform to PDF data format
  const pdfData = {
    invoiceNumber: invoice.number,
    invoiceDate: invoice.date.toLocaleDateString(),
    dueDate: invoice.dueDate.toLocaleDateString(),
    company: {
      name: 'Your Company',
      address: '123 Business Street',
      city: 'San Francisco, CA 94102',
      country: 'United States',
      email: 'billing@company.com',
      phone: '+1 (555) 123-4567',
      logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`,
    },
    customer: {
      name: invoice.customer.name,
      email: invoice.customer.email,
      address: invoice.customer.address || '',
      city: invoice.customer.city || '',
      country: invoice.customer.country || '',
    },
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    taxRate: invoice.taxRate,
    total: invoice.total,
    currency: invoice.currency,
    notes: invoice.notes || undefined,
  };

  // Generate PDF
  const pdfBuffer = await generateInvoicePDF(pdfData);

  // Return PDF response
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`,
      'Cache-Control': 'no-cache',
    },
  });
}
```

### Puppeteer Approach (HTML to PDF)

```bash
npm install puppeteer
```

```typescript
// lib/pdf/html-to-pdf.ts
import puppeteer from 'puppeteer';

interface PDFOptions {
  format?: 'A4' | 'Letter' | 'Legal';
  landscape?: boolean;
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  headerTemplate?: string;
  footerTemplate?: string;
  displayHeaderFooter?: boolean;
  printBackground?: boolean;
}

/**
 * Generate PDF from HTML string
 */
export async function htmlToPDF(
  html: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    await page.setContent(html, {
      waitUntil: 'networkidle0',
    });

    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      landscape: options.landscape || false,
      margin: options.margin || {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm',
      },
      printBackground: options.printBackground ?? true,
      displayHeaderFooter: options.displayHeaderFooter || false,
      headerTemplate: options.headerTemplate,
      footerTemplate: options.footerTemplate,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/**
 * Generate PDF from URL
 */
export async function urlToPDF(
  url: string,
  options: PDFOptions = {}
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      landscape: options.landscape || false,
      margin: options.margin,
      printBackground: options.printBackground ?? true,
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
```

### Report PDF with Tables

```typescript
// lib/pdf/report-pdf.tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 5,
  },
  chart: {
    height: 200,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  statChange: {
    fontSize: 9,
    marginTop: 4,
  },
  positive: {
    color: '#22c55e',
  },
  negative: {
    color: '#ef4444',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 20,
    right: 40,
    fontSize: 9,
    color: '#666',
  },
});

interface ReportData {
  title: string;
  period: string;
  stats: Array<{
    label: string;
    value: string;
    change: number;
  }>;
  tables: Array<{
    title: string;
    headers: string[];
    rows: string[][];
  }>;
}

export function ReportPDF({ data }: { data: ReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{data.title}</Text>
        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 30 }}>
          Report Period: {data.period}
        </Text>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View style={styles.statsGrid}>
            {data.stats.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text
                  style={[
                    styles.statChange,
                    stat.change >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  {stat.change >= 0 ? '↑' : '↓'} {Math.abs(stat.change)}%
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Data Tables */}
        {data.tables.map((table, tableIndex) => (
          <View key={tableIndex} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{table.title}</Text>
            <View
              style={{
                borderWidth: 1,
                borderColor: '#e0e0e0',
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: '#f5f5f5',
                  borderBottomWidth: 1,
                  borderBottomColor: '#e0e0e0',
                }}
              >
                {table.headers.map((header, i) => (
                  <Text
                    key={i}
                    style={{
                      flex: 1,
                      padding: 8,
                      fontWeight: 'bold',
                      fontSize: 9,
                    }}
                  >
                    {header}
                  </Text>
                ))}
              </View>
              {/* Rows */}
              {table.rows.map((row, rowIndex) => (
                <View
                  key={rowIndex}
                  style={{
                    flexDirection: 'row',
                    borderBottomWidth:
                      rowIndex < table.rows.length - 1 ? 1 : 0,
                    borderBottomColor: '#e0e0e0',
                  }}
                >
                  {row.map((cell, cellIndex) => (
                    <Text
                      key={cellIndex}
                      style={{
                        flex: 1,
                        padding: 8,
                        fontSize: 9,
                      }}
                    >
                      {cell}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
}
```

### Background PDF Generation Job

```typescript
// lib/pdf/jobs.ts
import { Queue, Worker } from 'bullmq';
import { generateInvoicePDF } from './invoice-pdf';
import { uploadFile } from '@/lib/storage/service';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email/send';

const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};

interface PDFJobData {
  type: 'invoice' | 'report';
  id: string;
  userId: string;
  sendEmail?: boolean;
  emailTo?: string;
}

export const pdfQueue = new Queue<PDFJobData>('pdf-generation', { connection });

export const pdfWorker = new Worker<PDFJobData>(
  'pdf-generation',
  async (job) => {
    const { type, id, userId, sendEmail: shouldSendEmail, emailTo } = job.data;

    let pdfBuffer: Buffer;
    let filename: string;

    if (type === 'invoice') {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { items: true, customer: true },
      });

      if (!invoice) throw new Error('Invoice not found');

      pdfBuffer = await generateInvoicePDF({
        // ... transform invoice data
      } as any);
      
      filename = `invoice-${invoice.number}.pdf`;
    } else {
      throw new Error(`Unknown PDF type: ${type}`);
    }

    // Upload to storage
    const upload = await uploadFile({
      userId,
      file: pdfBuffer,
      filename,
      contentType: 'application/pdf',
    });

    // Update record with PDF URL
    if (type === 'invoice') {
      await prisma.invoice.update({
        where: { id },
        data: { pdfUrl: upload.url },
      });
    }

    // Send email if requested
    if (shouldSendEmail && emailTo) {
      // Send with attachment
    }

    return { url: upload.url };
  },
  { connection, concurrency: 2 }
);
```

## Anti-patterns

1. **Sync generation** - Use background jobs for complex PDFs
2. **No caching** - Cache generated PDFs when possible
3. **Missing fonts** - Always embed fonts for consistency
4. **Large tables** - Handle pagination for long tables
5. **No streaming** - Stream large PDFs instead of buffering

## Related Skills

- [[file-storage]] - Store generated PDFs
- [[background-jobs]] - Background processing
- [[streaming]] - Stream PDF responses

## Changelog

### 2.0.0 (2025-01-17)
- Standardized to atomic design system v2
- Updated frontmatter schema

### 1.0.0
- Initial PDF generation pattern with React-PDF and Puppeteer
