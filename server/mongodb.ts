import { MongoClient, type Db } from "mongodb";

let client: MongoClient | null = null;

export async function getMongoDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");

  if (!client) {
    client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
  }

  return client.db();
}

export async function pingMongoDb(): Promise<boolean> {
  const db = await getMongoDb();
  const result = await db.command({ ping: 1 });
  return result.ok === 1;
}
