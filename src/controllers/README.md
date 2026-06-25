# controllers/

Couche **controllers** : reçoit la requête HTTP, appelle le(s) service(s),
renvoie la réponse JSON. C'est la glu entre `routes/` et `services/`.

Rôle : lire `req` (params, body, query), valider l'entrée, déléguer au service,
formater `res`. Pas d'accès direct aux bases ici → on passe par `services/`.

```js
// exemple : controllers/commandes.controller.js
import * as commandesService from "../services/commandes.service.js";

export async function creer(req, res, next) {
  try {
    const commande = await commandesService.creerCommande(req.body);
    res.status(201).json(commande);
  } catch (err) {
    next(err); // délégué à middlewares/errorHandler.js
  }
}
```

Fichiers prévus : `commandes`, `tables`, `serveurs`, `plats`, `panier`,
`cuisine`, `recommandations` (un controller par domaine métier).
