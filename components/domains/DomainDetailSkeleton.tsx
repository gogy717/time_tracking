export default function DomainDetailSkeleton() {
  return (
    <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
      <div style={{ display: "inline-flex", width: 72, height: 16, background: "rgba(255,255,255,0.04)", borderRadius: 2, marginBottom: "1.25rem" }} />
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(0,229,255,0.35)", boxShadow: "0 0 8px rgba(0,229,255,0.4)", flexShrink: 0 }} />
          <div style={{ height: 22, width: 180, background: "rgba(255,255,255,0.05)", borderRadius: 2 }} />
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(0,229,255,0.25),transparent 60%)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        {[0, 1].map((item) => (
          <div key={item} style={{ height: 110, background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 2 }} />
        ))}
      </div>
      <div style={{ height: 250, background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: "1rem" }} />
      <div style={{ height: 150, background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 2, marginBottom: "1rem" }} />
      <div style={{ display: "grid", gap: "0.25rem" }}>
        {[0, 1, 2, 3].map((item) => (
          <div key={item} style={{ height: 42, background: "#0c0c1e", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 2 }} />
        ))}
      </div>
    </div>
  );
}
