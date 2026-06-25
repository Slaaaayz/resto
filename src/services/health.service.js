// Service de sante : ping les 4 bases et renvoie leur etat.
// Sert d'exemple de traversee complete des couches (route -> controller -> service -> db)
// et alimente le healthcheck Docker.

import mongoose from "mongoose";
import { pool } from "../db/postgres.js";
import { redis } from "../db/redis.js";
import { driver } from "../db/neo4j.js";

export async function pingDatabases() {
  const status = {};

  try {
    await pool.query("SELECT 1");
    status.postgres = "ok";
  } catch (e) {
    status.postgres = `error: ${e.message}`;
  }

  try {
    await mongoose.connection.db.admin().ping();
    status.mongodb = "ok";
  } catch (e) {
    status.mongodb = `error: ${e.message}`;
  }

  try {
    await redis.ping();
    status.redis = "ok";
  } catch (e) {
    status.redis = `error: ${e.message}`;
  }

  try {
    await driver.verifyConnectivity();
    status.neo4j = "ok";
  } catch (e) {
    status.neo4j = `error: ${e.message}`;
  }

  return status;
}
