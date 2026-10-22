import { NextResponse } from "next/server"
import { dataStore } from "@/lib/data-store"

export async function GET() {
  const productsWithStock = dataStore.products.map((p) => {
    const balances = dataStore.stockBalances.filter((sb) => sb.productId === p.id)
    const totalQty = balances.reduce((sum, b) => sum + b.quantity, 0)
    const reservedQty = balances.reduce((sum, b) => sum + b.reservedQuantity, 0)
    const category = dataStore.categories.find((c) => c.id === p.categoryId)
    const uom = dataStore.uoms.find((u) => u.id === p.uomId)
    return {
      ...p,
      categoryName: category?.name || "General",
      uomSymbol: uom?.symbol || "PCS",
      totalStock: totalQty,
      reservedStock: reservedQty,
      availableStock: Math.max(0, totalQty - reservedQty),
      isLowStock: totalQty <= p.minStockLevel,
      warehouseBalances: balances.map((b) => {
        const wh = dataStore.warehouses.find((w) => w.id === b.warehouseId)
        return {
          warehouseId: b.warehouseId,
          warehouseName: wh?.name || "Warehouse",
          warehouseCode: wh?.code || "",
          quantity: b.quantity,
          reservedQuantity: b.reservedQuantity,
        }
      }),
    }
  })

  return NextResponse.json({
    products: productsWithStock,
    warehouses: dataStore.warehouses,
    categories: dataStore.categories,
    movements: dataStore.stockMovements,
  })
}
