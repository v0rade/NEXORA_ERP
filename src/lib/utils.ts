import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(
  amount: number | string | { toString(): string } | null | undefined,
  currency: string = "USD",
  symbol: string = "$"
): string {
  if (amount === null || amount === undefined || amount === "") return `${symbol}0.00`
  const num = typeof amount === "number" ? amount : parseFloat(amount.toString())
  if (isNaN(num)) return `${symbol}0.00`
  
  return `${symbol}${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "-"
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-"
  const d = new Date(date)
  if (isNaN(d.getTime())) return "-"
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}
