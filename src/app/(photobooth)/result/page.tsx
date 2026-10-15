"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBooth } from "@/components/BoothProvider";
import { PhotoStrip, type StripOutput } from "@/components/PhotoStrip";
export default function ResultPage() {
  const { state, retake } = useBooth(); const router = useRouter();
  const [output, setOutput] = useState<StripOutput | null>(null);
  const ready = output?.photos === state.capturedPhotos && output?.filter === state.selectedFilter && output?.frameUrl === state.selectedFrame?.imageUrl;
  return <main className="flow-page result-page"><div className="mx-auto max-w-5xl"><header className="print:hidden"><Link href="/" className="text-2xl font-bold">poto-poto</Link><p className="mt-5 text-xs tracking-widest">04 / 04</p><h1 className="my-5 text-3xl font-bold">PHOTOS READY.</h1></header><section className="machine-panel result-panel p-5 sm:p-8"><div className="flex justify-center"><PhotoStrip photos={state.capturedPhotos} frame={state.selectedFrame} filter={state.selectedFilter} capturedAt={state.capturedAt} complete onRendered={setOutput} /></div><div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">{ready && output ? <a href={output.url} download="poto-poto-strip.png" id="photo-download" className="flow-button">DOWNLOAD</a> : <button disabled className="flow-button">Preparing PNG…</button>}<button disabled={!ready} onClick={() => window.print()} className="flow-button">PRINT</button><button onClick={() => { retake(); router.replace("/booth"); }} className="flow-button">RETAKE</button></div><Link href="/filter" className="mt-5 block text-center text-sm underline print:hidden">Change filter</Link></section></div></main>;
}
