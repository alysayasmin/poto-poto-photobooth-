"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FramePicker } from "@/components/FramePicker";
import { useBooth } from "@/components/BoothProvider";
export default function FramesPage() {
  const { state, chooseFrame } = useBooth(); const router = useRouter();
  return <main className="flow-page"><div className="mx-auto max-w-5xl"><Link href="/" className="text-2xl font-bold">poto-poto</Link><section className="machine-panel mt-6 p-5 sm:p-8"><p className="mb-2 text-xs tracking-widest">01 / 04</p><h1 className="mb-8 text-3xl font-bold">CHOOSE YOUR FRAME</h1><FramePicker selected={state.selectedFrame} onSelect={frame => { chooseFrame(frame); router.push("/booth"); }} /></section></div></main>;
}
