import "server-only";
import { connectDB } from "@/lib/mongodb";
import { LoginAttempt } from "@/models/LoginAttempt";
import { ApiError } from "@/lib/api";
export async function checkLoginLimit() {
  await connectDB();
  const windowMs = 15 * 60 * 1000;
  const window = Math.floor(Date.now() / windowMs);
  const id = `admin:${window}`;
  const update = { $inc: { count: 1 }, $setOnInsert: { expiresAt: new Date((window + 2) * windowMs) } };
  let attempt;
  try {
    attempt = await LoginAttempt.findOneAndUpdate({ _id: id }, update, { upsert: true, new: true });
  } catch (error) {
    // Concurrent cold starts can race on the initial upsert; retry against the existing key.
    if (!(error && typeof error === "object" && "code" in error && error.code === 11000)) throw error;
    attempt = await LoginAttempt.findOneAndUpdate({ _id: id }, { $inc: { count: 1 } }, { new: true });
  }
  if (!attempt || attempt.count > 10) throw new ApiError("Too many login attempts. Try again in 15 minutes.", 429);
}
