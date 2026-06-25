// Connexion PostgreSQL (pool partage avec le driver `pg`).

import pg from "pg";
import { withRetry } from "./withRetry.js";

// Pool unique reutilise par toute l'application.
// Si POSTGRES_URL n'est pas defini, `pg` lit automatiquement les variables
// standard PGHOST / PGPORT / PGUSER / PGPASSWORD / PGDATABASE (cas docker-compose).
export const pool = new pg.Pool(
  process.env.POSTGRES_URL ? { connectionString: process.env.POSTGRES_URL } : {}
);

pool.on("error", (err) => {
  console.error("[postgres] erreur client inattendue:", err.message);
});

export async function connectPostgres() {
  return withRetry("postgres", async () => {
    await pool.query("SELECT 1");
    return pool;
  });
}
