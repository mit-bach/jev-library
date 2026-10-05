import { ImageResponse } from "next/og"
import { site } from "@/lib/site"

export const alt = "TypeSafe UI — unofficial community component workspace"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

// Public editorial artwork only: no request data, provider calls, or credentials.
export default function Image() {
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", padding: "56px 64px", background: "#080e16", color: "#f5f7fb", borderTop: "8px solid #f0a5ca", fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", fontSize: 22, letterSpacing: 2, color: "#a3e7d7" }}>TYPESAFEAI / UNOFFICIAL COMMUNITY</div>
      <div style={{ display: "flex", marginTop: 48, fontSize: 72, fontWeight: 700 }}>{site.name}</div>
      <div style={{ display: "flex", marginTop: 18, fontSize: 34, color: "#f0a5ca" }}>{site.tagline}</div>
      <div style={{ display: "flex", marginTop: 28, fontSize: 25, color: "#acb8c9" }}>React components · Source previews · Interface patterns</div>
      <div style={{ display: "flex", gap: 20, marginTop: 42 }}>
        {["Preview", "Inspect source", "Reuse deliberately"].map((label) => (
          <div key={label} style={{ display: "flex", flex: 1, padding: "22px 24px", border: "1px solid #34404f", borderRadius: 12, background: "#101924", fontSize: 25 }}>{label}</div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: 24, borderTop: "1px solid #34404f", fontSize: 20 }}>
        <span>TypeSafeAI / typesafe-ui</span>
        <span style={{ color: "#a3e7d7" }}>Community-built. Not official.</span>
      </div>
    </div>,
    size
  )
}
