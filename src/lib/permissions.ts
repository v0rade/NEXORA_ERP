import { Role } from "@prisma/client"

export type AppPermissionModule =
  | "dashboard"
  | "sales"
  | "purchasing"
  | "inventory"
  | "finance"
  | "hr"
  | "reports"
  | "audit"
  | "settings"

export type AppPermissionAction =
  | "view"
  | "create"
  | "update"
  | "delete"
  | "approve"
  | "post"
  | "export"

const ROLE_PERMISSIONS: Record<
  Role,
  Record<AppPermissionModule, AppPermissionAction[]>
> = {
  SUPER_ADMIN: {
    dashboard: ["view", "export"],
    sales: ["view", "create", "update", "delete", "approve", "post", "export"],
    purchasing: ["view", "create", "update", "delete", "approve", "post", "export"],
    inventory: ["view", "create", "update", "delete", "approve", "post", "export"],
    finance: ["view", "create", "update", "delete", "approve", "post", "export"],
    hr: ["view", "create", "update", "delete", "approve", "post", "export"],
    reports: ["view", "export"],
    audit: ["view", "export"],
    settings: ["view", "create", "update", "delete", "export"],
  },
  COMPANY_ADMIN: {
    dashboard: ["view", "export"],
    sales: ["view", "create", "update", "delete", "approve", "post", "export"],
    purchasing: ["view", "create", "update", "delete", "approve", "post", "export"],
    inventory: ["view", "create", "update", "delete", "approve", "post", "export"],
    finance: ["view", "create", "update", "delete", "approve", "post", "export"],
    hr: ["view", "create", "update", "delete", "approve", "post", "export"],
    reports: ["view", "export"],
    audit: ["view", "export"],
    settings: ["view", "update", "export"],
  },
  FINANCE: {
    dashboard: ["view", "export"],
    sales: ["view", "update", "post", "export"], // Invoices and payments
    purchasing: ["view", "update", "post", "export"], // Bills and payments
    inventory: ["view", "export"], // View stock valuations
    finance: ["view", "create", "update", "approve", "post", "export"],
    hr: ["view"],
    reports: ["view", "export"],
    audit: ["view"],
    settings: ["view"],
  },
  SALES: {
    dashboard: ["view"],
    sales: ["view", "create", "update", "approve", "export"],
    purchasing: [],
    inventory: ["view"], // Check available stock
    finance: ["view"], // View customer balance/credit limit
    hr: [],
    reports: ["view", "export"],
    audit: [],
    settings: [],
  },
  PURCHASING: {
    dashboard: ["view"],
    sales: [],
    purchasing: ["view", "create", "update", "approve", "export"],
    inventory: ["view"], // Check stock levels
    finance: ["view"], // Check supplier balance
    hr: [],
    reports: ["view", "export"],
    audit: [],
    settings: [],
  },
  WAREHOUSE: {
    dashboard: ["view"],
    sales: ["view", "update"], // Shipping/Delivery fulfillment
    purchasing: ["view", "update"], // Goods receiving
    inventory: ["view", "create", "update", "export"], // Transfers, movements, adjustments
    finance: [],
    hr: [],
    reports: ["view", "export"],
    audit: [],
    settings: [],
  },
  HR: {
    dashboard: ["view"],
    sales: [],
    purchasing: [],
    inventory: [],
    finance: [],
    hr: ["view", "create", "update", "approve", "export"],
    reports: ["view", "export"],
    audit: [],
    settings: [],
  },
  READ_ONLY: {
    dashboard: ["view"],
    sales: ["view"],
    purchasing: ["view"],
    inventory: ["view"],
    finance: ["view"],
    hr: ["view"],
    reports: ["view"],
    audit: ["view"],
    settings: ["view"],
  },
}

export function hasPermission(
  role: Role,
  module: AppPermissionModule,
  action: AppPermissionAction
): boolean {
  if (role === "SUPER_ADMIN") return true
  const modulePerms = ROLE_PERMISSIONS[role]?.[module]
  if (!modulePerms) return false
  return modulePerms.includes(action)
}

export function canAccessCompany(
  userRole: Role,
  userCompanyId: string | null,
  targetCompanyId: string
): boolean {
  if (userRole === "SUPER_ADMIN") return true
  return userCompanyId === targetCompanyId
}
