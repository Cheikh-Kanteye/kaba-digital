import { TRPCError } from "@trpc/server";
import { adminProcedure, router } from "../_core/trpc";
import { getKabaCollections } from "../mongodbCollections";
import type { KabaInquiryDocument, KabaPropertyDocument, KabaUserDocument } from "../mongodbCollections";
import { z } from "zod";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 12;
const EMPTY = { $in: [null, ""] };
const PLACEHOLDER = "À compléter";

type Count = { n: number };
type Slice = { _id: string | null; name?: string; n: number };

const first = (rows: Count[] | undefined) => rows?.[0]?.n ?? 0;

/** Lundi 00:00 UTC, onze semaines avant la semaine en cours (Dakar est à UTC+0). */
function firstWeekStart(now: Date): Date {
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return new Date(monday.getTime() - (WEEKS - 1) * 7 * DAY_MS);
}

const perWeek = (start: Date) => [
  { $match: { createdAt: { $gte: start } } },
  { $group: { _id: { $dateTrunc: { date: "$createdAt", unit: "week", startOfWeek: "monday", timezone: "UTC" } }, n: { $sum: 1 } } },
];

export const adminRouter = router({
  stats: adminProcedure.query(async () => {
    const { users, properties, inquiries } = await getKabaCollections();
    const [usersCount, propertiesCount, publishedCount, inquiriesCount] = await Promise.all([
      users.countDocuments(),
      properties.countDocuments(),
      properties.countDocuments({ status: "published" }),
      inquiries.countDocuments(),
    ]);
    return { usersCount, propertiesCount, publishedCount, inquiriesCount };
  }),

  /** Tout est calculé par la base : la vue d'ensemble ne charge aucune collection entière. */
  dashboard: adminProcedure.query(async () => {
    const { users, properties, inquiries } = await getKabaCollections();
    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * DAY_MS);
    const since60 = new Date(now.getTime() - 60 * DAY_MS);
    const start = firstWeekStart(now);
    const recent = [{ $match: { createdAt: { $gte: since30 } } }, { $count: "n" }];
    const previous = [{ $match: { createdAt: { $gte: since60, $lt: since30 } } }, { $count: "n" }];
    const published = { $match: { status: "published" } };

    const [[p], [u], [i], topInquired] = await Promise.all([
      properties.aggregate<Record<string, never[]> & {
        total: Count[]; published: Count[]; draft: Count[]; archived: Count[]; views: Count[];
        sale: Count[]; rent: Count[]; noMedia: Count[]; noPrice: Count[]; recent: Count[]; previous: Count[];
        byType: Slice[]; byCity: Slice[]; weeks: Slice[];
        topViewed: Array<{ id: string; title: string; location: string; views: number }>;
        latest: Array<{ id: string; title: string; location: string; priceLabel: string; status: string; createdAt: Date }>;
      }>([{ $facet: {
        total: [{ $count: "n" }],
        published: [published, { $count: "n" }],
        draft: [{ $match: { status: "draft" } }, { $count: "n" }],
        archived: [{ $match: { status: "archived" } }, { $count: "n" }],
        views: [published, { $group: { _id: null, n: { $sum: { $ifNull: ["$views", 0] } } } }],
        sale: [published, { $match: { mode: "Vente" } }, { $count: "n" }],
        rent: [published, { $match: { mode: "Location" } }, { $count: "n" }],
        noMedia: [published, { $match: { "media.0": { $exists: false } } }, { $count: "n" }],
        noPrice: [published, { $match: { priceLabel: EMPTY } }, { $count: "n" }],
        recent,
        previous,
        byType: [published, { $group: { _id: "$type", n: { $sum: 1 } } }, { $sort: { n: -1, _id: 1 } }],
        // « Almadies · Dakar » : la ville est le dernier segment du lieu.
        byCity: [
          published,
          { $project: { city: { $trim: { input: { $arrayElemAt: [{ $split: [{ $ifNull: ["$location", ""] }, "·"] }, -1] } } } } },
          { $match: { city: { $ne: "" } } },
          { $group: { _id: { $toLower: "$city" }, name: { $first: "$city" }, n: { $sum: 1 } } },
          { $sort: { n: -1, _id: 1 } },
        ],
        weeks: perWeek(start),
        topViewed: [published, { $match: { views: { $gt: 0 } } }, { $sort: { views: -1 } }, { $limit: 5 }, { $project: { _id: 0, id: 1, title: 1, location: 1, views: 1 } }],
        latest: [{ $sort: { createdAt: -1 } }, { $limit: 5 }, { $project: { _id: 0, id: 1, title: 1, location: 1, priceLabel: 1, status: 1, createdAt: 1 } }],
      } }]).toArray(),

      users.aggregate<Record<string, never[]> & {
        total: Count[]; admins: Count[]; pros: Count[]; incomplete: Count[]; recent: Count[]; previous: Count[];
        byProfile: Slice[]; weeks: Slice[];
        latest: Array<{ name?: string; email?: string; role?: string; profile?: string; createdAt: Date }>;
      }>([{ $facet: {
        total: [{ $count: "n" }],
        admins: [{ $match: { role: "admin" } }, { $count: "n" }],
        pros: [{ $match: { role: { $ne: "admin" } } }, { $count: "n" }],
        incomplete: [
          { $match: { role: { $ne: "admin" }, $or: [{ needsProfile: true }, { phone: EMPTY, whatsapp: EMPTY }] } },
          { $count: "n" },
        ],
        recent: [{ $match: { role: { $ne: "admin" }, createdAt: { $gte: since30 } } }, { $count: "n" }],
        previous: [{ $match: { role: { $ne: "admin" }, createdAt: { $gte: since60, $lt: since30 } } }, { $count: "n" }],
        byProfile: [{ $match: { role: { $ne: "admin" } } }, { $group: { _id: "$profile", n: { $sum: 1 } } }, { $sort: { n: -1, _id: 1 } }],
        weeks: perWeek(start),
        latest: [{ $sort: { createdAt: -1 } }, { $limit: 5 }, { $project: { _id: 0, name: 1, email: 1, role: 1, profile: 1, createdAt: 1 } }],
      } }]).toArray(),

      inquiries.aggregate<Record<string, never[]> & {
        total: Count[]; open: Count[]; contacted: Count[]; closed: Count[]; recent: Count[]; previous: Count[]; weeks: Slice[];
      }>([{ $facet: {
        total: [{ $count: "n" }],
        open: [{ $match: { status: "new" } }, { $count: "n" }],
        contacted: [{ $match: { status: "contacted" } }, { $count: "n" }],
        closed: [{ $match: { status: "closed" } }, { $count: "n" }],
        recent,
        previous,
        weeks: perWeek(start),
      } }]).toArray(),

      inquiries.aggregate<{ id: string; title?: string; n: number }>([
        { $group: { _id: "$propertyId", n: { $sum: 1 } } },
        { $sort: { n: -1, _id: 1 } },
        { $limit: 5 },
        { $lookup: { from: "properties", localField: "_id", foreignField: "id", as: "property" } },
        { $project: { _id: 0, id: "$_id", n: 1, title: { $first: "$property.title" } } },
      ]).toArray(),
    ]);

    // Douze semaines complètes : une semaine sans activité vaut 0, elle ne disparaît pas.
    const read = (rows: Slice[], date: Date) =>
      rows.find((row) => row._id && new Date(row._id).getTime() === date.getTime())?.n ?? 0;
    const weeks = Array.from({ length: WEEKS }, (_, index) => {
      const date = new Date(start.getTime() + index * 7 * DAY_MS);
      return { start: date, properties: read(p.weeks, date), users: read(u.weeks, date), inquiries: read(i.weeks, date) };
    });
    const slices = (rows: Slice[], fallback: string) => rows.map((row) => ({ name: row.name ?? row._id ?? fallback, n: row.n }));

    return {
      generatedAt: now,
      weeks,
      properties: {
        total: first(p.total),
        published: first(p.published),
        draft: first(p.draft),
        archived: first(p.archived),
        views: first(p.views),
        sale: first(p.sale),
        rent: first(p.rent),
        noMedia: first(p.noMedia),
        noPrice: first(p.noPrice),
        recent: first(p.recent),
        previous: first(p.previous),
        byType: slices(p.byType, "Non renseigné"),
        byCity: slices(p.byCity, "Non renseigné"),
        topViewed: p.topViewed,
        latest: p.latest,
      },
      users: {
        total: first(u.total),
        admins: first(u.admins),
        pros: first(u.pros),
        incomplete: first(u.incomplete),
        recent: first(u.recent),
        previous: first(u.previous),
        byProfile: slices(u.byProfile, "Non renseigné"),
        latest: u.latest,
      },
      inquiries: {
        total: first(i.total),
        open: first(i.open),
        contacted: first(i.contacted),
        closed: first(i.closed),
        recent: first(i.recent),
        previous: first(i.previous),
        topProperties: topInquired,
      },
    };
  }),

  recentUsers: adminProcedure.query(async () => {
    const { users } = await getKabaCollections();
    return users.find({}, { projection: { _id: 0, passwordHash: 0 } }).sort({ updatedAt: -1 }).limit(25).toArray();
  }),

  allUsers: adminProcedure.query(async () => {
    const { users } = await getKabaCollections();
    return users.find({}, { projection: { _id: 0, passwordHash: 0 } }).sort({ createdAt: -1 }).limit(500).toArray() as Promise<Omit<KabaUserDocument, "passwordHash">[]>;
  }),

  updateUserRole: adminProcedure
    .input(z.object({ openId: z.string().min(1), role: z.enum(["user", "admin"]) }))
    .mutation(async ({ input, ctx }) => {
      const { users } = await getKabaCollections();
      if (input.role !== "admin") {
        // Sans ces gardes, un clic pouvait fermer l'administration à tout le monde.
        if (ctx.user?.openId === input.openId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Vous ne pouvez pas retirer votre propre accès administrateur." });
        }
        const target = await users.findOne({ openId: input.openId }, { projection: { role: 1 } });
        if (target?.role === "admin" && (await users.countDocuments({ role: "admin" })) <= 1) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Il doit rester au moins un administrateur." });
        }
      }
      const result = await users.updateOne({ openId: input.openId }, { $set: { role: input.role, updatedAt: new Date() } });
      if (result.matchedCount === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Compte introuvable." });
      return { success: true };
    }),

  publishedProperties: adminProcedure.query(async () => {
    const { properties } = await getKabaCollections();
    const rows = await properties.aggregate([
      { $match: { status: "published" } },
      { $sort: { updatedAt: -1 } },
      { $limit: 100 },
      { $lookup: { from: "users", localField: "ownerId", foreignField: "openId", as: "owner" } },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, id: 1, title: 1, type: 1, mode: 1, location: 1, priceLabel: 1, media: 1, status: 1, ownerId: 1, createdAt: 1, updatedAt: 1, ownerName: "$owner.name", ownerEmail: "$owner.email" } },
    ]).toArray();
    return rows as unknown as Array<KabaPropertyDocument & { ownerName?: string; ownerEmail?: string }>;
  }),

  /** Tous les statuts, pour pouvoir retrouver et republier un bien archivé. */
  allProperties: adminProcedure.query(async () => {
    const { properties } = await getKabaCollections();
    const rows = await properties.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 500 },
      { $lookup: { from: "users", localField: "ownerId", foreignField: "openId", as: "owner" } },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, id: 1, title: 1, type: 1, mode: 1, location: 1, priceLabel: 1, description: 1, surface: 1, bedrooms: 1, bathrooms: 1, media: 1, status: 1, views: 1, ownerId: 1, createdAt: 1, updatedAt: 1, ownerName: { $ifNull: ["$owner.name", "$ownerSnapshot.name"] }, ownerEmail: "$owner.email" } },
    ]).toArray();
    return rows as unknown as Array<KabaPropertyDocument & { ownerName?: string; ownerEmail?: string }>;
  }),

  updatePropertyStatus: adminProcedure
    .input(z.object({ id: z.string().min(1), status: z.enum(["published", "archived"]) }))
    .mutation(async ({ input }) => {
      const { properties } = await getKabaCollections();
      if (input.status === "published") {
        // Un bien recréé à partir de ses médias porte des textes provisoires : ils ne doivent pas atteindre le site.
        const property = await properties.findOne({ id: input.id }, { projection: { title: 1, location: 1, priceLabel: 1 } });
        if (!property) throw new TRPCError({ code: "NOT_FOUND", message: "Bien introuvable." });
        if (property.title.startsWith(PLACEHOLDER) || property.location.startsWith(PLACEHOLDER) || !property.priceLabel?.trim()) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Complétez le titre, le lieu et le prix avant de publier ce bien." });
        }
      }
      const result = await properties.updateOne({ id: input.id }, { $set: { status: input.status, updatedAt: new Date() } });
      if (result.matchedCount === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Bien introuvable." });
      return { success: true };
    }),

  /** Modification sans contrôle du propriétaire : réservée aux admins, elle n'expose ni médias ni statut. */
  updateProperty: adminProcedure
    .input(z.object({
      id: z.string().min(1),
      changes: z.object({
        title: z.string().trim().min(1).max(160),
        type: z.enum(["Maison", "Villa", "Appartement", "Terrain"]),
        mode: z.enum(["Vente", "Location"]),
        location: z.string().trim().min(1).max(160),
        priceLabel: z.string().trim().max(80),
        description: z.string().trim().max(5000),
        surface: z.string().trim().max(40),
        bedrooms: z.number().int().min(0).max(100),
        bathrooms: z.number().int().min(0).max(100),
      }),
    }))
    .mutation(async ({ input }) => {
      const { properties } = await getKabaCollections();
      const result = await properties.updateOne({ id: input.id }, { $set: { ...input.changes, updatedAt: new Date() } });
      if (result.matchedCount === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Bien introuvable." });
      return { success: true };
    }),

  inquiries: adminProcedure.query(async () => {
    const { inquiries } = await getKabaCollections();
    const rows = await inquiries.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 500 },
      { $lookup: { from: "properties", localField: "propertyId", foreignField: "id", as: "property" } },
      { $unwind: { path: "$property", preserveNullAndEmptyArrays: true } },
      { $project: { _id: 0, id: 1, propertyId: 1, senderName: 1, senderEmail: 1, senderPhone: 1, message: 1, status: 1, createdAt: 1, updatedAt: 1, propertyTitle: "$property.title", propertyLocation: "$property.location" } },
    ]).toArray();
    return rows as unknown as Array<KabaInquiryDocument & { propertyTitle?: string; propertyLocation?: string }>;
  }),

  updateInquiryStatus: adminProcedure.input(z.object({ id: z.string(), status: z.enum(["new", "contacted", "closed"]) })).mutation(async ({ input }) => {
    const { inquiries } = await getKabaCollections();
    const result = await inquiries.updateOne({ id: input.id }, { $set: { status: input.status, updatedAt: new Date() } });
    if (result.matchedCount === 0) throw new Error("Demande introuvable.");
    return { success: true };
  }),
});
