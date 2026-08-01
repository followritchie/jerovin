import { db } from "./db";

export async function getUserPermissions(userId: number): Promise<Set<string>> {
  const r = await db.query(
    `SELECT DISTINCT p.code FROM permissions p
     JOIN role_permissions rp ON rp.permission_id = p.id
     JOIN user_roles ur ON ur.role_id = rp.role_id
     WHERE ur.user_id = $1`,
    [userId]
  );
  return new Set(r.rows.map((row: any) => row.code));
}

export async function hasPermission(userId: number, code: string): Promise<boolean> {
  const perms = await getUserPermissions(userId);
  return perms.has(code);
}

export async function requirePermission(userId: number | null, code: string) {
  if (!userId) return { ok: false as const, status: 401, error: "Not authenticated" };
  const allowed = await hasPermission(userId, code);
  if (!allowed) return { ok: false as const, status: 403, error: "Missing permission: " + code };
  return { ok: true as const };
}

export async function logAudit(opts: {
  userId?: number | null;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: string | number;
  before?: any;
  after?: any;
}) {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, user_email, action, entity_type, entity_id, before_value, after_value, created_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,NOW())`,
      [opts.userId || null, opts.userEmail || null, opts.action, opts.entityType,
       opts.entityId ? String(opts.entityId) : null,
       opts.before ? JSON.stringify(opts.before) : null,
       opts.after ? JSON.stringify(opts.after) : null]
    );
  } catch (e) {
    console.error("Audit log failed:", e);
  }
}
