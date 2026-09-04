"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Camera } from "@/components/Camera";
import { CaptureButton } from "@/components/CaptureButton";
import { Countdown } from "@/components/Countdown";
import { PhotoStrip } from "@/components/PhotoStrip";

const TOTAL_PHOTOS = 4;

export default function BoothPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCounting, setIsCounting] = useState(false);
  const complete = photos.length === TOTAL_PHOTOS;

  function snapPhoto() {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 900;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sourceRatio = video.videoWidth / video.videoHeight;
    const targetRatio = canvas.width / canvas.height;
    let sx = 0, sy = 0, sw = video.videoWidth, sh = video.videoHeight;
    if (sourceRatio > targetRatio) {
      sw = video.videoHeight * targetRatio;
      sx = (video.videoWidth - sw) / 2;
    } else {
      sh = video.videoWidth / targetRatio;
      sy = (video.videoHeight - sh) / 2;
    }

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    setPhotos((current) => [...current, canvas.toDataURL("image/jpeg", 0.92)].slice(0, TOTAL_PHOTOS));
  }

  async function handleCapture() {
    if (isCounting || complete || !videoRef.current?.srcObject) return;
    setIsCounting(true);
    for (const value of [3, 2, 1]) {
      setCountdown(value);
      await new Promise((resolve) => window.setTimeout(resolve, 800));
    }
    setCountdown(null);
    snapPhoto();
    setIsCounting(false);
  }

  function handleRetake() {
    setPhotos([]);
    setCountdown(null);
    setIsCounting(false);
  }

  function handleDownload() {
    document.querySelector<HTMLAnchorElement>("#photo-download")?.click();
  }

  if (complete) {
    return (
      <main className="min-h-screen px-5 py-7 md:px-8 md:py-10">
        <header className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="display text-2xl font-semibold text-[#c94c4c]">poto-poto</Link>
          <span className="text-sm text-[#7b6f69]">made with tiny moments ♡</span>
        </header>
        <section className="mx-auto grid max-w-4xl items-center gap-10 py-10 md:grid-cols-[.85fr_1fr] md:py-14">
          <div className="mx-auto"><PhotoStrip photos={photos} complete /></div>
          <div className="text-center md:text-left">
            <span className="mb-5 inline-block rotate-[-2deg] rounded-full bg-[#f4b8c5] px-4 py-2 text-sm font-bold">that’s a wrap! ✦</span>
            <h1 className="display text-5xl font-semibold leading-[1.02] tracking-[-.04em] md:text-7xl">tiny moments,<br /><em className="font-normal text-[#c94c4c]">kept forever.</em></h1>
            <p className="mx-auto mt-5 max-w-md text-[#7b6f69] md:mx-0">Your photo strip is ready. Save it somewhere special, or have another go.</p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row md:justify-start">
              <button onClick={handleDownload} className="rounded-full border border-[#2f2926] bg-[#c94c4c] px-7 py-4 font-bold text-white shadow-[4px_5px_0_#2f2926] transition hover:-translate-y-1">Download PNG ↓</button>
              <button onClick={handleRetake} className="rounded-full border border-[#2f2926] bg-[#fffdf9] px-7 py-4 font-bold shadow-[4px_5px_0_#2f2926] transition hover:-translate-y-1">Retake ↻</button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-5 py-6 md:px-8 md:py-8">
      <header className="mx-auto flex max-w-6xl items-center justify-between">
        <Link href="/" className="display text-2xl font-semibold text-[#c94c4c]">poto-poto</Link>
        <span className="rounded-full border border-[#d9cec3] bg-[#fffdf9] px-4 py-2 text-xs font-bold uppercase tracking-[.12em] text-[#7b6f69]">{photos.length} / {TOTAL_PHOTOS} photos</span>
      </header>

      <section className="mx-auto grid max-w-6xl gap-8 py-8 md:grid-cols-[minmax(0,1fr)_250px] md:items-start md:gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div><p className="mb-1 text-sm font-bold text-[#c94c4c]">✦ PHOTO {Math.min(photos.length + 1, 4)} OF 4</p><h1 className="display text-3xl font-semibold md:text-4xl">say cheese!</h1></div>
            <p className="hidden text-sm text-[#7b6f69] sm:block">Look at the camera & smile ♡</p>
          </div>
          <div className="relative rounded-[1.8rem] border border-[#d9cec3] bg-[#fffdf9] p-3 paper-shadow md:p-4">
            <Camera videoRef={videoRef} disabled={complete} />
            <Countdown value={countdown} />
          </div>
          <div className="mt-7 flex flex-col items-center gap-3">
            <CaptureButton onClick={handleCapture} disabled={isCounting || complete} remaining={TOTAL_PHOTOS - photos.length} />
            <p className="text-center text-xs text-[#7b6f69]">We’ll count down from 3. Hold that pose!</p>
          </div>
        </div>
        <aside><PhotoStrip photos={photos} /></aside>
      </section>
    </main>
  );
}
