import Link from "next/link";
import type { ReactNode } from "react";

import { can } from "@/features/auth/permissions";
import type { CurrentCrmUser } from "@/features/auth/session";
import { SignOutButton } from "@/features/auth/sign-out-button";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/invoices", label: "Invoices", permission: "invoices:read" },
  { href: "/contacts", label: "Contacts", permission: "contacts:read" },
  { href: "/projects", label: "Projects", permission: "projects:read" },
  { href: "/settings", label: "Settings", permission: "settings:manage" },
  { href: "/users", label: "Users", permission: "users:manage" },
] as const;

export function AppShell({
  children,
  user,
}: {
  children: ReactNode;
  user: CurrentCrmUser;
}) {
  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <div className="crm-brand">ACC CRM</div>
        <nav aria-label="Primary navigation" className="crm-nav">
          {navigation.filter((item) => !("permission" in item) || can(user.role, item.permission)).map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="crm-main">
        <header className="crm-header">
          <strong>ACC CRM</strong>
          <div className="crm-user-actions">
            <span>{user.displayName}</span>
            <SignOutButton />
          </div>
        </header>
        <main className="crm-content">{children}</main>
      </div>
    </div>
  );
}
