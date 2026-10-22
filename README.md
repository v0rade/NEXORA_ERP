# NEXORA ERP — Enterprise Resource Planning System

**NEXORA ERP** is a modern, modular, production-ready enterprise resource planning application tailored for small and medium-sized enterprises (SMEs). Built with **Next.js App Router**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **shadcn/ui-inspired primitives**, it delivers an integrated platform for managing sales, purchasing, inventory, finance & double-entry accounting, human resources, and audit intelligence.

---

## 1. System Architecture & Modules

### 🏢 Multi-Tenant Company Isolation & RBAC
- **Strict Tenant Scoping**: All business entities belong strictly to a `Company` through `companyId` foreign keys and server-side authorization filters. Changing URLs or payload IDs cannot access another tenant's records.
- **8 Predefined Corporate Roles**:
  - `SUPER_ADMIN`: Cross-company administration, system configuration, global audits.
  - `COMPANY_ADMIN`: Full administrative control over company operational units.
  - `FINANCE`: General ledger, chart of accounts, journal entries, invoice payment matching, cash flow & P&L reports.
  - `SALES`: Customer directory, quotations, sales order entry, fulfillment dispatch, customer invoicing.
  - `PURCHASING`: Vendor directory, purchase requests, purchase orders, goods receipts, supplier bills.
  - `WAREHOUSE`: Multi-warehouse stock tracking, stock adjustments, inter-warehouse transfers, negative stock guard.
  - `HR`: Employee profiles, departments, job titles, attendance, leave approval workflows.
  - `READ_ONLY`: Full read/audit visibility without mutation privileges.

### 📊 Company Dashboard
- Real database-backed metrics: Total sales, outstanding customer receivables (AR), outstanding supplier payables (AP), total inventory valuation, and low-stock threshold triggers.
- Recharts visualizations: 6-month historical revenue & purchasing trend, revenue vs COGS by product category.
- Recent orders, invoice aging status, and real-time system audit log stream.

### 📦 Products & Inventory Management
- **Product Catalog**: SKU, barcodes, categories, units of measure (UoM), cost price, and selling price.
- **Multi-Warehouse Support**: Default Central Distribution Center (`CDC`) and West Coast Depot (`WCD`).
- **Traceable Movements**: Every receipt, issue, transfer, or adjustment logs movement numbers (`MOV-2026-xxxxx`), unit costs, and references.
- **Data Integrity**: Enforces positive stock balances by default and executes multi-warehouse transfers inside transactional operations.

### 💼 Sales Management & Invoicing
- **Workflow**: `Draft Quotation` → `Confirmed Order` → `Delivery Fulfillment` → `Customer Invoice` → `Payment Settlement`.
- **Financial Precision**: Line-item calculations with discounts, configurable tax rates, and decimal-safe totals.
- **Partial Payments**: Tracks payment balance down to the cent, automatically marking invoices as `PARTIALLY_PAID` or `PAID`.
- **Printable Invoices**: Clean, printable official invoice view formatted for corporate dispatch.

### 🛒 Purchasing & Vendor Management
- **Workflow**: `Purchase Request` → `Purchase Order` → `Goods Receipt` → `Supplier Bill` → `Payment`.
- **Vendor Directory**: Tracks payment terms, credit limits, tax numbers, and remittance bank accounts.
- **Goods Receipts**: Atomic inventory updates triggered upon verifying delivered purchase shipments.

### 🏛️ Finance & Double-Entry Accounting Foundation
- **GAAP Chart of Accounts**: Structured asset, liability, equity, revenue, and expense accounts (`1010` Cash, `1100` AR, `1200` Inventory, `2000` AP, `4000` Revenue, `5000` COGS, etc.).
- **Balanced Journal Entries**: Enforces total debits = total credits before any transaction can be posted.
- **Reversal Workflows**: Immutable posted records with controlled corrective reversal entries.
- **Financial Statements**: Real-time Unadjusted Trial Balance and Net Operating Income summaries.

### 👥 Human Resources & Workforce
- Staff directory with employee IDs, departments, job titles, employment status, and hire dates.
- Interactive time-off leave request submission with manager approval/rejection workflows.

### 📈 Reports & Data Exports
- One-click CSV exports for Sales Ledgers, Inventory Valuations, and General Ledger Accounts.
- Formatted tables with instant browser printing support.

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 6.4 |
| **Design System** | Tailwind CSS v4, Lucide React, Radix UI Primitives |
| **Forms & Validation** | Zod, React Hook Form |
| **Visualizations** | Recharts (Responsive Area & Bar Charts) |
| **Authentication** | Secure JWT Session Tokens (`jose`), Password Hashing (`bcryptjs`) |
| **Testing** | Vitest (Unit & Business Logic), Playwright (E2E) |

---

## 3. Quick Start & Local Setup

### Prerequisites
- Node.js `v20.x` or `v22+` / `v24+`
- npm `v10+`
- (Optional) Docker for running local PostgreSQL container

### 1. Installation
Clone or navigate to the repository and install dependencies:
```bash
cd E:\JIRO_PROJECT\nexora-erp
npm install --legacy-peer-deps
```

### 2. Environment Configuration
Copy the provided environment template:
```bash
copy .env.example .env
```
Ensure `.env` contains:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexora_erp?schema=public"
AUTH_SECRET="nexora-erp-dev-secret-key-at-least-32-chars-long-12345"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Database Initialization (PostgreSQL)
If using Docker, start the bundled PostgreSQL service:
```bash
docker compose up -d
```
Generate Prisma client and apply database migrations:
```bash
npx prisma generate
npx prisma migrate dev --name init
```
Seed the database with comprehensive enterprise demo data:
```bash
npx tsx prisma/seed.ts
```

*(Note: NEXORA ERP includes an embedded resilient data store that allows zero-setup previewing and testing out-of-the-box even before starting external database containers.)*

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 4. Default Demo Accounts

You can test any role directly using the **Interactive Role Switcher** in the top navigation bar, or by signing in with the credentials below:

| Role | Email | Password | Responsibilities |
|---|---|---|---|
| **Super Admin** | `superadmin@nexora.com` | `Password123!` | Full system and multi-company access |
| **Company Admin** | `admin@nexora.com` | `Password123!` | Company-wide operations management |
| **Finance** | `finance@nexora.com` | `Password123!` | Accounts, general ledger, payment matching |
| **Sales** | `sales@nexora.com` | `Password123!` | Customer orders, quotations, invoicing |
| **Purchasing** | `purchasing@nexora.com` | `Password123!` | Procurement, purchase orders, vendor bills |
| **Warehouse** | `warehouse@nexora.com` | `Password123!` | Stock movements, transfers, receipts |
| **Human Resources** | `hr@nexora.com` | `Password123!` | Employees, departments, leave approvals |
| **Read Only** | `readonly@nexora.com` | `Password123!` | Read-only audit access across modules |

---

## 5. Verification & Testing

### Running Unit & Integration Tests (Vitest)
Executes tests for permissions, tenant isolation, stock validation, double-entry accounting, order calculations, and document sequence numbering:
```bash
npm test
```
**Test Results**:
- `tests/permissions.test.ts` (5 tests passed)
- `tests/accounting.test.ts` (5 tests passed)
- `tests/inventory.test.ts` (5 tests passed)
- `tests/sales.test.ts` (5 tests passed)
- `tests/document-sequence.test.ts` (3 tests passed)
- **Total**: 23 / 23 Tests Passed (100%)

### Running End-to-End Tests (Playwright)
```bash
npm run test:e2e
```

### Production Build Verification
```bash
npm run build
```
Generates an optimized Next.js App Router production build across all static and dynamic API routes.

---

## 6. Known Limitations & Future Roadmap
- **Indonesian Tax & Regulatory Compliance**: Tax settings are currently configurable by percentage (e.g., standard 11% PPN). Integration with DJP e-Faktur and local payroll withholding (PPh 21) is intentionally staged as a Phase 2 compliance module once specific tax credentials and certification requirements are supplied.
- **Physical Barcode Scanners**: Barcodes are fully indexed and modeled in the database schema; physical Bluetooth/USB scanner input can be bound to point-of-sale or packing stations in future hardware integrations.
- **Multi-Currency Hedging**: Default company currency is USD/IDR; real-time forex rate synchronization can be extended via external central bank APIs.
