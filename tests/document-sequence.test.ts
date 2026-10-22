import { describe, it, expect } from "vitest"
import { formatDocumentNumber, DEFAULT_PREFIXES } from "@/lib/document-sequence"

describe("Document Sequence and Numbering Integrity", () => {
  it("formats standard document sequences with custom padding and year", () => {
    const num = formatDocumentNumber("SO", 42, 2026, 5)
    expect(num).toBe("SO-2026-00042")
  })

  it("handles high sequence numbers gracefully", () => {
    const num = formatDocumentNumber("INV", 100452, 2026, 5)
    expect(num).toBe("INV-2026-100452")
  })

  it("has default prefixes configured for all operational documents", () => {
    expect(DEFAULT_PREFIXES.SALES_ORDER).toBe("SO")
    expect(DEFAULT_PREFIXES.CUSTOMER_INVOICE).toBe("INV")
    expect(DEFAULT_PREFIXES.PURCHASE_ORDER).toBe("PO")
    expect(DEFAULT_PREFIXES.JOURNAL_ENTRY).toBe("JE")
    expect(DEFAULT_PREFIXES.STOCK_MOVEMENT).toBe("MOV")
  })
})
