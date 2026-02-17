import { ImageResponse } from "next/og";

export const alt = "gobench.dev — Go Benchmark Comparisons";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Load Inter Black (900) and ExtraBold (800) from Google Fonts
const interBlack = fetch(
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuBWYMZhrib2Au-0.ttf",
).then((res) => res.arrayBuffer());

const interExtraBold = fetch(
  "https://fonts.gstatic.com/s/inter/v20/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuDyYMZhrib2Au-0.ttf",
).then((res) => res.arrayBuffer());

export default async function Image() {
  const [blackFontData, extraBoldFontData] = await Promise.all([
    interBlack,
    interExtraBold,
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          background: "#09090b",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow — top center */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            top: -200,
            left: "50%",
            transform: "translateX(-50%)",
            width: 800,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.10) 0%, rgba(56,189,248,0.05) 40%, transparent 70%)",
          }}
        />

        {/* Content wrapper */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
          }}
        >
          {/* Title */}
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontSize: 96,
              fontWeight: 900,
              letterSpacing: "-0.05em",
              backgroundImage:
                "linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.3,
              padding: "0 20px",
            }}
          >
            gobench.dev
          </div>

          {/* Subtitle */}
          <div
            style={{
              display: "flex",
              fontFamily: "Inter",
              fontSize: 32,
              fontWeight: 800,
              color: "#d4d4d8",
              letterSpacing: "-0.02em",
              marginTop: 12,
            }}
          >
            Write Faster Go Code
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
    {
      ...size,
      fonts: [
        { name: "Inter", data: blackFontData, style: "normal", weight: 900 },
        {
          name: "Inter",
          data: extraBoldFontData,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
