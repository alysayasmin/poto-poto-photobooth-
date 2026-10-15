"use client";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
export function AdminLogin() {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed.");
      router.replace("/admin/frames"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Login failed."); setBusy(false); }
  }
  return <form onSubmit={login} className="mx-auto max-w-sm space-y-5 rounded-lg border border-zinc-300 bg-white p-7"><h1 className="text-2xl font-bold">Admin login</h1><label className="block text-sm">Email<input name="email" type="email" autoComplete="username" required maxLength={254} className="mt-2 w-full rounded border border-zinc-400 p-3" /></label><label className="block text-sm">Password<input name="password" type="password" autoComplete="current-password" required maxLength={1024} className="mt-2 w-full rounded border border-zinc-400 p-3" /></label>{error && <p role="alert" className="text-sm text-red-800">{error}</p>}<button disabled={busy} className="w-full rounded bg-red-800 p-3 font-bold text-white disabled:opacity-50">{busy ? "Logging in…" : "Login"}</button></form>;
}
