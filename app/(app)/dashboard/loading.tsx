export default function Loading() {
  return (
    <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
          <span style={{ color: "#548373", fontFamily: "monospace" }}>◈</span>
          <div style={{ height: 24, width: 80, background: "rgba(110,92,70,0.10)", borderRadius: 999, animation: "pulse 1.5s ease-in-out infinite" }} />
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(84,131,115,0.22),transparent 70%)" }} />
      </div>

      {/* Weekly goal card skeleton */}
      <div style={{ background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderRadius: 22, padding: "1.5rem", display: "flex", alignItems: "center", gap: "2rem", marginBottom: "1.5rem" }}>
        <div style={{ width: 120, height: 120, borderRadius: "50%", background: "rgba(110,92,70,0.08)", flexShrink: 0 }} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ height: 48, width: 100, background: "rgba(110,92,70,0.10)", borderRadius: 999 }} />
          <div style={{ height: 16, width: 160, background: "rgba(110,92,70,0.08)", borderRadius: 999 }} />
          <div style={{ height: 12, width: 220, background: "rgba(110,92,70,0.06)", borderRadius: 999 }} />
        </div>
      </div>

      {/* Domain cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "1rem" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderRadius: 18, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(84,131,115,0.18)" }} />
              <div style={{ height: 16, width: 100, background: "rgba(110,92,70,0.10)", borderRadius: 999 }} />
            </div>
            <div style={{ height: 8, background: "rgba(110,92,70,0.08)", borderRadius: 999 }} />
            <div style={{ height: 8, width: "60%", background: "rgba(110,92,70,0.06)", borderRadius: 999 }} />
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
