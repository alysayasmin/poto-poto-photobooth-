"use client";
import Link from "next/link";
import { useState } from "react";
import { useBooth } from "@/components/BoothProvider";
import { PhotoStrip, type StripOutput } from "@/components/PhotoStrip";
import { PHOTO_FILTERS, type PhotoFilter } from "@/lib/photo-filters";
export default function FilterPage() {
  const { state, chooseFilter } = useBooth();
  const [output, setOutput] = useState<StripOutput | null>(null);
  const ready = output?.photos === state.capturedPhotos && output?.filter === state.selectedFilter && output?.frameUrl === state.selectedFrame?.imageUrl;
  return <main className="flow-page"><div className="mx-auto max-w-5xl"><Link href="/" className="text-2xl font-bold">poto-poto</Link><section className="machine-panel mt-6 p-5 sm:p-8"><p className="text-xs tracking-widest">03 / 04</p><h1 className="my-5 text-3xl font-bold">CHOOSE A FILTER</h1><div className="grid items-start gap-8 md:grid-cols-2"><div className="flex justify-center"><PhotoStrip photos={state.capturedPhotos} frame={state.selectedFrame} filter={state.selectedFilter} capturedAt={state.capturedAt} complete onRendered={setOutput} /></div><div><div className="flex flex-wrap gap-3" role="group" aria-label="Photo filter">{(Object.keys(PHOTO_FILTERS) as PhotoFilter[]).map(key => <button key={key} onClick={() => chooseFilter(key)} aria-pressed={state.selectedFilter === key} className={`rounded border-2 px-4 py-3 ${state.selectedFilter === key ? "border-white bg-white text-black" : "border-white/40 hover:bg-white/10"}`}>{PHOTO_FILTERS[key].label}</button>)}</div><p className="my-6 text-sm text-white/75">Filters change your photos only. Your frame stays in its original colors.</p>{ready ? <Link href="/result" className="flow-button inline-block">CONTINUE</Link> : <button disabled className="flow-button">Preparing preview…</button>}<Link href="/frames" className="mt-6 block text-sm underline">Choose another frame and start again</Link></div></div></section></div></main>;
}
