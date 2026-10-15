import { connectDB } from "@/lib/mongodb";
import { Frame } from "@/models/Frame";
import { ApiError, apiError, json, readJSON, requireAdmin } from "@/lib/api";
import { deleteFrameFile } from "@/lib/frame-storage";
type Context = { params: Promise<{ id: string }> };
async function findFrame(request: Request, context: Context) {
  await requireAdmin(request);
  const { id } = await context.params;
  if (!/^[a-f0-9]{24}$/i.test(id)) throw new ApiError("Invalid frame ID.");
  await connectDB();
  const frame = await Frame.findById(id);
  if (!frame) throw new ApiError("Frame not found.", 404);
  return frame;
}
export async function PATCH(request: Request, context: Context) {
  try {
    const frame = await findFrame(request, context);
    const body = await readJSON(request);
    if (typeof body?.isPublished !== "boolean") throw new ApiError("isPublished must be a boolean.");
    frame.isPublished = body.isPublished; await frame.save(); return json(frame);
  } catch (error) { return apiError(error); }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const frame = await findFrame(request, context);
    // Unpublish first so a file deletion failure remains visible and retryable in admin.
    frame.isPublished = false; await frame.save();
    await deleteFrameFile(frame); await frame.deleteOne(); return json({ ok: true });
  } catch (error) { return apiError(error); }
}

export const runtime = "nodejs";
