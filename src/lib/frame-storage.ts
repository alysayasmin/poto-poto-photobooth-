import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { ApiError } from "@/lib/api";
import { FRAME_LAYOUT, MAX_FRAME_BYTES } from "@/lib/frame-layout";
const directory = path.join(process.cwd(), "public/uploads/frames");
export function frameSlug(name: string) {
  return name.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80) || "frame";
}
export async function saveFrame(file: File, slug: string) {
  if (file.type !== "image/png" || !file.size || file.size > MAX_FRAME_BYTES) throw new ApiError("Choose a PNG file up to 5 MB.");
  const input = Buffer.from(await file.arrayBuffer());
  if (!input.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new ApiError("Invalid PNG file.");
  let output: Buffer;
  try {
    const image = sharp(input, { limitInputPixels: FRAME_LAYOUT.width * FRAME_LAYOUT.height, failOn: "warning" });
    const meta = await image.metadata();
    if (meta.width !== FRAME_LAYOUT.width || meta.height !== FRAME_LAYOUT.height || (meta.pages || 1) !== 1) throw new ApiError("Frame must be a static 720 × 2224 px PNG.");
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
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
  await mkdir(directory, { recursive: true });
  const filename = `${slug}-${Date.now()}-${randomUUID()}.png`;
  await writeFile(path.join(directory, filename), output, { flag: "wx" });
  return `/uploads/frames/${filename}`;
}
export async function deleteFrameFile(imageUrl: string) {
  if (!/^\/uploads\/frames\/[a-z0-9-]+\.png$/.test(imageUrl)) throw new Error("Invalid stored frame path.");
  await unlink(path.join(directory, path.basename(imageUrl))).catch((error: NodeJS.ErrnoException) => { if (error.code !== "ENOENT") throw error; });
}
