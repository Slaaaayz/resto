// Middleware 404 : attrape toute requete qui ne correspond a aucune route.
// A brancher juste avant errorHandler.

export function notFound(req, res) {
  res.status(404).json({
    error: {
      message: `Route introuvable: ${req.method} ${req.originalUrl}`,
      status: 404,
    },
  });
}
