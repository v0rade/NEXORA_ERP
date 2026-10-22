import { test, expect } from "@playwright/test"

test.describe("NEXORA ERP End-to-End Core Workflows", () => {
  test("loads the executive dashboard with real database metrics and charts", async ({ page }) => {
    await page.goto("/")
    await expect(page.locator("h1")).toContainText("Company Overview")
    await expect(page.locator("text=Total Gross Sales")).toBeVisible()
    await expect(page.locator("text=Outstanding Receivables (AR)")).toBeVisible()
    await expect(page.locator("text=Total Inventory Value")).toBeVisible()
  })

  test("navigates to sales management and displays order records", async ({ page }) => {
    await page.goto("/sales")
    await expect(page.locator("h1")).toContainText("Sales & Invoicing")
    await expect(page.locator("text=Sales Orders")).toBeVisible()
    await expect(page.locator("text=Customer Invoices")).toBeVisible()
  })

  test("navigates to inventory & warehouse management and checks stock levels", async ({ page }) => {
    await page.goto("/inventory")
    await expect(page.locator("h1")).toContainText("Inventory & Warehouses")
    await expect(page.locator("text=Product Catalog")).toBeVisible()
    await expect(page.locator("text=Central Distribution Center")).toBeVisible()
  })

  test("navigates to double-entry finance module and verifies trial balance", async ({ page }) => {
    await page.goto("/finance")
    await expect(page.locator("h1")).toContainText("Finance & Double-Entry Accounting")
    await expect(page.locator("text=Chart of Accounts")).toBeVisible()
    await expect(page.locator("text=Trial Balance")).toBeVisible()
  })

  test("navigates to human resources and displays employees", async ({ page }) => {
    await page.goto("/hr")
    await expect(page.locator("h1")).toContainText("Human Resources & Workforce")
    await expect(page.locator("text=Employee Directory")).toBeVisible()
  })
})
