import { ImageResponse } from "next/og";
import { profile } from "@/data/profile";

export const alt = profile.site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#080808",
          color: "#F5F5F5",
          padding: 72,
          fontFamily: "sans-serif",
          backgroundImage: "linear-gradient(rgba(255,255,255,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, letterSpacing: 4, color: "#8A8A8A" }}>
          <div style={{ width: 12, height: 12, borderRadius: 12, background: "#3DF2A6" }} />
          ADITYA.OS
        </div>
        <div style={{ display: "flex", flexDirection: "column", fontSize: 108, fontWeight: 700, lineHeight: 0.92, letterSpacing: -4 }}>
          <span>I BUILD</span>
          <span>INTELLIGENT</span>
          <span style={{ display: "flex" }}>
            SYSTEMS<span style={{ color: "#3DF2A6" }}>.</span>
          </span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#8A8A8A", borderTop: "1px solid #222", paddingTop: 24 }}>
          <span style={{ color: "#F5F5F5" }}>{profile.name}</span>
          <span>AI/ML · Backend · GenAI — {profile.location}</span>
        </div>
      </div>
    ),
    size,
  );
}
