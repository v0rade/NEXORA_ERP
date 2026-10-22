import { NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { getSessionUser } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = dataStore.salesOrders.find((so) => so.id === id)
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 })
  }
  return NextResponse.json({ order })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSessionUser()
    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Target status is required" }, { status: 400 })
    }

    const updated = dataStore.updateSalesOrderStatus(id, status, session?.name)
    return NextResponse.json({ success: true, order: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update order status" }, { status: 400 })
  }
}
