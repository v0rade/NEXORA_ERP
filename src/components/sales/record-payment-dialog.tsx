"use client"

import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { formatCurrency } from "@/lib/utils"

interface RecordPaymentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  invoice: {
    id: string
    invoiceNumber: string
    customerName: string
    totalAmount: number
    outstandingAmount: number
  } | null
}

export function RecordPaymentDialog({
  isOpen,
  onClose,
  onSuccess,
  invoice,
}: RecordPaymentDialogProps) {
  const [amount, setAmount] = useState<number>(invoice?.outstandingAmount || 0)
  const [paymentMethod, setPaymentMethod] = useState("BANK_TRANSFER")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Update amount when invoice changes
  React.useEffect(() => {
    if (invoice) {
      setAmount(invoice.outstandingAmount)
    }
  }, [invoice])

  if (!invoice) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/sales/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount,
          paymentMethod,
          referenceNumber,
          notes,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment recording failed")

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
      title={`Record Payment for ${invoice.invoiceNumber}`}
      description={`Customer: ${invoice.customerName} • Outstanding: ${formatCurrency(invoice.outstandingAmount)}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-900 flex justify-between items-center">
          <div>
            <span className="block text-[11px] text-blue-700">Total Invoice Amount</span>
            <span className="font-bold text-sm">{formatCurrency(invoice.totalAmount)}</span>
          </div>
          <div className="text-right">
            <span className="block text-[11px] text-blue-700">Current Balance Due</span>
            <span className="font-bold text-sm text-blue-800">{formatCurrency(invoice.outstandingAmount)}</span>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Payment Amount ($)</label>
          <input
            type="number"
            step="0.01"
            max={invoice.outstandingAmount}
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold"
            required
          />
          <span className="text-[10px] text-slate-400 mt-0.5 block">
            Supports partial settlement or full payment.
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
            >
              <option value="BANK_TRANSFER">Bank Wire / ACH</option>
              <option value="CHECK">Corporate Check</option>
              <option value="CREDIT_CARD">Credit Card</option>
              <option value="CASH">Cash</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reference / Check #</label>
            <input
              type="text"
              placeholder="e.g. WT-99214"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Settlement notes, bank confirmation..."
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
          />
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
            disabled={isSubmitting || amount <= 0}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Recording..." : `Confirm Payment of ${formatCurrency(amount)}`}
          </button>
        </div>
      </form>
    </Modal>
  )
}
