import { describe, it, expect } from "vitest"
import { validateJournalEntry, createReversalLines } from "@/lib/accounting-service"

describe("Double-Entry Bookkeeping & Accounting Validation", () => {
  it("approves a perfectly balanced journal entry (debits equal credits)", () => {
    const lines = [
      { accountId: "acc-1100", debit: 5000.0, credit: 0.0 }, // Accounts Receivable
      { accountId: "acc-4000", debit: 0.0, credit: 5000.0 }, // Sales Revenue
    ]

    const result = validateJournalEntry(lines)
    expect(result.isValid).toBe(true)
    expect(result.totalDebit).toBe(5000.0)
    expect(result.totalCredit).toBe(5000.0)
    expect(result.difference).toBe(0)
    expect(result.errors.length).toBe(0)
  })

  it("rejects an out-of-balance journal entry", () => {
    const lines = [
      { accountId: "acc-1010", debit: 1200.0, credit: 0.0 },
      { accountId: "acc-2000", debit: 0.0, credit: 1000.0 }, // $200 imbalance
    ]

    const result = validateJournalEntry(lines)
    expect(result.isValid).toBe(false)
    expect(result.difference).toBe(200.0)
    expect(result.errors.some((e) => e.includes("Out of balance"))).toBe(true)
  })

  it("rejects entries with fewer than two lines", () => {
    const lines = [{ accountId: "acc-1010", debit: 500.0, credit: 0.0 }]
    const result = validateJournalEntry(lines)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes("at least two line items"))).toBe(true)
  })

  it("rejects lines with simultaneous debit and credit", () => {
    const lines = [
      { accountId: "acc-1010", debit: 500.0, credit: 500.0 },
      { accountId: "acc-2000", debit: 0.0, credit: 500.0 },
    ]
    const result = validateJournalEntry(lines)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes("cannot have both debit and credit"))).toBe(true)
  })

  it("generates correct reversal lines where debits and credits flip", () => {
    const original = [
      { accountId: "acc-1010", debit: 250.0, credit: 0.0, description: "Original debit" },
      { accountId: "acc-4000", debit: 0.0, credit: 250.0, description: "Original credit" },
    ]

    const reversal = createReversalLines(original, "Correction")
    expect(reversal[0].debit).toBe(0.0)
    expect(reversal[0].credit).toBe(250.0)
    expect(reversal[1].debit).toBe(250.0)
    expect(reversal[1].credit).toBe(0.0)

    // Reversal itself must be balanced
    expect(validateJournalEntry(reversal).isValid).toBe(true)
  })
})
