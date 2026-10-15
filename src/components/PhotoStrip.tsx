"use client";
import { useEffect, useRef, useState } from "react";
import type { FrameItem } from "@/lib/frame-layout";
import type { PhotoFilter } from "@/lib/photo-filters";
import { composeStrip } from "@/lib/compose-strip";
export type StripOutput = { url: string; photos: string[]; frameUrl?: string; filter: PhotoFilter };
type PhotoStripProps = { photos: string[]; complete?: boolean; frame?: FrameItem | null; filter?: PhotoFilter; capturedAt?: string | null; onRendered?: (output: StripOutput) => void };
export function PhotoStrip({ photos, complete = false, frame, filter = "original", capturedAt, onRendered }: PhotoStripProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState<StripOutput | null>(null);
  const [error, setError] = useState<{ message: string; filter: PhotoFilter } | null>(null);
  const ready = rendered?.photos === photos && rendered?.frameUrl === frame?.imageUrl && rendered?.filter === filter;
  useEffect(() => {
    if (!complete || photos.length !== 4) return;
    let cancelled = false;
    async function render() {
      try {
        const images = photos.map(src => { const image = new Image(); image.src = src; return image; });
        const overlay = frame ? new Image() : null;
        if (overlay) { overlay.crossOrigin = "anonymous"; overlay.src = frame!.imageUrl; }
        await Promise.all([...images.map(image => image.decode()), ...(overlay ? [overlay.decode()] : [])]);
        if (cancelled || !canvasRef.current) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) throw new Error("Canvas is unavailable in this browser.");
        composeStrip(ctx, images, overlay, filter, capturedAt ? new Date(capturedAt) : new Date());
        const output = { url: canvasRef.current.toDataURL("image/png"), photos, frameUrl: frame?.imageUrl, filter };
        setError(null); setRendered(output); onRendered?.(output);
      } catch (error) {
        if (!cancelled) setError({ message: error instanceof Error && error.message.includes("export filters") ? error.message : "Could not render your strip. Check the connection or choose another frame.", filter });
      }
    }
    void render();
    return () => { cancelled = true; };
  }, [complete, photos, frame, filter, capturedAt, onRendered]);
  if (complete) return <div className="photo-strip-output w-full max-w-[280px]">
    {!ready && <p role="status" className="mb-2 text-xs text-white">{error?.filter === filter ? error.message : "Preparing your strip…"}</p>}
    <canvas ref={canvasRef} style={{ visibility: ready ? "visible" : "hidden" }} className="h-auto w-full border border-black bg-[#f4f2ec] shadow-lg" aria-label="Your four-photo strip with selected frame and filter" />
  </div>;
  return (
    <div className="w-full border border-black bg-[#111] p-3 shadow-[inset_0_0_18px_#000]">
      <div className="mb-3 flex items-center justify-between text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
        <span>Photo strip</span><span>{photos.length}/4</span>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="photo-grain relative aspect-[4/3] overflow-hidden border border-white/15 bg-[#242424]">
            {photos[index] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[index]} alt={`Captured photo ${index + 1}`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-xs font-bold tracking-[.2em] text-white/25">PHOTO {String(index + 1).padStart(2, "0")}</div>
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-xs font-bold lowercase tracking-[.08em] text-white">poto-poto</p>
    </div>
  );
}
