import { describe, it, expect } from "vitest"
import { hasPermission, canAccessCompany } from "@/lib/permissions"
import { Role } from "@prisma/client"

describe("RBAC Permissions and Tenant Isolation", () => {
  it("grants SUPER_ADMIN unrestricted access to all modules and actions", () => {
    expect(hasPermission(Role.SUPER_ADMIN, "dashboard", "view")).toBe(true)
    expect(hasPermission(Role.SUPER_ADMIN, "finance", "post")).toBe(true)
    expect(hasPermission(Role.SUPER_ADMIN, "inventory", "delete")).toBe(true)
    expect(hasPermission(Role.SUPER_ADMIN, "settings", "create")).toBe(true)
  })

  it("enforces SALES role cannot access or post finance transactions", () => {
    expect(hasPermission(Role.SALES, "sales", "create")).toBe(true)
    expect(hasPermission(Role.SALES, "sales", "view")).toBe(true)
    expect(hasPermission(Role.SALES, "finance", "post")).toBe(false)
    expect(hasPermission(Role.SALES, "hr", "view")).toBe(false)
  })

  it("enforces WAREHOUSE role can transfer inventory but cannot post financial journals", () => {
    expect(hasPermission(Role.WAREHOUSE, "inventory", "update")).toBe(true)
    expect(hasPermission(Role.WAREHOUSE, "finance", "post")).toBe(false)
    expect(hasPermission(Role.WAREHOUSE, "finance", "view")).toBe(false)
  })

  it("enforces READ_ONLY role cannot create, update or delete any entity", () => {
    expect(hasPermission(Role.READ_ONLY, "sales", "view")).toBe(true)
    expect(hasPermission(Role.READ_ONLY, "sales", "create")).toBe(false)
    expect(hasPermission(Role.READ_ONLY, "inventory", "update")).toBe(false)
    expect(hasPermission(Role.READ_ONLY, "finance", "post")).toBe(false)
  })

  it("enforces strict company tenant isolation", () => {
    const userCompany = "comp-nexora-01"
    const foreignCompany = "comp-foreign-99"

    // Company Admin cannot access another company's records
    expect(canAccessCompany(Role.COMPANY_ADMIN, userCompany, userCompany)).toBe(true)
    expect(canAccessCompany(Role.COMPANY_ADMIN, userCompany, foreignCompany)).toBe(false)

    // Super Admin can access across companies
    expect(canAccessCompany(Role.SUPER_ADMIN, userCompany, foreignCompany)).toBe(true)
  })
})
