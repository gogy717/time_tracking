export default function Loading() {
  return (
    <div style={{ maxWidth: "38rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ height: 24, width: 120, background: "rgba(110,92,70,0.10)", borderRadius: 999, marginBottom: "0.5rem" }} />
        <div style={{ height: 1, background: "rgba(110,92,70,0.10)" }} />
      </div>

      <div style={{ height: 46, background: "#fffdf8", border: "1px dashed rgba(84,131,115,0.26)", borderRadius: 16, marginBottom: "0.75rem" }} />

      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderLeft: "4px solid rgba(84,131,115,0.18)", borderRadius: 18, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 10px 30px rgba(115,94,64,0.07)" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(84,131,115,0.18)" }} />
            <div style={{ height: 16, flex: 1, background: "rgba(110,92,70,0.08)", borderRadius: 999 }} />
            <div style={{ height: 14, width: 60, background: "rgba(110,92,70,0.06)", borderRadius: 999 }} />
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
