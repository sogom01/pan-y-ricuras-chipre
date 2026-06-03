import { ImageResponse } from "next/og";

// Favicon 32×32 — generado en build time por Next.js (no necesita archivo .ico)
export const size        = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #c99e4c, #6b4a0a)",
          borderRadius: 7,
          fontSize: 20,
        }}
      >
        🥐
      </div>
    ),
    { ...size }
  );
}
