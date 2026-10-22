import { NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { getSessionUser } from "@/lib/auth"

export async function GET() {
  return NextResponse.json({
    orders: dataStore.salesOrders,
    customers: dataStore.customers,
    products: dataStore.products,
  })
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser()
    const body = await req.json()
    const { customerId, items, taxRate, discountAmount, notes } = body

    if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Customer and at least one line item are required." },
        { status: 400 }
      )
    }

    const order = dataStore.createSalesOrder({
      customerId,
      items,
      taxRate,
      discountAmount,
      notes,
      createdByName: session?.name || "Admin User",
    })

    return NextResponse.json({ success: true, order }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create sales order" }, { status: 400 })
  }
}
