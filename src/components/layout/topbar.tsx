"use client"

import React, { useState } from "react"
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  User,
  Shield,
  Check,
  LogOut,
  ExternalLink,
} from "lucide-react"
import { DEMO_USERS, DEMO_COMPANY } from "@/lib/demo-data"

interface TopbarProps {
  currentRole: string
  currentUserName: string
  onRoleChange: (role: string) => void
}

export function Topbar({
  currentRole,
  currentUserName,
  onRoleChange,
}: TopbarProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const roles = [
    { role: "SUPER_ADMIN", label: "Super Admin", user: DEMO_USERS[0] },
    { role: "COMPANY_ADMIN", label: "Company Admin", user: DEMO_USERS[1] },
    { role: "FINANCE", label: "Finance & Accounts", user: DEMO_USERS[2] },
    { role: "SALES", label: "Sales & CRM", user: DEMO_USERS[3] },
    { role: "PURCHASING", label: "Purchasing", user: DEMO_USERS[4] },
    { role: "WAREHOUSE", label: "Warehouse & Stock", user: DEMO_USERS[5] },
    { role: "HR", label: "Human Resources", user: DEMO_USERS[6] },
    { role: "READ_ONLY", label: "Read Only Auditor", user: DEMO_USERS[7] },
  ]

  const activeRoleObj = roles.find((r) => r.role === currentRole) || roles[1]

  const notifications = [
    { id: 1, title: "Low Stock Alert: Online Smart Rack UPS 3000VA", time: "10m ago", type: "warning" },
    { id: 2, title: "Payment Recorded: $10,972.50 from Apex Horizon", time: "1h ago", type: "success" },
    { id: 3, title: "Leave Request Submitted: David Kowalski", time: "2h ago", type: "info" },
  ]

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Company Selector & Quick Search */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs font-medium text-slate-700">
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>{DEMO_COMPANY.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
            {DEMO_COMPANY.code}
          </span>
        </div>

        <div className="relative w-64 md:w-80 hidden sm:block">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders, products, invoices, accounts..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Right: Role Switcher, Notifications, User Profile */}
      <div className="flex items-center gap-3">
        {/* Interactive Role Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-800 border border-slate-200 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Role:</span>
            <span className="font-semibold text-blue-700">{activeRoleObj.label}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Switch Active Role (RBAC Demo)
                </p>
                <p className="text-[11px] text-slate-500">Test server-side permissions for each role</p>
              </div>
              <div className="max-h-60 overflow-y-auto py-1">
                {roles.map((r) => (
                  <button
                    key={r.role}
                    onClick={() => {
                      onRoleChange(r.role)
                      setRoleDropdownOpen(false)
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <p className="font-medium text-slate-800">{r.label}</p>
                      <p className="text-[10px] text-slate-400">{r.user.name}</p>
                    </div>
                    {currentRole === r.role && <Check className="w-4 h-4 text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600" />
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-800">Notifications</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">3 unread</span>
              </div>
              <div className="divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div key={n.id} className="p-3 text-xs hover:bg-slate-50 rounded-lg transition-colors">
                    <p className="font-medium text-slate-800">{n.title}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 mx-1" />

        {/* User Profile & Logout */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-xs shadow-xs">
            {currentUserName.charAt(0)}
          </div>
          <div className="hidden md:flex flex-col">
            <span className="text-xs font-semibold text-slate-900 leading-tight">{currentUserName}</span>
            <span className="text-[10px] text-slate-500 leading-tight">{activeRoleObj.label}</span>
          </div>

          <button
            onClick={async () => {
              try {
                await fetch("/api/auth/logout", { method: "POST" })
                window.location.href = "/login"
              } catch {
                window.location.href = "/login"
              }
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
