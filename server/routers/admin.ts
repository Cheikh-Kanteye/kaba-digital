import { adminProcedure, router } from "../_core/trpc";
import { getKabaCollections } from "../mongodbCollections";
import type { KabaInquiryDocument, KabaPropertyDocument } from "../mongodbCollections";
import { z } from "zod";

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
  recentUsers: adminProcedure.query(async () => {
    const { users } = await getKabaCollections();
    return users.find({}, { projection: { _id: 0, passwordHash: 0 } }).sort({ updatedAt: -1 }).limit(25).toArray();
  }),
  allUsers: adminProcedure.query(async () => {
    const { users } = await getKabaCollections();
    return users.find({}, { projection: { _id: 0, passwordHash: 0 } }).sort({ updatedAt: -1 }).limit(100).toArray();
  }),
  publishedProperties: adminProcedure.query(async () => {
    const { properties, users } = await getKabaCollections();
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
  inquiries: adminProcedure.query(async () => {
    const { inquiries, properties } = await getKabaCollections();
    const rows = await inquiries.aggregate([
      { $sort: { createdAt: -1 } },
      { $limit: 100 },
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
