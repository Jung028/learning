interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = Math.min(100, (value / max) * 100);

  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-2 rounded-pill bg-crema"
    >
      <div className="h-2 rounded-pill bg-mocha" style={{ width: `${percent}%` }} />
    </div>
  );
}
