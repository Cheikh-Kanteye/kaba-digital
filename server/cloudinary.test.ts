import { beforeEach, describe, expect, it, vi } from "vitest";

describe("Cloudinary upload helper", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.CLOUDINARY_CLOUD_NAME = "kaba-test";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret";
  });

  it("signe et envoie une image sans exposer le secret dans la requête", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ secure_url: "https://res.cloudinary.com/kaba/image/upload/v1/villa.jpg", public_id: "kaba/properties/user/villa", resource_type: "image", format: "jpg", bytes: 12 }), { status: 200, headers: { "content-type": "application/json" } }));
    vi.stubGlobal("fetch", fetchMock);
    const { uploadToCloudinary } = await import("./cloudinary");
    const result = await uploadToCloudinary({ buffer: Buffer.from("image"), filename: "villa.jpg", mimeType: "image/jpeg", folder: "kaba/properties/user" });
    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    const body = request.body as FormData;
    expect(result.secureUrl).toContain("cloudinary.com");
    expect(body.get("api_key")).toBe("test-key");
    expect(body.get("signature")).toBeTruthy();
    expect(String(body.get("signature"))).not.toContain("test-secret");
  });
});
