import { NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { getSessionUser } from "@/lib/auth"

export async function GET() {
  return NextResponse.json({
    invoices: dataStore.invoices,
    customers: dataStore.customers,
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser()
    const body = await req.json()
    const { salesOrderId } = body

    if (!salesOrderId) {
      return NextResponse.json({ error: "Sales Order ID is required" }, { status: 400 })
    }

    const invoice = dataStore.createInvoiceFromOrder(salesOrderId, session?.name)
    return NextResponse.json({ success: true, invoice }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate invoice" }, { status: 400 })
  }
}
