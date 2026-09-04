import Link from "next/link";

export default function Home() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-12">
      <span className="absolute left-[8%] top-[14%] text-2xl text-[#c94c4c]" aria-hidden>✦</span>
      <span className="absolute bottom-[14%] right-[10%] text-3xl text-[#c94c4c]" aria-hidden>♡</span>
      <section className="grid w-full max-w-5xl items-center gap-14 md:grid-cols-[1fr_.78fr]">
        <div>
          <div className="mb-6 inline-flex rotate-[-2deg] items-center gap-2 rounded-full border border-[#d9cec3] bg-[#fffdf9] px-4 py-2 text-sm shadow-sm">
            <span>📸</span> your tiny photo booth
          </div>
          <h1 className="display text-[clamp(4.4rem,12vw,8.5rem)] font-semibold leading-[.76] tracking-[-.07em] text-[#c94c4c]">
            poto-<br />poto
          </h1>
          <p className="mt-7 text-lg text-[#7b6f69] md:text-xl">capture tiny moments ♡</p>
          <Link href="/booth" className="mt-9 inline-flex items-center gap-3 rounded-full border border-[#2f2926] bg-[#c94c4c] px-7 py-4 font-bold text-white shadow-[4px_5px_0_#2f2926] transition hover:-translate-y-1 hover:shadow-[5px_7px_0_#2f2926] active:translate-y-0 active:shadow-[2px_3px_0_#2f2926]">
            Start Booth <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="floaty mx-auto w-full max-w-[320px] rotate-[-2deg] rounded-md border border-[#d9cec3] bg-[#fffdf9] p-4 pb-8 paper-shadow" aria-hidden>
          <div className="grid gap-3">
            {["hello!", "say cheese!", "tiny memories"].map((text, i) => (
              <div key={text} className={`flex aspect-[4/2.65] items-end rounded-sm border border-[#2f2926]/15 p-4 ${i === 1 ? "bg-[#f4b8c5]" : "bg-[#eedfd1]"}`}>
                <span className="display text-lg italic text-[#2f2926]/75">{text}</span>
              </div>
            ))}
          </div>
          <p className="display mt-5 text-center text-xl font-semibold">poto-poto ♡</p>
        </div>
      </section>
    </main>
  );
}
