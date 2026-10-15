import { createSession, validCredentials } from "@/lib/admin-auth";
import { ApiError, apiError, json, readJSON, sameOrigin } from "@/lib/api";
import { checkLoginLimit } from "@/lib/login-limit";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    await checkLoginLimit();
    const body = await readJSON(request);
    if (!validCredentials(body?.email, body?.password)) throw new ApiError("Email or password is incorrect.", 401);
    await createSession();
    return json({ ok: true });
  } catch (error) { return apiError(error); }
}

export const runtime = "nodejs";
