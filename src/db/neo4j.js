// Connexion Neo4j (driver bolt) + fabrique de sessions.

import neo4j from "neo4j-driver";
import { withRetry } from "./withRetry.js";

const NEO4J_URL = process.env.NEO4J_URL || "bolt://localhost:7687";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
// docker-compose fournit NEO4J_PASSWORD ; le ticket parle de NEO4J_PASS -> on accepte les deux.
const NEO4J_PASS = process.env.NEO4J_PASSWORD || process.env.NEO4J_PASS || "resto_pass";

export const driver = neo4j.driver(NEO4J_URL, neo4j.auth.basic(NEO4J_USER, NEO4J_PASS));

// Session factory : chaque appel cree une nouvelle session a fermer apres usage.
//   const session = getSession();
//   try { await session.run(...) } finally { await session.close(); }
export function getSession() {
  return driver.session();
}

export async function connectNeo4j() {
  return withRetry("neo4j", async () => {
    await driver.verifyConnectivity();
    return driver;
  });
}
