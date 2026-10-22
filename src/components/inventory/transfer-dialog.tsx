"use client"

import React, { useState } from "react"
import { Modal } from "@/components/ui/modal"

interface Warehouse {
  id: string
  name: string
  code: string
}

interface Product {
  id: string
  name: string
  sku: string
  totalStock: number
  availableStock: number
}

interface TransferDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  products: Product[]
  warehouses: Warehouse[]
}

export function TransferDialog({
  isOpen,
  onClose,
  onSuccess,
  products,
  warehouses,
}: TransferDialogProps) {
  const [productId, setProductId] = useState(products[0]?.id || "")
  const [sourceWarehouseId, setSourceWarehouseId] = useState(warehouses[0]?.id || "")
  const [targetWarehouseId, setTargetWarehouseId] = useState(warehouses[1]?.id || warehouses[0]?.id || "")
  const [quantity, setQuantity] = useState(1)
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedProduct = products.find((p) => p.id === productId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/inventory/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          sourceWarehouseId,
          targetWarehouseId,
          quantity,
          notes,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Transfer failed")

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
      title="Inter-Warehouse Stock Transfer"
      description="Transfer physical stock items between warehouses with traceable movement audit."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {error && (
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block font-medium text-slate-700 mb-1">Select Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
            required
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku}) — Available: {p.availableStock}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Source Warehouse</label>
            <select
              value={sourceWarehouseId}
              onChange={(e) => setSourceWarehouseId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              required
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Destination Warehouse</label>
            <select
              value={targetWarehouseId}
              onChange={(e) => setTargetWarehouseId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              required
            >
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Transfer Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold"
            required
          />
        </div>

        <div>
          <label className="block font-medium text-slate-700 mb-1">Transfer Reason / Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Replenish West Coast regional inventory"
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
            disabled={isSubmitting || sourceWarehouseId === targetWarehouseId}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Executing Transfer..." : "Execute Transfer"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
