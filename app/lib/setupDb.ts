import pool from "./db";
import fs from "fs";
import path from "path";

async function setup() {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), "app/lib/schema.sql"), "utf8");
    await pool.query(sql);
    console.log("✅ Database tables created successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:", error);
    process.exit(1);
  }
}

setup();
