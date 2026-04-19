import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

const { Client } = pg;

const url = process.env.POSTGRES_URL_NON_POOLING;
if (!url) {
  console.error("POSTGRES_URL_NON_POOLING not set");
  process.exit(1);
}

const dir = "supabase/migrations";
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

const client = new Client({ connectionString: url });
await client.connect();

for (const file of files) {
  const sql = readFileSync(join(dir, file), "utf8");
  process.stdout.write(`-> ${file} ... `);
  try {
    await client.query(sql);
    console.log("ok");
  } catch (err) {
    console.log("FAIL");
    console.error(err.message);
    await client.end();
    process.exit(1);
  }
}

await client.end();
console.log("All Supabase migrations applied.");
