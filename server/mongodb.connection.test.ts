import { describe, expect, it } from "vitest";
import { pingMongoDb } from "./mongodb";

describe("MongoDB configuration", () => {
  it("connects with the configured server secret without exposing it", async () => {
    const uri = process.env.MONGODB_URI;
    expect(uri).toBeTruthy();
    expect(uri).toMatch(/^mongodb\+srv:\/\//);
    expect(uri).not.toContain("undefined");

    expect(await pingMongoDb()).toBe(true);
  }, 10000);
});
