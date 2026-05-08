export default function Loading() {
  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span style={{ color: "rgba(0,229,255,0.3)", fontFamily: "monospace" }}>◈</span>
          <div style={{ height: 20, width: 80, background: "rgba(255,255,255,0.05)", borderRadius: 2, animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(0,229,255,0.15),transparent 60%)" }} />
      </div>

      {/* Weekly goal card skeleton */}
      <div style={{ background: "#0c0c1e", border: "1px solid rgba(0,229,255,0.08)", borderRadius: 2, padding: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", marginBottom: "1.5rem" }}>
        <div style={{ width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ height: 48, width: 100, background: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
          <div style={{ height: 16, width: 160, background: "rgba(255,255,255,0.04)", borderRadius: 2 }} />
          <div style={{ height: 12, width: 220, background: "rgba(255,255,255,0.03)", borderRadius: 2 }} />
        </div>
      </div>

      {/* Domain cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 2, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
              <div style={{ height: 16, width: 100, background: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.04)", borderRadius: 4 }} />
            <div style={{ height: 8, width: "60%", background: "rgba(255,255,255,0.03)", borderRadius: 4 }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
