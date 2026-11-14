import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  variant?: "default" | "swipe";
  className?: string;
}

const baseClasses = "bg-foam border border-crema p-6";

const radiusClasses = {
  default: "rounded-card",
  swipe: "rounded-card-lg",
};

export function Card({ children, variant = "default", className }: CardProps) {
  return (
    <div className={`${baseClasses} ${radiusClasses[variant]} ${className ?? ""}`.trim()}>
      {children}
    </div>
  );
}
