// Client Redis (ioredis) partage par toute l'application.
// ioredis gere lui-meme les reconnexions automatiques.

import Redis from "ioredis";
import { withRetry } from "./withRetry.js";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(REDIS_URL);

// Gestion de l'erreur de connexion (evite un crash si Redis tombe).
redis.on("error", (err) => console.error("[redis] erreur de connexion:", err.message));

export async function connectRedis() {
  return withRetry("redis", async () => {
    await redis.ping();
    return redis;
  });
}
