"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Camera } from "@/components/Camera";
import { CaptureButton } from "@/components/CaptureButton";
import { Countdown } from "@/components/Countdown";
import { PhotoStrip } from "@/components/PhotoStrip";

import { useBooth } from "@/components/BoothProvider";

const TOTAL_PHOTOS = 4;

export default function BoothPage() {
  const { state, addPhoto } = useBooth();
  const photos = state.capturedPhotos;
  const active = useRef(true);
  const capturing = useRef(false);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const videoRef = useRef<HTMLVideoElement>(null);
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
    addPhoto(canvas.toDataURL("image/jpeg", 0.92));
  }

  async function handleCapture() {
    if (capturing.current || complete || !videoRef.current?.srcObject || videoRef.current.readyState < 2) return;
    capturing.current = true;
    setIsCounting(true);
    for (const value of [3, 2, 1]) {
      if (!active.current) return;
      setCountdown(value);
      await new Promise((resolve) => window.setTimeout(resolve, 800));
    }
    if (!active.current) return;
    setCountdown("FLASH");
    snapPhoto();
    await new Promise((resolve) => window.setTimeout(resolve, 220));
    if (!active.current) return;
    setCountdown(null);
    setIsCounting(false);
    capturing.current = false;
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
                <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[9px] font-bold uppercase tracking-[.2em] text-white/65"><span>4 shots</span><span>3 sec timer</span><span>Choose filter next</span></div>
              </div>
            </div>
            <aside>
              <p className="mb-2 text-[9px] font-bold uppercase tracking-[.22em] text-white/60">02 Take four photos</p>
              <PhotoStrip photos={photos} />
            </aside>
          </div>
        </div>
      </section>
      <p className="mx-auto mt-5 max-w-6xl text-sm text-white">Frame: {state.selectedFrame?.name} · <Link href="/frames" className="underline">Choose another frame</Link></p>
    </main>
  );
}
