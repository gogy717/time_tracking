"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function AddHistoryForm({ domainId }: { domainId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hours, setHours] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isRefreshing, startRefresh] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) { setError("请输入有效小时数"); return; }
    setLoading(true);
    setError("");
    const res = await fetch("/api/sessions/manual", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domainId, hours: h, date, note }),
    });
    if (res.ok) {
      setOpen(false);
      setHours("");
      setNote("");
      startRefresh(() => router.refresh());
    } else {
      const data = await res.json();
      setError(data.error ?? "提交失败");
    }
    setLoading(false);
  }

  const inputStyle = {
    padding: "0.6rem 0.875rem",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "2px",
    color: "#dde4ff",
    fontSize: "0.875rem",
    width: "100%",
    transition: "border-color 0.2s",
  } as const;

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "0.5rem 1rem",
          background: "transparent",
          border: `1px dashed ${open ? "rgba(224,64,251,0.5)" : "rgba(255,255,255,0.1)"}`,
          borderRadius: "2px",
          color: open ? "#e040fb" : "rgba(74,85,128,0.7)",
          fontSize: "0.8rem",
          letterSpacing: "0.08em",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
      >
        + 添加历史时间
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          style={{
            marginTop: "0.75rem",
            background: "#0c0c1e",
            border: "1px solid rgba(224,64,251,0.2)",
            borderRadius: "2px",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            position: "relative",
          }}
        >
          <span style={{ position:"absolute",top:-1,left:-1,width:12,height:12,borderTop:"2px solid #e040fb",borderLeft:"2px solid #e040fb" }} />
          <span style={{ position:"absolute",bottom:-1,right:-1,width:12,height:12,borderBottom:"2px solid #e040fb",borderRight:"2px solid #e040fb" }} />

          <div>
            <p style={{ fontSize:"0.65rem",color:"rgba(74,85,128,0.7)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.375rem" }}>
              小时数
            </p>
            <input
              type="number"
              step="0.5"
              min="0.5"
              placeholder="例如：150"
              value={hours}
              onChange={e => setHours(e.target.value)}
              required
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "rgba(224,64,251,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <div>
            <p style={{ fontSize:"0.65rem",color:"rgba(74,85,128,0.7)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.375rem" }}>
              日期
            </p>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ ...inputStyle, colorScheme: "dark" }}
              onFocus={e => (e.target.style.borderColor = "rgba(224,64,251,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          <div>
            <p style={{ fontSize:"0.65rem",color:"rgba(74,85,128,0.7)",letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:"0.375rem" }}>
              备注（可选）
            </p>
            <input
              type="text"
              placeholder="例如：入门阶段积累"
              value={note}
              onChange={e => setNote(e.target.value)}
              style={inputStyle}
              onFocus={e => (e.target.style.borderColor = "rgba(224,64,251,0.5)")}
              onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
            />
          </div>

          {error && (
            <p style={{ fontSize:"0.75rem",color:"#ff1744" }}>{error}</p>
          )}
          {isRefreshing && (
            <p style={{ fontSize:"0.7rem",color:"rgba(74,85,128,0.65)" }}>正在同步...</p>
          )}

          <div style={{ display:"flex",gap:"0.5rem" }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{ flex:1,padding:"0.6rem",background:"transparent",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"2px",color:"rgba(74,85,128,0.7)",fontSize:"0.875rem",cursor:"pointer" }}
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex:1,padding:"0.6rem",
                background:"rgba(224,64,251,0.1)",
                border:"1px solid rgba(224,64,251,0.4)",
                borderRadius:"2px",
                color:"#e040fb",
                fontSize:"0.875rem",
                fontWeight:600,
                letterSpacing:"0.08em",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                textShadow:"0 0 8px rgba(224,64,251,0.4)",
              }}
            >
              {loading ? "添加中..." : "确认添加"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
