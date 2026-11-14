import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "text" | "danger";

interface ButtonProps {
  variant?: ButtonVariant;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

const baseClasses = "h-[52px] rounded-pill font-sans font-semibold";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-mocha text-foam shadow-[0_6px_16px_rgba(94,59,40,0.28)]",
  secondary: "bg-cappuccino text-ink-hover",
  text: "bg-transparent text-mocha",
  danger: "border border-cherry bg-foam text-cherry",
};

export function Button({
  variant = "primary",
  type = "button",
  disabled,
  onClick,
  children,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} px-6`}
    >
      {children}
    </button>
  );
}

interface IconButtonProps {
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

export function IconButton({ label, icon, onClick }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="w-11 h-11 rounded-pill border border-crema bg-foam text-ink flex items-center justify-center"
    >
      {icon}
    </button>
  );
}
