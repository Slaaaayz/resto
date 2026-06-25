// Orchestrateur : seed les 4 bases en sequence.
// Chaque module ouvre la connexion partagee (idempotent) ; on ferme tout a la fin.
import "dotenv/config";
import mongoose from "mongoose";
import { pool, redis, driver } from "../src/db/index.js";
import seedPostgres from "../seeds/postgres/seed.js";
import seedMongo from "../seeds/mongo/seed.js";
import seedRedis from "../seeds/redis/seed.js";
import seedNeo4j from "../seeds/neo4j/seed.js";

async function seedAll() {
  console.log("=== Seed de toutes les bases ===");
  try {
    await seedPostgres();
    await seedMongo();
    await seedRedis();
    await seedNeo4j();
    console.log("=== Seed complet ===");
  } finally {
    await pool.end().catch(() => {});
    await mongoose.connection.close().catch(() => {});
    await redis.quit().catch(() => {});
    await driver.close().catch(() => {});
  }
}

seedAll().then(() => process.exit(0)).catch((err) => {
  console.error("Erreur lors du seeding :", err);
  process.exit(1);
});
