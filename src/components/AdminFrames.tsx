"use client";
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { FrameItem } from "@/lib/frame-layout";
export function AdminFrames() {
  const router = useRouter();
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [loading, setLoading] = useState(true); const [busy, setBusy] = useState("");
  const [message, setMessage] = useState(""); const [error, setError] = useState("");
  const request = useCallback(async (url: string, options?: RequestInit) => {
    const response = await fetch(url, { ...options, cache: "no-store" });
    if (response.status === 401) { router.replace("/admin/login"); router.refresh(); throw new Error("Session expired. Please log in again."); }
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed.");
    return data;
  }, [router]);
  const refresh = useCallback(async () => {
    try { setFrames(await request("/api/admin/frames")); }
    catch (error) { setError(error instanceof Error ? error.message : "Failed to load frames."); }
    finally { setLoading(false); }
  }, [request]);
  // refresh only sets state after the network promise resolves.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void refresh(); }, [refresh]);
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget;
    setBusy("upload"); setError(""); setMessage("");
    try {
      const data = new FormData(form); data.set("isPublished", data.has("isPublished") ? "true" : "false");
      await request("/api/admin/frames", { method: "POST", body: data });
      form.reset(); setMessage("Frame uploaded successfully."); await refresh();
    } catch (error) { setError(`Failed to upload frame. ${error instanceof Error ? error.message : ""}`); }
    finally { setBusy(""); }
  }
  async function action(frame: FrameItem, method: "PATCH" | "DELETE") {
    if (method === "DELETE" && !window.confirm(`Delete “${frame.name}”? This also removes its PNG file.`)) return;
    setBusy(frame._id); setError(""); setMessage("");
    try {
      await request(`/api/admin/frames/${frame._id}`, { method, ...(method === "PATCH" ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublished: !frame.isPublished }) } : {}) });
      setMessage(method === "DELETE" ? "Frame deleted." : "Publish status updated."); await refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Action failed."); await refresh(); }
    finally { setBusy(""); }
  }
  async function logout() {
    setBusy("logout"); setError("");
    try { await request("/api/admin/logout", { method: "POST" }); router.replace("/admin/login"); router.refresh(); }
    catch { setError("Logout failed. Please try again."); setBusy(""); }
  }
  const button = "rounded border border-zinc-400 px-4 py-2 text-sm font-semibold disabled:opacity-50";
  return <><div className="mb-6 flex items-center justify-between"><h1 className="text-3xl font-bold">FRAMES</h1><button className={button} disabled={!!busy} onClick={logout}>{busy === "logout" ? "Logging out…" : "Logout"}</button></div>
    <form onSubmit={upload} className="mb-6 space-y-4 rounded-lg border border-zinc-300 bg-white p-6"><h2 className="text-lg font-bold">Upload frame</h2><p className="text-sm text-zinc-600">PNG · max 5 MB · 720 × 2224 px. Four transparent photo windows: x=48, y=48/534/1020/1506; each 624 × 468 px.</p><fieldset disabled={!!busy} className="space-y-4"><label className="block text-sm">Frame Name<input name="name" required maxLength={100} placeholder="Classic Chrome" className="mt-1 block w-full rounded border border-zinc-400 p-3" /></label><label className="block text-sm">Frame PNG<input name="file" type="file" accept="image/png" required className="mt-2 block w-full rounded border border-zinc-300 p-3" /></label><label className="flex items-center gap-2 text-sm"><input name="isPublished" type="checkbox" />Publish immediately</label><button className="rounded bg-red-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy === "upload" ? "Uploading…" : "UPLOAD FRAME"}</button></fieldset></form>
    {message && <p role="status" className="mb-4 text-sm text-green-800">{message}</p>}{error && <p role="alert" className="mb-4 text-sm text-red-800">{error}</p>}
    {loading ? <p>Loading frames…</p> : !frames.length ? <p className="py-8 text-zinc-600">No frames yet. Upload your first PNG above.</p> : <ul className="space-y-3">{frames.map(frame => <li key={frame._id} className="flex flex-wrap items-center gap-5 rounded-lg border border-zinc-300 bg-white p-5"><img src={frame.imageUrl} alt={frame.name} className="h-32 w-14 bg-zinc-200 object-contain" /><div className="min-w-0 flex-1"><h2 className="break-words font-bold">{frame.name}</h2><p className={`mt-1 text-xs font-bold ${frame.isPublished ? "text-green-800" : "text-zinc-500"}`}>{frame.isPublished ? "PUBLISHED" : "DRAFT"}</p><p className="mt-2 text-xs text-zinc-500">{new Date(frame.createdAt).toLocaleDateString()}</p></div><div className="flex gap-2"><button disabled={!!busy} onClick={() => action(frame, "PATCH")} className={button}>{busy === frame._id ? "Saving…" : frame.isPublished ? "Unpublish" : "Publish"}</button><button disabled={!!busy} onClick={() => action(frame, "DELETE")} className={`${button} text-red-800`}>Delete</button></div></li>)}</ul>}
  </>;
}
