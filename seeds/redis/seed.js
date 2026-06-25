// Seed Redis : etat temps reel (statut des tables, classement des plats, panier, file cuisine).
// Utilise le client ioredis partage (API en minuscules : set, zadd, rpush...).
import { redis, connectRedis } from "../../src/db/index.js";

export default async function seedRedis() {
  await connectRedis();

  // Statut des tables (cle simple par table)
  await redis.set("statut_0", "Libre");
  await redis.set("statut_1", "Occupee");
  await redis.set("statut_2", "Reservee");

  // Classement des plats les plus commandes (sorted set)
  await redis.del("classement_plats");
  await redis.zadd("classement_plats", 42, "Burger Maison", 30, "Pizza margherita", 18, "Salade cesar");

  // Panier en cours sur une borne client
  const panier = { table: 2, items: ["Pizza margherita", "Cola"] };
  await redis.set("panier_utilisateur", JSON.stringify(panier));

  // File de l'ecran cuisine
  await redis.del("cuisine:queue");
  await redis.rpush(
    "cuisine:queue",
    JSON.stringify({ commande: "CMD-0001", plat: "Burger maison", table: 2, statut: "a_preparer" }),
    JSON.stringify({ commande: "CMD-0001", plat: "Frites", table: 2, statut: "a_preparer" })
  );

  console.log("[redis] statuts tables, classement plats, panier et file cuisine inseres");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedRedis().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
