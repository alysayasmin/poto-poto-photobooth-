type CaptureButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  remaining: number;
};

export function CaptureButton({ onClick, disabled, remaining }: CaptureButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group inline-flex min-w-48 items-center justify-center gap-3 rounded-full border border-[#2f2926] bg-[#c94c4c] px-7 py-4 font-bold text-white shadow-[4px_5px_0_#2f2926] transition hover:-translate-y-1 hover:bg-[#a83b3b] hover:shadow-[5px_7px_0_#2f2926] active:translate-y-0 active:shadow-[2px_3px_0_#2f2926] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:bg-[#c94c4c] disabled:hover:shadow-[4px_5px_0_#2f2926]"
    >
      <span className="grid size-7 place-items-center rounded-full bg-white text-[#c94c4c] transition group-hover:rotate-6" aria-hidden>●</span>
      Capture {remaining > 0 && <span className="font-normal opacity-75">({remaining} left)</span>}
    </button>
  );
}
