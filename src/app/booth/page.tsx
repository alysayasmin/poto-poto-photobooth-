"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Camera } from "@/components/Camera";
import { CaptureButton } from "@/components/CaptureButton";
import { Countdown } from "@/components/Countdown";
import { PhotoStrip } from "@/components/PhotoStrip";

import { FramePicker } from "@/components/FramePicker";
import type { FrameItem } from "@/lib/frame-layout";

const TOTAL_PHOTOS = 4;

export default function BoothPage() {
  const [selectedFrame, setSelectedFrame] = useState<FrameItem | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | "FLASH" | null>(null);
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
    setCountdown("FLASH");
    snapPhoto();
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    setCountdown(null);
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
      <main className="min-h-screen bg-[#89150f] px-4 py-5 sm:px-8 sm:py-8">
        <header className="mx-auto flex max-w-5xl items-center justify-between text-[#f4f2ec]">
          <Link href="/" className="text-2xl font-bold lowercase tracking-[-.05em]">poto-poto</Link>
          <span className="text-[9px] font-bold uppercase tracking-[.25em] text-white/60">03 · Download your strip</span>
        </header>
        <section className="machine-panel mx-auto mt-5 max-w-5xl px-5 py-8 sm:px-10 md:py-10">
          <div className="grid items-center gap-10 md:grid-cols-[1fr_.8fr]">
            <div className="mx-auto w-full max-w-sm text-center text-white md:text-left">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[.28em] text-white/55">Process complete · 4/4</p>
              <h1 className="text-[clamp(3.4rem,8vw,6.5rem)] font-bold uppercase leading-[.82] tracking-[-.075em]">Photos<br />Ready.</h1>
              <div className="mt-7 h-px w-20 bg-white/40 md:mx-0" />
              <p className="mt-5 text-xs font-bold uppercase leading-6 tracking-[.18em] text-white/75">Collect your photo strip<br />from the tray.</p>
            </div>

            <div className="mx-auto w-full max-w-[380px]">
              <div className="chrome relative z-10 p-3 pb-4">
                <p className="mb-2 text-center text-[9px] font-bold uppercase tracking-[.28em]">Photo output</p>
                <div className="h-7 border-2 border-black bg-[#080808] shadow-[inset_0_3px_8px_#000]" />
              </div>
              <div className="relative z-0 -mt-1 flex max-h-[570px] justify-center overflow-hidden pb-5 pt-1">
                <PhotoStrip photos={photos} complete frame={selectedFrame} />
              </div>
            </div>
          </div>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <div className="chrome p-1.5">
              <button onClick={handleDownload} className="machine-button min-w-40 border border-black bg-[#111] px-6 py-3 text-xs font-bold uppercase tracking-[.18em] text-white hover:bg-[#89150f]">Download ↓</button>
            </div>
            <div className="brushed-metal p-1.5">
              <button onClick={handleRetake} className="min-w-40 border border-black bg-[#bdbdba] px-6 py-3 text-xs font-bold uppercase tracking-[.18em] shadow-[inset_0_1px_0_#fff,0_3px_0_#333] active:translate-y-0.5 active:shadow-[inset_0_2px_4px_#777]">Retake ↻</button>
            </div>
          </div>
        </section>
        <FramePicker selected={selectedFrame} onSelect={setSelectedFrame} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#89150f] px-4 py-5 sm:px-7 sm:py-7">
      <header className="mx-auto flex max-w-6xl items-center justify-between text-white">
        <Link href="/" className="text-2xl font-bold lowercase tracking-[-.05em]">poto-poto</Link>
        <span className="border border-white/35 px-3 py-2 text-[9px] font-bold uppercase tracking-[.2em]">Auto photo · model 04</span>
      </header>

      <section className="chrome mx-auto mt-5 max-w-6xl p-2 sm:p-3">
        <div className="machine-panel px-4 py-5 sm:px-7 sm:py-7">
          <div className="mb-5 flex items-center justify-between border-b border-white/35 pb-4 text-white">
            <div><p className="text-[9px] font-bold uppercase tracking-[.24em] text-white/60">01 Camera</p><h1 className="mt-1 text-xl font-bold uppercase tracking-[.08em]">Look here</h1></div>
            <div className="text-right"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/60">Sequence</p><p className="mt-1 text-lg font-bold tabular-nums">{String(photos.length).padStart(2, "0")} / 04</p></div>
          </div>

          <div className="grid gap-7 md:grid-cols-[minmax(0,1fr)_230px] md:items-start lg:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <div className="chrome relative p-2 sm:p-3">
                <Camera videoRef={videoRef} disabled={complete} />
                <Countdown value={countdown} />
              </div>
              <div className="mt-7 flex flex-col items-center gap-4">
                <div className="chrome p-2"><CaptureButton onClick={handleCapture} disabled={isCounting || complete} remaining={TOTAL_PHOTOS - photos.length} /></div>
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[9px] font-bold uppercase tracking-[.2em] text-white/65"><span>4 shots</span><span>3 sec timer</span><span>b&amp;w</span></div>
              </div>
            </div>
            <aside>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[.22em] text-white/60">02 Take four photos</p>
              <PhotoStrip photos={photos} />
            </aside>
          </div>
        </div>
      </section>
      <FramePicker selected={selectedFrame} onSelect={setSelectedFrame} />
    </main>
  );
}
