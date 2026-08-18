import { beforeEach, describe, expect, it, vi } from "vitest";
import { kabaRouter } from "./routers/kaba";

const collections = {
  users: { findOne: vi.fn(), updateOne: vi.fn() },
  properties: { findOne: vi.fn(), insertOne: vi.fn(), updateOne: vi.fn(), deleteOne: vi.fn(), find: vi.fn() },
  inquiries: { insertOne: vi.fn(), updateOne: vi.fn(), find: vi.fn() },
};

vi.mock("./mongodbCollections", () => ({
  getKabaCollections: vi.fn(async () => collections),
}));

vi.mock("./cloudinary", () => ({
  uploadToCloudinary: vi.fn(async () => ({ resourceType: "image", secureUrl: "https://res.cloudinary.com/kaba/image/upload/v1/villa.jpg", publicId: "kaba/properties/7/villa", format: "jpg", bytes: 4096, width: 1600, height: 900 })),
}));

const ctx = {
  req: {},
  res: {},
  user: { id: 7, openId: "open-7", email: "agent@kaba.digital", name: "Awa Ndiaye", role: "user" },
};

const propertyInput = {
  title: "Villa des Almadies",
  type: "Maison" as const,
  mode: "Vente" as const,
  location: "Almadies · Dakar",
  priceLabel: "120 000 000 FCFA",
  media: [{ kind: "image" as const, url: "https://example.com/villa.jpg", alt: "Villa" }],
  status: "draft" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  collections.users.findOne.mockResolvedValue(null);
  collections.users.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
  collections.properties.insertOne.mockResolvedValue({ acknowledged: true });
  collections.properties.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
  collections.properties.deleteOne.mockResolvedValue({ deletedCount: 1 });
  collections.properties.findOne.mockResolvedValue({ id: "property-1", status: "published" });
  collections.properties.find.mockReturnValue({ toArray: vi.fn().mockResolvedValue([{ id: "property-1" }]) });
  collections.inquiries.insertOne.mockResolvedValue({ acknowledged: true });
  collections.inquiries.updateOne.mockResolvedValue({ matchedCount: 1, modifiedCount: 1 });
});

describe("kabaRouter", () => {
  it("synchronise le profil professionnel", async () => {
    const caller = kabaRouter.createCaller(ctx as never);
    const result = await caller.profile.update({ profile: "Courtier", city: "Dakar", phone: "+221 77 000 00 00" });
    expect(result.success).toBe(true);
    expect(collections.users.updateOne).toHaveBeenCalledWith(expect.objectContaining({ openId: "open-7" }), expect.objectContaining({ $set: expect.objectContaining({ profile: "Courtier", city: "Dakar" }) }), expect.objectContaining({ upsert: true }));
  });

  it("transfère les métadonnées Cloudinary de l’upload au document du bien", async () => {
    const caller = kabaRouter.createCaller(ctx as never);
    const uploaded = await caller.uploadMedia({ filename: "villa.jpg", mimeType: "image/jpeg", data: `data:image/jpeg;base64,${Buffer.from("image").toString("base64")}` });
    expect(uploaded).toMatchObject({ publicId: "kaba/properties/7/villa", format: "jpg", bytes: 4096, width: 1600, height: 900 });
    const created = await caller.createProperty({ ...propertyInput, media: [{ ...uploaded, alt: "Villa des Almadies" }] });
    expect(collections.properties.insertOne).toHaveBeenCalledWith(expect.objectContaining({ media: [expect.objectContaining({ publicId: "kaba/properties/7/villa", bytes: 4096, width: 1600, height: 900 })] }));
    const cursor = { sort: vi.fn(), limit: vi.fn(), toArray: vi.fn().mockResolvedValue([created.property]) };
    cursor.sort.mockReturnValue(cursor);
    cursor.limit.mockReturnValue(cursor);
    collections.properties.find.mockReturnValue(cursor);
    const reloaded = await caller.ownerProperties();
    expect(reloaded[0]?.media[0]).toMatchObject({ publicId: "kaba/properties/7/villa", format: "jpg", bytes: 4096, width: 1600, height: 900 });
  });

  it("crée, modifie, publie et supprime un bien appartenant à l’utilisateur", async () => {
    const caller = kabaRouter.createCaller(ctx as never);
    const created = await caller.createProperty(propertyInput);
    expect(created.id).toEqual(expect.any(String));
    expect(collections.properties.insertOne).toHaveBeenCalledOnce();
    await caller.updateProperty({ id: created.id, changes: { title: "Villa modifiée" } });
    await caller.publishProperty({ id: created.id });
    await caller.deleteProperty({ id: created.id });
    expect(collections.properties.updateOne).toHaveBeenCalledTimes(2);
    expect(collections.properties.deleteOne).toHaveBeenCalledWith({ id: created.id, ownerId: "7" });
  });

  it("relit tous les champs métier d’un profil local complet", async () => {
    collections.users.findOne.mockResolvedValue({ openId: "open-7", email: "agent@example.com", phone: "+221 77 000 00 00", city: "Dakar", rcNumber: "RC-123", ninea: "NINEA-456", agencyAddress: "Almadies" });
    const caller = kabaRouter.createCaller(ctx as never);
    const profile = await caller.profile.me();
    expect(profile).toMatchObject({ phone: "+221 77 000 00 00", city: "Dakar", rcNumber: "RC-123", ninea: "NINEA-456", agencyAddress: "Almadies" });
  });

  it("persiste une demande publique et permet à son propriétaire de changer son statut", async () => {
    const caller = kabaRouter.createCaller(ctx as never);
    const created = await caller.createInquiry({ propertyId: "property-1", senderName: "Mamadou Ba", senderEmail: "mamadou@example.com", message: "Je souhaite visiter." });
    expect(created.id).toEqual(expect.any(String));
    expect(collections.inquiries.insertOne).toHaveBeenCalledOnce();
    await caller.updateInquiryStatus({ id: created.id, status: "contacted" });
    expect(collections.inquiries.updateOne).toHaveBeenCalledWith({ id: created.id, propertyId: { $in: ["property-1"] } }, expect.objectContaining({ $set: expect.objectContaining({ status: "contacted" }) }));
  });
});
