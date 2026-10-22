import { NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"
import { getSessionUser } from "@/lib/auth"

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser()
    const body = await req.json()
    const { invoiceId, amount, paymentMethod, referenceNumber, notes } = body

    if (!invoiceId || !amount || Number(amount) <= 0) {
      return NextResponse.json({ error: "Invoice ID and valid positive amount are required." }, { status: 400 })
    }

    const result = dataStore.recordCustomerPayment({
      invoiceId,
      amount: Number(amount),
      paymentMethod: paymentMethod || "BANK_TRANSFER",
      referenceNumber,
      notes,
      userName: session?.name,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to record payment" }, { status: 400 })
  }
}
