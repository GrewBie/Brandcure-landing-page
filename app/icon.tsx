import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

/** Square BC mark — Google Search favicon (48×48 multiple). */
export default function Icon() {
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
          borderRadius: 10,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <span style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
          <span
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: "#FAFAF8",
              letterSpacing: "0.02em",
            }}
          >
            B
          </span>
          <span
            style={{
              fontSize: 30,
              fontStyle: "italic",
              fontWeight: 500,
              color: "#C4A26A",
              fontFamily: "Georgia, serif",
              marginLeft: -2,
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
