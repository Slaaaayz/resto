// Connexion MongoDB via Mongoose (utilise par les modeles, ex: MONGO-01).

import mongoose from "mongoose";
import { withRetry } from "./withRetry.js";

const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/restaurant";

// On expose la connexion mongoose partagee.
export const connection = mongoose.connection;

connection.on("error", (err) => console.error("[mongodb] erreur:", err.message));

export async function connectMongo() {
  return withRetry("mongodb", async () => {
    await mongoose.connect(MONGO_URL);
    return mongoose.connection;
  });
}
