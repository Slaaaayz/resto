# routes/

Couche **routes** : déclaration des endpoints HTTP (Express Router).

Rôle : associer une URL + méthode (`GET /api/commandes`) à une fonction du
controller. Aucune logique métier ici, juste le branchement.

```js
// exemple : routes/commandes.routes.js
import { Router } from "express";
import * as commandesController from "../controllers/commandes.controller.js";

const router = Router();
router.post("/", commandesController.creer);
router.get("/", commandesController.lister);
export default router;
```

Fichiers prévus (selon les tickets) :
- `commandes.routes.js`  → SQL-02
- `tables.routes.js`, `serveurs.routes.js` → SQL-03
- `plats.routes.js`      → MONGO-01 / MONGO-02
- `panier.routes.js`     → REDIS-01
- `cuisine.routes.js`    → REDIS-02
- `recommandations.routes.js` → NEO4J-02
