"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import type { FrameItem } from "@/lib/frame-layout";

export function FramePicker({
  selected,
  onSelect,
}: {
  selected: FrameItem | null;
  onSelect: (frame: FrameItem) => void;
}) {
  const [frames, setFrames] = useState<FrameItem[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function refresh() {
      try {
        const response = await fetch("/api/frames", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Frames unavailable");
        }

        const data: FrameItem[] = await response.json();

        if (!controller.signal.aborted) {
          setFrames(data.filter((frame) => frame.isPublished === true));
          setError(false);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void refresh();

    const timer = window.setInterval(refresh, 15000);

    window.addEventListener("focus", refresh);

    return () => {
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
    };
  }, [attempt]);

  return (
    <section aria-label="Published frames" className="w-full text-white">
      {loading && (
        <p role="status" className="text-sm tracking-wide text-white/70">
          Loading frames…
        </p>
      )}

      {error ? (
        <div role="alert">
          <p className="text-sm text-white/80">
            Frames could not be loaded. Please try again.
          </p>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              setError(false);
              setAttempt((value) => value + 1);
            }}
            className="
              mt-4
              border
              border-white/40
              px-4
              py-2
              text-sm
              transition
              hover:bg-white
              hover:text-black
            "
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          {!loading && frames.length === 0 && (
            <p role="status" className="text-sm text-white/70">
              No frames are available yet. Please check back soon.
            </p>
          )}

          {frames.length > 0 && (
            <div
              className="
                flex
                w-full
                snap-x
                snap-mandatory
                gap-5
                overflow-x-auto
                overflow-y-hidden
                pb-5
                pr-8
                scroll-smooth

                [&::-webkit-scrollbar]:h-1.5
                [&::-webkit-scrollbar-track]:bg-white/10
                [&::-webkit-scrollbar-thumb]:bg-white/40
                [&::-webkit-scrollbar-thumb]:rounded-full
              "
            >
              {frames.map((frame) => {
                const isSelected = selected?._id === frame._id;

                return (
                  <button
                    type="button"
                    key={frame._id}
                    aria-pressed={isSelected}
                    onClick={() => onSelect(frame)}
                    className={`
                      group
                      shrink-0
                      snap-center
                      transition
                      duration-300
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-white

                      ${isSelected ? "scale-[1.03]" : "hover:-translate-y-1"}
                    `}
                  >
                    <div
                      className={`
                        flex
                        h-[280px]
                        w-[110px]
                        items-center
                        justify-center
                        overflow-hidden
                        border
                        bg-white/5
                        p-1.5
                        transition
                        duration-300

                        sm:h-[320px]
                        sm:w-[126px]

                        md:h-[360px]
                        md:w-[142px]

                        ${
                          isSelected
                            ? "border-white bg-white/15 shadow-[0_0_20px_rgba(255,255,255,0.18)]"
                            : "border-white/20 group-hover:border-white/60"
                        }
                      `}
                    >
                      <img
                        src={frame.imageUrl}
                        alt={`${frame.name} photo strip frame`}
                        className="
                          h-full
                          w-full
                          object-contain
                        "
                      />
                    </div>

                    <div className="mt-3 max-w-[142px] text-center">
                      <span
                        className="
                          block
                          truncate
                          text-xs
                          tracking-wide
                          text-white/80
                          transition
                          group-hover:text-white
                        "
                      >
                        {frame.name}
                      </span>

                      {isSelected && (
                        <span className="mt-1 block text-[10px] uppercase tracking-[0.18em] text-white/60">
                          Selected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}
