interface ProgressBarProps {
  value: number;
  max: number;
  label: string;
}

export function ProgressBar({ value, max, label }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const now = max > 0 ? Math.min(Math.max(value, 0), max) : 0;

  return (
    <div
      role="progressbar"
      aria-valuenow={now}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className="h-2 rounded-pill bg-crema"
    >
      <div className="h-2 rounded-pill bg-mocha" style={{ width: `${percent}%` }} />
    </div>
  );
}
