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
        <span style={{ fontSize:"0.65rem",color:"rgba(74,85,128,0.8)",letterSpacing:"0.08em",textTransform:"uppercase" }}>
          {label}
        </span>
        <span style={{ fontSize:"0.65rem",color:color,textShadow:`0 0 6px ${color}80` }}>
          {progress.toFixed(1)}%
        </span>
      </div>
      <div style={{ height:"2px",background:"rgba(255,255,255,0.05)",borderRadius:"1px",overflow:"hidden" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: color,
            boxShadow: `0 0 8px ${color}`,
            transition: "width 0.6s ease",
          }}
        />
      </div>
      <p style={{ fontSize:"0.6rem",color:"rgba(74,85,128,0.55)",marginTop:"0.25rem" }}>
        {current.toFixed(1)}h / {target}h
      </p>
    </div>
  );
}
