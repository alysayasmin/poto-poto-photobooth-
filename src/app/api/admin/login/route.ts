import { createSession, validCredentials } from "@/lib/admin-auth";
import { ApiError, apiError, json, readJSON, sameOrigin } from "@/lib/api";
// Single-account MVP throttle, retained across development hot reloads.
const state = globalThis as typeof globalThis & { adminAttempts?: { count: number; until: number } };
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    if (!state.adminAttempts || state.adminAttempts.until < Date.now()) state.adminAttempts = { count: 0, until: Date.now() + 15 * 60 * 1000 };
    if (state.adminAttempts.count >= 10) throw new ApiError("Too many login attempts. Try again in 15 minutes.", 429);
    state.adminAttempts.count++;
    const body = await readJSON(request);
    if (!validCredentials(body?.email, body?.password)) throw new ApiError("Email or password is incorrect.", 401);
    await createSession();
    state.adminAttempts.count = 0;
    return json({ ok: true });
  } catch (error) { return apiError(error); }
}
