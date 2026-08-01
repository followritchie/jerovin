import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";

export async function GET() {
  const log: string[] = [];
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS permissions (
        id SERIAL PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        description TEXT,
        category TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    log.push("permissions table created");

    await db.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
        PRIMARY KEY (role_id, permission_id)
      )
    `);
    log.push("role_permissions table created");

    await db.query(`
      CREATE TABLE IF NOT EXISTS user_roles (
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, role_id)
      )
    `);
    log.push("user_roles table created");

    await db.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        user_email TEXT,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        before_value JSONB,
        after_value JSONB,
        ip_address TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    log.push("audit_logs table created");

    await db.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS portal TEXT DEFAULT 'admin'`);
    await db.query(`ALTER TABLE sellers ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id)`);
    log.push("users.portal and sellers.user_id columns added");

    const PERMS: [string, string, string][] = [
      ["products.view", "View products", "Products"],
      ["products.create", "Create new products", "Products"],
      ["products.edit", "Edit existing products", "Products"],
      ["products.delete", "Delete products", "Products"],
      ["products.price_change", "Change product prices", "Products"],
      ["orders.view", "View orders", "Orders"],
      ["orders.update_status", "Update order status", "Orders"],
      ["orders.refund", "Process refunds", "Orders"],
      ["orders.view_all_sellers", "View orders across all sellers", "Orders"],
      ["customers.view", "View customer data", "Customers"],
      ["customers.edit", "Edit customer data", "Customers"],
      ["sellers.view", "View seller accounts", "Sellers"],
      ["sellers.create", "Create seller accounts", "Sellers"],
      ["sellers.edit", "Edit seller accounts", "Sellers"],
      ["sellers.suspend", "Suspend or activate sellers", "Sellers"],
      ["sellers.audit", "Audit seller activity", "Sellers"],
      ["team.view", "View team members", "Team"],
      ["team.invite", "Invite new team members", "Team"],
      ["team.edit_roles", "Change team member roles", "Team"],
      ["team.remove", "Remove team members", "Team"],
      ["reports.view", "View reports", "Reports"],
      ["reports.export", "Export reports", "Reports"],
      ["settings.edit", "Edit system settings", "Settings"],
      ["audit.view", "View audit logs", "Audit"],
    ];
    for (const [code, desc, cat] of PERMS) {
      await db.query(
        `INSERT INTO permissions (code, description, category) VALUES ($1,$2,$3) ON CONFLICT (code) DO NOTHING`,
        [code, desc, cat]
      );
    }
    log.push("seeded " + PERMS.length + " permissions");

    const roleRes = await db.query("SELECT id, name FROM roles");
    const roleMap: Record<string, number> = {};
    roleRes.rows.forEach((r: any) => { roleMap[r.name] = r.id; });

    const ROLE_PERMS: Record<string, string[]> = {
      "Super Admin": PERMS.map((p) => p[0]),
      "Admin": ["products.view", "products.create", "products.edit", "products.delete", "products.price_change", "orders.view", "orders.update_status", "orders.refund", "orders.view_all_sellers", "customers.view", "customers.edit", "sellers.view", "sellers.audit", "reports.view", "reports.export", "audit.view"],
      "Product Manager": ["products.view", "products.create", "products.edit", "products.price_change"],
      "Order Manager": ["orders.view", "orders.update_status", "orders.refund"],
      "Finance Manager": ["reports.view", "reports.export", "orders.view"],
      "Seller": ["products.view", "products.create", "products.edit", "orders.view"],
      "Support Staff": ["orders.view", "customers.view", "customers.edit"],
    };

    for (const [roleName, permCodes] of Object.entries(ROLE_PERMS)) {
      const roleId = roleMap[roleName];
      if (!roleId) continue;
      for (const code of permCodes) {
        await db.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT $1, id FROM permissions WHERE code=$2
           ON CONFLICT DO NOTHING`,
          [roleId, code]
        );
      }
    }
    log.push("mapped default role to permission assignments");

    await db.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT id, role_id FROM users WHERE role_id IS NOT NULL
      ON CONFLICT DO NOTHING
    `);
    log.push("migrated existing single-role users into user_roles");

    return NextResponse.json({ success: true, log });
  } catch (e: any) {
    log.push("ERROR: " + e.message);
    return NextResponse.json({ success: false, log, error: e.message }, { status: 500 });
  }
}
