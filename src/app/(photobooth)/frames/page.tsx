"use client";

import { useRouter } from "next/navigation";
import { FramePicker } from "@/components/FramePicker";
import { useBooth } from "@/components/BoothProvider";

export default function FramesPage() {
  const { state, chooseFrame } = useBooth();
  const router = useRouter();

  const handleSelectFrame = (frame: Parameters<typeof chooseFrame>[0]) => {
    chooseFrame(frame);
    router.push("/booth");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-black">
      {/* Background photobooth machine */}
      <img
        src="/image/booth/booth-screen.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Content inside the black screen area */}
      <section
        className="
          absolute
          left-[6%]
          top-[22%]
          h-[62%]
          w-[88%]
          overflow-hidden
          px-6
          py-5
          sm:left-[7%]
          sm:w-[86%]
          sm:px-8
          lg:left-[10%]
          lg:w-[80%]
          lg:px-10
        "
      >
        <h1
          className="
            mb-6
            font-serif
            text-2xl
            text-white
            sm:text-3xl
            lg:text-4xl
          "
        >
          Choose your frame
        </h1>

        <div className="h-[calc(100%-4rem)] overflow-hidden">
          <FramePicker
            selected={state.selectedFrame}
            onSelect={handleSelectFrame}
          />
        </div>
      </section>
    </main>
  );
}
