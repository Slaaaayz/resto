// Affiche en brut le contenu de chaque base dans la console.
// Usage : npm run dump   (ou docker compose exec app npm run dump)
import "dotenv/config";
import mongoose from "mongoose";
import {
  pool,
  redis,
  driver,
  connectPostgres,
  connectMongo,
  connectRedis,
  connectNeo4j,
} from "../src/db/index.js";
import { dumpAll } from "../src/dump.js";

async function main() {
  await connectPostgres();
  await connectMongo();
  await connectRedis();
  await connectNeo4j();

  try {
    const data = await dumpAll();

    for (const [base, contenu] of Object.entries(data)) {
      console.log(`\n========== ${base.toUpperCase()} ==========`);
      console.dir(contenu, { depth: null, colors: true });
    }
  } finally {
    await pool.end().catch(() => {});
    await mongoose.connection.close().catch(() => {});
    await redis.quit().catch(() => {});
    await driver.close().catch(() => {});
  }
}

main().then(() => process.exit(0)).catch((err) => {
  console.error("Erreur lors du dump :", err);
  process.exit(1);
});
