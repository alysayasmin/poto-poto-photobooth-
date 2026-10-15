import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { requiredEnv } from "@/lib/server-env";
import { ApiError } from "@/lib/api";
import { FRAME_LAYOUT, MAX_FRAME_BYTES } from "@/lib/frame-layout";
export type StoredFrame = { imageUrl: string; cloudinaryPublicId: string };
function storage() {
  cloudinary.config({ cloud_name: requiredEnv("CLOUDINARY_CLOUD_NAME"), api_key: requiredEnv("CLOUDINARY_API_KEY"), api_secret: requiredEnv("CLOUDINARY_API_SECRET"), secure: true });
  return cloudinary;
}
export function frameSlug(name: string) {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "frame";
}
export async function saveFrame(file: File, slug: string) {
  if (file.size > MAX_FRAME_BYTES) throw new ApiError("Choose a PNG file up to 4 MB.", 413);
  if (file.type !== "image/png" || !file.size) throw new ApiError("Choose a valid PNG file.");
  const input = Buffer.from(await file.arrayBuffer());
  if (!input.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new ApiError("Invalid PNG file.");
  let output: Buffer;
  try {
    const image = sharp(input, { limitInputPixels: FRAME_LAYOUT.width * FRAME_LAYOUT.height, failOn: "warning" });
    const meta = await image.metadata();
    if (meta.width !== FRAME_LAYOUT.width || meta.height !== FRAME_LAYOUT.height || (meta.pages || 1) !== 1) throw new ApiError("Frame must be a static 720 × 2224 px PNG.");
    const { data, info } = await image.toColourspace("srgb").ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    // Require transparent windows at the existing four fixed photo positions.
    for (let i = 0; i < 4; i++) {
      let transparent = false;
      const top = FRAME_LAYOUT.padding + i * (FRAME_LAYOUT.photoHeight + FRAME_LAYOUT.gap);
      for (let y = top; y < top + FRAME_LAYOUT.photoHeight && !transparent; y++) {
        for (let x = FRAME_LAYOUT.padding; x < FRAME_LAYOUT.padding + FRAME_LAYOUT.photoWidth; x++) {
          if (data[(y * info.width + x) * 4 + 3] < 255) { transparent = true; break; }
        }
      }
      if (!transparent) throw new ApiError("PNG must have transparency in all four photo slots.");
    }
    output = await sharp(data, { raw: info }).png().toBuffer();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError("Invalid or damaged PNG file.");
  }
  const publicId = `poto-poto/frames/${slug}-${randomUUID()}`;
  const client = storage();
  try {
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      client.uploader.upload_stream({
        public_id: publicId, resource_type: "image", format: "png", allowed_formats: ["png"],
        overwrite: false, timeout: 30000,
      }, (error, result) => {
        if (error || !result) reject(new Error("Cloudinary upload failed."));
        else resolve(result);
      }).end(output);
    });
    return { imageUrl: result.secure_url, cloudinaryPublicId: result.public_id };
  } catch (error) {
    // The provider may have accepted an upload even when its response timed out.
    await deleteFrameFile({ imageUrl: "", cloudinaryPublicId: publicId }).catch(() => {
      console.error("Cloudinary cleanup needs retry for asset:", publicId);
    });
    throw error;
  }
}
export async function deleteFrameFile(frame: { imageUrl: string; cloudinaryPublicId?: string | null }) {
  if (!frame.cloudinaryPublicId) {
    // Legacy local files must be removed/migrated before deploying; no filesystem writes on Vercel.
    if (frame.imageUrl.startsWith("/uploads/frames/")) return;
    throw new ApiError("Frame has no Cloudinary asset ID. Reconcile the asset before deleting metadata.", 409);
  }
  if (!/^poto-poto\/frames\/[a-z0-9-]+$/.test(frame.cloudinaryPublicId)) throw new ApiError("Invalid stored asset ID.", 409);
  // The SDK forwards timeout, although its destroy() type omits that common option.
  const options = { resource_type: "image" as const, invalidate: true, timeout: 15000 };
  const result = await storage().uploader.destroy(frame.cloudinaryPublicId, options);
  if (result.result !== "ok" && result.result !== "not found") throw new Error("Cloudinary deletion failed.");
}
