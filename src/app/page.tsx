import Image from "next/image";
import Link from "next/link";
import { Parisienne } from "next/font/google";

const parisienne = Parisienne({ weight: "400", subsets: ["latin"], display: "swap" });

export default function Home() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden">
      <Image
        src="/image/home/vintage-photobooth.webp"
        alt="Vintage poto-poto photobooth with a central curtain"
        fill
        priority
        sizes="(max-aspect-ratio: 16/9) 178vh, 100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <Link
          href="/frames"
          aria-label="Start photobooth — choose your frame"
          className={`${parisienne.className} inline-block px-4 py-3 text-4xl leading-normal text-[#711b2b] [text-shadow:0_1px_2px_rgba(255,245,230,0.45)] transition-transform duration-200 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#711b2b] focus-visible:shadow-none motion-reduce:transition-none sm:text-5xl lg:text-6xl xl:text-7xl`}
        >
          Start
        </Link>
      </div>
    </main>
  );
}
