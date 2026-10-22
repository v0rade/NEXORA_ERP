"use client"

import React, { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { StatusBadge, Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Package, ArrowRightLeft, Search, AlertTriangle, Layers, Building, History, Plus } from "lucide-react"
import { TransferDialog } from "@/components/inventory/transfer-dialog"

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<"catalog" | "warehouses" | "movements">("catalog")
  const [products, setProducts] = useState<any[]>([])
  const [warehouses, setWarehouses] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [movements, setMovements] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [lowStockOnly, setLowStockOnly] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/inventory/products")
      const json = await res.json()
      setProducts(json.products || [])
      setWarehouses(json.warehouses || [])
      setCategories(json.categories || [])
      setMovements(json.movements || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    if (lowStockOnly) return matchesSearch && p.isLowStock
    return matchesSearch
  })

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Inventory & Warehouses</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Multi-location stock balances, traceable movement records, and reorder thresholds.
          </p>
        </div>

        <button
          onClick={() => setTransferDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
        >
          <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Stock Between Warehouses
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "catalog" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Product Catalog ({products.length})
          </button>
          <button
            onClick={() => setActiveTab("warehouses")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "warehouses" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Warehouses ({warehouses.length})
          </button>
          <button
            onClick={() => setActiveTab("movements")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "movements" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Stock Movements History ({movements.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "catalog" && (
            <button
              onClick={() => setLowStockOnly(!lowStockOnly)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                lowStockOnly
                  ? "bg-rose-50 border-rose-200 text-rose-700"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Alerts
            </button>
          )}

          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter by SKU or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Tab: Catalog */}
      {activeTab === "catalog" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">SKU & Barcode</th>
                  <th className="px-4 py-3">Product Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Cost Price</th>
                  <th className="px-4 py-3 text-right">Selling Price</th>
                  <th className="px-4 py-3 text-right">Total Stock</th>
                  <th className="px-4 py-3 text-right">Min Threshold</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Warehouse Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-blue-600 block">{p.sku}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{p.barcode || "N/A"}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-900 block">{p.name}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">{p.description}</span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{p.categoryName}</td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-600">
                      {formatCurrency(p.costPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                      {formatCurrency(p.sellingPrice)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-bold text-slate-900 text-sm">{p.totalStock}</span>{" "}
                      <span className="text-[10px] text-slate-400">{p.uomSymbol}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-500">
                      {p.minStockLevel} {p.uomSymbol}
                    </td>
                    <td className="px-4 py-3.5">
                      {p.isLowStock ? (
                        <Badge variant="danger">Low Stock</Badge>
                      ) : (
                        <Badge variant="success">Optimal</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="inline-flex flex-col gap-0.5 text-[11px]">
                        {p.warehouseBalances.map((wb: any) => (
                          <span key={wb.warehouseId} className="text-slate-600">
                            <strong className="text-slate-900">{wb.warehouseCode}:</strong> {wb.quantity}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Warehouses */}
      {activeTab === "warehouses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {warehouses.map((w) => (
            <div key={w.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">{w.name}</h3>
                    <p className="text-xs text-slate-500">{w.location}</p>
                  </div>
                </div>
                {w.isDefault && <Badge variant="info">Primary Default</Badge>}
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span>Facility Code: <strong className="text-slate-900">{w.code}</strong></span>
                <span className="text-emerald-600 font-medium">Operational</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Stock Movements History */}
      {activeTab === "movements" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Movement #</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Warehouse</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3">Reference / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{m.movementNumber}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(m.createdAt)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={m.movementType} />
                    </td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{m.productName}</td>
                    <td className="px-4 py-3.5 text-slate-600">{m.warehouseName}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {m.quantity}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{m.notes || m.referenceType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dialog */}
      <TransferDialog
        isOpen={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onSuccess={() => loadData()}
        products={products}
        warehouses={warehouses}
      />
    </AppShell>
  )
}
