import { DocumentStatus } from "@prisma/client"

export interface OrderLineCalculationInput {
  quantity: number
  unitPrice: number
  discount?: number
}

export interface OrderTotalResult {
  subtotal: number
  discountTotal: number
  taxRate: number
  taxAmount: number
  totalAmount: number
}

export function calculateOrderTotals(
  items: OrderLineCalculationInput[],
  taxRate: number = 0,
  globalDiscount: number = 0
): OrderTotalResult {
  let subtotal = 0
  let itemDiscountTotal = 0

  for (const item of items) {
    const qty = Math.max(0, Number(item.quantity) || 0)
    const price = Math.max(0, Number(item.unitPrice) || 0)
    const discount = Math.max(0, Number(item.discount) || 0)

    const lineGross = Math.round(qty * price * 100) / 100
    const lineDiscount = Math.min(lineGross, Math.round(discount * 100) / 100)

    subtotal += lineGross - lineDiscount
    itemDiscountTotal += lineDiscount
  }

  subtotal = Math.round(subtotal * 100) / 100
  const totalDiscount = Math.round((itemDiscountTotal + (Number(globalDiscount) || 0)) * 100) / 100
  const taxableAmount = Math.max(0, subtotal - (Number(globalDiscount) || 0))
  const tax = Math.round((taxableAmount * (Number(taxRate) || 0) / 100) * 100) / 100
  const total = Math.round((taxableAmount + tax) * 100) / 100

  return {
    subtotal,
    discountTotal: totalDiscount,
    taxRate: Number(taxRate) || 0,
    taxAmount: tax,
    totalAmount: total,
  }
}

export function calculatePaymentBalance(
  totalAmount: number,
  paidAmount: number,
  newPaymentAmount: number
): {
  newPaidTotal: number
  outstandingAmount: number
  newStatus: DocumentStatus
  isValid: boolean
  errorMessage?: string
} {
  const total = Math.round((Number(totalAmount) || 0) * 100) / 100
  const paid = Math.round((Number(paidAmount) || 0) * 100) / 100
  const payment = Math.round((Number(newPaymentAmount) || 0) * 100) / 100

  if (payment <= 0) {
    return {
      newPaidTotal: paid,
      outstandingAmount: Math.max(0, total - paid),
      newStatus: paid >= total ? DocumentStatus.PAID : paid > 0 ? DocumentStatus.PARTIALLY_PAID : DocumentStatus.CONFIRMED,
      isValid: false,
      errorMessage: "Payment amount must be greater than zero.",
    }
  }

  const remainingBefore = Math.round((total - paid) * 100) / 100

  if (payment > remainingBefore + 0.01) {
    return {
      newPaidTotal: paid,
      outstandingAmount: remainingBefore,
      newStatus: DocumentStatus.CONFIRMED,
      isValid: false,
      errorMessage: `Payment amount (${payment.toFixed(2)}) exceeds remaining balance (${remainingBefore.toFixed(2)}).`,
    }
  }

  const newPaidTotal = Math.round((paid + payment) * 100) / 100
  const outstandingAmount = Math.max(0, Math.round((total - newPaidTotal) * 100) / 100)
  const newStatus = outstandingAmount <= 0.01 ? DocumentStatus.PAID : DocumentStatus.PARTIALLY_PAID

  return {
    newPaidTotal,
    outstandingAmount,
    newStatus,
    isValid: true,
  }
}

/**
 * Validates document state transitions according to business workflows.
 */
export function validateStateTransition(
  current: DocumentStatus,
  target: DocumentStatus,
  allowedTransitions: Partial<Record<DocumentStatus, DocumentStatus[]>>
): { isAllowed: boolean; errorMessage?: string } {
  if (current === target) return { isAllowed: true }
  
  const allowed = allowedTransitions[current] || []
  if (!allowed.includes(target)) {
    return {
      isAllowed: false,
      errorMessage: `Invalid state transition from ${current} to ${target}. Allowed transitions: ${allowed.join(", ") || "none"}`,
    }
  }

  return { isAllowed: true }
}

export const SALES_ORDER_TRANSITIONS: Partial<Record<DocumentStatus, DocumentStatus[]>> = {
  DRAFT: [DocumentStatus.CONFIRMED, DocumentStatus.CANCELLED],
  CONFIRMED: [DocumentStatus.PROCESSING, DocumentStatus.CANCELLED],
  PROCESSING: [DocumentStatus.PARTIALLY_DELIVERED, DocumentStatus.DELIVERED, DocumentStatus.CANCELLED],
  PARTIALLY_DELIVERED: [DocumentStatus.DELIVERED, DocumentStatus.CANCELLED],
  DELIVERED: [],
  CANCELLED: [],
}

export const INVOICE_TRANSITIONS: Partial<Record<DocumentStatus, DocumentStatus[]>> = {
  DRAFT: [DocumentStatus.CONFIRMED, DocumentStatus.CANCELLED],
  CONFIRMED: [DocumentStatus.PARTIALLY_PAID, DocumentStatus.PAID, DocumentStatus.OVERDUE, DocumentStatus.CANCELLED],
  PARTIALLY_PAID: [DocumentStatus.PAID, DocumentStatus.OVERDUE, DocumentStatus.CANCELLED],
  OVERDUE: [DocumentStatus.PARTIALLY_PAID, DocumentStatus.PAID, DocumentStatus.CANCELLED],
  PAID: [],
  CANCELLED: [],
}
