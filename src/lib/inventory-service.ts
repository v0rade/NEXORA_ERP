export interface StockValidationResult {
  isAllowed: boolean
  currentBalance: number
  resultingBalance: number
  errorMessage?: string
}

/**
 * Validates whether an inventory issue/transfer/adjustment is permitted.
 * By default, prevents stock from dropping below zero.
 */
export function validateStockReduction(
  currentBalance: number,
  quantityToDeduct: number,
  allowNegative: boolean = false
): StockValidationResult {
  const current = Number(currentBalance) || 0
  const deduct = Number(quantityToDeduct) || 0

  if (deduct <= 0) {
    return {
      isAllowed: false,
      currentBalance: current,
      resultingBalance: current,
      errorMessage: "Quantity to deduct must be greater than zero.",
    }
  }

  const resulting = current - deduct

  if (resulting < 0 && !allowNegative) {
    return {
      isAllowed: false,
      currentBalance: current,
      resultingBalance: resulting,
      errorMessage: `Insufficient stock balance. Current stock is ${current}, requested deduction is ${deduct}. Negative stock is not permitted.`,
    }
  }

  return {
    isAllowed: true,
    currentBalance: current,
    resultingBalance: resulting,
  }
}

/**
 * Validates a stock transfer between two warehouses.
 * Source warehouse must be different from target warehouse.
 */
export function validateStockTransfer(
  sourceWarehouseId: string,
  targetWarehouseId: string,
  currentSourceBalance: number,
  transferQuantity: number
): { isValid: boolean; errorMessage?: string } {
  if (sourceWarehouseId === targetWarehouseId) {
    return {
      isValid: false,
      errorMessage: "Source and target warehouses cannot be the same.",
    }
  }

  const check = validateStockReduction(currentSourceBalance, transferQuantity, false)
  if (!check.isAllowed) {
    return {
      isValid: false,
      errorMessage: check.errorMessage,
    }
  }

  return { isValid: true }
}
