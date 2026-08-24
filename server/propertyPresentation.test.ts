import { describe, expect, it } from "vitest";
import { formatPropertyAge, phoneDigits } from "@/lib/propertyPresentation";

describe("property presentation helpers", () => {
  it("normalizes agent phone numbers for WhatsApp links", () => {
    expect(phoneDigits("+221 77 123 45 67")).toBe("221771234567");
    expect(phoneDigits(undefined)).toBe("");
  });

  it("formats listing age from the persisted date", () => {
    const now = Date.now();
    expect(formatPropertyAge(new Date(now - 86_400_000))).toBe("il y a 1 jour");
    expect(formatPropertyAge(undefined)).toBe("date non renseignée");
  });
});
