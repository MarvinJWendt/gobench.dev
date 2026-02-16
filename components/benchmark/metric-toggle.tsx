"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useMetric } from "./metric-context";
import { METRICS, type MetricType } from "@/lib/benchmark-utils";

const METRIC_ORDER: MetricType[] = ["ns_per_op", "bytes_per_op", "allocs_per_op"];

export function MetricToggle() {
  const { metric, setMetric } = useMetric();

  return (
    <ToggleGroup
      type="single"
      value={metric}
      onValueChange={(v) => {
        if (v) setMetric(v as MetricType);
      }}
      variant="outline"
      size="sm"
    >
      {METRIC_ORDER.map((key) => (
        <ToggleGroupItem key={key} value={key}>
          {METRICS[key].label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
