# services/

Couche **services** : toute la logique métier et les accès aux bases de données.
C'est le cœur de l'application.

Rôle : transactions SQL, agrégations Mongo, commandes Redis, requêtes Cypher.
Les services consomment les clients exposés par `db/` et sont appelés par les
controllers. Réutilisables et testables indépendamment d'Express.

```js
// exemple : services/commandes.service.js
import { pool } from "../db/postgres.js";

export async function creerCommande({ table_id, serveur_id, origine, lignes }) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    // ... INSERT commande + lignes ...
    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}
```

Fichiers prévus : `commandes.service.js` (SQL-02), `paiements`, `plats`
(MONGO), `panier` (REDIS-01), `ticket.service.js` (REDIS-02),
`classement.service.js` (REDIS-03), `graph.service.js` (NEO4J-02).
