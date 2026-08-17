import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./localAuth";

describe("local password authentication", () => {
  it("hashes and verifies a password without storing the clear value", async () => {
    const password = "KabaAdmin2026!";
    const encoded = await hashPassword(password);
    expect(encoded).toMatch(/^scrypt\$/);
    expect(encoded).not.toContain(password);
    expect(await verifyPassword(password, encoded)).toBe(true);
    expect(await verifyPassword("wrong-password", encoded)).toBe(false);
  });
});
