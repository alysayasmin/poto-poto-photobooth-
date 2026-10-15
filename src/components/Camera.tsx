"use client";

import { RefObject, useEffect, useState } from "react";

type CameraProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  disabled?: boolean;
};

export function Camera({ videoRef, disabled = false }: CameraProps) {
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let active = true;
    const videoElement = videoRef.current;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Your browser doesn’t support camera access. Try a recent browser, please ♡");
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (videoElement) {
          videoElement.srcObject = stream;
          await videoElement.play();
          if (active) setReady(true);
        }
      } catch {
        stream?.getTracks().forEach((track) => track.stop());
        if (!active) return;
        setError("Camera access was blocked. Allow camera permission, then refresh and we’ll try again ♡");
      }
    }

    startCamera();

    return () => {
      active = false;
      stream?.getTracks().forEach((track) => track.stop());
      if (videoElement) videoElement.srcObject = null;
    };
  }, [videoRef]);

  return (
    <div className="relative aspect-[4/3] overflow-hidden border-4 border-[#080808] bg-[#111] shadow-[inset_0_0_28px_#000]">
      <video
        ref={videoRef}
        playsInline
        muted
        aria-label="Live camera preview"
        className={`h-full w-full scale-x-[-1] object-cover transition-opacity duration-500 ${ready && !disabled ? "opacity-100" : "opacity-25"}`}
      />
      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center text-center text-xs font-bold uppercase tracking-[.22em] text-white/65">
          <div><span className="mb-4 block h-px w-20 bg-white/40" />Initializing camera</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-[#111] px-8 text-center text-sm leading-6 text-white">
          <div><span className="mb-3 block text-2xl">!</span>{error}</div>
        </div>
      )}
      {ready && !disabled && (
        <span className="absolute left-3 top-3 border border-white/30 bg-black/75 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.2em] text-white"><i className="mr-2 inline-block size-1.5 rounded-full bg-[#b72018]" />Camera ready</span>
      )}
    </div>
  );
}
