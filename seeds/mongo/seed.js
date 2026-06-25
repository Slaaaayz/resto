// Seed MongoDB : la carte / les plats de la borne client.
// Utilise la connexion mongoose partagee (collection brute "plats").
import mongoose from "mongoose";
import { connectMongo } from "../../src/db/index.js";

const plats = [
  { nom: "Burger maison", categorie: "plat", prix: 14.5, disponible: true, allergenes: ["gluten", "lactose"] },
  { nom: "Salade cesar", categorie: "entree", prix: 9.5, disponible: true, allergenes: ["oeuf", "lactose"] },
  { nom: "Pizza margherita", categorie: "plat", prix: 11.0, disponible: true, allergenes: ["gluten", "lactose"] },
  { nom: "Frites", categorie: "accompagnement", prix: 4.5, disponible: true, allergenes: [] },
  { nom: "Fondant choco", categorie: "dessert", prix: 6.5, disponible: true, allergenes: ["gluten", "oeuf", "lactose"] },
  { nom: "Cola", categorie: "boisson", prix: 3.5, disponible: true, allergenes: [] },
];

export default async function seedMongo() {
  await connectMongo();

  const collection = mongoose.connection.db.collection("plats");
  for (const plat of plats) {
    await collection.updateOne({ nom: plat.nom }, { $set: plat }, { upsert: true });
  }

  const count = await collection.countDocuments();
  console.log(`[mongodb] ${count} plats dans la collection "plats"`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedMongo().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
