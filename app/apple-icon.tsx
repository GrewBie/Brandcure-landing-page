import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Apple touch + high-res brand mark for schema / social. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#2A2C30",
          borderRadius: 40,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span
            style={{
              fontSize: 72,
              fontWeight: 600,
              color: "#FAFAF8",
              letterSpacing: "0.02em",
            }}
          >
            B
          </span>
          <span
            style={{
              fontSize: 88,
              fontStyle: "italic",
              fontWeight: 500,
              color: "#C4A26A",
              fontFamily: "Georgia, serif",
              marginLeft: -6,
            }}
          >
            C
          </span>
        </span>
      </div>
    ),
    { ...size },
  );
}
