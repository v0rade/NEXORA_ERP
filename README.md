# NEXORA ERP — Enterprise Resource Planning System

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-v6.4-2d3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Vitest](https://img.shields.io/badge/Vitest-23%2F23_Passed-646cff?logo=vitest)](https://vitest.dev/)
[![Vercel Deployed](https://img.shields.io/badge/Vercel-Production_Live-brightgreen?logo=vercel)](https://nexoraerp-mu.vercel.app/)

**NEXORA ERP** is a modern, modular, production-ready enterprise resource planning application tailored for small and medium-sized enterprises (SMEs). Built with **Next.js App Router**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, and **shadcn/ui-inspired primitives**, it provides an integrated platform for managing sales, purchasing, inventory, finance & double-entry accounting, human resources, and business intelligence.

---

## 🌐 Live Production Demo

Aplikasi telah aktif dan dideploy secara global di Vercel:

👉 **Live Demo URL**: [**https://nexoraerp-mu.vercel.app/**](https://nexoraerp-mu.vercel.app/)  
👉 **Login Portal**: [**https://nexoraerp-mu.vercel.app/login**](https://nexoraerp-mu.vercel.app/login)

### 🔑 Demo Accounts by Role:
Anda dapat langsung mencoba semua peran menggunakan **1-Click Quick Demo Login** di halaman login atau menggunakan kredensial berikut:

| Role | Email | Password | Responsibilities & Access Scope |
|---|---|---|---|
| **Super Admin** | `superadmin@nexora.com` | `Password123!` | Akses sistem penuh lintas organisasi & konfigurasi global |
| **Company Admin** | `admin@nexora.com` | `Password123!` | Manajemen penuh seluruh unit operasional perusahaan |
| **Finance** | `finance@nexora.com` | `Password123!` | Chart of Accounts, Jurnal Double-Entry, Faktur & Pelunasan |
| **Sales** | `sales@nexora.com` | `Password123!` | Katalog Pelanggan, Sales Orders, dan Penerbitan Faktur |
| **Purchasing** | `purchasing@nexora.com` | `Password123!` | Purchase Orders, Vendor Directory, dan Tagihan Pemasok |
| **Warehouse** | `warehouse@nexora.com` | `Password123!` | Saldo Multi-Gudang, Transfer Antar Gudang, Pencegahan Stok Negatif |
| **Human Resources** | `hr@nexora.com` | `Password123!` | Direktori Karyawan, Departemen, dan Alur Persetujuan Cuti |
| **Read Only** | `readonly@nexora.com` | `Password123!` | Akses audit & inspeksi data read-only tanpa hak modifikasi |

*(Catatan: Anda juga dapat beralih peran secara instan tanpa perlu logout melalui tombol **[ 🛡️ Role: ... ▼ ]** di topbar kanan atas).*

---

## 🏛️ Penjelasan Lengkap Fitur & Arsitektur Sistem

### 1. 🏢 Multi-Tenant Company Isolation & Role-Based Access Control (RBAC)
- **Isolasi Data Tingkat Perusahaan**: Setiap record (pesanan, produk, stok, faktur, akun akuntansi) terikat secara ketat pada `companyId`. Validasi sisi server (*server-side authorization*) memastikan pengguna tidak dapat mengakses atau memanipulasi data tenant lain melalui manipulasi parameter URL atau payload API.
- **Matrix RBAC Terperinci**: Hak akses didefinisikan secara granular per modul (`dashboard`, `sales`, `purchasing`, `inventory`, `finance`, `hr`, `reports`, `audit`) dan aksi (`view`, `create`, `update`, `delete`, `approve`, `post`, `export`).
- **Autentikasi JWT Aman**: Enkripsi password menggunakan `bcryptjs` dan sesi berbasis HTTP-only cookie dengan token JWT (`jose`).

### 2. 📊 Executive Real-Time Dashboard
- **Database-Backed KPIs**:
  - **Total Gross Sales**: Total penjualan valid dari transaksi tersimpan.
  - **Outstanding Receivables (AR)**: Total piutang pelanggan dari faktur yang belum lunas.
  - **Outstanding Payables (AP)**: Total utang pemasok yang jatuh tempo.
  - **Total Inventory Value**: Nilai total aset persediaan berdasarkan harga pokok (cost price).
  - **Low-Stock Alert**: Peringatan otomatis untuk produk dengan saldo di bawah ambang batas minimum (*reorder point*).
- **Visualisasi Dinamis Recharts**: Grafik area trajektori pendapatan vs pembelian 6 bulan dan grafik batang kontribusi omset per kategori produk.
- **Audit Stream Live**: Riwayat log audit aktivitas transaksi terbaru.

### 3. 💼 Modul Penjualan & Faktur Pelanggan (Sales & Invoicing)
- **Alur Kerja Bisnis Terintegrasi**:  
  `Draft Quotation` → `Confirmed Sales Order` → `Delivery Fulfillment` → `Customer Invoice` → `Payment Recording`.
- **Kalkulasi Finansial Presisi**: Perhitungan matematis subtotal, diskon per baris item, diskon global, tarif pajak, dan total akhir tanpa error pembulatan desimal.
- **Pelunasan Bertahap (Partial Payments)**: Pencatatan pembayaran sebagian dengan pelacakan saldo terutang secara otomatis (`CONFIRMED` → `PARTIALLY_PAID` → `PAID`).
- **Cetak Faktur Resmi**: Modal pratinjau dokumen faktur resmi berstandar korporat dengan rincian kop perusahaan, tanggal jatuh tempo, dan rincian pajak yang siap dicetak ke PDF atau printer fisik.

### 4. 📦 Modul Persediaan & Multi-Gudang (Inventory Management)
- **Katalog Produk Terperinci**: Kode SKU unik, barcode, kategori, satuan ukur (UoM), harga pokok pembelian, dan harga jual patokan.
- **Dukungan Multi-Gudang**: Fasilitas gudang utama *Central Distribution Center* (`CDC`) dan depo regional *West Coast Depot* (`WCD`).
- **Transfer Stok Antar Gudang**: Validasi transaksi transfer stok: melarang transfer ke gudang yang sama dan menolak mutasi jika stok gudang asal tidak mencukupi.
- **Pencegahan Stok Negatif (*Negative Stock Prevention*)**: Secara ketat mencegah saldo inventaris bernilai di bawah nol.
- **Riwayat Mutasi Terlacak (*Traceable Movements*)**: Setiap mutasi fisik (penerimaan, pengeluaran, transfer, penyesuaian) memiliki nomor referensi unik (`MOV-2026-xxxxx`) dan pencatatan nilai biaya satuan.

### 5. 🛒 Modul Pengadaan & Pemasok (Purchasing & Procurement)
- **Alur Kerja Pengadaan**:  
  `Purchase Request` → `Persetujuan` → `Purchase Order` → `Penerimaan Barang (Goods Receipt)` → `Tagihan Pemasok (Bill)` → `Pelunasan`.
- **Direktori Vendor**: Manajemen syarat pembayaran (*payment terms*), NPWP/Tax Number, dan rekening bank pelunasan.
- **Penerimaan Barang Terintegrasi**: Konfirmasi penerimaan barang secara otomatis mengupdate saldo stok fisik di gudang terkait.

### 6. 🏛️ Fondasi Finansial & Akuntansi Double-Entry (GAAP Standard)
- **Bagan Akun (Chart of Accounts)**:
  - `1010 - 1500`: Aset (Kas & Bank, Piutang Usaha, Persediaan Barang, Peralatan Kantor).
  - `2000 - 2100`: Liabilitas (Utang Usaha, Akrual Pajak & Kewajiban).
  - `3000 - 3100`: Ekuitas (Modal Saham, Laba Ditahan).
  - `4000 - 4100`: Pendapatan Operasional & Diskon Penjualan.
  - `5000`: Harga Pokok Penjualan (COGS).
  - `6000 - 6100`: Beban Operasional (Gaji, Fasilitas, Utilitas).
- **Validasi Mutlak Debet = Kredit**: Sistem menolak posting jurnal jika jumlah debet dan kredit tidak seimbang ($\text{Total Debet} \equiv \text{Total Kredit}$).
- **Alur Koreksi (*Reversal Workflow*)**: Entri jurnal yang sudah di-posting bersifat *immutable* (tidak dapat diedit diam-diam), melainkan dikoreksi melalui entri pembalik otomatis (*reversal journal entry*).
- **Neraca Saldo (*Trial Balance*) & Laba Rugi**: Ringkasan posisi keuangan dan laba bersih operasional secara real-time.

### 7. 👥 Modul SDM (Human Resources & Workforce)
- **Direktori Karyawan**: Data profil staf, NIP/Employee Number, departemen, jabatan, dan status kepegawaian (Tetap, Kontrak, Percobaan).
- **Manajemen Cuti & Persetujuan**: Pengajuan cuti tahunan, sakit, atau darurat dengan alur persetujuan langsung oleh HR Manager.

### 8. 📈 Laporan Eksekutif & Ekspor Data
- **Ekspor CSV 1-Klik**:
  - *Sales Orders & Commercial Invoicing Ledger*
  - *Inventory Cost Valuation & Stock on Hand*
  - *General Ledger & Chart of Accounts Balance*
- Kompatibel langsung dengan Microsoft Excel, Google Sheets, dan software analitik pihak ketiga.

### 9. 🛡️ Audit Log Trail
- Pencatatan otomatis setiap tindakan penting (*CREATE*, *UPDATE*, *POST*, *TRANSFER*, *PAYMENT*, *APPROVE*) lengkap dengan stempel waktu, user pelaksana, dan detail perubahan entitas.

---

## 🛠️ Technology Stack

| Layer | Komponen Teknologi |
|---|---|
| **Framework** | Next.js 16 (App Router + Turbopack) |
| **Language** | TypeScript 5.9 (Strict Type Checking) |
| **Database** | PostgreSQL 16 (Neon Serverless / Docker) |
| **ORM** | Prisma ORM 6.4 |
| **Design System** | Tailwind CSS v4, Lucide Icons, Radix UI Primitives |
| **Visualizations** | Recharts (Responsive Area & Bar Charts) |
| **Testing** | Vitest (Unit & Business Logic), Playwright (E2E) |
| **Deployment** | Vercel Serverless Edge Platform |

---

## 🧪 Hasil Pengujian & Verifikasi

### Pengujian Logika Bisnis (Vitest)
```bash
npm test
```
```
 ✓ tests/accounting.test.ts (5 tests)
 ✓ tests/inventory.test.ts (5 tests)
 ✓ tests/document-sequence.test.ts (3 tests)
 ✓ tests/permissions.test.ts (5 tests)
 ✓ tests/sales.test.ts (5 tests)

 Test Files  5 passed (5)
      Tests  23 passed (23)
   Duration  259ms
```
Semua 23 pengujian unit logika bisnis (isolasi tenant, larangan saldo negatif, keakuratan balance jurnal double-entry, kalkulasi diskon & pajak, dan format penomoran dokumen) **lulus 100%**.

---

## 💻 Panduan Menjalankan Secara Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/v0rade/NEXORA_ERP.git
cd NEXORA_ERP
```

### 2. Install Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment
Salin file template `.env.example`:
```bash
copy .env.example .env
```
Isi variabel database PostgreSQL Anda:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexora_erp?schema=public"
AUTH_SECRET="nexora-erp-super-secret-jwt-token-replace-in-production-min32chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Setup Database & Jalankan Server
```bash
# Generate Prisma Client & Push Schema
npx prisma generate
npx prisma db push

# Jalankan server development
npm run dev
```
Buka browser di **[http://localhost:3000](http://localhost:3000)**.

---

## 📄 Lisensi
Proyek ini didistribusikan di bawah lisensi MIT. Silakan gunakan untuk keperluan komersial, kustomisasi perusahaan, atau portfolio pengembangan perangkat lunak.
