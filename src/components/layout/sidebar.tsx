"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Landmark,
  Users,
  BarChart3,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Layers,
  ArrowRightLeft,
  Building2,
  FileSpreadsheet,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface SidebarProps {
  currentRole?: string
}

export function Sidebar({ currentRole = "COMPANY_ADMIN" }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navGroups = [
    {
      title: "Core",
      items: [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Operations",
      items: [
        { href: "/sales", label: "Sales & Invoicing", icon: ShoppingCart },
        { href: "/purchasing", label: "Purchasing & Bills", icon: Receipt },
        { href: "/inventory", label: "Inventory & Warehouses", icon: Package },
      ],
    },
    {
      title: "Financials",
      items: [
        { href: "/finance", label: "Finance & Accounts", icon: Landmark },
        { href: "/reports", label: "Reports & Exports", icon: BarChart3 },
      ],
    },
    {
      title: "Organization",
      items: [
        { href: "/hr", label: "Human Resources", icon: Users },
        { href: "/audit", label: "Audit Logs", icon: ShieldCheck },
      ],
    },
  ]

  return (
    <aside
      className={cn(
        "relative flex flex-col bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 z-30 shrink-0",
        collapsed ? "w-18" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80">
        <Link href="/" className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-600 text-white font-bold shrink-0 shadow-sm shadow-blue-500/20">
            N
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-white tracking-wide text-sm">NEXORA ERP</span>
              <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">
                Enterprise Cloud
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 py-4 overflow-y-auto px-3 space-y-6">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {!collapsed && (
              <h4 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                {group.title}
              </h4>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative",
                      isActive
                        ? "bg-blue-600 text-white shadow-xs shadow-blue-600/30"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/70"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("w-5 h-5 shrink-0", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200")} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tenant / Company Info Card */}
      <div className="p-3 border-t border-slate-800/80">
        {!collapsed ? (
          <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-blue-400 shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-white truncate">Nexora Dynamics Inc.</p>
              <p className="text-[10px] text-slate-400 truncate">Tenant: NEX (Chicago HQ)</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-1" title="Nexora Dynamics Inc.">
            <Building2 className="w-5 h-5 text-blue-400" />
          </div>
        )}
      </div>
    </aside>
  )
}
