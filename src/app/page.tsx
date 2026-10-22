"use client"

import React, { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { StatCard } from "@/components/ui/stat-card"
import { StatusBadge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  RefreshCw,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts"
import Link from "next/link"
import { CreateOrderDialog } from "@/components/sales/create-order-dialog"
import { TransferDialog } from "@/components/inventory/transfer-dialog"
import { CreateJournalDialog } from "@/components/finance/create-journal-dialog"

export default function DashboardPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Dialogs
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [transferDialogOpen, setTransferDialogOpen] = useState(false)
  const [journalDialogOpen, setJournalDialogOpen] = useState(false)

  // Resources for dialogs
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [accounts, setAccounts] = useState([])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/dashboard")
      const json = await res.json()
      setData(json)

      // Fetch helper resources for dialogs
      const [salesRes, invRes, finRes] = await Promise.all([
        fetch("/api/sales/orders"),
        fetch("/api/inventory/products"),
        fetch("/api/finance/accounts"),
      ])
      const salesJson = await salesRes.json()
      const invJson = await invRes.json()
      const finJson = await finRes.json()

      setCustomers(salesJson.customers || [])
      setProducts(salesJson.products || [])
      setWarehouses(invJson.warehouses || [])
      setAccounts(finJson.accounts || [])
    } catch (e) {
      console.error("Dashboard load error", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboardData()
  }, [])

  const metrics = data?.metrics || {
    totalSales: 23805.1,
    outstandingReceivables: 9576.0,
    outstandingPayables: 7500.0,
    totalInventoryValue: 88720.0,
    lowStockCount: 1,
  }

  return (
    <AppShell>
      {/* Page Title & Contextual Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Company Overview</h1>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Live Database
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time business performance, inventory position, and cash flow summary.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" /> Refresh
          </button>
          <button
            onClick={() => setOrderDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" /> New Sales Order
          </button>
          <button
            onClick={() => setTransferDialogOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-xs"
          >
            <Package className="w-3.5 h-3.5" /> Transfer Stock
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Gross Sales"
          value={formatCurrency(metrics.totalSales)}
          icon={TrendingUp}
          trend={{ value: "+14.8% vs last mo", isPositive: true }}
          iconColor="text-blue-600 bg-blue-50 border-blue-100"
        />
        <StatCard
          title="Outstanding Receivables (AR)"
          value={formatCurrency(metrics.outstandingReceivables)}
          icon={DollarSign}
          subtitle="Customer invoices due"
          iconColor="text-amber-600 bg-amber-50 border-amber-100"
        />
        <StatCard
          title="Outstanding Payables (AP)"
          value={formatCurrency(metrics.outstandingPayables)}
          icon={Receipt}
          subtitle="Vendor bills queued"
          iconColor="text-purple-600 bg-purple-50 border-purple-100"
        />
        <StatCard
          title="Total Inventory Value"
          value={formatCurrency(metrics.totalInventoryValue)}
          icon={Package}
          badge={metrics.lowStockCount > 0 ? `${metrics.lowStockCount} Low Stock` : "Healthy"}
          iconColor={
            metrics.lowStockCount > 0
              ? "text-rose-600 bg-rose-50 border-rose-100"
              : "text-emerald-600 bg-emerald-50 border-emerald-100"
          }
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Purchasing Trend */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Revenue & Purchasing Trajectory</h3>
              <p className="text-xs text-slate-500">6-Month historical comparison</p>
            </div>
            <span className="text-xs font-medium text-slate-500">USD ($)</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.salesTrend || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="purchGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                  formatter={(val: any) => formatCurrency(val)}
                />
                <Area type="monotone" dataKey="sales" name="Sales Revenue" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#salesGrad)" />
                <Area type="monotone" dataKey="purchases" name="Purchases" stroke="#9333ea" strokeWidth={2} fillOpacity={1} fill="url(#purchGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Contribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Revenue by Category</h3>
            <p className="text-xs text-slate-500">Gross revenue vs product cost</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.revenueExpenses || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tickLine={false} axisLine={false} tick={false} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", border: "none", borderRadius: "8px", color: "#fff", fontSize: "11px" }}
                  formatter={(val: any) => formatCurrency(val)}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cogs" name="COGS" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Grids: Recent Orders & Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales Orders */}
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Recent Sales Orders</h3>
              <p className="text-xs text-slate-500">Latest commercial transactions</p>
            </div>
            <Link href="/sales" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Order #</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(data?.recentOrders || []).map((o: any) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-blue-600">{o.orderNumber}</td>
                    <td className="px-4 py-3 font-medium text-slate-900">{o.customerName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(o.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customer Invoices & Balances */}
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Customer Invoices & Aging</h3>
              <p className="text-xs text-slate-500">Outstanding billing status</p>
            </div>
            <Link href="/sales" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Invoicing <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Invoice #</th>
                  <th className="px-4 py-2.5">Customer</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">Outstanding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {(data?.recentInvoices || []).map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3">{inv.customerName}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900">
                      {formatCurrency(inv.outstandingAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* System Audit Trail Stream */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-900">Enterprise Audit Log Stream</h3>
          </div>
          <Link href="/audit" className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
            Full Audit History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {(data?.auditLogs || []).map((log: any) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 uppercase">
                  {log.action}
                </span>
                <span className="text-slate-800">{log.details}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-400 text-[11px]">
                <span className="font-medium text-slate-600">{log.userName}</span>
                <span>{formatDate(log.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Modals */}
      <CreateOrderDialog
        isOpen={orderDialogOpen}
        onClose={() => setOrderDialogOpen(false)}
        onSuccess={() => loadDashboardData()}
        customers={customers}
        products={products}
      />

      <TransferDialog
        isOpen={transferDialogOpen}
        onClose={() => setTransferDialogOpen(false)}
        onSuccess={() => loadDashboardData()}
        products={products}
        warehouses={warehouses}
      />

      <CreateJournalDialog
        isOpen={journalDialogOpen}
        onClose={() => setJournalDialogOpen(false)}
        onSuccess={() => loadDashboardData()}
        accounts={accounts}
      />
    </AppShell>
  )
}
