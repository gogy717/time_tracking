export default function Loading() {
  return (
    <div style={{ maxWidth: "32rem", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ height: 24, width: 112, background: "rgba(110,92,70,0.10)", borderRadius: 999, marginBottom: "0.75rem" }} />
        <div style={{ height: 1, background: "linear-gradient(90deg,rgba(84,131,115,0.22),transparent 70%)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {[0, 1, 2].map((item) => (
          <div key={item} style={{ background: "#fffdf8", border: "1px solid rgba(110,92,70,0.12)", borderRadius: 18, padding: "1.5rem", boxShadow: "0 14px 35px rgba(115,94,64,0.08)" }}>
            <div style={{ height: 14, width: 96, background: "rgba(84,131,115,0.12)", borderRadius: 999, marginBottom: "1.2rem" }} />
            <div style={{ height: 16, width: "72%", background: "rgba(110,92,70,0.09)", borderRadius: 999, marginBottom: "0.65rem" }} />
            <div style={{ height: 16, width: "48%", background: "rgba(110,92,70,0.07)", borderRadius: 999 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
