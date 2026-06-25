// Controller de sante : formate la reponse HTTP a partir du service.

import { pingDatabases } from "../services/health.service.js";

export async function getHealth(_req, res) {
  const databases = await pingDatabases();
  const healthy = Object.values(databases).every((s) => s === "ok");
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    databases,
    timestamp: new Date().toISOString(),
  });
}
