"use client"

import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"
import { Plus, Trash2, Calculator } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Product {
  id: string
  name: string
  sku: string
  sellingPrice: number
}

interface Customer {
  id: string
  name: string
  code: string
}

interface CreateOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  customers: Customer[]
  products: Product[]
}

export function CreateOrderDialog({
  isOpen,
  onClose,
  onSuccess,
  customers,
  products,
}: CreateOrderDialogProps) {
  const [customerId, setCustomerId] = useState(customers[0]?.id || "")
  const [taxRate, setTaxRate] = useState(5.0)
  const [discountAmount, setDiscountAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [items, setItems] = useState<Array<{ productId: string; quantity: number; unitPrice: number; discount: number }>>([
    { productId: products[0]?.id || "", quantity: 1, unitPrice: products[0]?.sellingPrice || 100, discount: 0 },
  ])

  const handleProductChange = (index: number, prodId: string) => {
    const prod = products.find((p) => p.id === prodId)
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      productId: prodId,
      unitPrice: prod?.sellingPrice || 0,
    }
    setItems(newItems)
  }

  const handleItemChange = (index: number, field: "quantity" | "unitPrice" | "discount", value: number) => {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      [field]: Math.max(0, value),
    }
    setItems(newItems)
  }

  const addItem = () => {
    setItems([
      ...items,
      { productId: products[0]?.id || "", quantity: 1, unitPrice: products[0]?.sellingPrice || 0, discount: 0 },
    ])
  }

  const removeItem = (index: number) => {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  // Live calculations
  let subtotal = 0
  items.forEach((it) => {
    subtotal += it.quantity * it.unitPrice - it.discount
  })
  const taxable = Math.max(0, subtotal - discountAmount)
  const tax = (taxable * taxRate) / 100
  const grandTotal = taxable + tax

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/sales/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          items,
          taxRate,
          discountAmount,
          notes,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create order")

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
      title="Create New Sales Order"
      description="Record a new customer order with automated tax and total calculation."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              required
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
            />
          </div>
        </div>

        {/* Line Items */}
        <div className="space-y-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-1">
            <span className="font-semibold text-slate-800">Order Items</span>
            <button
              type="button"
              onClick={addItem}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80">
                <div className="flex-1">
                  <select
                    value={item.productId}
                    onChange={(e) => handleProductChange(idx, e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-800 text-xs"
                    required
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-18">
                  <input
                    type="number"
                    min="1"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-800 text-xs text-center"
                    required
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Price"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(idx, "unitPrice", parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded bg-white border border-slate-200 text-slate-800 text-xs text-right"
                    required
                  />
                </div>
                <div className="w-24 text-right font-medium text-slate-800">
                  {formatCurrency(item.quantity * item.unitPrice - item.discount)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Calculations */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5 text-slate-600">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax ({taxRate}%):</span>
            <span className="font-medium text-slate-900">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200 text-sm font-semibold text-slate-900">
            <span>Total Amount:</span>
            <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Notes / Terms</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Delivery terms, special customer instructions..."
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
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Confirm & Save Order"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
