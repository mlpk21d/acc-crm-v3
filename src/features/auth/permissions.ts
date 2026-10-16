export type CrmRole = "admin" | "manager" | "staff";

export type CrmPermission =
  | "contacts:read"
  | "contacts:write"
  | "projects:read"
  | "projects:write"
  | "invoices:read"
  | "invoices:write"
  | "settings:manage"
  | "users:manage";

const permissions: Record<CrmRole, ReadonlySet<CrmPermission>> = {
  admin: new Set([
    "contacts:read", "contacts:write", "projects:read", "projects:write",
    "invoices:read", "invoices:write", "settings:manage", "users:manage",
  ]),
  manager: new Set([
    "contacts:read", "contacts:write", "projects:read", "projects:write",
    "invoices:read", "invoices:write",
  ]),
  staff: new Set([
    "contacts:read", "projects:read", "invoices:read",
  ]),
};

export function can(role: CrmRole, permission: CrmPermission): boolean {
  return permissions[role].has(permission);
}
