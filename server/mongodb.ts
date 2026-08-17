import { MongoClient, type Db } from "mongodb";

let client: MongoClient | null = null;

export async function getMongoDb(): Promise<Db> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");

  if (!client) {
    const nextClient = new MongoClient(uri, { serverSelectionTimeoutMS: 8000, connectTimeoutMS: 8000 });
    try {
      await nextClient.connect();
      client = nextClient;
    } catch (error) {
      await nextClient.close().catch(() => undefined);
      throw error;
    }
  }

  return client.db();
}

export async function pingMongoDb(): Promise<boolean> {
  const db = await getMongoDb();
  const result = await db.command({ ping: 1 });
  return result.ok === 1;
}
