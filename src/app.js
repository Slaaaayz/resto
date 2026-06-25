// Initialisation de l'application Express (sans demarrage reseau).
// Le demarrage du serveur HTTP + Socket.io se fait dans server.js.

import express from "express";
import cors from "cors";

import healthRoutes from "./routes/health.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { notFound } from "./middlewares/notFound.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Route racine (sanity check)
app.get("/", (_req, res) => {
  res.json({
    service: "resto-api",
    message: "Infra restaurant operationnelle",
    endpoints: ["/health", "/admin/dump"],
  });
});

// Routes metier (a etoffer au fil des tickets : /api/commandes, /api/plats, ...)
app.use("/health", healthRoutes);
app.use("/admin", adminRoutes);

// 404 puis gestion globale des erreurs : TOUJOURS en dernier.
app.use(notFound);
app.use(errorHandler);

export default app;
