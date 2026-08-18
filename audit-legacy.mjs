import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI2;
if (!uri) throw new Error("MONGO_URI2 is not configured");

const normalizedUri = uri.replace(/([?&])[^&=]*(?:tls|ssl)[^&=]*=([^&]*)/gi, (_, prefix, value) => `${prefix}tls=${value === "true" || value === "false" ? value : "true"}`);
const client = new MongoClient(normalizedUri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
  const db = client.db();
  const collections = await db.listCollections().toArray();
  const report = [];
  for (const collection of collections) {
    const name = collection.name;
    const count = await db.collection(name).countDocuments();
    const sample = await db.collection(name).findOne({}, { projection: { _id: 0 } });
    report.push({ name, count, sampleKeys: sample ? Object.keys(sample).sort() : [] });
  }
  console.log(JSON.stringify({ database: db.databaseName, collections: report }, null, 2));
} finally {
  await client.close();
}
