import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  const accounts = dataStore.accounts
  const totalAssets = accounts.filter((a) => a.type === "ASSET").reduce((sum, a) => sum + a.balance, 0)
  const totalLiabilities = accounts.filter((a) => a.type === "LIABILITY").reduce((sum, a) => sum + a.balance, 0)
  const totalEquity = accounts.filter((a) => a.type === "EQUITY").reduce((sum, a) => sum + a.balance, 0)
  const totalRevenue = accounts.filter((a) => a.type === "REVENUE").reduce((sum, a) => sum + a.balance, 0)
  const totalExpenses = accounts.filter((a) => a.type === "EXPENSE").reduce((sum, a) => sum + a.balance, 0)

  return NextResponse.json({
    accounts,
    summary: {
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses,
    },
  })
}
