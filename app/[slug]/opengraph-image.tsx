import { ImageResponse } from "next/og";
import { getBenchmarkGroup, getBenchmarkMeta } from "@/lib/benchmarks";

export const alt = "Go Benchmark — gobench.dev";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const group = getBenchmarkGroup(slug);
  const meta = getBenchmarkMeta(slug);
  const implementationCount = group.Benchmarks.length;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(145deg, #09090b 0%, #18181b 50%, #09090b 100%)",
          padding: "56px 64px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative gradient blob — top right */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -150,
            right: -80,
            width: 450,
            height: 450,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Top bar: branding + badge */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              backgroundImage:
                "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            gobench.dev
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 16,
              color: "#a1a1aa",
              background: "rgba(39,39,42,0.8)",
              padding: "8px 20px",
              borderRadius: 9999,
              border: "1px solid rgba(63,63,70,0.5)",
            }}
          >
            Go Benchmark
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 60,
              fontWeight: 800,
              color: "#fafafa",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
            }}
          >
            {group.Name}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#a1a1aa",
              lineHeight: 1.5,
              maxWidth: 900,
            }}
          >
            {group.Headline}
          </div>
        </div>

        {/* Bottom bar: tags + implementation count */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/* Tags */}
          <div style={{ display: "flex", gap: 10 }}>
            {meta.tags.slice(0, 5).map((tag) => (
              <div
                key={tag}
                style={{
                  display: "flex",
                  fontSize: 15,
                  color: "#a1a1aa",
                  background: "rgba(39,39,42,0.8)",
                  padding: "6px 16px",
                  borderRadius: 8,
                  border: "1px solid rgba(63,63,70,0.5)",
                }}
              >
                {tag}
              </div>
            ))}
          </div>

          {/* Implementation count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 16,
              color: "#71717a",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#71717a"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            {implementationCount} implementations compared
          </div>
        </div>

        {/* Accent bar at bottom */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 4,
            backgroundImage:
              "linear-gradient(90deg, #38bdf8, #818cf8, #c084fc, #f472b6)",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
