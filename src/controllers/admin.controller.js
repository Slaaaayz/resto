// Controller admin : renvoie en brut le contenu des 4 bases (JSON).
// Pratique pour verifier le resultat d'un seed depuis le navigateur.

import { dumpAll } from "../dump.js";

export async function getDump(_req, res, next) {
  try {
    const data = await dumpAll();
    res.json(data);
  } catch (err) {
    next(err);
  }
}
