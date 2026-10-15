"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useBooth } from "@/components/BoothProvider";
import { flowRedirect } from "@/lib/booth-state";
export function BoothGuard({ children }: { children: React.ReactNode }) {
  const { state, ready, storageWarning } = useBooth();
  const path = usePathname(); const router = useRouter();
  const target = ready ? flowRedirect(path, state) : null;
  useEffect(() => { if (target) router.replace(target); }, [router, target]);
  if (!ready || target) return <main className="min-h-screen bg-[#89150f] p-8 text-white" role="status">Preparing your booth…</main>;
  return <>{storageWarning && <p role="status" className="bg-black p-3 text-center text-sm text-white print:hidden">Your photos are safe in this tab while you continue. Refresh recovery is unavailable in this browser session.</p>}{children}</>;
}
