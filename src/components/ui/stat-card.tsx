import React from "react"
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  subtitle?: string
  trend?: {
    value: string
    isPositive: boolean
  }
  badge?: string
  className?: string
  iconColor?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  badge,
  className,
  iconColor = "text-blue-600 bg-blue-50 border-blue-100",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        <div className={cn("p-2.5 rounded-lg border", iconColor)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-100 text-slate-600">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center font-medium gap-0.5",
                trend.isPositive ? "text-emerald-600" : "text-rose-600"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {trend.value}
            </span>
          )}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </div>
  )
}
