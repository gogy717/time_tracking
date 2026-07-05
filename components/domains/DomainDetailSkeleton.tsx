export default function DomainDetailSkeleton() {
  return (
    <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
      <div style={{ display: "inline-flex", width: 72, height: 16, background: "rgba(110,92,70,0.10)", borderRadius: 999, marginBottom: "1.25rem" }} />
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "rgba(84,131,115,0.28)", flexShrink: 0 }} />
          <div style={{ height: 22, width: 180, background: "rgba(110,92,70,0.10)", borderRadius: 999 }} />
        </div>
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(84,131,115,0.25),transparent 70%)" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
        {[0, 1].map((item) => (
          <div key={item} style={{ height: 110, background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderRadius: 18 }} />
        ))}
      </div>
      <div style={{ height: 250, background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderRadius: 18, marginBottom: "1rem" }} />
      <div style={{ height: 150, background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderRadius: 18, marginBottom: "1rem" }} />
      <div style={{ display: "grid", gap: "0.25rem" }}>
        {[0, 1, 2, 3].map((item) => (
          <div key={item} style={{ height: 42, background: "#fffdf8", border: "1px solid rgba(110,92,70,0.10)", borderRadius: 14 }} />
        ))}
      </div>
    </div>
  );
}
