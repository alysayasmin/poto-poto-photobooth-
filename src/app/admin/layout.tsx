import Link from "next/link";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-zinc-100 px-5 py-8 text-zinc-950"><div className="mx-auto max-w-5xl"><header className="mb-8 border-b border-zinc-300 pb-5"><Link href="/" className="text-2xl font-bold tracking-tight">poto-poto</Link><span className="ml-3 text-sm text-red-800">/ admin</span></header>{children}</div></main>;
}
