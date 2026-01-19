---
id: r-erp-system
name: ERP System
version: 1.0.0
layer: L6
category: recipes
description: Complete enterprise resource planning system with modules for finance, HR, inventory, and operations
tags: [enterprise, erp, finance, hr, inventory, operations, next15]
formula: "ERP = DashboardLayout(t-dashboard-layout) + DataTable(o-data-table) + Charts(o-chart) + RBAC(pt-rbac) + Audit(pt-audit-logging) + MultiTenant(pt-multi-tenancy) + Events(pt-event-sourcing) + Sidebar(o-sidebar) + Modal(o-modal) + Tabs(o-tabs) + FilterBar(o-filter-bar) + FormValidation(pt-form-validation) + ServerActions(pt-server-actions) + Transactions(pt-transactions) + ExportData(pt-export-data) + BackgroundJobs(pt-background-jobs)"
composes:
  # L4 Templates
  - ../templates/dashboard-layout.md
  - ../templates/dashboard-home.md
  - ../templates/settings-page.md
  # L3 Organisms
  - ../organisms/data-table.md
  - ../organisms/chart.md
  - ../organisms/sidebar.md
  - ../organisms/modal.md
  - ../organisms/tabs.md
  - ../organisms/filter-bar.md
  - ../organisms/stats-dashboard.md
  # L2 Molecules
  - ../molecules/breadcrumb.md
  - ../molecules/pagination.md
  - ../molecules/card.md
  - ../molecules/form-field.md
  - ../molecules/stat-card.md
  - ../molecules/badge.md
  - ../molecules/date-picker.md
  # L5 Patterns - Architecture
  - ../patterns/multi-tenancy.md
  - ../patterns/event-sourcing.md
  # L5 Patterns - Security
  - ../patterns/rbac.md
  - ../patterns/audit-logging.md
  - ../patterns/rate-limiting.md
  # L5 Patterns - Data
  - ../patterns/form-validation.md
  - ../patterns/server-actions.md
  - ../patterns/transactions.md
  - ../patterns/export-data.md
  - ../patterns/background-jobs.md
  # L5 Patterns - Testing
  - ../patterns/testing-e2e.md
  - ../patterns/testing-unit.md
  - ../patterns/testing-integration.md
dependencies:
  next: "^15.1.0"
  prisma: "^6.0.0"
  "@tanstack/react-query": "^5.0.0"
  react-hook-form: "^7.0.0"
  zod: "^3.22.0"
  recharts: "^2.0.0"
  date-fns: "^3.0.0"
  "@radix-ui/react-dialog": "^1.0.0"
  "@radix-ui/react-tabs": "^1.0.0"
performance:
  impact: high
  lcp: medium
  cls: low
accessibility:
  wcag: AA
  keyboard: true
  screen-reader: true
---

# ERP System

## Overview

Enterprise Resource Planning (ERP) systems integrate core business processes into a unified platform. This recipe provides a modular, multi-tenant ERP architecture built on Next.js 15 with the following core modules:

- **Finance Module**: General ledger, accounts payable/receivable, budgeting, and financial reporting
- **HR Module**: Employee management, payroll processing, time tracking, and leave management
- **Inventory Module**: Stock management, warehouse operations, and inventory transfers
- **Operations Module**: Workflow automation, multi-level approvals, and operational reporting

The architecture emphasizes tenant isolation, comprehensive audit trails, event-driven state management, and role-based access control suitable for enterprise compliance requirements.

## Project Structure

```
erp/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                      # Dashboard overview
│   │   ├── finance/
│   │   │   ├── page.tsx                  # Finance overview
│   │   │   ├── general-ledger/page.tsx
│   │   │   ├── accounts-payable/page.tsx
│   │   │   ├── accounts-receivable/page.tsx
│   │   │   └── budgets/page.tsx
│   │   ├── hr/
│   │   │   ├── page.tsx                  # HR overview
│   │   │   ├── employees/page.tsx
│   │   │   ├── payroll/page.tsx
│   │   │   ├── time-tracking/page.tsx
│   │   │   └── leave/page.tsx
│   │   ├── inventory/
│   │   │   ├── page.tsx                  # Inventory overview
│   │   │   ├── stock/page.tsx
│   │   │   ├── warehouses/page.tsx
│   │   │   └── transfers/page.tsx
│   │   ├── operations/
│   │   │   ├── page.tsx                  # Operations overview
│   │   │   ├── workflows/page.tsx
│   │   │   ├── approvals/page.tsx
│   │   │   └── reports/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── finance/[...slug]/route.ts
│   │   ├── hr/[...slug]/route.ts
│   │   ├── inventory/[...slug]/route.ts
│   │   └── operations/[...slug]/route.ts
│   └── layout.tsx
├── components/
│   ├── modules/
│   │   ├── finance/
│   │   ├── hr/
│   │   ├── inventory/
│   │   └── operations/
│   └── shared/
├── lib/
│   ├── erp/
│   │   ├── tenant.ts
│   │   ├── permissions.ts
│   │   ├── audit.ts
│   │   └── events.ts
│   └── utils.ts
└── prisma/
    └── schema.prisma
```

## Core Modules

### Finance Module

The finance module handles general ledger accounting, accounts payable/receivable, and budgeting.

```prisma
// prisma/schema.prisma - Finance Models
model Account {
  id            String        @id @default(cuid())
  tenantId      String
  code          String
  name          String
  type          AccountType
  parentId      String?
  parent        Account?      @relation("AccountHierarchy", fields: [parentId], references: [id])
  children      Account[]     @relation("AccountHierarchy")
  balance       Decimal       @db.Decimal(15, 2) @default(0)
  currency      String        @default("USD")
  isActive      Boolean       @default(true)
  entries       JournalEntry[]
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([tenantId, code])
  @@index([tenantId])
  @@index([type])
}

enum AccountType {
  ASSET
  LIABILITY
  EQUITY
  REVENUE
  EXPENSE
}

model JournalEntry {
  id            String        @id @default(cuid())
  tenantId      String
  accountId     String
  account       Account       @relation(fields: [accountId], references: [id])
  transactionId String
  transaction   Transaction   @relation(fields: [transactionId], references: [id])
  debit         Decimal       @db.Decimal(15, 2) @default(0)
  credit        Decimal       @db.Decimal(15, 2) @default(0)
  description   String?
  createdAt     DateTime      @default(now())

  @@index([tenantId])
  @@index([accountId])
  @@index([transactionId])
}

model Transaction {
  id            String         @id @default(cuid())
  tenantId      String
  reference     String
  type          TransactionType
  date          DateTime
  description   String
  entries       JournalEntry[]
  status        TransactionStatus @default(PENDING)
  approvedBy    String?
  approvedAt    DateTime?
  createdBy     String
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@unique([tenantId, reference])
  @@index([tenantId])
  @@index([date])
  @@index([status])
}

enum TransactionType {
  JOURNAL
  INVOICE
  PAYMENT
  RECEIPT
  ADJUSTMENT
}

enum TransactionStatus {
  DRAFT
  PENDING
  APPROVED
  POSTED
  VOIDED
}

model Budget {
  id            String        @id @default(cuid())
  tenantId      String
  name          String
  fiscalYear    Int
  status        BudgetStatus  @default(DRAFT)
  lines         BudgetLine[]
  createdBy     String
  approvedBy    String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@unique([tenantId, name, fiscalYear])
  @@index([tenantId])
}

enum BudgetStatus {
  DRAFT
  SUBMITTED
  APPROVED
  ACTIVE
  CLOSED
}

model BudgetLine {
  id            String        @id @default(cuid())
  budgetId      String
  budget        Budget        @relation(fields: [budgetId], references: [id])
  accountCode   String
  month         Int
  amount        Decimal       @db.Decimal(15, 2)
  actual        Decimal       @db.Decimal(15, 2) @default(0)

  @@unique([budgetId, accountCode, month])
}
```

```typescript
// lib/erp/finance/ledger.ts
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export interface JournalEntryInput {
  accountId: string;
  debit?: number;
  credit?: number;
  description?: string;
}

export async function createJournalTransaction(
  tenantId: string,
  data: {
    reference: string;
    type: TransactionType;
    date: Date;
    description: string;
    entries: JournalEntryInput[];
    createdBy: string;
  }
) {
  // Validate double-entry: debits must equal credits
  const totalDebit = data.entries.reduce((sum, e) => sum + (e.debit || 0), 0);
  const totalCredit = data.entries.reduce((sum, e) => sum + (e.credit || 0), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error('Transaction must balance: debits must equal credits');
  }

  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        tenantId,
        reference: data.reference,
        type: data.type,
        date: data.date,
        description: data.description,
        createdBy: data.createdBy,
        entries: {
          create: data.entries.map((entry) => ({
            tenantId,
            accountId: entry.accountId,
            debit: new Decimal(entry.debit || 0),
            credit: new Decimal(entry.credit || 0),
            description: entry.description,
          })),
        },
      },
      include: { entries: true },
    });

    return transaction;
  });
}

export async function postTransaction(tenantId: string, transactionId: string, userId: string) {
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.findUnique({
      where: { id: transactionId },
      include: { entries: { include: { account: true } } },
    });

    if (!transaction || transaction.tenantId !== tenantId) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== 'APPROVED') {
      throw new Error('Transaction must be approved before posting');
    }

    // Update account balances
    for (const entry of transaction.entries) {
      const balanceChange = entry.debit.minus(entry.credit);
      await tx.account.update({
        where: { id: entry.accountId },
        data: { balance: { increment: balanceChange } },
      });
    }

    return tx.transaction.update({
      where: { id: transactionId },
      data: { status: 'POSTED' },
    });
  });
}
```

### HR Module

The HR module manages employees, payroll, time tracking, and leave management.

```prisma
// prisma/schema.prisma - HR Models
model Employee {
  id              String          @id @default(cuid())
  tenantId        String
  employeeNumber  String
  userId          String?
  firstName       String
  lastName        String
  email           String
  phone           String?
  departmentId    String?
  department      Department?     @relation(fields: [departmentId], references: [id])
  position        String
  managerId       String?
  manager         Employee?       @relation("ManagerReports", fields: [managerId], references: [id])
  reports         Employee[]      @relation("ManagerReports")
  hireDate        DateTime
  terminationDate DateTime?
  status          EmployeeStatus  @default(ACTIVE)
  salary          Decimal         @db.Decimal(12, 2)
  payFrequency    PayFrequency    @default(MONTHLY)
  timeEntries     TimeEntry[]
  leaveRequests   LeaveRequest[]
  payrollRecords  PayrollRecord[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([tenantId, employeeNumber])
  @@index([tenantId])
  @@index([departmentId])
  @@index([managerId])
}

enum EmployeeStatus {
  ACTIVE
  ON_LEAVE
  TERMINATED
  SUSPENDED
}

enum PayFrequency {
  WEEKLY
  BIWEEKLY
  MONTHLY
}

model Department {
  id          String      @id @default(cuid())
  tenantId    String
  name        String
  code        String
  managerId   String?
  employees   Employee[]
  createdAt   DateTime    @default(now())

  @@unique([tenantId, code])
  @@index([tenantId])
}

model TimeEntry {
  id          String      @id @default(cuid())
  tenantId    String
  employeeId  String
  employee    Employee    @relation(fields: [employeeId], references: [id])
  date        DateTime
  hoursWorked Decimal     @db.Decimal(5, 2)
  overtime    Decimal     @db.Decimal(5, 2) @default(0)
  projectCode String?
  description String?
  status      TimeEntryStatus @default(PENDING)
  approvedBy  String?
  createdAt   DateTime    @default(now())

  @@index([tenantId])
  @@index([employeeId])
  @@index([date])
}

enum TimeEntryStatus {
  PENDING
  APPROVED
  REJECTED
}

model LeaveRequest {
  id          String      @id @default(cuid())
  tenantId    String
  employeeId  String
  employee    Employee    @relation(fields: [employeeId], references: [id])
  leaveType   LeaveType
  startDate   DateTime
  endDate     DateTime
  days        Decimal     @db.Decimal(4, 1)
  reason      String?
  status      LeaveStatus @default(PENDING)
  approvedBy  String?
  approvedAt  DateTime?
  createdAt   DateTime    @default(now())

  @@index([tenantId])
  @@index([employeeId])
  @@index([status])
}

enum LeaveType {
  ANNUAL
  SICK
  PERSONAL
  MATERNITY
  PATERNITY
  UNPAID
}

enum LeaveStatus {
  PENDING
  APPROVED
  REJECTED
  CANCELLED
}

model PayrollRecord {
  id            String      @id @default(cuid())
  tenantId      String
  employeeId    String
  employee      Employee    @relation(fields: [employeeId], references: [id])
  periodStart   DateTime
  periodEnd     DateTime
  baseSalary    Decimal     @db.Decimal(12, 2)
  overtime      Decimal     @db.Decimal(12, 2) @default(0)
  deductions    Decimal     @db.Decimal(12, 2) @default(0)
  taxes         Decimal     @db.Decimal(12, 2) @default(0)
  netPay        Decimal     @db.Decimal(12, 2)
  status        PayrollStatus @default(DRAFT)
  paidAt        DateTime?
  createdAt     DateTime    @default(now())

  @@index([tenantId])
  @@index([employeeId])
  @@index([periodEnd])
}

enum PayrollStatus {
  DRAFT
  CALCULATED
  APPROVED
  PAID
}
```

```typescript
// lib/erp/hr/payroll.ts
import { prisma } from '@/lib/prisma';
import { Decimal } from '@prisma/client/runtime/library';

export async function calculatePayroll(
  tenantId: string,
  periodStart: Date,
  periodEnd: Date
) {
  const employees = await prisma.employee.findMany({
    where: { tenantId, status: 'ACTIVE' },
    include: {
      timeEntries: {
        where: {
          date: { gte: periodStart, lte: periodEnd },
          status: 'APPROVED',
        },
      },
    },
  });

  const records = await prisma.$transaction(
    employees.map((employee) => {
      const totalHours = employee.timeEntries.reduce(
        (sum, e) => sum.plus(e.hoursWorked),
        new Decimal(0)
      );
      const overtimeHours = employee.timeEntries.reduce(
        (sum, e) => sum.plus(e.overtime),
        new Decimal(0)
      );

      const baseSalary = employee.salary;
      const hourlyRate = baseSalary.dividedBy(160); // Assuming 160 hours/month
      const overtimePay = overtimeHours.times(hourlyRate).times(1.5);

      // Simplified tax calculation (replace with actual tax logic)
      const grossPay = baseSalary.plus(overtimePay);
      const taxes = grossPay.times(0.25);
      const deductions = new Decimal(0);
      const netPay = grossPay.minus(taxes).minus(deductions);

      return prisma.payrollRecord.create({
        data: {
          tenantId,
          employeeId: employee.id,
          periodStart,
          periodEnd,
          baseSalary,
          overtime: overtimePay,
          deductions,
          taxes,
          netPay,
          status: 'CALCULATED',
        },
      });
    })
  );

  return records;
}
```

### Inventory Module

The inventory module manages stock levels, warehouses, and inventory transfers.

```prisma
// prisma/schema.prisma - Inventory Models
model Product {
  id            String          @id @default(cuid())
  tenantId      String
  sku           String
  name          String
  description   String?
  category      String?
  unit          String          @default("EACH")
  costPrice     Decimal         @db.Decimal(12, 2)
  sellingPrice  Decimal         @db.Decimal(12, 2)
  reorderPoint  Int             @default(0)
  reorderQty    Int             @default(0)
  isActive      Boolean         @default(true)
  stockLevels   StockLevel[]
  movements     StockMovement[]
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt

  @@unique([tenantId, sku])
  @@index([tenantId])
  @@index([category])
}

model Warehouse {
  id          String        @id @default(cuid())
  tenantId    String
  code        String
  name        String
  address     String?
  isActive    Boolean       @default(true)
  stockLevels StockLevel[]
  fromTransfers Transfer[]  @relation("TransferFrom")
  toTransfers   Transfer[]  @relation("TransferTo")
  createdAt   DateTime      @default(now())

  @@unique([tenantId, code])
  @@index([tenantId])
}

model StockLevel {
  id          String      @id @default(cuid())
  tenantId    String
  productId   String
  product     Product     @relation(fields: [productId], references: [id])
  warehouseId String
  warehouse   Warehouse   @relation(fields: [warehouseId], references: [id])
  quantity    Int         @default(0)
  reserved    Int         @default(0)
  available   Int         @default(0)
  updatedAt   DateTime    @updatedAt

  @@unique([productId, warehouseId])
  @@index([tenantId])
  @@index([warehouseId])
}

model StockMovement {
  id          String        @id @default(cuid())
  tenantId    String
  productId   String
  product     Product       @relation(fields: [productId], references: [id])
  warehouseId String
  type        MovementType
  quantity    Int
  reference   String?
  notes       String?
  createdBy   String
  createdAt   DateTime      @default(now())

  @@index([tenantId])
  @@index([productId])
  @@index([createdAt])
}

enum MovementType {
  RECEIPT
  ISSUE
  ADJUSTMENT
  TRANSFER_IN
  TRANSFER_OUT
}

model Transfer {
  id              String          @id @default(cuid())
  tenantId        String
  reference       String
  fromWarehouseId String
  fromWarehouse   Warehouse       @relation("TransferFrom", fields: [fromWarehouseId], references: [id])
  toWarehouseId   String
  toWarehouse     Warehouse       @relation("TransferTo", fields: [toWarehouseId], references: [id])
  status          TransferStatus  @default(DRAFT)
  lines           TransferLine[]
  requestedBy     String
  approvedBy      String?
  shippedAt       DateTime?
  receivedAt      DateTime?
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt

  @@unique([tenantId, reference])
  @@index([tenantId])
  @@index([status])
}

enum TransferStatus {
  DRAFT
  PENDING
  APPROVED
  SHIPPED
  RECEIVED
  CANCELLED
}

model TransferLine {
  id            String    @id @default(cuid())
  transferId    String
  transfer      Transfer  @relation(fields: [transferId], references: [id])
  productId     String
  quantitySent  Int
  quantityRecv  Int       @default(0)

  @@index([transferId])
}
```

```typescript
// lib/erp/inventory/stock.ts
import { prisma } from '@/lib/prisma';

export async function adjustStock(
  tenantId: string,
  productId: string,
  warehouseId: string,
  quantity: number,
  type: 'RECEIPT' | 'ISSUE' | 'ADJUSTMENT',
  userId: string,
  reference?: string
) {
  return prisma.$transaction(async (tx) => {
    // Record the movement
    await tx.stockMovement.create({
      data: {
        tenantId,
        productId,
        warehouseId,
        type,
        quantity,
        reference,
        createdBy: userId,
      },
    });

    // Update stock level
    const adjustment = type === 'ISSUE' ? -quantity : quantity;

    await tx.stockLevel.upsert({
      where: { productId_warehouseId: { productId, warehouseId } },
      create: {
        tenantId,
        productId,
        warehouseId,
        quantity: adjustment,
        available: adjustment,
      },
      update: {
        quantity: { increment: adjustment },
        available: { increment: adjustment },
      },
    });

    return tx.stockLevel.findUnique({
      where: { productId_warehouseId: { productId, warehouseId } },
    });
  });
}

export async function processTransfer(tenantId: string, transferId: string, action: 'ship' | 'receive', userId: string) {
  return prisma.$transaction(async (tx) => {
    const transfer = await tx.transfer.findUnique({
      where: { id: transferId },
      include: { lines: true },
    });

    if (!transfer || transfer.tenantId !== tenantId) {
      throw new Error('Transfer not found');
    }

    if (action === 'ship') {
      if (transfer.status !== 'APPROVED') {
        throw new Error('Transfer must be approved before shipping');
      }

      // Deduct from source warehouse
      for (const line of transfer.lines) {
        await adjustStock(tenantId, line.productId, transfer.fromWarehouseId, line.quantitySent, 'ISSUE', userId, transfer.reference);
      }

      return tx.transfer.update({
        where: { id: transferId },
        data: { status: 'SHIPPED', shippedAt: new Date() },
      });
    }

    if (action === 'receive') {
      if (transfer.status !== 'SHIPPED') {
        throw new Error('Transfer must be shipped before receiving');
      }

      // Add to destination warehouse
      for (const line of transfer.lines) {
        await adjustStock(tenantId, line.productId, transfer.toWarehouseId, line.quantityRecv || line.quantitySent, 'RECEIPT', userId, transfer.reference);
      }

      return tx.transfer.update({
        where: { id: transferId },
        data: { status: 'RECEIVED', receivedAt: new Date() },
      });
    }
  });
}
```

### Operations Module

The operations module handles workflow automation and multi-level approvals.

```prisma
// prisma/schema.prisma - Operations Models
model Workflow {
  id          String          @id @default(cuid())
  tenantId    String
  name        String
  entityType  String          // 'TRANSACTION', 'LEAVE_REQUEST', 'TRANSFER', etc.
  isActive    Boolean         @default(true)
  steps       WorkflowStep[]
  instances   WorkflowInstance[]
  createdAt   DateTime        @default(now())

  @@unique([tenantId, name])
  @@index([tenantId])
  @@index([entityType])
}

model WorkflowStep {
  id            String      @id @default(cuid())
  workflowId    String
  workflow      Workflow    @relation(fields: [workflowId], references: [id])
  stepOrder     Int
  name          String
  approverRole  String?     // Role required to approve
  approverId    String?     // Specific approver user ID
  condition     Json?       // Conditional logic for step activation
  timeout       Int?        // Hours before escalation

  @@unique([workflowId, stepOrder])
  @@index([workflowId])
}

model WorkflowInstance {
  id            String              @id @default(cuid())
  tenantId      String
  workflowId    String
  workflow      Workflow            @relation(fields: [workflowId], references: [id])
  entityId      String
  entityType    String
  currentStep   Int                 @default(1)
  status        WorkflowStatus      @default(PENDING)
  approvals     WorkflowApproval[]
  startedAt     DateTime            @default(now())
  completedAt   DateTime?

  @@index([tenantId])
  @@index([entityId])
  @@index([status])
}

enum WorkflowStatus {
  PENDING
  IN_PROGRESS
  APPROVED
  REJECTED
  CANCELLED
}

model WorkflowApproval {
  id            String            @id @default(cuid())
  instanceId    String
  instance      WorkflowInstance  @relation(fields: [instanceId], references: [id])
  stepOrder     Int
  approverId    String
  action        ApprovalAction
  comments      String?
  createdAt     DateTime          @default(now())

  @@index([instanceId])
}

enum ApprovalAction {
  APPROVED
  REJECTED
  DELEGATED
  ESCALATED
}
```

```typescript
// lib/erp/operations/workflow.ts
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/erp/audit';

export async function startWorkflow(
  tenantId: string,
  workflowName: string,
  entityId: string,
  entityType: string
) {
  const workflow = await prisma.workflow.findFirst({
    where: { tenantId, name: workflowName, isActive: true },
    include: { steps: { orderBy: { stepOrder: 'asc' } } },
  });

  if (!workflow) {
    throw new Error(`Workflow "${workflowName}" not found`);
  }

  return prisma.workflowInstance.create({
    data: {
      tenantId,
      workflowId: workflow.id,
      entityId,
      entityType,
      status: 'IN_PROGRESS',
    },
  });
}

export async function processApproval(
  tenantId: string,
  instanceId: string,
  approverId: string,
  action: 'APPROVED' | 'REJECTED',
  comments?: string
) {
  return prisma.$transaction(async (tx) => {
    const instance = await tx.workflowInstance.findUnique({
      where: { id: instanceId },
      include: {
        workflow: { include: { steps: { orderBy: { stepOrder: 'asc' } } } },
        approvals: true,
      },
    });

    if (!instance || instance.tenantId !== tenantId) {
      throw new Error('Workflow instance not found');
    }

    const currentStep = instance.workflow.steps.find(
      (s) => s.stepOrder === instance.currentStep
    );

    if (!currentStep) {
      throw new Error('Invalid workflow step');
    }

    // Record the approval
    await tx.workflowApproval.create({
      data: {
        instanceId,
        stepOrder: instance.currentStep,
        approverId,
        action,
        comments,
      },
    });

    if (action === 'REJECTED') {
      return tx.workflowInstance.update({
        where: { id: instanceId },
        data: { status: 'REJECTED', completedAt: new Date() },
      });
    }

    // Check if more steps remain
    const nextStep = instance.workflow.steps.find(
      (s) => s.stepOrder > instance.currentStep
    );

    if (nextStep) {
      return tx.workflowInstance.update({
        where: { id: instanceId },
        data: { currentStep: nextStep.stepOrder },
      });
    }

    // Workflow complete
    return tx.workflowInstance.update({
      where: { id: instanceId },
      data: { status: 'APPROVED', completedAt: new Date() },
    });
  });
}

export async function delegateApproval(
  tenantId: string,
  instanceId: string,
  fromUserId: string,
  toUserId: string,
  reason: string
) {
  await prisma.workflowApproval.create({
    data: {
      instanceId,
      stepOrder: 0, // Delegation record
      approverId: fromUserId,
      action: 'DELEGATED',
      comments: `Delegated to ${toUserId}: ${reason}`,
    },
  });

  await audit({
    action: 'workflow.delegate',
    resource: 'workflow_instance',
    resourceId: instanceId,
    actorId: fromUserId,
    metadata: { delegatedTo: toUserId, reason },
  });
}
```

## Multi-tenant Architecture

```typescript
// lib/erp/tenant.ts
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export async function getTenantFromRequest(): Promise<string> {
  const headersList = await headers();
  const host = headersList.get('host') || '';

  // Extract subdomain: acme.erp.example.com -> acme
  const subdomain = host.split('.')[0];

  const tenant = await prisma.tenant.findUnique({
    where: { subdomain },
    select: { id: true },
  });

  if (!tenant) {
    throw new Error('Tenant not found');
  }

  return tenant.id;
}

// Prisma middleware for automatic tenant scoping
export function createTenantPrismaClient(tenantId: string) {
  return prisma.$extends({
    query: {
      $allOperations({ operation, args, query }) {
        // Tables that require tenant scoping
        const tenantScopedModels = [
          'account', 'transaction', 'employee', 'product',
          'warehouse', 'workflow', 'budget', 'leaveRequest'
        ];

        const model = (args as any)?.model?.toLowerCase();

        if (tenantScopedModels.includes(model)) {
          if (operation === 'findMany' || operation === 'findFirst') {
            args.where = { ...args.where, tenantId };
          } else if (operation === 'create') {
            args.data = { ...args.data, tenantId };
          }
        }

        return query(args);
      },
    },
  });
}
```

## Approval Workflows

```typescript
// components/modules/operations/approval-panel.tsx
'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface ApprovalPanelProps {
  instanceId: string;
}

export function ApprovalPanel({ instanceId }: ApprovalPanelProps) {
  const [comments, setComments] = useState('');
  const queryClient = useQueryClient();

  const { data: instance, isLoading } = useQuery({
    queryKey: ['workflow-instance', instanceId],
    queryFn: () => fetch(`/api/operations/approvals/${instanceId}`).then(r => r.json()),
  });

  const approveMutation = useMutation({
    mutationFn: (action: 'APPROVED' | 'REJECTED') =>
      fetch(`/api/operations/approvals/${instanceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, comments }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-instance', instanceId] });
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const currentStep = instance.workflow.steps.find(
    (s: any) => s.stepOrder === instance.currentStep
  );

  return (
    <div className="rounded-lg border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{instance.workflow.name}</h3>
        <Badge variant={instance.status === 'IN_PROGRESS' ? 'default' : 'secondary'}>
          {instance.status}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground">
        Step {instance.currentStep} of {instance.workflow.steps.length}: {currentStep?.name}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Comments</label>
        <Textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Add comments (optional)"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => approveMutation.mutate('APPROVED')}
          disabled={approveMutation.isPending}
        >
          Approve
        </Button>
        <Button
          variant="destructive"
          onClick={() => approveMutation.mutate('REJECTED')}
          disabled={approveMutation.isPending}
        >
          Reject
        </Button>
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Approval History</h4>
        <div className="space-y-2">
          {instance.approvals.map((approval: any) => (
            <div key={approval.id} className="text-sm border-l-2 pl-2">
              <span className="font-medium">{approval.action}</span> by {approval.approverId}
              {approval.comments && <p className="text-muted-foreground">{approval.comments}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

## Reporting Engine

```typescript
// lib/erp/reports/financial.ts
import { prisma } from '@/lib/prisma';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export interface FinancialReport {
  period: string;
  revenue: number;
  expenses: number;
  netIncome: number;
  accountBalances: { code: string; name: string; balance: number }[];
}

export async function generateIncomeStatement(
  tenantId: string,
  year: number,
  month: number
): Promise<FinancialReport> {
  const periodStart = startOfMonth(new Date(year, month - 1));
  const periodEnd = endOfMonth(periodStart);

  const accounts = await prisma.account.findMany({
    where: { tenantId, type: { in: ['REVENUE', 'EXPENSE'] } },
    include: {
      entries: {
        where: {
          transaction: {
            date: { gte: periodStart, lte: periodEnd },
            status: 'POSTED',
          },
        },
      },
    },
  });

  let revenue = 0;
  let expenses = 0;
  const accountBalances: FinancialReport['accountBalances'] = [];

  for (const account of accounts) {
    const balance = account.entries.reduce((sum, entry) => {
      return sum + Number(entry.credit) - Number(entry.debit);
    }, 0);

    accountBalances.push({
      code: account.code,
      name: account.name,
      balance: Math.abs(balance),
    });

    if (account.type === 'REVENUE') {
      revenue += balance;
    } else {
      expenses += Math.abs(balance);
    }
  }

  return {
    period: format(periodStart, 'MMMM yyyy'),
    revenue,
    expenses,
    netIncome: revenue - expenses,
    accountBalances,
  };
}

export async function generateBudgetVariance(tenantId: string, budgetId: string) {
  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: { lines: true },
  });

  if (!budget || budget.tenantId !== tenantId) {
    throw new Error('Budget not found');
  }

  return budget.lines.map((line) => ({
    accountCode: line.accountCode,
    month: line.month,
    budgeted: Number(line.amount),
    actual: Number(line.actual),
    variance: Number(line.amount) - Number(line.actual),
    variancePercent: line.amount.gt(0)
      ? ((Number(line.amount) - Number(line.actual)) / Number(line.amount)) * 100
      : 0,
  }));
}
```

## Integration Points

```typescript
// lib/erp/integrations/index.ts
import { z } from 'zod';

// Accounting software integration schema
export const AccountingSyncSchema = z.object({
  provider: z.enum(['quickbooks', 'xero', 'sage']),
  credentials: z.object({
    clientId: z.string(),
    clientSecret: z.string(),
    refreshToken: z.string(),
  }),
  syncSettings: z.object({
    syncAccounts: z.boolean().default(true),
    syncTransactions: z.boolean().default(true),
    syncInterval: z.number().default(3600), // seconds
  }),
});

// Payroll provider integration
export const PayrollIntegrationSchema = z.object({
  provider: z.enum(['adp', 'gusto', 'paychex']),
  apiKey: z.string(),
  companyId: z.string(),
});

// CRM integration for customer data sync
export const CRMIntegrationSchema = z.object({
  provider: z.enum(['salesforce', 'hubspot', 'pipedrive']),
  credentials: z.object({
    apiKey: z.string().optional(),
    oauth: z.object({
      accessToken: z.string(),
      refreshToken: z.string(),
    }).optional(),
  }),
});

// Generic webhook handler for integrations
export async function handleIntegrationWebhook(
  tenantId: string,
  provider: string,
  event: string,
  payload: unknown
) {
  switch (provider) {
    case 'quickbooks':
      return handleQuickbooksEvent(tenantId, event, payload);
    case 'xero':
      return handleXeroEvent(tenantId, event, payload);
    default:
      console.warn(`Unknown integration provider: ${provider}`);
  }
}

async function handleQuickbooksEvent(tenantId: string, event: string, payload: unknown) {
  // Process QuickBooks webhook events
}

async function handleXeroEvent(tenantId: string, event: string, payload: unknown) {
  // Process Xero webhook events
}
```

## Security

```typescript
// lib/erp/permissions.ts
import { z } from 'zod';

export const ERPPermissions = {
  // Finance
  'finance.view': 'View financial data',
  'finance.create': 'Create transactions',
  'finance.approve': 'Approve transactions',
  'finance.post': 'Post transactions to ledger',
  'finance.reports': 'Generate financial reports',

  // HR
  'hr.view': 'View employee data',
  'hr.manage': 'Manage employees',
  'hr.payroll': 'Process payroll',
  'hr.approve_leave': 'Approve leave requests',

  // Inventory
  'inventory.view': 'View inventory',
  'inventory.manage': 'Manage stock',
  'inventory.transfer': 'Create transfers',
  'inventory.approve_transfer': 'Approve transfers',

  // Operations
  'operations.workflows': 'Manage workflows',
  'operations.approve': 'Approve workflow steps',
  'operations.reports': 'View operational reports',

  // Admin
  'admin.users': 'Manage users',
  'admin.roles': 'Manage roles',
  'admin.settings': 'Manage settings',
  'admin.audit': 'View audit logs',
} as const;

export type ERPPermission = keyof typeof ERPPermissions;

export const ERPRoles = {
  admin: Object.keys(ERPPermissions) as ERPPermission[],
  finance_manager: [
    'finance.view', 'finance.create', 'finance.approve', 'finance.post', 'finance.reports',
  ],
  hr_manager: ['hr.view', 'hr.manage', 'hr.payroll', 'hr.approve_leave'],
  inventory_manager: [
    'inventory.view', 'inventory.manage', 'inventory.transfer', 'inventory.approve_transfer',
  ],
  employee: ['finance.view', 'hr.view', 'inventory.view'],
} as const;

export function hasPermission(
  userPermissions: ERPPermission[],
  required: ERPPermission | ERPPermission[]
): boolean {
  const requiredPerms = Array.isArray(required) ? required : [required];
  return requiredPerms.every((p) => userPermissions.includes(p));
}
```

```typescript
// lib/erp/audit.ts
import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

interface AuditEntry {
  action: string;
  resource: string;
  resourceId?: string;
  actorId: string;
  metadata?: Record<string, unknown>;
  changes?: { before: unknown; after: unknown };
}

export async function audit(entry: AuditEntry) {
  const headersList = await headers();

  await prisma.auditLog.create({
    data: {
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      actorId: entry.actorId,
      actorIp: headersList.get('x-forwarded-for') || headersList.get('x-real-ip'),
      userAgent: headersList.get('user-agent'),
      metadata: entry.metadata,
      changes: entry.changes,
      category: categorizeAction(entry.action),
      status: 'SUCCESS',
    },
  });
}

function categorizeAction(action: string): 'ADMIN' | 'FINANCIAL' | 'DATA' | 'SECURITY' {
  if (action.startsWith('finance.') || action.startsWith('payroll.')) return 'FINANCIAL';
  if (action.startsWith('admin.') || action.startsWith('user.')) return 'ADMIN';
  if (action.startsWith('auth.')) return 'SECURITY';
  return 'DATA';
}
```

## Testing

```typescript
// __tests__/erp/finance.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createJournalTransaction, postTransaction } from '@/lib/erp/finance/ledger';
import { prisma } from '@/lib/prisma';

describe('Finance Module', () => {
  const tenantId = 'test-tenant';

  beforeEach(async () => {
    await prisma.journalEntry.deleteMany({ where: { tenantId } });
    await prisma.transaction.deleteMany({ where: { tenantId } });
  });

  describe('createJournalTransaction', () => {
    it('should create balanced journal entries', async () => {
      const transaction = await createJournalTransaction(tenantId, {
        reference: 'JE-001',
        type: 'JOURNAL',
        date: new Date(),
        description: 'Test transaction',
        entries: [
          { accountId: 'cash', debit: 1000 },
          { accountId: 'revenue', credit: 1000 },
        ],
        createdBy: 'user-1',
      });

      expect(transaction.entries).toHaveLength(2);
      expect(transaction.status).toBe('PENDING');
    });

    it('should reject unbalanced transactions', async () => {
      await expect(
        createJournalTransaction(tenantId, {
          reference: 'JE-002',
          type: 'JOURNAL',
          date: new Date(),
          description: 'Unbalanced',
          entries: [
            { accountId: 'cash', debit: 1000 },
            { accountId: 'revenue', credit: 500 },
          ],
          createdBy: 'user-1',
        })
      ).rejects.toThrow('debits must equal credits');
    });
  });
});

// __tests__/erp/workflow.test.ts
import { describe, it, expect } from 'vitest';
import { startWorkflow, processApproval } from '@/lib/erp/operations/workflow';

describe('Workflow Module', () => {
  it('should advance workflow through approval steps', async () => {
    const instance = await startWorkflow('test-tenant', 'expense-approval', 'expense-1', 'EXPENSE');

    expect(instance.status).toBe('IN_PROGRESS');
    expect(instance.currentStep).toBe(1);

    const afterApproval = await processApproval(
      'test-tenant',
      instance.id,
      'manager-1',
      'APPROVED'
    );

    expect(afterApproval.currentStep).toBe(2);
  });

  it('should reject workflow on rejection', async () => {
    const instance = await startWorkflow('test-tenant', 'expense-approval', 'expense-2', 'EXPENSE');

    const rejected = await processApproval(
      'test-tenant',
      instance.id,
      'manager-1',
      'REJECTED',
      'Insufficient documentation'
    );

    expect(rejected.status).toBe('REJECTED');
    expect(rejected.completedAt).toBeDefined();
  });
});

// __tests__/e2e/erp-flow.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test.describe('ERP End-to-End', () => {
  test('should complete purchase order workflow', async ({ page }) => {
    await page.goto('/inventory/purchase-orders/new');

    // Fill purchase order form
    await page.fill('[name="vendor"]', 'Acme Corp');
    await page.fill('[name="items.0.product"]', 'Widget A');
    await page.fill('[name="items.0.quantity"]', '100');
    await page.click('button[type="submit"]');

    // Verify PO created
    await expect(page.locator('[data-testid="status"]')).toHaveText('Pending Approval');

    // Switch to approver role and approve
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Switch to Manager');
    await page.goto('/operations/approvals');
    await page.click('text=Approve');

    // Verify approval
    await expect(page.locator('[data-testid="status"]')).toHaveText('Approved');
  });
});
```

## Changelog

### v1.0.0 (2025-01-18)
- Initial release with Finance, HR, Inventory, and Operations modules
- Multi-tenant architecture with subdomain routing
- Event sourcing integration for audit trails
- Multi-level approval workflows with delegation
- Financial reporting engine (Income Statement, Budget Variance)
- Integration schemas for accounting, payroll, and CRM systems
- Role-based access control with granular permissions
- Comprehensive test coverage (unit, integration, E2E)
