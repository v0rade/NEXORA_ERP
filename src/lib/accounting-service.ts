export interface JournalLineInput {
  accountId: string
  accountCode?: string
  accountName?: string
  description?: string
  debit: number
  credit: number
}

export interface ValidateJournalEntryResult {
  isValid: boolean
  totalDebit: number
  totalCredit: number
  difference: number
  errors: string[]
}

/**
 * Validates a double-entry journal entry.
 * Total debits must equal total credits exactly.
 * There must be at least two lines.
 * Each line cannot have both debit and credit.
 */
export function validateJournalEntry(lines: JournalLineInput[]): ValidateJournalEntryResult {
  const errors: string[] = []

  if (!lines || lines.length < 2) {
    errors.push("A journal entry must contain at least two line items.")
  }

  let totalDebit = 0
  let totalCredit = 0

  for (let i = 0; i < (lines || []).length; i++) {
    const line = lines[i]
    const debit = Math.round((Number(line.debit) || 0) * 100) / 100
    const credit = Math.round((Number(line.credit) || 0) * 100) / 100

    if (debit < 0 || credit < 0) {
      errors.push(`Line ${i + 1}: Debit and credit amounts cannot be negative.`)
    }

    if (debit > 0 && credit > 0) {
      errors.push(`Line ${i + 1}: A line cannot have both debit and credit amounts.`)
    }

    if (debit === 0 && credit === 0) {
      errors.push(`Line ${i + 1}: Line must have either a debit or credit amount.`)
    }

    totalDebit += debit
    totalCredit += credit
  }

  // Rounded to 2 decimal places
  totalDebit = Math.round(totalDebit * 100) / 100
  totalCredit = Math.round(totalCredit * 100) / 100
  const difference = Math.round(Math.abs(totalDebit - totalCredit) * 100) / 100

  if (difference > 0.001) {
    errors.push(
      `Out of balance: Total debits (${totalDebit.toFixed(2)}) must equal total credits (${totalCredit.toFixed(2)}). Difference: ${difference.toFixed(2)}`
    )
  }

  return {
    isValid: errors.length === 0,
    totalDebit,
    totalCredit,
    difference,
    errors,
  }
}

/**
 * Generates reversal lines for a posted journal entry.
 * Every debit line becomes a credit line, and every credit becomes a debit.
 */
export function createReversalLines(lines: JournalLineInput[], reason?: string): JournalLineInput[] {
  return lines.map((line) => ({
    accountId: line.accountId,
    accountCode: line.accountCode,
    accountName: line.accountName,
    description: `Reversal: ${line.description || reason || "Corrective entry"}`,
    debit: line.credit,
    credit: line.debit,
  }))
}
