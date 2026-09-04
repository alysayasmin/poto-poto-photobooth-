"use client";

import { useEffect, useRef, useState } from "react";

type PhotoStripProps = { photos: string[]; complete?: boolean };

export function PhotoStrip({ photos, complete = false }: PhotoStripProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [downloadUrl, setDownloadUrl] = useState("");

  useEffect(() => {
    if (!complete || photos.length !== 4 || !canvasRef.current) return;

    let cancelled = false;
    const images = photos.map((src) => {
      const image = new Image();
      image.src = src;
      return image;
    });

    Promise.all(images.map((image) => image.decode())).then(() => {
      if (cancelled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const width = 720;
      const padding = 48;
      const photoWidth = width - padding * 2;
      const photoHeight = photoWidth * 0.75;
      const gap = 18;
      const footer = 150;
      canvas.width = width;
      canvas.height = padding + 4 * photoHeight + 3 * gap + footer;

      ctx.fillStyle = "#fffdf9";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      images.forEach((image, index) => {
        ctx.drawImage(image, padding, padding + index * (photoHeight + gap), photoWidth, photoHeight);
      });

      ctx.fillStyle = "#2f2926";
      ctx.textAlign = "center";
      ctx.font = "600 36px Georgia, serif";
      ctx.fillText("poto-poto ♡", width / 2, canvas.height - 76);
      ctx.fillStyle = "#7b6f69";
      ctx.font = "18px Arial, sans-serif";
      ctx.fillText(new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "long", year: "numeric" }).format(new Date()), width / 2, canvas.height - 39);
      setDownloadUrl(canvas.toDataURL("image/png"));
    });

    return () => { cancelled = true; };
  }, [complete, photos]);

  if (complete) {
    return (
      <div className="w-full max-w-[310px]">
        <canvas ref={canvasRef} className="h-auto w-full rotate-1 rounded-sm border border-[#d9cec3] bg-[#fffdf9] shadow-[7px_9px_0_rgba(47,41,38,.12)]" aria-label="Your completed four-photo strip" />
        {downloadUrl && <a href={downloadUrl} download="poto-poto-strip.png" className="sr-only" id="photo-download">Download photo strip</a>}
      </div>
    );
  }

  return (
    <div className="w-full rounded-[1.4rem] border border-[#d9cec3] bg-[#fffdf9] p-4 paper-shadow">
      <div className="mb-3 flex items-center justify-between text-xs font-bold uppercase tracking-[.15em] text-[#7b6f69]">
        <span>tiny memories</span><span>♡</span>
      </div>
      <div className="grid grid-cols-2 gap-2 md:grid-cols-1">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="relative aspect-[4/3] overflow-hidden rounded-md border border-[#d9cec3] bg-[#f7f2ea]">
            {photos[index] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photos[index]} alt={`Captured photo ${index + 1}`} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full place-items-center text-sm text-[#b8aaa0]">{String(index + 1).padStart(2, "0")}</div>
            )}
          </div>
        ))}
      </div>
      <p className="display mt-4 text-center text-lg font-semibold">poto-poto ♡</p>
    </div>
  );
}
