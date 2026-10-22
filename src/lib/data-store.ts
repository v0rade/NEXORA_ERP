import {
  DEMO_COMPANY,
  DEMO_USERS,
  DEMO_WAREHOUSES,
  DEMO_CATEGORIES,
  DEMO_UOMS,
  DEMO_PRODUCTS,
  DEMO_STOCK_BALANCES,
  DEMO_CUSTOMERS,
  DEMO_SUPPLIERS,
  DEMO_ACCOUNTS,
  DEMO_SALES_ORDERS,
  DEMO_INVOICES,
  DEMO_PURCHASE_ORDERS,
  DEMO_SUPPLIER_BILLS,
  DEMO_DEPARTMENTS,
  DEMO_EMPLOYEES,
  DEMO_LEAVE_REQUESTS,
  DEMO_JOURNAL_ENTRIES,
} from "./demo-data"
import { DocumentStatus, Role, StockMovementType, StockMovementReferenceType } from "@prisma/client"
import { calculateOrderTotals, calculatePaymentBalance, SALES_ORDER_TRANSITIONS, INVOICE_TRANSITIONS, validateStateTransition } from "./order-service"
import { validateStockReduction, validateStockTransfer } from "./inventory-service"
import { validateJournalEntry, JournalLineInput } from "./accounting-service"
import { formatDocumentNumber } from "./document-sequence"

// In-memory persistent data store
class NexoraDataStore {
  company = { ...DEMO_COMPANY }
  users = [...DEMO_USERS]
  warehouses = [...DEMO_WAREHOUSES]
  categories = [...DEMO_CATEGORIES]
  uoms = [...DEMO_UOMS]
  products = [...DEMO_PRODUCTS]
  stockBalances = [...DEMO_STOCK_BALANCES]
  customers = [...DEMO_CUSTOMERS]
  suppliers = [...DEMO_SUPPLIERS]
  accounts = [...DEMO_ACCOUNTS]
  salesOrders: any[] = [...DEMO_SALES_ORDERS]
  invoices: any[] = [...DEMO_INVOICES]
  purchaseOrders: any[] = [...DEMO_PURCHASE_ORDERS]
  supplierBills: any[] = [...DEMO_SUPPLIER_BILLS]
  departments = [...DEMO_DEPARTMENTS]
  employees = [...DEMO_EMPLOYEES]
  leaveRequests: any[] = [...DEMO_LEAVE_REQUESTS]
  journalEntries: any[] = [...DEMO_JOURNAL_ENTRIES]
  stockMovements: Array<{
    id: string
    movementNumber: string
    movementType: StockMovementType
    productId: string
    productName: string
    warehouseId: string
    warehouseName: string
    toWarehouseId?: string
    quantity: number
    unitCost: number
    referenceType: StockMovementReferenceType
    referenceId?: string
    notes?: string
    createdAt: string
  }> = [
    {
      id: "mov-01",
      movementNumber: "MOV-2026-00001",
      movementType: StockMovementType.RECEIPT,
      productId: "prod-01",
      productName: "ProEdge Rack Server 2U",
      warehouseId: "wh-01",
      warehouseName: "Central Distribution Center",
      quantity: 10,
      unitCost: 1200.0,
      referenceType: StockMovementReferenceType.PURCHASE_RECEIPT,
      referenceId: "po-01",
      notes: "Goods receipt for PO-2026-00001",
      createdAt: "2026-10-12T14:30:00Z",
    },
    {
      id: "mov-02",
      movementNumber: "MOV-2026-00002",
      movementType: StockMovementType.ISSUE,
      productId: "prod-01",
      productName: "ProEdge Rack Server 2U",
      warehouseId: "wh-01",
      warehouseName: "Central Distribution Center",
      quantity: 4,
      unitCost: 1200.0,
      referenceType: StockMovementReferenceType.SALES_DELIVERY,
      referenceId: "so-01",
      notes: "Shipped for Sales Order SO-2026-00001",
      createdAt: "2026-10-14T10:00:00Z",
    },
  ]
  auditLogs: Array<{
    id: string
    action: string
    entity: string
    entityId: string
    details: string
    userName: string
    createdAt: string
  }> = [
    {
      id: "audit-01",
      action: "CREATE",
      entity: "SalesOrder",
      entityId: "so-01",
      details: "Created Sales Order SO-2026-00001 ($10,972.50)",
      userName: "Sophia Rodriguez",
      createdAt: "2026-10-10T10:00:00Z",
    },
    {
      id: "audit-02",
      action: "POST",
      entity: "JournalEntry",
      entityId: "je-01",
      details: "Posted Journal Entry JE-2026-00001 ($10,972.50)",
      userName: "Marcus Chen",
      createdAt: "2026-10-12T11:00:00Z",
    },
  ]

  sequenceCounters: Record<string, number> = {
    SO: 4,
    INV: 4,
    PO: 3,
    BILL: 3,
    JE: 4,
    MOV: 3,
    PAY: 3,
  }

  getNextNumber(type: "SO" | "INV" | "PO" | "BILL" | "JE" | "MOV" | "PAY") {
    const next = this.sequenceCounters[type] || 1
    this.sequenceCounters[type] = next + 1
    return formatDocumentNumber(type, next)
  }

  // --- Metrics ---
  getDashboardMetrics() {
    const totalSales = this.salesOrders
      .filter((so) => so.status !== DocumentStatus.CANCELLED)
      .reduce((sum, so) => sum + so.totalAmount, 0)

    const outstandingReceivables = this.invoices
      .filter((inv) => inv.status !== DocumentStatus.CANCELLED && inv.status !== DocumentStatus.PAID)
      .reduce((sum, inv) => sum + inv.outstandingAmount, 0)

    const outstandingPayables = this.supplierBills
      .filter((b) => b.status !== DocumentStatus.CANCELLED && b.status !== DocumentStatus.PAID)
      .reduce((sum, b) => sum + b.outstandingAmount, 0)

    let totalInventoryValue = 0
    let lowStockCount = 0

    for (const prod of this.products) {
      const balances = this.stockBalances.filter((sb) => sb.productId === prod.id)
      const totalQty = balances.reduce((sum, b) => sum + b.quantity, 0)
      totalInventoryValue += totalQty * prod.costPrice
      if (totalQty <= prod.minStockLevel) {
        lowStockCount++
      }
    }

    return {
      totalSales,
      outstandingReceivables,
      outstandingPayables,
      totalInventoryValue,
      lowStockCount,
      totalCustomers: this.customers.length,
      totalEmployees: this.employees.length,
      totalProducts: this.products.length,
    }
  }

  // --- Sales ---
  createSalesOrder(data: {
    customerId: string
    items: Array<{ productId: string; quantity: number; unitPrice: number; discount?: number }>
    taxRate?: number
    discountAmount?: number
    notes?: string
    createdByName?: string
  }) {
    const customer = this.customers.find((c) => c.id === data.customerId)
    if (!customer) throw new Error("Customer not found")

    const orderNumber = this.getNextNumber("SO")
    const totals = calculateOrderTotals(data.items, data.taxRate || 5.0, data.discountAmount || 0)

    const orderItems = data.items.map((it, idx) => {
      const prod = this.products.find((p) => p.id === it.productId)
      const qty = Number(it.quantity) || 1
      const price = Number(it.unitPrice) || prod?.sellingPrice || 0
      const discount = Number(it.discount) || 0
      return {
        id: `soi-${Date.now()}-${idx}`,
        productId: it.productId,
        productName: prod?.name || "Product",
        quantity: qty,
        unitPrice: price,
        discount,
        total: Math.round(qty * price * 100) / 100 - discount,
      }
    })

    const newOrder = {
      id: `so-${Date.now()}`,
      companyId: this.company.id,
      orderNumber,
      customerId: customer.id,
      customerName: customer.name,
      status: DocumentStatus.CONFIRMED,
      orderDate: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      subtotal: totals.subtotal,
      taxRate: totals.taxRate,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountTotal,
      totalAmount: totals.totalAmount,
      notes: data.notes || "",
      items: orderItems,
    }

    this.salesOrders.unshift(newOrder)

    // Audit log
    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "CREATE",
      entity: "SalesOrder",
      entityId: newOrder.id,
      details: `Created Sales Order ${orderNumber} for ${customer.name} ($${totals.totalAmount.toFixed(2)})`,
      userName: data.createdByName || "User",
      createdAt: new Date().toISOString(),
    })

    return newOrder
  }

  updateSalesOrderStatus(orderId: string, targetStatus: DocumentStatus, userName?: string) {
    const order = this.salesOrders.find((so) => so.id === orderId)
    if (!order) throw new Error("Sales Order not found")

    const validation = validateStateTransition(order.status, targetStatus, SALES_ORDER_TRANSITIONS)
    if (!validation.isAllowed) throw new Error(validation.errorMessage)

    const prevStatus = order.status
    order.status = targetStatus

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "UPDATE_STATUS",
      entity: "SalesOrder",
      entityId: order.id,
      details: `Changed Sales Order ${order.orderNumber} status from ${prevStatus} to ${targetStatus}`,
      userName: userName || "User",
      createdAt: new Date().toISOString(),
    })

    return order
  }

  // --- Invoicing & Payments ---
  createInvoiceFromOrder(orderId: string, userName?: string) {
    const order = this.salesOrders.find((so) => so.id === orderId)
    if (!order) throw new Error("Sales order not found")

    const invoiceNumber = this.getNextNumber("INV")
    const newInvoice = {
      id: `inv-${Date.now()}`,
      companyId: this.company.id,
      invoiceNumber,
      salesOrderId: order.id,
      customerId: order.customerId,
      customerName: order.customerName,
      status: DocumentStatus.CONFIRMED,
      issueDate: new Date().toISOString(),
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString(),
      subtotal: order.subtotal,
      taxRate: order.taxRate,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      paidAmount: 0.0,
      outstandingAmount: order.totalAmount,
      notes: `Generated from Sales Order ${order.orderNumber}`,
    }

    this.invoices.unshift(newInvoice)

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "CREATE",
      entity: "CustomerInvoice",
      entityId: newInvoice.id,
      details: `Created Customer Invoice ${invoiceNumber} for ${order.customerName} ($${order.totalAmount.toFixed(2)})`,
      userName: userName || "User",
      createdAt: new Date().toISOString(),
    })

    return newInvoice
  }

  recordCustomerPayment(data: {
    invoiceId: string
    amount: number
    paymentMethod: string
    referenceNumber?: string
    notes?: string
    userName?: string
  }) {
    const invoice = this.invoices.find((inv) => inv.id === data.invoiceId)
    if (!invoice) throw new Error("Invoice not found")

    const balanceCheck = calculatePaymentBalance(invoice.totalAmount, invoice.paidAmount, data.amount)
    if (!balanceCheck.isValid) throw new Error(balanceCheck.errorMessage)

    invoice.paidAmount = balanceCheck.newPaidTotal
    invoice.outstandingAmount = balanceCheck.outstandingAmount
    invoice.status = balanceCheck.newStatus

    const payNumber = this.getNextNumber("PAY")

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "PAYMENT",
      entity: "CustomerInvoice",
      entityId: invoice.id,
      details: `Recorded payment of $${data.amount.toFixed(2)} on invoice ${invoice.invoiceNumber}. New balance: $${invoice.outstandingAmount.toFixed(2)}`,
      userName: data.userName || "User",
      createdAt: new Date().toISOString(),
    })

    return { invoice, paymentNumber: payNumber }
  }

  // --- Inventory & Stock Transfers ---
  transferStock(data: {
    productId: string
    sourceWarehouseId: string
    targetWarehouseId: string
    quantity: number
    notes?: string
    userName?: string
  }) {
    const prod = this.products.find((p) => p.id === data.productId)
    if (!prod) throw new Error("Product not found")

    const sourceWh = this.warehouses.find((w) => w.id === data.sourceWarehouseId)
    const targetWh = this.warehouses.find((w) => w.id === data.targetWarehouseId)
    if (!sourceWh || !targetWh) throw new Error("Invalid warehouses")

    let sourceBalance = this.stockBalances.find(
      (b) => b.productId === data.productId && b.warehouseId === data.sourceWarehouseId
    )
    if (!sourceBalance) {
      sourceBalance = {
        id: `sb-${Date.now()}-1`,
        companyId: this.company.id,
        productId: data.productId,
        warehouseId: data.sourceWarehouseId,
        quantity: 0,
        reservedQuantity: 0,
      }
      this.stockBalances.push(sourceBalance)
    }

    const transferCheck = validateStockTransfer(
      data.sourceWarehouseId,
      data.targetWarehouseId,
      sourceBalance.quantity,
      data.quantity
    )
    if (!transferCheck.isValid) throw new Error(transferCheck.errorMessage)

    let targetBalance = this.stockBalances.find(
      (b) => b.productId === data.productId && b.warehouseId === data.targetWarehouseId
    )
    if (!targetBalance) {
      targetBalance = {
        id: `sb-${Date.now()}-2`,
        companyId: this.company.id,
        productId: data.productId,
        warehouseId: data.targetWarehouseId,
        quantity: 0,
        reservedQuantity: 0,
      }
      this.stockBalances.push(targetBalance)
    }

    // Atomically execute transfer
    sourceBalance.quantity -= data.quantity
    targetBalance.quantity += data.quantity

    const movNumber = this.getNextNumber("MOV")
    const newMovement = {
      id: `mov-${Date.now()}`,
      movementNumber: movNumber,
      movementType: StockMovementType.TRANSFER,
      productId: prod.id,
      productName: prod.name,
      warehouseId: sourceWh.id,
      warehouseName: sourceWh.name,
      toWarehouseId: targetWh.id,
      quantity: data.quantity,
      unitCost: prod.costPrice,
      referenceType: StockMovementReferenceType.TRANSFER,
      notes: data.notes || `Stock transfer from ${sourceWh.code} to ${targetWh.code}`,
      createdAt: new Date().toISOString(),
    }
    this.stockMovements.unshift(newMovement)

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "TRANSFER",
      entity: "StockBalance",
      entityId: prod.id,
      details: `Transferred ${data.quantity} units of ${prod.name} from ${sourceWh.code} to ${targetWh.code}`,
      userName: data.userName || "User",
      createdAt: new Date().toISOString(),
    })

    return { movement: newMovement, sourceBalance, targetBalance }
  }

  // --- Accounting & Double-Entry ---
  createJournalEntry(data: {
    description: string
    lines: JournalLineInput[]
    referenceType?: string
    referenceId?: string
    userName?: string
  }) {
    const validation = validateJournalEntry(data.lines)
    if (!validation.isValid) {
      throw new Error(validation.errors.join("; "))
    }

    const entryNumber = this.getNextNumber("JE")
    const enrichedLines = data.lines.map((l, idx) => {
      const acc = this.accounts.find((a) => a.id === l.accountId || a.code === l.accountCode)
      return {
        id: `jel-${Date.now()}-${idx}`,
        accountCode: acc?.code || l.accountCode || "1000",
        accountName: acc?.name || l.accountName || "General Account",
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        description: l.description || "",
      }
    })

    const newEntry = {
      id: `je-${Date.now()}`,
      companyId: this.company.id,
      entryNumber,
      entryDate: new Date().toISOString(),
      referenceType: data.referenceType || "MANUAL",
      referenceId: data.referenceId || null,
      description: data.description,
      status: "POSTED" as any,
      totalDebit: validation.totalDebit,
      totalCredit: validation.totalCredit,
      lines: enrichedLines,
    }

    this.journalEntries.unshift(newEntry)

    // Update account balances
    for (const line of data.lines) {
      const acc = this.accounts.find((a) => a.id === line.accountId || a.code === line.accountCode)
      if (acc) {
        if (acc.type === "ASSET" || acc.type === "EXPENSE") {
          acc.balance += (Number(line.debit) || 0) - (Number(line.credit) || 0)
        } else {
          acc.balance += (Number(line.credit) || 0) - (Number(line.debit) || 0)
        }
      }
    }

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "POST",
      entity: "JournalEntry",
      entityId: newEntry.id,
      details: `Posted Journal Entry ${entryNumber} ($${validation.totalDebit.toFixed(2)})`,
      userName: data.userName || "User",
      createdAt: new Date().toISOString(),
    })

    return newEntry
  }

  // --- HR & Leave ---
  submitLeaveRequest(data: {
    employeeId: string
    leaveType: any
    startDate: string
    endDate: string
    daysCount: number
    reason: string
    userName?: string
  }) {
    const emp = this.employees.find((e) => e.id === data.employeeId)
    if (!emp) throw new Error("Employee not found")

    const newLeave = {
      id: `leave-${Date.now()}`,
      companyId: this.company.id,
      employeeId: emp.id,
      employeeName: `${emp.firstName} ${emp.lastName}`,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount: data.daysCount,
      reason: data.reason,
      status: "PENDING" as any,
      reviewedBy: null,
      reviewNotes: null,
    }

    this.leaveRequests.unshift(newLeave)

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "CREATE",
      entity: "LeaveRequest",
      entityId: newLeave.id,
      details: `Submitted leave request for ${newLeave.employeeName} (${data.daysCount} days)`,
      userName: data.userName || "User",
      createdAt: new Date().toISOString(),
    })

    return newLeave
  }

  approveLeaveRequest(leaveId: string, approvedBy: string) {
    const req = this.leaveRequests.find((l) => l.id === leaveId)
    if (!req) throw new Error("Leave request not found")

    req.status = "APPROVED" as any
    req.reviewedBy = approvedBy
    req.reviewNotes = "Approved by HR"

    this.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      action: "APPROVE",
      entity: "LeaveRequest",
      entityId: req.id,
      details: `Approved leave request for ${req.employeeName}`,
      userName: approvedBy,
      createdAt: new Date().toISOString(),
    })

    return req
  }
}

// Global Singleton
const globalForDataStore = globalThis as unknown as {
  nexoraStore: NexoraDataStore | undefined
}

export const dataStore = globalForDataStore.nexoraStore ?? new NexoraDataStore()
if (process.env.NODE_ENV !== "production") globalForDataStore.nexoraStore = dataStore
