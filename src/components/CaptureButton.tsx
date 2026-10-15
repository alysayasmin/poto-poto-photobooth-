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
      className="machine-button inline-flex min-w-56 items-center justify-center gap-3 border border-black bg-[#89150f] px-7 py-4 text-xs font-bold uppercase tracking-[.18em] text-white transition hover:bg-[#b72018] disabled:cursor-not-allowed disabled:opacity-45"
    >
      Take Photo {remaining > 0 && <span className="font-normal opacity-65">· {remaining} left</span>}
    </button>
  );
}
