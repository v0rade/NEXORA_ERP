"use client"

import React, { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { StatusBadge, Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Landmark, Plus, BookOpen, CheckCircle, Scale, DollarSign, ArrowUpRight } from "lucide-react"
import { CreateJournalDialog } from "@/components/finance/create-journal-dialog"

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"accounts" | "journals" | "trial">("accounts")
  const [accounts, setAccounts] = useState<any[]>([])
  const [journals, setJournals] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const [accRes, jRes] = await Promise.all([
        fetch("/api/finance/accounts"),
        fetch("/api/finance/journal"),
      ])
      const accData = await accRes.json()
      const jData = await jRes.json()

      setAccounts(accData.accounts || [])
      setSummary(accData.summary || null)
      setJournals(jData.journalEntries || [])
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
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Finance & Double-Entry Accounting</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            GAAP Chart of accounts, general ledger, trial balance, and balanced journal entries.
          </p>
        </div>

        <button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Post Journal Entry
        </button>
      </div>

      {/* Accounting Financial Position Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider block">Total Assets</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">{formatCurrency(summary.totalAssets)}</span>
            <span className="text-[10px] text-emerald-600 font-medium">Cash, AR & Inventory</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider block">Total Liabilities</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">{formatCurrency(summary.totalLiabilities)}</span>
            <span className="text-[10px] text-slate-500">AP & Accrued obligations</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider block">Operating Revenue</span>
            <span className="text-lg font-bold text-blue-600 mt-1 block">{formatCurrency(summary.totalRevenue)}</span>
            <span className="text-[10px] text-slate-500">Recognized sales</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-xs">
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider block">Net Operating Income</span>
            <span className="text-lg font-bold text-emerald-600 mt-1 block">{formatCurrency(summary.netIncome)}</span>
            <span className="text-[10px] text-slate-500">Revenue minus expenses</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab("accounts")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "accounts" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Chart of Accounts ({accounts.length})
        </button>
        <button
          onClick={() => setActiveTab("journals")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "journals" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Journal Entries ({journals.length})
        </button>
        <button
          onClick={() => setActiveTab("trial")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "trial" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Trial Balance
        </button>
      </div>

      {/* Tab: Chart of Accounts */}
      {activeTab === "accounts" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Account Code</th>
                  <th className="px-4 py-3">Account Name</th>
                  <th className="px-4 py-3">Classification</th>
                  <th className="px-4 py-3">Subtype</th>
                  <th className="px-4 py-3 text-right">Current Ledger Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {accounts.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{a.code}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{a.name}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded font-medium text-[10px] bg-slate-100 text-slate-800">
                        {a.type}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{a.subtype.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                      {formatCurrency(a.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Journal Entries */}
      {activeTab === "journals" && (
        <div className="space-y-4">
          {journals.map((j) => (
            <div key={j.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{j.entryNumber}</span>
                    <StatusBadge status={j.status} />
                    <span className="text-xs text-slate-400">• {formatDate(j.entryDate)}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-medium">{j.description}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block uppercase">Balanced Amount</span>
                  <span className="text-sm font-bold text-slate-900">{formatCurrency(j.totalDebit)}</span>
                </div>
              </div>

              {/* Lines Breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-3 py-1.5">Account</th>
                      <th className="px-3 py-1.5">Memo / Description</th>
                      <th className="px-3 py-1.5 text-right">Debit ($)</th>
                      <th className="px-3 py-1.5 text-right">Credit ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {j.lines.map((l: any, idx: number) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 font-medium text-slate-800">
                          {l.accountCode} — {l.accountName}
                        </td>
                        <td className="px-3 py-2 text-slate-500">{l.description || "-"}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">
                          {l.debit > 0 ? formatCurrency(l.debit) : "-"}
                        </td>
                        <td className="px-3 py-2 text-right font-medium text-slate-900">
                          {l.credit > 0 ? formatCurrency(l.credit) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Trial Balance */}
      {activeTab === "trial" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs p-5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Unadjusted Trial Balance</h3>
            <p className="text-xs text-slate-500">Summary verification that total debits equal total credits across all accounts.</p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase">
              <tr>
                <th className="px-4 py-2.5">Code</th>
                <th className="px-4 py-2.5">Account Title</th>
                <th className="px-4 py-2.5 text-right">Debit Balance</th>
                <th className="px-4 py-2.5 text-right">Credit Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {accounts.map((a) => {
                const isDebit = a.type === "ASSET" || a.type === "EXPENSE"
                return (
                  <tr key={a.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-mono font-medium text-blue-600">{a.code}</td>
                    <td className="px-4 py-2.5 font-medium text-slate-900">{a.name}</td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {isDebit ? formatCurrency(a.balance) : "-"}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono">
                      {!isDebit ? formatCurrency(a.balance) : "-"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Dialog */}
      <CreateJournalDialog
        isOpen={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => loadData()}
        accounts={accounts}
      />
    </AppShell>
  )
}
