type CountdownProps = { value: number | "FLASH" | null };

export function Countdown({ value }: CountdownProps) {
  if (value === null) return null;

  return (
    <div className={`absolute inset-0 z-10 grid place-items-center ${value === "FLASH" ? "flash bg-white" : "bg-black/60"}`} aria-live="assertive">
      {value !== "FLASH" && <span key={value} className="pop-in text-[clamp(7rem,20vw,13rem)] font-bold leading-none tracking-[-.08em] text-white drop-shadow-[0_3px_0_#000]">{value}</span>}
    </div>
  );
}
