// Middleware de gestion globale des erreurs.
// Express reconnait ce middleware a ses 4 arguments (err, req, res, next).
// A brancher EN DERNIER dans app.js, apres toutes les routes.

export function errorHandler(err, _req, res, _next) {
  const status = err.status || err.statusCode || 500;
  console.error(`[error] ${status} - ${err.message}`);
  res.status(status).json({
    error: {
      message: err.message || "Erreur interne du serveur",
      status,
    },
  });
}
