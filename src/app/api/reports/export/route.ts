import { NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const reportType = searchParams.get("type") || "sales"

  let csvContent = ""
  let filename = `nexora-${reportType}-${new Date().toISOString().slice(0, 10)}.csv`

  if (reportType === "sales") {
    csvContent = "Order Number,Customer,Order Date,Status,Subtotal,Tax,Discount,Total\n"
    for (const so of dataStore.salesOrders) {
      csvContent += `"${so.orderNumber}","${so.customerName}","${so.orderDate.slice(0, 10)}","${so.status}",${so.subtotal},${so.taxAmount},${so.discountAmount},${so.totalAmount}\n`
    }
  } else if (reportType === "inventory") {
    csvContent = "SKU,Product Name,Cost Price,Selling Price,Total Stock,Min Stock,Status\n"
    for (const p of dataStore.products) {
      const balances = dataStore.stockBalances.filter((sb) => sb.productId === p.id)
      const totalQty = balances.reduce((sum, b) => sum + b.quantity, 0)
      const status = totalQty <= p.minStockLevel ? "LOW_STOCK" : "OPTIMAL"
      csvContent += `"${p.sku}","${p.name}",${p.costPrice},${p.sellingPrice},${totalQty},${p.minStockLevel},"${status}"\n`
    }
  } else if (reportType === "accounting") {
    csvContent = "Account Code,Account Name,Type,Subtype,Balance\n"
    for (const acc of dataStore.accounts) {
      csvContent += `"${acc.code}","${acc.name}","${acc.type}","${acc.subtype}",${acc.balance}\n`
    }
  } else {
    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
  }

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
