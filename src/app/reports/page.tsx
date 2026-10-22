"use client"

import React, { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { BarChart3, Download, FileSpreadsheet, Printer, DollarSign, Package, BookOpen } from "lucide-react"

export default function ReportsPage() {
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDownload = async (type: string) => {
    try {
      setDownloading(type)
      const res = await fetch(`/api/reports/export?type=${type}`)
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `nexora-${type}-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (e) {
      console.error("Export error", e)
    } finally {
      setDownloading(null)
    }
  }

  const reports = [
    {
      id: "sales",
      title: "Commercial Sales Ledger & Invoices",
      description: "Complete listing of customer orders, line items, taxes, discounts, and total recognized amounts.",
      icon: DollarSign,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      format: "CSV / Excel Compatible",
    },
    {
      id: "inventory",
      title: "Inventory Valuation & Stock on Hand",
      description: "Multi-warehouse balances, inventory cost valuation, SKU thresholds, and safety stock status.",
      icon: Package,
      color: "text-purple-600 bg-purple-50 border-purple-100",
      format: "CSV / Excel Compatible",
    },
    {
      id: "accounting",
      title: "General Ledger & Chart of Accounts Balance",
      description: "Double-entry verified account balances across Assets, Liabilities, Equity, Revenues, and Expenses.",
      icon: BookOpen,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      format: "CSV / Excel Compatible",
    },
  ]

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Executive Reporting & Data Exports</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Export compliant corporate records, financial ledgers, and operational datasets.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" /> Print Overview
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((r) => {
          const Icon = r.icon
          const isBusy = downloading === r.id
          return (
            <div
              key={r.id}
              className="bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-all space-y-4"
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${r.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">{r.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{r.description}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">{r.format}</span>
                <button
                  onClick={() => handleDownload(r.id)}
                  disabled={isBusy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  {isBusy ? "Exporting..." : "Download CSV"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </AppShell>
  )
}
