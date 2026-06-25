// Seed Neo4j : graphe plats <-> categories <-> ingredients.
// Utilise le driver partage + la fabrique de sessions de src/db.
import { getSession, connectNeo4j } from "../../src/db/index.js";

export default async function seedNeo4j() {
  await connectNeo4j();

  const session = getSession();
  try {
    // Repartir propre pour un seed reproductible
    await session.run("MATCH (n) DETACH DELETE n");

    await session.run(`
      // Categories
      MERGE (cat:Categorie {nom: 'Plats Principaux'})
      MERGE (dess:Categorie {nom: 'Desserts'})

      // Plats
      MERGE (b:Plat {nom: 'Burger Maison', prix: 12})
      MERGE (f:Plat {nom: 'Fondant Choco', prix: 6.5})

      // Ingredients
      MERGE (pain:Ingredient {nom: 'Pain'})
      MERGE (steak:Ingredient {nom: 'Steak'})
      MERGE (salade:Ingredient {nom: 'Salade'})
      MERGE (choco:Ingredient {nom: 'Chocolat'})

      // Plat -> Categorie
      MERGE (b)-[:APPARTIENT_A]->(cat)
      MERGE (f)-[:APPARTIENT_A]->(dess)

      // Plat -> Ingredients
      MERGE (b)-[:CONTIENT]->(pain)
      MERGE (b)-[:CONTIENT]->(steak)
      MERGE (b)-[:CONTIENT]->(salade)
      MERGE (f)-[:CONTIENT]->(choco)

      // Co-occurrence de commande (burger commande avec fondant)
      MERGE (b)-[r:COMMANDE_AVEC]->(f)
      SET r.count = 7
    `);

    const res = await session.run("MATCH (n) RETURN count(n) AS n");
    console.log(`[neo4j] graphe cree (${res.records[0].get("n")} noeuds)`);
  } finally {
    await session.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedNeo4j().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
