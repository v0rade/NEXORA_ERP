import React from "react"
import { cn } from "@/lib/utils"

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral" | "purple"
}

export function Badge({ children, variant = "default", className, ...props }: BadgeProps) {
  const variantStyles = {
    default: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
    warning: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
    danger: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10",
    info: "bg-sky-50 text-sky-700 border-sky-200 ring-sky-500/10",
    neutral: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10",
    purple: "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10",
  }

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const upper = (status || "").toUpperCase()
  let variant: "default" | "success" | "warning" | "danger" | "info" | "neutral" = "neutral"

  if (["PAID", "DELIVERED", "RECEIVED", "APPROVED", "POSTED", "OPTIMAL"].includes(upper)) {
    variant = "success"
  } else if (["CONFIRMED", "PROCESSING", "PARTIALLY_PAID", "PARTIALLY_DELIVERED", "PENDING"].includes(upper)) {
    variant = "warning"
  } else if (["OVERDUE", "CANCELLED", "REJECTED", "LOW_STOCK"].includes(upper)) {
    variant = "danger"
  } else if (["DRAFT", "PENDING_APPROVAL"].includes(upper)) {
    variant = "neutral"
  } else if (["SENT", "SHIPPED", "ACTIVE"].includes(upper)) {
    variant = "info"
  }

  const label = upper.replace(/_/g, " ")

  return <Badge variant={variant}>{label}</Badge>
}
