"use client";

import { Cpu } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useCpuSelection } from "./cpu-selection-context";

export function CpuSelectionToggle() {
  const { cpuCounts, selectedCpus, setSelection } = useCpuSelection();

  // Nothing to toggle if there's only one CPU count
  if (cpuCounts.length <= 1) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Cpu className="h-3.5 w-3.5" />
        Compare at
      </span>
      <ToggleGroup
        type="multiple"
        value={selectedCpus.map(String)}
        onValueChange={(values) => {
          if (values.length === 0) return;
          setSelection(values.map(Number));
        }}
        variant="outline"
        size="sm"
      >
        {cpuCounts.map((c) => (
          <ToggleGroupItem key={c} value={c.toString()}>
            {c}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        CPUs
      </span>
    </div>
  );
}
