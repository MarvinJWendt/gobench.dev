"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export type ScaleType = "linear" | "log";

interface ScaleToggleProps {
  value: ScaleType;
  onChange: (value: ScaleType) => void;
}

export function ScaleToggle({ value, onChange }: ScaleToggleProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">Scale:</span>
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(v) => {
          if (v) onChange(v as ScaleType);
        }}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="linear">Linear</ToggleGroupItem>
        <ToggleGroupItem value="log">Log</ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
