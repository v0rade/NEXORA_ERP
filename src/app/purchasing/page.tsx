"use client"

import React, { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { StatusBadge, Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Receipt, Search, Building2, CheckCircle2, FileText, ArrowRight } from "lucide-react"

export default function PurchasingPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "bills" | "suppliers">("orders")
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([])
  const [supplierBills, setSupplierBills] = useState<any[]>([])
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/purchasing/orders")
      const data = await res.json()
      setPurchaseOrders(data.purchaseOrders || [])
      setSupplierBills(data.supplierBills || [])
      setSuppliers(data.suppliers || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Purchasing & Vendor Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage procurement requests, official purchase orders, goods receipt verification, and vendor bills.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab("orders")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "orders" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Purchase Orders ({purchaseOrders.length})
        </button>
        <button
          onClick={() => setActiveTab("bills")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "bills" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Supplier Bills ({supplierBills.length})
        </button>
        <button
          onClick={() => setActiveTab("suppliers")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "suppliers" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Supplier Directory ({suppliers.length})
        </button>
      </div>

      {/* Tab: Purchase Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">PO Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Expected Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-blue-600">{po.poNumber}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{po.supplierName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(po.orderDate)}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(po.expectedDate)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={po.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(po.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Supplier Bills */}
      {activeTab === "bills" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Bill Number</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3">Bill Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Outstanding (AP)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {supplierBills.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{b.billNumber}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{b.supplierName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(b.billDate)}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(b.dueDate)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(b.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-emerald-600">
                      {formatCurrency(b.paidAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(b.outstandingAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Supplier Directory */}
      {activeTab === "suppliers" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-blue-600">{s.code}</span>
                <Badge variant="success">Active Vendor</Badge>
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">{s.name}</h3>
                <p className="text-xs text-slate-500">{s.email}</p>
                <p className="text-xs text-slate-500">{s.phone}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                <p>Terms: <strong className="text-slate-900">Net {s.paymentTermsDays} Days</strong></p>
                <p>Remittance: <strong className="text-slate-900">{s.bankAccount}</strong></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
