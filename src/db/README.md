# db/

Couche **db** : connexions aux 4 bases de données et export des clients partagés.

Rôle : centraliser l'ouverture des connexions (PostgreSQL, MongoDB, Redis,
Neo4j) et exposer un client réutilisable aux `services/`. Aucune logique
métier ici, juste l'infrastructure de connexion.

Chaque connexion utilise un petit `withRetry` (voir `withRetry.js`) : robuste
au lancement local hors Docker, où les bases ne sont pas encore prêtes.

Fichiers :
- `postgres.js` → pool `pg` partagé (`pool`) + `connectPostgres()`
- `mongo.js`    → connexion `mongoose` + `connectMongo()`
- `redis.js`    → client `ioredis` (`redis`) + `connectRedis()`, gestion erreur
- `neo4j.js`    → driver `neo4j-driver` (`driver`) + `getSession()` + `connectNeo4j()`
- `index.js`    → barrel : ré-exporte les 4 connexions
- `withRetry.js`→ helper interne de reconnexion

```js
// Usage type dans un service
import { pool, redis, getSession } from "../db/index.js";

await pool.query("SELECT 1");
await redis.hset("panier:42", "plat_1", "...");
const session = getSession();
try { await session.run("MATCH (n) RETURN n"); } finally { await session.close(); }
```
