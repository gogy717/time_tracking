export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg,#fbf6ec 0%,#fffaf1 52%,#e6f1ea 100%)",
        backgroundImage: `
          linear-gradient(rgba(110,92,70,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(110,92,70,0.05) 1px, transparent 1px)
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
            "radial-gradient(ellipse at 50% 110%, rgba(84,131,115,0.18) 0%, rgba(233,169,79,0.08) 40%, transparent 65%)",
          pointerEvents: "none",
        }}
      />
      {/* Top vignette */}
      <div
        style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: "200px",
          background: "linear-gradient(to bottom, rgba(255,250,241,0.75), transparent)",
          pointerEvents: "none",
        }}
      />
      <div style={{ width: "100%", maxWidth: "28rem", position: "relative", zIndex: 1, padding: "1rem" }}>
        {children}
      </div>
    </div>
  );
}
