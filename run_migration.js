const { Client } = require('pg');
const fs = require('fs');

const connectionString = "postgresql://postgres:HIKvqnPcqiQeIgbDtjulzOvLbwWNyOFe@kodama.proxy.rlwy.net:44832/railway";
const sql = fs.readFileSync('./app/account/schema_migration.sql', 'utf8');

const client = new Client({ connectionString });

async function run() {
  try {
    await client.connect();
    console.log("Connected to Railway Postgres database.");
    await client.query(sql);
    console.log("Migration executed successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

run();
