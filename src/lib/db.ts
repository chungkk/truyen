/**
 * db.ts — MongoDB connection singleton for Next.js
 * Re-uses the MongoClient across hot reloads in development.
 */

import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

let client: MongoClient;
let db: Db;

// In development, reuse across module reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongoClient: MongoClient | undefined;
}

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(MONGODB_URI);
  }
  client = global._mongoClient;
} else {
  client = new MongoClient(MONGODB_URI);
}

export async function getDb(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db("truyen");
  }
  return db;
}
