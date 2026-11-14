interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}

// Dimensions and off-track colour from design/Main.dc.html (Toggle switch section).
// The off track #8F7B6C is not a theme token, so it is set as an arbitrary value.
const baseClasses =
  "w-[52px] h-[32px] p-[3px] box-border rounded-pill flex items-center border-0";

const checkedClasses = "bg-mocha justify-end";
const uncheckedClasses = "bg-[#8F7B6C] justify-start";

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`${baseClasses} ${checked ? checkedClasses : uncheckedClasses}`}
    >
      <span className="block w-[26px] h-[26px] rounded-pill bg-foam" />
    </button>
  );
}
