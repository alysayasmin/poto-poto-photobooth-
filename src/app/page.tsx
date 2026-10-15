import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen justify-center overflow-hidden bg-[#b72018] px-4 py-6 sm:px-8 sm:py-8">
      <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "repeating-linear-gradient(90deg, transparent 0 7px, rgba(0,0,0,.22) 7px 8px)" }} aria-hidden />
      <section className="relative flex w-full max-w-4xl flex-col items-center">
        <div className="brushed-metal relative z-10 w-[min(88vw,440px)] px-8 py-5 text-center">
          <span className="absolute left-3 top-3 size-2 rounded-full border border-black/50 bg-[#747471] shadow-inner" />
          <span className="absolute right-3 top-3 size-2 rounded-full border border-black/50 bg-[#747471] shadow-inner" />
          <p className="text-[clamp(2.2rem,7vw,4rem)] font-bold lowercase leading-none tracking-[-.06em]">poto-poto</p>
          <div className="mx-auto my-3 h-px w-16 bg-black/50" />
          <p className="text-sm font-bold uppercase leading-5 tracking-[.28em]">Photos<br />Made Here</p>
          <span className="mt-3 block text-2xl leading-none" aria-hidden>↓</span>
        </div>

        <div className="machine-panel relative -mt-px w-full max-w-3xl px-5 pb-8 pt-10 sm:px-10 sm:pb-12">
          <div className="absolute left-3 top-3 text-[9px] font-bold uppercase tracking-[.2em] text-white/65">AUTO PHOTO MACHINE · MODEL 04</div>
          <div className="chrome mx-auto max-w-xl p-2 sm:p-3">
            <div className="relative grid aspect-[16/8] place-items-center overflow-hidden border-4 border-[#0a0a0a] bg-[#111] shadow-[inset_0_0_36px_#000]">
              <div className="absolute inset-x-0 top-0 h-px bg-white/25" />
              <div className="text-center text-[#f4f2ec]">
                <span className="mb-4 inline-block size-2 rounded-full bg-[#b72018] shadow-[0_0_0_4px_rgba(183,32,24,.2)]" />
                <p className="text-[clamp(2.4rem,8vw,5.5rem)] font-bold uppercase leading-none tracking-[-.05em]">Ready?</p>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-[.35em] text-white/55">4 shots · 3 sec timer · b&amp;w</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-5">
            <div className="chrome p-2">
              <Link href="/booth" className="machine-button block min-w-52 border border-black bg-[#111] px-8 py-4 text-center text-sm font-bold uppercase tracking-[.18em] text-[#f4f2ec] transition hover:bg-[#89150f]">
                Start Booth
              </Link>
            </div>
            <p className="text-center text-[10px] font-bold uppercase tracking-[.24em] text-white/80">Make a memory. Take four photos.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
