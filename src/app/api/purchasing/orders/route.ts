import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  return NextResponse.json({
    purchaseOrders: dataStore.purchaseOrders,
    supplierBills: dataStore.supplierBills,
    suppliers: dataStore.suppliers,
  })
}
