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
          setReady(true);
        }
      } catch {
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
    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.4rem] border border-[#2f2926] bg-[#2f2926]">
      <video
        ref={videoRef}
        playsInline
        muted
        aria-label="Live camera preview"
        className={`h-full w-full scale-x-[-1] object-cover transition-opacity duration-500 ${ready && !disabled ? "opacity-100" : "opacity-35"}`}
      />
      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center text-center text-sm text-white/80">
          <div><span className="mb-3 block text-3xl">📸</span>Warming up the camera…</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-[#2f2926] px-8 text-center text-sm leading-6 text-white">
          <div><span className="mb-3 block text-3xl">♡</span>{error}</div>
        </div>
      )}
      {ready && !disabled && (
        <span className="absolute left-4 top-4 rounded-full bg-[#fffdf9]/90 px-3 py-1.5 text-xs font-bold text-[#2f2926] shadow-sm">live ✦</span>
      )}
    </div>
  );
}
