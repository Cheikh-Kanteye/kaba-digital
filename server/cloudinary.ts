import { createHash } from "node:crypto";

const cloudName = process.env.CLOUDINARY_CLOUD_NAME ?? "";
const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";

export type CloudinaryUploadResult = {
  secureUrl: string;
  publicId: string;
  resourceType: "image" | "video";
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  duration?: number;
};

function sign(params: Record<string, string | number>) {
  const canonical = Object.entries(params)
    .filter(([, value]) => value !== "" && value !== undefined)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  return createHash("sha1").update(`${canonical}${apiSecret}`).digest("hex");
}

export async function uploadToCloudinary(input: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder: string;
}): Promise<CloudinaryUploadResult> {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary n’est pas configuré côté serveur.");
  }

  const resourceType = input.mimeType.startsWith("video/") ? "video" : input.mimeType.startsWith("image/") ? "image" : null;
  if (!resourceType) throw new Error("Type de média non pris en charge.");

  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: input.folder, timestamp };
  const body = new FormData();
  body.append("file", new Blob([new Uint8Array(input.buffer)], { type: input.mimeType }), input.filename);
  body.append("api_key", apiKey);
  body.append("timestamp", String(timestamp));
  body.append("folder", input.folder);
  body.append("signature", sign(params));

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, { method: "POST", body });
  const payload = (await response.json()) as Record<string, unknown>;
  if (!response.ok || typeof payload.secure_url !== "string" || typeof payload.public_id !== "string") {
    throw new Error(typeof payload.error === "object" && payload.error && "message" in payload.error ? String(payload.error.message) : "Échec de l’upload Cloudinary.");
  }

  return {
    secureUrl: payload.secure_url,
    publicId: payload.public_id,
    resourceType,
    format: typeof payload.format === "string" ? payload.format : undefined,
    bytes: typeof payload.bytes === "number" ? payload.bytes : undefined,
    width: typeof payload.width === "number" ? payload.width : undefined,
    height: typeof payload.height === "number" ? payload.height : undefined,
    duration: typeof payload.duration === "number" ? payload.duration : undefined,
  };
}
