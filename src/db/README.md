# db/

Couche **db** : connexions aux 4 bases de données et export des clients.

Rôle : centraliser l'ouverture des connexions (PostgreSQL, MongoDB, Redis,
Neo4j) et exposer un client réutilisable aux `services/`. Aucune logique
métier ici, juste l'infrastructure de connexion.

> Note : les helpers de connexion existent déjà dans `src/db.js`
> (fonctions `connectPostgres`, `connectMongo`, `connectRedis`, `connectNeo4j`).
> La migration vers ce dossier (un fichier par base) fait partie des étapes
> suivantes du ticket INFRA-02, pas de l'étape "arborescence".

Fichiers prévus :
- `postgres.js` → pool `pg`, log connexion réussie
- `mongo.js`    → client MongoDB, log connexion réussie
- `redis.js`    → client Redis, gestion erreur connexion
- `neo4j.js`    → driver `neo4j-driver`, export d'une session factory
- `index.js`    → barrel : ré-exporte les 4 connexions
