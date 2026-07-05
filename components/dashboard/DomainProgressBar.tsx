export default function DomainProgressBar({
  label,
  progress,
  color,
  current,
  target,
}: {
  label: string;
  progress: number;
  color: string;
  current: number;
  target: number;
}) {
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"0.375rem" }}>
        <span style={{ fontSize:"0.68rem",color:"#8f806f",letterSpacing: 0 }}>
          {label}
        </span>
        <span style={{ fontSize:"0.68rem",color:color,fontWeight:700 }}>
          {progress.toFixed(1)}%
        </span>
      </div>
      <div style={{ height:"6px",background:"rgba(110,92,70,0.10)",borderRadius:"999px",overflow:"hidden" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: color,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <p style={{ fontSize:"0.64rem",color:"#a29382",marginTop:"0.25rem" }}>
        {current.toFixed(1)}h / {target}h
      </p>
    </div>
  );
}
