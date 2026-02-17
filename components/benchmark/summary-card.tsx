import { Trophy, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { slugify, type FastSlow } from "@/lib/benchmark-utils";

interface SummaryCardProps {
  single: FastSlow;
  multi: FastSlow;
  maxCpu: number;
}

export function SummaryCard({ single, multi, maxCpu }: SummaryCardProps) {
  const showMulti = maxCpu > 1;

  return (
    <Card>
      <CardContent className="space-y-4">
        <SummarySection label="Single-core" data={single} />

        {showMulti && (
          <>
            <div className="border-t" />
            <SummarySection
              label={`Multi-core · ${maxCpu} CPUs`}
              data={multi}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function SummarySection({
  label,
  data,
}: {
  label: string;
  data: FastSlow;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <div className="flex flex-col gap-4 sm:flex-row sm:gap-8">
        {/* Fastest */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-400/10">
            <Trophy className="h-5 w-5 text-green-400" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fastest</p>
            <a
              href={`#${slugify(data.fastest)}`}
              className="font-semibold text-green-400 link-underline"
            >
              {data.fastest}
            </a>
          </div>
        </div>

        {/* Slowest */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
            <TrendingDown className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Slowest</p>
            <a
              href={`#${slugify(data.slowest)}`}
              className="font-semibold text-destructive link-underline"
            >
              {data.slowest}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
