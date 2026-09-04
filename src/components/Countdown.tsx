type CountdownProps = { value: number | null };

export function Countdown({ value }: CountdownProps) {
  if (value === null) return null;

  return (
    <div className="absolute inset-0 z-10 grid place-items-center bg-[#2f2926]/25" aria-live="assertive">
      <span key={value} className="display pop-in grid size-28 place-items-center rounded-full border-2 border-[#2f2926] bg-[#fffdf9] text-7xl font-semibold text-[#c94c4c] shadow-[5px_6px_0_#2f2926]">
        {value}
      </span>
    </div>
  );
}
