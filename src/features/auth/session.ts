import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { getDbPool } from "@/lib/db";
import { can, type CrmPermission, type CrmRole } from "@/features/auth/permissions";

export type CurrentCrmUser = {
  id: string;
  displayName: string;
  role: CrmRole;
};

export async function getCurrentCrmUser(): Promise<CurrentCrmUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return null;

  const result = await getDbPool().query<{
    id: string;
    display_name: string;
    role: CrmRole;
  }>(
    `SELECT id, display_name, role
     FROM public.crm_users
     WHERE auth_user_id = $1
       AND is_active = true
       AND deleted_at IS NULL
     LIMIT 1`,
    [session.user.id],
  );
  const user = result.rows[0];
  if (!user) return null;

  return { id: user.id, displayName: user.display_name, role: user.role };
}

export async function requireCrmUser(): Promise<CurrentCrmUser> {
  const user = await getCurrentCrmUser();
  if (!user) redirect("/login");
  return user;
}

export async function requirePermission(permission: CrmPermission): Promise<CurrentCrmUser> {
  const user = await requireCrmUser();
  if (!can(user.role, permission)) redirect("/forbidden");
  return user;
}
