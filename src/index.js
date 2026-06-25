// Point d'entree de l'app (infra).
// Demarre un serveur HTTP minimal qui verifie la connectivite aux 4 bases
// et expose /health pour le healthcheck Docker.

import express from "express";
import { connectPostgres, connectMongo, connectRedis, connectNeo4j } from "./db.js";
import { dumpAll } from "./dump.js";

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Clients partages (remplis au demarrage)
const clients = {
  postgres: null,
  mongodb: null,
  redis: null,
  neo4j: null,
};

async function pingAll() {
  const status = {};

  try {
    await clients.postgres.query("SELECT 1");
    status.postgres = "ok";
  } catch (e) {
    status.postgres = `error: ${e.message}`;
  }

  try {
    await clients.mongodb.db().command({ ping: 1 });
    status.mongodb = "ok";
  } catch (e) {
    status.mongodb = `error: ${e.message}`;
  }

  try {
    await clients.redis.ping();
    status.redis = "ok";
  } catch (e) {
    status.redis = `error: ${e.message}`;
  }

  try {
    await clients.neo4j.verifyConnectivity();
    status.neo4j = "ok";
  } catch (e) {
    status.neo4j = `error: ${e.message}`;
  }

  return status;
}

app.get("/health", async (_req, res) => {
  const databases = await pingAll();
  const healthy = Object.values(databases).every((s) => s === "ok");
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    databases,
    timestamp: new Date().toISOString(),
  });
});

// Route admin : affiche en brut le contenu des 4 bases.
app.get("/admin/dump", async (_req, res) => {
  try {
    const data = await dumpAll(clients);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/", (_req, res) => {
  res.json({
    service: "resto-api",
    message: "Infra restaurant operationnelle",
    endpoints: ["/health", "/admin/dump"],
  });
});

async function start() {
  console.log("Connexion aux bases de donnees...");
  clients.postgres = await connectPostgres();
  console.log("postgres connecte");
  clients.mongodb = await connectMongo();
  console.log("mongodb connecte");
  clients.redis = await connectRedis();
  console.log("redis connecte");
  clients.neo4j = await connectNeo4j();
  console.log("neo4j connecte");
  console.log("route admin connecte");

  app.listen(PORT, () => {
    console.log(`API a l'ecoute sur http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Echec du demarrage:", err);
  process.exit(1);
});

// Arret propre
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    console.log(`\n${sig} recu, fermeture des connexions...`);
    try {
      await clients.postgres?.end();
      await clients.mongodb?.close();
      await clients.redis?.quit();
      await clients.neo4j?.close();
    } finally {
      process.exit(0);
    }
  });
}
