"use client"

import React, { useState, useEffect } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { StatusBadge, Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import { Users, Calendar, Check, X, Clock, Briefcase, Plus, UserCheck } from "lucide-react"
import { Modal } from "@/components/ui/modal"

export default function HRPage() {
  const [activeTab, setActiveTab] = useState<"employees" | "leave" | "departments">("employees")
  const [employees, setEmployees] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])
  const [leaveRequests, setLeaveRequests] = useState<any[]>([])
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Leave form state
  const [employeeId, setEmployeeId] = useState("")
  const [leaveType, setLeaveType] = useState("ANNUAL")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [daysCount, setDaysCount] = useState(1)
  const [reason, setReason] = useState("")

  const loadData = async () => {
    try {
      setLoading(true)
      const [empRes, leaveRes] = await Promise.all([
        fetch("/api/hr/employees"),
        fetch("/api/hr/leave"),
      ])
      const empData = await empRes.json()
      const leaveData = await leaveRes.json()

      setEmployees(empData.employees || [])
      setDepartments(empData.departments || [])
      setLeaveRequests(leaveData.leaveRequests || [])
      if (empData.employees?.length > 0) {
        setEmployeeId(empData.employees[0].id)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleApproveLeave = async (leaveId: string) => {
    try {
      const res = await fetch("/api/hr/leave", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaveId }),
      })
      if (res.ok) loadData()
    } catch (e) {
      console.error(e)
    }
  }

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/hr/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId,
          leaveType,
          startDate,
          endDate,
          daysCount,
          reason,
        }),
      })
      if (res.ok) {
        setLeaveModalOpen(false)
        loadData()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Human Resources & Workforce</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Staff directory, department assignments, and time-off leave approval workflows.
          </p>
        </div>

        <button
          onClick={() => setLeaveModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /> Submit Leave Request
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab("employees")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "employees" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Employee Directory ({employees.length})
        </button>
        <button
          onClick={() => setActiveTab("leave")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "leave" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Leave Management ({leaveRequests.length})
        </button>
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === "departments" ? "bg-white text-slate-900 shadow-xs font-semibold" : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Departments ({departments.length})
        </button>
      </div>

      {/* Tab: Employees */}
      {activeTab === "employees" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee #</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Job Title</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Hire Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono font-semibold text-blue-600">{e.employeeNumber}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">
                      {e.firstName} {e.lastName}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{e.departmentName}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-800">{e.jobTitle}</td>
                    <td className="px-4 py-3.5 text-slate-500">{e.email || e.phone}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant="success">{e.employmentStatus}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(e.hireDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Leave Requests */}
      {activeTab === "leave" && (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">End Date</th>
                  <th className="px-4 py-3 text-center">Days</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Approval Workflow</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {leaveRequests.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{l.employeeName}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800">
                        {l.leaveType}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(l.startDate)}</td>
                    <td className="px-4 py-3.5 text-slate-500">{formatDate(l.endDate)}</td>
                    <td className="px-4 py-3.5 text-center font-bold text-slate-900">{l.daysCount}</td>
                    <td className="px-4 py-3.5 text-slate-600">{l.reason}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={l.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {l.status === "PENDING" ? (
                        <button
                          onClick={() => handleApproveLeave(l.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center gap-1 ml-auto"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Leave
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Reviewed by {l.reviewedBy}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Departments */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {departments.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs space-y-2">
              <span className="font-mono text-xs font-bold text-blue-600">{d.code}</span>
              <h3 className="font-semibold text-slate-900 text-sm">{d.name}</h3>
              <p className="text-xs text-slate-500">{d.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Leave Request Dialog */}
      <Modal
        isOpen={leaveModalOpen}
        onClose={() => setLeaveModalOpen(false)}
        title="Submit Employee Leave Request"
        description="Formal time-off application subject to management authorization."
        maxWidth="md"
      >
        <form onSubmit={handleSubmitLeave} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Employee</label>
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              required
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName} ({e.jobTitle})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Leave Classification</label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
            >
              <option value="ANNUAL">Annual Vacation Leave</option>
              <option value="SICK">Medical / Sick Leave</option>
              <option value="EMERGENCY">Emergency Personal Leave</option>
              <option value="UNPAID">Unpaid Leave of Absence</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Working Days Count</label>
            <input
              type="number"
              min="1"
              required
              value={daysCount}
              onChange={(e) => setDaysCount(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reason / Justification</label>
            <textarea
              required
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800"
              placeholder="e.g. Pre-planned family trip, doctor appointment..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setLeaveModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
