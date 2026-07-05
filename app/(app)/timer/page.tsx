import TimerClient from "@/components/timer/TimerClient";

export default async function TimerPage() {
  return (
    <div style={{ maxWidth:"32rem",margin:"0 auto" }}>
      <div style={{ marginBottom:"2rem" }}>
        <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"0.5rem" }}>
          <span style={{ color:"#548373",fontFamily:"monospace" }}>◉</span>
          <h1 style={{ fontSize:"1.35rem",fontWeight:800,color:"#2f2a24",letterSpacing: 0 }}>
            计时器
          </h1>
        </div>
        <div style={{ height:1,background:"linear-gradient(90deg,rgba(84,131,115,0.28),transparent 70%)" }} />
      </div>
      <TimerClient />
    </div>
  );
}
