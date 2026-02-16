"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { MetricType } from "@/lib/benchmark-utils";

interface MetricContextValue {
  metric: MetricType;
  setMetric: (m: MetricType) => void;
}

const MetricContext = createContext<MetricContextValue | null>(null);

export function MetricProvider({ children }: { children: ReactNode }) {
  const [metric, setMetric] = useState<MetricType>("ns_per_op");

  return (
    <MetricContext.Provider value={{ metric, setMetric }}>
      {children}
    </MetricContext.Provider>
  );
}

/** Returns the metric context. Throws if used outside a MetricProvider. */
export function useMetric(): MetricContextValue {
  const ctx = useContext(MetricContext);
  if (!ctx) throw new Error("useMetric must be used within a MetricProvider");
  return ctx;
}
