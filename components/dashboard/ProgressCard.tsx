"use client";

import Link from "next/link";
import { formatDuration } from "@/lib/utils";
import DomainProgressBar from "./DomainProgressBar";

type Domain = {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  totalMinutes: number;
  thisWeekMinutes: number;
  progressTo3000h: number;
  progressTo7000h: number;
};

export default function ProgressCard({ domain }: { domain: Domain }) {
  return (
    <Link href={`/domains/${domain.id}`} style={{ textDecoration:"none" }}>
      <div
        style={{
          background: "#0c0c1e",
          border: "1px solid rgba(255,255,255,0.05)",
          borderTop: `2px solid ${domain.color}`,
          borderRadius: "2px",
          padding: "1.25rem",
          boxShadow: `0 0 30px rgba(0,0,0,0.6), 0 -2px 15px ${domain.color}20`,
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          position: "relative",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 30px rgba(0,0,0,0.7), 0 -2px 20px ${domain.color}30`;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
          (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 30px rgba(0,0,0,0.6), 0 -2px 15px ${domain.color}20`;
        }}
      >
        {/* Header */}
        <div style={{ display:"flex",alignItems:"center",gap:"0.5rem",marginBottom:"1rem" }}>
          <div style={{ width:8,height:8,borderRadius:"50%",background:domain.color,boxShadow:`0 0 8px ${domain.color}`,flexShrink:0 }} />
          <h3 style={{ fontWeight:600,color:"#dde4ff",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontSize:"0.95rem" }}>
            {domain.name}
          </h3>
          {domain.icon && <span style={{ fontSize:"1rem" }}>{domain.icon}</span>}
        </div>

        {/* Total time */}
        <p style={{ fontSize:"1.75rem",fontWeight:700,fontFamily:"var(--font-geist-mono, monospace)",letterSpacing:"0.05em",color:"#dde4ff",marginBottom:"1.25rem" }}>
          {formatDuration(domain.totalMinutes)}
        </p>

        {/* Progress bars */}
        <div style={{ display:"flex",flexDirection:"column",gap:"0.875rem" }}>
          <DomainProgressBar label="入门 3000h" progress={domain.progressTo3000h} color={domain.color} current={domain.totalMinutes/60} target={3000} />
          <DomainProgressBar label="准专家 7000h" progress={domain.progressTo7000h} color={domain.color} current={domain.totalMinutes/60} target={7000} />
        </div>

        {domain.thisWeekMinutes > 0 && (
          <p style={{ marginTop:"0.875rem",fontSize:"0.65rem",color:"rgba(74,85,128,0.7)",letterSpacing:"0.08em" }}>
            本周 +{formatDuration(domain.thisWeekMinutes)}
          </p>
        )}
      </div>
    </Link>
  );
}
