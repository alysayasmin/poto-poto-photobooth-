"use client";

import { useEffect, useRef, useState } from "react";

import { FRAME_LAYOUT, type FrameItem } from "@/lib/frame-layout";

type PhotoStripProps = { photos: string[]; complete?: boolean; frame?: FrameItem | null };

export function PhotoStrip({ photos, complete = false, frame }: PhotoStripProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rendered, setRendered] = useState<{ url: string; frameUrl: string | undefined; photos: string[] } | null>(null);
  const [error, setError] = useState("");
  const downloadUrl = rendered?.frameUrl === frame?.imageUrl && rendered?.photos === photos ? rendered.url : "";

  useEffect(() => {
    if (!complete || photos.length !== 4 || !canvasRef.current) return;

    let cancelled = false;
    const images = photos.map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    const overlay = frame ? new Image() : null;
    if (overlay) { overlay.crossOrigin = "anonymous"; overlay.src = frame!.imageUrl; }
    Promise.all([...images.map((image) => image.decode()), ...(overlay ? [overlay.decode()] : [])]).then(() => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { width, height, padding, photoWidth, photoHeight, gap } = FRAME_LAYOUT;
      canvas.width = width;
      canvas.height = height;

      ctx.fillStyle = "#f4f2ec";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      images.forEach((image, index) => {
        const y = padding + index * (photoHeight + gap);
        ctx.filter = "grayscale(1) contrast(1.2)";
        ctx.drawImage(image, padding, y, photoWidth, photoHeight);
        ctx.filter = "none";
      });

      ctx.fillStyle = "#111111";
      ctx.textAlign = "center";
      ctx.font = "700 32px Arial, sans-serif";
      ctx.fillText("poto-poto", width / 2, canvas.height - 76);
      ctx.font = "16px Arial, sans-serif";
      ctx.fillText(new Intl.DateTimeFormat("en-GB").format(new Date()), width / 2, canvas.height - 39);
      if (overlay) ctx.drawImage(overlay, 0, 0, width, height);
      setError("");
      setRendered({ url: canvas.toDataURL("image/png"), frameUrl: frame?.imageUrl, photos });
    }).catch(() => { if (!cancelled) setError("Could not render this frame. Please select Original or another frame."); });

    return () => { cancelled = true; };
  }, [complete, photos, frame]);

  if (complete) {
    return (
      <div className="dispense w-full max-w-[280px]">
        {!downloadUrl && <p role="status" className="mb-2 text-xs text-white">{error || "Preparing your strip…"}</p>}
        <canvas style={{ visibility: downloadUrl ? "visible" : "hidden" }} ref={canvasRef} className="h-auto w-full border border-black bg-[#f4f2ec] shadow-[8px_12px_20px_rgba(0,0,0,.5)]" aria-label="Your completed four-photo strip" />
        {downloadUrl && <a href={downloadUrl} download="poto-poto-strip.png" className="sr-only" id="photo-download">Download photo strip</a>}
      </div>
    );
  }

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
              <img src={photos[index]} alt={`Captured photo ${index + 1}`} className="h-full w-full object-cover grayscale contrast-125" />
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
