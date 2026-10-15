import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { AdminSession } from "@/models/AdminSession";
export const SESSION_COOKIE = "poto_admin";
const hash = (value: string) => createHash("sha256").update(value).digest("hex");
const credentials = (token: string) => hash(JSON.stringify([process.env.ADMIN_EMAIL, process.env.ADMIN_PASSWORD, token]));
export function validCredentials(email: unknown, password: unknown) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) throw new Error("Admin credentials are not configured.");
  const emailOK = timingSafeEqual(Buffer.from(hash(typeof email === "string" ? email : "")), Buffer.from(hash(process.env.ADMIN_EMAIL)));
  const passwordOK = timingSafeEqual(Buffer.from(hash(typeof password === "string" ? password : "")), Buffer.from(hash(process.env.ADMIN_PASSWORD)));
  return emailOK && passwordOK;
}
const options = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict" as const, path: "/" };
export async function isAdmin() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token) || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) return false;
  await connectDB();
  return !!await AdminSession.exists({ tokenHash: hash(token), credentialHash: credentials(token), expiresAt: { $gt: new Date() } });
}
export async function createSession() {
  await connectDB();
  const token = randomBytes(32).toString("hex");
  await AdminSession.create({ tokenHash: hash(token), credentialHash: credentials(token), expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000) });
  (await cookies()).set(SESSION_COOKIE, token, { ...options, maxAge: 8 * 60 * 60 });
}
export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) { await connectDB(); await AdminSession.deleteOne({ tokenHash: hash(token) }); }
  jar.set(SESSION_COOKIE, "", { ...options, maxAge: 0 });
}
