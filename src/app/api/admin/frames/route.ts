import { connectDB } from "@/lib/mongodb";
import { Frame } from "@/models/Frame";
import { ApiError, apiError, json, limitedBody, requireAdmin } from "@/lib/api";
import { deleteFrameFile, frameSlug, saveFrame } from "@/lib/frame-storage";
import { MAX_FRAME_BYTES } from "@/lib/frame-layout";
export const runtime = "nodejs";
export async function GET(request: Request) {
  try { await requireAdmin(request); await connectDB(); return json(await Frame.find().sort({ createdAt: -1 }).lean()); }
  catch (error) { return apiError(error); }
}
export async function POST(request: Request) {
  let imageUrl: string | undefined;
  try {
    await requireAdmin(request);
    const body = await limitedBody(request, MAX_FRAME_BYTES + 64 * 1024);
    let form: FormData;
    try { form = await body.formData(); } catch { throw new ApiError("Invalid upload form."); }
    const name = form.get("name"); const file = form.get("file"); const published = form.get("isPublished");
    if (typeof name !== "string" || !name.trim() || name.trim().length > 100) throw new ApiError("Frame name is required (maximum 100 characters).");
    if (!(file instanceof File)) throw new ApiError("Frame PNG is required.");
    if (published !== null && published !== "true" && published !== "false") throw new ApiError("Invalid publish status.");
    const slug = frameSlug(name.trim());
    await connectDB();
    imageUrl = await saveFrame(file, slug);
    const frame = await Frame.create({ name: name.trim(), slug, imageUrl, isPublished: published === "true" });
    return json(frame, 201);
  } catch (error) {
    if (imageUrl) await deleteFrameFile(imageUrl).catch(() => console.error("Failed to clean up uploaded file."));
    return apiError(error);
  }
}
