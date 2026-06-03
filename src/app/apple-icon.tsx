import { ImageResponse } from "next/og";

// Apple Touch Icon 180×180 — aparece cuando el usuario guarda la web en su Home Screen de iPhone
export const size        = { width: 180, height: 180 };
export const contentType = "image/png";

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
          background: "linear-gradient(135deg, #c99e4c, #6b4a0a)",
          borderRadius: 38,
          fontSize: 110,
        }}
      >
        🥐
      </div>
    ),
    { ...size }
  );
}
