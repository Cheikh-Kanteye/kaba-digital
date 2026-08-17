import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminRouter } from "./routers/admin";

const collections = {
  users: { countDocuments: vi.fn(), find: vi.fn() },
  properties: { countDocuments: vi.fn() },
  inquiries: { countDocuments: vi.fn() },
};

vi.mock("./mongodbCollections", () => ({ getKabaCollections: vi.fn(async () => collections) }));

beforeEach(() => {
  vi.clearAllMocks();
  collections.users.countDocuments.mockResolvedValue(4);
  collections.properties.countDocuments.mockResolvedValueOnce(6).mockResolvedValueOnce(3);
  collections.inquiries.countDocuments.mockResolvedValue(2);
});

describe("adminRouter", () => {
  it("autorise les statistiques au rôle admin", async () => {
    const caller = adminRouter.createCaller({ user: { role: "admin" } } as never);
    await expect(caller.stats()).resolves.toEqual({ usersCount: 4, propertiesCount: 6, publishedCount: 3, inquiriesCount: 2 });
  });

  it("refuse les statistiques aux comptes professionnels", async () => {
    const caller = adminRouter.createCaller({ user: { role: "user" } } as never);
    await expect(caller.stats()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
