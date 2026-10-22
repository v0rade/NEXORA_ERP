import { NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { getSessionUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser()
    const body = await req.json()
    const { productId, sourceWarehouseId, targetWarehouseId, quantity, notes } = body

    if (!productId || !sourceWarehouseId || !targetWarehouseId || !quantity || Number(quantity) <= 0) {
      return NextResponse.json(
        { error: "Product, source warehouse, target warehouse, and valid positive quantity are required." },
        { status: 400 }
      )
    }

    const result = dataStore.transferStock({
      productId,
      sourceWarehouseId,
      targetWarehouseId,
      quantity: Number(quantity),
      notes,
      userName: session?.name,
    })

    return NextResponse.json({ success: true, ...result }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to execute stock transfer" }, { status: 400 })
  }
}
