import type { BenchmarkComparisons } from "@/lib/benchmark-utils";
import { slugify } from "@/lib/benchmark-utils";

interface ComparisonTextProps {
  comparison: BenchmarkComparisons;
}

export function ComparisonText({ comparison }: ComparisonTextProps) {
  if (comparison.vs.length === 0) return null;

  return (
    <div className="space-y-1.5 text-sm">
      {comparison.vs.map((entry) => (
        <p key={entry.other}>
          <span className="font-medium">{comparison.name}</span> is{" "}
          <span
            className={
              entry.faster
                ? "font-semibold text-green-400"
                : "font-semibold text-destructive"
            }
          >
            {entry.ratio}x
          </span>{" "}
          <span
            className={
              entry.faster
                ? "text-green-400"
                : "text-destructive"
            }
          >
            ({entry.percentage}%)
          </span>{" "}
          <span
            className={
              entry.faster
                ? "text-green-400"
                : "text-destructive"
            }
          >
            {entry.faster ? "faster" : "slower"}
          </span>{" "}
          than{" "}
          <a
            href={`#${slugify(entry.other)}`}
            className="font-medium text-primary link-underline"
          >
            {entry.other}
          </a>
        </p>
      ))}
    </div>
  );
}
