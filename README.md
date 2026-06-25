# Resto — Système de prise de commande restaurant

Infrastructure du projet : **borne de commande client** en salle, **écran cuisine** temps réel et **interface serveur** (suivi des tables + encaissement).

Ce dépôt contient pour l'instant **l'infrastructure** : l'orchestration Docker des 4 bases de données et d'une API Node.js qui valide la connectivité.

## Architecture des données

| Base       | Rôle dans le projet                                   |
|------------|-------------------------------------------------------|
| PostgreSQL | Tables de la salle, commandes, encaissement (serveur) |
| MongoDB    | Menu / cartes / plats (borne client)                  |
| Redis      | File temps réel de l'écran cuisine                    |
| Neo4j      | Graphe plats ↔ ingrédients                            |

## Prérequis

- [Docker](https://docs.docker.com/get-docker/) **≥ 24**
- [Docker Compose v2](https://docs.docker.com/compose/) (inclus dans Docker Desktop)
- Aucun autre prérequis : Node.js et les bases tournent dans les conteneurs.

## Lancement

```bash
# (optionnel) personnaliser les identifiants
cp .env.example .env

# Construire et démarrer les 5 services
docker compose up --build
```

Au premier démarrage, l'app attend automatiquement que les 4 bases soient **healthy**
(grâce à `depends_on: condition: service_healthy`) avant de se lancer.

Vérifier que tout répond :

```bash
curl http://localhost:3000/health
```

Réponse attendue (HTTP 200) :

```json
{
  "status": "healthy",
  "databases": { "postgres": "ok", "mongodb": "ok", "redis": "ok", "neo4j": "ok" }
}
```

Arrêter :

```bash
docker compose down          # stoppe les conteneurs
docker compose down -v       # + supprime les volumes (reset complet des données)
```

## Seed (jeu de données de démonstration)

Une fois les services démarrés :

```bash
docker compose exec app npm run seed
```

`scripts/seed-all.js` exécute en séquence les seeds de `seeds/` :

| Base       | Contenu inséré                                                    |
|------------|-------------------------------------------------------------------|
| PostgreSQL | serveurs, tables, commandes, lignes, paiements (via fichiers `.sql`) |
| MongoDB    | collection `plats` (carte de la borne, avec allergènes)           |
| Redis      | statuts de tables, classement des plats, panier, file cuisine     |
| Neo4j      | graphe plats ↔ catégories ↔ ingrédients                           |

Chaque module est aussi lançable seul, ex. `node seeds/mongo/seed.js`.

## Voir les données en brut

Deux moyens d'inspecter le contenu réel des 4 bases :

```bash
# 1) En console (dump formaté de chaque base)
docker compose exec app npm run dump
```

```bash
# 2) En JSON dans le navigateur / curl
curl http://localhost:3000/admin/dump
```

## Ports exposés

| Service    | Port(s)        | Accès                                              |
|------------|----------------|----------------------------------------------------|
| app (API)  | `3000`         | http://localhost:3000 — `/`, `/health`, `/admin/dump` |
| PostgreSQL | `5432`         | `postgresql://resto_user:resto_pass@localhost:5432/restaurant` |
| MongoDB    | `27017`        | `mongodb://localhost:27017/restaurant`  |
| Redis      | `6379`         | `redis://localhost:6379`                |
| Neo4j      | `7474`, `7687` | http://localhost:7474 (HTTP) · `bolt://localhost:7687` — `neo4j` / `resto_pass` |

## Healthchecks

Chaque service expose un healthcheck Docker :

| Service    | Sonde                                            |
|------------|--------------------------------------------------|
| postgres   | `pg_isready -U resto_user -d restaurant`          |
| mongodb    | `mongosh --eval "db.adminCommand('ping')"`        |
| redis      | `redis-cli ping`                                  |
| neo4j      | `wget --spider http://localhost:7474`             |
| app        | `wget --spider http://localhost:3000/health`      |

## Structure

Architecture backend en couches (`server.js → app.js → routes → controllers → services → db`),
serveur HTTP + Socket.io, stack : Express, mongoose, ioredis, pg, neo4j-driver.

```
.
├── docker-compose.yml   # orchestration des 5 services
├── Dockerfile           # image de l'app Node.js (lance src/server.js)
├── .dockerignore
├── .env.example
├── package.json
├── src/
│   ├── server.js        # entree : connexions + HTTP + Socket.io
│   ├── app.js           # app Express (middlewares + routes)
│   ├── dump.js          # lecture brute du contenu des bases
│   ├── db/              # couche connexions (barrel + 1 fichier/base + withRetry)
│   ├── routes/          # health.routes.js, admin.routes.js
│   ├── controllers/     # health.controller.js, admin.controller.js
│   ├── services/        # health.service.js
│   └── middlewares/     # notFound.js, errorHandler.js
├── seeds/
│   ├── postgres/        # 01_schema.sql, 02_data.sql, seed.js
│   ├── mongo/seed.js
│   ├── redis/seed.js
│   └── neo4j/seed.js
└── scripts/
    ├── seed-all.js      # npm run seed
    └── dump-all.js      # npm run dump
```
