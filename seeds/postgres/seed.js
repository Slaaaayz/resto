// Seed PostgreSQL : execute 01_schema.sql puis 02_data.sql.
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { pool, connectPostgres } from "../../src/db/index.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default async function seedPostgres() {
  await connectPostgres();

  const schema = await readFile(join(__dirname, "01_schema.sql"), "utf8");
  const data = await readFile(join(__dirname, "02_data.sql"), "utf8");

  await pool.query(schema);
  await pool.query(data);

  const { rows } = await pool.query("SELECT count(*)::int AS n FROM commande");
  console.log(`[postgres] schema + donnees inseres (${rows[0].n} commandes)`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedPostgres().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
