import type { Collection, Db, IndexDescription } from "mongodb";
import { getMongoDb } from "./mongodb";

export const MONGODB_COLLECTIONS = {
  users: "users",
  properties: "properties",
  inquiries: "inquiries",
} as const;

export type MongoCollectionName = (typeof MONGODB_COLLECTIONS)[keyof typeof MONGODB_COLLECTIONS];

export type KabaUserDocument = {
  openId?: string;
  email?: string;
  name?: string;
  profile?: "Agent immobilier" | "Courtier";
  phone?: string;
  city?: string;
  rcNumber?: string;
  ninea?: string;
  agencyAddress?: string;
  passwordHash?: string;
  role?: "user" | "admin";
  needsProfile?: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type KabaPropertyDocument = {
  id: string;
  ownerId: string;
  title: string;
  type: "Maison" | "Villa" | "Appartement" | "Terrain";
  mode: "Vente" | "Location";
  location: string;
  priceLabel: string;
  media: Array<{
    kind: "image" | "video";
    url: string;
    alt?: string;
    publicId?: string;
    format?: string;
    bytes?: number;
    width?: number;
    height?: number;
    duration?: number;
  }>;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
};

export type KabaInquiryDocument = {
  id: string;
  propertyId: string;
  senderName: string;
  senderEmail?: string;
  senderPhone?: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt: Date;
  updatedAt: Date;
};

export async function getKabaCollections(db?: Db) {
  const database = db ?? (await getMongoDb());
  return {
    users: database.collection<KabaUserDocument>(MONGODB_COLLECTIONS.users),
    properties: database.collection<KabaPropertyDocument>(MONGODB_COLLECTIONS.properties),
    inquiries: database.collection<KabaInquiryDocument>(MONGODB_COLLECTIONS.inquiries),
  };
}

export async function ensureKabaIndexes(db?: Db): Promise<void> {
  const collections = await getKabaCollections(db);
  await collections.users.createIndexes([
    { key: { openId: 1 }, unique: true, sparse: true },
    { key: { email: 1 }, unique: true, sparse: true },
  ]);
  await collections.properties.createIndexes([
    { key: { id: 1 }, unique: true },
    { key: { ownerId: 1, status: 1 } },
    { key: { mode: 1, type: 1, status: 1 } },
  ]);
  await collections.inquiries.createIndexes([
    { key: { propertyId: 1, status: 1 } },
    { key: { createdAt: -1 } },
  ]);
}
