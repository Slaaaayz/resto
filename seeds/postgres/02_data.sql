-- Donnees de demonstration PostgreSQL

-- Serveurs
INSERT INTO serveur (nom, prenom) VALUES ('Dupont', 'Pierre') ON CONFLICT (nom) DO NOTHING;
INSERT INTO serveur (nom, prenom) VALUES ('Martin', 'Sophie') ON CONFLICT (nom) DO NOTHING;

-- Tables de la salle
INSERT INTO table_resto (numero, capacite, statut) VALUES
    (1, 2, 'libre'),
    (2, 4, 'occupee'),
    (3, 4, 'libre'),
    (4, 6, 'reservee')
ON CONFLICT (numero) DO NOTHING;

-- Une commande en cours sur la table 2, prise par Pierre Dupont
INSERT INTO commande (numero_commande, statut, serveur_id, table_id)
SELECT 'CMD-0001', 'en_cours', s.id, t.id
FROM serveur s, table_resto t
WHERE s.nom = 'Dupont' AND t.numero = 2
ON CONFLICT (numero_commande) DO NOTHING;

-- Lignes de cette commande
INSERT INTO ligne_commande (commande_id, plat_code, plat_nom, quantite, prix_unitaire_cents)
SELECT c.id, 'BURGER', 'Burger maison', 1, 1450 FROM commande c WHERE c.numero_commande = 'CMD-0001'
UNION ALL
SELECT c.id, 'FRITES', 'Frites', 2, 450 FROM commande c WHERE c.numero_commande = 'CMD-0001'
UNION ALL
SELECT c.id, 'COLA', 'Cola', 1, 350 FROM commande c WHERE c.numero_commande = 'CMD-0001';

-- Une commande deja payee sur la table 1, prise par Sophie Martin
INSERT INTO commande (numero_commande, statut, serveur_id, table_id)
SELECT 'CMD-0002', 'payee', s.id, t.id
FROM serveur s, table_resto t
WHERE s.nom = 'Martin' AND t.numero = 1
ON CONFLICT (numero_commande) DO NOTHING;

INSERT INTO ligne_commande (commande_id, plat_code, plat_nom, quantite, prix_unitaire_cents)
SELECT c.id, 'SALADE', 'Salade cesar', 1, 950 FROM commande c WHERE c.numero_commande = 'CMD-0002';

INSERT INTO paiement (commande_id, montant_cents, moyen)
SELECT c.id, 950, 'cb' FROM commande c WHERE c.numero_commande = 'CMD-0002';
