"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import type { FrameItem } from "@/lib/frame-layout";
export function FramePicker({ selected, onSelect }: { selected: FrameItem | null; onSelect: (frame: FrameItem | null) => void }) {
  const [frames, setFrames] = useState<FrameItem[]>([]); const [error, setError] = useState(false); const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const response = await fetch("/api/frames", { cache: "no-store" }); if (!response.ok) throw new Error();
        const data: FrameItem[] = await response.json();
        if (active) { setFrames(data); setError(false); if (selected && !data.some(frame => frame._id === selected._id)) onSelect(null); }
      } catch { if (active) setError(true); }
      finally { if (active) setLoading(false); }
    }
    void refresh(); const timer = window.setInterval(refresh, 15000);
    window.addEventListener("focus", refresh);
    return () => { active = false; clearInterval(timer); window.removeEventListener("focus", refresh); };
  }, [selected, onSelect]);
  return <section className="mx-auto mt-6 max-w-5xl text-white"><h2 className="mb-3 text-sm font-bold tracking-widest">CHOOSE YOUR FRAME</h2><div className="flex flex-wrap gap-3"><button type="button" aria-pressed={!selected} onClick={() => onSelect(null)} className={`w-28 border p-3 text-xs ${!selected ? "border-white bg-white/20" : "border-white/30"}`}><span className="mx-auto mb-2 grid h-24 w-10 place-items-center bg-[#f4f2ec] text-black">4<br />shots</span>Original</button>{frames.map(frame => <button type="button" key={frame._id} aria-pressed={selected?._id === frame._id} onClick={() => onSelect(frame)} className={`w-28 border p-3 text-xs ${selected?._id === frame._id ? "border-white bg-white/20" : "border-white/30"}`}><img src={frame.imageUrl} alt="" className="mx-auto mb-2 h-24 w-10 bg-zinc-300 object-contain" /><span className="break-words">{frame.name}</span></button>)}</div>{loading && <p role="status" className="mt-2 text-xs">Loading frames…</p>}{error && <p role="status" className="mt-2 text-xs">Extra frames are unavailable. Original frame is still available.</p>}</section>;
}
