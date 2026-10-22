"use client"

import React, { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { StatusBadge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Plus, Search, FileText, CheckCircle2, Truck, CreditCard, Printer, ArrowRight } from "lucide-react"
import { CreateOrderDialog } from "@/components/sales/create-order-dialog"
import { RecordPaymentDialog } from "@/components/sales/record-payment-dialog"
import { Modal } from "@/components/ui/modal"

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "invoices" | "customers">("orders")
  const [orders, setOrders] = useState<any[]>([])
  const [invoices, setInvoices] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [createOrderOpen, setCreateOrderOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [printModalInvoice, setPrintModalInvoice] = useState<any>(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const [ordersRes, invRes] = await Promise.all([
        fetch("/api/sales/orders"),
        fetch("/api/sales/invoices"),
      ])
      const ordersData = await ordersRes.json()
      const invData = await invRes.json()

      setOrders(ordersData.orders || [])
      setCustomers(ordersData.customers || [])
      setProducts(ordersData.products || [])
      setInvoices(invData.invoices || [])
    } catch (e) {
      console.error("Sales data error", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/sales/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateInvoice = async (orderId: string) => {
    try {
      const res = await fetch("/api/sales/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salesOrderId: orderId }),
      })
      if (res.ok) {
        await loadData()
        setActiveTab("invoices")
      }
    } catch (e) {
      console.error(e)
    }
  }

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Sales & Invoicing</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer quotes, sales orders, fulfillment deliveries, invoices, and payments.
          </p>
        </div>

        <button
          onClick={() => setCreateOrderOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Create Sales Order
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "orders" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Sales Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "invoices" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Customer Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "customers" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Customers Directory ({customers.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Tab Content: Sales Orders */}
      {activeTab === "orders" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Order #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Order Date</th>
                  <th className="px-4 py-3">Delivery Est.</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Workflow Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-blue-600">{o.orderNumber}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{o.customerName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(o.orderDate)}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(o.expectedDeliveryDate)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                      {formatCurrency(o.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {o.status === "CONFIRMED" && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, "PROCESSING")}
                            className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                          >
                            Process
                          </button>
                        )}
                        {o.status === "PROCESSING" && (
                          <button
                            onClick={() => handleUpdateStatus(o.id, "DELIVERED")}
                            className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-medium transition-colors flex items-center gap-1"
                          >
                            <Truck className="w-3 h-3" /> Mark Delivered
                          </button>
                        )}
                        {o.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCreateInvoice(o.id)}
                            className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium transition-colors flex items-center gap-1"
                          >
                            <FileText className="w-3 h-3" /> Invoice
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Customer Invoices */}
      {activeTab === "invoices" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-right">Paid</th>
                  <th className="px-4 py-3 text-right">Balance Due</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{inv.invoiceNumber}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{inv.customerName}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(inv.issueDate)}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(inv.dueDate)}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={inv.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-slate-700">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-medium text-emerald-600">
                      {formatCurrency(inv.paidAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                      {formatCurrency(inv.outstandingAmount)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setPrintModalInvoice(inv)}
                          className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                          title="Print Official Document"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {inv.outstandingAmount > 0 && (
                          <button
                            onClick={() => {
                              setSelectedInvoice(inv)
                              setPaymentDialogOpen(true)
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center gap-1"
                          >
                            <CreditCard className="w-3 h-3" /> Record Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Customers Directory */}
      {activeTab === "customers" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Customer Name</th>
                  <th className="px-4 py-3">Email & Contact</th>
                  <th className="px-4 py-3">Billing Address</th>
                  <th className="px-4 py-3">Terms</th>
                  <th className="px-4 py-3 text-right">Credit Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-blue-600">{c.code}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-900">{c.name}</td>
                    <td className="px-4 py-3.5 text-slate-500">{c.email || c.phone}</td>
                    <td className="px-4 py-3.5 text-slate-500">{c.address}, {c.city}</td>
                    <td className="px-4 py-3.5">Net {c.paymentTermsDays} Days</td>
                    <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                      {formatCurrency(c.creditLimit)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Invoice Modal */}
      {printModalInvoice && (
        <Modal
          isOpen={!!printModalInvoice}
          onClose={() => setPrintModalInvoice(null)}
          title={`Official Invoice: ${printModalInvoice.invoiceNumber}`}
          description="Document formatted for corporate dispatch and printing."
          maxWidth="2xl"
        >
          <div className="space-y-6 text-xs p-2">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">INVOICE</h2>
                <p className="text-slate-500 font-medium">#{printModalInvoice.invoiceNumber}</p>
                <div className="mt-2">
                  <StatusBadge status={printModalInvoice.status} />
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">Nexora Dynamics Inc.</p>
                <p className="text-slate-500">100 Innovation Way, Suite 400</p>
                <p className="text-slate-500">Chicago, IL 60601 • US-987654321</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bill To:</p>
                <p className="font-semibold text-slate-900 mt-1">{printModalInvoice.customerName}</p>
                <p className="text-slate-500">Payment Terms: Net 30 Days</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Invoice Details:</p>
                <p className="text-slate-600 mt-1">Issue Date: {formatDate(printModalInvoice.issueDate)}</p>
                <p className="text-slate-600">Due Date: {formatDate(printModalInvoice.dueDate)}</p>
              </div>
            </div>

            {/* Financial Totals Summary */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200/80 space-y-2 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(printModalInvoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax ({printModalInvoice.taxRate || 5}%):</span>
                <span>{formatCurrency(printModalInvoice.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Invoice Total:</span>
                <span className="text-blue-600">{formatCurrency(printModalInvoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Amount Paid:</span>
                <span>{formatCurrency(printModalInvoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                <span>Outstanding Balance:</span>
                <span className="text-rose-600">{formatCurrency(printModalInvoice.outstandingAmount)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" /> Print / Save PDF
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modals */}
      <CreateOrderDialog
        isOpen={createOrderOpen}
        onClose={() => setCreateOrderOpen(false)}
        onSuccess={() => loadData()}
        customers={customers}
        products={products}
      />

      <RecordPaymentDialog
        isOpen={paymentDialogOpen}
        onClose={() => {
          setPaymentDialogOpen(false)
          setSelectedInvoice(null)
        }}
        onSuccess={() => loadData()}
        invoice={selectedInvoice}
      />
    </AppShell>
  )
}
