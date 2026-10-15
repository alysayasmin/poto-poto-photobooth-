import { isAdmin } from "@/lib/admin-auth";
export class ApiError extends Error { constructor(message: string, public status = 400) { super(message); } }
export function sameOrigin(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) throw new ApiError("Invalid request origin.", 403);
}
export async function requireAdmin(request: Request) {
  if (request.method !== "GET") sameOrigin(request);
  if (!await isAdmin()) throw new ApiError("Unauthorized.", 401);
}
export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}
export function apiError(error: unknown) {
  if (error instanceof ApiError) return json({ error: error.message }, error.status);
  console.error("Admin/frame operation failed:", error instanceof Error ? error.message : "Unknown error");
  return json({ error: "Something went wrong. Please try again." }, 500);
}
// Bound the body while streaming, even if Content-Length is absent or dishonest.
export async function limitedBody(request: Request, max: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError("Request body is required.");
  const chunks: Uint8Array[] = []; let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > max) { await reader.cancel(); throw new ApiError("File/request is too large.", 413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return new Response(Buffer.concat(chunks), { headers: { "Content-Type": request.headers.get("content-type") || "" } });
}
export async function readJSON(request: Request) {
  try { return await (await limitedBody(request, 4096)).json(); }
  catch (error) { if (error instanceof ApiError) throw error; throw new ApiError("Invalid JSON body."); }
}
