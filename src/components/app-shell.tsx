"use client";
import { ButtonIcon } from "@/components/button-icon";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { can } from "@/features/auth/permissions";
import type { CurrentCrmUser } from "@/features/auth/session";
import { SignOutButton } from "@/features/auth/sign-out-button";

type IconName = "dashboard" | "contacts" | "projects" | "invoices" | "proposals" | "door-orders" | "files" | "users" | "settings" | "menu" | "close";
const navigation = [
  { href: "/", label: "Dashboard", icon: "dashboard" },
  { href: "/contacts", label: "Contacts", icon: "contacts", permission: "contacts:read" },
  { href: "/projects", label: "Projects", icon: "projects", permission: "projects:read" },
  { href: "/invoices", label: "Invoices", icon: "invoices", permission: "invoices:read" },
  { href: "/proposals", label: "Proposals", icon: "proposals", permission: "invoices:read" },
  { href: "/door-orders", label: "Door Orders", icon: "door-orders", permission: "invoices:read" },
  { href: "/files", label: "Files", icon: "files", permission: "projects:read" },
  { href: "/users", label: "Users", icon: "users", permission: "users:manage" },
  { href: "/settings", label: "Settings", icon: "settings", permission: "settings:manage" },
] as const;

function NavIcon({ name }: { name: IconName }) {
  const common = { width: 19, height: 19, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true as const };
  switch (name) {
    case "dashboard": return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
    case "contacts": return <svg {...common}><rect x="5" y="3" width="16" height="18" rx="2"/><path d="M9 3v18M13 9h4M13 13h4"/></svg>;
    case "projects": return <svg {...common}><rect x="3" y="6" width="18" height="15" rx="2"/><path d="M3 10h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/></svg>;
    case "invoices": return <svg {...common}><path d="M7 3h8l4 4v14H5V3h2zM15 3v5h4M8 12h8M8 16h8"/></svg>;
    case "proposals": return <svg {...common}><path d="M14 3H5v18h14V10M9 15l1-4 8-8 3 3-8 8-4 1zM16 5l3 3M9 18h6"/></svg>;
    case "door-orders": return <svg {...common}><path d="M4 21h16M6 21V3h12v18M9 6h6v5H9zM9 14h6v4H9z"/><circle cx="16" cy="12.5" r=".5"/></svg>;
    case "files": return <svg {...common}><path d="M3 7V5a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 10h18"/></svg>;
    case "users": return <svg {...common}><circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v1"/></svg>;
    case "settings": return <svg {...common}><path d="m9.5 3-.6 2.1-1.3.8-2.2-.5-2.5 4.2 1.6 1.6v1.6l-1.6 1.6 2.5 4.2 2.2-.5 1.3.8.6 2.1h5l.6-2.1 1.3-.8 2.2.5 2.5-4.2-1.6-1.6v-1.6l1.6-1.6-2.5-4.2-2.2.5-1.3-.8-.6-2.1z"/><circle cx="12" cy="12" r="3"/></svg>;
    case "menu": return <svg {...common}><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
    case "close": return <svg {...common}><path d="M5 5l14 14M19 5 5 19"/></svg>;
  }
}

export function AppShell({ children, user }: { children: ReactNode; user: CurrentCrmUser }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = navigation.filter((item) => !("permission" in item) || can(user.role, item.permission));

  const sidebar = (mobile: boolean) => (
    <>
      <div className="crm-brand"><Link href="/" className="crm-brand-logo-link" aria-label="ACC Cabinetry home" onClick={() => setMobileOpen(false)}><Image src="/images/acc-logo.svg" alt="ACC Cabinetry" width={267} height={77} className="crm-brand-logo" priority/></Link>{mobile && <button className="crm-menu-toggle" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><NavIcon name="close"/></button>}</div>
      <nav aria-label={mobile ? "Mobile navigation" : "Primary navigation"} className="crm-nav">
        {links.map(item => {
          const active = item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
          return <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined} onClick={() => setMobileOpen(false)}><NavIcon name={item.icon}/><span>{item.label}</span></Link>;
        })}
      </nav>
      <div className="crm-sidebar-footer">
        <div className="crm-profile"><span className="crm-avatar" aria-hidden="true">{user.displayName.slice(0,1).toUpperCase()}</span><div><strong>{user.displayName}</strong><small>{user.role}</small></div></div>
        <SignOutButton/>
      </div>
    </>
  );

  return <div className="crm-shell">
    <aside className="crm-sidebar">{sidebar(false)}</aside>
    <header className="crm-mobile-header"><Link href="/" className="crm-mobile-brand-logo" aria-label="ACC Cabinetry home"><Image src="/images/acc-logo.svg" alt="ACC Cabinetry" width={267} height={77} className="crm-brand-logo" priority/></Link><button className="crm-menu-toggle" aria-label="Open navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><NavIcon name="menu"/></button></header>
    {mobileOpen && <div className="crm-mobile-overlay"><button className="crm-mobile-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><ButtonIcon kind="close" /></button><aside className="crm-mobile-drawer">{sidebar(true)}</aside></div>}
    <div className="crm-main"><main className="crm-content">{children}</main></div>
  </div>;
}
