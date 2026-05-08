export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#07070e",
        backgroundImage: `
          linear-gradient(rgba(0,229,255,0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,229,255,0.035) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Horizon glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 110%, rgba(0,80,200,0.18) 0%, rgba(120,0,200,0.06) 40%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "200px",
          background: "linear-gradient(to bottom, rgba(7,7,14,0.8), transparent)",
          pointerEvents: "none",
        }}
      />
      <div style={{ width: "100%", maxWidth: "28rem", position: "relative", zIndex: 1, padding: "1rem" }}>
        {children}
      </div>
    </div>
  );
}
