import { PrismaClient, Role, DocumentStatus, StockMovementType, StockMovementReferenceType, PaymentMethod, AccountType, AccountSubType, JournalStatus, EmploymentStatus, AttendanceStatus, LeaveType, LeaveStatus } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Starting NEXORA ERP Database Seed...")

  const salt = await bcrypt.genSalt(10)
  const defaultPasswordHash = await bcrypt.hash("Password123!", salt)

  // 1. Company
  const company = await prisma.company.upsert({
    where: { slug: "nexora-dynamics" },
    update: {},
    create: {
      id: "comp-nexora-01",
      name: "Nexora Dynamics Inc.",
      slug: "nexora-dynamics",
      code: "NEX",
      address: "100 Innovation Way, Suite 400",
      city: "Chicago",
      state: "IL",
      country: "United States",
      postalCode: "60601",
      phone: "+1 (312) 555-0199",
      email: "ops@nexoradynamics.com",
      website: "https://nexora.example.com",
      taxId: "US-987654321",
      currency: "USD",
      currencySymbol: "$",
      fiscalYearStart: 1,
      isActive: true,
    },
  })

  console.log(`✓ Company seeded: ${company.name}`)

  // 2. Users and Memberships
  const usersData = [
    { id: "user-super-01", name: "Alexander Sterling", email: "superadmin@nexora.com", role: Role.SUPER_ADMIN, phone: "+1 (312) 555-0101" },
    { id: "user-admin-01", name: "Eleanor Vance", email: "admin@nexora.com", role: Role.COMPANY_ADMIN, phone: "+1 (312) 555-0102" },
    { id: "user-fin-01", name: "Marcus Chen", email: "finance@nexora.com", role: Role.FINANCE, phone: "+1 (312) 555-0103" },
    { id: "user-sales-01", name: "Sophia Rodriguez", email: "sales@nexora.com", role: Role.SALES, phone: "+1 (312) 555-0104" },
    { id: "user-pur-01", name: "Liam O'Connor", email: "purchasing@nexora.com", role: Role.PURCHASING, phone: "+1 (312) 555-0105" },
    { id: "user-wh-01", name: "David Kowalski", email: "warehouse@nexora.com", role: Role.WAREHOUSE, phone: "+1 (312) 555-0106" },
    { id: "user-hr-01", name: "Amara Okafor", email: "hr@nexora.com", role: Role.HR, phone: "+1 (312) 555-0107" },
    { id: "user-ro-01", name: "Lucas Bennett", email: "readonly@nexora.com", role: Role.READ_ONLY, phone: "+1 (312) 555-0108" },
  ]

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        id: u.id,
        name: u.name,
        email: u.email,
        passwordHash: defaultPasswordHash,
        phone: u.phone,
        isActive: true,
      },
    })

    await prisma.companyMembership.upsert({
      where: { userId_companyId: { userId: user.id, companyId: company.id } },
      update: { role: u.role },
      create: {
        userId: user.id,
        companyId: company.id,
        role: u.role,
        isDefault: true,
      },
    })
  }

  console.log(`✓ Seeded ${usersData.length} users with distinct roles`)

  // 3. Document Sequences
  const seqTypes = ["SO", "INV", "PAY-CUST", "PO", "GR", "BILL", "PAY-SUPP", "JE", "MOV", "QUO", "PR", "EXP"]
  for (const seq of seqTypes) {
    await prisma.documentSequence.upsert({
      where: { companyId_documentType: { companyId: company.id, documentType: seq } },
      update: {},
      create: {
        companyId: company.id,
        documentType: seq,
        prefix: seq,
        nextNumber: 4,
        padding: 5,
      },
    })
  }

  // 4. Warehouses
  const wh1 = await prisma.warehouse.upsert({
    where: { companyId_code: { companyId: company.id, code: "CDC" } },
    update: {},
    create: {
      id: "wh-01",
      companyId: company.id,
      code: "CDC",
      name: "Central Distribution Center",
      location: "Chicago, IL - Facility A",
      isDefault: true,
      isActive: true,
    },
  })

  const wh2 = await prisma.warehouse.upsert({
    where: { companyId_code: { companyId: company.id, code: "WCD" } },
    update: {},
    create: {
      id: "wh-02",
      companyId: company.id,
      code: "WCD",
      name: "West Coast Depot",
      location: "Reno, NV - Logistics Hub",
      isDefault: false,
      isActive: true,
    },
  })

  // 5. Categories and UOMs
  const cat1 = await prisma.productCategory.upsert({
    where: { companyId_code: { companyId: company.id, code: "SRV" } },
    update: {},
    create: { id: "cat-01", companyId: company.id, code: "SRV", name: "Enterprise Hardware & Servers" },
  })

  const uom1 = await prisma.unitOfMeasure.upsert({
    where: { companyId_symbol: { companyId: company.id, symbol: "PCS" } },
    update: {},
    create: { id: "uom-01", companyId: company.id, name: "Piece", symbol: "PCS" },
  })

  // 6. Products
  const prod1 = await prisma.product.upsert({
    where: { companyId_sku: { companyId: company.id, sku: "NEX-SRV-01" } },
    update: {},
    create: {
      id: "prod-01",
      companyId: company.id,
      sku: "NEX-SRV-01",
      name: "ProEdge Rack Server 2U Intel Xeon",
      description: "Enterprise rackmount compute server",
      categoryId: cat1.id,
      uomId: uom1.id,
      costPrice: 1200.0,
      sellingPrice: 1850.0,
      minStockLevel: 5,
      isActive: true,
    },
  })

  // Stock Balance
  await prisma.stockBalance.upsert({
    where: { companyId_productId_warehouseId: { companyId: company.id, productId: prod1.id, warehouseId: wh1.id } },
    update: {},
    create: {
      companyId: company.id,
      productId: prod1.id,
      warehouseId: wh1.id,
      quantity: 18,
      reservedQuantity: 2,
    },
  })

  console.log("✅ Database seeding completed successfully!")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
