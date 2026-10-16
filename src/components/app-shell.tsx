import Link from "next/link";
import type { ReactNode } from "react";

import { can } from "@/features/auth/permissions";
import type { CurrentCrmUser } from "@/features/auth/session";
import { SignOutButton } from "@/features/auth/sign-out-button";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/contacts", label: "Contacts", permission: "contacts:read" },
  { href: "/projects", label: "Projects", permission: "projects:read" },
  { href: "/invoices", label: "Invoices", permission: "invoices:read" },
  { href: "/users", label: "Users", permission: "users:manage" },
  { href: "/settings", label: "Settings", permission: "settings:manage" },
] as const;

export function AppShell({ children, user }: { children: ReactNode; user: CurrentCrmUser }) {
  const links = navigation.filter((item) => !("permission" in item) || can(user.role, item.permission));
  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <div className="crm-brand"><span className="crm-brand-title">ACC CRM</span></div>
        <nav aria-label="Primary navigation" className="crm-nav">
          {links.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
        </nav>
        <div className="crm-sidebar-footer">
          <div className="crm-profile">
            <span className="crm-avatar" aria-hidden="true">{user.displayName.slice(0, 1).toUpperCase()}</span>
            <div><strong>{user.displayName}</strong><small>{user.role}</small></div>
          </div>
          <SignOutButton />
        </div>
      </aside>
      <div className="crm-main">
        <header className="crm-mobile-header">
          <strong>ACC CRM</strong>
          <span>{user.displayName}</span>
        </header>
        <main className="crm-content">{children}</main>
      </div>
    </div>
  );
}
