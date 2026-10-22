"use client"

import React, { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { ShieldCheck, Search, Clock, User, Filter } from "lucide-react"
import { formatDate } from "@/lib/utils"

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setLogs(data.auditLogs || [])
      })
      .catch(() => {})
  }, [])

  const filteredLogs = logs.filter(
    (l) =>
      l.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.userName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Enterprise Audit Log Trail</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically timestamped audit records for all commercial and accounting actions.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, entity or user..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity Type</th>
                <th className="px-4 py-3">Audit Details</th>
                <th className="px-4 py-3">Author</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-semibold px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-800 uppercase">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-slate-900">{log.entity}</td>
                  <td className="px-4 py-3.5 text-slate-700">{log.details}</td>
                  <td className="px-4 py-3.5 font-medium text-slate-900 flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                      {log.userName.charAt(0)}
                    </div>
                    {log.userName}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  )
}
