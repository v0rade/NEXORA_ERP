export function formatDocumentNumber(
  prefix: string,
  sequenceNumber: number,
  year: number = new Date().getFullYear(),
  padding: number = 5
): string {
  const padded = sequenceNumber.toString().padStart(padding, "0")
  return `${prefix}-${year}-${padded}`
}

export const DEFAULT_PREFIXES: Record<string, string> = {
  QUOTATION: "QUO",
  SALES_ORDER: "SO",
  DELIVERY: "DO",
  CUSTOMER_INVOICE: "INV",
  CUSTOMER_PAYMENT: "PAY-CUST",
  PURCHASE_REQUEST: "PR",
  PURCHASE_ORDER: "PO",
  GOODS_RECEIPT: "GR",
  SUPPLIER_BILL: "BILL",
  SUPPLIER_PAYMENT: "PAY-SUPP",
  JOURNAL_ENTRY: "JE",
  STOCK_MOVEMENT: "MOV",
  EXPENSE: "EXP",
}
