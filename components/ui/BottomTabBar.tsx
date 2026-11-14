import type { ReactNode } from "react";
import Link from "next/link";

interface Tab {
  key: string;
  label: string;
  icon: ReactNode;
  href: string;
}

interface BottomTabBarProps {
  tabs: Tab[];
  activeKey: string;
}

export function BottomTabBar({ tabs, activeKey }: BottomTabBarProps) {
  return (
    <nav className="grid grid-cols-4 gap-0 bg-foam border border-crema rounded-card p-2 shadow-sm">
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Link
            key={tab.key}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={`flex flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? "text-mocha font-semibold" : "text-muted font-medium"
            }`}
          >
            <span className="h-[22px] w-[22px]">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
