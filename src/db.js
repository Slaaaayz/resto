// Helpers de connexion aux 4 bases de donnees.
// Chaque fonction renvoie un client connecte, avec quelques tentatives de retry
// (les bases sont normalement deja "healthy" grace au depends_on de docker-compose,
//  mais le retry rend l'app robuste en lancement local hors Docker).

import pg from "pg";
import { MongoClient } from "mongodb";
import { createClient as createRedisClient } from "redis";
import neo4j from "neo4j-driver";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function withRetry(label, fn, { retries = 10, delay = 2000 } = {}) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      console.warn(`[${label}] tentative ${attempt}/${retries} echouee: ${err.message}`);
      await sleep(delay);
    }
  }
  throw new Error(`[${label}] connexion impossible apres ${retries} tentatives: ${lastErr?.message}`);
}

export async function connectPostgres() {
  return withRetry("postgres", async () => {
    const pool = new pg.Pool({
      host: process.env.PGHOST || "localhost",
      port: Number(process.env.PGPORT || 5432),
      database: process.env.PGDATABASE || "restaurant",
      user: process.env.PGUSER || "resto_user",
      password: process.env.PGPASSWORD || "resto_pass",
    });
    await pool.query("SELECT 1");
    return pool;
  });
}

export async function connectMongo() {
  return withRetry("mongodb", async () => {
    const url = process.env.MONGO_URL || "mongodb://localhost:27017/restaurant";
    const client = new MongoClient(url);
    await client.connect();
    await client.db().command({ ping: 1 });
    return client;
  });
}

export async function connectRedis() {
  return withRetry("redis", async () => {
    const client = createRedisClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
    client.on("error", (e) => console.warn(`[redis] ${e.message}`));
    await client.connect();
    await client.ping();
    return client;
  });
}

export function neo4jDriver() {
  const url = process.env.NEO4J_URL || "bolt://localhost:7687";
  const user = process.env.NEO4J_USER || "neo4j";
  const password = process.env.NEO4J_PASSWORD || "resto_pass";
  return neo4j.driver(url, neo4j.auth.basic(user, password));
}

export async function connectNeo4j() {
  return withRetry("neo4j", async () => {
    const driver = neo4jDriver();
    await driver.verifyConnectivity();
    return driver;
  });
}
