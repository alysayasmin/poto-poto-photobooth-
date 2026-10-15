"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import type { FrameItem } from "@/lib/frame-layout";
export function FramePicker({ selected, onSelect }: { selected: FrameItem | null; onSelect: (frame: FrameItem) => void }) {
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [error, setError] = useState(false); const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function refresh() {
      try {
        const response = await fetch("/api/frames", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Frames unavailable");
        const data: FrameItem[] = await response.json();
        if (!controller.signal.aborted) { setFrames(data.filter(frame => frame.isPublished === true)); setError(false); }
      } catch { if (!controller.signal.aborted) setError(true); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void refresh();
    const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => { controller.abort(); clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [attempt]);
  return <section aria-label="Published frames" className="text-white">
    {loading && <p role="status">Loading frames…</p>}
    {error ? <div role="alert"><p>Frames could not be loaded. Please try again.</p><button className="flow-button mt-4" onClick={() => { setLoading(true); setError(false); setAttempt(value => value + 1); }}>Retry</button></div> : <>
      {!loading && frames.length === 0 && <p role="status">No frames are available yet. Please check back soon.</p>}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">{frames.map(frame => <button type="button" key={frame._id} aria-pressed={selected?._id === frame._id} onClick={() => onSelect(frame)} className={`rounded border-2 p-4 text-sm transition hover:bg-white/15 ${selected?._id === frame._id ? "border-white bg-white/20" : "border-white/30"}`}><img src={frame.imageUrl} alt={`${frame.name} photo strip frame`} className="mx-auto mb-3 h-56 max-w-full bg-zinc-300 object-contain" /><span className="break-words">{frame.name}</span>{selected?._id === frame._id && <span className="mt-1 block text-xs">Selected</span>}</button>)}</div>
    </>}
  </section>;
}
