// Lecture brute du contenu de chaque base, reutilisee par :
//   - scripts/dump-all.js  (affichage console)
//   - GET /admin/dump      (affichage JSON dans le navigateur)
//
// Utilise les connexions partagees de la couche src/db (mongoose + ioredis + pg + neo4j).

import mongoose from "mongoose";
import { pool } from "./db/postgres.js";
import { redis } from "./db/redis.js";
import { driver } from "./db/neo4j.js";

export async function dumpPostgres() {
  const tables = ["serveur", "table_resto", "commande", "ligne_commande", "paiement"];
  const out = {};
  for (const t of tables) {
    const { rows } = await pool.query(`SELECT * FROM ${t} ORDER BY id`);
    out[t] = rows;
  }
  return out;
}

export async function dumpMongo() {
  const plats = await mongoose.connection.db.collection("plats").find({}).toArray();
  return { plats };
}

export async function dumpRedis() {
  const out = {};
  const keys = await redis.keys("*");
  for (const key of keys.sort()) {
    const type = await redis.type(key);
    switch (type) {
      case "string":
        out[key] = { type, value: await redis.get(key) };
        break;
      case "list":
        out[key] = { type, value: await redis.lrange(key, 0, -1) };
        break;
      case "zset": {
        // ioredis renvoie [membre, score, membre, score, ...] -> on reconstruit des paires
        const flat = await redis.zrange(key, 0, -1, "WITHSCORES");
        const value = [];
        for (let i = 0; i < flat.length; i += 2) {
          value.push({ value: flat[i], score: Number(flat[i + 1]) });
        }
        out[key] = { type, value };
        break;
      }
      case "hash":
        out[key] = { type, value: await redis.hgetall(key) };
        break;
      case "set":
        out[key] = { type, value: await redis.smembers(key) };
        break;
      default:
        out[key] = { type, value: "(type non gere)" };
    }
  }
  return out;
}

export async function dumpNeo4j() {
  const session = driver.session();
  try {
    const nodesRes = await session.run("MATCH (n) RETURN labels(n) AS labels, properties(n) AS props");
    const nodes = nodesRes.records.map((r) => ({
      labels: r.get("labels"),
      props: r.get("props"),
    }));

    const relsRes = await session.run(
      "MATCH (a)-[r]->(b) RETURN labels(a) AS from, type(r) AS rel, properties(r) AS props, labels(b) AS to, a.nom AS fromNom, b.nom AS toNom"
    );
    const relations = relsRes.records.map((r) => ({
      from: `${r.get("from")}:${r.get("fromNom")}`,
      rel: r.get("rel"),
      to: `${r.get("to")}:${r.get("toNom")}`,
      props: r.get("props"),
    }));

    return { nodes, relations };
  } finally {
    await session.close();
  }
}

// Dump complet a partir des connexions partagees deja etablies.
export async function dumpAll() {
  return {
    postgres: await dumpPostgres(),
    mongodb: await dumpMongo(),
    redis: await dumpRedis(),
    neo4j: await dumpNeo4j(),
  };
}
