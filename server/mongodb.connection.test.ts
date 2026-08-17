import { describe, expect, it } from "vitest";
import { pingMongoDb, getMongoDb } from "./mongodb";
import { ensureKabaIndexes, getKabaCollections } from "./mongodbCollections";

describe("MongoDB configuration", () => {
  it.skipIf(process.env.MONGODB_TEST_REQUIRED !== "true")("connects with the configured server secret without exposing it", async () => {
    const uri = process.env.MONGODB_URI;
    expect(uri).toBeTruthy();
    expect(uri).toMatch(/^mongodb\+srv:\/\//);
    expect(uri).not.toContain("undefined");

    expect(await pingMongoDb()).toBe(true);
    const db = await getMongoDb();
    const collections = await getKabaCollections(db);
    expect(collections.properties.collectionName).toBe("properties");
    await ensureKabaIndexes(db);
  }, 15000);
});
