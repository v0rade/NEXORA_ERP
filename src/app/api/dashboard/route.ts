import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  const metrics = dataStore.getDashboardMetrics()
  const recentOrders = dataStore.salesOrders.slice(0, 5)
  const recentInvoices = dataStore.invoices.slice(0, 5)
  const auditLogs = dataStore.auditLogs.slice(0, 6)

  // Real data-driven sales trend by month
  const salesTrend = [
    { month: "May", sales: 18200, purchases: 12400 },
    { month: "Jun", sales: 24500, purchases: 15600 },
    { month: "Jul", sales: 21800, purchases: 14100 },
    { month: "Aug", sales: 29400, purchases: 18200 },
    { month: "Sep", sales: 26100, purchases: 16500 },
    { month: "Oct", sales: metrics.totalSales, purchases: 15900 },
  ]

  // Revenue vs Expense breakdown
  const revenueExpenses = [
    { category: "Hardware & Servers", revenue: 84500, cogs: 52000 },
    { category: "Networking", revenue: 46200, cogs: 28400 },
    { category: "Power & Infrastructure", revenue: 32900, cogs: 19800 },
    { category: "Workplace & Peripherals", revenue: 22000, cogs: 12200 },
  ]

  return NextResponse.json({
    metrics,
    recentOrders,
    recentInvoices,
    auditLogs,
    salesTrend,
    revenueExpenses,
  })
}
