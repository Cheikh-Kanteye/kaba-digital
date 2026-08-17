import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getKabaCollections, type KabaInquiryDocument, type KabaPropertyDocument } from "../mongodbCollections";

const propertyType = z.enum(["Maison", "Villa", "Appartement", "Terrain"]);
const propertyMode = z.enum(["Vente", "Location"]);
const propertyStatus = z.enum(["draft", "published", "archived"]);

const mediaItem = z.object({
  kind: z.enum(["image", "video"]),
  url: z.string().trim().min(1).max(500),
  alt: z.string().max(180).optional(),
});

const propertyInput = z.object({
  title: z.string().trim().min(3).max(140),
  type: propertyType,
  mode: propertyMode,
  location: z.string().trim().min(2).max(120),
  priceLabel: z.string().trim().min(1).max(80),
  media: z.array(mediaItem).min(1).max(12),
  description: z.string().trim().max(1200).optional(),
  status: propertyStatus.default("draft"),
});

const propertyProjection = { _id: 0 } as const;

export const kabaRouter = router({
  profile: router({
    me: protectedProcedure.query(async ({ ctx }) => {
      const { users } = await getKabaCollections();
      const openId = String(ctx.user.openId);
      const existing = await users.findOne({ openId }, { projection: { _id: 0 } });
      if (existing) return existing;
      const now = new Date();
      const profile = { openId, email: ctx.user.email ?? undefined, name: ctx.user.name ?? undefined, createdAt: now, updatedAt: now };
      await users.updateOne({ openId }, { $setOnInsert: profile }, { upsert: true });
      return profile;
    }),
    update: protectedProcedure.input(z.object({
      name: z.string().trim().min(2).max(120).optional(),
      profile: z.enum(["Agent immobilier", "Courtier"]).optional(),
      phone: z.string().trim().max(30).optional(),
      city: z.string().trim().max(100).optional(),
      rcNumber: z.string().trim().max(80).optional(),
      ninea: z.string().trim().max(80).optional(),
      agencyAddress: z.string().trim().max(180).optional(),
    })).mutation(async ({ ctx, input }) => {
      const { users } = await getKabaCollections();
      const now = new Date();
      await users.updateOne({ openId: String(ctx.user.openId) }, { $set: { ...input, email: ctx.user.email ?? undefined, updatedAt: now }, $setOnInsert: { createdAt: now } }, { upsert: true });
      return { success: true } as const;
    }),
  }),
  publishedProperties: publicProcedure
    .input(z.object({ mode: propertyMode.optional(), type: propertyType.optional() }).optional())
    .query(async ({ input }) => {
      const { properties } = await getKabaCollections();
      const filter = {
        status: "published" as const,
        ...(input?.mode ? { mode: input.mode } : {}),
        ...(input?.type ? { type: input.type } : {}),
      };
      return properties.find(filter, { projection: propertyProjection }).sort({ updatedAt: -1 }).limit(60).toArray();
    }),

  ownerProperties: protectedProcedure.query(async ({ ctx }) => {
    const { properties } = await getKabaCollections();
    return properties.find({ ownerId: String(ctx.user.id) }, { projection: propertyProjection }).sort({ updatedAt: -1 }).limit(100).toArray();
  }),

  createProperty: protectedProcedure.input(propertyInput).mutation(async ({ ctx, input }) => {
    const { properties } = await getKabaCollections();
    const now = new Date();
    const property: KabaPropertyDocument = {
      id: nanoid(12),
      ownerId: String(ctx.user.id),
      title: input.title,
      type: input.type,
      mode: input.mode,
      location: input.location,
      priceLabel: input.priceLabel,
      media: input.media,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    };
    await properties.insertOne(property);
    return { id: property.id, property };
  }),

  updateProperty: protectedProcedure
    .input(z.object({ id: z.string().min(1), changes: propertyInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      const { properties } = await getKabaCollections();
      const update = { ...input.changes, updatedAt: new Date() };
      const result = await properties.updateOne({ id: input.id, ownerId: String(ctx.user.id) }, { $set: update });
      if (result.matchedCount === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Bien introuvable" });
      return { success: true } as const;
    }),

  publishProperty: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const { properties } = await getKabaCollections();
    const result = await properties.updateOne({ id: input.id, ownerId: String(ctx.user.id) }, { $set: { status: "published", updatedAt: new Date() } });
    if (result.matchedCount === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Bien introuvable" });
    return { success: true } as const;
  }),

  deleteProperty: protectedProcedure.input(z.object({ id: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    const { properties } = await getKabaCollections();
    const result = await properties.deleteOne({ id: input.id, ownerId: String(ctx.user.id) });
    if (result.deletedCount === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Bien introuvable" });
    return { success: true } as const;
  }),

  createInquiry: publicProcedure.input(z.object({
    propertyId: z.string().min(1),
    senderName: z.string().trim().min(2).max(100),
    senderEmail: z.string().email().optional(),
    senderPhone: z.string().trim().max(30).optional(),
    message: z.string().trim().max(1200).optional(),
  })).mutation(async ({ input }) => {
    const { inquiries, properties } = await getKabaCollections();
    const propertyExists = await properties.findOne({ id: input.propertyId, status: "published" }, { projection: { id: 1 } });
    if (!propertyExists) throw new TRPCError({ code: "NOT_FOUND", message: "Bien introuvable" });
    const now = new Date();
    const inquiry: KabaInquiryDocument = { id: nanoid(12), ...input, status: "new", createdAt: now, updatedAt: now };
    const result = await inquiries.insertOne(inquiry);
    return { id: inquiry.id };
  }),

  updateInquiryStatus: protectedProcedure.input(z.object({ id: z.string().min(1), status: z.enum(["new", "contacted", "closed"]) })).mutation(async ({ ctx, input }) => {
    const { inquiries, properties } = await getKabaCollections();
    const owned = await properties.find({ ownerId: String(ctx.user.id) }, { projection: { id: 1 } }).toArray();
    const propertyIds = owned.map((property) => property.id);
    const result = await inquiries.updateOne({ id: input.id, propertyId: { $in: propertyIds } }, { $set: { status: input.status, updatedAt: new Date() } });
    if (result.matchedCount === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Demande introuvable" });
    return { success: true } as const;
  }),

  ownerInquiries: protectedProcedure.query(async ({ ctx }) => {
    const { inquiries, properties } = await getKabaCollections();
    const owned = await properties.find({ ownerId: String(ctx.user.id) }, { projection: { id: 1 } }).toArray();
    const propertyIds = owned.map((property) => property.id);
    if (propertyIds.length === 0) return [];
    return inquiries.find({ propertyId: { $in: propertyIds } }, { projection: propertyProjection }).sort({ createdAt: -1 }).limit(100).toArray();
  }),
});
