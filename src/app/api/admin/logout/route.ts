import { destroySession } from "@/lib/admin-auth";
import { apiError, json, requireAdmin } from "@/lib/api";
export async function POST(request: Request) {
  try { await requireAdmin(request); await destroySession(); return json({ ok: true }); }
  catch (error) { return apiError(error); }
}

export const runtime = "nodejs";
