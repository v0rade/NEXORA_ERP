"use client"

import React, { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { Topbar } from "./topbar"
import { DEMO_USERS } from "@/lib/demo-data"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [currentRole, setCurrentRole] = useState("COMPANY_ADMIN")
  const [currentUserName, setCurrentUserName] = useState("Eleanor Vance")

  useEffect(() => {
    // Sync active role with API
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setCurrentRole(data.user.role)
          setCurrentUserName(data.user.name)
        }
      })
      .catch(() => {})
  }, [])

  const handleRoleChange = async (newRole: string) => {
    setCurrentRole(newRole)
    const matched = DEMO_USERS.find((u) => u.role === newRole)
    if (matched) {
      setCurrentUserName(matched.name)
    }

    try {
      await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
    } catch {}
  }

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      {/* Dark Navy Sidebar */}
      <Sidebar currentRole={currentRole} />

      {/* Main View Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar
          currentRole={currentRole}
          currentUserName={currentUserName}
          onRoleChange={handleRoleChange}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
