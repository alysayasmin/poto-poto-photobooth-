import "server-only";
export function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value || value === "...") throw new Error(`${name} is not configured.`);
  return value;
}
export function adminConfig() {
  const email = requiredEnv("ADMIN_EMAIL");
  const password = requiredEnv("ADMIN_PASSWORD");
  const secret = requiredEnv("ADMIN_SESSION_SECRET");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 16 || secret.length < 32) {
    throw new Error("Admin configuration requires a valid email, a password of at least 16 characters, and a session secret of at least 32 characters.");
  }
  return { email, password, secret };
}
