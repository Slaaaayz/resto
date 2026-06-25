// Point d'entree de l'application.
// Charge l'environnement, connecte les 4 bases, demarre le serveur HTTP + Socket.io.

import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import { Server as SocketServer } from "socket.io";

import app from "./app.js";
import {
  pool,
  redis,
  driver,
  connectPostgres,
  connectMongo,
  connectRedis,
  connectNeo4j,
} from "./db/index.js";

const PORT = Number(process.env.PORT || 3000);

// Serveur HTTP partage entre Express et Socket.io.
const server = http.createServer(app);
export const io = new SocketServer(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log(`[socket.io] client connecte: ${socket.id}`);
  socket.on("disconnect", () => console.log(`[socket.io] client deconnecte: ${socket.id}`));
});

async function start() {
  console.log("Connexion aux bases de donnees...");

  await connectPostgres();
  console.log("[DB] PostgreSQL connecte");
  await connectMongo();
  console.log("[DB] MongoDB connecte");
  await connectRedis();
  console.log("[DB] Redis connecte");
  await connectNeo4j();
  console.log("[DB] Neo4j connecte");

  server.listen(PORT, () => {
    console.log(`[APP] Serveur demarre sur http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Echec du demarrage:", err);
  process.exit(1);
});

// Arret propre : on ferme les connexions avant de quitter.
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, async () => {
    console.log(`\n${sig} recu, fermeture des connexions...`);
    try {
      await pool.end();
      await mongoose.connection.close();
      await redis.quit();
      await driver.close();
    } finally {
      process.exit(0);
    }
  });
}
