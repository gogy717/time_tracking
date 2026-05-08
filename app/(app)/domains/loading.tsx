export default function Loading() {
  return (
    <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ height: 20, width: 120, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: "0.5rem" }} />
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
      </div>

      <div style={{ height: 44, background: "rgba(255,255,255,0.03)", border: "1px dashed rgba(255,255,255,0.07)", borderRadius: 2, marginBottom: "0.75rem" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderLeft: "3px solid rgba(255,255,255,0.08)", borderRadius: 2, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
            <div style={{ height: 16, flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
            <div style={{ height: 14, width: 60, background: "rgba(255,255,255,0.04)", borderRadius: 2 }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }
        div { animation: pulse 1.5s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
