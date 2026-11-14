interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
}

const baseClasses = "h-10 px-4 rounded-pill font-sans";

const selectedClasses = "bg-cappuccino border-2 border-mocha font-semibold text-ink-hover";
const unselectedClasses = "bg-foam border border-crema font-medium";

export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={!!selected}
      onClick={onClick}
      className={`${baseClasses} ${selected ? selectedClasses : unselectedClasses}`}
    >
      {label}
    </button>
  );
}
