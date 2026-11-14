"use client";

import { useState } from "react";
import { Button, IconButton } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Toggle } from "@/components/ui/Toggle";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { BottomTabBar } from "@/components/ui/BottomTabBar";
import { BottomSheet } from "@/components/ui/BottomSheet";

const tabs = [
  { key: "home", label: "Home", icon: <span />, href: "/" },
  { key: "library", label: "Library", icon: <span />, href: "/library" },
  { key: "stash", label: "Stash", icon: <span />, href: "/stash" },
  { key: "you", label: "You", icon: <span />, href: "/settings" },
];

export default function DesignSystemPage() {
  const [selectedChip, setSelectedChip] = useState<"one" | "two">("one");
  const [toggleChecked, setToggleChecked] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <main className="min-h-screen bg-latte p-8 flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl">Buttons</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="primary">New module</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="text">Text</Button>
          <Button variant="danger">Danger</Button>
          <IconButton label="Settings" icon={<span />} />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl">Chips</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Chip
            label="Selected"
            selected={selectedChip === "one"}
            onClick={() => setSelectedChip("one")}
          />
          <Chip
            label="Unselected"
            selected={selectedChip === "two"}
            onClick={() => setSelectedChip("two")}
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl">Toggle</h2>
        <Toggle label="Enable notifications" checked={toggleChecked} onChange={setToggleChecked} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl">Cards</h2>
        <div className="flex flex-wrap items-start gap-4">
          <Card>Default card content.</Card>
          <Card variant="swipe">Swipe card content.</Card>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl">Progress</h2>
        <ProgressBar value={3} max={5} label="Chapter progress" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl">Bottom tab bar</h2>
        <BottomTabBar tabs={tabs} activeKey="home" />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-xl">Bottom sheet</h2>
        <Button variant="primary" onClick={() => setSheetOpen(true)}>
          Ask Claude
        </Button>
        <BottomSheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Ask Claude">
          <p className="p-6">Placeholder: ask Claude anything about this chapter.</p>
        </BottomSheet>
      </section>
    </main>
  );
}
