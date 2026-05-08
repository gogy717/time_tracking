export default function Loading() {
  return (
    <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
      <div style={{ height: 14, width: 80, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginBottom: "1.25rem" }} />

      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
          <div style={{ height: 20, width: 140, background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.05)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 2, padding: "1rem" }}>
          <div style={{ height: 10, width: 60, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginBottom: "0.5rem" }} />
          <div style={{ height: 40, width: 100, background: "rgba(255,255,255,0.06)", borderRadius: 2 }} />
        </div>
        <div style={{ background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 2, padding: "1rem" }}>
          <div style={{ height: 10, width: 60, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginBottom: "0.5rem" }} />
          <div style={{ height: 40, width: 80, background: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 2, padding: "1.25rem", marginBottom: "1rem" }}>
        <div style={{ height: 10, width: 80, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginBottom: "1rem" }} />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 2, padding: "0.875rem 1rem", marginBottom: "0.625rem" }}>
            <div style={{ height: 14, width: 120, background: "rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: "0.5rem" }} />
            <div style={{ height: 4, background: "rgba(255,255,255,0.04)", borderRadius: 2 }} />
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.9} }
        * { animation: pulse 1.6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
