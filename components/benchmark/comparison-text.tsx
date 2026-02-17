import { ArrowUp, ArrowDown, Equal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BenchmarkComparisons } from "@/lib/benchmark-utils";
import { slugify } from "@/lib/benchmark-utils";

interface ComparisonTextProps {
  comparison: BenchmarkComparisons;
}

export function ComparisonText({ comparison }: ComparisonTextProps) {
  if (comparison.vs.length === 0) return null;

  return (
    <div className="space-y-0.5">
      {comparison.vs.map((entry) => {
        const isEqual = entry.percentage === 0;

        return (
          <div
            key={entry.other}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-muted/50"
          >
            {/* Direction indicator */}
            <div
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                isEqual
                  ? "bg-muted-foreground/10"
                  : entry.faster
                    ? "bg-green-400/10"
                    : "bg-destructive/10",
              )}
            >
              {isEqual ? (
                <Equal className="h-3 w-3 text-muted-foreground" />
              ) : entry.faster ? (
                <ArrowUp className="h-3 w-3 text-green-400" />
              ) : (
                <ArrowDown className="h-3 w-3 text-destructive" />
              )}
            </div>

            {/* Comparison content */}
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
              {isEqual ? (
                <span className="font-medium text-muted-foreground">
                  Same speed as
                </span>
              ) : (
                <>
                  <span
                    className={cn(
                      "font-bold tabular-nums",
                      entry.faster ? "text-green-400" : "text-destructive",
                    )}
                  >
                    {entry.ratio}×
                  </span>
                  <span
                    className={cn(
                      "font-medium",
                      entry.faster
                        ? "text-green-400/90"
                        : "text-destructive/90",
                    )}
                  >
                    {entry.faster ? "faster" : "slower"}
                  </span>
                  <span className="text-xs text-muted-foreground/50">
                    ({entry.percentage}%)
                  </span>
                  <span className="text-muted-foreground">than</span>
                </>
              )}
              <a
                href={`#${slugify(entry.other)}`}
                className="font-medium text-foreground link-underline"
              >
                {entry.other}
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
