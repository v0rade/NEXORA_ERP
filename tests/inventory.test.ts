import { describe, it, expect } from "vitest"
import { validateStockReduction, validateStockTransfer } from "@/lib/inventory-service"

describe("Inventory Integrity and Stock Transfer Validation", () => {
  it("allows stock deduction when balance is sufficient", () => {
    const result = validateStockReduction(20, 5, false)
    expect(result.isAllowed).toBe(true)
    expect(result.resultingBalance).toBe(15)
  })

  it("prevents negative stock balances by default", () => {
    const result = validateStockReduction(10, 15, false)
    expect(result.isAllowed).toBe(false)
    expect(result.resultingBalance).toBe(-5)
    expect(result.errorMessage).toContain("Negative stock is not permitted")
  })

  it("rejects transfer between identical source and target warehouses", () => {
    const result = validateStockTransfer("wh-01", "wh-01", 10, 2)
    expect(result.isValid).toBe(false)
    expect(result.errorMessage).toContain("cannot be the same")
  })

  it("rejects stock transfer if source warehouse has insufficient balance", () => {
    const result = validateStockTransfer("wh-01", "wh-02", 3, 5)
    expect(result.isValid).toBe(false)
    expect(result.errorMessage).toContain("Insufficient stock balance")
  })

  it("approves valid inter-warehouse stock transfer", () => {
    const result = validateStockTransfer("wh-01", "wh-02", 25, 10)
    expect(result.isValid).toBe(true)
  })
})
