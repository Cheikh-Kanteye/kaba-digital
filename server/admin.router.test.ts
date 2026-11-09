import { beforeEach, describe, expect, it, vi } from "vitest";
import { adminRouter } from "./routers/admin";

const collections = {
  users: { countDocuments: vi.fn(), find: vi.fn(), findOne: vi.fn(), updateOne: vi.fn(), aggregate: vi.fn() },
  properties: { countDocuments: vi.fn(), findOne: vi.fn(), updateOne: vi.fn(), aggregate: vi.fn() },
  inquiries: { countDocuments: vi.fn(), aggregate: vi.fn() },
};

vi.mock("./mongodbCollections", () => ({ getKabaCollections: vi.fn(async () => collections) }));

const admin = adminRouter.createCaller({ user: { role: "admin", openId: "local:moi" } } as never);
const pro = adminRouter.createCaller({ user: { role: "user", openId: "local:pro" } } as never);
const rows = <T,>(value: T) => ({ toArray: async () => value });

function mockDashboard() {
  const lundi = new Date();
  lundi.setUTCHours(0, 0, 0, 0);
  lundi.setUTCDate(lundi.getUTCDate() - ((lundi.getUTCDay() + 6) % 7));
  collections.properties.aggregate.mockReturnValue(rows([{
    total: [{ n: 12 }], published: [{ n: 3 }], draft: [{ n: 9 }], archived: [], views: [{ n: 87 }],
    sale: [{ n: 2 }], rent: [{ n: 1 }], noMedia: [], noPrice: [], recent: [{ n: 4 }], previous: [],
    byType: [{ _id: "Villa", n: 1 }], byCity: [{ _id: "dakar", name: "Dakar", n: 3 }],
    weeks: [{ _id: lundi, n: 2 }], topViewed: [], latest: [],
  }]));
  collections.users.aggregate.mockReturnValue(rows([{
    total: [{ n: 7 }], admins: [{ n: 1 }], pros: [{ n: 6 }], incomplete: [{ n: 2 }], recent: [], previous: [],
    byProfile: [{ _id: null, n: 6 }], weeks: [], latest: [],
  }]));
  collections.inquiries.aggregate
    .mockReturnValueOnce(rows([{ total: [{ n: 1 }], open: [{ n: 1 }], contacted: [], closed: [], recent: [{ n: 1 }], previous: [], weeks: [] }]))
    .mockReturnValueOnce(rows([{ id: "b1", title: "Villa", n: 1 }]));
}

beforeEach(() => {
  Object.values(collections).forEach((collection) => Object.values(collection).forEach((fn) => fn.mockReset()));
  collections.users.countDocuments.mockResolvedValue(4);
  collections.properties.countDocuments.mockResolvedValueOnce(6).mockResolvedValueOnce(3);
  collections.inquiries.countDocuments.mockResolvedValue(2);
  collections.users.updateOne.mockResolvedValue({ matchedCount: 1 });
  collections.properties.updateOne.mockResolvedValue({ matchedCount: 1 });
});

describe("adminRouter", () => {
  it("autorise les statistiques au rôle admin", async () => {
    await expect(admin.stats()).resolves.toEqual({ usersCount: 4, propertiesCount: 6, publishedCount: 3, inquiriesCount: 2 });
  });

  it("refuse les statistiques aux comptes professionnels", async () => {
    await expect(pro.stats()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("refuse le tableau de bord et les actions aux comptes professionnels", async () => {
    await expect(pro.dashboard()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(pro.updateUserRole({ openId: "x", role: "admin" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(pro.updatePropertyStatus({ id: "x", status: "archived" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("assemble le tableau de bord sur douze semaines complètes", async () => {
    mockDashboard();
    const result = await admin.dashboard();
    expect(result.weeks).toHaveLength(12);
    expect(result.weeks[11].properties).toBe(2);
    expect(result.weeks[0].properties).toBe(0);
    expect(result.properties).toMatchObject({ total: 12, published: 3, draft: 9, archived: 0, views: 87 });
    expect(result.properties.byCity).toEqual([{ name: "Dakar", n: 3 }]);
    expect(result.users.byProfile).toEqual([{ name: "Non renseigné", n: 6 }]);
    expect(result.inquiries.topProperties).toEqual([{ id: "b1", title: "Villa", n: 1 }]);
  });

  it("empêche un admin de retirer son propre accès", async () => {
    await expect(admin.updateUserRole({ openId: "local:moi", role: "user" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(collections.users.updateOne).not.toHaveBeenCalled();
  });

  it("garde toujours un administrateur", async () => {
    collections.users.findOne.mockResolvedValue({ role: "admin" });
    collections.users.countDocuments.mockResolvedValue(1);
    await expect(admin.updateUserRole({ openId: "local:autre", role: "user" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(collections.users.updateOne).not.toHaveBeenCalled();
  });

  it("retire le rôle admin quand un autre administrateur reste", async () => {
    collections.users.findOne.mockResolvedValue({ role: "admin" });
    collections.users.countDocuments.mockResolvedValue(2);
    await expect(admin.updateUserRole({ openId: "local:autre", role: "user" })).resolves.toEqual({ success: true });
  });

  it("refuse de publier un bien provisoire ou sans prix", async () => {
    collections.properties.findOne.mockResolvedValue({ title: "À compléter — Bien 01", location: "À compléter", priceLabel: "" });
    await expect(admin.updatePropertyStatus({ id: "b1", status: "published" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    collections.properties.findOne.mockResolvedValue({ title: "Villa", location: "Ngor · Dakar", priceLabel: " " });
    await expect(admin.updatePropertyStatus({ id: "b1", status: "published" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    expect(collections.properties.updateOne).not.toHaveBeenCalled();
  });

  it("publie un bien complété", async () => {
    collections.properties.findOne.mockResolvedValue({ title: "Villa", location: "Ngor · Dakar", priceLabel: "1 000 FCFA" });
    await expect(admin.updatePropertyStatus({ id: "b1", status: "published" })).resolves.toEqual({ success: true });
  });

  it("modifie un bien sans toucher à son statut ni à ses médias", async () => {
    const changes = { title: "Villa", type: "Villa" as const, mode: "Vente" as const, location: "Ngor · Dakar", priceLabel: "1 000 FCFA", description: "", surface: "", bedrooms: 2, bathrooms: 1 };
    await expect(admin.updateProperty({ id: "b1", changes })).resolves.toEqual({ success: true });
    const $set = collections.properties.updateOne.mock.calls[0][1].$set;
    expect($set.title).toBe("Villa");
    expect($set).not.toHaveProperty("status");
    expect($set).not.toHaveProperty("media");
    await expect(pro.updateProperty({ id: "b1", changes })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("archive un bien et signale un bien introuvable", async () => {
    await expect(admin.updatePropertyStatus({ id: "b1", status: "archived" })).resolves.toEqual({ success: true });
    expect(collections.properties.updateOne.mock.calls[0][1].$set.status).toBe("archived");
    collections.properties.updateOne.mockResolvedValue({ matchedCount: 0 });
    await expect(admin.updatePropertyStatus({ id: "absent", status: "published" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
