// Script de seed : insere un jeu de donnees minimal dans chaque base
// pour verifier que tout est ecrivable / lisible.
//
//   PostgreSQL : tables (salle) + commandes (encaissement serveur)
//   MongoDB    : menu (cartes / plats de la borne client)
//   Redis      : file temps reel de l'ecran cuisine
//   Neo4j      : graphe plats <-> ingredients
//
// Lancer avec : npm run seed   (ou docker compose exec app npm run seed)
//
// NB : seed minimal d'infra. Les seeds complets et idempotents sont le ticket INFRA-03.

import "dotenv/config";
import mongoose from "mongoose";
import {
  pool,
  redis,
  connectPostgres,
  connectMongo,
  connectRedis,
  connectNeo4j,
} from "./db/index.js";

async function seedPostgres() {
  await connectPostgres();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tables (
      id SERIAL PRIMARY KEY,
      numero INT UNIQUE NOT NULL,
      capacite INT NOT NULL,
      statut TEXT NOT NULL DEFAULT 'libre'
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS commandes (
      id SERIAL PRIMARY KEY,
      table_id INT REFERENCES tables(id),
      total_cents INT NOT NULL DEFAULT 0,
      statut TEXT NOT NULL DEFAULT 'en_cours',
      cree_le TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    INSERT INTO tables (numero, capacite, statut) VALUES
      (1, 2, 'libre'), (2, 4, 'occupee'), (3, 4, 'libre'), (4, 6, 'reservee')
    ON CONFLICT (numero) DO NOTHING;
  `);
  await pool.query(`
    INSERT INTO commandes (table_id, total_cents, statut)
    SELECT id, 3250, 'en_cours' FROM tables WHERE numero = 2
    ON CONFLICT DO NOTHING;
  `);
  const { rows } = await pool.query("SELECT count(*)::int AS n FROM tables");
  console.log(`[postgres] ${rows[0].n} tables en base`);
  await pool.end();
}

async function seedMongo() {
  const conn = await connectMongo();
  const menu = conn.db.collection("menu");
  await menu.deleteMany({});
  await menu.insertMany([
    { code: "BURGER", nom: "Burger maison", categorie: "plat", prix_cents: 1450, disponible: true },
    { code: "SALADE", nom: "Salade cesar", categorie: "entree", prix_cents: 950, disponible: true },
    { code: "FRITES", nom: "Frites", categorie: "accompagnement", prix_cents: 450, disponible: true },
    { code: "TIRAMISU", nom: "Tiramisu", categorie: "dessert", prix_cents: 650, disponible: true },
    { code: "COLA", nom: "Cola", categorie: "boisson", prix_cents: 350, disponible: true },
  ]);
  const count = await menu.countDocuments();
  console.log(`[mongodb] ${count} plats dans le menu`);
  await mongoose.connection.close();
}

async function seedRedis() {
  await connectRedis();
  await redis.del("cuisine:queue");
  await redis.rpush(
    "cuisine:queue",
    JSON.stringify({ commande: 1, plat: "BURGER", table: 2, statut: "a_preparer" }),
    JSON.stringify({ commande: 1, plat: "FRITES", table: 2, statut: "a_preparer" })
  );
  const len = await redis.llen("cuisine:queue");
  console.log(`[redis] ${len} tickets dans la file cuisine`);
  await redis.quit();
}

async function seedNeo4j() {
  const driver = await connectNeo4j();
  const session = driver.session();
  try {
    await session.run("MATCH (n) DETACH DELETE n");
    await session.run(`
      MERGE (b:Plat {code: 'BURGER', nom: 'Burger maison'})
      MERGE (p:Ingredient {nom: 'Pain'})
      MERGE (s:Ingredient {nom: 'Steak'})
      MERGE (sal:Ingredient {nom: 'Salade'})
      MERGE (b)-[:CONTIENT]->(p)
      MERGE (b)-[:CONTIENT]->(s)
      MERGE (b)-[:CONTIENT]->(sal)
    `);
    const res = await session.run("MATCH (i:Ingredient) RETURN count(i) AS n");
    console.log(`[neo4j] ${res.records[0].get("n")} ingredients lies au plat`);
  } finally {
    await session.close();
    await driver.close();
  }
}

async function main() {
  console.log("Seed des bases de donnees...");
  await seedPostgres();
  await seedMongo();
  await seedRedis();
  await seedNeo4j();
  console.log("Seed termine.");
}

main().catch((err) => {
  console.error("Echec du seed:", err);
  process.exit(1);
});
