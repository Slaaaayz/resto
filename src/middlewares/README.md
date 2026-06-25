# middlewares/

Couche **middlewares** : fonctions Express intermédiaires `(req, res, next)`
qui s'exécutent autour des controllers.

Rôle : gestion centralisée des erreurs, validation, CORS, logs, etc.
Branchées dans `app.js`.

```js
// exemple : middlewares/errorHandler.js
export function errorHandler(err, _req, res, _next) {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Erreur serveur",
  });
}
```

Fichiers prévus :
- `errorHandler.js` → catch global, réponse JSON formatée (INFRA-02)
- `notFound.js`     → réponse 404 pour les routes inconnues (optionnel)
