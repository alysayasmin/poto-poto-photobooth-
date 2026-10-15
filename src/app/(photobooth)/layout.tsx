import { BoothProvider } from "@/components/BoothProvider";
import { BoothGuard } from "@/components/BoothGuard";
export default function PhotoboothLayout({ children }: { children: React.ReactNode }) {
  return <BoothProvider><BoothGuard>{children}</BoothGuard></BoothProvider>;
}
