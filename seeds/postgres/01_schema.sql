-- Schema PostgreSQL : salle, serveurs, commandes, encaissement (cote interface serveur)

CREATE TABLE IF NOT EXISTS serveur (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) UNIQUE NOT NULL,
    prenom VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS table_resto (
    id SERIAL PRIMARY KEY,
    numero INT UNIQUE NOT NULL,
    capacite INT NOT NULL,
    statut VARCHAR(50) NOT NULL DEFAULT 'libre'
);

CREATE TABLE IF NOT EXISTS commande (
    id SERIAL PRIMARY KEY,
    numero_commande VARCHAR(255) UNIQUE,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    statut VARCHAR(255) DEFAULT 'en_cours',
    serveur_id INT REFERENCES serveur(id),
    table_id INT REFERENCES table_resto(id)
);

CREATE TABLE IF NOT EXISTS ligne_commande (
    id SERIAL PRIMARY KEY,
    commande_id INT REFERENCES commande(id) ON DELETE CASCADE,
    plat_code VARCHAR(50) NOT NULL,
    plat_nom VARCHAR(255) NOT NULL,
    quantite INT NOT NULL DEFAULT 1,
    prix_unitaire_cents INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS paiement (
    id SERIAL PRIMARY KEY,
    commande_id INT REFERENCES commande(id) ON DELETE CASCADE,
    montant_cents INT NOT NULL,
    moyen VARCHAR(50) NOT NULL DEFAULT 'cb',
    date_paiement TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
