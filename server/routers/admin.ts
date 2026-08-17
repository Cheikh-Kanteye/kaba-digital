import { adminProcedure, router } from "../_core/trpc";
import { getKabaCollections } from "../mongodbCollections";

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
});
