import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/", label: "Dashboard" },
  { href: "/invoices", label: "Invoices" },
  { href: "/contacts", label: "Contacts" },
  { href: "/projects", label: "Projects" },
  { href: "/settings", label: "Settings" },
  { href: "/users", label: "Users" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="crm-shell">
      <aside className="crm-sidebar">
        <div className="crm-brand">ACC CRM</div>
        <nav aria-label="Primary navigation" className="crm-nav">
          {navigation.map((item) => (
            <Link href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="crm-main">
        <header className="crm-header">
          <strong>ACC CRM</strong>
          <span className="crm-header-meta">Version 3</span>
        </header>
        <main className="crm-content">{children}</main>
      </div>
    </div>
  );
}
