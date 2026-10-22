"use client"

import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Account {
  id: string
  code: string
  name: string
  type: string
}

interface CreateJournalDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  accounts: Account[]
}

export function CreateJournalDialog({
  isOpen,
  onClose,
  onSuccess,
  accounts,
}: CreateJournalDialogProps) {
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [lines, setLines] = useState<Array<{ accountId: string; debit: number; credit: number; description: string }>>([
    { accountId: accounts[0]?.id || "", debit: 1000, credit: 0, description: "" },
    { accountId: accounts[1]?.id || "", debit: 0, credit: 1000, description: "" },
  ])

  const handleLineChange = (index: number, field: "debit" | "credit", value: number) => {
    const newLines = [...lines]
    newLines[index] = {
      ...newLines[index],
      [field]: Math.max(0, value),
      // If debit is typed, clear credit, and vice-versa
      ...(field === "debit" && value > 0 ? { credit: 0 } : {}),
      ...(field === "credit" && value > 0 ? { debit: 0 } : {}),
    }
    setLines(newLines)
  }

  const addLine = () => {
    setLines([...lines, { accountId: accounts[0]?.id || "", debit: 0, credit: 0, description: "" }])
  }

  const removeLine = (index: number) => {
    if (lines.length <= 2) return
    setLines(lines.filter((_, i) => i !== index))
  }

  // Live total calculations
  const totalDebit = lines.reduce((sum, l) => sum + (Number(l.debit) || 0), 0)
  const totalCredit = lines.reduce((sum, l) => sum + (Number(l.credit) || 0), 0)
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isBalanced) return
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/finance/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          lines,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to post entry")

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Double-Entry Journal Entry"
      description="Post a verified general ledger transaction. Total debits must equal total credits."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 mb-1">Entry Description / Memo</label>
          <input
            type="text"
            required
            placeholder="e.g. Month-end depreciation adjustment for office hardware"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
          />
        </div>

        {/* Lines */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="font-semibold text-slate-800">Journal Lines (Debits & Credits)</span>
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Line
            </button>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {lines.map((line, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <div className="flex-1">
                  <select
                    value={line.accountId}
                    onChange={(e) => {
                      const newLines = [...lines]
                      newLines[idx].accountId = e.target.value
                      setLines(newLines)
                    }}
                    className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-800 text-xs"
                    required
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} — {a.name} ({a.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-28">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Debit"
                    value={line.debit || ""}
                    onChange={(e) => handleLineChange(idx, "debit", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-800 text-xs text-right font-medium"
                  />
                </div>

                <div className="w-28">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Credit"
                    value={line.credit || ""}
                    onChange={(e) => handleLineChange(idx, "credit", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-800 text-xs text-right font-medium"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeLine(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Double-Entry Verification Footer */}
        <div
          className={`p-3 rounded-lg border flex items-center justify-between ${
            isBalanced
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-amber-50 border-amber-200 text-amber-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {isBalanced ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            )}
            <div>
              <p className="font-semibold">
                {isBalanced ? "Entry is perfectly balanced" : "Entry is out of balance"}
              </p>
              {!isBalanced && (
                <p className="text-[11px] text-amber-700">
                  Difference: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                </p>
              )}
            </div>
          </div>

          <div className="text-right space-y-0.5">
            <p className="text-[11px]">Total Debit: <span className="font-bold">{formatCurrency(totalDebit)}</span></p>
            <p className="text-[11px]">Total Credit: <span className="font-bold">{formatCurrency(totalCredit)}</span></p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isBalanced}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Posting..." : "Post Verified Journal Entry"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
