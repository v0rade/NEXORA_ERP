import { describe, it, expect } from "vitest"
import {
  calculateOrderTotals,
  calculatePaymentBalance,
  validateStateTransition,
  SALES_ORDER_TRANSITIONS,
} from "@/lib/order-service"
import { DocumentStatus } from "@prisma/client"

describe("Sales Calculations, Invoicing, and Workflow Transitions", () => {
  it("calculates accurate subtotals, item discounts, tax and total without floating errors", () => {
    const items = [
      { quantity: 2, unitPrice: 1000.0, discount: 50.0 }, // 2000 - 50 = 1950
      { quantity: 5, unitPrice: 200.0, discount: 0.0 },    // 1000
    ]
    const taxRate = 5.0 // 5% of (2950 - 50 global discount) = 145.00
    const globalDiscount = 50.0

    const result = calculateOrderTotals(items, taxRate, globalDiscount)
    expect(result.subtotal).toBe(2950.0)
    expect(result.discountTotal).toBe(100.0) // 50 line + 50 global
    expect(result.taxAmount).toBe(145.0)
    expect(result.totalAmount).toBe(3045.0) // 2900 + 145
  })

  it("handles partial payment correctly and updates outstanding balance", () => {
    const totalAmount = 10000.0
    const paidBefore = 0.0
    const payment = 4000.0

    const result = calculatePaymentBalance(totalAmount, paidBefore, payment)
    expect(result.isValid).toBe(true)
    expect(result.newPaidTotal).toBe(4000.0)
    expect(result.outstandingAmount).toBe(6000.0)
    expect(result.newStatus).toBe(DocumentStatus.PARTIALLY_PAID)
  })

  it("sets invoice status to PAID when final payment clears balance", () => {
    const totalAmount = 5000.0
    const paidBefore = 3000.0
    const finalPayment = 2000.0

    const result = calculatePaymentBalance(totalAmount, paidBefore, finalPayment)
    expect(result.isValid).toBe(true)
    expect(result.newPaidTotal).toBe(5000.0)
    expect(result.outstandingAmount).toBe(0.0)
    expect(result.newStatus).toBe(DocumentStatus.PAID)
  })

  it("rejects payments that exceed the remaining outstanding balance", () => {
    const totalAmount = 2000.0
    const paidBefore = 1500.0 // remaining: 500
    const invalidPayment = 600.0

    const result = calculatePaymentBalance(totalAmount, paidBefore, invalidPayment)
    expect(result.isValid).toBe(false)
    expect(result.errorMessage).toContain("exceeds remaining balance")
  })

  it("validates permissible document state transitions", () => {
    // Draft -> Confirmed (Allowed)
    const valid1 = validateStateTransition(
      DocumentStatus.DRAFT,
      DocumentStatus.CONFIRMED,
      SALES_ORDER_TRANSITIONS
    )
    expect(valid1.isAllowed).toBe(true)

    // Draft -> Delivered (Disallowed without confirmation/processing)
    const invalid1 = validateStateTransition(
      DocumentStatus.DRAFT,
      DocumentStatus.DELIVERED,
      SALES_ORDER_TRANSITIONS
    )
    expect(invalid1.isAllowed).toBe(false)
    expect(invalid1.errorMessage).toContain("Invalid state transition")
  })
})
