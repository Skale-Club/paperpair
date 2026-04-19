import pg from "pg";
const { Client } = pg;
const client = new Client({ connectionString: process.env.POSTGRES_URL_NON_POOLING });
await client.connect();
const r = await client.query(
  "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
);
console.log("public tables:", r.rows.map((x) => x.tablename).join(", "));
const p = await client.query(
  "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename"
);
console.log("\nRLS status:");
for (const row of p.rows) console.log(`  ${row.tablename}: ${row.rowsecurity ? "ENABLED" : "disabled"}`);
await client.end();
